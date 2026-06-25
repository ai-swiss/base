#!/usr/bin/env node
// check-id-namespaces.mjs — the ID-namespace gate.
//
// Each section of requirements.md declares the ID namespace it `Owns:` (e.g. `Owns: FR-CORE-*`,
// or a whole-prefix `Owns: RC-*`). The central index accepts any well-formed ID anywhere, so a
// mis-filed row — an `FR-ROUTE-003` sitting under the section that Owns `FR-CORE-*` — would pass
// the immutability gate silently and scatter a domain across the file. This gate catches that:
// every row-defined ID must sit in a section whose Owns: covers it. Cheap on one file, and it
// keeps the single ID table self-consistent (it is part of the gate-enforced discipline of
// NFR-CORE-010). Parenthetical commentary on an Owns: line (e.g. "(NFR-ROUTE-* is owned by the
// ROUTE section)") is read as prose, not as a claim.
//
//   check-id-namespaces.mjs   # exit 0 = every ID is in a section that Owns it, 1 = a misfiled ID, 2 = setup
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { STABLE_PREFIXES, rowIdPattern } from "./id-grammar.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REQUIREMENTS_FILE = "specs/current/10_core/requirements.md";

// An Owns: token is `PREFIX-*` (a whole prefix, e.g. RC-*) or `PREFIX-DOMAIN-*` (one domain).
const OWNS_TOKEN = /\b([A-Z]+(?:-[A-Z]+)?)-\*/g;

/**
 * Split requirements.md into `## ` sections, each with its declared Owns: namespaces and the
 * stable row IDs it defines.
 * @returns {{ heading: string, owns: string[], ids: string[] }[]}
 */
export function parseSections(markdown) {
  const sections = [];
  const parts = markdown.split(/^(## .*)$/m); // [preamble, heading, body, heading, body, ...]
  // The preamble (above the first `## `) declares no namespace, yet the sibling gates still track
  // any stable row ID there. So a misfiled ID parked above the first section must not escape: scan it.
  const preambleIds = [...(parts[0] ?? "").matchAll(rowIdPattern(STABLE_PREFIXES))].map((m) => m[1]);
  if (preambleIds.length) sections.push({ heading: "(before any section)", owns: [], ids: preambleIds });
  for (let i = 1; i < parts.length; i += 2) {
    const heading = parts[i].replace(/^##\s*/, "").trim();
    const body = parts[i + 1] ?? "";
    const ownsLine = body.match(/^Owns:\s*(.*)$/m)?.[1] ?? "";
    // Parenthetical or bracketed text on the Owns line is prose ("(NFR-ROUTE-* is owned elsewhere)"),
    // never a claim — strip those spans wherever they sit before reading the tokens.
    const ownsClaim = ownsLine.replace(/\([^)]*\)/g, " ").replace(/\[[^\]]*\]/g, " ");
    const owns = [...ownsClaim.matchAll(OWNS_TOKEN)].map((m) => m[1]);
    const ids = [...body.matchAll(rowIdPattern(STABLE_PREFIXES))].map((m) => m[1]);
    sections.push({ heading, owns, ids });
  }
  return sections;
}

/** An ID `PREFIX-DOMAIN-NNN` is owned by token `PREFIX` or `PREFIX-DOMAIN` (boundary on the dash). */
function idMatchesOwns(id, owns) {
  return owns.some((token) => id.startsWith(`${token}-`));
}

/**
 * @param {{ heading: string, owns: string[], ids: string[] }[]} sections
 * @returns {{ ok: boolean, violations: { id: string, heading: string, owns: string[], reason?: string }[] }}
 */
export function namespaceVerdict(sections) {
  const violations = [];
  for (const s of sections) {
    if (s.ids.length === 0) continue;
    if (s.owns.length === 0) {
      for (const id of s.ids) violations.push({ id, heading: s.heading, owns: [], reason: "section declares no Owns:" });
      continue;
    }
    for (const id of s.ids) {
      if (!idMatchesOwns(id, s.owns)) violations.push({ id, heading: s.heading, owns: s.owns });
    }
  }
  return { ok: violations.length === 0, violations };
}

async function main() {
  let markdown;
  try {
    markdown = await fs.readFile(path.join(ROOT, REQUIREMENTS_FILE), "utf8");
  } catch (error) {
    console.error(`check-id-namespaces: cannot read ${REQUIREMENTS_FILE}: ${error.message}`);
    process.exit(2);
  }
  const sections = parseSections(markdown);
  const { ok, violations } = namespaceVerdict(sections);
  if (ok) {
    const count = sections.reduce((n, s) => n + s.ids.length, 0);
    console.log(`check-id-namespaces: pass — ${count} IDs each sit within their section's declared Owns: namespace.`);
    process.exit(0);
  }
  console.error("check-id-namespaces: FAIL — misfiled ID(s):");
  for (const v of violations) {
    const owns = v.owns.length ? `Owns: ${v.owns.map((o) => `${o}-*`).join(", ")}` : v.reason;
    console.error(`  ${v.id} under "${v.heading}" — ${owns}`);
  }
  process.exit(1);
}

if (process.argv[1] && process.argv[1].endsWith("check-id-namespaces.mjs")) {
  main().catch((error) => {
    console.error(error);
    process.exit(2);
  });
}
