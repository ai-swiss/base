// Spec coverage: FR-MCP-007
// What a deployment exposes: the `mcp.tools` and `mcp.agents` allow-lists, and the attribution line a
// collection declares. The config is read through the core resolver, so an unknown tool name or a
// malformed section stops the server instead of quietly answering «expose everything».
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { createServer } from "../src/index.js";
import { MCP_TOOL_NAMES } from "../../tools/core/config.mjs";

let tmpDir: string;

async function callTool(server: any, name: string, args: Record<string, unknown>) {
  const handler = server.server._requestHandlers.get("tools/call");
  return handler({ method: "tools/call", params: { name, arguments: args } }, {});
}

async function listTools(server: any): Promise<string[]> {
  const handler = server.server._requestHandlers.get("tools/list");
  return (await handler({ method: "tools/list", params: {} }, {})).tools.map((tool: { name: string }) => tool.name);
}

async function writeConfig(mcp: unknown) {
  await fs.writeFile(path.join(tmpDir, "base.config.json"), JSON.stringify({ schema_version: "base.config.v1", mcp }));
}

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-mcp-exposure-"));
  const guide = path.join(tmpDir, "collections", "acme", "guide");
  await fs.mkdir(guide, { recursive: true });
  await fs.writeFile(
    path.join(guide, "README.md"),
    '---\nschema_version: base.resource.v1\nid: acme-guide\ntype: document\ndescription: The guide.\nattribution: "Written by Acme. Reuse only with this line."\n---\n# Guide\n',
  );
  await fs.writeFile(
    path.join(guide, "assess.md"),
    "---\nschema_version: base.resource.v1\nid: guide-assess\ntype: document\ndescription: Assessing ideas.\n---\n# Assess\n\n## Feasibility\nFour areas are considered when assessing feasibility.\n",
  );
  for (const name of ["librarian", "internal"]) {
    await fs.mkdir(path.join(tmpDir, ".ai", "agents", name), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, ".ai", "agents", name, "AGENT.md"),
      `---\nschema_version: base.resource.v1\nid: ${name}\ntype: agent\ndescription: The ${name} agent.\n---\n# ${name}\n`,
    );
  }
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe("what a deployment exposes", () => {
  it("registers every tool when no allow-list is configured", async () => {
    const server = (await createServer(tmpDir)) as any;
    expect((await listTools(server)).sort()).toEqual([...MCP_TOOL_NAMES].sort());
  });

  it("mcp.tools registers only the tools it names", async () => {
    await writeConfig({ tools: ["discover_resources", "open_resource"] });
    const server = (await createServer(tmpDir)) as any;
    expect((await listTools(server)).sort()).toEqual(["discover_resources", "open_resource"]);
  });

  it("an unknown tool name stops the server instead of narrowing nothing", async () => {
    await writeConfig({ tools: ["discover_resources", "open_ressource"] });
    await expect(createServer(tmpDir)).rejects.toThrow(/unknown mcp tool name\(s\): open_ressource/);
  });

  it("a malformed mcp section fails closed rather than exposing everything", async () => {
    await writeConfig(["discover_resources"]);
    await expect(createServer(tmpDir)).rejects.toThrow(/base\.config\.invalid/);
    await fs.writeFile(path.join(tmpDir, "base.config.json"), "{ not json");
    await expect(createServer(tmpDir)).rejects.toThrow(/base\.config\.invalid/);
  });

  it("mcp.agents hides the agents it does not name from load_agent", async () => {
    await writeConfig({ agents: ["librarian"] });
    const server = (await createServer(tmpDir)) as any;
    const listed = (await callTool(server, "load_agent", {})).content[0].text;
    expect(listed).toContain("librarian");
    expect(listed).not.toContain("internal");
    const refused = await callTool(server, "load_agent", { name: "internal" });
    expect(refused.isError).toBe(true);
  });

  it("attribution_prefix carries the folder card's line on a read, and is off by default", async () => {
    const plain = (await createServer(tmpDir)) as any;
    const without = JSON.parse((await callTool(plain, "open_resource", { id_or_path: "guide-assess" })).content[0].text);
    expect(without.attribution).toBeUndefined();

    await writeConfig({ attribution_prefix: true });
    const server = (await createServer(tmpDir)) as any;
    const opened = JSON.parse((await callTool(server, "open_resource", { id_or_path: "guide-assess", section: "feasibility" })).content[0].text);
    expect(opened.attribution).toBe("Written by Acme. Reuse only with this line.");
    // A quotable shortlist carries it too: a reader may quote a passage without opening anything.
    const found = JSON.parse((await callTool(server, "discover_resources", { query: "feasibility", grain: "section" })).content[0].text);
    expect(found.attribution).toEqual(["Written by Acme. Reuse only with this line."]);
  });

  it("the attribution memo does not outlive the server that built it", async () => {
    await writeConfig({ attribution_prefix: true });
    const first = (await createServer(tmpDir)) as any;
    expect(JSON.parse((await callTool(first, "open_resource", { id_or_path: "guide-assess" })).content[0].text).attribution).toBe(
      "Written by Acme. Reuse only with this line.",
    );
    await fs.writeFile(
      path.join(tmpDir, "collections", "acme", "guide", "README.md"),
      '---\nschema_version: base.resource.v1\nid: acme-guide\ntype: document\ndescription: The guide.\nattribution: "Corrected line."\n---\n# Guide\n',
    );
    const second = (await createServer(tmpDir)) as any;
    expect(JSON.parse((await callTool(second, "open_resource", { id_or_path: "guide-assess" })).content[0].text).attribution).toBe("Corrected line.");
  });
});
