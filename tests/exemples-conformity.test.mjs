// The example agents are the public face of BASE: they must stay structurally aligned with the
// method they demonstrate. These guards turn the conventions of `createur-agent` (150-line agents,
// a canonical concierge stub, demo/template twins) from advice into mechanism.

import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { LAUNCHER_SOURCE } from "../tools/core/launcher.mjs";
import { renderClaudeMd, renderCursorRule } from "../tools/core/bootstrap.mjs";

const repoRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const exemplesDir = path.join(repoRoot, "exemples");

async function listAgentFiles() {
  /** @type {{ example: string, file: string, content: string }[]} */
  const agents = [];
  for (const example of (await fs.readdir(exemplesDir, { withFileTypes: true })).filter((e) => e.isDirectory())) {
    const agentsDir = path.join(exemplesDir, example.name, ".ai", "agents");
    let entries;
    try {
      entries = await fs.readdir(agentsDir, { withFileTypes: true });
    } catch {
      continue; // multi-root examples nest their BASE projects deeper; covered via their own roots
    }
    for (const entry of entries.filter((e) => e.isDirectory())) {
      const file = path.join(agentsDir, entry.name, "AGENT.md");
      try {
        agents.push({ example: example.name, file, content: await fs.readFile(file, "utf8") });
      } catch {
        // a directory without AGENT.md is caught by `base validate`, not here
      }
    }
  }
  return agents;
}

