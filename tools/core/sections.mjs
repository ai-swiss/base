// tools/core/sections.mjs — a Markdown body as heading-delimited sections. Zero dependencies, no I/O.
//
// A section is the unit a model can cite: a passage, plus the heading path that situates it. A whole
// document is the wrong grain at both ends of a read, too much to send and too vague to quote, so the
// body is cut where its author already cut it, at the headings.
//
// Anchors derive from the heading text (NFKD, accents folded, punctuation dropped, spaces to hyphens),
// and a heading may fix its own with `{#slug}` (Markdown Extra) for the two cases where derivation
// disappoints: a heading that repeats, and one likely to be reworded. Fenced code is never split, so a
// `# comment` line inside a shell block invents no section. One derivation serves every consumer
// (discover at section grain, open with a section, the outline projection), so the citation
// `id#anchor` means the same thing on every surface.

const HEADING = /^(#{1,6})\s+(.*?)\s*(?:\{#([a-z0-9]+(?:-[a-z0-9]+)*)\})?\s*$/;
// An HTML comment on a heading line is a mark for tooling (a review flag, an editor's note), never
// part of the heading: it is dropped before the anchor and the heading text are derived.
const COMMENT = /<!--[\s\S]*?-->/g;
// The combining marks NFKD leaves behind: «é» decomposes to «e» + U+0301, and only the letter is kept,
// so a French heading and a citation typed without accents reach the same section.
const DIACRITICS = /[̀-ͯ]/g;

/** @typedef {{ level: number, heading: string | null, anchor: string | null, text: string, line: number }} Section */

/** The one anchor derivation: every consumer calls this, so one heading yields one anchor everywhere. */
export function slugify(text) {
  return String(text)
    .normalize("NFKD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/[\s-]+/g, "-");
}

/**
 * Cut a body at its headings.
 * @param {string} body Markdown without frontmatter.
 * @returns {Section[]} The preamble (text before the first heading) comes first with `anchor: null`,
 *   and only when it is non-empty. A repeated anchor takes `-2`, `-3`, … so that every anchor in one
 *   body is unique: a citation that could designate two passages designates none.
 */
export function splitSections(body) {
  const lines = String(body ?? "").split("\n");
  /** @typedef {{ level: number, heading: string | null, anchor: string | null, lines: string[], line: number }} Draft */
  /** @type {Draft[]} */
  const out = [];
  /** @type {Set<string>} */
  const seen = new Set();
  /** @type {Draft} */
  let current = { level: 0, heading: null, anchor: null, lines: [], line: 1 };
  let inFence = false;
  lines.forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    const m = inFence ? null : HEADING.exec(line);
    if (!m) {
      current.lines.push(line);
      return;
    }
    out.push(current);
    const headingText = m[2].replace(COMMENT, "").trim();
    const base = m[3] || slugify(headingText);
    // The numbering repeats until the name is free, because the suffixed form can itself be taken by
    // a heading that spells it out (a body holding «Risque» twice and a literal «Risque 2»).
    let anchor = base;
    for (let n = 2; seen.has(anchor); n += 1) anchor = `${base}-${n}`;
    seen.add(anchor);
    current = { level: m[1].length, heading: headingText, anchor, lines: [], line: i + 1 };
  });
  out.push(current);
  return out
    .map((s) => ({ level: s.level, heading: s.heading, anchor: s.anchor, text: s.lines.join("\n").trim(), line: s.line }))
    .filter((s) => s.heading !== null || s.text.length > 0);
}

/**
 * "A › B › C": the nearest ancestor headings of section `index`, by level. A passage quoted without
 * its ancestors loses what it is about, «Étape 2» being an answer to nothing on its own.
 * @param {Section[]} sections @param {number} index
 */
export function headingPath(sections, index) {
  const target = sections[index];
  if (!target || target.heading === null) return "";
  /** @type {string[]} */
  const trail = [];
  let level = target.level;
  for (let i = index; i >= 0; i--) {
    const s = sections[i];
    if (s.heading !== null && s.level <= level) {
      trail.unshift(s.heading);
      level = s.level - 1;
      if (level <= 0) break;
    }
  }
  return trail.join(" › ");
}

