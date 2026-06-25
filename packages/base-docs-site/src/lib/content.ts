/**
 * Editorial data for the generated pages, in both chrome languages.
 * Resource references are ids resolved against the model at build time,
 * so a removed source file breaks the build instead of silently dangling.
 */
export type Localized = { fr: string; en: string };

export type LearnPath = { title: Localized; text: Localized; action: Localized; ids: string[] };

export const LEARN_PATHS: LearnPath[] = [
  {
    title: { fr: "Je découvre BASE", en: "I am new to BASE" },
    text: {
      fr: "Commencez par la porte d'entrée publique, le quickstart et un exemple visible.",
      en: "Start with the public front door, quickstart and one visible example.",
    },
    ids: ["readme", "quickstart", "demo-60-secondes", "exemples-readme"],
    action: {
      fr: "Lancez la démo 60 secondes et inspectez le résultat généré.",
      en: "Run the 60-second demo and inspect the generated output.",
    },
  },
  {
    title: { fr: "Je veux un assistant personnel", en: "I want a personal assistant" },
    text: {
      fr: "Commencez par l'assistant réflexion et voyez comment une pensée privée reste structurée pour la validation.",
      en: "Begin with the reflection assistant and learn how private thought can still be structured for validation.",
    },
    ids: ["co-penser-avec-lia", "exemples-assistant-reflexion-readme", "essayer-sans-installer"],
    action: {
      fr: "Ouvrez l'exemple assistant-reflexion et essayez sa première consigne de configuration.",
      en: "Open the assistant-reflexion example and try its first configuration prompt.",
    },
  },
  {
    title: { fr: "Je dirige une PME", en: "I run a PME" },
    text: {
      fr: "Partez d'un exemple métier concret, puis ajoutez les règles d'équipe et la validation locale.",
      en: "Use a concrete business example, then add team rules and local validation.",
    },
    ids: ["kit-demarrage-pme-suisse", "exemples-assistant-devis-readme", "pour-qui"],
    action: {
      fr: "Copiez un dossier d'exemple et lancez `base validate` dessus.",
      en: "Copy an example folder and run `base validate` on it.",
    },
  },
  {
    title: { fr: "Je suis développeur", en: "I am a developer" },
    text: {
      fr: "Lisez les contrats, le comportement de la CLI et l'architecture avant d'étendre BASE.",
      en: "Read the contracts, CLI behavior and architecture before extending BASE.",
    },
    ids: ["specs-current-readme", "specs-current-10-core-architecture", "specs-current-10-core-cli", "specs-current-10-core-docs"],
    action: {
      fr: "Générez le modèle documentaire et inspectez le graphe produit.",
      en: "Run the docs model and inspect the generated graph.",
    },
  },
  {
    title: { fr: "Je travaille dans une institution publique", en: "I am in a public institution" },
    text: {
      fr: "Distinguez la structure locale de BASE des responsabilités institutionnelles de conformité.",
      en: "Separate BASE's local structure from institutional compliance responsibilities.",
    },
    ids: ["souverainete-et-confiance", "kit-administration-secteur-public", "securite-et-limites", "evidence"],
    action: {
      fr: "Utilisez la page Preuves pour relier affirmations, tests et limites.",
      en: "Use the evidence page to map claims to tests and limits.",
    },
  },
  {
    title: { fr: "Je veux créer un agent", en: "I want to create an agent" },
    text: {
      fr: "Comprenez la forme opérationnelle avant d'écrire une nouvelle carte d'agent ou un process.",
      en: "Understand the operational shape before writing a new agent card or process.",
    },
    ids: ["routage-process-et-ressources", "idees-agents", "exemples-readme", "specs-current-10-core-frontmatter"],
    action: {
      fr: "Créez une petite paire agent/process et ajoutez une fixture de routage.",
      en: "Create a small agent/process pair and add one route fixture.",
    },
  },
  {
    title: { fr: "Je veux comprendre la validation", en: "I want to understand validation" },
    text: {
      fr: "Suivez la route de l'intention humaine au process, aux marqueurs, à propose puis commit, et aux tests.",
      en: "Follow the route from human intent to process, markers, propose then commit, and tests.",
    },
    ids: ["routage-process-et-ressources", "specs-current-10-core-routing", "specs-current-10-core-writes", "specs-current-10-core-maintenance"],
    action: {
      fr: "Lancez un route-test, puis inspectez le process sélectionné.",
      en: "Run a route test, then inspect the process it selected.",
    },
  },
  {
    title: { fr: "Je veux connecter mon outil", en: "I want to connect my tool" },
    text: {
      fr: "Choisissez le bon adaptateur pour Cursor, Claude Code, Claude Desktop, ChatGPT ou MCP.",
      en: "Choose the right adapter for Cursor, Claude Code, Claude Desktop, ChatGPT or MCP.",
    },
    ids: ["connecter-votre-outil", "base-et-vos-outils-ia", "mcp-readme", "compatibilite-harnesses"],
    action: {
      fr: "Générez ou ouvrez le connecteur de votre outil et envoyez une première demande porteuse d'intention.",
      en: "Generate or open the connector path for your tool and send an intent-bearing first prompt.",
    },
  },
  {
    title: { fr: "Je veux évaluer un process", en: "I want to evaluate a process" },
    text: {
      fr: "Utilisez l'évaluation pour tester des workflows, pas comme un score magique.",
      en: "Use eval as a way to test workflows, not as a magic score.",
    },
    ids: ["packages-base-eval-readme", "specs-testing", "evidence"],
    action: {
      fr: "Lancez ou adaptez un scénario base-eval autour d'un process réel.",
      en: "Run or adapt one base-eval scenario around a real process.",
    },
  },
  {
    title: { fr: "Je veux auditer ou faire évoluer BASE", en: "I want to build or audit BASE" },
    text: {
      fr: "Utilisez les spécifications et le modèle généré pour voir le framework comme un système.",
      en: "Use the specifications and generated model to see the framework as a system.",
    },
    ids: ["specs-current-readme", "specs-current-10-core-architecture", "specs-current-10-core-docs", "documentation-interactive"],
    action: {
      fr: "Construisez le site public et relisez la page Qualité.",
      en: "Build the public docs site and review the Quality page.",
    },
  },
];

