// tools/core/frontmatter.mjs — strict-subset frontmatter parser (FrontmatterParser port default).
// Zero dependencies. The BASE frontmatter is a CONSTRAINED metadata header, not arbitrary YAML:
// this parser accepts a documented subset and REJECTS everything else **loudly** (with a stable
// error code + line), never silently mis-parsing (NFR-CORE-004). Grammar: specs/.../frontmatter.md.
//
// PARSER POLICY (tolerant reader vs strict validator). "Reject loudly" applies to UNSUPPORTED
// STRUCTURE — an unknown construct, a dangerous key, a delimiter mismatch. It is deliberately NOT a
// content/lint pass: within a supported shape the reader is tolerant of benign lexical slop (e.g. an
// empty element or trailing comma in a flow array is dropped, not errored — see parseScalar). Hard
// strictness about VALUES belongs to a separate layer (a validator, or a future `--strict` reader
// mode), so the round-trip serializer contract and the fuzz corpus stay stable. Do not move value
// strictness into this file without first deciding that policy explicitly. (Audit 2026-06-09.)
//
// Returns { data, body, raw, errors }. errors = [{ line, code, message }] (frontmatter-relative line).

import { CODES } from "./codes.mjs";

const FRONTMATTER_DELIMITER = "---";
const DANGEROUS_KEYS = new Set(["__proto__", "prototype", "constructor"]);

function makeError(line, code, detail) {
  return { line, code, message: `${detail ?? CODES[code] ?? code} (ligne ${line})` };
}

export function parseFrontmatter(content) {
  if (!content.startsWith(FRONTMATTER_DELIMITER + "\n")) {
    return { data: {}, raw: "", body: content, errors: [] };
  }

  const allLines = content.split("\n");
  const end = allLines.findIndex((line, index) => index > 0 && line.trim() === FRONTMATTER_DELIMITER);
  if (end === -1) {
    return {
      data: {},
      raw: allLines.slice(1).join("\n"),
      body: content,
      errors: [makeError(1, "base.yaml.unterminated_frontmatter")],
    };
  }

  const rawLines = allLines.slice(1, end);
  const { data, errors } = parseStrictSubset(rawLines);

  return {
    data,
    raw: rawLines.join("\n"),
    body: allLines.slice(end + 1).join("\n"),
    errors,
  };
}

