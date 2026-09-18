#!/usr/bin/env node

import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  evaluateScenario,
  makeRunId,
  parseProbeArgs,
  summarizeResults,
  validateExecutionOptions,
  validateScenario,
  validateSuite,
} from "./contracts.mjs";
import {
  buildHarnessInvocation,
  buildJudgeInvocation,
  harnessResultMetadata,
  harnessVersionCommand,
  judgePrompt,
  judgeSchema,
  normalizeHarnessTranscript,
  parseJudgeResult,
} from "./harnesses.mjs";
import {
  diffSnapshots,
  prepareProbeRoot,
  prepareProbeRuntime,
  runCaptured,
  runStrict,
  snapshotTree,
  writeJson,
  writeMcpConfig,
} from "./workspace.mjs";

const repoRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const definitionsRoot = path.join(repoRoot, "tests", "probes");
const outputRoot = path.join(repoRoot, ".temp", "probes");
const claudeBashPolicy = fileURLToPath(new URL("./claude-bash-policy.mjs", import.meta.url));

export async function loadSelection(options) {
  const suiteFile = confinedDefinition("suites", `${options.suite}.json`);
  const suite = validateSuite(JSON.parse(await fs.readFile(suiteFile, "utf8")), suiteFile);
  const selected = options.scenarios.length ? options.scenarios : suite.scenarios;
  const undeclared = selected.filter((id) => !suite.scenarios.includes(id));
  if (undeclared.length) {
    throw new Error(`Scénario absent de la suite ${suite.id}: ${undeclared.join(", ")}.`);
  }
  const scenarios = [];
  for (const id of selected) {
    const file = confinedDefinition("scenarios", `${id}.json`);
    scenarios.push(validateScenario(JSON.parse(await fs.readFile(file, "utf8")), file));
  }
  return { suite, scenarios };
}

async function main() {
  const options = parseProbeArgs(process.argv.slice(2));
  if (options.list) {
    await printCatalogue();
    return;
  }
  const selection = await loadSelection(options);
  printPlan(options, selection);
  if (!options.yes) {
    console.log("\nSimulation uniquement. Ajoutez --yes, --harness, --model et --effort pour exécuter; Claude Code exige aussi --max-budget-usd.");
    return;
  }
  validateExecutionOptions(options);
  const result = await executeRun(options, selection);
  console.log(`\nPreuves: ${path.relative(repoRoot, result.runDir)}`);
  if (!result.summary.ok) process.exitCode = 1;
}

async function executeRun(options, selection) {
  const startedAt = new Date();
  const revision = (await runStrict("git", ["rev-parse", "--short=12", "HEAD"], { cwd: repoRoot })).stdout.trim();
  const baseRunId = makeRunId({ now: startedAt, suite: selection.suite.id, revision });
  await fs.mkdir(outputRoot, { recursive: true });
  const runDir = await reserveRunDirectory(outputRoot, baseRunId);
  const runId = path.basename(runDir);

  const metadata = await environmentMetadata({ startedAt, revision, runId, options, selection });
  await writeJson(path.join(runDir, "run.json"), { ...metadata, status: "preparing" });

  let runtime;
  try {
    runtime = await prepareProbeRuntime(repoRoot, runDir, selection.scenarios);
    const results = [];
    await writeJson(path.join(runDir, "run.json"), {
      ...metadata,
      status: "running",
      packages: runtime.packages,
    });

    for (const scenario of selection.scenarios) {
      for (let attempt = 1; attempt <= options.repeat; attempt++) {
        let result;
        try {
          result = await executeAttempt({ attempt, options, runDir, runtime, scenario });
        } catch (error) {
          result = await recordAttemptError({ attempt, runDir, scenario, error });
        }
        results.push(result);
        const mark = result.passed ? "PASS" : "FAIL";
        console.log(`[${results.length}/${selection.scenarios.length * options.repeat}] ${mark} ${scenario.id} #${attempt}`);
      }
    }

    const summary = summarizeResults(results);
    const completedAt = new Date().toISOString();
    await writeJson(path.join(runDir, "summary.json"), { ...summary, completedAt, results });
    await fs.writeFile(path.join(runDir, "summary.md"), renderSummary(runId, summary, results), "utf8");
    await writeJson(path.join(runDir, "run.json"), {
      ...metadata,
      status: summary.ok ? "passed" : "failed",
      completedAt,
      packages: runtime.packages,
      summary,
    });
    return { runDir, summary };
  } catch (error) {
    await writeJson(path.join(runDir, "run.json"), {
      ...metadata,
      status: "error",
      completedAt: new Date().toISOString(),
      ...(runtime ? { packages: runtime.packages } : {}),
      error: error.message,
    });
    throw error;
  }
}

