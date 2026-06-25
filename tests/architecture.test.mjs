// Spec coverage: NFR-CORE-007, NFR-CORE-001
// Architecture fitness functions: the public orchestration files must not grow unbounded. These
// caps are a RATCHET locked just above today's size — they prevent regression now, and are meant
// to be lowered as the documented extractions land (broker writes, route-service, CLI handlers,
// MCP registry/transports). A failure means: extract before you add, don't pile on the facade.

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";

const CAPS = [
  ["tools/base.mjs", 620], // parse-args + format + framework-mgmt extracted to cli/* (966->611); the rest is dispatch + thin handlers + main + help — the legitimate core of a CLI entrypoint
  ["tools/base-core.mjs", 1275], // facade; route-service+hashing+diff+frontmatter-edit+atomic+writes extracted (1701→1222); +egress gating at the read chokepoint (open/access/search/inventory, incl. resource-sibling sanitization) → 1262; next candidates: projections, maintenance report
  ["mcp/src/index.ts", 1140], // types/logger/transport extracted to src/* (1334->1106); +egress-visible-agents gating on the load_agent/list_agents path (1127); the rest is discovery + broker wrappers + the SDK tool registry, cohesive here
];

async function lineCount(file) {
  return (await readFile(file, "utf8")).split("\n").length;
}

describe("architecture fitness: orchestration files stay bounded", () => {
  for (const [file, cap] of CAPS) {
    it(`${file} ≤ ${cap} lines`, async () => {
      const lines = await lineCount(path.resolve(file));
      assert.ok(lines <= cap, `${file} is ${lines} lines (cap ${cap}); extract before adding`);
    });
  }

  it("no single tools/core/*.mjs module exceeds 450 lines (the small-module rule)", async () => {
    const dir = path.resolve("tools/core");
    for (const name of (await readdir(dir)).filter((n) => n.endsWith(".mjs"))) {
      const lines = await lineCount(path.join(dir, name));
      assert.ok(lines <= 450, `tools/core/${name} is ${lines} lines (cap 450); split it`);
    }
  });
});

// The zero-(third-party-)dependency core (NFR-CORE-001) is the founding invariant. It was held only by
// discipline: nothing failed if someone added a runtime dependency. These checks make it a mechanism —
// a declared third-party dependency, or a third-party bare import in the engine, fails the build. The
// first-party @ai-swiss/* companions (the optional packages: embeddings, the LLM port, eval) are
// allowed: they carry no third-party dependency themselves, ship separately, and are OPTIONAL peers
// loaded on demand, so `npm install @ai-swiss/base` still pulls a zero-dependency graph. The Studio web
// app (tools/studio/ui), the MCP server (mcp/), and the docs-site build are deliberately excluded:
// they are optional edges, not the engine a bare `node` user runs.
const ZERO_DEP_PACKAGES = [".", "packages/base-eval", "packages/base-index-local", "packages/base-llm", "packages/base-ranker-semantic"];

async function collectEngineMjs(dir, out) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full.includes(path.join("studio", "ui")) || entry.name === "node_modules") continue;
      await collectEngineMjs(full, out);
    } else if (entry.name.endsWith(".mjs")) {
      out.push(full);
    }
  }
  return out;
}

