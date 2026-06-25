import * as crypto from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { compareByCodePoint } from "../core/ordering.mjs";
import { parseFrontmatter } from "../core/frontmatter.mjs";
import { routeRequest } from "../base-core.mjs";

export const DOCS_MODEL_SCHEMA_VERSION = "base.docs_model.v1";
export const DEFAULT_DOCS_OUTPUT_DIR = ".base-docs";

const DOC_EXTENSIONS = new Set([".md", ".json"]);
const SKIP_DIRS = new Set([
  ".git",
  ".plans",
  ".temp",
  ".base-docs",
  ".astro",
  ".vite",
  ".nyc_output",
  "node_modules",
  "dist",
  "coverage",
  "test-results",
  "playwright-report",
  "blob-report",
]);
const GENERATED_OR_PRIVATE_PREFIXES = [
  ".ai/trace",
  ".ai/changes",
  ".ai/experiments/runs",
  ".ai/experiments/reports",
  ".ai/agents/_template",
  ".reviews",
  "tools/studio/ui/e2e",
];
const TOP_LEVEL_PUBLIC_FILES = new Set([
  "README.md",
  "MANIFESTO.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
  "LICENSE",
]);
const JSON_ALLOWLIST = [
  /^base\.(?:schema|config|manifest)\.json$/,
  /^package\.json$/,
  /^\.ai\/routing\/route-tests\.json$/,
  /^exemples\/[^/]+\/\.ai\/routing\/route-tests\.json$/,
  /^specs\/current\/30_schemas\/[^/]+\.json$/,
  /^packages\/[^/]+\/package\.json$/,
  /^mcp\/package\.json$/,
];

const FAMILY_DEFINITIONS = [
  ["root", "Repository front door and project contracts"],
  [".ai", "Operational agents, processes, templates and local BASE state"],
  ["docs", "Human education, guides and public documentation"],
  ["specs", "Stable engineering specifications and schemas"],
  ["exemples", "Concrete learning examples and sample BASE roots"],
  ["tools", "Core broker, CLI and first-party adapters"],
  ["packages", "Optional extension packages"],
  ["mcp", "MCP server and external-tool integration"],
  ["tests", "Executable guarantees"],
  [".github", "CI and repository automation"],
  [".plans", "Ignored private planning workspace"],
  [".temp", "Ignored private working notebook"],
];

export async function buildDocsModel(rootDir, options = {}) {
  const root = path.resolve(rootDir);
  const target = normalizeTarget(options.target);
  const sourceFiles = await walkDocsFiles(root);
  const allResources = await Promise.all(sourceFiles.map((relativePath) => readDocResource(root, relativePath)));
  allResources.sort((a, b) => compareByCodePoint(a.path, b.path));
  attachIncomingBacklinks(allResources);

  // A broken internal link is a defect, not a note: it fails the model (and so the on-PR
  // `docs validate` gate), instead of scrolling past as a warning nobody reads.
  const brokenLinks = await detectBrokenLinks(root, allResources);
  const warnings = [
    ...detectDuplicateSourceIds(allResources),
    ...detectThinResources(allResources),
  ].sort(compareWarning);

  const resources = allResources.filter((resource) => canPublishToTarget(resource, target));
  const graph = buildGraph(resources);
  const navigation = buildNavigation(resources, target);
  const search = buildSearch(resources);
  const route_fixtures = await buildRouteFixtures(root, resources, target);
  const families = await buildFamilies(root);
  const errors = [...validateModelInvariants(resources, target), ...brokenLinks].sort(compareWarning);

  return {
    schema_version: DOCS_MODEL_SCHEMA_VERSION,
    target,
    root_label: path.basename(root),
    stats: {
      source_resources: allResources.length,
      resources: resources.length,
      warnings: warnings.length,
      errors: errors.length,
    },
    families,
    resources,
    graph,
    navigation,
    search,
    route_fixtures,
    warnings,
    errors,
  };
}

export async function validateDocsModel(rootDir, options = {}) {
  const model = await buildDocsModel(rootDir, options);
  return {
    ok: model.errors.length === 0,
    errors: model.errors,
    warnings: model.warnings,
    model,
  };
}

