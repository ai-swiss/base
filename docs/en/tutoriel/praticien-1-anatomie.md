<!-- fr-synced: b5573293fe891c7be374cfce89c1445d5f99cfbc -->
# The anatomy of an assistant

*⏱ ~12 min · module 1/9, Practitioner track*

**You will**: write a use_when that routes a request to the right process, proven by the ✅ below.
**You need**: Node 18+ and the repo (otherwise [the letter](../start/installer-par-votre-ia.md)), a terminal in `exemples/veytaux-tourisme`.

1. Open `.ai/agents/office-tourisme/AGENT.md`: the assistant's ID card (who, when).
2. Open `.ai/agents/office-tourisme/skills/processes/renseigner-un-visiteur/SKILL.md`: the steps,
   and above all the `use_when` field and `routing.examples`.
3. **Predict**: where should the request "what time is it open?" route? Say it out loud.
4. Check your prediction:

```routage-fixture
Quelles activités à faire cet après-midi ?
```

   (run `base route "Quelles activités à faire cet après-midi ?" --root .`)

✅ **Check**: `base route` answers `routed`, agent `office-tourisme`, process `renseigner-un-visiteur`. Your prediction holds.

💡 **Why it worked**: the `use_when` and the `routing.examples` are what the router reads. A good use_when describes the INTENT ("when a visitor wants to know what to do"), not the title. Predicting before you run turns the check into a test of a hypothesis: that is where the learning sticks.

🔁 **At home**: for ONE of your tasks, write its use_when in a single sentence: "When the user wants to …".

→ **Next up**: [Module 2: the skeleton of the office](praticien-2-le-squelette.md): you build a process from a skeleton with gaps.

🆘 **Common breakages**: *route answers out_of_scope*: your terminal is not in the right folder (`--root .` from `exemples/veytaux-tourisme`). *You can't find the SKILL.md*: it's under `skills/processes/<name>/`.
