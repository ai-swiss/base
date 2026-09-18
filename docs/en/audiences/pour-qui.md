<!-- fr-synced: 1c52d20e0939e6668ccea1584262a32c175bfc70 -->
# Finding your way to use BASE

Using AI without losing control of your context, your decisions, and your working memory: that is the challenge, whether you are a single person or an organization. This map also covers university and research teams, as well as AI engineers.

These situations share a common thread: a model does not spontaneously know your setting. It does not know what is true for you, what is sensitive, what must be checked, or how your work should be done.

A BASE folder lets you describe that context in readable, connected files.

## The diagnosis

AI adoption is often treated as a choice of tool: which model, which interface, which subscription. That is necessary, but not enough.

The deeper question is: what structure do you give to the collaboration?

Generative AI does not fit naturally into the usual categories of digital software. You can frame it with screens, buttons, agents, and permissions, but its real use also runs through language, context, examples, criteria, corrections, and work habits. It produces plausible behavior, not a guarantee. It often gives the impression of understanding the situation, but it does not know your local reality until you have structured it.

The proposed method therefore treats AI for what it is: a model can produce competent answers in some domains without knowing your reality or guaranteeing its result. It does not share your memory by default and relies on language that is often underspecified. Execution quality depends on the model, tools, projected context, permissions, and human checks.

Four objects must remain distinct:

- the **method** describes how to conduct the work, check results, and decide;
- the **BASE structure** connects the files that describe that method;
- the **approved reference** is the versioned state of those files at a given time;
- **execution** is what a model, tool, or integration actually does from that reference.

- What knowledge must be available?
- What processes must be followed?
- What data is useful now, and what should not be opened without a reason?
- What actions can be proposed by the AI, but validated by a human?
- What must be traced so you can resume, correct, and improve?

Without this structure, AI stays brilliant but amnesiac. It helps on occasion, then forces you to repeat, verify, correct, and rebuild the context every time.

## For a person in their private life

A structured folder can organize a personal memory for action: administrative procedures, family projects, non-medical health tracking, learning, trip planning, managing a move, organizing an event, keeping track of documents.

The goal is not to start from scratch every time, not to automate everything.

What the files and method provide:

- local files you can understand;
- readable files that you keep;
- simple workflows for your recurring tasks;
- simple markers that flag what is still pending and that the AI or a script can find again;
- a method for deciding when to use AI and when not to use it.

Point of attention:

The files may remain on your machine, but a tool connected to a remote model sends it the context the tool projects. The egress policy is permissive by default on mediated paths: mark confidential resources or the root `local-only`, and configure your tool. A sensitivity classification describes risk; it does not withhold content by itself. For highly sensitive information, choose a suitable environment or keep the model at arm's length.

## For a start-up

A start-up invents its practices fast: pitch, sales, client onboarding, support, recruiting, communication, reporting, product strategy. The risk is that everything stays in conversations, in people's heads, in Slack messages, and in improvised documents.

The team can turn what works into reusable resources.

What the files and method provide:

- workflows that capture the practices as they emerge;
- consistent document templates;
- a team memory before documentation becomes heavy;
- a way to distinguish draft, proposal, decision, and action;
- a portable base when tools change: tools come and go, the context stays.

Point of attention:

Measure the benefit on the chosen use case. Better structure may avoid repetition, but it makes neither the model reliable nor the work automatically faster.

## For an SME

An SME often has enough complexity to suffer from a lack of structure, but not enough resources to deploy a heavy platform. The information lives in folders, spreadsheets, emails, document templates, and sometimes in the heads of a few key people.

A folder of files controlled by the team offers an intermediate level: more explicit than an isolated prompt, without claiming to replace an enterprise platform.

To get started without overloading the team, use the [Swiss SME starter kit](kit-demarrage-pme-suisse.md). It helps set the minimal rules: what data can be entrusted to the AI tool, who validates, how to version simply, and when to run the upkeep.

What the files, router, and method provide:

