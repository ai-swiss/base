// The README's keyboard section is hand-written prose — this test is what keeps it TRUE: every
// shortcut of the SHORTCUTS table must appear there, combo and wording. Add a shortcut without
// documenting it and this fails.

import { readFileSync } from "node:fs";
import { SHORTCUTS } from "./lib";

// vitest runs with the UI package as cwd (jsdom gives import.meta.url no file scheme).
const readme = readFileSync("README.md", "utf8");

describe("README ↔ SHORTCUTS (the doc never lies)", () => {
  for (const [name, shortcut] of Object.entries(SHORTCUTS)) {
    it(`documents ${name} (${shortcut.combo})`, () => {
      expect(readme).toContain(shortcut.combo);
      expect(readme).toContain(shortcut.does);
    });
  }
});
