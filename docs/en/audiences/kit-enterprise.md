<!-- fr-synced: 03da0c11162c9411f78f2127dab51bbfc421616f -->
# Deploying BASE in an organization

Deploying a BASE folder in an organization means deciding who can do what with your assistants and keeping control of sensitive actions without surrendering your know-how to a platform. For a team or an IT department, the stakes are these: understanding what each file, tool, and integration actually enforces, then choosing a deployment mode that matches your requirements. The files provide a language for expertise; the broker, BASE's mediation component, can mediate some sensitive actions. Neither replaces IAM, SSO, RBAC, DLP, SIEM, or regulatory retention (see [Security and limits](../trust/securite-et-limites.md)).

Before choosing controls, review the distinction between method, structure, approved reference, and execution in the [audience map diagnosis](pour-qui.md).

## What is actually enforced

Mechanical rules apply only to actions that go through the broker, CLI, MCP, or a controlled connector. Depending on that path, the code enforces path confinement, the propose-then-commit flow, tool dry-runs, minimal traces, or a policy configured through `base.config.{json,mjs}`. The router proposes a suitable workflow or abstains; it does not enforce permissions.

Files may remain local while a tool projects excerpts from them to a remote model. On mediated paths, egress is permissive by default (`any`): the broker withholds a resource only when it is marked `confidential: true` or its root is `local-only`. The `sensitivity` field classifies; it does not trigger this withholding. Direct file access bypasses these controls.

Separating instructions from content supports review, but does not prevent prompt injection by itself. Effective defenses combine context reduction, technical controls, permissions, and human validation.

## A strict configuration example

`base.config.mjs` is trusted project code, loaded only from the confined root of the BASE, never from resource data. The same descriptors work in `base.config.json`; the `.mjs` format additionally lets you pass functions for advanced cases.

```js
// base.config.mjs: strict configuration (team / organization).
export default {
  // Mediated enforcement: requires a grant for restricted reads,
  // and explicit confirmation for writes and invocations.
  policy: { type: "strict", grants: ["devis:nouveau-devis"] },

  // Organization validators, applied by `node .ai/base.mjs validate --root .`.
  validators: [
    { type: "requireSchemaVersion" },
    { type: "requireFields", fields: ["owner", "review_date"], whenScope: "team" },
    { type: "forbidSensitivity", level: "restricted" },
    { type: "piiScanner", patterns: ["\\b\\d{13,16}\\b"], severity: "error" },
    { type: "routability" },
  ],

  // More cautious routing thresholds, falling back to the concierge on honest abstention.
  routing: {
    floor_score: 40,
    top2_margin: 0.15,
    max_candidates: 5,
    fallback: { agent: "concierge-base", process: "accueil" },
  },
};
```

The fallback above looks for `concierge-base` in the deployed root, then in the installed BASE
framework. If you distribute a standalone copy without that framework, point it at an equivalent
local welcome.

For the MCP, add an `auth` descriptor (bearer token or a homegrown `AuthProvider`): the MCP server refuses any non-loopback exposure that lacks authentication in any case (see [`mcp/`](../../../mcp/)).

## Deployment modes

| Mode | Mediation | For whom |
| --- | --- | --- |
| Local, browser only | None (*instructions* followed by the model) | Discovery, no installation |
| AI tool + folder | Weak (the tool follows the routing) | Individual, first setup |
| Local CLI | Strong on mediated actions (propose/commit, dry-run) | Team, maintaining a BASE |
| Authenticated MCP | Read-only by default, explicit writes, auth required off loopback | Multi-client integration |
| Strict policy (`policy: { type: "strict" }`) | Read grants and explicit confirmations on mediated actions | Organization, fine-grained governance |

## Your next action

Have the business, security, and compliance owners review [Security and limits](../trust/securite-et-limites.md), then record the required deployment mode and external controls before any trial with real data.
