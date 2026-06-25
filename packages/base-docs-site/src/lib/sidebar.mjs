// Sidebar as a projection: items come from the generated navigation.json, never from
// hand-maintained page lists. The GROUPING below is a presentation opinion: it reassigns
// each page to one of the reader-journey sections by its path, so the menu reads as a path
// (discover, start, learn, build, scale, ...) instead of mirroring the folder tree. Pages
// still come from the model; a removed file simply disappears from its group.
//
// Plain .mjs so astro.config.mjs can import it at config time.
import fs from "node:fs";
import path from "node:path";

/** French-first labels for the reader-journey sections. */
const LABELS = {
  decouvrir: { fr: "Découvrir BASE", en: "Discover BASE" },
  demarrer: { fr: "Démarrer pour de vrai", en: "Really get started" },
  apprendre: { fr: "Apprendre en faisant", en: "Learn by doing" },
  construire: { fr: "Construire vos assistants", en: "Build your assistants" },
  echelle: { fr: "Passer à l'échelle", en: "Scale up" },
  profil: { fr: "Selon votre profil", en: "For your profile" },
  exemples: { fr: "Exemples", en: "Examples" },
  confiance: { fr: "Confiance et preuves", en: "Trust and evidence" },
  reference: { fr: "Référence", en: "Reference" },
  explorer: { fr: "Explorer le corpus", en: "Explore the corpus" },
  projet: { fr: "Le projet", en: "The project" },
  specs: { fr: "Spécifications", en: "Specifications" },
  packages: { fr: "Packages et outils", en: "Packages and tools" },
  comprendre: { fr: "Comprendre BASE", en: "Understand BASE" },
  accueil: { fr: "Accueil", en: "Home" },
  seulPme: { fr: "Seul ou en PME", en: "Solo or SME" },
  orgPublic: { fr: "Organisation et secteur public", en: "Organisation and public sector" },
  palierDecouverte: { fr: "Découverte", en: "Discovery" },
  palierPraticien: { fr: "Praticien", en: "Practitioner" },
  palierEquipe: { fr: "Équipe", en: "Team" },
};

/** "Découvrir BASE": see and try, no commitment, no reading. */
const DECOUVRIR = [
  "docs/start/demo-60-secondes.md",
  "docs/start/essayer-sans-installer.md",
];

// COMPRENDRE, CONSTRUIRE and ECHELLE are exported: docs/learn and docs/guides pages are assigned to
// the sidebar by EXPLICIT membership in these lists (not by path prefix like the other dirs), so a new
// page there is silently orphaned if it is left out. tests/docs-site-sidebar.test.mjs asserts every
// page in those two dirs appears in one of these lists — making the completeness a mechanism.
/** "Comprendre BASE": the why and the method, conceptual, promoted to 2nd position. No commands. */
export const COMPRENDRE = [
  "docs/learn/co-penser-avec-lia.md",
  "docs/learn/comprendre.md",
  "docs/learn/pratiques-co-pensee.md",
  "docs/learn/adoption-organisation.md",
];

