#!/usr/bin/env node
// `base eval` — run a scenario (or a suite) against a real BASE process; print + persist a report.
// A thin CLI over tools/eval/orchestrate.mjs (the same path the Studio "Run" panel uses).
//
// Usage:
//   node tools/eval/run.mjs --root <dir> --agent <id> --process <id> --scenarios <file|dir> [flags]
//
// Provider / model flags:
//   --ollama                 run on a local Ollama (else OpenAI-compatible; needs OPENAI_API_KEY)
//   --model <name>           default model for all three roles
//   --base-url <url>         override the provider endpoint (e.g. remote Ollama, internal gateway)
//   --runner-model <name>    model for the simulated user (defaults to --model)
//   --evaluator-model <name> model for the judge (defaults to --model)
//   --evaluator-openai       run the judge on OpenAI-compatible even when --ollama runs the SUT
//   --evaluator-base-url <url>  endpoint for the judge's provider
//   --json-mode              request response_format json_object for runner+judge (Ollama/OpenAI)
//   --no-preflight           skip the provider/model reachability check
//   --maxTurns <n>
//
// scenario JSON: { "id": "...", "seedInput": "...", "goals": ["..."], "persona"?: "..." }  (or an array)

import { pathToFileURL } from "node:url";
import { runEvaluation, validateRun } from "./orchestrate.mjs";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) args[key] = true;
    else { args[key] = next; i++; }
  }
  return args;
}

const str = (v) => (typeof v === "string" && v ? v : undefined);

// Resolve the three roles (sut/runner/judge) from parsed CLI args. The judge can run on a different
// provider/model/endpoint than the SUT. Pure (no I/O), so it is unit-testable in isolation.
export function buildRolesFromArgs(args) {
  const useOllama = Boolean(args.ollama);
  const baseUrl = str(args["base-url"]);
  const defaultModel = str(args.model) || (useOllama ? "qwen3.5:9b-q4_K_M" : "gpt-4o-mini");

  const judgeOnOllama = useOllama && !args["evaluator-openai"];
  return {
    sut: { useOllama, model: defaultModel, baseUrl },
    runner: { useOllama, model: str(args["runner-model"]) || defaultModel, baseUrl },
    judge: {
      useOllama: judgeOnOllama,
      model: str(args["evaluator-model"]) || (judgeOnOllama ? defaultModel : str(args.model) || "gpt-4o-mini"),
      baseUrl: str(args["evaluator-base-url"]) || (judgeOnOllama ? baseUrl : undefined),
    },
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { root, agent, process: processId, scenarios: scenariosPath } = args;
  if (!root || !agent || !processId || !scenariosPath) {
    console.error("Usage: node tools/eval/run.mjs --root <dir> --agent <id> --process <id> --scenarios <file|dir> [--ollama] [--model <name>] [--maxTurns <n>]");
    process.exit(2);
  }

  const roles = buildRolesFromArgs(args);

  if (!args["no-preflight"]) {
    const problems = await validateRun(roles);
    if (problems.length) {
      console.error("Cannot start the evaluation — fix this and re-run:\n");
      for (const p of problems) console.error(`  • ${p}\n`);
      process.exit(2);
    }
  }

  const jsonMode = Boolean(args["json-mode"]);
  const where = (r) => `${r.useOllama ? "ollama" : "openai"} ${r.model}${r.baseUrl ? ` @ ${r.baseUrl}` : ""}`;
  console.log(`Eval: ${agent}/${processId} on ${root}`);
  console.log(`  SUT/runner: ${where(roles.sut)}`);
  console.log(`  judge     : ${where(roles.judge)}${jsonMode ? "  (json-mode)" : ""}\n`);

  const { report, file } = await runEvaluation({
    root,
    agentId: agent,
    processId,
    scenariosPath,
    roles,
    jsonMode,
    maxTurns: Number(args.maxTurns) || 6,
    onProgress: (result, done, total) => {
      const v = result.verdict;
      const tag = !v ? "ERROR" : v.outcome === "goal_met" ? "PASS" : v.outcome.toUpperCase();
      const detail = !v
        ? `  (${result.error ?? result.stopReason})`
        : v.failureMode
          ? `  (${v.failureMode}/${v.severity})`
          : "";
      console.log(`[${done}/${total}] ${tag.padEnd(13)} ${result.scenarioId ?? "?"}${detail}`);
    },
  });

  console.log(`\nPass rate: ${(report.passRate * 100).toFixed(0)}%  (${report.outcomes.goal_met}/${report.total})${report.errors ? `  ·  ${report.errors} en erreur` : ""}`);
  const modes = Object.entries(report.byFailureMode).sort((a, b) => b[1] - a[1]);
  if (modes.length) console.log(`Top failure modes: ${modes.map(([m, n]) => `${m}×${n}`).join(", ")}`);
  for (const h of report.fixHints) console.log(`  fix [${h.scenarioId}]: ${h.fixHint}`);

  console.log(`\nReport: ${file}`);
}

// Only launch when run as a script (not when imported by a test). process.argv[1] is the entry file.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`eval failed: ${error?.stack ?? error}`);
    process.exit(1);
  });
}
