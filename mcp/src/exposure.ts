// What a deployment exposes over MCP, from the `mcp` section of the root's base.config.json.
//
// The section is read through the core's config resolver, like every other key, so it is validated
// before the server sees it: absent means the whole surface, a malformed section stops startup, and a
// tool name that matches nothing is refused instead of narrowing nothing. Reading the file here and
// swallowing the parse error would answer «expose everything» to exactly the file an operator wrote to
// expose less, which is the one answer that must never come from a mistake.
import * as path from "node:path";
import { brokerAttributionFor, brokerResolveConfig } from "./base-core-adapter.js";

export interface McpExposure {
  /** Tool names to register, or null for all of them. */
  tools: Set<string> | null;
  /** Agent names `load_agent` may list and load, or null for all of them. */
  agents: Set<string> | null;
  /** Whether a read carries the attribution line of the collection it comes from. */
  attributionPrefix: boolean;
}

interface McpConfigSection {
  tools?: string[];
  agents?: string[];
  attribution_prefix?: boolean;
}

export async function readMcpExposure(rootDir: string): Promise<McpExposure> {
  const mcp = ((await brokerResolveConfig(rootDir)).mcp ?? null) as McpConfigSection | null;
  return {
    tools: Array.isArray(mcp?.tools) ? new Set(mcp.tools) : null,
    agents: Array.isArray(mcp?.agents) ? new Set(mcp.agents) : null,
    attributionPrefix: mcp?.attribution_prefix === true,
  };
}

/**
 * The attribution a folder declares for what it holds: the nearest README.md card, walking up from the
 * resource's own folder to the root, whose frontmatter carries `attribution`. A collection of converted
 * material states once how it must be credited, and every read of it then carries that line, so the
 * rule of use reaches a client that never opens the folder card.
 *
 * The memo belongs to ONE server instance, not to the module. A module-level cache outlives every root
 * and every edit, so a long-lived server would keep serving the line a folder card carried before
 * someone corrected it. The life of a server is the longest a lookup may be trusted for, and under the
 * stateless HTTP transport (a fresh server per request) it is shorter still.
 */
export function attributionReader(exposure: McpExposure): (rootDir: string, relPath: string) => Promise<string | null> {
  if (!exposure.attributionPrefix) return async () => null;
  const memo = new Map<string, string | null>();
  return async (rootDir, relPath) => {
    let dir = path.posix.dirname(relPath.split(path.sep).join("/"));
    while (dir && dir !== "." && dir !== "/") {
      const key = `${rootDir}::${dir}`;
      if (!memo.has(key)) memo.set(key, await brokerAttributionFor(rootDir, dir));
      const line = memo.get(key);
      if (line) return line;
      dir = path.posix.dirname(dir);
    }
    return null;
  };
}
