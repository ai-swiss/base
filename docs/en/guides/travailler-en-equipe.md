<!-- fr-synced: fc20e21ba42927a27f806fd3ca86835aea3d2c30 -->
# Working as a team on a BASE

A folder opened by a single person tolerates implicit conventions: that person holds them all in mind. As soon as two people write into the same corpus, every implicit convention becomes a divergence that a diff eventually reveals. This page is for a team that shares a BASE. It names the mechanisms that already exist, and the decisions that remain to be made, with the cost of each branch.

## What changes when the BASE is shared: propose, review, then commit {#what-changes-when-the-base-is-shared}

When two colleagues modify the same BASE, the writing sequence is propose, review, then commit
after approval.

The corpus becomes the shared reference. A process written by one person is followed by the others, and by their AI tool: its wording commits the team, just as a posted procedure would.

The `scope` field of a resource declares its sharing perimeter: `personal`, `team`, `org`, `public`. The declaration has visible effects. `base doctor` asks for the attribution line in the `README.md` of a folder that carries at least one resource at `team`, `org` or `public`, and stays silent on a folder that is entirely personal. To move a resource from one perimeter to another, `base promote <ressource> --to <scope>` writes the change through the mediated path, with its diff.

This mediated path is the third difference. A write is proposed (`base propose <cible> --from <fichier>`), then validated (`base commit <change-id>`); `base changes` lists what is waiting. Each proposal is recorded under `.ai/changes/` with the fingerprint of the starting state, and the commit rechecks it: a change prepared against an outdated version of the file does not silently overwrite it. Your hosting provider adds its own review (merge request, review, pipeline); the two controls stack.

## Naming people

A team always ends up writing down who does what: the person who maintains a process, the one who requested an exception, the one who must be notified. This name must be a stable string, identical everywhere: in the frontmatter, in your decision logs, in the body of your processes.

BASE reads no field of this kind. It reads a closed list of fields (see [Routing, processes and resources](../reference/routage-process-et-ressources.md)); every other field passes through BASE untouched, with no interpretation and no side effect. An `owner: j.dupont` is therefore a matter for your team's own convention. Write it down once, in your local equivalent of this page, and stick to it.

The choice of form has a cost on each side.

- A short identifier (`jdup`, `mb`) types quickly and stays short in a frontmatter. It becomes ambiguous as soon as two people's names are alike, and it forces you to maintain a lookup table that someone has to keep up to date.
- An identifier derived from the name (`jean.dupont`) reads without a table. It changes when a name changes, and it appears as-is in everything you publish: a corpus exported at `scope: public` carries these strings along with it.

A team that already uses identifiers with its hosting provider or in its directory has an interest in reusing the same ones: only one form to remember, and a text search finds both worlds at once.

## One root, or several

A root is a confined perimeter: a folder with its own `.ai/`, its agents and its data. All reading, writing and execution stays within the selected root.

A single root is enough as long as the team works on a single domain, even with several agents and many processes. Everyone opens the same folder, no extra file to maintain, no option to pass to commands.

An organization fits in one root: each project or line of work is an agent with its processes, and
the egress rule, language, and attribution are each declared once. A second root is justified in
two cases: the project lives in its own repository and the AI tool must read the code and the method
together, or its files have their own access rights. The roots are then connected through a
workspace. A root's friction items and abstentions stay in its `.ai/feedback/`, where the
framework's "Improve my processes" process reads them; what one root learns that applies to the
others goes through a merge request on the root that will carry it, reviewed like any other change.

Declare a workspace when the perimeters must stay separated: several clients, several entities, data that must not mix. The `base.workspace.json` file lists the roots:

```json
{
  "schema_version": "base.workspace.v1",
  "id": "agence",
  "label": "Agence",
  "roots": [
    { "id": "client-a", "label": "Client A", "path": "clients/a", "default": true },
    { "id": "client-b", "label": "Client B", "path": "clients/b", "egress": "local-only" }
  ]
}
```

Each root carries a unique `id` and a `path` relative to the file; `label` defaults to the `id` when absent. Only one root may carry `default: true`, two trigger an error; with no default at all, the first declared root is used. A root marked `egress: local-only` withholds its resources from a remote model on the paths that BASE mediates (MCP server, Studio chat, evaluation).

Commands target a root with `--workspace <fichier> --root-id <id>`. Passed outside a workspace, `--root-id` is ignored and the command says so. Only `route` also searches across all declared roots when `--root-id` is omitted; the other commands use the default root. Routing crosses roots, each action stays confined to the one that was chosen.

