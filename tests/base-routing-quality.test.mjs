// Spec coverage: FR-ROUTE-007 NFR-ROUTE-001
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { performance } from "node:perf_hooks";
import { afterEach, beforeEach, describe, it } from "node:test";
import { routeRequest, runRouteTests } from "../tools/base-core.mjs";

let tmpDir;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-route-quality-"));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

async function write(relativePath, content) {
  const fullPath = path.join(tmpDir, relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, "utf8");
}

async function writeAgent(agent, description, processes) {
  await write(
    `.ai/agents/${agent}/AGENT.md`,
    `---\nid: ${agent}\ntype: agent\ndescription: ${description}\n---\n# ${agent}\n`,
  );
  for (const process of processes) {
    await write(
      `.ai/agents/${agent}/skills/processes/${process.id}/SKILL.md`,
      [
        "---",
        `id: ${process.id}`,
        "type: process",
        `description: ${process.description}`,
        process.use_when ? `use_when: ${process.use_when}` : "",
        process.routing ? "routing:" : "",
        ...(process.routing?.examples ? ["  examples:", ...process.routing.examples.map((item) => `    - ${item}`)] : []),
        ...(process.routing?.avoid_when ? ["  avoid_when:", ...process.routing.avoid_when.map((item) => `    - ${item}`)] : []),
        "---",
        `# ${process.id}`,
      ].filter(Boolean).join("\n"),
    );
  }
}

describe("routing quality corpus", () => {
  beforeEach(async () => {
    await writeAgent("sales", "Ventes, devis, offres et facturation client.", [
      {
        id: "nouveau-devis",
        description: "Créer une offre ou un devis pour un client.",
        use_when: "Quand l'utilisateur veut préparer une nouvelle offre commerciale ou un devis client.",
        routing: {
          examples: ["prépare une proposition pour Dupont", "faire une offre commerciale"],
          avoid_when: ["le client conteste une facture existante"],
        },
      },
      {
        id: "contestation-facture",
        description: "Traiter une contestation de facture existante.",
        use_when: "Quand un client conteste une facture déjà émise.",
      },
    ]);
    await writeAgent("hr", "Ressources humaines, recrutement, entretiens et départs collaborateurs.", [
      {
        id: "publier-offre",
        description: "Publier une offre d'emploi.",
        use_when: "Quand l'utilisateur veut rédiger ou publier une annonce de recrutement.",
      },
      {
        id: "depart-collaborateur",
        description: "Accompagner une fin de relation de travail.",
        use_when: "Quand un collaborateur quitte l'entreprise ou qu'il faut préparer un offboarding.",
      },
    ]);
    await write(
      "base.config.json",
      JSON.stringify({
        rankers: [{
          type: "semanticHybrid",
          aliases: {
            proposition: ["offre commerciale", "devis client"],
            offboarding: ["fin relation", "quitte l'entreprise", "depart collaborateur"],
          },
        }],
      }),
    );
  });

  it("protects representative paraphrases and counter-examples with route fixtures", async () => {
    await write(".ai/routing/route-tests.json", JSON.stringify([
      { request: "prépare une proposition pour Dupont", expect: { status: "routed", agent: "sales", process: "nouveau-devis" } },
      { request: "le client conteste une facture existante", expect: { status: "routed", agent: "sales", process: "contestation-facture" } },
      { request: "offboarding d'un collaborateur", expect: { status: "routed", agent: "hr", process: "depart-collaborateur" } },
      { request: "publier une annonce de recrutement", expect: { status: "routed", agent: "hr", process: "publier-offre" } },
      { request: "zzqq wibble flumph", expect: { status: "out_of_scope" } },
    ]));

    const result = await runRouteTests(tmpDir);

    assert.equal(result.ok, true, JSON.stringify(result.failures, null, 2));
    assert.equal(result.passed, 5);
  });

  it("abstains when near-duplicate processes are deliberately too close", async () => {
    await writeAgent("support", "Support client et tickets.", [
      {
        id: "repondre-ticket",
        description: "Répondre à un ticket client urgent.",
        use_when: "Quand l'utilisateur veut répondre à un ticket client urgent.",
      },
      {
        id: "traiter-ticket",
        description: "Traiter un ticket client urgent.",
        use_when: "Quand l'utilisateur veut traiter un ticket client urgent.",
      },
    ]);

    const out = await routeRequest(tmpDir, "ticket client urgent");

    assert.equal(out.status, "ambiguous");
    assert.equal(out.reason_code, "two_close_candidates");
    assert.equal(out.process, null);
  });
});

describe("routing scale smoke", () => {
  it("routes over a large synthetic agent/process set within a stable budget", async () => {
    const agentCount = 30;
    const processesPerAgent = 20;
    for (let i = 0; i < agentCount; i++) {
      const agent = `domain-${i}`;
      const processes = [];
      for (let j = 0; j < processesPerAgent; j++) {
        processes.push({
          id: `process-${i}-${j}`,
          description: `Process ${j} for domain ${i}.`,
          use_when: `Quand l'utilisateur demande la tâche unique scale-${i}-${j}.`,
        });
      }
      await writeAgent(agent, `Agent synthétique ${i}.`, processes);
    }

    const start = performance.now();
    const out = await routeRequest(tmpDir, "scale-27-13");
    const elapsedMs = performance.now() - start;

    assert.equal(out.status, "routed");
    assert.equal(out.agent.id, "domain-27");
    assert.equal(out.process.id, "process-27-13");
    // Generous sanity ceiling only — correctness is asserted above; this catches a pathological
    // blow-up without flaking on a loaded CI runner.
    assert.ok(elapsedMs < 30_000, `routing took ${elapsedMs.toFixed(1)}ms`);
  });
}
);
