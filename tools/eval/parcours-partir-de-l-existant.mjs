#!/usr/bin/env node
// tools/eval/parcours-partir-de-l-existant.mjs — the REAL-RUN check of the entry door «Partir de ce que
// vous avez» (process `adopter-ce-dossier`): each test corpus is copied to a throwaway folder next to a
// copy of this framework, the door's prompt is played in Claude Code (non-interactive), and the
// resulting proposition sheet is checked mechanically. It calls a model, costs money and minutes, and
// is NOT part of `npm test`: run it by hand before a release, read the sheets it keeps, then decide.
//
//   node tools/eval/parcours-partir-de-l-existant.mjs            # every corpus
//   node tools/eval/parcours-partir-de-l-existant.mjs --corpus besoins-cabinet --corpus vide
//   node tools/eval/parcours-partir-de-l-existant.mjs --corpora ~/mes-essais   # dossiers gardés hors du dépôt
//   node tools/eval/parcours-partir-de-l-existant.mjs --out .temp/parcours/mon-essai
//
// What it checks, per corpus (the form, never the business judgement — a human reads the sheets):
//   - the chat names the starting point it recognised;
//   - exactly one new file was written, under .temp/, suffixed _proposition.html; for «vide», no sheet
//     and nothing outside .temp/ (interview notes under .temp/ are tolerated);
//   - the visible text of the sheet carries none of the framework words `faisabilite-ia` lists
//     (process, compétence, skill, agent, prompt, routage, frontmatter, file names), no em dash, and no space before a colon in export labels;
//   - the four fixed sections render, every card sits under a group heading, two choice cards, at most 12 cards, at least one
//     «ne réglera pas» line, every «Plus tard» names a condition, the export opens with the starting point;
//   - duration, cost and turns are recorded.

import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const OWN_CORPORA = path.join(REPO, "tests", "fixtures", "partir-de-l-existant");
const PROMPT_DOSSIER = "Voici ce que nous avons: ce dossier. Avec le cadre BASE (dossier ../base), montre à notre équipe, qui ne connaît rien à l'IA, ce qu'un assistant pourra faire ou non pour elle, avant d'écrire quoi que ce soit: prépare la fiche de proposition, et rien d'autre.";
const PROMPT_VIDE = "Je voudrais un assistant mais je n'ai aucun document à montrer. Avec le cadre BASE (dossier ../base), par où commencer? N'écris rien dans mon dossier.";
const JARGON = /\b(process|compétences?|skills?|agents?|prompts?|routage|frontmatter)\b|\b[\w-]+\.(?:md|mjs|json|yaml)\b/i;
// The four fixed sections, read from the sheet's own label table so a sheet in any of its languages is checked.
const SECTIONS = ["compris", "range", "jamais", "limites"];
const STARTING_POINT = /discussion|entretien|compte rendu|besoins|procédures?|documents?|structure|CLAUDE\.md|règles|vide|aucun document|rien à (?:lire|montrer)/i;
// What a «Plus tard» needs: a stated condition or a named missing piece, in any of the usual turns.
const CONDITION = /\b(une fois|quand|dès que|après|lorsque|d'abord|avant|tant que|il faut|il manque|manquent|ne contient (?:pas|ni))\b/i;
const TIMEOUT_MS = 20 * 60 * 1000; // a run that exceeds twenty minutes is recorded as a failure, never waited for

/** @param {string[]} argv */
function parseArgs(argv) {
  /** @type {{ corpus: string[], out: string | null, corpora: string | null }} */
  const out = { corpus: [], out: null, corpora: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--corpus" && argv[i + 1]) out.corpus.push(argv[++i]);
    else if (argv[i] === "--out" && argv[i + 1]) out.out = argv[++i];
    else if (argv[i] === "--corpora" && argv[i + 1]) out.corpora = argv[++i];
  }
  return out;
}

/** @param {string} dir @returns {string[]} every file path under dir, relative, sorted */
function listFiles(dir) {
  /** @type {string[]} */
  const files = [];
  const walk = (/** @type {string} */ d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) { if (entry.name !== ".claude") walk(full); }
      else files.push(path.relative(dir, full));
    }
  };
  walk(dir);
  return files.sort();
}

const stripTags = (/** @type {string} */ html) => html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

/** A DOM small enough to run the sheet's script and read what it renders. @param {string} title */
function fakeDocument(title) {
  const elements = new Map();
  const element = () => ({
    textContent: "", hidden: false, style: {}, onclick: null, dataset: {}, _html: "",
    get innerHTML() { return this._html; },
    set innerHTML(v) { this._html = String(v); this.textContent = stripTags(this._html); },
    classList: { add() {}, remove() {}, toggle() {} },
    querySelectorAll: () => [],
  });
  return {
    title,
    getElementById: (/** @type {string} */ id) => { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); },
    createElement: () => element(),
    addEventListener: () => {},
  };
}

