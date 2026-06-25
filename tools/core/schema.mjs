// tools/core/schema.mjs — the base.resource.v1 controlled vocabulary. Zero dependencies.
// Single source for the enums shared by the broker and the Validator pipeline.
// Canonical JSON Schema: ../../base.schema.json (this file mirrors its enums).

export const SCHEMA_VERSION = "base.resource.v1";

export const SCHEMA_TYPES = new Set([
  "agent",
  "process",
  "knowledge",
  "competence",
  "tool",
  "template",
  "data",
  "data_collection",
  "document",
  "note",
  "journal",
  "trace",
  "source",
  "connector",
  "policy",
  "adapter",
  "schema",
]);

export const SCHEMA_SCOPES = new Set(["personal", "team", "org", "public", "enterprise-extension"]);
export const SCHEMA_STATUSES = new Set(["draft", "active", "deprecated", "archived"]);
export const SCHEMA_SENSITIVITIES = new Set(["public", "internal", "confidential", "sensitive", "restricted"]);
export const EXECUTION_TYPES = new Set(["script", "http", "mcp_tool", "manual", "sdk"]);
export const EXECUTION_RUNTIMES = new Set(["python", "node", "shell"]);
export const REQUIRE_ACCESS = new Set(["read", "write", "execute"]);
