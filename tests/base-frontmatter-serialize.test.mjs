// Spec coverage: FR-PARSE-001 FR-PARSE-003 FR-CHANGE-001
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import fc from "fast-check";
import {
  composeMarkdown,
  FrontmatterSerializeError,
  parseFrontmatter,
  serializeFrontmatter,
} from "../tools/core/frontmatter.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// The core contract: parse(compose(data, body)) === { data, body }.
function roundTrip(data, body = "body text\n") {
  const parsed = parseFrontmatter(composeMarkdown(data, body));
  assert.deepStrictEqual(parsed.errors, [], `unexpected parse errors: ${JSON.stringify(parsed.errors)}`);
  assert.deepStrictEqual(parsed.data, data);
  assert.equal(parsed.body, body);
  return parsed;
}

describe("frontmatter serialize — golden round-trips (the tricky cases)", () => {
  it("scalars: string, int, decimal, booleans, null", () => {
    roundTrip({ id: "my-id", n: 42, ratio: 3.5, neg: -7, flag: true, other: false, missing: null });
  });

  it("strings that must be quoted to survive (reserved words, numerics, brackets, comments, spaces)", () => {
    roundTrip({
      a: "true", // would coerce to boolean if bareword
      b: "false",
      c: "null",
      d: "123", // would coerce to number
      e: "-4.5",
      f: " leading-space",
      g: "trailing-space ",
      h: "has a # hash", // " #" triggers comment stripping if bareword
      i: "[looks-like-array",
      j: "{looks-like-map",
      k: "*anchor-ish",
      l: "", // empty string is distinct from null
    });
  });

  it("strings with colons and commas as bareword (allowed inside a value)", () => {
    roundTrip({ title: "a: b, c: d", url: "http://example.test/x" });
  });

  it('strings containing double quotes (literal wrap, parser does slice without unescape)', () => {
    roundTrip({ q: 'he said "hi"', edge: 'ends"', edge2: '"starts', just: '"' });
  });

  it("space-separated token strings stay bareword (e.g. allowed-tools value)", () => {
    roundTrip({ "allowed-tools": "Read Write Edit Glob Grep" });
  });

  it("arrays: flow for compact tokens, block for sentences, empty stays empty", () => {
    roundTrip({
      keywords: ["pme", "suisse", "grande-entreprise"], // flow
      examples: ["Quelles sont mes options ?", "Montre-moi le menu"], // block (spaces)
      none: [], // empty flow []
      withEmptyItem: ["a", "", "b"], // block, empty item as - ""
    });
  });

  it("nested mappings (routing-style)", () => {
    roundTrip({
      routing: {
        examples: ["Je veux un devis", "Nouveau devis client"],
        avoid_when: ["Auditer un BASE existant."],
      },
      execution: { type: "script", runtime: "python", dry_run: true },
    });
  });

  it("sequence of flat maps (requires-style)", () => {
    roundTrip({
      requires: [
        { ref: "entreprise/identite.md", access: "read" },
        { ref: "catalogue/prix.json", access: "read", purpose: "tarifs" },
      ],
    });
  });

  it("composeMarkdown with empty data emits no frontmatter block", () => {
    assert.equal(composeMarkdown({}, "just a body"), "just a body");
    const parsed = parseFrontmatter(composeMarkdown({}, "just a body"));
    assert.deepStrictEqual(parsed.data, {});
    assert.equal(parsed.body, "just a body");
  });
});

// --- Property test: random representable data must always round-trip --------
// fast-check arbitraries mirror the representable subset (scalars, flat objects, arrays, one level
// of nesting); on failure fast-check shrinks to a minimal counter-example instead of a noisy seed.

const stringScalarArb = fc.constantFrom(
  "simple",
  "with-dash",
  "with_underscore",
  "deux mots",
  "trois petits mots",
  "a: colon",
  "a, comma",
  "true",
  "false",
  "null",
  "42",
  "-3.14",
  "café déjà prêt",
  "has a # comment-ish",
  " spaced ",
  "[bracketish",
  '"quoted-bit"',
  "",
  "Quelles sont vos options ?",
  "Read Write Edit",
);

const scalarArb = fc.oneof(
  { weight: 5, arbitrary: stringScalarArb },
  { weight: 2, arbitrary: fc.integer({ min: -1000, max: 1000 }) },
  // <=2-decimal floats: the serializer's documented numeric subset.
  { weight: 2, arbitrary: fc.integer({ min: -10000, max: 10000 }).map((n) => n / 100) },
  { weight: 1, arbitrary: fc.boolean() },
);

const keyArb = fc.tuple(fc.integer({ min: 0, max: 9 }), fc.integer({ min: 0, max: 999 }))
  .map(([i, n]) => `k${i}_${n}`);

