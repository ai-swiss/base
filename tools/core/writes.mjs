// The mediated-write flow: propose -> commit, plus promote (a scoped re-propose). This is the
// heart of the propose/commit gate — nothing reaches disk without a recorded decision and a
// content-addressed change record. The pure leaves (confine, hashing, atomic, diff, frontmatter)
// are imported directly; the three orchestration dependencies that live in the facade (decide,
// recordEvent, inventoryResources) and the CHANGES_DIR constant are INJECTED, so this module has
// no edge back to base-core. base-core binds them via createBrokerWrites() and re-exports the
// returned functions with byte-identical signatures — which is what the MCP broker bundle imports.
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { confineToRoot, pathExists } from "./confine.mjs";
import { parseFrontmatter } from "./frontmatter.mjs";
import { SCHEMA_VERSION, SCHEMA_SCOPES } from "./schema.mjs";
import { hashArgs, hashContent } from "./hashing.mjs";
import { renderDiff } from "./diff.mjs";
import { upsertFrontmatterFields } from "./frontmatter-edit.mjs";
import { writeFileAtomic } from "./atomic.mjs";
import { checkEgress, egressNotice } from "./egress.mjs";

/** @typedef {{ purpose?: string, confirmed?: boolean, grantToken?: string, config?: any, egress?: { modelLocality: "local" | "remote", rootPolicy?: "local-only" | "any" } }} BrokerOptions */

/**
 * @typedef {object} WriteDeps
 * @property {(rootDir: string, resource: any, action: string, context: any, config?: any) => Promise<{decision: string, reason: string}>} decide
 * @property {(rootDir: string, event: any) => Promise<any>} recordEvent
 * @property {(rootDir: string, options?: { egress?: any }) => Promise<any[]>} inventoryResources
 * @property {string} changesDir
 */

function resolveWriteContext(targetContent, exists) {
  const meta = exists ? parseFrontmatter(targetContent).data : {};
  return {
    sensitivity: meta.sensitivity ?? "internal",
    requires_confirmation: meta.requires_confirmation,
  };
}

/**
 * Build the mediated-write functions over injected orchestration dependencies.
 * @param {WriteDeps} deps
 */
