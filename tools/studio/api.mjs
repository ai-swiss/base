// Studio API handlers — the read/search/edit operations the browse+edit UI calls, expressed as plain
// async functions over (root, params). They are the broker's adapter for the UI: no HTTP here, so
// they are unit-testable directly (server.mjs is the thin transport binding on top).
//
// Editing reuses the gate: proposeEdit composes valid frontmatter via the serializer and routes
// through propose→commit, so the UI inherits confinement, TOCTOU and verification for free.

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import {
  commitChange,
  composeMarkdown,
  inventoryResources,
  parseFrontmatter,
  proposeChange,
  searchResources,
} from "../base-core.mjs";
import { confineToRoot, pathExists } from "../core/confine.mjs";
import { walkTree } from "../core/fswalk.mjs";
import { applyInitPlan, buildInitPlan, detectPerimeter } from "../core/perimeter.mjs";
import { resolveBaseContext, selectWorkspaceRoot, WORKSPACE_FILENAME } from "../core/roots.mjs";

const SCOPE_DEFAULT = "personal";
const STATUS_DEFAULT = "active";
const SENSITIVITY_DEFAULT = "internal";

// The Studio workspace is the editable knowledge plane. The discipline planes (durable change
// records under decisions/, the spec contract under specs/) are not edited here: they move through
// their own process. The tree omits them so the workspace shows only what Studio can act on. This
// declared set is the single place that decides visibility; add a root-relative path to hide
// another non-editable folder.
const STUDIO_HIDDEN = new Set(["decisions", "specs"]);

// Where the framework lives (tools/studio/api.mjs → up two). Recorded in a Studio-initialized
// project's base.config.json so its launcher (.ai/base.mjs) can find the engine afterwards.
const FRAMEWORK_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

// ApiError lives in the core (tools/core/api-error.mjs) so the core can throw it without importing the
// Studio layer; re-exported here, so this module's consumers and the HTTP status mapping are unchanged.
import { ApiError } from "../core/api-error.mjs";
export { ApiError };

// A lean card: the fields a list/grid needs. `nonDefault` flags which of scope/status/sensitivity
// differ from the default (so the UI shows a badge only when it carries information).
function toCard(r) {
  return {
    id: r.id,
    type: r.type,
    title: r.title || r.id,
    description: r.description || null,
    path: r.path,
    scope: r.scope ?? SCOPE_DEFAULT,
    status: r.status ?? STATUS_DEFAULT,
    sensitivity: r.sensitivity ?? SENSITIVITY_DEFAULT,
    useWhen: r.use_when || null,
    keywords: Array.isArray(r.keywords) ? r.keywords : [],
    hasErrors: Array.isArray(r.frontmatter_errors) && r.frontmatter_errors.length > 0,
    nonDefault: [
      r.scope && r.scope !== SCOPE_DEFAULT ? "scope" : null,
      r.status && r.status !== STATUS_DEFAULT ? "status" : null,
      r.sensitivity && r.sensitivity !== SENSITIVITY_DEFAULT ? "sensitivity" : null,
    ].filter(Boolean),
  };
}

