import fs from "node:fs";
import path from "node:path";
import { localeBase, type Locale } from "./i18n";
import { REPO_URL } from "./metadata.mjs";
import { renderMarkdownBody } from "./render-markdown.mjs";

export type DocsResource = {
  id: string;
  id_is_authored: boolean;
  site_key: string;
  path: string;
  title: string;
  description: string | null;
  type: string;
  doc_role: string;
  audience: string[];
  learning_level: string;
  sensitivity: string;
  family: string;
  headings: Array<{ depth: number; text: string; slug: string }>;
  incoming_links: Array<{ source_id: string; source_site_key: string; source_path: string; label: string }>;
  route_examples: string[];
  owning_agent: string | null;
  owning_example: string | null;
};

export type DocsModel = {
  schema_version: string;
  target: string;
  root_label: string;
  stats: {
    source_resources: number;
    resources: number;
    warnings: number;
    errors: number;
  };
  navigation: DocsNavigation;
  resource_aliases: Array<{ id: string; site_key: string }>;
  families: Array<{
    id: string;
    description: string;
    exists: boolean;
    included_in_docs_model: boolean;
  }>;
  graph: {
    nodes: Array<{ id: string; resource_id: string; site_key: string; label: string; type: string; role: string; path: string }>;
    edges: Array<{ source: string; target: string; type: string }>;
  };
  route_fixtures: Array<{
    id: string;
    root: string;
    source_path: string;
    request: string;
    expect: {
      status?: string;
      agent?: string;
      process?: string;
    } | null;
    actual: {
      status: string;
      reason_code: string | null;
      agent: { id: string; type: string; title: string; path: string | null } | null;
      process: { id: string; type: string; title: string; path: string | null } | null;
      explanation: string | null;
      candidates: Array<{
        score: number;
        resource: { id: string; type: string; title: string; path: string | null } | null;
        reasons: string[];
      }>;
    } | null;
  }>;
  resources: DocsResource[];
  warnings: Array<{ code: string; path?: string; message: string }>;
  errors: Array<{ code: string; path?: string; message: string }>;
};

type LocalizedLabel = { fr: string; en: string };
type NavigationResource = {
  type: "resource";
  id: string;
  site_key: string;
  title: string;
  path: string;
  role: string;
};
type NavigationLink = { type: "link"; id: string; labels: LocalizedLabel; href: string };
type NavigationGroup = {
  type: "group";
  id: string;
  labels: LocalizedLabel;
  collapsed: boolean;
  items: NavigationItem[];
};
type NavigationItem = NavigationResource | NavigationLink | NavigationGroup;
type DocsNavigation = {
  target: string;
  items: NavigationItem[];
  exclusions: Array<{ id: string; site_key: string; path: string; reason: string }>;
};

export function loadModel(): DocsModel {
  const modelDir = process.env.BASE_DOCS_MODEL_DIR || path.resolve(process.cwd(), "../../.base-docs/local");
  const modelPath = path.join(modelDir, "model.json");
  if (!fs.existsSync(modelPath)) {
    throw new Error(`BASE docs model not found at ${modelPath}. Run "base docs model" first.`);
  }
  return JSON.parse(fs.readFileSync(modelPath, "utf8"));
}

/**
 * Renders the canonical source of a resource for the site. The rendering stays a projection
 * but becomes navigable: headings receive the model's anchor slugs and internal Markdown links
 * are rewritten to the matching resource page (or to the repository when not modeled).
 */
export function loadRenderedSource(
  model: DocsModel,
  resource: DocsResource,
  locale: Locale,
): { type: "html" | "code"; content: string; headings: DocsResource["headings"] | null; translated: boolean; title: string | null } {
  const root = process.env.BASE_DOCS_ROOT || path.resolve(process.cwd(), "../..");
  // French is authoritative; a non-French locale renders its mirror when one exists, else the French
  // source as a fallback (so a partial translation degrades gracefully, never to a missing page).
  const sourcePath = translatedSourcePath(resource.path, locale, root);
  const translated = sourcePath !== resource.path;
  const raw = fs.readFileSync(path.join(root, sourcePath), "utf8");
  if (resource.path.endsWith(".json") || resource.path === "LICENSE") {
    return { type: "code", content: prettySource(resource.path, raw), headings: null, translated, title: null };
  }
  const byPath = new Map(model.resources.map((entry) => [entry.path, entry]));
  // Links and images in a mirror keep the French source's relative paths (only their text is
  // translated), so they resolve against the French resource's directory, not the mirror's.
  const baseDir = path.posix.dirname(resource.path);
  const rendered = renderMarkdownBody(stripFrontmatter(raw), {
    resolveLink: (href) => resolveHref(href, baseDir, byPath, locale),
    resolveImage: (href) => isExternal(href) ? href : `${REPO_URL}/raw/main/${resolvePath(href, baseDir)}`,
  });
  // A mirror has its own (translated) headings and title, so the page outline AND the page title come
  // from it, not from the French model resource, or the anchors, the TOC and the heading would disagree.
  const title = translated ? (rendered.headings.find((heading) => heading.depth === 1)?.text ?? null) : null;
  return { type: "html", content: rendered.content, headings: rendered.headings, translated, title };
}

