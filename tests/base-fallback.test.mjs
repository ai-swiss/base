// Spec coverage: FR-ROUTE-009
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { routeRequest, validateBase } from "../tools/base-core.mjs";
import { engineFrameworkRoot } from "../tools/core/framework-root.mjs";

let tmpDir;
beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-fallback-test-"));
  // A business agent with a clear process, plus a "help" agent that is the fallback target.
  await write(".ai/agents/sales/AGENT.md", "---\nschema_version: base.resource.v1\nid: sales\ntype: agent\ndescription: Ventes et devis.\n---\n# Sales\n");
  await write(
    ".ai/agents/sales/skills/processes/devis/SKILL.md",
    "---\nschema_version: base.resource.v1\nid: nouveau-devis\ntype: process\ndescription: Créer un devis.\nuse_when: Quand l'utilisateur veut créer un devis client.\n---\n# Devis\n",
  );
  await write(".ai/agents/help/AGENT.md", "---\nschema_version: base.resource.v1\nid: help-agent\ntype: agent\ndescription: Orientation.\n---\n# Help\n");
  await write(
    ".ai/agents/help/skills/processes/accueil/SKILL.md",
    "---\nschema_version: base.resource.v1\nid: accueil\ntype: process\ndescription: Front door.\nuse_when: Afficher le menu d'aide BASE.\n---\n# Accueil\n",
  );
});
afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

async function write(rel, content) {
  const full = path.join(tmpDir, rel);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content, "utf8");
}
const configure = (fallback) =>
  write("base.config.json", JSON.stringify({ routing: { fallback } }));

describe("routing.fallback — honest abstention with a help target", () => {
  it("attaches the fallback to an out_of_scope abstention (never makes it routed)", async () => {
    await configure({ agent: "help-agent", process: "accueil" });
    const out = await routeRequest(tmpDir, "qwerty zzz gibberish nonsense");
    assert.equal(out.status, "out_of_scope"); // stays honest
    assert.equal(out.agent, null);
    assert.equal(out.process, null);
    assert.deepEqual(out.fallback, {
      agent: { id: "help-agent", path: ".ai/agents/help/AGENT.md" },
      process: { id: "accueil", path: ".ai/agents/help/skills/processes/accueil/SKILL.md" },
      source: "root", // this root owns its help target: no second corpus was read
    });
  });

  it("does NOT attach a fallback to a real routed result", async () => {
    await configure({ agent: "help-agent", process: "accueil" });
    const out = await routeRequest(tmpDir, "créer un devis pour un client");
    assert.equal(out.status, "routed");
    assert.equal(out.process.id, "nouveau-devis");
    assert.equal(out.fallback, undefined);
  });

  it("degrades gracefully when the configured fallback target is missing (no crash, no fallback)", async () => {
    await configure({ agent: "does-not-exist", process: "accueil" });
    const out = await routeRequest(tmpDir, "qwerty zzz gibberish nonsense");
    assert.equal(out.status, "out_of_scope");
    assert.equal(out.fallback, undefined);
  });

  it("does nothing when no fallback is configured", async () => {
    const out = await routeRequest(tmpDir, "qwerty zzz gibberish nonsense");
    assert.equal(out.status, "out_of_scope");
    assert.equal(out.fallback, undefined);
  });
});

// A root that names the FRAMEWORK's welcome process as its help target. Nothing is copied into the
// root, so nothing can fall behind; the router reads the framework this root belongs to.
describe("routing.fallback — a help target the root does not own", () => {
  let frameworkDir;
  beforeEach(async () => {
    frameworkDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-framework-test-"));
    const agent = path.join(frameworkDir, ".ai/agents/concierge-base");
    await fs.mkdir(path.join(agent, "skills/processes/accueil"), { recursive: true });
    await fs.writeFile(path.join(agent, "AGENT.md"), "---\nschema_version: base.resource.v1\nid: concierge-base\ntype: agent\ndescription: Accueil du cadre.\n---\n# Concierge\n", "utf8");
    await fs.writeFile(
      path.join(agent, "skills/processes/accueil/SKILL.md"),
      "---\nschema_version: base.resource.v1\nid: accueil-cadre\ntype: process\ndescription: Orienter un nouvel arrivant.\nuse_when: Quand la personne ne sait pas par où commencer.\n---\n# Accueil\n",
      "utf8",
    );
  });
  afterEach(async () => {
    await fs.rm(frameworkDir, { recursive: true, force: true });
  });

  it("resolves it in the framework named by framework_dir, with an absolute path", async () => {
    await write("base.config.json", JSON.stringify({ framework_dir: frameworkDir, routing: { fallback: { agent: "concierge-base", process: "accueil-cadre" } } }));
    const out = await routeRequest(tmpDir, "qwerty zzz gibberish nonsense");
    assert.equal(out.status, "out_of_scope"); // still honest: a fallback is not a route
    assert.equal(out.fallback.source, "framework");
    assert.equal(out.fallback.process.id, "accueil-cadre");
    // Outside the root, so the path says where the file actually is.
    assert.ok(path.isAbsolute(out.fallback.process.path), out.fallback.process.path);
    assert.equal(await fs.readFile(out.fallback.process.path, "utf8").then((c) => c.includes("# Accueil")), true);
  });

  it("prefers the root's own target: a root that owns one never reads the framework", async () => {
    await write("base.config.json", JSON.stringify({ framework_dir: frameworkDir, routing: { fallback: { agent: "help-agent", process: "accueil" } } }));
    const out = await routeRequest(tmpDir, "qwerty zzz gibberish nonsense");
    assert.equal(out.fallback.source, "root");
    assert.equal(out.fallback.process.path, ".ai/agents/help/skills/processes/accueil/SKILL.md");
  });

  it("validate does not warn about a target the framework holds", async () => {
    await write("base.config.json", JSON.stringify({ framework_dir: frameworkDir, routing: { fallback: { agent: "concierge-base", process: "accueil-cadre" } } }));
    const result = await validateBase(tmpDir);
    assert.equal(result.warnings.some((w) => w.code === "base.routing.fallback_unresolved"), false);
  });

  it("validate still warns when neither corpus holds it", async () => {
    await write("base.config.json", JSON.stringify({ framework_dir: frameworkDir, routing: { fallback: { agent: "concierge-base", process: "nexiste-pas" } } }));
    const result = await validateBase(tmpDir);
    assert.equal(result.warnings.some((w) => w.code === "base.routing.fallback_unresolved"), true);
  });

  it("falls back to the engine's own framework when the root declares no framework_dir", async () => {
    // The common case: a root created by `base init` from an installed engine names the framework's
    // welcome process, and the engine running the route is where that process lives.
    await write("base.config.json", JSON.stringify({ routing: { fallback: { agent: "concierge-base", process: "accueil" } } }));
    const out = await routeRequest(tmpDir, "qwerty zzz gibberish nonsense");
    assert.equal(out.fallback.source, "framework");
    assert.ok(out.fallback.process.path.startsWith(engineFrameworkRoot()), out.fallback.process.path);
  });

  it("stays silent when neither corpus holds the target (no crash, no fallback)", async () => {
    await write("base.config.json", JSON.stringify({ framework_dir: frameworkDir, routing: { fallback: { agent: "concierge-base", process: "nexiste-pas" } } }));
    const out = await routeRequest(tmpDir, "qwerty zzz gibberish nonsense");
    assert.equal(out.status, "out_of_scope");
    assert.equal(out.fallback, undefined);
  });
});
