// The English table: every key of ./fr.mjs, translated. Same shape, same order, same placeholders —
// only the words change. British-leaning neutral English, because a BASE is read as often in Zurich
// or Singapore as in London.
//
// What does NOT move: every path, command, frontmatter key, resource id and `{placeholder}` is a
// machine identifier, carried across verbatim (`base build bootstrap --write`, `.ai/routing/index.md`,
// `importer-l-existant`, `framework_dir`). Translating one of them yields a file that reads well and
// does not work.
//
// The two card labels are load-bearing. `WHEN_TO_USE_HEADINGS` in ../routing.mjs already recognises
// "when to use" as a body heading, so `cardUseWhen` is exactly `**When to use**`: a process that
// states its trigger as a `## When to use` section then routes on the very words the index prints
// above it, and the router body can tell the reader to look for the same three words.
// `indexAgentWhenLabel` carries them too, for the same reason. `cardAvoid` has no counterpart in that
// constant (nothing matches an avoid section), so it is simply the English pair of the label:
// `**Avoid if**`.
//
// The MCP_* constants in ../bootstrap.mjs stay where they are: they were already English, and they
// are not per-language text.
//
// fr-synced: 440b3065b0568a5f6d993e35781d0aca9fc2066e
// The ./fr.mjs this table was translated from, as its git blob hash. check-translations fails when
// fr.mjs moves past it, so a reworded French key cannot leave this table quietly stale: re-translate
// the keys that changed, then record `git hash-object tools/core/lang/fr.mjs` here.

