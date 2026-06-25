// Spec coverage: UR-CORE-001
// The tutorial is a TAUGHT contract, not prose. Every module follows the gabarit (objective
// coupled to a check, a self-verification, the concept AFTER the gesture, a transfer prompt, a
// next step, common failures). Routing requests it scripts must be REAL fixtures of the
// Veytaux example (a tutorial that lies is worse than none); CLI commands are checked by the shared
// docs↔CLI module (docs-commands.test.mjs), which lists docs/tutoriel/** among its pages.

import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";

const DIR = "docs/tutoriel";

// One module = one page, except index.md (the parcours chooser) and harnais.md (step 0).
async function modulePages() {
  const names = (await readdir(DIR)).filter((n) => n.endsWith(".md") && n !== "index.md");
  return names.map((n) => path.join(DIR, n));
}

describe("tutorial: every module follows the gabarit", () => {
  const MARKERS = [
    /\*\*Vous allez\*\*/,
    /\*\*Il vous faut\*\*/,
    /✅ \*\*Vérifiez\*\*/,
    /💡 \*\*Pourquoi ça a marché\*\*/,
    /🔁 \*\*Chez vous\*\*/,
    /→ \*\*Et maintenant\*\*/,
    /🆘 \*\*Pannes courantes\*\*/,
  ];

  it("each module carries every gabarit block, and couples the objective to its check", async () => {
    const pages = await modulePages();
    assert.ok(pages.length >= 13, `expected the full set of modules, found ${pages.length}`);
    for (const page of pages) {
      if (page.endsWith("harnais.md")) continue; // step 0 is a connector, not a numbered module
      const md = await readFile(page, "utf8");
      for (const marker of MARKERS) {
        assert.match(md, marker, `${page} is missing a gabarit block: ${marker}`);
      }
      // The objective is observable, PROVEN by the check — not "comprendre X".
      assert.match(md, /\*\*Vous allez\*\*[^\n]*prouvé par/, `${page}: «Vous allez … prouvé par …»`);
      assert.match(md, /⏱/, `${page}: an estimated duration`);
      assert.match(md, /module \d+\/\d+/, `${page}: a progress marker (module n/N)`);
    }
  });

  it("the Découverte entry module states its tool prerequisite (the promise is honest)", async () => {
    const md = await readFile(path.join(DIR, "decouverte-1-faites-le-parler.md"), "utf8");
    assert.match(md, /outil IA/, "découverte-1 must name the tool prerequisite");
    assert.match(md, /install/i, "découverte-1 must point at installing/connecting a tool");
  });
});

describe("tutorial: scripted routing requests are real Veytaux fixtures", () => {
  it("every ```routage-fixture request appears in the Veytaux route-tests (```routage-defi is exempt)", async () => {
    const fixtures = JSON.parse(await readFile("exemples/veytaux-tourisme/.ai/routing/route-tests.json", "utf8"));
    const known = new Set(fixtures.map((f) => f.request.trim()));
    const pages = await modulePages();
    let checked = 0;
    for (const page of pages) {
      const md = await readFile(page, "utf8");
      for (const fence of md.matchAll(/```routage-fixture\n([\s\S]*?)```/g)) {
        for (const line of fence[1].split("\n").map((l) => l.trim()).filter(Boolean)) {
          checked += 1;
          assert.ok(known.has(line), `${page}: scripted request not in Veytaux fixtures: «${line}»`);
        }
      }
    }
    assert.ok(checked >= 1, "expected at least one verified routing-fixture request in the tutorial");
  });
});

// A duration is an estimate, but it must at least be self-consistent: the parcours total in
// index.md is the SUM of its module durations, nothing else. The previous claim ("mesurée, pas
// estimée") was contradicted by the arithmetic; this check makes the consistency a mechanism.
describe("tutorial: each parcours total equals the sum of its module durations", () => {
  it("the index parcours totals add up to their modules", async () => {
    const sums = { "Découverte": 0, "Praticien": 0, "Équipe": 0 };
    for (const page of await modulePages()) {
      if (page.endsWith("harnais.md")) continue; // step 0 belongs to no single parcours total
      const md = await readFile(page, "utf8");
      const duration = md.match(/⏱\s*~?(\d+)\s*min/);
      const parcours = md.match(/parcours (Découverte|Praticien|Équipe)/);
      if (!duration || !parcours) continue;
      sums[parcours[1]] += Number(duration[1]);
    }
    const index = await readFile(path.join(DIR, "index.md"), "utf8");
    const totals = {};
    for (const m of index.matchAll(/###\s*(Découverte|Praticien|Équipe):\s*(\d+)\s*min/g)) totals[m[1]] = Number(m[2]);
    for (const parcours of Object.keys(sums)) {
      assert.equal(
        totals[parcours],
        sums[parcours],
        `index.md states ${parcours} = ${totals[parcours]} min, but its modules sum to ${sums[parcours]} min`,
      );
    }
  });
});
