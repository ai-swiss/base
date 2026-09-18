// The French-typography gate (tools/docs/check-punctuation.mjs) must catch the real violations and
// stay quiet on code, so it can lock the convention across docs and examples without false positives.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { declaredLanguage, frenchMarkdownUnder, punctuationLines } from "../tools/docs/check-punctuation.mjs";

describe("check-punctuation: the typography gate", () => {
  it("flags a French space before : ; ! ? in prose", () => {
    assert.equal(punctuationLines("Une règle : tenue.", false).length, 1);
    assert.equal(punctuationLines("Vraiment ?", false)[0].rule, "space before : ; ! ?");
  });

  it("flags spaced guillemets, accepts tight ones", () => {
    assert.equal(punctuationLines("dites « bonjour ».", false).length, 1);
    assert.equal(punctuationLines("dites «bonjour».", false).length, 0);
  });

  it("does NOT flag a colon that hugs an inline code span (tight, correct)", () => {
    assert.equal(punctuationLines("Lis `skills/x/SKILL.md`: le process.", false).length, 0);
    assert.equal(punctuationLines("par exemple `BASE root: .` ici.", false).length, 0);
  });

  it("ignores fenced code, YAML frontmatter and table-separator rows", () => {
    assert.equal(punctuationLines("```\ncode : not prose\n```", false).length, 0);
    assert.equal(punctuationLines("---\ntitle: x : y\n---\nProse propre.", false).length, 0);
    assert.equal(punctuationLines("| a | b |\n| :--- | ---: |", false).length, 0);
  });

  it("flags the em-dash only when asked (examples), not otherwise", () => {
    assert.equal(punctuationLines("# Titre — sous-titre", true).length, 1);
    assert.equal(punctuationLines("# Titre — sous-titre", false).length, 0);
  });

  it("honors an explicit [PUNCT-OK:] exception on the line", () => {
    assert.equal(punctuationLines("Un cas limite : justifié. [PUNCT-OK: citation]", false).length, 0);
  });
});

describe("check-punctuation: which roots count as French", () => {
  it("reads the declared language, normalises the region, and falls back to French", () => {
    assert.equal(declaredLanguage(null), "fr", "no config at all is a French root");
    assert.equal(declaredLanguage("{}"), "fr", "a config that says nothing is French");
    assert.equal(declaredLanguage('{"language":"de-CH"}'), "de", "a region is dropped, as in core/lang");
    assert.equal(declaredLanguage('{"language":"EN"}'), "en");
    assert.equal(declaredLanguage("{ not json"), "fr", "a malformed config must not break the gate");
  });

  it("skips a nested root whose base.config.json declares another language, and keeps French ones", async () => {
    const base = await mkdtemp(path.join(tmpdir(), "punct-lang-"));
    try {
      for (const [name, config] of [["de-root", '{"language":"de-CH"}'], ["fr-root", '{"language":"fr"}'], ["mute-root", "{}"]]) {
        await mkdir(path.join(base, name), { recursive: true });
        await writeFile(path.join(base, name, "base.config.json"), config, "utf8");
        await writeFile(path.join(base, name, "page.md"), "Eine Regel : gehalten.\n", "utf8");
      }
      const skipped = [];
      const files = await frenchMarkdownUnder(base, "exemples", skipped);
      assert.deepEqual(files.sort(), ["exemples/fr-root/page.md", "exemples/mute-root/page.md"]);
      assert.deepEqual(skipped, [{ dir: "exemples/de-root", language: "de" }], "the German root is named, not silently dropped");
    } finally {
      await rm(base, { recursive: true, force: true });
    }
  });
});
