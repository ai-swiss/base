// The co-thinker chat: a model that thinks WITH the user about a visible document, and never
// writes. Every revision it suggests becomes a proposal through the SAME propose→commit gate as a
// manual edit ({ changeId, diff }), the human applies or refuses. The chat also carries the BASE
// method (the créateur-agent processes shipped with the framework): the method process matching
// the edited type is injected into the context, and the read tools can reach the method corpus —
// improving the method means editing a Markdown file, never this code.
//
// Stateless on the server: the request carries { memory, messages }; when the conversation
// approaches the context budget the server COMPACTS (iterative structured summary + the recent
// messages kept verbatim) and the updated memory travels back in the response — pi's compaction
// schema as protocol DATA, no session manager. When the edited resource is a process, the context
// pack injects what the process declares, same implementation as the eval harness.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assistantMessage, getText, getToolCalls, systemMessage } from "@ai-swiss/base-llm";
import { inventoryResources, openResource, parseFrontmatter, searchResources } from "../base-core.mjs";
import { checkEgress, egressNotice } from "../core/egress.mjs";
import { buildContextPack, renderContextPack } from "../core/context-pack.mjs";
import { ApiError, proposeEdit } from "./api.mjs";

const MAX_TOOL_ROUNDS = 6;
// Estimated-token budget before compaction; overridable for tests/e2e via the environment.
const DEFAULT_CONTEXT_TOKENS = Number(process.env.STUDIO_CHAT_CONTEXT_TOKENS) > 0
  ? Number(process.env.STUDIO_CHAT_CONTEXT_TOKENS)
  : 12_000;
const KEEP_RECENT_MESSAGES = 4; // the recent window stays verbatim — only older turns are summarized
// The BASE-shipped method corpus: the framework's own root (createur-agent lives there).
const DEFAULT_METHOD_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const TOOLS = [
  {
    name: "propose_document",
    description:
      "Propose le document révisé. `body` : corps Markdown complet (omis = corps actuel). `data` : OBJET JSON (pas une chaîne) contenant uniquement les clés de métadonnées à CHANGER — elles fusionnent avec les métadonnées actuelles, jamais de suppression par omission. Rien n'est écrit: l'humain validera un diff.",
    parameters: {
      type: "object",
      properties: {
        data: { type: "object", description: "Frontmatter révisé complet (optionnel)" },
        body: { type: "string", description: "Corps Markdown révisé complet (optionnel)" },
      },
    },
  },
  {
    name: "open_resource",
    description: "Lire une ressource du root courant (ou du corpus de méthode BASE) par id ou chemin.",
    parameters: { type: "object", properties: { id_or_path: { type: "string" } }, required: ["id_or_path"] },
  },
  {
    name: "discover_resources",
    description: "Chercher des ressources (root courant + corpus de méthode BASE) quand le chemin exact est inconnu.",
    parameters: { type: "object", properties: { query: { type: "string" }, limit: { type: "number" } }, required: ["query"] },
  },
];

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * What a model SENT, turned into what the domain ACCEPTS. Models betray the tool schema in
 * known ways — `data` arrives as a JSON string (double encoding), as prose, as an array — and
 * spreading a string in JS silently explodes it into {0:'{',1:'"',…} (one frontmatter line per
 * character). So nothing merges before proving its shape, and every rejection becomes a warning
 * the user SEES — the current document is never degraded silently.
 * - data: plain object → merged over current.data (omission keeps, never deletes); JSON string
 *   parsing to a plain object → parsed then merged; null → treated as absent (a common model
 *   idiom for «rien à changer») ; anything else → dropped, with a warning.
 * - body: string → replaces current.body; anything else → dropped, with a warning.
 * @returns {{ data: object, body: string, warnings: string[] }}
 */
export function coerceProposalArguments(args, current) {
  const warnings = [];
  let data = current.data;
  const sentData = args?.data;
  if (sentData !== undefined && sentData !== null) {
    let candidate = sentData;
    if (typeof candidate === "string") {
      try {
        candidate = JSON.parse(candidate);
      } catch {
        // not JSON — stays a string, rejected below
      }
    }
    if (isPlainObject(candidate)) data = { ...current.data, ...candidate };
    else warnings.push("Le modèle a renvoyé des métadonnées illisibles — elles ont été conservées telles quelles.");
  }
  let body = current.body;
  const sentBody = args?.body;
  if (sentBody !== undefined && sentBody !== null) {
    if (typeof sentBody === "string") body = sentBody;
    else warnings.push("Le modèle a renvoyé un corps illisible — le corps actuel est conservé.");
  }
  return { data, body, warnings };
}

