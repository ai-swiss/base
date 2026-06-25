// Spec coverage: FR-CORE-001 FR-CORE-002 FR-CORE-003 FR-CORE-004 FR-CORE-005 FR-CORE-006 FR-CORE-007 RC-CONFINE-001 RC-WRITE-001 RC-WRITE-002 RC-EXEC-001 RC-TRACE-001
// Spec coverage: FR-CORE-008 FR-CORE-009 FR-CORE-010 FR-MARKERS-001 FR-TRACE-001 FR-TRACE-002
// Spec coverage: FR-EGRESS-001 FR-EGRESS-003
// Spec coverage: FR-VALID-001 FR-VALID-002 FR-VALID-003 FR-VALID-004 FR-VALID-005
// Spec coverage: FR-CHANGE-001 FR-CHANGE-002 FR-CHANGE-003 FR-PROMOTE-001
// Spec coverage: FR-BUILD-001 FR-BUILD-002 FR-BUILD-003
// Spec coverage: NFR-CORE-007 NFR-CORE-008 NFR-CORE-009 UR-CORE-001
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  accessResource,
  buildArtifacts,
  checkManifestFresh,
  ROUTER_BODY,
  canAccessResource,
  commitChange,
  confineToRoot,
  writeArtifacts,
  createMaintenanceReport,
  inventoryResources,
  invokeTool,
  listMarkers,
  openResource,
  pathExists,
  promoteResource,
  proposeChange,
  routeRequest,
  searchResources,
  summarizeTrace,
  pruneTrace,
  strictPolicy,
  validateBase,
  writeManifest,
} from "../tools/base-core.mjs";

let tmpDir;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-core-test-"));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

async function write(relativePath, content) {
  const fullPath = path.join(tmpDir, relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, "utf8");
}

async function readProjectMarkdownFiles() {
  const root = path.resolve(".");
  const files = [];
  const skipped = new Set([".git", ".temp", "node_modules", "dist"]);

  async function visit(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (skipped.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await visit(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(fullPath);
      }
    }
  }

  await visit(root);
  return Promise.all(files.map(async (filePath) => ({
    path: path.relative(root, filePath),
    content: await fs.readFile(filePath, "utf8"),
  })));
}

describe("inventoryResources", () => {
  it("discovers markdown resources and derives stable defaults", async () => {
    await write("AGENT.md", "# Assistant test\n\nDescription.");
    await write(".ai/agents/test/skills/processes/nouveau-devis/SKILL.md", "# Nouveau devis\n\nWorkflow.");

    const resources = await inventoryResources(tmpDir);
    const agent = resources.find((resource) => resource.path === "AGENT.md");
    const process = resources.find((resource) => resource.path.endsWith("nouveau-devis/SKILL.md"));

    assert.equal(agent.type, "agent");
    assert.equal(agent.title, "Assistant test");
    assert.equal(process.type, "process");
  });

  it("surfaces optional license and compatibility metadata, with safe defaults", async () => {
    await write(
      "doc-public.md",
      [
        "---",
        "schema_version: base.resource.v1",
        "id: doc-public",
        "type: document",
        "title: Doc publique",
        "description: Contenu public.",
        "license: CC-BY-4.0",
        "compatibility: [navigateur, cli, mcp]",
        "---",
        "",
        "# Doc publique",
      ].join("\n"),
    );
    await write("AGENT.md", "# Sans metadonnees\n\nAucune licence declaree.");

    const resources = await inventoryResources(tmpDir);
    const doc = resources.find((resource) => resource.path === "doc-public.md");
    const agent = resources.find((resource) => resource.path === "AGENT.md");

    assert.equal(doc.license, "CC-BY-4.0");
    assert.deepEqual(doc.compatibility, ["navigateur", "cli", "mcp"]);
    // Absent fields default to null / [] (never undefined), so the manifest stays well-typed.
    assert.equal(agent.license, null);
    assert.deepEqual(agent.compatibility, []);
  });

  it("keeps the agent template out of public discovery", async () => {
    await write(".ai/agents/_template/AGENT.md", "# Template\n\nModele.");
    await write(".ai/agents/real/AGENT.md", "# Real\n\nDescription.");

    const resources = await inventoryResources(tmpDir);

    assert.equal(resources.some((resource) => resource.path.startsWith(".ai/agents/_template/")), false);
    assert.equal(resources.some((resource) => resource.path === ".ai/agents/real/AGENT.md"), true);
  });

  it("does not descend into a nested BASE root (a copied/generated BASE never pollutes inventory)", async () => {
    await write(".ai/agents/real/AGENT.md", "# Real\n\nDescription.");
    // A copied/generated BASE inside the tree (e.g. the Studio E2E run, or any tool artifact) carries
    // its own base.config.json. Its resources must NOT merge into this root's inventory — otherwise a
    // duplicate id would break validation, regardless of .gitignore.
    await write("tools/studio/ui/e2e/.run/base.config.json", "{}");
    await write("tools/studio/ui/e2e/.run/.ai/agents/real/AGENT.md", "# Copie\n\nNe doit pas apparaitre.");

    const resources = await inventoryResources(tmpDir);

    assert.equal(resources.filter((resource) => resource.path.endsWith("agents/real/AGENT.md")).length, 1, "the copied BASE must not add a second agent");
    assert.equal(resources.some((resource) => resource.path === ".ai/agents/real/AGENT.md"), true, "the real agent is still inventoried");
    assert.equal(resources.some((resource) => resource.path.includes("e2e/.run/")), false, "nothing from the nested BASE leaks in");
  });

  it("does not descend into a nested WORKSPACE root (the Studio E2E workspace copy never pollutes inventory)", async () => {
    await write(".ai/agents/real/AGENT.md", "# Real\n\nDescription.");
    // The Studio E2E workspace copy (`e2e/.run-ws/`) is keyed by base.workspace.json, not base.config.json:
    // its client sub-roots carry their own `.ai/routing/route-tests.json`, which the root-anchored `.ai/`
    // skips do NOT catch. The workspace boundary must stop the walk so those copies never leak in.
    await write("tools/studio/ui/e2e/.run-ws/base.workspace.json", "{}");
    await write("tools/studio/ui/e2e/.run-ws/clients/acme/.ai/agents/acme/AGENT.md", "# Copie\n\nNe doit pas apparaitre.");
    await write("tools/studio/ui/e2e/.run-ws/clients/acme/.ai/routing/route-tests.json", "[]");

    const resources = await inventoryResources(tmpDir);

    assert.equal(resources.some((resource) => resource.path.includes("e2e/.run-ws/")), false, "nothing from the nested workspace leaks in");
    assert.equal(resources.some((resource) => resource.path === ".ai/agents/real/AGENT.md"), true, "the real agent is still inventoried");
  });

  it("skips tool-output directories (coverage, playwright-report, …) anywhere in the tree", async () => {
    await write(".ai/agents/real/AGENT.md", "# Real\n\nDescription.");
    await write("tools/studio/ui/coverage/coverage-final.json", '{"a":1}');
    await write("tools/studio/ui/playwright-report/index.json", "{}");

    const resources = await inventoryResources(tmpDir);
    assert.equal(resources.some((resource) => resource.path.includes("coverage/") || resource.path.includes("playwright-report/")), false);
  });

  it("skips the generated docs site (.base-docs) so derived pages never become resources", async () => {
    await write(".ai/agents/real/AGENT.md", "# Real\n\nDescription.");
    await write(".base-docs/local/model.json", "{}");
    await write(".base-docs/public/page.md", "# Derived page\n");

    const resources = await inventoryResources(tmpDir);
    assert.equal(resources.some((resource) => resource.path.startsWith(".base-docs/")), false);
  });

  it("keeps the test tree out of the inventory (a fixture must never become routable)", async () => {
    await write(".ai/agents/real/AGENT.md", "# Real\n\nDescription.");
    // A golden eval set or a sample frontmatter file lives under tests/ and must never be a resource:
    // routing it would let a request "route to the eval golden set". Even a fixture that mimics real
    // frontmatter (schema_version + id + type) stays out, because the boundary is the tree, not the shape.
    await write("tests/fixtures/route-eval-golden.json", '{"schema":"base.route-eval.golden.v1","about":"labeled eval set"}');
    await write("tests/fixtures/looks-real.md", "---\nschema_version: base.resource.v1\nid: looks-real\ntype: process\ndescription: A fixture.\n---\n# Looks real\n");

    const resources = await inventoryResources(tmpDir);
    assert.equal(resources.some((resource) => resource.path.startsWith("tests/")), false, "nothing under tests/ is inventoried");
    assert.equal(resources.some((resource) => resource.path === ".ai/agents/real/AGENT.md"), true, "the real agent is still inventoried");
  });
});

