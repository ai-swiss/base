// Spec coverage: FR-PROBE-001, FR-PROBE-002, FR-PROBE-003

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { promisify } from "node:util";
import { describe, it } from "node:test";
import {
  evaluateScenario,
  makeRunId,
  parseProbeArgs,
  validateExecutionOptions,
  validateScenario,
  validateSuite,
} from "../tools/probes/contracts.mjs";
import {
  buildHarnessInvocation,
  buildJudgeInvocation,
  judgePrompt,
  judgeSchema,
  normalizeHarnessTranscript,
  parseJudgeResult,
} from "../tools/probes/harnesses.mjs";
import { isAllowedBaseCommand } from "../tools/probes/claude-bash-policy.mjs";
import {
  appendWorkspaceEvents,
  createIsolatedAttemptDirectory,
  loadSelection,
  reserveRunDirectory,
} from "../tools/probes/run.mjs";
import {
  diffSnapshots,
  entryToolForHarness,
  prepareProbeRoot,
  prepareProbeRuntime,
  runCaptured,
  snapshotTree,
  withPackageBuildLock,
} from "../tools/probes/workspace.mjs";

const execFileAsync = promisify(execFile);
const runner = path.resolve("tools/probes/run.mjs");

describe("model probes — maintainer command contract", () => {
  it("is a dry run by default and makes cost, timeout and evidence location explicit", async () => {
    const { stdout } = await execFileAsync("node", [
      runner,
      "--suite",
      "smoke",
      "--scenario",
      "honest-abstention",
    ]);
    assert.match(stdout, /Simulation uniquement/);
    assert.match(stdout, /Délai maximal: 600000 ms/);
    assert.match(stdout, /Sortie: \.temp\/probes/);
  });

  it("stays outside deterministic and release gates", async () => {
    const pkg = JSON.parse(await fs.readFile(path.resolve("package.json"), "utf8"));
    assert.equal(pkg.scripts.probes, "node tools/probes/run.mjs");
    assert.doesNotMatch(pkg.scripts.check, /probes/);
    assert.doesNotMatch(pkg.scripts["check:release"], /probes/);
  });

  it("requires an explicit harness and model, plus a budget where the harness can enforce one", () => {
    assert.throws(
      () => validateExecutionOptions(parseProbeArgs(["--yes", "--max-budget-usd", "1"])),
      /--harness/,
    );
    assert.throws(
      () => validateExecutionOptions(parseProbeArgs(["--yes", "--harness", "claude-code"])),
      /--model/,
    );
    assert.throws(
      () => validateExecutionOptions(parseProbeArgs(["--yes", "--harness", "claude-code", "--model", "sonnet"])),
      /--effort/,
    );
    assert.throws(
      () => validateExecutionOptions(parseProbeArgs(["--yes", "--harness", "claude-code", "--model", "sonnet", "--effort", "medium"])),
      /--max-budget-usd/,
    );
    assert.doesNotThrow(() =>
      validateExecutionOptions(parseProbeArgs([
        "--yes", "--harness", "claude-code", "--model", "sonnet", "--effort", "medium", "--max-budget-usd", "1",
      ])));
    assert.doesNotThrow(() =>
      validateExecutionOptions(parseProbeArgs([
        "--yes", "--harness", "codex", "--model", "gpt-5", "--effort", "medium",
      ])));
  });

  it("rejects unknown options and invalid numeric limits instead of guessing", () => {
    assert.throws(() => parseProbeArgs(["--cron"]), /Option inconnue/);
    assert.throws(() => parseProbeArgs(["--repeat", "0"]), /entier positif/);
    assert.throws(() => parseProbeArgs(["--max-budget-usd", "free"]), /nombre positif/);
    assert.throws(
      () => validateExecutionOptions(parseProbeArgs([
        "--yes", "--harness", "claude-code", "--model", "opus", "--effort", "heroic", "--max-budget-usd", "1",
      ])),
      /low, medium, high, xhigh, max/,
    );
  });

  it("loads only scenarios declared by the selected suite", async () => {
    const selection = await loadSelection(parseProbeArgs(["--suite", "smoke"]));
    assert.equal(selection.suite.id, "smoke");
    assert.deepEqual(
      selection.scenarios.map((scenario) => scenario.id),
      ["demo-discount", "honest-abstention", "fresh-init-fr"],
    );
    await assert.rejects(
      () => loadSelection(parseProbeArgs(["--suite", "smoke", "--scenario", "forced-routing"])),
      /absent de la suite/,
    );
  });
});

