const SCENARIO_SCHEMA = "base.probe-scenario.v1";
const SUITE_SCHEMA = "base.probe-suite.v1";
const MATCHER_TYPES = new Set([
  "command",
  "file_added",
  "file_content",
  "file_modified",
  "file_read",
  "file_removed",
  "final_answer",
  "tool_call",
  "web_read",
]);

const valueFlags = new Set([
  "--effort",
  "--harness",
  "--max-budget-usd",
  "--model",
  "--repeat",
  "--scenario",
  "--suite",
  "--timeout-ms",
]);
const booleanFlags = new Set(["--list", "--yes"]);

export function parseProbeArgs(argv) {
  const options = /** @type {any} */ ({
    list: false,
    effort: null,
    harness: null,
    maxBudgetUsd: null,
    model: null,
    repeat: 1,
    scenarios: [],
    suite: "smoke",
    timeoutMs: 10 * 60 * 1000,
    yes: false,
  });

  for (let index = 0; index < argv.length; index++) {
    const flag = argv[index];
    if (booleanFlags.has(flag)) {
      options[flag.slice(2)] = true;
      continue;
    }
    if (!valueFlags.has(flag)) throw new Error(`Option inconnue: ${flag}`);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`Valeur requise après ${flag}.`);
    index++;
    if (flag === "--scenario") options.scenarios.push(value);
    else if (flag === "--repeat") options.repeat = positiveInteger(value, flag);
    else if (flag === "--timeout-ms") options.timeoutMs = positiveInteger(value, flag);
    else if (flag === "--max-budget-usd") options.maxBudgetUsd = positiveNumber(value, flag);
    else options[camelCase(flag.slice(2))] = value;
  }
  return options;
}

export function validateExecutionOptions(options) {
  if (!options.harness) throw new Error("L'exécution exige --harness pour nommer le client observé.");
  if (!["claude-code", "codex"].includes(options.harness)) {
    throw new Error("--harness doit valoir claude-code ou codex.");
  }
  if (!options.model) throw new Error("L'exécution exige --model pour rendre le run traçable.");
  if (!options.effort) throw new Error("L'exécution exige --effort pour rendre le niveau de calcul traçable.");
  const efforts = options.harness === "codex"
    ? ["minimal", "low", "medium", "high", "xhigh"]
    : ["low", "medium", "high", "xhigh", "max"];
  if (!efforts.includes(options.effort)) {
    throw new Error(`--effort doit valoir ${efforts.join(", ")} pour ${options.harness}.`);
  }
  if (options.harness === "claude-code" && !options.maxBudgetUsd) {
    throw new Error("L'exécution exige --max-budget-usd pour borner explicitement chaque invocation.");
  }
}

export function validateSuite(value, file = "suite") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${file}: un objet est attendu.`);
  }
  if (value.schema_version !== SUITE_SCHEMA) {
    throw new Error(`${file}: schema_version doit valoir ${SUITE_SCHEMA}.`);
  }
  assertKnownKeys(value, ["schema_version", "id", "scenarios"], file);
  assertId(value.id, `${file}: id`);
  if (!Array.isArray(value.scenarios) || value.scenarios.length === 0) {
    throw new Error(`${file}: scenarios doit être une liste non vide.`);
  }
  for (const id of value.scenarios) assertId(id, `${file}: scenario`);
  if (new Set(value.scenarios).size !== value.scenarios.length) {
    throw new Error(`${file}: un scénario est déclaré plusieurs fois.`);
  }
  return value;
}

export function validateScenario(value, file = "scenario") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${file}: un objet est attendu.`);
  }
  if (value.schema_version !== SCENARIO_SCHEMA) {
    throw new Error(`${file}: schema_version doit valoir ${SCENARIO_SCHEMA}.`);
  }
  assertKnownKeys(value, ["schema_version", "id", "title", "access", "mcp", "companions", "setup", "prompt", "expect", "rubric"], file);
  if (value.access !== undefined && !["read-only", "base-read", "web-read", "workspace-write"].includes(value.access)) {
    throw new Error(`${file}: access doit valoir read-only, base-read, web-read ou workspace-write.`);
  }
  if (value.mcp !== undefined && typeof value.mcp !== "boolean") {
    throw new Error(`${file}: mcp doit être un booléen.`);
  }
  validateCompanions(value.companions, file);
  if (value.mcp && value.access && value.access !== "read-only") {
    throw new Error(`${file}: les scénarios MCP sont en lecture seule.`);
  }
  assertId(value.id, `${file}: id`);
  if (typeof value.title !== "string" || !value.title.trim()) {
    throw new Error(`${file}: title doit être une chaîne non vide.`);
  }
  if (typeof value.prompt !== "string" || !value.prompt.trim()) {
    throw new Error(`${file}: prompt doit être une chaîne non vide.`);
  }
  validateSetup(value.setup, file);
  const expect = value.expect;
  if (!expect || typeof expect !== "object" || Array.isArray(expect)) {
    throw new Error(`${file}: expect doit être un objet.`);
  }
  assertKnownKeys(expect, ["required", "forbidden", "order"], `${file}: expect`);
  const required = expect.required ?? [];
  const forbidden = expect.forbidden ?? [];
  const order = expect.order ?? [];
  if (!required.length) throw new Error(`${file}: expect.required doit contenir au moins une preuve.`);
  for (const matcher of [...required, ...forbidden]) validateMatcher(matcher, file);
  if (!Array.isArray(order)) throw new Error(`${file}: expect.order doit être une liste.`);
  for (const sequence of order) {
    if (!Array.isArray(sequence) || sequence.length < 2) {
      throw new Error(`${file}: chaque ordre doit contenir au moins deux événements.`);
    }
    for (const matcher of sequence) validateMatcher(matcher, file);
  }
  validateRubric(value.rubric, file);
  return value;
}

