<!-- fr-synced: c5826ec1c9c16bc5c4c178520c028e72951eca4c -->
# Shape your first assistant

In a few minutes, you hand a recurring task to an assistant without writing code: it helps you make the method explicit, proposes the files, then waits for your approval. Concretely, you copy an example into an AI tool that can read your files and describe what you want to do.

> **No repository yet?** See [Get BASE](obtenir-base.md) to choose a ZIP, a Git clone, an example copy, or the browser pack.
>
> **No tool installed yet?** See the [installation guide](installer.md) to set up an AI tool that can read your files.
>
> **Only a browser (ChatGPT, Claude)?** You do not need to install anything to start: follow [Try BASE without installing anything](essayer-sans-installer.md).

This quickstart lends itself to three uses:

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
| **ChatGPT / Claude (browser)** | Nothing to install to try it: paste an example's pack ([Try without installing](essayer-sans-installer.md)). To connect your agents with the mechanical guarantees, the [MCP server](installer-mcp.md) (technical path) |

> **Prefer a visual workshop?** Studio is optional. Install Node 18 or later, open a terminal in the BASE repository clone, then run `npm ci` once. After initialization, run `cd my-folder && node .ai/base.mjs studio --root .` ([step 0 of the tutorial](../tutoriel/harnais.md)). The launcher does not install the short `base` command. The workshop shows your files, agents, and processes. Your AI tool remains the day-to-day experience; Studio is only a supporting workshop.

## 3. Say what you want to do

For example: "Hello, I would like to set up my business." The assistant guides you through setting up your activity or company: name, services, prices, terms. Answer its questions; it proposes the files to create or change, then you approve the decisions that matter.

## 4. Create your first quote

> "I have a client, Dupont SA, asking me for 3 days of strategy consulting."

The assistant restates the request, prices it, and proposes the quote. You approve, and it generates the files.

## You approve, then the assistant writes

Two cues make this control visible:

- **`[A VALIDER]`**: when the assistant proposes something not yet confirmed (a price, a quote), it marks it `[A VALIDER]` (French for "to be validated"). The marker is a cue you can spot at a glance, for you as for your tools. As long as it is there, nothing is settled: it is yours to confirm.
- **Writing happens in two steps**: after initialization, for actions that pass through the folder launcher (`node .ai/base.mjs propose` then `node .ai/base.mjs commit`, or the MCP equivalent), a change is first *proposed* (a diff is shown to you, nothing is written), then *applied* only after your confirmation. This launcher does not install the short `base` command. Outside these mediated paths, the assistant guides you but does not enforce this control for you.

Concretely: you ask to add a line to the quote. The assistant does not write it right away; it shows you the line and the new total; you say "yes", and only then does the file change. You see the effect before it exists.

The mediation component, called the broker, also applies a control before remote calls that pass through it, including the MCP server and Studio chat: a resource marked confidential, or a root declared `local-only`, is not sent to the model through those paths. Direct file access or another execution path bypasses this control. Details: [What can leave, and what the broker holds back](../trust/frontiere-local-vs-sortant.md).

**Going further:** [Co-thinking practices](../learn/pratiques-co-pensee.md) illustrates the most useful ways to work with AI.

## 5. What next?

| What you want | What you say or do |
|--------------------|----------------------------|
| Another quote | "New quote for [client]" |
| Try communication | Copy `exemples/assistant-communication/`: LinkedIn posts, newsletters |
| Try letters and emails | Copy `exemples/assistant-courrier/`: drafting and replying, in the right register |
| Try recruiting | Copy `exemples/assistant-rh/`: job postings, interviews |
| Try project management | Copy `exemples/assistant-projet/`: planning, milestones, tracking |
| Try meeting minutes | Copy `exemples/assistant-reunion/`: decisions, actions, follow-up |
| Verify reproducible lexical routing | With Node 18 or later, from a terminal: `node <BASE_DIR>/tools/base.mjs route-test --strategy lexical --root <BASE_DIR>/exemples/routage-pme` |
| Your own assistant | [Have your AI initialize your folder](installer-par-votre-ia.md), then say "Here is the work I want to structure with BASE. Help me define the method and wait for my approval before creating the files." |
| Find where to start | Same thing, then say "Help me find where to start with AI" |
| **Lost, or a question about BASE?** | In the BASE repository or a project where the router is enabled, say "I am lost" or "Help": the router directs you, or asks a question to narrow it down; if it abstains, the welcome takes over. Every business example ships this fallback welcome. |
| Get inspired | Browse the [idea gallery](../guides/idees-agents.md) |

> **Two different entry points.** In the BASE repository or a folder attached to it, "I am lost" leads to the **concierge**, which directs you and answers questions about BASE. "Help me find where to start with AI" opens the assistant creator's **diagnosis**, which gets you talking about your work before the proposition brief.

> **Forcing a routing choice.** Say **"R"** (or "R your request") to require the assistant to use the routing map instead of answering from memory. With the default lexical strategy, `node .ai/base.mjs route "<your request>"` is deterministic for the same map. Semantic or model-based strategies do not carry that guarantee. The reproducible gate is `node .ai/base.mjs route-test --strategy lexical`.

---

**Reminder**: AI can be wrong and invent details. Always review a quote before sending it.

For personal use, this guide is enough. For a team, review and configure the `base.config.json` created by `node <BASE_DIR>/tools/base.mjs init`, then use `node .ai/base.mjs validate`, `node .ai/base.mjs doctor`, and the reference points in `docs/reference/framework-public.md`. `BASE_BOOTSTRAP.md` is for wiring a router into an AI tool; it stays outside the scope of team governance. For a large organization, also read `docs/reference/framework-public.md` before any deployment.

For a small business or a small team, add the [Swiss SME starter kit](../audiences/kit-demarrage-pme-suisse.md) before sharing an assistant: permitted data, human validation, versioning, and monthly upkeep.

---

## I already have a folder of notes or procedures

You rarely start from a blank page. Two doors, same result:

- **CLI**: with Node 18 or later in a terminal, `node <BASE_DIR>/tools/base.mjs init --root my-folder` shows the files the tool intends to create (a minimal agent, or a workspace file if the folder already contains several BASE roots). After your choices and approval, a second invocation with `--yes` initializes the folder without overwriting existing files; its result reflects the answers you provided.
- **Studio**: run `npm ci` once in the BASE clone. After initialization, run `cd my-folder && node .ai/base.mjs studio --root .`. The Welcome screen presents the files and available actions. Your AI tool remains the day-to-day experience; Studio serves as the workshop.

If you would rather see first what an assistant would do for you, show what you have (a folder of procedures, the transcript of a discussion about your needs, a `CLAUDE.md`) and say: "Here is what we have. Show me what an assistant could do for us." The folder's entry point sends your tool to `adopter-ce-dossier`, which returns a proposition brief to review in your browser.

After your answers, the door hands over: to `importer-l-existant` to turn your documents into processes and competences, each conversion proposed as a diff, or to `creer-agent` to build the assistant. You do not have to hunt for the right process yourself.

---

**Next action, new folder:** copy `exemples/assistant-devis/` into your workspace, open that copy in your AI tool, then say "Hello, I'd like to set up my business."

**Next action, existing folder:** initialize that folder through the CLI or Studio as described above, then say "Import my existing procedures."

BASE is an open framework carrying a proposed standard and a reference implementation, maintained by [AI Swiss](https://a-i.swiss). Use case in partnership with [Innovaud](https://innovaud.ch).
