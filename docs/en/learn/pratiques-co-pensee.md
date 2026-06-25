<!-- fr-synced: 8c742e8f9bd13f37f3cd27da36f4a0d2b08711c1 -->
# Human-AI co-thinking in practice

Producing with AI now takes little effort; defending it takes a lot. The point, then, is not to write the perfect prompt, but to **stay the one who keeps control**: frame, delegate, evaluate, adjust, and know, in the end, what you are signing off on. This page brings together what you need to get there, from the simplest to the most complete: the loop that sets the rhythm of every interaction, five practices to make it light, then the sixteen principles that ground them. You can stop after the practices and already work well; going all the way down to the principles is how you hold the method over time.

> [Why BASE: co-thinking with AI](./co-penser-avec-lia.md) explains *why* verification is the heart of the matter. This page shows *how*.

## The loop: frame, delegate, evaluate, adjust

Working with AI most often follows the same cycle, **FRAME → DELEGATE → EVALUATE → ADJUST**, then around again. This is not a sign of inefficiency, it is the method: good results come from a few turns of this loop, not from a single perfect request. The five practices below make each step light. None requires expertise: they serve the person in a hurry as much as the one who wants to dig in.

### 1. Frame clearly

Before generating, state the goal, the constraints, and what a good answer looks like. A clean frame up front makes verification light downstream.

> *"Draft a reply to this dissatisfied customer. Tone: calm and factual. Constraints: no commitment to a refund, propose a meeting instead. A good reply acknowledges the problem without promising what we can't deliver."*

**What you check:** the tone, and that no unauthorized promise slipped in.
Full example: `exemples/assistant-courrier/`.

### 2. Verify against reality

The one who produces cannot judge their own work. The AI proposes, you verify against your facts, your files, your rules. This is the verification debt: it does not disappear, you make it visible and small.

> *"What are you basing this figure on? Cite the source in my files."*

**What you check:** that the source exists and actually says what it is being made to say.
Full example: `exemples/assistant-devis/`, where the pricing scale comes from your files, not the model's memory.

### 3. Ask for a decision sheet

When several choices are open at once, a conversation thread tangles up. Ask for a **decision sheet**: the AI lays out each point with its recommendation up front, you record your agreement and your comments, then it acts on the whole thing in one go. You decide, the sheet structures the decision.

> *"Several choices are open. Make me a decision sheet: one point per card, your recommendation first, and I'll give you my answers back."*

- **When:** as soon as there are two or more decisions to make together.
- **What you get back:** a clear document where you settle the matter point by point, without the AI deciding in your place.
- **What you check:** that each recommendation is justified, and that no already-settled point gets reopened.

Full example: `exemples/assistant-reflexion/`, which knows how to clarify a decision and prepare a decision note.

### 4. Make assumptions visible

A good interaction does not bury what matters. Ask the AI to mark what remains to be confirmed rather than presenting it as settled. The markers `[A VALIDER]`, `[HYPOTHESE]`, and `[A COMPLETER]` stand out at a glance, for you and for your tools.

> *"Mark `[A VALIDER]` on everything that isn't confirmed, and `[HYPOTHESE]` on the points where you're assuming."*

**What you check:** that the zones of uncertainty are flagged, not hidden.

### 5. Iterate, don't chase the perfect prompt

Fine-grained control is what makes you effective. Rather than rewriting the *consigne* ten times, let it generate a first version, react precisely, adjust. Friction is productive: each round-trip brings you closer, and you keep your grasp of what changes.

> *"That's almost it. Make the second paragraph shorter and cut the jargon."*

**What you check:** that each version gets closer, and that you still understand what is moving.

These practices are calibrated, not anti-automation: they keep you able to verify, without slowing you down. What they put into practice are the sixteen principles that follow.

---

## The sixteen principles

The practices above are the short version; here is the full method. There are many regulatory and ethical frameworks governing the use of AI. These principles do not replace them: they give operational guidance for excelling within those frameworks, while staying effective and responsible. They are organized into six categories: carrying your responsibility, knowing your reliability constraints, knowing how to interact, avoiding common traps, putting method before tools, and keeping control over time.

### I. Carry your responsibility

#### 1. Be yourself where it matters

Tasks that draw on your unique personal identity (your voice, your style, your vision, or your values) must be driven by you.