export async function writeDocsModel(rootDir, options = {}) {
  const root = path.resolve(rootDir);
  const model = await buildDocsModel(root, options);
  const outputDir = path.join(root, options.outputDir || DEFAULT_DOCS_OUTPUT_DIR, model.target);
  await fs.mkdir(outputDir, { recursive: true });
  await writeJson(path.join(outputDir, "model.json"), model);
  await writeJson(path.join(outputDir, "graph.json"), model.graph);
  await writeJson(path.join(outputDir, "navigation.json"), model.navigation);
  await writeJson(path.join(outputDir, "search.json"), model.search);
  await writeJson(path.join(outputDir, "route-fixtures.json"), { route_fixtures: model.route_fixtures });
  await writeJson(path.join(outputDir, "warnings.json"), { warnings: model.warnings, errors: model.errors });
  return { model, outputDir };
}

export function formatDocsModelSummary(result) {
  const model = result.model || result;
  const lines = [
    `Documentation model: ${model.target}`,
    `Resources: ${model.stats.resources}/${model.stats.source_resources}`,
    `Warnings: ${model.stats.warnings}`,
    `Errors: ${model.stats.errors}`,
  ];
  if (result.outputDir) lines.push(`Output: ${path.relative(process.cwd(), result.outputDir) || "."}`);
  if (model.errors.length) {
    lines.push("", "Errors:");
    for (const error of model.errors.slice(0, 10)) lines.push(`- ${error.path || "model"}: ${error.message}`);
  }
  if (model.warnings.length) {
    lines.push("", "Warnings:");
    for (const warning of model.warnings.slice(0, 10)) lines.push(`- ${warning.path || "model"}: ${warning.message}`);
    if (model.warnings.length > 10) lines.push(`- ... ${model.warnings.length - 10} more`);
  }
  return lines.join("\n");
}

async function walkDocsFiles(root) {
  const results = [];

  async function visit(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    entries.sort((a, b) => compareByCodePoint(a.name, b.name));

    for (const entry of entries) {
      if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      const relativePath = normalizePath(path.relative(root, fullPath));
      if (shouldSkipPath(relativePath)) continue;

      if (entry.isDirectory()) {
        await visit(fullPath);
        continue;
      }

      if (!entry.isFile()) continue;
      if (!isDocsSource(relativePath)) continue;
      results.push(relativePath);
    }
  }

  await visit(root);
  return results.sort(compareByCodePoint);
}

