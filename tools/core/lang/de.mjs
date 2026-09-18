// The German table: every key of ./fr.mjs, translated. Same shape, same order, same placeholders —
// only the words change. Swiss Standard German (no ß, "ss" throughout), because BASE is read first
// in Zurich, Bern and Basel; the words stay plain and institutional, as in the French source.
//
// What does NOT move: every path, command, frontmatter key, resource id and `{placeholder}` is a
// machine identifier, carried across verbatim (`base build bootstrap --write`, `.ai/routing/index.md`,
// `importer-l-existant`, `framework_dir`). Translating one of them yields a file that reads well and
// does not work.
//
// Typography is German, not French: „Anführungszeichen“ in that shape, no space before punctuation,
// and the Gedankenstrich is the en dash. `tools/docs/check-emdash.mjs` audits French content only
// (README.fr.md, CONTRIBUTING.md, MANIFESTO.md, CHANGELOG.md, docs/**), so this file is out of its
// scope and answers to German conventions alone.
//
// The two card labels are load-bearing. `WHEN_TO_USE_HEADINGS` in ../routing.mjs recognises
// "wann verwenden" as a body heading, so `cardUseWhen` is exactly `**Wann verwenden**`: a process
// that states its trigger as a `## Wann verwenden` section then routes on the very words the index
// prints above it, and the router body can tell the reader to look for the same two words.
// `indexAgentWhenLabel` opens with them too, for the same reason. `cardAvoid` has no counterpart in
// that constant (nothing matches an avoid section), so it is simply the German pair of the label.
//
// The MCP_* constants in ../bootstrap.mjs stay where they are: they were already English, and they
// are not per-language text.

// fr-synced: 440b3065b0568a5f6d993e35781d0aca9fc2066e

