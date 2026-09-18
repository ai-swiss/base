// Knowledge access over MCP: the section grain on the two read tools, and the routing map a client's
// own model decides from. Kept out of index.ts so the entry file only composes.
//
// A whole document is the wrong unit at both ends of a read, too much to send and too vague to quote.
// The core already cuts a body at its headings and names every passage `id#anchor`; what a CHAT client
// needs around that answer lives here. The words that tell a model to ask for a passage rather than a
// page. The refusal to act on a call that names two different passages at once. The citation and the
// attribution line a quoted passage must travel with. And the content blocks: a printed page is an
// image, so it leaves as an image block rather than as base64 buried in JSON a model has to read past.
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { brokerRoutingFallback, brokerRoutingMap, type BrokerOpenResult } from "./base-core-adapter.js";

export const DISCOVER_DESCRIPTION = [
  "Search local BASE resources with explainable ranking over metadata, titles, descriptions and full text.",
  'grain: "section" returns passages instead of whole resources: a heading-delimited part of a document, with its heading path, a preview, and the citable ref id#anchor.',
  "Use it for a factual question, then open the best one or two passages with open_resource instead of whole pages.",
  "scope narrows the search to one folder (a collection).",
  "Results are a ranked shortlist and carry no verdict: you decide, you quote only text you have opened, and you cite the ref.",
].join(" ");

export const OPEN_DESCRIPTION = [
  "Open an INVENTORIED BASE resource by id or relative path, confined to the local project. Errors on a path that is not an inventoried resource (business data files: use access_resource).",
  "id#anchor opens that one passage, so a ref returned by discover_resources works here unchanged; the section argument does the same thing from a separate field.",
  "After a section-grain search, copy the returned ref into id_or_path unchanged: do not replace it with the parent id or derive an anchor from the heading.",
  'projection "outline" returns the headings with their anchors (the table of contents) instead of the body; projection "source" returns the source record, the citation, and the printed pages as images when the deployment holds them.',
  "lang opens the edition in that language when one exists, and `edition` says so when the canonical edition came back instead.",
  "Quote only text you have opened, verbatim, and cite the ref together with the citation line when one is returned.",
].join(" ");

/**
 * What to open, and which passage of it. An anchor may ride on the identifier (`id#anchor`, the ref a
 * section hit hands back) or arrive as `section`; both spellings reach the same read, and the anchor is
 * resolved by the core, which owns the derivation.
 *
 * Naming two DIFFERENT passages in one call is refused rather than arbitrated. The broker lets the
 * explicit option win, which is right for a program that built both halves on purpose. A chat client
 * that sends a ref it copied alongside a section it guessed would instead receive one passage while
 * believing it asked for the other, and quote it under the ref it did not get.
 */
export function sectionRequest(idOrPath: string, section?: string): { target: string; anchor: string | undefined } {
  const hash = idOrPath.indexOf("#");
  if (hash <= 0) return { target: idOrPath, anchor: section };
  const onRef = idOrPath.slice(hash + 1) || undefined;
  if (section && onRef && section !== onRef) {
    throw new Error(`Two different sections named in one call: "${onRef}" on the id and "${section}" in section. Ask for one of them.`);
  }
  return { target: idOrPath.slice(0, hash), anchor: section ?? onRef };
}

// What an opened resource carries beside its content: the passage it landed on or the table of
// contents, the edition that answered a `lang` request, the source record and its page images. Named
// once here, so a new sibling reaches every client by being added to this list rather than by growing
// a line in the entry file.
const SIBLINGS = ["section", "outline", "edition", "source", "images"] as const;

export function knowledgeSiblings(result: BrokerOpenResult): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of SIBLINGS) if (result[key] !== undefined) out[key] = result[key];
  return out;
}

/**
 * The payload of an opened resource: what the broker returned, plus the two lines a quoted passage has
 * to travel with. `cite_as` is how the author writes the reference to their own work. `attribution` is
 * the rule of use a collection declares for everything it holds, and it arrives from the caller because
 * only the deployment's config says whether it travels. Neither is invented: a resource that declares
 * nothing carries nothing, an empty citation line being worse than no line at all.
 */
export function openPayload(result: Record<string, unknown>, attribution?: string | null): Record<string, unknown> {
  const metadata = (result.resource as { metadata?: Record<string, unknown> } | undefined)?.metadata;
  const citation = metadata && typeof metadata.cite_as === "string" && metadata.cite_as.trim() ? metadata.cite_as : null;
  return { ...result, ...(citation ? { citation } : {}), ...(attribution ? { attribution } : {}) };
}

/**
 * The payload of a search. A section hit is already quotable on its own, so the attribution lines of
 * the collections the hits came from ride along, deduplicated: a reader that quotes from the shortlist
 * without opening anything still receives the rule of use. Without a reader (the deployment does not
 * ask for the prefix) the payload is the results alone.
 */