function parseStrictSubset(rawLines) {
  const data = {};
  const errors = [];

  // Reject tab indentation up front (YAML forbids it; a classic silent-bug source).
  rawLines.forEach((text, i) => {
    if (/^[ \t]*\t/.test(text.match(/^[ \t]*/)[0])) {
      errors.push(makeError(i + 1, "base.yaml.tab_indent"));
    }
  });

  const lines = rawLines
    .map((text, index) => ({
      text,
      index,
      indent: text.match(/^ */)[0].length,
      trimmed: text.trim(),
    }))
    .filter((line) => line.trimmed !== "" && !line.trimmed.startsWith("#"));

  // Flag any value token outside the supported subset (block scalar, flow map, anchor/alias/tag,
  // unterminated quote). Recorded as an error; the key is then skipped (no guessed value).
  function rejectedValue(rawValue, lineNo) {
    const t = String(rawValue).trim();
    if (t === "") return null;
    if (t[0] === "|" || t[0] === ">") return makeError(lineNo, "base.yaml.block_scalar_unsupported");
    if (t[0] === "{") return makeError(lineNo, "base.yaml.flow_map_unsupported");
    if (t[0] === "&" || t[0] === "*" || t[0] === "!") return makeError(lineNo, "base.yaml.anchor_or_tag_unsupported");
    if (t[0] === '"' && !(t.length > 1 && t.endsWith('"'))) return makeError(lineNo, "base.yaml.unterminated_quote");
    if (t[0] === "'" && !(t.length > 1 && t.endsWith("'"))) return makeError(lineNo, "base.yaml.unterminated_quote");
    return null;
  }

  function assignScalar(object, key, rawValue, lineNo) {
    if (DANGEROUS_KEYS.has(key)) {
      errors.push(makeError(lineNo, "base.yaml.dangerous_key"));
      return;
    }
    const rejected = rejectedValue(rawValue, lineNo);
    if (rejected) {
      errors.push(rejected);
      return;
    }
    object[key] = parseScalar(rawValue);
  }

  function parseBlock(start, indent) {
    const first = lines[start];
    if (!first) return { value: {}, next: start };
    if (first.indent < indent) return { value: {}, next: start };

    if (first.indent === indent && first.trimmed.startsWith("- ")) {
      return parseList(start, indent);
    }

    const object = {};
    let cursor = start;
    while (cursor < lines.length) {
      const line = lines[cursor];
      if (line.indent < indent) break;
      if (line.indent > indent) {
        errors.push(makeError(line.index + 1, "base.yaml.bad_indent"));
        cursor++;
        continue;
      }
      if (line.trimmed.startsWith("- ")) break;

      const match = line.trimmed.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (!match) {
        errors.push(makeError(line.index + 1, "base.yaml.unparsable_line"));
        cursor++;
        continue;
      }

      const [, key, rawValue] = match;
      if (DANGEROUS_KEYS.has(key)) {
        errors.push(makeError(line.index + 1, "base.yaml.dangerous_key"));
        cursor++;
        continue;
      }
      if (Object.hasOwn(object, key)) errors.push(makeError(line.index + 1, "base.yaml.duplicate_key"));

      if (rawValue === "") {
        const nextLine = lines[cursor + 1];
        if (nextLine && nextLine.indent > indent) {
          const parsed = parseBlock(cursor + 1, nextLine.indent);
          object[key] = parsed.value;
          cursor = parsed.next;
        } else {
          object[key] = null;
          cursor++;
        }
      } else {
        assignScalar(object, key, rawValue, line.index + 1);
        cursor++;
      }
    }
    return { value: object, next: cursor };
  }

  function parseList(start, indent) {
    const list = [];
    let cursor = start;
    while (cursor < lines.length) {
      const line = lines[cursor];
      if (line.indent < indent) break;
      if (line.indent > indent) {
        errors.push(makeError(line.index + 1, "base.yaml.bad_indent"));
        cursor++;
        continue;
      }
      if (!line.trimmed.startsWith("- ")) break;

      const itemRaw = line.trimmed.slice(2).trim();
      if (itemRaw === "") {
        const nextLine = lines[cursor + 1];
        if (nextLine && nextLine.indent > indent) {
          const parsed = parseBlock(cursor + 1, nextLine.indent);
          list.push(parsed.value);
          cursor = parsed.next;
        } else {
          list.push(null);
          cursor++;
        }
        continue;
      }

      const objectItem = itemRaw.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (objectItem) {
        const item = {};
        if (DANGEROUS_KEYS.has(objectItem[1])) {
          errors.push(makeError(line.index + 1, "base.yaml.dangerous_key"));
          cursor++;
          list.push(item);
          continue;
        }
        assignScalar(item, objectItem[1], objectItem[2], line.index + 1);
        cursor++;
        while (cursor < lines.length && lines[cursor].indent > indent) {
          const nestedLine = lines[cursor];
          const nested = nestedLine.trimmed.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
          if (!nested) {
            errors.push(makeError(nestedLine.index + 1, "base.yaml.unparsable_line"));
            cursor++;
            continue;
          }
          if (DANGEROUS_KEYS.has(nested[1])) {
            errors.push(makeError(nestedLine.index + 1, "base.yaml.dangerous_key"));
            cursor++;
            continue;
          }
          if (Object.hasOwn(item, nested[1])) errors.push(makeError(nestedLine.index + 1, "base.yaml.duplicate_key"));
          assignScalar(item, nested[1], nested[2], nestedLine.index + 1);
          cursor++;
        }
        list.push(item);
        continue;
      }

      const rejected = rejectedValue(itemRaw, line.index + 1);
      if (rejected) errors.push(rejected);
      else list.push(parseScalar(itemRaw));
      cursor++;
    }
    return { value: list, next: cursor };
  }

  const parsed = parseBlock(0, 0);
  if (parsed.value && typeof parsed.value === "object" && !Array.isArray(parsed.value)) {
    for (const [key, value] of Object.entries(parsed.value)) data[key] = value;
  } else {
    errors.push(makeError(1, "base.yaml.not_a_mapping"));
  }
  return { data, errors };
}

export function parseScalar(value) {
  let trimmed = value.trim();
  if (trimmed === "") return null;

  // Strip a trailing inline comment for unquoted, non-array scalars only (outside quotes/arrays).
  if (!/^["'[]/.test(trimmed)) {
    const hash = trimmed.search(/\s#/);
    if (hash >= 0) trimmed = trimmed.slice(0, hash).trim();
    if (trimmed === "") return null;
  }

  if (trimmed === "null") return null;
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    // Tolerant reader (see PARSER POLICY at the top): empty elements / trailing commas are dropped,
    // not errored. `[a, b,]` → ["a","b"]. Rejecting these belongs to a validator or --strict mode.
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => parseScalar(item.trim()))
      .filter((item) => item !== null && item !== "");
  }
  return trimmed;
}

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
  if (isBarewordSafe(s)) return s;
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
