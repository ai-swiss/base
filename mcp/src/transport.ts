// The reach layer: how the server is invoked (CLI flags -> CliArgs) and whether it may be exposed on
// a network (remote-exposure policy). Pure and side-effect-free apart from reading process.env, so it
// is unit-testable in isolation. The SDK wiring (createHttpApp, stdio/http bootstrap) stays in
// index.ts with createServer; this module only decides, it does not connect.
import type { CliArgs, LogLevel } from "./types.js";
import { LOG_LEVELS } from "./logger.js";
import type { Request, Response, NextFunction } from "express";

export const DEFAULT_PORT = 3100;

export function parseArgs(argv: string[] = process.argv.slice(2)): CliArgs {
  let readOnlyExplicit = false;
  const args: CliArgs = {
    root: "",
    workspace: "",
    rootId: "",
    transport: "stdio",
    port: DEFAULT_PORT,
    host: "127.0.0.1",
    logLevel: "info",
    readOnly: process.env.BASE_MCP_READ_ONLY === "1",
  };

  function requireValue(flag: string, value: string | undefined): string {
    if (!value || value.startsWith("--")) {
      throw new Error(`${flag} requires a value.`);
    }
    return value;
  }

  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const next = argv[i + 1];

    switch (flag) {
      case "--root":
        args.root = requireValue("--root", next);
        i++;
        break;
      case "--workspace":
        args.workspace = requireValue("--workspace", next);
        i++;
        break;
      case "--root-id":
        args.rootId = requireValue("--root-id", next);
        i++;
        break;
      case "--transport": {
        const val = requireValue("--transport", next);
        if (val !== "stdio" && val !== "http") {
          throw new Error(`Invalid transport: ${val}. Must be "stdio" or "http".`);
        }
        args.transport = val;
        i++;
        break;
      }
      case "--port": {
        const val = requireValue("--port", next);
        args.port = parseInt(val, 10);
        if (Number.isNaN(args.port) || args.port < 1 || args.port > 65535) {
          throw new Error(`Invalid port: ${val}. Must be between 1 and 65535.`);
        }
        i++;
        break;
      }
      case "--host":
        args.host = requireValue("--host", next);
        i++;
        break;
      case "--read-only":
        args.readOnly = true;
        readOnlyExplicit = true;
        break;
      case "--read-write":
        args.readOnly = false;
        readOnlyExplicit = true;
        break;
      case "--log-level": {
        const val = requireValue("--log-level", next);
        if (!Object.hasOwn(LOG_LEVELS, val)) {
          throw new Error(`Invalid log level: ${val}. Must be debug, info, warn, or error.`);
        }
        args.logLevel = val as LogLevel;
        i++;
        break;
      }
    }
  }

  if (args.transport === "http" && !readOnlyExplicit && process.env.BASE_MCP_READ_ONLY !== "0") {
    args.readOnly = true;
  }

  return args;
}

const LOOPBACK_HOSTS = new Set([
  "127.0.0.1",
  "::1",
  "0:0:0:0:0:0:0:1",
  "::ffff:127.0.0.1",
  "localhost",
]);

export function isLoopbackHost(host: string): boolean {
  return LOOPBACK_HOSTS.has(String(host).trim().toLowerCase());
}

/**
 * Binding a non-loopback host without auth would let anyone on the network access the exposed
 * MCP surface. HTTP is read-only by default, but an operator can explicitly enable write/execute
 * tools; refuse exposure unless auth is configured or the operator accepts the insecure override.
 * Returns an error message to print (then exit), or null when binding is allowed.
 */
export function remoteExposureError(
  host: string,
  env: NodeJS.ProcessEnv = process.env,
  hasAuth = false,
): string | null {
  if (isLoopbackHost(host)) return null;
  if (hasAuth) return null;
  if (env.BASE_MCP_ALLOW_INSECURE_REMOTE === "1") return null;
  return [
    `Refusing to bind non-loopback host "${host}" without authentication.`,
    "BASE MCP has no built-in auth: exposing it on the network lets anyone reach the MCP tools you expose.",
    "Put it behind an authenticated reverse proxy (see mcp/README.md), or set",
    "BASE_MCP_ALLOW_INSECURE_REMOTE=1 to override at your own risk.",
  ].join(" ");
}

function hostnameOf(value: string): string {
  try {
    // URL.hostname returns IPv6 in brackets ("[::1]"); strip them so it matches the loopback set ("::1").
    return new URL(value.includes("://") ? value : `http://${value}`).hostname.toLowerCase().replace(/^\[|\]$/g, "");
  } catch {
    return "";
  }
}

/**
 * DNS-rebinding / cross-origin defence for the HTTP transport, mirroring the Studio's guard
 * (tools/studio/server.mjs). The loopback-bound server is reachable from a victim's browser: a
 * DNS-rebinding attacker arrives with a non-loopback Host header (their domain, which only later
 * resolves to 127.0.0.1), and a cross-site page carries a foreign Origin. A non-browser MCP client
 * sends a loopback Host and no Origin, so it passes. The guard defends the LOOPBACK deployment only:
 * when the operator binds a non-loopback host on purpose (auth-gated, see remoteExposureError),
 * Host/Origin vary legitimately and authentication is the control, so the rebinding check is skipped.
 * Returns a refusal message, or null when the request is acceptable.
 */
export function crossOriginError(
  headers: { host?: string; origin?: string | string[] },
  bindHost: string,
): string | null {
  if (!isLoopbackHost(bindHost)) return null;
  const host = hostnameOf(headers.host ?? "");
  if (host && !isLoopbackHost(host)) return `Refused: non-loopback Host header "${headers.host}".`;
  const origin = Array.isArray(headers.origin) ? headers.origin[0] : headers.origin;
  if (origin && !isLoopbackHost(hostnameOf(origin))) return `Refused: cross-origin request from "${origin}".`;
  return null;
}

/**
 * Express middleware applying {@link crossOriginError}: a refused request gets a 403 JSON-RPC error
 * (the refusal is explicit, never silent), otherwise it passes through. Mounted ahead of auth on the
 * MCP endpoint so a forged Host/Origin is rejected before any work.
 */
export function dnsRebindingGuard(bindHost: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const blocked = crossOriginError(req.headers, bindHost);
    if (blocked) {
      res.status(403).json({ jsonrpc: "2.0", error: { code: -32600, message: blocked }, id: null });
      return;
    }
    next();
  };
}