describe("framework resource metadata contract", () => {
  it("every structured resource declares schema_version: base.resource.v1 (no legacy drift)", async () => {
    const STRUCTURED = new Set(["agent", "process", "competence", "template", "tool"]);
    const resources = (await inventoryResources(".")).filter((resource) => STRUCTURED.has(resource.type));
    assert.ok(resources.length > 10, "expected the framework's own structured resources to be discovered");
    const legacy = resources.filter((resource) => resource.schema_version !== "base.resource.v1");
    assert.deepEqual(legacy.map((resource) => resource.path), [], "these resources must migrate to base.resource.v1");
  });
});

describe("validateBase", () => {
  it("accepts a team resource with minimal BASE frontmatter", async () => {
    await write(
      "process.md",
      [
        "---",
        "schema_version: base.resource.v1",
        "id: nouveau-devis",
        "type: process",
        "title: Nouveau devis",
        "description: Creer un devis professionnel.",
        "scope: team",
        "status: active",
        "sensitivity: internal",
        "---",
        "",
        "# Nouveau devis",
      ].join("\n"),
    );

    const result = await validateBase(tmpDir);
    assert.equal(result.ok, true);
  });

  it("accepts v0 org metadata for governed resources", async () => {
    await write(
      "org/process.md",
      [
        "---",
        "schema_version: base.resource.v1",
        "id: org-devis",
        "type: process",
        "title: Devis organisation",
        "description: Process de devis partage a l'echelle organisation.",
        "scope: org",
        "version: 1.0.0",
        "status: active",
        "owner: sales",
        "sensitivity: sensitive",
        "---",
        "",
        "# Devis organisation",
      ].join("\n"),
    );

    const resources = await inventoryResources(tmpDir);
    const resource = resources.find((item) => item.id === "org-devis");

    assert.equal(resource.scope, "org");
    assert.equal(resource.metadata.owner, "sales");
    assert.equal(resource.metadata.version, "1.0.0");
    assert.equal(resource.sensitivity, "sensitive");
  });

  it("rejects duplicate IDs", async () => {
    await write("a.md", "---\nid: meme-id\ntype: process\ndescription: A\n---\n# A\n");
    await write("b.md", "---\nid: meme-id\ntype: process\ndescription: B\n---\n# B\n");

    const result = await validateBase(tmpDir);
    assert.equal(result.ok, false);
    assert.match(result.errors.map((error) => error.message).join("\n"), /ID duplique/);
  });

  it("checks relative links", async () => {
    await write("docs/a.md", "# A\n\nVoir [B](missing.md).\n");

    const result = await validateBase(tmpDir);
    assert.equal(result.ok, false);
    assert.match(result.errors.map((error) => error.message).join("\n"), /Lien relatif introuvable/);
  });

  it("checks tool entrypoints", async () => {
    await write(
      "tool.md",
      [
        "---",
        "schema_version: base.resource.v1",
        "id: calculer-devis",
        "type: tool",
        "description: Recalcule les montants.",
        "execution:",
        "  type: script",
        "  runtime: python",
        "  entrypoint: tools/calculer-devis.py",
        "---",
        "",
        "# Calculer devis",
      ].join("\n"),
    );

    const result = await validateBase(tmpDir);
    assert.equal(result.ok, false);
    assert.match(result.errors.map((error) => error.message).join("\n"), /Tool introuvable/);
  });

  it("validates schema enums and scalar types", async () => {
    await write(
      "bad-schema.md",
      [
        "---",
        "schema_version: base.resource.v1",
        "id: Bad_ID",
        "type: workflow",
        "description: Bad resource.",
        "scope: group",
        "status: live",
        "sensitivity: secret",
        "keywords: devis",
        "execution:",
        "  type: script",
        "  runtime: ruby",
        "  requires_confirmation: yes",
        "---",
        "",
        "# Bad",
      ].join("\n"),
    );

    const result = await validateBase(tmpDir);
    const messages = result.errors.map((error) => error.message).join("\n");

    assert.equal(result.ok, false);
    assert.match(messages, /id invalide/);
    assert.match(messages, /type invalide/);
    assert.match(messages, /scope invalide/);
    assert.match(messages, /status invalide/);
    assert.match(messages, /sensitivity invalide/);
    assert.match(messages, /keywords doit etre une liste/);
    assert.match(messages, /execution.runtime invalide/);
    assert.match(messages, /execution.requires_confirmation doit etre un booleen/);
  });

  it("parses structured requires lists and warns on missing refs", async () => {
    await write(
      "process.md",
      [
        "---",
        "schema_version: base.resource.v1",
        "id: nouveau-devis",
        "type: process",
        "description: Creer un devis.",
        "requires:",
        "  - ref: catalogue-services",
        "    access: read",
        "    purpose: quote_pricing",
        "  - ref: calculer-devis",
        "    access: execute",
        "---",
        "# Nouveau devis",
      ].join("\n"),
    );

    const result = await validateBase(tmpDir);
    const resource = result.resources.find((item) => item.id === "nouveau-devis");

    assert.equal(result.ok, true);
    assert.equal(resource.requires.length, 2);
    assert.equal(resource.requires[0].purpose, "quote_pricing");
    assert.match(result.warnings.map((warning) => warning.message).join("\n"), /catalogue-services/);
  });

  it("accepts tool entrypoints relative to the resource file", async () => {
    await write("tools/hello.py", "print('hello')\n");
    await write(
      "tools/hello.md",
      [
        "---",
        "schema_version: base.resource.v1",
        "id: hello-tool",
        "type: tool",
        "description: Dire bonjour.",
        "execution:",
        "  type: script",
        "  runtime: python",
        "  entrypoint: hello.py",
        "  requires_confirmation: true",
        "---",
        "# Hello",
      ].join("\n"),
    );

    const result = await validateBase(tmpDir);
    assert.equal(result.ok, true);
  });

  it("blocks symlink escape (existing target, dangling leaf, and symlinked parent)", async () => {
    const outsideDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-outside-"));
    await fs.writeFile(path.join(outsideDir, "secret.md"), "secret", "utf8");

    // 1. Existing-target symlink (read side).
    await fs.symlink(path.join(outsideDir, "secret.md"), path.join(tmpDir, "secret-link"));
    await assert.rejects(() => confineToRoot(tmpDir, "secret-link"), /symlink/);

    // 2. Dangling symlink leaf: target does not exist yet, so a subsequent WRITE would follow it out.
    await fs.symlink(path.join(outsideDir, "not-yet.txt"), path.join(tmpDir, "evil-leaf"));
    await assert.rejects(() => confineToRoot(tmpDir, "evil-leaf"), /symlink/);

    // 3. Symlinked parent directory: a not-yet-existing child must not escape through it.
    await fs.symlink(outsideDir, path.join(tmpDir, "escape-dir"));
    await assert.rejects(() => confineToRoot(tmpDir, "escape-dir/new.txt"), /symlink/);

    // A legitimate not-yet-existing file under a real directory is still allowed.
    const ok = await confineToRoot(tmpDir, "fresh.txt");
    assert.equal(ok, path.resolve(tmpDir, "fresh.txt"));

    await fs.rm(outsideDir, { recursive: true, force: true });
  });
});

