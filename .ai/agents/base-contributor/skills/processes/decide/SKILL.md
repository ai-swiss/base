---
schema_version: base.resource.v1
id: decide
type: process
title: Decision sheet
scope: team
status: active
sensitivity: internal
name: decide
description: "Build an interactive decision sheet that collects the human's choices and comments on several points at once, then acts on the export. Use when several decisions are open."
use_when: Make a decision sheet to collect the human's choices and approvals on several open points at once, instead of deciding one at a time in chat.
routing:
  examples:
    - Make a decision sheet for these open points
    - Collect my decisions and approvals on a list
    - I need to decide between options on BASE
    - Build a sheet so I can go through these choices
  avoid_when:
    - Apply a change that is already settled.
    - Record one single decision durably.
argument-hint: "[the points to decide]"
user-invocable: true
allowed-tools: Read, Write
---

# Decision sheet

When several choices are open, a sheet beats a chat thread: the human rates each point, comments,
and exports them all in one pass. The human decides; the sheet structures the decision.

## Steps

1. **List the real decisions.** One card per point. Each card carries the context, **your recommendation**
   (lead with it), and where relevant your prior reading. Do not pad with already-settled items.
2. **Build from the template.** Copy the agent's template at
   `.ai/agents/base-contributor/templates/decision-sheet.html` to
   `.temp/{YYYY-MM-DD}_{slug}/{YYYY-MM-DD}_{slug}_decisions.html` — a dated stem, unique per sheet.
   Fill the title, intro, the `POINTS` array (`id`, `title`, `what`, `reco`, `recoSummary`,
   `scaleLabel`), and the two names that pair the blank with the return: `STORAGE_KEY` =
   `{YYYY-MM-DD}_{slug}_decisions` (namespaces the browser autosave) and `EXPORT_FILE` =
   `{YYYY-MM-DD}_{slug}_decisions-filled.md` (so the export sorts next to its blank and stays
   self-describing outside the folder).
3. **Keep it clean.** No reference to any external framework or banned phrasing; AI Swiss styling
   is already in the template. `.temp/` is gitignored, so the sheet stays scratch.
4. **Open it for the human** and wait. The sheet auto-saves to the browser, and the export is a
   Markdown file the human hands back.
5. **Act on the export.** Apply where they agree, follow their comments where they nuance, keep
   your recommendation where they did not answer (and say so). Durable choices graduate to an
   `open-change` record.

## What you never do

- Decide on the human's behalf, or turn an honest abstention into a forced choice.
- Re-litigate points already settled, or bury the recommendation under context.
