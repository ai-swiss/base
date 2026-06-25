// Spec coverage: FR-SCALE-003
// The acceptance test for the scale path: an indexed route must return the SAME status / agent /
// process / reason_code as BASE's in-memory `routeRequest`. We compare the two decisions directly for
// each request, so the test proves equivalence regardless of what the "right" answer happens to be.

import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  ROUTING_DEFAULTS,
  composeRankers,
  decideRoute,
  deriveRoutingSignals,
  inventoryResources,
  lexicalRanker,
  resolveConfig,
  routeAvoidReasons,
  routeRequest,
  routeTerms,
  semanticHybridRanker,
} from "../../../tools/base-core.mjs";
import { buildIndex, routeWithIndex } from "../index.mjs";

let dir;
beforeEach(async () => { dir = await fs.mkdtemp(path.join(os.tmpdir(), "base-index-equiv-")); });
afterEach(async () => { await fs.rm(dir, { recursive: true, force: true }); });

async function write(relativePath, content) {
  const full = path.join(dir, relativePath);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content, "utf8");
}

async function writeAgent(agent, description, processes) {
  await write(`.ai/agents/${agent}/AGENT.md`, `---\nid: ${agent}\ntype: agent\ndescription: ${description}\n---\n# ${agent}\n`);
  for (const p of processes) {
    await write(
      `.ai/agents/${agent}/skills/processes/${p.id}/SKILL.md`,
      [
        "---",
        `id: ${p.id}`,
        "type: process",
        `description: ${p.description}`,
        p.use_when ? `use_when: ${p.use_when}` : "",
        p.avoid_when ? "routing:" : "",
        ...(p.avoid_when ? ["  avoid_when:", ...p.avoid_when.map((a) => `    - ${a}`)] : []),
        "---",
        `# ${p.id}`,
      ].filter(Boolean).join("\n"),
    );
  }
}

async function indexedDecision(root, request, extraRankers = []) {
  const resources = await inventoryResources(root);
  const cfg = await resolveConfig(root);
  const index = await buildIndex(resources, { deriveSignals: deriveRoutingSignals });
  return routeWithIndex(index, request, {
    rank: composeRankers([lexicalRanker, ...(cfg.rankers ?? []), ...extraRankers]),
    decide: decideRoute,
    routeTerms,
    routeAvoidReasons,
    thresholds: { ...ROUTING_DEFAULTS, ...(cfg.routing ?? {}) },
    root,
  });
}

describe("indexed routing equals in-memory routing", () => {
  beforeEach(async () => {
    await writeAgent("sales", "Ventes, devis, offres et facturation client.", [
      { id: "nouveau-devis", description: "Créer une offre ou un devis.", use_when: "Quand l'utilisateur veut préparer une nouvelle offre commerciale ou un devis client.", avoid_when: ["le client conteste une facture existante"] },
      { id: "contestation-facture", description: "Traiter une contestation de facture.", use_when: "Quand un client conteste une facture déjà émise." },
    ]);
    await writeAgent("hr", "Ressources humaines, recrutement et départs collaborateurs.", [
      { id: "publier-offre", description: "Publier une offre d'emploi.", use_when: "Quand l'utilisateur veut publier une annonce de recrutement." },
      { id: "depart-collaborateur", description: "Accompagner un départ.", use_when: "Quand un collaborateur quitte l'entreprise ou qu'il faut préparer un offboarding." },
    ]);
  });

  const requests = [
    "préparer une nouvelle offre commerciale pour un client",
    "le client conteste une facture existante",
    "préparer un offboarding pour un collaborateur qui quitte l'entreprise",
    "publier une annonce de recrutement",
    "zzqq wibble flumph plover",
  ];

  it("returns the same status, agent, process and reason_code for every request", async () => {
    const seenStatuses = new Set();
    for (const request of requests) {
      const memory = await routeRequest(dir, request);
      const indexed = await indexedDecision(dir, request);
      seenStatuses.add(memory.status);
      assert.equal(indexed.status, memory.status, `status for "${request}"`);
      assert.equal(indexed.reason_code ?? null, memory.reason_code ?? null, `reason_code for "${request}"`);
      assert.equal(indexed.agent?.id ?? null, memory.agent?.id ?? null, `agent for "${request}"`);
      assert.equal(indexed.process?.id ?? null, memory.process?.id ?? null, `process for "${request}"`);
    }
    assert.ok(seenStatuses.has("routed"), "corpus exercises a routed case");
    assert.ok(seenStatuses.has("out_of_scope"), "corpus exercises an out_of_scope case");
  });

  it("keeps parity when a semantic ranker finds a candidate with no lexical posting hit", async () => {
    const semanticOnly = async (resource) =>
      resource.id === "depart-collaborateur"
        ? { score: 100, reasons: ["semantic:test"] }
        : { score: 0, reasons: [] };
    const config = { rankers: [semanticOnly], validators: [], policy: null, auth: null, routing: null };

    const memory = await routeRequest(dir, "handover", { config });
    const indexed = await indexedDecision(dir, "handover", [semanticOnly]);

    assert.equal(indexed.status, memory.status);
    assert.equal(indexed.agent?.id ?? null, memory.agent?.id ?? null);
    assert.equal(indexed.process?.id ?? null, memory.process?.id ?? null);
    assert.equal(indexed.process?.id, "depart-collaborateur");
  });

  it("passes root through to custom rankers", async () => {
    const seenRoots = [];
    const rootAwareRanker = async (resource, _terms, ctx) => {
      seenRoots.push(ctx.root);
      return resource.id === "nouveau-devis" && ctx.root === dir
        ? { score: 100, reasons: ["root-aware"] }
        : { score: 0, reasons: [] };
    };

    const indexed = await indexedDecision(dir, "opaque", [rootAwareRanker]);

    assert.equal(indexed.status, "routed");
    assert.equal(indexed.process.id, "nouveau-devis");
    assert.ok(seenRoots.every((root) => root === dir));
  });

  // Locks the field-coverage invariant: the in-core `semanticHybridRanker` iterates HYBRID_FIELDS, so
  // `toResource` must project every field it reads (route_text/title/description/keywords/id/path, and
  // body as ""). If a field were added to HYBRID_FIELDS but not to the index projection, an alias- or
  // fuzzy-driven score would diverge here. "handover" has no lexical posting, so this also exercises
  // candidateMode:"all" feeding a semantic match the lexical postings would miss.
  it("stays equivalent for the in-core semanticHybrid ranker, including alias-only matches", async () => {
    const hybrid = semanticHybridRanker({ aliases: { handover: ["offboarding", "quitte l'entreprise"] } });
    for (const request of ["préparer une nouvelle offre commerciale", "handover", "zzqq wibble flumph"]) {
      const memory = await routeRequest(dir, request, {
        config: { rankers: [hybrid], validators: [], policy: null, auth: null, routing: null },
      });
      const indexed = await indexedDecision(dir, request, [hybrid]);
      assert.equal(indexed.status, memory.status, `status for "${request}"`);
      assert.equal(indexed.agent?.id ?? null, memory.agent?.id ?? null, `agent for "${request}"`);
      assert.equal(indexed.process?.id ?? null, memory.process?.id ?? null, `process for "${request}"`);
    }
  });
});
