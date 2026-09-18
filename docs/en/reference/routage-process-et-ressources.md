<!-- fr-synced: 90b93ed77c8847ec22ecfcc9e263bd994e4ccda2 -->
# Routing a request to the right process (and opening the right resources)

A misrouted request loads everything, mixes everything together, and drowns the decisions that matter under a wall of instructions. BASE avoids this by distinguishing three gestures that AI tools often conflate: choosing an agent, routing to a process, opening the resources. Keeping them apart keeps what is actually being decided in plain sight. If you are building or using a BASE and want to know how a request finds its way, this page shows it.

## 1. Choosing an agent

When you know which assistant to use, the simplest thing is to select it directly:

```text
Read .ai/agents/assistant-devis/AGENT.md
```

The agent is the job description. It says which role to play, how to speak, which workflows exist, and where the useful files are.

For a single assistant, this manual selection is often enough. There is nothing to install, nothing to index, and no routing catalog to maintain.

## 2. Routing to a process

When several workflows are possible, BASE can route a request to the right process:

```bash
base route "I need to prepare a client quote" --root <base-folder>
```

The router picks an agent → process pair, or abstains with a readable reason. It does not load every instruction, and it does not search freely across the whole repository. In an AI tool, the model reads the map (the generated index) and decides; the deterministic floor, for its part, stays deliberately simple but effective, and it extends through adapters. Above all, it takes the mental load of hunting for the right process off the user.

**Two layers, one source.** Day to day, your AI tool routes **progressively**: it reads the generated
index (`.ai/routing/index.md`), or the map returned by the MCP tool `route_request`, and chooses by
understanding the "when to use it". With no Track 2 configuration, `base route` uses the lexical
strategy: ranking combines the lexical floor with any rankers from `base.config`. With both Track 2
models, `base route` instead uses the `embedding` strategy, which retrieves candidates and submits
them to a refiner. A ranker improves a ranking; it does not select the strategy. All these paths
derive from the same `use_when`: that is what carries the intent.

This limit is deliberate. A process answers the question:

```text
What needs to be done now?
```

This is a workflow decision. It must stay short, testable, and explainable.

The recommended signals for a routable process are:

- `description`: what the process does;
- `use_when`: when to use it;
- `routing.examples`: real user phrasings;
- `routing.avoid_when`: counterexamples that prevent false routes.

The `.ai/routing/route-tests.json` fixtures record important routes. By default,
`base route-test --root <folder>` replays those fixtures and the available `routing.examples` with
the lexical strategy and the rankers from `base.config`; it checks only the written cases. If Track 2
is configured, `base route-test --strategy production --root <folder>` replays the path actually
taken by `base route`, including its model calls and with no determinism promise. Add deliberately
ambiguous cases to check abstention, then replay after every change to the signals (`use_when`,
`routing.avoid_when`, `keywords`).

## 3. Opening the useful resources

Once the process is chosen, it can reference the resources it needs:

- domain competences;
- documents;
- templates;
- tools;
- local data;
- external sources via connectors.

These resources answer a different question:

```text
What should it be done with?
```

They are context, tools, or data. Keeping this boundary is first and foremost a matter of security: a process's instructions execute, a resource's content does not. Mixing the two opens the door to injection, where a piece of data tries to pass itself off as an instruction. The choice of the main workflow therefore stays apart.

A process can declare them in its frontmatter:

```yaml
requires:
  - ref: calculer-devis
    access: execute
    purpose: price the quote
may_use:
  - catalogue/services.json
```

Use `requires` for a resource the process must open or execute in a structured way, ideally via its `id`. The `access` field describes the use the process expects, for example reading or executing. It does not grant a right of access. `purpose` explains why the dependency is needed: the context pack exposes it in its note without turning it into a permission or sending it to the broker as authorization.

Use `may_use` for simple or optional context, often a readable path in the project. The process can also cite these resources in its steps when the context stays simple. What matters is that the logic stays readable: the router chooses the process, then the process indicates what to open.

## Who enforces the rights?

BASE does not replace the environment's normal rights. If a source lives in a folder, a Drive, an API, or an external tool, the actual rights remain those of that folder, that Drive, that API, or that tool.

BASE enforces its own guardrails only on the actions that pass through it:

- `base open` or `open_resource` to open an inventoried resource;
- `base access` or `access_resource` to read a path confined to the project;
- `base invoke` or `invoke_tool` to prepare or execute a tool;
- `base propose` then `base commit`, or `propose_change` then `commit_change`, for a mediated write.

