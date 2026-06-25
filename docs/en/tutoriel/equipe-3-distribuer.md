<!-- fr-synced: 7d55e3423acdaefa2d37e9f6863c5857ddcfc7c5 -->
# Distribute to a team

*⏱ ~20 min · module 3/3, Team track*

**You'll**: version your BASE with git AND stand up an MCP server that a tool queries, proven by the ✅ below.
**You'll need**: module 2 finished; git and Node 18+ installed; the BASE repo locally; your `~/mon-assistant` project.
↻ **Recall**: without looking: how does BASE prevent a leak of confidential data? (the egress rule, checked before the call)

Distributing a BASE means distributing files: **git** for history and review, **MCP**
for the shared mechanical guarantees (deterministic routing, mediated writes), for the whole team.

1. **Version it.** In your project, initialize git and commit:

   ```
   cd ~/mon-assistant
   git init && git add -A && git commit -m "Mon BASE, départ"
   ```

   Resources are Markdown: a process change reads back as a diff. An
   improvement = a branch + a **pull request**, reviewed before merging.

2. **Stand up the MCP server.** From the BASE repo:

   ```
   cd mcp/
   npm install
   npm run build
   npm start -- --root ~/mon-assistant
   ```

3. **Connect a tool.** For Claude Desktop (Cursor is the same, in its MCP settings),
   add an ABSOLUTE path to `claude_desktop_config.json`, then restart the tool:

   ```
   {
     "mcpServers": {
       "base": {
         "command": "node",
         "args": ["/chemin/absolu/vers/mcp/dist/index.js", "--root", "/chemin/absolu/vers/mon-assistant"]
       }
     }
   }
   ```

   (ChatGPT additionally requires an HTTPS URL and a token: the per-tool walkthrough is in
   [install the MCP server](../start/installer-mcp.md).)

✅ **Check**: `git log` shows your commit (a process change will appear as a readable diff, ready for review); and your tool, connected via MCP, answers *"Which agents do I have?"* by listing the agents in `mon-assistant`.

💡 **Why it worked**: git makes evolution traceable and reviewable; MCP gives the whole team the SAME deterministic router and mediated writes, without each person touching the CLI. Security applies by default: over HTTP the server is read-only, and a network exposure without `BASE_MCP_BEARER_TOKEN` is refused at startup. Governance stays auditable because it is in plain text, in the files.

🔁 **At home**: who, on your team, will review process changes before merging? And which machine will host the MCP server?

→ **And now**: you have gone through all three tracks. Keep the reflex: gesture, check, then only the concept.

🆘 **Common failures**: *`npm: command not found`*: install Node 18+ from nodejs.org. *The server refuses to start on the network*: that's intentional without authentication, set `BASE_MCP_BEARER_TOKEN`. *The platform sees no agents*: check the `--root` (absolute path) and that it contains `.ai/agents/*/AGENT.md`. *Per-tool config*: see [install the MCP server](../start/installer-mcp.md).
