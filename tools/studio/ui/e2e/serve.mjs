#!/usr/bin/env node
// Boots an isolated Studio instance for the Playwright E2E run. It copies the assistant-devis example
// into a throwaway root (so the edit -> commit journey can mutate freely without touching the repo),
// seeds a deterministic experiment report + run for the Monitor view, then starts dev.mjs on dedicated
// ports (5199 / 4399) so it never collides with a normal `npm run dev` on the defaults.

import { spawn } from "node:child_process";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const uiDir = path.dirname(path.dirname(fileURLToPath(import.meta.url))); // e2e/ -> ui/
const repoRoot = path.resolve(uiDir, "..", "..", "..");
const source = path.join(repoRoot, "exemples", "assistant-devis");
const wsSource = path.join(repoRoot, "exemples", "agence-multi-clients");
const runRoot = path.join(uiDir, "e2e", ".run");
const wsRunRoot = path.join(uiDir, "e2e", ".run-ws");

async function prepare() {
  await rm(runRoot, { recursive: true, force: true });
  await cp(source, runRoot, { recursive: true });

  // Seed the faux provider (served below on 127.0.0.1:4666) so the eval pickers and the preflight
  // path work from the first spec; the settings spec adds a SECOND provider through the UI.
  // "faux-distant" hits the SAME stub but is explicitly flagged remote — the egress journey.
  await writeFile(
    path.join(runRoot, ".ai", "studio.settings.json"),
    JSON.stringify(
      {
        providers: [
          { id: "faux", type: "openai-compatible", baseUrl: "http://127.0.0.1:4666/v1" },
          { id: "faux-distant", type: "openai-compatible", baseUrl: "http://127.0.0.1:4666/v1", locality: "remote" },
        ],
        aliases: {},
        defaults: { runner: "faux/faux-mini", judge: "faux/faux-mini" },
        discovered: {},
      },
      null,
      2,
    ),
  );

  // A confidential reference of the nouveau-devis process: with a remote model, the pack withholds
  // it and the chat shows the «retenu» badge.
  const tarifPath = path.join(runRoot, "catalogue", "regles-tarification.md");
  const tarif = await readFile(tarifPath, "utf8");
  await writeFile(
    tarifPath,
    `---\nschema_version: base.resource.v1\nid: regles-tarification\ntype: document\ntitle: Règles de tarification\ndescription: Règles internes de tarification.\nconfidential: true\n---\n${tarif}`,
  );

  // A seeded field pile: one open friction + two abstentions for the Terrain journey.
  await mkdir(path.join(runRoot, ".ai", "feedback"), { recursive: true });
  await writeFile(
    path.join(runRoot, ".ai", "feedback", "2026-06-11T0832_nouveau-devis.md"),
    "---\nprocess: .ai/agents/assistant-devis/skills/processes/nouveau-devis/SKILL.md\nreported: 2026-06-11\nvia: assistant\nstatus: open\n---\n# le barème cité n'est plus le bon\n\nl'utilisateur a dû corriger le taux à la main (7.7 → 8.1)\n",
  );
  await writeFile(
    path.join(runRoot, ".ai", "feedback", "abstentions.jsonl"),
    '{"at":"2026-06-01T00:00:00Z","query":"résilier le bail du local","verdict":"out_of_scope"}\n{"at":"2026-06-02T00:00:00Z","query":"Résilier le bail du local","verdict":"out_of_scope"}\n',
  );

  // Deterministic experiment data for the Monitor view, independent of any local runs: clear the
  // derived runs/reports, keep (and guarantee) a scenarios spec so the launch reaches the preflight.
  const exp = path.join(runRoot, ".ai", "experiments");
  await rm(path.join(exp, "runs"), { recursive: true, force: true });
  await rm(path.join(exp, "reports"), { recursive: true, force: true });
  await mkdir(path.join(exp, "reports"), { recursive: true });
  await mkdir(path.join(exp, "runs"), { recursive: true });
  await mkdir(path.join(exp, "scenarios"), { recursive: true });
  await writeFile(
    path.join(exp, "scenarios", "e2e.json"),
    JSON.stringify([{ id: "devis-e2e-scn", seedInput: "J'ai besoin d'un devis", goals: ["Produire un devis chiffré"] }], null, 2),
  );
  await writeFile(
    path.join(exp, "reports", "report-e2e.json"),
    JSON.stringify(
      {
        total: 2, passRate: 0.5, errors: 0,
        outcomes: { goal_met: 1, partially_met: 0, not_met: 1 },
        bySeverity: { blocker: 1 }, byFailureMode: { wrong_routing: 1 },
        fixHints: [{ scenarioId: "devis-e2e", failureMode: "wrong_routing", fixHint: "exiger une validation humaine" }],
        scenarios: [],
      },
      null,
      2,
    ),
  );
  await writeFile(
    path.join(exp, "runs", "devis-e2e.json"),
    JSON.stringify(
      {
        scenarioId: "devis-e2e", sutId: "faux", stopReason: "max_turns",
        process: "nouveau-devis", processPath: ".ai/agents/assistant-devis/skills/processes/nouveau-devis/SKILL.md",
        origin: "simulation", model: "faux:faux-mini", at: new Date().toISOString(),
        contextPack: { sections: [{ path: "catalogue/services.json" }], omitted: [], unresolved: [], withheld: [] },
        turns: [{ index: 0, user: "J'ai besoin d'un devis", assistant: "Voici votre devis", toolCalls: [] }],
        verdict: {
          outcome: "not_met", failureMode: "wrong_routing", severity: "blocker", confidence: 0.8,
          evidence: [{ turn: 0, quote: "devis", why: "non justifié" }], rationale: "le devis n'est pas justifié", fixHint: "corrige",
        },
      },
      null,
      2,
    ),
  );
  await writeFile(
    path.join(exp, "runs", "devis-e2e-ok.json"),
    JSON.stringify(
      {
        scenarioId: "devis-e2e-ok", sutId: "faux", stopReason: "runner_done",
        process: "configuration", processPath: ".ai/agents/assistant-devis/skills/processes/configuration/SKILL.md",
        origin: "simulation", model: "faux:faux-mini", at: new Date().toISOString(),
        turns: [{ index: 0, user: "Configure", assistant: "Fait", toolCalls: [] }],
        verdict: { outcome: "goal_met", failureMode: null, severity: null, confidence: 0.9, evidence: [], rationale: "ok", fixHint: null },
      },
      null,
      2,
    ),
  );
}

