// Typed errors for the BASE LLM port.
//
// Each error carries a stable `code` so callers (an eval runner, a CLI, a host app, a retry policy)
// branch on the *type* of failure instead of matching message strings. `retriable` is the single
// source of truth for the retry policy in `transport.mjs`: only transient conditions (network,
// timeout, rate limit) are retriable; config, auth, malformed-response and abort never are.

/** @typedef {{ code?: string, cause?: unknown, status?: number, retryAfterMs?: number, retriable?: boolean }} LlmErrorOptions */

export class LlmError extends Error {
  /**
   * @param {string} message
   * @param {LlmErrorOptions} [opts]
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

// Invalid configuration or request shape: missing model/baseUrl, no messages, a bad tool definition.
// A caller bug, not a transient condition — fail loudly and immediately.
export class LlmConfigError extends LlmError {
  constructor(message, opts = {}) { super(message, { ...opts, code: "llm.config", retriable: false }); }
}

// The request exceeded its per-call timeout. Transient: a retry with backoff may succeed.
export class LlmTimeoutError extends LlmError {
  constructor(message, opts = {}) { super(message, { ...opts, code: "llm.timeout", retriable: true }); }
}

// The caller aborted the request through an AbortSignal. Deliberate cancellation — never retried.
export class LlmAbortError extends LlmError {
  constructor(message, opts = {}) { super(message, { ...opts, code: "llm.abort", retriable: false }); }
}

// The provider answered, but the payload was not the expected shape (no choices, non-JSON tool
// arguments, invalid JSON). Retrying an identical request will not change a malformed contract.
export class LlmResponseError extends LlmError {
  constructor(message, opts = {}) { super(message, { ...opts, code: "llm.response", retriable: false }); }
}

// Authentication or authorization failed (401/403). A credential problem — retrying is pointless.
export class LlmAuthError extends LlmError {
  constructor(message, opts = {}) { super(message, { ...opts, code: "llm.auth", retriable: false }); }
}

// Rate limited / quota exceeded (429). Transient: honour `retryAfterMs`, then back off.
export class LlmRateLimitError extends LlmError {
  constructor(message, opts = {}) { super(message, { ...opts, code: "llm.rate_limit", retriable: true }); }
}

// The provider could not be reached, or returned a 5xx. Transient: retry with backoff.
export class LlmNetworkError extends LlmError {
  constructor(message, opts = {}) { super(message, { ...opts, code: "llm.network", retriable: true }); }
}
