// Stable, prefixed content/argument hashes for the change journal and trace events. Pure: the same
// input always yields the same sha256 string, so trace records and change ids are reproducible.
import * as crypto from "node:crypto";

export function hashArgs(args) {
  return `sha256:${crypto.createHash("sha256").update(JSON.stringify(args ?? [])).digest("hex")}`;
}

export function hashContent(text) {
  return `sha256:${crypto.createHash("sha256").update(String(text ?? "")).digest("hex")}`;
}
