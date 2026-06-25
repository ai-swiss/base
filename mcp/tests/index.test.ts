// Spec coverage: FR-MCP-001 FR-MCP-002 FR-MCP-003 FR-MCP-004 FR-MCP-005 FR-EGRESS-004 FR-FEEDBACK-003 RC-MCP-001
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import {
  discoverAgents,
  extractDescription,
  extractDataFiles,
  bundleAgentBootstrap,
  formatDataListing,
  parseArgs,
  isLoopbackHost,
  remoteExposureError,
  crossOriginError,
  createServer,
} from "../src/index.js";
import {
  confineToProject,
  inventoryResources,
  searchResources,
  routeRequest,
  openResource,
  accessResource,
  invokeTool,
  type AgentInfo,
} from "../src/index.js";
import { noAuth, bearerTokenAuth, resolveAuthProvider, authMiddleware } from "../src/auth.js";

// ---------------------------------------------------------------------------
// Test Fixtures - created fresh per test for full isolation
// ---------------------------------------------------------------------------

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-mcp-test-"));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

async function createAgentFixture(
  rootDir: string,
  name: string,
  options: {
    agentMd?: string;
    skills?: Record<string, string>;
    templates?: Record<string, string>;
    tools?: Record<string, string>;
    dataFiles?: Record<string, string>;
    dataDirs?: Record<string, Record<string, string>>;
  } = {},
) {
  const agentDir = path.join(rootDir, ".ai", "agents", name);
  await fs.mkdir(agentDir, { recursive: true });

  // AGENT.md
  await fs.writeFile(
    path.join(agentDir, "AGENT.md"),
    options.agentMd ?? `# ${name}\n\n**Quand ce fichier est chargé, agis comme un assistant test.**\n`,
  );

  // Resource directories
  const dirs = { skills: options.skills, templates: options.templates, tools: options.tools };
  for (const [dir, files] of Object.entries(dirs)) {
    const dirPath = path.join(agentDir, dir);
    await fs.mkdir(dirPath, { recursive: true });
    if (files) {
      for (const [filename, content] of Object.entries(files)) {
        const filePath = path.join(dirPath, filename);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content);
      }
    }
  }

  // Data files (flat)
  if (options.dataFiles) {
    for (const [filePath, content] of Object.entries(options.dataFiles)) {
      const fullPath = path.join(rootDir, filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content);
    }
  }

  // Data directories
  if (options.dataDirs) {
    for (const [dirName, files] of Object.entries(options.dataDirs)) {
      const dirPath = path.join(rootDir, dirName);
      await fs.mkdir(dirPath, { recursive: true });
      for (const [filename, content] of Object.entries(files)) {
        await fs.writeFile(path.join(dirPath, filename), content);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// extractDescription
// ---------------------------------------------------------------------------

describe("extractDescription", () => {
  it("extracts role from 'agis comme' pattern", () => {
    const content = '# Agent\n\n**Quand ce fichier est chargé, agis comme un assistant devis.**\n';
    expect(extractDescription(content)).toBe("Un assistant devis");
  });

  it("capitalizes first letter of extracted role", () => {
    const content = "# Agent\n\n**Quand ce fichier est chargé, agis comme un expert.**\n";
    expect(extractDescription(content)).toBe("Un expert");
  });

  it("returns raw line when no 'agis comme' pattern", () => {
    const content = "# Mon Agent\n\nCeci est une description simple.\n";
    expect(extractDescription(content)).toBe("Ceci est une description simple.");
  });

  it("strips bold markers", () => {
    const content = "# Agent\n\n**Description en gras.**\n";
    expect(extractDescription(content)).toBe("Description en gras.");
  });

  it("skips blank lines between title and description", () => {
    const content = "# Agent\n\n\n\nDescription après blancs.\n";
    expect(extractDescription(content)).toBe("Description après blancs.");
  });

  it("returns agent name when no description found", () => {
    const content = "# Agent\n";
    // extractDescription falls through to return "" since it doesn't have the name
    // but the parseAgent function provides the name as fallback
    expect(extractDescription(content)).toBe("");
  });
});

// ---------------------------------------------------------------------------
// extractDataFiles
// ---------------------------------------------------------------------------

describe("extractDataFiles", () => {
  it("parses data file table from AGENT.md", () => {
    const content = [
      "## Fichiers métier",
      "",
      "| Fichier | Contenu |",
      "|---------|---------|",
      "| `entreprise/identite.md` | Identité de l'entreprise |",
      "| `catalogue/services.json` | Catalogue de services |",
      "",
      "## Ressources",
    ].join("\n");

    const files = extractDataFiles(content);
    expect(files).toEqual([
      { path: "entreprise/identite.md", description: "Identité de l'entreprise" },
      { path: "catalogue/services.json", description: "Catalogue de services" },
    ]);
  });

  it("handles directory paths (trailing slash)", () => {
    const content = [
      "## Fichiers métier",
      "",
      "| Fichier | Contenu |",
      "|---------|---------|",
      "| `clients/` | Fiches clients |",
      "",
      "---",
    ].join("\n");

    const files = extractDataFiles(content);
    expect(files).toEqual([{ path: "clients/", description: "Fiches clients" }]);
  });

  it("returns empty array when no data files section", () => {
    const content = "# Agent\n\nNo data files here.\n";
    expect(extractDataFiles(content)).toEqual([]);
  });

  it("returns empty array when table has no rows", () => {
    const content = [
      "## Fichiers métier",
      "",
      "| Fichier | Contenu |",
      "|---------|---------|",
      "",
      "## Next section",
    ].join("\n");

    expect(extractDataFiles(content)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// discoverAgents
// ---------------------------------------------------------------------------

describe("discoverAgents", () => {
  it("discovers agents in .ai/agents/", async () => {
    await createAgentFixture(tmpDir, "test-agent");
    const agents = await discoverAgents(tmpDir);
    expect(agents).toHaveLength(1);
    expect(agents[0].name).toBe("test-agent");
  });

  it("discovers agents in exemples/", async () => {
    const exampleRoot = path.join(tmpDir, "exemples", "my-example");
    await fs.mkdir(exampleRoot, { recursive: true });
    await createAgentFixture(exampleRoot, "example-agent");

    const agents = await discoverAgents(tmpDir);
    expect(agents).toHaveLength(1);
    expect(agents[0].name).toBe("example-agent");
    expect(agents[0].projectRoot).toBe(exampleRoot);
  });

  it("discovers agents in arbitrary nested BASE project roots", async () => {
    const nestedRoot = path.join(tmpDir, "collaborations", "innovaud");
    await fs.mkdir(nestedRoot, { recursive: true });
    await createAgentFixture(nestedRoot, "nested-agent");

    const agents = await discoverAgents(tmpDir);

    expect(agents).toHaveLength(1);
    expect(agents[0].name).toBe("nested-agent");
    expect(agents[0].projectRoot).toBe(nestedRoot);
  });

  it("skips directories starting with underscore", async () => {
    await createAgentFixture(tmpDir, "real-agent");

    // Create _template manually
    const templateDir = path.join(tmpDir, ".ai", "agents", "_template");
    await fs.mkdir(templateDir, { recursive: true });
    await fs.writeFile(path.join(templateDir, "AGENT.md"), "# Template\n\nSkip me.\n");

    const agents = await discoverAgents(tmpDir);
    expect(agents).toHaveLength(1);
    expect(agents[0].name).toBe("real-agent");
  });

  it("returns empty array when no agents exist", async () => {
    const agents = await discoverAgents(tmpDir);
    expect(agents).toEqual([]);
  });

  it("discovers agents from both project and examples", async () => {
    await createAgentFixture(tmpDir, "project-agent");
    const exampleRoot = path.join(tmpDir, "exemples", "ex1");
    await fs.mkdir(exampleRoot, { recursive: true });
    await createAgentFixture(exampleRoot, "example-agent");

    const agents = await discoverAgents(tmpDir);
    expect(agents).toHaveLength(2);
    const names = agents.map((a) => a.name);
    expect(names).toContain("project-agent");
    expect(names).toContain("example-agent");
  });
});

describe("bundleAgentBootstrap", () => {
  it("includes AGENT.md and resource catalog without resource contents", async () => {
    await createAgentFixture(tmpDir, "bootstrap-agent", {
      agentMd: "# Agent\n\nBootstrap content.\n",
      skills: { "processes/nouveau-devis/SKILL.md": "# Nouveau devis\nStep 1. Do things." },
      templates: { "doc_v1.md": "# Document\n[PLACEHOLDER]" },
    });

    const agents = await discoverAgents(tmpDir);
    const bootstrap = await bundleAgentBootstrap(agents[0]);

    expect(bootstrap).toContain("# Agent: bootstrap-agent");
    expect(bootstrap).toContain("Bootstrap content.");
    expect(bootstrap).toContain("# Ressources disponibles");
    expect(bootstrap).toContain("processes-nouveau-devis-skill-md");
    expect(bootstrap).toContain("templates-doc-v1-md");
    expect(bootstrap).not.toContain("Step 1. Do things.");
    expect(bootstrap).not.toContain("[PLACEHOLDER]");
  });
});

// ---------------------------------------------------------------------------
// formatDataListing
// ---------------------------------------------------------------------------

describe("formatDataListing", () => {
  it("formats available data files as a list", () => {
    const agent: AgentInfo = {
      name: "test",
      description: "test",
      agentDir: "/fake",
      projectRoot: "/fake",
      dataFiles: [
        { path: "entreprise/identite.md", description: "Identité" },
        { path: "clients/", description: "Fiches clients" },
      ],
    };

    const listing = formatDataListing(agent);
    expect(listing).toContain("`entreprise/identite.md`");
    expect(listing).toContain("`clients/`");
    expect(listing).toContain("access_resource");
  });

  it("returns empty string when no data files", () => {
    const agent: AgentInfo = {
      name: "test",
      description: "test",
      agentDir: "/fake",
      projectRoot: "/fake",
      dataFiles: [],
    };

    expect(formatDataListing(agent)).toBe("");
  });
});

// ---------------------------------------------------------------------------
// parseArgs
// ---------------------------------------------------------------------------

describe("parseArgs", () => {
  it("returns defaults with no arguments", () => {
    const args = parseArgs([]);
    expect(args.transport).toBe("stdio");
    expect(args.port).toBe(3100);
    expect(args.host).toBe("127.0.0.1");
    expect(args.logLevel).toBe("info");
    expect(args.readOnly).toBe(false);
  });

  it("parses all flags", () => {
    const args = parseArgs([
      "--root",
      "/tmp/test",
      "--workspace",
      "/tmp/workspace",
      "--root-id",
      "innovaud",
      "--transport",
      "http",
      "--port",
      "8080",
      "--host",
      "0.0.0.0",
      "--log-level",
      "debug",
    ]);
    expect(args.root).toBe("/tmp/test");
    expect(args.workspace).toBe("/tmp/workspace");
    expect(args.rootId).toBe("innovaud");
    expect(args.transport).toBe("http");
    expect(args.port).toBe(8080);
    expect(args.host).toBe("0.0.0.0");
    expect(args.logLevel).toBe("debug");
    expect(args.readOnly).toBe(true);
  });

  it("defaults HTTP transport to read-only", () => {
    const args = parseArgs(["--transport", "http"]);
    expect(args.readOnly).toBe(true);
  });

  it("allows explicit read-write HTTP transport", () => {
    const args = parseArgs(["--transport", "http", "--read-write"]);
    expect(args.readOnly).toBe(false);
  });

  it("allows env override for read-write HTTP transport", () => {
    const previous = process.env.BASE_MCP_READ_ONLY;
    process.env.BASE_MCP_READ_ONLY = "0";
    try {
      const args = parseArgs(["--transport", "http"]);
      expect(args.readOnly).toBe(false);
    } finally {
      if (previous === undefined) delete process.env.BASE_MCP_READ_ONLY;
      else process.env.BASE_MCP_READ_ONLY = previous;
    }
  });

  it("honours env read-only for stdio transport", () => {
    const previous = process.env.BASE_MCP_READ_ONLY;
    process.env.BASE_MCP_READ_ONLY = "1";
    try {
      const args = parseArgs([]);
      expect(args.transport).toBe("stdio");
      expect(args.readOnly).toBe(true);
    } finally {
      if (previous === undefined) delete process.env.BASE_MCP_READ_ONLY;
      else process.env.BASE_MCP_READ_ONLY = previous;
    }
  });

  it("lets --read-write override BASE_MCP_READ_ONLY=1 explicitly", () => {
    const previous = process.env.BASE_MCP_READ_ONLY;
    process.env.BASE_MCP_READ_ONLY = "1";
    try {
      const args = parseArgs(["--transport", "http", "--read-write"]);
      expect(args.readOnly).toBe(false);
    } finally {
      if (previous === undefined) delete process.env.BASE_MCP_READ_ONLY;
      else process.env.BASE_MCP_READ_ONLY = previous;
    }
  });

  it("throws on invalid transport", () => {
    expect(() => parseArgs(["--transport", "websocket"])).toThrow("Invalid transport");
  });

  it("throws on invalid port", () => {
    expect(() => parseArgs(["--port", "abc"])).toThrow("Invalid port");
  });

  it("throws on invalid log level", () => {
    expect(() => parseArgs(["--log-level", "verbose"])).toThrow("Invalid log level");
  });

  it("throws when --root has no value", () => {
    expect(() => parseArgs(["--root"])).toThrow("--root requires a value");
  });

  it("throws when --root value looks like a flag", () => {
    expect(() => parseArgs(["--root", "--transport"])).toThrow("--root requires a value");
  });

  it("throws when --port has no value", () => {
    expect(() => parseArgs(["--port"])).toThrow("--port requires a value");
  });

  it("throws when --transport has no value", () => {
    expect(() => parseArgs(["--transport"])).toThrow("--transport requires a value");
  });

  it("throws when --host has no value", () => {
    expect(() => parseArgs(["--host"])).toThrow("--host requires a value");
  });

  it("throws on port below 1", () => {
    expect(() => parseArgs(["--port", "0"])).toThrow("Must be between 1 and 65535");
  });

  it("throws on port above 65535", () => {
    expect(() => parseArgs(["--port", "70000"])).toThrow("Must be between 1 and 65535");
  });

  it("throws on negative port", () => {
    expect(() => parseArgs(["--port", "-1"])).toThrow("Must be between 1 and 65535");
  });
});

// ---------------------------------------------------------------------------
// confineToProject - path traversal prevention
// ---------------------------------------------------------------------------

describe("confineToProject", () => {
  it("allows paths within project root", async () => {
    const result = await confineToProject(tmpDir, "data/file.md");
    expect(result).toBe(path.join(tmpDir, "data", "file.md"));
  });

  it("allows the project root itself", async () => {
    const result = await confineToProject(tmpDir, ".");
    const canonicalRoot = await fs.realpath(path.resolve(tmpDir));
    expect(result).toBe(canonicalRoot);
  });

  it("blocks ../../ traversal", async () => {
    await expect(confineToProject(tmpDir, "../../etc/passwd")).rejects.toThrow("Path traversal blocked");
  });

  it("blocks absolute paths outside root", async () => {
    await expect(confineToProject(tmpDir, "/etc/passwd")).rejects.toThrow("Path traversal blocked");
  });

  it("blocks traversal disguised with intermediate dirs", async () => {
    await expect(confineToProject(tmpDir, "data/../../../etc/passwd")).rejects.toThrow("Path traversal blocked");
  });

  it("allows nested relative paths", async () => {
    const result = await confineToProject(tmpDir, "entreprise/identite.md");
    expect(result).toBe(path.join(tmpDir, "entreprise", "identite.md"));
  });

  it("resolves existing paths via realpath", async () => {
    const dataDir = path.join(tmpDir, "data");
    await fs.mkdir(dataDir);
    await fs.writeFile(path.join(dataDir, "file.md"), "content");

    const result = await confineToProject(tmpDir, "data/file.md");
    // realpath resolves symlinks - result should still be within canonical tmpDir
    const canonicalRoot = await fs.realpath(path.resolve(tmpDir));
    expect(result.startsWith(canonicalRoot)).toBe(true);
  });

  it("blocks symlinks pointing outside project root", async () => {
    // Create a directory outside the project
    const outsideDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-mcp-outside-"));
    await fs.writeFile(path.join(outsideDir, "secret.txt"), "sensitive data");

    // Create a symlink inside the project pointing outside
    const linkPath = path.join(tmpDir, "evil-link");
    await fs.symlink(path.join(outsideDir, "secret.txt"), linkPath);

    await expect(confineToProject(tmpDir, "evil-link")).rejects.toThrow("Symlink traversal blocked");

    // Cleanup
    await fs.rm(outsideDir, { recursive: true, force: true });
  });
});

// ---------------------------------------------------------------------------
// Integration: MCP tool handler via createServer
// ---------------------------------------------------------------------------

describe("createServer integration", () => {
  it("creates a server that can list tools", () => {
    const server = createServer(tmpDir);
    expect(server).toBeDefined();
  });

  it("registers a working route_request tool", async () => {
    await fs.mkdir(path.join(tmpDir, ".ai/agents/sales/skills/processes/devis"), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, ".ai/agents/sales/AGENT.md"),
      "---\nid: sales\ntype: agent\ndescription: Gère les ventes et les devis.\n---\n# Ventes\n",
    );
    await fs.writeFile(
      path.join(tmpDir, ".ai/agents/sales/skills/processes/devis/SKILL.md"),
      "---\nid: nouveau-devis\ntype: process\ndescription: Créer un devis.\nuse_when: Quand l'utilisateur veut créer un devis client.\n---\n# Nouveau devis\n",
    );

    const server = createServer(tmpDir) as any;
    const callTool = server.server._requestHandlers.get("tools/call");
    const response = await callTool({
      method: "tools/call",
      params: {
        name: "route_request",
        arguments: { request: "créer un devis client" },
      },
    }, {});
    const payload = JSON.parse(response.content[0].text);

    expect(payload.status).toBe("routed");
    expect(payload.agent.id).toBe("sales");
    expect(payload.process.id).toBe("nouveau-devis");
  });

  it("route_request returns a help fallback (not a fake route) on an honest abstention", async () => {
    await fs.mkdir(path.join(tmpDir, ".ai/agents/help/skills/processes/accueil"), { recursive: true });
    await fs.writeFile(path.join(tmpDir, ".ai/agents/help/AGENT.md"), "---\nid: concierge-base\ntype: agent\ndescription: Aide.\n---\n# Aide\n");
    await fs.writeFile(
      path.join(tmpDir, ".ai/agents/help/skills/processes/accueil/SKILL.md"),
      "---\nid: accueil\ntype: process\ndescription: Accueil.\nuse_when: Afficher le menu d'aide.\n---\n# Accueil\n",
    );
    await fs.writeFile(path.join(tmpDir, "base.config.json"), JSON.stringify({ routing: { fallback: { agent: "concierge-base", process: "accueil" } } }));

    const server = createServer(tmpDir) as any;
    const callTool = server.server._requestHandlers.get("tools/call");
    const response = await callTool(
      { method: "tools/call", params: { name: "route_request", arguments: { request: "qwerty zzz gibberish nonsense" } } },
      {},
    );
    const payload = JSON.parse(response.content[0].text);
    expect(payload.status).toBe("out_of_scope"); // stays honest
    expect(payload.agent).toBeNull();
    expect(payload.fallback.agent.id).toBe("concierge-base");
    expect(payload.fallback.process.id).toBe("accueil");
  });

  it("includes selected BASE scope in structured tool responses", async () => {
    await fs.mkdir(path.join(tmpDir, ".ai/agents/sales/skills/processes/devis"), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, ".ai/agents/sales/AGENT.md"),
      "---\nid: sales\ntype: agent\ndescription: Gère les ventes et les devis.\n---\n# Ventes\n",
    );
    await fs.writeFile(
      path.join(tmpDir, ".ai/agents/sales/skills/processes/devis/SKILL.md"),
      "---\nid: nouveau-devis\ntype: process\ndescription: Créer un devis.\nuse_when: Quand l'utilisateur veut créer un devis client.\n---\n# Nouveau devis\n",
    );

    const server = createServer(tmpDir, {
      scope: { mode: "root", root: { display_path: ".", path: tmpDir } },
    }) as any;
    const callTool = server.server._requestHandlers.get("tools/call");
    const response = await callTool({
      method: "tools/call",
      params: {
        name: "route_request",
        arguments: { request: "créer un devis client" },
      },
    }, {});
    const payload = JSON.parse(response.content[0].text);

    expect(payload.scope.root.display_path).toBe(".");
    expect(payload.status).toBe("routed");
  });

  it("lists workspace agents with root-qualified names and routes across roots", async () => {
    const one = path.join(tmpDir, "one");
    const two = path.join(tmpDir, "two");
    for (const root of [one, two]) {
      await fs.mkdir(path.join(root, ".ai/agents/sales/skills/processes/devis"), { recursive: true });
      await fs.writeFile(
        path.join(root, ".ai/agents/sales/AGENT.md"),
        "---\nid: sales\ntype: agent\ndescription: Gère les ventes.\n---\n# Ventes\n",
      );
      await fs.writeFile(
        path.join(root, ".ai/agents/sales/skills/processes/devis/SKILL.md"),
        "---\nid: devis\ntype: process\ndescription: Créer un devis.\nuse_when: Quand l'utilisateur veut créer un devis client.\n---\n# Devis\n",
      );
    }

    const server = createServer(one, {
      scope: { mode: "workspace", root: { id: "one", path: one } },
      workspaceScope: { mode: "workspace", workspace: { id: "demo", label: "Demo" } },
      workspaceRoots: [
        { id: "one", path: one },
        { id: "two", path: two },
      ],
    }) as any;
    const callTool = server.server._requestHandlers.get("tools/call");

    const listed = await callTool({ method: "tools/call", params: { name: "load_agent", arguments: {} } }, {});
    expect(listed.content[0].text).toContain("one/sales");
    expect(listed.content[0].text).toContain("two/sales");

    const ambiguousAgent = await callTool({ method: "tools/call", params: { name: "load_agent", arguments: { name: "sales" } } }, {});
    expect(ambiguousAgent.isError).toBe(true);
    expect(ambiguousAgent.content[0].text).toContain("Plusieurs agents");

    const qualifiedAgent = await callTool({ method: "tools/call", params: { name: "load_agent", arguments: { name: "one/sales" } } }, {});
    expect(qualifiedAgent.content[0].text).toContain("# Agent: sales");

    const routed = await callTool({
      method: "tools/call",
      params: { name: "route_request", arguments: { request: "créer un devis client" } },
    }, {});
    const payload = JSON.parse(routed.content[0].text);
    expect(payload.status).toBe("ambiguous");
    expect(payload.reason_code).toBe("competing_roots");
    expect(payload.scope.workspace.id).toBe("demo");

    const missingRootId = await callTool({
      method: "tools/call",
      params: { name: "access_resource", arguments: { path: "anything.md" } },
    }, {});
    expect(missingRootId.isError).toBe(true);
    expect(missingRootId.content[0].text).toMatch(/root_id is required/);
  });

  it("routes around unreachable workspace roots and reports them", async () => {
    const one = path.join(tmpDir, "one");
    const missing = path.join(tmpDir, "missing");
    await fs.mkdir(path.join(one, ".ai/agents/sales/skills/processes/devis"), { recursive: true });
    await fs.writeFile(
      path.join(one, ".ai/agents/sales/AGENT.md"),
      "---\nid: sales\ntype: agent\ndescription: Gère les ventes.\n---\n# Ventes\n",
    );
    await fs.writeFile(
      path.join(one, ".ai/agents/sales/skills/processes/devis/SKILL.md"),
      "---\nid: devis\ntype: process\ndescription: Créer un devis.\nuse_when: Quand l'utilisateur veut créer un devis client.\n---\n# Devis\n",
    );

    const server = createServer(one, {
      workspaceRoots: [
        { id: "one", path: one },
        { id: "missing", path: missing },
      ],
    }) as any;
    const callTool = server.server._requestHandlers.get("tools/call");

    const routed = await callTool({
      method: "tools/call",
      params: { name: "route_request", arguments: { request: "créer un devis client" } },
    }, {});
    const payload = JSON.parse(routed.content[0].text);

    expect(payload.status).toBe("routed");
    expect(payload.root.id).toBe("one");
    expect(payload.unreachable_roots[0].id).toBe("missing");
  });

  it("applies proposed changes to the selected workspace root", async () => {
    const one = path.join(tmpDir, "one");
    const two = path.join(tmpDir, "two");
    await fs.mkdir(path.join(one, ".ai/agents/a"), { recursive: true });
    await fs.mkdir(path.join(two, ".ai/agents/b"), { recursive: true });
    await fs.writeFile(path.join(one, ".ai/agents/a/AGENT.md"), "---\nid: a\ntype: agent\ndescription: A.\n---\n# A\n");
    await fs.writeFile(path.join(two, ".ai/agents/b/AGENT.md"), "---\nid: b\ntype: agent\ndescription: B.\n---\n# B\n");

    const server = createServer(one, {
      workspaceRoots: [
        { id: "one", path: one },
        { id: "two", path: two },
      ],
    }) as any;
    const callTool = server.server._requestHandlers.get("tools/call");

    const proposed = await callTool({
      method: "tools/call",
      params: { name: "propose_change", arguments: { target: "docs/note.md", content: "# Note\n", root_id: "two" } },
    }, {});
    const proposal = JSON.parse(proposed.content[0].text);

    const committed = await callTool({
      method: "tools/call",
      params: { name: "commit_change", arguments: { change_id: proposal.change_id, confirmed: true, root_id: "two" } },
    }, {});
    expect(committed.isError).toBeUndefined();
    await expect(fs.readFile(path.join(two, "docs/note.md"), "utf8")).resolves.toBe("# Note\n");
    await expect(fs.access(path.join(one, "docs/note.md"))).rejects.toThrow();
  });

  it("routes across nested project roots discovered from a container root", async () => {
    const nestedRoot = path.join(tmpDir, "collaborations", "innovaud");
    await fs.mkdir(path.join(nestedRoot, ".ai/agents/workshop/skills/processes/atelier"), { recursive: true });
    await fs.writeFile(
      path.join(nestedRoot, ".ai/agents/workshop/AGENT.md"),
      "---\nid: workshop\ntype: agent\ndescription: Ateliers clients.\n---\n# Workshop\n",
    );
    await fs.writeFile(
      path.join(nestedRoot, ".ai/agents/workshop/skills/processes/atelier/SKILL.md"),
      "---\nid: preparer-atelier\ntype: process\ndescription: Préparer un atelier client.\nuse_when: Quand l'utilisateur veut préparer un atelier client.\n---\n# Atelier\n",
    );

    const server = createServer(tmpDir) as any;
    const callTool = server.server._requestHandlers.get("tools/call");

    const listed = await callTool({ method: "tools/call", params: { name: "load_agent", arguments: {} } }, {});
    expect(listed.content[0].text).toContain("collaborations-innovaud/workshop");

    const routed = await callTool({
      method: "tools/call",
      params: { name: "route_request", arguments: { request: "préparer un atelier client" } },
    }, {});
    const payload = JSON.parse(routed.content[0].text);
    expect(payload.status).toBe("routed");
    expect(payload.root.id).toBe("collaborations-innovaud");
    expect(payload.process.id).toBe("preparer-atelier");

    const opened = await callTool({
      method: "tools/call",
      params: { name: "open_resource", arguments: { id_or_path: "preparer-atelier", root_id: "collaborations-innovaud" } },
    }, {});
    expect(opened.content[0].text).toContain("preparer-atelier");

    // An undeclared root_id is rejected — a client cannot select a root outside the discovered set.
    const rejected = await callTool({
      method: "tools/call",
      params: { name: "open_resource", arguments: { id_or_path: "preparer-atelier", root_id: "../escape" } },
    }, {});
    expect(rejected.isError).toBe(true);
    expect(rejected.content[0].text).toMatch(/Unknown root_id "\.\.\/escape"/);
  });

  it("passes grant_token through access_resource under strict policy", async () => {
    await fs.writeFile(path.join(tmpDir, "base.config.json"), JSON.stringify({ policy: { type: "strict", grants: ["G1"] } }, null, 2));
    await fs.writeFile(
      path.join(tmpDir, "secret.md"),
      "---\nid: secret-client\ntype: data\ndescription: Secret.\nsensitivity: restricted\n---\n# Secret\n",
    );
    const server = createServer(tmpDir) as any;
    const callTool = server.server._requestHandlers.get("tools/call");

    const denied = await callTool({
      method: "tools/call",
      params: {
        name: "access_resource",
        arguments: { path: "secret-client" },
      },
    }, {});
    expect(denied.isError).toBe(true);
    expect(denied.content[0].text).toMatch(/restricted/);

    const allowed = await callTool({
      method: "tools/call",
      params: {
        name: "access_resource",
        arguments: { path: "secret-client", grant_token: "G1" },
      },
    }, {});
    expect(allowed.content[0].text).toContain("# Secret");
  });

  it("discover_resources returns metadata only, never resource bodies", async () => {
    await fs.writeFile(
      path.join(tmpDir, "secret.md"),
      "---\nid: secret-client\ntype: data\ndescription: Secret client.\nsensitivity: restricted\n---\n# Secret\nclassified body\n",
    );
    const server = createServer(tmpDir) as any;
    const callTool = server.server._requestHandlers.get("tools/call");

    const response = await callTool({
      method: "tools/call",
      params: {
        name: "discover_resources",
        arguments: { query: "secret client" },
      },
    }, {});
    const payload = JSON.parse(response.content[0].text);

    expect(payload.results[0].id).toBe("secret-client");
    expect(payload.results[0].content).toBeUndefined();
    expect(payload.results[0].body).toBeUndefined();
    expect(response.content[0].text).not.toContain("classified body");
  });

  it("sanitizes read tool errors before returning them to MCP clients", async () => {
    const server = createServer(tmpDir) as any;
    const callTool = server.server._requestHandlers.get("tools/call");

    const response = await callTool({
      method: "tools/call",
      params: {
        name: "access_resource",
        arguments: { path: "missing/private.txt" },
      },
    }, {});

    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain("missing/private.txt");
    expect(response.content[0].text).not.toContain(tmpDir);
  });

  it("does not stage sensitive proposed content without confirmed=true", async () => {
    await fs.writeFile(
      path.join(tmpDir, "client.md"),
      "---\nid: client\ntype: data\ndescription: Client.\nsensitivity: restricted\n---\n# Client\nold\n",
    );
    const server = createServer(tmpDir) as any;
    const callTool = server.server._requestHandlers.get("tools/call");

    const denied = await callTool({
      method: "tools/call",
      params: {
        name: "propose_change",
        arguments: {
          target: "client.md",
          content: "---\nid: client\ntype: data\ndescription: Client.\nsensitivity: restricted\n---\n# Client\nnew\n",
        },
      },
    }, {});

    expect(denied.isError).toBe(true);
    expect(denied.content[0].text).toMatch(/Write denied/);
    await expect(fs.access(path.join(tmpDir, ".ai", "changes"))).rejects.toThrow();
  });
});

describe("createServer exposure options", () => {
  const toolNames = async (server: any): Promise<string[]> => {
    const list = server.server._requestHandlers.get("tools/list");
    const res = await list({ method: "tools/list", params: {} }, {});
    return res.tools.map((t: { name: string }) => t.name);
  };

  it("exposes write & execute tools by default", async () => {
    const names = await toolNames(createServer(tmpDir));
    for (const t of ["invoke_tool", "propose_change", "commit_change", "promote_resource"]) {
      expect(names).toContain(t);
    }
  });

  it("read-only mode registers no write or execute tool", async () => {
    const names = await toolNames(createServer(tmpDir, { readOnly: true }));
    for (const t of ["invoke_tool", "propose_change", "commit_change", "promote_resource"]) {
      expect(names).not.toContain(t);
    }
    // Read/route tools remain available.
    expect(names).toContain("route_request");
    expect(names).toContain("open_resource");
  });

  it("requireExecuteConfirmation refuses non-dry-run execution without confirmed=true", async () => {
    const server = createServer(tmpDir, { requireExecuteConfirmation: true }) as any;
    const callTool = server.server._requestHandlers.get("tools/call");
    const response = await callTool(
      { method: "tools/call", params: { name: "invoke_tool", arguments: { id_or_path: "anything", dry_run: false } } },
      {},
    );
    expect(response.isError).toBe(true);
    expect(response.content[0].text).toMatch(/confirmed: true/);
  });
});

// ---------------------------------------------------------------------------
// Resource router MVP
// ---------------------------------------------------------------------------

describe("resource router", () => {
  it("inventories agents and process skills as resources", async () => {
    await createAgentFixture(tmpDir, "resource-agent", {
      skills: { "processes/nouveau-devis/SKILL.md": "# Nouveau devis\n\nCreer un devis." },
    });

    const resources = await inventoryResources(tmpDir);

    expect(resources.some((resource) => resource.type === "agent" && resource.id.includes("resource-agent"))).toBe(true);
    expect(resources.some((resource) => resource.type === "process" && resource.title === "Nouveau devis")).toBe(true);
  });

  it("searches resources with explainable ranking", async () => {
    await fs.writeFile(
      path.join(tmpDir, "devis.md"),
      "---\nid: nouveau-devis\ntype: process\ndescription: Devis client.\n---\n# Nouveau devis\n",
    );

    const results = await searchResources(tmpDir, "devis client");

    expect(results[0].id).toBe("nouveau-devis");
    expect(results[0].score).toBeGreaterThan(0);
    expect(results[0].reasons?.length).toBeGreaterThan(0);
  });

  it("routes a request to the right agent and process, or abstains", async () => {
    await fs.mkdir(path.join(tmpDir, ".ai/agents/sales/skills/processes/devis"), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, ".ai/agents/sales/AGENT.md"),
      "---\nid: sales\ntype: agent\ndescription: Gère les ventes et les devis.\n---\n# Ventes\n",
    );
    await fs.writeFile(
      path.join(tmpDir, ".ai/agents/sales/skills/processes/devis/SKILL.md"),
      "---\nid: nouveau-devis\ntype: process\ndescription: Créer un devis.\nuse_when: Quand l'utilisateur veut créer un devis client.\n---\n# Nouveau devis\n",
    );

    const routed = await routeRequest(tmpDir, "créer un devis pour un client");
    expect(routed.status).toBe("routed");
    expect(routed.agent?.id).toBe("sales");
    expect(routed.process?.id).toBe("nouveau-devis");

    const abstained = await routeRequest(tmpDir, "zzqq wibble flumph");
    expect(abstained.status).toBe("out_of_scope");
  });

  it("parses structured resource metadata", async () => {
    await fs.writeFile(
      path.join(tmpDir, "process.md"),
      [
        "---",
        "schema_version: base.resource.v1",
        "id: nouveau-devis",
        "type: process",
        "description: Devis client.",
        "keywords: [devis, client]",
        "requires:",
        "  - ref: catalogue-services",
        "    access: read",
        "    purpose: quote_pricing",
        "---",
        "# Nouveau devis",
      ].join("\n"),
    );

    const resources = await inventoryResources(tmpDir);
    const resource = resources.find((item) => item.id === "nouveau-devis");

    expect(resource?.keywords).toEqual(expect.arrayContaining(["devis", "client"]));
    expect(resource?.requires?.[0]).toEqual({
      ref: "catalogue-services",
      access: "read",
      purpose: "quote_pricing",
    });
  });

  it("opens resources by id", async () => {
    await fs.writeFile(path.join(tmpDir, "note.md"), "---\nid: note-test\ntype: document\ndescription: Note.\n---\n# Note\n");

    const result = await openResource(tmpDir, "note-test");

    expect(result.resource.path).toBe("note.md");
    expect(result.content).toContain("# Note");
  });

  it("defaults to remote egress: withholds a confidential resource unless BASE_MCP_ALLOW_CONFIDENTIAL=1 (FR-EGRESS-004)", async () => {
    await fs.writeFile(
      path.join(tmpDir, "secret.md"),
      "---\nschema_version: base.resource.v1\nid: secret-doc\ntype: document\ndescription: Pricing.\nconfidential: true\n---\n# Secret\nIBAN CH99 0000 1234.\n",
    );
    const saved = process.env.BASE_MCP_ALLOW_CONFIDENTIAL;
    try {
      // No flag: the MCP client is treated as a remote model -> confidential content is withheld,
      // replaced by the said egress notice, never silently dropped.
      delete process.env.BASE_MCP_ALLOW_CONFIDENTIAL;
      const remote = await openResource(tmpDir, "secret-doc", "full");
      expect(remote.content).not.toContain("IBAN CH99");
      expect(remote.content).toMatch(/retenu/);

      // Operator asserts a local client -> the same read returns the real content.
      process.env.BASE_MCP_ALLOW_CONFIDENTIAL = "1";
      const local = await openResource(tmpDir, "secret-doc", "full");
      expect(local.content).toContain("IBAN CH99");
    } finally {
      if (saved === undefined) delete process.env.BASE_MCP_ALLOW_CONFIDENTIAL;
      else process.env.BASE_MCP_ALLOW_CONFIDENTIAL = saved;
    }
  });

  it("opens resource projections", async () => {
    await fs.writeFile(path.join(tmpDir, "note.md"), "---\nid: note-test\ntype: document\ndescription: Note.\n---\n# Note\n");

    const metadata = await openResource(tmpDir, "note-test", "metadata");
    const instructions = await openResource(tmpDir, "note-test", "instructions");

    expect(metadata.content).toContain('"id": "note-test"');
    expect(instructions.content.trim()).toBe("# Note");
  });

  it("passes purpose through mediated resource reads", async () => {
    await fs.writeFile(
      path.join(tmpDir, "secret.md"),
      "---\nid: secret-client\ntype: data\ndescription: Secret.\nsensitivity: restricted\n---\n# Secret\n",
    );

    await expect(accessResource(tmpDir, "secret-client")).rejects.toThrow("Access denied");
    const result = await accessResource(tmpDir, "secret-client", "full", "revue humaine");

    expect(result.content).toContain("# Secret");
  });

  it("dry-runs tool invocation by default", async () => {
    await fs.mkdir(path.join(tmpDir, "tools"), { recursive: true });
    await fs.writeFile(path.join(tmpDir, "tools", "hello.py"), "print('hello')\n");
    await fs.writeFile(
      path.join(tmpDir, "tool.md"),
      [
        "---",
        "id: dire-bonjour",
        "type: tool",
        "description: Dire bonjour.",
        "execution:",
        "  type: script",
        "  runtime: python",
        "  entrypoint: tools/hello.py",
        "---",
        "# Dire bonjour",
      ].join("\n"),
    );

    const result = await invokeTool(tmpDir, "dire-bonjour");

    expect(result.dry_run).toBe(true);
    expect(result.command[0]).toBe("python3");
    expect(result.command.at(-1)).toContain("hello.py");
  });

  it("dry-runs tool invocation with resource-relative entrypoint", async () => {
    await fs.mkdir(path.join(tmpDir, "tools"), { recursive: true });
    await fs.writeFile(path.join(tmpDir, "tools", "hello.py"), "print('hello')\n");
    await fs.writeFile(
      path.join(tmpDir, "tools", "hello.md"),
      [
        "---",
        "id: dire-bonjour-relatif",
        "type: tool",
        "description: Dire bonjour.",
        "execution:",
        "  type: script",
        "  runtime: python",
        "  entrypoint: hello.py",
        "---",
        "# Dire bonjour",
      ].join("\n"),
    );

    const result = await invokeTool(tmpDir, "dire-bonjour-relatif");

    expect(result.dry_run).toBe(true);
    expect(result.command.at(-1)).toContain(path.join("tools", "hello.py"));
  });
});

// ---------------------------------------------------------------------------
// Remote-exposure safety (safe-by-default)
// ---------------------------------------------------------------------------

describe("remote exposure safety", () => {
  it("recognises loopback hosts", () => {
    expect(isLoopbackHost("127.0.0.1")).toBe(true);
    expect(isLoopbackHost("localhost")).toBe(true);
    expect(isLoopbackHost("::1")).toBe(true);
    expect(isLoopbackHost("0.0.0.0")).toBe(false);
    expect(isLoopbackHost("192.168.1.5")).toBe(false);
  });

  it("allows loopback without override", () => {
    expect(remoteExposureError("127.0.0.1", {})).toBeNull();
    expect(remoteExposureError("localhost", {})).toBeNull();
  });

  it("refuses a non-loopback host without auth/override", () => {
    const msg = remoteExposureError("0.0.0.0", {});
    expect(msg).toBeTruthy();
    expect(msg).toContain("Refusing to bind non-loopback host");
  });

  it("allows a non-loopback host only with the explicit insecure override", () => {
    expect(remoteExposureError("0.0.0.0", { BASE_MCP_ALLOW_INSECURE_REMOTE: "1" })).toBeNull();
  });

  it("allows a non-loopback host once an AuthProvider is configured", () => {
    expect(remoteExposureError("0.0.0.0", {}, true)).toBeNull();
  });
});

describe("DNS-rebinding / cross-origin guard (crossOriginError)", () => {
  it("allows a same-machine request: loopback Host, loopback or absent Origin, across ports", () => {
    expect(crossOriginError({ host: "127.0.0.1:3100" }, "127.0.0.1")).toBeNull();
    expect(crossOriginError({ host: "localhost:3100", origin: "http://localhost:5174" }, "127.0.0.1")).toBeNull();
    expect(crossOriginError({}, "127.0.0.1")).toBeNull(); // a non-browser MCP client sends neither header
  });

  it("refuses a DNS-rebinding Host on the loopback server", () => {
    expect(crossOriginError({ host: "attacker.example" }, "127.0.0.1")).toContain("non-loopback Host");
  });

  it("refuses a cross-origin page on the loopback server", () => {
    expect(crossOriginError({ host: "127.0.0.1:3100", origin: "https://evil.example" }, "127.0.0.1")).toContain("cross-origin");
  });

  it("judges a repeated Origin header (array) by its first value", () => {
    expect(crossOriginError({ host: "127.0.0.1", origin: ["https://evil.example", "http://localhost"] }, "127.0.0.1")).toContain("cross-origin");
  });

  it("is skipped on a deliberate non-loopback bind (auth is the control there, Host/Origin vary)", () => {
    expect(crossOriginError({ host: "base.example.com", origin: "https://base.example.com" }, "0.0.0.0")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// AuthProvider
// ---------------------------------------------------------------------------

describe("AuthProvider", () => {
  const mockReq = (auth?: string) =>
    ({ header: (h: string) => (h.toLowerCase() === "authorization" ? auth : undefined) }) as any;

  it("noAuth always allows", async () => {
    expect((await noAuth(mockReq())).ok).toBe(true);
  });

  it("bearerTokenAuth accepts the right token and rejects others", async () => {
    const auth = bearerTokenAuth("s3cret");
    expect((await auth(mockReq("Bearer s3cret"))).ok).toBe(true);
    expect((await auth(mockReq("Bearer nope"))).ok).toBe(false);
    expect((await auth(mockReq(undefined))).ok).toBe(false);
    // The comparison hashes both sides, so it handles unequal lengths (no length oracle) and a
    // same-length near-miss without throwing or short-circuiting.
    expect((await auth(mockReq("Bearer s3cre"))).ok).toBe(false); // shorter
    expect((await auth(mockReq("Bearer s3cretXXXX"))).ok).toBe(false); // longer
    expect((await auth(mockReq("Bearer s3cret "))).ok).toBe(true); // trailing space trimmed
  });

  it("resolveAuthProvider prefers config.auth fn, then env bearer, then NoAuth", () => {
    const fn = () => ({ ok: true });
    expect(resolveAuthProvider({ auth: fn }, {}).provider).toBe(fn);
    expect(resolveAuthProvider({ auth: fn }, {}).configured).toBe(true);
    expect(resolveAuthProvider(null, { BASE_MCP_BEARER_TOKEN: "t" }).configured).toBe(true);
    expect(resolveAuthProvider(null, {}).configured).toBe(false);
    expect(resolveAuthProvider(null, {}).provider).toBe(noAuth);
  });

  it("resolveAuthProvider instantiates declarative bearer descriptors", async () => {
    const fromString = resolveAuthProvider({ auth: "bearer" }, { BASE_MCP_BEARER_TOKEN: "abc" });
    expect(fromString.configured).toBe(true);
    expect((await fromString.provider(mockReq("Bearer abc"))).ok).toBe(true);

    const fromEnvName = resolveAuthProvider({ auth: { type: "bearer", env: "BASE_TEST_TOKEN" } }, { BASE_TEST_TOKEN: "xyz" });
    expect((await fromEnvName.provider(mockReq("Bearer xyz"))).ok).toBe(true);
    expect(() => resolveAuthProvider({ auth: "bearer" }, {})).toThrow("base.config.invalid");
  });

  it("authMiddleware calls next on success and 401s on failure", async () => {
    let nexted = false;
    let status = 0;
    const res = { status: (c: number) => { status = c; return { json: () => {} }; } } as any;
    await authMiddleware(noAuth)(mockReq(), res, () => { nexted = true; });
    expect(nexted).toBe(true);

    nexted = false;
    await authMiddleware(() => ({ ok: false }))(mockReq(), res, () => { nexted = true; });
    expect(nexted).toBe(false);
    expect(status).toBe(401);
  });
});

describe("report_friction + abstention journal", () => {
  it("report_friction writes a conform, creation-only entry under .ai/feedback/", async () => {
    const server = createServer(tmpDir) as any;
    const callTool = server.server._requestHandlers.get("tools/call");
    const call = () =>
      callTool(
        {
          method: "tools/call",
          params: {
            name: "report_friction",
            arguments: { process: "devis/SKILL.md", summary: "le barème cité n'est plus le bon", detail: "taux corrigé à la main (7.7 → 8.1)", via: "assistant" },
          },
        },
        {},
      );

    const first = JSON.parse((await call()).content[0].text);
    expect(first.path).toMatch(/^\.ai\/feedback\/.*\.md$/);
    const onDisk = await fs.readFile(path.join(tmpDir, first.path), "utf8");
    expect(onDisk).toContain("process: devis/SKILL.md");
    expect(onDisk).toContain("via: assistant");
    expect(onDisk).toContain("status: open");
    expect(onDisk).toContain("# le barème cité n'est plus le bon");

    // Same call again: a NEW file (append-only journal), never an overwrite.
    const second = JSON.parse((await call()).content[0].text);
    expect(second.path).not.toBe(first.path);
  });

  it("report_friction is absent from a read-only server", () => {
    const server = createServer(tmpDir, { readOnly: true }) as any;
    const names = Object.keys(server._registeredTools ?? {});
    expect(names).not.toContain("report_friction");
    expect(names).not.toContain("propose_change");
  });

  it("an abstention from route_request lands in abstentions.jsonl", async () => {
    const server = createServer(tmpDir) as any;
    const callTool = server.server._requestHandlers.get("tools/call");
    await callTool(
      { method: "tools/call", params: { name: "route_request", arguments: { request: "qwerty zzz gibberish nonsense" } } },
      {},
    );
    const journal = await fs.readFile(path.join(tmpDir, ".ai/feedback/abstentions.jsonl"), "utf8");
    const line = JSON.parse(journal.trim().split("\n").pop() as string);
    expect(line.query).toBe("qwerty zzz gibberish nonsense");
    expect(line.verdict).toBe("out_of_scope");
    expect(typeof line.at).toBe("string");
  });
});