// A weak model sometimes PRINTS the propose_document tool-call as JSON text instead of issuing a
// real tool call, which would otherwise surface as raw JSON in the chat. extractTextProposal
// recovers its arguments so the human still gets a reviewable diff. Returns the arguments to feed
// coerceProposalArguments, or null when the text is an ordinary reply.
export function extractTextProposal(text) {
  if (typeof text !== "string" || !text.includes("propose_document")) return null;
  for (const candidate of jsonObjectsIn(text)) {
    let obj;
    try {
      obj = JSON.parse(candidate);
    } catch {
      continue;
    }
    if (!isPlainObject(obj)) continue;
    // Either the whole call {name:"propose_document", parameters|arguments:{…}} or bare arguments.
    const args = obj.name === "propose_document" ? (obj.parameters ?? obj.arguments ?? {}) : obj;
    if (isPlainObject(args) && (typeof args.body === "string" || isPlainObject(args.data))) return args;
  }
  return null;
}

// Candidate JSON object substrings in free text: any fenced ```json block first, then the first
// brace-balanced span. Enough to recover a tool-call a model printed instead of issued.
function jsonObjectsIn(text) {
  const out = [];
  const fence = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/g;
  for (let m = fence.exec(text); m; m = fence.exec(text)) out.push(m[1]);
  const start = text.indexOf("{");
  if (start >= 0) {
    let depth = 0;
    for (let i = start; i < text.length; i += 1) {
      if (text[i] === "{") depth += 1;
      else if (text[i] === "}") {
        depth -= 1;
        if (depth === 0) {
          out.push(text.slice(start, i + 1));
          break;
        }
      }
    }
  }
  return out;
}

// Method corpus inventories are stable per server process — cache per directory.
const methodCache = new Map();
async function methodProcessFor(methodDir, type) {
  if (!methodCache.has(methodDir)) {
    methodCache.set(methodDir, inventoryResources(methodDir).catch(() => []));
  }
  const resources = await methodCache.get(methodDir);
  return resources.find((r) => r.id === `methode-${type}`) ?? resources.find((r) => r.id === "ameliorer-agent") ?? null;
}

function buildSystemPrompt(resource, data, body, method) {
  const lines = [
    "Tu es le co-penseur d'édition de BASE Studio. Tu réfléchis AVEC l'utilisateur sur le document",
    "ci-dessous, visible à l'écran. Tu ne peux rien écrire: pour toute révision, appelle",
    "propose_document avec le document révisé complet — l'humain validera un diff. Modifie le",
    "minimum nécessaire. Pour les questions de méthode (métadonnées utiles, bons use_when,",
    "écriture d'instructions), appuie-toi sur la méthode BASE ci-dessous et sur les outils de",
    "lecture (open_resource, discover_resources).",
    "",
    "## Document courant",
    `chemin: ${resource.path}`,
    `type: ${resource.type}`,
    "métadonnées (JSON) :",
    JSON.stringify(data, null, 2),
    "corps:",
    body,
  ];
  if (method) {
    lines.push("", `## Méthode BASE (${method.id} — ${method.title})`, method.body);
  }
  return lines.join("\n");
}

async function readTool(root, methodDir, idOrPath, egress) {
  try {
    const opened = await openResource(root, idOrPath, { projection: "full", egress });
    return opened.content;
  } catch (rootError) {
    try {
      const opened = await openResource(methodDir, idOrPath, { projection: "full", egress });
      return opened.content;
    } catch {
      return `ERROR: introuvable dans le root et le corpus de méthode: ${idOrPath}`;
    }
  }
}

// ---------------------------------------------------------------------------
// Memory: pure decision + model-backed compaction, both exported for direct tests.

function estimateTokens(text) {
  return Math.ceil(String(text).length / 4);
}

