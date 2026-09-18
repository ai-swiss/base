import { compareByCodePoint } from "../core/ordering.mjs";

const LABELS = {
  accueil: { fr: "Accueil", en: "Home" },
  decouvrir: { fr: "Découvrir BASE", en: "Discover BASE" },
  comprendre: { fr: "Comprendre BASE", en: "Understand BASE" },
  demarrer: { fr: "Démarrer pour de vrai", en: "Really get started" },
  apprendre: { fr: "Apprendre en faisant", en: "Learn by doing" },
  construire: { fr: "Construire vos assistants", en: "Build your assistants" },
  echelle: { fr: "Passer à l'échelle", en: "Scale up" },
  seulPme: { fr: "Seul ou en PME", en: "Solo or SME" },
  installer: { fr: "Installer votre outil", en: "Install your tool" },
  orgPublic: { fr: "Organisation et secteur public", en: "Organisation and public sector" },
  palierDecouverte: { fr: "Découverte", en: "Discovery" },
  palierPraticien: { fr: "Praticien", en: "Practitioner" },
  palierEquipe: { fr: "Équipe", en: "Team" },
  exemples: { fr: "Exemples", en: "Examples" },
  confiance: { fr: "Confiance et preuves", en: "Trust and evidence" },
  reference: { fr: "Référence", en: "Reference" },
  explorer: { fr: "Explorer le corpus", en: "Explore the corpus" },
  projet: { fr: "Le projet", en: "The project" },
  specs: { fr: "Spécifications", en: "Specifications" },
  packages: { fr: "Packages et outils", en: "Packages and tools" },
};

const DECOUVRIR = [
  "docs/start/demo-60-secondes.md",
  "docs/start/essayer-sans-installer.md",
];
const COMPRENDRE = [
  "docs/learn/co-penser-avec-lia.md",
  "docs/learn/au-dela-des-agents.md",
  "docs/learn/comprendre.md",
  "docs/learn/pratiques-co-pensee.md",
  "docs/learn/adoption-organisation.md",
];
const DEMARRER_PIN = ["docs/start/lire-dans-quel-ordre.md", "docs/start/quickstart.md"];
const SEUL_PME = [
  "docs/start/installer-par-votre-ia.md",
  "docs/audiences/pour-qui.md",
  "docs/audiences/kit-demarrage-pme-suisse.md",
  "docs/start/obtenir-base.md",
];
const INSTALLER = [
  "docs/start/installer.md",
  "docs/start/installer-claude-code.md",
  "docs/start/installer-cursor.md",
  "docs/start/installer-mcp.md",
];
const ORG_PUBLIC = [
  "docs/audiences/kit-enterprise.md",
  "docs/audiences/kit-administration-secteur-public.md",
  "docs/audiences/pilote-institution-90-min.md",
  "docs/audiences/dpia-modele.md",
];
const CONSTRUIRE = [
  "docs/guides/idees-agents.md",
  "docs/guides/ecrire-pour-le-routeur.md",
  "docs/guides/structurer-un-corpus-de-connaissance.md",
  "docs/guides/connecter-votre-outil.md",
  "docs/guides/travailler-en-equipe.md",
  "docs/learn/cycle-de-vie-expertise.md",
  "docs/guides/diffusion.md",
];
const ECHELLE = [
  "docs/learn/comprendre-echelle.md",
  "docs/guides/routage-semantique-quickstart.md",
  "docs/guides/voie-2-routage-embeddings.md",
  "docs/guides/choisir-provider-embeddings.md",
  "docs/guides/modeles-souverains.md",
  "docs/guides/benchmarks-echelle.md",
];
const TUTO_PIN = [
  "docs/tutoriel/index.md",
  "docs/tutoriel/harnais.md",
  "docs/tutoriel/decouverte-1-faites-le-parler.md",
  "docs/tutoriel/decouverte-2-changez-une-regle.md",
  "docs/tutoriel/decouverte-3-votre-dossier.md",
  "docs/tutoriel/praticien-1-anatomie.md",
  "docs/tutoriel/praticien-2-le-squelette.md",
  "docs/tutoriel/praticien-3-le-defi.md",
  "docs/tutoriel/praticien-4-competences-et-modeles.md",
  "docs/tutoriel/praticien-5-donnees-qui-periment.md",
  "docs/tutoriel/praticien-6-ouvrez-l-atelier.md",
  "docs/tutoriel/praticien-7-premiere-evaluation.md",
  "docs/tutoriel/praticien-8-le-terrain.md",
  "docs/tutoriel/praticien-9-migrer.md",
  "docs/tutoriel/equipe-1-workspace.md",
  "docs/tutoriel/equipe-2-perimetres-et-egress.md",
  "docs/tutoriel/equipe-3-distribuer.md",
];
const CONFIANCE_PIN = [
  "docs/trust/souverainete-et-confiance.md",
  "docs/trust/evidence.md",
  "docs/trust/mecanismes-verifies.md",
  "docs/trust/mecanismes-vs-consignes.md",
  "docs/trust/frontiere-local-vs-sortant.md",
  "docs/trust/protection-des-donnees.md",
  "docs/trust/securite-et-limites.md",
  "docs/trust/securite-donnees-routage.md",
  "docs/trust/accessibilite.md",
  "docs/trust/licence.md",
];
const REFERENCE_PIN = [
  "docs/reference/glossaire.md",
  "docs/reference/routage-process-et-ressources.md",
  "docs/reference/framework-public.md",
  "docs/reference/modele-de-calcul-oriente-par-l-intention.md",
  "docs/reference/positionnement.md",
  "docs/reference/base-et-vos-outils-ia.md",
  "docs/reference/marqueurs.md",
  "docs/reference/langues.md",
  "docs/reference/compatibilite-harnesses.md",
  "docs/reference/versions-et-stabilite.md",
  "docs/reference/variables-d-environnement.md",
  "docs/reference/etat-implementation.md",
  "docs/reference/specification-v0.md",
];
const PROJET_PIN = [
  "MANIFESTO.md",
  "GOVERNANCE.md",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
  "CHANGELOG.md",
  "docs/public/presse.md",
];
const SPECS_PIN = ["specs/README.md", "specs/current/README.md"];
const DOC_INTERACTIVE = "docs/reference/documentation-interactive.md";