/** Render the sheet off-screen and return what a reader would see plus the raw constants. @param {string} html */
function inspectSheet(html) {
  const body = html.replace(/<!--[\s\S]*?-->/g, "");
  const script = (body.match(/<script>([\s\S]*?)<\/script>/) || ["", ""])[1];
  const document = fakeDocument((body.match(/<title>([\s\S]*?)<\/title>/) || ["", ""])[1].trim());
  const context = { document, localStorage: { getItem: () => null, setItem: () => {} }, Blob: class {}, URL: { createObjectURL: () => "" } };
  vm.createContext(context);
  vm.runInContext(script + "\nglobalThis.__out = { md: md(), POINTS, LIMITS, NEVER, STRUCTURE, SUMMARY, L: typeof L !== \"undefined\" ? L : null };", context);
  const rendered = document.getElementById("content").innerHTML;
  const title = document.title;
  const intro = document.getElementById("intro").textContent;
  return { title, intro, visible: `${title}\n${intro}\n${stripTags(rendered)}`, rendered, ...context.__out };
}

/** @param {string} corpus @param {string} outDir */
function runCorpus(corpus, outDir) {
  const src = path.join(CORPUS_DIR, corpus);
  const work = mkdtempSync(path.join(tmpdir(), `base-porte-${corpus}-`));
  const dossier = path.join(work, "Exemple");
  mkdirSync(dossier, { recursive: true });
  cpSync(src, dossier, { recursive: true });
  // A copy, never a link: the run may write wherever it believes BASE lives, and it must not reach
  // this repository.
  const skip = new Set(["node_modules", ".git", ".temp", ".claude", "coverage", "experiments"]);
  cpSync(REPO, path.join(work, "base"), { recursive: true, filter: (from) => !skip.has(path.basename(from)) });
  const before = listFiles(dossier);
  const prompt = corpus === "vide" ? PROMPT_VIDE : PROMPT_DOSSIER;
  const started = Date.now();
  // `--add-dir` opens the BASE copy to the session, as a person does when pointing their tool at BASE.
  const run = spawnSync("claude", ["-p", "--strict-mcp-config", "--permission-mode", "acceptEdits", "--add-dir", path.join(work, "base"), "--output-format", "json", prompt], { cwd: dossier, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: TIMEOUT_MS });
  const seconds = Math.round((Date.now() - started) / 1000);
  /** @type {any} */
  let json = null;
  try { json = JSON.parse(run.stdout); } catch { json = null; }
  const result = String(json?.result ?? run.stdout ?? "");
  const after = listFiles(dossier);
  const created = after.filter((f) => !before.includes(f));
  /** @type {{ name: string, ok: boolean, detail: string }[]} */
  const checks = [];
  const check = (/** @type {string} */ name, /** @type {boolean} */ ok, /** @type {string} */ detail = "") => checks.push({ name, ok, detail });

  check("Le parcours a abouti dans le temps imparti", !run.error, run.error ? String(run.error.message) : "");
  check("La réponse nomme le point de départ", STARTING_POINT.test(result), result.slice(0, 160).replace(/\s+/g, " "));
  const sheets = created.filter((f) => /^\.temp\/.+_proposition\.html$/.test(f));
  if (corpus === "vide") {
    check("Aucune fiche écrite pour un dossier vide", sheets.length === 0, created.join(", ") || "rien");
    check("Rien d'autre écrit hors .temp/", created.every((f) => f.startsWith(".temp/")), created.join(", ") || "rien");
  } else {
    check("Une seule fiche, sous .temp/, suffixée _proposition.html", sheets.length === 1 && created.length === 1, created.join(", ") || "rien");
    if (sheets.length === 1) {
      const html = readFileSync(path.join(dossier, sheets[0]), "utf8");
      writeFileSync(path.join(outDir, `${corpus}_proposition.html`), html);
      try {
        const sheet = inspectSheet(html);
        const jargon = sheet.visible.match(JARGON);
        check("Aucun mot du cadre dans le texte visible", !jargon, jargon ? `trouvé: «${jargon[0]}»` : "");
        check("Aucun espace réservé du modèle visible", !/SHEET_|YYYY-MM-DD/.test(sheet.visible) && sheet.title !== "Proposition" && sheet.intro.trim().length > 0, `titre: «${sheet.title}»`);
        check("Aucun tiret cadratin", !/[—–]/.test(sheet.visible), "");
        for (const s of SECTIONS) { const titre = sheet.L ? sheet.L[s] : s; check(`Section «${titre}»`, sheet.rendered.includes(`<h2>${titre}</h2>`), ""); }
        check("Des cartes Oui / Plus tard / Non, chacune sous un titre de groupe", /class="reponses"/.test(sheet.rendered) && sheet.POINTS.every((/** @type {any} */ p) => p.group), `${(sheet.rendered.match(/class="reponses"/g) || []).length} carte(s) à réponse`);
        check("Deux choix pour démarrer (cartes à options)", sheet.POINTS.filter((/** @type {any} */ p) => p.options).length >= 2, `${sheet.POINTS.filter((/** @type {any} */ p) => p.options).length} carte(s) à options`);
        check("Douze cartes au plus", sheet.POINTS.length <= 12, `${sheet.POINTS.length} cartes`);
        check("Au moins une ligne «ne réglera pas»", sheet.LIMITS.length >= 1, `${sheet.LIMITS.length} ligne(s)`);
        const plusTard = sheet.POINTS.filter((/** @type {any} */ p) => !p.options && (p.verdict === "plus-tard" || /^\s*plus tard\b/i.test(stripTags(String(p.reco || "")))));
        const sansVerdict = sheet.POINTS.filter((/** @type {any} */ p) => !p.options && !["oui", "plus-tard", "non"].includes(p.verdict));
        check("Chaque carte porte son verdict («Tout accepter» l'applique)", sansVerdict.length === 0, sansVerdict.map((/** @type {any} */ p) => p.id).join(", "));
        check("Chaque «Plus tard» dit ce qui manque", plusTard.every((/** @type {any} */ p) => CONDITION.test(stripTags(String(p.reco)))), `${plusTard.length} carte(s) «Plus tard»`);
        check("Export sans espace avant les deux-points", !/(Recommandation|Réponse|Nuance) :/.test(sheet.md), "");
        const depart = sheet.L ? sheet.L.export.depart : "Point de départ";
        check("L'export reprend le point de départ", new RegExp(`^${depart}: \\S`, "m").test(sheet.md), (sheet.md.match(new RegExp(`^${depart}: .*$`, "m")) || ["absent"])[0]);
        if (corpus === "structure-ia") {
          // The corpus CLAUDE.md carries two rules any model applies on its own (politeness, spelling):
          // the door must sort them out rather than carry them over.
          const said = `${sheet.visible}\n${result}`;
          check("Les évidences du CLAUDE.md sont triées, pas recopiées", /poli|orthographe/i.test(said) && /retir|recopi|de lui-même|déjà|inutile|écart/i.test(said), "");
        }
      } catch (error) {
        check("La fiche s'exécute hors écran", false, String(error && error.message || error));
      }
    }
  }
  const report = [
    `# ${corpus}`, "",
    `- Prompt: ${prompt}`,
    `- Durée: ${seconds} s · coût: ${json?.total_cost_usd != null ? Number(json.total_cost_usd).toFixed(2) + " USD" : "inconnu"} · tours: ${json?.num_turns ?? "?"}`,
    `- Fichiers créés: ${created.length ? created.join(", ") : "aucun"}`, "",
    "| Contrôle | Résultat | Détail |", "|---|---|---|",
    ...checks.map((c) => `| ${c.name} | ${c.ok ? "ok" : "ÉCHEC"} | ${c.detail.replace(/\|/g, "/")} |`), "",
    "## Réponse du chat", "", result.trim(), "",
  ].join("\n");
  writeFileSync(path.join(outDir, `${corpus}.md`), report);
  rmSync(work, { recursive: true, force: true });
  return { corpus, seconds, cost: json?.total_cost_usd ?? null, checks };
}

