// Spec coverage: FR-DOCS-003
// The sidebar is a projection of navigation.json with presentation rules (split, exclusions,
// label uniqueness). This suite pins those rules against a synthetic navigation fixture, so
// the contract in specs/current/10_core/docs.md ("Sidebar contract") is enforced, not hoped for.
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { buildSidebar, COMPRENDRE, CONSTRUIRE, ECHELLE } from "../packages/base-docs-site/src/lib/sidebar.mjs";

let tmpDir;
let previousModelDir;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-docs-sidebar-"));
  previousModelDir = process.env.BASE_DOCS_MODEL_DIR;
  process.env.BASE_DOCS_MODEL_DIR = tmpDir;
});

afterEach(async () => {
  if (previousModelDir === undefined) delete process.env.BASE_DOCS_MODEL_DIR;
  else process.env.BASE_DOCS_MODEL_DIR = previousModelDir;
  await fs.rm(tmpDir, { recursive: true, force: true });
});

async function writeNavigation(sections) {
  await fs.writeFile(path.join(tmpDir, "navigation.json"), JSON.stringify({ target: "local", sections }), "utf8");
}

function item(id, title, itemPath, role = "reference") {
  return { id, title, path: itemPath, role };
}

function flatLabels(sidebar) {
  const labels = [];
  const walk = (entries) => {
    for (const entry of entries) {
      if (entry.link) labels.push(entry.label);
      else walk(entry.items);
    }
  };
  for (const group of sidebar) {
    if (group.link) labels.push(group.label);
    else walk(group.items);
  }
  return labels;
}