await prepare();

// A faux OpenAI-compatible provider for the Settings/ModelPicker AND chat journeys: deterministic
// models for discovery, and a scripted chat behaviour — «ajoute …» returns a propose_document
// tool call built from the document the server actually sent (so the diff is real), «métadonnées»
// echoes which BASE method process reached the context (proving the method injection), anything else
// answers "pong". No real provider, no key, fully offline.
const fauxProvider = http.createServer(async (req, res) => {
  res.setHeader("content-type", "application/json");
  if (req.url?.startsWith("/v1/models")) {
    res.end(JSON.stringify({ data: [{ id: "faux-mini" }, { id: "faux-large" }] }));
    return;
  }
  if (req.url?.startsWith("/v1/chat/completions")) {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const body = JSON.parse(raw || "{}");
    const messages = body.messages ?? [];
    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const system = messages.find((m) => m.role === "system")?.content ?? "";

    // Eval roles (real launch in e2e): the judge and the simulated user identify themselves by
    // their system prompts; answer in their JSON dialects so a run completes deterministically.
    if (/EVALUATOR of an AI assistant transcript/.test(system)) {
      res.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ outcome: "goal_met", confidence: 0.9, evidence: [{ turn: 0, quote: "devis", why: "objectif atteint" }], rationale: "Le devis est préparé proprement.", fixHint: null }) }, finish_reason: "stop" }], usage: {} }));
      return;
    }
    if (/role-playing a USER/.test(system)) {
      res.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ message: "Parfait, merci.", status: "satisfied" }) }, finish_reason: "stop" }], usage: {} }));
      return;
    }
    if (/métadonnées/i.test(lastUser)) {
      const method = system.match(/## Méthode BASE \(([^\s)—]+)/);
      res.end(JSON.stringify({ choices: [{ message: { content: method ? `MÉTHODE reçue : ${method[1]}` : "MÉTHODE absente" }, finish_reason: "stop" }], usage: {} }));
      return;
    }
    if (Array.isArray(body.tools) && body.tools.length && /deux endroits/i.test(lastUser)) {
      // Two DISTANT edits → two selectable blocks: retitle the first line, append a final line.
      const after = system.split("corps :\n")[1] ?? "";
      const docBody = after.split("\n\n## Méthode BASE (")[0];
      const lines = docBody.replace(/\n+$/, "").split("\n");
      lines[0] = `${lines[0]} (révisé)`;
      const revised = `${lines.join("\n")}\nLigne finale ajoutée par le modèle.\n`;
      res.end(JSON.stringify({
        choices: [{
          message: {
            content: "Deux modifications proposées :",
            tool_calls: [{ id: "call_2", type: "function", function: { name: "propose_document", arguments: JSON.stringify({ body: revised }) } }],
          },
          finish_reason: "tool_calls",
        }],
        usage: {},
      }));
      return;
    }
    if (Array.isArray(body.tools) && body.tools.length && /ajoute/i.test(lastUser)) {
      const after = system.split("corps :\n")[1] ?? "";
      const docBody = after.split("\n\n## Méthode BASE (")[0];
      const revised = `${docBody.replace(/\n+$/, "\n")}\nÉtape ajoutée : vérifier la TVA applicable selon le canton.\n`;
      res.end(JSON.stringify({
        choices: [{
          message: {
            content: "Voici la modification :",
            tool_calls: [{ id: "call_1", type: "function", function: { name: "propose_document", arguments: JSON.stringify({ body: revised }) } }],
          },
          finish_reason: "tool_calls",
        }],
        usage: {},
      }));
      return;
    }
    res.end(JSON.stringify({ choices: [{ message: { content: "pong" }, finish_reason: "stop" }], usage: {} }));
    return;
  }
  res.statusCode = 404;
  res.end("{}");
});
fauxProvider.listen(4666, "127.0.0.1");