export const DE = {
  // ── The canonical router body, shared by all four entry-point projections ──────────────────
  routerIntro:
    "Dieses Projekt ist ein BASE: Agenten und Prozesse als Text. Du hast **keine feste Identität**; du bist der Router.",

  routerBody: [
    "## Wann routen",
    "- Wenn eine **Aufgabe zu erledigen** ist, die einen bestimmten Prozess oder ein bestimmtes Können verlangt (kein blosses Gespräch).",
    "- Wenn der richtige Agent oder Prozess **nicht offensichtlich** ist.",
    "- Wenn **„R“** geschrieben wird (oder „R <Anfrage>“), um ein Routing zu erzwingen.",
    "",
    "Direkte Fälle (nicht routen): Wird ein Agent **namentlich genannt** („lade den Offert-Assistenten“), öffne direkt dessen `AGENT.md`. Das ist die einzige Datei, die zu laden ist. Und bleibe in dem Agenten, der bereits geladen ist: route nicht bei jeder Nachricht. Wenn du den Pfad des aktiven Prozesses nicht mehr nennen kannst (nach einer Zusammenfassung oder weit in einem langen Gespräch), öffne dessen `SKILL.md` und die `AGENT.md` auf der Festplatte erneut, bevor du handelst: die Datei ist massgebend, nicht dein Gedächtnis.",
    "",
    "## Wie du mit der Person sprichst",
    "Sprich über ihre Arbeit und Dokumente, nicht über die Mechanik von BASE. Beginne mit der nützlichen Antwort und ergänze nur Einzelheiten, die der Anfrage dienen. Beende eine erste Erklärung, sobald die Person entscheiden kann, ob sie BASE ausprobieren will; mache daraus kein Inventar und keine Prüfung. Nenne `process`, `competence`, `template`, `frontmatter`, `id`, `gate`, `diff` oder `resource` nur, wenn technische Einzelheiten gefragt sind. Stelle jeweils nur eine nützliche Frage.",
    "Verwende einfache Satzzeichen und keine Gedankenstriche.",
    "",
    "## BASE auf einen Ordner anwenden, der noch keiner ist",
    "Wenn die Nutzerin oder der Nutzer aus dem EIGENEN Ordner ein BASE machen will (Material ist vorhanden, Wissen und Können sollen mit KI strukturiert werden) und dieser Ordner weder `base.config.json` noch `.ai/agents/` hat: erstelle KEINE Datei von Hand. Starte zuerst `base init` (das erstellt den Launcher, die Konfiguration, die `CLAUDE.md` und einen Start-Agenten unter `.ai/agents/<name>/`). Route danach auf `importer-l-existant` (ausgehend von vorhandenem Material) oder `creer-agent` (bei null beginnend), zwei Prozesse des BASE-Rahmens und nicht des Ordners der Nutzerin oder des Nutzers: der Launcher erreicht sie über `framework_dir` in `base.config.json`. Jede Schreiboperation wird als Diff vorgeschlagen, nie von sich aus committet. Wenn du dich im Repository des BASE-Rahmens selbst befindest, schreibe hier nichts: initialisiere stattdessen den Ordner der Nutzerin oder des Nutzers.",
    "",
    "## Wie routen",
    "Deine Karte ist der generierte Index. Lies `.ai/routing/index.md`: dort stehen die Agenten, und der Index jedes Agenten (`.ai/agents/<agent>/index.md`, von der Wurzel aus verlinkt) führt dessen Prozesse mit „Wann verwenden“ und „Vermeiden, wenn“ auf. Steige ab von der Wurzel über den Agenten-Index zum Prozess, und behalte den Prozess, dessen „Wann verwenden“ die Anfrage abdeckt, unter Beachtung von „Vermeiden, wenn“. Du routest, indem du die Karte liest.",
    "Bei jeder Anfrage, die geroutet werden muss, liest du zuerst `.ai/routing/index.md`. Wähle nie anhand einer Dateiliste oder eines Dateinamens, und öffne weder `AGENT.md` noch `SKILL.md`, bevor die Karte den Kandidaten bestimmt hat.",
    "Beantworte eine routbare Anfrage nicht aus allgemeinem Wissen, auch wenn die nächste Frage offensichtlich scheint: die gewählte Karte ist massgebend. Bleiben nach dem Lesen der Karten mehrere Kandidaten plausibel, stelle zuerst die Frage, die sie unterscheidet, bevor du ihre Volltexte öffnest.",
    "",
    "Um zwischen zwei Kandidaten zu entscheiden, lies nie alle Volltexte (`AGENT.md`/`SKILL.md`): höchstens ihre Metadaten, also ihren Frontmatter-Block. Wenn der Index noch nicht existiert, sind diese Metadaten die Karte.",
    "",
    "Wenn kein Prozess die Anfrage abdeckt, rate nicht. Oft geht es um eine Wissensfrage und nicht um eine Aufgabe: ordne dann die Quellen ein (MCP-Werkzeug `discover_resources` oder `node .ai/base.mjs discover \"<die Frage>\" --root .` von einem Terminal aus), die Pfade und Metadaten zurückgeben, nie Volltexte. Stelle sonst die Frage, die eine Entscheidung erlauben würde, oder öffne den Empfangsprozess, den der Index am Fuss der Seite nennt.",
    "",
    "Wenn dein Werkzeug das MCP-Werkzeug `route_request` bereitstellt, ist dessen `routing_map` dieselbe Karte, und sein deterministisches Ergebnis begleitet deine Lektüre als Hinweis, der zu prüfen ist. Dieses Ergebnis vergleicht Wörter: es dient Aufrufen ohne Modell (Skript, Integration, `base route-test`) und entscheidet nicht an deiner Stelle. Nennt es einen anderen Prozess als deinen, lies „Wann verwenden“ und „Vermeiden, wenn“ erneut; bleibt der Zweifel, frage nach.",
    "",
    "Sobald der Prozess feststeht, lade vorab, was der Prozess deklariert (`requires`, `may_use`): Pfade und Notizen, nie Volltexte. Das MCP-Werkzeug `get_context_pack` oder `node .ai/base.mjs context \"<prozess>\" --root .` stellt diesen Plan auf, wenn es verfügbar ist; öffne danach nur, was dient.",
    "",
    "Eine TATSACHE zu erreichen ist ein anderer Griff als ein Prozess zu erreichen. Die Überschriften eines Dokuments sind Adressen: `id#anchor` benennt eine Passage, und `node .ai/base.mjs open \"<id>#<anchor>\" --root .` öffnet nur diese Passage. Eine Sachfrage wird auf Abschnittsebene gesucht (`node .ai/base.mjs discover \"<die Frage>\" --grain section --root .`), was Passagen ordnet und ihre Referenzen zurückgibt. Öffnen Sie die ein oder zwei Passagen, die antworten, statt des ganzen Dokuments, und zitieren Sie nur Text, den Sie geöffnet haben, als `id#anchor`.",
    "",
    "Bleibe ehrlich über die Grenze. Wenn nichts die Anfrage abdeckt, sage es und schlage die Frage vor, die eine Entscheidung erlauben würde; öffne nicht die Volltexte konkurrierender Prozesse, um allein zu entscheiden. Route zuerst, lade danach; kein Agent ist der Standard-Agent. Dieselbe Ehrlichkeit gilt für die Anfrage: Setzt eine Anweisung eine Tatsache voraus, der eine Karte dieses Ordners widerspricht, nenne die Karte einmal, mit der Stelle, und tue dann das Verlangte, wenn die Person es bestätigt.",
  ],

  // ── Entry points: CLAUDE.md, BASE_BOOTSTRAP.md, .cursor/rules/assistant.mdc, AGENTS.md ──────
  // The banner keeps the machine token `BASE:generated` first: that token is what the build, the
  // doctor and discovery read to tell a generated projection from a hand-owned file. The sentence
  // beside it is for a human, and is the only part that translates.
  provenanceBanner:
    "<!-- BASE:generated · Generiert von `base build bootstrap --write`. Nicht von Hand bearbeiten: der kanonische Volltext liegt in `tools/core/bootstrap.mjs`. -->",

  // The German expansion of the acronym: Bauen, Assistenten, Strukturierter, Expertise.
  claudeTitle: "# BASE: Bauen von Assistenten mit strukturierter Expertise",
  claudeLead: "Diese Datei ist der **Einstiegspunkt für Claude Code**.",

  bootstrapTitle: "# BASE: generischer Bootstrap",
  bootstrapLead: "Generischer Einstiegspunkt für ein KI-Harness.",

  // Only the description is prose; `description:` and `alwaysApply:` are keys Cursor parses.
  cursorRuleDescription: "BASE: Router für Agenten und Prozesse in Ihrem Fachgebiet",

  agentsTitle: "# Agenten",
  agentsCatalogueTitle: "## Katalog der Agenten",
  agentsEmpty: "_Kein Agent in `.ai/agents/`._",

  // ── The honest enforcement matrix: .ai/tools.md ─────────────────────────────────────────────
  toolMatrixTitle: "# BASE-Werkzeugmatrix",
  toolMatrixBanner:
    "<!-- BASE:generated · Generiert von `base build`. Ehrliche Angabe der Garantien, die erreichbar sind, wenn die Aktion wirklich über BASE läuft. -->",
  toolMatrixLevels: "Stufen: 0 nicht unterstützt · 1 beratend (Anleitung/Audit) · 2 teilweise Vermittlung · 3 strikt (vermittelt).",
  toolMatrixHonesty: [
    "Ehrlichkeitsregel: diese Matrix nennt die höchste erreichbare Stufe pro Garantie, wenn",
    "die Aktion wirklich über BASE läuft (CLI, Broker, MCP oder konfigurierter Connector). Eine Aktion,",
    "die BASE umgeht, bleibt auf der nativen Stufe des Harness.",
  ],
  // Header, separator and rows travel together: a translated guarantee name changes the column.
  toolMatrixTable: [
    "| Garantie | claude-code | cursor | chatgpt (mcp) | generisch |",
    "| --- | --- | --- | --- | --- |",
    "| Pfadbegrenzung (vermittelter Zugriff) | 3 | 3 | 3 | 1 |",
    "| Bestätigung vor dem Schreiben (propose/commit) | 3¹ | 2 | 3¹ | 1 |",
    "| Werkzeugausführung (dry-run + confirm) | 3¹ | 2 | 3¹ | 1 |",
    "| Native Skill-Erkennung | 3 | 2 | 1 | 1 |",
    "| Hooks / mechanische Leitplanken | 3² | 2² | 0 | 0 |",
  ],
  toolMatrixFootnotes: [
    "¹ Stufe 3 nur für Aktionen, die über den BASE-Broker geroutet werden (`propose`/`commit`, `invoke`).",
    "Ein Schreiben oder Ausführen, das den Broker umgeht, bleibt beratend.",
    "² Stufe nur erreichbar, wenn das Harness so konfiguriert ist, dass es die betroffenen Aktionen",
    "an den Broker oder an einen Hook routet. BASE liefert diese Hooks nicht für jedes Harness.",
  ],

  // ── The routing index tree: .ai/routing/index.md and .ai/agents/<id>/index.md ────────────────
  routingIndexBanner:
    "<!-- BASE:generated · Generiert von `base build routing-index`. Nicht bearbeiten: wird aus den AGENT.md/SKILL.md neu erzeugt. -->",

  indexRootTitle: "# Routing-Index – verfügbare Agenten",
  indexRootInstruction:
    "Wählen Sie den Agenten, dessen „Wann verwenden“ die Anfrage abdeckt, und öffnen Sie dann seinen Index. Im Zweifel nicht raten: fragen Sie nach.",
  indexAgentsHeading: "## Agenten",

  indexAgentTitle: (title) => `# ${title} – verfügbare Prozesse`,
  indexAgentWhenLabel: "**Wann verwenden Sie diesen Agenten**",
  indexAgentInstruction: "Wählen Sie den Prozess, dessen „Wann verwenden“ die Anfrage abdeckt. Beachten Sie „Vermeiden, wenn“.",
  indexProcessesHeading: "## Prozesse",

  // The two labels of every card, in the index AND in the router body above. Same words on purpose:
  // the body tells the reader to look for „Wann verwenden“, so the index must spell it the same —
  // and "wann verwenden" is what routing.mjs recognises as a body heading (see the note at the top).
  cardUseWhen: "**Wann verwenden**",
  cardAvoid: "**Vermeiden, wenn**",

  // The anti-dead-end door at the foot of the root index. `target` is the ready-made Markdown link.
  indexFallbackTitle: "## Wenn nichts die Anfrage abdeckt",
  indexFallbackSentence: (target) => `Öffnen Sie ${target}. Dieser Prozess nimmt die Anfrage auf und leitet weiter; so bleibt sie verfolgt.`,

  // ── The scaffold `base init` writes into a fresh folder ──────────────────────────────────────
  scaffoldGitignore: `# Lokale BASE-Daten: Traces, ausstehende Änderungen, Feedback, Maschineneinstellungen. Nie committet.
.ai/trace/
.ai/changes/
.ai/feedback/
.ai/studio.settings.json

# Build-Produkt: wird von \`base index\` neu erzeugt. Es zu versionieren liesse jede Maschine
# an einer Datei auseinanderlaufen, die niemand von Hand liest.
base.manifest.json
`,

  // The CC BY credit LICENSING.md asks for. `upgrade` and `doctor` look for the a-i.swiss URL, not
  // for the sentence, so a translation keeps the credit detectable as long as the URL survives.
  attributionLine:
    "Gebaut mit BASE, Bauen von Assistenten mit strukturierter Expertise, von AI Swiss, https://a-i.swiss (Methodeninhalte unter der Lizenz CC BY 4.0).",

  scaffoldReadmeBody: [
    "Dieser Ordner ist ein BASE: Agenten und Prozesse als Text, die ein KI-Werkzeug liest, um Sie",
    "bei Ihrer Arbeit zu unterstützen. Die Agenten liegen unter `.ai/agents/`; jeder sagt, wann er",
    "zu rufen ist und welche Prozesse er zu befolgen weiss.",
    "",
    "Öffnen Sie zum Anfangen diesen Ordner in Ihrem KI-Werkzeug und sagen Sie ihm, was Sie tun möchten.",
  ],

  scaffoldGitattributes: `# Normalisierte Zeilenenden: dieselbe Datei gelesen unter Windows, macOS und Linux.
* text=auto

# Skripte: LF zwingend (ein Shebang mit CRLF wird nicht ausgeführt).
*.sh text eol=lf
*.py text eol=lf
*.mjs text eol=lf
`,

  // The starter agent's card. `subject` is the humanised folder name, `about` the one sentence the
  // owner gave about their work — the two fields the router actually reads.
  scaffoldAgentDescription: (subject) => `Arbeitsassistent für ${subject} – im Lauf der Nutzung zu präzisieren.`,
  scaffoldAgentUseWhenAbout: (about) => `Wenn die Anfrage Folgendes betrifft: ${about}`,
  scaffoldAgentUseWhenGeneric: (subject) => `Wenn die Arbeit ${subject} betrifft.`,

  scaffoldAgentBody: [
    "Diese Datei ist der Ausweis Ihres Assistenten: wer er ist, wann er zu rufen ist.",
    "Präzisieren Sie die description und das use_when, sobald sich seine Rolle abzeichnet – das liest der",
    "Router, um über seine Aktivierung zu entscheiden.",
    "",
    "Um Ihre vorhandenen Dokumente in Prozesse und Kompetenzen zu verwandeln, bitten Sie Ihren",
    "Assistenten: „importiere meine bestehenden Abläufe“ – der Router schickt ihn auf den Prozess",
    "`importer-l-existant`, der jede Umwandlung als Diff vorschlägt (nichts wird ohne Sie geschrieben).",
  ],

  // The process the starter agent's card promises, shipped WITH it. Frontmatter included: `title`,
  // `description`, `use_when` and the routing examples are the routable surface, so a translation
  // that stopped at the body would leave the process unreachable in that language. The `id` does
  // NOT translate: it is a stable identifier, like a tool id, and the agent card above cites it.
  // `use_when` avoids a colon followed by a space: a plain YAML scalar cannot carry one.
  scaffoldImporterProcess: [
    "---",
    "schema_version: base.resource.v1",
    "id: importer-l-existant",
    "type: process",
    "title: Das Vorhandene importieren",
    "scope: personal",
    "status: active",
    "sensitivity: internal",
    "description: Ihre vorhandenen Dokumente (Notizen, Anleitungen, Wikis, Checklisten) in BASE-Ressourcen umwandeln (Prozesse, Kompetenzen, Dokumente, Vorlagen), über das Gate vorgeschlagen, nie von sich aus geschrieben.",
    "use_when: Wenn von den eigenen vorhandenen Dokumenten ausgegangen werden soll, zum Beispiel „importiere meine Abläufe“, „mach aus dieser Anleitung einen Prozess“, „ich habe schon alles in einem Wiki“.",
    "keywords: [import, migration, umwandlung, bestand, onboarding]",
    "routing:",
    "  examples:",
    "    - Meine bestehenden Abläufe importieren",
    "    - Dieses Dokument in einen Prozess verwandeln",
    "    - Ich habe schon ein Wiki, wie nutze ich es weiter?",
    "  avoid_when:",
    "    - Eine Fehlfunktion des Assistenten melden.",
    "    - Einen bereits genutzten BASE-Ordner prüfen und erkennen, was an seinen Prozessen verbessert werden könnte.",
    "user-invocable: true",
    "---",
    "",
    "# Das Vorhandene importieren",
    "",
    "Niemand beginnt mit einem leeren Blatt: das Können steckt bereits in Dokumenten. Dieser Prozess",
    "erkundet, worauf Sie zeigen, und SCHLÄGT Umwandlungen in BASE-Ressourcen VOR; jede Schreiboperation",
    "läuft über das Gate (vorschlagen, dann bestätigen), Sie bestätigen jedes Diff.",
    "",
    "Zähle beim ersten Austausch weder die Schritte noch die Kategorien unten auf. Sage in höchstens",
    "drei Sätzen, dass du bereit bist und nichts ohne Bestätigung geschrieben wird, und frage dann, wo die Dokumente liegen.",
    "",
    "## Schritte",
    "",
    "1. **Das Material erkunden.** Lies jede angegebene Quelle. Ordne jeden Inhalt ein: was *befolgt wird*",
    "   (Schritte, Checkliste) wird zu einem `process`; was *gelernt wird* (Regeln, Konventionen) zu einer",
    "   `competence` oder einem `document`; was *ausgefüllt wird* (Raster, Vorlage) zu einem `template`; was",
    "   *mit einer Gültigkeit nachgeschlagen wird* (Tarif, Preisliste) zu einem datierten `document`.",
    "2. **Die Importkarte vorschlagen.** Zeige die Aufteilung von der Quelle zur Zielressource (Typ, id,",
    "   Pfad) und lass sie bestätigen, BEVOR umgewandelt wird. Bleibe flexibel: begleite eine schrittweise",
    "   Migration zu einer für die KI nutzbaren Struktur, und schlage vor, was nützlich ist, zu ergänzen.",
    "3. **Umwandeln, eine Ressource nach der anderen.** Schreibe die vollständige Datei (Frontmatter id, type,",
    "   title, description, ein `use_when`, das des Routers würdig ist) und schlage sie vor. Committe nie",
    "   selbst: der Mensch bestätigt jedes Diff.",
    "4. **Nach dem Import die Gesundheit prüfen.** Empfiehl `base doctor`: er findet die Links, die das",
    "   Kopieren zerbrochen hat, und die verwaisten Ressourcen.",
    "",
    "## Was du nie tust",
    "",
    "- Ohne bestätigtes Diff schreiben. Vorschlagen, immer; committen, nie.",
    "- Inhalte erfinden, die in den Quellen fehlen. Du wandelst um, du schaffst kein Wissen.",
    "- In einem Schwung importieren. Jede Ressource wird einzeln herausgelöst, benannt und bestätigt.",
    "",
  ],

  // Which AI tool reads which file. The path and the id are machine identifiers; only the label is
  // prose, and it names the tools by their own product names, which do not translate.
  toolEntryPointLabels: {
    "claude-code": "Claude Code",
    cursor: "Cursor",
    "agents-md": "Codex, Copilot, Windsurf und die Editoren, die AGENTS.md lesen",
    autre: "jedes andere Werkzeug, das Markdown liest",
  },

  // ── Sichten: die von `base view <name>` erzeugte Tür ─────────────────────────────────────────
  viewHeading: (name) => `## Sicht „${name}“`,
  viewSummary: (count) => `Diese Sicht fasst ${count} Agenten des Ordners zusammen.`,
  viewWhereFilesLive: (up) =>
    `Die Dateien liegen an der Wurzel des BASE (\`${up}\`); diese Sicht kopiert keine davon. Ihre Karte: [routing/index.md](routing/index.md).`,
  viewFoldersHeading: "Arbeitsordner dieser Sicht:",
};
