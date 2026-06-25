// Spec coverage: UR-CORE-001 FR-STUDIO-002
// The co-thinker chat: text replies, propose_document → real proposal through the gate (nothing
// written), read tools confined to root + method corpus, method process injection per type.
// All with createFauxModel — no provider, no HTTP.

import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { createFauxModel } from "../packages/base-llm/index.mjs";
import { commitEdit } from "../tools/studio/api.mjs";
import { chat, coerceProposalArguments, extractTextProposal } from "../tools/studio/chat.mjs";

const SKILL = ".ai/agents/demo/skills/processes/devis/SKILL.md";

describe("studio chat — recover a propose_document printed as text (weak-model tolerance)", () => {
  it("recovers the arguments when the call is printed as JSON instead of issued", () => {
    assert.deepEqual(extractTextProposal('{"name":"propose_document","parameters":{"body":"Nouveau corps"}}'), { body: "Nouveau corps" });
    assert.deepEqual(extractTextProposal("Voici:\n```json\n{\"name\":\"propose_document\",\"arguments\":{\"body\":\"X\"}}\n```"), { body: "X" });
  });
  it("returns null for an ordinary reply (no false diff)", () => {
    assert.equal(extractTextProposal("Bonjour, je propose de reformuler le titre."), null);
    assert.equal(extractTextProposal("le mot propose_document apparaît, mais sans JSON"), null);
  });
});