const MODEL_PAGES = [
  ["explorer", "/explorer/", "Explorateur", "Explorer"],
  ["map", "/map/", "Carte du système", "System map"],
  ["routes", "/routes/", "Laboratoire de routage", "Routing lab"],
  ["evidence", "/evidence/", "Preuves", "Evidence"],
  ["quality", "/quality/", "Qualité", "Quality"],
  ["learn", "/learn/", "Parcours guidés", "Learning paths"],
  ["concepts", "/concepts/", "Concepts", "Concepts"],
  ["examples", "/examples/", "Exemples guidés", "Example walkthroughs"],
];

const EXCLUDED_PATHS = new Map([
  ["README.md", "The site landing page is the repository front door."],
  ["README.fr.md", "The site landing page renders the localized repository front door."],
  ["MANIFESTO.en.md", "The canonical manifesto links its translations."],
  ["MANIFESTO.de.md", "The canonical manifesto links its translations."],
  ["MANIFESTO.it.md", "The canonical manifesto links its translations."],
  ["LICENSE", "The reader-facing licence guide explains the raw legal text."],
  ["AGENTS.md", "Generated harness instructions are for AI tools, not sidebar readers."],
  ["CLAUDE.md", "Generated harness instructions are for AI tools, not sidebar readers."],
  ["BASE_BOOTSTRAP.md", "Generated harness instructions are for AI tools, not sidebar readers."],
  [".ai/tools.md", "Generated harness instructions are for AI tools, not sidebar readers."],
  [".github/PULL_REQUEST_TEMPLATE.md", "Repository templates are workflow inputs, not reading pages."],
  ["RELEASING.md", "Maintainer-only release instructions remain available through search and Explorer."],
]);

