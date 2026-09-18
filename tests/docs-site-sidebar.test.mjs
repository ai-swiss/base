// Spec coverage: FR-DOCS-003
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { buildSidebar, projectNavigation } from "../packages/base-docs-site/src/lib/sidebar.mjs";
import { buildNavigation, validateNavigation } from "../tools/docs/navigation.mjs";

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

function resource(itemPath, title = itemPath, overrides = {}) {
  const siteKey = itemPath.replace(/\.[^.]+$/, "").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
  return {
    id: siteKey,
    site_key: siteKey,
    path: itemPath,
    title,
    doc_role: "guide",
    ...overrides,
  };
}

function visibleSiteKeys(items) {
  return items.flatMap((item) => item.type === "resource"
    ? [item.site_key]
    : item.type === "group"
      ? visibleSiteKeys(item.items)
      : []);
}

describe("final docs navigation", () => {
  it("preserves the reader-journey order, pinning and nesting in navigation.json", () => {
    const navigation = buildNavigation([
      resource("docs/start/demo-60-secondes.md", "Démo"),
      resource("docs/learn/co-penser-avec-lia.md", "Pourquoi BASE"),
      resource("docs/start/quickstart.md", "Quickstart"),
      resource("docs/start/installer-cursor.md", "Installer Cursor"),
      resource("docs/tutoriel/index.md", "Tutoriel"),
      resource("docs/tutoriel/decouverte-1-faites-le-parler.md", "Découverte"),
      resource("docs/guides/idees-agents.md", "Idées"),
      resource("docs/learn/comprendre-echelle.md", "Échelle"),
      resource("exemples/assistant/README.md", "Assistant", { doc_role: "example" }),
      resource("docs/trust/licence.md", "Licence", { doc_role: "audit" }),
      resource("docs/reference/glossaire.md", "Glossaire", { doc_role: "reference" }),
      resource("docs/reference/documentation-interactive.md", "Documentation interactive", { doc_role: "reference" }),
      resource("MANIFESTO.md", "Manifeste", { doc_role: "reference" }),
      resource("specs/current/README.md", "Spécification", { doc_role: "spec" }),
      resource("packages/demo/README.md", "Package", { doc_role: "reference" }),
    ], "local");

    assert.deepEqual(navigation.items.map((item) => item.id), [
      "home",
      "decouvrir",
      "comprendre",
      "demarrer",
      "apprendre",
      "construire",
      "exemples",
      "confiance",
      "reference",
      "explorer",
      "projet",
      "specs",
      "packages",
    ]);
    const start = navigation.items.find((item) => item.id === "demarrer");
    assert.deepEqual(start.items.map((item) => item.id), ["docs-start-quickstart", "installer"]);
    const tutorial = navigation.items.find((item) => item.id === "apprendre");
    assert.deepEqual(tutorial.items.map((item) => item.id), ["docs-tutoriel-index", "decouverte"]);
    const build = navigation.items.find((item) => item.id === "construire");
    assert.deepEqual(build.items.map((item) => item.id), ["docs-guides-idees-agents", "echelle"]);
  });

  it("rejects a new editorial page that no final group claims", () => {
    const resources = [resource("docs/learn/a-new-page.md", "New page")];
    const navigation = buildNavigation(resources, "local");

    assert.equal(visibleSiteKeys(navigation.items).length, 0);
    assert.deepEqual(navigation.exclusions, []);
    assert.deepEqual(validateNavigation(resources, navigation), [{
      code: "base.docs.navigation_unassigned",
      path: "docs/learn/a-new-page.md",
      message: "Resource is neither present in navigation nor explicitly excluded with a reason.",
    }]);
  });

  it("accounts for every resource exactly once, including reasoned exclusions", () => {
    const resources = [
      resource("docs/start/quickstart.md", "Quickstart"),
      resource("package.json", "Package", { doc_role: "reference" }),
      resource(".ai/agents/demo/AGENT.md", "Agent", { doc_role: "operational" }),
      resource("decisions/0001.md", "Decision", { doc_role: "decision" }),
    ];
    const navigation = buildNavigation(resources, "local");
    const accounted = [
      ...visibleSiteKeys(navigation.items),
      ...navigation.exclusions.map((item) => item.site_key),
    ];

    assert.equal(new Set(accounted).size, resources.length);
    assert.equal(accounted.length, resources.length);
    assert.equal(navigation.exclusions.every((item) => item.reason.length > 0), true);
    assert.deepEqual(validateNavigation(resources, navigation), []);
  });
});

describe("docs site sidebar projection", () => {
  it("is a pure Starlight projection of final navigation, using site keys for resource routes", async () => {
    const navigation = {
      target: "local",
      exclusions: [],
      items: [
        { type: "link", id: "home", labels: { fr: "Accueil", en: "Home" }, href: "/" },
        {
          type: "group",
          id: "custom",
          labels: { fr: "Groupe", en: "Group" },
          collapsed: false,
          items: [{
            type: "resource",
            id: "semantic-id",
            site_key: "nested-path-resource",
            title: "Titre",
            path: "docs/custom/new.md",
            role: "guide",
          }],
        },
      ],
    };
    await fs.writeFile(path.join(tmpDir, "navigation.json"), JSON.stringify(navigation), "utf8");

    assert.deepEqual(buildSidebar(process.cwd()), projectNavigation(navigation));
    assert.deepEqual(projectNavigation(navigation, () => "Title"), [
      { label: "Accueil", link: "/", translations: { en: "Home" } },
      {
        label: "Groupe",
        translations: { en: "Group" },
        collapsed: false,
        items: [{ label: "Titre", link: "/resources/nested-path-resource/", translations: { en: "Title" } }],
      },
    ]);
  });

  it("disambiguates duplicate display titles without changing navigation membership", () => {
    const navigation = {
      target: "local",
      exclusions: [],
      items: [{
        type: "group",
        id: "packages",
        labels: { fr: "Packages", en: "Packages" },
        collapsed: true,
        items: [
          {
            type: "resource",
            id: "one",
            site_key: "one",
            title: "README",
            path: "packages/one/README.md",
            role: "reference",
          },
          {
            type: "resource",
            id: "two",
            site_key: "two",
            title: "README",
            path: "packages/two/README.md",
            role: "reference",
          },
        ],
      }],
    };

    const [group] = projectNavigation(navigation);
    assert.deepEqual(group.items.map((item) => item.label), ["README · one", "README · two"]);
    assert.deepEqual(group.items.map((item) => item.link), ["/resources/one/", "/resources/two/"]);
  });
});