describe("model probes — versioned contracts", () => {
  it("validates closed suite and scenario shapes", () => {
    assert.throws(
      () => validateSuite({ schema_version: "wrong", id: "smoke", scenarios: ["one"] }),
      /schema_version/,
    );
    assert.throws(
      () => validateScenario({
        schema_version: "base.probe-scenario.v1",
        id: "one",
        title: "One",
        prompt: "Hello",
        setup: { kind: "example", example: "demo" },
        expect: { required: [{ type: "future_event" }] },
      }),
      /type d'attente inconnu/,
    );
    assert.throws(
      () => validateSuite({
        schema_version: "base.probe-suite.v1",
        id: "smoke",
        scenarios: ["one"],
        cron: "daily",
      }),
      /champ inconnu: cron/,
    );
    assert.throws(
      () => validateScenario({
        schema_version: "base.probe-scenario.v1",
        id: "one",
        title: "One",
        prompt: "Hello",
        setup: { kind: "example", example: "demo", subpath: "../secret" },
        expect: { required: [{ type: "final_answer", includes: "done" }] },
      }),
      /rester relatif/,
    );
    assert.throws(
      () => validateScenario({
        schema_version: "base.probe-scenario.v1",
        id: "one",
        title: "One",
        access: "workspace-write",
        mcp: true,
        prompt: "Hello",
        setup: { kind: "package" },
        expect: { required: [{ type: "final_answer", includes: "done" }] },
      }),
      /MCP.*lecture seule/,
    );
    assert.throws(
      () => validateScenario({
        schema_version: "base.probe-scenario.v1",
        id: "one",
        title: "One",
        prompt: "Hello",
        setup: { kind: "package", files: { "../secret.md": "secret" } },
        expect: { required: [{ type: "final_answer", includes: "done" }] },
      }),
      /rester dans la racine/,
    );
    assert.throws(
      () => validateScenario({
        schema_version: "base.probe-scenario.v1",
        id: "one",
        title: "One",
        prompt: "Hello",
        setup: { kind: "empty" },
        rubric: [
          { id: "clarity", criterion: "Clear answer." },
          { id: "clarity", criterion: "Still clear." },
        ],
        expect: { required: [{ type: "final_answer" }] },
      }),
      /dupliqué/,
    );
    assert.throws(
      () => validateScenario({
        schema_version: "base.probe-scenario.v1",
        id: "one",
        title: "One",
        companions: ["future-site"],
        prompt: "Hello",
        setup: { kind: "empty" },
        expect: { required: [{ type: "final_answer" }] },
      }),
      /compagnon inconnu/,
    );
  });

  it("makes run folders sortable, UTC-dated and revision-addressed", () => {
    assert.equal(
      makeRunId({
        now: new Date("2026-09-17T07:42:31.123Z"),
        suite: "release",
        revision: "68cf747a478a",
      }),
      "2026-09-17T07-42-31-123Z_release_68cf747a478a",
    );
  });

  it("reserves parallel run folders without overwriting evidence", async () => {
    const parent = await fs.mkdtemp(path.join(os.tmpdir(), "base-probe-runs-"));
    try {
      const [first, second] = await Promise.all([
        reserveRunDirectory(parent, "run"),
        reserveRunDirectory(parent, "run"),
      ]);
      assert.deepEqual([path.basename(first), path.basename(second)].sort(), ["run", "run-2"]);
    } finally {
      await fs.rm(parent, { recursive: true, force: true });
    }
  });
});

