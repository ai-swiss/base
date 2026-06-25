// Spec coverage: UR-CORE-004 NFR-CORE-010
// The spec-discipline gates are validated software (their false-pass would silently let the truth
// plane drift): this suite exercises the spec-sync classifier and the ID-immutability differ.
// Fixture IDs are assembled at runtime so this file's own source carries no literal that the
// repository-wide citation scanner would treat as a (phantom) requirement citation.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isSourceFile,
  isSpecFile,
  isTestFile,
  specSyncVerdict,
} from "../tools/spec/spec-sync-check.mjs";
import { extractStableIds, extractSuffixedIdRows, immutabilityVerdict } from "../tools/spec/check-ids.mjs";
import { parseSections, namespaceVerdict } from "../tools/spec/check-id-namespaces.mjs";
import { junkPaths, nonKebabDocs } from "../tools/docs/check-tree.mjs";
import { nextId } from "../tools/spec/new-id.mjs";
import { isLeaf, leafVerdict, oversizeExempt, statusLeaks } from "../tools/spec/check-leaf.mjs";
import { trajectoryLeaks } from "../tools/docs/check-statusless.mjs";
import { changelogSyncVerdict, isChangelog, isPublicSurface } from "../tools/spec/changelog-sync-check.mjs";
import { missingMarkers } from "../tools/spec/check-markers.mjs";
import { BUSINESS_MARKERS, scanMarkers } from "../tools/core/markers.mjs";
import { emDashLines } from "../tools/docs/check-emdash.mjs";
import { linksToSource, recordedSyncHash } from "../tools/docs/check-translations.mjs";

// Build IDs without ever writing a full literal (e.g. "FR" + "-FOO-001").
const mk = (/** @type {string} */ type, /** @type {string} */ rest) => [type, rest].join("-");

describe("spec-sync gate: classification", () => {
  it("treats runtime broker/CLI/MCP/package code as source", () => {
    assert.equal(isSourceFile("tools/core/egress.mjs"), true);
    assert.equal(isSourceFile("tools/base-core.mjs"), true);
    assert.equal(isSourceFile("mcp/src/index.ts"), true);
    assert.equal(isSourceFile("packages/base-llm/src/index.mjs"), true);
    assert.equal(isSourceFile("packages/base-index-local/bin/base-index-local.mjs"), true);
  });

  it("excludes apps, meta, tests, docs and non-code from source", () => {
    assert.equal(isSourceFile("tools/studio/ui/src/App.tsx"), false, "Studio is an app, out of spec scope");
    assert.equal(isSourceFile("tools/eval/run.mjs"), false, "eval harness is an app");
    assert.equal(isSourceFile("tools/spec/check-ids.mjs"), false, "the gate itself is meta");
    assert.equal(isSourceFile("tests/base-core.test.mjs"), false);
    assert.equal(isSourceFile("packages/base-llm/tests/x.test.mjs"), false);
    assert.equal(isSourceFile("packages/base-llm/README.md"), false, "a package root doc is not src/bin code");
    assert.equal(isSourceFile("README.md"), false);
  });

  it("recognises spec-plane files (specs/ tree and the canonical schema)", () => {
    assert.equal(isSpecFile("specs/current/10_core/requirements.md"), true);
    assert.equal(isSpecFile("base.schema.json"), true);
    assert.equal(isSpecFile("tools/core/egress.mjs"), false);
  });

  it("isTestFile catches the test conventions", () => {
    assert.equal(isTestFile("tests/base-core.test.mjs"), true);
    assert.equal(isTestFile("mcp/tests/index.test.ts"), true);
    assert.equal(isTestFile("tools/core/egress.mjs"), false);
  });
});

