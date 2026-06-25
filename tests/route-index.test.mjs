// Spec coverage: FR-ROUTE-005
// The generated routing index tree — a projection of the same registry the floor scores, rendered as
// markdown the agent reads to route by progressive disclosure. Pure renderer: no I/O here.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildRoutingRegistry } from "../tools/core/routing.mjs";
import { renderRoutingIndex } from "../tools/core/index-md.mjs";

const res = (o) => ({ keywords: [], metadata: {}, body: "", ...o });

const resources = [
  res({ id: "sales", type: "agent", title: "Ventes", path: ".ai/agents/sales/AGENT.md", description: "Ventes, devis et offres." }),
  res({
    id: "nouveau-devis",
    type: "process",
    title: "Nouveau devis",
    path: ".ai/agents/sales/skills/processes/nouveau-devis/SKILL.md",
    metadata: { use_when: "Préparer une offre commerciale.", routing: { avoid_when: ["Le client conteste une facture."] } },
  }),
];

describe("renderRoutingIndex — the generated routing index tree", () => {
  it("renders a root index and a per-agent index with correct relative links", () => {
    const files = renderRoutingIndex(buildRoutingRegistry(resources));
    assert.ok(files[".ai/routing/index.md"], "root index present");
    assert.ok(files[".ai/agents/sales/index.md"], "agent index present");
    assert.match(files[".ai/routing/index.md"], /\(\.\.\/agents\/sales\/index\.md\)/);

    const agent = files[".ai/agents/sales/index.md"];
    assert.match(agent, /Nouveau devis/);
    assert.match(agent, /\(skills\/processes\/nouveau-devis\/SKILL\.md\)/);
    assert.match(agent, /Quand l'utiliser.*Préparer une offre commerciale/s);
    assert.match(agent, /Éviter si.*conteste une facture/s);
    assert.match(agent, /Généré par `base build routing-index`/);
  });

  it("is deterministic — regenerating yields byte-identical files (no timestamp)", () => {
    assert.deepEqual(renderRoutingIndex(buildRoutingRegistry(resources)), renderRoutingIndex(buildRoutingRegistry(resources)));
  });

  it("skips orphan processes — only the root index, no agent index", () => {
    const files = renderRoutingIndex(buildRoutingRegistry([
      res({ id: "loose", type: "process", path: "skills/processes/loose/SKILL.md", description: "x" }),
    ]));
    assert.deepEqual(Object.keys(files), [".ai/routing/index.md"]);
  });

  it("omits a process its agent denies — the deny invariant reaches the index-read path", () => {
    const files = renderRoutingIndex(buildRoutingRegistry([
      res({ id: "rh", type: "agent", title: "RH", path: ".ai/agents/rh/AGENT.md", description: "Ressources humaines.", metadata: { routing: { deny: ["process:paie-secrete"] } } }),
      res({ id: "paie-secrete", type: "process", path: ".ai/agents/rh/skills/processes/paie/SKILL.md", metadata: { use_when: "Consulter la paie." } }),
      res({ id: "conge", type: "process", path: ".ai/agents/rh/skills/processes/conge/SKILL.md", metadata: { use_when: "Poser un congé." } }),
    ]));
    const agentIndex = files[".ai/agents/rh/index.md"];
    assert.ok(!agentIndex.includes("paie-secrete"), "denied process must be absent from the index");
    assert.ok(agentIndex.includes("conge"), "an allowed process is still listed");
  });

  it("omits a root-denied agent entirely (base.config root deny)", () => {
    const files = renderRoutingIndex(buildRoutingRegistry([
      res({ id: "sales", type: "agent", title: "Ventes", path: ".ai/agents/sales/AGENT.md", description: "Ventes." }),
      res({ id: "experimental", type: "agent", title: "Exp", path: ".ai/agents/experimental/AGENT.md", description: "Expérimental." }),
    ]), { rootDeny: ["agent:experimental"] });
    assert.ok(!files[".ai/routing/index.md"].includes("experimental"), "root-denied agent absent from root index");
    assert.equal(files[".ai/agents/experimental/index.md"], undefined, "no index file for a root-denied agent");
    assert.ok(files[".ai/routing/index.md"].includes("sales"), "an allowed agent is still listed");
  });
});
