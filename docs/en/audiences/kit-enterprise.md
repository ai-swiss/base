<!-- fr-synced: b6adf48b10ba9b6144971e51c0c5f8ea1c96bf8e -->
# Deploying BASE in an organization

Deploying BASE in an organization means deciding who can do what with your assistants and keeping control of sensitive actions, without handing your know-how over to a platform. The challenge for a team or an IT department: stay in control of what the framework actually enforces, know how to lock it down, and choose a deployment mode that matches your requirements. BASE brings two things that complement your existing stack: a language for expertise in files you own, and honest mediation of sensitive actions, pluggable without forking the core. But it is not a compliance platform: BASE replaces neither IAM, nor SSO, nor RBAC, nor DLP, nor SIEM, nor regulatory retention (see [Security and limits](../trust/securite-et-limites.md)).

## What is actually enforced

Rule enforcement applies only to actions that go through the broker, the CLI, the MCP, or a controlled connector. There, BASE provides: path confinement, the propose then commit mode with diff and validation, dry-run by default for tools, minimal traces, and extension points (validators, policy, ranker, auth) configured via `base.config.{json,mjs}`. The router, for its part, picks the workflow suited to the request and spares the user from having to hunt for the right process: it does not enforce permissions.

## A strict configuration example

`base.config.mjs` is trusted project code, loaded only from the confined root of the BASE (never from resource data). The same descriptors work in `base.config.json`; the `.mjs` format additionally lets you pass functions for advanced cases.

```js
// base.config.mjs: strict configuration (team / organization).
export default {
  // Mediated enforcement: requires a grant for restricted reads,
  // and explicit confirmation for writes and invocations.
  policy: { type: "strict", grants: ["devis:nouveau-devis"] },

  // Organization validators, applied by `base validate` and `base entretien`.
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

The fallback above assumes the deployed root contains `concierge-base` and its `accueil` process. If you copy only a domain assistant, point the fallback at an equivalent local entry point, or copy the concierge as well.

For the MCP, add an `auth` descriptor (bearer token or a homegrown `AuthProvider`): the MCP server already refuses any non-loopback exposure without authentication (see [`mcp/`](../../../mcp/)).

## Deployment modes

| Mode | Mediation | For whom |
| --- | --- | --- |
| Local, browser only | None (*consignes* followed by the model) | Discovery, no installation |
| AI tool + folder (for example GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code) | Weak (the tool follows the routing) | Individual, first setup |
| Local CLI | Strong on mediated actions (propose/commit, dry-run) | Team, maintaining a BASE |
| Authenticated MCP | Read-only by default, explicit writes, auth required off loopback | Multi-client integration |
| Strict policy (`policy: { type: "strict" }`) | Read grants and explicit confirmations on mediated actions | Organization, fine-grained governance |

## Going further

- Guarantees and out-of-scope: [Security and limits](../trust/securite-et-limites.md).
- Sovereignty and trust (IT departments, compliance): [Sovereignty and trust](../trust/souverainete-et-confiance.md).
- Local and Swiss models (Ollama, Infomaniak): [Sovereign and local models](../guides/modeles-souverains.md).
- Engineering contract and extension points: [`specs/current/README.md`](../../../specs/current/README.md).
- Public surface stability: [Versions and stability](../reference/versions-et-stabilite.md).
