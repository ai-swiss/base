// Spec coverage: UR-CORE-001
// The context pack, tested WITHOUT disk: inventory + reader injected. Resolution order
// (exact → folder/README → ranker «≈»), dead links flagged, budget respected with the remainder
// listed — and the rendered «Contexte fourni» block.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildContextPack, extractReferences, renderContextPack, summarizeContextPack } from "../tools/core/context-pack.mjs";

const PROCESS_BODY = [
  "# Devis",
  "",
  "1. Consulte le [barème](tarifs/bareme.md).",
  "2. Vérifie la fiche dans `clients/`.",
  "3. Reprends le modèle `modeles/devis-type.md`.",
  "4. Voir [l'archive](archives/2020/tres-vieux.md).",
].join("\n");

const INVENTORY = [
  { path: "devis/SKILL.md", type: "process", id: "devis", title: "Devis", description: "", keywords: [], body: PROCESS_BODY },
  { path: "tarifs/bareme.md", type: "document", id: "bareme", title: "Barème", description: "", keywords: [] },
  { path: "clients/README.md", type: "document", id: "clients-readme", title: "Clients", description: "", keywords: [] },
  { path: "clients/acme.md", type: "document", id: "acme", title: "ACME", description: "", keywords: [] },
  { path: "modeles/devis-standard.md", type: "template", id: "devis-standard", title: "Devis type standard", description: "modèle de devis", keywords: ["devis", "modele"] },
];

const FILES = {
  "tarifs/bareme.md": "Taux : 8.1%",
  "clients/README.md": "Index des fiches clients.",
  "modeles/devis-standard.md": "# Modèle de devis\n…",
};

const reader = async (p) => {
  if (p in FILES) return FILES[p];
  throw new Error(`ENOENT: ${p}`);
};

describe("context pack — resolution exact → dossier → ranker", () => {
  it("extracts links and inline paths, skipping urls, anchors and placeholders", () => {
    const refs = extractReferences(PROCESS_BODY + "\nVoir [doc](https://exemple.ch) et [ancre](#ici) et `devis/[nom].md`.");
    assert.deepEqual(refs, ["tarifs/bareme.md", "archives/2020/tres-vieux.md", "clients/", "modeles/devis-type.md"]);
  });

  it("resolves and injects: exact path, folder README, imperfect ref annotated «≈», dead link flagged", async () => {
    const pack = await buildContextPack(INVENTORY, reader, "devis/SKILL.md", {});

    assert.deepEqual(pack.sections.map((s) => s.path), ["tarifs/bareme.md", "clients/README.md", "modeles/devis-standard.md"]);
    assert.equal(pack.sections[0].content, "Taux : 8.1%");
    assert.match(pack.sections[1].note, /dossier clients\//);
    assert.match(pack.sections[2].note, /référence imparfaite: modeles\/devis-type\.md ≈ modeles\/devis-standard\.md/);

    assert.equal(pack.unresolved.length, 1);
    assert.equal(pack.unresolved[0].ref, "archives/2020/tres-vieux.md");

    const rendered = renderContextPack(pack);
    assert.match(rendered, /^## Contexte fourni/);
    assert.match(rendered, /### tarifs\/bareme\.md/);
    assert.match(rendered, /Référence introuvable: archives\/2020\/tres-vieux\.md/);
  });

  it("respects the budget by whole sections; the remainder is listed, never half-injected", async () => {
    const bigFiles = { ...FILES, "tarifs/bareme.md": "x".repeat(4000) }; // ~1000 tokens
    const bigReader = async (p) => {
      if (p in bigFiles) return bigFiles[p];
      throw new Error("ENOENT");
    };
    const pack = await buildContextPack(INVENTORY, bigReader, "devis/SKILL.md", { budget: 1010 });

    assert.deepEqual(pack.sections.map((s) => s.path), ["tarifs/bareme.md", "clients/README.md"]);
    assert.deepEqual(pack.omitted, ["modeles/devis-standard.md"]);
    assert.match(renderContextPack(pack), /Non injecté \(budget\): modeles\/devis-standard\.md/);
  });

  it("relative refs resolve against the process directory, and the summary carries no contents", async () => {
    const inv = [
      { path: "a/b/SKILL.md", type: "process", id: "p", body: "Voir [x](../shared/x.md)." },
      { path: "a/shared/x.md", type: "document", id: "x" },
    ];
    const pack = await buildContextPack(inv, async (p) => (p === "a/shared/x.md" ? "X!" : Promise.reject(new Error("no"))), "a/b/SKILL.md", {});
    assert.equal(pack.sections[0].path, "a/shared/x.md");

    const summary = summarizeContextPack(pack);
    assert.deepEqual(summary.sections, [{ path: "a/shared/x.md" }]);
    assert.ok(!JSON.stringify(summary).includes("X!"));
  });
});
