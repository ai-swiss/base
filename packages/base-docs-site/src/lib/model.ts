import fs from "node:fs";
import path from "node:path";
import { Marked, type Tokens } from "marked";
// The model is the single source of the slug algorithm; the site renders anchors with it
// so deep links and the page outline can never drift from the model's heading slugs.
import { slugifyText } from "../../../../tools/docs/model.mjs";
import { localeBase, type Locale } from "./i18n";
import { REPO_URL } from "./metadata.mjs";

export type DocsResource = {
  id: string;
  source_id: string | null;
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
  incoming_links: Array<{ source_id: string; source_path: string; label: string }>;
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
  navigation: {
    sections: Array<{
      id: string;
      title: string;
      items: Array<{ id: string; title: string; path: string; role: string }>;
    }>;
  };
  families: Array<{
    id: string;
    description: string;
    exists: boolean;
    included_in_docs_model: boolean;
  }>;
  graph: {
    nodes: Array<{ id: string; label: string; type: string; role: string; path: string }>;
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
  const marked = new Marked();
  marked.use({
    renderer: {
      heading(token: Tokens.Heading) {
        return `<h${token.depth} id="${slugifyText(token.text)}">${this.parser.parseInline(token.tokens)}</h${token.depth}>\n`;
      },
      link(token: Tokens.Link) {
        const resolved = resolveHref(token.href, baseDir, byPath, locale);
        const titleAttr = token.title ? ` title="${escapeAttribute(token.title)}"` : "";
        return `<a href="${escapeAttribute(resolved)}"${titleAttr}>${this.parser.parseInline(token.tokens)}</a>`;
      },
      image(token: Tokens.Image) {
        const resolved = isExternal(token.href) ? token.href : `${REPO_URL}/raw/main/${resolvePath(token.href, baseDir)}`;
        const titleAttr = token.title ? ` title="${escapeAttribute(token.title)}"` : "";
        return `<img src="${escapeAttribute(resolved)}" alt="${escapeAttribute(token.text)}"${titleAttr} />`;
      },
    },
  });
  const body = stripFrontmatter(raw);
  // A mirror has its own (translated) headings and title, so the page outline AND the page title come
  // from it, not from the French model resource, or the anchors, the TOC and the heading would disagree.
  const headings = translated ? extractHeadings(body) : null;
  const title = translated ? (headings?.find((h) => h.depth === 1)?.text ?? null) : null;
  return { type: "html", content: marked.parse(body, { async: false }) as string, headings, translated, title };
}

/** The file to render for a resource in a locale: the locale mirror when present, else the French source. */
function translatedSourcePath(resourcePath: string, locale: Locale, root: string): string {
  if (locale === "fr") return resourcePath;
  let candidate: string | null = null;
  if (resourcePath.startsWith("docs/")) {
    candidate = `docs/${locale}/${resourcePath.slice("docs/".length)}`;
  } else if (/^[^/]+\.md$/.test(resourcePath)) {
    candidate = resourcePath.replace(/\.md$/, `.${locale}.md`); // a root file: README.md -> README.en.md
  }
  if (candidate && fs.existsSync(path.join(root, candidate))) return candidate;
  return resourcePath;
}

/** Heading outline of a body, slugged with the model's algorithm so the TOC matches the rendered anchors. */
function extractHeadings(body: string): DocsResource["headings"] {
  const headings: DocsResource["headings"] = [];
  const re = /^(#{1,6})\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const text = m[2].replace(/\s+#*\s*$/, "").trim();
    headings.push({ depth: m[1].length, text, slug: slugifyText(text) });
  }
  return headings;
}

export function resourceHref(resource: Pick<DocsResource, "id">, locale: Locale = "fr"): string {
  return `${localeBase(locale)}/resources/${resource.id}/`;
}

export function byTitleThenPath(a: DocsResource, b: DocsResource): number {
  const title = a.title.localeCompare(b.title);
  return title === 0 ? a.path.localeCompare(b.path) : title;
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

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function stripFrontmatter(content: string): string {
  if (!content.startsWith("---\n")) return content;
  const lines = content.split("\n");
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
