<!-- fr-synced: ac21a2cfb1ddcfe5d96cca067536017390d371c8 -->
# The field: a friction comes up

*⏱ ~10 min · module 8/9, Practitioner track*

**You will**: handle a report from the field and resolve it through the write gate, proven by the ✅ below.
**You need**: module 7 finished, Studio open on the tourist office.
↻ **Recall**: without looking, what does an evaluation produce? (a judge's verdict + a lead for the fix)

The Field stack starts empty. We simulate a report.

First, a quick word of context: the **Field stack** gathers frictions (a real use that got stuck); the **gate** is the golden rule: nothing is written without a proposal (a diff) that you validate.

1. Create `.ai/feedback/2026-01-10_agenda-perime.md` in the tourist office with this content:

```
---
process: .ai/agents/office-tourisme/skills/processes/renseigner-un-visiteur/SKILL.md
reported: 2026-01-10
via: user
status: open
---
# The agenda was out of date and the assistant announced the event anyway

The process should check the validity date before announcing an event from the agenda.
```

2. In Studio, **Evaluations** tab: the friction appears in the Field stack.
3. Open the process concerned, amend it to check the date, then "Mark resolved": a diff shows up (the gate), validate it.

✅ **Check**: the friction leaves the "open" stack after validation, and the resolution diff went through propose then commit (nothing was written before your validation).

💡 **Why it worked**: the field is the raw material of improvement. A friction is a dated file, never lost. Every write, even a resolution, goes through the gate: that is what makes the AI safe to let live in your files.

🔁 **At home**: when your assistant gets it wrong, who will note the friction, and where? (that is your improvement loop)

→ **And now**: [Module 9: migrate your content](praticien-9-migrer.md): the moment the exercise becomes YOUR tool.

🆘 **Common breakdowns**: *The friction does not appear*: check the `.ai/feedback/` folder and the frontmatter (status: open). *No diff on resolution*: the resolution always goes through a proposal; review before you validate.
