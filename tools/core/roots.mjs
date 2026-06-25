import * as fs from "node:fs/promises";
import * as path from "node:path";

export const WORKSPACE_FILENAME = "base.workspace.json";

const ROOT_MARKERS = [".ai", "base.manifest.json"];

export async function resolveBaseContext({
  cwd = process.cwd(),
  explicitRoot = "",
  explicitWorkspace = "",
  rootId = "",
  allowWorkspaceRouting = false,
} = {}) {
  const start = path.resolve(cwd);

  if (explicitRoot) {
    const rootPath = path.resolve(start, explicitRoot);
    return rootContext({ rootPath, source: "explicit" });
  }

  if (explicitWorkspace) return await workspaceContext(start, explicitWorkspace, rootId, allowWorkspaceRouting, "explicit-workspace");

  const nearestRoot = await findNearestBaseRoot(start);
  if (nearestRoot) return rootContext({ rootPath: nearestRoot, source: "nearest-root" });

  const nearestWorkspace = await findNearestWorkspace(start);
  if (nearestWorkspace) return await workspaceContext(start, nearestWorkspace, rootId, allowWorkspaceRouting, "nearest-workspace");

  throw new Error(noBaseContextMessage(start));
}

async function workspaceContext(start, workspaceInput, rootId, allowWorkspaceRouting, source) {
  const workspacePath = source === "explicit-workspace"
    ? await resolveWorkspacePath(start, workspaceInput)
    : workspaceInput;
  const workspace = await readWorkspace(workspacePath);
  if (allowWorkspaceRouting && !rootId) {
    return {
      mode: "workspace",
      source,
      workspace,
      roots: workspace.roots,
      routeAcrossRoots: true,
    };
  }
  const root = selectWorkspaceRoot(workspace, rootId);
  return {
    mode: "workspace-root",
    source,
    workspace,
    root,
    rootPath: root.path,
    routeAcrossRoots: false,
  };
}

export function contextScope(context, cwd = process.cwd()) {
  if (context.mode === "root") {
    return {
      mode: "root",
      source: context.source,
      root: {
        path: context.rootPath,
        display_path: displayPath(context.rootPath, cwd),
      },
    };
  }

  if (context.mode === "workspace-root") {
    return {
      mode: "workspace",
      source: context.source,
      workspace: workspaceScope(context.workspace, cwd),
      root: rootScope(context.root, cwd),
    };
  }

  return {
    mode: "workspace",
    source: context.source,
    workspace: workspaceScope(context.workspace, cwd),
    roots: context.roots.map((root) => rootScope(root, cwd)),
  };
}

export function formatContextHeader(context, cwd = process.cwd()) {
  if (context.mode === "root") {
    return `BASE root: ${displayPath(context.rootPath, cwd)}`;
  }

  const label = context.workspace.label || context.workspace.id;
  const lines = [`BASE workspace: ${label}`];
  if (context.mode === "workspace-root") {
    lines.push(`BASE root: ${context.root.id} (${displayPath(context.root.path, cwd)})`);
  } else {
    lines.push(`Routing across: ${context.roots.map((root) => root.id).join(", ")}`);
  }
  return lines.join("\n");
}

export async function findNearestBaseRoot(startDir) {
  return findNearest(startDir, async (dir) => {
    for (const marker of ROOT_MARKERS) {
      if (await exists(path.join(dir, marker))) return true;
    }
    return false;
  });
}

export async function findNearestWorkspace(startDir) {
  return findNearest(startDir, async (dir) => {
    const candidate = path.join(dir, WORKSPACE_FILENAME);
    return await exists(candidate) ? candidate : false;
  });
}

