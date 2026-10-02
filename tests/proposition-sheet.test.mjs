// The proposition sheet ("what AI can do for you") is the one document a team that knows nothing
// about AI reads before anything is written in its folder. These guards keep it openable offline,
// typographically clean in French, and its export stable for the process that reads it back.

import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import vm from "node:vm";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const sheetPath = path.join(repoRoot, ".ai", "agents", "concierge-base", "templates", "proposition.html");

const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, "");
const stripTags = (html) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

/** A DOM small enough to run the sheet's script and read its Markdown export. */
function fakeDocument(title) {
  const elements = new Map();
  const element = () => ({
    textContent: "", hidden: false, style: {}, onclick: null, dataset: {},
    _html: "",
    get innerHTML() { return this._html; },
    set innerHTML(v) { this._html = String(v); this.textContent = stripTags(this._html); },
    classList: { add() {}, remove() {}, toggle() {} },
    querySelectorAll: () => [],
  });
  return {
    title,
    getElementById: (id) => { if (!elements.has(id)) elements.set(id, element()); return elements.get(id); },
    createElement: () => element(),
    addEventListener: () => {},
    _elements: elements,
  };
}

function runSheet(html, overrides) {
  let script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  for (const [name, value] of Object.entries(overrides)) {
    const re = new RegExp(`const ${name} = (\\[[\\s\\S]*?\\]|\\{[\\s\\S]*?\\}|"[^"]*");`);
    assert.match(script, re, `the sheet declares ${name}`);
    script = script.replace(re, `const ${name} = ${JSON.stringify(value)};`);
  }
  const document = fakeDocument("Proposition");
  const context = { document, localStorage: { getItem: () => null, setItem: () => {} }, Blob: class {}, URL: { createObjectURL: () => "" } };
  vm.createContext(context);
  vm.runInContext(script + "\nglobalThis.__md = md; globalThis.__render = render;", context);
  return { document, md: context.__md, render: context.__render };
}

