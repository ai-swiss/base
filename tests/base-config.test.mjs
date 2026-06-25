// Spec coverage: FR-CONFIG-001 FR-CONFIG-002 FR-CONFIG-003 FR-CONFIG-004
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import * as core from "../tools/base-core.mjs";
import { resolveConfig, DEFAULTS, mergeConfig } from "../tools/core/config.mjs";
import { SCHEMA_TYPES, SCHEMA_SCOPES, SCHEMA_STATUSES, SCHEMA_SENSITIVITIES, REQUIRE_ACCESS } from "../tools/core/schema.mjs";

let tmpDir;
beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-config-test-"));
});
afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

async function write(rel, content) {
  const full = path.join(tmpDir, rel);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content, "utf8");
}

describe("resolveConfig", () => {
  it("returns defaults when no config file is present", async () => {
    const config = await resolveConfig(tmpDir);
    assert.deepEqual(config, { ...DEFAULTS });
    assert.deepEqual(config.rankers, []);
    assert.equal(config.policy, null);
  });

  it("loads a declarative .json config and instantiates descriptors into adapters", async () => {
    await write("base.config.json", JSON.stringify({ validators: [{ type: "requireFields", fields: ["owner"], whenScope: "team" }] }));
    const config = await resolveConfig(tmpDir);
    assert.equal(config.validators.length, 1);
    assert.equal(typeof config.validators[0], "function"); // descriptor → adapter function
    assert.deepEqual(config.rankers, []); // untouched default
  });

  it("a .json descriptor produces a working adapter (validateBase enforces it)", async () => {
    await write("base.config.json", JSON.stringify({ validators: [{ type: "requireFields", fields: ["owner"], whenScope: "team" }] }));
    await write("res.md", "---\nschema_version: base.resource.v1\nid: r\ntype: process\ndescription: A.\nscope: team\n---\n# R\n");
    const result = await core.validateBase(tmpDir);
    assert.equal(result.ok, false);
    assert.match(result.errors.map((e) => e.message).join("\n"), /owner/);
  });

  it("instantiates a strict policy and a keywordIntent ranker from .json", async () => {
    await write(
      "base.config.json",
      JSON.stringify({
        policy: "strict",
        rankers: [{ type: "keywordIntent", rules: { "intent:x": { whenIncludes: ["x"], require: ["x"], boost: 10 } } }],
      }),
    );
    const config = await resolveConfig(tmpDir);
    assert.equal(typeof config.policy, "function");
    assert.equal(typeof config.rankers[0], "function");
  });

  it("instantiates semanticHybrid, routability, and routing thresholds from .json", async () => {
    await write(
      "base.config.json",
      JSON.stringify({
        routing: { floor_score: 40, top2_margin: 0.15, max_candidates: 3 },
        rankers: [{ type: "semanticHybrid", aliases: { offboarding: ["fin relation"] } }],
        validators: [{ type: "routability" }],
      }),
    );
    const config = await resolveConfig(tmpDir);
    assert.deepEqual(config.routing, { floor_score: 40, top2_margin: 0.15, max_candidates: 3 });
    assert.equal(typeof config.rankers[0], "function");
    assert.equal(typeof config.validators[0], "function");
  });

  it("rejects invalid routing thresholds loudly", async () => {
    await write("base.config.json", JSON.stringify({ routing: { top2_margin: 2 } }));
    await assert.rejects(() => resolveConfig(tmpDir), /base\.config\.invalid/);
  });

  it("instantiates and validates routing.fallback", async () => {
    await write("base.config.json", JSON.stringify({ routing: { fallback: { agent: "concierge-base", process: "accueil" } } }));
    const config = await resolveConfig(tmpDir);
    assert.deepEqual(config.routing.fallback, { agent: "concierge-base", process: "accueil" });
  });

  it("rejects a malformed routing.fallback loudly", async () => {
    await write("base.config.json", JSON.stringify({ routing: { fallback: { agent: "a" } } }));
    await assert.rejects(() => resolveConfig(tmpDir), /base\.config\.invalid/);

    await write("base.config.json", JSON.stringify({ routing: { fallback: { agent: "a", process: "b", extra: 1 } } }));
    await assert.rejects(() => resolveConfig(tmpDir), /base\.config\.invalid/);
  });

  it("instantiates and validates routing.policy.deny (the project-level routing deny)", async () => {
    await write("base.config.json", JSON.stringify({ routing: { policy: { deny: ["legacy-agent", "old-process"] } } }));
    const config = await resolveConfig(tmpDir);
    assert.deepEqual(config.routing.policy, { deny: ["legacy-agent", "old-process"] });
  });

  it("rejects a malformed routing.policy loudly (deny must be string[]; no stray keys)", async () => {
    await write("base.config.json", JSON.stringify({ routing: { policy: { deny: "not-an-array" } } }));
    await assert.rejects(() => resolveConfig(tmpDir), /base\.config\.invalid/);

    await write("base.config.json", JSON.stringify({ routing: { policy: { allow: ["x"] } } }));
    await assert.rejects(() => resolveConfig(tmpDir), /base\.config\.invalid/);
  });

  it("instantiates routing.embedder (the routing-embeddings provider config) and passes provider knobs through", async () => {
    await write("base.config.json", JSON.stringify({ routing: { embedder: { provider: "ollama", model: "nomic-embed-text", baseUrl: "http://localhost:11434" } } }));
    const config = await resolveConfig(tmpDir);
    assert.equal(config.routing.embedder.provider, "ollama");
    assert.equal(config.routing.embedder.model, "nomic-embed-text");
    assert.equal(config.routing.embedder.baseUrl, "http://localhost:11434");
  });

  it("rejects an unknown routing.embedder provider loudly", async () => {
    await write("base.config.json", JSON.stringify({ routing: { embedder: { provider: "anthropic", model: "x" } } }));
    await assert.rejects(() => resolveConfig(tmpDir), /base\.config\.invalid/);
  });

  it("rejects an unknown descriptor type loudly", async () => {
    await write("base.config.json", JSON.stringify({ validators: [{ type: "nope" }] }));
    await assert.rejects(() => resolveConfig(tmpDir), /base\.config\.invalid/);
  });

  it("loads an executable .mjs config (trusted project code)", async () => {
    await write("base.config.mjs", "export default { rankers: [() => ({ score: 1, reasons: [] })] };");
    const config = await resolveConfig(tmpDir);
    assert.equal(config.rankers.length, 1);
    assert.equal(typeof config.rankers[0], "function");
  });

  it("prefers the declarative .json over .mjs when both exist", async () => {
    await write("base.config.json", JSON.stringify({ auth: "json-wins" }));
    await write("base.config.mjs", "export default { auth: 'mjs' };");
    const config = await resolveConfig(tmpDir);
    assert.equal(config.auth, "json-wins");
  });

  it("fails loudly (base.config.invalid) on a malformed shape", async () => {
    await write("base.config.json", JSON.stringify({ rankers: "not-an-array" }));
    await assert.rejects(() => resolveConfig(tmpDir), /base\.config\.invalid/);
  });

  it("refuses an explicit --config path that escapes the root", async () => {
    await assert.rejects(
      () => resolveConfig(tmpDir, { configPath: "../escape.json" }),
      /escapes BASE root|base\.config\.invalid/,
    );
  });
});

