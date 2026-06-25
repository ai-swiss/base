// The context pack: pre-load what the process DECLARES, leave the rest to the tools. A BASE
// process names its dependencies (Markdown links, inline `paths`); at run launch (eval) or chat
// open, the pack resolves those references — exact path → folder (its README) → ranker (annotated
// «≈») — and injects the contents under a token budget. A truly dead reference is flagged, which
// makes it VISIBLE to the judge instead of silently missing.
//
// Pure on its inputs: inventory + an injected reader — testable without disk, shared verbatim by
// the eval harness, the Studio chat and the doctor's link graph. It lives in core because it only
// depends on core seams (rankers, egress): consumers sit in different app layers.

import { checkEgress, egressNotice } from "./egress.mjs";
import { lexicalRanker, normalize } from "./rankers.mjs";

const DEFAULT_BUDGET_TOKENS = 8_000;
const CHARS_PER_TOKEN = 4; // the usual rough estimate; the budget is a guardrail, not an invoice
const RANKER_CONFIDENCE_FLOOR = 60; // below this, a fuzzy match is a guess — leave it to the tools

/**
 * Markdown links only: `[label](path)`, local targets. These are the deliberate links a reader
 * (or a dead-link check) follows. Illustrative `code` paths are NOT links — see extractReferences.
 */
export function extractLinks(body) {
  const refs = new Set();
  // Strip inline code-spans first: a whole `[label](path)` wrapped in backticks is illustrative
  // prose, not a link. A link whose label is a code-span, [`label`](path), keeps its target.
  const text = String(body).replace(/`[^`\n]*`/g, " ");
  // [label](path) or [label](path "title") — keep the local target only.
  for (const m of text.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const target = m[1];
    if (!/^[a-z]+:/i.test(target) && !target.startsWith("#")) refs.add(target);
  }
  return [...refs];
}

/**
 * Every reference a body declares: Markdown links (extractLinks) PLUS inline `code` paths. The
 * code-span half is intentionally broad — a BASE agent routinely names a skill it uses as an
 * inline path (`skills/competences/x/SKILL.md`) rather than a link — so this is the right set for
 * "what does this resource reach" (context packing, the orphan/referenced graph). It is the WRONG
 * set for dead-link detection: prose code-spans illustrate paths (`.cursor/rules`, `.codex/config.toml`)
 * that are not links and must not be reported as broken. Use extractLinks for that.
 */
export function extractReferences(body) {
  const refs = new Set(extractLinks(body));
  // `inline/path` or `dossier/` — backtick tokens that look like paths.
  for (const m of String(body).matchAll(/`([^`\n]+)`/g)) {
    const token = m[1].trim();
    if (token.includes("[") || token.includes("*")) continue; // template placeholders, globs
    if (/^[\w.-]+(?:\/[\w.-]+)*\/?$/.test(token) && token.includes("/")) refs.add(token);
  }
  return [...refs];
}

function estimateTokens(text) {
  return Math.ceil(String(text).length / CHARS_PER_TOKEN);
}