describe("spec-sync gate: verdict", () => {
  it("passes when no runtime source changed", () => {
    assert.equal(specSyncVerdict(["README.md", "tests/x.test.mjs"]).status, "no-source");
  });
  it("passes when source and specs change together", () => {
    assert.equal(
      specSyncVerdict(["tools/core/egress.mjs", "specs/current/10_core/requirements.md"]).status,
      "in-sync",
    );
  });
  it("passes a source-only change that declares [SPEC-NEUTRAL: reason]", () => {
    const v = specSyncVerdict(["tools/core/egress.mjs"], "refactor [SPEC-NEUTRAL: pure rename]");
    assert.equal(v.status, "spec-neutral");
    assert.match(v.neutralReason, /SPEC-NEUTRAL/);
  });
  it("FAILS a source-only change with no spec touch and no escape", () => {
    const v = specSyncVerdict(["tools/core/egress.mjs", "tools/base-core.mjs"]);
    assert.equal(v.ok, false);
    assert.equal(v.status, "out-of-sync");
    assert.deepEqual(v.srcFiles, ["tools/core/egress.mjs", "tools/base-core.mjs"]);
  });
});

describe("ID-immutability gate", () => {
  it("extracts row-defined stable IDs (UR/NFR/FR/RC/AD), duplicates preserved", () => {
    const md = [
      `Inline mention of ${mk("FR", "AAA-001")} is not a row.`,
      "| ID | Requirement |",
      "|---|---|",
      `| ${mk("UR", "CORE-001")} | u |`,
      `| ${mk("FR", "AAA-001")} | a |`,
      `| ${mk("RC", "EGRESS-001")} | a risk control is a stable ID too |`,
      `| ${mk("AD", "CORE-009")} | d |`,
      `| ${mk("FR", "AAA-001")} | duplicate row |`,
    ].join("\n");
    assert.deepEqual(extractStableIds(md), [
      mk("UR", "CORE-001"),
      mk("FR", "AAA-001"),
      mk("RC", "EGRESS-001"),
      mk("AD", "CORE-009"),
      mk("FR", "AAA-001"),
    ]);
  });

  it("passes when the baseline ID set survives, with additions allowed", () => {
    const base = [mk("FR", "AAA-001"), mk("FR", "AAA-002")];
    const cur = [mk("FR", "AAA-001"), mk("FR", "AAA-002"), mk("FR", "BBB-001")];
    const v = immutabilityVerdict(base, cur);
    assert.equal(v.ok, true);
    assert.deepEqual(v.added, [mk("FR", "BBB-001")]);
    assert.deepEqual(v.vanished, []);
  });

  it("FAILS when a baseline ID vanished (renumber/reuse/delete)", () => {
    const v = immutabilityVerdict([mk("FR", "AAA-001"), mk("FR", "AAA-002")], [mk("FR", "AAA-001")]);
    assert.equal(v.ok, false);
    assert.deepEqual(v.vanished, [mk("FR", "AAA-002")]);
  });

  it("FAILS on a duplicate ID row in the working tree", () => {
    const v = immutabilityVerdict([mk("FR", "AAA-001")], [mk("FR", "AAA-001"), mk("FR", "AAA-001")]);
    assert.equal(v.ok, false);
    assert.deepEqual(v.duplicated, [mk("FR", "AAA-001")]);
  });

  it("flags letter-suffixed ID rows (the FR-XXX-003a anti-pattern the matrix can't see)", () => {
    const md = [
      "| ID | Requirement |",
      `| ${mk("FR", "AAA-003")} | ok |`,
      `| ${mk("FR", "AAA-003")}a | invisible sub-id |`,
    ].join("\n");
    assert.deepEqual(extractSuffixedIdRows(md), [`${mk("FR", "AAA-003")}a`]);
    assert.deepEqual(extractSuffixedIdRows(`| ${mk("FR", "AAA-003")} | ok |`), []);
  });
});

