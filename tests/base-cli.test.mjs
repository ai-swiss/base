// Spec coverage: FR-CLI-001 FR-CLI-002 FR-CLI-003 FR-CLI-004 UR-CORE-002 FR-BUILD-004 FR-BUILD-005
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { promisify } from "node:util";
import { afterEach, beforeEach, describe, it } from "node:test";

const execFileAsync = promisify(execFile);
const cliPath = path.resolve("tools/base.mjs");
let tmpDir;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-cli-test-"));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

async function write(relativePath, content) {
  const fullPath = path.join(tmpDir, relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, "utf8");
}

async function fileExists(fullPath) {
  try {
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

describe("base CLI", () => {
  it("detects the nearest BASE root from cwd and shows it in normal output", async () => {
    await write(".ai/agents/demo/AGENT.md", "---\nid: demo\ntype: agent\ndescription: Demo.\n---\n# Demo\n");
    await fs.mkdir(path.join(tmpDir, "docs", "nested"), { recursive: true });

    const { stdout } = await execFileAsync("node", [cliPath, "validate"], {
      cwd: path.join(tmpDir, "docs", "nested"),
    });

    assert.match(stdout, /BASE root:/);
    assert.match(stdout, /BASE valide/);
  });

  it("fails helpfully when no BASE root or workspace can be inferred", async () => {
    await assert.rejects(
      () => execFileAsync("node", [cliPath, "validate"], { cwd: tmpDir }),
      (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, /No BASE root or workspace found/);
        assert.match(error.stderr, /--root/);
        return true;
      },
    );
  });

  it("uses a workspace default root for root-specific commands", async () => {
    const rootPath = path.join(tmpDir, "clients", "innovaud");
    await write("clients/innovaud/.ai/agents/demo/AGENT.md", "---\nid: demo\ntype: agent\ndescription: Demo.\n---\n# Demo\n");
    await write("base.workspace.json", JSON.stringify({
      schema_version: "base.workspace.v1",
      id: "ai-swiss",
      label: "AI Swiss",
      roots: [{ id: "innovaud", label: "Innovaud", path: "clients/innovaud", default: true }],
    }, null, 2));

    const { stdout } = await execFileAsync("node", [cliPath, "validate", "--workspace", tmpDir]);

    assert.match(stdout, /BASE workspace: AI Swiss/);
    assert.match(stdout, /BASE root: innovaud/);
    assert.match(stdout, /BASE valide/);
    assert.equal(await fileExists(path.join(rootPath, ".ai", "trace")), true);
  });

  it("routes across workspace roots and asks when several roots match", async () => {
    await write("one/.ai/agents/sales/AGENT.md", "---\nid: sales\ntype: agent\ndescription: Sales.\n---\n# Sales\n");
    await write("one/.ai/agents/sales/skills/processes/devis/SKILL.md", "---\nid: devis\ntype: process\ndescription: Créer un devis.\nuse_when: Quand l'utilisateur veut créer un devis client.\n---\n# Devis\n");
    await write("two/.ai/agents/sales/AGENT.md", "---\nid: sales\ntype: agent\ndescription: Sales.\n---\n# Sales\n");
    await write("two/.ai/agents/sales/skills/processes/devis/SKILL.md", "---\nid: devis\ntype: process\ndescription: Créer un devis.\nuse_when: Quand l'utilisateur veut créer un devis client.\n---\n# Devis\n");
    await write("base.workspace.json", JSON.stringify({
      schema_version: "base.workspace.v1",
      id: "demo-workspace",
      roots: [
        { id: "one", path: "one" },
        { id: "two", path: "two" },
      ],
    }, null, 2));

    const { stdout } = await execFileAsync("node", [cliPath, "route", "créer un devis client", "--workspace", tmpDir]);

    assert.match(stdout, /BASE workspace: demo-workspace/);
    assert.match(stdout, /Routing across: one, two/);
    assert.match(stdout, /ambiguous \(competing_roots\)/);
    assert.match(stdout, /Which root should BASE use/);
  });

  it("--root-id targets exactly the selected root and leaves siblings untouched", async () => {
    await write("one/.ai/agents/a/AGENT.md", "---\nid: a\ntype: agent\ndescription: One.\n---\n# One\n");
    await write("two/.ai/agents/b/AGENT.md", "---\nid: b\ntype: agent\ndescription: Two.\n---\n# Two\n");
    await write("base.workspace.json", JSON.stringify({
      schema_version: "base.workspace.v1",
      id: "ws",
      roots: [{ id: "one", path: "one" }, { id: "two", path: "two" }],
    }, null, 2));

    const { stdout } = await execFileAsync("node", [cliPath, "validate", "--workspace", tmpDir, "--root-id", "two"]);
    assert.match(stdout, /BASE root: two/);
    assert.match(stdout, /BASE valide/);
    // The selected root recorded a trace; the sibling root was never touched.
    assert.equal(await fileExists(path.join(tmpDir, "two", ".ai", "trace")), true);
    assert.equal(await fileExists(path.join(tmpDir, "one", ".ai", "trace")), false);
  });

  it("fails loudly on an unknown --root-id, listing available roots", async () => {
    await write("one/.ai/agents/a/AGENT.md", "---\nid: a\ntype: agent\ndescription: One.\n---\n# One\n");
    await write("base.workspace.json", JSON.stringify({
      schema_version: "base.workspace.v1", id: "ws", roots: [{ id: "one", path: "one" }],
    }, null, 2));

    await assert.rejects(
      () => execFileAsync("node", [cliPath, "validate", "--workspace", tmpDir, "--root-id", "ghost"]),
      (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, /Unknown workspace root "ghost".*one/s);
        return true;
      },
    );
  });

  it("fails loudly (not a raw ENOENT) when a selected root path is missing", async () => {
    await write("base.workspace.json", JSON.stringify({
      schema_version: "base.workspace.v1", id: "ws", roots: [{ id: "gone", path: "does-not-exist" }],
    }, null, 2));

    await assert.rejects(
      () => execFileAsync("node", [cliPath, "validate", "--workspace", tmpDir]),
      (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, /BASE root not found.*gone/s);
        assert.doesNotMatch(error.stderr, /ENOENT/);
        return true;
      },
    );
  });

  it("shows a help fallback on an honest abstention when routing.fallback is configured", async () => {
    await write(".ai/agents/help/AGENT.md", "---\nschema_version: base.resource.v1\nid: concierge-base\ntype: agent\ndescription: Aide.\n---\n# Aide\n");
    await write(".ai/agents/help/skills/processes/accueil/SKILL.md", "---\nschema_version: base.resource.v1\nid: accueil\ntype: process\ndescription: Accueil.\nuse_when: Afficher le menu d'aide.\n---\n# Accueil\n");
    await write("base.config.json", JSON.stringify({ routing: { fallback: { agent: "concierge-base", process: "accueil" } } }));

    const { stdout } = await execFileAsync("node", [cliPath, "route", "qwerty zzz gibberish nonsense", "--root", tmpDir]);
    assert.match(stdout, /out_of_scope/); // stays an honest abstention
    assert.match(stdout, /Fallback: concierge-base -> accueil/);
  });

  it("validates a minimal BASE project", async () => {
    await write("README.md", "# Demo\n");

    const { stdout } = await execFileAsync("node", [cliPath, "validate", "--root", tmpDir]);
    assert.match(stdout, /BASE valide/);
  });

  it("returns a failing exit when validation fails", async () => {
    await write("bad.md", "[missing](nowhere.md)\n");

    await assert.rejects(
      () => execFileAsync("node", [cliPath, "validate", "--root", tmpDir]),
      (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stdout, /BASE invalide/);
        return true;
      },
    );
  });

  it("indexes and discovers resources", async () => {
    await write("devis.md", "---\nid: devis\ntype: process\ndescription: Devis client.\n---\n# Devis\n");

    const indexResult = await execFileAsync("node", [cliPath, "index", "--root", tmpDir]);
    assert.match(indexResult.stdout, /base.manifest.json/);

    const discoverResult = await execFileAsync("node", [cliPath, "discover", "devis client", "--root", tmpDir]);
    assert.match(discoverResult.stdout, /devis/);
    assert.match(discoverResult.stdout, /score/);
  });

  it("routes requests, runs route fixtures, and builds a routing registry", async () => {
    await write(".ai/agents/sales/AGENT.md", "---\nid: sales\ntype: agent\ndescription: Ventes et devis clients.\n---\n# Sales\n");
    await write(".ai/agents/sales/skills/processes/devis/SKILL.md", "---\nid: nouveau-devis\ntype: process\ndescription: Créer un devis.\nuse_when: Quand l'utilisateur veut créer un devis client.\n---\n# Devis\n");
    await write(".ai/routing/route-tests.json", JSON.stringify([
      { request: "créer un devis client", expect: { status: "routed", agent: "sales", process: "nouveau-devis" } },
    ]));

    const routeResult = await execFileAsync("node", [cliPath, "route", "créer un devis client", "--root", tmpDir]);
    assert.match(routeResult.stdout, /routed/);
    assert.match(routeResult.stdout, /nouveau-devis/);

    const routeTestResult = await execFileAsync("node", [cliPath, "route-test", "--root", tmpDir]);
    assert.match(routeTestResult.stdout, /1\/1 OK/);

    const buildResult = await execFileAsync("node", [cliPath, "build", "routing-registry", "--root", tmpDir, "--json"]);
    assert.match(buildResult.stdout, /base.routing.v1/);
  });

  it("prints entretien report", async () => {
    await write("todo.md", "# Todo\n\nTODO: relire.\n");

    const { stdout } = await execFileAsync("node", [cliPath, "entretien", "--root", tmpDir]);
    assert.match(stdout, /Entretien BASE/);
    assert.match(stdout, /Fichiers avec marqueurs ouverts: 1/);
    assert.match(stdout, /Fichiers avec marqueurs d'action: 1/);
  });

  it("opens resources and dry-runs tools", async () => {
    await write("tools/hello.py", "print('hello')\n");
    await write(
      "tools/hello.md",
      [
        "---",
        "schema_version: base.resource.v1",
        "id: hello-tool",
        "type: tool",
        "description: Dire bonjour.",
        "execution:",
        "  type: script",
        "  runtime: python",
        "  entrypoint: hello.py",
        "  requires_confirmation: true",
        "---",
        "# Hello",
      ].join("\n"),
    );

    const openResult = await execFileAsync("node", [cliPath, "open", "hello-tool", "--projection", "metadata", "--root", tmpDir]);
    assert.match(openResult.stdout, /"id": "hello-tool"/);

    const invokeResult = await execFileAsync("node", [cliPath, "invoke", "hello-tool", "--root", tmpDir]);
    assert.match(invokeResult.stdout, /"dry_run": true/);
    assert.match(invokeResult.stdout, /hello\.py/);
  });

  it("inventories resources and lists open markers", async () => {
    await write("note.md", "---\nschema_version: base.resource.v1\nid: note\ntype: document\ndescription: Une note.\n---\n# Note\n\n[A VALIDER] relire le ton.\n");

    const inv = await execFileAsync("node", [cliPath, "inventory", "--root", tmpDir, "--json"]);
    assert.match(inv.stdout, /"id": "note"/);
    assert.doesNotMatch(inv.stdout, /"content"/);
    assert.doesNotMatch(inv.stdout, /"body"/);

    const markers = await execFileAsync("node", [cliPath, "markers", "--root", tmpDir]);
    assert.match(markers.stdout, /A VALIDER/);
  });

  it("propose → commit writes only after explicit confirmation", async () => {
    await write("source.txt", "nouveau contenu\n");

    // propose writes nothing; it returns a change_id and a diff.
    const proposed = await execFileAsync("node", [cliPath, "propose", "doc.md", "--from", path.join(tmpDir, "source.txt"), "--root", tmpDir, "--json"]);
    const { change_id } = JSON.parse(proposed.stdout);
    assert.match(change_id, /^chg_/);
    assert.equal(await fileExists(path.join(tmpDir, "doc.md")), false, "propose must not write the target");

    // commit without --confirmed is refused under the default (advisory) policy.
    await assert.rejects(
      () => execFileAsync("node", [cliPath, "commit", change_id, "--root", tmpDir]),
      (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, /confirmation/i);
        return true;
      },
    );
    assert.equal(await fileExists(path.join(tmpDir, "doc.md")), false, "refused commit must not write");

    // with --confirmed, the write goes through and the content is exactly what was proposed.
    const committed = await execFileAsync("node", [cliPath, "commit", change_id, "--confirmed", "--root", tmpDir]);
    assert.match(committed.stdout, /Changement applique: doc\.md/);
    assert.equal(await fs.readFile(path.join(tmpDir, "doc.md"), "utf8"), "nouveau contenu\n");
  });

  it("refuses propose --from paths outside the selected BASE root", async () => {
    const outsideDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-cli-outside-"));
    const outsideFile = path.join(outsideDir, "secret.txt");
    await fs.writeFile(outsideFile, "secret\n", "utf8");

    try {
      await assert.rejects(
        () => execFileAsync("node", [cliPath, "propose", "doc.md", "--from", outsideFile, "--root", tmpDir]),
        (error) => {
          assert.equal(error.code, 1);
          assert.match(error.stderr, /escapes BASE root/);
          return true;
        },
      );
    } finally {
      await fs.rm(outsideDir, { recursive: true, force: true });
    }
  });

  it("resolves a relative propose --from against the BASE root, not the working directory", async () => {
    await write("source.txt", "depuis la racine\n");
    // Launch the CLI from a DIFFERENT cwd (os.tmpdir, which has no source.txt). A cwd-relative
    // reading would fail or read the wrong file; a root-relative reading finds tmpDir/source.txt.
    const proposed = await execFileAsync(
      "node",
      [cliPath, "propose", "doc.md", "--from", "source.txt", "--root", tmpDir, "--json"],
      { cwd: os.tmpdir() },
    );
    const { change_id } = JSON.parse(proposed.stdout);
    assert.match(change_id, /^chg_/);
    const committed = await execFileAsync("node", [cliPath, "commit", change_id, "--confirmed", "--root", tmpDir]);
    assert.match(committed.stdout, /Changement applique: doc\.md/);
    assert.equal(await fs.readFile(path.join(tmpDir, "doc.md"), "utf8"), "depuis la racine\n");
  });

  it("sensitive target staging and commit both require explicit confirmation", async () => {
    await write(
      "client.md",
      "---\nschema_version: base.resource.v1\nid: client\ntype: data\ndescription: Donnee client.\nsensitivity: restricted\n---\n# Client\nv1\n",
    );
    await write("next.txt", "---\nschema_version: base.resource.v1\nid: client\ntype: data\ndescription: Donnee client.\nsensitivity: restricted\n---\n# Client\nv2\n");

    await assert.rejects(
      () => execFileAsync("node", [cliPath, "propose", "client.md", "--from", path.join(tmpDir, "next.txt"), "--root", tmpDir, "--json"]),
      (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, /Write denied/);
        return true;
      },
    );

    const proposed = await execFileAsync("node", [
      cliPath,
      "propose",
      "client.md",
      "--from",
      path.join(tmpDir, "next.txt"),
      "--confirmed",
      "--root",
      tmpDir,
      "--json",
    ]);
    const { change_id } = JSON.parse(proposed.stdout);

    await assert.rejects(
      () => execFileAsync("node", [cliPath, "commit", change_id, "--root", tmpDir]),
      (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, /confirmation/i);
        return true;
      },
    );

    const committed = await execFileAsync("node", [cliPath, "commit", change_id, "--confirmed", "--root", tmpDir]);
    assert.match(committed.stdout, /Changement applique: client\.md/);
    assert.match(await fs.readFile(path.join(tmpDir, "client.md"), "utf8"), /v2/);
  });

  it("promotes a resource to a wider scope through the mediated write path", async () => {
    await write(
      ".ai/agents/sales/skills/processes/devis/SKILL.md",
      "---\nschema_version: base.resource.v1\nid: nouveau-devis\ntype: process\nscope: personal\ndescription: Créer un devis.\n---\n# Devis\n",
    );

    const promoted = await execFileAsync("node", [cliPath, "promote", "nouveau-devis", "--to", "team", "--confirmed", "--root", tmpDir]);
    assert.match(promoted.stdout, /Promotion appliquee: nouveau-devis \(personal -> team\)/);
    assert.match(
      await fs.readFile(path.join(tmpDir, ".ai/agents/sales/skills/processes/devis/SKILL.md"), "utf8"),
      /scope: team/,
    );
  });

  it("exposes mediated access decisions and trace summaries", async () => {
    await write(
      "secret.md",
      [
        "---",
        "schema_version: base.resource.v1",
        "id: secret-client",
        "type: data",
        "description: Donnee client restreinte.",
        "sensitivity: restricted",
        "---",
        "# Secret",
      ].join("\n"),
    );

    await assert.rejects(
      () => execFileAsync("node", [cliPath, "access", "secret-client", "--root", tmpDir]),
      (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, /Access denied/);
        return true;
      },
    );

    const accessResult = await execFileAsync("node", [
      cliPath,
      "access",
      "secret-client",
      "--purpose",
      "verification",
      "--root",
      tmpDir,
    ]);
    assert.match(accessResult.stdout, /# Secret/);

    const traceResult = await execFileAsync("node", [cliPath, "trace", "--root", tmpDir]);
    assert.match(traceResult.stdout, /Trace BASE/);
    assert.match(traceResult.stdout, /Refus: 1/);
  });

  it("passes --grant-token to strict policy reads", async () => {
    await write("base.config.json", JSON.stringify({ policy: { type: "strict", grants: ["G1"] } }, null, 2));
    await write(
      "secret.md",
      [
        "---",
        "schema_version: base.resource.v1",
        "id: secret-client",
        "type: data",
        "description: Donnee client restreinte.",
        "sensitivity: restricted",
        "---",
        "# Secret",
      ].join("\n"),
    );

    await assert.rejects(
      () => execFileAsync("node", [cliPath, "access", "secret-client", "--root", tmpDir]),
      (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, /restricted/);
        return true;
      },
    );

    const accessResult = await execFileAsync("node", [
      cliPath,
      "access",
      "secret-client",
      "--grant-token",
      "G1",
      "--root",
      tmpDir,
    ]);
    assert.match(accessResult.stdout, /# Secret/);
  });

  it("trace prune --keep-days removes old daily files and keeps recent ones", async () => {
    await write(".ai/agents/demo/AGENT.md", "---\nid: demo\ntype: agent\ndescription: Demo.\n---\n# Demo\n");
    const traceDir = path.join(tmpDir, ".ai", "trace");
    await fs.mkdir(traceDir, { recursive: true });
    await fs.writeFile(path.join(traceDir, "2020-01-01.jsonl"), '{"op":"open"}\n', "utf8");
    await fs.writeFile(path.join(traceDir, "2099-01-01.jsonl"), '{"op":"open"}\n', "utf8");

    const { stdout } = await execFileAsync("node", [cliPath, "trace", "prune", "--keep-days", "30", "--root", tmpDir]);
    assert.match(stdout, /supprime/);

    const remaining = await fs.readdir(traceDir);
    assert.equal(remaining.includes("2020-01-01.jsonl"), false);
    assert.equal(remaining.includes("2099-01-01.jsonl"), true);
  });

  it("trace clear empties the journal; an unknown trace subcommand fails with usage", async () => {
    await write(".ai/agents/demo/AGENT.md", "---\nid: demo\ntype: agent\ndescription: Demo.\n---\n# Demo\n");
    const traceDir = path.join(tmpDir, ".ai", "trace");
    await fs.mkdir(traceDir, { recursive: true });
    await fs.writeFile(path.join(traceDir, "2026-06-09.jsonl"), '{"op":"route"}\n', "utf8");

    const clear = await execFileAsync("node", [cliPath, "trace", "clear", "--root", tmpDir]);
    assert.match(clear.stdout, /supprime|Aucun/);
    assert.deepEqual(await fs.readdir(traceDir), []);

    await assert.rejects(
      () => execFileAsync("node", [cliPath, "trace", "bogus", "--root", tmpDir]),
      (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, /Usage: base trace/);
        return true;
      },
    );
  });

  it("prints help on `help` and on no command", async () => {
    const viaHelp = await execFileAsync("node", [cliPath, "help"]);
    assert.match(viaHelp.stdout, /base validate/);
    assert.match(viaHelp.stdout, /base trace/);

    const viaNoArgs = await execFileAsync("node", [cliPath]);
    assert.match(viaNoArgs.stdout, /base route/);
  });

  it("fails with a clear message on an unknown command and on a flag missing its value", async () => {
    await write(".ai/agents/demo/AGENT.md", "---\nid: demo\ntype: agent\ndescription: Demo.\n---\n# Demo\n");

    await assert.rejects(
      () => execFileAsync("node", [cliPath, "frobnicate", "--root", tmpDir]),
      (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, /Unknown command: frobnicate/);
        return true;
      },
    );

    await assert.rejects(
      () => execFileAsync("node", [cliPath, "validate", "--root"], { cwd: tmpDir }),
      (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, /--root requires a value/);
        return true;
      },
    );
  });

  it("builds agents/tools/bootstrap artifacts and validates the docs model", async () => {
    await write(".ai/agents/demo/AGENT.md", "---\nid: demo\ntype: agent\ndescription: Demo agent.\n---\n# Demo\n");

    const build = await execFileAsync("node", [cliPath, "build", "all", "--root", tmpDir, "--json"]);
    assert.doesNotThrow(() => JSON.parse(build.stdout.replace(/^BASE root:.*\n\n?/m, "")));

    const docs = await execFileAsync("node", [cliPath, "docs", "validate", "--root", tmpDir, "--json"]);
    assert.doesNotThrow(() => JSON.parse(docs.stdout.replace(/^BASE root:.*\n\n?/m, "")));
  });
});
