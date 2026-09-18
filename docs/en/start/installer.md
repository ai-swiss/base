<!-- fr-synced: 8087724bfbc7f5e168f236ff32391bd9423ebf03 -->
# Set up an AI workspace

Setting up a local workspace means keeping your agents and your context in your own folder, under your control, rather than inside a web platform. To do so, you choose a tool and spend a few minutes on it. This page points you to the guide that fits your situation; each one is short and stands on its own. BASE works with most AI tools that can read your Markdown files.

## Choose your setup: Cursor, Claude Code, MCP, or browser {#your-situation-your-page}

| Your situation | Follow |
| --- | --- |
| You want your AI to install it for you | [Have your AI install BASE](installer-par-votre-ia.md) |
| You prefer a graphical interface: several tools work well (Cursor, Antigravity, GitHub Copilot, OpenCode…), and BASE favors none of them | [Install Cursor](installer-cursor.md) |
| You are comfortable in a terminal | [Install Claude Code](installer-claude-code.md) |
| You want to connect ChatGPT, Claude Desktop, or another platform to your agents | [Install the MCP server](installer-mcp.md) |
| You have only a browser, nothing to install | [Try BASE without installing anything](essayer-sans-installer.md) |
| You want to see, evaluate, and maintain your BASE structure | [Have your AI install BASE](installer-par-votre-ia.md), then run `cd my-folder && node .ai/base.mjs studio --root .` |
| You don't have the repository yet | [Get BASE](obtenir-base.md) |

Most AI tools that can read your files are a good fit too (for example GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code): tell them "Read `.ai/agents/[nom-agent]/AGENT.md` and follow its instructions." Some recognize skills in `SKILL.md` format natively; otherwise, the agent loads them on demand, reading them as plain Markdown files.

## Common prerequisites

- **An AI tool that can read your files**: the tool itself is enough.
- **Reference implementation core and CLI**: [Node 18 or later](https://nodejs.org), a terminal, and a `node` command available in your `PATH` (`node --version` checks this).
- **MCP server**: Node 18.14.1 or later, with `node` and `npm` available in your `PATH`.
- **BASE Studio**: run `npm ci` once in the BASE clone. After initialization, run `cd my-folder && node .ai/base.mjs studio --root .`; Studio opens your browser. The `.ai/base.mjs` launcher does not install the short `base` command.

> **Your AI tool is the experience; Studio is the workshop.** Day to day, you work in your files, with your usual tool; Studio is for building, evaluating, and tending to what they contain.

## The assistant ignores the folder instructions: four environment pitfalls {#four-environment-pitfalls}

None of them comes from BASE, and each one costs half an hour the first time.

- **Start your tool from the folder.** A tool started elsewhere does not read the folder's entry point and behaves as if it did not exist. Open the folder, then the tool.
- **Unlock a passphrase-protected key once, in a real terminal.** An assistant running a command has nowhere to type your passphrase: the command hangs with no useful message. Do the first access yourself; the system agent keeps the key open afterwards.
- **Authenticate with your host before touching repository settings.** GitHub, GitLab, Forgejo or another: each has its own authentication command, and the settings (protected branches, permissions) stay silent until it has been run. Your host's documentation carries the exact command; it changes faster than this page.
- **Check the remote organisation before the first push.** A repository created by default under your personal account, when it was meant to live in your organisation's, gets harder to move the longer it has been used. Look at the remote address before pushing, not after.

## Why a local workspace?

Your files, your instructions, and your context stay in your own folder, under your control, instead of residing on a web platform. Depending on the tool you choose, the content sent to the model may still pass through the AI provider; check the applicable terms before entrusting it with sensitive data.

## What's next?

**Next action:** in the table, open the guide on the first row that describes your situation.

---

BASE is an open convention with a reference implementation, maintained by [AI Swiss](https://a-i.swiss). Use case in partnership with [Innovaud](https://innovaud.ch).
