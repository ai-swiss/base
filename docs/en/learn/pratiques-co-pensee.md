<!-- fr-synced: 5ebdcdd0ecd7fea52d09c5d4aa30c601c3626849 -->
# Human-AI co-thinking in practice

Producing with AI takes little effort. Defending the result can take much more. Co-thinking helps you retain control through a short loop: **FRAME → DELEGATE → EVALUATE → ADJUST**.

An answer is a proposal to check, not an established conclusion. Several iterations do not indicate a communication failure: they allow you to refine the goal from a concrete result. [Why BASE](co-penser-avec-lia.md) explains the reason for this method; this page helps apply it.

## Five practices

### 1. Frame the expected result

State the goal, constraints, authoritative sources, and success criterion.

> "Write a calm, factual reply. Promise no refund. Propose a meeting and rely on the attached policy."

A useful frame also states how far AI may proceed alone and which action requires a decision. Check that the result satisfies every constraint, not only the tone.

### 2. Verify against an appropriate source

Ask what supports every important fact. Use an external verifier when one exists, such as a calculator, schema, or test. Otherwise, compare the proposal with facts and domain judgment proportionate to the risk.

> "Quote the passage in my files that supports this amount."

A review by the same model may reveal a problem, but it is not independent verification.

Checking a citation means opening the passage and confirming that it actually supports the claim. The presence of a link or file name is not enough.

### 3. Group decisions

When several choices are related, ask for a decision sheet presenting each option, a justified recommendation, and space to respond. You decide; the document prevents decisions from getting lost in the conversation or being reopened without reason.

A good sheet separates independent choices, shows their consequences, and distinguishes what is recommended from what has already been decided.

### 4. Make uncertainty visible

Use the four canonical business markers according to their definitions in the [marker registry](../reference/marqueurs.md). `[A COMPLETER]`, `[A VALIDER]`, `[ATTENTION]`, and `[DECISION]` are the only markers recognized by the scanner.

An agent may add domain annotations, such as `[HYPOTHESE]`, but they do not thereby become canonical markers and are not returned by `base markers`.

The goal is not to cover the text with labels. Mark uncertainties that would change a decision, amount, commitment, or next step.

### 5. Adjust through small differences

Generate a first version, name the difference precisely, then verify the correction. The number of iterations varies by task; no universal speed is promised.

> "Shorten the second paragraph and replace the jargon with common words."

Ask for one change at a time when the differences interact. This makes the change visible and prevents one quiet correction from undoing another.

## Sixteen principles

These principles complement the five practices. They replace neither professional duties nor applicable legal frameworks. They help decide what to delegate, how to check it, and what you must continue to understand yourself.

### Carry responsibility

1. **Be yourself where it matters.** Keep control of your voice, vision, and values. AI can help structure a position without becoming the author of what personally commits you.
2. **Be human where it matters.** Lived empathy and moral judgment cannot be delegated to the model. For a conflict, difficult announcement, or ethical decision, AI may help you prepare, but conduct the exchange yourself.
3. **Use AI selectively.** Do not use it when another method is safer or simpler. A deterministic calculation, form, or checklist may fit better than generation.
4. **Verify against reality.** The model cannot test its claims in your environment by itself. A plausible quote must still match your prices, a cited rule the applicable version, and a recommendation the lived situation.
5. **Weigh risks, costs, and alternatives.** Include confidentiality, intellectual property, compliance, energy, review time, and cognitive dependency. The right criterion is the net benefit for this task, not merely the tool's availability.

### Know reliability constraints

6. **Respect the task's intrinsic complexity.** Traversing information, retaining intermediate steps, or applying a calculation requires the corresponding data, working memory, and operations, regardless of the executor. If you would need to search, take notes, or follow a procedure, give the setup the means to do so as well. AI may shift or reduce this effort, but it cannot remove the problem's dependencies.
7. **Use dedicated algorithms for guarantees.** Entrust calculations, schemas, tests, and formalizable rules to suitable verifiers. External checks exist only for some tasks; design the rest around human review proportionate to the consequences.

### Know how to interact

8. **Treat communication as a practice.** Rephrase and correct instead of seeking a perfect request. Name the observed difference, then ask for a new version that lets you check the correction.
9. **Provide useful knowledge.** Make sources findable at the right granularity. A short rule with its context is better than a whole folder loaded without distinction.
10. **Shape the way of working.** Describe expected steps, tools, checks, and decisions. An intent can then lead to the useful know-how and knowledge, loaded as needed, without turning the whole corpus into agents in advance.

### Avoid traps

11. **Do not confuse ease of asking with result quality.** Instant production often shifts effort to framing, source selection, and verification.
12. **Do not confuse fluency with accuracy.** Confident prose can contain an invented number, distorted citation, or decision incompatible with your constraints.
13. **Demand evidence for marketing claims.** Ask which component enforces each guarantee, under what conditions, and with what limits. No generative model abolishes hallucination, injection, or the need for external security by itself.

### Keep control

14. **Do not let the tool dictate the method.** Start from intent and the real work, then organize the necessary entry points. Do not divide expertise into agents merely because an interface presents the world that way. Definitions of skill, process, competence, agent, and assistant are in the [glossary](../reference/glossaire.md).
15. **Retain enough intuition to judge.** Periodically revisit part of the work in depth. If you can no longer explain the assumptions, recognize an order of magnitude, or defend the result, delegation has exceeded your ability to check it.
16. **Remain sovereign over your setup.** Know which files guide the work, which data is sent, and which components enforce the rules. Files are portable, but changing environments may require adapters, permissions, and tests.

## Three quick decisions

### Is AI the right choice?

First ask whether the task commits your distinctive identity or requires human experience. Then weigh the benefit against risks, costs, and alternatives. If AI remains appropriate, provide the sources, way of working, and expected check.

### Should you keep iterating?

Continue when important information is missing, a proposal still awaits confirmation, or an alert remains untreated. Move forward when the result has been compared with the relevant source or reality, not merely when it sounds convincing.

### Can you delegate more?

Look for an external check, low consequences, and independent steps. The more a task affects people, rights, amounts, or an overall view that is hard to reconstruct, the closer the human decision point should remain.

## Data and confidentiality

A model does not "understand" your confidentiality in the sense of an enforceable policy. A contract defines the provider's obligations, responsibilities, and remedies; it does not technically block a transmission. Only mechanisms actually placed on the data path, such as access control, an egress holdback, or a policy enforced by a connector, can prevent the operation. Before transmitting sensitive data, follow the canonical [Data protection](../trust/protection-des-donnees.md) page.

Access rights, rules, and classifications hold only in the component that enforces them. Direct reading or writing can bypass BASE mechanisms; [Security and limits](../trust/securite-et-limites.md) describes these boundaries.

## Next action

Take a recent AI output and add four lines: the goal, authoritative source, remaining uncertainty, and check performed. Do not deliver it while one of these lines remains empty for an important point.
