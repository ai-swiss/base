// The French table: every string BASE writes INTO A USER'S FOLDER. Nothing here is a CLI message —
// what the terminal prints stays at its call site, because it is read by the person running the
// command, not by the agent reading the folder afterwards.
//
// This table exists so a root can one day declare another language and get its entry points without
// a second copy of the renderers. Until those tables land, `fr` is the only one, and it is also the
// fallback: `stringsFor` merges key by key over this object (see ./index.mjs), so a partial table
// degrades to French per missing key rather than producing a half-empty file.
//
// Interpolated strings are FUNCTIONS, not prefix/suffix pairs: word order moves between languages,
// and a translator must be able to put the variable where their grammar wants it.
//
// The MCP_* constants in ../bootstrap.mjs are deliberately NOT here: they are English on purpose,
// read by clients that never open these files. The reason is written above them.

export const FR = {
  // ── The canonical router body, shared by all four entry-point projections ──────────────────
  routerIntro:
    "Ce projet est un BASE: des agents et des process en texte. Tu n'as **pas d'identité fixe**; tu es le routeur.",

  routerBody: [
    "## Quand router",
    "- Quand l'utilisateur veut **accomplir une tâche** qui demande un process ou un savoir-faire précis (pas une simple discussion).",
    "- Quand le bon agent/process n'est **pas évident**.",
    "- Quand l'utilisateur écrit **«R»** (ou «R <demande>») pour forcer un routage.",
    "",
    "Cas directs (ne route pas): si l'utilisateur **nomme un agent** («charge l'assistant devis»), ouvre directement son `AGENT.md`. C'est le seul fichier à charger. Et reste dans l'agent déjà chargé: ne route pas à chaque message. Si tu ne peux plus citer le chemin du process actif (après un résumé, ou loin dans une longue conversation), rouvre son `SKILL.md` et l'`AGENT.md` sur disque avant d'agir: le fichier fait foi, pas ta mémoire.",
    "",
    "## Comment parler à la personne",
    "Parle de son travail et de ses documents, pas de la mécanique de BASE. Commence par la réponse utile et n'ajoute les détails que s'ils servent sa demande. Pour une première explication, arrête-toi dès que la personne peut décider si elle veut essayer; ne transforme pas la réponse en inventaire ou en audit. Ne prononce `process`, `competence`, `template`, `frontmatter`, `id`, `gate`, `diff` ou `ressource` que si elle demande les détails techniques. Pose une seule question utile à la fois.",
    "En français, n'utilise jamais de tiret cadratin ni d'espace insécable avant la ponctuation.",
    "",
    "## Appliquer BASE à un dossier qui n'en est pas encore un",
    "Si l'utilisateur veut faire de SON dossier un BASE (il a du matériel, il veut structurer son savoir et son savoir-faire avec l'IA) et que ce dossier n'a encore ni `base.config.json` ni `.ai/agents/`: ne crée AUCUN fichier à la main. Lance d'abord `base init` (il crée le lanceur, la config, le `CLAUDE.md` et un agent de départ sous `.ai/agents/<nom>/`). Puis route vers `importer-l-existant` (à partir de matériel existant) ou `creer-agent` (de zéro), deux process du cadre BASE et non du dossier de l'utilisateur: le lanceur les atteint via `framework_dir` dans `base.config.json`. Chaque écriture est proposée en diff, jamais committée d'office. Si tu te trouves dans le dépôt du cadre BASE lui-même, n'écris rien ici: initialise plutôt le dossier de l'utilisateur.",
    "",
    "## Comment router",
    "Ta carte, c'est l'index généré. Lis `.ai/routing/index.md`: il liste les agents, et l'index de chaque agent (`.ai/agents/<agent>/index.md`, lié depuis la racine) détaille ses process avec «Quand l'utiliser» et «Éviter si». Descends racine → index d'agent → process, et retiens le process dont le «Quand l'utiliser» couvre la demande, en respectant «Éviter si». Tu routes en lisant la carte.",
    "Pour toute demande à router, ta première lecture est `.ai/routing/index.md`. Ne choisis jamais depuis une liste de fichiers ou leur nom, et n'ouvre aucun `AGENT.md` ni `SKILL.md` avant que la carte ait désigné le candidat.",
    "Ne réponds pas à une demande routable depuis tes connaissances générales, même si la prochaine question paraît évidente: la fiche choisie fait foi. Si plusieurs fiches restent plausibles après lecture des cartes, pose la question qui les départage avant d'ouvrir leur corps.",
    "",
    "Pour départager deux candidats, ne lis jamais tous les corps (`AGENT.md`/`SKILL.md`): au plus leurs métadonnées, c'est-à-dire leur bloc frontmatter. Si l'index n'existe pas encore, ces métadonnées sont la carte.",
    "",
    "Si aucun process ne couvre la demande, ne devine pas. Il s'agit souvent d'une question de connaissance plutôt que d'une tâche: classe alors les sources (outil MCP `discover_resources`, ou `node .ai/base.mjs discover \"<la question>\" --root .` depuis un terminal), qui renvoient des chemins et des métadonnées, jamais des corps. Sinon, pose la question qui permettrait de trancher, ou ouvre l'accueil que l'index nomme en fin de page.",
    "",
    "Si ton outil expose l'outil MCP `route_request`, sa `routing_map` est cette même carte et son résultat déterministe accompagne ta lecture comme une indication à vérifier. Ce résultat compare des mots: il sert les appels sans modèle (script, intégration, `base route-test`) et ne décide pas à ta place. S'il désigne un autre process que le tien, relis les «Quand l'utiliser» et «Éviter si»; si le doute persiste, demande.",
    "",
    "Une fois le process retenu, précharge ce que le process déclare (`requires`, `may_use`): des chemins et des notes, jamais les corps. L'outil MCP `get_context_pack`, ou `node .ai/base.mjs context \"<process>\" --root .`, établit ce plan quand il est disponible; ouvre ensuite seulement ce qui sert.",
    "",
    "Pour atteindre un fait plutôt qu'un process, le geste est différent. Les titres d'un document sont des adresses: `identifiant#ancre` désigne un passage, et `node .ai/base.mjs open \"<identifiant>#<ancre>\" --root .` l'ouvre seul. Une question factuelle se cherche au grain section (`node .ai/base.mjs discover \"<la question>\" --grain section --root .`), qui classe des passages et rend leur référence. Ouvre les deux passages qui répondent plutôt que le document entier, et ne cite que du texte que tu as ouvert, sous la forme `identifiant#ancre`.",
    "",
    "Reste honnête sur la limite. Quand rien ne couvre la demande, dis-le et propose la question qui permettrait de trancher; n'ouvre pas les corps des process concurrents pour trancher seul. Route d'abord, charge ensuite; aucun agent n'est l'agent par défaut. La même honnêteté vaut pour la demande: quand une consigne suppose un fait qu'une fiche du dossier contredit, nomme la fiche une fois, avec le passage, puis fais ce qui est demandé si la personne confirme.",
  ],

  // ── Entry points: CLAUDE.md, BASE_BOOTSTRAP.md, .cursor/rules/assistant.mdc, AGENTS.md ──────
  // The banner that marks a file as generated. `doctor` recognises the «Généré par …» sentence as
  // provenance, so a translation must keep a sentence of that shape or the file reads as hand-owned.
  provenanceBanner:
    "<!-- BASE:generated · Généré par `base build bootstrap --write`. Ne pas éditer à la main: le corps canonique est dans `tools/core/bootstrap.mjs`. -->",

  claudeTitle: "# BASE: Bâtir des Assistants avec une Structure d'Expertise",
  claudeLead: "Ce fichier est le **point d'entrée pour Claude Code**.",

  bootstrapTitle: "# BASE: bootstrap générique",
  bootstrapLead: "Point d'entrée générique pour un harness IA.",

  // Only the description is prose; `description:` and `alwaysApply:` are keys Cursor parses.
  cursorRuleDescription: "BASE: routeur d'agents et de process pour votre métier",

  agentsTitle: "# Agents",
  agentsCatalogueTitle: "## Catalogue des agents",
  agentsEmpty: "_Aucun agent dans `.ai/agents/`._",

  // ── The honest enforcement matrix: .ai/tools.md ─────────────────────────────────────────────
  toolMatrixTitle: "# Matrice des outils BASE",
  toolMatrixBanner:
    "<!-- BASE:generated · Généré par `base build`. Déclaration honnête des garanties atteignables quand l'action passe vraiment par BASE. -->",
  toolMatrixLevels: "Niveaux: 0 non supporté · 1 advisory (guide/audit) · 2 médiation partielle · 3 strict (médié).",
  toolMatrixHonesty: [
    "Règle d'honnêteté: cette matrice indique le niveau maximal atteignable par garantie quand",
    "l'action passe vraiment par BASE (CLI, broker, MCP ou connector configuré). Une action qui",
    "contourne BASE reste au niveau natif du harness.",
  ],
  // Header, separator and rows travel together: a translated guarantee name changes the column.
  toolMatrixTable: [
    "| Garantie | claude-code | cursor | chatgpt (mcp) | générique |",
    "| --- | --- | --- | --- | --- |",
    "| Confinement des chemins (accès médié) | 3 | 3 | 3 | 1 |",
    "| Confirmation avant écriture (propose/commit) | 3¹ | 2 | 3¹ | 1 |",
    "| Exécution d'outil (dry-run + confirm) | 3¹ | 2 | 3¹ | 1 |",
    "| Découverte native des skills | 3 | 2 | 1 | 1 |",
    "| Hooks / garde-fous mécaniques | 3² | 2² | 0 | 0 |",
  ],
  toolMatrixFootnotes: [
    "¹ Niveau 3 uniquement pour les actions routées par le broker BASE (`propose`/`commit`, `invoke`).",
    "Une écriture ou exécution qui contourne le broker reste advisory.",
    "² Niveau atteignable seulement si le harness est configuré pour router les actions concernées",
    "vers le broker ou un hook. BASE ne livre pas ces hooks pour tous les harnesses.",
  ],

  // ── The routing index tree: .ai/routing/index.md and .ai/agents/<id>/index.md ────────────────
  routingIndexBanner:
    "<!-- BASE:generated · Généré par `base build routing-index`. Ne pas éditer: régénéré depuis les AGENT.md/SKILL.md. -->",

  indexRootTitle: "# Index de routage: agents disponibles",
  indexRootInstruction:
    "Choisissez l'agent dont le «Quand l'utiliser» couvre la demande, puis ouvrez son index. En cas de doute, ne devinez pas: demandez.",
  indexAgentsHeading: "## Agents",

  indexAgentTitle: (title) => `# ${title}: process disponibles`,
  indexAgentWhenLabel: "**Quand utiliser cet agent**",
  indexAgentInstruction: "Choisissez le process dont le «Quand l'utiliser» couvre la demande. Respectez «Éviter si».",
  indexProcessesHeading: "## Process",

  // The two labels of every card, in the index AND in the router body above. Same words on purpose:
  // the body tells the reader to look for «Quand l'utiliser», so the index must spell it the same.
  cardUseWhen: "**Quand l'utiliser**",
  cardAvoid: "**Éviter si**",

  // The anti-dead-end door at the foot of the root index. `target` is the ready-made Markdown link.
  indexFallbackTitle: "## Si rien ne couvre la demande",
  indexFallbackSentence: (target) => `Ouvrez ${target}. Ce process accueille et oriente; la demande reste ainsi suivie.`,

  // ── The scaffold `base init` writes into a fresh folder ──────────────────────────────────────
  scaffoldGitignore: `# Données locales BASE: traces, changements en attente, feedback, réglages machine. Jamais committées.
.ai/trace/
.ai/changes/
.ai/feedback/
.ai/studio.settings.json

# Produit de construction: régénéré par \`base index\`. Le suivre en version ferait diverger
# chaque machine sur un fichier que personne ne lit à la main.
base.manifest.json
`,

  // The CC BY credit LICENSING.md asks for; `doctor` names a README that lost it.
  attributionLine:
    "Construit avec BASE, Bâtir des Assistants avec une Structure d'Expertise, par AI Swiss, https://a-i.swiss (contenus de méthode sous licence CC BY 4.0).",

  scaffoldReadmeBody: [
    "Ce dossier est un BASE: des agents et des process en texte, qu'un outil d'IA lit pour vous",
    "aider sur votre travail. Les agents vivent sous `.ai/agents/`; chacun dit quand le solliciter",
    "et quels process il sait suivre.",
    "",
    "Pour commencer, ouvrez ce dossier dans votre outil d'IA et dites-lui ce que vous voulez faire.",
  ],

  scaffoldGitattributes: `# Fins de ligne normalisées: un même fichier lu sous Windows, macOS et Linux.
* text=auto

# Scripts: LF obligatoire (un shebang en CRLF ne s'exécute pas).
*.sh text eol=lf
*.py text eol=lf
*.mjs text eol=lf
`,

  // The starter agent's card. `subject` is the humanised folder name, `about` the one sentence the
  // owner gave about their work — the two fields the router actually reads.
  scaffoldAgentDescription: (subject) => `Assistant de travail pour ${subject}, à préciser au fil de l'usage.`,
  scaffoldAgentUseWhenAbout: (about) => `Quand la demande porte sur: ${about}`,
  scaffoldAgentUseWhenGeneric: (subject) => `Quand le travail concerne ${subject}.`,

  scaffoldAgentBody: [
    "Ce fichier est la carte d'identité de votre assistant: qui il est, quand le solliciter.",
    "Précisez la description et le use_when dès que son rôle se dessine. C'est ce que lit le",
    "routeur pour décider de l'activer.",
    "",
    "Pour transformer vos documents existants en process et compétences, demandez à votre",
    "assistant: «importer mes procédures existantes». Le routeur l'enverra sur le process",
    "`importer-l-existant`, qui propose chaque conversion en diff (rien n'est écrit sans vous).",
  ],

  // The process the starter agent's card promises, shipped WITH it. Frontmatter included: `title`,
  // `description`, `use_when` and the routing examples are the routable surface, so a translation
  // that stopped at the body would leave the process unreachable in that language.
  scaffoldImporterProcess: [
    "---",
    "schema_version: base.resource.v1",
    "id: importer-l-existant",
    "type: process",
    "title: Importer l'existant",
    "scope: personal",
    "status: active",
    "sensitivity: internal",
    "description: Convertir vos documents existants (notes, modes d'emploi, wikis, checklists) en ressources BASE (process, compétences, documents, templates), proposées via le gate, jamais écrites d'office.",
    "use_when: Quand l'utilisateur veut partir de ses documents existants: «importe mes procédures», «transforme ce mode d'emploi en process», «j'ai déjà tout dans un wiki».",
    "keywords: [import, migration, conversion, existant, onboarding]",
    "routing:",
    "  examples:",
    "    - Importer mes procédures existantes",
    "    - Transformer ce document en process",
    "    - J'ai déjà un wiki, comment le réutiliser?",
    "  avoid_when:",
    "    - Signaler un dysfonctionnement de l'assistant.",
    "    - Faire le point sur un dossier en service et dire ce qui pourrait aller mieux dans ses process.",
    "user-invocable: true",
    "---",
    "",
    "# Importer l'existant",
    "",
    "Personne ne part d'une page blanche: le savoir-faire est déjà dans des documents. Ce process",
    "explore ce que vous pointez et PROPOSE des conversions en ressources BASE; chaque écriture passe",
    "par le gate (proposer puis valider), vous validez chaque diff.",
    "",
    "Au premier échange, ne récite ni les étapes ni les catégories ci-dessous. Dis en trois phrases",
    "au plus que tu es prêt, que rien ne sera écrit sans validation, puis demande où sont les documents.",
    "",
    "## Étapes",
    "",
    "1. **Explorer le matériau.** Lis chaque source indiquée. Classe chaque contenu: ce qui *se suit*",
    "   (étapes, checklist) devient un `process`; ce qui *s'apprend* (règles, conventions) une",
    "   `competence` ou un `document`; ce qui *se remplit* (trame, modèle) un `template`; ce qui *se",
    "   consulte avec une validité* (barème, tarifs) un `document` daté.",
    "2. **Proposer la carte d'import.** Présente la découpe source vers ressource cible (type, id,",
    "   chemin) et fais-la valider AVANT toute conversion. Reste flexible: guide une migration",
    "   progressive vers une structure exploitable par l'IA, et propose d'ajouter ce qui est utile.",
    "3. **Convertir, une ressource à la fois.** Rédige le fichier complet (frontmatter id, type, title,",
    "   description, un `use_when` digne du routeur) et propose-le. Ne committe jamais toi-même: l'humain",
    "   valide chaque diff.",
    "4. **Vérifier la santé après import.** Recommande `base doctor`: il relève les liens cassés par la",
    "   copie et les ressources orphelines.",
    "",
    "## Ce que tu ne fais jamais",
    "",
    "- Écrire sans diff validé. Proposer, toujours; committer, jamais.",
    "- Inventer du contenu absent des sources. Tu convertis, tu ne crées pas de savoir.",
    "- Importer en vrac. Chaque ressource est découpée, nommée et validée une à une.",
    "",
  ],

  // Which AI tool reads which file. The path and the id are machine identifiers; only the label is
  // prose, and it names the tools by their own product names, which do not translate.
  toolEntryPointLabels: {
    "claude-code": "Claude Code",
    cursor: "Cursor",
    "agents-md": "Codex, Copilot, Windsurf et les éditeurs qui lisent AGENTS.md",
    autre: "tout autre outil qui lit du Markdown",
  },

  // ── Vues: la porte générée par `base view <nom>` ─────────────────────────────────────────────
  viewHeading: (name) => `## Vue «${name}»`,
  viewSummary: (count) => `Cette vue rassemble ${count} agent(s) du dossier.`,
  viewWhereFilesLive: (up) =>
    `Les fichiers vivent à la racine du BASE (\`${up}\`); cette vue n'en copie aucun. Sa carte: [routing/index.md](routing/index.md).`,
  viewFoldersHeading: "Dossiers de travail de cette vue:",
};