describe("searchResources", () => {
  it("returns explainable local ranking", async () => {
    await write(
      "devis.md",
      "---\nid: nouveau-devis\ntype: process\ndescription: Creer un devis client.\nkeywords: [vente, client]\n---\n# Nouveau devis\n",
    );

    const results = await searchResources(tmpDir, "devis client");
    assert.equal(results[0].id, "nouveau-devis");
    assert.ok(results[0].score > 0);
    assert.ok(results[0].reasons.some((reason) => reason.startsWith("id:") || reason.startsWith("description:")));
    assert.equal("content" in results[0], false);
    assert.equal("body" in results[0], false);
  });
});

describe("writeManifest", () => {
  it("generates a deterministic manifest shape", async () => {
    await write("doc.md", "# Document\n");

    const { manifest, outputPath } = await writeManifest(tmpDir);
    assert.equal(path.basename(outputPath), "base.manifest.json");
    assert.equal(manifest.schema_version, "base.manifest.v1");
    assert.equal(manifest.resources.length, 1);

    const onDisk = JSON.parse(await fs.readFile(outputPath, "utf8"));
    assert.equal(onDisk.resources[0].id, "doc-md");
  });
});

describe("checkManifestFresh", () => {
  it("reports fresh right after a write, and stale once the tree drifts", async () => {
    await write("doc.md", "# Document\n");
    await writeManifest(tmpDir);
    const fresh = await checkManifestFresh(tmpDir);
    assert.equal(fresh.fresh, true, "right after a write, the committed manifest equals what index would produce");
    assert.equal(fresh.exists, true);

    // A new resource the manifest doesn't yet list = drift the freshness gate must catch.
    await write("autre.md", "# Autre\n");
    const stale = await checkManifestFresh(tmpDir);
    assert.equal(stale.fresh, false, "an un-reindexed resource makes the manifest stale");
    assert.equal(stale.exists, true);
  });

  it("reports a missing manifest as not fresh (never silently passes)", async () => {
    await write("doc.md", "# Document\n");
    const result = await checkManifestFresh(tmpDir);
    assert.equal(result.exists, false);
    assert.equal(result.fresh, false);
  });
});