The practical rule is:

```text
The process declares the needs.
BASE mediates certain actions.
The actual rights stay carried by the OS, the tool, the connector, or the API.
```

## Why not route all resources?

BASE could evolve toward broader routing: finding a competence, a tool, a template, or a document directly from a request.

That would be useful in some contexts, but it must stay an explicit extension. Routing an action and retrieving context are not the same responsibility.

The current choice is therefore conservative:

```text
route = choose the process to follow
discover/open = find or open the useful resources
```

This separation keeps the system understandable for a single person, testable for a team, and extensible for an organization.

## What BASE reads in your frontmatter, and what stays yours

BASE reads a closed list of fields: `id`, `type`, `title`, `description`, `use_when`,
`routing.examples`, `routing.avoid_when`, `may_use`, `requires`, `scope`, `status`, `sensitivity`,
`confidential`, `keywords`, `valid_from`, `valid_until`, `review_by`, `derived_from`, `execution`
and `schema_version`. Every other field is carried verbatim and interpreted by nothing: your own
conventions (`kind: client-folder`, `client: dupont`, an internal identifier) pass through BASE
without side effects and stay readable by your tools. The fields your AI tool reads for itself, say
`name` or `allowed-tools` in a Claude Code skill card, fall in the same category: BASE does not read
them, and does not touch them.

A document written from other documents declares its sources in `derived_from`, by id or by path. A summary never replaces its sources: that line says where to go back to, and `base doctor` names a document whose source has moved since.

A folder sometimes holds content that must never route: bulky archives, raw data, fiction or sample
text. Declare it in `base.config.json`:

```json
{ "inventory": { "exclude": ["archives", "raw-data"] } }
```

Those path prefixes leave the inventory: no routing, no search, no checks. They stay on disk and your
tools reach them as usual; BASE simply stops treating them as know-how to route.

## When BASE finds no route: the fallback

The router stays honest: if the request matches no workflow, it abstains (`out_of_scope`) instead of inventing a route. But the user must never be left without a next step.

`base init` declares the framework welcome as the help fallback. `base upgrade` proposes it for
older folders that have not already chosen their own door. A project can also declare another
target in `base.config.json` or `base.config.mjs`:

```json
{
  "routing": {
    "fallback": { "agent": "concierge-base", "process": "accueil" }
  }
}
```

When the router abstains honestly, it adds a `fallback` pointer to the result. This is separate
metadata, never a false route: the `status` stays the honest abstention. The folder map also shows
this door. The assistant then loads the welcome process rather than leaving the user stuck.

The engine stays agnostic: it follows the configured target. It looks first in the folder, then in
the installed BASE framework. Nothing is copied into the business folder, and the map link remains
openable when the framework lives elsewhere on the machine. A target that cannot be found attaches
no fallback, and `base validate` flags it. The fallback simply orients, promising nothing more.

```text
Routing "Hello": out_of_scope (below_floor)
Fallback: concierge-base -> accueil
```

This promise holds when routing is enabled and the target exists in the folder or its installed
framework. An MCP client receives the welcome text and the map of its other processes because it
cannot open server-side paths. In a copied example that loads a domain agent directly, "Help" may
still open the local domain help.

## Root and workspace

A **root** is a confined BASE project: a folder with its `.ai/`, its agents, its data. Every read, write, or execution stays within the selected root.

Three situations, from simplest to most advanced:

- **A single root.** The default case. Open the folder, that is your BASE.
- **Nested subprojects.** A container folder with several `.ai/agents/` underneath: the CLI and the MCP detect the nearest root.
- **Several declared roots (multi-client).** A `base.workspace.json` file lists named roots:

```json
{
  "schema_version": "base.workspace.v1",
  "id": "agence",
  "roots": [
    { "id": "client-a", "path": "clients/a", "default": true },
    { "id": "client-b", "path": "clients/b" }
  ]
}
```

`base route "<request>" --workspace base.workspace.json` can then search across the roots; `--root-id client-b` targets a specific root. Routing traverses the roots, but each action stays confined to the chosen root. Details in `specs/current/10_core/cli.md` and `mcp/README.md`.

## Practical rule

- If you know which agent to use, load its `AGENT.md`.
- If you already know which process to follow, point at its `SKILL.md` directly: routing is an entry point, not a mandatory passage.
- If the request could follow several workflows, use `base route` or `route_request`.
- If the process needs context, open only the resources it references or that you discover for that need.

This discipline avoids the wall of instructions, limits wasted tokens, and keeps the important decisions visible.
