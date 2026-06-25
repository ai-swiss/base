// `base doctor` — the corpus health check: a PURE PROJECTION over data that already exists
// (inventory, link graph, eval runs, field feedback). It introduces no state of its own. The
// friction says what broke; the doctor says what is ABOUT to break. Two severities only, a
// mandatory fix_hint per finding — a doctor that cries wolf gets ignored.
//
// Two doors, one function: the CLI (`base doctor [--json]`) and Studio (`GET /api/doctor`) both
// call `diagnose(root)`, which loads the data then hands it to the pure `diagnoseData`.

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { inventoryResources } from "../base-core.mjs";
import { extractLinks, extractReferences } from "../core/context-pack.mjs";
import { readFeedback } from "../core/feedback.mjs";
import { listFiles, walkTree } from "../core/fswalk.mjs";

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

/**
 * The pure rule set — everything injected, fully testable without disk.
 * @param {{ inventory: any[], files?: string[], mtimes?: Record<string, number>,
 * runs?: { process: string | null, outcome: string | null, at: string }[],
 * feedback?: { frictions: { path: string, process: string, status: string }[], abstentions?: { query: string, verdict: string, count: number, lastAt: string }[] }, generated?: string[], now?: string }} data
 * `files`: every file on disk (links may target non-resources like JSON templates).
 * → [{ severity: "error" | "warn", type, path, message, fix_hint }]
 */
export function diagnoseData({ inventory, files = [], mtimes = {}, runs = [], feedback = { frictions: [], abstentions: [] }, generated = [], now = new Date().toISOString() }) {
  const findings = [];
  const today = now.slice(0, 10);
  const paths = new Set([...inventory.map((r) => r.path), ...files]);

  // One pass builds the reference graph and flags dead links. The OUT edges are broad (Markdown
  // links + inline `code` paths): a BASE agent names a skill it uses as an inline path, so that
  // counts as reaching it. DEAD-LINK detection is narrow (Markdown links only): prose code-spans
  // illustrate paths (`.cursor/rules`, a tutorial's example agent) that are not links and must not
  // be reported as broken — the same contract docs validation holds.
  const outRefs = new Map();
  for (const resource of inventory) {
    const out = new Set();
    for (const ref of extractReferences(resource.body ?? "")) {
      const resolved = refResolves(ref, resource.path, paths);
      if (resolved) out.add(resolved);
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

  // A BASE without its tool entry point is invisible expertise: no AI tool recognises the
  // folder. `base init` proposes exactly the missing artifacts (creation-only).
  if (!paths.has("CLAUDE.md")) {
    findings.push({
      severity: "warn",
      type: "missing_tool_artifacts",
      path: "CLAUDE.md",
      message: "aucun point d'entrée pour les outils IA (CLAUDE.md absent)",
      fix_hint: "Lancez `base init` dans ce dossier: il propose les artefacts manquants, sans rien écraser.",
    });
  }

  for (const friction of feedback.frictions) {
    if (friction.status !== "open") continue;
    findings.push({
      severity: "warn",
      type: "open_friction",
      path: friction.path,
      message: `friction ouverte sans réponse (process: ${friction.process})`,
      fix_hint: "Lisez la friction, amendez le process concerné, puis «Marquer résolu» dans Studio.",
    });
  }

  // A request the router keeps refusing is a process waiting to exist. The pile is already aggregated
  // by query with a count (FR-FEEDBACK-004); surface it as a low-severity finding once it recurs, so a
  // headless team (not only someone opening Studio) gets the nudge.
  for (const abstention of feedback.abstentions ?? []) {
    if ((abstention.count ?? 0) < RECURRING_ABSTENTION_THRESHOLD) continue;
    findings.push({
      severity: "warn",
      type: "recurring_abstention",
      path: ".ai/feedback/abstentions.jsonl",
      message: `«${abstention.query}» refusée ${abstention.count} fois (${abstention.verdict}) : une demande récurrente que le routeur ne sait pas servir.`,
      fix_hint: "Créez un process pour cette demande récurrente (ou ajustez les signaux de routage), puis protégez-le par une fixture route-test.",
    });
  }

  return findings;
}

/** Load the data the projection needs, then diagnose. The only filesystem touch of this module. */
export async function diagnose(root) {
  const inventory = await inventoryResources(root);
  const files = listFiles(await walkTree(root));
  /** @type {Record<string, number>} */
  const mtimes = {};
  // Generated artifacts (the routing indexes) carry a "Généré par … Ne pas éditer" header on line 1;
  // they are reachable by convention and never hand-referenced, so the orphan check must skip them.
  // Detect by PROVENANCE, not a hardcoded path: a hand-written index.md (no header) stays flagged.
  const generated = [];
  for (const resource of inventory) {
    try {
      mtimes[resource.path] = (await stat(path.join(root, resource.path))).mtimeMs;
      if (/(^|\/)index\.md$/.test(resource.path)) {
        const head = (await readFile(path.join(root, resource.path), "utf8")).slice(0, 160);
        if (/^<!--\s*Généré par /.test(head)) generated.push(resource.path);
      }
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
  const feedback = await readFeedback(root, { status: "open" });
  return diagnoseData({ inventory, files, mtimes, runs, feedback, generated });
}

/** Plain-text rendering for the CLI (the `--json` door returns the findings untouched). */
export function formatDiagnosis(findings) {
  if (!findings.length) return "Corpus sain: aucun signal.";
  const lines = findings.map((f) => `${f.severity === "error" ? "✖" : "▲"} ${f.type} ${f.path}\n ${f.message}\n → ${f.fix_hint}`);
  const errors = findings.filter((f) => f.severity === "error").length;
  lines.push(`\n${findings.length} signal${findings.length > 1 ? "s" : ""} (${errors} erreur${errors > 1 ? "s" : ""}).`);
  return lines.join("\n");
}