const flatObjectArb = fc.dictionary(fc.constantFrom("ref", "access", "purpose", "k", "v"), scalarArb, {
  minKeys: 1,
  maxKeys: 3,
  noNullPrototype: true,
});

const arrayArb = fc.oneof(
  { weight: 7, arbitrary: fc.array(scalarArb, { maxLength: 3 }) },
  { weight: 3, arbitrary: fc.array(flatObjectArb, { minLength: 1, maxLength: 3 }) },
);

function mappingArb(depth) {
  const valueArb = fc.oneof(
    { weight: 4, arbitrary: scalarArb },
    { weight: 3, arbitrary: arrayArb },
    { weight: 1, arbitrary: fc.constant(null) },
    ...(depth > 0 ? [{ weight: 2, arbitrary: mappingArb(depth - 1) }] : []),
  );
  return fc.dictionary(keyArb, valueArb, { maxKeys: 4, noNullPrototype: true, ...(depth < 2 ? { minKeys: 1 } : {}) });
}

describe("frontmatter serialize — property: random representable data round-trips", () => {
  it("generated documents survive compose→parse unchanged (fast-check, shrinking on failure)", () => {
    fc.assert(
      fc.property(mappingArb(2), (data) => {
        const body = "Body\nsecond line\n";
        let text;
        try {
          text = composeMarkdown(data, body);
        } catch (err) {
          assert.fail(`serialize threw on representable data: ${err.message}\n${JSON.stringify(data)}`);
        }
        const parsed = parseFrontmatter(text);
        assert.deepStrictEqual(parsed.errors, [], `parse errors: ${JSON.stringify(parsed.errors)}\n${text}`);
        assert.deepStrictEqual(parsed.data, data, `mismatch\n${text}`);
        assert.equal(parsed.body, body, "body mismatch");
      }),
      { numRuns: 200 },
    );
  });
});

// --- Corpus round-trip: every real resource re-serializes losslessly --------

function walkMarkdown(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name === "node_modules" || name === ".git") continue;
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkMarkdown(full, out);
    else if (name.endsWith(".md")) out.push(full);
  }
  return out;
}

describe("frontmatter serialize — corpus round-trip (idempotent on real files)", () => {
  it("every framework + example resource re-serializes to an equivalent parse", () => {
    const files = ["exemples", ".ai", "docs", "specs"].flatMap((d) => walkMarkdown(path.join(ROOT, d)));
    assert.ok(files.length > 50, `expected to find resources, found ${files.length}`);
    let checked = 0;
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      const parsed = parseFrontmatter(content);
      if (parsed.raw === "" || parsed.errors.length > 0) continue; // skip no-frontmatter / known-bad
      const reparsed = parseFrontmatter(composeMarkdown(parsed.data, parsed.body));
      assert.deepStrictEqual(reparsed.errors, [], `re-serialized ${file} fails to parse: ${JSON.stringify(reparsed.errors)}`);
      assert.deepStrictEqual(reparsed.data, parsed.data, `data drift round-tripping ${path.relative(ROOT, file)}`);
      assert.equal(reparsed.body, parsed.body, `body drift round-tripping ${path.relative(ROOT, file)}`);
      checked++;
    }
    assert.ok(checked > 50, `expected to round-trip >50 resources, did ${checked}`);
  });
});

// --- Negative: unrepresentable inputs fail loudly with a path ---------------

describe("frontmatter serialize — fails loudly on unrepresentable input", () => {
  const cases = [
    ["key outside simple-key set", { "bad.key": "x" }, "bad.key"],
    ["key with space", { "two words": "x" }, "two words"],
    ["multi-line string", { s: "line1\nline2" }, "s"],
    ["null inside an array", { a: ["ok", null] }, "a[1]"],
    ["empty object value", { o: {} }, "o"],
    ["non-finite number", { n: Infinity }, "n"],
    ["NaN", { n: NaN }, "n"],
    ["undefined value", { u: undefined }, "u"],
    ["nested object inside a list item", { a: [{ ref: { deep: 1 } }] }, "a[0].ref"],
    ["array inside a list item field", { a: [{ tags: ["x"] }] }, "a[0].tags"],
  ];
  for (const [name, data, expectedPath] of cases) {
    it(`throws on ${name}`, () => {
      assert.throws(
        () => serializeFrontmatter(data),
        (err) => {
          assert.ok(err instanceof FrontmatterSerializeError, `expected FrontmatterSerializeError, got ${err}`);
          assert.equal(err.path, expectedPath, `expected path ${expectedPath}, got ${err.path}`);
          return true;
        },
      );
    });
  }

  it("does not throw on a representable empty-string field but does on a missing-array null", () => {
    assert.doesNotThrow(() => serializeFrontmatter({ s: "" }));
    assert.throws(() => serializeFrontmatter({ a: [null] }), FrontmatterSerializeError);
  });
});
