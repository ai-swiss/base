// Spec coverage: FR-CORE-013
// Editions: a resource's language comes from its card or its file name; opening with `lang` picks the
// sibling edition, or returns the canonical flagged as a fallback with the languages that exist.
// Originals: a source block names its pages one by one or by a template, and the pages are read only
// for a resource that may travel.

import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { languageOf, pickEdition, sourceImagePaths, imageMimeOf, sourceProjection } from "../tools/core/editions.mjs";
import { openResource } from "../tools/base-core.mjs";

const en = { id: "guide-assess", path: "guide/assess.en.md", metadata: {} };
const de = { id: "guide-assess-de", path: "guide/assess.de.md", metadata: { translation_of: "guide-assess" } };
const folder = { id: "guide", path: "guide/README.md", metadata: {} };
const declared = { id: "x", path: "x.md", metadata: { lang: "fr" } };

describe("editions", () => {
  it("reads the language from the card first, then the file name, else none", () => {
    assert.equal(languageOf(en), "en");
    assert.equal(languageOf(declared), "fr");
    assert.equal(languageOf(folder), null);
  });

  it("picks the sibling edition from either side, and falls back to the canonical with what exists", () => {
    const all = [en, de, folder];
    assert.equal(pickEdition(all, en, undefined).resource, en);
    assert.equal(pickEdition(all, en, "de").resource, de);
    assert.equal(pickEdition(all, de, "en").resource, en);
    const fb = pickEdition(all, de, "fr");
    assert.equal(fb.resource, en);
    assert.equal(fb.fallback, true);
    assert.deepEqual(fb.available, ["en", "de"]);
  });

  it("resolves page images from a single image and from a template, in page order, without duplicates", () => {
    assert.deepEqual(sourceImagePaths({ pages: [77], image: "src/page-077.png" }), [{ page: 77, path: "src/page-077.png" }]);
    assert.deepEqual(sourceImagePaths({ pages: [4, 5], page_images: "src/page-{page:03}.png" }), [
      { page: 4, path: "src/page-004.png" },
      { page: 5, path: "src/page-005.png" },
    ]);
    assert.deepEqual(sourceImagePaths({ pages: [4], image: "src/page-4.png", page_images: "src/page-{page}.png" }), [{ page: 4, path: "src/page-4.png" }]);
    assert.deepEqual(sourceImagePaths(null), []);
    assert.equal(imageMimeOf("a/b.PNG"), "image/png");
    assert.equal(imageMimeOf("a/b.pdf"), null);
  });

  it("attaches pages in order while the budget holds, lists the rest, and summarises every page", async () => {
    const big = Buffer.alloc(1_400_000, 1);
    const small = Buffer.alloc(10, 2);
    const read = async (/** @type {string} */ rel) => (rel.endsWith("004.png") ? big : rel.endsWith("005.png") ? small : Buffer.alloc(200_000, 3));
    const card = { cite_as: "Guide (2026), pp. 4-6", source: { pages: [4, 5, 6], page_images: "src/page-{page:03}.png" } };
    const out = await sourceProjection(card, read);
    assert.deepEqual(
      out.images.map((i) => [i.page, i.data ? "attached" : i.over_budget ? "over_budget" : "other"]),
      [[4, "attached"], [5, "attached"], [6, "over_budget"]],
    );
    assert.match(out.content, /^Citation: Guide \(2026\), pp\. 4-6/);
    assert.match(out.content, /page 6: src\/page-006\.png \(not attached, over this result's image budget\)/);
  });
});

// A 1x1 PNG: enough to prove a real file is read, attached and typed.
const PIXEL = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

let root;
before(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), "base-editions-"));
  await writeFile(path.join(root, "base.config.json"), '{ "schema_version": "base.config.v1" }\n');
  await mkdir(path.join(root, "docs"), { recursive: true });
  await writeFile(
    path.join(root, "docs", "assess.md"),
    ["---", "schema_version: base.resource.v1", "id: guide-assess", "type: document", "description: Assessing ideas.", "lang: en", 'cite_as: "Guide (2026), p. 4"', "source:", "  pages: [4, 5]", "  page_images: originals/page-{page:03}.png", "---", "# Assess", "Intro.", ""].join("\n"),
  );
  await writeFile(
    path.join(root, "docs", "assess.de.md"),
    ["---", "schema_version: base.resource.v1", "id: guide-assess-de", "type: document", "description: Ideen bewerten.", "translation_of: guide-assess", "---", "# Bewerten", "Einleitung.", ""].join("\n"),
  );
  await writeFile(
    path.join(root, "docs", "dossier.md"),
    ["---", "schema_version: base.resource.v1", "id: dossier", "type: document", "description: Dossier.", "confidential: true", 'cite_as: "Dossier interne, p. 7"', "source:", "  pages: [4]", "  page_images: originals/page-{page:03}.png", "---", "# Dossier", "Texte.", ""].join("\n"),
  );
  await mkdir(path.join(root, "originals"), { recursive: true });
  await writeFile(path.join(root, "originals", "page-004.png"), Buffer.from(PIXEL, "base64"));
});
after(async () => rm(root, { recursive: true, force: true }));

