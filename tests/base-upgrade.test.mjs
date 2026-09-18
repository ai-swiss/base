// Spec coverage: FR-INIT-006
// `base upgrade` — what an older root should change to match the framework today. The planner is
// PURE (every input injected), so the rules are proven without a filesystem: what it proposes, what
// it refuses to touch, and what it merely names.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { planUpgrade } from "../tools/core/upgrade.mjs";

const ATTRIBUTION = "Construit avec BASE, par AI Swiss, https://a-i.swiss (CC BY 4.0).";
const GITIGNORE = "# BASE\n.ai/trace/\nbase.manifest.json\n";
const base = {
  files: ["CLAUDE.md", ".ai/base.mjs"],
  attributionLine: ATTRIBUTION,
  gitignoreContent: GITIGNORE,
};

describe("planUpgrade — an older root, brought to today's conventions", () => {
  it("proposes nothing when the root already follows them", () => {
    const { plan } = planUpgrade({ ...base, gitignore: GITIGNORE, readme: "# R\n", config: {}, inventory: [] });
    assert.deepEqual(plan, []);
  });

  it("adds the manifest to an existing .gitignore, by appending, never by rewriting it", () => {
    const { plan } = planUpgrade({ ...base, gitignore: "# mon ignore\nnode_modules/\n", config: {}, inventory: [] });
    const entry = plan.find((e) => e.path === ".gitignore");
    assert.equal(entry.action, "append");
    assert.match(entry.content, /^\n# Produit de construction[\s\S]*base\.manifest\.json\n$/);
  });

  it("creates a .gitignore when the root has none", () => {
    const { plan } = planUpgrade({ ...base, gitignore: null, config: {}, inventory: [] });
    const entry = plan.find((e) => e.path === ".gitignore");
    assert.equal(entry.action, "create");
    assert.equal(entry.content, GITIGNORE);
  });

  it("asks for attribution only when the root declares sharing, and only if a README exists", () => {
    const shared = [{ scope: "org" }];
    const withReadme = planUpgrade({ ...base, gitignore: GITIGNORE, readme: "# Notre base\n", config: {}, inventory: shared });
    assert.equal(withReadme.plan.find((e) => e.path === "README.md").action, "append");

    const privateRoot = planUpgrade({ ...base, gitignore: GITIGNORE, readme: "# Mon dossier\n", config: {}, inventory: [{ scope: "personal" }] });
    assert.equal(privateRoot.plan.some((e) => e.path === "README.md"), false);

    const noReadme = planUpgrade({ ...base, gitignore: GITIGNORE, readme: null, config: {}, inventory: shared });
    assert.equal(noReadme.plan.some((e) => e.path === "README.md"), false, "a folder without a README is not given one here");
  });

  it("drops a machine-specific engine path only when the user config answers instead", () => {
    const config = { schema_version: "base.config.v1", framework_dir: "/Users/quelquun/base", routing: { floor_score: 40 } };
    const answered = planUpgrade({ ...base, gitignore: GITIGNORE, config, inventory: [], userConfigHasFramework: true });
    const entry = answered.plan.find((e) => e.path === "base.config.json");
    assert.equal(entry.action, "rewrite");
    const rewritten = JSON.parse(entry.content);
    assert.equal(rewritten.framework_dir, undefined);
    assert.deepEqual(rewritten.routing, { floor_score: 40 }, "everything else is kept verbatim");

    const unanswered = planUpgrade({ ...base, gitignore: GITIGNORE, config, inventory: [], userConfigHasFramework: false });
    assert.equal(unanswered.plan.some((e) => e.path === "base.config.json"), false, "without it the root could not find its engine");
  });

  it("declares the help target a root created before it has none, and keeps the one an owner chose", () => {
    const HELP = { agent: "concierge-base", process: "accueil" };
    const added = planUpgrade({ ...base, gitignore: GITIGNORE, config: { schema_version: "base.config.v1" }, inventory: [], helpTarget: HELP });
    const entry = added.plan.find((e) => e.path === "base.config.json");
    assert.equal(entry.action, "rewrite");
    const rewritten = JSON.parse(entry.content);
    assert.deepEqual(rewritten.routing.fallback, HELP, "a request nothing covers now lands somewhere");
    assert.equal(rewritten.schema_version, "base.config.v1", "everything else is kept verbatim");

    // The owner's own door is not ours to replace.
    const chosen = { schema_version: "base.config.v1", routing: { fallback: { agent: "aide-maison", process: "accueil-maison" } } };
    const kept = planUpgrade({ ...base, gitignore: GITIGNORE, config: chosen, inventory: [], helpTarget: HELP });
    assert.equal(kept.plan.some((e) => e.path === "base.config.json"), false);
  });

  it("rewrites the config ONCE when two reasons apply, naming both", () => {
    // A file has one content: two entries for the same path would make the second overwrite the first.
    const { plan } = planUpgrade({
      ...base,
      gitignore: GITIGNORE,
      config: { schema_version: "base.config.v1", framework_dir: "/Users/quelquun/base", routing: { floor_score: 40 } },
      inventory: [],
      userConfigHasFramework: true,
      helpTarget: { agent: "concierge-base", process: "accueil" },
    });
    const entries = plan.filter((e) => e.path === "base.config.json");
    assert.equal(entries.length, 1);
    const rewritten = JSON.parse(entries[0].content);
    assert.equal(rewritten.framework_dir, undefined);
    assert.equal(rewritten.routing.floor_score, 40, "the owner's threshold survives the merge");
    assert.equal(rewritten.routing.fallback.process, "accueil");
    assert.match(entries[0].reason, /framework_dir/);
    assert.match(entries[0].reason, /repli/);
  });

  it("never invents a base.config.json: a JSON file would shadow a base.config.mjs", () => {
    // JSON wins over MJS when both exist, so creating one here would silently disable the executable
    // config its author wrote. A root whose config this planner cannot read is left alone.
    const { plan } = planUpgrade({ ...base, gitignore: GITIGNORE, config: null, inventory: [], helpTarget: { agent: "concierge-base", process: "accueil" } });
    assert.equal(plan.some((e) => e.path === "base.config.json"), false);
  });

  it("names the extra entry points instead of deleting them: only their owner knows which tool reads them", () => {
    const { plan, notes } = planUpgrade({
      ...base,
      files: ["CLAUDE.md", "AGENTS.md", ".cursor/rules/assistant.mdc", "BASE_BOOTSTRAP.md"],
      gitignore: GITIGNORE,
      config: {},
      inventory: [],
    });
    assert.equal(plan.some((e) => e.path === "CLAUDE.md"), false, "nothing is deleted");
    assert.match(notes.join("\n"), /4 points d'entrée/);
  });

  it("names the absence of any entry point, with the command that fixes it", () => {
    const { notes } = planUpgrade({ ...base, files: [".ai/base.mjs"], gitignore: GITIGNORE, config: {}, inventory: [] });
    assert.match(notes.join("\n"), /--tool/);
  });
});
