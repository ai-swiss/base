// tools/core/sections-search.mjs — discover at section grain. Zero dependencies, no I/O: it receives
// an inventory the caller has already filtered (egress, generated projections) and returns ranked
// passages.
//
// Sections are many and short, so a flat field score lets a word present nearly everywhere («base»,
// «utiliser») outrank the one that names the subject. Each term is therefore weighted by how rare it
// is across the passages (inverse document frequency), a hit in a heading counts more than one in the
// body. A hit in the parent resource's own signals (title, use_when, routing examples) only
// disambiguates passages that match on their own; metadata alone must never turn every section of a
// document into a result. Matching is whole-word, with a prefix match for terms of five letters or
// more, so «priorisation» reaches «prioriser» without a stemmer.
//
// Passage rarity and resource rarity use separate populations. Counting a resource signal once per
// section would make a long document artificially common, while adding all metadata matches without
// a bound would let a parent card outweigh what the cited passage actually says.
//
// WHY THIS SCORER DOES NOT GO THROUGH composeRankers: a Ranker scores ONE resource against the terms
// and knows nothing of the others, while the weight of a term here is a property of the whole passage
// population, which exists only once every candidate has been cut into sections. Wearing the Ranker
// interface would mean recomputing that population per candidate, or hiding it in a cache behind the
// interface, which is a second ranking system dressed as the first. The field weights below are the
// only scoring knobs, and they live here rather than in core/rankers.mjs for the same reason
// (FR-CORE-008).

import { splitSections, headingPath, passageOf } from "./sections.mjs";
import { normalize } from "./rankers.mjs";
import { SCHEMA_VERSION } from "./schema.mjs";

const WEIGHTS = { heading: 3, body: 1, resource: 1 };
const MAX_RESOURCE_BONUS_RATIO = 0.5;
const PREFIX_MIN = 5;

/** @param {string} text */
function words(text) {
  return normalize(text).split(/[^a-z0-9]+/).filter(Boolean);
}

/** @param {string[]} tokens @param {string} term */
function hits(tokens, term) {
  return term.length >= PREFIX_MIN ? tokens.some((t) => t.startsWith(term)) : tokens.includes(term);
}

/** The parent resource's own routing signals: what the card says about itself, not about a passage. */
function resourceSignals(resource) {
  const meta = resource.metadata ?? {};
  const routing = meta.routing && typeof meta.routing === "object" ? meta.routing : {};
  const examples = Array.isArray(routing.examples) ? routing.examples.join(" ") : "";
  return words([resource.title, meta.use_when ?? "", meta.description ?? "", examples].join(" "));
}

/**
 * Ranked passages for `terms`.
 * @param {Array<Record<string, any>>} resources inventory records the caller already filtered
 * @param {string[]} terms query terms (normalised, stop words already dropped)
 * @param {{ limit?: number, scope?: string }} [options] `scope` narrows to one folder
 */
export function searchSectionsIn(resources, terms, { limit = 10, scope } = {}) {
  const prefix = scope ? `${String(scope).replace(/^\.?\//, "").replace(/\/+$/, "")}/` : null;
  // A section hit is a citation, and a citation needs an identity governed by the supported card
  // contract. Missing and unknown schemas stay reachable at resource grain and by path, but cannot
  // emit an apparently valid `id#anchor`.
  const candidates = resources.filter((r) => r.schema_version === SCHEMA_VERSION && (!prefix || String(r.path).startsWith(prefix)));
  const signalTokens = new Map(candidates.map((resource) => [resource, resourceSignals(resource)]));
  /** @type {Array<{ resource: Record<string, any>, section: any, hp: string, heading: string[], body: string[], signals: string[] }>} */
  const entries = [];
  for (const resource of candidates) {
    const sections = splitSections(resource.body ?? "");
    const signals = signalTokens.get(resource) ?? [];
    sections.forEach((section, i) => {
      if (!section.text) return;
      const hp = headingPath(sections, i) || resource.title;
      entries.push({ resource, section, hp, heading: words(hp), body: words(section.text), signals });
    });
  }

  const passagePopulation = entries.length || 1;
  const resourcePopulation = candidates.length || 1;
  /** @type {Map<string, number>} */
  const passageDf = new Map();
  /** @type {Map<string, number>} */
  const resourceDf = new Map();
  for (const term of terms) {
    passageDf.set(term, entries.filter((e) => hits(e.body, term) || hits(e.heading, term)).length);
    resourceDf.set(term, candidates.filter((resource) => hits(signalTokens.get(resource) ?? [], term)).length);
  }
  const passageIdf = (/** @type {string} */ term) =>
    Math.log(1 + passagePopulation / (1 + (passageDf.get(term) ?? 0)));
  const resourceIdf = (/** @type {string} */ term) =>
    Math.log(1 + resourcePopulation / (1 + (resourceDf.get(term) ?? 0)));

  const ranked = [];
  for (const e of entries) {
    let passageScore = 0;
    let resourceScore = 0;
    let passageMatched = false;
    /** @type {string[]} */
    const reasons = [];
    for (const term of terms) {
      const w = passageIdf(term);
      if (hits(e.heading, term)) {
        passageScore += WEIGHTS.heading * w;
        passageMatched = true;
        reasons.push(`heading:${term}`);
      }
      if (hits(e.body, term)) {
        passageScore += WEIGHTS.body * w;
        passageMatched = true;
        reasons.push(`text:${term}`);
      }
      if (hits(e.signals, term)) {
        resourceScore += WEIGHTS.resource * resourceIdf(term);
        reasons.push(`resource:${term}`);
      }
    }
    if (!passageMatched) continue;
    const score = passageScore + Math.min(resourceScore, passageScore * MAX_RESOURCE_BONUS_RATIO);
    const { resource, section } = e;
    // Built field by field on purpose: a hit names a passage and how to reopen it, and never carries
    // `content` or `body`. Spreading the inventory record here would ship every matched file whole,
    // which is the opposite of what asking for a section means.
    ranked.push({
      id: resource.id,
      path: resource.path,
      type: resource.type,
      title: resource.title,
      section: section.anchor,
      ref: section.anchor ? `${resource.id}#${section.anchor}` : resource.id,
      heading_path: e.hp,
      passage: passageOf(section),
      citation: typeof resource.metadata?.cite_as === "string" ? resource.metadata.cite_as : null,
      score: Number(score.toFixed(3)),
      reasons: [...new Set(reasons)],
    });
  }
  ranked.sort((a, b) => b.score - a.score || (a.path < b.path ? -1 : a.path > b.path ? 1 : 0) || (a.ref < b.ref ? -1 : 1));
  return ranked.slice(0, limit);
}