describe("ID-namespace gate (check-id-namespaces): an ID stays in the section that Owns it", () => {
  const section = (heading, owns, ...ids) =>
    [`## ${heading}`, "", `Owns: ${owns}`, "", "| ID | Requirement |", "|---|---|", ...ids.map((x) => `| ${x} | r |`), ""].join("\n");

  it("parses a section's heading, Owns tokens and row IDs", () => {
    const md = section("Core", `${mk("FR", "CORE")}-*`, mk("FR", "CORE-001"));
    const [s] = parseSections(md);
    assert.equal(s.heading, "Core");
    assert.deepEqual(s.owns, [mk("FR", "CORE")]);
    assert.deepEqual(s.ids, [mk("FR", "CORE-001")]);
  });

  it("passes when every ID matches its section's Owns namespace", () => {
    const md = section("Core", `${mk("FR", "CORE")}-*`, mk("FR", "CORE-001"), mk("FR", "CORE-002"));
    assert.equal(namespaceVerdict(parseSections(md)).ok, true);
  });

  it("FAILS on a misfiled ID (right grammar, wrong section)", () => {
    const md = section("Core", `${mk("FR", "CORE")}-*`, mk("FR", "CORE-001"), mk("FR", "ROUTE-099"));
    const v = namespaceVerdict(parseSections(md));
    assert.equal(v.ok, false);
    assert.equal(v.violations[0].id, mk("FR", "ROUTE-099"));
  });

  it("a whole-prefix Owns (e.g. RC-*) covers any domain", () => {
    const md = section("Risk controls", `${"RC"}-*`, mk("RC", "WRITE-001"), mk("RC", "EGRESS-002"));
    assert.equal(namespaceVerdict(parseSections(md)).ok, true);
  });

  it("treats parenthetical commentary on the Owns line as prose, not a claim", () => {
    const owns = `${mk("NFR", "CORE")}-*, ${mk("NFR", "PARSE")}-* (${mk("NFR", "ROUTE")}-* is owned elsewhere)`;
    const md = section("NFR", owns, mk("NFR", "ROUTE-001"));
    const v = namespaceVerdict(parseSections(md));
    assert.equal(v.ok, false, "an NFR-ROUTE id here is not covered by the (excluded) parenthetical");
    assert.equal(v.violations[0].id, mk("NFR", "ROUTE-001"));
  });

  it("flags an ID in a section that declares no Owns:", () => {
    const md = ["## Loose", "", "| ID | Requirement |", "|---|---|", `| ${mk("FR", "LOOSE-001")} | r |`, ""].join("\n");
    const v = namespaceVerdict(parseSections(md));
    assert.equal(v.ok, false);
    assert.match(v.violations[0].reason, /no Owns/);
  });

  it("scans the preamble: a misfiled ID above the first section does not escape", () => {
    const md = ["| ID | Requirement |", "|---|---|", `| ${mk("FR", "ROUTE-099")} | parked in the preamble |`, "", section("Core", `${mk("FR", "CORE")}-*`, mk("FR", "CORE-001"))].join("\n");
    const v = namespaceVerdict(parseSections(md));
    assert.equal(v.ok, false);
    assert.ok(v.violations.some((x) => x.id === mk("FR", "ROUTE-099")), "preamble row ID must be caught");
  });

  it("reads Owns tokens even when a parenthetical leads the line", () => {
    const md = section("Route", `(see routing.md) ${mk("FR", "ROUTE")}-*`, mk("FR", "ROUTE-001"));
    assert.equal(namespaceVerdict(parseSections(md)).ok, true);
  });
});

describe("tree-hygiene gate (check-tree): no junk, kebab docs, version tokens allowed", () => {
  it("flags committed junk files (.DS_Store, editor swap/backup)", () => {
    const files = ["docs/guide.md", "docs/.DS_Store", "tools/x.mjs~", "a/y.swp", "ok.md"];
    assert.deepEqual(junkPaths(files).sort(), ["a/y.swp", "docs/.DS_Store", "tools/x.mjs~"]);
  });

  it("flags non-kebab docs filenames but allows version tokens and conventional README", () => {
    const files = [
      "docs/bien-nomme.md",
      "docs/start/migration-v1.0.0.md",
      "docs/public/assets/README.md",
      "docs/MalNomme.md",
      "docs/mal_nomme.md",
    ];
    assert.deepEqual(nonKebabDocs(files).sort(), ["docs/MalNomme.md", "docs/mal_nomme.md"]);
  });

  it("ignores non-docs paths for the kebab rule", () => {
    assert.deepEqual(nonKebabDocs(["tools/SomeFile.mjs", "specs/README.md"]), []);
  });

  it("catches non-lowercase and broader markdown extensions (docs/Foo.MD)", () => {
    assert.deepEqual(nonKebabDocs(["docs/BadName.MD", "docs/AlsoBad.markdown", "docs/good.mdx"]).sort(), ["docs/AlsoBad.markdown", "docs/BadName.MD"]);
  });
});

