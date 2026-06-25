#!/usr/bin/env node
// Studio server — the thin transport binding over the api.mjs handlers. Native node:http (zero
// dependencies), JSON over /api/*, Server-Sent Events on /api/events fed by the file watcher so the
// UI stays a live projection of the files. Loopback by default.
//
//   node tools/studio/server.mjs --root . [--port 4319] [--host 127.0.0.1]

import http from "node:http";
import path from "node:path";
import { rootEgressPolicy } from "../core/egress.mjs";
import { FrontmatterSerializeError } from "../core/frontmatter.mjs";
import {
  ApiError,
  commitEdit,
  contextPayload,
  tildify,
  facets,
  getResource,
  listResources,
  proposeContent,
  proposeEdit,
  readFileContent,
  resolveStudioContext,
  rootPathFor,
  initPerimeter,
  search,
  searchAllRoots,
  tree,
} from "./api.mjs";
import { diagnose } from "../doctor/diagnose.mjs";
import { chat } from "./chat.mjs";
import { evalStatus, startEvaluation } from "./eval.mjs";
import { readFeedback } from "../core/feedback.mjs";
import { resolveFriction } from "./feedback.mjs";
import { experimentsOverview, getRun } from "./experiments.mjs";
import { clearCatalogCache, listCatalog, probeOllama, readSettings, resolveModel, settingsPath, testProvider, writeSettings } from "./settings.mjs";
import { createResourceWatcher } from "./watch.mjs";
import { detectPerimeter } from "../core/perimeter.mjs";
import { writeWorkspace } from "../core/roots.mjs";
import { reportProgress } from "../core/progress.mjs";

const MAX_BODY_BYTES = 5_000_000; // cap on a POST body (propose can carry a full document)
const DEFAULT_PORT = 4319;

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "::1", "0:0:0:0:0:0:0:1", "::ffff:127.0.0.1", "localhost"]);
export function isLoopbackHost(host) {
  return LOOPBACK_HOSTS.has(String(host).trim().toLowerCase());
}

// Studio has NO authentication and exposes WRITE endpoints (/api/propose, /api/commit) and an
// evaluation launch (/api/experiments/run) that can call model providers with the server's own API
// keys. Binding a non-loopback host would let anyone on the network write files and spend your keys.
// Refuse it unless the operator explicitly accepts the risk — the README's "loopback only" promise,
// mechanically enforced. Returns an error message to print (then exit), or null when binding is fine.
export function remoteExposureError(host, env = process.env) {
  if (isLoopbackHost(host)) return null;
  if (env.BASE_STUDIO_ALLOW_INSECURE_REMOTE === "1") return null;
  return [
    `Refusing to bind non-loopback host "${host}".`,
    "BASE Studio has no authentication and exposes write + evaluation endpoints (it can call model",
    "providers with the server's API keys), so exposing it on the network is unsafe. Keep it on",
    "loopback, or set BASE_STUDIO_ALLOW_INSECURE_REMOTE=1 to override at your own risk.",
  ].join(" ");
}

function hostnameOf(value) {
  try {
    // URL.hostname returns IPv6 in brackets ("[::1]"); strip them so it matches LOOPBACK_HOSTS ("::1").
    return new URL(value.includes("://") ? value : `http://${value}`).hostname.toLowerCase().replace(/^\[|\]$/g, "");
  } catch {
    return "";
  }
}

// Defence-in-depth for the unauthenticated, loopback-bound API: refuse state-changing requests that
// did not originate from a same-machine page. A DNS-rebinding attacker reaches us with a non-loopback
// Host header (the domain the victim loaded, which only later resolves to 127.0.0.1); a cross-site
// page carries a foreign Origin. The Studio UI itself always has a loopback Host and (when sent) a
// loopback Origin — across ports is fine, since only the hostname must be loopback. GET reads are not
// guarded; only POSTs are. Returns a refusal message, or null when the request is local.
export function crossOriginError(req) {
  const host = hostnameOf(req.headers?.host ?? "");
  if (host && !isLoopbackHost(host)) return `Refused: non-loopback Host header "${req.headers.host}".`;
  const origin = req.headers?.origin;
  if (origin && !isLoopbackHost(hostnameOf(origin))) return `Refused: cross-origin request from "${origin}".`;
  return null;
}