function shouldSkipPath(relativePath) {
  // Locale mirrors (docs/en/…, docs/de/…) are translations of a French source, not standalone
  // resources: the site reads them when it renders that source in the matching locale.
  if (/^docs\/(en|de|it)\//.test(relativePath)) return true;
  return GENERATED_OR_PRIVATE_PREFIXES.some((prefix) => relativePath === prefix || relativePath.startsWith(`${prefix}/`));
}

function isDocsSource(relativePath) {
  const ext = path.extname(relativePath);
  if (!DOC_EXTENSIONS.has(ext) && !TOP_LEVEL_PUBLIC_FILES.has(relativePath)) return false;
  if (relativePath.endsWith("package-lock.json")) return false;
  if (relativePath.endsWith("tsconfig.json") || /(^|\/)tsconfig\.[^/]+\.json$/.test(relativePath)) return false;
  if (ext === ".json") return JSON_ALLOWLIST.some((pattern) => pattern.test(relativePath));
  return true;
}

async function readDocResource(root, relativePath) {
  const fullPath = path.join(root, relativePath);
  const content = await fs.readFile(fullPath, "utf8");
  const parsed = relativePath.endsWith(".md") ? parseFrontmatter(content) : { data: {}, body: content, errors: [] };
  const metadata = parsed.data || {};
  const title = stringOrNull(metadata.title) || extractTitle(relativePath, parsed.body);
  const description = stringOrNull(metadata.description) || deriveDescription(parsed.body);
  const sensitivity = stringOrNull(metadata.sensitivity) || inferSensitivity(relativePath);
  const docRole = stringOrNull(metadata.doc_role) || inferDocRole(relativePath, metadata);
  const audience = arrayOfStrings(metadata.audience);
  const learningLevel = stringOrNull(metadata.learning_level) || inferLearningLevel(relativePath, docRole);
  const related = arrayOfStrings(metadata.related);
  const headings = extractHeadings(parsed.body);
  // Markdown links live in Markdown. Scanning a JSON resource's body (e.g. base.manifest.json, whose
  // embedded descriptions may quote a relative link) would resolve that link against the JSON file's
  // own path and report a phantom broken link.
  const links = relativePath.endsWith(".md") ? extractLinks(parsed.body, relativePath) : [];
  const family = familyOf(relativePath);

  return {
    id: slugifyPath(relativePath),
    source_id: stringOrNull(metadata.id),
    path: relativePath,
    family,
    extension: path.extname(relativePath) || path.basename(relativePath),
    type: stringOrNull(metadata.type) || inferKind(relativePath, docRole),
    doc_role: docRole,
    title,
    description,
    audience: audience.length ? audience : inferAudience(relativePath, docRole),
    learning_level: learningLevel,
    scope: stringOrNull(metadata.scope),
    status: stringOrNull(metadata.status) || "active",
    sensitivity,
    sensitivity_source: metadata.sensitivity ? "metadata" : "inferred",
    license: stringOrNull(metadata.license),
    compatibility: arrayOfStrings(metadata.compatibility),
    related,
    expose_in_docs: metadata.expose_in_docs === false ? false : true,
    owning_agent: owningAgent(relativePath),
    owning_example: owningExample(relativePath),
    route_examples: routeExamples(metadata),
    headings,
    links,
    excerpts: extractMarkedExcerpts(parsed.body),
    frontmatter_errors: parsed.errors || [],
    publish: publishability(relativePath, sensitivity, metadata),
    content_hash: sha256(content),
  };
}

function inferSensitivity(relativePath) {
  if (/^exemples\/[^/]+\/\.ai\/routing\/route-tests\.json$/.test(relativePath)) return "public";
  if (relativePath.startsWith(".ai/")) return "internal";
  if (relativePath.includes("/.ai/")) return "internal";
  if (relativePath.startsWith("tools/")) return "internal";
  if (relativePath.startsWith("tests/")) return "internal";
  if (relativePath.startsWith(".github/")) return "internal";
  if (TOP_LEVEL_PUBLIC_FILES.has(relativePath)) return "public";
  if (relativePath.startsWith("docs/")) return "public";
  if (relativePath.startsWith("specs/")) return "public";
  if (relativePath.startsWith("exemples/") && relativePath.endsWith("README.md")) return "public";
  if (relativePath.startsWith("packages/") && relativePath.endsWith("README.md")) return "public";
  if (relativePath === "base.schema.json") return "public";
  return "internal";
}

function inferDocRole(relativePath, metadata) {
  if (relativePath === "README.md") return "front-door";
  if (relativePath === "LICENSE") return "legal";
  if (relativePath === "CHANGELOG.md") return "release";
  if (relativePath === "SECURITY.md") return "reference";
  if (relativePath.startsWith("decisions/")) return "decision";
  if (relativePath.startsWith("specs/")) return relativePath.endsWith(".json") ? "schema" : "spec";
  if (relativePath.includes("/.ai/agents/") || relativePath.startsWith(".ai/agents/")) return "operational";
  if (relativePath.endsWith("route-tests.json")) return "reference";
  if (relativePath.startsWith("exemples/")) return "example";
  if (relativePath.startsWith("docs/learn/")) return "overview";
  if (relativePath.startsWith("docs/reference/")) return "reference";
  if (relativePath.startsWith("docs/trust/")) return "audit";
  if (relativePath.startsWith("docs/")) return "guide";
  if (relativePath.startsWith("packages/")) return "reference";
  if (relativePath.startsWith("mcp/")) return "reference";
  if (metadata.type === "schema") return "schema";
  return "reference";
}

function inferKind(relativePath, docRole) {
  if (relativePath.endsWith(".json") && relativePath.includes("schema")) return "schema";
  if (relativePath.endsWith("route-tests.json")) return "data";
  if (docRole === "operational") {
    if (relativePath.endsWith("AGENT.md")) return "agent";
    if (relativePath.endsWith("SKILL.md")) return relativePath.includes("/competences/") ? "competence" : "process";
    if (relativePath.includes("/templates/")) return "template";
  }
  return "document";
}

function inferAudience(relativePath, docRole) {
  if (docRole === "front-door") return ["beginner", "builder"];
  if (docRole === "spec" || docRole === "schema") return ["developer", "maintainer"];
  if (docRole === "operational") return ["builder", "maintainer"];
  if (relativePath.includes("presse")) return ["press"];
  if (relativePath.includes("enterprise") || relativePath.includes("administration") || relativePath.includes("secteur-public")) return ["institution", "enterprise"];
  if (relativePath.startsWith("exemples/")) return ["beginner", "builder"];
  return ["beginner"];
}

function inferLearningLevel(relativePath, docRole) {
  if (docRole === "front-door" || relativePath.includes("quickstart") || relativePath.includes("demo")) return "beginner";
  if (docRole === "spec" || docRole === "schema" || docRole === "operational") return "advanced";
  if (relativePath.includes("routage") || relativePath.includes("mcp") || relativePath.includes("provider")) return "intermediate";
  return "beginner";
}

function publishability(relativePath, sensitivity, metadata) {
  const exposed = metadata.expose_in_docs !== false;
  const privatePath = relativePath.startsWith(".plans/") || relativePath.startsWith(".temp/");
  return {
    local: exposed && !privatePath,
    static: exposed && !privatePath,
    public: exposed && !privatePath && sensitivity === "public",
  };
}

function canPublishToTarget(resource, target) {
  if (target === "public") return resource.publish.public;
  if (target === "static") return resource.publish.static;
  return resource.publish.local;
}

function buildGraph(resources) {
  const nodes = resources.map((resource) => ({
    id: resource.id,
    label: resource.title,
    type: resource.type,
    role: resource.doc_role,
    path: resource.path,
  }));
  const edges = [];
  const bySourceId = new Map(resources.map((resource) => [resource.source_id || resource.id, resource]));
  const byPath = new Map(resources.map((resource) => [resource.path, resource]));

  for (const resource of resources) {
    if (resource.owning_agent) edges.push(edge(`agent:${resource.owning_agent}`, resource.id, "owns"));
    if (resource.owning_example) edges.push(edge(`example:${resource.owning_example}`, resource.id, "contains"));
    for (const related of resource.related) {
      const target = bySourceId.get(related);
      if (target) edges.push(edge(resource.id, target.id, "related"));
    }
    for (const link of resource.links) {
      const target = byPath.get(link.resolved_path);
      if (target) edges.push(edge(resource.id, target.id, "links"));
    }
  }

  return { nodes, edges: dedupeEdges(edges).sort(compareEdge) };
}

function buildNavigation(resources, target) {
  const sections = [
    section("start", "Start", resources, (r) => (r.doc_role === "front-door" || r.path.startsWith("docs/start/")) && !r.path.startsWith("docs/tutoriel/")),
    section("tutoriel", "Learn by doing", resources, (r) => r.path.startsWith("docs/tutoriel/")),
    section("learn", "Concepts", resources, (r) => r.path.startsWith("docs/learn/")),
    section("guides", "Guides", resources, (r) => r.path.startsWith("docs/guides/")),
    section("audiences", "Audiences", resources, (r) => r.path.startsWith("docs/audiences/")),
    section("trust", "Trust And Evidence", resources, (r) => r.path.startsWith("docs/trust/")),
    section("public", "Public Materials", resources, (r) => r.path.startsWith("docs/public/")),
    section("examples", "Examples", resources, (r) => r.path.startsWith("exemples/") && r.path.endsWith("README.md")),
    section("reference", "Reference", resources, (r) => ["reference", "spec", "schema", "decision", "release", "legal"].includes(r.doc_role)),
    section("operations", "Agents And Processes", resources, (r) => r.doc_role === "operational"),
  ].filter((item) => item.items.length > 0);
  return { target, sections };
}

function buildSearch(resources) {
  return {
    documents: resources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      path: resource.path,
      text: [resource.title, resource.description, resource.path, resource.type, resource.doc_role, ...resource.headings.map((h) => h.text)].filter(Boolean).join("\n"),
    })),
  };
}

