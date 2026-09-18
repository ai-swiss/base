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
// The EMITTER is the other half of this port and lives in ./frontmatter-serialize.mjs (re-exported
// at the bottom of this file). It is conservative where this reader is tolerant, Postel's law, and
// its own header carries that contract.
//
// Returns { data, body, raw, errors }. errors = [{ line, code, message }] (frontmatter-relative line).

import { CODES } from "./codes.mjs";

const FRONTMATTER_DELIMITER = "---";
const DANGEROUS_KEYS = new Set(["__proto__", "prototype", "constructor"]);

function makeError(line, code, detail) {
  return { line, code, message: `${detail ?? CODES[code] ?? code} (ligne ${line})` };
}

// `{handle}`, `{YYYY-MM-DD}`, `{lab-manager | grants}`: one brace pair enclosing the whole value,
// with no colon (which would make it flow-map shaped) and no `#` (which the scalar reader strips as
// an inline comment, and would unbalance the braces). This is the marker BASE's own templates use
// for "fill this in"; every other `{…}` stays rejected.
function isTemplatePlaceholder(value) {
  return /^\{[^{}:#]*\}$/.test(value);
}

export function parseFrontmatter(content) {
  // A trailing "\r" is tolerated on the opening fence: the rest of the parser is CR-safe (every
  // token passes through trim(), the closing fence too), so this check was the single place a CRLF
  // file (Windows checkout with core.autocrlf, Notepad) could silently demote its whole
  // frontmatter to body — the exact silent mis-parse NFR-CORE-004 forbids.
  if (!/^---\r?\n/.test(content)) {
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
    if (t[0] === "{") {
      // A template placeholder is not a flow mapping. `handle: {dataset-handle}` in a template
      // means "fill this in": the braces are the author's marker, and no mapping is intended.
      // Accepted as the text it is when the braces enclose the whole value and hold no colon;
      // `{a: b}` is genuinely flow-map shaped and stays rejected, with a message that names the
      // fix. Reading side only (PARSER POLICY): the serializer quotes any value starting with
      // `{`, so the round trip is unchanged and the emitted form stays strict-YAML valid.
      if (isTemplatePlaceholder(t)) return null;
      return makeError(lineNo, "base.yaml.flow_map_unsupported", `${CODES["base.yaml.flow_map_unsupported"]} Pour un marqueur de gabarit, mettez la valeur entre guillemets: "${t}".`);
    }
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
// The EMITTER lives in ./frontmatter-serialize.mjs (parser and serializer are
// two contracts meeting at one law: parseFrontmatter(composeMarkdown(d, b)) === {d, b}).
// It is re-exported here so this module stays the single import for the port.
// ---------------------------------------------------------------------------
export { FrontmatterSerializeError, serializeFrontmatter, composeMarkdown } from "./frontmatter-serialize.mjs";
