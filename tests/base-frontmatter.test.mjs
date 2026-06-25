// Spec coverage: FR-PARSE-001 FR-PARSE-002 FR-PARSE-003 NFR-PARSE-001
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import fc from "fast-check";
import { parseFrontmatter, parseScalar } from "../tools/core/frontmatter.mjs";

const wrap = (body) => `---\n${body}\n---\nbody text\n`;
const codesOf = (result) => result.errors.map((e) => e.code);

describe("frontmatter — golden positive (corpus shapes)", () => {
  it("parses scalars, quoted values with colons, booleans, inline arrays, nested maps and list-of-maps", () => {
    const r = parseFrontmatter(wrap(
      [
        "schema_version: base.resource.v1",
        "id: my-id",
        "type: process",
        'description: "A description: with a colon, and a comma."',
        "user-invocable: false",
        "keywords: [vente, client]",
        "execution:",
        "  type: script",
        "  runtime: python",
        "  requires_confirmation: true",
        "requires:",
        "  - ref: catalogue",
        "    access: read",
      ].join("\n"),
    ));

    assert.deepEqual(r.errors, []);
    assert.equal(r.data.id, "my-id");
    assert.equal(r.data.type, "process");
    assert.equal(r.data.description, "A description: with a colon, and a comma.");
    assert.equal(r.data["user-invocable"], false);
    assert.deepEqual(r.data.keywords, ["vente", "client"]);
    assert.equal(r.data.execution.runtime, "python");
    assert.equal(r.data.execution.requires_confirmation, true);
    assert.equal(r.data.requires[0].ref, "catalogue");
    assert.equal(r.data.requires[0].access, "read");
    assert.equal(r.body.trim(), "body text");
  });

  it("treats a key with no value and no nested block as null (not {})", () => {
    const r = parseFrontmatter(wrap("owner:\nid: x"));
    assert.deepEqual(r.errors, []);
    assert.equal(r.data.owner, null);
  });

  it("returns no frontmatter for content without a leading delimiter", () => {
    const r = parseFrontmatter("# Just markdown\n");
    assert.deepEqual(r.data, {});
    assert.deepEqual(r.errors, []);
    assert.match(r.body, /Just markdown/);
  });
});

describe("frontmatter — golden negative (one per error code)", () => {
  const cases = [
    ["tab_indent", "id: a\n\tkind: b", "base.yaml.tab_indent"],
    ["block_scalar", "description: |\n  multi", "base.yaml.block_scalar_unsupported"],
    ["flow_map", "meta: {a: b}", "base.yaml.flow_map_unsupported"],
    ["anchor", "x: &anchor", "base.yaml.anchor_or_tag_unsupported"],
    ["tag", "x: !!str y", "base.yaml.anchor_or_tag_unsupported"],
    ["unterminated_quote", 'x: "open', "base.yaml.unterminated_quote"],
    ["duplicate_key", "id: a\nid: b", "base.yaml.duplicate_key"],
    ["dangerous_key", "constructor: nope", "base.yaml.dangerous_key"],
    ["bad_indent", "id: a\n    extra: b", "base.yaml.bad_indent"],
    ["unparsable_line", "this is not a key value", "base.yaml.unparsable_line"],
    ["not_a_mapping", "- a\n- b", "base.yaml.not_a_mapping"],
  ];

  for (const [label, body, code] of cases) {
    it(`rejects ${label} with ${code}`, () => {
      const r = parseFrontmatter(wrap(body));
      assert.ok(codesOf(r).includes(code), `expected ${code}, got [${codesOf(r).join(", ")}]`);
      // Every error carries a line and a message.
      for (const e of r.errors) {
        assert.equal(typeof e.line, "number");
        assert.ok(e.message.length > 0);
      }
    });
  }

  it("flags an unterminated frontmatter block", () => {
    const r = parseFrontmatter("---\nid: x\nstill inside\n");
    assert.ok(codesOf(r).includes("base.yaml.unterminated_frontmatter"));
  });

  it("never inserts a guessed value for a rejected token", () => {
    const r = parseFrontmatter(wrap("good: ok\nbad: {flow: map}"));
    assert.equal(r.data.good, "ok");
    assert.equal("bad" in r.data, false); // omitted, not guessed
  });
});

