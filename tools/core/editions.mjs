// tools/core/editions.mjs — a resource's language, its editions in other languages, and the printed
// pages behind a converted document. Zero dependencies; the caller does every read.
//
// LANGUAGE. `lang` in the card, else the file-name suffix `<slug>.<lang>.md` (ISO 639-1), else none.
// A folder card or a figure record is language-neutral, and saying «fr» about it would be an
// invention, so the answer is null rather than a default.
//
// EDITIONS. A translation declares `translation_of: <canonical id>`; the canonical declares nothing.
// Opening with `lang` returns the edition in that language when one exists, and otherwise the
// canonical, FLAGGED as a fallback with the languages that do exist. A silent fallback is the failure
// that matters here: a reader who asked for German and receives French without being told will quote
// one language's wording as the other's.
//
// ORIGINALS. A converted document is a transcription, and the sentence a reader wants to check often
// lives in the scan. `source.image` names one page image; `source.page_images` is a template with
// `{page}` (or `{page:03}`, zero-padded) resolved for each entry of `source.pages`. Nothing is read
// here, and the egress rule belongs to the caller: images are read only for a resource that may
// travel, because a page scan is the confidential document itself, in another encoding.

const LANG_SUFFIX = /\.([a-z]{2})\.md$/;
const PAGE_TOKEN = /\{page(?::0(\d+))?\}/g;

/** @param {Record<string, any> | null | undefined} resource */
export function languageOf(resource) {
  const declared = resource?.metadata?.lang;
  if (typeof declared === "string" && /^[a-z]{2}$/.test(declared)) return declared;
  const m = LANG_SUFFIX.exec(String(resource?.path ?? ""));
  return m ? m[1] : null;
}

/**
 * The edition of `resource` to open for `lang`: itself when the language matches or none is asked,
 * the sibling edition in that language when one exists, else the canonical flagged as a fallback with
 * the languages that do exist. Either side of the family resolves, a translation being able to name
 * its canonical and the canonical being reachable from any of its translations.
 * @param {Array<Record<string, any>>} resources
 * @param {Record<string, any>} resource
 * @param {string | undefined} lang
 * @returns {{ resource: Record<string, any>, language: string | null, requested: string | null, fallback: boolean, available: string[] | null }}
 */
export function pickEdition(resources, resource, lang) {
  const language = languageOf(resource);
  if (!lang || lang === language) return { resource, language, requested: lang ?? null, fallback: false, available: null };
  const canonicalId = typeof resource.metadata?.translation_of === "string" ? resource.metadata.translation_of : resource.id;
  const family = resources.filter((r) => r.id === canonicalId || r.metadata?.translation_of === canonicalId);
  const hit = family.find((r) => languageOf(r) === lang);
  if (hit) return { resource: hit, language: lang, requested: lang, fallback: false, available: null };
  const canonical = family.find((r) => r.id === canonicalId) ?? resource;
  const available = [...new Set(family.map(languageOf).filter((l) => l !== null))];
  return { resource: canonical, language: languageOf(canonical), requested: lang, fallback: true, available };
}

/**
 * What to tell a caller that asked for a language: which edition answered and, when none exists in
 * that language, which do and that the canonical came back instead.
 * @param {{ requested: string | null, language: string | null, fallback: boolean, available: string[] | null }} edition
 * @param {string} askedId
 */
export function editionReport(edition, askedId) {
  const report = { requested: edition.requested, language: edition.language, fallback: edition.fallback };
  if (!edition.fallback) return report;
  return { ...report, available: edition.available, note: `No ${edition.requested} edition of ${askedId}; the ${edition.language ?? "language-neutral"} edition is returned.` };
}

/**
 * The page images a `source` block names, in page order: `image` (one file) and `page_images` (a
 * template resolved per page). Paths are root-relative as written; nothing is read here.
 * @param {Record<string, any> | null | undefined} source
 * @returns {Array<{ page: number | null, path: string }>}
 */
export function sourceImagePaths(source) {
  if (!source || typeof source !== "object") return [];
  /** @type {Array<{ page: number | null, path: string }>} */
  const out = [];
  const pages = Array.isArray(source.pages) ? source.pages.filter((p) => Number.isInteger(p)) : [];
  if (typeof source.image === "string" && source.image.trim()) out.push({ page: pages.length === 1 ? pages[0] : null, path: source.image.trim() });
  if (typeof source.page_images === "string" && source.page_images.includes("{page")) {
    for (const page of pages) {
      const resolved = source.page_images.replace(PAGE_TOKEN, (_, width) => (width ? String(page).padStart(Number(width), "0") : String(page)));
      if (!out.some((o) => o.path === resolved)) out.push({ page, path: resolved });
    }
  }
  return out;
}

const MIME = /** @type {Record<string, string>} */ ({ png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif" });

/** @param {string} filePath */
export function imageMimeOf(filePath) {
  const ext = String(filePath).toLowerCase().split(".").pop() ?? "";
  return MIME[ext] ?? null;
}

// One rule for what a call attaches: page images are added in page order while the running total stays
// under this budget, and the rest travel as paths, named so the reader knows the page exists and where
// it is. A tool result must stay well under the limits a chat client applies to it, and a page scan
// runs to hundreds of kilobytes before base64. PROVISIONAL: the number is a safe guess, not a
// measurement; it belongs with the measured client limits (the map page size and the section size are
// set the same way), and a page selector for a long document belongs with it.
const SOURCE_IMAGE_BUDGET_BYTES = 1_500_000;

/**
 * The `source` projection: the card's source record, its citation, and the printed pages it names,
 * read through the caller's confined reader (this module does no I/O) and attached as base64 when
 * small enough. The text summary names every page and says why one is not attached, so a client
 * without image support still learns where the original is instead of receiving silence.
 * @param {Record<string, any> | null | undefined} metadata the card, read for `source` and `cite_as`
 * @param {(relPath: string) => Promise<Buffer>} readImage
 */
export async function sourceProjection(metadata, readImage) {
  const raw = metadata?.source;
  const record = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : null;
  const cite = typeof metadata?.cite_as === "string" && metadata.cite_as.trim() ? metadata.cite_as : null;
  /** @type {Array<Record<string, any>>} */
  const images = [];
  let spent = 0;
  for (const { page, path: rel } of sourceImagePaths(record)) {
    const mime = imageMimeOf(rel);
    try {
      const data = await readImage(rel);
      if (!mime) images.push({ page, path: rel, bytes: data.length, unsupported: true });
      else if (spent + data.length > SOURCE_IMAGE_BUDGET_BYTES) images.push({ page, path: rel, bytes: data.length, over_budget: true });
      else {
        images.push({ page, path: rel, bytes: data.length, mime, data: data.toString("base64") });
        spent += data.length;
      }
    } catch {
      // A deployment that ships the text without the scans is normal, not an error: the page is named
      // as absent here rather than failing the whole read.
      images.push({ page, path: rel, missing: true });
    }
  }
  const lines = cite ? [`Citation: ${cite}`] : [];
  lines.push(record ? `Source: ${JSON.stringify(record)}` : "Source: none declared on this resource.");
  for (const img of images) {
    const where = img.page === null || img.page === undefined ? "image" : `page ${img.page}`;
    const state = img.data ? "attached" : img.missing ? "not present in this deployment" : img.over_budget ? "not attached, over this result's image budget" : "not an image type the server attaches";
    lines.push(`${where}: ${img.path} (${state})`);
  }
  return { source: record, images, content: lines.join("\n") };
}