// Accepts either a root directory path (single-root mode, as before) or a resolved Studio context
// from resolveStudioContext (single root OR workspace). The context is resolved once; every
// request then names its root by id (`root=<id>`), validated here (unknown id → 400).
export function createStudioServer(rootOrContext, { watch = true } = {}) {
  // `context` is mutable for ONE transition only: welcome → root/workspace after /api/init.
  let context = typeof rootOrContext === "string"
    ? { mode: "root", rootPath: path.resolve(rootOrContext), settingsDir: path.resolve(rootOrContext) }
    : rootOrContext;

  const sseClients = new Set();
  let watchers = [];
  const armWatchers = () => {
    for (const w of watchers) w.close?.();
    const rootPaths =
      context.mode === "workspace" ? context.roots.map((r) => r.path)
      : context.mode === "root" ? [context.rootPath]
      : []; // welcome: nothing to watch yet
    watchers = watch
      ? rootPaths.map((p) => createResourceWatcher(p, () => broadcast(sseClients, { type: "resources-changed" })))
      : [];
  };
  armWatchers();

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://localhost");
      const p = url.pathname;
      const q = url.searchParams;
      // Every file-touching endpoint is scoped to ONE root, resolved from the request's root id.
      const rootOf = () => rootPathFor(context, q.get("root") ?? "");

      if (req.method === "POST") {
        const blocked = crossOriginError(req);
        if (blocked) return json(res, 403, { error: blocked, code: "FORBIDDEN" });
      }

      if (req.method === "POST" && p === "/api/init") {
        const { created } = await initPerimeter(context);
        // The directory just became a BASE: re-resolve and serve it — no restart.
        context = await resolveStudioContext(context.dirPath);
        armWatchers();
        return json(res, 200, { created, context: contextPayload(context) });
      }
      if (req.method === "GET" && p === "/api/context") {
        return json(res, 200, contextPayload(context));
      }
      if (req.method === "PUT" && p === "/api/workspace") {
        const blocked = crossOriginError(req);
        if (blocked) return json(res, 403, { error: blocked, code: "FORBIDDEN" });
        if (context.mode !== "workspace") return json(res, 400, { error: "not a workspace", code: "BAD_REQUEST" });
        const body = await readJsonBody(req);
        const wsPath = context.workspace.path;
        const baseDir = path.dirname(wsPath);
        const incoming = Array.isArray(body.roots) ? body.roots : [];
        if (incoming.length === 0) return json(res, 400, { error: "a workspace needs at least one root", code: "BAD_REQUEST" });
        // Resolve and validate each declared root before touching disk: a workspace may only point
        // at real BASE roots, so the editor can never write a manifest that fails to load.
        const roots = [];
        const seen = new Set();
        for (const r of incoming) {
          const id = String(r.id ?? "").trim();
          const rel = String(r.path ?? "").trim();
          if (!id || !rel) return json(res, 400, { error: "each root needs an id and a path", code: "BAD_REQUEST" });
          if (seen.has(id)) return json(res, 400, { error: `duplicate root id: ${id}`, code: "BAD_REQUEST" });
          seen.add(id);
          const abs = path.resolve(baseDir, rel);
          const detection = await detectPerimeter(abs).catch(() => null);
          if (detection?.type !== "root") return json(res, 400, { error: `not a BASE root: ${rel}`, code: "BAD_REQUEST" });
          roots.push({ id, label: String(r.label ?? id).trim() || id, path: abs, default: Boolean(r.default), type: r.type, egress: r.egress });
        }
        await writeWorkspace(wsPath, { id: context.workspace.id, label: body.label ?? context.workspace.label, roots });
        // Re-resolve and serve the edited workspace, no restart (same transition as /api/init).
        context = await resolveStudioContext(baseDir);
        armWatchers();
        return json(res, 200, contextPayload(context));
      }
      if (req.method === "GET" && p === "/api/tree") {
        return json(res, 200, await tree(rootOf()));
      }
      if (req.method === "GET" && p === "/api/file") {
        return json(res, 200, await readFileContent(rootOf(), q.get("path")));
      }
      if (req.method === "GET" && p === "/api/resources") {
        return json(res, 200, await listResources(rootOf(), paramsFrom(q)));
      }
      if (req.method === "GET" && p === "/api/search") {
        const params = { limit: toInt(q.get("limit"), 20), under: q.get("under") || undefined, types: typesFrom(q) };
        if (q.get("root") === "*" && context.mode === "workspace") {
          return json(res, 200, await searchAllRoots(context, q.get("q"), params));
        }
        return json(res, 200, await search(rootOf(), q.get("q"), params));
      }
      if (req.method === "GET" && p === "/api/facets") {
        return json(res, 200, await facets(rootOf()));
      }
      if (req.method === "GET" && p === "/api/resource") {
        return json(res, 200, await getResource(rootOf(), q.get("id")));
      }
      if (req.method === "POST" && p === "/api/propose") {
        const b = await readJsonBody(req);
        const target = rootPathFor(context, b.root ?? "");
        // Two input shapes, one gate: structured {data, body} from the editor, raw {content}
        // from the partial-application flow (the rebuilt document travels verbatim).
        return json(res, 200, typeof b.content === "string"
          ? await proposeContent(target, b)
          : await proposeEdit(target, b));
      }
      if (req.method === "POST" && p === "/api/commit") {
        const b = await readJsonBody(req);
        return json(res, 200, await commitEdit(rootPathFor(context, b.root ?? ""), b.changeId));
      }
      if (req.method === "POST" && p === "/api/chat") {
        const b = await readJsonBody(req);
        const model = await resolveModel(context.settingsDir, b.model);
        const rootPath = rootPathFor(context, b.root ?? "");
        // Egress: provider locality (settings) meets the root's policy (workspace entry, else
        // the root's base.config.json).
        const settings = await readSettings(context.settingsDir);
        const modelLocality = settings.providers.find((pr) => pr.id === String(b.model ?? "").split("/")[0])?.locality ?? "remote";
        const wsEntry = context.mode === "workspace" ? context.roots.find((r) => r.path === rootPath) : null;
        const egressPolicy = wsEntry?.egress ?? (await rootEgressPolicy(rootPath));
        return json(res, 200, await chat(rootPath, b, { model, modelLocality, egressPolicy }));
      }
      if (req.method === "GET" && p === "/api/settings") {
        const settings = await readSettings(context.settingsDir);
        // The file these settings ARE, and whether it is shared by a workspace or owned by one
        // root — so the page can name the exact path and make the per-workspace resolution clear.
        settings.file = tildify(settingsPath(context.settingsDir));
        settings.scope = context.mode === "workspace" ? "workspace" : "root";
        // First-model help: only when nothing is configured, tell the UI whether a local Ollama
        // is reachable — so the guide can offer a one-click path. readSettings stays untouched
        // (its shape feeds other callers and e2e); the suggestion is added only here.
        if (settings.providers.length === 0) {
          settings.suggestion = { type: "ollama", reachable: await probeOllama() };
        }
        return json(res, 200, settings);
      }
      if (req.method === "PUT" && p === "/api/settings") {
        const blocked = crossOriginError(req);
        if (blocked) return json(res, 403, { error: blocked, code: "FORBIDDEN" });
        const written = await writeSettings(context.settingsDir, await readJsonBody(req));
        clearCatalogCache();
        return json(res, 200, written);
      }
      if (req.method === "GET" && p === "/api/models") {
        return json(res, 200, await listCatalog(context.settingsDir, { refresh: q.get("refresh") === "1" }));
      }
      if (req.method === "POST" && p === "/api/settings/test") {
        const b = await readJsonBody(req);
        return json(res, 200, await testProvider(context.settingsDir, b.providerId));
      }
      if (req.method === "GET" && p === "/api/doctor") {
        return json(res, 200, await diagnose(rootOf()));
      }
      if (req.method === "GET" && p === "/api/feedback") {
        const status = /** @type {"open" | "resolved" | "all"} */ (q.get("status") || "open");
        return json(res, 200, await readFeedback(rootOf(), { status }));
      }
      if (req.method === "POST" && p === "/api/feedback/resolve") {
        const b = await readJsonBody(req);
        return json(res, 200, await resolveFriction(rootPathFor(context, b.root ?? ""), b.path));
      }
      if (req.method === "GET" && p === "/api/experiments") {
        const overview = await experimentsOverview(rootOf(), { q: q.get("q") ?? undefined });
        return json(res, 200, { ...overview, eval: evalStatus() });
      }
      if (req.method === "POST" && p === "/api/experiments/run") {
        const b = await readJsonBody(req);
        return json(res, 202, await startEvaluation(rootPathFor(context, b.root ?? ""), b, { settingsDir: context.settingsDir }));
      }
      if (req.method === "GET" && p === "/api/experiments/run") {
        return json(res, 200, await getRun(rootOf(), q.get("name")));
      }
      if (req.method === "GET" && p === "/api/events") {
        return openSse(req, res, sseClients);
      }
      json(res, 404, { error: "not found" });
    } catch (error) {
      // Typed LLM port errors are relayed as-is (code + retriable), per the chat contract.
      const retriable = typeof error.retriable === "boolean" ? { retriable: error.retriable } : {};
      json(res, statusFor(error), { error: error.message, code: error.code ?? null, ...retriable, ...(error.details ?? {}) });
    }
  });

  server.on("close", () => {
    for (const watcher of watchers) watcher.close();
    // End any open SSE streams so close() never waits on a long-lived connection.
    for (const res of sseClients) {
      try {
        res.end();
      } catch {
        /* ignore */
      }
    }
    sseClients.clear();
  });
  return server;
}