/** Pure: does the conversation (summary included) exceed the context budget? */
export function shouldCompact(memory, messages, contextWindow = DEFAULT_CONTEXT_TOKENS) {
  const total = estimateTokens(memory?.summary ?? "") + messages.reduce((sum, m) => sum + estimateTokens(m.content), 0);
  return total > contextWindow;
}

/**
 * Iterative structured summary: the previous summary is an INPUT of the next one; the last
 * KEEP_RECENT_MESSAGES stay verbatim. → { summary, keptFrom } where keptFrom indexes the messages
 * array the CLIENT sent (it resends only messages from there on). Idempotent when nothing to fold.
 */
export async function compactMemory(memory, messages, { model }) {
  const keptFrom = Math.max(0, messages.length - KEEP_RECENT_MESSAGES);
  const toFold = messages.slice(0, keptFrom);
  if (toFold.length === 0) return memory ?? { summary: "", keptFrom: 0 };

  const completion = await model.complete({
    messages: [
      systemMessage(
        [
          "Tu compactes la mémoire d'une conversation d'édition. Produis un résumé STRUCTURÉ, fidèle",
          "et court, à rubriques fixes:",
          "- Intention: ce que l'utilisateur cherche à obtenir.",
          "- Décisions prises: chaque choix acté (ne perds aucune décision).",
          "- État du document: ce qui a été modifié/proposé/appliqué.",
          "L'ancien résumé (s'il existe) fait partie de l'historique à préserver.",
        ].join("\n"),
      ),
      {
        role: "user",
        content: [
          memory?.summary ? `Résumé précédent:\n${memory.summary}\n` : "",
          "Messages à résumer:",
          ...toFold.map((m) => `${m.role === "user" ? "Utilisateur" : "Assistant"} : ${m.content}`),
        ].filter(Boolean).join("\n"),
      },
    ],
  });
  return { summary: getText(completion.message), keptFrom };
}

async function discoverTool(root, methodDir, query, limit = 5, egress) {
  const [own, method] = await Promise.all([
    searchResources(root, query, { limit, egress }).catch(() => []),
    searchResources(methodDir, query, { limit, egress }).catch(() => []),
  ]);
  const describe = (r, source) => ({ id: r.id, type: r.type, path: r.path, title: r.title, score: r.score, source });
  return JSON.stringify([...own.map((r) => describe(r, "root")), ...method.map((r) => describe(r, "methode"))].slice(0, limit));
}

/**
 * One chat turn. `messages` is the whole visible conversation ([{role:"user"|"assistant", content}]);
 * `draft` carries unproposed on-screen edits (they are the session's truth).
 * → { reply, proposal: { changeId, target, exists, diff } | null, memory }
 * The model is INJECTED (resolved from the picker's ref by the server) — testable with createFauxModel.
 * @param {string} root
 * @param {{ path?: string, memory?: { summary: string, keptFrom: number } | null,
 * messages?: { role: string, content: string }[], draft?: { data?: object, body?: string } | null }} body
 * @param {{ model: any, methodDir?: string, modelLocality?: "local" | "remote", egressPolicy?: "local-only" | "any" }} deps
 */
