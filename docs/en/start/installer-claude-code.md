<!-- fr-synced: 0a4c1d4c8fb7e3703f988769bb8ebf50f50a0fc8 -->
# Install Claude Code

By the end of this page, you will have an assistant that reads and edits your files under your control, ready to work on your real documents: BASE stops being text you read and becomes a tool that acts. This assumes you are comfortable in a terminal and have an Anthropic account. In a few minutes, you install Claude Code, launch it in a BASE example, and make a first request; you will also know what to do if you get stuck.

Claude Code, Anthropic's command-line AI agent, is just one entry point among many: most AI tools that can read and edit your files will do (for example GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code). This page documents Claude Code; for the others, refer to their installer.

You need an Anthropic account (Claude subscription or API access). No other dependency is required with the native installer.

## 1. Install Claude Code

**macOS / Linux / WSL:**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows (PowerShell):**

```powershell
irm https://claude.ai/install.ps1 | iex
```

If you already have Node 18 or higher, `npm install -g @anthropic-ai/claude-code` works too. The exact commands may change: when in doubt, follow the [official documentation](https://code.claude.com/docs).

Check with `claude --version`. On first launch, `claude` asks you to sign in to your account.

## 2. Launch `claude` in an example

1. Copy the folder of an example (for instance `exemples/assistant-devis/`) into your workspace
2. Open a terminal in that folder
3. Run `claude`

The `CLAUDE.md` file at the root of the example gives Claude Code its starting context via `@import`: the agent loads with no further configuration.

Don't have the repo yet? See [Get BASE](obtenir-base.md).

## 3. First request

Type:

> "Hello, I'd like to set up my business"

The assistant guides you, proposes files, and waits for your approval on the important decisions. The rest of the journey (first quote, `[A VALIDER]` markers) is in the [quickstart](quickstart.md).

## Basic troubleshooting

| Symptom | What to try |
| --- | --- |
| `claude: command not found` | Close and reopen the terminal; otherwise add the path shown by the installer to your PATH |
| Trouble connecting to your account | Run `claude`, then type `/login` |
| The agent doesn't load | Check that `claude` is running in the example folder, the one that contains `CLAUDE.md` (use `pwd` to verify) |
| Need help during the session | Type `/help` |
| Stuck on a technical step | Ask Claude Code itself: "I'm getting this error: [paste the error]. What's going on?" State your level if needed. |

---

BASE is a framework by [AI Swiss](https://a-i.swiss). Use case in partnership with [Innovaud](https://innovaud.ch).
