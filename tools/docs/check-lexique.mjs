#!/usr/bin/env node
// check-lexique.mjs — keep settled vocabulary decisions from regressing in authoritative French.
//
// Some wording choices are deliberate and load-bearing, and a passing editorial sweep can quietly
// undo them. This gate makes those decisions stick over authoritative French documentation and
// operational prose: the French root documents, docs/**, exemples/** and French agents. English,
// non-French nested roots and generated routing indexes are out of scope. A genuine exception
// declares `[LEXIQUE-OK: reason]` on the line (counted, so it cannot quietly spread). Fenced code is
// ignored.
//
//   node tools/docs/check-lexique.mjs        # exit 1 on any banned phrasing, 0 when clean
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { frenchMarkdownUnder } from "./check-punctuation.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const FRENCH_ROOT_FILES = ["README.fr.md", "CONTRIBUTING.md", "MANIFESTO.md", "CHANGELOG.md"];
const FRENCH_DIRS = ["docs", "exemples", ".ai/agents"];

// Each rule: a pattern that must not appear in French prose, and the reason it was banned.
const BANNED = [
  { re: /junior brillant/i, why: "le modèle n'est pas un «junior brillant»: l'image juste est un collègue venu d'ailleurs, amnésique (représentation riche du monde, mais pas du vôtre), avec ses deux limites (mémoire non partagée par défaut, langage sous-spécifié)." },
  { re: /m[êe]me objet sous deux angles/i, why: "agent et assistant ne sont pas le même objet sous deux angles: l'agent est le fichier qu'on possède, l'assistant l'agent animé par un modèle." },
  { re: /probabiliste/i, why: "ne pas décrire le modèle comme «probabiliste»: dire qu'il suit des instructions (ce n'est pas du code), avec une marge d'erreur qui varie selon les domaines." },
  { re: /BASE sort cette méthode de l['’]outil/i, why: "BASE ne sort pas la méthode elle-même de l'outil: sa structure en conserve une description de référence." },
  { re: /mais surtout quelque chose qui lui survit:\s*\**la méthode elle-même/i, why: "la structure BASE qui survit à l'outil décrit la méthode; elle n'est pas la méthode elle-même." },
  { re: /Il conserve la méthode que cet outil applique/i, why: "BASE conserve une description de référence; l'exécution dépend du modèle, de l'outil et de l'intégration." },
  { re: /Ce qui reste commun est la méthode de référence/i, why: "ce qui reste commun est la description approuvée et versionnée de la méthode, pas la méthode ni son exécution." },
];

/**
 * Lines that hit a banned phrase, ignoring fenced code and `[LEXIQUE-OK: reason]` lines.
 * @param {string} text @returns {{ line: number, text: string, why: string }[]}
 */
export function bannedLines(text) {
  const hits = [];
  let fenced = false;
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    if (line.includes("[LEXIQUE-OK:")) continue;
    for (const { re, why } of BANNED) {
      if (re.test(line)) hits.push({ line: i + 1, text: line.trim(), why });
    }
  }
  return hits;
}

export async function frenchFiles() {
  /** @type {{ dir: string, language: string }[]} */
  const skipped = [];
  const fromDirs = (await Promise.all(FRENCH_DIRS.map((dir) => frenchMarkdownUnder(path.join(ROOT, dir), dir, skipped)))).flat();
  return { files: [...FRENCH_ROOT_FILES, ...fromDirs].sort(), skipped };
}

async function main() {
  const { files, skipped } = await frenchFiles();
  const failures = [];
  let exempt = 0;
  for (const rel of files) {
    const text = await fs.readFile(path.join(ROOT, rel), "utf8").catch(() => "");
    exempt += (text.match(/\[LEXIQUE-OK:/g) ?? []).length;
    for (const hit of bannedLines(text)) failures.push(`${rel}:${hit.line}: ${hit.why} ("${hit.text}").`);
  }
  if (exempt) console.log(`check-lexique: ${exempt} reviewed [LEXIQUE-OK] exception(s) (watched).`);
  if (failures.length) {
    console.error("check-lexique: FAIL — revoir le vocabulaire (décisions terminologiques verrouillées):");
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  for (const { dir, language } of skipped.sort((a, b) => a.dir.localeCompare(b.dir))) {
    console.log(`check-lexique: ${dir}/ skipped — its base.config.json declares language "${language}", so the French lexicon does not apply.`);
  }
  console.log(`check-lexique: pass — ${files.length} French files free of banned phrasing.`);
}

if (process.argv[1] && process.argv[1].endsWith("check-lexique.mjs")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  });
}