describe("exemples: structural conformity", () => {
  it("keeps every example AGENT.md within the 150-line architecture rule", async () => {
    const agents = await listAgentFiles();
    assert.ok(agents.length >= 10, `expected the examples to carry many agents, got ${agents.length}`);
    for (const { file, content } of agents) {
      const lines = content.trimEnd().split("\n").length;
      assert.ok(lines <= 150, `${path.relative(repoRoot, file)} has ${lines} lines (architecture rule: max 150)`);
    }
  });

  it("keeps the concierge stubs canonical (same shape, only the business context varies)", async () => {
    const agents = await listAgentFiles();
    const stubs = agents.filter((a) => path.dirname(a.file).endsWith("concierge-base"));
    assert.ok(stubs.length >= 8, `expected a concierge stub in most examples, got ${stubs.length}`);
    for (const { file, content } of stubs) {
      const rel = path.relative(repoRoot, file);
      assert.match(content, /^---\nschema_version: base\.resource\.v1\nid: concierge-base\ntype: agent\ntitle: Accueil\n/, `${rel}: canonical frontmatter head`);
      assert.match(content, /agis comme l'accueil: tu orientes, sans jamais laisser/, `${rel}: canonical role line`);
      assert.match(content, /Tu es chargé surtout en \*\*repli\*\*: quand le routeur s'abstient honnêtement/, `${rel}: canonical fallback line`);
      const lines = content.trimEnd().split("\n").length;
      assert.ok(lines <= 22, `${rel}: a stub stays a stub (${lines} lines, max 22)`);
    }
  });

  it("keeps assistant-devis and its demo twin byte-identical (same agent, two datasets)", async () => {
    const template = await fs.readFile(path.join(exemplesDir, "assistant-devis", ".ai", "agents", "assistant-devis", "AGENT.md"), "utf8");
    const demo = await fs.readFile(path.join(exemplesDir, "assistant-devis-demo", ".ai", "agents", "assistant-devis", "AGENT.md"), "utf8");
    assert.equal(demo, template, "assistant-devis-demo/AGENT.md drifted from assistant-devis/AGENT.md; edit both together");
  });

  it("keeps French example content free of em-dashes (release checklist, mechanized)", async () => {
    const agents = await listAgentFiles();
    for (const { file, content } of agents) {
      assert.equal(content.includes("\u2014"), false, `${path.relative(repoRoot, file)} contains an em-dash`);
    }
  });

  // The showcase quote is the first finished document the demo invites a visitor to open, and the
  // process that produces it forbids rounding ("les centimes comptent"). Its own arithmetic must be
  // exact to the centime, or the example contradicts the discipline it teaches.
  // The shipped quote must match the SCHEMA the deterministic tool (calculer-devis_v1.py) reads —
  // `prestations[]` + `financier{}` — or the tool errors on the one file the README tells you to run
  // it on, breaking the very demo that shows an LLM using deterministic code. This replicates the
  // tool's computation in JS, so a flat or drifted schema, or a wrong total, fails here.
  it("the showcase quote DEV-2026-001 matches the calculer-devis tool contract, exact to the centime", async () => {
    const q = JSON.parse(await fs.readFile(path.join(exemplesDir, "assistant-devis-demo", "devis", "DEV-2026-001.json"), "utf8"));
    const cents = (n) => Math.round(n * 100);
    assert.ok(Array.isArray(q.prestations) && q.prestations.length > 0, "missing prestations[] (the tool would error)");
    assert.ok(q.financier?.tva && q.financier?.remise, "missing financier{tva,remise} (the tool would error)");
    const f = q.financier;
    const lineCents = q.prestations.map((p) => cents(p.quantite * p.prix_unitaire_chf));
    q.prestations.forEach((p, i) => assert.equal(cents(p.total_chf), lineCents[i], `prestation ${p.numero}: total_chf is not quantité × prix`));
    const htCents = lineCents.reduce((a, b) => a + b, 0);
    assert.equal(cents(f.sous_total_ht_chf), htCents, "sous_total_ht_chf is not the sum of the lines");
    const afterCents = htCents - cents(f.remise.montant_chf);
    assert.equal(cents(f.sous_total_apres_remise_chf), afterCents, "sous_total_apres_remise_chf is not HT − remise");
    assert.equal(cents(f.tva.montant_chf), Math.round((afterCents * f.tva.taux_pourcent) / 100), "the VAT is not the rate applied after discount");
    assert.equal(cents(f.total_ttc_chf), afterCents + cents(f.tva.montant_chf), "TTC is not après-remise + VAT");
    assert.equal(cents(f.acompte_chf), Math.round(cents(f.total_ttc_chf) * 0.3), "the 30% deposit is not exact to the centime");
    assert.equal(cents(f.acompte_chf) + cents(f.solde_chf), cents(f.total_ttc_chf), "deposit + balance does not equal TTC");
  });
});

describe("starter-perso and veytaux-tourisme follow the minimal harness convention of every example", () => {
  it("ship a minimal CLAUDE.md (@import) and .cursor rule, no full generated artifacts", async () => {
    for (const ex of ["starter-perso", "veytaux-tourisme"]) {
      const root = path.join(exemplesDir, ex);
      const claude = await fs.readFile(path.join(root, "CLAUDE.md"), "utf8");
      assert.match(claude, /@\.ai\/agents\/[\w-]+\/AGENT\.md/, `${ex}/CLAUDE.md should @import its agent`);
      assert.ok(!claude.includes("Quand router"), `${ex}/CLAUDE.md should be minimal, not the full router body`);
      // The full generated artifacts are NOT committed to examples (only the framework root carries them).
      for (const full of ["BASE_BOOTSTRAP.md", ".ai/tools.md"]) {
        const there = await fs.access(path.join(root, full)).then(() => true, () => false);
        assert.equal(there, false, `${ex}/${full} should not be committed (examples stay minimal)`);
      }
    }
  });

  it("ship the launcher so the tutorial's `node .ai/base.mjs … --root .` runs from inside the folder", async () => {
    for (const ex of ["starter-perso", "veytaux-tourisme"]) {
      const launcher = await fs.readFile(path.join(exemplesDir, ex, ".ai", "base.mjs"), "utf8");
      assert.equal(launcher, LAUNCHER_SOURCE, `${ex}/.ai/base.mjs drifted from tools/core/launcher.mjs`);
    }
  });
});

describe("every example offers a first win in its README (open / say exactly / expect)", () => {
  it("each example README carries the '## Essayez en 30 secondes' block with an exact command", async () => {
    const dirs = (await fs.readdir(exemplesDir, { withFileTypes: true })).filter((e) => e.isDirectory());
    let checked = 0;
    for (const dir of dirs) {
      const readme = path.join(exemplesDir, dir.name, "README.md");
      let md;
      try {
        md = await fs.readFile(readme, "utf8");
      } catch {
        continue; // a directory without a README is out of scope here
      }
      checked += 1;
      assert.match(md, /## Essayez en 30 secondes/, `${dir.name}/README.md: missing the first-win header`);
      assert.match(md, /«[^»]+»/, `${dir.name}/README.md: the first win must quote the exact command to say`);
      assert.match(md, /ce dossier/i, `${dir.name}/README.md: must tell the user to open THIS folder, not the root`);
    }
    assert.ok(checked >= 12, `expected first-win headers across the examples, checked ${checked}`);
  });
});

// The harness must match the README promise: a chat-open example that says "open this folder" must
// carry a legal harness at the folder you open. Two legal shapes, chosen by métier-agent count:
// A (pointer to one AGENT.md) for a single agent; B (the generated router bootstrap + launcher) for
// several. Derived from the tree, not a hand-kept list, so a new example is covered automatically.
const exists = (p) => fs.access(p).then(() => true, () => false);
const rel = (p) => path.relative(repoRoot, p);

async function metierAgentCount(root) {
  try {
    const entries = await fs.readdir(path.join(root, ".ai", "agents"), { withFileTypes: true });
    return entries.filter((e) => e.isDirectory() && e.name !== "concierge-base").length;
  } catch {
    return 0;
  }
}

function isChatOpen(md) {
  return /## Essayez en 30 secondes/.test(md) && /(Claude Code|Cursor)/.test(md) && !/<!--\s*harness:\s*cli-only\s*-->/.test(md);
}

// Every BASE root a chat-open README invites you to open: top-level single-root examples, plus each
// declared root of a workspace example (the workspace folder itself is not a root).
async function chatOpenRoots() {
  const single = [];
  const workspaceClients = [];
  for (const e of (await fs.readdir(exemplesDir, { withFileTypes: true })).filter((d) => d.isDirectory())) {
    const root = path.join(exemplesDir, e.name);
    if (await exists(path.join(root, "base.workspace.json"))) {
      const ws = JSON.parse(await fs.readFile(path.join(root, "base.workspace.json"), "utf8"));
      for (const r of ws.roots ?? []) workspaceClients.push(path.join(root, r.path));
      continue;
    }
    if (!(await exists(path.join(root, ".ai", "agents")))) continue;
    const md = await fs.readFile(path.join(root, "README.md"), "utf8").catch(() => "");
    if (!isChatOpen(md)) continue;
    single.push({ root, metier: await metierAgentCount(root) });
  }
  return { single, workspaceClients };
}

describe("exemples: thin harness matches the README promise (shape A/B by agent count)", () => {
  it("single-agent chat-open roots use a pointer harness (shape A, no router body)", async () => {
    const { single, workspaceClients } = await chatOpenRoots();
    const roots = single.filter((s) => s.metier === 1).map((s) => s.root).concat(workspaceClients);
    assert.ok(roots.length >= 10, `expected many shape-A roots, got ${roots.length}`);
    for (const root of roots) {
      const claude = await fs.readFile(path.join(root, "CLAUDE.md"), "utf8");
      assert.match(claude, /@\.ai\/agents\/[\w-]+\/AGENT\.md/, `${rel(root)}/CLAUDE.md must @import its agent (shape A)`);
      assert.ok(!claude.includes("Quand router"), `${rel(root)}/CLAUDE.md must be a pointer, not the full router body`);
      assert.ok(await exists(path.join(root, ".cursor", "rules", "assistant.mdc")), `${rel(root)} must ship a .cursor rule`);
      for (const full of ["BASE_BOOTSTRAP.md", ".ai/tools.md"]) {
        assert.equal(await exists(path.join(root, full)), false, `${rel(root)}/${full} must not be committed (examples stay minimal)`);
      }
    }
  });

  it("multi-agent chat-open roots use the generated router bootstrap + launcher (shape B)", async () => {
    const { single } = await chatOpenRoots();
    const roots = single.filter((s) => s.metier >= 2).map((s) => s.root);
    assert.ok(roots.some((r) => r.endsWith("routage-pme")), "routage-pme should be detected as a shape-B root");
    for (const root of roots) {
      const claude = await fs.readFile(path.join(root, "CLAUDE.md"), "utf8");
      assert.equal(claude, renderClaudeMd(), `${rel(root)}/CLAUDE.md must equal the generated router (renderClaudeMd)`);
      const cursor = await fs.readFile(path.join(root, ".cursor", "rules", "assistant.mdc"), "utf8");
      assert.equal(cursor, renderCursorRule(), `${rel(root)} .cursor rule must equal the generated router (renderCursorRule)`);
      const launcher = await fs.readFile(path.join(root, ".ai", "base.mjs"), "utf8");
      assert.equal(launcher, LAUNCHER_SOURCE, `${rel(root)} launcher drifted from LAUNCHER_SOURCE`);
      for (const full of ["BASE_BOOTSTRAP.md", ".ai/tools.md"]) {
        assert.equal(await exists(path.join(root, full)), false, `${rel(root)}/${full} must not be committed`);
      }
    }
  });

  it("a workspace root is a steer, not a router (no router body, no local @AGENT import)", async () => {
    for (const e of (await fs.readdir(exemplesDir, { withFileTypes: true })).filter((d) => d.isDirectory())) {
      const root = path.join(exemplesDir, e.name);
      if (!(await exists(path.join(root, "base.workspace.json")))) continue;
      const claudePath = path.join(root, "CLAUDE.md");
      if (!(await exists(claudePath))) continue; // a steer file is optional; README-only honesty is also legal
      const claude = await fs.readFile(claudePath, "utf8");
      assert.ok(!claude.includes("Quand router"), `${rel(root)}/CLAUDE.md (workspace) must not be a router body`);
      assert.ok(!/@\.ai\/agents\//.test(claude), `${rel(root)}/CLAUDE.md (workspace) has no local agents to @import`);
      assert.match(claude, /workspace/i, `${rel(root)}/CLAUDE.md should identify itself as a workspace steer`);
    }
  });
});

describe("journal competence — the continuity sentences hold across every delivered copy", () => {
  // The standard competences are delivered BY COPY (each root is self-contained by contract). The two
  // continuity rules — re-read the active files when the process path can no longer be cited, and the
  // reduced Progression entry written AT interruption (the one exception to journal-at-the-end) — must
  // therefore hold in EVERY copy, or the workshop copy a company starts from ships without them. The
  // set is enumerated, and floored: deleting a copy cannot silently shrink the walk.
  it("every journal/SKILL.md copy carries the re-read trigger and the interruption anchor", async () => {
    const roots = [path.join(repoRoot, ".ai", "agents")];
    for (const example of (await fs.readdir(exemplesDir, { withFileTypes: true })).filter((e) => e.isDirectory())) {
      roots.push(path.join(exemplesDir, example.name, ".ai", "agents"));
    }
    const copies = [];
    for (const agentsDir of roots) {
      let agents;
      try {
        agents = await fs.readdir(agentsDir, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const agent of agents.filter((e) => e.isDirectory())) {
        const file = path.join(agentsDir, agent.name, "skills", "competences", "journal", "SKILL.md");
        try {
          copies.push({ file, content: await fs.readFile(file, "utf8") });
        } catch {
          // an agent without the journal competence is legal; the floor below guards the known set
        }
      }
    }
    assert.ok(copies.length >= 11, `expected ≥ 11 journal copies, found ${copies.length}`);
    for (const { file, content } of copies) {
      const rel = path.relative(repoRoot, file);
      assert.ok(content.includes("en cours de session"), `${rel}: the intra-session re-read trigger is missing`);
      assert.ok(content.includes("rouvre l'`AGENT.md` et le `SKILL.md` actifs"), `${rel}: the re-read gesture is missing`);
      assert.ok(content.includes("l'unique cas où le journal s'écrit hors de la dernière étape"), `${rel}: the interruption anchor is missing`);
    }
  });
});

describe("AGENTS.md family — every example root carries its pinned entry, coherent with the Cursor rule", () => {
  // DELIBERATE REVERSAL of the former "examples stay minimal" rule for this ONE file: the AGENTS.md
  // family (Codex, Copilot, Jules…) reads AGENTS.md and nothing else — without it, half the market's
  // harnesses opened an example and found no entry point at all, while the README claims neutrality.
  // The committed AGENTS.md is a two-line HAND-PINNED pointer (never the generated router body, never
  // the Claude-specific @import); this test is the committed gate that keeps the three entries
  // coherent per root, so the pointer copies cannot drift apart (the launcher hand-list already
  // demonstrated that failure mode).
  it("each root with CLAUDE.md ships AGENTS.md, and shape-A pointers name the same AGENT.md as the Cursor rule", async () => {
    const roots = [];
    for (const entry of (await fs.readdir(exemplesDir, { withFileTypes: true })).filter((e) => e.isDirectory())) {
      roots.push(path.join(exemplesDir, entry.name));
      const clients = path.join(exemplesDir, entry.name, "clients");
      try {
        for (const client of (await fs.readdir(clients, { withFileTypes: true })).filter((e) => e.isDirectory())) {
          roots.push(path.join(clients, client.name));
        }
      } catch {
        // no clients/
      }
    }
    let checked = 0;
    for (const root of roots) {
      if (!(await exists(path.join(root, "CLAUDE.md")))) continue;
      checked++;
      const agentsPath = path.join(root, "AGENTS.md");
      assert.ok(await exists(agentsPath), `${rel(root)}/AGENTS.md is missing — the AGENTS.md family gets no entry`);
      const agents = await fs.readFile(agentsPath, "utf8");
      assert.ok(!agents.includes("Quand router"), `${rel(root)}/AGENTS.md must be a pinned pointer, not the router body`);
      assert.ok(!/@\.ai\/agents\//.test(agents), `${rel(root)}/AGENTS.md must not use the Claude-specific @import`);
      // Shape-A coherence: the pointer names the SAME AGENT.md as the folder's Cursor rule.
      const cursorPath = path.join(root, ".cursor", "rules", "assistant.mdc");
      if (await exists(cursorPath)) {
        const cursor = await fs.readFile(cursorPath, "utf8");
        const m = cursor.match(/Lis `(\.ai\/agents\/[\w-]+\/AGENT\.md)`/);
        if (m) {
          assert.ok(agents.includes(m[1]), `${rel(root)}/AGENTS.md must name ${m[1]} (the Cursor rule does)`);
        }
      }
    }
    assert.ok(checked >= 15, `expected ≥ 15 roots with entries, checked ${checked}`);
  });
});
