// The French-typography gate (tools/docs/check-punctuation.mjs) must catch the real violations and
// stay quiet on code, so it can lock the convention across docs and examples without false positives.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { punctuationLines } from "../tools/docs/check-punctuation.mjs";

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
