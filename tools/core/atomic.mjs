// Atomic write: stage the content in a sibling temp file, then rename over the target. rename(2) is
// atomic on the same filesystem, so a crash mid-write can never leave a half-written file: the target
// is either the old content or the new, never a truncation. Used for mediated writes, the manifest,
// generated artifacts, and the change-record journal, where a torn write would be silent data loss.
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as crypto from "node:crypto";

export async function writeFileAtomic(fullPath, content) {
  const tmp = path.join(path.dirname(fullPath), `.${path.basename(fullPath)}.${crypto.randomUUID()}.tmp`);
  try {
    await fs.writeFile(tmp, content, "utf8");
    await fs.rename(tmp, fullPath);
  } catch (error) {
    await fs.rm(tmp, { force: true }).catch(() => {});
    throw error;
  }
}
