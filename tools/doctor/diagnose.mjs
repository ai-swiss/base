// `base doctor` — the corpus health check: a PURE PROJECTION over data that already exists
// (inventory, link graph, eval runs, field feedback). It introduces no state of its own. The
// friction says what broke; the doctor says what is ABOUT to break. Two severities only, a
// mandatory fix_hint per finding — a doctor that cries wolf gets ignored.
//
// Two doors, one function: the CLI (`base doctor [--json]`) and Studio (`GET /api/doctor`) both
// call `diagnose(root)`, which loads the data then hands it to the pure `diagnoseData`.

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { buildArtifacts, inventoryResources, resolveConfig } from "../base-core.mjs";
import { extractLinks, extractReferences, stripFencedBlocks } from "../core/context-pack.mjs";
import { isGeneratedProjection } from "../core/runtime-artifacts.mjs";
import { readFeedback } from "../core/feedback.mjs";
import { listFiles, walkTree } from "../core/fswalk.mjs";
import { isDocumentationMarkerPath, isMarkerReferencePath, scanMarkers } from "../core/markers.mjs";
import { everyLanguage } from "../core/lang/index.mjs";
import { loadRoutingVectors, verifyRoutingVectors } from "../core/routing-vectors.mjs";

// Runtime conventions: directories BASE itself fills at run time. Referencing them is normal even
// before they exist — never a dead link.
const RUNTIME_DIRS = [".ai/journal", ".ai/trace", ".ai/changes", ".ai/index", ".ai/experiments", ".ai/feedback"];
// Placeholder-looking refs (`devis/[nom].md`, `.ai/journal/YYYY-MM-DD_x.md`) are templates, not links.
const PLACEHOLDER = /YYYY|NNN|\[|\]|<|>/;

/**
 * Resolve a declared ref against the KNOWN FILES (inventory + every file on disk): root-relative,
 * then relative to the source file's directory and each of its ancestors (a process may reference
 * `skills/competences/…` relative to its agent's directory).
 */