async function buildRouteFixtures(root, resources, target = "local") {
  const fixtures = [];
  const routeResources = resources.filter((resource) => resource.path.endsWith(".ai/routing/route-tests.json"));
  for (const resource of routeResources) {
    const fullPath = path.join(root, resource.path);
    let parsed;
    try {
      parsed = JSON.parse(await fs.readFile(fullPath, "utf8"));
    } catch {
      continue;
    }
    if (!Array.isArray(parsed)) continue;
    for (const [index, fixture] of parsed.entries()) {
      if (!fixture || typeof fixture.request !== "string") continue;
      const fixtureRoot = routeFixtureRoot(resource.path);
      fixtures.push({
        id: `${resource.id}-${index + 1}`,
        root: fixtureRoot,
        source_path: resource.path,
        request: fixture.request,
        expect: fixture.expect || null,
        actual: /** @type {any} */ (null),
      });
    }
  }
  for (const fixture of fixtures) {
    fixture.actual = await resolveRouteFixture(root, fixture, { includePaths: target !== "public" });
  }
  return fixtures.sort((a, b) => compareByCodePoint(`${a.root}\0${a.request}`, `${b.root}\0${b.request}`));
}

function attachIncomingBacklinks(resources) {
  const byPath = new Map(resources.map((resource) => [resource.path, resource]));
  for (const resource of resources) resource.incoming_links = [];
  for (const resource of resources) {
    for (const link of resource.links) {
      const target = byPath.get(link.resolved_path);
      if (!target) continue;
      target.incoming_links.push({
        source_id: resource.id,
        source_path: resource.path,
        label: link.label,
      });
    }
  }
  for (const resource of resources) {
    resource.incoming_links.sort((a, b) => compareByCodePoint(`${a.source_path}\0${a.label}`, `${b.source_path}\0${b.label}`));
  }
}