describe("egress at the read chokepoint (open / access / discover)", () => {
  const confidential = [
    "---", "schema_version: base.resource.v1", "id: secret-grid", "type: document",
    "description: Confidential pricing.", "sensitivity: internal", "confidential: true",
    "---", "Remise speciale: 15 %", "",
  ].join("\n");
  const remote = { modelLocality: "remote", rootPolicy: "any" };

  it("returns the confidential content to a LOCAL caller (no egress context)", async () => {
    await write("secret.md", confidential);
    const opened = await openResource(tmpDir, "secret-grid", { projection: "full" });
    assert.match(opened.content, /15 %/);
    assert.notEqual(opened.withheld, true);
  });

  it("open WITHHOLDS a confidential resource from a remote model — content becomes the SAID notice", async () => {
    await write("secret.md", confidential);
    const opened = await openResource(tmpDir, "secret-grid", { projection: "full", egress: remote });
    assert.equal(opened.withheld, true);
    assert.equal(opened.egress_reason, "confidential");
    assert.doesNotMatch(opened.content, /15 %/);
    assert.match(opened.content, /retenu/);
    // The resource sibling must not leak the confidential body/metadata either (a consumer may
    // serialize the whole result): no content/body field, and nothing confidential anywhere in it.
    assert.ok(!opened.resource.content && !opened.resource.body, "resource sibling carries no content/body");
    assert.doesNotMatch(JSON.stringify(opened.resource), /15 %/, "no confidential field survives in the resource sibling");
  });

  it("access WITHHOLDS the same way (the access path is not a bypass)", async () => {
    await write("secret.md", confidential);
    const acc = await accessResource(tmpDir, "secret-grid", { projection: "full", egress: remote });
    assert.equal(acc.withheld, true);
    assert.doesNotMatch(acc.content, /15 %/);
  });

  it("discover does not even reveal a confidential resource's existence to a remote model", async () => {
    await write("secret.md", confidential);
    const local = await searchResources(tmpDir, "remise", { limit: 10 });
    const remoteHits = await searchResources(tmpDir, "remise", { limit: 10, egress: remote });
    assert.ok(local.some((r) => r.id === "secret-grid"), "local discover should surface it");
    assert.ok(!remoteHits.some((r) => r.id === "secret-grid"), "remote discover must not surface it");
  });

  it("a local-only root withholds even a non-confidential resource from a remote model", async () => {
    await write("note.md", "---\nschema_version: base.resource.v1\nid: pub\ntype: document\ndescription: x.\n---\nhello\n");
    const opened = await openResource(tmpDir, "pub", { projection: "full", egress: { modelLocality: "remote", rootPolicy: "local-only" } });
    assert.equal(opened.withheld, true);
    assert.equal(opened.egress_reason, "root_local_only");
  });

  it("inventory hides confidential resources from a remote model (the bootstrap-catalog path)", async () => {
    await write("secret.md", confidential);
    await write("plain.md", "---\nschema_version: base.resource.v1\nid: plain-note\ntype: document\ndescription: visible.\n---\nhi\n");
    const localList = await inventoryResources(tmpDir);
    const remoteList = await inventoryResources(tmpDir, { egress: remote });
    assert.ok(localList.some((r) => r.id === "secret-grid"), "local inventory lists it");
    assert.ok(!remoteList.some((r) => r.id === "secret-grid"), "remote inventory must not even list a confidential resource");
    assert.ok(remoteList.some((r) => r.id === "plain-note"), "non-confidential stays listed");
  });

  it("inventory hides a whole local-only root from a remote model", async () => {
    await write("plain.md", "---\nschema_version: base.resource.v1\nid: only-note\ntype: document\ndescription: visible.\n---\nhi\n");
    const remoteList = await inventoryResources(tmpDir, { egress: { modelLocality: "remote", rootPolicy: "local-only" } });
    assert.ok(!remoteList.some((r) => r.id === "only-note"), "local-only root must not expose resources to a remote model");
  });

  it("invoke refuses a confidential tool for a remote model without leaking its entrypoint path", async () => {
    await write("tools/cap.py", "print('x')\n");
    await write("tools/cap.md", "---\nschema_version: base.resource.v1\nid: secret-cap\ntype: tool\ndescription: c\nconfidential: true\nexecution:\n  type: script\n  runtime: python\n  entrypoint: cap.py\n---\n# Cap\n");
    await assert.rejects(
      () => invokeTool(tmpDir, "secret-cap", [], { dryRun: true, egress: remote }),
      (e) => /denied/i.test(e.message) && !/cap\.py/.test(e.message),
      "remote invoke of a confidential tool must be denied without revealing the entrypoint path",
    );
    const local = await invokeTool(tmpDir, "secret-cap", [], { dryRun: true });
    assert.equal(local.dry_run, true); // the local human can still dry-run it
  });

  it("promote treats a confidential resource as not-found for a remote model (no id/scope leak)", async () => {
    await write("pnote.md", "---\nschema_version: base.resource.v1\nid: secret-note\ntype: document\ndescription: d\nconfidential: true\nscope: personal\n---\nbody\n");
    await assert.rejects(() => promoteResource(tmpDir, "secret-note", "team", { egress: remote }), /not found/i);
    const local = await promoteResource(tmpDir, "secret-note", "team");
    assert.equal(local.id, "secret-note"); // the local human can promote it
  });

  it("list_markers does not leak a confidential resource's markers (content snippet + path) to a remote model", async () => {
    await write("secret.md", "---\nschema_version: base.resource.v1\nid: secret-marked\ntype: document\ndescription: c.\nsensitivity: internal\nconfidential: true\n---\n[A VALIDER] negocier la remise grands comptes a 15 %\n");
    const localMarkers = await listMarkers(tmpDir);
    const remoteMarkers = await listMarkers(tmpDir, { egress: remote });
    assert.ok(localMarkers.some((m) => m.path === "secret.md"), "local list_markers includes the confidential resource's marker");
    assert.ok(!remoteMarkers.some((m) => m.path === "secret.md"), "remote list_markers must not include a confidential resource's marker text/path");
  });

  it("route does not surface a confidential agent to a remote model (routes over the gated inventory)", async () => {
    await write(".ai/agents/secret/AGENT.md", "---\nschema_version: base.resource.v1\nid: secret-agent\ntype: agent\ntitle: Agent Secret\ndescription: calculer les remises confidentielles grands comptes\nconfidential: true\n---\n# Agent\nQuand ce fichier est chargé, agis comme expert.\n");
    const localRoute = await routeRequest(tmpDir, "calculer les remises confidentielles grands comptes", { limit: 5 });
    const remoteRoute = await routeRequest(tmpDir, "calculer les remises confidentielles grands comptes", { limit: 5, egress: remote });
    assert.ok(JSON.stringify(localRoute).includes("secret-agent"), "local routing can surface the agent");
    assert.ok(!JSON.stringify(remoteRoute).includes("secret-agent"), "remote routing must not surface a confidential agent (id, title, explanation, next_question)");
  });

  it("propose withholds the diff of a confidential target from a remote model (no current-content leak)", async () => {
    await write("secret.md", confidential);
    const proposed = await proposeChange(tmpDir, "secret.md", "remplacement\n", { egress: remote });
    assert.doesNotMatch(proposed.diff, /15 %/, "the current confidential content must not appear in the diff");
    assert.match(proposed.diff, /retenu/, "the diff is replaced by the explicit egress notice");
    // A LOCAL proposer still sees the real diff (the human is trusted).
    const local = await proposeChange(tmpDir, "secret.md", "remplacement2\n");
    assert.match(local.diff, /15 %/);
  });
});