describe("mergeConfig", () => {
  it("rejects a non-object default export", () => {
    assert.throws(() => mergeConfig([1, 2, 3]), /base\.config\.invalid/);
    assert.throws(() => mergeConfig(null), /base\.config\.invalid/);
  });
});

describe("façade export contract (AD-CORE-002)", () => {
  it("re-exports every name the CLI, MCP adapter and tests depend on", () => {
    const expected = [
      // confinement + foundation
      "confineToRoot", "pathExists", "resolveConfig", "DEFAULTS", "CODES",
      // inventory / index / search
      "walkResourceFiles", "parseFrontmatter", "inventoryResources",
      "buildManifest", "writeManifest", "checkManifestFresh", "searchResources", "routeRequest", "runRouteTests",
      "deriveRoutingSignals", "decideRoute", "buildRoutingRegistry", "ROUTING_DEFAULTS",
      // open / access / invoke
      "openResource", "accessResource", "invokeTool", "canAccessResource",
      // mediated writes / promote / markers / build
      "proposeChange", "commitChange", "promoteResource", "listMarkers", "buildArtifacts", "writeArtifacts",
      // validate / maintain / trace
      "validateBase", "createMaintenanceReport", "recordEvent", "summarizeTrace",
      // presentation (extracted to core/formatters.mjs, re-exported for the CLI)
      "formatValidationResult", "formatSearchResults", "formatRouteResult", "formatRouteTestResult",
      "formatMaintenanceReport", "formatMarkers", "formatTraceSummary", "compareByCodePoint",
      // roots / workspace context
      "WORKSPACE_FILENAME", "resolveBaseContext", "contextScope", "formatContextHeader",
      "findNearestBaseRoot", "findNearestWorkspace", "readWorkspace", "selectWorkspaceRoot",
      // constants
      "SCHEMA_VERSION", "MANIFEST_FILENAME", "TRACE_DIR", "CHANGES_DIR",
    ];
    const missing = expected.filter((name) => core[name] === undefined);
    assert.deepEqual(missing, [], `Missing façade exports: ${missing.join(", ")}`);
  });
});

