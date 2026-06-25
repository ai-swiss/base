// Typed errors for the BASE semantic ranker.
//
// Each error carries a stable `code` so callers (CLI, MCP, a retry policy, a host application) can
// branch on the *type* of failure instead of matching on message strings. `retriable` states whether
// retrying the same call could plausibly succeed — it is the single source of truth for the retry
// policy in `transport.mjs`. Configuration, auth, malformed-response and dimension errors are never
// retriable: retrying them only wastes a provider quota.

/** @typedef {{ code?: string, cause?: unknown, status?: number, retryAfterMs?: number, retriable?: boolean }} SemanticErrorOptions */

export class SemanticError extends Error {
  /**
   * @param {string} message
   * @param {SemanticErrorOptions} [opts]
   */
  constructor(message, { code, cause, status, retryAfterMs, retriable = false } = {}) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.retriable = retriable;
    if (cause !== undefined) this.cause = cause;
    if (status !== undefined) this.status = status;
    if (retryAfterMs !== undefined) this.retryAfterMs = retryAfterMs;
  }
}

// Invalid configuration: a missing model, a bad option, no provider. A bug in the caller, not a
// transient condition — fail loudly and immediately.
export class SemanticConfigError extends SemanticError {
  constructor(message, opts = {}) { super(message, { ...opts, code: "semantic.config", retriable: false }); }
}

// The request exceeded its per-call timeout. Transient: a retry with backoff may succeed.
export class EmbeddingTimeoutError extends SemanticError {
  constructor(message, opts = {}) { super(message, { ...opts, code: "semantic.timeout", retriable: true }); }
}

// The caller aborted the request through an AbortSignal. Deliberate cancellation — never retried.
export class EmbeddingAbortError extends SemanticError {
  constructor(message, opts = {}) { super(message, { ...opts, code: "semantic.abort", retriable: false }); }
}

// The provider answered, but the payload was not the expected shape (wrong count, non-numeric vector,
// mixed dimensions, invalid JSON). Retrying an identical request will not change a malformed contract.
export class EmbeddingResponseError extends SemanticError {
  constructor(message, opts = {}) { super(message, { ...opts, code: "semantic.response", retriable: false }); }
}

// Authentication or authorization failed (401/403). A credential problem — retrying is pointless.
export class EmbeddingAuthError extends SemanticError {
  constructor(message, opts = {}) { super(message, { ...opts, code: "semantic.auth", retriable: false }); }
}

// Rate limited / quota exceeded (429). Transient: honour `retryAfterMs` then back off.
export class EmbeddingRateLimitError extends SemanticError {
  constructor(message, opts = {}) { super(message, { ...opts, code: "semantic.rate_limit", retriable: true }); }
}

// The provider could not be reached, or returned a 5xx. Transient: retry with backoff.
export class EmbeddingNetworkError extends SemanticError {
  constructor(message, opts = {}) { super(message, { ...opts, code: "semantic.network", retriable: true }); }
}

// A vector was empty, non-numeric, or its dimension disagreed with the query (usually a stale index
// or a changed model). A correctness problem the caller must see — never silently retried.
export class VectorDimensionError extends SemanticError {
  constructor(message, opts = {}) { super(message, { ...opts, code: "semantic.dimension", retriable: false }); }
}
