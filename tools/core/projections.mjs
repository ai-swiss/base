// tools/core/projections.mjs — what BASE WRITES from what a root already holds: the harness entry
// points, the tool matrix, the agent catalogue and the routing index. One table, target → renderer,
// so adding a projection is adding a row rather than a branch in the facade.
//
// Two rules live here and nowhere else. WHICH entry points a root receives is the root's own answer
// (`tools` in base.config.json, else what is already on disk, else the tool-agnostic one), so a build
// never adds the file of a tool nobody chose. And a planned file that exists WITHOUT the provenance
// banner is hand-owned: it is kept, never overwritten, and named in the result.
//
// Pure over injected dependencies (the route-broker pattern): the facade binds the real inventory,
// config, renderers and recorder, and re-exports `buildArtifacts` / `writeArtifacts` unchanged.

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { confineToRoot, pathExists } from "./confine.mjs";
import { writeFileAtomic } from "./atomic.mjs";
import { isGeneratedProjection } from "./runtime-artifacts.mjs";
import { TOOL_ENTRY_POINTS, DEFAULT_TOOL } from "./perimeter.mjs";
import { renderAgentsMd, renderBootstrapMd, renderToolMatrix, renderClaudeMd, renderCursorRule } from "./bootstrap.mjs";
import { renderRoutingIndex } from "./index-md.mjs";
import { buildRoutingRegistry } from "./routing.mjs";
import { resolveFrameworkRoot } from "./framework-root.mjs";

/**
 * @param {{
 *   inventoryResources: (root: string, opts?: any) => Promise<any[]>,
 *   resolveConfig: (root: string) => Promise<any>,
 *   recordEvent: (root: string, event: any) => Promise<void>,
 * }} deps
 */