describe("open: editions and original pages", () => {
  it("lang opens the edition in that language, from either side of the family", async () => {
    const de2 = await openResource(root, "guide-assess", { lang: "de" });
    assert.equal(de2.resource.id, "guide-assess-de");
    assert.deepEqual(de2.edition, { requested: "de", language: "de", fallback: false });
    const back = await openResource(root, "guide-assess-de", { lang: "en", section: "assess" });
    assert.equal(back.resource.id, "guide-assess");
    assert.equal(back.section.ref, "guide-assess#assess");
  });

  it("a language nobody wrote returns the canonical, flagged, with the languages that exist", async () => {
    const fr = await openResource(root, "guide-assess", { lang: "fr" });
    assert.equal(fr.resource.id, "guide-assess");
    assert.equal(fr.edition.fallback, true);
    assert.deepEqual(fr.edition.available, ["de", "en"]); // inventory order, which is path order

    assert.match(fr.edition.note, /No fr edition of guide-assess/);
  });

  it("the source projection returns the record, the citation, and the pages that exist as images", async () => {
    const src = await openResource(root, "guide-assess", { projection: "source" });
    assert.deepEqual(src.source, { pages: [4, 5], page_images: "originals/page-{page:03}.png" });
    assert.equal(src.images.length, 2);
    assert.equal(src.images[0].page, 4);
    assert.equal(src.images[0].mime, "image/png");
    assert.ok(src.images[0].data.startsWith("iVBOR"));
    assert.equal(src.images[1].missing, true);
    assert.match(src.content, /Citation: Guide \(2026\), p\. 4/);
    assert.match(src.content, /page 5: originals\/page-005\.png \(not present/);
  });

  it("a withheld resource carries no source record and no page: a scan is the document itself", async () => {
    // The pages are not read at all under egress, the projection living on the branch where the
    // resource may travel. What is observable, and asserted here, is that nothing of the original
    // leaves: no record, no path, no bytes, and no edition report.
    const egress = { modelLocality: /** @type {const} */ ("remote") };
    const held = await openResource(root, "dossier", { projection: "source", lang: "de", egress });
    assert.equal(held.withheld, true);
    assert.equal(held.source, undefined);
    assert.equal(held.images, undefined);
    assert.equal(held.edition, undefined);
    assert.ok(!JSON.stringify(held).includes("originals/"));
    assert.ok(!JSON.stringify(held).includes(PIXEL.slice(0, 20)));
    // Locally the same call answers in full, so the two results differ by egress alone.
    const open = await openResource(root, "dossier", { projection: "source" });
    assert.equal(open.images[0].mime, "image/png");
    assert.match(open.content, /Citation: Dossier interne, p\. 7/);
  });
});