Examples: strategic vision, company philosophy, brand identity, architectural signature.

*Ask yourself: does this task require what makes me unique?*

#### 2. Be human where it matters

Tasks that demand human experience (empathy, embodied understanding, moral intuition) must be led by a human being.

Examples: a delicate message to a colleague, mediating a conflict, an ethical decision, a sensitive customer complaint.

*Ask yourself: can this really be done without knowing what it feels like to be human?*

#### 3. Use AI effectively

Once you decide to use AI, do it well. Minimize useless iterations, vague instructions, and needless back-and-forth. Structure your requests, verify the results, and avoid using AI for tasks it cannot perform reliably.

*Ask yourself: am I using AI in a targeted, productive way, or am I wasting time and resources?*

#### 4. Verify against reality

AI simulates, predicts, and emits hypotheses, but it cannot test its claims in the real world. Formulating and testing hypotheses against physical reality is your responsibility.

Examples: a quote may look correct but contain a price that is unrealistic for your market. A job posting may look professional but ignore your local constraints. Only you can verify what matches your reality.

#### 5. Weigh risks, costs, and alternatives

Generative AI is not always the right choice. Before each use, weigh:

- **Risks:** confidentiality, bias, intellectual property, authenticity, data sovereignty, regulatory compliance.
- **Costs:** energy, money, time, quality trade-offs, cognitive dependence.
- **Alternatives:** deterministic algorithms, specialized tools, established methods, human expertise alone.

*Ask yourself: does generative AI offer a net benefit here, or would another approach be safer, cheaper, or more effective?*

