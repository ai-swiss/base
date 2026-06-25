// Spec coverage: UR-CORE-001 FR-CORE-005 FR-EGRESS-001 FR-EGRESS-002 NFR-EGRESS-001 RC-EGRESS-001 RC-EGRESS-002
// Egress control: the pure rule (locality × policy × confidential), the chat refusal
// (explicit and actionable), the expurgated pack with a trace that says it, and the policy reader.

import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { createFauxModel } from "../packages/base-llm/index.mjs";
import { checkEgress, egressNotice, rootEgressPolicy } from "../tools/core/egress.mjs";
import { buildProcessHarness } from "../tools/eval/broker-harness.mjs";
import { chat } from "../tools/studio/chat.mjs";

describe("checkEgress — the single rule", () => {
  const docs = [
    { path: "a.md" },
    { path: "secret.md", metadata: { confidential: true } },
    { path: "flat.md", confidential: true },
  ];

  it("a local model gets everything, whatever the policy or flags", () => {
    for (const rootPolicy of ["any", "local-only"]) {
      const v = checkEgress({ modelLocality: "local", rootPolicy, resources: docs });
      assert.equal(v.allowed.length, 3);
      assert.equal(v.withheld.length, 0);
    }
  });

  it("a remote model: confidential resources are withheld; a local-only root withholds everything", () => {
    const open = checkEgress({ modelLocality: "remote", rootPolicy: "any", resources: docs });
    assert.deepEqual(open.allowed.map((r) => r.path), ["a.md"]);
    assert.deepEqual(open.withheld.map((w) => w.reason), ["confidential", "confidential"]);

    const closed = checkEgress({ modelLocality: "remote", rootPolicy: "local-only", resources: docs });
    assert.equal(closed.allowed.length, 0);
    assert.ok(closed.withheld.every((w) => w.reason === "root_local_only"));
  });

  it("the refusal line is explicit and actionable", () => {
    const v = checkEgress({ modelLocality: "remote", rootPolicy: "any", resources: docs });
    const notice = egressNotice(v.withheld);
    assert.match(notice, /2 documents retenus/);
    assert.match(notice, /confidentiels/);
    assert.match(notice, /modèle local/);
  });

  it("rootEgressPolicy reads base.config.json, defaults to any", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "base-egress-pol-"));
    try {
      assert.equal(await rootEgressPolicy(dir), "any");
      await writeFile(path.join(dir, "base.config.json"), JSON.stringify({ egress: "local-only" }));
      assert.equal(await rootEgressPolicy(dir), "local-only");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe("egress in the chat and the harness (refus dits, jamais silencieux)", () => {
  let root;
  const PROC = ".ai/agents/a/skills/processes/p/SKILL.md";
  const AGENT = ".ai/agents/a/AGENT.md";

  before(async () => {
    root = await mkdtemp(path.join(tmpdir(), "base-egress-"));
    await mkdir(path.join(root, path.dirname(PROC)), { recursive: true });
    await writeFile(path.join(root, AGENT), "---\nschema_version: base.resource.v1\nid: a\ntype: agent\ntitle: A\ndescription: A.\n---\nAgent.\n");
    await writeFile(
      path.join(root, PROC),
      "---\nschema_version: base.resource.v1\nid: p\ntype: process\ntitle: P\ndescription: P.\n---\nConsulte la [fiche](clients/fiche.md) et le [tarif](tarifs/public.md).\n",
    );
    await mkdir(path.join(root, "clients"), { recursive: true });
    await mkdir(path.join(root, "tarifs"), { recursive: true });
    await writeFile(
      path.join(root, "clients/fiche.md"),
      "---\nschema_version: base.resource.v1\nid: fiche\ntype: document\ntitle: Fiche\ndescription: F.\nconfidential: true\n---\nIBAN secret.\n",
    );
    await writeFile(
      path.join(root, "tarifs/public.md"),
      "---\nschema_version: base.resource.v1\nid: tarif\ntype: document\ntitle: Tarif\ndescription: T.\n---\nTaux 8.1%.\n",
    );
  });

  after(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("chat on a confidential document + remote model → explicit refusal; local model → passes", async () => {
    const model = createFauxModel("ok");
    await assert.rejects(
      () => chat(root, { path: "clients/fiche.md", messages: [{ role: "user", content: "relis" }] }, { model, methodDir: root, modelLocality: "remote" }),
      (e) => e.code === "BAD_REQUEST" && /confidentiel/.test(e.message) && /modèle local/.test(e.message),
    );
    const out = await chat(root, { path: "clients/fiche.md", messages: [{ role: "user", content: "relis" }] }, { model, methodDir: root, modelLocality: "local" });
    assert.equal(out.reply, "ok");
  });

  it("chat pack withholds the confidential reference for a remote model, and says it", async () => {
    const model = createFauxModel("vu");
    const out = await chat(root, { path: PROC, messages: [{ role: "user", content: "go" }] }, { model, methodDir: root, modelLocality: "remote" });

    assert.equal(out.egress.withheld.length, 1);
    assert.equal(out.egress.withheld[0].path, "clients/fiche.md");
    assert.match(out.egress.notice, /1 document retenu/);

    const system = model.calls[0].messages[0].content;
    assert.ok(!system.includes("IBAN secret"), "the confidential content must not reach a remote model");
    assert.ok(system.includes("Taux 8.1%"), "non-confidential references still travel");
    assert.match(system, /retenu/);
  });

  it("the eval harness expurgates the pack and the trace says it", async () => {
    const harness = await buildProcessHarness(root, { agentId: "a", processId: "p", egress: { modelLocality: "remote", rootPolicy: "any" } });
    assert.ok(!harness.systemPrompt.includes("IBAN secret"));
    assert.match(harness.systemPrompt, /retenu/);
    assert.deepEqual(harness.contextPack.withheld, [{ path: "clients/fiche.md", reason: "confidential" }]);

    // Local model: nothing withheld.
    const local = await buildProcessHarness(root, { agentId: "a", processId: "p", egress: { modelLocality: "local", rootPolicy: "any" } });
    assert.ok(local.systemPrompt.includes("IBAN secret"));
    assert.deepEqual(local.contextPack.withheld, []);
  });
});
