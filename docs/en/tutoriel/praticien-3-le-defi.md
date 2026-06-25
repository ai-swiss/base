<!-- fr-synced: 3f3cbcabd8070f3132f31a97a5bb4d670d765e3a -->
# The challenge: deliver today's conditions

*⏱ ~12 min · module 3/9, Practitioner track*

**You will**: create a new process and show that it routes, with no step-by-step, proven by the ✅ below.
**You need**: modules 1-2 finished, your `mon-office-tourisme` folder.
↻ **Reminder**: without looking, which two fields does the router read to choose a process? (use_when, routing.examples)

The Veytaux tourist office is proud of its webcam trained on the parking lot, and visitors keep asking about the weather and the day's conditions up there. In `.ai/feedback/abstentions.jsonl`, the same question comes back unanswered: "What's the weather like up there today?" It's up to you to clear this abstention:

1. Create a process `donner-les-conditions-du-jour` (same structure as in module 2).
2. Give it a `use_when` and `routing.examples` that catch this kind of request:

```routage-defi
Quel temps fait-il là-haut aujourd'hui ?
Il neige au village ce matin ?
```

3. Check your own work (commands below).

✅ **Check**: `base validate --root .` passes, and `base route "Quel temps fait-il là-haut aujourd'hui ?" --root .` routes to `donner-les-conditions-du-jour`. If it routes elsewhere, adjust the use_when and the examples: that's the exercise.

💡 **Why it worked**: you just ran the full loop on your own: write the structure, predict the result, check, then correct. That's exactly the move you'll make again on your real processes.

🔁 **At home**: list one task from your own field that your assistant can't yet do; that's your next process.

→ **Next up**: [Module 4: competences and templates](praticien-4-competences-et-modeles.md), the reusable building blocks and document generation.

🆘 **Common breakdowns**: *It routes to renseigner-un-visiteur*: your examples look too much like a standard visitor query; bring them closer to "the weather and the day's conditions". *ambiguous*: two processes too close together: distinguish their use_when.