function importSpecifiers(text) {
  const specs = new Set();
  for (const m of text.matchAll(/^\s*(?:import|export)\b[^"';]*?\bfrom\s*["']([^"']+)["']/gm)) specs.add(m[1]);
  for (const m of text.matchAll(/^\s*import\s*["']([^"']+)["']/gm)) specs.add(m[1]);
  for (const m of text.matchAll(/\bimport\s*\(\s*["']([^"']+)["']/g)) specs.add(m[1]);
  return [...specs];
}

const isBuiltinOrLocal = (spec) => spec.startsWith(".") || spec.startsWith("/") || spec.startsWith("node:") || spec.startsWith("@ai-swiss/");

// The single mediated write path (AD-CHANGE-001). Real business mutations reach disk only through the
// propose->commit flow, which writes via the atomic helper (tools/core/atomic.mjs). Held until now by
// discipline: nothing stopped a future edit from adding a raw fs.writeFile to the mediated module or
// the facade, quietly bypassing the gate. This makes it a mechanism — a raw filesystem write
// (writeFile/appendFile, sync or async) in those two surfaces fails the build unless the line carries
// an explicit `raw-write-ok:` marker (today: the append-only trace journal). The atomic helper itself
// (writeFileAtomic) is the sanctioned write and is not a raw write.
const RAW_WRITE = /\b(?:writeFile|appendFile|writeFileSync|appendFileSync)\s*\(/;
const MEDIATED_WRITE_SURFACES = ["tools/core/writes.mjs", "tools/base-core.mjs"];

describe("architecture fitness: the single mediated write path (AD-CHANGE-001)", () => {
  for (const rel of MEDIATED_WRITE_SURFACES) {
    it(`${rel} has no unmarked raw filesystem write`, async () => {
      const lines = (await readFile(path.resolve(rel), "utf8")).split("\n");
      lines.forEach((line, i) => {
        if (RAW_WRITE.test(line) && !/raw-write-ok:/.test(line)) {
          assert.fail(
            `${rel}:${i + 1} has a raw filesystem write; business mutations must go through the ` +
              `propose->commit flow and writeFileAtomic. If this is a legitimate non-business write ` +
              `(trace journal, scaffold), tag the line with "// raw-write-ok: <reason>".\n  ${line.trim()}`,
          );
        }
      });
    });
  }
});

describe("architecture fitness: the zero-dependency core (NFR-CORE-001)", () => {
  for (const pkgDir of ZERO_DEP_PACKAGES) {
    it(`${pkgDir === "." ? "the core" : pkgDir} declares zero third-party runtime dependencies`, async () => {
      const pkg = JSON.parse(await readFile(path.resolve(pkgDir, "package.json"), "utf8"));
      const deps = Object.keys(pkg.dependencies ?? {});
      assert.equal(deps.length, 0, `${pkgDir}/package.json declares hard runtime dependencies [${deps.join(", ")}]; the core stays dependency-free, companions are OPTIONAL peers (NFR-CORE-001)`);
      // Optional companions and required peers are allowed, but ONLY first-party @ai-swiss/*: no
      // third-party supply chain may slip in even through a peer or optional declaration.
      const peers = [...Object.keys(pkg.peerDependencies ?? {}), ...Object.keys(pkg.optionalDependencies ?? {})];
      const thirdParty = peers.filter((dep) => !dep.startsWith("@ai-swiss/"));
      assert.deepEqual(thirdParty, [], `${pkgDir}/package.json declares non-@ai-swiss peer/optional deps [${thirdParty.join(", ")}]; the dependency surface stays first-party only (NFR-CORE-001)`);
    });
  }

  it("no engine source imports a third-party dependency (only node: builtins, relative paths, and @ai-swiss/* companions)", async () => {
    const files = await collectEngineMjs(path.resolve("tools"), []);
    for (const file of files) {
      const text = await readFile(file, "utf8");
      for (const spec of importSpecifiers(text)) {
        assert.ok(
          isBuiltinOrLocal(spec),
          `${path.relative(process.cwd(), file)} imports "${spec}" — the engine must use only node: builtins, relative paths, and first-party @ai-swiss/* companions (NFR-CORE-001)`,
        );
      }
    }
  });

  it("the core (base-core.mjs + tools/core/) never imports the Studio layer (one-way dependency: studio → core)", async () => {
    // The published MCP bundle ships tools/base-core.mjs + tools/core/ only (bundle-core.mjs); a core
    // import of tools/studio/ resolves in the repo but is MISSING in the bundle, crashing the server.
    // So the dependency direction is one-way: Studio depends on the core, never the reverse.
    const coreFiles = [path.resolve("tools/base-core.mjs"), ...(await collectEngineMjs(path.resolve("tools/core"), []))];
    for (const file of coreFiles) {
      const text = await readFile(file, "utf8");
      for (const spec of importSpecifiers(text)) {
        assert.ok(
          !/(^|\/)studio\//.test(spec),
          `${path.relative(process.cwd(), file)} imports "${spec}" from the Studio layer — the core must not depend on tools/studio/ (the published MCP bundle ships tools/core/ without it). Move the shared piece into tools/core/.`,
        );
      }
    }
  });
});