- domain assistants ready to adapt;
- shared, verifiable processes;
- local validation before sharing;
- regular upkeep of links, markers, descriptions, and resources;
- a natural progression from the individual to the team.

Point of attention:

The files and router do not replace rights management, the privacy policy, or document governance. They provide a working structure that can be connected to those mechanisms.

## For a university or research team

A research team must connect questions, protocols, sources, hypotheses, decisions, and results without treating model output as evidence.

The useful route is to record the method and criteria in files, version an approved reference, then make the model cite the passages it actually opened. Researchers remain responsible for the protocol, interpretation, reproducibility, and data subject to ethical or contractual rules.

Point of attention:

A structured source remains a source, not scientific validation. Keep the corpus, work instructions, generated results, and people's decisions separate.

Start with [Structuring a knowledge corpus](../guides/structurer-un-corpus-de-connaissance.md).

## For an AI engineering team

AI engineers can use the structure as a readable contract between product, domain expertise, and integration: expected routes, authorized sources, evaluation scenarios, policies, and limits.

The useful route is to version the reference, test the router and mediated mechanisms, then measure each combination of model, tools, and context. The same reference can produce different executions.

Point of attention:

Use code for mechanical guarantees. An instruction to the model remains fallible, even when well written.

Start with [Your first evaluation](../tutoriel/praticien-7-premiere-evaluation.md).

## For a large enterprise

In a large enterprise, the challenge is to avoid having each team encode its processes in proprietary interfaces, scattered prompts, and configurations impossible to audit. Adding one more AI tool is not enough.

The BASE structure can serve as a shared language for resources, sources, connectors, policies, events, and adapters. The public core stays deliberately light; the organization's systems carry the additional controls.

What the structure and tools provide:

- a stable conceptual model for describing knowledge and workflows;
- a readable separation between instructions and content, useful for review and governance, but which does not prevent prompt injection by itself: the model may still interpret malicious content as an instruction;
- a path toward governed connectors, policies, and traces;
- a way to stay portable across harnesses and models;
- a basis for discussion across business lines, IT, security, compliance, and data.

Point of attention:

The public core is not a compliance platform. For enterprise use, add IAM, SSO, DLP, SIEM, retention, classification, legal review, and separation of environments. Also require the tool to disclose the context it projects to the model.

## Why this matters for society

A society that adopts AI solely through closed interfaces, proprietary agents, and scattered prompts risks losing control of its processes. It does not always know what guided the production, what was verified, what is reusable, or what remains under human responsibility.

Beyond the technical side, the risk is also cognitive and organizational. If every person has to remember which agent to use, which instructions were placed in which interface, which permissions were granted, and which context was forgotten, AI weighs the mental load down instead of lightening it. This is where a router, even a simple one, helps: it spares the user the trouble of hunting for the right process. Real progress consists in structuring the relationship: writing down what the system must know, bounding what it can do, and keeping the important decisions visible. Two requirements run through all of this over time: keeping enough intuition to remain able to verify, and keeping sovereignty over the setup that carries out the work.

The method supports another trajectory:

- write down the knowledge that matters;
- make processes explicit;
- keep decisions visible;
- use code for the guarantees that natural language cannot give;
- preserve the portability of the working context;
- let people and organizations progress without depending on a single platform.

This ambition stays modest in its promises and demanding in its method. The approach does not make AI infallible; it aims for collaboration that is more structured, verifiable, and durable.

## Your next action

- If you are a single person: copy an example and say what you want to set up or clarify, for instance "Hello, I would like to set up my business."
- If you are in a start-up: start with a repeatable workflow that costs you time every week.
- If you are an SME: choose a domain assistant, follow the Swiss SME starter kit, validate the files, then set up an upkeep ritual.
- If you work at a university or research institute: choose one non-sensitive protocol and describe its sources, criteria, and human validations.
- If you are an AI engineer: choose one critical route and write its expected result before comparing executions.
- If you are a large enterprise: read [Public framework](../reference/framework-public.md), [Specification v0](../reference/specification-v0.md), and [Implementation status](../reference/etat-implementation.md), then decide which controls should be added around the public core.
