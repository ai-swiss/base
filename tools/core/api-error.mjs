// tools/core/api-error.mjs — a small Error carrying a machine `code`, shared by the core model/settings
// resolvers and the Studio API layer. It lives in the core (not in tools/studio/api.mjs) so the core
// can throw it WITHOUT importing the Studio layer: the dependency direction stays one-way (Studio →
// core), which keeps the published package self-contained (the MCP bundle ships tools/core/, not
// tools/studio/). The Studio API re-exports this class, so its consumers and the HTTP status mapping
// (which reads `.code`) are unchanged.
export class ApiError extends Error {
  /** @param {string} message @param {string} [code] @param {*} [details] */
  constructor(message, code, details = null) {
    super(message);
    this.name = "ApiError";
    this.code = code; // "NOT_FOUND" | "BAD_REQUEST" | "CONFLICT"
    this.details = details; // optional structured payload echoed in the JSON response (e.g. { problems })
  }
}