function agentOf(relPath) {
  const m = relPath.match(/(?:^|\/)\.ai\/agents\/([^/]+)\//);
  return m ? m[1] : null;
}

// Normalize and validate an `under` directory filter: a root-relative POSIX path, no escapes.
// "" (or ".") means "the whole root". Throws ApiError BAD_REQUEST on absolute paths or `..`.
function normalizeUnder(under) {
  const norm = path.posix.normalize(String(under).replace(/\\/g, "/")).replace(/\/+$/, "");
  if (path.posix.isAbsolute(norm) || norm === ".." || norm.startsWith("../")) {
    throw new ApiError(`invalid under: ${under}`, "BAD_REQUEST");
  }
  return norm === "." ? "" : norm;
}

function underFilter(resources, under) {
  const prefix = normalizeUnder(under);
  if (!prefix) return resources;
  return resources.filter((r) => r.path === prefix || r.path.startsWith(`${prefix}/`));
}

export async function listResources(root, { type, types, under, scope, status, sensitivity, agent, sort } = /** @type {{ type?: string, types?: string[], under?: string, scope?: string, status?: string, sensitivity?: string, agent?: string, sort?: string }} */ ({})) {
  let resources = await inventoryResources(root);
  if (type) resources = resources.filter((r) => r.type === type);
  if (Array.isArray(types) && types.length) resources = resources.filter((r) => types.includes(r.type));
  if (under) resources = underFilter(resources, under);
  if (scope) resources = resources.filter((r) => (r.scope ?? SCOPE_DEFAULT) === scope);
  if (status) resources = resources.filter((r) => (r.status ?? STATUS_DEFAULT) === status);
  if (sensitivity) resources = resources.filter((r) => (r.sensitivity ?? SENSITIVITY_DEFAULT) === sensitivity);
  if (agent) resources = resources.filter((r) => agentOf(r.path) === agent);

  const cards = resources.map(toCard);
  if (sort === "recent") {
    const timed = await Promise.all(cards.map(async (c) => ({ ...c, mtimeMs: await mtimeMs(root, c.path) })));
    timed.sort((a, b) => b.mtimeMs - a.mtimeMs);
    return timed;
  }
  if (sort === "title") {
    cards.sort((a, b) => a.title.localeCompare(b.title));
    return cards;
  }
  // Default: tree order (path), so the card stream mirrors the file tree.
  cards.sort((a, b) => a.path.localeCompare(b.path));
  return cards;
}

async function mtimeMs(root, relPath) {
  try {
    return (await stat(path.join(root, relPath))).mtimeMs;
  } catch {
    return 0;
  }
}

// Hybrid search via the broker's ranker (lexical by default; semantic if configured). Returns cards
// with the score and the explainable `reasons` (so the UI can show "why it matched").
// `under` and `types` are masks applied AFTER ranking: the ranker stays global, the filter prunes.
export async function search(root, query, { limit = 20, under, types } = /** @type {{ limit?: number, under?: string, types?: string[] }} */ ({})) {
  if (!query || !String(query).trim()) return listResources(root, { under, types });
  const masked = Boolean(under || (Array.isArray(types) && types.length));
  // When a mask is active, over-fetch so the mask does not starve the requested page.
  const ranked = await searchResources(root, String(query), { limit: masked ? Math.max(limit * 10, 100) : limit });
  let hits = ranked;
  if (under) hits = underFilter(hits, under);
  if (Array.isArray(types) && types.length) hits = hits.filter((r) => types.includes(r.type));
  return hits.slice(0, limit).map((r) => ({ ...toCard(r), score: r.score, reasons: r.reasons ?? [] }));
}

// Workspace fan-out: one ranked search per root, merged by score, each card stamped with its rootId
// so the UI (and any write that follows) knows which confinement perimeter the card belongs to.
export async function searchAllRoots(context, query, { limit = 20, under, types } = /** @type {{ limit?: number, under?: string, types?: string[] }} */ ({})) {
  const perRoot = await Promise.all(
    context.roots.map(async (r) =>
      (await search(r.path, query, { limit, under, types })).map((card) => ({ ...card, rootId: r.id }))),
  );
  return perRoot
    .flat()
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit);
}

// Facet counts for the filter sidebar, computed in one inventory pass.
export async function facets(root) {
  const resources = await inventoryResources(root);
  const tally = (pick) => {
    const out = {};
    for (const r of resources) {
      const k = pick(r);
      if (k == null) continue;
      out[k] = (out[k] ?? 0) + 1;
    }
    return out;
  };
  return {
    total: resources.length,
    type: tally((r) => r.type),
    scope: tally((r) => r.scope ?? SCOPE_DEFAULT),
    status: tally((r) => r.status ?? STATUS_DEFAULT),
    sensitivity: tally((r) => r.sensitivity ?? SENSITIVITY_DEFAULT),
    agent: tally((r) => agentOf(r.path)),
    withErrors: resources.filter((r) => r.frontmatter_errors?.length).length,
  };
}

// Full resource for the editor: structured frontmatter `data` (for the metadata boxes), `body`
// (Markdown), the path, and any frontmatter `errors`.
export async function getResource(root, idOrPath) {
  const resources = await inventoryResources(root);
  const r = resources.find((x) => x.id === idOrPath || x.path === idOrPath);
  if (!r) throw new ApiError(`resource not found: ${idOrPath}`, "NOT_FOUND");
  const parsed = parseFrontmatter(r.content);
  return { id: r.id, type: r.type, path: r.path, data: parsed.data, body: parsed.body, errors: parsed.errors };
}

// Editor save, step 1: structured metadata + body → a composed document (serializer enforces the
// strict subset, throwing FrontmatterSerializeError if a field is not representable) → a staged
// change (a diff; nothing written yet).
export async function proposeEdit(root, { path: target, data, body }) {
  if (!target) throw new ApiError("proposeEdit requires `path`", "BAD_REQUEST");
  const content = composeMarkdown(data ?? {}, body ?? "");
  const minimal = await preserveUntouchedFrontmatter(root, target, data ?? {}, body ?? "", content);
  const result = await proposeChange(root, target, minimal);
  return { changeId: result.change_id, target: result.target, exists: result.exists, diff: result.diff };
}

