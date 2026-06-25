#!/usr/bin/env node
// new-id.mjs — the requirement-ID allocator. IDs are allocated by tooling, never hand-numbered:
// editors demonstrably renumber, reuse, and duplicate identifiers, so the next free number is a
// computation, not a guess. This prints the next free `{PREFIX}-{DOMAIN}-{NNN}` for a domain by
// reading the existing rows of requirements.md (the immutability gate, check-ids.mjs, then keeps it
// stable forever). Allocation only suggests the next number; you still paste the row where it belongs.
//
//   node tools/spec/new-id.mjs FR EGRESS       # → next free FR-EGRESS-NNN
//   node tools/spec/new-id.mjs RC EGRESS       # → next free RC-EGRESS-NNN (a risk control)
//   npm run spec:new -- FR EGRESS
//
// Exit 0 = printed an ID, 2 = usage error.
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { STABLE_PREFIXES } from "./id-grammar.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REQUIREMENTS_FILE = "specs/current/10_core/requirements.md";

/**
 * The next free three-digit number for a `{PREFIX}-{DOMAIN}` family, given the spec source.
 * Honours immutability: it returns max(existing)+1, so retired/gapped numbers are never reused.
 * @param {string} markdown @param {string} prefix @param {string} domain
 * @returns {string} the full next ID, e.g. "FR-EGRESS-005"
 */
export function nextId(markdown, prefix, domain) {
  const family = `${prefix}-${domain}-`;
  let max = 0;
  // Count every mention of the family (rows and cross-references) so a number is never reused.
  const re = new RegExp(`\\b${prefix}-${domain}-(\\d{3})\\b`, "g");
  for (const m of markdown.matchAll(re)) max = Math.max(max, Number(m[1]));
  return `${family}${String(max + 1).padStart(3, "0")}`;
}

async function main() {
  const [prefix, domain, ...rest] = process.argv.slice(2);
  if (!prefix || !domain || rest.length) {
    console.error("Usage: node tools/spec/new-id.mjs <PREFIX> <DOMAIN>   (PREFIX ∈ " + STABLE_PREFIXES.join("/") + ")");
    process.exit(2);
  }
  if (!STABLE_PREFIXES.includes(prefix)) {
    console.error(`new-id: unknown prefix '${prefix}'. Use one of: ${STABLE_PREFIXES.join(", ")}.`);
    process.exit(2);
  }
  if (!/^[A-Z]+$/.test(domain)) {
    console.error(`new-id: domain must be UPPERCASE letters (got '${domain}').`);
    process.exit(2);
  }
  const source = await fs.readFile(path.join(ROOT, REQUIREMENTS_FILE), "utf8");
  console.log(nextId(source, prefix, domain));
}

if (process.argv[1] && process.argv[1].endsWith("new-id.mjs")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  });
}
