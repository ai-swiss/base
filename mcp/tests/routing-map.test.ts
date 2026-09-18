// Spec coverage: FR-MCP-008
// get_routing_map: the map route_request already returns, without status, candidates or score, plus
// the reading discipline and the configured help target. The help target is resolved by the engine
// (root corpus, then the framework corpus the root belongs to), so a root that borrows the framework's
// welcome process is not reported as having no fallback.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { createServer } from "../src/index.js";

let tmpDir: string;

async function callTool(server: any, name: string, args: Record<string, unknown>) {
  const handler = server.server._requestHandlers.get("tools/call");
  return handler({ method: "tools/call", params: { name, arguments: args } }, {});
}

async function mapOf(root: string, options: Record<string, unknown> = {}) {
  const server = (await createServer(root, options)) as any;
  return JSON.parse((await callTool(server, "get_routing_map", {})).content[0].text);
}

async function writeAgent(root: string, agent: string, process: string) {
  const dir = path.join(root, ".ai", "agents", agent, "skills", "processes", process);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(root, ".ai", "agents", agent, "AGENT.md"),
    `---\nschema_version: base.resource.v1\nid: ${agent}\ntype: agent\ndescription: The ${agent}.\nuse_when: a question about the library\n---\n# ${agent}\n`,
  );
  await fs.writeFile(
    path.join(dir, "SKILL.md"),
    `---\nschema_version: base.resource.v1\nid: ${process}\ntype: process\ndescription: ${process}.\nuse_when: the user asks what the library says\nrouting:\n  avoid_when:\n    - the user wants to buy something\n---\n# ${process}\n`,
  );
}

async function writeConfig(root: string, config: Record<string, unknown>) {
  await fs.writeFile(path.join(root, "base.config.json"), JSON.stringify({ schema_version: "base.config.v1", ...config }));
}

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-mcp-routing-map-"));
  await writeAgent(tmpDir, "librarian", "answer-from-the-library");
  await writeAgent(tmpDir, "internal", "internal-answer");
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe("get_routing_map", () => {
  it("returns the agents and their processes with use_when and avoid, and no verdict", async () => {
    await writeConfig(tmpDir, {});
    const payload = await mapOf(tmpDir);
    const librarian = payload.routing_map.find((agent: { id: string }) => agent.id === "librarian");
    expect(librarian.use_when).toContain("a question about the library");
    expect(Object.keys(librarian.processes[0]).sort()).toEqual(["avoid", "id", "path", "title", "use_when"]);
    expect(librarian.processes[0].avoid).toContain("buy something");
    expect(payload.status).toBeUndefined();
    expect(payload.candidates).toBeUndefined();
    expect(payload.reason_code).toBeUndefined();
    expect(JSON.stringify(payload)).not.toContain('"score"');
  });

  it("carries the reading discipline: the map decides nothing", async () => {
    await writeConfig(tmpDir, {});
    const payload = await mapOf(tmpDir);
    expect(payload.next_actions).toHaveLength(3);
    expect(payload.next_actions[0]).toContain("no verdict and no score");
    expect(payload.next_actions.join(" ")).toContain("Never invent an id or a path");
  });

  it("names a help target the root owns", async () => {
    await writeConfig(tmpDir, { routing: { fallback: { agent: "librarian", process: "answer-from-the-library" } } });
    const payload = await mapOf(tmpDir);
    expect(payload.fallback.source).toBe("root");
    expect(payload.fallback.agent).toEqual({ id: "librarian", path: ".ai/agents/librarian/AGENT.md" });
    expect(payload.fallback.process.path).toBe(".ai/agents/librarian/skills/processes/answer-from-the-library/SKILL.md");
  });

  it("names a help target the root borrows from its framework, instead of reporting no fallback", async () => {
    const framework = await fs.mkdtemp(path.join(os.tmpdir(), "base-mcp-framework-"));
    try {
      await writeAgent(framework, "concierge-base", "accueil");
      await writeConfig(tmpDir, { framework_dir: framework, routing: { fallback: { agent: "concierge-base", process: "accueil" } } });
      const payload = await mapOf(tmpDir);
      expect(payload.fallback.source).toBe("framework");
      // The framework THIS root declares, not whichever framework the engine happens to run from.
      expect(payload.fallback.root).toBe(path.resolve(framework).split(path.sep).join("/"));
      expect(payload.fallback.process.path).toBe(`${payload.fallback.root}/.ai/agents/concierge-base/skills/processes/accueil/SKILL.md`);
      expect(path.isAbsolute(payload.fallback.process.path)).toBe(true);
    } finally {
      await fs.rm(framework, { recursive: true, force: true });
    }
  });

  it("names no fallback when a configured target resolves nowhere", async () => {
    await writeConfig(tmpDir, { routing: { fallback: { agent: "librarian", process: "typo-process" } } });
    const payload = await mapOf(tmpDir);
    expect(payload.fallback).toBeUndefined();
    expect(payload.routing_map.length).toBeGreaterThan(0);
  });

  it("honours the mcp.agents allow-list and stays registered in read-only mode", async () => {
    await writeConfig(tmpDir, { mcp: { agents: ["librarian"] } });
    const payload = await mapOf(tmpDir, { readOnly: true });
    expect(payload.routing_map.map((agent: { id: string }) => agent.id)).toEqual(["librarian"]);
  });
});