describe("openResource and invokeTool", () => {
  it("opens metadata and instruction projections", async () => {
    await write("note.md", "---\nid: note-test\ntype: document\ndescription: Note.\n---\n# Note\n");

    const metadata = await openResource(tmpDir, "note-test", { projection: "metadata" });
    const instructions = await openResource(tmpDir, "note-test", { projection: "instructions" });

    assert.match(metadata.content, /"id": "note-test"/);
    assert.equal(instructions.content.trim(), "# Note");
  });

  it("dry-runs tools through the core router", async () => {
    await write("tools/hello.py", "print('hello')\n");
    await write(
      "tools/hello.md",
      [
        "---",
        "schema_version: base.resource.v1",
        "id: hello-tool",
        "type: tool",
        "description: Dire bonjour.",
        "execution:",
        "  type: script",
        "  runtime: python",
        "  entrypoint: hello.py",
        "  requires_confirmation: true",
        "---",
        "# Hello",
      ].join("\n"),
    );

    const result = await invokeTool(tmpDir, "hello-tool");
    assert.equal(result.dry_run, true);
    assert.equal(result.command[0], "python3");
    assert.match(result.command.at(-1), /hello\.py/);
  });

  it("applies configured policy to non-inventoried confined paths", async () => {
    await write("notes/raw.txt", "secret\n");
    const denyAllReads = () => ({ decision: "deny", reason: "test policy denies reads" });

    await assert.rejects(
      () => accessResource(tmpDir, "notes/raw.txt", { config: { policy: denyAllReads } }),
      /test policy denies reads/,
    );
  });

  it("passes grant tokens through broker reads", async () => {
    await write("secret.md", "---\nid: secret-client\ntype: data\ndescription: Secret.\nsensitivity: restricted\n---\n# Secret\n");
    const config = { policy: strictPolicy({ grants: new Set(["G1"]) }) };

    await assert.rejects(() => openResource(tmpDir, "secret-client", { config }), /restricted/);

    const result = await openResource(tmpDir, "secret-client", { config, grantToken: "G1" });
    assert.match(result.content, /# Secret/);
  });
});

describe("proposeChange and commitChange", () => {
  it("prepares a readable diff and writes nothing until commit", async () => {
    const result = await proposeChange(tmpDir, "devis/DEV-001.md", "# Devis\n\nLigne 1\n");

    assert.match(result.change_id, /^chg_/);
    assert.equal(result.exists, false);
    assert.equal(result.decision.decision, "needs_approval");
    assert.match(result.diff, /\+ # Devis/);
    assert.equal(await pathExists(path.join(tmpDir, "devis/DEV-001.md")), false);
  });

  it("requires explicit confirmation by default, then writes and verifies", async () => {
    const proposed = await proposeChange(tmpDir, "notes.md", "bonjour\n");

    await assert.rejects(() => commitChange(tmpDir, proposed.change_id), /confirmation/);

    const committed = await commitChange(tmpDir, proposed.change_id, { confirmed: true });
    assert.equal(committed.written, true);
    assert.equal(await fs.readFile(path.join(tmpDir, "notes.md"), "utf8"), "bonjour\n");
  });

  it("auto-commits when the target opted out of confirmation", async () => {
    const frontmatter = "---\nid: cfg\ntype: document\ndescription: Conf.\nrequires_confirmation: false\nsensitivity: internal\n---\n# Conf\n";
    await write("config.md", frontmatter + "v1\n");

    const proposed = await proposeChange(tmpDir, "config.md", frontmatter + "v2\n");
    assert.equal(proposed.decision.decision, "allow");

    const committed = await commitChange(tmpDir, proposed.change_id);
    assert.equal(committed.written, true);
    assert.match(await fs.readFile(path.join(tmpDir, "config.md"), "utf8"), /v2/);
  });

  it("denies a sensitive write without confirmation, allows it once confirmed (adversarial)", async () => {
    const head = "---\nid: s\ntype: data\ndescription: D.\nsensitivity: restricted\n---\n# S\n";
    await write("secret.md", head + "old\n");

    await assert.rejects(() => proposeChange(tmpDir, "secret.md", head + "new\n"), /Write denied/);
    const changesDir = path.join(tmpDir, ".ai", "changes");
    assert.equal(await pathExists(changesDir), false);

    const proposed = await proposeChange(tmpDir, "secret.md", head + "new\n", { confirmed: true });
    assert.equal(proposed.decision.decision, "allow");
    const committed = await commitChange(tmpDir, proposed.change_id, { confirmed: true });
    assert.equal(committed.written, true);
    assert.match(await fs.readFile(path.join(tmpDir, "secret.md"), "utf8"), /new/);
  });

  it("blocks a proposed write that escapes the project root", async () => {
    await assert.rejects(() => proposeChange(tmpDir, "../escape.md", "x"), /escapes BASE root/);
  });

  it("refuses to commit if the target changed since the proposal", async () => {
    await write("doc.md", "v1\n");
    const proposed = await proposeChange(tmpDir, "doc.md", "v2\n");
    await fs.writeFile(path.join(tmpDir, "doc.md"), "v1-modifie\n", "utf8");

    await assert.rejects(() => commitChange(tmpDir, proposed.change_id, { confirmed: true }), /changed since/);
  });
});

describe("promoteResource", () => {
  it("proposes a frontmatter promotion with scope and provenance, applied on commit", async () => {
    await write(
      "knowledge/tva.md",
      "---\nschema_version: base.resource.v1\nid: tva\ntype: knowledge\ndescription: Regles TVA.\nscope: personal\n---\n# TVA\n",
    );

    const result = await promoteResource(tmpDir, "tva", "team");
    assert.equal(result.from, "personal");
    assert.equal(result.to, "team");
    assert.match(result.diff, /\+ scope: team/);
    assert.match(result.diff, /\+ promoted_from: personal/);

    // Nothing written until commit.
    assert.match(await fs.readFile(path.join(tmpDir, "knowledge/tva.md"), "utf8"), /scope: personal/);

    await commitChange(tmpDir, result.change_id, { confirmed: true });
    const after = await fs.readFile(path.join(tmpDir, "knowledge/tva.md"), "utf8");
    assert.match(after, /scope: team/);
    assert.match(after, /promoted_from: personal/);
    assert.match(after, /promoted_at: \d{4}-\d{2}-\d{2}/);
    assert.doesNotMatch(after, /scope: personal/);
  });

  it("refuses to promote to the same scope", async () => {
    await write("k.md", "---\nid: kk\ntype: knowledge\ndescription: D.\nscope: team\n---\n# K\n");
    await assert.rejects(() => promoteResource(tmpDir, "kk", "team"), /already has scope/);
  });
});

describe("listMarkers", () => {
  it("lists open markers in business docs and skips framework files", async () => {
    await write("devis/DEV-1.md", "# Devis\n\n[A VALIDER: prix unitaire]\n[DECISION: remise 10% | accord client]\n");
    await write(".ai/agents/x/skills/competences/marqueurs/SKILL.md", "# Marqueurs\n\nExemple: [A VALIDER: ne doit pas compter]\n");

    const markers = await listMarkers(tmpDir);

    assert.ok(markers.some((m) => m.type === "A VALIDER" && m.path === "devis/DEV-1.md"));
    assert.ok(markers.some((m) => m.type === "DECISION"));
    assert.ok(!markers.some((m) => m.path.includes(".ai/agents/")));
    assert.equal(markers[0].type, "A VALIDER");
  });
});

describe("buildArtifacts", () => {
  it("projects an AGENTS.md index and a tool matrix from the core", async () => {
    await write(
      ".ai/agents/assistant-foo/AGENT.md",
      "# Assistant Foo\n\nQuand ce fichier est charge, agis comme un assistant de test.\n",
    );

    const artifacts = await buildArtifacts(tmpDir, { targets: ["all"] });
    const agentsMd = artifacts.find((a) => a.path === "AGENTS.md");
    const matrix = artifacts.find((a) => a.path === ".ai/tools.md");

    assert.ok(agentsMd, "AGENTS.md projected");
    assert.match(agentsMd.content, /assistant-foo/);
    assert.match(agentsMd.content, /Généré par/);
    assert.match(agentsMd.content, /tu es le routeur/); // carries the canonical router body
    assert.ok(matrix, "tool matrix projected");
    assert.match(matrix.content, /Matrice des outils/);
    assert.match(matrix.content, /claude-code/);

    const written = await writeArtifacts(tmpDir, artifacts);
    assert.ok(written.includes("AGENTS.md"));
    assert.equal(await fs.readFile(path.join(tmpDir, "AGENTS.md"), "utf8"), agentsMd.content);
  });

  it("excludes the _template agent from the index", async () => {
    await write(".ai/agents/_template/AGENT.md", "# Template\n\nagis comme un modele.\n");
    await write(".ai/agents/real/AGENT.md", "# Real\n\nagis comme un assistant reel.\n");

    const [agentsMd] = await buildArtifacts(tmpDir, { targets: ["agents-md"] });
    assert.match(agentsMd.content, /\breal\b/);
    assert.doesNotMatch(agentsMd.content, /_template/);
  });

  it("projects four harness entry points from one canonical router body, kept in sync", async () => {
    await write(".ai/agents/real/AGENT.md", "# Real\n\nagis comme un assistant.\n");
    const artifacts = await buildArtifacts(tmpDir, { targets: ["all"] });

    for (const entry of ["CLAUDE.md", "BASE_BOOTSTRAP.md", ".cursor/rules/assistant.mdc", "AGENTS.md"]) {
      const artifact = artifacts.find((a) => a.path === entry);
      assert.ok(artifact, `${entry} projected`);
      assert.ok(artifact.content.includes(ROUTER_BODY), `${entry} carries the canonical router body`);
    }
    // Agent-agnostic: the entry point routes, it does not hard-load a default agent.
    const claude = artifacts.find((a) => a.path === "CLAUDE.md");
    assert.doesNotMatch(claude.content, /@\.ai\/agents\//);
  });
});

describe("policy and trace", () => {
  it("denies restricted full reads without purpose and records a trace", async () => {
    await write(
      "secret.md",
      [
        "---",
        "schema_version: base.resource.v1",
        "id: secret-client",
        "type: data",
        "description: Donnee client restreinte.",
        "sensitivity: restricted",
        "---",
        "# Secret",
      ].join("\n"),
    );

    await assert.rejects(() => accessResource(tmpDir, "secret-client"), /Access denied/);

    const trace = await summarizeTrace(tmpDir);
    assert.equal(trace.denied >= 1, true);
    assert.equal(trace.errors >= 1, true);
  });

  it("allows restricted reads when a purpose is explicit", async () => {
    await write(
      "secret.md",
      [
        "---",
        "schema_version: base.resource.v1",
        "id: secret-client",
        "type: data",
        "description: Donnee client restreinte.",
        "sensitivity: restricted",
        "---",
        "# Secret",
      ].join("\n"),
    );

    const result = await accessResource(tmpDir, "secret-client", { purpose: "verification manuelle du devis" });

    assert.match(result.content, /# Secret/);
    assert.equal(result.policy.decision, "needs_approval");
  });

  it("returns explainable policy decisions", () => {
    const decision = canAccessResource({ sensitivity: "restricted" }, "read", { projection: "full" });

    assert.equal(decision.decision, "deny");
    assert.match(decision.reason, /Restricted/);
  });

  it("prunes trace files older than a cutoff and keeps the rest (deterministic via `before`)", async () => {
    const traceDir = path.join(tmpDir, ".ai", "trace");
    await fs.mkdir(traceDir, { recursive: true });
    for (const day of ["2026-01-01", "2026-05-01", "2026-06-08", "2026-06-09"]) {
      await fs.writeFile(path.join(traceDir, `${day}.jsonl`), '{"op":"open"}\n', "utf8");
    }
    // A non-dated file must never be pruned by a date cutoff.
    await fs.writeFile(path.join(traceDir, "notes.jsonl"), "x\n", "utf8");

    const result = await pruneTrace(tmpDir, { before: "2026-06-08" });

    assert.equal(result.removed_count, 2);
    assert.deepEqual(result.removed.sort(), ["2026-01-01.jsonl", "2026-05-01.jsonl"]);
    assert.equal(result.cutoff, "2026-06-08");
    const remaining = (await fs.readdir(traceDir)).sort();
    assert.deepEqual(remaining, ["2026-06-08.jsonl", "2026-06-09.jsonl", "notes.jsonl"]);
  });

  it("clears every trace file when `all` is set", async () => {
    const traceDir = path.join(tmpDir, ".ai", "trace");
    await fs.mkdir(traceDir, { recursive: true });
    await fs.writeFile(path.join(traceDir, "2026-06-09.jsonl"), '{"op":"route"}\n', "utf8");

    const result = await pruneTrace(tmpDir, { all: true });

    assert.equal(result.removed_count, 1);
    assert.equal(result.cutoff, null);
    assert.deepEqual(await fs.readdir(traceDir), []);
  });

  it("is a no-op (never throws) when there is no trace directory", async () => {
    const result = await pruneTrace(tmpDir, { keepDays: 30 });
    assert.deepEqual(result, { removed: [], removed_count: 0, kept: 0, cutoff: null });
  });
});

describe("specification v0 contract", () => {
  it("documents bounded claims for advisory, hybrid and strict modes", async () => {
    const spec = await fs.readFile(path.resolve("docs/reference/specification-v0.md"), "utf8");

    assert.match(spec, /advisory = guide\/audit/);
    assert.match(spec, /hybrid = enforcement partiel explicite/);
    assert.match(spec, /strict = enforcement médié/);
    assert.match(spec, /Un adapter doit déclarer son niveau réel/);
  });

  it("keeps generated indexes as derived artifacts", async () => {
    const spec = await fs.readFile(path.resolve("docs/reference/specification-v0.md"), "utf8");

    assert.match(spec, /Index dérivé/);
    assert.match(spec, /manifests, caches et index ne sont pas la source de vérité/);
  });

  it("keeps external data distinct from instructions", async () => {
    const spec = await fs.readFile(path.resolve("docs/reference/specification-v0.md"), "utf8");

    assert.match(spec, /Donnée externe ≠ instruction/);
    assert.match(spec, /traité comme donnée, jamais comme instruction/);
  });

  it("keeps public claims bounded and expert-defensible", async () => {
    const docs = await readProjectMarkdownFiles();
    const combined = docs.map((doc) => `\n--- ${doc.path} ---\n${doc.content}`).join("\n");
    const bannedClaims = [
      "Rien n'est écrit sans votre validation",
      "local-strict",
      "Chaque idée est réalisable",
      "Intégrations illimitées",
      "charge automatiquement l'agent",
      "configure votre outil automatiquement",
      "Il ne va pas chercher d'informations sur internet",
      "découvrent et chargent automatiquement",
      "standard de facto adopté par les principaux outils IA",
      "ChatGPT appellera automatiquement",
      "garde votre intuition à jour",
      "garantit votre souveraineté",
      "vous n'avez plus besoin de vérifier",
    ];

    for (const claim of bannedClaims) {
      assert.equal(combined.includes(claim), false, `Claim should stay bounded: ${claim}`);
    }
  });

  it("documents implementation state separately from long-term specification", async () => {
    const state = await fs.readFile(path.resolve("docs/reference/etat-implementation.md"), "utf8");
    const framework = await fs.readFile(path.resolve("docs/reference/framework-public.md"), "utf8");
    const spec = await fs.readFile(path.resolve("docs/reference/specification-v0.md"), "utf8");

    assert.match(state, /Ce que fait le cœur public/);
    assert.match(state, /Hors cœur public/);
    assert.match(framework, /docs\/reference\/etat-implementation\.md/);
    assert.match(spec, /Broker canonique/);
  });

  it("documents audiences and publication discipline", async () => {
    const audiences = await fs.readFile(path.resolve("docs/audiences/pour-qui.md"), "utf8");
    const diffusion = await fs.readFile(path.resolve("docs/guides/diffusion.md"), "utf8");
    const readme = await fs.readFile(path.resolve("README.md"), "utf8");
    const readingOrder = await fs.readFile(path.resolve("docs/start/lire-dans-quel-ordre.md"), "utf8");
    const framework = await fs.readFile(path.resolve("docs/reference/framework-public.md"), "utf8");
    const claude = await fs.readFile(path.resolve("CLAUDE.md"), "utf8");
    const license = await fs.readFile(path.resolve("LICENSE"), "utf8");
    const security = await fs.readFile(path.resolve("SECURITY.md"), "utf8");
    const securityLimits = await fs.readFile(path.resolve("docs/trust/securite-et-limites.md"), "utf8");
    const licenseDoc = await fs.readFile(path.resolve("docs/trust/licence.md"), "utf8");
    const changelog = await fs.readFile(path.resolve("CHANGELOG.md"), "utf8");
    const packageJson = JSON.parse(await fs.readFile(path.resolve("package.json"), "utf8"));
    const mcpPackageJson = JSON.parse(await fs.readFile(path.resolve("mcp/package.json"), "utf8"));
    const contributing = await fs.readFile(path.resolve("CONTRIBUTING.md"), "utf8");

    assert.match(audiences, /vie privée/);
    assert.match(audiences, /start-up/);
    assert.match(audiences, /PME/);
    assert.match(audiences, /grande entreprise/);
    assert.match(diffusion, /Fort, mais borné/);
    assert.match(diffusion, /Checklist avant publication/);
    assert.match(readingOrder, /Si vous êtes une personne seule/);
    assert.match(readingOrder, /Si vous êtes une PME ou une petite équipe/);
    assert.match(readingOrder, /Si vous êtes une grande entreprise/);
    assert.match(readingOrder, /source de vérité des parcours de lecture/);
    assert.match(framework, /Trois couches à ne pas confondre/);
    assert.match(claude, /point d'entrée pour Claude Code/);
    assert.match(readme, /Pourquoi BASE existe/);
    assert.match(readme, /Ignorez au début/);
    assert.match(readme, /code sous Apache-2\.0/);
    assert.match(diffusion, /double licence/);
    assert.match(license, /Apache License 2\.0/);
    assert.match(license, /Creative Commons Attribution 4\.0/);
    assert.match(licenseDoc, /BASE repose sur une double licence/);
    assert.match(licenseDoc, /Source légale/);
    assert.match(security, /Ces garanties valent seulement pour les actions qui passent/);
    assert.match(securityLimits, /Une garantie est réelle seulement si l'action passe/);
    assert.match(changelog, /## \[1\.0\.0\] - 2026-06-25/);
    // Dual license, made machine-readable: the published `@ai-swiss/base` package ships BOTH code
    // (Apache-2.0) and content (docs/, exemples/, .ai/agents/, MANIFESTO — CC-BY-4.0), so the SPDX
    // expression is the AND of both. The MCP server (and the companion packages) ship code only.
    assert.equal(packageJson.license, "Apache-2.0 AND CC-BY-4.0");
    assert.equal(mcpPackageJson.license, "Apache-2.0");
    assert.match(contributing, /simple en surface, rigoureux dans ses abstractions/);
  });

  it("documents the behavioral collaboration thesis without anthropomorphic overclaims", async () => {
    const readme = await fs.readFile(path.resolve("README.md"), "utf8");
    const comprendre = await fs.readFile(path.resolve("docs/learn/comprendre.md"), "utf8");
    const audiences = await fs.readFile(path.resolve("docs/audiences/pour-qui.md"), "utf8");
    const diffusion = await fs.readFile(path.resolve("docs/guides/diffusion.md"), "utf8");
    const combined = [readme, comprendre, audiences, diffusion].join("\n");

    assert.match(readme, /ne se comporte pas comme un logiciel numérique classique/);
    assert.match(comprendre, /collègue venu d'ailleurs, amnésique: il a une représentation riche du monde, mais pas du vôtre/);
    assert.doesNotMatch(combined, /junior brillant/, "rejected model metaphor must not return");
    assert.match(audiences, /charge mentale au lieu de la réduire/);
    assert.match(diffusion, /transforme ce constat en méthode praticable/);
    assert.match(combined, /conscience, une intention ou une compréhension garantie/);
  });

  it("documents the two control-retention principles consistently", async () => {
    const pratiques = await fs.readFile(path.resolve("docs/learn/pratiques-co-pensee.md"), "utf8");
    const readme = await fs.readFile(path.resolve("README.md"), "utf8");
    const comprendre = await fs.readFile(path.resolve("docs/learn/comprendre.md"), "utf8");

    assert.match(pratiques, /Gardez le contrôle dans la durée/);
    assert.match(pratiques, /Gardez une intuition suffisante pour vérifier/);
    assert.match(pratiques, /Gardez la souveraineté sur votre dispositif/);
    assert.match(pratiques, /seize principes/);
    assert.match(readme, /quatre pertes de contrôle/); // the README frames control-retention as the four losses to avoid (souveraineté, compréhension, durée, vérification)
    assert.match(comprendre, /Déléguer la granularité ne doit pas faire perdre la capacité de juger/);
    assert.equal(readme.includes("14 principes"), false, "README must not keep the stale principle count");
  });
});

describe("createMaintenanceReport", () => {
  it("reports open markers and derives simple descriptions from Markdown", async () => {
    await write("journal/session.md", "# Demo\n\n[A VALIDER: contenu]\n");

    const report = await createMaintenanceReport(tmpDir);
    assert.equal(report.summary.placeholders, 1);
    assert.equal(report.summary.missing_descriptions, 0);
    assert.ok(report.recommendations.length > 0);
  });

  it("flags open markers in files untouched for 30+ days as stale (verification theater lens)", async () => {
    await write("devis/vieux.md", "# Vieux devis\n\n[A VALIDER: remise de 10%]\n");
    await write("devis/recent.md", "# Devis recent\n\n[A VALIDER: delai]\n");
    const old = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
    await fs.utimes(path.join(tmpDir, "devis/vieux.md"), old, old);

    const report = await createMaintenanceReport(tmpDir);

    assert.equal(report.summary.stale_markers, 1);
    assert.equal(report.structural.stale_markers[0].path, "devis/vieux.md");
    assert.ok(report.structural.stale_markers[0].days >= 44, "reports the age in days");
    assert.ok(report.recommendations.some((r) => r.includes("dormants")), "recommends acting on stale markers");
  });

  it("flags weak routing and orphan resources as a private static lens (no runtime, no telemetry)", async () => {
    await write(".ai/agents/demo/AGENT.md", "# Demo\n\nUtilise skills/competences/used/SKILL.md pour la methode.\n");
    // A process with neither use_when nor routing examples: a weak routing signal that can drift.
    await write(".ai/agents/demo/skills/processes/faible/SKILL.md", "# Process faible\n\nAucun signal de routage declare.\n");
    await write(".ai/agents/demo/skills/competences/used/SKILL.md", "# Competence utilisee\n\nReferencee par l'agent.\n");
    await write(".ai/agents/demo/skills/competences/orphan/SKILL.md", "# Competence orpheline\n\nPersonne ne me reference.\n");

    const report = await createMaintenanceReport(tmpDir);

    assert.equal(report.summary.weak_routing, 1);
    assert.ok(report.structural.weak_routing.some((p) => p.endsWith("processes/faible/SKILL.md")));
    assert.ok(report.structural.orphans.some((p) => p.endsWith("competences/orphan/SKILL.md")), "the unreferenced competence is an orphan");
    assert.ok(!report.structural.orphans.some((p) => p.endsWith("competences/used/SKILL.md")), "the referenced competence is not flagged");
  });
});
