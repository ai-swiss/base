// tools/core/upgrade.mjs — what an EXISTING root should change to match the current framework.
//
// A root created by an older BASE keeps working: nothing here is required. What this plans is the
// difference between what that root carries and what `base init` would give it today, so a folder
// made a year ago does not have to be rebuilt to get a convention it would have had for free.
//
// Pure: every input is passed in, and the plan is data. Three actions, in increasing intrusiveness:
//   create — a file that does not exist (creation-only, like the init plan)
//   append — one line added at the end of a file BASE already owns the format of
//   rewrite — a file BASE writes entirely (its own JSON config), with the new content given
// Nothing DELETES. A file the author wrote is named in `notes`, never touched: the upgrade tells
// them what is now unnecessary and lets them decide.

const ENTRY_POINTS = ["CLAUDE.md", "AGENTS.md", ".cursor/rules/assistant.mdc", "BASE_BOOTSTRAP.md"];
const MANIFEST_IGNORE = "base.manifest.json";
const ATTRIBUTION_MARK = "a-i.swiss";
const SHARED_SCOPES = new Set(["team", "org", "public"]);

/**
 * @typedef {object} UpgradeInput
 * @property {string[]} files root-relative paths present on disk
 * @property {string | null} [gitignore] its content, or null when absent
 * @property {string | null} [readme] README.md content, or null when absent
 * @property {any} [config] parsed base.config.json, or null
 * @property {any[]} [inventory] the root's resources (for the sharing test)
 * @property {boolean} [userConfigHasFramework] does ~/.config/base name the engine?
 * @property {string} attributionLine the line to add (LICENSING.md)
 * @property {string} gitignoreContent what `base init` writes today
 * @property {{ agent: string, process: string } | null} [helpTarget] the help target `base init` declares today
 */

/**
 * @param {UpgradeInput} input
 * @returns {{ plan: Array<{ path: string, action: "create" | "append" | "rewrite", content: string, reason: string }>, notes: string[] }}
 */
export function planUpgrade({
  files = [],
  gitignore = null,
  readme = null,
  config = null,
  inventory = [],
  userConfigHasFramework = false,
  attributionLine,
  gitignoreContent,
  helpTarget = null,
}) {
  const present = new Set(files);
  /** @type {Array<{ path: string, action: "create" | "append" | "rewrite", content: string, reason: string }>} */
  const plan = [];
  /** @type {string[]} */
  const notes = [];

  // 1. The manifest is a build product. An older root tracks it and every machine rewrites it.
  if (gitignore === null) {
    plan.push({
      path: ".gitignore",
      action: /** @type {"create"} */ ("create"),
      content: gitignoreContent,
      reason: "Les données locales BASE (traces, changements, feedback, réglages) et le manifeste, produit de construction, restent hors du dépôt partagé.",
    });
  } else if (!gitignore.split("\n").some((line) => line.trim() === MANIFEST_IGNORE)) {
    plan.push({
      path: ".gitignore",
      action: /** @type {"append"} */ ("append"),
      content: `\n# Produit de construction: régénéré par \`base index\`.\n${MANIFEST_IGNORE}\n`,
      reason: "`base.manifest.json` est régénéré par `base index`: le suivre en version fait diverger chaque machine.",
    });
  }

  // 2. Attribution, where it is owed: a root that declares sharing (FR-DOCTOR-001's rule, same test).
  const shares = inventory.some((resource) => SHARED_SCOPES.has(resource.scope));
  if (shares && readme !== null && !readme.includes(ATTRIBUTION_MARK)) {
    plan.push({
      path: "README.md",
      action: /** @type {"append"} */ ("append"),
      content: `\n${attributionLine}\n`,
      reason: "Ce dossier partage des ressources: les contenus de méthode demandent une ligne d'attribution.",
    });
  }

  // 3. BASE's own config, rewritten from its parsed content. Several reasons can apply at once and a
  // file has ONE content, so they are collected and emitted as a SINGLE rewrite naming each of them.
  const configEntry = planConfig(config, { userConfigHasFramework, helpTarget });
  if (configEntry) plan.push(configEntry);

  // 4. Entry points: which one is useful depends on the tool, and only its owner knows. Upgrade
  // names several or missing entry points, and never adds or deletes one.
  const extra = ENTRY_POINTS.filter((rel) => present.has(rel));
  if (extra.length > 1) {
    notes.push(
      `Ce dossier porte ${extra.length} points d'entrée (${extra.join(", ")}). Un seul point d'entrée est utile par outil. Gardez ceux que votre équipe lit, supprimez les autres si personne ne les lit.`,
    );
  }
  if (extra.length === 0) {
    notes.push("Ce dossier n'a aucun point d'entrée: `base init --tool <votre outil>` propose celui qui manque.");
  }

  return { plan, notes };
}

/**
 * What `base.config.json` should hold that it does not, as one rewrite or nothing.
 *
 * Only an EXISTING parsed JSON config is rewritten. A root whose config is absent from the input is
 * either configless or declares a `base.config.mjs`, and JSON wins over MJS when both are present
 * (`CONFIG_BASENAMES`): creating one here would silently shadow the executable config the author
 * wrote. Such a root is left alone rather than quietly re-configured.
 *
 * @param {any} config @param {{ userConfigHasFramework: boolean, helpTarget: { agent: string, process: string } | null }} options
 * @returns {{ path: string, action: "rewrite", content: string, reason: string } | null}
 */
function planConfig(config, { userConfigHasFramework, helpTarget }) {
  if (!config || typeof config !== "object" || Array.isArray(config)) return null;
  const reasons = [];
  let next = config;

  // A machine-specific path in a shared file, when the user config already answers the question.
  if (userConfigHasFramework && typeof next.framework_dir === "string") {
    const { framework_dir: _dropped, ...rest } = next;
    next = rest;
    reasons.push("`framework_dir` nomme un chemin de votre machine dans un fichier partagé; votre configuration utilisateur le dit déjà au lanceur.");
  }

  // The door out of a dead end (FR-ROUTE-009). A root created before this was declared has no help
  // target at all: a request none of its processes covers ends nowhere. The target is only DECLARED,
  // never copied, and it is resolved at route time in the framework this root belongs to. A root that
  // already names one keeps it: the owner's choice of door is not ours to replace.
  if (helpTarget && !next.routing?.fallback) {
    next = { ...next, routing: { ...next.routing, fallback: { ...helpTarget } } };
    reasons.push("Aucune cible de repli n'est déclarée: une demande que rien ici ne couvre ne mène nulle part, alors que l'accueil du cadre BASE peut la reprendre.");
  }

  if (!reasons.length) return null;
  return {
    path: "base.config.json",
    action: /** @type {"rewrite"} */ ("rewrite"),
    content: `${JSON.stringify(next, null, 2)}\n`,
    reason: reasons.join(" "),
  };
}
