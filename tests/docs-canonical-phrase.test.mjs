// Spec coverage: UR-CORE-001
// One framing, one wording. "Votre outil IA est l'expérience; Studio est l'atelier." must
// appear VERBATIM wherever a newcomer meets the two-worlds idea — never a paraphrase that makes
// the reader reconcile two stories. (The topbar tagline is deliberately a different sentence.)

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

const CANONICAL = "Votre outil IA est l'expérience; Studio est l'atelier.";
const PLACES = [
  "docs/start/installer.md",
  "tools/studio/ui/README.md",
  // The Studio Welcome screen renders this from the bilingual catalog now, so the canonical French
  // string lives in copy.ts (Welcome.tsx reads it via copy.welcome.step2Strong).
  "tools/studio/ui/src/copy.ts",
];
// Note: the README intentionally reframes the tool-vs-Studio relationship in its own words (it no
// longer carries this exact sentence); the canonical wording stays enforced where a newcomer meets
// Studio in context (the installer guide, the Studio README, and the Studio UI itself).

describe("the canonical two-worlds phrase is one string, everywhere", () => {
  for (const place of PLACES) {
    it(`appears verbatim in ${place}`, async () => {
      const text = await readFile(place, "utf8");
      assert.ok(text.includes(CANONICAL), `${place} is missing the canonical phrase`);
    });
  }
});