export type ConceptStep = { title: Localized; text: Localized; id: string };

export const CONCEPT_STEPS: ConceptStep[] = [
  {
    title: { fr: "Intention", en: "Intent" },
    text: {
      fr: "Une demande humaine n'est pas traitée comme une entrée magique. Elle est routée vers des agents et des process déclarés.",
      en: "A human request is not treated as magic input. It is routed against declared agents and processes.",
    },
    id: "routage-process-et-ressources",
  },
  {
    title: { fr: "Process", en: "Process" },
    text: {
      fr: "Le process sélectionné porte la méthode, les attentes, les points de validation et les ressources référencées.",
      en: "The selected process carries the method, expectations, validation points and referenced resources.",
    },
    id: "specs-current-10-core-routing",
  },
  {
    title: { fr: "Validation", en: "Validation" },
    text: {
      fr: "Fixtures de routage, schémas, avertissements et tests rendent la structure inspectable avant d'accorder la confiance.",
      en: "Route fixtures, schemas, warnings and tests make the structure inspectable before trust is granted.",
    },
    id: "evidence",
  },
  {
    title: { fr: "Écriture", en: "Write" },
    text: {
      fr: "Les mutations passent par propose puis commit, pour que les changements restent visibles et encadrés.",
      en: "Mutations go through propose then commit so changes remain visible and mediated.",
    },
    id: "specs-current-10-core-writes",
  },
];

export type EvidenceClaim = {
  title: Localized;
  text: Localized;
  limit: Localized;
  sources: string[];
  tests: string[];
};

