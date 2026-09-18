// The Italian table: every key of ./fr.mjs, translated. Same shape, same order, same placeholders —
// only the words change. Plain institutional Italian, the register of the French source, read as
// often in Lugano or Bellinzona as in Milan.
//
// What does NOT move: every path, command, frontmatter key, resource id and `{placeholder}` is a
// machine identifier, carried across verbatim (`base build bootstrap --write`, `.ai/routing/index.md`,
// `importer-l-existant`, `framework_dir`). Translating one of them yields a file that reads well and
// does not work.
//
// Typography is Italian: «virgolette caporali» with no inner space, no space before punctuation, and
// the lineetta is the en dash. `tools/docs/check-emdash.mjs` audits French content only
// (README.fr.md, CONTRIBUTING.md, MANIFESTO.md, CHANGELOG.md, docs/**), so this file is out of its
// scope and answers to Italian conventions alone.
//
// The two card labels are load-bearing. `WHEN_TO_USE_HEADINGS` in ../routing.mjs recognises
// "quando usare" as a body heading, so `cardUseWhen` is exactly `**Quando usare**`: a process that
// states its trigger as a `## Quando usare` section then routes on the very words the index prints
// above it, and the router body can tell the reader to look for the same two words.
// `indexAgentWhenLabel` opens with them too, for the same reason. `cardAvoid` has no counterpart in
// that constant (nothing matches an avoid section), so it is simply the Italian pair of the label.
//
// The MCP_* constants in ../bootstrap.mjs stay where they are: they were already English, and they
// are not per-language text.

// fr-synced: 440b3065b0568a5f6d993e35781d0aca9fc2066e

