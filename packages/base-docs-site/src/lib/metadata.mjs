// Resource-page metadata helpers, kept in plain JS so the rendering (ResourcePage.astro), the model
// and the tests share ONE source of truth — the source link and the header pills are interactions,
// and interactions are covered by tests (tests/docs-site-resource-page.test.mjs).

// The canonical repository. Internal links to non-modeled files, images and the «view source»
// button all resolve here, so the site is consistent whether served locally or published.
export const REPO_URL = "https://github.com/ai-swiss/base";

/** Public URL of a repository file, for the «view source» link. */
export function repoBlobUrl(repoPath) {
  return `${REPO_URL}/blob/main/${repoPath}`;
}

const LEVEL_LABELS = {
  beginner: { fr: "Débutant", en: "Beginner" },
  intermediate: { fr: "Intermédiaire", en: "Intermediate" },
  advanced: { fr: "Avancé", en: "Advanced" },
};
const ROLE_LABELS = {
  guide: { fr: "Guide", en: "Guide" },
  reference: { fr: "Référence", en: "Reference" },
  explanation: { fr: "Explication", en: "Explanation" },
  tutorial: { fr: "Tutoriel", en: "Tutorial" },
  decision: { fr: "Décision", en: "Decision" },
  "front-door": { fr: "Porte d'entrée", en: "Front door" },
};
const AUDIENCE_LABELS = {
  beginner: { fr: "débutant", en: "beginner" },
  builder: { fr: "concepteur", en: "builder" },
  developer: { fr: "développeur", en: "developer" },
  maintainer: { fr: "mainteneur", en: "maintainer" },
  "decision-maker": { fr: "décideur", en: "decision-maker" },
};

const pick = (map, value, locale) => map[value]?.[locale] ?? value;

/**
 * Key metadata surfaced as pills at the top of a resource page — the reader's «niveau et type» —
 * instead of being buried in the À-propos panel that nobody opens. Returns ordered {kind, label}
 * badges: the reading level, the page role, then any audience that adds information beyond the
 * level (an audience equal to the level would just repeat the first pill, so it is dropped).
 */
export function resourcePills(resource, locale = "fr") {
  const pills = [];
  if (resource.learning_level) {
    pills.push({ kind: "level", label: pick(LEVEL_LABELS, resource.learning_level, locale) });
  }
  if (resource.doc_role) {
    pills.push({ kind: "role", label: pick(ROLE_LABELS, resource.doc_role, locale) });
  }
  const forWord = locale === "fr" ? "Pour " : "For ";
  for (const a of resource.audience ?? []) {
    if (a !== resource.learning_level) {
      pills.push({ kind: "audience", label: forWord + pick(AUDIENCE_LABELS, a, locale) });
    }
  }
  return pills;
}
