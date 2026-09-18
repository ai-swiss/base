import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { parseFrontmatter } from "../tools/core/frontmatter.mjs";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const docsDir = path.join(repoRoot, "docs");
const RESOURCE_ID = /^[a-z0-9][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)*$/;
const EXCLUDED_DOCS_DIRECTORIES = new Set(["en", "de", "it", path.join("public", "assets")]);

async function authoritativeFrenchPages(dir, root = dir) {
  const pages = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const relative = path.relative(root, full);
    if (entry.isDirectory()) {
      if (EXCLUDED_DOCS_DIRECTORIES.has(relative)) continue;
      pages.push(...(await authoritativeFrenchPages(full, root)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      pages.push(full);
    }
  }
  return pages;
}

const validMetadata = Object.freeze({
  schema_version: "base.resource.v1",
  id: "guide-exemple",
  type: "document",
  title: "Guide exemple",
  description: "Une description utile, écrite pour retrouver cette page.",
  scope: "public",
  status: "active",
  sensitivity: "public",
  keywords: ["guide", "exemple"],
});

function metadataProblems(metadata) {
  const problems = [];
  if (metadata.schema_version !== "base.resource.v1") problems.push("schema_version");
  if (typeof metadata.id !== "string" || !RESOURCE_ID.test(metadata.id)) problems.push("id");
  if (metadata.type !== "document") problems.push("type");
  if (typeof metadata.title !== "string" || metadata.title.trim().length < 3) problems.push("title");
  if (typeof metadata.description !== "string" || metadata.description.trim().length < 20) problems.push("description");
  if (metadata.scope !== "public") problems.push("scope");
  if (metadata.status !== "active") problems.push("status");
  if (metadata.sensitivity !== "public") problems.push("sensitivity");
  if (
    !Array.isArray(metadata.keywords)
    || metadata.keywords.length === 0
    || !metadata.keywords.every((keyword) => typeof keyword === "string" && keyword.trim().length > 0)
  ) {
    problems.push("keywords");
  }
  return problems;
}

function duplicateIds(records) {
  const firstPathById = new Map();
  const duplicates = [];
  for (const { id, page } of records) {
    if (firstPathById.has(id)) duplicates.push(`${id}: ${firstPathById.get(id)}, ${page}`);
    else firstPathById.set(id, page);
  }
  return duplicates;
}

describe("authoritative French documentation frontmatter", () => {
  it("uses the production parser and satisfies the complete public document contract", async () => {
    const pages = await authoritativeFrenchPages(docsDir);
    assert.ok(pages.length >= 70, `expected at least 70 authoritative French pages, found ${pages.length}`);

    const violations = [];
    const records = [];
    for (const page of pages) {
      const relative = path.relative(repoRoot, page);
      const parsed = parseFrontmatter(await fs.readFile(page, "utf8"));
      if (parsed.errors.length > 0) {
        violations.push(`${relative}: parser errors ${parsed.errors.map(({ code }) => code).join(", ")}`);
        continue;
      }
      const problems = metadataProblems(parsed.data);
      if (problems.length > 0) violations.push(`${relative}: invalid ${problems.join(", ")}`);
      if (typeof parsed.data.id === "string") records.push({ id: parsed.data.id, page: relative });
    }

    violations.push(...duplicateIds(records).map((duplicate) => `duplicate id ${duplicate}`));
    assert.deepEqual(violations, []);
  });

  it("excludes English mirrors and public assets", async () => {
    const fixture = await fs.mkdtemp(path.join(os.tmpdir(), "base-docs-frontmatter-"));
    try {
      await fs.mkdir(path.join(fixture, "en"), { recursive: true });
      await fs.mkdir(path.join(fixture, "public", "assets"), { recursive: true });
      await fs.mkdir(path.join(fixture, "learn"), { recursive: true });
      await Promise.all([
        fs.writeFile(path.join(fixture, "en", "mirror.md"), ""),
        fs.writeFile(path.join(fixture, "public", "assets", "README.md"), ""),
        fs.writeFile(path.join(fixture, "learn", "guide.md"), ""),
      ]);
      assert.deepEqual(
        (await authoritativeFrenchPages(fixture)).map((page) => path.relative(fixture, page)),
        [path.join("learn", "guide.md")],
      );
    } finally {
      await fs.rm(fixture, { recursive: true, force: true });
    }
  });
});

describe("public document metadata rules", () => {
  it("accepts a complete card", () => {
    assert.deepEqual(metadataProblems(validMetadata), []);
  });

  it("requires the exact schema version", () => {
    assert.deepEqual(metadataProblems({ ...validMetadata, schema_version: "base.resource.v2" }), ["schema_version"]);
  });

  it("requires an authored id", () => {
    const { id: _id, ...withoutId } = validMetadata;
    assert.deepEqual(metadataProblems(withoutId), ["id"]);
  });

  it("requires a valid id", () => {
    assert.deepEqual(metadataProblems({ ...validMetadata, id: "Guide exemple" }), ["id"]);
  });

  it("requires unique ids", () => {
    assert.deepEqual(
      duplicateIds([
        { id: "guide-exemple", page: "docs/a.md" },
        { id: "guide-exemple", page: "docs/b.md" },
      ]),
      ["guide-exemple: docs/a.md, docs/b.md"],
    );
  });

  it("requires document type", () => {
    assert.deepEqual(metadataProblems({ ...validMetadata, type: "knowledge" }), ["type"]);
  });

  it("requires a useful title", () => {
    assert.deepEqual(metadataProblems({ ...validMetadata, title: "  " }), ["title"]);
  });

  it("requires a useful description", () => {
    assert.deepEqual(metadataProblems({ ...validMetadata, description: "Trop courte." }), ["description"]);
  });

  it("requires public scope", () => {
    assert.deepEqual(metadataProblems({ ...validMetadata, scope: "team" }), ["scope"]);
  });

  it("requires active status", () => {
    assert.deepEqual(metadataProblems({ ...validMetadata, status: "draft" }), ["status"]);
  });

  it("requires public sensitivity", () => {
    assert.deepEqual(metadataProblems({ ...validMetadata, sensitivity: "internal" }), ["sensitivity"]);
  });

  it("requires nonempty authored keywords", () => {
    assert.deepEqual(metadataProblems({ ...validMetadata, keywords: [] }), ["keywords"]);
  });

  it("reports malformed frontmatter from the production parser", () => {
    const parsed = parseFrontmatter("---\ntitle: |\n  Unsupported\n---\n# Guide\n");
    assert.deepEqual(parsed.errors.map(({ code }) => code), ["base.yaml.block_scalar_unsupported", "base.yaml.bad_indent"]);
  });
});
