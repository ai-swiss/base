import fs from "node:fs";
import path from "node:path";

export function modelDir(packageRoot) {
  return process.env.BASE_DOCS_MODEL_DIR || path.resolve(packageRoot, "../../.base-docs/local");
}

export function buildSidebar(packageRoot) {
  const navigation = JSON.parse(fs.readFileSync(path.join(modelDir(packageRoot), "navigation.json"), "utf8"));
  return projectNavigation(navigation, (itemPath) => enTitleOf(packageRoot, itemPath));
}

/**
 * @param {any} navigation
 * @param {(itemPath: string) => string | null} [englishTitle]
 */
export function projectNavigation(navigation, englishTitle) {
  const titleFor = englishTitle ?? (() => null);
  return navigation.items.map((item) => projectItem(item, titleFor));
}

function projectItem(item, englishTitle) {
  if (item.type === "link") {
    return withEnglishLabel({ label: item.labels.fr, link: item.href }, item.labels.en);
  }
  if (item.type === "resource") {
    return withEnglishLabel(
      { label: item.label ?? item.title, link: `/resources/${item.site_key}/` },
      item.enLabel ?? item.enTitle ?? englishTitle(item.path),
    );
  }
  const projected = disambiguate(item.items, englishTitle)
    .map((child) => projectItem(child, englishTitle));
  return {
    label: item.labels.fr,
    translations: { en: item.labels.en },
    collapsed: item.collapsed,
    items: projected,
  };
}

function disambiguate(items, englishTitle) {
  const resources = items.map((item) => item.type === "resource"
    ? { ...item, enTitle: englishTitle(item.path) }
    : item);
  return labelled(
    labelled(
      resources,
      (item) => `${item.title} · ${contextHint(item.path)}`,
      (item) => `${item.enTitle ?? item.title} · ${contextHint(item.path)}`,
    ),
    (item) => `${item.title} · ${item.path.split("/").slice(-2).join("/")}`,
    (item) => `${item.enTitle ?? item.title} · ${item.path.split("/").slice(-2).join("/")}`,
  );
}

function labelled(items, hint, englishHint) {
  const counts = new Map();
  for (const item of items) {
    const label = item.type === "resource" ? (item.label ?? item.title) : item.labels.fr;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return items.map((item) => {
    if (item.type !== "resource") return item;
    const label = item.label ?? item.title;
    const enLabel = item.enLabel ?? item.enTitle ?? item.title;
    if (counts.get(label) > 1) return { ...item, label: hint(item), enLabel: englishHint(item) };
    return { ...item, label, enLabel };
  });
}

function withEnglishLabel(entry, englishLabel) {
  return englishLabel && englishLabel !== entry.label
    ? { ...entry, translations: { en: englishLabel } }
    : entry;
}

function enTitleOf(packageRoot, itemPath) {
  if (!itemPath.startsWith("docs/")) return null;
  try {
    const mirror = path.resolve(packageRoot, "../..", `docs/en/${itemPath.slice("docs/".length)}`);
    const text = fs.readFileSync(mirror, "utf8");
    const match = text.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
  } catch {
    return null;
  }
}

function contextHint(itemPath) {
  const segments = itemPath.split("/");
  for (const parent of ["exemples", "packages"]) {
    const index = segments.indexOf(parent);
    if (index >= 0 && segments.length > index + 1) return segments[index + 1];
  }
  const agents = segments.indexOf("agents");
  if (agents >= 0 && segments.length > agents + 1) return segments[agents + 1];
  return segments.length > 1 ? segments[segments.length - 2] : segments[0];
}