/**
 * Root files that are English-default by exception: the base path (README.md) holds the English
 * rendering readers see first, while the authoritative French source lives at the `.fr.md` sibling.
 * This inverts the project-wide convention (base path = French) for these files alone, so the site
 * resolves French from the sibling and renders the base path as-is for every other locale. Add a
 * name here if another root file later goes English-default.
 */
const ENGLISH_DEFAULT_ROOT_FILES = new Set(["README.md"]);

/** The file to render for a resource in a locale: the locale mirror when present, else the source. */
function translatedSourcePath(resourcePath: string, locale: Locale, root: string): string {
  if (ENGLISH_DEFAULT_ROOT_FILES.has(resourcePath)) {
    if (locale === "fr") {
      const french = resourcePath.replace(/\.md$/, ".fr.md");
      return fs.existsSync(path.join(root, french)) ? french : resourcePath;
    }
    return resourcePath; // the base path already holds the default (English) rendering
  }
  if (locale === "fr") return resourcePath;
  let candidate: string | null = null;
  if (resourcePath.startsWith("docs/")) {
    candidate = `docs/${locale}/${resourcePath.slice("docs/".length)}`;
  } else if (/^[^/]+\.md$/.test(resourcePath)) {
    candidate = resourcePath.replace(/\.md$/, `.${locale}.md`); // a root file: MANIFESTO.md -> MANIFESTO.en.md
  }
  if (candidate && fs.existsSync(path.join(root, candidate))) return candidate;
  return resourcePath;
}

export function resourceHref(resource: Pick<DocsResource, "site_key">, locale: Locale = "fr"): string {
  return `${localeBase(locale)}/resources/${resource.site_key}/`;
}

export function resourceStaticPaths(model: DocsModel, locale: Locale = "fr") {
  const bySiteKey = new Map(model.resources.map((resource) => [resource.site_key, resource]));
  const canonical = model.resources.map((resource) => ({
    params: { id: resource.site_key },
    props: { resource, target: model.target, aliasTo: null },
  }));
  const aliases = model.resource_aliases.map((alias) => {
    const resource = bySiteKey.get(alias.site_key);
    if (!resource) throw new Error(`Resource alias "${alias.id}" targets missing site key "${alias.site_key}".`);
    return {
      params: { id: alias.id },
      props: { resource, target: model.target, aliasTo: resourceHref(resource, locale) },
    };
  });
  return [...canonical, ...aliases];
}

export function byTitleThenPath(a: DocsResource, b: DocsResource): number {
  const title = a.title.localeCompare(b.title);
  return title === 0 ? a.path.localeCompare(b.path) : title;
}

export function resourcesByUniqueId(resources: DocsResource[]): Map<string, DocsResource> {
  const byId = new Map<string, DocsResource>();
  const duplicates = new Set<string>();
  for (const resource of resources) {
    if (byId.has(resource.id)) duplicates.add(resource.id);
    else byId.set(resource.id, resource);
  }
  for (const id of duplicates) byId.delete(id);
  return byId;
}

function resolveHref(href: string, baseDir: string, byPath: Map<string, DocsResource>, locale: Locale): string {
  if (isExternal(href) || href.startsWith("#") || href.startsWith("/")) return href;
  const [target, fragment] = href.split("#", 2);
  const repoPath = resolvePath(target, baseDir);
  const resource = byPath.get(repoPath);
  const anchor = fragment ? `#${fragment}` : "";
  if (resource) return `${resourceHref(resource, locale)}${anchor}`;
  return `${REPO_URL}/blob/main/${repoPath}${anchor}`;
}

function resolvePath(href: string, baseDir: string): string {
  return path.posix.normalize(path.posix.join(baseDir === "." ? "" : baseDir, decodeURI(href)));
}

function isExternal(href: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(href);
}

function stripFrontmatter(content: string): string {
  const prelude = content.match(/^(?:\uFEFF)?(?:<!--[\s\S]*?-->\s*)*/)?.[0] ?? "";
  const source = content.slice(prelude.length);
  if (!/^---\r?\n/.test(source)) return content;
  const lines = source.split("\n");
  const end = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  return end === -1 ? content : lines.slice(end + 1).join("\n");
}

function prettySource(sourcePath: string, raw: string): string {
  if (!sourcePath.endsWith(".json")) return raw;
  try {
    return `${JSON.stringify(JSON.parse(raw), null, 2)}\n`;
  } catch {
    return raw;
  }
}