export async function reserveRunDirectory(parent, baseRunId) {
  for (let ordinal = 1; ; ordinal++) {
    const suffix = ordinal === 1 ? "" : `-${ordinal}`;
    const candidate = path.join(parent, `${baseRunId}${suffix}`);
    try {
      await fs.mkdir(candidate);
      return candidate;
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
    }
  }
}

async function executeAttempt({ attempt, options, runDir, runtime, scenario }) {
  const attemptDir = attemptDirectory(runDir, scenario.id, attempt);
  const isolatedDir = await createIsolatedAttemptDirectory();
  const root = path.join(isolatedDir, "root");
  const configHome = path.join(isolatedDir, "config");
  await fs.mkdir(root, { recursive: true });
  await fs.mkdir(configHome, { recursive: true });
  try {
    return await executeIsolatedAttempt({
      attempt,
      attemptDir,
      configHome,
      options,
      root,
      runtime,
      scenario,
    });
  } finally {
    const recordedRoot = path.join(attemptDir, "root");
    await fs.rm(recordedRoot, { recursive: true, force: true });
    await fs.cp(root, recordedRoot, { recursive: true, force: false }).catch(() => {});
    await fs.rm(isolatedDir, { recursive: true, force: true });
  }
}

export async function createIsolatedAttemptDirectory() {
  return fs.mkdtemp(path.join(os.tmpdir(), "base-probe-attempt-"));
}

async function executeIsolatedAttempt({ attempt, attemptDir, configHome, options, root, runtime, scenario }) {
  await prepareProbeRoot({ root, configHome, harness: options.harness, runtime, scenario });
  const before = await snapshotTree(root);
  await writeJson(path.join(attemptDir, "workspace-before.json"), before);

  const mcpConfig = scenario.mcp
    ? await writeMcpConfig(attemptDir, runtime.mcpBin, root)
    : null;
  const settings = options.harness === "claude-code" && scenario.access === "workspace-write"
    ? await writeClaudeProbeSettings(attemptDir)
    : null;
  const startedAt = new Date();
  const invocation = buildHarnessInvocation({
    harness: options.harness,
    model: options.model,
    effort: options.effort,
    maxBudgetUsd: options.maxBudgetUsd,
    prompt: scenario.prompt,
    mcpConfig,
    mcpBin: runtime.mcpBin,
    root,
    access: scenario.access ?? "read-only",
    settings,
    additionalDirectories: scenario.setup.kind === "init" && runtime.app
      ? [runtime.app]
      : [],
  });
  const processResult = await runCaptured(invocation.command, invocation.args, {
    cwd: root,
    env: {
      ...process.env,
      BASE_CONFIG_HOME: configHome,
      PATH: runtime.baseBin
        ? `${path.dirname(runtime.baseBin)}${path.delimiter}${process.env.PATH ?? ""}`
        : process.env.PATH ?? "",
    },
    timeout: options.timeoutMs,
  });
  await fs.writeFile(path.join(attemptDir, "stdout.jsonl"), processResult.stdout, "utf8");
  await fs.writeFile(path.join(attemptDir, "stderr.txt"), processResult.stderr, "utf8");

  let transcript = /** @type {any} */ ({ records: [], events: [] });
  let evaluation = /** @type {any} */ ({ passed: false, checks: [], error: null });
  try {
    transcript = normalizeHarnessTranscript(options.harness, processResult.stdout);
  } catch (error) {
    evaluation.error = error.message;
  }
  const after = await snapshotTree(root);
  const changes = diffSnapshots(before, after);
  await appendWorkspaceEvents(transcript.events, changes, root);
  if (!evaluation.error) evaluation = evaluateScenario(transcript.events, scenario.expect);
  await fs.writeFile(
    path.join(attemptDir, "events.jsonl"),
    transcript.events.map((event) => JSON.stringify(event)).join("\n") + (transcript.events.length ? "\n" : ""),
    "utf8",
  );
  await writeJson(path.join(attemptDir, "workspace-after.json"), after);
  await writeJson(path.join(attemptDir, "workspace-changes.json"), changes);

  const deterministicPassed = processResult.code === 0 && !processResult.timedOut && evaluation.passed;
  const semantic = scenario.rubric && deterministicPassed
    ? await executeSemanticJudge({ attemptDir, options, scenario, transcript })
    : null;
  const passed = deterministicPassed && (!semantic || semantic.passed);
  const result = {
    scenarioId: scenario.id,
    title: scenario.title,
    attempt,
    passed,
    startedAt: startedAt.toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt.getTime(),
    command: [invocation.command, ...invocation.args],
    process: processMetadata(processResult),
    harness: harnessResultMetadata(options.harness, transcript.records),
    evaluation,
    ...(semantic ? { semantic } : {}),
  };
  await writeJson(path.join(attemptDir, "result.json"), result);
  return result;
}