async function resolveRouteFixture(root, fixture, { includePaths }) {
  try {
    const result = await routeRequest(path.join(root, fixture.root), fixture.request);
    return {
      status: result.status,
      reason_code: result.reason_code || null,
      agent: result.agent ? routeResourceSummary(result.agent, { includePaths }) : null,
      process: result.process ? routeResourceSummary(result.process, { includePaths }) : null,
      explanation: result.explanation || null,
      candidates: (result.candidates || []).slice(0, 3).map((candidate) => ({
        score: candidate.score,
        resource: candidate.resource ? routeResourceSummary(candidate.resource, { includePaths }) : null,
        reasons: candidate.reasons || [],
      })),
    };
  } catch (error) {
    return {
      status: "error",
      reason_code: "route_fixture_error",
      agent: null,
      process: null,
      explanation: String(error?.message ?? error),
      candidates: [],
    };
  }
}

function routeResourceSummary(resource, { includePaths }) {
  return {
    id: resource.id,
    type: resource.type,
    title: resource.title,
    path: includePaths ? resource.path : null,
  };
}

async function buildFamilies(root) {
  const existing = new Set((await fs.readdir(root, { withFileTypes: true })).map((entry) => entry.name));
  return FAMILY_DEFINITIONS.map(([id, description]) => ({
    id,
    description,
    exists: id === "root" ? true : existing.has(id),
    included_in_docs_model: id !== ".plans" && id !== ".temp",
  }));
}