function validateCompanions(companions, file) {
  if (companions === undefined) return;
  if (!Array.isArray(companions) || !companions.length) {
    throw new Error(`${file}: companions doit être une liste non vide.`);
  }
  const known = new Set(["docs-site"]);
  if (new Set(companions).size !== companions.length || companions.some((item) => !known.has(item))) {
    throw new Error(`${file}: compagnon inconnu ou dupliqué.`);
  }
}

function validateRubric(rubric, file) {
  if (rubric === undefined) return;
  if (!Array.isArray(rubric) || rubric.length === 0) {
    throw new Error(`${file}: rubric doit être une liste non vide.`);
  }
  const ids = new Set();
  for (const item of rubric) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(`${file}: chaque critère de rubric doit être un objet.`);
    }
    assertKnownKeys(item, ["id", "criterion"], `${file}: critère rubric`);
    assertId(item.id, `${file}: critère rubric id`);
    if (ids.has(item.id)) throw new Error(`${file}: critère rubric dupliqué: ${item.id}.`);
    ids.add(item.id);
    if (typeof item.criterion !== "string" || !item.criterion.trim()) {
      throw new Error(`${file}: criterion doit être une chaîne non vide.`);
    }
  }
}

function validateSetup(setup, file) {
  if (!setup || typeof setup !== "object" || Array.isArray(setup)) {
    throw new Error(`${file}: setup doit être un objet.`);
  }
  if (setup.kind === "example") {
    assertKnownKeys(setup, ["kind", "example", "subpath", "files"], `${file}: setup`);
    assertId(setup.example, `${file}: setup.example`);
    if (setup.subpath !== undefined && (
      typeof setup.subpath !== "string"
      || !setup.subpath
      || setup.subpath.startsWith("/")
      || setup.subpath.split(/[\\/]/u).includes("..")
    )) {
      throw new Error(`${file}: setup.subpath doit rester relatif dans l'exemple.`);
    }
    validateSetupFiles(setup.files, file);
    return;
  }
  if (setup.kind === "init") {
    assertKnownKeys(setup, ["kind", "args", "files"], `${file}: setup`);
    if (!Array.isArray(setup.args) || setup.args.some((item) => typeof item !== "string")) {
      throw new Error(`${file}: setup.args doit être une liste de chaînes.`);
    }
    for (const forbidden of ["--framework-dir", "--root", "--tool", "--yes"]) {
      if (setup.args.includes(forbidden)) {
        throw new Error(`${file}: setup.args ne peut pas remplacer ${forbidden}, contrôlé par le runner.`);
      }
    }
    validateSetupFiles(setup.files, file);
    return;
  }
  if (setup.kind === "package") {
    assertKnownKeys(setup, ["kind", "files"], `${file}: setup`);
    validateSetupFiles(setup.files, file);
    return;
  }
  if (setup.kind === "empty") {
    assertKnownKeys(setup, ["kind", "files"], `${file}: setup`);
    validateSetupFiles(setup.files, file);
    return;
  }
  throw new Error(`${file}: setup.kind doit valoir empty, example, init ou package.`);
}

function validateSetupFiles(files, file) {
  if (files === undefined) return;
  if (!files || typeof files !== "object" || Array.isArray(files)) {
    throw new Error(`${file}: setup.files doit être un objet chemin-contenu.`);
  }
  for (const [relative, content] of Object.entries(files)) {
    if (
      !relative
      || pathIsAbsolute(relative)
      || relative.split(/[\\/]/u).includes("..")
      || relative.split(/[\\/]/u).includes(".git")
      || relative.split(/[\\/]/u).includes("node_modules")
    ) {
      throw new Error(`${file}: setup.files doit rester dans la racine sans écrire .git ni node_modules.`);
    }
    if (typeof content !== "string") {
      throw new Error(`${file}: setup.files[${relative}] doit être une chaîne.`);
    }
  }
}

