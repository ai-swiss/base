// mcp/src/auth.ts — the AuthProvider port (MCP-only, since networking is MCP-only).
//
// Default is NoAuth on loopback (95% local case, zero friction). Remote exposure is refused by
// default unless an AuthProvider is configured or the operator opts in explicitly (see index.ts).
// `bearerTokenAuth` is the "good enough for a team" reference between nothing and full OAuth 2.1.

import { createHash, timingSafeEqual } from "node:crypto";
import type { Request, RequestHandler } from "express";

export type AuthResult = { ok: boolean; principal?: unknown };
export type AuthProvider = (req: Request) => AuthResult | Promise<AuthResult>;

export const noAuth: AuthProvider = () => ({ ok: true });

export function bearerTokenAuth(token: string): AuthProvider {
  return (req) => {
    const header = req.header("authorization") ?? "";
    const match = header.match(/^Bearer\s+(.+)$/i);
    return { ok: !!match && constantTimeEqual(match[1].trim(), token) };
  };
}

// Constant-time comparison that leaks neither length nor matching prefix. We hash both sides to a
// fixed 32-byte digest first, because `crypto.timingSafeEqual` throws on length-mismatched inputs
// (which would itself reintroduce a length oracle).
function constantTimeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a, "utf8").digest();
  const hb = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(ha, hb);
}

// Resolve the active provider: a function/descriptor `config.auth` wins; else a bearer token from
// the environment; else NoAuth. `configured` is false only for the NoAuth fallback.
export function resolveAuthProvider(
  config?: { auth?: unknown } | null,
  env: NodeJS.ProcessEnv = process.env,
): { provider: AuthProvider; configured: boolean } {
  if (typeof config?.auth === "function") return { provider: config.auth as AuthProvider, configured: true };
  if (config?.auth === "none" || (typeof config?.auth === "object" && (config.auth as { type?: unknown } | null)?.type === "none")) {
    return { provider: noAuth, configured: false };
  }
  if (config?.auth === "bearer" || (typeof config?.auth === "object" && (config.auth as { type?: unknown } | null)?.type === "bearer")) {
    const descriptor = typeof config.auth === "object" ? (config.auth as { env?: unknown }) : {};
    const envName = typeof descriptor.env === "string" ? descriptor.env : "BASE_MCP_BEARER_TOKEN";
    const token = env[envName];
    if (!token) {
      throw new Error(`base.config.invalid: auth bearer requires ${envName}.`);
    }
    return { provider: bearerTokenAuth(token), configured: true };
  }
  if (config?.auth !== undefined && config.auth !== null) {
    throw new Error("base.config.invalid: unknown auth descriptor.");
  }
  const token = env.BASE_MCP_BEARER_TOKEN;
  if (token) return { provider: bearerTokenAuth(token), configured: true };
  return { provider: noAuth, configured: false };
}

export function authMiddleware(provider: AuthProvider): RequestHandler {
  return async (req, res, next) => {
    try {
      const result = await provider(req);
      if (result.ok) {
        next();
        return;
      }
    } catch {
      // fall through to 401
    }
    res.status(401).json({ jsonrpc: "2.0", error: { code: -32001, message: "Unauthorized" }, id: null });
  };
}
