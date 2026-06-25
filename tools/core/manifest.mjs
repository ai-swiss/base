// The manifest concern: projecting the inventory into the on-disk `base.manifest.json`, plus the
// freshness gate that proves the committed file still matches. The deterministic projection is the
// whole point — no timestamp, sorted by inventory — so a rebuild is byte-identical and CI can diff it
// (FR-CORE-009). The two orchestration dependencies that live in the facade (inventoryResources,
// recordEvent) and the manifest filename are INJECTED, so this module has no edge back to base-core;
// the pure leaf (writeFileAtomic) is imported directly. base-core binds them via createManifest() and
// re-exports the returned functions with byte-identical signatures.
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { writeFileAtomic } from "./atomic.mjs";

async function deriveRootName(root) {
  try {
    const packageJson = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
    if (typeof packageJson.name === "string" && packageJson.name.includes("/")) {
      return packageJson.name.split("/").pop();
    }
    if (typeof packageJson.name === "string" && packageJson.name.trim()) {
      return packageJson.name.trim();
    }
  } catch {
    // Fall back to the directory name below.
  }
  const folder = path.basename(root);
  return folder.startsWith("base-") ? "base" : folder;
}

// The single source of truth for a manifest's on-disk bytes, so the writer and the freshness check
// can never disagree on what "fresh" means.
function serializeManifest(manifest) {
  return JSON.stringify(manifest, null, 2) + "\n";
}

/**
 * @typedef {object} ManifestDeps
 * @property {(rootDir: string, options?: { egress?: any }) => Promise<any[]>} inventoryResources
 * @property {(rootDir: string, event: any) => Promise<any>} recordEvent
 * @property {string} manifestFilename
 */

/**
 * Build the manifest functions over injected orchestration dependencies.
 * @param {ManifestDeps} deps
 */
export function createManifest({ inventoryResources, recordEvent, manifestFilename }) {
  async function buildManifest(rootDir) {
    const root = path.resolve(rootDir);
    const resources = await inventoryResources(root);
    return {
      schema_version: "base.manifest.v1",
      root_name: await deriveRootName(root),
      resources: resources.map((resource) => ({
        id: resource.id,
        type: resource.type,
        title: resource.title,
        description: resource.description,
        path: resource.path,
        scope: resource.scope,
        status: resource.status,
        sensitivity: resource.sensitivity,
        keywords: resource.keywords,
        requires: resource.requires,
        may_use: resource.may_use,
        source: resource.source,
        execution: resource.execution,
        license: resource.license,
        compatibility: resource.compatibility,
      })),
    };
  }

  // Freshness gate (fast, no write, no network): does the committed manifest equal what `index` would
  // produce right now? Returns { fresh, exists } so the CLI can fail `check` on drift with a clear
  // "run npm run index" message, instead of a stale manifest passing silently. A missing file is never
  // fresh.
  async function checkManifestFresh(rootDir) {
    const outputPath = path.join(path.resolve(rootDir), manifestFilename);
    const expected = serializeManifest(await buildManifest(rootDir));
    const actual = await fs.readFile(outputPath, "utf8").catch(() => null);
    return { fresh: actual === expected, exists: actual !== null };
  }

  async function writeManifest(rootDir) {
    const start = Date.now();
    const manifest = await buildManifest(rootDir);
    const outputPath = path.join(path.resolve(rootDir), manifestFilename);
    await writeFileAtomic(outputPath, serializeManifest(manifest));
    await recordEvent(rootDir, {
      op: "index",
      action: "write",
      path: manifestFilename,
      decision: "allow",
      status: "ok",
      duration_ms: Date.now() - start,
    });
    return { manifest, outputPath };
  }

  return { buildManifest, checkManifestFresh, writeManifest };
}
