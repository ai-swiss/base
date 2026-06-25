// tools/core/validators.mjs — the Validator port. Zero dependencies.
//
// A Validator is a PURE, order-independent function `(resource, notification, ctx) => void`.
// It never throws and never mutates the resource; it appends to a Notification — the pattern of
// collecting ALL problems into a result object instead of throwing on the first one.
//
// The core validates ONLY the base.resource.v1 minimum (coreSchemaValidator). Organisations add
// rules (required fields, PII, retention…) via additional validators in base.config — without
// touching the core. The broker runs [coreSchemaValidator, ...config.validators].

import {
  SCHEMA_VERSION,
  SCHEMA_TYPES,
  SCHEMA_SCOPES,
  SCHEMA_STATUSES,
  SCHEMA_SENSITIVITIES,
  EXECUTION_TYPES,
  EXECUTION_RUNTIMES,
  REQUIRE_ACCESS,
} from "./schema.mjs";

export function createNotification() {
  /** @type {{ path: string, code: string, message: string }[]} */
  const errors = [];
  /** @type {{ path: string, code: string, message: string }[]} */
  const warnings = [];
  return {
    errors,
    warnings,
    error(path, code, message) {
      errors.push({ path, code, message });
    },
    warn(path, code, message) {
      warnings.push({ path, code, message });
    },
    get ok() {
      return errors.length === 0;
    },
  };
}

export function runValidators(resource, validators, ctx = {}) {
  const n = createNotification();
  for (const validator of validators) {
    try {
      validator(resource, n, ctx);
    } catch (error) {
      // A misbehaving adapter must never crash validation of the whole project.
      n.error(resource.path, "base.validator.threw", `Validator a échoué: ${String(error?.message ?? error)}`);
    }
  }
  return n;
}

// --- Core validator (the base.resource.v1 minimum) ---------------------------------------------
// Messages are kept identical to the legacy validateResourceMetadata; codes are added alongside.
// Only validates files that opt into the contract (schema_version present) — "progressive metadata".

export function coreSchemaValidator(resource, n) {
  const m = resource.metadata ?? {};
  const p = resource.path;

  if (!m.schema_version) return;
  if (m.schema_version !== SCHEMA_VERSION) {
    n.error(p, "base.schema.unsupported", `schema_version non supportee: ${m.schema_version}.`);
    return;
  }

  for (const field of ["schema_version", "id", "type", "description"]) {
    if (!m[field]) n.error(p, "base.field.required", `Frontmatter ${SCHEMA_VERSION}: champ requis manquant "${field}".`);
  }
  if (m.id && !/^[a-z0-9][a-z0-9-]*$/.test(m.id)) {
    n.error(p, "base.id.invalid", `id invalide "${m.id}". Utiliser lowercase, chiffres et tirets.`);
  }
  if (m.type && !SCHEMA_TYPES.has(m.type)) n.error(p, "base.type.invalid", `type invalide "${m.type}".`);
  if (m.scope && !SCHEMA_SCOPES.has(m.scope)) n.error(p, "base.scope.invalid", `scope invalide "${m.scope}".`);
  if (m.status && !SCHEMA_STATUSES.has(m.status)) n.error(p, "base.status.invalid", `status invalide "${m.status}".`);
  if (m.sensitivity && !SCHEMA_SENSITIVITIES.has(m.sensitivity)) {
    n.error(p, "base.sensitivity.invalid", `sensitivity invalide "${m.sensitivity}".`);
  }
  if (m.keywords && !Array.isArray(m.keywords)) n.error(p, "base.keywords.type", "keywords doit etre une liste.");
  if (m.may_use && !Array.isArray(m.may_use)) n.error(p, "base.may_use.type", "may_use doit etre une liste.");
  if (m.promoted_at && !/^\d{4}-\d{2}-\d{2}$/.test(String(m.promoted_at))) {
    n.error(p, "base.promoted_at.format", "promoted_at doit utiliser le format YYYY-MM-DD.");
  }
  // Aging ontology + egress flag: two lifecycle dates, two validity dates, one boolean.
  for (const field of ["review_by", "valid_from", "valid_until"]) {
    if (m[field] != null && !/^\d{4}-\d{2}-\d{2}$/.test(String(m[field]))) {
      n.error(p, `base.${field}.format`, `${field} doit utiliser le format YYYY-MM-DD.`);
    }
  }
  if (m.valid_from && m.valid_until && String(m.valid_from) > String(m.valid_until)) {
    n.error(p, "base.validity.order", "valid_from doit preceder valid_until.");
  }
  if (m.confidential != null && typeof m.confidential !== "boolean") {
    n.error(p, "base.confidential.type", "confidential doit etre un booleen (pose par un humain, jamais infere).");
  }
  // Egress only checks the boolean `confidential` flag, not the sensitivity taxonomy. A human who
  // classified a resource as confidential/sensitive/restricted likely expects it withheld from a
  // remote model, but only `confidential: true` does that. Warn (never block) on the mismatch.
  if (m.confidential !== true && ["confidential", "sensitive", "restricted"].includes(m.sensitivity)) {
    n.warn(
      p,
      "base.confidential.egress_hint",
      `sensitivity "${m.sensitivity}" ne bloque pas l'envoi vers un modele distant; seul "confidential: true" le fait. Ajoutez "confidential: true" si ce contenu ne doit jamais sortir.`,
    );
  }
  if (!m.title) n.warn(p, "base.title.absent", "Titre YAML absent; le titre Markdown sera utilise.");

  validateSource(m, p, n);
  validateRequires(m, p, n);
  validateExecution(m, p, n);
}