function validateMatcher(matcher, file) {
  if (!matcher || typeof matcher !== "object" || Array.isArray(matcher)) {
    throw new Error(`${file}: une attente doit être un objet.`);
  }
  if (!MATCHER_TYPES.has(matcher.type)) {
    throw new Error(`${file}: type d'attente inconnu: ${String(matcher.type)}.`);
  }
  assertKnownKeys(
    matcher,
    ["type", "name", "name_ends_with", "path_ends_with", "path_matches", "includes", "matches", "question_marks", "max_chars", "succeeded", "at_least"],
    `${file}: attente`,
  );
  if (matcher.matches !== undefined) {
    if (typeof matcher.matches !== "string") throw new Error(`${file}: matches doit être une chaîne.`);
    try {
      new RegExp(matcher.matches, "iu");
    } catch (error) {
      throw new Error(`${file}: expression régulière invalide: ${error.message}`);
    }
  }
  if (matcher.path_matches !== undefined) {
    if (typeof matcher.path_matches !== "string") throw new Error(`${file}: path_matches doit être une chaîne.`);
    try {
      new RegExp(matcher.path_matches, "u");
    } catch (error) {
      throw new Error(`${file}: expression de chemin invalide: ${error.message}`);
    }
  }
  if (matcher.question_marks !== undefined && (!Number.isInteger(matcher.question_marks) || matcher.question_marks < 0)) {
    throw new Error(`${file}: question_marks doit être un entier positif ou nul.`);
  }
  if (matcher.max_chars !== undefined && (!Number.isInteger(matcher.max_chars) || matcher.max_chars < 1)) {
    throw new Error(`${file}: max_chars doit être un entier strictement positif.`);
  }
  if (matcher.succeeded !== undefined && typeof matcher.succeeded !== "boolean") {
    throw new Error(`${file}: succeeded doit être un booléen.`);
  }
  if (matcher.at_least !== undefined && (!Number.isInteger(matcher.at_least) || matcher.at_least < 1)) {
    throw new Error(`${file}: at_least doit être un entier positif.`);
  }
}

export function makeRunId({ now, suite, revision }) {
  const stamp = now.toISOString().replace(/[:.]/g, "-");
  const safeRevision = String(revision || "unknown").slice(0, 12).replace(/[^a-zA-Z0-9]/g, "");
  return `${stamp}_${suite}_${safeRevision || "unknown"}`;
}

export function evaluateScenario(events, expect) {
  const checks = [];
  for (const matcher of expect.required ?? []) {
    const observed = events.filter((event) => eventMatches(event, matcher)).length;
    const passed = observed >= (matcher.at_least ?? 1);
    checks.push({ kind: "required", matcher, observed, passed });
  }
  for (const matcher of expect.forbidden ?? []) {
    const passed = !events.some((event) => eventMatches(event, matcher));
    checks.push({ kind: "forbidden", matcher, passed });
  }
  for (const sequence of expect.order ?? []) {
    let cursor = -1;
    let passed = true;
    for (const matcher of sequence) {
      const found = events.find((event) => event.index > cursor && eventMatches(event, matcher));
      if (!found) {
        passed = false;
        break;
      }
      cursor = found.index;
    }
    checks.push({ kind: "order", sequence, passed });
  }
  return { passed: checks.every((check) => check.passed), checks };
}

export function eventMatches(event, matcher) {
  if (event.type !== matcher.type) return false;
  if (matcher.name !== undefined && event.name !== matcher.name) return false;
  if (matcher.name_ends_with !== undefined && !event.name?.endsWith(matcher.name_ends_with)) return false;
  if (matcher.path_ends_with !== undefined && !event.path?.endsWith(normalizePath(matcher.path_ends_with))) return false;
  if (matcher.path_matches !== undefined && !new RegExp(matcher.path_matches, "u").test(event.path ?? "")) return false;
  const searchable = event.text ?? event.command ?? JSON.stringify(event.input ?? event.value ?? "");
  if (matcher.includes !== undefined && !searchable.includes(matcher.includes)) return false;
  if (matcher.matches !== undefined && !new RegExp(matcher.matches, "iu").test(searchable)) return false;
  if (matcher.question_marks !== undefined && [...searchable].filter((character) => character === "?").length !== matcher.question_marks) return false;
  if (matcher.max_chars !== undefined && [...searchable].length > matcher.max_chars) return false;
  if (matcher.succeeded !== undefined && event.succeeded !== matcher.succeeded) return false;
  return true;
}

export function summarizeResults(results) {
  const passed = results.filter((result) => result.passed).length;
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    ok: passed === results.length,
  };
}

function assertId(value, label) {
  if (typeof value !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw new Error(`${label} doit être un identifiant kebab-case.`);
  }
}

function assertKnownKeys(value, allowed, label) {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length) throw new Error(`${label}: champ inconnu: ${unknown.join(", ")}.`);
}

function positiveInteger(value, flag) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${flag} attend un entier positif.`);
  return parsed;
}

function positiveNumber(value, flag) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`${flag} attend un nombre positif.`);
  return parsed;
}

function camelCase(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function normalizePath(value) {
  return value.replaceAll("\\", "/");
}

function pathIsAbsolute(value) {
  return value.startsWith("/") || /^[a-zA-Z]:[\\/]/u.test(value);
}
