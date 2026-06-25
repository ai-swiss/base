// tools/core/policy.mjs — the PolicyEnforcer port. Zero dependencies.
//
// A PolicyEnforcer is `(resource, action, ctx) => { decision, reason, grant? }` with
//   action   ∈ "read" | "write" | "execute"
//   decision ∈ "allow" | "deny" | "needs_approval"
//
// The broker routes every mediated read/write/execute through the policy and acts on `deny`.
// Typical mediated actions are openResource/accessResource, invokeTool, and the
// proposeChange/commitChange write flow. Process metadata such as `requires[].access` declares
// intended use; it is not an authorization grant. The DEFAULT (advisoryPolicy) is permissive on
// `needs_approval`. An integrator swaps in a stricter adapter via base.config.policy without
// forking. Strict enforcement is only airtight in a harness where the broker is the single door
// (MCP, hooks); see specs/.../policy.md.

export function advisoryPolicy(resource, action, context = {}) {
  const sensitivity = resource?.sensitivity ?? "internal";
  const projection = context.projection ?? "full";
  const purpose = String(context.purpose ?? "").trim();

  if (action === "read") {
    if (projection === "metadata") {
      return { decision: "allow", reason: "Metadata projection does not expose resource body." };
    }
    if (sensitivity === "restricted" && !purpose && !context.confirmed) {
      return { decision: "deny", reason: "Restricted resources require a stated purpose or explicit confirmation." };
    }
    if (["confidential", "sensitive", "restricted"].includes(sensitivity)) {
      return { decision: "needs_approval", reason: `Reading ${sensitivity} content should be justified and reviewed.` };
    }
    return { decision: "allow", reason: "Resource is readable through the confined BASE broker." };
  }

  if (action === "execute") {
    if (context.dryRun) {
      return { decision: "allow", reason: "Dry-run only prepares the mediated command." };
    }
    if (resource?.execution?.requires_confirmation !== false && !context.confirmed) {
      return { decision: "deny", reason: "Execution requires explicit confirmation." };
    }
    if (["sensitive", "restricted"].includes(sensitivity) && !context.confirmed) {
      return { decision: "deny", reason: `${sensitivity} tools require explicit confirmation.` };
    }
    return { decision: "allow", reason: "Execution is confirmed and mediated by BASE." };
  }

  if (action === "write") {
    // Parametrizable, opt-in strictness. A resource can opt OUT of confirmation
    // (requires_confirmation: false) to write without friction, EXCEPT when it is
    // sensitive/restricted, where confirmation is never optional. The safe default
    // (no metadata) is to ask for human approval.
    if (["sensitive", "restricted"].includes(sensitivity) && !context.confirmed) {
      return { decision: "deny", reason: `${sensitivity} writes require explicit confirmation.` };
    }
    if (context.confirmed) {
      return { decision: "allow", reason: "Write confirmed and mediated by BASE." };
    }
    if (resource?.requires_confirmation === false) {
      return { decision: "allow", reason: "Write auto-confirmed: resource opted out of confirmation." };
    }
    return { decision: "needs_approval", reason: "Writes require explicit human approval." };
  }

  return { decision: "deny", reason: `Unsupported action: ${action}.` };
}

// Reference strict adapter (written by IT). It BITES: writes and restricted reads are denied
// without an explicit grant/confirmation. Wire via base.config.mjs: `policy: strictPolicy({ grants })`.
export function strictPolicy({ grants = new Set() } = {}) {
  return (resource, action, context = {}) => {
    const sensitivity = resource?.sensitivity ?? "internal";

    if (action === "read") {
      if ((context.projection ?? "full") === "metadata") return { decision: "allow", reason: "Metadata projection." };
      if (sensitivity === "restricted" && !grants.has(context.grantToken)) {
        return { decision: "deny", reason: "restricted: grant requis." };
      }
      return { decision: "allow", reason: "strict: lecture autorisée." };
    }

    if (action === "write") {
      if (["sensitive", "restricted"].includes(sensitivity) && !context.confirmed) {
        return { decision: "deny", reason: `${sensitivity}: confirmation requise.` };
      }
      if (!context.confirmed) {
        return { decision: "deny", reason: "écriture: approbation humaine requise (mode strict)." };
      }
      return { decision: "allow", reason: "strict: écriture confirmée." };
    }

    if (action === "execute") {
      if (context.dryRun) return { decision: "allow", reason: "dry-run." };
      if (!context.confirmed) return { decision: "deny", reason: "exécution: confirmation requise (mode strict)." };
      return { decision: "allow", reason: "strict: exécution confirmée." };
    }

    return { decision: "deny", reason: `Unsupported action: ${action}.` };
  };
}

// Resolve the active policy from a (possibly absent) config. A function policy is used as-is; an
// absent policy falls back to advisory. A *truthy non-function* policy means `resolveConfig` was
// bypassed (it instantiates a `"strict"` descriptor into a function), so we warn rather than silently
// downgrade enforcement — a silent downgrade of a security control is the dangerous failure mode.
export function resolvePolicy(config) {
  const policy = config?.policy;
  if (typeof policy === "function") return policy;
  if (policy != null) {
    process.emitWarning(
      `resolvePolicy: ignoring a non-function policy (${typeof policy}); resolve config via resolveConfig first. Falling back to advisory.`,
      { code: "BASE_POLICY_NOT_FUNCTION" },
    );
  }
  return advisoryPolicy;
}