// Second, independent instance on the WORKSPACE fixture (multi-root behaviours differ — the e2e
// suite runs on both fixtures, per the execution guide). Ports 5198/4398.
await rm(wsRunRoot, { recursive: true, force: true });
await cp(wsSource, wsRunRoot, { recursive: true });

// Third instance on a NON-BASE directory (loose markdown): the Welcome/bootstrap journey.
// Recreated from scratch each run — the e2e test mutates it (init writes the scaffold).
const looseRunRoot = path.join(uiDir, "e2e", ".run-loose");
await rm(looseRunRoot, { recursive: true, force: true });
await mkdir(path.join(looseRunRoot, "procedures"), { recursive: true });
await writeFile(path.join(looseRunRoot, "notes.md"), "# Notes internes\n");
await writeFile(path.join(looseRunRoot, "procedures", "SKILL.md"), "# Relancer un client\n");

// A deliberately tiny chat-context budget so the memory compaction is observable in e2e.
const env = { ...process.env, STUDIO_UI_PORT: "5199", STUDIO_API_PORT: "4399", STUDIO_CHAT_CONTEXT_TOKENS: "60" };
const wsEnv = { ...process.env, STUDIO_UI_PORT: "5198", STUDIO_API_PORT: "4398" };
const looseEnv = { ...process.env, STUDIO_UI_PORT: "5197", STUDIO_API_PORT: "4397" };
const children = [
  spawn("node", [path.join(uiDir, "dev.mjs"), runRoot], { cwd: repoRoot, stdio: "inherit", env }),
  spawn("node", [path.join(uiDir, "dev.mjs"), wsRunRoot], { cwd: repoRoot, stdio: "inherit", env: wsEnv }),
  spawn("node", [path.join(uiDir, "dev.mjs"), looseRunRoot], { cwd: repoRoot, stdio: "inherit", env: looseEnv }),
];

const stop = () => {
  for (const child of children) child.kill("SIGTERM");
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
for (const child of children) child.on("exit", (code) => process.exit(code ?? 0));