describe("docs site sidebar projection", () => {
  it("projects corpus sections with bilingual group labels and appends the model pages group", async () => {
    await writeNavigation([
      { id: "start", title: "Start", items: [item("quickstart", "Démarrage express", "docs/start/quickstart.md", "guide")] },
    ]);

    const sidebar = buildSidebar(process.cwd());

    const start = sidebar.find((group) => group.label === "Démarrer pour de vrai");
    assert.equal(start.translations.en, "Really get started");
    assert.deepEqual(start.items, [{ label: "Démarrage express", link: "/resources/quickstart/" }]);
    const model = sidebar.find((group) => group.label === "Explorer le corpus");
    assert.equal(model.translations.en, "Explore the corpus");
    assert.equal(model.items.some((entry) => entry.link === "/explorer/"), true);
  });

  it("splits the reference catch-all by reading intent, in reader-priority order", async () => {
    await writeNavigation([
      {
        id: "reference",
        title: "Reference",
        items: [
          item("glossaire", "Glossaire", "docs/reference/glossaire.md"),
          item("governance", "Gouvernance", "GOVERNANCE.md"),
          item("spec-arch", "10 · Architecture", "specs/current/10_core/architecture.md", "spec"),
          item("mcp-readme", "BASE MCP Server", "mcp/README.md"),
        ],
      },
    ]);

    const sidebar = buildSidebar(process.cwd());
    const labels = sidebar.map((group) => group.label);

    assert.deepEqual(labels, [
      "Accueil",
      "Référence",
      "Explorer le corpus",
      "Le projet",
      "Spécifications",
      "Packages et outils",
    ]);
    assert.deepEqual(sidebar.find((group) => group.label === "Le projet").items.map((entry) => entry.label), [
      "Gouvernance",
    ]);
    // Specifications read as one group; historical specs live in git tags, not a parallel tree.
    const specs = sidebar.find((group) => group.label === "Spécifications");
    assert.equal(specs.items[0].label, "10 · Architecture");
  });

  it("excludes machine files and the operations inventory from the sidebar", async () => {
    await writeNavigation([
      {
        id: "reference",
        title: "Reference",
        items: [
          item("route-tests", "Route Tests", "exemples/demo/.ai/routing/route-tests.json"),
          item("package", "Package", "package.json"),
          item("pr-template", "PULL REQUEST TEMPLATE", ".github/PULL_REQUEST_TEMPLATE.md"),
          item("schema", "Base.Config.V1", "specs/current/30_schemas/base.config.v1.json", "schema"),
        ],
      },
      { id: "operations", title: "Agents And Processes", items: [item("agent", "Concierge", ".ai/agents/demo/AGENT.md")] },
    ]);

    const sidebar = buildSidebar(process.cwd());
    const labels = flatLabels(sidebar);

    assert.equal(labels.includes("Route Tests"), false);
    assert.equal(labels.includes("Package"), false);
    assert.equal(labels.includes("PULL REQUEST TEMPLATE"), false);
    assert.equal(labels.includes("Concierge"), false);
    assert.equal(sidebar.some((group) => group.label === "Agents et process"), false);
    // JSON schemas under specs/ are part of the published contract and stay.
    assert.equal(labels.includes("Base.Config.V1"), true);
  });

  it("excludes pages whose sidebar presence would mislead: README variants, manifesto translations, LICENSE, harness artifacts", async () => {
    await writeNavigation([
      {
        id: "reference",
        title: "Reference",
        items: [
          item("readme", "BASE", "README.md", "front-door"),
          item("readme-en", "BASE", "README.en.md"),
          item("manifeste", "Manifeste BASE", "MANIFESTO.md"),
          item("manifesto-en", "BASE Manifesto", "MANIFESTO.en.md"),
          item("manifest-de", "BASE-Manifest", "MANIFESTO.de.md"),
          item("manifesto-it", "Manifesto BASE", "MANIFESTO.it.md"),
          item("license", "License", "LICENSE"),
          item("agents-md", "Agents", "AGENTS.md"),
          item("claude-md", "BASE : Bâtir des Assistants", "CLAUDE.md"),
          item("bootstrap", "BASE: bootstrap générique", "BASE_BOOTSTRAP.md"),
          item("tools", "Matrice de capacité BASE", ".ai/tools.md"),
        ],
      },
    ]);

    const sidebar = buildSidebar(process.cwd());

    assert.deepEqual(
      sidebar.find((group) => group.label === "Le projet").items.map((entry) => entry.label),
      ["Manifeste BASE"],
      "only the canonical French manifesto survives; Explorer and search keep the rest",
    );
  });

  it("keeps only package front doors in the packages group", async () => {
    await writeNavigation([
      {
        id: "reference",
        title: "Reference",
        items: [
          item("ranker-readme", "@ai-swiss/base-ranker-semantic", "packages/base-ranker-semantic/README.md"),
          item("ranker-security", "Security & data handling", "packages/base-ranker-semantic/SECURITY.md"),
          item("studio-readme", "BASE Studio (UI)", "tools/studio/ui/README.md"),
        ],
      },
    ]);

    const packages = buildSidebar(process.cwd()).find((group) => group.label === "Packages et outils");

    assert.deepEqual(packages.items.map((entry) => entry.label), [
      "@ai-swiss/base-ranker-semantic",
      "BASE Studio (UI)",
    ]);
  });

  it("pins the reading order per section and lets unpinned pages follow in model order", async () => {
    await writeNavigation([
      {
        id: "trust",
        title: "Trust",
        items: [
          item("licence", "Licence", "docs/trust/licence.md", "guide"),
          item("evidence", "Preuves et limites", "docs/trust/evidence.md", "guide"),
          item("nouveau", "Page future non épinglée", "docs/trust/nouveau.md", "guide"),
          item("souverainete", "Souveraineté", "docs/trust/souverainete-et-confiance.md", "guide"),
        ],
      },
    ]);

    const trust = buildSidebar(process.cwd()).find((group) => group.label === "Confiance et preuves");

    assert.deepEqual(trust.items.map((entry) => entry.label), [
      "Souveraineté",
      "Preuves et limites",
      "Licence",
      "Page future non épinglée",
    ]);
  });

  it("nests Démarrer into profile sub-groups; installers under one entry, hub first", async () => {
    await writeNavigation([
      {
        id: "start",
        title: "Start",
        items: [
          item("quickstart", "Démarrage express", "docs/start/quickstart.md", "guide"),
          item("installer-claude", "Installer Claude Code", "docs/start/installer-claude-code.md", "guide"),
          item("installer-cursor", "Installer Cursor", "docs/start/installer-cursor.md", "guide"),
          item("installer", "Installer un espace de travail IA", "docs/start/installer.md", "guide"),
          item("obtenir", "Obtenir BASE", "docs/start/obtenir-base.md", "guide"),
        ],
      },
    ]);

    const start = buildSidebar(process.cwd()).find((group) => group.label === "Démarrer pour de vrai");

    // The compass page stays at top; then the profile sub-groups follow in declared order.
    assert.deepEqual(
      start.items.map((entry) => entry.label),
      ["Démarrage express", "Seul ou en PME", "Installer votre outil"],
    );
    const seul = start.items.find((entry) => entry.label === "Seul ou en PME");
    assert.deepEqual(seul.items.map((entry) => entry.label), ["Obtenir BASE"]);
    const installer = start.items.find((entry) => entry.label === "Installer votre outil");
    assert.equal(installer.translations.en, "Install your tool");
    assert.equal(installer.collapsed, true);
    assert.deepEqual(installer.items.map((entry) => entry.label), [
      "Installer un espace de travail IA",
      "Installer Claude Code",
      "Installer Cursor",
    ]);
  });

  it("nests each example as one group labelled by its front door, hub at the top level", async () => {
    await writeNavigation([
      {
        id: "examples",
        title: "Examples",
        items: [
          item("hub", "Exemples", "exemples/README.md", "front-door"),
          item("devis", "Assistant Devis", "exemples/assistant-devis/README.md"),
          item("devis-clients", "Clients", "exemples/assistant-devis/clients/README.md"),
          item("rh", "Assistant RH", "exemples/assistant-rh/README.md"),
          item("rh-clients", "Clients", "exemples/assistant-rh/candidatures/README.md"),
        ],
      },
    ]);

    const examples = buildSidebar(process.cwd()).find((group) => group.label === "Exemples");

    assert.equal(examples.collapsed, true);
    assert.deepEqual(
      examples.items.map((entry) => (entry.link ? entry.label : `[${entry.label}]`)),
      ["Exemples", "[Assistant Devis]", "[Assistant RH]"],
    );
    const devis = examples.items.find((entry) => entry.label === "Assistant Devis");
    assert.deepEqual(devis.items.map((entry) => entry.label), ["Assistant Devis", "Clients"]);
  });

  it("disambiguates colliding titles with the owning context (the package directory)", async () => {
    await writeNavigation([
      {
        id: "reference",
        title: "Reference",
        items: [
          item("ranker-readme", "README", "packages/base-ranker-semantic/README.md"),
          item("index-readme", "README", "packages/base-index-local/README.md"),
          item("studio-readme", "BASE Studio (UI)", "tools/studio/ui/README.md"),
        ],
      },
    ]);

    const packages = buildSidebar(process.cwd()).find((group) => group.label === "Packages et outils");
    const labels = packages.items.map((entry) => entry.label);

    assert.deepEqual(labels, [
      "README · base-ranker-semantic",
      "README · base-index-local",
      "BASE Studio (UI)",
    ]);
    assert.equal(new Set(labels).size, labels.length, "every sidebar label must be unique within its group");
  });

  it("groups every docs/learn and docs/guides page (no orphan from an unlisted page)", async () => {
    // docs/learn and docs/guides are the only editorial dirs assigned by EXPLICIT list (COMPRENDRE,
    // CONSTRUIRE, ECHELLE) rather than by path prefix; every other docs/ dir is claimed by a prefix
    // predicate, so a new page there is auto-grouped. This makes the one real orphan risk a mechanism:
    // a page added to either dir but not to a list fails the build. EXCLUDED is the single escape hatch.
    const EXCLUDED = new Set([
      // (none today: every docs/learn and docs/guides page is meant to be reachable from the bar)
    ]);
    const grouped = new Set([...COMPRENDRE, ...CONSTRUIRE, ...ECHELLE]);
    const orphans = [];
    for (const dir of ["docs/learn", "docs/guides"]) {
      for (const name of await fs.readdir(path.resolve(dir))) {
        if (!name.endsWith(".md")) continue;
        const rel = `${dir}/${name}`;
        if (!EXCLUDED.has(rel) && !grouped.has(rel)) orphans.push(rel);
      }
    }
    assert.deepEqual(
      orphans,
      [],
      `these pages reach no sidebar group; add each to COMPRENDRE/CONSTRUIRE/ECHELLE in sidebar.mjs ` +
        `(or to EXCLUDED with a reason):\n${orphans.join("\n")}`,
    );
  });

  it("keeps every label unique on the real local and public navigation projections, when present", async () => {
    for (const target of ["local", "public"]) {
      const realDir = path.resolve("packages/base-docs-site/../../.base-docs", target);
      try {
        await fs.access(path.join(realDir, "navigation.json"));
      } catch {
        continue;
      }
      process.env.BASE_DOCS_MODEL_DIR = realDir;
      const sidebar = buildSidebar(process.cwd());
      const assertUnique = (label, entries) => {
        const labels = entries.map((entry) => entry.label);
        assert.equal(new Set(labels).size, labels.length, `duplicate label in group "${label}" (${target})`);
        for (const entry of entries) if (!entry.link) assertUnique(entry.label, entry.items);
      };
      for (const group of sidebar) if (!group.link) assertUnique(group.label, group.items);
    }
  });
});
