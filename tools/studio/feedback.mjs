// «Marquer résolu»: a friction amendment is an ORDINARY gated edit. The journal itself is
// creation-exempt (telemetry, written by tools/core/feedback.mjs); flipping `status` is expertise
// maintenance and therefore goes through the same propose→commit gate as any write. The read side
// of the pile lives in tools/core/feedback.mjs (shared with `base doctor`).

import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseFrontmatter } from "../base-core.mjs";
import { ApiError, proposeEdit } from "./api.mjs";

/**
 * Flip `status` to resolved via proposeEdit and hand back { changeId, diff } — the commit goes
 * through the usual button, like every other write.
 */
export async function resolveFriction(root, relPath) {
  if (!relPath || !relPath.startsWith(".ai/feedback/")) {
    throw new ApiError("resolve requires a `.ai/feedback/…` path", "BAD_REQUEST");
  }
  let raw;
  try {
    raw = await readFile(path.join(root, relPath), "utf8");
  } catch {
    throw new ApiError(`friction not found: ${relPath}`, "NOT_FOUND");
  }
  const parsed = parseFrontmatter(raw);
  return proposeEdit(root, { path: relPath, data: { ...parsed.data, status: "resolved" }, body: parsed.body });
}