// Resolve a declared ref against the inventory: exact → folder → ranker. Paths are tried as
// root-relative AND relative to the process file's directory (`../tarifs/x.md`).
function resolveRef(ref, inventory, processDir) {
  const candidates = new Set();
  const clean = ref.replace(/^\.\//, "");
  candidates.add(clean);
  if (processDir) {
    const joined = [...processDir.split("/"), ...clean.split("/")];
    const stack = [];
    for (const part of joined) {
      if (part === "..") stack.pop();
      else if (part !== "." && part !== "") stack.push(part);
    }
    candidates.add(stack.join("/"));
  }

  for (const candidate of candidates) {
    const exact = inventory.find((r) => r.path === candidate);
    if (exact) return { type: "exact", path: exact.path };
  }

  for (const candidate of candidates) {
    const dir = candidate.replace(/\/$/, "");
    const inDir = inventory.filter((r) => r.path.startsWith(`${dir}/`));
    if (inDir.length) {
      const readme = inDir.find((r) => r.path === `${dir}/README.md`);
      if (readme) return { type: "dir", path: readme.path, dir };
      return { type: "dir-list", dir, paths: inDir.map((r) => r.path) };
    }
  }

  // Ranker rescue: tokenize the ref and score the inventory (same lexical ranker as everywhere).
  const terms = normalize(clean.replace(/\.[a-z0-9]+$/i, "")).split(/[\\/_.\s-]+/).filter(Boolean);
  const ranked = inventory
    .map((r) => ({ resource: r, ...lexicalRanker(r, terms) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  if (ranked[0] && ranked[0].score >= RANKER_CONFIDENCE_FLOOR) {
    return { type: "fuzzy", path: ranked[0].resource.path };
  }
  return { type: "unresolved", suggestions: ranked.slice(0, 3).map((x) => x.resource.path) };
}

/**
 * Build the pack for a process: resolve its declared references and load contents under the budget.
 * @param {Array<{ path: string, body?: string, content?: string, metadata?: any }>} inventory the root's resources
 * @param {(path: string) => Promise<string>} readFile injected reader (root-relative path → content)
 * @param {string} processPath the process file whose declarations are packed
 * @param {{ budget?: number, now?: string, egress?: { modelLocality: "local" | "remote", rootPolicy?: "local-only" | "any" } }} [options]
 * budget in (estimated) tokens; `now` as YYYY-MM-DD (injectable for tests); `egress` applies the
 * egress control before any injection (withheld resources are SAID, never silently dropped).
 * → { sections: [{ path, content, note? }], omitted: string[], unresolved: [{ ref, suggestions }], withheld: [{ path, reason }] }
 */
export async function buildContextPack(inventory, readFile, processPath, { budget = DEFAULT_BUDGET_TOKENS, now = new Date().toISOString().slice(0, 10), egress } = {}) {
  const processEntry = inventory.find((r) => r.path === processPath);
  if (!processEntry) return { sections: [], omitted: [], unresolved: [], withheld: [] };
  const processDir = processPath.includes("/") ? processPath.slice(0, processPath.lastIndexOf("/")) : "";

  const sections = [];
  const omitted = [];
  const unresolved = [];
  const withheld = [];
  const injected = new Set([processPath]); // never re-inject the process itself
  let spent = 0;

  for (const ref of extractReferences(processEntry.body ?? processEntry.content ?? "")) {
    const resolution = resolveRef(ref, inventory, processDir);

    if (resolution.type === "unresolved") {
      unresolved.push({ ref, suggestions: resolution.suggestions });
      continue;
    }
    if (resolution.type === "dir-list") {
      // A folder without README: its file list is the cheapest faithful injection.
      const content = resolution.paths.map((p) => `- ${p}`).join("\n");
      sections.push({ path: `${resolution.dir}/`, content, note: `dossier ${resolution.dir}/ (liste)` });
      spent += estimateTokens(content);
      continue;
    }

    if (injected.has(resolution.path)) continue;
    injected.add(resolution.path);

    // Egress control, BEFORE any content is read: a withheld document never enters the pack.
    const entryForEgress = inventory.find((r) => r.path === resolution.path);
    if (egress && entryForEgress) {
      const verdict = checkEgress({ ...egress, resources: [entryForEgress] });
      if (verdict.withheld.length) {
        withheld.push({ path: resolution.path, reason: verdict.withheld[0].reason });
        continue;
      }
    }

    let content;
    try {
      content = await readFile(resolution.path);
    } catch {
      unresolved.push({ ref, suggestions: [] });
      continue;
    }
    const cost = estimateTokens(content);
    if (spent + cost > budget) {
      // Whole-section truncation only: what does not fit stays reachable via the tools.
      omitted.push(resolution.path);
      continue;
    }
    spent += cost;
    const notes = [];
    if (resolution.type === "dir") notes.push(`dossier ${resolution.dir}/`);
    if (resolution.type === "fuzzy") notes.push(`référence imparfaite: ${ref} ≈ ${resolution.path}`);
    // Aging ontology: an expired reference is injected WITH its expiry on its face.
    const entry = inventory.find((r) => r.path === resolution.path);
    const meta = entry?.metadata ?? entry ?? {};
    if (meta.valid_until && String(meta.valid_until) < now) notes.push(`périmé depuis le ${meta.valid_until}`);
    const isReference = Boolean(meta.valid_from || meta.valid_until);
    sections.push({ path: resolution.path, content, ...(notes.length ? { note: notes.join(" · ") } : {}), ...(isReference ? { reference: true } : {}) });
  }

  return { sections, omitted, unresolved, withheld };
}

/** Render the pack as the «## Contexte fourni» system block (eval consigne + chat context). */
export function renderContextPack(pack) {
  if (!pack.sections.length && !pack.omitted.length && !pack.unresolved.length) return "";
  const lines = ["## Contexte fourni"];
  for (const section of pack.sections) {
    lines.push(`### ${section.path}${section.note ? ` (${section.note})` : ""}`, section.content, "");
  }
  if (pack.sections.some((s) => s.reference)) {
    // Reference data (rates, price lists) is cited EXACTLY, never paraphrased.
    lines.push("Donnée de référence: cite les valeurs exactement (montants, taux, dates), sans reformulation.");
  }
  if (pack.omitted.length) {
    lines.push(`Non injecté (budget): ${pack.omitted.join(", ")} → utilise les outils de lecture.`);
  }
  for (const u of pack.unresolved) {
    lines.push(
      `Référence introuvable: ${u.ref}${u.suggestions.length ? ` (pistes : ${u.suggestions.join(", ")})` : ""} → cherche avec discover_resources.`,
    );
  }
  if ((pack.withheld ?? []).length) {
    // The egress refusal is explicit — in the trace AND in front of the model.
    lines.push(egressNotice(pack.withheld.map((w) => ({ resource: { path: w.path }, reason: w.reason }))));
  }
  return lines.join("\n");
}

/** A compact summary for run traces and UI badges: paths + notes, never the contents. */
export function summarizeContextPack(pack) {
  return {
    sections: pack.sections.map((s) => ({ path: s.path, ...(s.note ? { note: s.note } : {}) })),
    omitted: pack.omitted,
    unresolved: pack.unresolved,
    withheld: pack.withheld ?? [],
  };
}