export function createBrokerWrites({ decide, recordEvent, inventoryResources, changesDir }) {
  /**
   * @param {string} rootDir
   * @param {string} target
   * @param {string} content
   * @param {BrokerOptions} [options]
   */
  async function proposeChange(rootDir, target, content, { purpose = "", confirmed = false, grantToken, config, egress } = {}) {
    const start = Date.now();
    const root = path.resolve(rootDir);
    await confineToRoot(root, target); // validate containment; throws if the path escapes the root
    const fullPath = path.resolve(root, target);
    const relativeTarget = path.relative(root, fullPath).split(path.sep).join("/");
    const exists = await pathExists(fullPath);
    const current = exists ? await fs.readFile(fullPath, "utf8") : "";
    const writeContext = resolveWriteContext(current, exists);
    // Thread a pre-resolved config when callers have one (CLI/MCP resolve once per op);
    // otherwise decide() resolves it from root. Additive, NFR-CORE-002 safe.
    const decision = await decide(rootDir, writeContext, "write", { confirmed, grantToken }, config);
    if (decision.decision === "deny") {
      await recordEvent(root, {
        op: "propose",
        action: "write",
        path: relativeTarget,
        decision: decision.decision,
        status: "error",
        duration_ms: Date.now() - start,
        args_hash: hashArgs([relativeTarget]),
        error: decision.reason,
      });
      throw new Error(`Write denied: ${decision.reason}`);
    }

    // Content-addressed, but scoped to the base state too: two proposals for the same
    // target+content against different base states get distinct ids (so a pending change
    // is not silently overwritten). The commit TOCTOU guard still re-checks base_hash.
    const baseHash = exists ? hashContent(current) : null;
    const changeId = `chg_${hashContent(relativeTarget + "\n" + (baseHash ?? "") + "\n" + content).slice(7, 19)}`;
    const record = {
      change_id: changeId,
      target: relativeTarget,
      created_at: new Date().toISOString(),
      purpose: purpose || null,
      exists,
      base_hash: baseHash,
      sensitivity: writeContext.sensitivity,
      requires_confirmation: writeContext.requires_confirmation ?? null,
      content,
    };

    const changesDirAbs = path.join(root, changesDir);
    await fs.mkdir(changesDirAbs, { recursive: true });
    await writeFileAtomic(path.join(changesDirAbs, `${changeId}.json`), JSON.stringify(record, null, 2) + "\n");

    await recordEvent(root, {
      op: "propose",
      action: "write",
      path: relativeTarget,
      decision: decision.decision,
      status: "ok",
      duration_ms: Date.now() - start,
      args_hash: hashArgs([relativeTarget]),
    });

    // Egress on the DIFF: a diff against a confidential / local-only target embeds the CURRENT
    // (confidential) content. When a remote caller (eval SUT, MCP read-write client) proposes a
    // change, withhold the diff so the current content does not leak; the change is still staged.
    let diff = renderDiff(current, content);
    if (egress && exists) {
      const meta = parseFrontmatter(current).data;
      const verdict = checkEgress({
        modelLocality: egress.modelLocality,
        rootPolicy: egress.rootPolicy,
        resources: [{ path: relativeTarget, confidential: meta.confidential, metadata: meta }],
      });
      if (verdict.withheld.length) diff = egressNotice(verdict.withheld);
    }

    return {
      change_id: changeId,
      target: relativeTarget,
      exists,
      decision,
      diff,
    };
  }

  /**
   * @param {string} rootDir
   * @param {string} changeId
   * @param {BrokerOptions} [options]
   */
  async function commitChange(rootDir, changeId, { confirmed = false, grantToken, config } = {}) {
    const start = Date.now();
    const root = path.resolve(rootDir);
    if (!/^chg_[a-z0-9]+$/.test(changeId)) throw new Error(`Invalid change id: ${changeId}`);
    const recordPath = path.join(root, changesDir, `${changeId}.json`);
    if (!(await pathExists(recordPath))) throw new Error(`Change not found: ${changeId}`);
    const record = JSON.parse(await fs.readFile(recordPath, "utf8"));

    await confineToRoot(root, record.target); // validate containment
    const fullPath = path.resolve(root, record.target);
    const decision = await decide(
      rootDir,
      { sensitivity: record.sensitivity, requires_confirmation: record.requires_confirmation ?? undefined },
      "write",
      { confirmed, grantToken },
      config,
    );

    const fail = async (message, status = "error") => {
      await recordEvent(root, {
        op: "commit",
        action: "write",
        path: record.target,
        decision: decision.decision,
        status,
        duration_ms: Date.now() - start,
        args_hash: hashArgs([changeId]),
        error: message,
      });
      throw new Error(message);
    };

    if (decision.decision === "deny") return fail(`Write denied: ${decision.reason}`);
    if (decision.decision === "needs_approval" && !confirmed) {
      return fail("Write requires explicit confirmation (--confirmed).");
    }

    const existsNow = await pathExists(fullPath);
    const currentHash = existsNow ? hashContent(await fs.readFile(fullPath, "utf8")) : null;
    if (currentHash !== record.base_hash) {
      return fail("Target changed since the change was proposed; re-propose to refresh the diff.");
    }

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await writeFileAtomic(fullPath, record.content);
    const writtenHash = hashContent(await fs.readFile(fullPath, "utf8"));
    if (writtenHash !== hashContent(record.content)) return fail("Write verification failed.");

    await fs.rm(recordPath, { force: true });
    await recordEvent(root, {
      op: "commit",
      action: "write",
      path: record.target,
      decision: decision.decision,
      status: "ok",
      duration_ms: Date.now() - start,
      args_hash: hashArgs([changeId]),
    });

    return { written: true, target: record.target, decision };
  }

  /**
   * @param {string} rootDir
   * @param {string} idOrPath
   * @param {string} toScope
   * @param {BrokerOptions} [options]
   */
  async function promoteResource(rootDir, idOrPath, toScope, { purpose = "", confirmed = false, grantToken, egress } = {}) {
    const root = path.resolve(rootDir);
    if (!SCHEMA_SCOPES.has(toScope)) {
      throw new Error(`Invalid target scope: ${toScope}. Use one of ${[...SCHEMA_SCOPES].join(", ")}.`);
    }
    // Egress on the lookup: a confidential / local-only resource is invisible to a remote caller, so
    // promote it like any not-found id — never revealing its id/path/scope (the diff is gated too).
    const resources = await inventoryResources(root, { egress });
    const resource = resources.find((item) => item.id === idOrPath || item.path === idOrPath);
    if (!resource) throw new Error(`Resource not found: ${idOrPath}`);

    const fromScope = resource.metadata.scope || "personal";
    if (fromScope === toScope) throw new Error(`Resource "${resource.id}" already has scope=${toScope}.`);

    const today = new Date().toISOString().slice(0, 10);
    const force = { scope: toScope, promoted_from: fromScope, promoted_at: today };
    const ensure = {
      schema_version: SCHEMA_VERSION,
      id: resource.id,
      type: resource.type,
      title: resource.title,
      description: resource.description,
      status: resource.status || "active",
      sensitivity: resource.sensitivity || "internal",
    };

    const newContent = upsertFrontmatterFields(resource.content, force, ensure);
    const proposal = await proposeChange(root, resource.path, newContent, {
      purpose: purpose || `promote ${resource.id}: ${fromScope} -> ${toScope}`,
      confirmed,
      grantToken,
      egress,
    });
    return { ...proposal, id: resource.id, from: fromScope, to: toScope };
  }

  return { proposeChange, commitChange, promoteResource };
}