const args = parseArgs(process.argv.slice(2));
// Material that must not enter this repository (a real workshop, a client's documents) stays in its
// own folder: `--corpora` points at its parent, one sub-folder per corpus, the same layout as ours.
const CORPUS_DIR = args.corpora ? path.resolve(args.corpora) : OWN_CORPORA;
const corpora = readdirSync(CORPUS_DIR, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).filter((n) => !args.corpus.length || args.corpus.includes(n));
const stamp = new Date().toISOString().slice(0, 16).replace("T", "_").replace(":", "h");
const outDir = path.resolve(REPO, args.out ?? path.join(".temp", "parcours", stamp));
mkdirSync(outDir, { recursive: true });
if (spawnSync("claude", ["--version"], { encoding: "utf8" }).status !== 0) {
  console.error("Claude Code (`claude`) est introuvable: ce parcours le lance en mode non interactif.");
  process.exit(2);
}
console.log(`Parcours de la porte sur ${corpora.length} corpus · rapports dans ${path.relative(REPO, outDir)}/`);
const summary = [];
for (const corpus of corpora) {
  process.stdout.write(`- ${corpus} … `);
  const r = runCorpus(corpus, outDir);
  const failed = r.checks.filter((c) => !c.ok);
  console.log(`${r.seconds} s · ${failed.length ? `${failed.length} échec(s): ${failed.map((c) => c.name).join("; ")}` : "tous les contrôles passent"}`);
  summary.push(`| ${corpus} | ${r.seconds} s | ${r.cost != null ? Number(r.cost).toFixed(2) : "?"} | ${r.checks.length - failed.length}/${r.checks.length} |`);
}
writeFileSync(path.join(outDir, "rapport.md"), ["# Parcours de la porte «Partir de ce que vous avez»", "", `Date: ${new Date().toISOString()}`, "", "| Corpus | Durée | Coût (USD) | Contrôles |", "|---|---|---|---|", ...summary, "", "Les fiches obtenues sont à côté de ce rapport: la relecture humaine juge le fond, ces contrôles ne jugent que la forme.", ""].join("\n"));
console.log(`Rapport: ${path.relative(REPO, path.join(outDir, "rapport.md"))}`);
