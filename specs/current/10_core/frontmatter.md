# 10 · FrontmatterParser (PARSE)

> **For developers and maintainers.** Port `FrontmatterParser`. Implements FR-PARSE-001..003, AD-PARSE-001, NFR-PARSE-001.
>
> Owns: FR-PARSE-*, NFR-PARSE-*, AD-PARSE-*
> **Decision (maintainer):** zero-dependency **strict subset** parser, *not* a YAML library.

## Why a strict subset, not full YAML
BASE frontmatter is a **constrained metadata header**, not arbitrary YAML. A documented, strict subset that **rejects** everything outside it is more defensible than embedding a full YAML engine, provided the grammar is documented, failures are explicit, and tests are serious. This preserves the zero-dependency core (NFR-CORE-001).

## Interface
```js
// tools/core/frontmatter.mjs   (imports node:* only)
export function parseFrontmatter(content) {
  // → { data: object, body: string, raw: string, errors: Array<{line, code, message}> }
}
```
- If `content` does not start with `---\n`, return `{ data:{}, raw:"", body:content, errors:[] }` (no frontmatter is valid). A `\r` before any newline is tolerated: a CRLF document (Windows checkout, editor default) parses **identically** to its LF twin — never silently demoting the frontmatter to body (NFR-CORE-004).
- The broker treats `errors` as validation errors (today via `frontmatter_errors`).

## Supported grammar (the contract)
```
document     := "---" NEWLINE mapping "---" NEWLINE?
NEWLINE      := "\r"? "\n"                            # CRLF ≡ LF (tokens are trimmed)
mapping      := ( entry )*
entry        := INDENT key ":" ( SP inline_value? NEWLINE | NEWLINE nested )
key          := /[A-Za-z0-9_-]+/                      # simple keys only
nested       := ( INDENT(>parent) entry )+            # block map
              | ( INDENT(>parent) seq_item )+         # block sequence
seq_item     := "-" SP ( inline_value NEWLINE
                       | inline_map_entry ( NEWLINE INDENT(>item) entry )*  )  # list of maps
inline_value := scalar | flow_array
flow_array   := "[" ( scalar ( "," scalar )* )? "]"
scalar       := dquoted | squoted | bareword
dquoted      := '"' ( '\\"' | not('"') )* '"'         # handles : , # inside
squoted      := "'" ( "''" | not("'") )* "'"
bareword     := run of chars up to comment/EOL
```

### Scalar typing (bareword)
`null` → `null` · `true`/`false` → boolean · `/^-?\d+(\.\d+)?$/` → number · otherwise → string. Quoted scalars are always strings, unescaped.

### Empty value (FR-PARSE-003)
`key:` with no inline value **and** no deeper-indented block → `null` (never `{}`).

### Comments
A line whose first non-space char is `#` → ignored. A trailing ` #…` → truncated **only when outside quotes**.

### Indentation
Spaces only. Indentation defines nesting; a child must be strictly more indented than its parent. Tabs in indentation are an error.

## Rejected constructs — fail loudly (NFR-CORE-004)
Each emits a stable code (registry: `core/codes.mjs`) and the offending **line**:

| Construct | Code |
|---|---|
| Tab in indentation | `base.yaml.tab_indent` |
| Block scalar `\|` or `>` | `base.yaml.block_scalar_unsupported` |
| Flow mapping `{a: b}` | `base.yaml.flow_map_unsupported` (the message names the fix: quote the value) |
| Anchor/alias `&a`/`*a`, tag `!!type` | `base.yaml.anchor_or_tag_unsupported` |
| Unterminated quote | `base.yaml.unterminated_quote` |
| Duplicate key at same level | `base.yaml.duplicate_key` |
| Dangerous JavaScript object key (`__proto__`, `prototype`, `constructor`) | `base.yaml.dangerous_key` |
| Inconsistent indentation | `base.yaml.bad_indent` |
| Unparsable line | `base.yaml.unparsable_line` |

**Template placeholder, not a flow mapping.** A value whose braces enclose it entirely and hold
no colon and no `#` (`handle: {dataset-handle}`, `date: {YYYY-MM-DD}`, `who: {a | b}`) is read as the
text it is: it is the marker BASE's own templates use for «fill this in», and no mapping is
intended. `{a: b}` stays rejected. Reading side only: the serializer quotes any value starting
with `{`, so the round trip is unchanged and the emitted form stays strict-YAML valid.

**Golden rule:** on error, **do not insert a guessed value**: record the error and omit the key. Downstream validation then fails cleanly (NFR-CORE-004).