function validateSource(m, p, n) {
  const source = m.source;
  if (!source) return;
  if (typeof source !== "object" || Array.isArray(source)) {
    n.error(p, "base.source.type", "source doit etre un objet.");
    return;
  }
  if (source.connector && typeof source.connector !== "string") n.error(p, "base.source.connector_type", "source.connector doit etre une chaine.");
  if (source.locator && typeof source.locator !== "string") n.error(p, "base.source.locator_type", "source.locator doit etre une chaine.");
}

function validateRequires(m, p, n) {
  // `requires[].access` is an intended use declared by a workflow, not an authorization grant.
  // Enforcement happens later only when a read/write/execute action passes through the broker policy.
  const requires = m.requires;
  if (!requires) return;
  if (!Array.isArray(requires)) {
    n.error(p, "base.requires.type", "requires doit etre une liste.");
    return;
  }
  requires.forEach((req, i) => {
    if (!req || typeof req !== "object" || Array.isArray(req)) {
      n.error(p, "base.requires.item_type", `requires[${i}] doit etre un objet.`);
      return;
    }
    if (!req.ref || typeof req.ref !== "string") n.error(p, "base.requires.ref_required", `requires[${i}].ref est requis.`);
    if (req.access && !REQUIRE_ACCESS.has(req.access)) n.error(p, "base.requires.access_invalid", `requires[${i}].access invalide "${req.access}".`);
  });
}

function validateExecution(m, p, n) {
  const execution = m.execution;
  if (!execution) return;
  if (typeof execution !== "object" || Array.isArray(execution)) {
    n.error(p, "base.execution.type", "execution doit etre un objet.");
    return;
  }
  if (!execution.type) n.error(p, "base.execution.type_required", "execution.type est requis.");
  else if (!EXECUTION_TYPES.has(execution.type)) n.error(p, "base.execution.type_invalid", `execution.type invalide "${execution.type}".`);
  if (execution.runtime && !EXECUTION_RUNTIMES.has(execution.runtime)) n.error(p, "base.execution.runtime_invalid", `execution.runtime invalide "${execution.runtime}".`);
  if (execution.entrypoint && typeof execution.entrypoint !== "string") n.error(p, "base.execution.entrypoint_type", "execution.entrypoint doit etre une chaine.");
  if (execution.dry_run !== undefined && typeof execution.dry_run !== "boolean") n.error(p, "base.execution.dry_run_type", "execution.dry_run doit etre un booleen.");
  if (execution.requires_confirmation !== undefined && typeof execution.requires_confirmation !== "boolean") {
    n.error(p, "base.execution.requires_confirmation_type", "execution.requires_confirmation doit etre un booleen.");
  }
}

