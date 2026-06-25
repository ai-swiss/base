<!-- fr-synced: 8b120a1e1b1bc8fddc875ade3d6a6eff6339136e -->
# Shape your first assistant

In a few minutes, you turn a task you repeat by hand into an assistant that takes it on, with no code and without giving up any control: it proposes, you approve. Concretely, you copy an example into an AI tool that can read your files (GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code, for instance), you say what you want to do, and the assistant does the rest.

> **No repository yet?** See [Get BASE](obtenir-base.md) to choose a ZIP, a Git clone, an example copy, or the browser pack.
>
> **No tool installed yet?** See the [installation guide](installer.md) to set up an AI tool that can read your files (GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code, for instance).
>
> **Only a browser (ChatGPT, Claude)?** You do not need to install anything to start: follow [Try BASE without installing anything](essayer-sans-installer.md).

You can use this quickstart in three ways:

- for your private life, by copying an example and adapting it to your own tasks;
- for a startup or a small business, by stabilizing one useful workflow before extending it;
- for a larger organization, as a local demonstration before adding the internal controls you need.

---

## 1. Copy

Copy the `exemples/assistant-devis/` folder into your workspace (your Desktop or your Documents, for instance).

> **Just want to see the result first?** Open `exemples/assistant-devis-demo/` instead (already filled in with a fictional company) and ask "Is Dupont SA eligible for the loyalty discount?". The assistant should draw on your files, name the rule, and place a `[A VALIDER]` marker. The exact walkthrough is in [See BASE in action](demo-60-secondes.md).

## 2. Open

| Tool | How |
|-------|---------|
| **Cursor** | File → Open Folder → select the copied folder |
| **Claude Code** | Run `claude` in the copied folder |
| **ChatGPT** | Set up the [MCP server](installer-mcp.md) → load the agent → make a concrete request |

> **Prefer a visual workshop?** Studio is optional: run `npm run studio` to open the workshop and see your files, your agents, and their processes at a glance. Your AI tool stays the day-to-day experience; Studio is the workshop.

## 3. Say what you want to do

For example: "Hello, I would like to set up my business." The assistant guides you through setting up your activity or company: name, services, prices, terms. Answer its questions; it proposes the files to create or change, then you approve the decisions that matter.

## 4. Create your first quote

> "I have a client, Dupont SA, asking me for 3 days of strategy consulting."

The assistant restates the request, prices it, and proposes the quote. You approve, and it generates the files.

## You approve, then the assistant writes

Two cues make this control visible:

- **`[A VALIDER]`**: when the assistant proposes something not yet confirmed (a price, a quote), it marks it `[A VALIDER]` (French for "to be validated"). The marker is a cue you can spot at a glance, for you as for your tools. As long as it is there, nothing is settled: it is yours to confirm.
- **Writing happens in two steps**: for actions that go through BASE (`base propose` then `base commit`, or the MCP equivalent), a change is first *proposed* (a diff is shown to you, nothing is written), then *applied* only after your confirmation. You see what will change before it changes. Outside these tools, the assistant guides you but does not enforce this control for you.

Concretely: you ask to add a line to the quote. The assistant does not write it right away; it shows you the line and the new total; you say "yes", and only then does the file change. You see the effect before it exists.

This control also covers what leaves your machine: a resource marked confidential is not sent to a remote model, and the check happens before the call. Details: [What can leave, and what BASE holds back](../trust/frontiere-local-vs-sortant.md).

**Going further:** the [co-thinking practices](../learn/pratiques-co-pensee.md) show, by example, the ways of working with AI that carry the most value.

## 5. What next?

| What you want | What you say or do |
|--------------------|----------------------------|
| Another quote | "New quote for [client]" |
| Try communication | Copy `exemples/assistant-communication/`: LinkedIn posts, newsletters |
| Try letters and emails | Copy `exemples/assistant-courrier/`: drafting and replying, in the right register |
| Try recruiting | Copy `exemples/assistant-rh/`: job postings, interviews |
| Try project management | Copy `exemples/assistant-projet/`: planning, milestones, tracking |
| Try meeting minutes | Copy `exemples/assistant-reunion/`: decisions, actions, follow-up |
| See how BASE routes a request | From the repository root: `node tools/base.mjs route-test --root exemples/routage-pme` |
| Your own assistant | Open the project's main folder and say "Read `.ai/agents/createur-agent/AGENT.md`" |
| Find where to start | Same thing, then say "Help me find where to start" |
| **Lost, or a question about BASE?** | In the BASE repository or a project where the router is enabled, say "I am lost" or "Help": the concierge welcomes you. Every business example now ships a fallback welcome, so "I am lost" guides you even inside a copied folder. |
| Get inspired | Browse the [idea gallery](../guides/idees-agents.md) |

> **Two different doors.** In a project with a router, "Help / I am lost" opens the **welcome** (concierge): it orients you and answers questions about BASE. "Help me find where to start" opens the assistant creator's **diagnosis**: it works out *which assistant to build* for your line of work.

---

**Reminder**: AI can be wrong and invent details. Always review a quote before sending it.

For personal use, this guide is enough. For a team, add `base.config.json`, `base validate`, `base entretien`, and the reference points in `docs/reference/framework-public.md`. `BASE_BOOTSTRAP.md` is for wiring a router into an AI tool; it stays outside the scope of team governance. For a large organization, also read `docs/reference/framework-public.md` before any deployment.

For a small business or a small team, add the [Swiss SME starter kit](../audiences/kit-demarrage-pme-suisse.md) before sharing an assistant: permitted data, human validation, versioning, and monthly upkeep.

---

BASE is a framework by [AI Swiss](https://a-i.swiss). Use case in partnership with [Innovaud](https://innovaud.ch).

## I already have a folder of notes or procedures

You rarely start from a blank page. Two doors, same result:

- **CLI**: `base init --root my-folder` shows exactly which files would be created (a minimal agent, or a workspace file if the folder already contains several BASE roots); `--yes` creates them: never an overwrite.
- **Studio**: launch the workshop on the folder (`base studio --root my-folder`): the Welcome screen shows the same plan, in readable form, with a "Create these files" button. The app then switches to normal mode without restarting. Your AI tool stays the day-to-day experience; Studio is the workshop, and your files stay at the center, with the AI tool of your choice (GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code, for instance).

Then, to turn your documents into processes and competences, ask your assistant: "import my existing procedures." The router will send it to `importer-l-existant`, which proposes each conversion as a diff. The router stays rudimentary but effective, and extensible through adapters. It saves you from hunting for the right process yourself.