function validateModelInvariants(resources, target) {
  const errors = [];
  const idOwner = new Map();
  for (const resource of resources) {
    if (resource.path.startsWith(".plans/") || resource.path.startsWith(".temp/")) {
      errors.push({ code: "base.docs.private_workspace_included", path: resource.path, message: "Private planning/work files must not enter the docs model." });
    }
    if (target === "public" && resource.sensitivity !== "public") {
      errors.push({ code: "base.docs.public_leak", path: resource.path, message: "Public docs model contains a non-public resource." });
    }
    // Path-derived ids (slugifyPath) become site routes, so they must be unique. slugifyPath is lossy
    // (every non-alphanumeric run collapses to "-"), so distinct paths CAN collide; an unguarded
    // collision would make two pages share one route, silently dropping one. Fail loudly instead.
    const prior = idOwner.get(resource.id);
    if (prior) {
      errors.push({ code: "base.docs.duplicate_id", path: resource.path, message: `Path-derived id "${resource.id}" collides with ${prior}; rename one file so their slugs differ.` });
    } else {
      idOwner.set(resource.id, resource.path);
    }
  }
  return errors.sort(compareWarning);
}

function detectDuplicateSourceIds(resources) {
  const seen = new Map();
  const warnings = [];
  for (const resource of resources) {
    if (!resource.source_id) continue;
    const scope = resource.owning_example || "root";
    const key = `${scope}\0${resource.source_id}`;
    const prior = seen.get(key);
    if (prior) {
      warnings.push({
        code: "base.docs.duplicate_source_id",
        path: resource.path,
        message: `Source id "${resource.source_id}" is also used by ${prior} in the same docs scope. The docs model keeps path-based ids to avoid collisions.`,
      });
    } else {
      seen.set(key, resource.path);
    }
  }
  return warnings;
}

async function detectBrokenLinks(root, resources) {
  const warnings = [];
  const byPath = new Map(resources.map((resource) => [resource.path, resource]));
  for (const resource of resources) {
    for (const link of resource.links) {
      if (link.resolved_path && !(await pathExists(path.join(root, link.resolved_path)))) {
        warnings.push({
          code: "base.docs.broken_link",
          path: resource.path,
          message: `Broken local link to ${link.href}.`,
        });
        continue; // the file is missing; its anchor cannot be judged
      }
      // Validate the #anchor against the target's heading slugs: a cross-page link resolves to that
      // resource, a same-page (#…) link to this one. Only model resources carry headings; a link to a
      // non-markdown file or outside the model is left alone (no slugs to check against).
      if (link.anchor) {
        const target = link.resolved_path ? byPath.get(link.resolved_path) : resource;
        if (target && Array.isArray(target.headings) && !target.headings.some((h) => h.slug === link.anchor)) {
          warnings.push({
            code: "base.docs.broken_anchor",
            path: resource.path,
            message: `Broken anchor "#${link.anchor}" in link to ${link.href}.`,
          });
        }
      }
    }
  }
  return warnings;
}

function detectThinResources(resources) {
  const warnings = [];
  for (const resource of resources) {
    if (resource.publish.public && !resource.description) {
      warnings.push({ code: "base.docs.missing_description", path: resource.path, message: "Public resource has no description." });
    }
  }
  return warnings;
}