export async function foundPayload(
  results: unknown[],
  attribution?: (relPath: string) => Promise<string | null>,
): Promise<Record<string, unknown>> {
  if (!attribution) return { results };
  const lines = new Set<string>();
  for (const hit of results as Array<{ path?: string }>) {
    const line = typeof hit.path === "string" ? await attribution(hit.path) : null;
    if (line) lines.add(line);
  }
  return lines.size ? { attribution: [...lines], results } : { results };
}

export type KnowledgeBlock = { type: "text"; text: string } | { type: "image"; data: string; mimeType: string };

interface AttachedImage {
  data?: string;
  mime?: string;
  [key: string]: unknown;
}

/**
 * An opened resource as MCP content blocks. A page scan is an image, and base64 inside the JSON would
 * make a model read hundreds of kilobytes of noise to reach the two fields it wanted. So the bytes
 * leave the text while the page, the path and the size stay (the reader still learns the page exists
 * and where), and each attached page comes back as an image block, in page order, which is the form a
 * chat client can actually look at.
 */
export function openContentBlocks(payload: Record<string, unknown>, render: (payload: unknown) => string): KnowledgeBlock[] {
  const images = Array.isArray(payload.images) ? (payload.images as AttachedImage[]) : null;
  if (!images) return [{ type: "text", text: render(payload) }];
  const listed = images.map(({ data: _data, ...rest }) => rest);
  const blocks: KnowledgeBlock[] = [{ type: "text", text: render({ ...payload, images: listed }) }];
  for (const image of images) {
    if (typeof image.data === "string" && typeof image.mime === "string") blocks.push({ type: "image", data: image.data, mimeType: image.mime });
  }
  return blocks;
}

// ---------------------------------------------------------------------------
// The routing map, without a verdict
// ---------------------------------------------------------------------------

export interface RoutingMapToolDeps {
  effectiveRoot: (rootId?: string) => Promise<string>;
  scopeForRoot: (root: string) => Record<string, unknown> | undefined;
  json: (payload: unknown, scope?: Record<string, unknown>) => string;
  clientError: (err: unknown, root: string) => string;
  /** The deployment's agent allow-list (`mcp.agents`): an agent it refuses never appears on the map. */
  agentAllowed?: (agentId: string) => boolean;
  /** The deployment's tool allow-list (`mcp.tools`), by name. Absent, the tool registers. */
  expose?: (tool: string) => boolean;
}

// The discipline a reader follows when it holds a map and nothing else: it decides, it opens, it does
// not invent. route_request frames its own next_actions around a deterministic hint the reader has to
// qualify; there is no hint here, so these three lines say only what to do with the map itself.
function mapDiscipline(): string[] {
  return [
    "Choose the process whose use_when covers the request, honouring avoid. This map carries no verdict and no score: the decision is yours.",
    "Open the chosen agent (its AGENT.md), then the process (open_resource), and follow it. Route at task boundaries, not on every message.",
    "If nothing fits, open `fallback` when one is present; otherwise say so and ask one clarifying question. Never invent an id or a path: use only those listed here.",
  ];
}

// Read-only, and registered in every mode: routing metadata already belongs to the read-only surface
// (route_request returns the same map), and a client whose model routes by itself must not have to ask
// for a verdict it will discard in order to obtain the map.
export function registerGetRoutingMap(server: McpServer, deps: RoutingMapToolDeps): void {
  const { effectiveRoot, scopeForRoot, json, clientError, agentAllowed = () => true, expose = () => true } = deps;
  if (!expose("get_routing_map")) return;
  server.tool(
    "get_routing_map",
    [
      "The routing map of this BASE, for your own model to decide from: the agents with their use_when, their processes with use_when and avoid, and the discipline to apply.",
      "It returns no status, no candidates and no score. route_request stays for a deterministic hint and returns this same map beside it; call this one when you route by yourself.",
      "A configured fallback (the agent and process to open when nothing fits) is named when the deployment has one, wherever it lives: a root may borrow its welcome process from the BASE framework it belongs to instead of copying it.",
      "Read-only.",
    ].join(" "),
    {
      root_id: z.string().optional().describe("Optional root id from load_agent when several roots are visible."),
    },
    async ({ root_id }: { root_id?: string }) => {
      let selectedRoot = "";
      try {
        selectedRoot = await effectiveRoot(root_id);
        const routingMap = (await brokerRoutingMap(selectedRoot)).filter((agent) => agentAllowed(agent.id));
        const fallback = await brokerRoutingFallback(selectedRoot);
        const payload = { routing_map: routingMap, ...(fallback ? { fallback } : {}), next_actions: mapDiscipline() };
        return { content: [{ type: "text" as const, text: json(payload, scopeForRoot(selectedRoot)) }] };
      } catch (err) {
        return { content: [{ type: "text" as const, text: clientError(err, selectedRoot) }], isError: true };
      }
    },
  );
}