describe("studio chat — the gate in the conversation", () => {
  let root;
  let methodDir;

  before(async () => {
    root = await mkdtemp(path.join(tmpdir(), "base-chat-"));
    await mkdir(path.join(root, path.dirname(SKILL)), { recursive: true });
    await writeFile(
      path.join(root, SKILL),
      "---\nschema_version: base.resource.v1\nid: devis\ntype: process\ntitle: Devis\ndescription: Créer un devis.\n---\n# Devis\n\n1. Qualifier.\n2. Chiffrer.\n",
    );
    await writeFile(
      path.join(root, "bareme.md"),
      "---\nschema_version: base.resource.v1\nid: bareme\ntype: document\ntitle: Barème\ndescription: Barème 2026.\n---\nTaux : 8.1%\n",
    );

    methodDir = await mkdtemp(path.join(tmpdir(), "base-chat-method-"));
    const methodPath = ".ai/agents/createur/skills/processes/methode/SKILL.md";
    await mkdir(path.join(methodDir, path.dirname(methodPath)), { recursive: true });
    await writeFile(
      path.join(methodDir, methodPath),
      "---\nschema_version: base.resource.v1\nid: methode-process\ntype: process\ntitle: Méthode process\ndescription: Métadonnées minimales d'un process.\n---\nUn bon use_when décrit l'intention, pas le titre.\n",
    );
  });

  after(async () => {
    await rm(root, { recursive: true, force: true });
    await rm(methodDir, { recursive: true, force: true });
  });

  it("a plain text answer comes back as reply, no proposal, memory untouched", async () => {
    const model = createFauxModel("Je suggère de préciser l'étape 2.");
    const out = await chat(root, { path: SKILL, messages: [{ role: "user", content: "un avis ?" }] }, { model, methodDir });
    assert.equal(out.reply, "Je suggère de préciser l'étape 2.");
    assert.equal(out.proposal, null);
    assert.equal(out.memory, null);
  });

  it("injects the method process matching the edited type into the system prompt", async () => {
    const model = createFauxModel("ok");
    await chat(root, { path: SKILL, messages: [{ role: "user", content: "quelles métadonnées ?" }] }, { model, methodDir });
    const system = model.calls[0].messages[0].content;
    assert.match(system, /Méthode BASE \(methode-process/);
    assert.match(system, /use_when décrit l'intention/);
    // The on-screen document travels too.
    assert.match(system, /1\. Qualifier\./);
  });

  it("propose_document becomes a REAL gated proposal: diff returned, nothing written until commit", async () => {
    const model = createFauxModel({
      text: "Voici la modification :",
      toolCalls: [{ id: "t1", name: "propose_document", arguments: { body: "# Devis\n\n1. Qualifier.\n2. Chiffrer.\n3. Vérifier la TVA.\n" } }],
    });
    const out = await chat(root, { path: SKILL, messages: [{ role: "user", content: "ajoute la TVA" }] }, { model, methodDir });

    assert.ok(out.proposal.changeId.startsWith("chg_"));
    assert.match(out.proposal.diff, /Vérifier la TVA/);
    // Not written yet…
    assert.ok(!(await readFile(path.join(root, SKILL), "utf8")).includes("Vérifier la TVA"));
    // …until the SAME commit button as a manual edit applies it.
    await commitEdit(root, out.proposal.changeId);
    assert.ok((await readFile(path.join(root, SKILL), "utf8")).includes("Vérifier la TVA"));
  });

  it("the chat works on the on-screen draft when one is provided (it is the session's truth)", async () => {
    const model = createFauxModel("vu");
    const draft = { data: { schema_version: "base.resource.v1", id: "devis", type: "process", title: "Devis", description: "Créer un devis." }, body: "# Brouillon local\n" };
    await chat(root, { path: SKILL, draft, messages: [{ role: "user", content: "relis" }] }, { model, methodDir });
    assert.match(model.calls[0].messages[0].content, /Brouillon local/);
  });

  it("read tools: open_resource and discover_resources answer from the root, then the model concludes", async () => {
    const model = createFauxModel([
      { toolCalls: [{ id: "t1", name: "discover_resources", arguments: { query: "barème" } }] },
      { toolCalls: [{ id: "t2", name: "open_resource", arguments: { id_or_path: "bareme" } }] },
      "Le taux applicable est 8.1%.",
    ]);
    const out = await chat(root, { path: SKILL, messages: [{ role: "user", content: "quel taux ?" }] }, { model, methodDir });
    assert.equal(out.reply, "Le taux applicable est 8.1%.");
    // The tool results actually reached the model.
    const second = model.calls[1].messages;
    assert.match(second[second.length - 1].content, /"id":"bareme"|bareme/);
    const third = model.calls[2].messages;
    assert.match(third[third.length - 1].content, /8\.1%/);
  });

  it("rejects a missing path or model, and an unknown resource", async () => {
    const model = createFauxModel("x");
    await assert.rejects(() => chat(root, { messages: [] }, { model, methodDir }), (e) => e.code === "BAD_REQUEST");
    await assert.rejects(() => chat(root, { path: "nope.md", messages: [] }, { model, methodDir }), (e) => e.code === "NOT_FOUND");
  });
});

describe("studio chat — memory protocol and pack", () => {
  let root;
  let methodDir;
  const PROC = ".ai/agents/demo/skills/processes/pack/SKILL.md";

  before(async () => {
    root = await mkdtemp(path.join(tmpdir(), "base-chat-mem-"));
    await mkdir(path.join(root, path.dirname(PROC)), { recursive: true });
    await writeFile(
      path.join(root, PROC),
      "---\nschema_version: base.resource.v1\nid: pack-proc\ntype: process\ntitle: Pack\ndescription: Avec dépendances.\n---\nConsulte le [barème](tarifs/bareme.md).\n",
    );
    await mkdir(path.join(root, "tarifs"), { recursive: true });
    await writeFile(path.join(root, "tarifs/bareme.md"), "---\nschema_version: base.resource.v1\nid: bareme\ntype: document\ntitle: Barème\ndescription: B.\n---\nTaux : 8.1%\n");
    methodDir = await mkdtemp(path.join(tmpdir(), "base-chat-mem-m-"));
  });

  after(async () => {
    await rm(root, { recursive: true, force: true });
    await rm(methodDir, { recursive: true, force: true });
  });

  it("shouldCompact is a pure threshold on estimated tokens (summary included)", async () => {
    const { shouldCompact } = await import("../tools/studio/chat.mjs");
    const msg = (n) => ({ role: "user", content: "x".repeat(n) });
    assert.equal(shouldCompact(null, [msg(40)], 100), false);
    assert.equal(shouldCompact(null, [msg(40), msg(400)], 100), true);
    assert.equal(shouldCompact({ summary: "y".repeat(380), keptFrom: 2 }, [msg(40)], 100), true);
  });

  it("compactMemory folds old messages into an iterative summary and keeps the recent window", async () => {
    const { compactMemory } = await import("../tools/studio/chat.mjs");
    const model = createFauxModel("Intention : devis. Décisions : TVA 8.1%. État : étape 3 ajoutée.");
    const messages = Array.from({ length: 7 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: `m${i}` }));

    const memory = await compactMemory(null, messages, { model });
    assert.equal(memory.keptFrom, 3); // 7 - 4 recent
    assert.match(memory.summary, /Décisions/);
    // The old summary is an input of the next one (iterative).
    const model2 = createFauxModel("Résumé v2");
    await compactMemory(memory, messages.slice(memory.keptFrom).concat([{ role: "user", content: "encore" }, { role: "assistant", content: "ok" }, { role: "user", content: "x" }, { role: "assistant", content: "y" }, { role: "user", content: "z" }]), { model: model2 });
    assert.match(model2.calls[0].messages[1].content, /Résumé précédent/);

    // Idempotent when there is nothing to fold.
    const same = await compactMemory(memory, messages.slice(memory.keptFrom), { model: createFauxModel("jamais appelé") });
    assert.deepEqual(same, memory);
  });

  it("over budget, chat() compacts before the call and returns the updated memory", async () => {
    const long = (i) => ({ role: i % 2 ? "assistant" : "user", content: `message ${i} ${"périmètre ".repeat(900)}` });
    const messages = Array.from({ length: 6 }, (_, i) => long(i));
    const model = createFauxModel([
      "Intention : test. Décisions : aucune. État : inchangé.", // the compaction call
      "Réponse après compaction.", // the actual chat call
    ]);
    const out = await chat(root, { path: PROC, messages }, { model, methodDir });
    assert.equal(out.reply, "Réponse après compaction.");
    assert.equal(out.memory.keptFrom, 2);
    assert.match(out.memory.summary, /Intention/);
    // The chat call saw the summary + only the kept tail.
    const chatCall = model.calls[1].messages;
    assert.ok(chatCall.some((m) => m.role === "system" && /Mémoire de la conversation/.test(m.content)));
    assert.equal(chatCall.filter((m) => m.role === "user" || m.role === "assistant").length, 4);
  });

  it("a process card injects the context pack («Contexte fourni») into the system prompt", async () => {
    const model = createFauxModel("vu");
    await chat(root, { path: PROC, messages: [{ role: "user", content: "relis" }] }, { model, methodDir });
    const system = model.calls[0].messages[0].content;
    assert.match(system, /## Contexte fourni/);
    assert.match(system, /### tarifs\/bareme\.md/);
    assert.match(system, /8\.1%/);
  });
});

describe("studio chat — the model frontier coerces before anything merges", () => {
  const current = { data: { id: "doc", title: "Doc" }, body: "Corps initial.\n" };

  it("a JSON string encoding an object is parsed then merged — models double-encode constantly", () => {
    const out = coerceProposalArguments({ data: '{"title":"Doc révisé"}' }, current);
    assert.deepEqual(out.data, { id: "doc", title: "Doc révisé" });
    assert.deepEqual(out.warnings, []);
  });

  it("a prose string, an array or a number never merge: dropped, said, metadata kept whole", () => {
    for (const data of ["désolé voici le titre", ["title", "Doc"], 42]) {
      const out = coerceProposalArguments({ data }, current);
      assert.deepEqual(out.data, current.data, JSON.stringify(data));
      assert.equal(out.warnings.length, 1, JSON.stringify(data));
    }
  });

  it("a non-string body never replaces: dropped, said, current body kept", () => {
    const out = coerceProposalArguments({ body: { text: "Corps revu." } }, current);
    assert.equal(out.body, current.body);
    assert.equal(out.warnings.length, 1);
  });

  it("null arguments mean «rien à changer», not a betrayal — no warning", () => {
    const out = coerceProposalArguments({ data: null, body: null }, current);
    assert.deepEqual(out, { data: current.data, body: current.body, warnings: [] });
  });

  it("an unusable data string yields a diff with ZERO frontmatter lines, and the reply says why", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "chat-coerce-"));
    try {
      await writeFile(
        path.join(root, "doc.md"),
        "---\nid: doc\ntype: document\ntitle: Doc\ndescription: Un document.\n---\nCorps initial.\n",
      );
      const model = createFauxModel([
        { toolCalls: [{ id: "c1", name: "propose_document", arguments: { data: "voici les métadonnées", body: "Corps revu.\n" } }] },
      ]);
      const out = await chat(root, { path: "doc.md", messages: [{ role: "user", content: "revois" }] }, { model });
      // The whole frontmatter survives untouched: not one metadata line in the diff.
      assert.ok(!/^[+-]\s*\w+:/m.test(out.proposal.diff), out.proposal.diff);
      assert.match(out.proposal.diff, /\+ Corps revu\./);
      assert.match(out.reply, /métadonnées illisibles/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("studio chat — a model cannot wipe metadata by accident", () => {
  it("propose_document with data:{} keeps the current frontmatter; partial data MERGES", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "chat-merge-"));
    try {
      await writeFile(
        path.join(root, "doc.md"),
        "---\nid: doc\ntype: document\ntitle: Doc\ndescription: Un document.\n---\nCorps initial.\n",
      );
      const model = createFauxModel([
        { toolCalls: [{ id: "c1", name: "propose_document", arguments: { data: {}, body: "Corps revu." } }] },
        "Voici la proposition.",
      ]);
      const result = await chat(root, { path: "doc.md", messages: [{ role: "user", content: "revois le corps" }] }, { model });
      // The empty data did NOT delete the frontmatter: no `-id:`/`-title:` lines in the diff.
      assert.ok(!/^[+-]\s*id:/m.test(result.proposal.diff), result.proposal.diff);
      assert.match(result.proposal.diff, /\+\s*Corps revu\./);

      const partial = createFauxModel([
        { toolCalls: [{ id: "c2", name: "propose_document", arguments: { data: { title: "Doc révisé" } } }] },
        "Titre revu.",
      ]);
      const second = await chat(root, { path: "doc.md", messages: [{ role: "user", content: "revois le titre" }] }, { model: partial });
      assert.match(second.proposal.diff, /\+\s*title: Doc révisé/);
      assert.ok(!/^[+-]\s*description:/m.test(second.proposal.diff), second.proposal.diff);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
