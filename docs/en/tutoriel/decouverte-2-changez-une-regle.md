<!-- fr-synced: 0910d7279aa2aebd5712c8cdb8028812cf1068f6 -->
# Change a rule, watch it obey

*⏱ ~10 min · module 2/3, Discovery track*

**You will**: see that the assistant follows your files, not some hidden memory, proven by the ✅ below.
**You need**: module 1 finished, the Veytaux tourist office open in your tool.
↻ **Recall**: without looking, what is routing for? (to pick the right task based on intent)

1. Open `infos/tarifs.md`. Change the price of the **Guided tour of the old village** from 12 to 14 CHF.
2. **Save** the file (Cmd+S / Ctrl+S: Cursor doesn't always save on its own).
3. **Open a new conversation** (important: see Why).
4. Ask again: *"How much does the guided tour of the old village cost?"*

✅ **Check**: the assistant announces 14 CHF (the new price), not 12. If it still says 12, see the breakdowns.

💡 **Why it worked**: the assistant has no database and no hidden memory, it READS your Markdown files on every task. Change the file and its behavior follows. The new conversation forces a reread; in the old one, it could keep the old price in mind.

🔁 **At home**: which number, rule, or piece of information changes regularly in your work and should live in ONE file you keep up to date?

→ **And now**: [Module 3: your own folder](decouverte-3-votre-dossier.md): you leave the Veytaux tourist office for your own space.

🆘 **Common breakdowns**: *It still says 12 CHF*: (a) the file wasn't saved; (b) you stayed in the same conversation: open a new one. *You can't find tarifs.md*: it's in the `infos/` subfolder.
