// tools/core/codes.mjs — stable error-code registry. Zero dependencies.
// Codes are programmatic identifiers, decoupled from human messages (French by default),
// so CI and third-party adapters react to a stable `code`, not to a translated string.

export const CODES = {
  // config
  "base.config.invalid": "Configuration base.config invalide.",

  // frontmatter strict subset
  "base.yaml.tab_indent": "Indentation par tabulation non supportée.",
  "base.yaml.block_scalar_unsupported": "Bloc scalaire (| ou >) non supporté dans le frontmatter.",
  "base.yaml.flow_map_unsupported": "Notation inline { } non supportée.",
  "base.yaml.anchor_or_tag_unsupported": "Ancre, alias ou tag YAML non supporté.",
  "base.yaml.unterminated_quote": "Guillemet non fermé.",
  "base.yaml.duplicate_key": "Clé dupliquée au même niveau.",
  "base.yaml.dangerous_key": "Clé dangereuse non supportée.",
  "base.yaml.bad_indent": "Indentation incohérente.",
  "base.yaml.unparsable_line": "Ligne non analysable.",
  "base.yaml.unterminated_frontmatter": "Frontmatter ouvert mais non fermé.",
  "base.yaml.not_a_mapping": "Le frontmatter doit être un objet (clés: valeurs).",

  // resource schema
  "base.id.invalid": "id invalide. Utiliser lowercase, chiffres et tirets.",
  "base.id.duplicate": "id dupliqué.",
  "base.field.required": "Champ requis manquant.",
  "base.type.invalid": "type invalide.",
  "base.scope.invalid": "scope invalide.",
  "base.status.invalid": "status invalide.",
  "base.sensitivity.invalid": "sensitivity invalide.",
  "base.link.missing": "Lien relatif introuvable.",
  "base.execution.entrypoint_missing": "Entrypoint d'outil introuvable.",
  "base.routing.fallback_unresolved": "La cible routing.fallback est introuvable dans l'inventaire.",
};

export function codeMessage(code, fallback = "") {
  return CODES[code] ?? fallback ?? code;
}

// Third-party adapters may register their own stable codes (does not overwrite core codes).
export function registerCodes(extra) {
  for (const [code, message] of Object.entries(extra ?? {})) {
    if (!(code in CODES)) CODES[code] = message;
  }
}
