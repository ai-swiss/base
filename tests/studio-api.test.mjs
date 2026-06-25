// Spec coverage: UR-CORE-001 FR-CORE-005
// (no mutation), and the editor save path (serializer → propose → commit) against a throwaway temp
// BASE so a real write can be verified end to end.

import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir, homedir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { FrontmatterSerializeError } from "../tools/core/frontmatter.mjs";
import {
  commitEdit,
  contextPayload,
  facets,
  getResource,
  listResources,
  proposeEdit,
  readFileContent,
  resolveStudioContext,
  rootPathFor,
  search,
  searchAllRoots,
  tildify,
  tree,
} from "../tools/studio/api.mjs";

const EX = "exemples/assistant-devis";
const WS = "exemples/agence-multi-clients";

describe("studio api — display hygiene and hidden discipline planes", () => {
  it("tildify hides the home directory (and username) from displayed paths", () => {
    const home = homedir();
    assert.equal(tildify(home + path.sep + "Documents" + path.sep + "base"), "~" + path.sep + "Documents" + path.sep + "base");
    assert.equal(tildify(home), "~");
    assert.equal(tildify("/etc/elsewhere"), "/etc/elsewhere"); // outside home: untouched
    assert.equal(tildify(undefined), undefined);
  });

  it("the workspace tree omits the discipline planes (decisions/, specs/) but keeps .ai and docs", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "studio-hidden-"));
    try {
      await mkdir(path.join(root, ".ai", "agents", "x"), { recursive: true });
      await writeFile(path.join(root, ".ai", "agents", "x", "AGENT.md"), "# X\n\nUn agent.");
      await mkdir(path.join(root, "decisions"), { recursive: true });
      await writeFile(path.join(root, "decisions", "0001-x.md"), "# ADR\n");
      await mkdir(path.join(root, "specs"), { recursive: true });
      await writeFile(path.join(root, "specs", "a.md"), "# spec\n");
      await mkdir(path.join(root, "docs"), { recursive: true });
      await writeFile(path.join(root, "docs", "guide.md"), "# guide\n");

      const topDirs = (await tree(root)).dirs.map((d) => d.path);
      assert.ok(!topDirs.includes("decisions"), "decisions/ must be hidden from the workspace");
      assert.ok(!topDirs.includes("specs"), "specs/ must be hidden from the workspace");
      assert.ok(topDirs.includes(".ai"), ".ai stays visible (the editable knowledge plane)");
      assert.ok(topDirs.includes("docs"), "docs stays visible");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("studio api — read (real example, no mutation)", () => {
  it("lists resources as lean cards with non-default badges", async () => {
    const cards = await listResources(EX, {});
    assert.ok(cards.length > 3);
    const proc = cards.find((c) => c.id === "nouveau-devis");
    assert.equal(proc.type, "process");
    assert.ok(proc.title);
    // scope=team on the example process is non-default → flagged; status=active is default → not.
    assert.ok(!proc.nonDefault.includes("status"));
  });

  it("filters by type and by agent", async () => {
    const processes = await listResources(EX, { type: "process" });
    assert.ok(processes.every((c) => c.type === "process"));
    const devisAgent = await listResources(EX, { agent: "assistant-devis" });
    assert.ok(devisAgent.length > 0);
    assert.ok(devisAgent.every((c) => c.path.includes("/agents/assistant-devis/")));
  });

  it("hybrid search returns scored cards with explainable reasons", async () => {
    const results = await search(EX, "devis", { limit: 10 });
    assert.ok(results.length > 0);
    assert.ok(results[0].score > 0);
    assert.ok(Array.isArray(results[0].reasons));
    // sorted by score descending
    assert.ok(results.every((r, i) => i === 0 || results[i - 1].score >= r.score));
  });

  it("computes facets in one pass", async () => {
    const f = await facets(EX);
    assert.equal(f.total > 0, true);
    assert.ok(f.type.process >= 1);
    assert.ok("assistant-devis" in f.agent);
  });

  it("getResource returns structured data + body for the editor", async () => {
    const r = await getResource(EX, "nouveau-devis");
    assert.equal(r.id, "nouveau-devis");
    assert.equal(r.data.type, "process");
    assert.match(r.body, /devis/i);
    assert.deepEqual(r.errors, []);
  });
});

describe("studio api — the diff shows exactly what changed, nothing else", () => {
  let root;

  before(async () => {
    root = await mkdtemp(path.join(tmpdir(), "studio-minimal-diff-"));
    // Frontmatter formatted in a way our serializer would NOT reproduce byte-for-byte:
    // exotic spacing and quoting. Minimality must survive foreign formatting.
    await writeFile(
      path.join(root, "doc.md"),
      `---\ntitle:    "Tarifs 2026"\ntype: document\nid: tarifs\n---\nLigne un.\nLigne deux.\nLigne trois.\n`,
    );
  });
  after(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("proposing the document unchanged yields a no-change diff (no ±lines at all)", async () => {
    const doc = await getResource(root, "doc.md");
    const proposed = await proposeEdit(root, { path: "doc.md", data: doc.data, body: doc.body });
    assert.ok(!/^[+-]/m.test(proposed.diff), proposed.diff);
  });

  it("changing one body line yields one hunk and ZERO frontmatter lines in the diff", async () => {
    const doc = await getResource(root, "doc.md");
    const proposed = await proposeEdit(root, {
      path: "doc.md",
      data: doc.data,
      body: doc.body.replace("Ligne deux.", "Ligne deux, corrigée."),
    });
    assert.match(proposed.diff, /\+\s*Ligne deux, corrigée\./);
    // Frontmatter may appear as CONTEXT around the hunk — what must never happen is a
    // CHANGED (±) frontmatter line when only the body moved.
    assert.ok(!/^[+-]\s*title:/m.test(proposed.diff), `frontmatter changed in the diff:\n${proposed.diff}`);
  });
});

describe("studio api — context (single root vs workspace)", () => {
  it("a plain root resolves to mode root; the payload names the perimeter (badge data)", async () => {
    const ctx = await resolveStudioContext(EX);
    assert.equal(ctx.mode, "root");
    assert.ok(path.isAbsolute(ctx.rootPath));
    const payload = contextPayload(ctx);
    assert.equal(payload.mode, "root");
    assert.equal(payload.label, "assistant-devis");
    // The badge path is tildified for display: present, but never leaking the user's home dir.
    assert.ok(payload.path, "the badge names a path");
    assert.ok(!payload.path.startsWith(homedir()), "the badge path does not leak $HOME (nor the username)");
  });

  it("a directory holding base.workspace.json resolves to mode workspace with its roots", async () => {
    const ctx = await resolveStudioContext(WS);
    assert.equal(ctx.mode, "workspace");
    assert.equal(ctx.roots.length, 2);
    assert.equal(ctx.defaultRootId, "dupont-conseil");
    const payload = contextPayload(ctx);
    assert.equal(payload.mode, "workspace");
    assert.equal(payload.workspace.id, "agence-demo");
    assert.deepEqual(payload.roots.map((r) => r.id), ["dupont-conseil", "martin-digital"]);
    assert.equal(payload.roots[0].default, true);
    // Root paths are exposed RELATIVE to the workspace (the editor round-trips them); an absolute
    // server path never leaves the server.
    assert.ok(payload.roots.every((r) => typeof r.path === "string" && !path.isAbsolute(r.path)));
  });

  it("rootPathFor: default root when absent, exact root by id, 400 on unknown id (both modes)", async () => {
    const ws = await resolveStudioContext(WS);
    assert.match(rootPathFor(ws), /dupont-conseil$/);
    assert.match(rootPathFor(ws, "martin-digital"), /martin-digital$/);
    assert.throws(() => rootPathFor(ws, "nope"), (e) => e.code === "BAD_REQUEST");

    const single = await resolveStudioContext(EX);
    assert.equal(rootPathFor(single), single.rootPath);
    assert.throws(() => rootPathFor(single, "any-id"), (e) => e.code === "BAD_REQUEST");
  });
});

describe("studio api — tree (truth of the disk, confined)", () => {
  let dir;

  it("walks dirs/files, annotates resources, skips ignored and hidden entries, never follows symlinks", async () => {
    dir = await mkdtemp(path.join(tmpdir(), "base-studio-tree-"));
    const skill = ".ai/agents/a/skills/processes/p/SKILL.md";
    await mkdir(path.join(dir, path.dirname(skill)), { recursive: true });
    await writeFile(
      path.join(dir, skill),
      "---\nschema_version: base.resource.v1\nid: p\ntype: process\ntitle: P\ndescription: D.\n---\nBody.\n",
    );
    await mkdir(path.join(dir, "clients"));
    await writeFile(path.join(dir, "clients/notes.txt"), "plain text, not a resource");
    await writeFile(path.join(dir, "README.md"), "# hello");
    await mkdir(path.join(dir, "node_modules/x"), { recursive: true });
    await mkdir(path.join(dir, ".git"));
    await writeFile(path.join(dir, ".hidden"), "secret");
    await symlink(tmpdir(), path.join(dir, "escape-link"));

    const t = await tree(dir);
    assert.equal(t.path, "");
    const names = (n) => n.dirs.map((d) => d.name);
    assert.deepEqual(names(t), [".ai", "clients"]); // node_modules, .git, symlink all absent
    assert.deepEqual(t.files.map((f) => f.name), ["README.md"]); // .hidden absent
    // Every Markdown file is inventoried (README.md becomes a document resource)…
    assert.equal(t.files[0].resource.type, "document");

    // …while a non-Markdown file is a plain file (resource: null).
    const clients = t.dirs.find((d) => d.name === "clients");
    assert.equal(clients.files[0].path, "clients/notes.txt");
    assert.equal(clients.files[0].resource, null);

    let node = t.dirs.find((d) => d.name === ".ai");
    for (const part of ["agents", "a", "skills", "processes", "p"]) node = node.dirs.find((d) => d.name === part);
    assert.deepEqual(node.files[0].resource, { type: "process", id: "p", hasErrors: false });
    await rm(dir, { recursive: true, force: true });
  });
});

describe("studio api — list/search under + types masks", () => {
  it("lists in tree order by default and filters by under and types", async () => {
    const all = await listResources(EX, {});
    const sorted = [...all].sort((a, b) => a.path.localeCompare(b.path));
    assert.deepEqual(all.map((c) => c.path), sorted.map((c) => c.path));

    const under = await listResources(EX, { under: ".ai/agents/assistant-devis" });
    assert.ok(under.length > 0);
    assert.ok(under.every((c) => c.path.startsWith(".ai/agents/assistant-devis/")));

    const types = await listResources(EX, { types: ["process", "agent"] });
    assert.ok(types.every((c) => c.type === "process" || c.type === "agent"));
  });

  it("rejects an `under` that escapes the root", async () => {
    await assert.rejects(() => listResources(EX, { under: "../../secrets" }), (e) => e.code === "BAD_REQUEST");
  });

  it("search applies under/types as masks after ranking", async () => {
    const hits = await search(EX, "devis", { limit: 10, types: ["process"] });
    assert.ok(hits.length > 0);
    assert.ok(hits.every((h) => h.type === "process"));
    assert.ok(hits.every((h, i) => i === 0 || hits[i - 1].score >= h.score));
  });

  it("searchAllRoots fans out over workspace roots, merges by score and stamps rootId", async () => {
    const ctx = await resolveStudioContext(WS);
    const hits = await searchAllRoots(ctx, "devis", { limit: 10 });
    assert.ok(hits.length > 0);
    assert.ok(hits.every((h) => h.rootId === "dupont-conseil" || h.rootId === "martin-digital"));
    assert.ok(hits.every((h, i) => i === 0 || (hits[i - 1].score ?? 0) >= (h.score ?? 0)));
  });
});

describe("studio api — read-only file view", () => {
  it("reads a small text file, refuses escapes, binaries and missing files", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "base-studio-file-"));
    await writeFile(path.join(dir, "note.txt"), "hello");
    await writeFile(path.join(dir, "blob.bin"), Buffer.from([1, 0, 2]));
    try {
      const f = await readFileContent(dir, "note.txt");
      assert.deepEqual({ path: f.path, name: f.name, content: f.content }, { path: "note.txt", name: "note.txt", content: "hello" });
      await assert.rejects(() => readFileContent(dir, "../outside.txt"), (e) => e.code === "BAD_REQUEST");
      await assert.rejects(() => readFileContent(dir, "blob.bin"), (e) => e.code === "BAD_REQUEST" && /binary/.test(e.message));
      await assert.rejects(() => readFileContent(dir, "missing.txt"), (e) => e.code === "NOT_FOUND");
      await assert.rejects(() => readFileContent(dir, ""), (e) => e.code === "BAD_REQUEST");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe("studio api — editor save path (serializer → propose → commit, temp BASE)", () => {
  let dir;
  const rel = ".ai/agents/demo/skills/processes/p/SKILL.md";

  it("proposes a metadata edit as a diff, then commits it to disk", async () => {
    dir = await mkdtemp(path.join(tmpdir(), "base-studio-"));
    await mkdir(path.join(dir, path.dirname(rel)), { recursive: true });
    await writeFile(
      path.join(dir, rel),
      "---\nschema_version: base.resource.v1\nid: p\ntype: process\ntitle: P\ndescription: Original.\nscope: team\nstatus: active\nsensitivity: internal\nkeywords: [a, b]\n---\n# P\n\nBody.\n",
    );

    const before = await getResource(dir, "p");
    assert.deepEqual(before.data.keywords, ["a", "b"]);

    // Edit the structured metadata (add a keyword, change the description) + keep the body.
    const data = { ...before.data, description: "Edited via Studio.", keywords: ["a", "b", "c"] };
    const proposed = await proposeEdit(dir, { path: before.path, data, body: before.body });
    assert.ok(proposed.changeId.startsWith("chg_"));
    assert.equal(proposed.exists, true);
    assert.match(proposed.diff, /Edited via Studio/);

    const committed = await commitEdit(dir, proposed.changeId);
    assert.equal(committed.written, true);

    // Verify the file on disk round-trips to the new metadata.
    const after = await getResource(dir, "p");
    assert.equal(after.data.description, "Edited via Studio.");
    assert.deepEqual(after.data.keywords, ["a", "b", "c"]);
    assert.deepEqual(after.errors, []);
  });

  it("rejects an unrepresentable metadata field loudly (FrontmatterSerializeError)", async () => {
    const r = await getResource(dir, "p");
    await assert.rejects(
      () => proposeEdit(dir, { path: r.path, data: { ...r.data, "bad key": "x" }, body: r.body }),
      FrontmatterSerializeError,
    );
    await rm(dir, { recursive: true, force: true });
  });
});