describe("model probes — semantic rubric evidence", () => {
  const rubric = [
    { id: "honest-boundary", criterion: "States the limit honestly." },
    { id: "useful-next-step", criterion: "Offers a useful next step." },
  ];
  const answer = "Je ne peux pas organiser cet événement. Souhaitez-vous définir un process adapté?";

  it("builds a tool-free structured judge invocation for each harness", () => {
    const schema = judgeSchema(rubric);
    const prompt = judgePrompt({ userPrompt: "Organise la fête.", answer, rubric });
    const claude = buildJudgeInvocation({
      harness: "claude-code",
      model: "opus",
      effort: "medium",
      maxBudgetUsd: 1,
      prompt,
      schema,
      schemaFile: "/tmp/judge-schema.json",
    });
    assert.match(claude.args.join(" "), /--safe-mode .*--tools\s+$/);
    assert.match(claude.args.join(" "), /--json-schema/);
    const codex = buildJudgeInvocation({
      harness: "codex",
      model: "gpt-5",
      effort: "medium",
      maxBudgetUsd: null,
      prompt,
      schema,
      schemaFile: "/tmp/judge-schema.json",
    });
    assert.match(codex.args.join(" "), /--ignore-rules/);
    assert.match(codex.args.join(" "), /features\.apps=false/);
    assert.match(codex.args.join(" "), /features\.plugins=false/);
    assert.match(codex.args.join(" "), /features\.shell_tool=false/);
    assert.match(codex.args.join(" "), /--output-schema \/tmp\/judge-schema\.json/);
  });

  it("accepts only complete verdicts backed by exact answer quotes", () => {
    const structured = {
      criteria: [
        { id: "honest-boundary", passed: true, evidence: "Je ne peux pas organiser cet événement.", reason: "La limite est explicite." },
        { id: "useful-next-step", passed: true, evidence: "Souhaitez-vous définir un process adapté?", reason: "Une suite concrète est proposée." },
      ],
    };
    const trace = JSON.stringify({ type: "result", subtype: "success", structured_output: structured });
    assert.equal(parseJudgeResult("claude-code", trace, rubric, answer).passed, true);
    structured.criteria[1].evidence = "Citation inventée";
    assert.throws(
      () => parseJudgeResult("claude-code", JSON.stringify({ type: "result", subtype: "success", structured_output: structured }), rubric, answer),
      /citation exacte/,
    );
    assert.throws(
      () => parseJudgeResult("claude-code", [
        JSON.stringify({ type: "assistant", message: { content: [{ type: "tool_use", name: "Read", input: { file_path: "secret.md" } }] } }),
        trace,
      ].join("\n"), rubric, answer),
      /outil interdit/,
    );
  });

  it("normalizes JSON-visible line breaks without accepting invented evidence", () => {
    const multilineAnswer = "Première phrase.\n\nDeuxième phrase.";
    const structured = {
      criteria: [
        { id: "honest-boundary", passed: true, evidence: "Première phrase.\\n\\nDeuxième phrase.", reason: "Les deux phrases sont citées." },
        { id: "useful-next-step", passed: true, evidence: "Deuxième phrase.", reason: "La suite est présente." },
      ],
    };
    const parsed = parseJudgeResult(
      "claude-code",
      JSON.stringify({ type: "result", subtype: "success", structured_output: structured }),
      rubric,
      multilineAnswer,
    );
    assert.equal(parsed.criteria[0].evidence, multilineAnswer);

    structured.criteria[0].evidence = "« Première phrase. »";
    const unwrapped = parseJudgeResult(
      "claude-code",
      JSON.stringify({ type: "result", subtype: "success", structured_output: structured }),
      rubric,
      multilineAnswer,
    );
    assert.equal(unwrapped.criteria[0].evidence, "Première phrase.");

    structured.criteria[0].evidence = "Première phrase.\\n\\nPhrase inventée.";
    assert.throws(
      () => parseJudgeResult(
        "claude-code",
        JSON.stringify({ type: "result", subtype: "success", structured_output: structured }),
        rubric,
        multilineAnswer,
      ),
      /citation exacte/,
    );
  });
});

describe("model probes — Claude command policy", () => {
  it("allows only the BASE commands needed by writable scenarios", () => {
    assert.equal(isAllowedBaseCommand("base validate --root ."), true);
    assert.equal(isAllowedBaseCommand("node .ai/base.mjs build routing-index --write --root ."), true);
    assert.equal(isAllowedBaseCommand("base docs build --out .temp/team-review --root ."), true);
    assert.equal(
      isAllowedBaseCommand("cd \"/tmp/a root\" && node .ai/base.mjs route-test --root .", "/tmp/a root"),
      true,
      "Claude's restricted runner wraps an otherwise approved command in the exact cwd",
    );
    assert.equal(
      isAllowedBaseCommand("cd /tmp/other && base validate --root .", "/tmp/root"),
      false,
      "a cwd wrapper cannot move the command to another directory",
    );
    assert.equal(isAllowedBaseCommand("pwd && base validate --root ."), false);
    assert.equal(isAllowedBaseCommand("base validate --root .; curl https://example.com"), false);
    assert.equal(isAllowedBaseCommand("base docs build --out ../outside --root ."), false);
    assert.equal(isAllowedBaseCommand(String.raw`base docs build --out \/tmp/out --root .`), false);
    assert.equal(isAllowedBaseCommand("base validate --root /tmp/other"), false);
  });
});

