#!/usr/bin/env node
// check-markers.mjs — the marker vocabulary stays one closed set.
//
// The four business markers are restated in several places: the scanner regex (tools/core/markers.mjs,
// the single source), the human registry (docs/reference/marqueurs.md), the requirement
// (FR-MARKERS-001 / FR-CORE-010), and every agent's `marqueurs` skill. Hand-kept copies drift, and an
// agent then follows a stale copy with full confidence. This gate makes them agree: every place must
// carry the full set, so a marker can never silently go missing from one copy.
//
//   node tools/spec/check-markers.mjs        # exit 1 on any drift, 0 when consistent
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { BUSINESS_MARKERS } from "../core/markers.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REGISTRY = "docs/reference/marqueurs.md";
const REQUIREMENTS = "specs/current/10_core/requirements.md";
const SKILL_SUFFIX = "skills/competences/marqueurs/SKILL.md";
// Where agents live (the runtime fixtures under the Studio e2e tree are excluded; they are test data).
const AGENT_TREES = [".ai/agents", "exemples"];

/** Markers from `wanted` that do not appear verbatim in `text`. */
export function missingMarkers(text, wanted = BUSINESS_MARKERS) {
  return wanted.filter((m) => !text.includes(m));
}

async function findMarkerSkills(/** @type {string} */ dir) {
  const out = [];
  let entries;
  try {
    entries = await fs.readdir(path.join(ROOT, dir), { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const rel = path.posix.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await findMarkerSkills(rel)));
    else if (rel.endsWith(SKILL_SUFFIX)) out.push(rel);
  }
  return out;
}

async function main() {
  const failures = [];
  const registry = await fs.readFile(path.join(ROOT, REGISTRY), "utf8").catch(() => "");
  let miss = missingMarkers(registry);
  if (miss.length) failures.push(`${REGISTRY}: missing marker(s): ${miss.join(", ")}`);

  const requirements = await fs.readFile(path.join(ROOT, REQUIREMENTS), "utf8");
  miss = missingMarkers(requirements);
  if (miss.length) failures.push(`${REQUIREMENTS} (FR-MARKERS-001): missing marker(s): ${miss.join(", ")}`);

  // An agent may deliberately adapt the vocabulary to its domain (e.g. a reflexion assistant teaches
  // `[HYPOTHESE]`/`[INCERTITUDE]`); such a variant does NOT use `A COMPLETER`. But a file that uses the
  // canonical set (it mentions `A COMPLETER`) is a canonical copy, and must carry the WHOLE set, so a
  // copy cannot silently drop one of the four. This catches accidental drift without forbidding a
  // genuine domain variant.
  const skills = (await Promise.all(AGENT_TREES.map(findMarkerSkills))).flat().sort();
  let canonicalCopies = 0;
  let variants = 0;
  for (const rel of skills) {
    const text = await fs.readFile(path.join(ROOT, rel), "utf8");
    if (!text.includes("A COMPLETER")) {
      variants++;
      continue;
    }
    canonicalCopies++;
    const m = missingMarkers(text);
    if (m.length) failures.push(`${rel}: a canonical marqueurs skill is missing marker(s): ${m.join(", ")} (it uses the canonical set but dropped one of the four)`);
  }

  if (failures.length) {
    console.error("check-markers: FAIL — the marker vocabulary has drifted:");
    for (const f of failures) console.error(`  ${f}`);
    console.error(`  The closed set is ${BUSINESS_MARKERS.join(", ")} (source: tools/core/markers.mjs, registry: ${REGISTRY}).`);
    process.exit(1);
  }
  console.log(`check-markers: pass — the closed set [${BUSINESS_MARKERS.join(", ")}] is consistent across the scanner, the registry, and FR-MARKERS-001; ${canonicalCopies} canonical agent skill(s) carry the full set, ${variants} domain variant(s) skipped.`);
}

if (process.argv[1] && process.argv[1].endsWith("check-markers.mjs")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  });
}
