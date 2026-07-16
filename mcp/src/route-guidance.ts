// Server-led sequencing for a stateless remote executor (MCP robustness). Extracted from index.ts so
// the entry file only composes: this module derives the next legal steps for a route result, inlines
// the routed process's own instructions, and registers the read-only change-status tools. None of it
// reads or edits authored process text — it echoes the protocol and delivers the author's words.
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { brokerListPendingChanges, brokerGetChangeStatus, brokerRoutingMap } from "./base-core-adapter.js";

// The routing discipline the model follows, framed so the MODEL decides from the returned map. The
// deterministic result is a hint to verify, never an order: word-overlap is brittle on paraphrase, so
// a confident-looking lexical route can still be wrong. Framework-derived; echoes no authored process text.
export function routeNextActions(): string[] {
  return [
    "Decide the route yourself from `routing_map` below: choose the process whose «Quand l'utiliser» (use_when) covers the request, honouring «Éviter si» (avoid). Any deterministic suggestion in this result is a hint to verify, not an order.",
    "If a process is suggested (see `guidance`), confirm its use_when covers the request before following it; if it does not, pick the right process from routing_map.",
    "If nothing in routing_map fits, say so and ask a clarifying question. Never invent an id or path: use only those listed in routing_map.",
    "Once a process is chosen, open it (open_resource) and follow it. To change a file, call propose_change then commit_change, and never report a file as written without a commit_change receipt.",
  ];
}

// Attach the framework's routing aids to a route result: the discipline (always), the compact routing
// map the model decides on (always, egress-filtered - so it can verify or override the deterministic
// hint), and, on a routed hint, the suggested process body as a head-start (the author's words). The
// opener is injected to avoid a cycle with index.ts; a confidential process is not inlined.
export async function withRouteGuidance(
  rootDir: string,
  result: Record<string, unknown>,
  opener: (rootDir: string, idOrPath: string, projection?: "metadata" | "instructions" | "full", purpose?: string) => Promise<{ content: string }>,
): Promise<Record<string, unknown>> {
  const status = result.status as string | undefined;
  const augmented: Record<string, unknown> = { ...result, next_actions: routeNextActions() };
  // The map the model routes on. Best-effort: if it cannot be built, next_actions still guides.
  try {
    augmented.routing_map = await brokerRoutingMap(rootDir);
  } catch {
    // omit the map if unavailable; the deterministic candidates + next_actions remain.
  }
  const process = result.process as { path?: string } | null | undefined;
  if (status === "routed" && process?.path) {
    try {
      const opened = await opener(rootDir, process.path, "full", "route_request guidance");
      if (typeof opened.content === "string") augmented.guidance = opened.content;
    } catch {
      // confidential/withheld or unreadable: routing_map + next_actions still guide the model.
    }
  }
  return augmented;
}

// Dependencies the change-status tools need from the createServer closure.
export interface ChangeToolDeps {
  effectiveRoot: (rootId?: string) => Promise<string>;
  scopeForRoot: (root: string) => Record<string, unknown> | undefined;
  json: (payload: unknown, scope?: Record<string, unknown>) => string;
  clientError: (err: unknown, root: string) => string;
}

// Register the read-only change-status tools (available in every mode: they let a caller or a human
// verify what is staged and whether a claimed write actually happened, against server truth).
export function registerChangeStatusTools(server: McpServer, deps: ChangeToolDeps): void {
  const { effectiveRoot, scopeForRoot, json, clientError } = deps;

  server.tool(
    "list_pending_changes",
    "List mediated writes proposed (propose_change) but not yet committed in this project. Read-only. Shows what is staged awaiting approval; a committed change is consumed and no longer appears here.",
    {
      root_id: z.string().optional().describe("Optional root id when several roots are visible."),
    },
    async ({ root_id }: { root_id?: string }) => {
      let selectedRoot = "";
      try {
        selectedRoot = await effectiveRoot(root_id);
        const result = await brokerListPendingChanges(selectedRoot);
        return { content: [{ type: "text" as const, text: json(result, scopeForRoot(selectedRoot)) }] };
      } catch (err) {
        return { content: [{ type: "text" as const, text: clientError(err, selectedRoot) }], isError: true };
      }
    },
  );

  server.tool(
    "get_change_status",
    "Report whether a change_id is still pending (staged, awaiting commit) or absent (committed and consumed, or never proposed). The authoritative proof a write LANDED is the commit_change receipt (written:true with content_hash); this is the pending-side view. Use it to verify a claimed write instead of trusting a narrated 'done'. Read-only.",
    {
      change_id: z.string().describe("The change_id returned by propose_change."),
      root_id: z.string().optional().describe("Optional root id when several roots are visible."),
    },
    async ({ change_id, root_id }: { change_id: string; root_id?: string }) => {
      let selectedRoot = "";
      try {
        selectedRoot = await effectiveRoot(root_id);
        const result = await brokerGetChangeStatus(selectedRoot, change_id);
        return { content: [{ type: "text" as const, text: json(result, scopeForRoot(selectedRoot)) }] };
      } catch (err) {
        return { content: [{ type: "text" as const, text: clientError(err, selectedRoot) }], isError: true };
      }
    },
  );
}