async function pathExists(fullPath) {
  try {
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

function extractTitle(relativePath, body) {
  const heading = body.match(/^#\s+(.+)$/m);
  if (heading) return cleanHeading(heading[1]);
  if (relativePath === "LICENSE") return "License";
  return titleize(path.basename(relativePath, path.extname(relativePath)));
}

function deriveDescription(body) {
  const paragraph = body
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .find((part) => part && !part.startsWith("#") && !part.startsWith("```") && !part.startsWith("---"));
  if (!paragraph) return null;
  return paragraph.replace(/\s+/g, " ").slice(0, 220);
}

function extractHeadings(body) {
  const headings = [];
  const pattern = /^(#{1,6})\s+(.+)$/gm;
  let match;
  while ((match = pattern.exec(body))) {
    headings.push({ depth: match[1].length, text: cleanHeading(match[2]), slug: slugifyText(match[2]) });
  }
  return headings;
}

function extractLinks(body, relativePath) {
  const links = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = pattern.exec(body))) {
    const href = match[2].trim();
    const resolved = resolveLocalLink(href, relativePath);
    links.push({ label: match[1].trim(), href, resolved_path: resolved, anchor: linkAnchor(href) });
  }
  return links;
}

// The slug after `#` in a local link (`page.md#a-heading`, or same-page `#a-heading`), decoded so an
// encoded character matches the ASCII heading slug. null for an external URL or an anchorless link.
function linkAnchor(href) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return null; // external scheme (http:, mailto:…)
  const hash = href.indexOf("#");
  if (hash < 0) return null;
  const raw = href.slice(hash + 1).split("?")[0];
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function resolveLocalLink(href, relativePath) {
  if (!href || href.startsWith("#")) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return null;
  const withoutAnchor = href.split("#")[0].split("?")[0];
  if (!withoutAnchor) return null;
  const decoded = decodeURI(withoutAnchor).replace(/^\//, "");
  if (href.startsWith("/")) return normalizePath(decoded);
  return normalizePath(path.posix.normalize(path.posix.join(path.posix.dirname(relativePath), decoded)));
}

function extractMarkedExcerpts(body) {
  const excerpts = [];
  const pattern = /<!--\s*base-doc:excerpt\s+id="([^"]+)"([^>]*)-->([\s\S]*?)<!--\s*\/base-doc:excerpt\s*-->/g;
  let match;
  while ((match = pattern.exec(body))) {
    excerpts.push({ id: match[1], attributes: match[2].trim(), text: match[3].trim() });
  }
  return excerpts;
}

function owningAgent(relativePath) {
  const match = relativePath.match(/(?:^|\/)\.ai\/agents\/([^/]+)\//);
  return match ? match[1] : null;
}

function owningExample(relativePath) {
  const match = relativePath.match(/^exemples\/([^/]+)\//);
  return match ? match[1] : null;
}

function routeExamples(metadata) {
  const examples = metadata.routing && typeof metadata.routing === "object" ? metadata.routing.examples : null;
  return arrayOfStrings(examples);
}

function familyOf(relativePath) {
  if (!relativePath.includes("/")) return "root";
  return relativePath.split("/")[0];
}

function routeFixtureRoot(relativePath) {
  if (relativePath === ".ai/routing/route-tests.json") return ".";
  const marker = "/.ai/routing/route-tests.json";
  if (relativePath.endsWith(marker)) return relativePath.slice(0, -marker.length);
  return path.posix.dirname(relativePath);
}

function normalizeTarget(target) {
  if (target === "public" || target === "static" || target === "local" || target == null) return target || "local";
  throw new Error("docs target must be local, static, or public.");
}

function stringOrNull(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function arrayOfStrings(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()) : [];
}

function cleanHeading(value) {
  return String(value).replace(/\s+#*$/, "").trim();
}

function titleize(value) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function slugifyPath(value) {
  return normalizePath(value)
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "root";
}

/**
 * Heading slug used for the model's heading anchors. Exported because presentation
 * adapters must produce identical anchors when they render the same sources
 * (resource page contract, FR-DOCS-004): one implementation, no mirror to drift.
 * @param {string} value
 */
export function slugifyText(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function sha256(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function normalizePath(value) {
  return value.split(path.sep).join("/");
}

function edge(source, target, type) {
  return { source, target, type };
}

function dedupeEdges(edges) {
  const seen = new Set();
  const out = [];
  for (const item of edges) {
    const key = `${item.source}\0${item.target}\0${item.type}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function section(id, title, resources, predicate) {
  return {
    id,
    title,
    items: resources
      .filter(predicate)
      .map((resource) => ({ id: resource.id, title: resource.title, path: resource.path, role: resource.doc_role }))
      .sort((a, b) => compareByCodePoint(a.path, b.path)),
  };
}

function compareWarning(a, b) {
  return compareByCodePoint(`${a.path || ""}\0${a.code}\0${a.message}`, `${b.path || ""}\0${b.code}\0${b.message}`);
}

function compareEdge(a, b) {
  return compareByCodePoint(`${a.source}\0${a.target}\0${a.type}`, `${b.source}\0${b.target}\0${b.type}`);
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