describe("subpath export contract — public extension surface (AD-CORE-002)", () => {
  // package.json `exports` advertises these subpaths so adapter authors can build rankers, validators
  // and policies "without forking". They are part of the PUBLIC API even where the core does not call
  // every symbol internally — so removing one is a semver-major break, not a tidy. This resolves them
  // by their published specifier (package self-reference), exercising the exports map itself.
  it("resolves every advertised ./subpath and its headline extension points", async () => {
    const codes = await import("@ai-swiss/base/codes");
    for (const name of ["registerCodes", "codeMessage"]) assert.equal(typeof codes[name], "function", `codes.${name}`);
    assert.ok(codes.CODES && typeof codes.CODES === "object");

    const validators = await import("@ai-swiss/base/validators");
    for (const name of ["createNotification", "runValidators", "coreSchemaValidator", "requireFields",
      "requireSchemaVersion", "forbidSensitivity", "hasField", "piiScanner", "routabilityWarnings"]) {
      assert.equal(typeof validators[name], "function", `validators.${name}`);
    }

    const policy = await import("@ai-swiss/base/policy");
    for (const name of ["advisoryPolicy", "strictPolicy", "resolvePolicy"]) assert.equal(typeof policy[name], "function", `policy.${name}`);

    const rankers = await import("@ai-swiss/base/rankers");
    for (const name of ["lexicalRanker", "keywordIntentRanker", "semanticHybridRanker", "composeRankers"]) {
      assert.equal(typeof rankers[name], "function", `rankers.${name}`);
    }

    const routing = await import("@ai-swiss/base/routing");
    assert.ok(routing.ROUTING_DEFAULTS && routing.ROUTABLE_KINDS);
    for (const name of ["deriveRoutingSignals", "decideRoute", "buildRoutingRegistry"]) assert.equal(typeof routing[name], "function", `routing.${name}`);

    const frontmatter = await import("@ai-swiss/base/frontmatter");
    for (const name of ["parseFrontmatter", "parseScalar", "serializeFrontmatter", "composeMarkdown"]) {
      assert.equal(typeof frontmatter[name], "function", `frontmatter.${name}`);
    }
    assert.equal(typeof frontmatter.FrontmatterSerializeError, "function");

    const config = await import("@ai-swiss/base/config");
    assert.equal(typeof config.mergeConfig, "function");
    assert.ok(config.DEFAULTS);

    const roots = await import("@ai-swiss/base/roots");
    assert.equal(typeof roots.contextScope, "function");
    assert.ok(roots.WORKSPACE_FILENAME);
  });

  // The exact symbols the 2026-06-09 audit flagged as "unused internally". Pin them as public AND
  // usable, so a future cleanup can't silently drop public surface. `forbidSensitivity`'s `unless`
  // escape hatch is intentionally .mjs-only (unreachable from JSON config) — proven honored here.
  it("keeps registerCodes, hasField and forbidSensitivity public and usable", async () => {
    const { registerCodes, codeMessage } = await import("@ai-swiss/base/codes");
    registerCodes({ "test.contract.code": "Message de contrat {x}." });
    assert.equal(codeMessage("test.contract.code"), "Message de contrat {x}.");

    const { hasField, forbidSensitivity, createNotification } = await import("@ai-swiss/base/validators");
    const present = hasField("title");
    assert.equal(present({ metadata: { title: "Devis" } }), true);
    assert.equal(present({ metadata: {} }), false);

    const guard = forbidSensitivity("restricted");
    const n1 = createNotification();
    guard({ path: "x.md", sensitivity: "restricted" }, n1);
    assert.equal(n1.ok, false, "restricted resource is flagged");

    const guardWithEscape = forbidSensitivity("restricted", { unless: (r) => r.id === "exempt" });
    const n2 = createNotification();
    guardWithEscape({ path: "x.md", id: "exempt", sensitivity: "restricted" }, n2);
    assert.equal(n2.ok, true, "the .mjs-only `unless` escape hatch is honored");
  });
});

describe("schema enum parity", () => {
  it("keeps schema.mjs enums in sync with base.schema.json", async () => {
    const schema = JSON.parse(await fs.readFile(new URL("../base.schema.json", import.meta.url), "utf8"));
    assert.deepEqual([...SCHEMA_TYPES], schema.properties.type.enum);
    assert.deepEqual([...SCHEMA_SCOPES], schema.properties.scope.enum);
    assert.deepEqual([...SCHEMA_STATUSES], schema.properties.status.enum);
    assert.deepEqual([...SCHEMA_SENSITIVITIES], schema.properties.sensitivity.enum);
    assert.deepEqual([...REQUIRE_ACCESS], schema.properties.requires.items.properties.access.enum);
  });

  it("keeps the base.workspace.v1 schema_version const in sync with readWorkspace's default", async () => {
    const schema = JSON.parse(
      await fs.readFile(new URL("../specs/current/30_schemas/base.workspace.v1.json", import.meta.url), "utf8"),
    );
    assert.equal(schema.properties.schema_version.const, "base.workspace.v1");

    // readWorkspace stamps the same default when the file omits schema_version.
    await write("base.workspace.json", JSON.stringify({ roots: [{ id: "a", path: "." }] }));
    const ws = await core.readWorkspace(path.join(tmpDir, "base.workspace.json"));
    assert.equal(ws.schema_version, schema.properties.schema_version.const);
  });
});
