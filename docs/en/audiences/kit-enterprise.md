<!-- fr-synced: 02bfce8e211fce5639f1fffefdd9e98f37354212 -->
# Deploying BASE in an organization

Deploying BASE in an organization means deciding who can do what with your assistants and keeping a hand on sensitive actions, without surrendering your know-how to a platform. For a team or an IT department, the stakes are these: staying on top of what the framework actually enforces, knowing how to lock it down, and choosing a deployment mode that matches your requirements. BASE rounds out your existing stack on two fronts: a language for expertise in files that belong to you, and honest mediation of sensitive actions, something you plug in without touching the heart of the system. None of which makes it a compliance platform: BASE replaces neither IAM, nor SSO, nor RBAC, nor DLP, nor SIEM, nor regulatory retention (see [Security and limits](../trust/securite-et-limites.md)).

## What is actually enforced

The rules apply only to actions that go through the broker, the CLI, the MCP, or a controlled connector. There, BASE provides: path confinement, the propose then commit mode with diff and validation, dry-run by default for tools, minimal traces, and extension points (validators, policy, ranker, auth) configured via `base.config.{json,mjs}`. The router, for its part, picks the workflow suited to the request and spares the user the search for the right process: it does not enforce permissions.

## A strict configuration example

`base.config.mjs` is trusted project code, loaded only from the confined root of the BASE, never from resource data. The same descriptors work in `base.config.json`; the `.mjs` format additionally lets you pass functions for advanced cases.

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

For the MCP, add an `auth` descriptor (bearer token or a homegrown `AuthProvider`): the MCP server refuses any non-loopback exposure that lacks authentication in any case (see [`mcp/`](../../../mcp/)).

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