function statusFor(error) {
  if (error instanceof FrontmatterSerializeError) return 422; // metadata not representable
  if (error instanceof ApiError) return error.code === "NOT_FOUND" ? 404 : error.code === "CONFLICT" ? 409 : 400;
  if (typeof error.code === "string" && error.code.startsWith("llm.")) return 502; // provider-side
  return 500;
}

function paramsFrom(q) {
  const out = {};
  for (const key of ["type", "under", "scope", "status", "sensitivity", "agent", "sort"]) {
    const v = q.get(key);
    if (v) out[key] = v;
  }
  const types = typesFrom(q);
  if (types) out.types = types;
  return out;
}

// `types=a,b,c` → ["a", "b", "c"]; absent or empty → undefined (no type mask).
function typesFrom(q) {
  const raw = q.get("types");
  if (!raw) return undefined;
  const types = raw.split(",").map((k) => k.trim()).filter(Boolean);
  return types.length ? types : undefined;
}

function toInt(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(body);
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new ApiError("request body too large", "BAD_REQUEST");
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ApiError("invalid JSON body", "BAD_REQUEST");
  }
}

function openSse(req, res, clients) {
  res.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-cache",
    connection: "keep-alive",
  });
  res.write(": connected\n\n");
  clients.add(res);
  req.on("close", () => clients.delete(res));
}