export const EVIDENCE_CLAIMS: EvidenceClaim[] = [
  {
    title: { fr: "L'égress confidentiel est refusé avant l'appel", en: "Confidential egress is refused before the call" },
    text: {
      fr: "Une ressource marquée confidentielle, ou un dossier déclaré local-only, n'est pas envoyée à un modèle distant: le contrôle a lieu avant l'appel, donc la donnée ne quitte pas la machine, et le refus est affiché, jamais silencieux.",
      en: "A resource marked confidential, or a root declared local-only, is not sent to a remote model: the check happens before the call, so the data never leaves the machine, and the refusal is shown, never silent.",
    },
    sources: ["frontiere-local-vs-sortant", "mecanismes-verifies"],
    tests: ["tests/base-egress.test.mjs"],
    limit: {
      fr: "La garantie ne couvre que les actions qui passent par le médiateur de BASE; un outil que vous lancez vous-même hors de lui n'est pas concerné.",
      en: "The guarantee covers only actions that pass through BASE's mediator; a tool you run yourself outside it is not covered.",
    },
  },
  {
    title: { fr: "Aucune écriture sans une proposition montrée d'abord", en: "No write without a proposal shown first" },
    text: {
      fr: "Les écritures sont médiées en deux temps, proposer puis confirmer: un diff est montré avant d'écrire, l'écriture est atomique, et un garde anti-collision empêche d'écraser un fichier modifié entre-temps.",
      en: "Writes are mediated in two steps, propose then commit: a diff is shown before writing, the write is atomic, and a concurrency guard prevents overwriting a file changed in between.",
    },
    sources: ["mecanismes-verifies", "specs/current/10_core/writes.md"],
    tests: ["tests/base-core.test.mjs"],
    limit: {
      fr: "Le mécanisme protège le chemin d'écriture, pas l'exactitude de ce qui est écrit: cela reste votre vérification.",
      en: "The mechanism protects the write path, not the correctness of what is written: that remains your verification.",
    },
  },
  {
    title: { fr: "Le routeur s'abstient plutôt que d'inventer", en: "The router abstains rather than invent" },
    text: {
      fr: "Le classement propose des scores, le routeur décide, le médiateur applique. Quand rien ne correspond assez, le routeur s'abstient honnêtement (hors périmètre, ambigu, clarification) au lieu d'afficher une fausse certitude.",
      en: "The ranker scores, the router decides, the mediator applies. When nothing fits well enough, the router abstains honestly (out of scope, ambiguous, needs clarification) instead of showing false certainty.",
    },
    sources: ["routage-process-et-ressources", "mecanismes-vs-consignes"],
    tests: ["tests/base-routing.test.mjs"],
    limit: {
      fr: "Le routeur choisit, il n'applique pas les permissions; et un routeur lexical ne reconnaît que les mots qu'on lui a donnés.",
      en: "The router chooses, it does not enforce permissions; and a lexical router only recognizes the words it was given.",
    },
  },
  {
    title: { fr: "Les marqueurs sont cherchables et traitables par programme", en: "Markers are searchable and machine-processable" },
    text: {
      fr: "Les marqueurs comme [A VALIDER] ou [DECISION] ne sont pas décoratifs: on peut les lister, les compter et bloquer tant qu'il en reste, dans vos fichiers comme dans l'outillage.",
      en: "Markers such as [A VALIDER] or [DECISION] are not decorative: they can be listed, counted and used to block while any remain, in your files and in the tooling.",
    },
    sources: ["marqueurs"],
    tests: ["tests/base-core.test.mjs"],
    limit: {
      fr: "Un marqueur signale; il ne garantit pas que quelqu'un a réellement vérifié ce qu'il pointe.",
      en: "A marker signals; it does not guarantee that someone actually verified what it points to.",
    },
  },
  {
    title: { fr: "La structure rend la validation possible", en: "Structure makes validation possible" },
    text: {
      fr: "L'intention humaine, le process, les ressources et les sorties attendues sont assez visibles pour être inspectés.",
      en: "Human intent, process, resources and expected outputs are visible enough to inspect.",
    },
    sources: ["routage-process-et-ressources", "specs/current/10_core/writes.md"],
    tests: ["tests/base-routing.test.mjs", "tests/base-core.test.mjs"],
    limit: {
      fr: "BASE ne rend pas une réponse vraie par lui-même. Il rend le chemin de vérification explicite.",
      en: "BASE does not make an answer true by itself. It makes the verification path explicit.",
    },
  },
  {
    title: { fr: "Le local par défaut est praticable", en: "Local by default is practical" },
    text: {
      fr: "BASE fonctionne comme une structure locale lisible avant toute plateforme hébergée.",
      en: "BASE can run as a readable local structure before any hosted platform is introduced.",
    },
    sources: ["connecter-votre-outil", "modeles-souverains", "mcp/README.md"],
    tests: ["tests/base-cli.test.mjs", "tests/browser-pack.test.mjs"],
    limit: {
      fr: "Les contrôles organisationnels comme l'IAM, le DLP et la rétention restent des responsabilités externes.",
      en: "Organizational controls such as IAM, DLP and retention remain external responsibilities.",
    },
  },
  {
    title: { fr: "Les couches optionnelles protègent la simplicité", en: "Optional layers protect simplicity" },
    text: {
      fr: "Indexation, classement sémantique et évaluation sont des packages ajoutés quand le cas d'usage le mérite.",
      en: "Indexing, semantic ranking and evaluation are packages added when the use case earns them.",
    },
    sources: ["comprendre-echelle", "packages/base-index-local/README.md", "packages/base-ranker-semantic/README.md", "packages/base-eval/README.md"],
    tests: ["packages/base-index-local/tests", "packages/base-ranker-semantic/tests", "packages/base-eval/tests"],
    limit: {
      fr: "Chaque couche ajoute une surface de maintenance et doit rester optionnelle.",
      en: "Each layer adds maintenance surface and must stay optional.",
    },
  },
  {
    title: { fr: "Le site est une projection du dépôt", en: "The site is a projection of the repository" },
    text: {
      fr: "Les pages interactives sont générées depuis le modèle documentaire; la prose canonique reste dans le dépôt.",
      en: "Interactive pages are generated from the docs model while canonical prose stays in the repo.",
    },
    sources: ["documentation-interactive", "specs/current/10_core/docs.md", "tools/docs/model.mjs"],
    tests: ["tests/base-docs.test.mjs"],
    limit: {
      fr: "Les explications durables doivent rejoindre docs ou specs, pas des fichiers de présentation.",
      en: "Durable explanations must move into docs or specs, not presentation-only files.",
    },
  },
];
