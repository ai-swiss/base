// Spec coverage: FR-BUILD-006
// A VIEW: one door onto a subset of a root. The projection is pure (resources in, files out), so the
// rules are proven here with no filesystem: what a view lists, where its links point, and what it
// refuses to be (a boundary).

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildViewArtifacts, viewDir, viewShortcuts } from "../tools/core/views.mjs";

const res = (o) => ({ keywords: [], metadata: {}, body: "", content: "", ...o });
const resources = [
  res({ id: "support", type: "agent", title: "Support", path: ".ai/agents/support/AGENT.md", description: "Le support client.", use_when: "Quand un client signale un problème." }),
  res({ id: "repondre-ticket", type: "process", title: "Répondre à un ticket", path: ".ai/agents/support/skills/processes/ticket/SKILL.md", metadata: { use_when: "Quand un client signale un problème." } }),
  res({ id: "ventes", type: "agent", title: "Ventes", path: ".ai/agents/ventes/AGENT.md", description: "Les offres.", use_when: "Quand un client demande une offre." }),
  res({ id: "nouveau-devis", type: "process", title: "Nouveau devis", path: ".ai/agents/ventes/skills/processes/devis/SKILL.md", metadata: { use_when: "Quand un client demande une offre." } }),
];
const view = { entry: "support", agents: ["support"], include: ["support/"] };

describe("buildViewArtifacts — a door onto part of a root", () => {
  it("lists only the view's agents, and carries the root's own router body", () => {
    const files = buildViewArtifacts("support", view, { resources, tools: ["claude-code"] });
    const entry = files.find((f) => f.path === `${viewDir("support")}/CLAUDE.md`);
    assert.ok(entry, "the entry point of the declared tool");
    assert.match(entry.content, /tu es le routeur/, "one canonical router body, not a second one");
    assert.match(entry.content, /## Vue «support»/);
    assert.match(entry.content, /Le support client\./, "the entry agent's card opens the door");

    const index = files.find((f) => f.path === `${viewDir("support")}/routing/index.md`);
    assert.match(index.content, /`support`/);
    assert.doesNotMatch(index.content, /ventes/, "an agent outside the view is not proposed");
  });

  it("says where the files live: nothing is copied into the view", () => {
    const [entry] = buildViewArtifacts("support", view, { resources, tools: ["claude-code"] })
      .filter((f) => f.path.endsWith("CLAUDE.md"));
    assert.match(entry.content, /Les fichiers vivent à la racine/);
    assert.match(entry.content, /\[support\/\]\(\.\.\/\.\.\/\.\.\/support\/\)/, "the included folders are reachable from inside the view");
  });

  it("points its process links at the real files at the root", () => {
    const files = buildViewArtifacts("support", view, { resources, tools: ["claude-code"] });
    const agentIndex = files.find((f) => f.path.endsWith("agents/support/index.md"));
    assert.match(agentIndex.content, /\]\((\.\.\/)+\.ai\/agents\/support\/skills\/processes\/ticket\/SKILL\.md\)/);
  });

  it("writes the entry point of each declared tool, and the generic one when none is declared", () => {
    const cursor = buildViewArtifacts("support", view, { resources, tools: ["cursor"] }).map((f) => f.path);
    assert.ok(cursor.includes(`${viewDir("support")}/.cursor/rules/assistant.mdc`));
    assert.equal(cursor.includes(`${viewDir("support")}/CLAUDE.md`), false);

    const none = buildViewArtifacts("support", view, { resources, tools: [] }).map((f) => f.path);
    assert.ok(none.includes(`${viewDir("support")}/BASE_BOOTSTRAP.md`));
  });

  it("writes the view's own context in the root's language, like every other file BASE writes", () => {
    // A view writes into the user's folder, so its words follow the root's language. A French
    // paragraph spliced into a German entry point was the one place this wave still hard-coded.
    const de = buildViewArtifacts("support", view, { resources, tools: ["claude-code"], lang: "de" });
    const entry = de.find((f) => f.path.endsWith("CLAUDE.md"));
    assert.match(entry.content, /## Sicht/);
    assert.doesNotMatch(entry.content, /Cette vue|Les fichiers vivent/);
    assert.match(entry.content, /Arbeitsordner dieser Sicht:/);
    // And the map inside the view follows too.
    const index = de.find((f) => f.path.endsWith("routing/index.md"));
    assert.match(index.content, /Wann verwenden/);
  });

  it("gives one shortcut per declared tool, and says what the tool needs to read the root", () => {
    const [shortcut] = viewShortcuts("support", "/home/pme/dossier", ["claude-code"]);
    assert.match(shortcut.line, /alias support='cd "\/home\/pme\/dossier\/\.ai\/views\/support" && claude --add-dir "\/home\/pme\/dossier"'/);
    assert.match(shortcut.note, /--add-dir/);
  });
});