### Editions and originals: `lang`, `translation_of`, `cite_as`, `source.*`
Four fields the reader consumes without any grammar extension, all scalars or a nested block mapping
(FR-CORE-013). `lang` is two lower-case letters, and when it is absent the file-name suffix
`<slug>.<lang>.md` answers instead, so a translation need not repeat itself. `translation_of` names the
canonical resource's id, one direction only: the canonical declares nothing, and the family is found
from either end. `cite_as` is the citation string a passage travels with. Inside `source`, `pages` is a
flow sequence of integers, `image` one root-relative path, and `page_images` a template:

```yaml
lang: de
translation_of: guide-assess
cite_as: "Guide (2026), p. 4"
source:
  pages: [4, 5]
  page_images: originals/page-{page:03}.png
```

`{page}` and `{page:03}` are markers inside a path, and the flow-mapping rejection above applies only
to a value that **starts** with `{`, so an embedded template is read as the bareword it is and needs no
quoting. A `page_images` value beginning with a brace would be quoted like any other.

### `superseded_anchors` — a block mapping the simple-key rule already covers
A section is cited as `id#anchor` (FR-CORE-012), and the anchor derives from the heading, so rewording
a heading breaks every citation already written down. A card records where each old name went:

```yaml
superseded_anchors:
  risk-assessment: assessing-risk
```

This needs no grammar extension. Derived anchors are `[a-z0-9-]+` (lowercased, accents folded,
punctuation dropped), which sits inside the simple-key set `[A-Za-z0-9_-]+`, so any anchor this engine
derives can be written as a key, and the value is an ordinary bareword scalar. The entry must name an
anchor the document still has: one whose target has gone reads as not found, and the reader is told
which anchors exist. The field is declared in `base.schema.json`; `findSection` (`core/sections.mjs`)
is its only reader.

## Serializer — the parser's inverse
`serializeFrontmatter(data) → string` and `composeMarkdown(data, body) → string` emit the **same strict subset** the parser accepts, so that `parseFrontmatter(composeMarkdown(data, body))` returns `{ data, body }` unchanged for any **representable** `data`. (Used by editing surfaces that write metadata back to a file, via propose→commit.)

- **Representable** = exactly what the parser can *produce*: simple keys (`[A-Za-z0-9_-]+`), scalars (string/number/boolean/null), nested block mappings, block/flow sequences of scalars, and sequences of **flat** (scalar-only) maps.
- **Fail loud, never silently lossy** (the parser's own discipline): a `FrontmatterSerializeError` (carrying a `.path`) is thrown for anything the parser could not round-trip, namely multi-line strings; a `null` element inside a sequence; an empty `{}` value (it would parse back as `null`); nesting beyond one scalar level inside a list item; non-finite or non-decimal numbers; a key outside the simple-key set.
- **Two parser-specific subtleties the serializer must honour** (both are covered by property + corpus tests):
  - Quoting is a **literal wrap** `"` + s + `"`. The parser unquotes with `slice(1,-1)` and does **no** escape processing, so JSON-escaping would *not* round-trip. A string is emitted bareword only when `parseScalar(bareword) === bareword` **and** it is a valid unquoted scalar for a strict YAML reader: a value carrying `": "` (colon + space) or a trailing `":"` is quoted, so emitted frontmatter parses under strict readers (GitHub, Jekyll, Astro), not only under BASE's tolerant reader. Postel's law (tolerant in, conservative out); the authoring-time gate is `check-frontmatter-yaml`.
  - In **sequence** position the `- key: value` map shape is checked first, so a scalar string that looks like `simpleKey:` (e.g. `"a: colon"`) is force-quoted to stay scalar. Flow sequences drop `null`/empty-string items, so arrays containing those use block form (and `null` items are rejected outright).

## Test strategy (acceptance)
- **Golden positive:** every real frontmatter in `exemples/`, `createur-agent`, `_template` round-trips with `errors == []`.
- **Golden negative:** one fixture per code above asserts the exact `code`.
- **Property:** a generator of valid-subset docs → invariants: (1) never throws, (2) `errors == []`, (3) parse→serialize→parse is stable.
- **Fuzz:** random bytes + mutated near-valid docs → **never throws**; always returns `{data, errors}` (problems surface in `errors`, not as crashes).
- **System:** `node tools/base.mjs validate --root .` stays green on every framework resource and on each example in isolation. If the parser rejects something an example uses, **fix the example or extend the documented grammar**, never silently widen behaviour.