*Common practices on these points are detailed in the [appendix](#appendix-common-practices-for-principle-5).*

### II. Know your reliability constraints

#### 6. Be aware of the complexity inherent in the task

Some tasks fundamentally require a certain number of steps, a certain amount of memory, or traversing a certain amount of information. AI or not, they cannot be done reliably without those resources. These are not weaknesses of AI, but properties of the problem: what would cost you intermediate steps costs the AI, and any system in the world, the same. In other words, AI will never work magic: no business results without the effort that produces them, no revolution in every field without the resources it demands. At best, AI lightens or shifts the effort; it does not remove it.

Why these limits belong to the problem and not to AI, down to the Church-Turing thesis: see [Why BASE](co-penser-avec-lia.md), section "The task's limits, AI shares them".

Examples: extracting information across several documents, checking consistency between sources, synthesizing common points over large volumes.

*Ask yourself: if I had to do this, would I need to go through many documents? To stop and think? To take notes? To follow a precise process? If so, AI cannot simply "guess" the answer in one shot. It too needs resources (time and/or context capacity).*

This is why BASE uses **structured workflows**: they break complex tasks into manageable steps, with regular checkpoints.

#### 7. Turn to dedicated algorithms for guarantees

By nature, language models cannot provide strict guarantees. For that, turn to specific algorithms (verifiers, tools, error-correction processes).

Examples: compliance checkers, document parsers, code checkers, VAT calculators.

*Ask yourself: what is my risk-benefit balance? For which elements do I need external verifiers?*

### III. Know how to interact

#### 8. Treat human-AI communication as a competence in its own right

The one-shot perfect prompt solves little. What matters is high-quality, structured communication over several steps, developing a "sixth sense" for spotting what, in the AI's responses, does not match what a human interlocutor would produce.

*Ask yourself: how does the AI react to different phrasings? How often do I need to step in to keep my project on track?*

#### 9. Provide the knowledge that matters most

Don't let the AI fill its own memory based only on vague heuristics and shallow searches. Of your world, the model recovers only what you have made findable, at the grain where you stored it. Structure your knowledge and point to what is needed as soon as you can. And at the right granularity: chunks fine enough that you can pick the right one without dragging the rest along, large enough that they keep their meaning.

Examples: point to extracted requirements rather than a stack of meeting minutes, to design choices rather than scattered documentation, to a targeted task list rather than the whole of your files.

*Ask yourself: how do I structure the information so I always have what I need at hand, even if I pick the work back up in two months?*

This is exactly what the **domain files** do in BASE: your identity, your activity, your catalog, your terms, structured and always up to date.

#### 10. Shape how the AI works

The steps your AI follows by default don't suit you? You don't like its behavior? Shape them. Specify exactly what to do, when, with what information or what tools.

This is exactly the role of the **AGENT.md** and the **skills** in BASE: they shape the AI's behavior so it matches your domain.

### IV. Avoid common traps

#### 11. Don't fall into the trap of ease

Querying an AI is easy; getting quality results is often demanding. Think, structure. Stay in charge of the process.

Examples: unverified drafts, off-the-cuff legal advice, unchecked financial projections.

*Ask yourself: is it better to get something fast and pay later in corrections and opacity, or to structure for success and transparency?*

#### 12. Don't fall into the trap of appearance

AI-produced results most often look polished, but that does not mean they are correct. The quality of the writing guarantees neither the accuracy of the facts nor the soundness of the recommendations.

Examples: a plausible but wrong diagnosis, a seemingly solid financial analysis, a professional contract with errors in it, a well-formatted quote with invented prices.

Every claim accepted without scrutiny creates a **verification debt**: untested assumptions that pile up and can collapse at the first critical look from a client or a partner.

#### 13. Don't fall into the trap of hype

Vendors often make impressive promises that misrepresent what AI actually does. Learn to decode them:

- *"Our model doesn't hallucinate"*: language models generate plausible text with no internal mechanism for factual verification. Verification is always required.
- *"Our model is trained on your data"*: training a model from scratch costs millions. "Trained on your data" usually means fine-tuning, which adapts the model's behavior but does not remove the fundamental risk of hallucination.
- *"Our model is fully secure"*: prompt injection (influencing the model's behavior through unwanted instructions) is a structural vulnerability of these systems. Security external to the model is always needed.

*Ask yourself: does this claim reflect how language models actually work? Does it promise something the technology fundamentally cannot deliver?*

### V. Method before tools

#### 14. Don't let the tool dictate the process

Most AI products are not designed to help you uphold principles 1 through 13. Actively resist that. Use tools that serve your method. Design tools that set the bar higher.

BASE is built around this principle: your skills, templates, and domain data are your real capital. They encode your know-how, your expertise, your processes, and they are portable from one tool to another. Tools change fast. A well-organized knowledge structure will serve you for years.

One special case deserves to be named: **the grammar of agents.** Many tools invite you to carve up your work in advance into "agents", roles, and hand-offs, in their interface. But the bulk of the work consists of following the thread of your own thinking, fluid, not of pre-articulating it into agents. Keeping the freedom to think any process at all, including a simple conversation over the right files, is part of "not letting the tool dictate the process". *(BASE uses the word "agent" to stay executable on these tools, which know it, but a BASE agent is only your Markdown, readable and optional. See [Why BASE: co-thinking with AI](co-penser-avec-lia.md).)*

### VI. Keep control over time

The preceding principles help you produce well with AI, here and now. The next two protect something slower to lose and harder to rebuild: your ability to stay at the controls over the months.

#### 15. Keep enough intuition to verify

You can delegate granularity to the AI, but you cannot delegate the ability to judge what it produces. Verification (principle 4) assumes you still understand what you are verifying. With repeated delegation, the fine intuition of the work is gradually lost, and verification then degrades into surface-level validation, without your noticing, because the result "looks correct" (principle 12).

So keep, at all times, enough intuition to remain a capable verifier. You can lose detail; you must not lose your grip. This may require deliberately investing time to reload the big picture in your own head: reading in depth, discussing as a team what was produced and why, redoing a fragment of the work yourself from time to time.

*Ask yourself: if AI disappeared tomorrow, would I still understand enough of what it produced to defend it in front of a client? Is my intuition still at the level of what I'm signing off on?*

**A tension to know about.** BASE seeks to make verification *light* (strong structure up front → light verification downstream). That is an asset, but pushed to the extreme, it is also the mechanism by which you drift away from the material. The structure should lighten verification, never empty it of meaning.

#### 16. Keep sovereignty over your setup

Working with AI means operating a setup made of several layers: your files, which you control, and the instructions injected by the tool (system prompt, rules, vendor policies) that you don't always see. Losing sovereignty means operating an AI shaped by external instructions with no transparency about what actually structures your interaction.

BASE makes you sovereign over *your* layer: your AGENT.md, skills, and data are readable, portable, and yours (principle 14). Stay clear-eyed about the layers you don't write: demand transparency about what the tool injects, prefer auditable setups, and keep your knowledge in files you can take elsewhere. Portability conditions your sovereignty: it lets you leave the day the tool no longer suits you.

*Ask yourself: do I know what, in this setup, steers the AI's behavior? If the tool changed its invisible rules tomorrow, would I know, and could I leave?*

---

## The co-thinking loop

Working effectively with AI most often follows the same cycle:

```
    ┌──────────────┐
    │  1. FRAME    │  State clearly what you want,
    │              │  with the necessary context
    └──────┬───────┘  (principles 1, 2, 5, 9, 10)
           │
    ┌──────▼───────┐
    │ 2. DELEGATE  │  The AI generates within the defined frame,
    │              │  up to the next checkpoint
    └──────┬───────┘  (principles 3, 6)
           │
    ┌──────▼───────┐
    │ 3. EVALUATE  │  You verify: is it correct?
    │              │  Does it match my reality?
    └──────┬───────┘  (principles 4, 7, 8, 11, 12)
           │
    ┌──────▼───────┐
    │  4. ADJUST   │  You refine, correct, enrich
    │              │  → back to step 2
    └──────────────┘
```

**The key principle:** strong structure up front → light verification downstream. Weak structure up front → explosive verification debt.

Principles 15 and 16 do not attach to a specific phase of the loop. They protect your ability to hold it over time: keeping enough intuition for the *Evaluate* step to stay real, and keeping sovereignty over the setup that runs the whole loop.

---

## In summary

| # | Principle | In one sentence |
|---|----------|---------------|
| | **I. Carry your responsibility** | |
| 1 | Be yourself where it matters | Your voice, your vision, your values are irreplaceable |
| 2 | Be human where it matters | Empathy and moral intuition demand human experience |
| 3 | Use AI effectively | Structure your requests, don't waste resources |
| 4 | Verify against reality | AI emits hypotheses, only you can test in the real world |
| 5 | Weigh risks, costs, and alternatives | AI is not always the right choice |
| | **II. Know your constraints** | |
| 6 | Complexity inherent in the task | Complex task = resources needed, not a single request |
| 7 | Dedicated algorithms for guarantees | Language models cannot guarantee accuracy |
| | **III. Know how to interact** | |
| 8 | Communication as a competence | The single perfect prompt does not exist, iterate |
| 9 | Provide the knowledge that matters | Structure at the right grain and point, don't let the AI guess |
| 10 | Shape how it works | Define the process, the behavior, the steps |
| | **IV. Avoid the traps** | |
| 11 | Trap of ease | Asking is easy, getting a good result is demanding |
| 12 | Trap of appearance | Fluent text ≠ correct text |
| 13 | Trap of hype | Decode the marketing promises |
| | **V. Method before tools** | |
| 14 | The tool does not dictate the process | Your knowledge structure is your real capital |
| | **VI. Keep control over time** | |
| 15 | Keep enough intuition to verify | Delegate granularity, never the ability to judge |
| 16 | Keep sovereignty over your setup | Know what shapes the AI; keep a way out |

---

## Decision guides

These guides operationalize the principles above in concrete situations.

### Guide 1: "Is AI the right choice?" (Principles 1, 2, 5)

Four questions, in this order:

1. **Does this task require what makes me unique?** (my voice, my style, my vision, my values)
   → If yes: **do it yourself.** AI can structure, not replace your identity. *(Principle 1)*

2. **Does this task demand human experience?** (empathy, intuition, moral judgment)
   → If yes: **lead it yourself.** AI can prepare, not feel. *(Principle 2)*

3. **Does the benefit justify the risks and costs?** (confidentiality, reliability, verification time)
   → If no: **use an alternative.** A spreadsheet, an existing template, a proven method. *(Principle 5)*

4. → If yes: **use AI with structure.** Structure the request, provide the knowledge, verify the result. *(Principles 3, 6, 9, 10)*

### Guide 2: "When to iterate vs. move on" (Principles 8, 11, 12)

If you use the BASE markers in your documents:

- **`[A VALIDER]` present** → iterate. A proposal has not been confirmed.
- **`[A COMPLETER]` present** → iterate. A piece of information is missing.
- **`[ATTENTION]` present** → assess the risk. Can you move on despite the alert, or does it need handling?
- **No markers, result verified** → move on. The work is complete.

Without markers, the same logic applies: move on when you have verified against reality *(Principle 4)*, not when the text "looks good" *(Principle 12)*.

### Guide 3: "Evaluating the quality of an agent" (Principle 10)

| Criterion | Basic | Good | Excellent |
|---------|---------|-----|-----------|
| **Routing** | The agent understands 1-2 intents | Covers all common intents | Handles ambiguous intents with clarifying questions |
| **Workflows** | Steps listed | Decision points before each irreversible action | Frequent rephrasings + rare, precise decision points + log |
| **Knowledge** | Generic information | Precise figures, exact terminology, up-to-date rules | Updated regularly with real domain data |
| **Data** | Placeholders everywhere | Identity and terms filled in | Catalog, clients, and history up to date |

---

## Appendix: when your practice grows

### Multi-agent

If you have several distinct activities, one agent per activity is often more effective than one agent that does everything. Signal: when an agent has more than 5 workflows, consider splitting it.

### Shared knowledge

The standard competences (communication, markers, log) are identical across agents. Other knowledge can be shared between agents via relative paths (e.g. company information).

### Working as a team

If several people use the same agent:
- Version the files with Git to make changes visible and discussable
- Share the workflows and knowledge that genuinely need to be common
- Separate domain data when roles, clients, countries, legal entities, or sensitivity levels require it
- The log lets you see what other sessions have produced

For a large organization, this level remains a working convention. It must be complemented by the official mechanisms for access rights, classification, audit, retention, and compliance review.

### Signals of complexity

- More than 5 workflows → split the agent
- More than 3 agents → consider a shared router
- Workflows that run more than 10 steps → break into sub-workflows
- Knowledge that exceeds 200 lines → break into sub-domains

---

## Adapting across models

AI models evolve fast, and there are several families of them. A workflow that works perfectly with one may need adjustments with another. The points that vary the most:
- Context length (how many files can be loaded at once)
- The tendency to follow instructions vs. improvise
- The quality of calculations and formatting

**Rule of thumb:** if the result is disappointing, the problem is rarely the model: it is often the workflow that is not structured enough. Add dialogue examples, specify the expected formats, break into shorter steps.

---

## Appendix: common practices for principle 5

**Risks inherent in generative AI** (stemming from its statistical nature):

- **Confidentiality:** AI understands the concept of private vs. public, but cannot know what is private to you in your data. Never expose sensitive data to uncontrolled systems.
- **Bias:** AI learns patterns from its training data. Scrutinize the results, especially those involving people.
- **Intellectual property:** AI models may have been trained on protected content. Check licenses and rights before distributing generated content.
- **Authenticity:** AI output resembles human content by design. Disclose the use of AI when authenticity or traceability matters.
- **Data sovereignty:** your interactions may be used to train the models. Check the data-protection policies and turn off reuse options where necessary.
- **Regulatory compliance:** make sure your use respects the regulations in force and your organization's guidelines.

**Costs** (direct and indirect):

- Energy, financial costs, time spent designing the instructions and verifying, quality loss requiring corrections, cognitive dependence.

**Alternatives** (often more reliable or efficient):

- Deterministic algorithms for search, calculation, verification.
- Specialized tools designed for the task.
- Established methods (checklists, templates, processes).
- Human expertise alone when that is enough.

---

## Going further

- **Understand the approach**: [Understanding BASE and shaping the interaction with AI](comprendre.md), the anatomy of an agent, why it works, portability.
- **Spread it through an organization**: [Adoption in an organization](adoption-organisation.md), how an individual practice becomes a team and then an institutional usage.
- **Get started in practice**: the ["Learning by doing" tutorial](../tutoriel/index.md), step by step.
- **Gallery of ideas**: [idees-agents.md](../guides/idees-agents.md), dozens of examples of agents by profession.
- **Create your own assistant**: open an assistant's folder in an AI tool able to read your files and say "I'd like to create an assistant for [your profession]".

---

*Adapted from AI Swiss's [human-AI co-thinking principles](https://a-i.swiss).*

BASE is a framework by [AI Swiss](https://a-i.swiss). Use cases in partnership with [Innovaud](https://innovaud.ch).