async function writeClaudeProbeSettings(attemptDir) {
  const file = path.join(attemptDir, "claude-settings.json");
  await writeJson(file, {
    hooks: {
      PreToolUse: [
        {
          matcher: "Bash",
          hooks: [
            {
              type: "command",
              command: "node",
              args: [claudeBashPolicy],
              timeout: 5,
            },
          ],
        },
      ],
    },
  });
  return file;
}

async function executeSemanticJudge({ attemptDir, options, scenario, transcript }) {
  const answer = [...transcript.events].reverse().find((event) => event.type === "final_answer")?.text;
  if (typeof answer !== "string" || !answer.trim()) {
    return { passed: false, error: "La réponse finale à évaluer manque." };
  }
  const schema = judgeSchema(scenario.rubric);
  const schemaFile = path.join(attemptDir, "judge-schema.json");
  const judgeDir = path.join(attemptDir, "judge-workspace");
  await fs.mkdir(judgeDir);
  await writeJson(schemaFile, schema);
  const invocation = buildJudgeInvocation({
    harness: options.harness,
    model: options.model,
    effort: options.effort,
    maxBudgetUsd: options.maxBudgetUsd,
    prompt: judgePrompt({ userPrompt: scenario.prompt, answer, rubric: scenario.rubric }),
    schema,
    schemaFile,
  });
  const processResult = await runCaptured(invocation.command, invocation.args, {
    cwd: judgeDir,
    env: process.env,
    timeout: options.timeoutMs,
  });
  await fs.writeFile(path.join(attemptDir, "judge-stdout.jsonl"), processResult.stdout, "utf8");
  await fs.writeFile(path.join(attemptDir, "judge-stderr.txt"), processResult.stderr, "utf8");
  let verdict;
  try {
    verdict = parseJudgeResult(options.harness, processResult.stdout, scenario.rubric, answer);
  } catch (error) {
    return {
      passed: false,
      error: error.message,
      command: [invocation.command, ...invocation.args],
      process: processMetadata(processResult),
    };
  }
  return {
    passed: processResult.code === 0 && !processResult.timedOut && verdict.passed,
    criteria: verdict.criteria,
    command: [invocation.command, ...invocation.args],
    process: processMetadata(processResult),
    harness: harnessResultMetadata(options.harness, verdict.records),
  };
}

function processMetadata(result) {
  return {
    code: result.code,
    signal: result.signal,
    timedOut: result.timedOut,
  };
}

async function recordAttemptError({ attempt, runDir, scenario, error }) {
  const result = {
    scenarioId: scenario.id,
    title: scenario.title,
    attempt,
    passed: false,
    completedAt: new Date().toISOString(),
    error: error.message,
  };
  await writeJson(path.join(attemptDirectory(runDir, scenario.id, attempt), "result.json"), result);
  return result;
}