The cost of a workspace: one more file to keep up to date, and an identifier to pass on most commands. The cost of a single root: one shared write perimeter for everyone. If a folder already contains at least two BASEs as direct subfolders, `base init` offers the `base.workspace.json` that brings them together.

## What goes into version control

In a new folder, `base init` writes a `.gitignore` that keeps local data out of the shared repository:

```text
.ai/trace/
.ai/changes/
.ai/feedback/
.ai/studio.settings.json
base.manifest.json
```

Each line answers a precise reason. `.ai/trace/` is the machine's operating log. `.ai/changes/` holds pending proposals, whose content may target a confidential file. `.ai/feedback/` is the field feedback stack. `.ai/studio.settings.json` carries per-machine settings. `base.manifest.json` is a build artifact, regenerated by `base index`: tracking it in version control makes every machine diverge on a file that nobody reads by hand.

This file is created once, never added to afterwards: an existing `.gitignore` is respected as-is. Two lines remain for the team to decide.

**Friction: local or shared.** Remove `.ai/feedback/` from the `.gitignore` and the stack becomes shared: everyone sees the same open friction items, `base doctor` counts them the same way on every machine, and a request the router failed to serve can be discussed with the evidence in hand. The price is that these files contain the text of the requests, including the abstentions logged in `abstentions.jsonl`: a question asked by a person, sometimes with a client's name in it, then enters the repository and its backups. Keeping it ignored, each machine sees only its own stack, and escalation happens by hand.

**Generated maps: tracked or ignored.** The routing index (`.ai/routing/index.md` and the per-agent indexes) is not ignored by default. Tracked in version control, it can be read as a diff like everything else, and a clone routes correctly without running anything; the price is a merge conflict every time two people add a process, on a file nobody writes by hand. Ignored, the conflict disappears, and everyone runs `base build routing-index --write` after a `git pull` so their map reflects the current state. Either way, the truth lives in the `use_when` fields; the map is only its projection.

## Line endings and large files

When the folder is a git repository, `base init` also offers a `.gitattributes`:

```text
* text=auto
*.sh text eol=lf
*.py text eol=lf
*.mjs text eol=lf
```

Without this, the same process read on Windows and on macOS produces a whole diff that nobody caused, and review becomes impractical. Scripts stay in LF because a shebang in CRLF does not execute.

Git LFS never appears there, and this silence is deliberate: an LFS pattern breaks the clone on a machine where `git lfs` is absent, and the failure is silent, until the day someone opens a file that looks empty. If your corpus carries heavy binaries (scanned PDFs, images, datasets), turning it on is an explicit decision: check `git lfs version` on every machine and with your hosting provider before adding the smallest pattern, then document the installation in your README. The exact commands and the quotas depend on your hosting provider, check its documentation. The other path is to keep these files out of the repository, or out of the inventory with `inventory.exclude` in `base.config.json` when they live in the folder without needing to route.

## Staying in sync as a team

Three commands are run before proposing a change to the shared branch.

- `base validate` checks that resources conform and flags wording traps, including a resource whose `routing.examples` is ruled out by its own "avoid if".
- `base doctor` reports the health of the corpus: dead links, orphaned resources, `may_use` or `requires` declarations that lead nowhere, overdue reviews, open friction items, leftover template content.
- `base route-test` replays your fixtures (`.ai/routing/route-tests.json`) and the declared
  `routing.examples`, and displays the two counts separately. By default it checks the lexical
  strategy with the rankers from `base.config`. If Track 2 is active, also replay
  `base route-test --strategy production`: that run calls the models and is not suitable as a
  deterministic CI check. `base route-test --scaffold` drafts a first file when none exists.

Running these three commands in your hosting provider's pipeline is possible; the exact configuration is a matter for its documentation.

There remains the case of a folder created by an earlier version of the framework. `base upgrade` shows the difference between what it carries and what `base init` would give it today; `--write` applies it. The command creates, adds a line, or rewrites BASE's JSON configuration, and never deletes anything: whatever has become unnecessary, for example four tool entry points when only one is read, is named in the output and you decide.

## To decide once

1. The form of the handle: short identifier, or identifier derived from the name.
2. A single root, or a workspace with declared roots.
3. The friction items in `.ai/feedback/`: local to each machine, or tracked in version control.
4. The generated maps in `.ai/routing/`: tracked in version control, or ignored and regenerated.
5. Git LFS: turned on after checking on every machine, or binaries kept out of the repository.

Write these five answers in your folder, one sentence each. A person joining the team reads them before their first commit.

---

BASE is a framework by [AI Swiss](https://a-i.swiss). Use case in partnership with [Innovaud](https://innovaud.ch).