export const EN = {
  // ── The canonical router body, shared by all four entry-point projections ──────────────────
  routerIntro:
    "This project is a BASE: agents and processes in plain text. You have **no fixed identity**; you are the router.",

  routerBody: [
    "## When to route",
    "- When the user wants to **carry out a task** that needs a specific process or know-how (not a plain conversation).",
    "- When the right agent/process is **not obvious**.",
    "- When the user writes **\"R\"** (or \"R <request>\") to force a routing decision.",
    "",
    "Direct cases (do not route): if the user **names an agent** (\"load the quotes assistant\"), open its `AGENT.md` straight away. That is the only file to load. And stay in the agent already loaded: do not route on every message. If you can no longer cite the path of the active process (after a summary, or far into a long conversation), re-open its `SKILL.md` and the `AGENT.md` on disk before acting: the file is authoritative, your memory is not.",
    "",
    "## How to speak to the person",
    "Talk about their work and documents, not BASE's machinery. Lead with the useful answer and add detail only when it serves their request. For a first explanation, stop once the person can decide whether to try it; do not turn the answer into an inventory or an audit. Mention `process`, `competence`, `template`, `frontmatter`, `id`, `gate`, `diff`, or `resource` only when they ask for technical details. Ask one useful question at a time.",
    "Use plain punctuation and never use em dashes.",
    "",
    "## Applying BASE to a folder that is not one yet",
    "If the user wants to turn THEIR folder into a BASE (they have material, they want to structure their knowledge and know-how with AI) and that folder has neither `base.config.json` nor `.ai/agents/` yet: create NO file by hand. Run `base init` first (it creates the launcher, the config, the `CLAUDE.md` and a starter agent under `.ai/agents/<name>/`). Then route to `importer-l-existant` (starting from existing material) or `creer-agent` (from scratch), two processes of the BASE framework rather than of the user's folder: the launcher reaches them through `framework_dir` in `base.config.json`. Every write is proposed as a diff, never committed on its own. If you find yourself inside the BASE framework repository itself, write nothing here: initialise the user's folder instead.",
    "",
    "## How to route",
    "Your map is the generated index. Read `.ai/routing/index.md`: it lists the agents, and each agent's index (`.ai/agents/<agent>/index.md`, linked from the root) details its processes with \"When to use\" and \"Avoid if\". Descend root → agent index → process, and keep the process whose \"When to use\" covers the request, respecting \"Avoid if\". You route by reading the map.",
    "For every request that needs routing, your first read is `.ai/routing/index.md`. Never choose from a file listing or a filename, and open no `AGENT.md` or `SKILL.md` until the map has identified the candidate.",
    "Do not answer a routable request from general knowledge, even when the next question seems obvious: the chosen card is authoritative. If several cards remain plausible after reading the maps, ask the question that distinguishes them before opening their bodies.",
    "",
    "To choose between two candidates, never read all the bodies (`AGENT.md`/`SKILL.md`): at most their metadata, that is, their frontmatter block. If the index does not exist yet, that metadata is the map.",
    "",
    "If no process covers the request, do not guess. It is often a question of knowledge rather than a task: classify the sources instead (MCP tool `discover_resources`, or `node .ai/base.mjs discover \"<the question>\" --root .` from a terminal), which return paths and metadata, never bodies. Otherwise, ask the question that would settle it, or open the welcome process the index names at the foot of the page.",
    "",
    "If your tool exposes the MCP tool `route_request`, its `routing_map` is that same map, and its deterministic result accompanies your reading as an indication to verify. That result compares words: it serves calls made with no model (a script, an integration, `base route-test`) and does not decide in your place. If it names a process other than yours, re-read the \"When to use\" and \"Avoid if\"; if the doubt remains, ask.",
    "",
    "Once the process is chosen, preload what the process declares (`requires`, `may_use`): paths and notes, never bodies. The MCP tool `get_context_pack`, or `node .ai/base.mjs context \"<process>\" --root .`, draws up that plan when it is available; then open only what serves.",
    "",
    "Reaching a FACT is a different move from reaching a process. A document's headings are addresses: `id#anchor` names one passage, and `node .ai/base.mjs open \"<id>#<anchor>\" --root .` opens that passage alone. A factual question is searched at section grain (`node .ai/base.mjs discover \"<the question>\" --grain section --root .`), which ranks passages and returns their refs. Open the one or two passages that answer, rather than the whole document, and quote only text you opened, cited as `id#anchor`.",
    "",
    "Stay honest about the limit. When nothing covers the request, say so and offer the question that would settle it; do not open the bodies of competing processes to decide on your own. Route first, load second; no agent is the default agent. The same honesty applies to the request: when an instruction assumes a fact that a card in this folder contradicts, name the card once, with the passage, then do what is asked if the person confirms.",
  ],

  // ── Entry points: CLAUDE.md, BASE_BOOTSTRAP.md, .cursor/rules/assistant.mdc, AGENTS.md ──────
  // The banner keeps the machine token `BASE:generated` first: that token is what the build, the
  // doctor and discovery read to tell a generated projection from a hand-owned file. The sentence
  // beside it is for a human, and is the only part that translates.
  provenanceBanner:
    "<!-- BASE:generated · Generated by `base build bootstrap --write`. Do not edit by hand: the canonical body lives in `tools/core/bootstrap.mjs`. -->",

  // The English expansion of the acronym, as README.md states it.
  claudeTitle: "# BASE: Build Assistants with Structured Expertise",
  claudeLead: "This file is the **entry point for Claude Code**.",

  bootstrapTitle: "# BASE: generic bootstrap",
  bootstrapLead: "Generic entry point for an AI harness.",

  // Only the description is prose; `description:` and `alwaysApply:` are keys Cursor parses.
  cursorRuleDescription: "BASE: a router of agents and processes for your line of work",

  agentsTitle: "# Agents",
  agentsCatalogueTitle: "## Agent catalogue",
  agentsEmpty: "_No agent in `.ai/agents/`._",

  // ── The honest enforcement matrix: .ai/tools.md ─────────────────────────────────────────────
  toolMatrixTitle: "# BASE tool matrix",
  toolMatrixBanner:
    "<!-- BASE:generated · Generated by `base build`. An honest statement of the guarantees reachable when the action really goes through BASE. -->",
  toolMatrixLevels: "Levels: 0 unsupported · 1 advisory (guidance/audit) · 2 partial mediation · 3 strict (mediated).",
  toolMatrixHonesty: [
    "Honesty rule: this matrix states the highest level reachable per guarantee when",
    "the action really goes through BASE (CLI, broker, MCP or a configured connector). An action that",
    "bypasses BASE stays at the harness's native level.",
  ],
  // Header, separator and rows travel together: a translated guarantee name changes the column.
  toolMatrixTable: [
    "| Guarantee | claude-code | cursor | chatgpt (mcp) | generic |",
    "| --- | --- | --- | --- | --- |",
    "| Path confinement (mediated access) | 3 | 3 | 3 | 1 |",
    "| Confirmation before writing (propose/commit) | 3¹ | 2 | 3¹ | 1 |",
    "| Tool execution (dry-run + confirm) | 3¹ | 2 | 3¹ | 1 |",
    "| Native skill discovery | 3 | 2 | 1 | 1 |",
    "| Hooks / mechanical guardrails | 3² | 2² | 0 | 0 |",
  ],
  toolMatrixFootnotes: [
    "¹ Level 3 only for actions routed through the BASE broker (`propose`/`commit`, `invoke`).",
    "A write or an execution that bypasses the broker stays advisory.",
    "² Level reachable only if the harness is configured to route the actions concerned",
    "to the broker or to a hook. BASE does not ship these hooks for every harness.",
  ],

  // ── The routing index tree: .ai/routing/index.md and .ai/agents/<id>/index.md ────────────────
  routingIndexBanner:
    "<!-- BASE:generated · Generated by `base build routing-index`. Do not edit: regenerated from the AGENT.md/SKILL.md files. -->",

  indexRootTitle: "# Routing index — available agents",
  indexRootInstruction:
    "Choose the agent whose \"When to use\" covers the request, then open its index. When in doubt, do not guess: ask.",
  indexAgentsHeading: "## Agents",

  indexAgentTitle: (title) => `# ${title} — available processes`,
  indexAgentWhenLabel: "**When to use this agent**",
  indexAgentInstruction: "Choose the process whose \"When to use\" covers the request. Respect \"Avoid if\".",
  indexProcessesHeading: "## Processes",

  // The two labels of every card, in the index AND in the router body above. Same words on purpose:
  // the body tells the reader to look for "When to use", so the index must spell it the same — and
  // "when to use" is what routing.mjs recognises as a body heading (see the note at the top).
  cardUseWhen: "**When to use**",
  cardAvoid: "**Avoid if**",

  // The anti-dead-end door at the foot of the root index. `target` is the ready-made Markdown link.
  indexFallbackTitle: "## If nothing covers the request",
  indexFallbackSentence: (target) => `Open ${target}. This process welcomes and directs, so the request is still followed up.`,

  // ── The scaffold `base init` writes into a fresh folder ──────────────────────────────────────
  scaffoldGitignore: `# Local BASE data: traces, pending changes, feedback, machine settings. Never committed.
.ai/trace/
.ai/changes/
.ai/feedback/
.ai/studio.settings.json

# Build product: regenerated by \`base index\`. Tracking it would make every machine
# diverge on a file nobody reads by hand.
base.manifest.json
`,

  // The CC BY credit LICENSING.md asks for. `upgrade` and `doctor` look for the a-i.swiss URL, not
  // for the sentence, so a translation keeps the credit detectable as long as the URL survives.
  attributionLine:
    "Built with BASE, Build Assistants with Structured Expertise, by AI Swiss, https://a-i.swiss (method content under a CC BY 4.0 licence).",

  scaffoldReadmeBody: [
    "This folder is a BASE: agents and processes in plain text, which an AI tool reads to help",
    "you with your work. The agents live under `.ai/agents/`; each one says when to call on it",
    "and which processes it knows how to follow.",
    "",
    "To begin, open this folder in your AI tool and tell it what you want to do.",
  ],

  scaffoldGitattributes: `# Normalised line endings: one and the same file read on Windows, macOS and Linux.
* text=auto

# Scripts: LF required (a CRLF shebang does not execute).
*.sh text eol=lf
*.py text eol=lf
*.mjs text eol=lf
`,

  // The starter agent's card. `subject` is the humanised folder name, `about` the one sentence the
  // owner gave about their work — the two fields the router actually reads.
  scaffoldAgentDescription: (subject) => `Working assistant for ${subject} — to be refined as you use it.`,
  scaffoldAgentUseWhenAbout: (about) => `When the request is about: ${about}`,
  scaffoldAgentUseWhenGeneric: (subject) => `When the work concerns ${subject}.`,

  scaffoldAgentBody: [
    "This file is your assistant's identity card: who it is, when to call on it.",
    "Fill in the description and the use_when as soon as its role takes shape — that is what the",
    "router reads to decide whether to activate it.",
    "",
    "To turn your existing documents into processes and competences, ask your",
    "assistant: \"import my existing procedures\" — the router will send it to the",
    "`importer-l-existant` process, which proposes each conversion as a diff (nothing is written without you).",
  ],

  // The process the starter agent's card promises, shipped WITH it. Frontmatter included: `title`,
  // `description`, `use_when` and the routing examples are the routable surface, so a translation
  // that stopped at the body would leave the process unreachable in that language. The `id` does
  // NOT translate: it is a stable identifier, like a tool id, and the agent card above cites it.
  scaffoldImporterProcess: [
    "---",
    "schema_version: base.resource.v1",
    "id: importer-l-existant",
    "type: process",
    "title: Import what you already have",
    "scope: personal",
    "status: active",
    "sensitivity: internal",
    "description: Convert your existing documents (notes, how-tos, wikis, checklists) into BASE resources (processes, competences, documents, templates), proposed through the gate, never written on their own.",
    "use_when: When the user wants to start from their existing documents, for example \"import my procedures\", \"turn this how-to into a process\", \"I already have everything in a wiki\".",
    "keywords: [import, migration, conversion, existing, onboarding]",
    "routing:",
    "  examples:",
    "    - Import my existing procedures",
    "    - Turn this document into a process",
    "    - I already have a wiki, how do I reuse it?",
    "  avoid_when:",
    "    - Report a malfunction of the assistant.",
    "    - Review a BASE folder already in use and identify what could be improved in its processes.",
    "user-invocable: true",
    "---",
    "",
    "# Import what you already have",
    "",
    "Nobody starts from a blank page: the know-how is already in documents. This process explores",
    "what you point it at and PROPOSES conversions into BASE resources; every write goes through the",
    "gate (propose, then validate), and you approve each diff.",
    "",
    "On the first exchange, do not recite the steps or categories below. In no more than three",
    "sentences, say that you are ready, that nothing will be written without approval, then ask where the documents are.",
    "",
    "## Steps",
    "",
    "1. **Explore the material.** Read each source given. Classify each piece of content: what is *followed*",
    "   (steps, a checklist) becomes a `process`; what is *learnt* (rules, conventions) a",
    "   `competence` or a `document`; what is *filled in* (an outline, a model) a `template`; what is",
    "   *consulted with a validity* (a scale, a price list) a dated `document`.",
    "2. **Propose the import map.** Show the split from source to target resource (type, id,",
    "   path) and have it approved BEFORE any conversion. Stay flexible: guide a gradual migration",
    "   towards a structure the AI can work with, and offer to add what is useful.",
    "3. **Convert, one resource at a time.** Write the complete file (frontmatter id, type, title,",
    "   description, a `use_when` worthy of the router) and propose it. Never commit yourself: the human",
    "   approves each diff.",
    "4. **Check the health after the import.** Recommend `base doctor`: it picks up the links the copy",
    "   broke and the orphaned resources.",
    "",
    "## What you never do",
    "",
    "- Write without an approved diff. Propose, always; commit, never.",
    "- Invent content the sources do not carry. You convert, you do not create knowledge.",
    "- Import in bulk. Each resource is split out, named and approved one by one.",
    "",
  ],

  // Which AI tool reads which file. The path and the id are machine identifiers; only the label is
  // prose, and it names the tools by their own product names, which do not translate.
  toolEntryPointLabels: {
    "claude-code": "Claude Code",
    cursor: "Cursor",
    "agents-md": "Codex, Copilot, Windsurf and the editors that read AGENTS.md",
    autre: "any other tool that reads Markdown",
  },

  // ── Views: the door `base view <name>` generates ─────────────────────────────────────────────
  viewHeading: (name) => `## View "${name}"`,
  viewSummary: (count) => `This view gathers ${count} agent(s) of the folder.`,
  viewWhereFilesLive: (up) =>
    `The files live at the root of the BASE (\`${up}\`); this view copies none of them. Its map: [routing/index.md](routing/index.md).`,
  viewFoldersHeading: "Working folders of this view:",
};