// --- Reference adapters (ship these; they demonstrate the extension pattern) --------------------

const field = (resource, name) => resource.metadata?.[name];
const scopeOf = (resource) => resource.metadata?.scope ?? resource.scope ?? "personal";

export function requireFields(fields, { whenScope } = /** @type {{ whenScope?: string }} */ ({})) {
  return (resource, n) => {
    if (whenScope && scopeOf(resource) !== whenScope) return;
    for (const f of fields) {
      const v = field(resource, f);
      if (v === undefined || v === null || v === "") {
        n.error(resource.path, "base.org.field_required", `Champ requis (organisation) manquant: "${f}".`);
      }
    }
  };
}

export function requireSchemaVersion({ whenScope } = /** @type {{ whenScope?: string }} */ ({})) {
  return (resource, n) => {
    if (whenScope && scopeOf(resource) !== whenScope) return;
    if (!field(resource, "schema_version")) n.error(resource.path, "base.schema.required", "schema_version requis pour cette ressource.");
  };
}

export function forbidSensitivity(level, { unless } = /** @type {{ unless?: any }} */ ({})) {
  return (resource, n) => {
    if ((resource.sensitivity ?? field(resource, "sensitivity")) !== level) return;
    if (typeof unless === "function" && unless(resource)) return;
    n.error(resource.path, "base.org.sensitivity_forbidden", `sensitivity "${level}" interdite par la configuration.`);
  };
}

export function hasField(name) {
  return (resource) => field(resource, name) !== undefined && field(resource, name) !== null && field(resource, name) !== "";
}

export function piiScanner({ patterns = [], severity = "warning" } = {}) {
  // A single validator instance is reused across every resource, so a pattern carrying the `g`/`y`
  // flag would retain `lastIndex` between calls and silently skip resources. Normalize each pattern
  // to a stateless form once, at construction, so `.test()` is position-independent.
  const stateless = patterns.map((re) =>
    re instanceof RegExp && (re.global || re.sticky)
      ? new RegExp(re.source, re.flags.replace(/[gy]/g, ""))
      : re,
  );
  return (resource, n) => {
    const content = resource.content ?? "";
    for (const re of stateless) {
      if (re.test(content)) {
        const msg = "Donnée potentiellement sensible (PII) détectée.";
        if (severity === "error") n.error(resource.path, "base.pii.detected", msg);
        else n.warn(resource.path, "base.pii.detected", msg);
        return;
      }
    }
  };
}

// Routability advisory: helps the Router by WARNING (never blocking) on weak routing signals.
// Opt-in via base.config (`{ "type": "routability" }`) so the core stays minimal; the recommended
// team/org config enables it. Only inspects routable resources (agents, processes).
export function routabilityWarnings({ whenScope } = /** @type {{ whenScope?: string }} */ ({})) {
  const isShared = (scope) => scope === "team" || scope === "org" || scope === "public";
  return (resource, n) => {
    if (resource.type !== "agent" && resource.type !== "process") return;
    const scope = resource.metadata?.scope ?? resource.scope ?? "personal";
    if (whenScope && scope !== whenScope) return;
    if (!resource.description) {
      n.warn(resource.path, "base.route.no_description", `${resource.type} sans description: routage peu fiable.`);
    }
    const useWhen = resource.use_when ?? resource.metadata?.use_when;
    if (resource.type === "process" && isShared(scope) && !(typeof useWhen === "string" && useWhen.trim())) {
      n.warn(resource.path, "base.route.no_use_when", "process partagé sans use_when: précisez quand l'utiliser.");
    }
  };
}
