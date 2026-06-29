<!-- fr-synced: a87f4d08bb878bb461bc72084d4ce169e909435f -->
# Make the tourist office talk

*⏱ ~10 min · module 1/3, Discovery track*

**You will**: recognize when the assistant steers a request and when it honestly abstains, proven by the ✅ below.
**You need**: an AI tool installed and connected, along with the exemples/veytaux-tourisme folder open (see [Step 0](harnais.md)).

Run these four requests, one at a time:

```routage-fixture
Quelles activités à faire cet après-midi ?
Organiser une sortie pour notre groupe de 30 personnes
Vous avez une plage où se baigner ?
Quelles sont mes options ?
```

1. *"What activities can I do this afternoon?"*: it pulls up the records and cites its source.
   It also checks that the calendar is up to date, and leans on the calendar and the cited records instead of making things up.
2. *"Organize an outing for our group of 30 people"*: it moves on to preparing an offer.
3. *"Do you have a beach to swim at?"*: a genuine tourism question, but no process answers it.
4. *"What are my options?"*: a request for general help.

✅ **Check**: the assistant must, in substance: (1-2) enter the right task; (3) NOT invent a beach, but ask what you're looking for instead of guessing; (4) offer a brief menu of options. The two possible outcomes of (3) are instructive: see Why.

💡 **Why it worked**: the right process is chosen according to intent, not from keywords. At the *consigne* tier (no CLI/MCP), it's the model that follows the router written in CLAUDE.md: it CAN overstep and improvise an answer to "a beach?" instead of asking for clarification. That's precisely the limitation that deterministic routing lifts.

🔁 **Back home**: what are the 2 or 3 requests your clients or colleagues bring you most often? Write them down: those will be your processes.

→ **And now**: [Module 2: change a rule](decouverte-2-changez-une-regle.md): you'll watch the assistant obey a file that YOU edit.

🆘 **Common breakdowns**: *It improvises an answer to "a beach?" as if nothing were amiss*: this is expected at the consigne tier, and it's the lesson, not a flaw. *A request doesn't enter the right task*: rephrase it by stating your intent ("I'd like some information", "organize an outing for a group").