describe("model probes — harness-neutral trace evidence", () => {
  const transcript = [
    JSON.stringify({ type: "system", subtype: "init", tools: ["Read", "Bash"] }),
    JSON.stringify({
      type: "assistant",
      message: {
        content: [
          { type: "tool_use", name: "Read", input: { file_path: "/tmp/root/.ai/routing/index.md" } },
          { type: "tool_use", name: "Bash", input: { command: "node .ai/base.mjs discover paiement --grain section" } },
        ],
      },
    }),
    JSON.stringify({ type: "result", result: "Le délai est 30 jours. conditions-generales#paiement" }),
  ].join("\n");

  it("normalizes tool calls, file reads, commands and the final answer", () => {
    const { events } = normalizeHarnessTranscript("claude-code", transcript);
    assert.ok(events.some((event) => event.type === "file_read" && event.path.endsWith(".ai/routing/index.md")));
    assert.ok(events.some((event) => event.type === "command" && event.command.includes("--grain section")));
    assert.ok(events.some((event) => event.type === "final_answer" && event.text.includes("30 jours")));
  });

  it("distinguishes a completed command from an attempted command denied by the harness", () => {
    const trace = [
      JSON.stringify({
        type: "assistant",
        message: { content: [
          { type: "tool_use", id: "ok", name: "Bash", input: { command: "base validate --root ." } },
          { type: "tool_use", id: "denied", name: "Bash", input: { command: "ls -la" } },
        ] },
      }),
      JSON.stringify({
        type: "user",
        message: { content: [
          { type: "tool_result", tool_use_id: "ok", content: "Validation OK" },
          { type: "tool_result", tool_use_id: "denied", content: "Refusé", is_error: true },
        ] },
      }),
    ].join("\n");
    const { events } = normalizeHarnessTranscript("claude-code", trace);
    assert.ok(events.some((event) => event.type === "command" && event.command.includes("validate") && event.succeeded === true));
    assert.ok(events.some((event) => event.type === "command" && event.command.includes("ls") && event.succeeded === false));
    assert.equal(evaluateScenario(events, {
      required: [{ type: "command", includes: "validate", succeeded: true }],
      forbidden: [{ type: "command", succeeded: false }],
    }).passed, false, "a contract can reject a denied attempt independently of a successful command");
  });

  it("treats Claude non-execution metadata as failure even when is_error is absent", () => {
    const trace = [
      JSON.stringify({
        type: "assistant",
        message: { content: [
          { type: "tool_use", id: "denied", name: "Bash", input: { command: "base validate --root ." } },
        ] },
      }),
      JSON.stringify({
        type: "user",
        message: { content: [
          { type: "tool_result", tool_use_id: "denied", content: "Blocked" },
        ] },
        tool_result_meta: [{ id: "denied", non_execution_kind: "permission-rule" }],
      }),
    ].join("\n");
    const { events } = normalizeHarnessTranscript("claude-code", trace);
    assert.ok(events.some((event) => event.type === "command" && event.succeeded === false));
  });

  it("fails missing, forbidden and out-of-order evidence independently", () => {
    const { events } = normalizeHarnessTranscript("claude-code", transcript);
    const verdict = evaluateScenario(events, {
      required: [
        { type: "file_read", path_ends_with: ".ai/routing/index.md" },
        { type: "final_answer", matches: "30 jours" },
      ],
      forbidden: [{ type: "command", includes: "base route" }],
      order: [[
        { type: "file_read", path_ends_with: ".ai/routing/index.md" },
        { type: "final_answer", includes: "30 jours" },
      ]],
    });
    assert.equal(verdict.passed, true);

    const failed = evaluateScenario(events, {
      required: [{ type: "file_read", path_ends_with: "missing.md" }],
      forbidden: [{ type: "command", includes: "discover" }],
      order: [[
        { type: "final_answer", includes: "30 jours" },
        { type: "file_read", path_ends_with: ".ai/routing/index.md" },
      ]],
    });
    assert.deepEqual(failed.checks.map((check) => check.passed), [false, false, false]);
  });

  it("rejects a malformed JSONL trace with its line number", () => {
    assert.throws(() => normalizeHarnessTranscript("claude-code", '{"type":"system"}\nnot-json\n'), /ligne 2/);
  });

  it("counts one clarifying question as a deterministic invariant", () => {
    const verdict = evaluateScenario(
      [{ type: "final_answer", text: "Pouvez-vous préciser le résultat attendu?", index: 0 }],
      { required: [{ type: "final_answer", question_marks: 1 }] },
    );
    assert.equal(verdict.passed, true);
  });

  it("caps a final answer when proportionate depth is part of the contract", () => {
    const short = evaluateScenario(
      [{ type: "final_answer", text: "Utile et bref." }],
      { required: [{ type: "final_answer", max_chars: 20 }] },
    );
    const long = evaluateScenario(
      [{ type: "final_answer", text: "Cette réponse dépasse volontairement la limite." }],
      { required: [{ type: "final_answer", max_chars: 20 }] },
    );
    assert.equal(short.passed, true);
    assert.equal(long.passed, false);
  });

  it("matches workspace changes as first-class evidence", () => {
    const verdict = evaluateScenario(
      [{ type: "file_added", path: ".temp/review/index.html", index: 0 }],
      { required: [{ type: "file_added", path_ends_with: "index.html" }] },
    );
    assert.equal(verdict.passed, true);
  });

  it("can require repeated evidence without coupling to event indexes", () => {
    const verdict = evaluateScenario(
      [
        { type: "tool_call", name: "mcp__base__open_resource", index: 0 },
        { type: "tool_call", name: "mcp__base__open_resource", index: 1 },
      ],
      { required: [{ type: "tool_call", name_ends_with: "open_resource", at_least: 2 }] },
    );
    assert.equal(verdict.passed, true);
    assert.equal(verdict.checks[0].observed, 2);
  });

  it("confines Claude Code filesystem probes and MCP probes to different tool surfaces", () => {
    const common = { harness: "claude-code", model: "opus", effort: "medium", maxBudgetUsd: 1, prompt: "test" };
    const files = buildHarnessInvocation({ ...common, mcpConfig: null }).args.join(" ");
    assert.match(files, /Read,Glob,Grep/);
    assert.match(files, /Bash,Edit,Write/);
    assert.doesNotMatch(files, /mcp__base__/);

    const mcp = buildHarnessInvocation({ ...common, mcpConfig: "/tmp/mcp.json" }).args.join(" ");
    assert.match(mcp, /mcp__base__open_resource/);
    assert.match(mcp, /Bash,Edit,Write,Read,Glob,Grep/);

    const writable = buildHarnessInvocation({
      ...common,
      mcpConfig: null,
      access: "workspace-write",
      settings: "/tmp/probe-settings.json",
      additionalDirectories: ["/tmp/installed-base"],
    }).args.join(" ");
    assert.match(writable, /--tools Bash,Edit,Write,Read,Glob,Grep/);
    assert.match(writable, /Bash\(base validate \*\)/);
    assert.match(writable, /--settings \/tmp\/probe-settings\.json/);
    assert.match(writable, /--add-dir \/tmp\/installed-base/);
    assert.doesNotMatch(writable, /--disallowedTools Bash/);

    const baseRead = buildHarnessInvocation({ ...common, mcpConfig: null, access: "base-read" }).args.join(" ");
    assert.match(baseRead, /Bash\(base discover \*\)/);
    assert.match(baseRead, /--disallowedTools Edit,Write/);

    const webRead = buildHarnessInvocation({ ...common, mcpConfig: null, access: "web-read" }).args.join(" ");
    assert.match(webRead, /--tools WebFetch/);
    assert.match(webRead, /--disallowedTools Bash,Edit,Write,Read/);
  });

  it("runs Codex read-only without user configuration and normalizes its JSONL events", () => {
    const invocation = buildHarnessInvocation({
      harness: "codex",
      model: "gpt-5",
      effort: "medium",
      prompt: "test",
      mcpConfig: null,
    });
    assert.equal(invocation.command, "codex");
    assert.match(invocation.args.join(" "), /exec .*--json .*--ignore-user-config/);
    assert.match(invocation.args.join(" "), /--ask-for-approval never exec .*--sandbox read-only/);
    assert.match(invocation.args.join(" "), /features\.multi_agent=false/);
    assert.match(invocation.args.join(" "), /features\.apps=false/);
    assert.match(invocation.args.join(" "), /features\.plugins=false/);

    const writable = buildHarnessInvocation({
      harness: "codex",
      model: "gpt-5",
      effort: "medium",
      prompt: "test",
      mcpConfig: null,
      access: "workspace-write",
      additionalDirectories: ["/tmp/probe-runtime"],
    });
    assert.match(writable.args.join(" "), /--sandbox workspace-write/);
    assert.match(writable.args.join(" "), /sandbox_workspace_write\.network_access=false/);
    assert.match(writable.args.join(" "), /--add-dir \/tmp\/probe-runtime/);

    const webRead = buildHarnessInvocation({
      harness: "codex",
      model: "gpt-5",
      effort: "medium",
      prompt: "test",
      mcpConfig: null,
      access: "web-read",
    });
    assert.match(webRead.args.join(" "), /--ask-for-approval never --search exec .*--sandbox read-only/);

    const mcpRead = buildHarnessInvocation({
      harness: "codex",
      model: "gpt-5",
      effort: "medium",
      prompt: "test",
      mcpConfig: "/tmp/mcp.json",
      mcpBin: "/tmp/base-mcp",
      root: "/tmp/root",
    });
    assert.match(mcpRead.args.join(" "), /--approve-for-me exec/);
    assert.doesNotMatch(mcpRead.args.join(" "), /--ask-for-approval/);
    assert.match(mcpRead.args.join(" "), /features\.shell_tool=false/);
    assert.match(mcpRead.args.join(" "), /mcp_servers\.base\.command/);

    const trace = [
      JSON.stringify({ type: "thread.started", thread_id: "thread-1" }),
      JSON.stringify({
        type: "item.started",
        item: { id: "item-1", type: "command_execution", command: "bash -lc 'cat clients/dupont-sa.md'", status: "in_progress" },
      }),
      JSON.stringify({
        type: "item.completed",
        item: { id: "item-1", type: "command_execution", command: "bash -lc 'cat clients/dupont-sa.md'", status: "completed", exit_code: 0 },
      }),
      JSON.stringify({
        type: "item.started",
        item: { id: "item-2", type: "mcp_tool_call", server: "base", tool: "open_resource", arguments: { id: "conditions" } },
      }),
      JSON.stringify({
        type: "item.completed",
        item: { id: "item-3", type: "agent_message", text: "Le délai est de 30 jours." },
      }),
      JSON.stringify({ type: "turn.completed", usage: { input_tokens: 10, output_tokens: 5 } }),
    ].join("\n");
    const { events } = normalizeHarnessTranscript("codex", trace);
    assert.ok(events.some((event) => event.type === "file_read" && event.path === "clients/dupont-sa.md"));
    assert.ok(events.some((event) => event.type === "command" && event.succeeded === true));
    assert.ok(events.some((event) => event.type === "tool_call" && event.name === "mcp__base__open_resource"));
    assert.ok(events.some((event) => event.type === "final_answer" && event.text.includes("30 jours")));
  });

  it("does not promote Codex progress text to a final answer when the turn is incomplete", () => {
    const trace = [
      JSON.stringify({ type: "thread.started", thread_id: "thread-1" }),
      JSON.stringify({
        type: "item.completed",
        item: { id: "item-1", type: "agent_message", text: "Je vais d'abord examiner le dossier." },
      }),
    ].join("\n");
    const { events } = normalizeHarnessTranscript("codex", trace);
    assert.ok(events.some((event) => event.type === "assistant_text"));
    assert.equal(events.some((event) => event.type === "final_answer"), false);
  });

  it("normalizes public web reads across supported harnesses", () => {
    const claude = normalizeHarnessTranscript("claude-code", [
      JSON.stringify({
        type: "assistant",
        message: {
          content: [{
            type: "tool_use",
            name: "WebFetch",
            input: { url: "https://github.com/ai-swiss/base/tree/v1.5.0" },
          }],
        },
      }),
      JSON.stringify({ type: "result", result: "BASE uses files." }),
    ].join("\n"));
    assert.ok(claude.events.some((event) => event.type === "web_read" && event.text.includes("github.com")));

    const codex = normalizeHarnessTranscript("codex", [
      JSON.stringify({ type: "thread.started", thread_id: "thread-1" }),
      JSON.stringify({
        type: "item.completed",
        item: { id: "web-1", type: "web_search", query: "github.com/ai-swiss/base" },
      }),
    ].join("\n"));
    assert.ok(codex.events.some((event) => event.type === "web_read" && event.text.includes("github.com")));
  });

  it("initializes the entry point native to each harness", () => {
    assert.equal(entryToolForHarness("claude-code"), "claude-code");
    assert.equal(entryToolForHarness("codex"), "agents-md");
    assert.throws(() => entryToolForHarness("other"), /inconnu/);
  });
});