describe("ID allocator (new-id): IDs are computed, never hand-numbered", () => {
  it("returns max+1 for the family, honouring gaps (never reuses a number)", () => {
    const md = [
      "| ID | Requirement |",
      `| ${mk("FR", "EGRESS-001")} | a |`,
      `| ${mk("FR", "EGRESS-002")} | b |`,
      `| ${mk("FR", "EGRESS-004")} | gap at 003 stays a gap |`,
    ].join("\n");
    assert.equal(nextId(md, "FR", "EGRESS"), mk("FR", "EGRESS-005"));
  });

  it("starts a brand-new family at 001 and zero-pads", () => {
    assert.equal(nextId("no rows here", "RC", "EGRESS"), mk("RC", "EGRESS-001"));
  });

  it("counts cross-references too, so a number mentioned anywhere is never reused", () => {
    const md = `| ${mk("FR", "CORE-001")} | references ${mk("FR", "CORE-009")} in prose |`;
    assert.equal(nextId(md, "FR", "CORE"), mk("FR", "CORE-010"));
  });
});

describe("leaf-contract gate (check-leaf): bounded, statusless, routed", () => {
  it("classifies leaves, excluding routers, the generated matrix, and the changelog", () => {
    assert.equal(isLeaf("10_core/architecture.md"), true);
    assert.equal(isLeaf("README.md"), false);
    assert.equal(isLeaf("10_core/requirements-matrix.md"), false);
    assert.equal(isLeaf("CHANGELOG.md"), false);
  });

  it("statusLeaks flags a Status heading/field but ignores a documented `status` field in a fence", () => {
    const leaky = "# Chapter\n\n## Status\n\nIn progress.\n";
    assert.equal(statusLeaks(leaky).length, 1);
    const fenced = "# Chapter\n\n```\n{ status: \"active\" }\n```\n\nPresent behaviour.\n";
    assert.deepEqual(statusLeaks(fenced), [], "a documented status field inside a code fence is fine");
    assert.equal(statusLeaks("A line mentioning the status= default mid-sentence.").length, 0);
  });

  it("passes a well-formed leaf; fails one that is too long, status-bearing, or unrouted", () => {
    const router = "| `10_core/good.md` | a routed chapter |\n";
    const good = leafVerdict("10_core/good.md", "# Good\n\nPresent behaviour.\n", router);
    assert.equal(good.ok, true);

    const longText = "# Big\n" + "x\n".repeat(300);
    assert.equal(leafVerdict("10_core/good.md", longText, router).tooLong, true);
    assert.equal(oversizeExempt("<!-- LEAF-OVERSIZE: central index -->\n" + longText), true);
    assert.equal(leafVerdict("10_core/good.md", "<!-- LEAF-OVERSIZE: ok -->\n" + longText, router).tooLong, false);

    assert.equal(leafVerdict("10_core/good.md", "# G\n## Status\nx\n", router).statusLines.length, 1);
    assert.equal(leafVerdict("10_core/orphan.md", "# Orphan\n", router).routed, false);
  });
});