async function environmentMetadata({ startedAt, revision, runId, options, selection }) {
  const versionCommand = harnessVersionCommand(options.harness);
  const [status, harnessVersion, npmVersion] = await Promise.all([
    runStrict("git", ["status", "--porcelain"], { cwd: repoRoot }),
    runStrict(versionCommand.command, versionCommand.args, { cwd: repoRoot }),
    runStrict("npm", ["--version"], { cwd: repoRoot }),
  ]);
  return {
    schema_version: "base.probe-run.v1",
    id: runId,
    startedAt: startedAt.toISOString(),
    revision,
    dirty: Boolean(status.stdout.trim()),
    suite: selection.suite.id,
    scenarios: selection.scenarios.map((scenario) => scenario.id),
    contracts: {
      suite: selection.suite,
      scenarios: selection.scenarios,
    },
    repeat: options.repeat,
    harness: options.harness,
    model: options.model,
    effort: options.effort,
    maxBudgetUsdPerInvocation: options.maxBudgetUsd,
    timeoutMsPerInvocation: options.timeoutMs,
    environment: {
      platform: process.platform,
      architecture: process.arch,
      node: process.version,
      npm: npmVersion.stdout.trim(),
      harness: harnessVersion.stdout.trim(),
    },
  };
}

async function printCatalogue() {
  const names = (await fs.readdir(path.join(definitionsRoot, "suites")))
    .filter((name) => name.endsWith(".json"))
    .sort();
  for (const name of names) {
    const file = path.join(definitionsRoot, "suites", name);
    const suite = validateSuite(JSON.parse(await fs.readFile(file, "utf8")), file);
    console.log(`${suite.id}: ${suite.scenarios.join(", ")}`);
  }
}

function printPlan(options, selection) {
  const attempts = selection.scenarios.length * options.repeat;
  const judgedAttempts = selection.scenarios.filter((scenario) => scenario.rubric).length * options.repeat;
  const invocations = attempts + judgedAttempts;
  console.log(`Suite: ${selection.suite.id}`);
  console.log(`Scénarios: ${selection.scenarios.map((scenario) => scenario.id).join(", ")}`);
  console.log(`Tentatives: ${attempts}`);
  if (options.harness) console.log(`Harness: ${options.harness}`);
  if (options.model) console.log(`Modèle: ${options.model}`);
  if (options.effort) console.log(`Effort: ${options.effort}`);
  console.log(`Évaluations sémantiques: ${judgedAttempts}`);
  if (options.maxBudgetUsd) {
    const invocationLabel = invocations === 1 ? "invocation" : "invocations";
    console.log(`Budget maximal: USD ${(invocations * options.maxBudgetUsd).toFixed(2)} (${options.maxBudgetUsd} par invocation, ${invocations} ${invocationLabel})`);
  }
  console.log(`Délai maximal: ${options.timeoutMs} ms par invocation`);
  console.log("Sortie: .temp/probes");
}

function renderSummary(runId, summary, results) {
  const lines = [
    `# Probe ${runId}`,
    "",
    `Résultat: ${summary.ok ? "PASS" : "FAIL"}`,
    `Tentatives: ${summary.passed}/${summary.total} réussies`,
    "",
  ];
  for (const result of results) {
    const duration = result.durationMs === undefined ? "" : ` · ${result.durationMs} ms`;
    const failedCriteria = result.semantic?.criteria?.filter((item) => !item.passed).map((item) => item.id) ?? [];
    const semantic = failedCriteria.length
      ? ` · critères: ${failedCriteria.join(", ")}`
      : result.semantic?.error ? ` · juge: ${result.semantic.error}` : "";
    lines.push(`- ${result.passed ? "PASS" : "FAIL"} · ${result.scenarioId} · tentative ${result.attempt}${duration}${semantic}`);
  }
  return `${lines.join("\n")}\n`;
}

function attemptDirectory(runDir, scenarioId, attempt) {
  return path.join(runDir, "scenarios", scenarioId, `attempt-${String(attempt).padStart(2, "0")}`);
}

function confinedDefinition(folder, name) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(name)) {
    throw new Error(`Nom de définition invalide: ${name}.`);
  }
  return path.join(definitionsRoot, folder, name);
}

export async function appendWorkspaceEvents(events, changes, root) {
  for (const [change, type] of [
    ["added", "file_added"],
    ["modified", "file_modified"],
    ["removed", "file_removed"],
  ]) {
    for (const file of changes[change]) {
      events.push({ type, path: file, index: events.length });
      if (change === "removed") continue;
      const absolute = path.join(root, file);
      const bytes = await fs.readFile(absolute);
      if (bytes.byteLength > 512 * 1024) continue;
      try {
        const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        events.push({ type: "file_content", path: file, text, index: events.length });
      } catch {
        // Binary files remain proven by their content hash, without embedding bytes in JSONL.
      }
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`probe failed: ${error?.stack ?? error}`);
    process.exit(2);
  });
}
