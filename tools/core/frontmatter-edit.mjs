// Targeted, lossless frontmatter editing for mediated writes (used by promoteResource). Distinct
// from core/frontmatter.mjs (which parses/serializes a whole document): this only touches named
// top-level keys and preserves every other line verbatim — nested blocks, comments, body. Pure.

const FRONTMATTER_DELIMITER = "---";

export function formatYamlScalar(value) {
  // Scalars only. Booleans/numbers/null serialize directly; an array becomes a JSON inline list
  // (valid YAML flow sequence) rather than the lossy `String(["a","b"])` → "a,b". Today only
  // promoteResource calls this (with scalars), but the helper is general, so keep it total.
  if (Array.isArray(value)) return `[${value.map((item) => formatYamlScalar(item)).join(", ")}]`;
  if (typeof value === "boolean" || typeof value === "number" || value === null) return String(value);
  if (typeof value !== "string") return JSON.stringify(value);
  if (value === "") return '""';
  if (/[:#[\]{}",]|^\s|\s$/.test(value)) return JSON.stringify(value);
  return value;
}

// Targeted top-level frontmatter edit: update keys in `force`, insert keys in `ensure`
// only if missing. Preserves every other line (nested blocks, comments, body) verbatim.
export function upsertFrontmatterFields(content, force = {}, ensure = {}) {
  const delimiter = FRONTMATTER_DELIMITER;
  if (!content.startsWith(delimiter + "\n")) {
    const block = [
      delimiter,
      ...Object.entries(ensure).map(([k, v]) => `${k}: ${formatYamlScalar(v)}`),
      ...Object.entries(force).map(([k, v]) => `${k}: ${formatYamlScalar(v)}`),
      delimiter,
      "",
    ].join("\n");
    return block + content;
  }

  const lines = content.split("\n");
  const end = lines.findIndex((line, index) => index > 0 && line.trim() === delimiter);
  if (end === -1) return content;

  const present = new Set();
  const updated = lines.slice(1, end).map((line) => {
    const match = line.match(/^([A-Za-z0-9_-]+):(\s*)(.*)$/);
    if (!match) return line;
    present.add(match[1]);
    if (Object.prototype.hasOwnProperty.call(force, match[1])) {
      return `${match[1]}: ${formatYamlScalar(force[match[1]])}`;
    }
    return line;
  });

  for (const [key, value] of Object.entries(ensure)) {
    if (!present.has(key)) updated.push(`${key}: ${formatYamlScalar(value)}`);
  }
  for (const [key, value] of Object.entries(force)) {
    if (!present.has(key)) updated.push(`${key}: ${formatYamlScalar(value)}`);
  }

  return [lines[0], ...updated, ...lines.slice(end)].join("\n");
}
