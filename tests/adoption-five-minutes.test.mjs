// Spec coverage: FR-INIT-002 FR-INIT-004 FR-ROUTE-005 FR-DOCTOR-002 NFR-CORE-006
// The five-minute test, as a scenario rather than a claim: an empty folder, the two answers `init`
// asks for, and then a plain sentence from the owner's own words must reach the right process
// WITHOUT anyone naming an agent. Every promise the adoption path makes is asserted here, in the
// order a new user meets them, so a regression shows up as a broken promise and not as a diff.

import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { promisify } from "node:util";
import { afterEach, beforeEach, describe, it } from "node:test";

const execFileAsync = promisify(execFile);
const cli = path.resolve("tools/base.mjs");
const ABOUT = "Nous installons et entretenons des pompes à chaleur chez des particuliers";

let dir;
const run = (...args) => execFileAsync("node", [cli, ...args, "--root", dir], { env: { ...process.env, BASE_CONFIG_HOME: dir } });

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "base-five-minutes-"));
});
afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

describe("the five-minute test: an empty folder becomes a working router", () => {
  it("asks two questions, writes one entry point, and routes a plain sentence to the right process", async () => {
    // 1. The dry run asks what it does not know, and writes nothing.
    const dry = await run("init");
    assert.match(dry.stdout, /Quel outil IA lira ce dossier/);
    assert.match(dry.stdout, /Que faites-vous, en une phrase/);
    await assert.rejects(() => fs.access(path.join(dir, ".ai")), "a dry run writes nothing");

    // 2. The answers, and only what they imply.
    await run("init", "--tool", "claude-code", "--about", ABOUT, "--yes");
    const present = async (rel) => fs.access(path.join(dir, rel)).then(() => true, () => false);
    assert.equal(await present("CLAUDE.md"), true, "the entry point of the named tool");
    assert.equal(await present("AGENTS.md"), false, "and no entry point of a tool nobody named");
    assert.equal(await present(".cursor/rules/assistant.mdc"), false);
    assert.equal(await present("BASE_BOOTSTRAP.md"), false);
    assert.equal(await present(".ai/base.mjs"), true, "the launcher, so the CLI runs from here");

    // 3. The folder says what it is, and credits the method it is built on.
    const readme = await fs.readFile(path.join(dir, "README.md"), "utf8");
    assert.match(readme, /a-i\.swiss/);
    // 4. The build product stays out of the shared repository.
    assert.match(await fs.readFile(path.join(dir, ".gitignore"), "utf8"), /^base\.manifest\.json$/m);
    // 5. The answer about the tool is recorded, so a later build keeps honouring it.
    const config = JSON.parse(await fs.readFile(path.join(dir, "base.config.json"), "utf8"));
    assert.deepEqual(config.tools, ["claude-code"]);

    // 6. The owner's own sentence became the routing signal, not a placeholder to fill in later.
    const [agentDir] = await fs.readdir(path.join(dir, ".ai", "agents"));
    const card = await fs.readFile(path.join(dir, ".ai", "agents", agentDir, "AGENT.md"), "utf8");
    assert.match(card, new RegExp(`description: ${ABOUT}`));

    // 7. The corpus is valid and healthy: no error-severity finding on a folder five minutes old.
    await run("validate");
    await run("doctor");

    // 8. And the promise holds: a plain sentence reaches a process, with no agent named by anyone.
    const routed = await run("route", "j'aimerais importer mes procédures existantes");
    assert.match(routed.stdout, /routed/);
    assert.match(routed.stdout, /importer-l-existant/);

    // 9. A sentence in the owner's own domain finds their agent, and asks honestly which process,
    // because on a five-minute-old folder there is only one. No guess, and a question to answer.
    const domain = await run("route", "un client demande l'entretien de sa pompe à chaleur");
    assert.match(domain.stdout, /needs_clarification/);
    assert.match(domain.stdout, new RegExp(`Agent: ${agentDir}`), "the card the owner's own sentence produced is what the router found");
    assert.match(domain.stdout, /Question:/, "and the router asks rather than inventing a process that does not exist yet");
  });
});