export function buildNavigation(resources, target) {
  const remaining = new Map(resources.map((resource) => [resource.path, resource]));
  const exclusions = [];
  const exclude = (predicate, reason) => {
    for (const resource of remaining.values()) {
      if (!predicate(resource)) continue;
      remaining.delete(resource.path);
      exclusions.push(exclusion(resource, reason));
    }
  };
  const take = (predicate, pinned = []) => {
    const selected = [...remaining.values()].filter(predicate);
    for (const resource of selected) remaining.delete(resource.path);
    return pinFirst(selected, pinned).map(resourceItem);
  };

  for (const [excludedPath, reason] of EXCLUDED_PATHS) {
    exclude((resource) => resource.path === excludedPath, reason);
  }
  exclude((resource) => resource.doc_role === "operational", "Operational resources are browsed through Explorer, not the reader journey.");
  exclude(
    (resource) => resource.path.endsWith(".json") && !resource.path.startsWith("specs/"),
    "Machine-readable data is browsed through Explorer, not the prose navigation.",
  );
  exclude(
    (resource) => resource.path.startsWith("exemples/") && !resource.path.endsWith("README.md"),
    "Example supporting material is reached from its example front door or through Explorer.",
  );

  const items = /** @type {any[]} */ ([link("home", LABELS.accueil, "/")]);
  items.push(group("decouvrir", LABELS.decouvrir, false, take((resource) => DECOUVRIR.includes(resource.path), DECOUVRIR)));
  items.push(group("comprendre", LABELS.comprendre, false, take((resource) => COMPRENDRE.includes(resource.path), COMPRENDRE)));

  const demarrer = take(
    (resource) => resource.path.startsWith("docs/start/") || resource.path.startsWith("docs/audiences/"),
    DEMARRER_PIN,
  );
  items.push(group("demarrer", LABELS.demarrer, false, nest(demarrer, [
    subgroup("seul-pme", LABELS.seulPme, demarrer, (item) => SEUL_PME.includes(item.path), SEUL_PME),
    subgroup("installer", LABELS.installer, demarrer, (item) => INSTALLER.includes(item.path), INSTALLER),
    subgroup("organisation-public", LABELS.orgPublic, demarrer, (item) => ORG_PUBLIC.includes(item.path), ORG_PUBLIC),
  ])));

  const tutoriel = take((resource) => resource.path.startsWith("docs/tutoriel/"), TUTO_PIN);
  items.push(group("apprendre", LABELS.apprendre, false, nest(tutoriel, [
    subgroup("decouverte", LABELS.palierDecouverte, tutoriel, (item) => item.path.startsWith("docs/tutoriel/decouverte-")),
    subgroup("praticien", LABELS.palierPraticien, tutoriel, (item) => item.path.startsWith("docs/tutoriel/praticien-")),
    subgroup("equipe", LABELS.palierEquipe, tutoriel, (item) => item.path.startsWith("docs/tutoriel/equipe-")),
  ])));

  const construire = take((resource) => CONSTRUIRE.includes(resource.path) || ECHELLE.includes(resource.path), CONSTRUIRE);
  items.push(group("construire", LABELS.construire, false, nest(construire, [
    subgroup("echelle", LABELS.echelle, construire, (item) => ECHELLE.includes(item.path), ECHELLE),
  ])));

  items.push(examplesGroup(take((resource) => resource.path.startsWith("exemples/") && resource.path.endsWith("README.md"))));
  items.push(group("confiance", LABELS.confiance, false, take((resource) => resource.path.startsWith("docs/trust/"), CONFIANCE_PIN)));
  items.push(group("reference", LABELS.reference, false, take((resource) => resource.path.startsWith("docs/reference/") && resource.path !== DOC_INTERACTIVE, REFERENCE_PIN)));

  const interactive = take((resource) => resource.path === DOC_INTERACTIVE);
  items.push(group("explorer", LABELS.explorer, false, [
    ...interactive,
    ...MODEL_PAGES.map(([id, href, fr, en]) => link(id, { fr, en }, href)),
  ]));
  items.push(group("projet", LABELS.projet, true, take((resource) => isProjectMeta(resource.path), PROJET_PIN)));
  items.push(group("specs", LABELS.specs, true, take((resource) => resource.path.startsWith("specs/"), SPECS_PIN)));
  items.push(group("packages", LABELS.packages, true, take((resource) => resource.path.endsWith("README.md"))));

  exclude(
    (resource) => ["reference", "decision", "release", "legal"].includes(resource.doc_role),
    "This long-tail reference is available through Explorer and search but is outside the curated reader journey.",
  );

  return {
    target,
    items: items.filter((item) => item.type === "link" || item.items.length > 0),
    exclusions: exclusions.sort((a, b) => compareByCodePoint(a.path, b.path)),
  };
}