/** "Démarrer": the compass at the top, then three profile sub-sections (membership below). */
const DEMARRER_PIN = ["docs/start/lire-dans-quel-ordre.md", "docs/start/quickstart.md"];
const SEUL_PME = [
  "docs/start/installer-par-votre-ia.md",
  "docs/audiences/pour-qui.md",
  "docs/audiences/kit-demarrage-pme-suisse.md",
  "docs/start/obtenir-base.md",
];
const INSTALLER_GROUP = [
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

/** "Construire": guides to build an assistant, including its post-deployment life. */
export const CONSTRUIRE = [
  "docs/guides/idees-agents.md",
  "docs/guides/ecrire-pour-le-routeur.md",
  "docs/guides/connecter-votre-outil.md",
  "docs/learn/cycle-de-vie-expertise.md",
  "docs/guides/diffusion.md",
];

/** "Passer à l'échelle": advanced routing and models. */
export const ECHELLE = [
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
  "docs/reference/positionnement.md",
  "docs/reference/base-et-vos-outils-ia.md",
  "docs/reference/marqueurs.md",
  "docs/reference/langues.md",
  "docs/reference/compatibilite-harnesses.md",
  "docs/reference/versions-et-stabilite.md",
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

/** Generated pages that read the model directly. The doc-page front door comes first. */
const DOC_INTERACTIVE = "docs/reference/documentation-interactive.md";
const MODEL_PAGES = [
  { link: "/explorer/", fr: "Explorateur", en: "Explorer" },
  { link: "/map/", fr: "Carte du système", en: "System map" },
  { link: "/routes/", fr: "Laboratoire de routage", en: "Routing lab" },
  { link: "/evidence/", fr: "Preuves", en: "Evidence" },
  { link: "/quality/", fr: "Qualité", en: "Quality" },
  { link: "/learn/", fr: "Parcours guidés", en: "Learning paths" },
  { link: "/concepts/", fr: "Concepts", en: "Concepts" },
  { link: "/examples/", fr: "Exemples guidés", en: "Example walkthroughs" },
];

/** The installer pages nest under one entry so "Démarrer" reads as a path, not a wall. */
const INSTALLER_LABELS = { fr: "Installer votre outil", en: "Install your tool" };

/**
 * Pages whose sidebar presence would mislead rather than guide. Each stays reachable
 * through the Explorer and the search index:
 * - landing pages already serve the front door (README variants);
 * - the French manifesto is canonical and links its translations from its header;
 * - LICENSE is the raw legal text; docs/trust/licence.md explains it;
 * - AGENTS.md, CLAUDE.md, BASE_BOOTSTRAP.md, .ai/tools.md are generated harness
 *   artifacts written for AI tools, not for readers;
 */
const EXCLUDED_PATHS = new Set([
  "README.md",
  "README.en.md",
  "MANIFESTO.en.md",
  "MANIFESTO.de.md",
  "MANIFESTO.it.md",
  "LICENSE",
  "AGENTS.md",
  "CLAUDE.md",
  "BASE_BOOTSTRAP.md",
  ".ai/tools.md",
  ".github/PULL_REQUEST_TEMPLATE.md",
  "RELEASING.md",
]);

/**
 * Machine files are data, not prose: nobody browses a package.json from a sidebar.
 * Route fixtures are showcased in the Routing Lab; JSON schemas under specs/ stay because
 * they are part of the published contract.
 */
function belongsInSidebar(item) {
  if (EXCLUDED_PATHS.has(item.path)) return false;
  if (item.path.endsWith(".json")) return item.path.startsWith("specs/");
  return true;
}

/** A page belongs to "Le projet" (meta): a root file, an .ai/ artifact, or a press page. */
function isProjectMeta(p) {
  if (!p.includes("/")) return true;
  if (p.startsWith(".ai/")) return true;
  return p.startsWith("docs/public/");
}

export function modelDir(packageRoot) {
  return process.env.BASE_DOCS_MODEL_DIR || path.resolve(packageRoot, "../../.base-docs/local");
}

/**
 * The English title of a sidebar item: the H1 of its docs/en/ mirror, when one exists. Lets the EN
 * sidebar show translated page titles (the group labels are already bilingual). Null when the page
 * has no mirror, so the caller falls back to the French title.
 */
function enTitleOf(packageRoot, itemPath) {
  if (!itemPath.startsWith("docs/")) return null;
  try {
    const mirror = path.resolve(packageRoot, "../..", `docs/en/${itemPath.slice("docs/".length)}`);
    const text = fs.readFileSync(mirror, "utf8");
    const m = text.match(/^#\s+(.+)$/m);
    return m ? m[1].trim() : null;
  } catch {
    return null;
  }
}

/**
 * Builds the Starlight sidebar from the generated navigation projection, regrouped into
 * reader-journey sections.
 * @param {string} packageRoot Absolute path of the base-docs-site package.
 */
export function buildSidebar(packageRoot) {
  const navigation = JSON.parse(fs.readFileSync(path.join(modelDir(packageRoot), "navigation.json"), "utf8"));
  // Attach each page's English title (from its docs/en/ mirror) so the EN sidebar reads in English.
  for (const section of navigation.sections) {
    for (const item of section.items ?? []) item.enTitle = enTitleOf(packageRoot, item.path);
  }
  const sectionItems = new Map(navigation.sections.map((s) => [s.id, s.items ?? []]));

  // Every editorial/reference item in one pool (examples and operations handled apart).
  const pool = [];
  for (const section of navigation.sections) {
    if (section.id === "operations" || section.id === "examples") continue;
    for (const item of section.items ?? []) pool.push(item);
  }
  const kept = pool.filter(belongsInSidebar);
  const used = new Set();
  const pick = (predicate, pinned) => {
    const items = kept.filter((it) => !used.has(it.path) && predicate(it));
    items.forEach((it) => used.add(it.path));
    return pinFirst(items, pinned ?? []);
  };

  const sidebar = [];

  // A permanent home anchor at the very top: «d'où je viens», toujours à un clic.
  sidebar.push({ label: LABELS.accueil.fr, translations: { en: LABELS.accueil.en }, link: "/" });

  sidebar.push(group(LABELS.decouvrir, false, pick((it) => DECOUVRIR.includes(it.path), DECOUVRIR)));
  sidebar.push(group(LABELS.comprendre, false, pick((it) => COMPRENDRE.includes(it.path), COMPRENDRE)));

  // «Démarrer»: compass at top, then profile sub-sections (the old «Selon votre profil» kits move in).
  const demarrer = pick((it) => it.path.startsWith("docs/start/") || it.path.startsWith("docs/audiences/"), DEMARRER_PIN);
  sidebar.push(nestMembership(group(LABELS.demarrer, false, demarrer), demarrer, [
    { labels: LABELS.seulPme, paths: SEUL_PME },
    { labels: INSTALLER_LABELS, paths: INSTALLER_GROUP },
    { labels: LABELS.orgPublic, paths: ORG_PUBLIC },
  ]));

  // «Apprendre en faisant»: the tutorial, nested by palier so the level shows at a glance.
  const tuto = pick((it) => it.path.startsWith("docs/tutoriel/"), TUTO_PIN);
  sidebar.push(nestMembership(group(LABELS.apprendre, false, tuto), tuto, [
    { labels: LABELS.palierDecouverte, prefix: "docs/tutoriel/decouverte-" },
    { labels: LABELS.palierPraticien, prefix: "docs/tutoriel/praticien-" },
    { labels: LABELS.palierEquipe, prefix: "docs/tutoriel/equipe-" },
  ]));

  // «Construire»: the build guides + the post-deployment life; «Passer à l'échelle» nested as the
  // advanced tail (build → scale, one fil).
  const construire = pick((it) => CONSTRUIRE.includes(it.path) || ECHELLE.includes(it.path), CONSTRUIRE);
  sidebar.push(nestMembership(group(LABELS.construire, false, construire), construire, [
    { labels: LABELS.echelle, paths: ECHELLE },
  ]));

  sidebar.push(examplesGroup(LABELS.exemples, true, (sectionItems.get("examples") ?? []).filter(belongsInSidebar)));
  sidebar.push(group(LABELS.confiance, false, pick((it) => it.path.startsWith("docs/trust/"), CONFIANCE_PIN)));
  sidebar.push(group(LABELS.reference, false, pick((it) => it.path.startsWith("docs/reference/") && it.path !== DOC_INTERACTIVE, REFERENCE_PIN)));
  sidebar.push(explorerGroup(pick((it) => it.path === DOC_INTERACTIVE)));
  sidebar.push(group(LABELS.projet, true, pick((it) => isProjectMeta(it.path), PROJET_PIN)));
  sidebar.push(group(LABELS.specs, true, pick((it) => it.path.startsWith("specs/"), SPECS_PIN)));
  sidebar.push(group(LABELS.packages, true, pick((it) => it.path.endsWith("README.md"), [])));

  return sidebar.filter((g) => g.link || (g.items?.length ?? 0) > 0);
}

/** "Explorer le corpus": the documentation-interactive doc page, then the generated pages. */
function explorerGroup(docInteractiveItems) {
  const front = disambiguate(docInteractiveItems).map((item) => withEnLabel({ label: item.label, link: `/resources/${item.id}/` }, item.enLabel));
  const generated = MODEL_PAGES.map((page) => ({ label: page.fr, translations: { en: page.en }, link: page.link }));
  return {
    label: LABELS.explorer.fr,
    translations: { en: LABELS.explorer.en },
    collapsed: false,
    items: [...front, ...generated],
  };
}

/**
 * Each example reads as one nested group labelled by its front door, so a teacher finds
 * "Assistant Enseignant" with its data folders inside, instead of a flat wall of entries.
 */
function examplesGroup(labels, collapsed, items) {
  const top = [];
  const byExample = new Map();
  for (const item of items) {
    const segments = item.path.split("/");
    if (segments.length <= 2) {
      top.push(item);
      continue;
    }
    const name = segments[1];
    if (!byExample.has(name)) byExample.set(name, []);
    byExample.get(name).push(item);
  }
  const nested = [...byExample.entries()].map(([name, exampleItems]) => {
    const frontDoor = exampleItems.find((item) => item.path.split("/").length === 3);
    const title = frontDoor?.title ?? name;
    return group({ fr: title, en: title }, true, exampleItems);
  });
  const built = group(labels, collapsed, top);
  return { ...built, items: [...built.items, ...nested] };
}

/** Pinned paths first, in pinned order; everything else follows in model order. */
function pinFirst(items, pinned) {
  const rank = new Map(pinned.map((itemPath, index) => [itemPath, index]));
  return [...items].sort((a, b) => (rank.get(a.path) ?? pinned.length) - (rank.get(b.path) ?? pinned.length));
}

/**
 * Replaces, inside a built group, the entries belonging to each sub-group with one nested group
 * (placed where the first member sat). Sub-groups are taken in order; each member lands in the first
 * that claims it. Membership is by explicit `paths` (display order follows the list) or by `prefix`.
 */
function nestMembership(builtGroup, items, subgroups) {
  const claimed = new Set();
  const subs = [];
  for (const sg of subgroups) {
    const matched = sg.paths
      ? items.filter((it) => sg.paths.includes(it.path))
      : items.filter((it) => it.path.startsWith(sg.prefix));
    const memberItems = sg.paths ? pinFirst(matched, sg.paths) : matched;
    const links = memberItems.map((it) => `/resources/${it.id}/`);
    const ordered = links.map((l) => builtGroup.items.find((e) => e.link === l)).filter(Boolean);
    if (ordered.length === 0) continue;
    links.forEach((l) => claimed.add(l));
    subs.push({ label: sg.labels.fr, translations: { en: sg.labels.en }, collapsed: true, items: ordered });
  }
  // Top-level pins (non-members) keep their order; the nested sub-groups follow, in declared order.
  const top = builtGroup.items.filter((e) => !claimed.has(e.link));
  return { ...builtGroup, items: [...top, ...subs] };
}

/** Adds an English label only when it differs from the French one, so an untranslated item keeps its
 * plain { label, link } shape (Starlight then falls back to the French label on the English site). */
function withEnLabel(entry, en) {
  return en && en !== entry.label ? { ...entry, translations: { en } } : entry;
}

function group(labels, collapsed, items) {
  return {
    label: labels.fr,
    translations: { en: labels.en },
    collapsed,
    items: disambiguate(items).map((item) => withEnLabel({ label: item.label, link: `/resources/${item.id}/` }, item.enLabel)),
  };
}

/**
 * A label must identify its page on its own. When titles collide within a group, the owning
 * example or agent is appended as context; if that still collides, the trailing path wins.
 */
function disambiguate(items) {
  const withHint = labelled(
    items,
    (item) => `${item.title} · ${contextHint(item.path)}`,
    (item) => `${item.enTitle ?? item.title} · ${contextHint(item.path)}`,
  );
  return labelled(
    withHint,
    (item) => `${item.title} · ${item.path.split("/").slice(-2).join("/")}`,
    (item) => `${item.enTitle ?? item.title} · ${item.path.split("/").slice(-2).join("/")}`,
  );
}

// Resolves each item's display label, and its English counterpart (enLabel), disambiguating both with
// the same path-based hint when French titles collide within a group. enLabel falls back to the
// French label when a page has no English mirror, so the EN sidebar degrades gracefully.
function labelled(items, hint, enHint) {
  const counts = new Map();
  for (const item of items) {
    const label = item.label ?? item.title;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return items.map((item) => {
    const label = item.label ?? item.title;
    const enBase = item.enLabel ?? item.enTitle ?? item.title;
    if (counts.get(label) > 1) {
      return { ...item, label: hint(item), enLabel: enHint ? enHint(item) : enBase };
    }
    return { ...item, label, enLabel: enBase };
  });
}

function contextHint(itemPath) {
  const segments = itemPath.split("/");
  for (const parent of ["exemples", "packages"]) {
    const index = segments.indexOf(parent);
    if (index >= 0 && segments.length > index + 1) return segments[index + 1];
  }
  const agents = segments.indexOf("agents");
  if (agents >= 0 && segments.length > agents + 1) return segments[agents + 1];
  return segments.length > 1 ? segments[segments.length - 2] : segments[0];
}