function broadcast(clients, data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    try {
      res.write(payload);
    } catch {
      clients.delete(res);
    }
  }
}

// Sanctioned launch path: refuse non-loopback exposure, resolve the context (workspace detection),
// THEN bind. Importers should use this rather than `createStudioServer(...).listen(host)` directly,
// so the exposure guard is never bypassed. Rejects (rather than printing/exiting) so callers stay
// in control of process lifecycle.
export async function startStudioServer(root, { host = "127.0.0.1", port = DEFAULT_PORT, env = process.env, watch = true } = {}) {
  const exposure = remoteExposureError(host, env);
  if (exposure) throw new Error(exposure);
  // Two stderr stage lines so a slow launch (workspace detection, then the bind) is not a silent wait.
  if (typeof root === "string") reportProgress("resolving context")(1, 1, root);
  const context = typeof root === "string" ? await resolveStudioContext(root) : root;
  const server = createStudioServer(context, { watch });
  reportProgress("binding")(1, 1, `${host}:${port}`);
  return new Promise((resolve, reject) => {
    // listen() reports failures via an 'error' event, not the callback. Without this handler an
    // EADDRINUSE (Studio already running) surfaces as an unhandled 'error' and a cryptic crash.
    const onError = (error) => {
      if (error.code === "EADDRINUSE") {
        reject(new Error(`BASE Studio tourne probablement deja: le port ${port} est occupe sur ${host}. Ouvrez l'instance existante, ou arretez-la avant de relancer.`));
      } else {
        reject(error);
      }
    };
    server.once("error", onError);
    server.listen(port, host, () => {
      server.removeListener("error", onError);
      resolve(server);
    });
  });
}

// Run standalone when invoked directly.
if (process.argv[1] && process.argv[1].endsWith("server.mjs")) {
  const args = process.argv.slice(2);
  const get = (flag, fallback) => {
    const i = args.indexOf(flag);
    return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
  };
  const root = get("--root", ".");
  const host = get("--host", "127.0.0.1");
  const port = toInt(get("--port"), DEFAULT_PORT);
  startStudioServer(root, { host, port })
    .then(() => {
      console.log(`BASE Studio API on http://${host}:${port}  (root: ${root})`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}
