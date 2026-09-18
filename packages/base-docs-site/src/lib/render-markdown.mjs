import { Marked } from "marked";
import { splitSections } from "@ai-swiss/base/docs-model";

const HTML_COMMENT = /<!--[\s\S]*?-->/g;
const EXPLICIT_ANCHOR = /\s*\{#[a-z0-9]+(?:-[a-z0-9]+)*\}\s*$/;
const HEADING_MARKER = /<!--base-doc-render-heading:(\d+)-->/;

/**
 * Render one Markdown body and derive its outline from the same canonical section sequence.
 * @param {string} body
 * @param {{
 *   resolveLink?: (href: string) => string,
 *   resolveImage?: (href: string) => string,
 * }} [options]
 */
export function renderMarkdownBody(body, options = {}) {
  const resolveLink = options.resolveLink ?? ((href) => href);
  const resolveImage = options.resolveImage ?? ((href) => href);
  const sections = splitSections(body).filter((section) => section.heading !== null);
  const headings = sections.map((section) => ({
    depth: section.level,
    text: section.heading,
    slug: section.anchor,
  }));
  const markedBody = markCanonicalHeadings(body, sections);
  const renderedHeadings = new Set();
  const marked = new Marked();
  marked.use({
    renderer: {
      heading(token) {
        const inline = this.parser
          .parseInline(token.tokens)
          .replace(HTML_COMMENT, "")
          .replace(EXPLICIT_ANCHOR, "")
          .trimEnd();
        const marker = HEADING_MARKER.exec(token.raw);
        if (!marker) return `<h${token.depth}>${inline}</h${token.depth}>\n`;
        const index = Number(marker[1]);
        const heading = headings[index];
        if (!heading || heading.depth !== token.depth || renderedHeadings.has(index)) {
          throw new Error(`Rendered Markdown heading ${index + 1} diverges from the canonical section sequence.`);
        }
        renderedHeadings.add(index);
        return `<h${token.depth} id="${heading.slug}">${inline}</h${token.depth}>\n`;
      },
      link(token) {
        const titleAttr = token.title ? ` title="${escapeAttribute(token.title)}"` : "";
        return `<a href="${escapeAttribute(resolveLink(token.href))}"${titleAttr}>${this.parser.parseInline(token.tokens)}</a>`;
      },
      image(token) {
        const titleAttr = token.title ? ` title="${escapeAttribute(token.title)}"` : "";
        return `<img src="${escapeAttribute(resolveImage(token.href))}" alt="${escapeAttribute(token.text)}"${titleAttr} />`;
      },
    },
  });
  const content = marked.parse(markedBody, { async: false });
  if (renderedHeadings.size !== headings.length) {
    throw new Error(`Rendered ${renderedHeadings.size} headings but the canonical section sequence contains ${headings.length}.`);
  }
  return { content, headings };
}

function markCanonicalHeadings(body, sections) {
  const lines = body.split("\n");
  sections.forEach((section, index) => {
    lines[section.line - 1] += ` <!--base-doc-render-heading:${index}-->`;
  });
  return lines.join("\n");
}

function escapeAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