describe("statusless-docs gate (check-statusless): reference pages state the present", () => {
  it("flags roadmap/status markers, ignores fences and reviewed exceptions", () => {
    assert.equal(trajectoryLeaks("## Extensions prévues\n\n| x | Horizon indicatif |\n").length, 2);
    assert.equal(trajectoryLeaks("Une feuille de route détaillée arrive prochainement.").length, 1);
    assert.deepEqual(trajectoryLeaks("Le présent du cœur public, décrit sans état."), []);
    assert.deepEqual(trajectoryLeaks("```\n| Extension | Horizon indicatif |\n```"), [], "a fenced example is not a leak");
    assert.deepEqual(trajectoryLeaks("Roadmap moved. [STATUSLESS-OK: this line names the rule, not a roadmap]"), []);
  });
});

describe("changelog-sync gate: a visible change leaves a trace", () => {
  it("recognises the public surface, visible docs, and changelog files", () => {
    assert.equal(isPublicSurface("docs/start/quickstart.md"), true);
    assert.equal(isPublicSurface("README.md"), true);
    assert.equal(isPublicSurface("README.en.md"), true);
    assert.equal(isPublicSurface("base.schema.json"), true);
    assert.equal(isPublicSurface("packages/base-llm/index.mjs"), true);
    assert.equal(isPublicSurface("tools/core/egress.mjs"), false, "internal code is spec-sync's job, not changelog-sync");
    assert.equal(isPublicSurface("tests/base-core.test.mjs"), false);
    assert.equal(isChangelog("CHANGELOG.md"), true);
    assert.equal(isChangelog("packages/base-llm/CHANGELOG.md"), true);
  });
  it("passes a non-surface diff, a surface+changelog diff, and a declared skip; fails otherwise", () => {
    assert.equal(changelogSyncVerdict(["tools/core/egress.mjs"]).status, "no-surface");
    assert.equal(changelogSyncVerdict(["docs/x.md", "CHANGELOG.md"]).status, "in-sync");
    assert.equal(changelogSyncVerdict(["docs/x.md"], "fix typo [CHANGELOG-SKIP: typo]").status, "skip");
    const v = changelogSyncVerdict(["README.md", "docs/x.md"]);
    assert.equal(v.ok, false);
    assert.deepEqual(v.surface, ["README.md", "docs/x.md"]);
  });
});

describe("marker vocabulary is one closed set (check-markers + scanner share it)", () => {
  it("the scanner regex is built from the exported set, so it cannot drift from it", () => {
    assert.deepEqual(BUSINESS_MARKERS, ["A COMPLETER", "A VALIDER", "ATTENTION", "DECISION"]);
    const hits = scanMarkers("[A VALIDER: prix] then [DECISION: ok | raison] and [INVENTED: x]", "doc.md");
    assert.deepEqual(hits.map((h) => h.type), ["A VALIDER", "DECISION"], "only the closed set is recognised");
  });
  it("missingMarkers reports which of the set a copy dropped", () => {
    assert.deepEqual(missingMarkers("uses [A VALIDER] and [DECISION] only"), ["A COMPLETER", "ATTENTION"]);
    assert.deepEqual(missingMarkers("A COMPLETER A VALIDER ATTENTION DECISION"), []);
  });
});

describe("French house-style and authority gates", () => {
  it("em-dash gate flags U+2014 in prose, ignores fences and reviewed exceptions", () => {
    assert.equal(emDashLines("Un texte — avec incise.").length, 1);
    assert.deepEqual(emDashLines("Un texte, avec virgule."), []);
    assert.deepEqual(emDashLines("```\ncode — fenced\n```"), [], "a fenced em-dash is not prose");
    assert.deepEqual(emDashLines("ligne — tolérée [EMDASH-OK: citation]"), []);
  });
  it("translations gate: a translation head must link its French source; opt-in sync hash is read", () => {
    assert.equal(linksToSource("> This is a translation. The [French version](README.md) is authoritative.", "README.md"), true);
    assert.equal(linksToSource("> A translation with no backlink.", "README.md"), false);
    assert.equal(recordedSyncHash("<!-- fr-synced: a1b2c3d -->"), "a1b2c3d");
    assert.equal(recordedSyncHash("no marker here"), null);
  });
});