describe("proposition sheet", () => {
  it("opens offline and keeps French typography", async () => {
    const html = await fs.readFile(sheetPath, "utf8");
    assert.equal(html.includes("—"), false, "no em dash anywhere in the sheet");
    assert.equal(html.includes("–"), false, "no en dash anywhere in the sheet");
    const body = stripComments(html);
    assert.doesNotMatch(body, /https?:\/\//, "no external resource outside the header comment");
    assert.doesNotMatch(body, /@import|fonts\.googleapis|<link /, "no web font, no stylesheet link");
    for (const label of ["Recommandation", "Réponse", "Nuance", "Ma recommandation"]) {
      assert.equal(body.includes(`${label} :`), false, `"${label}" is followed by a colon without a space`);
    }
    assert.match(html, /Plain words only/, "the writing rules for a reader who knows nothing about AI stay in the header");
    assert.match(html, /At most 12 cards/, "the twelve-card ceiling stays in the header");
  });

  it("renders every section and exports a stable Markdown", async () => {
    const html = await fs.readFile(sheetPath, "utf8");
    const { document, md, render } = runSheet(html, {
      SHEET_TITLE: "Ce que l'IA peut faire pour vous",
      SHEET_INTRO: "J'ai lu votre entretien.",
      SHEET_EYEBROW: "Essai",
      STARTING_POINT: "des besoins décrits",
      SUMMARY: [{ titre: "Votre quotidien", items: ["40 appels par jour."] }],
      GROUPS: { "Ce que l'assistant fera pour vous": "Il prépare, une personne décide." },
      POINTS: [
        { id: "1", group: "Ce que l'assistant fera pour vous", title: "Préparer les rappels de rendez-vous", what: "Il reprend l'agenda.", reco: "Oui. L'accueil relit.", recoSummary: "Oui. L'accueil relit.", verdict: "oui" },
        { id: "4", group: "Ce que l'assistant fera pour vous", title: "Passer les commandes de matériel", what: "Le fournisseur attend.", reco: "Plus tard. Quand la liste des fournisseurs sera à jour.", verdict: "plus-tard" },
        { id: "5", group: "Ce que l'assistant fera pour vous", title: "Modifier un paiement", what: "Un e-mail demande un changement.", reco: "<b>Non.</b> Un appel au numéro connu reste humain." },
        { id: "2", group: "Deux choix pour démarrer", title: "Comment organiser l'assistant ?", what: "Trois façons.", reco: "A.", recoSummary: "A", recoChoice: "A",
          options: [{ v: "A", titre: "Par moment", sous: "Un seul assistant", puces: ["Rappel", "Commande"] }, { v: "B", titre: "Par personne", puces: ["L'accueil"] }] },
        { id: "3", group: "Deux choix pour démarrer", title: "Une réponse automatique", what: "Le soir.", reco: "Oui.", beyond: true },
      ],
      MORE_IDEAS: ["Le rapport du mois: regroupé avec le point de la semaine."],
      STRUCTURE: ["Trois modes d'emploi."],
      NEVER: ["Envoyer un message à votre place."],
      LIMITS: ["Le message du samedi: personne ne lit la boîte le week-end."],
    });
    render();
    assert.equal(document.title, "Ce que l'IA peut faire pour vous", "the title constant names the page");
    assert.equal(document.getElementById("titre").textContent, "Ce que l'IA peut faire pour vous");
    assert.equal(document.getElementById("intro").textContent, "J'ai lu votre entretien.");
    const content = document.getElementById("content").innerHTML;
    assert.doesNotMatch(content + document.getElementById("intro").textContent, /SHEET_/, "no placeholder survives rendering");
    for (const heading of ["Ce que j'ai compris", "Ce que l'assistant fera pour vous", "Deux choix pour démarrer", "Comment ce sera rangé", "Ce que l'assistant ne fera jamais", "Ce que l'IA ne réglera pas"]) {
      assert.match(content, new RegExp(`<h2>${heading}</h2>`), `section "${heading}" is rendered`);
    }
    assert.match(content, /Une idée de plus/, "a card beyond the request carries its tag");
    assert.match(content, /<h2>D'autres idées<\/h2>[\s\S]*Le rapport du mois/, "ideas merged or set aside stay visible, without buttons");
    assert.match(content, /class="reco-badge"/, "the recommended option is marked");
    assert.equal((content.match(/class="reponses"/g) || []).length, 4, "four cards ask Oui / Plus tard / Non, the extra ideas none");
    assert.equal(document.getElementById("avancement").textContent, "0 sur 5");
    assert.match(content, /data-v="plus-tard" class=" conseil" title="Ma recommandation"/, "the recommended answer is marked on its button");

    const out = md();
    assert.match(out, /^# Ce que l'IA peut faire pour vous: mes réponses\n/, "the export title has no space before the colon");
    assert.match(out, /^> Pour l'assistant qui lira ce fichier: /m, "the export speaks to whichever assistant reads it");
    assert.match(out, /reprends à l'étape 6 de `adopter-ce-dossier`/, "a fresh session knows which process reads the export");
    assert.match(out, /^Point de départ: des besoins décrits$/m, "the export says where the person started, so step 6 hands over to the right process");
    assert.doesNotMatch(document.getElementById("content").innerHTML, /des besoins décrits/, "the starting point stays out of the page");
    assert.match(out, /^## Ce que l'assistant fera pour vous$/m);
    assert.match(out, /^### 1 · Préparer les rappels de rendez-vous\n- Recommandation: Oui\. L'accueil relit\.\n- Réponse: non répondu \(la recommandation s'applique: Oui\)\n- Nuance: aucune$/m, "an unanswered card names the recommendation that applies");
    assert.match(out, /^### 4 · Passer les commandes de matériel\n- Recommandation: [^\n]*\n- Réponse: non répondu \(la recommandation s'applique: Plus tard\)$/m);
    assert.match(out, /^### 2 · Comment organiser l'assistant \?\n- Recommandation: A\n- Réponse: non répondu \(la recommandation s'applique: A · Par moment\)/m);
    assert.match(out, /^## Ce que l'assistant ne fera jamais\n\n- Envoyer un message à votre place\.$/m, "the red lines travel with the answers, for a session that never saw the sheet");
    assert.equal(out.includes("—"), false);

    // «Tout accepter» applies each recommendation, never a blanket Oui: a card recommended «Plus
    // tard» or «Non» must not come back as an agreement to build it.
    document.getElementById("tout-reco").onclick();
    const accepted = md();
    assert.match(accepted, /^### 1 · Préparer les rappels de rendez-vous\n- Recommandation: [^\n]*\n- Réponse: Oui$/m);
    assert.match(accepted, /^### 4 · Passer les commandes de matériel\n- Recommandation: [^\n]*\n- Réponse: Plus tard$/m);
    assert.match(accepted, /^### 5 · Modifier un paiement\n- Recommandation: [^\n]*\n- Réponse: Non$/m, "a verdict is read from the recommendation when the card omits it");
    assert.match(accepted, /^### 2 · Comment organiser l'assistant \?\n- Recommandation: A\n- Réponse: A · Par moment$/m);
  });

  it("speaks the person's language: every fixed label follows LANG", async () => {
    const html = await fs.readFile(sheetPath, "utf8");
    const { document, md, render } = runSheet(html, {
      LANG: "en",
      SHEET_TITLE: "What an assistant could do for you",
      SUMMARY: [{ titre: "Your day", items: ["180 requests a day."] }],
      POINTS: [
        { id: "1", group: "Dispatch", title: "Prepare call-backs", what: "It lists what is missing.", reco: "Yes. Tom calls back." },
        { id: "2", group: "Dispatch", title: "Flag address changes", what: "A message asks for a new address.", reco: "Later: once the customer list is clean." },
      ],
      NEVER: ["Confirm a pickup time."],
      LIMITS: ["The phone call at night."],
    });
    render();
    const content = document.getElementById("content").innerHTML;
    assert.match(content, /<h2>What I understood<\/h2>/);
    assert.match(content, /<h2>What the assistant will never do<\/h2>/);
    assert.match(content, /<b>My recommendation:<\/b>/);
    assert.match(content, />Later</, "the answers are labelled in English");
    assert.doesNotMatch(content, /Ce que|Ma recommandation|Plus tard|Ajouter une nuance/, "no French label leaks into an English sheet");
    assert.equal(document.getElementById("tout-reco").textContent, "Accept all");
    assert.equal(document.getElementById("exporter").textContent, "Send my answers");
    document.getElementById("tout-reco").onclick();
    const out = md();
    assert.match(out, /^# What an assistant could do for you: my answers\n/);
    assert.match(out, /^> For the assistant reading this file: /m);
    assert.doesNotMatch(out, /Starting point|Point de départ/, "no starting point line when the constant is empty");
    assert.match(out, /^### 1 · Prepare call-backs\n- Recommendation: Yes\. Tom calls back\.\n- Answer: Yes\n- Note: none$/m, "a verdict is read in English too");
    assert.match(out, /^### 2 · Flag address changes\n- Recommendation: [^\n]*\n- Answer: Later$/m);
  });
});
