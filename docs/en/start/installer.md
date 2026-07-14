<!-- fr-synced: 9d7f41334a127066e47bf9678e5150b06848cbdf -->
# Set up an AI workspace

Setting up a local workspace means keeping your agents and your context in your own folder, under your control, rather than inside a web platform. To do so, you choose a tool and spend a few minutes on it. This page points you to the guide that fits your situation; each one is short and stands on its own. BASE works with most AI tools that can read your Markdown files.

## Your situation, your page

| Your situation | Follow |
| --- | --- |
| You want your AI to install it for you | [Have your AI install BASE](installer-par-votre-ia.md) |
| You prefer a graphical interface: several tools work well (Cursor, Antigravity, GitHub Copilot, OpenCode…), and BASE favors none of them | [Install Cursor](installer-cursor.md) |
| You are comfortable in a terminal | [Install Claude Code](installer-claude-code.md) |
| You want to connect ChatGPT, Claude Desktop, or another platform to your agents | [Install the MCP server](installer-mcp.md) |
| You have only a browser, nothing to install | [Try BASE without installing anything](essayer-sans-installer.md) |
| You want to see, evaluate, and tend to your BASE | `base studio --root mon-dossier` (the graphical Studio) |
| You don't have the repository yet | [Get BASE](obtenir-base.md) |

Most AI tools that can read your files are a good fit too (for example GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code): tell them "Read `.ai/agents/[nom-agent]/AGENT.md` and follow its instructions." Some recognize skills in `SKILL.md` format natively; otherwise, the agent loads them on demand, reading them as plain Markdown files.

## Common prerequisites

- **An AI tool that can read your files**: the tool itself is enough.
- **BASE CLI or MCP server**: Node 18 or higher. This is the core's only dependency.
- **BASE Studio**: nothing else. `base studio` installs its dependencies on first launch and opens your browser.

> **Your AI tool is the experience; Studio is the workshop.** Day to day, you work in your files, with your usual tool; Studio is for building, evaluating, and tending to what they contain.

## Why a local workspace?

Your files, your instructions, and your context stay in your own folder, under your control, instead of residing on a web platform. Depending on the tool you choose, the content sent to the model may still pass through the AI provider; check the applicable terms before entrusting it with sensitive data.

## What's next?

- First success in 5 minutes: [Quickstart](quickstart.md).
- Build your own assistant: open the main BASE folder and say "Read `.ai/agents/createur-agent/AGENT.md` and follow its instructions." The creator guides you from start to finish and proposes the configuration suited to your tool.

---

BASE is a framework by [AI Swiss](https://a-i.swiss). Use case in partnership with [Innovaud](https://innovaud.ch).
