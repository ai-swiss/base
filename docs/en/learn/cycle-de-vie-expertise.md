<!-- fr-synced: c1d58ba07f0080e7ce4a719abf7e7bec598cd060 -->
# Keeping an expertise alive after deployment

"And after deployment?" That is the question decision-makers ask, and it is the right one. This page is for the leaders who deploy an assistant and want to know how it holds up over time. An assistant is not a project that ends: it is an expertise that lives. BASE provides tooling for every stage of that life, from the first document imported to aging under watch. Here is the full loop.

```
  import ──> edit ──> evaluate ──> run (at the host)
     ▲                                   │
     │                                   ▼
  doctor <── age <── govern <── field feedback
  (health)   (status,  egress     (frictions,
             validity) (models)    abstentions)
```

## 1. Import what already exists

You rarely start from a blank page. The process [`importer-l-existant`](../../../.ai/agents/createur-agent/skills/processes/importer-l-existant/SKILL.md)
(shipped with BASE, attached to the assistant creator) explores your documents (manuals, wikis,
checklists) and **proposes** converting them into processes, competences, documents, and templates.
Every write goes through the propose then commit gate: you approve each diff.

## 2. Edit, with a co-thinker

In [BASE Studio](../../../tools/studio/ui/README.md), your files open as editable cards;
the editing chat thinks **with** you on the document in front of you, never in your
place somewhere else. Each suggestion from the model arrives as a diff; you apply or reject it. Debt
most often starts with a few paragraphs no one reviewed: here, everything stays visible.

## 3. Evaluate, on the real surface

The evaluation harness ([`tools/eval`](../../../tools/eval/README.md)) gives the model under test the
**same tools as production** (MCP): read, search, route, propose, never a terminal.
A simulated user runs your scenarios, an independent judge scores the conversation, and what the
process declares (links, rubrics) is preloaded into context under budget. A step that would require
running code is **declared** (`report_limitation`) instead of being simulated. Evaluation comes
into its own at scale: all of BASE keeps a base of processes written and managed by
people, but a few processes are **promoted and institutionalized**, and those are the ones to
keep under evaluation.

## 4. Run, at the host

The assistant runs in an AI tool able to read your files (for example GitHub Copilot, Antigravity, Claude Code or Cowork, OpenCode, Kilo Code), or any MCP host, with the BASE broker
as mediator: confinement to the root, write gate, local trace. Running code remains
a capability of the host; BASE never simulates it.

## 5. Feedback from the field

The loop does not stop at deployment. A **friction** ("the rubric cited is no longer the right one")
is recorded in one sentence: MCP tool `report_friction`, or simply "that didn't work," which
routes to the process [`signaler-une-friction`](../../../.ai/agents/concierge-base/skills/processes/signaler-une-friction/SKILL.md).
Every **router abstention** (a request no agent covers) logs itself. Studio presents both as a work
stack: a friction is a pending process amendment;
an unserved request that keeps coming back is a process to create.

## 6. Age under watch

A domain corpus rots silently. Two lifecycle fields (`status`, `review_by`),
two validity dates (`valid_from`, `valid_until`): the router ignores deprecated
resources, the context announces "expired since ...," and [`base doctor`](../reference/framework-public.md)
surfaces what is about to break: dead links, orphaned resources, stale evaluations, overdue reviews,
open frictions, each with its fix to follow.

## 7. Govern every outbound to a model

Before a single byte goes to a model, one rule is checked: a `confidential` resource,
or an entire `local-only` root, **never** leaves for a remote provider, and the
refusal is stated, on screen and in the trace. See [Data protection](../trust/protection-des-donnees.md)
and [the evidence](../trust/evidence.md).

---

The entire loop lives in files you own. Importing it amounts to copying a
folder, auditing it is done with `base doctor`, and leaving it means walking away with your files.