// The diff must show exactly what changed, nothing else. Re-serializing UNCHANGED metadata can
// still rewrite every frontmatter line (quoting, spacing) on hand-formatted files — so when the
// proposed data deep-equals the current data, the original frontmatter bytes are kept verbatim.
async function preserveUntouchedFrontmatter(root, target, data, body, composed) {
  let original;
  try {
    original = await readFile(await confineToRoot(path.resolve(root), target), "utf8");
  } catch {
    return composed; // new file: nothing to preserve
  }
  const parsed = parseFrontmatter(original);
  if (JSON.stringify(parsed.data) !== JSON.stringify(data)) return composed;
  const fmEnd = original.indexOf("\n---\n");
  if (!original.startsWith("---\n") || fmEnd === -1) return composed;
  return original.slice(0, fmEnd + "\n---\n".length) + body;
}

// Same gate, raw-content door: the partial-application flow rebuilds the WHOLE document text
// from the diff the user filtered — re-splitting it into data/body here would only lose
// information. One write path either way: proposeChange stages, commitEdit applies.
export async function proposeContent(root, { path: target, content }) {
  if (!target) throw new ApiError("proposeContent requires `path`", "BAD_REQUEST");
  if (typeof content !== "string") throw new ApiError("proposeContent requires `content`", "BAD_REQUEST");
  const result = await proposeChange(root, target, content);
  return { changeId: result.change_id, target: result.target, exists: result.exists, diff: result.diff };
}

// Editor save, step 2: apply a staged change after the human confirmed the diff.
export async function commitEdit(root, changeId) {
  if (!changeId) throw new ApiError("commitEdit requires a changeId", "BAD_REQUEST");
  const result = await commitChange(root, changeId, { confirmed: true });
  return { written: result.written, target: result.target };
}

// ---------------------------------------------------------------------------
// Context: single root vs workspace (multi-root), resolved ONCE at server start.
//
// Studio is started on a directory. If that directory holds a base.workspace.json, Studio serves
// every root of the workspace (VS Code multi-root pattern); otherwise the directory IS the
// root. Reuses resolveBaseContext/selectWorkspaceRoot from tools/core/roots.mjs — no workspace
// logic is duplicated here.

/**
 * Resolve the Studio serving context for a directory.
 * → { mode: "root", rootPath, settingsDir }
 * → { mode: "workspace", workspace, roots: [{ id, label, type, default, path }], defaultRootId, settingsDir }
 * `settingsDir` hosts `.ai/studio.settings.json`: the root itself, or the workspace's directory.
 */
export async function resolveStudioContext(rootArg) {
  const dir = path.resolve(rootArg);
  const workspaceFile = path.join(dir, WORKSPACE_FILENAME);
  if (await pathExists(workspaceFile)) {
    const resolved = await resolveBaseContext({ cwd: dir, explicitWorkspace: workspaceFile, allowWorkspaceRouting: true });
    const defaultRoot = selectWorkspaceRoot(resolved.workspace);
    return {
      mode: "workspace",
      workspace: resolved.workspace,
      roots: resolved.workspace.roots,
      defaultRootId: defaultRoot.id,
      settingsDir: path.dirname(resolved.workspace.path),
    };
  }
  // Not a BASE yet → the Welcome screen takes over: it shows exactly which files `init` would
  // create and offers to create them. A collection (sibling roots without a workspace file) is
  // ALSO welcome: the right move is to create the workspace file, not to pick one root.
  const detection = await detectPerimeter(dir);
  if (detection.type !== "root") {
    return { mode: "welcome", dirPath: dir, detection, settingsDir: dir };
  }
  return { mode: "root", rootPath: dir, settingsDir: dir };
}

// Render an absolute path for display without leaking the user's home directory (and username):
// a path under $HOME becomes "~/…". Display only; functional paths stay absolute. Nothing the
// Studio shows should reveal a specific contributor's machine.
export function tildify(p) {
  if (typeof p !== "string" || !p) return p;
  const home = os.homedir();
  return p === home || p.startsWith(home + path.sep) ? "~" + p.slice(home.length) : p;
}

