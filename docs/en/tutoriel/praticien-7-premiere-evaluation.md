<!-- fr-synced: ba74f3e957c57a3ba5849daa084586bfca2b015b -->
# Your first evaluation

*⏱ ~15 min · module 7/9, Practitioner track*

**You will**: read a judge's verdict on a scenario and spot a path to improvement, proven by the ✅ below.
**You need**: module 6 finished (a model connected, evaluation defaults in place).
↻ **Recall**: without looking, why are API keys never in the screen? (they live in an environment variable, never in the files)

1. In Studio, the **Evaluations** tab, the "▶ Evaluate" button.
2. The panel opens, pre-filled. The Veytaux tourist office provides two scenarios (a passing visitor
   disappointed by the weather, a vague group leader). Launch it.
3. Wait: a simulated user plays out the scenario, then an independent judge scores each
   conversation. The result cards arrive one by one.
4. Click a card to expand the judge's verdict and its fix hint.

✅ **Check**: you see at least one verdict (met / partial / missed) with a reason and, if the goal is not met, a concrete fix hint.

💡 **Why it worked**: evaluating is not "the code compiles": it is a real simulated user faced with a real judge, on scenarios you write. The verdict tells you whether the process holds up BEFORE your real visitors.

🔁 **At home**: which trap scenario would you want your assistant to pass every time (the visitor who forgets a piece of information, the borderline request)?

→ **And now**: [Module 8: the field](praticien-8-le-terrain.md): when real use surfaces a problem.

🆘 **Common breakdowns**: *The evaluation fails at launch*: a message lists the problems (provider/model) and sends you back to the Settings. *It's slow*: a local model takes a few minutes, that's normal.