function refResolves(ref, fromPath, paths) {
  const clean = ref.replace(/^\.\//, "").replace(/\/$/, "");
  if (PLACEHOLDER.test(clean)) return clean; // a template placeholder is not a link
  for (const dir of RUNTIME_DIRS) {
    if (clean === dir || clean.startsWith(`${dir}/`)) return clean;
  }

  const bases = [""];
  const parts = fromPath.split("/").slice(0, -1);
  for (let i = parts.length; i > 0; i -= 1) bases.push(parts.slice(0, i).join("/"));

  for (const base of bases) {
    const joined = base ? [...base.split("/"), ...clean.split("/")] : clean.split("/");
    const stack = [];
    for (const part of joined) {
      if (part === "..") stack.pop();
      else if (part !== "." && part !== "") stack.push(part);
    }
    const candidate = stack.join("/");
    if (paths.has(candidate)) return candidate;
    for (const p of paths) {
      if (p.startsWith(`${candidate}/`)) return p; // a directory with content resolves
    }
  }
  return null;
}

const RECURRING_ABSTENTION_THRESHOLD = 3;
const ACTIONABLE_ABSTENTIONS = new Set(["ambiguous", "needs_clarification"]);
const STALE_MARKER_DAYS = 30;
const MAINTENANCE_TOKENS = /\b(?:TODO|FIXME|PLACEHOLDER)\b/;

// The four files an AI tool may read to recognise this folder. A root carries the one its owner's
// tool reads (FR-INIT-002), so every check here asks for ONE of them, never for a named one.
const ENTRY_POINTS = ["CLAUDE.md", "AGENTS.md", ".cursor/rules/assistant.mdc", "BASE_BOOTSTRAP.md"];
const TOOL_PATHS = { "claude-code": "CLAUDE.md", "agents-md": "AGENTS.md", cursor: ".cursor/rules/assistant.mdc", autre: "BASE_BOOTSTRAP.md" };
// The attribution the method content asks for (LICENSING.md, CC BY 4.0), recognised by its URL so a
// reworded line still counts.
const ATTRIBUTION_MARK = "a-i.swiss";
const SHARED_SCOPES = new Set(["team", "org", "public"]);

/** The sources a document declares it was written from (`derived_from`), as trimmed strings. */
function derivedFrom(resource) {
  const declared = resource?.derived_from ?? resource?.metadata?.derived_from;
  return Array.isArray(declared) ? declared.filter((ref) => typeof ref === "string" && ref.trim()).map((ref) => ref.trim()) : [];
}
// Template residue: a card that still carries what the scaffold or a template left in it. A
// `{placeholder}` is meant to be replaced, and the starter sentence is meant to be rewritten; either
// one still present means the card routes on words nobody chose. Fenced blocks are stripped first
// (an example that SHOWS a placeholder is teaching, not residue), and `template` resources are
// exempt by definition.
const TEMPLATE_PLACEHOLDER = /\{[A-Za-z0-9][A-Za-z0-9 _-]*\}/;
// The scaffold's own starter sentence, in EVERY language this build can write it. A French literal
// here would go blind on an English or German root the moment the scaffold was translated: the check
// would keep passing while the card it exists to catch sat untouched. Asking the tables is the only
// reading that cannot drift from what the scaffold emits.
const SCAFFOLD_SENTENCES = everyLanguage("scaffoldAgentDescription")
  .map((render) => (typeof render === "function" ? render("{}") : String(render)))
  .map((sentence) => sentence.slice(sentence.indexOf("{}") + 2).trim())
  .filter(Boolean);
const RESIDUE_KINDS = new Set(["agent", "process", "competence"]);

/**
 * The pure rule set — everything injected, fully testable without disk.
 * @param {{ inventory: any[], files?: string[], mtimes?: Record<string, number>,
 * runs?: { process: string | null, outcome: string | null, at: string }[],
 * feedback?: { frictions: { path: string, process: string, status: string }[], abstentions?: { query: string, verdict: string, count: number, lastAt: string }[] }, generated?: string[],
 * routingVectors?: { byPath: Record<string, number[]> | null, stale: string[], legacy: boolean, embedder: string | null } | null,
 * staleProjections?: { path: string, target: string }[], declaredTools?: string[], now?: string }} data
 * `files`: every file on disk (links may target non-resources like JSON templates).
 * → [{ severity: "error" | "warn", type, path, message, fix_hint }]
 */
export function diagnoseData({ inventory, files = [], mtimes = {}, runs = [], feedback = { frictions: [], abstentions: [] }, generated = [], routingVectors = null, staleProjections = [], declaredTools = [], now = new Date().toISOString() }) {
  const findings = [];
  const today = now.slice(0, 10);
  const paths = new Set([...inventory.map((r) => r.path), ...files]);

  // One pass builds the reference graph and flags dead links. The OUT edges are broad (Markdown
  // links + inline `code` paths): a BASE agent names a skill it uses as an inline path, so that
  // counts as reaching it. DEAD-LINK detection is narrow (Markdown links only): prose code-spans
  // illustrate paths (`.cursor/rules`, a tutorial's example agent) that are not links and must not
  // be reported as broken — the same contract docs validation holds.
  // A resource also reaches what it DECLARES in its frontmatter: `may_use` (competences a process
  // may open) and `requires[].ref` (what it needs). These declarations are as deliberate as a link
  // in the body, so the graph follows them: a competence a process declares is reachable, and no
  // longer has to be repeated as an inline path in the prose just to escape the orphan check. A
  // declaration names an id or a path; ids resolve first, since that is how authors write them.
  const pathById = new Map(inventory.filter((r) => r.id).map((r) => [r.id, r.path]));
  const declaredRefs = (resource) => {
    const refs = [];
    for (const ref of Array.isArray(resource.may_use) ? resource.may_use : []) {
      if (typeof ref === "string" && ref.trim()) refs.push(ref.trim());
    }
    for (const req of Array.isArray(resource.requires) ? resource.requires : []) {
      if (req && typeof req.ref === "string" && req.ref.trim()) refs.push(req.ref.trim());
    }
    // `derived_from` names the sources a document was written FROM. It is a declaration like the
    // others: it must resolve, and it makes the source reachable from the summary.
    for (const ref of derivedFrom(resource)) refs.push(ref);
    return refs;
  };

  const outRefs = new Map();
  for (const resource of inventory) {
    const out = new Set();
    for (const ref of extractReferences(resource.body ?? "")) {
      const resolved = refResolves(ref, resource.path, paths);
      if (resolved) out.add(resolved);
    }
    for (const ref of declaredRefs(resource)) {
      const resolved = pathById.get(ref) ?? refResolves(ref, resource.path, paths);
      if (resolved) out.add(resolved);
      else {
        findings.push({
          severity: "warn",
          type: "unresolved_declaration",
          path: resource.path,
          message: `déclaration sans cible: ${ref}`,
          fix_hint: "Corrigez l'identifiant ou le chemin déclaré (may_use, requires), ou retirez la déclaration si la ressource a disparu.",
        });
      }
    }
    outRefs.set(resource.path, out);
    for (const ref of extractLinks(resource.body ?? "")) {
      if (!refResolves(ref, resource.path, paths)) {
        findings.push({
          severity: "error",
          type: "dead_link",
          path: resource.path,
          message: `lien mort: ${ref}`,
          fix_hint: "Corrigez le chemin, ou supprimez la référence si la ressource a disparu.",
        });
      }
    }
  }

  // Reachability for orphan detection: transitively from the ROUTABLE roots (agents/processes)
  // only. "Referenced by some node" is not enough — a competence that cites its own path, or two
  // that cite each other, would exempt themselves while staying unreachable from any agent. Walk
  // the graph from the roots and keep only what is genuinely reached.
  const referenced = new Set();
  const queue = inventory.filter((r) => r.type === "agent" || r.type === "process").map((r) => r.path);
  for (let i = 0; i < queue.length; i += 1) {
    for (const next of outRefs.get(queue[i]) ?? []) {
      if (!referenced.has(next)) {
        referenced.add(next);
        queue.push(next);
      }
    }
  }

  const generatedSet = new Set(generated);
  for (const resource of inventory) {
    const meta = resource.metadata ?? {};

    // Orphans: context resources (never routable) that nothing references — invisible knowledge.
    const routable = resource.type === "agent" || resource.type === "process";
    // READMEs, the feedback journal and generated harness artifacts are reachable by convention.
    // A docs page FILED UNDER A SECTION directory (docs/<section>/…) is published and navigable on
    // the docs site (buildNavigation in tools/docs/model.mjs), so its reachability is owned by the
    // documentation graph (`docs validate`), not by the resource graph — citing it from an agent is
    // not what those pages are for. A loose, unreferenced top-level docs page (docs/<file>.md) still
    // warns: nothing reaches it and no section publishes it.
    const inDocsSection = /^docs\/[^/]+\/.+/.test(resource.path);
    const structural =
      /(^|\/)(README|CLAUDE|AGENTS|BASE_BOOTSTRAP)\.md$/i.test(resource.path) ||
      resource.path.startsWith(".ai/feedback/") ||
      generatedSet.has(resource.path) ||
      inDocsSection;
    if (!routable && !structural && !referenced.has(resource.path)) {
      // Under an agent (.ai/agents/), a competence or template no agent/process reaches is dead
      // knowledge — an error. Elsewhere (docs, specs), reachability is the documentation graph's
      // concern (`docs validate`), so it stays a warning rather than a false alarm here.
      const inAgentTree = /(^|\/)\.ai\/agents\//.test(resource.path);
      findings.push({
        severity: inAgentTree ? "error" : "warn",
        type: "orphan",
        path: resource.path,
        message: inAgentTree
          ? "ressource d'agent jamais référencée (ni liens, ni routage) — connaissance invisible"
          : "ressource jamais référencée (ni liens, ni routage)",
        fix_hint: "Référencez-la depuis un agent ou un process qui s'en sert, ou archivez-la (status: archived).",
      });
    }

    if (meta.review_by && String(meta.review_by) < today) {
      findings.push({
        severity: "warn",
        type: "review_due",
        path: resource.path,
        message: `relecture échue depuis le ${meta.review_by}`,
        fix_hint: "Relisez la ressource puis repoussez review_by (ou retirez le champ si plus pertinent).",
      });
    }

    if (meta.valid_until && String(meta.valid_until) < today) {
      findings.push({
        severity: "error",
        type: "expired",
        path: resource.path,
        message: `données de référence périmées depuis le ${meta.valid_until}`,
        fix_hint: "Mettez à jour les valeurs et la fenêtre valid_from/valid_until, ou archivez la ressource.",
      });
    }

    // Routable without a routing signal: with neither use_when nor examples, a process routes on
    // whatever its description happens to contain — a signal that drifts silently (the case route
    // fixtures exist to catch). Migrated from `entretien`, which retires into this doctor in the next minor version.
    if (resource.type === "process") {
      const useWhen = resource.use_when ?? meta.use_when;
      const examples = meta.routing?.examples;
      if (!(typeof useWhen === "string" && useWhen.trim()) && !(Array.isArray(examples) && examples.length > 0)) {
        findings.push({
          severity: "warn",
          type: "weak_routing",
          path: resource.path,
          message: "process sans use_when ni exemples de routage: son routage peut dériver sans alerte",
          fix_hint: "Ajoutez use_when (quand l'utiliser, une phrase) ou routing.examples (formulations réelles), puis protégez la route par une fixture route-test.",
        });
      }
    }

    // A routable or executable resource without a description is invisible to discovery and weakly
    // routed; the doctor names the exact file. Migrated from `entretien` (same next-minor retirement).
    if (!resource.description && ["agent", "process", "tool"].includes(resource.type)) {
      findings.push({
        severity: "warn",
        type: "missing_description",
        path: resource.path,
        message: "description absente: la ressource est invisible à la recherche et faiblement routable",
        fix_hint: "Ajoutez une description d'une phrase dans la frontmatter (ce que fait la ressource, pour qui).",
      });
    }

    // A dormant marker: a business file whose open markers have not moved for 30 days no longer
    // triggers any decision — verification theatre. Marker-teaching paths (agent skills, docs,
    // specs, framework code) and documentation examples are exempt. Migrated from `entretien`.
    if (!isMarkerReferencePath(resource.path) && !isDocumentationMarkerPath(resource.path)) {
      const body = resource.content ?? resource.body ?? "";
      const mtime = mtimes[resource.path];
      if (mtime && (scanMarkers(body, resource.path).length > 0 || MAINTENANCE_TOKENS.test(body))) {
        const days = Math.floor((Date.parse(now) - mtime) / (24 * 60 * 60 * 1000));
        if (days >= STALE_MARKER_DAYS) {
          findings.push({
            severity: "warn",
            type: "stale_marker",
            path: resource.path,
            message: `marqueur dormant: fichier à marqueurs ouverts non touché depuis ${days} jours`,
            fix_hint: "Tranchez le marqueur (complétez, validez ou décidez) ou retirez-le s'il ne porte plus de décision.",
          });
        }
      }
    }

    // Stale eval: a process EDITED after its last green run — only on later modification, never on
    // the mere absence of an eval (a doctor that nags about everything gets ignored).
    if (resource.type === "process") {
      const green = runs
        .filter((r) => (r.process === resource.id || r.process === resource.path) && r.outcome === "goal_met")
        .map((r) => r.at)
        .sort()
        .pop();
      const mtime = mtimes[resource.path];
      if (green && mtime && new Date(mtime).toISOString() > green) {
        findings.push({
          severity: "warn",
          type: "stale_eval",
          path: resource.path,
          message: `process modifié après sa dernière évaluation verte (${green.slice(0, 10)})`,
          fix_hint: "Relancez l'évaluation du process (Studio → Évaluations, ou `npm run eval`).",
        });
      }
    }
  }

  // A BASE without ANY tool entry point is invisible expertise: no AI tool recognises the folder.
  // Which file it is depends on the tool its owner uses (`base init --tool`), so the check asks for
  // one of them, never for a particular one: a Cursor-only root is not missing a CLAUDE.md.
  const entryPoint = ENTRY_POINTS.find((rel) => paths.has(rel));
  if (!entryPoint) {
    findings.push({
      severity: "warn",
      type: "missing_tool_artifacts",
      path: ENTRY_POINTS[0],
      message: "aucun point d'entrée pour les outils IA (ni CLAUDE.md, ni AGENTS.md, ni règle Cursor, ni BASE_BOOTSTRAP.md)",
      fix_hint: "Lancez `base init --tool <votre outil>` dans ce dossier: il propose le point d'entrée manquant, sans rien écraser.",
    });
  }

  // The SAME class, second member: a root with an entry file but no launcher gives a raw Node stack
  // trace at the first `base validate` after a copy — exactly what the launcher exists to prevent.
  // The heal exists (`base init` on an existing BASE proposes it, creation-only); name it here.
  if (entryPoint && !paths.has(".ai/base.mjs")) {
    findings.push({
      severity: "warn",
      type: "missing_tool_artifacts",
      path: ".ai/base.mjs",
      message: "pas de lanceur CLI (.ai/base.mjs absent): `node .ai/base.mjs …` échouera dans ce dossier",
      fix_hint: "Lancez `base init` dans ce dossier: il propose le lanceur manquant, sans rien écraser.",
    });
  }

  // Attribution, but only where it is actually owed. The method content BASE ships is CC BY 4.0:
  // sharing it asks for a line naming the source. A private folder shares nothing, so this fires
  // only for a root that DECLARES sharing (a resource with scope team/org/public) and whose README
  // carries no attribution. `base init` writes the line; this names it when a root grew past its
  // first reader without it.
  const sharesSomething = inventory.some((r) => SHARED_SCOPES.has(r.scope));
  const readme = inventory.find((r) => r.path === "README.md");
  if (sharesSomething && readme && !readme.content.includes(ATTRIBUTION_MARK)) {
    findings.push({
      severity: "warn",
      type: "missing_attribution",
      path: "README.md",
      message: "ce dossier partage des ressources (scope team/org/public) et son README ne crédite pas la méthode",
      fix_hint: "Ajoutez au README: «Construit avec BASE, Bâtir des Assistants avec une Structure d'Expertise, par AI Swiss, https://a-i.swiss (contenus de méthode sous licence CC BY 4.0).»",
    });
  }

  for (const resource of inventory) {
    if (!RESIDUE_KINDS.has(resource.type)) continue;
    if (resource.path.includes("/templates/")) continue;
    // Fenced blocks AND inline code are stripped: a process that TELLS its reader to build
    // `{YYYY-MM-DD}_{slug}.html` is teaching a pattern, not carrying residue. What counts is a
    // placeholder left in prose, or in a frontmatter value, where it was meant to be replaced.
    const body = stripFencedBlocks(resource.body ?? resource.content ?? "").replace(/`[^`\n]*`/g, " ");
    const inMetadata = Object.values(resource.metadata ?? {}).find((value) => typeof value === "string" && TEMPLATE_PLACEHOLDER.test(value));
    const placeholder = (typeof inMetadata === "string" ? inMetadata.match(TEMPLATE_PLACEHOLDER) : null) ?? body.match(TEMPLATE_PLACEHOLDER);
    const haystack = `${body}\n${resource.description ?? ""}`;
    const scaffold = SCAFFOLD_SENTENCES.some((sentence) => haystack.includes(sentence));
    if (!placeholder && !scaffold) continue;
    findings.push({
      severity: "warn",
      type: "template_residue",
      path: resource.path,
      message: placeholder
        ? `reste de gabarit non rempli: ${placeholder[0]}`
        : "cette fiche porte encore la phrase de départ du gabarit",
      fix_hint: "Remplacez ce texte par le vôtre: la description et le «Quand l'utiliser» sont ce que lit le routage.",
    });
  }

  // A harness entry point this root does not declare. `tools` in base.config.json is the answer to
  // «quel outil lit ce dossier»; every other entry point is outside that declaration. Named, never
  // removed.
  if (declaredTools.length) {
    const wanted = new Set(declaredTools.map((id) => TOOL_PATHS[id]).filter(Boolean));
    for (const rel of ENTRY_POINTS) {
      if (!paths.has(rel) || wanted.has(rel)) continue;
      findings.push({
        severity: "warn",
        type: "undeclared_harness_file",
        path: rel,
        message: `point d'entrée d'un outil non déclaré (tools: ${declaredTools.join(", ")})`,
        fix_hint: "Ajoutez cet outil à `tools` dans base.config.json si vous l'utilisez, sinon supprimez ce fichier: il n'est plus régénéré.",
      });
    }
  }

  // A summary never replaces its sources. `derived_from` says where to go back to, and this lens
  // says when going back is necessary: a source modified after the document that derives from it.
  // mtime is the same honest approximation the dormant-marker lens uses (any edit resets it), and
  // an unreadable date yields no signal rather than a false one.
  for (const resource of inventory) {
    const sources = derivedFrom(resource);
    if (sources.length === 0) continue;
    const derivedAt = mtimes[resource.path];
    if (!derivedAt) continue;
    for (const ref of sources) {
      const sourcePath = pathById.get(ref) ?? refResolves(ref, resource.path, paths);
      const sourceAt = sourcePath ? mtimes[sourcePath] : null;
      if (!sourceAt || sourceAt <= derivedAt) continue;
      findings.push({
        severity: "warn",
        type: "derived_stale",
        path: resource.path,
        message: `dérive de ${sourcePath}, modifié depuis`,
        fix_hint: "Relisez la source et reprenez ce document, ou retirez `derived_from` s'il ne la résume plus.",
      });
    }
  }

  for (const friction of feedback.frictions) {
    if (friction.status !== "open") continue;
    findings.push({
      severity: "warn",
      type: "open_friction",
      path: friction.path,
      message: `friction ouverte sans réponse (process: ${friction.process})`,
      fix_hint: "Lisez la friction et situez son coût: ce qui se paie à chaque demande se déplace une fois dans la structure (une ligne dans une fiche, une colonne tenue à l'écriture, un lien, une compétence). Amendez le process, puis marquez la friction résolue.",
    });
  }

  // A recurring ambiguous or underspecified request can expose weak routing or a missing process.
  // `out_of_scope` is a successful boundary decision, not evidence that the corpus should grow.
  for (const abstention of feedback.abstentions ?? []) {
    if ((abstention.count ?? 0) < RECURRING_ABSTENTION_THRESHOLD) continue;
    if (!ACTIONABLE_ABSTENTIONS.has(abstention.verdict)) continue;
    findings.push({
      severity: "warn",
      type: "recurring_abstention",
      path: ".ai/feedback/abstentions.jsonl",
      message: `«${abstention.query}» refusée ${abstention.count} fois (${abstention.verdict}) : une demande récurrente que le routeur ne sait pas servir.`,
      fix_hint: "Créez un process pour cette demande récurrente (ou ajustez les signaux de routage), puis protégez-le par une fixture route-test.",
    });
  }

  // A generated projection must not silently age either: a root that ADOPTED one (the committed
  // file carries the provenance banner) and edited its sources since is serving yesterday's index
  // to every AI tool that opens it. Same family as the vector cache: staleness, named where the
  // owner looks, with the one command that heals.
  for (const stale of staleProjections) {
    findings.push({
      severity: "warn",
      type: "stale_generated_projection",
      path: stale.path,
      message: "projection générée en retard sur ses sources (le contenu régénéré diffère du fichier présent)",
      fix_hint: `Régénérez-la: «base build ${stale.target} --write». Si ce fichier est devenu le vôtre, retirez sa bannière de provenance: BASE cesse alors de le régénérer et de le signaler.`,
    });
  }

  // The routing-vector cache must never degrade silently (Voie 2): a stale entry (use_when edited
  // since the precompute) is dropped at route time and REPORTED here, where the owner looks; a
  // legacy cache (pre-v1, no hashes) cannot even say whether it is stale — same nudge, rebuild.
  if (routingVectors) {
    if (routingVectors.legacy) {
      findings.push({
        severity: "warn",
        type: "stale_routing_vectors",
        path: ".ai/routing/embeddings.json",
        message: "cache de vecteurs de routage à l'ancien format (sans empreintes): sa péremption est indétectable",
        fix_hint: "Régénérez le cache: «base build routing-embeddings --write».",
      });
    } else if (routingVectors.stale.length) {
      findings.push({
        severity: "warn",
        type: "stale_routing_vectors",
        path: ".ai/routing/embeddings.json",
        message: `${routingVectors.stale.length} vecteur(s) de routage périmé(s) (use_when modifié depuis le précalcul): ignorés au routage`,
        fix_hint: "Régénérez le cache: «base build routing-embeddings --write».",
      });
    }
  }

  return findings;
}

/** Load the data the projection needs, then diagnose. The only filesystem touch of this module. */
export async function diagnose(root) {
  const inventory = await inventoryResources(root);
  const files = listFiles(await walkTree(root));
  /** @type {Record<string, number>} */
  const mtimes = {};
  // Generated artifacts (the routing indexes, the harness entry points) are reachable by convention
  // and never hand-referenced, so the orphan check must skip them. Detect by PROVENANCE, not by a
  // hardcoded path: a hand-written index.md stays flagged, and a file whose author removed the
  // banner is that author's. One predicate, shared with discovery (core/runtime-artifacts.mjs).
  const generated = inventory.filter((resource) => isGeneratedProjection(resource.body)).map((r) => r.path);
  for (const resource of inventory) {
    try {
      mtimes[resource.path] = (await stat(path.join(root, resource.path))).mtimeMs;
    } catch {
      /* raced deletion: skip */
    }
  }
  const runs = [];
  try {
    const dir = path.join(root, ".ai", "experiments", "runs");
    for (const name of (await readdir(dir)).filter((n) => n.endsWith(".json"))) {
      try {
        const data = JSON.parse(await readFile(path.join(dir, name), "utf8"));
        runs.push({ process: data.process ?? null, outcome: data.verdict?.outcome ?? null, at: data.at ?? "" });
      } catch {
        /* skip corrupt run */
      }
    }
  } catch {
    /* no runs yet */
  }
  // Which tools this root declares (base.config.json `tools`). A malformed config is validate's
  // finding: the doctor degrades to "nothing declared" and keeps serving its other lenses.
  let declaredTools = [];
  try {
    const declared = (await resolveConfig(root)).tools;
    if (Array.isArray(declared)) declaredTools = declared;
  } catch {
    /* unreadable config: no declaration to compare against */
  }
  const feedback = await readFeedback(root, { status: "open" });
  const loadedVectors = await loadRoutingVectors(root);
  const routingVectors = loadedVectors ? verifyRoutingVectors(inventory, loadedVectors) : null;
  // Compare what `base build` would produce today to the files this root ADOPTED: present AND
  // banner-carrying (provenance, same contract as the orphan exemption). Absent = never adopted;
  // no banner = hand-owned; both exempt. A malformed config is validate's finding, not a staleness
  // one — the doctor keeps serving the other checks.
  const staleProjections = [];
  try {
    for (const artifact of await buildArtifacts(root, { targets: ["agents-md", "tools", "bootstrap", "routing-index"] })) {
      let disk;
      try {
        disk = await readFile(path.join(root, artifact.path), "utf8");
      } catch {
        continue;
      }
      if (!isGeneratedProjection(disk)) continue;
      if (disk !== artifact.content) staleProjections.push({ path: artifact.path, target: artifact.target });
    }
  } catch {
    /* config unreadable: build cannot plan, validate owns that signal */
  }
  return diagnoseData({ inventory, files, mtimes, runs, feedback, generated, routingVectors, staleProjections, declaredTools });
}

/** Plain-text rendering for the CLI (the `--json` door returns the findings untouched). */
export function formatDiagnosis(findings) {
  if (!findings.length) return "Corpus sain: aucun signal.";
  const lines = findings.map((f) => `${f.severity === "error" ? "✖" : "▲"} ${f.type} ${f.path}\n ${f.message}\n → ${f.fix_hint}`);
  const errors = findings.filter((f) => f.severity === "error").length;
  lines.push(`\n${findings.length} signal${findings.length > 1 ? "s" : ""} (${errors} erreur${errors > 1 ? "s" : ""}).`);
  return lines.join("\n");
}
