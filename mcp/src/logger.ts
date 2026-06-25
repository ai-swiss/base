// Structured logging to stderr — critical: stdout is reserved for the MCP stdio transport, so every
// diagnostic must go to stderr or it would corrupt the protocol stream. The level gate is a numeric
// threshold; createLogger returns a Logger bound to a minimum level. LOG_LEVELS is also the source
// of truth for which --log-level values the CLI accepts (see transport.ts).
import type { LogLevel, Logger } from "./types.js";

export const LOG_LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

export function createLogger(minLevel: LogLevel = "info"): Logger {
  const threshold = LOG_LEVELS[minLevel];

  function emit(level: LogLevel, message: string, data?: Record<string, unknown>) {
    if (LOG_LEVELS[level] < threshold) return;
    const entry: Record<string, unknown> = {
      ts: new Date().toISOString(),
      level,
      msg: message,
    };
    if (data) Object.assign(entry, data);
    process.stderr.write(JSON.stringify(entry) + "\n");
  }

  return {
    debug: (msg, data) => emit("debug", msg, data),
    info: (msg, data) => emit("info", msg, data),
    warn: (msg, data) => emit("warn", msg, data),
    error: (msg, data) => emit("error", msg, data),
  };
}