/** The outline projection: one line per heading with its anchor, indented by level. */
export function renderOutline(sections) {
  return sections
    .filter((s) => s.heading !== null)
    .map((s) => `${"  ".repeat(Math.max(0, s.level - 1))}${"#".repeat(s.level)} ${s.heading}  #${s.anchor}`)
    .join("\n");
}

/**
 * The section named by `anchor`, or null.
 *
 * `superseded` is the card's `superseded_anchors`, a map `{ "<old-anchor>": "<current-anchor>" }`.
 * Renaming a heading moves its derived anchor, while the citations already written down keep the old
 * name; the map says where each old name went, so an existing reference still lands on the passage it
 * was taken from. An entry must name an anchor that EXISTS: an alias nobody declared, and one whose
 * target has since gone, both read as not found, and the caller answers with the anchors the document
 * does have. Returning some other section instead would answer a citation with a passage it never
 * referred to, stamped with the new ref, which is a quote that looks sourced and is not. Resolution is
 * one hop: an entry pointing at another retired name is stale, and reads as not found too.
 * @param {Section[]} sections @param {string | null | undefined} anchor
 * @param {Record<string, string> | null | undefined} [superseded]
 * @returns {Section | null}
 */
export function findSection(sections, anchor, superseded) {
  if (!anchor) return null;
  const direct = sections.find((s) => s.anchor === anchor);
  if (direct) return direct;
  const map = superseded && typeof superseded === "object" && !Array.isArray(superseded) ? superseded : null;
  const current = map ? map[anchor] : null;
  return typeof current === "string" ? sections.find((s) => s.anchor === current) ?? null : null;
}

/**
 * The section grain applied to an opened resource: `projection: "outline"` replaces the content by
 * the table of contents, and `section` narrows it to one passage and names its ref. An unknown anchor
 * THROWS, naming the anchors the document does have: a caller that mistyped one, or held a citation
 * that has since moved, can act on that list, where an empty result would only look like an empty
 * document. Mutates and returns `result`; the caller does the I/O.
 * @param {Record<string, any>} result
 * @param {string} body
 * @param {{ section?: string, projection?: string, resourceId: string, superseded?: Record<string, string> | null }} options
 */
export function applySectionProjection(result, body, { section, projection, resourceId, superseded }) {
  if (!section && projection !== "outline") return result;
  const sections = splitSections(body);
  if (projection === "outline") {
    result.content = renderOutline(sections);
    result.outline = sections
      .filter((s) => s.heading !== null)
      .map((s) => ({ anchor: s.anchor, heading: s.heading, level: s.level, heading_path: headingPath(sections, sections.indexOf(s)) }));
  }
  if (section) {
    const hit = findSection(sections, section, superseded);
    if (!hit) {
      const known = sections.filter((s) => s.anchor).map((s) => s.anchor);
      throw new Error(`Section not found: ${resourceId}#${section}. Known sections: ${known.join(", ") || "(none)"}.`);
    }
    // The heading is put back on top of the passage: quoted alone, a body without its title reads as
    // an assertion from nowhere.
    result.content = `${"#".repeat(hit.level)} ${hit.heading}\n\n${hit.text}`;
    result.section = { anchor: hit.anchor, heading: hit.heading, heading_path: headingPath(sections, sections.indexOf(hit)), ref: `${resourceId}#${hit.anchor}` };
  }
  return result;
}

/**
 * The first `max` characters of a section's text, cut at a word boundary: what a search result shows.
 * A passage cut mid-word reads as damaged text, and a reader cannot tell truncation from a typo.
 *
 * PROVISIONAL, like the page-image budget it sits beside: 480 characters is long enough to judge a
 * passage and short enough that ten of them fit one answer, but it is a guess, not a measurement. It
 * belongs with the result limits a real client applies, measured per client (DEVELOPING.md).
 * @param {{ text: string }} section @param {number} [max]
 */
export function passageOf(section, max = 480) {
  const text = section.text.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const cut = text.lastIndexOf(" ", max);
  return `${text.slice(0, cut > max / 2 ? cut : max)} …`;
}