export const IT = {
  // ── The canonical router body, shared by all four entry-point projections ──────────────────
  routerIntro:
    "Questo progetto è un BASE: agenti e processi in testo. Non hai **un'identità fissa**; sei il router.",

  routerBody: [
    "## Quando instradare",
    "- Quando l'utente vuole **portare a termine un compito** che richiede un processo o un saper fare preciso (non una semplice conversazione).",
    "- Quando l'agente o il processo giusto **non è evidente**.",
    "- Quando l'utente scrive **«R»** (o «R <richiesta>») per forzare un instradamento.",
    "",
    "Casi diretti (non instradare): se l'utente **nomina un agente** («carica l'assistente preventivi»), apri direttamente il suo `AGENT.md`. È l'unico file da caricare. E resta nell'agente già caricato: non instradare a ogni messaggio. Se non riesci più a citare il percorso del processo attivo (dopo un riassunto, o molto avanti in una lunga conversazione), riapri il suo `SKILL.md` e l'`AGENT.md` su disco prima di agire: fa fede il file, non la tua memoria.",
    "",
    "## Come parlare alla persona",
    "Parla del suo lavoro e dei suoi documenti, non della meccanica di BASE. Inizia dalla risposta utile e aggiungi solo i dettagli che servono alla richiesta. Per una prima spiegazione, fermati non appena la persona può decidere se provarlo; non trasformare la risposta in un inventario o in una verifica. Nomina `process`, `competence`, `template`, `frontmatter`, `id`, `gate`, `diff` o `resource` solo se chiede dettagli tecnici. Poni una sola domanda utile alla volta.",
    "Usa una punteggiatura semplice e non usare mai lineette lunghe.",
    "",
    "## Applicare BASE a una cartella che non lo è ancora",
    "Se l'utente vuole fare della PROPRIA cartella un BASE (ha del materiale, vuole strutturare il proprio sapere e il proprio saper fare con l'IA) e questa cartella non ha ancora né `base.config.json` né `.ai/agents/`: non creare ALCUN file a mano. Lancia prima `base init` (crea il lanciatore, la configurazione, il `CLAUDE.md` e un agente di partenza sotto `.ai/agents/<nome>/`). Poi instrada verso `importer-l-existant` (a partire da materiale esistente) o `creer-agent` (da zero), due processi del framework BASE e non della cartella dell'utente: il lanciatore li raggiunge tramite `framework_dir` in `base.config.json`. Ogni scrittura è proposta come diff, mai committata d'ufficio. Se ti trovi nel repository del framework BASE stesso, non scrivere nulla qui: inizializza piuttosto la cartella dell'utente.",
    "",
    "## Come instradare",
    "La tua mappa è l'indice generato. Leggi `.ai/routing/index.md`: elenca gli agenti, e l'indice di ogni agente (`.ai/agents/<agent>/index.md`, collegato dalla radice) descrive i suoi processi con «Quando usare» e «Evitare se». Scendi dalla radice all'indice di agente e poi al processo, e tieni il processo il cui «Quando usare» copre la richiesta, rispettando «Evitare se». Instradi leggendo la mappa.",
    "Per ogni richiesta da instradare, la prima lettura è `.ai/routing/index.md`. Non scegliere mai da un elenco di file o dal loro nome, e non aprire alcun `AGENT.md` o `SKILL.md` prima che la mappa abbia indicato il candidato.",
    "Non rispondere a una richiesta instradabile usando conoscenze generali, anche se la domanda successiva sembra ovvia: fa fede la scheda scelta. Se dopo aver letto le mappe restano plausibili più schede, poni la domanda che le distingue prima di aprirne i corpi.",
    "",
    "Per scegliere tra due candidati, non leggere mai tutti i corpi (`AGENT.md`/`SKILL.md`): al massimo i loro metadati, cioè il loro blocco frontmatter. Se l'indice non esiste ancora, questi metadati sono la mappa.",
    "",
    "Se nessun processo copre la richiesta, non indovinare. Spesso si tratta di una questione di conoscenza più che di un compito: classifica allora le fonti (strumento MCP `discover_resources`, oppure `node .ai/base.mjs discover \"<la domanda>\" --root .` da un terminale), che restituiscono percorsi e metadati, mai corpi. Altrimenti poni la domanda che permetterebbe di decidere, oppure apri il processo di accoglienza che l'indice nomina in fondo alla pagina.",
    "",
    "Se il tuo strumento espone lo strumento MCP `route_request`, la sua `routing_map` è questa stessa mappa e il suo risultato deterministico accompagna la tua lettura come un'indicazione da verificare. Questo risultato confronta parole: serve le chiamate senza modello (script, integrazione, `base route-test`) e non decide al posto tuo. Se indica un processo diverso dal tuo, rileggi i «Quando usare» e gli «Evitare se»; se il dubbio resta, chiedi.",
    "",
    "Una volta scelto il processo, precarica ciò che il processo dichiara (`requires`, `may_use`): percorsi e note, mai i corpi. Lo strumento MCP `get_context_pack`, o `node .ai/base.mjs context \"<processo>\" --root .`, stabilisce questo piano quando è disponibile; apri poi soltanto ciò che serve.",
    "",
    "Raggiungere un FATTO è un gesto diverso dal raggiungere un process. I titoli di un documento sono indirizzi: `id#anchor` designa un passaggio, e `node .ai/base.mjs open \"<id>#<ancora>\" --root .` apre solo quel passaggio. Una domanda fattuale si cerca al grano sezione (`node .ai/base.mjs discover \"<la domanda>\" --grain section --root .`), che ordina i passaggi e ne restituisce il riferimento. Aprite i due passaggi che rispondono, invece del documento intero, e citate solo testo che avete aperto, nella forma `id#anchor`.",
    "",
    "Resta onesto sul limite. Quando nulla copre la richiesta, dillo e proponi la domanda che permetterebbe di decidere; non aprire i corpi dei processi concorrenti per decidere da solo. Instrada prima, carica poi; nessun agente è l'agente predefinito. La stessa onestà vale per la richiesta: quando un'istruzione presuppone un fatto che una scheda di questa cartella contraddice, nomina la scheda una volta, con il passaggio, poi fai ciò che è chiesto se la persona conferma.",
  ],

  // ── Entry points: CLAUDE.md, BASE_BOOTSTRAP.md, .cursor/rules/assistant.mdc, AGENTS.md ──────
  // The banner keeps the machine token `BASE:generated` first: that token is what the build, the
  // doctor and discovery read to tell a generated projection from a hand-owned file. The sentence
  // beside it is for a human, and is the only part that translates.
  provenanceBanner:
    "<!-- BASE:generated · Generato da `base build bootstrap --write`. Non modificare a mano: il corpo canonico si trova in `tools/core/bootstrap.mjs`. -->",

  // The Italian expansion of the acronym: Basare, Assistenti, Struttura, Expertise.
  claudeTitle: "# BASE: Basare Assistenti su una Struttura di Expertise",
  claudeLead: "Questo file è il **punto di ingresso per Claude Code**.",

  bootstrapTitle: "# BASE: bootstrap generico",
  bootstrapLead: "Punto di ingresso generico per un harness IA.",

  // Only the description is prose; `description:` and `alwaysApply:` are keys Cursor parses.
  cursorRuleDescription: "BASE: router di agenti e processi per il vostro mestiere",

  agentsTitle: "# Agenti",
  agentsCatalogueTitle: "## Catalogo degli agenti",
  agentsEmpty: "_Nessun agente in `.ai/agents/`._",

  // ── The honest enforcement matrix: .ai/tools.md ─────────────────────────────────────────────
  toolMatrixTitle: "# Matrice degli strumenti BASE",
  toolMatrixBanner:
    "<!-- BASE:generated · Generato da `base build`. Dichiarazione onesta delle garanzie raggiungibili quando l'azione passa davvero per BASE. -->",
  toolMatrixLevels: "Livelli: 0 non supportato · 1 consultivo (guida/audit) · 2 mediazione parziale · 3 rigoroso (mediato).",
  toolMatrixHonesty: [
    "Regola di onestà: questa matrice indica il livello massimo raggiungibile per garanzia quando",
    "l'azione passa davvero per BASE (CLI, broker, MCP o connector configurato). Un'azione che",
    "aggira BASE resta al livello nativo dell'harness.",
  ],
  // Header, separator and rows travel together: a translated guarantee name changes the column.
  toolMatrixTable: [
    "| Garanzia | claude-code | cursor | chatgpt (mcp) | generico |",
    "| --- | --- | --- | --- | --- |",
    "| Confinamento dei percorsi (accesso mediato) | 3 | 3 | 3 | 1 |",
    "| Conferma prima della scrittura (propose/commit) | 3¹ | 2 | 3¹ | 1 |",
    "| Esecuzione di strumento (dry-run + confirm) | 3¹ | 2 | 3¹ | 1 |",
    "| Scoperta nativa delle skill | 3 | 2 | 1 | 1 |",
    "| Hook / barriere meccaniche | 3² | 2² | 0 | 0 |",
  ],
  toolMatrixFootnotes: [
    "¹ Livello 3 soltanto per le azioni instradate dal broker BASE (`propose`/`commit`, `invoke`).",
    "Una scrittura o un'esecuzione che aggira il broker resta consultiva.",
    "² Livello raggiungibile soltanto se l'harness è configurato per instradare le azioni interessate",
    "verso il broker o verso un hook. BASE non fornisce questi hook per tutti gli harness.",
  ],

  // ── The routing index tree: .ai/routing/index.md and .ai/agents/<id>/index.md ────────────────
  routingIndexBanner:
    "<!-- BASE:generated · Generato da `base build routing-index`. Non modificare: rigenerato dagli AGENT.md/SKILL.md. -->",

  indexRootTitle: "# Indice di routing – agenti disponibili",
  indexRootInstruction:
    "Scegliete l'agente il cui «Quando usare» copre la richiesta, poi aprite il suo indice. In caso di dubbio, non indovinate: chiedete.",
  indexAgentsHeading: "## Agenti",

  indexAgentTitle: (title) => `# ${title} – processi disponibili`,
  indexAgentWhenLabel: "**Quando usare questo agente**",
  indexAgentInstruction: "Scegliete il processo il cui «Quando usare» copre la richiesta. Rispettate «Evitare se».",
  indexProcessesHeading: "## Processi",

  // The two labels of every card, in the index AND in the router body above. Same words on purpose:
  // the body tells the reader to look for «Quando usare», so the index must spell it the same — and
  // "quando usare" is what routing.mjs recognises as a body heading (see the note at the top).
  cardUseWhen: "**Quando usare**",
  cardAvoid: "**Evitare se**",

  // The anti-dead-end door at the foot of the root index. `target` is the ready-made Markdown link.
  indexFallbackTitle: "## Se nulla copre la richiesta",
  indexFallbackSentence: (target) => `Aprite ${target}. Questo processo accoglie e orienta; così la richiesta resta seguita.`,

  // ── The scaffold `base init` writes into a fresh folder ──────────────────────────────────────
  scaffoldGitignore: `# Dati locali BASE: tracce, modifiche in attesa, feedback, impostazioni macchina. Mai committati.
.ai/trace/
.ai/changes/
.ai/feedback/
.ai/studio.settings.json

# Prodotto di build: rigenerato da \`base index\`. Versionarlo farebbe divergere
# ogni macchina su un file che nessuno legge a mano.
base.manifest.json
`,

  // The CC BY credit LICENSING.md asks for. `upgrade` and `doctor` look for the a-i.swiss URL, not
  // for the sentence, so a translation keeps the credit detectable as long as the URL survives.
  attributionLine:
    "Costruito con BASE, Basare Assistenti su una Struttura di Expertise, da AI Swiss, https://a-i.swiss (contenuti di metodo sotto licenza CC BY 4.0).",

  scaffoldReadmeBody: [
    "Questa cartella è un BASE: agenti e processi in testo, che uno strumento di IA legge per",
    "aiutarvi nel vostro lavoro. Gli agenti vivono sotto `.ai/agents/`; ciascuno dice quando",
    "interpellarlo e quali processi sa seguire.",
    "",
    "Per cominciare, aprite questa cartella nel vostro strumento di IA e ditegli che cosa volete fare.",
  ],

  scaffoldGitattributes: `# Fine riga normalizzata: uno stesso file letto su Windows, macOS e Linux.
* text=auto

# Script: LF obbligatorio (uno shebang in CRLF non viene eseguito).
*.sh text eol=lf
*.py text eol=lf
*.mjs text eol=lf
`,

  // The starter agent's card. `subject` is the humanised folder name, `about` the one sentence the
  // owner gave about their work — the two fields the router actually reads.
  scaffoldAgentDescription: (subject) => `Assistente di lavoro per ${subject} – da precisare con l'uso.`,
  scaffoldAgentUseWhenAbout: (about) => `Quando la richiesta riguarda: ${about}`,
  scaffoldAgentUseWhenGeneric: (subject) => `Quando il lavoro riguarda ${subject}.`,

  scaffoldAgentBody: [
    "Questo file è la carta d'identità del vostro assistente: chi è, quando interpellarlo.",
    "Precisate la description e lo use_when appena il suo ruolo prende forma – è ciò che legge il",
    "router per decidere di attivarlo.",
    "",
    "Per trasformare i vostri documenti esistenti in processi e competenze, chiedete al vostro",
    "assistente: «importa le mie procedure esistenti» – il router lo manderà sul processo",
    "`importer-l-existant`, che propone ogni conversione come diff (nulla viene scritto senza di voi).",
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
    "title: Importare l'esistente",
    "scope: personal",
    "status: active",
    "sensitivity: internal",
    "description: Convertire i vostri documenti esistenti (note, istruzioni, wiki, checklist) in risorse BASE (processi, competenze, documenti, template), proposte tramite il gate, mai scritte d'ufficio.",
    "use_when: Quando l'utente vuole partire dai propri documenti esistenti, per esempio «importa le mie procedure», «trasforma queste istruzioni in un processo», «ho già tutto in un wiki».",
    "keywords: [import, migrazione, conversione, esistente, onboarding]",
    "routing:",
    "  examples:",
    "    - Importare le mie procedure esistenti",
    "    - Trasformare questo documento in un processo",
    "    - Ho già un wiki, come lo riutilizzo?",
    "  avoid_when:",
    "    - Segnalare un malfunzionamento dell'assistente.",
    "    - Esaminare una cartella BASE già in uso e individuare cosa potrebbe migliorare nei suoi processi.",
    "user-invocable: true",
    "---",
    "",
    "# Importare l'esistente",
    "",
    "Nessuno parte da una pagina bianca: il saper fare è già nei documenti. Questo processo esplora",
    "ciò che indicate e PROPONE conversioni in risorse BASE; ogni scrittura passa dal gate",
    "(proporre poi convalidare), voi convalidate ogni diff.",
    "",
    "Al primo scambio, non elencare i passaggi o le categorie qui sotto. In non più di tre frasi,",
    "di' che sei pronto, che nulla sarà scritto senza approvazione, poi chiedi dove sono i documenti.",
    "",
    "## Passi",
    "",
    "1. **Esplorare il materiale.** Leggi ogni fonte indicata. Classifica ogni contenuto: ciò che *si segue*",
    "   (passi, checklist) diventa un `process`; ciò che *si impara* (regole, convenzioni) una",
    "   `competence` o un `document`; ciò che *si compila* (traccia, modello) un `template`; ciò che *si",
    "   consulta con una validità* (tariffario, listino) un `document` datato.",
    "2. **Proporre la mappa di importazione.** Mostra la suddivisione dalla fonte alla risorsa di",
    "   destinazione (tipo, id, percorso) e falla convalidare PRIMA di ogni conversione. Resta flessibile:",
    "   guida una migrazione progressiva verso una struttura utilizzabile dall'IA, e proponi di aggiungere ciò che è utile.",
    "3. **Convertire, una risorsa alla volta.** Scrivi il file completo (frontmatter id, type, title,",
    "   description, uno `use_when` degno del router) e proponilo. Non fare mai il commit da solo:",
    "   l'essere umano convalida ogni diff.",
    "4. **Verificare la salute dopo l'importazione.** Raccomanda `base doctor`: rileva i collegamenti che",
    "   la copia ha rotto e le risorse orfane.",
    "",
    "## Ciò che non fai mai",
    "",
    "- Scrivere senza un diff convalidato. Proporre, sempre; fare il commit, mai.",
    "- Inventare contenuti assenti dalle fonti. Tu converti, non crei sapere.",
    "- Importare alla rinfusa. Ogni risorsa è ritagliata, nominata e convalidata una a una.",
    "",
  ],

  // Which AI tool reads which file. The path and the id are machine identifiers; only the label is
  // prose, and it names the tools by their own product names, which do not translate.
  toolEntryPointLabels: {
    "claude-code": "Claude Code",
    cursor: "Cursor",
    "agents-md": "Codex, Copilot, Windsurf e gli editor che leggono AGENTS.md",
    autre: "qualsiasi altro strumento che legge Markdown",
  },

  // ── Viste: la porta generata da `base view <nome>` ───────────────────────────────────────────
  viewHeading: (name) => `## Vista «${name}»`,
  viewSummary: (count) => `Questa vista raccoglie ${count} agenti della cartella.`,
  viewWhereFilesLive: (up) =>
    `I file vivono alla radice del BASE (\`${up}\`); questa vista non ne copia nessuno. La sua mappa: [routing/index.md](routing/index.md).`,
  viewFoldersHeading: "Cartelle di lavoro di questa vista:",
};
