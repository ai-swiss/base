// Spec coverage: FR-ROUTE-009
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { routeRequest } from "../tools/base-core.mjs";

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
