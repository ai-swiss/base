// Spec coverage: FR-ROUTE-005
// The generated routing index tree — a projection of the same registry the floor scores, rendered as
// markdown the agent reads to route by progressive disclosure. Pure renderer: no I/O here.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildRoutingRegistry, routeText } from "../tools/core/routing.mjs";
import { renderRoutingIndex } from "../tools/core/index-md.mjs";
import { stringsFor } from "../tools/core/lang/index.mjs";

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

  it("names the configured help target at the foot of the root index, with a working link", () => {
    // A reader who walks this map never calls the router, so the anti-dead-end door has to be ON the
    // map; otherwise it exists only for callers of `route` / `route_request`.
    const files = renderRoutingIndex(buildRoutingRegistry(resources), {
      fallback: { id: "accueil", path: ".ai/agents/concierge/skills/processes/accueil/SKILL.md", title: "Accueil" },
    });
    const root = files[".ai/routing/index.md"];
    assert.match(root, /## Si rien ne couvre la demande/);
    assert.match(root, /\[`accueil`\]\(\.\.\/agents\/concierge\/skills\/processes\/accueil\/SKILL\.md\) \(Accueil\)/);
  });

  it("links a help target OUTSIDE the root by its own absolute path, enclosed when it carries a space", () => {
    // The configured target may live in the framework this root belongs to (FR-ROUTE-009). Counting
    // `..` hops from `.ai/routing/` to an absolute path produced `../../Users/…`, a destination that
    // opens nothing; and a bare destination ends at its first space, which a real installation path
    // ("…/AI Swiss/base") has.
    const spaced = renderRoutingIndex(buildRoutingRegistry(resources), {
      fallback: { id: "accueil", path: "/opt/AI Swiss/base/.ai/agents/concierge-base/skills/processes/accueil/SKILL.md", title: "Accueil BASE" },
    })[".ai/routing/index.md"];
    assert.match(spaced, /\(<\/opt\/AI Swiss\/base\/\.ai\/agents\/concierge-base\/skills\/processes\/accueil\/SKILL\.md>\) \(Accueil BASE\)/);
    assert.doesNotMatch(spaced, /\.\.\/\.\.\/opt/, "no root-relative hops toward an absolute path");

    // No space, no enclosure: the plain form stays the plain form.
    const plain = renderRoutingIndex(buildRoutingRegistry(resources), {
      fallback: { id: "accueil", path: "/opt/base/.ai/agents/concierge-base/skills/processes/accueil/SKILL.md", title: null },
    })[".ai/routing/index.md"];
    assert.match(plain, /\(\/opt\/base\/\.ai\/agents\/concierge-base\/skills\/processes\/accueil\/SKILL\.md\)/);
  });

  it("says nothing about a help target when none is configured", () => {
    const root = renderRoutingIndex(buildRoutingRegistry(resources))[".ai/routing/index.md"];
    assert.doesNotMatch(root, /Si rien ne couvre la demande/);
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

describe("renderRoutingIndex — the translated tables", () => {
  const english = [
    res({ id: "sales", type: "agent", title: "Sales", path: ".ai/agents/sales/AGENT.md", description: "Quotes and offers." }),
    res({
      id: "new-quote",
      type: "process",
      title: "New quote",
      path: ".ai/agents/sales/skills/processes/new-quote/SKILL.md",
      metadata: { use_when: "Prepare a commercial offer.", routing: { avoid_when: ["The customer disputes an invoice."] } },
    }),
  ];

  it("prints the card labels the router itself recognises as a body heading", () => {
    const files = renderRoutingIndex(buildRoutingRegistry(english), { lang: "en" });
    const agent = files[".ai/agents/sales/index.md"];
    assert.match(agent, /\*\*When to use\*\*: Prepare a commercial offer\./);
    assert.match(agent, /\*\*Avoid if\*\*: The customer disputes an invoice\./);
    assert.match(agent, /\*\*When to use this agent\*\*/);
    assert.match(files[".ai/routing/index.md"], /# Routing index — available agents/);
    assert.match(agent, /Generated by `base build routing-index`/);
  });

  const german = [
    res({ id: "sales", type: "agent", title: "Verkauf", path: ".ai/agents/sales/AGENT.md", description: "Offerten und Angebote." }),
    res({
      id: "neue-offerte",
      type: "process",
      title: "Neue Offerte",
      path: ".ai/agents/sales/skills/processes/neue-offerte/SKILL.md",
      metadata: { use_when: "Ein kommerzielles Angebot vorbereiten.", routing: { avoid_when: ["Die Kundschaft bestreitet eine Rechnung."] } },
    }),
  ];

  it("prints the German card labels", () => {
    const files = renderRoutingIndex(buildRoutingRegistry(german), { lang: "de" });
    const agent = files[".ai/agents/sales/index.md"];
    assert.match(agent, /\*\*Wann verwenden\*\*: Ein kommerzielles Angebot vorbereiten\./);
    assert.match(agent, /\*\*Vermeiden, wenn\*\*: Die Kundschaft bestreitet eine Rechnung\./);
    assert.match(agent, /\*\*Wann verwenden Sie diesen Agenten\*\*/);
    assert.match(files[".ai/routing/index.md"], /# Routing-Index – verfügbare Agenten/);
    assert.match(agent, /Generiert von `base build routing-index`/);
  });

  const italian = [
    res({ id: "sales", type: "agent", title: "Vendite", path: ".ai/agents/sales/AGENT.md", description: "Preventivi e offerte." }),
    res({
      id: "nuovo-preventivo",
      type: "process",
      title: "Nuovo preventivo",
      path: ".ai/agents/sales/skills/processes/nuovo-preventivo/SKILL.md",
      metadata: { use_when: "Preparare un'offerta commerciale.", routing: { avoid_when: ["Il cliente contesta una fattura."] } },
    }),
  ];

  it("prints the Italian card labels", () => {
    const files = renderRoutingIndex(buildRoutingRegistry(italian), { lang: "it" });
    const agent = files[".ai/agents/sales/index.md"];
    assert.match(agent, /\*\*Quando usare\*\*: Preparare un'offerta commerciale\./);
    assert.match(agent, /\*\*Evitare se\*\*: Il cliente contesta una fattura\./);
    assert.match(agent, /\*\*Quando usare questo agente\*\*/);
    assert.match(files[".ai/routing/index.md"], /# Indice di routing – agenti disponibili/);
    assert.match(agent, /Generato da `base build routing-index`/);
  });

  // The binding, once per translated table: a process that states its trigger as a SECTION whose
  // heading is the very label the index prints routes on it, because routing.mjs recognises that
  // heading (WHEN_TO_USE_HEADINGS). Label and heading must be the same words, or the map would tell
  // the reader to look for something the corpus never says (FR-ROUTE-005).
  const bindings = [
    { lang: "en", trigger: "When a new customer signs.", expect: /When a new customer signs/ },
    { lang: "de", trigger: "Wenn eine neue Kundschaft unterschreibt.", expect: /Wenn eine neue Kundschaft unterschreibt/ },
    { lang: "it", trigger: "Quando un nuovo cliente firma.", expect: /Quando un nuovo cliente firma/ },
  ];

  for (const { lang, trigger, expect } of bindings) {
    it(`a body section titled like the ${lang} card label is a recognised trigger heading`, () => {
      const heading = stringsFor(lang).cardUseWhen.replace(/\*/g, "");
      const bodyOnly = res({
        id: "onboarding",
        type: "process",
        path: ".ai/agents/sales/skills/processes/onboarding/SKILL.md",
        body: `## ${heading}\n\n${trigger}\n`,
      });
      const derived = routeText(bodyOnly);
      assert.equal(derived.source, "section", `"## ${heading}" must be a recognised trigger heading`);
      assert.match(derived.text, expect);
    });
  }
});
