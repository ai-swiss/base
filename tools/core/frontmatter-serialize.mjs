// tools/core/frontmatter-serialize.mjs — the EMITTER half of the frontmatter port, split out of
// frontmatter.mjs when that file passed the small-module cap. Reader and writer are two contracts
// that meet at one law (round-trip), and each is read on its own: a maintainer chasing a parse
// rejection never opens this file, and a maintainer chasing a quoting rule never opens the parser.
// `frontmatter.mjs` re-exports everything here, so every caller keeps its single import.
//
// EMITTER strict-YAML validity (decided 2026-07-16): the serializer quotes a scalar carrying ": "
// (colon + space) or a trailing ":", so its output parses under a strict YAML reader (GitHub,
// Jekyll, Astro), not only under BASE's tolerant reader. Postel's law: tolerant in, conservative
// out. The round-trip contract is unchanged (a quoted value round-trips); the authoring-time gate
// is check-frontmatter-yaml. Grammar: specs/current/10_core/frontmatter.md.

// ---------------------------------------------------------------------------
// Serializer — the inverse of parseFrontmatter. It emits the SAME strict subset
// the parser accepts, so that `parseFrontmatter(composeMarkdown(data, body))`
// yields back `data` (deep-equal) and `body` for any *representable* data.
//
// "Representable" = exactly what the parser can PRODUCE: simple keys
// (`[A-Za-z0-9_-]+`), scalars (string/number/boolean/null), nested block
// mappings, block/flow sequences of scalars, and sequences of flat
// (scalar-only) maps. Anything the parser cannot round-trip — multi-line
// strings, a `null` element inside a sequence, an empty `{}` value (it would
// parse back as `null`), nesting beyond one scalar level inside a list item,
// non-finite or non-decimal numbers, or a key outside the simple-key set —
// throws `FrontmatterSerializeError`. We fail loudly rather than emit something
// that would silently not round-trip (the same discipline as the parser).
// ---------------------------------------------------------------------------

export class FrontmatterSerializeError extends Error {
  constructor(message, path) {
    super(path ? `${message} (at ${path})` : message);
    this.name = "FrontmatterSerializeError";
    this.path = path ?? null;
  }
}

const SIMPLE_KEY = /^[A-Za-z0-9_-]+$/;
const INDENT_STEP = "  ";

// True iff `parseScalar(s) === s` — i.e. `s` can be written as a bareword unchanged.
function isBarewordSafe(s) {
  if (s.length === 0) return false; // "" parses to null
  if (s !== s.trim()) return false; // surrounding whitespace is trimmed away
  if (/[\n\r]/.test(s)) return false; // values are single-line
  if (s === "null" || s === "true" || s === "false") return false; // keyword coercion
  if (/^-?\d+(\.\d+)?$/.test(s)) return false; // numeric coercion
  if (/\s#/.test(s)) return false; // " #" triggers inline-comment stripping
  // Leading chars the parser special-cases (quote / flow array / flow map / anchor / tag / block / comment).
  if ("\"'[{&*!|>#".includes(s[0])) return false;
  return true;
}

function serializeString(s, path) {
  if (/[\n\r]/.test(s)) throw new FrontmatterSerializeError("multi-line strings are not representable", path);
  // Bareword only if it round-trips (isBarewordSafe) AND is a valid unquoted STRICT-YAML scalar: a
  // value with ": " (colon+space) or a trailing ":" is quoted, so GitHub/Jekyll/Astro accept it too
  // (they read the 2nd ": " as a nested mapping). Emission-only; reader stays tolerant. (See PARSER POLICY.)
  if (isBarewordSafe(s) && !/:(\s|$)/.test(s)) return s;
  // Literal double-quote wrap. The parser unquotes with `slice(1, -1)` and does NO escape
  // processing, so `"` + s + `"` round-trips ANY single-line string, including one that contains
  // quotes. (Do NOT JSON-escape: the parser would not unescape it.)
  return `"${s}"`;
}

function isScalar(v) {
  // A value the parser reads back unchanged as a scalar. `null` is excluded: it is unrepresentable
  // inside a sequence, and as a mapping value it is emitted as an empty `key:` by the caller.
  return typeof v === "string" || typeof v === "number" || typeof v === "boolean";
}

function serializeScalar(value, path) {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new FrontmatterSerializeError("non-finite numbers are not representable", path);
    const s = String(value);
    if (!/^-?\d+(\.\d+)?$/.test(s)) {
      throw new FrontmatterSerializeError(`number ${s} is not representable in the strict subset`, path);
    }
    return s;
  }
  if (typeof value === "string") return serializeString(value, path);
  throw new FrontmatterSerializeError(`unsupported scalar of type ${value === null ? "null" : typeof value}`, path);
}

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

// A flow-array item must be a scalar whose token carries no comma or bracket (the parser splits a
// flow list on commas and detects arrays by brackets) and is non-empty. Returns the token or null.
function flowToken(v, path) {
  if (!isScalar(v)) return null;
  if (v === "") return null; // flow arrays drop empty-string items on parse → force block (`- ""`)
  const tok = serializeScalar(v, path);
  if (tok.includes(",") || tok.includes("[") || tok.includes("]")) return null;
  return tok;
}

