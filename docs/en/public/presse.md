<!-- fr-synced: 6ddf820f6a28ede9103eeefdfc14ee26b7ff0506 -->
# Press Kit

Producing text takes almost no effort anymore; staying in control of what you publish takes as much as ever. BASE proposes an open convention for describing a method of working with AI, accompanied by an open-source, local-first reference implementation backed by AI Swiss. This kit gathers the stable public materials.

## In one sentence

BASE (Build Assistants with Structured Expertise) is an **open convention** for describing a working method, its knowledge, and its controls in files you own, accompanied by an **open-source, local-first reference implementation** that inventories and validates this structure without promising the result of an execution.

## The problem

Generative AI has made production almost effortless. Verification, by contrast, stays expensive: for most real work, no automatic verifier exists, and it falls to the human to spot and fix the errors, and to judge whether an output truly serves their intent. Without structure, you delegate without understanding and produce without control. You end up dependent on a tool you do not own and deploying what you will not be able to maintain.

## The four objects

- The **method** is the way the work is conducted: steps, authoritative sources, rules, controls, and human decisions.
- The **BASE structure** describes this method and its relationships in Markdown files owned by the person or organization.
- The **reference** is the approved, versioned state of that method. The reference implementation can inventory it, validate its structure, and make it available to tools.
- The **execution** is what a model, tool, or integration actually does from that reference. It varies with the model, data, permissions, and integration.

The reference implementation distinguishes an *instruction*, followed fallibly by the model, from a mechanism enforced when the action goes through the CLI, BASE's mediation component (the broker), or the MCP server. It then provides decision points before mediated writes and certain sensitive actions: the proposal is shown, then validated. Its core runs on Node 18 or higher with no runtime dependencies, and has reproducible specifications and tests.

## What BASE is not

- Not a compliance platform: the convention and its reference implementation replace neither IAM, nor SSO, nor RBAC, nor DLP, nor legal archiving.
- Not a guarantee that a model's answers are accurate.
- Not a cloud service: the choice and hosting of the model remain outside the repository.

## Origin and governance

BASE was **created by Charles-Edouard Bardyn** (Chief Scientific Officer, VP, and cofounder of **[AI Swiss](https://a-i.swiss)**, an independent Swiss nonprofit association) and is today **maintained by a lead maintainer** under the stewardship of AI Swiss, and remains open to contribution and co-maintenance. [Innovaud](https://innovaud.ch), the innovation promotion agency of the canton of Vaud, is a project partner and helped seed the domain examples for SMEs. The convention and reference implementation form an **open commons**: their dual license (Apache-2.0 / CC BY 4.0) lets anyone fork, adapt, and reuse them. Together they provide a starting point for many projects, not a closed platform.

## License and availability

- Dual license: **Apache-2.0** for the code, **CC BY 4.0** for the content (see [License](../trust/licence.md)).
- [Public code on GitHub](https://github.com/ai-swiss/base) and [instructions for getting BASE](../start/obtenir-base.md).

## Quotes

Attributable quotes are not published in this repository. A dated quote or public statement must be confirmed by AI Swiss.

## Visuals and demo

The structure diagram is versioned with the [public visuals](assets/), under the CC BY 4.0 license, with the recommended attribution "BASE, by AI Swiss, https://a-i.swiss". The repository examples can be used to prepare a local demonstration, but the observed outputs and behavior depend on the chosen execution.

## Useful facts

- Intended audience: independents, SMEs, teams, institutions; designed first for a French-speaking Swiss audience, then international.
- Approach: local-first, sovereignty around the models, human verification.

Dates, milestones, and shareable figures should be verified at the time of publication.

## Press contact

To continue, send your media request through the [official AI Swiss channel](https://a-i.swiss), with the subject, deadline, outlet, desired language, and expected format.