export async function readWorkspace(workspacePath) {
  const fullPath = path.resolve(workspacePath);
  let raw;
  try {
    raw = await fs.readFile(fullPath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") throw new Error(`${WORKSPACE_FILENAME} not found at: ${fullPath}`);
    throw error;
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    throw new Error(`${WORKSPACE_FILENAME} is not valid JSON (${fullPath}): ${String(error?.message ?? error)}`);
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(`${WORKSPACE_FILENAME} must contain a JSON object.`);
  }
  if (!Array.isArray(data.roots) || data.roots.length === 0) {
    throw new Error(`${WORKSPACE_FILENAME} must define a non-empty roots array.`);
  }

  const baseDir = path.dirname(fullPath);
  const ids = new Set();
  // Declaration order is preserved: the implicit default (selectWorkspaceRoot) is the FIRST declared
  // root, which is the least surprising choice for an operator. Order is deterministic (it is the file).
  const roots = data.roots.map((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(`Workspace root #${index + 1} must be an object.`);
    }
    if (typeof entry.id !== "string" || !entry.id.trim()) {
      throw new Error(`Workspace root #${index + 1} must define an id.`);
    }
    const id = entry.id.trim();
    if (ids.has(id)) throw new Error(`Duplicate workspace root id: ${id}`);
    ids.add(id);
    if (typeof entry.path !== "string" || !entry.path.trim()) {
      throw new Error(`Workspace root ${id} must define a path.`);
    }
    return {
      id,
      label: typeof entry.label === "string" ? entry.label : id,
      type: typeof entry.type === "string" ? entry.type : "project",
      default: entry.default === true,
      // Egress policy of this root: "local-only" keeps every resource away from remote models.
      egress: entry.egress === "local-only" ? "local-only" : "any",
      path: path.resolve(baseDir, entry.path.trim()),
    };
  });

  return {
    schema_version: data.schema_version ?? "base.workspace.v1",
    id: typeof data.id === "string" ? data.id : path.basename(baseDir),
    label: typeof data.label === "string" ? data.label : typeof data.name === "string" ? data.name : typeof data.id === "string" ? data.id : path.basename(baseDir),
    path: fullPath,
    roots,
  };
}

/**
 * Write a workspace manifest back to disk, the inverse of readWorkspace. Paths are stored
 * RELATIVE to the manifest's directory (readWorkspace resolves them to absolute on the way in);
 * the optional fields (type, default, egress) are written only when they carry meaning, so the
 * file stays minimal. Returns the serialized object.
 */
export async function writeWorkspace(workspacePath, ws) {
  const fullPath = path.resolve(workspacePath);
  const baseDir = path.dirname(fullPath);
  if (!Array.isArray(ws.roots) || ws.roots.length === 0) {
    throw new Error(`${WORKSPACE_FILENAME} must define a non-empty roots array.`);
  }
  const data = {
    schema_version: ws.schema_version ?? "base.workspace.v1",
    id: ws.id,
    label: ws.label ?? ws.id,
    roots: ws.roots.map((r) => {
      const entry = { id: r.id, label: r.label ?? r.id, path: path.relative(baseDir, r.path) || "." };
      if (r.type && r.type !== "project") entry.type = r.type;
      if (r.default) entry.default = true;
      if (r.egress === "local-only") entry.egress = "local-only";
      return entry;
    }),
  };
  await fs.writeFile(fullPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  return data;
}

export function selectWorkspaceRoot(workspace, rootId = "") {
  if (rootId) {
    const selected = workspace.roots.find((root) => root.id === rootId);
    if (!selected) {
      throw new Error(`Unknown workspace root "${rootId}". Available roots: ${workspace.roots.map((root) => root.id).join(", ")}`);
    }
    return selected;
  }

  const defaults = workspace.roots.filter((root) => root.default);
  if (defaults.length > 1) {
    throw new Error(`Workspace has multiple default roots: ${defaults.map((root) => root.id).join(", ")}`);
  }
  return defaults[0] ?? workspace.roots[0];
}

function rootContext({ rootPath, source }) {
  return {
    mode: "root",
    source,
    rootPath: path.resolve(rootPath),
    routeAcrossRoots: false,
  };
}

async function resolveWorkspacePath(cwd, input) {
  const candidate = path.resolve(cwd, input);
  try {
    const stat = await fs.stat(candidate);
    return stat.isDirectory() ? path.join(candidate, WORKSPACE_FILENAME) : candidate;
  } catch {
    return candidate.endsWith(WORKSPACE_FILENAME) ? candidate : path.join(candidate, WORKSPACE_FILENAME);
  }
}

async function findNearest(startDir, predicate) {
  let current = path.resolve(startDir);
  while (true) {
    const result = await predicate(current);
    if (result) return result === true ? current : result;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

function workspaceScope(workspace, cwd) {
  return {
    id: workspace.id,
    label: workspace.label,
    path: workspace.path,
    display_path: displayPath(workspace.path, cwd),
  };
}

function rootScope(root, cwd) {
  return {
    id: root.id,
    label: root.label,
    type: root.type,
    path: root.path,
    display_path: displayPath(root.path, cwd),
  };
}

function displayPath(target, cwd) {
  const relative = path.relative(path.resolve(cwd), target).split(path.sep).join("/");
  if (!relative) return ".";
  return relative.startsWith("..") ? target : relative;
}

function noBaseContextMessage(start) {
  return [
    `No BASE root or workspace found from: ${start}`,
    "",
    "Try:",
    "  base validate --root /path/to/project",
    `  base validate --workspace /path/to/${WORKSPACE_FILENAME}`,
    "  cd /path/to/project",
  ].join("\n");
}