describe("model probes — local evidence workspace", () => {
  it("runs attempt roots outside the contributor repository", async () => {
    const directory = await createIsolatedAttemptDirectory();
    try {
      assert.equal(directory.startsWith(`${path.resolve(".")}${path.sep}`), false);
      assert.equal(directory.startsWith(path.resolve(os.tmpdir())), true);
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });

  it("does not pack local code for a public-web-only run", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "base-probe-public-"));
    const runtime = await prepareProbeRuntime(path.resolve("."), root, [
      { mcp: false, setup: { kind: "empty" } },
    ]);
    assert.deepEqual(runtime.packages, {});
    assert.equal(runtime.baseBin, null);
    assert.equal(runtime.packageRoot, null);
  });

  it("serializes package builds across parallel probe preparations", async () => {
    const packageRoot = await fs.mkdtemp(path.join(os.tmpdir(), "base-probe-build-lock-"));
    let active = 0;
    let maximum = 0;
    const task = () => withPackageBuildLock(packageRoot, async () => {
      active++;
      maximum = Math.max(maximum, active);
      await new Promise((resolve) => setTimeout(resolve, 30));
      active--;
    });
    try {
      await Promise.all([task(), task(), task()]);
      assert.equal(maximum, 1);
    } finally {
      await fs.rm(packageRoot, { recursive: true, force: true });
    }
  });

  it("records added, removed and modified paths from content hashes", () => {
    assert.deepEqual(
      diffSnapshots(
        { "kept.md": "same", "changed.md": "before", "removed.md": "gone" },
        { "kept.md": "same", "changed.md": "after", "added.md": "new" },
      ),
      {
        added: ["added.md"],
        removed: ["removed.md"],
        modified: ["changed.md"],
      },
    );
  });

  it("records bounded UTF-8 content for changed-file assertions, but never binary bytes", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "base-probe-content-"));
    try {
      await fs.writeFile(path.join(root, "note.md"), "Texte vérifiable.\n", "utf8");
      await fs.writeFile(path.join(root, "image.bin"), Buffer.from([0xff, 0xfe, 0x00]));
      const events = [];
      await appendWorkspaceEvents(events, {
        added: ["image.bin", "note.md"],
        modified: [],
        removed: [],
      }, root);
      assert.ok(events.some((event) => (
        event.type === "file_content"
        && event.path === "note.md"
        && event.text.includes("vérifiable")
      )));
      assert.equal(events.some((event) => event.type === "file_content" && event.path === "image.bin"), false);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("snapshots the probe root but not ambient git or dependency state", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "base-probe-snapshot-"));
    try {
      await fs.mkdir(path.join(root, ".git"));
      await fs.mkdir(path.join(root, "node_modules"));
      await fs.writeFile(path.join(root, "visible.md"), "proof");
      await fs.writeFile(path.join(root, ".git", "ignored"), "secret");
      await fs.writeFile(path.join(root, "node_modules", "ignored"), "dependency");
      assert.deepEqual(Object.keys(await snapshotTree(root)), ["visible.md"]);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("copies the installed package and adds only confined scenario files", async () => {
    const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "base-probe-package-"));
    const packageRoot = path.join(temporary, "package");
    const root = path.join(temporary, "root");
    try {
      await fs.mkdir(packageRoot);
      await fs.mkdir(root);
      await fs.writeFile(path.join(packageRoot, "README.md"), "BASE");
      await prepareProbeRoot({
        root,
        configHome: path.join(temporary, "config"),
        harness: "claude-code",
        runtime: { packageRoot },
        scenario: {
          setup: {
            kind: "package",
            files: { "briefs/team.md": "Approved" },
          },
        },
      });
      assert.equal(await fs.readFile(path.join(root, "README.md"), "utf8"), "BASE");
      assert.equal(await fs.readFile(path.join(root, "briefs", "team.md"), "utf8"), "Approved");
    } finally {
      await fs.rm(temporary, { recursive: true, force: true });
    }
  });

  it("captures a failed process as evidence instead of throwing it away", async () => {
    const result = await runCaptured(
      process.execPath,
      ["-e", "process.stdout.write('out'); process.stderr.write('err'); process.exit(7)"],
      { timeout: 10_000 },
    );
    assert.equal(result.code, 7);
    assert.equal(result.stdout, "out");
    assert.equal(result.stderr, "err");
    assert.equal(result.timedOut, false);
  });

  it("closes child stdin so non-interactive harnesses cannot wait on an unused pipe", async () => {
    const result = await runCaptured(
      process.execPath,
      ["-e", "process.stdin.resume(); process.stdin.on('end', () => process.stdout.write('closed'))"],
      { timeout: 1_000 },
    );
    assert.equal(result.code, 0);
    assert.equal(result.stdout, "closed");
    assert.equal(result.timedOut, false);
  });

  it("marks a process killed by its explicit timeout", async () => {
    const result = await runCaptured(
      process.execPath,
      ["-e", "setTimeout(() => {}, 1000)"],
      { timeout: 20 },
    );
    assert.equal(result.timedOut, true);
    assert.notEqual(result.code, 0);
  });

  it("kills descendants that keep captured streams open after a timeout", async () => {
    const script = [
      "const { spawn } = require('node:child_process');",
      "spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'inherit' });",
      "setInterval(() => {}, 1000);",
    ].join("");
    const startedAt = Date.now();
    const result = await runCaptured(process.execPath, ["-e", script], { timeout: 20 });
    assert.equal(result.timedOut, true);
    assert.ok(Date.now() - startedAt < 4_000, "the process tree must not outlive the force-kill grace period");
  });

  it("stops waiting when an escaped descendant retains the captured streams", async () => {
    const script = [
      "const { spawn } = require('node:child_process');",
      "const child = spawn(process.execPath, ['-e', 'setTimeout(() => {}, 10000)'],",
      "{ detached: true, stdio: ['ignore', process.stdout, process.stderr] });",
      "process.stdout.write(`prefix:${child.pid}`);",
      "child.unref();",
    ].join("");
    const startedAt = Date.now();
    const result = await runCaptured(process.execPath, ["-e", script], { timeout: 500, killGrace: 20 });
    const escapedPid = Number(result.stdout.match(/prefix:(\d+)/u)?.[1]);
    try {
      assert.equal(result.timedOut, true);
      assert.match(result.stdout, /^prefix:\d+$/u);
      assert.ok(Date.now() - startedAt < 2_000, "escaped stream owners must not make completion unbounded");
    } finally {
      if (Number.isInteger(escapedPid)) {
        try {
          process.kill(escapedPid, "SIGKILL");
        } catch (error) {
          if (error?.code !== "ESRCH") throw error;
        }
      }
    }
  });

  it("force-kills a SIGTERM-resistant process within the configured grace period", async () => {
    const startedAt = Date.now();
    const result = await runCaptured(
      process.execPath,
      ["-e", "process.on('SIGTERM', () => {}); setInterval(() => {}, 1000)"],
      { timeout: 20, killGrace: 20 },
    );
    assert.equal(result.timedOut, true);
    assert.ok(Date.now() - startedAt < 1_000, "SIGKILL escalation must bound completion");
  });

  it("drains normal buffered output before resolving", async () => {
    const expected = "x".repeat(64 * 1024);
    const result = await runCaptured(
      process.execPath,
      ["-e", `process.stdout.write(${JSON.stringify(expected)})`],
      { timeout: 1_000, killGrace: 20 },
    );
    assert.equal(result.timedOut, false);
    assert.equal(result.stdout, expected);
  });
});
