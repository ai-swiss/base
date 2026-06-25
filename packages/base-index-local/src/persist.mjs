// Persist the index as a single JSON file. It is a derived artifact: deletable and regenerable. The
// serialization is stable (the build already sorts documents and postings), so a written index of the
// same inputs is byte-identical — a freshness gate can `git diff --exit-code` it like any projection.

import * as fs from "node:fs/promises";
import { INDEX_SCHEMA } from "./build.mjs";

export async function saveIndex(filePath, index) {
  if (index?.schema_version !== INDEX_SCHEMA) {
    throw new Error(`Refusing to write a non-${INDEX_SCHEMA} object.`);
  }
  await fs.writeFile(filePath, serializeIndex(index), "utf8");
}

export async function loadIndex(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const index = JSON.parse(raw);
  if (index?.schema_version !== INDEX_SCHEMA) {
    throw new Error(`Not a ${INDEX_SCHEMA} index: ${filePath}`);
  }
  return index;
}

// Deterministic JSON: the meaningful order is already fixed by the build; we only drop the private
// vocabulary cache (a non-enumerable field) and pretty-print for a readable, diff-able artifact.
export function serializeIndex(index) {
  return `${JSON.stringify(index, null, 2)}\n`;
}