// A scalar in SEQUENCE position has a stricter rule than in a mapping value: the parser checks the
// `- key: value` map shape first, so a bareword string that looks like `simpleKey:` (e.g. "a: colon")
// would be mis-read as a one-field map. Force-quote those to keep them scalar. (In a mapping value
// position this is unnecessary — the value is everything after the first colon — so serializeScalar
// stays simple there.)
function serializeSeqScalar(v, path) {
  if (typeof v === "string" && isBarewordSafe(v) && /^[A-Za-z0-9_-]+:/.test(v)) {
    return `"${v}"`;
  }
  return serializeScalar(v, path);
}

function serializeSeqItem(v, indent, path) {
  if (isScalar(v)) return [`${indent}- ${serializeSeqScalar(v, path)}`];
  if (Array.isArray(v)) {
    if (v.length === 0) return [`${indent}- []`];
    const tokens = v.map((x, i) => flowToken(x, `${path}[${i}]`));
    if (tokens.every((t) => t !== null && !t.includes(" "))) return [`${indent}- [${tokens.join(", ")}]`];
    throw new FrontmatterSerializeError("nested array is not representable inside a sequence", path);
  }
  if (isPlainObject(v)) {
    // A sequence item that is a map: scalar fields only, at least one. The first field rides the
    // `- ` line; the rest align under it (indent + 2 spaces, the column just after "- ").
    const keys = Object.keys(v);
    if (keys.length === 0) throw new FrontmatterSerializeError("empty object is not representable in a sequence", path);
    const fieldIndent = indent + INDENT_STEP;
    return keys.map((k, i) => {
      if (!SIMPLE_KEY.test(k)) throw new FrontmatterSerializeError(`key "${k}" is not a simple key [A-Za-z0-9_-]`, `${path}.${k}`);
      if (!isScalar(v[k])) {
        throw new FrontmatterSerializeError("sequence-item fields must be scalar (no nesting inside a list item)", `${path}.${k}`);
      }
      const rendered = `${k}: ${serializeScalar(v[k], `${path}.${k}`)}`;
      return i === 0 ? `${indent}- ${rendered}` : `${fieldIndent}${rendered}`;
    });
  }
  throw new FrontmatterSerializeError("unsupported sequence item", path);
}

function serializeArray(key, arr, indent, path) {
  // Empty array → flow `[]` (a block sequence cannot express "empty").
  if (arr.length === 0) return [`${indent}${key}: []`];
  arr.forEach((v, i) => {
    if (v === null) throw new FrontmatterSerializeError("null array items are not representable", `${path}[${i}]`);
  });
  // Prefer flow for compact, space-free scalar tokens (house style for e.g. keywords); else block.
  const tokens = arr.map((v, i) => flowToken(v, `${path}[${i}]`));
  if (tokens.every((tok) => tok !== null && !tok.includes(" "))) {
    return [`${indent}${key}: [${tokens.join(", ")}]`];
  }
  const itemIndent = indent + INDENT_STEP;
  const lines = [`${indent}${key}:`];
  arr.forEach((v, i) => lines.push(...serializeSeqItem(v, itemIndent, `${path}[${i}]`)));
  return lines;
}

function serializeMapping(obj, indent, path) {
  const lines = [];
  for (const key of Object.keys(obj)) {
    if (!SIMPLE_KEY.test(key)) {
      throw new FrontmatterSerializeError(`key "${key}" is not a simple key [A-Za-z0-9_-]`, path ? `${path}.${key}` : key);
    }
    const value = obj[key];
    const childPath = path ? `${path}.${key}` : key;
    if (value === null) {
      lines.push(`${indent}${key}:`); // empty value → parses back to null
    } else if (Array.isArray(value)) {
      lines.push(...serializeArray(key, value, indent, childPath));
    } else if (isPlainObject(value)) {
      if (Object.keys(value).length === 0) {
        throw new FrontmatterSerializeError("empty object value is not representable (it would parse back as null)", childPath);
      }
      lines.push(`${indent}${key}:`);
      lines.push(...serializeMapping(value, indent + INDENT_STEP, childPath));
    } else if (isScalar(value)) {
      lines.push(`${indent}${key}: ${serializeScalar(value, childPath)}`);
    } else {
      throw new FrontmatterSerializeError(`unsupported value of type ${typeof value}`, childPath);
    }
  }
  return lines;
}

// Serialize a frontmatter data object to the inner YAML text (no `---` fences, no trailing newline).
export function serializeFrontmatter(data) {
  if (!isPlainObject(data)) throw new FrontmatterSerializeError("frontmatter data must be a plain object (mapping)");
  return serializeMapping(data, "", "").join("\n");
}

// Compose a full Markdown document: the inverse of parseFrontmatter at the document level.
// With no keys, emit no frontmatter block (the parser treats a document without a leading `---`
// as `{ data: {}, body: content }`), so the empty case round-trips too.
export function composeMarkdown(data, body = "") {
  if (!isPlainObject(data) || Object.keys(data).length === 0) return body;
  return `---\n${serializeFrontmatter(data)}\n---\n${body}`;
}