export async function chat(root, { path: docPath, memory = null, messages = [], draft = null }, { model, methodDir = DEFAULT_METHOD_DIR, modelLocality = "remote", egressPolicy = "any" }) {
  if (!docPath) throw new ApiError("chat requires `path`", "BAD_REQUEST");
  if (!model) throw new ApiError("chat requires a `model`", "BAD_REQUEST");

  const resources = await inventoryResources(root);
  const resource = resources.find((r) => r.path === docPath || r.id === docPath);
  if (!resource) throw new ApiError(`resource not found: ${docPath}`, "NOT_FOUND");

  // Egress: the edited document itself never leaves toward a remote model when confidential
  // or when the whole root is local-only — and the refusal says what to do instead.
  const docVerdict = checkEgress({ modelLocality, rootPolicy: egressPolicy, resources: [resource] });
  if (docVerdict.withheld.length) {
    const reason = docVerdict.withheld[0].reason === "confidential" ? "ce document est confidentiel" : "ce root est local-only";
    throw new ApiError(`Chat refusé: ${reason} et le modèle choisi est distant. Choisissez un modèle local.`, "BAD_REQUEST");
  }

  const parsed = parseFrontmatter(resource.content);
  const data = draft?.data ?? parsed.data;
  const body = draft?.body ?? parsed.body;

  const method = await methodProcessFor(methodDir, resource.type);

  // A process card also pre-loads what the process declares (same pack as the eval harness),
  // under the same egress control — withheld documents are announced, in the pack and to the UI.
  let renderedPack = "";
  let packWithheld = [];
  if (resource.type === "process") {
    const pack = await buildContextPack(resources, (rel) => readFile(path.join(root, rel), "utf8"), resource.path, {
      egress: { modelLocality, rootPolicy: egressPolicy },
    });
    renderedPack = renderContextPack(pack);
    packWithheld = pack.withheld;
  }

  // Compact BEFORE the model call when the conversation outgrows the budget; the updated
  // memory travels back and the client resends only the kept tail.
  let memoryOut = memory ?? null;
  let visibleMessages = messages;
  if (shouldCompact(memory, messages)) {
    const compacted = await compactMemory(memory, messages, { model });
    memoryOut = compacted;
    visibleMessages = messages.slice(compacted.keptFrom);
  }

  const egressInfo = packWithheld.length
    ? { withheld: packWithheld, notice: egressNotice(packWithheld.map((w) => ({ resource: { path: w.path }, reason: w.reason }))) }
    : null;

  /** @type {any[]} */
  const wire = [
    systemMessage(buildSystemPrompt(resource, data, body, method) + (renderedPack ? `\n\n${renderedPack}` : "")),
    ...(memoryOut?.summary ? [systemMessage(`## Mémoire de la conversation (résumé)\n${memoryOut.summary}`)] : []),
    // The port wants assistant content as parts; the UI speaks plain strings.
    ...visibleMessages.map((m) => (m.role === "assistant" ? assistantMessage(m.content) : { role: "user", content: m.content })),
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const completion = await model.complete({ messages: wire, tools: TOOLS });
    const calls = getToolCalls(completion.message);
    const text = getText(completion.message);

    const proposeCall = calls.find((c) => c.name === "propose_document");
    if (proposeCall) {
      const revised = coerceProposalArguments(proposeCall.arguments, { data, body });
      const proposal = await proposeEdit(root, { path: resource.path, data: revised.data, body: revised.body });
      const reply = text || "Voici la modification proposée — relisez le diff.";
      return {
        reply: revised.warnings.length ? [...revised.warnings, reply].join("\n") : reply,
        proposal,
        memory: memoryOut,
        egress: egressInfo,
      };
    }

    if (calls.length === 0) {
      // A weak model may print the propose_document call as JSON text instead of issuing it.
      // Recover the arguments into a real diff so the human never has to read raw JSON.
      const textArgs = extractTextProposal(text);
      if (textArgs) {
        const revised = coerceProposalArguments(textArgs, { data, body });
        const proposal = await proposeEdit(root, { path: resource.path, data: revised.data, body: revised.body });
        const reply = "Voici la modification proposée — relisez le diff.";
        return {
          reply: revised.warnings.length ? [...revised.warnings, reply].join("\n") : reply,
          proposal,
          memory: memoryOut,
          egress: egressInfo,
        };
      }
      return { reply: text || "(pas de réponse)", proposal: null, memory: memoryOut, egress: egressInfo };
    }

    // Read tools: execute and loop, so the model can consult before answering. The SAME egress
    // context that withheld the document and the pack also gates these tool reads, so a remote model
    // cannot pull a confidential / local-only resource through open_resource or discover_resources.
    const toolEgress = { modelLocality, rootPolicy: egressPolicy };
    wire.push(completion.message);
    for (const call of calls) {
      let result;
      if (call.name === "open_resource") result = await readTool(root, methodDir, String(call.arguments?.id_or_path ?? ""), toolEgress);
      else if (call.name === "discover_resources") result = await discoverTool(root, methodDir, String(call.arguments?.query ?? ""), call.arguments?.limit, toolEgress);
      else result = `ERROR: outil inconnu ${call.name}`;
      wire.push({ role: "tool", toolCallId: call.id, content: String(result) });
    }
  }

  return { reply: "Le modèle n'a pas conclu (plafond d'appels d'outils atteint).", proposal: null, memory: memoryOut, egress: egressInfo };
}
