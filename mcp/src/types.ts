// Shared type contracts for the MCP server. Kept in one module so the data shapes are visible in one
// place and the concern modules (discovery, transport, the server itself) import them without
// depending on each other. No runtime code lives here.

export interface AgentInfo {
  name: string;
  description: string;
  agentDir: string;
  projectRoot: string;
  rootId?: string;
  rootLabel?: string;
  dataFiles: DataFile[];
}

export interface DataFile {
  path: string;
  description: string;
}

export interface ResourceInfo {
  id: string;
  type: string;
  title: string;
  description: string;
  path: string;
  scope?: string;
  status?: string;
  sensitivity?: string;
  keywords?: string[];
  requires?: Record<string, unknown>[];
  may_use?: string[];
  source?: Record<string, unknown> | null;
  score?: number;
  reasons?: string[];
  execution?: {
    type?: string;
    runtime?: string;
    entrypoint?: string;
    requires_confirmation?: boolean;
  } | null;
}

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug: (msg: string, data?: Record<string, unknown>) => void;
  info: (msg: string, data?: Record<string, unknown>) => void;
  warn: (msg: string, data?: Record<string, unknown>) => void;
  error: (msg: string, data?: Record<string, unknown>) => void;
}

export interface CliArgs {
  root: string;
  workspace: string;
  rootId: string;
  transport: "stdio" | "http";
  port: number;
  host: string;
  logLevel: LogLevel;
  readOnly: boolean;
}

// Server exposure options. Defaults are the safe ones for the surface in question: a read-only
// server exposes no write/execute tools at all; `requireExecuteConfirmation` forces an explicit
// `confirmed: true` for non-dry-run tool execution, regardless of a resource's own
// `requires_confirmation: false` opt-out (the right posture when the surface is reachable remotely).
export interface ServerOptions {
  readOnly?: boolean;
  requireExecuteConfirmation?: boolean;
  scope?: Record<string, unknown>;
  workspaceScope?: Record<string, unknown>;
  workspaceRoots?: WorkspaceRoot[];
}

export interface WorkspaceRoot {
  id: string;
  label?: string;
  type?: string;
  path: string;
}
