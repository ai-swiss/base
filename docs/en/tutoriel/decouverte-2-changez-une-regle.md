<!-- fr-synced: 579adb30b105f6e99f8eb002352ad7bcf1ab65e9 -->
# Change a rule, check the new reading

*⏱ ~10 min · module 2/3, Discovery track*

**You will**: confirm that an answer can use the saved version of a file, proven by the ✅ check below.
**You need**: module 1 finished and the Veytaux tourist office open in your tool.
↻ **Recall**: without looking, what is routing for? (to pick the right task based on intent)

1. Open `infos/tarifs.md`. Change the price of the **Guided tour of the old village** from 12 to 14 CHF.
2. **Save** the file (Cmd+S / Ctrl+S: Cursor doesn't always save on its own).
3. Ask your tool to reread `infos/tarifs.md`. Depending on the harness, this may require explicitly
   opening the file, starting a new conversation, or refreshing the project context.
4. Ask: *"According to infos/tarifs.md, how much does the guided tour of the old village cost?"*

✅ **Check**: the assistant announces 14 CHF (the new price), not 12. If it still says 12, see the breakdowns.

💡 **Why it worked**: this execution received the saved version of the file and used it to answer.
BASE does not decide when a harness rereads a file or which history it retains. The explicit request
and the reported value therefore check this particular run, not every future answer.

🔁 **At home**: which number, rule, or piece of information changes often in your line of work and would be worth keeping in ONE file you update?

→ **And now**: [Module 3: your own folder](decouverte-3-votre-dossier.md). You leave the Veytaux tourist office for a space of your own.

🆘 **Common breakdowns**: *It still says 12 CHF*: (a) the file wasn't saved; (b) the tool did not
reread it, so explicitly ask it to open the file or restart with refreshed context. *You can't find
tarifs.md*: it's in the `infos/` subfolder.