export function validateNavigation(resources, navigation) {
  const counts = new Map();
  const visit = (items) => {
    for (const item of items) {
      if (item.type === "resource") counts.set(item.site_key, (counts.get(item.site_key) ?? 0) + 1);
      if (item.type === "group") visit(item.items);
    }
  };
  visit(navigation.items);
  for (const excluded of navigation.exclusions) counts.set(excluded.site_key, (counts.get(excluded.site_key) ?? 0) + 1);

  const errors = [];
  for (const resource of resources) {
    const count = counts.get(resource.site_key) ?? 0;
    if (count === 0) {
      errors.push({
        code: "base.docs.navigation_unassigned",
        path: resource.path,
        message: "Resource is neither present in navigation nor explicitly excluded with a reason.",
      });
    } else if (count > 1) {
      errors.push({
        code: "base.docs.navigation_duplicate",
        path: resource.path,
        message: `Resource appears ${count} times across navigation and exclusions.`,
      });
    }
  }
  return errors;
}

function resourceItem(resource) {
  return {
    type: "resource",
    id: resource.id,
    site_key: resource.site_key,
    title: resource.title,
    path: resource.path,
    role: resource.doc_role,
  };
}

function exclusion(resource, reason) {
  return { id: resource.id, site_key: resource.site_key, path: resource.path, reason };
}

function link(id, labels, href) {
  return { type: "link", id, labels, href };
}

function group(id, labels, collapsed, items) {
  return { type: "group", id, labels, collapsed, items };
}

function subgroup(id, labels, items, predicate, pinned = []) {
  return group(id, labels, true, pinFirst(items.filter(predicate), pinned));
}

function nest(items, subgroups) {
  const claimed = new Set(subgroups.flatMap((item) => item.items.map((member) => member.site_key)));
  return [...items.filter((item) => !claimed.has(item.site_key)), ...subgroups.filter((item) => item.items.length > 0)];
}

function examplesGroup(items) {
  const top = [];
  const byExample = new Map();
  for (const item of items) {
    const segments = item.path.split("/");
    if (segments.length <= 2) {
      top.push(item);
      continue;
    }
    const name = segments[1];
    const bucket = byExample.get(name) ?? [];
    bucket.push(item);
    byExample.set(name, bucket);
  }
  const nested = [...byExample.entries()].map(([name, exampleItems]) => {
    const frontDoor = exampleItems.find((item) => item.path.split("/").length === 3);
    const title = frontDoor?.title ?? name;
    return group(`example-${name}`, { fr: title, en: title }, true, exampleItems);
  });
  return group("exemples", LABELS.exemples, true, [...top, ...nested]);
}

function pinFirst(items, pinned) {
  const rank = new Map(pinned.map((itemPath, index) => [itemPath, index]));
  return [...items].sort((a, b) => {
    const order = (rank.get(a.path) ?? pinned.length) - (rank.get(b.path) ?? pinned.length);
    return order || compareByCodePoint(a.path, b.path);
  });
}

function isProjectMeta(resourcePath) {
  if (!resourcePath.includes("/") || resourcePath.startsWith(".ai/")) return true;
  return resourcePath.startsWith("docs/public/");
}