describe("frontmatter — property (random valid-subset docs)", () => {
  it("never throws and produces no errors on generated valid docs", () => {
    const keys = ["id", "type", "title", "scope", "status", "owner", "version"];
    const scalarArb = fc.constantFrom("alpha", "beta-1", "true", "false", "42", '"quoted: value"');
    // Unique keys by construction: a duplicate key would be a legitimate parse error.
    const docArb = fc
      .uniqueArray(fc.constantFrom(...keys), { minLength: 1, maxLength: keys.length })
      .chain((picked) => fc.tuple(...picked.map((k) => scalarArb.map((v) => `${k}: ${v}`))));

    fc.assert(
      fc.property(docArb, (lines) => {
        const r = parseFrontmatter(wrap(lines.join("\n")));
        assert.deepEqual(r.errors, [], `unexpected errors on:\n${lines.join("\n")}`);
        assert.equal(typeof r.data, "object");
      }),
      { numRuns: 300 },
    );
  });
});

describe("frontmatter — fuzz (never crashes)", () => {
  it("always returns {data, errors} on random bytes and mutated docs, never throws", () => {
    const charArb = fc.constantFrom(..."abcdef:-{}[]|>&*!\"' \n\t#123");
    const noiseArb = fc.string({ unit: charArb, maxLength: 80 });

    fc.assert(
      fc.property(noiseArb, (s) => {
        const variants = [s, `---\n${s}\n---\n`, `---\n${s}`];
        for (const v of variants) {
          let r;
          assert.doesNotThrow(() => { r = parseFrontmatter(v); });
          assert.equal(typeof r.data, "object");
          assert.ok(Array.isArray(r.errors));
        }
      }),
      { numRuns: 500 },
    );
  });
});

describe("frontmatter — prototype pollution is not possible", () => {
  it("a __proto__ / constructor key never pollutes Object.prototype nor leaks as data", () => {
    const r = parseFrontmatter(wrap(
      [
        "schema_version: base.resource.v1",
        "id: safe",
        "type: process",
        "description: A resource.",
        "__proto__: polluted",
        "constructor: nope",
      ].join("\n"),
    ));
    // The invariant we lock: untrusted markdown can never reach Object.prototype.
    assert.equal({}.polluted, undefined);
    assert.equal(Object.prototype.polluted, undefined);
    // And the dangerous keys must not surface as ordinary own data keys.
    assert.equal(Object.hasOwn(r.data, "__proto__"), false);
    assert.equal(Object.hasOwn(r.data, "constructor"), false);
    assert.ok(r.errors.some((error) => error.code === "base.yaml.dangerous_key"));
    assert.equal(r.data.id, "safe"); // the legitimate keys still parse
  });

  it("rejects a dangerous key inside a nested map without polluting the prototype", () => {
    const r = parseFrontmatter(wrap(
      ["id: safe", "type: process", "meta:", "  __proto__: pwn", "  ok: yes"].join("\n"),
    ));
    assert.equal({}.pwn, undefined);
    assert.equal(Object.prototype.pwn, undefined);
    assert.ok(r.errors.some((error) => error.code === "base.yaml.dangerous_key"));
    assert.equal(Object.hasOwn(r.data.meta ?? {}, "__proto__"), false);
    assert.equal(r.data.meta?.ok, "yes"); // sibling key still parses
  });

  it("rejects a dangerous key in a list-of-maps item (first and nested key)", () => {
    const first = parseFrontmatter(wrap(
      ["id: safe", "type: process", "items:", "  - __proto__: pwn"].join("\n"),
    ));
    assert.equal({}.pwn, undefined);
    assert.ok(first.errors.some((error) => error.code === "base.yaml.dangerous_key"));

    const nested = parseFrontmatter(wrap(
      ["id: safe", "type: process", "items:", "  - name: ok", "    constructor: pwn"].join("\n"),
    ));
    assert.equal(Object.prototype.pwn, undefined);
    assert.ok(nested.errors.some((error) => error.code === "base.yaml.dangerous_key"));
    assert.equal(nested.data.items?.[0]?.name, "ok"); // legitimate key in the same item still parses
  });

  it("rejects a top-level `prototype` key", () => {
    const r = parseFrontmatter(wrap(["id: safe", "type: process", "prototype: pwn"].join("\n")));
    assert.ok(r.errors.some((error) => error.code === "base.yaml.dangerous_key"));
    assert.equal(Object.hasOwn(r.data, "prototype"), false);
  });
});

describe("parseScalar", () => {
  it("types barewords and strips trailing comments outside quotes", () => {
    assert.equal(parseScalar(""), null);
    assert.equal(parseScalar("true"), true);
    assert.equal(parseScalar("42"), 42);
    assert.equal(parseScalar("hello # note"), "hello");
    assert.equal(parseScalar('"keep # inside"'), "keep # inside");
  });
});