export function createProjections({ inventoryResources, resolveConfig, recordEvent }) {
  // `build all` expands to the always-on projections; opt-in targets are absent from it (see PROJECTIONS).
  const DEFAULT_BUILD = ["agents-md", "tools", "bootstrap"];

  // Build projections, one table instead of a per-target if-chain (the orchestration ratchet's "extract
  // the projections"): target → (resources, root) => [{ path, content }] (sync or async). The opt-in target
  // routing-index is absent from DEFAULT_BUILD, so `build all` keeps every project's tree minimal — the
  // Router derives candidates in memory for small projects; the on-disk face is a scale optimisation
  // behind the same model, not a file every project carries.
  const PROJECTIONS = {
    "agents-md": async (resources, root) => ((await entryPointsOf(root)).has("AGENTS.md") ? [{ path: "AGENTS.md", content: renderAgentsMd(resources, await languageOf(root)) }] : []),
    tools: async (_resources, root) => [{ path: ".ai/tools.md", content: renderToolMatrix(await languageOf(root)) }],
    // One canonical router body (core/bootstrap.mjs) projected into the entry point(s) THIS root uses,
    // so they cannot drift — and so a build never puts back the file of a tool nobody chose.
    bootstrap: async (_resources, root) => {
      const wanted = await entryPointsOf(root);
      const lang = await languageOf(root);
      return [
        { path: "CLAUDE.md", content: renderClaudeMd(lang) },
        { path: "BASE_BOOTSTRAP.md", content: renderBootstrapMd(lang) },
        { path: ".cursor/rules/assistant.mdc", content: renderCursorRule(lang) },
      ].filter((artifact) => wanted.has(artifact.path));
    },
    // Agent-readable face of the registry (root + per-agent index.md), committed and CI-gated (routing.md).
    "routing-index": async (resources, root) => {
      const cfg = await resolveConfig(root);
      const deny = cfg.routing?.policy?.deny;
      // The help target rides ON the map: a reader who walks the index never calls the router, so the
      // fallback would otherwise exist only for `route` / `route_request` callers. Resolved through the
      // same two corpora as the router (this root, then the framework it belongs to), and a target in
      // the framework is linked by its absolute path, being outside this root.
      const fallback = await resolveIndexFallback(root, cfg, resources);
      return Object.entries(renderRoutingIndex(buildRoutingRegistry(resources), { rootDeny: Array.isArray(deny) ? deny : [], fallback, lang: cfg.language })).map(([path, content]) => ({ path, content }));
    },
  };

  /**
   * The language this root declares, for the renderers. Read from the root's own config like
   * `tools` is, so a build writes the same words `base init` wrote and a translated root does not
   * revert to French at its first `base build --write`. A root that declares nothing gets `fr`
   * (the config default), and a language this build has no table for renders French per key.
   * @param {string} root @returns {Promise<string>}
   */
  async function languageOf(root) {
    return (await resolveConfig(root)).language;
  }

  /** The configured help target as an index card, or null. Same two corpora as the router (FR-ROUTE-009). */
  async function resolveIndexFallback(root, cfg, resources) {
    const configured = cfg.routing?.fallback;
    if (!configured) return null;
    const inRoot = resources.find((r) => r.type === "process" && r.id === configured.process);
    if (inRoot) return { id: inRoot.id, path: inRoot.path, title: inRoot.title ?? null };
    const frameworkRoot = await resolveFrameworkRoot(root, cfg);
    if (!frameworkRoot) return null;
    const inFramework = (await inventoryResources(frameworkRoot)).find((r) => r.type === "process" && r.id === configured.process);
    return inFramework ? { id: inFramework.id, path: `${frameworkRoot}/${inFramework.path}`, title: inFramework.title ?? null } : null;
  }

  /**
   * Which harness entry points this root carries. The config's `tools` is the recorded answer to
   * `base init --tool`; absent, whatever is already on disk, because a build must never ADD the entry
   * point of a tool nobody chose (a root created before this key keeps exactly what it has). A root
   * with neither gets the tool-agnostic one, so it is never left unreadable by every tool.
   * @param {string} root @returns {Promise<Set<string>>}
   */
  async function entryPointsOf(root) {
    const declared = (await resolveConfig(root)).tools;
    if (Array.isArray(declared) && declared.length) {
      return new Set(declared.map((id) => TOOL_ENTRY_POINTS[id]?.path).filter(Boolean));
    }
    const present = new Set();
    for (const tool of Object.values(TOOL_ENTRY_POINTS)) {
      if (await pathExists(path.join(root, tool.path))) present.add(tool.path);
    }
    return present.size ? present : new Set([TOOL_ENTRY_POINTS[DEFAULT_TOOL].path]);
  }

  async function buildArtifacts(rootDir, { targets = ["all"] } = {}) {
    const root = path.resolve(rootDir);
    const resources = await inventoryResources(root);
    const want = targets.includes("all") ? DEFAULT_BUILD : targets;
    return (await Promise.all(want.map(async (t) => ((await PROJECTIONS[t]?.(resources, root)) ?? []).map((a) => ({ target: t, ...a }))))).flat();
  }

  /**
   * Write the planned artifacts, EXCEPT the ones a human took over. A file that exists without the
   * provenance banner is its author's: they removed the banner, or wrote the file themselves, and a
   * build must not silently replace their work. (A root that hand-wrote its router, safety rule
   * included, was one `build all` away from losing it.) The file is kept and named in the result, so
   * the CLI can say what it did not do and why; the banner is the one signal, so taking a file back
   * is `base build <target> --write` after deleting it. `kept` mirrors `written`: a list of paths,
   * one shape for a caller to render, since there is exactly one reason a planned file is not written.
   * @returns {Promise<{ written: string[], kept: string[] }>}
   */
  async function writeArtifacts(rootDir, artifacts) {
    const start = Date.now();
    const root = path.resolve(rootDir);
    const written = [];
    const kept = [];
    for (const artifact of artifacts) {
      const full = await confineToRoot(root, artifact.path);
      const existing = await fs.readFile(full, "utf8").catch(() => null);
      if (existing !== null && !isGeneratedProjection(existing)) {
        kept.push(artifact.path);
        continue;
      }
      await fs.mkdir(path.dirname(full), { recursive: true });
      await writeFileAtomic(full, artifact.content);
      written.push(artifact.path);
    }
    await recordEvent(root, {
      op: "build",
      action: "write",
      decision: "allow",
      status: "ok",
      duration_ms: Date.now() - start,
      metadata: { artifacts: written.length, kept: kept.length },
    });
    return { written, kept };
  }

  return { buildArtifacts, writeArtifacts, DEFAULT_BUILD };
}