// The JSON the UI receives from GET /api/context. Paths stay server-side: the browser only ever
// names roots by id. The one path shown (the perimeter badge) is tildified so it never reveals
// a contributor's home directory.
export function contextPayload(context) {
  if (context.mode === "welcome") {
    const plan = buildInitPlan(context.detection, { dirName: path.basename(context.dirPath), now: new Date().toISOString(), frameworkDir: FRAMEWORK_DIR });
    return { mode: "welcome", label: path.basename(context.dirPath), path: tildify(context.dirPath), detection: context.detection, plan };
  }
  if (context.mode === "root") {
    // label + path feed the perimeter badge: the user must always know WHERE they are.
    return { mode: "root", label: path.basename(context.rootPath), path: tildify(context.rootPath) };
  }
  return {
    mode: "workspace",
    workspace: { id: context.workspace.id, label: context.workspace.label, path: tildify(context.workspace.path) },
    // Each root's path is exposed RELATIVE to the workspace dir (the editor needs it to round-trip);
    // an absolute server path never leaves the server.
    roots: context.roots.map((r) => ({
      id: r.id,
      label: r.label,
      type: r.type,
      default: r.id === context.defaultRootId,
      path: path.relative(path.dirname(context.workspace.path), r.path),
    })),
  };
}

/**
 * Bootstrap the served directory: recompute the plan SERVER-SIDE (the browser sends no content,
 * ever — anything else would be an arbitrary-write endpoint) and apply it, creation-only.
 */
export async function initPerimeter(context) {
  if (context.mode !== "welcome") throw new ApiError("already a BASE: nothing to initialize", "CONFLICT");
  const plan = buildInitPlan(context.detection, { dirName: path.basename(context.dirPath), now: new Date().toISOString(), frameworkDir: FRAMEWORK_DIR });
  if (plan.length === 0) throw new ApiError("nothing to initialize", "CONFLICT");
  return applyInitPlan(context.dirPath, plan);
}

/**
 * Resolve a request's `root` id to a filesystem root path.
 * Single-root mode: `rootId` must be absent (any id is unknown → BAD_REQUEST).
 * Workspace mode: absent → default root; unknown id → BAD_REQUEST.
 */
export function rootPathFor(context, rootId = "") {
  if (context.mode === "root") {
    if (rootId) throw new ApiError(`unknown root id: ${rootId}`, "BAD_REQUEST");
    return context.rootPath;
  }
  const id = rootId || context.defaultRootId;
  const root = context.roots.find((r) => r.id === id);
  if (!root) throw new ApiError(`unknown root id: ${rootId}`, "BAD_REQUEST");
  return root.path;
}

// ---------------------------------------------------------------------------
// Tree: the truth of the disk, confined to one root.

/**
 * Disk tree of a root: { name, path, dirs: [Tree], files: [{ name, path, resource }] }.
 * The walk itself (ignore rules, no symlinks, root-relative POSIX paths) is the shared
 * tools/core/fswalk.mjs walker; this endpoint only ANNOTATES resource files with
 * { type, id, hasErrors } from one inventory pass (non-resources carry resource: null).
 */
export async function tree(root) {
  const resources = await inventoryResources(root);
  const byPath = new Map(resources.map((r) => [r.path, r]));
  const annotate = (node) => ({
    name: node.name,
    path: node.path,
    dirs: node.dirs.filter((d) => !STUDIO_HIDDEN.has(d.path)).map(annotate),
    files: node.files.map((f) => {
      const r = byPath.get(f.path);
      return { ...f, resource: r ? { type: r.type, id: r.id, hasErrors: (r.frontmatter_errors?.length ?? 0) > 0 } : null };
    }),
  });
  return annotate(await walkTree(root));
}

// ---------------------------------------------------------------------------
// Read-only file view for non-resources visible in the tree (a non-resource opens read-only).

const MAX_FILE_BYTES = 256 * 1024;

/**
 * Read a file inside the root, for display only. Refuses: paths escaping the root (confineToRoot),
 * directories, files over 256 KB, and binary content (NUL byte). → { path, name, size, content }.
 */
export async function readFileContent(root, relPath) {
  if (!relPath) throw new ApiError("file requires `path`", "BAD_REQUEST");
  let abs;
  try {
    abs = await confineToRoot(root, relPath);
  } catch (error) {
    throw new ApiError(error.message, "BAD_REQUEST");
  }
  let info;
  try {
    info = await stat(abs);
  } catch {
    throw new ApiError(`file not found: ${relPath}`, "NOT_FOUND");
  }
  if (info.isDirectory()) throw new ApiError(`not a file: ${relPath}`, "BAD_REQUEST");
  if (info.size > MAX_FILE_BYTES) throw new ApiError(`file too large (${info.size} bytes, max ${MAX_FILE_BYTES})`, "BAD_REQUEST");
  const buffer = await readFile(abs);
  if (buffer.includes(0)) throw new ApiError(`binary file: ${relPath}`, "BAD_REQUEST");
  return { path: relPath, name: path.posix.basename(relPath), size: info.size, content: buffer.toString("utf8") };
}
