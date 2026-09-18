<!-- fr-synced: 8ee6caafceb6466ded87568ec582a64d1c2d583c -->
# Adoption in an organization

Durable adoption combines two movements. The field surfaces practices that work; the institution makes available the few common flows that deserve a framework, tools, and oversight. The team is where these movements meet.

## The foundation provided by the organization

Before scaling a use, the organization decides:

1. which models and data are authorized;
2. which tools can work with identified files and sources;
3. which calculations, connectors, and checks IT must provide.

Three responsibilities must remain separate. The business **defines the metric**, its sources, and its calculation rules. IT **implements the calculation** as a testable query or algorithm. The access system **allows or blocks the operation** at execution time. Connecting a database to a model fulfills none of these three responsibilities by itself.

File portability protects the method from complete lock-in, but changing vendors may require adapters, a new permission configuration, and tests. Hosting and compliance criteria are detailed in the [Swiss SME](../audiences/kit-demarrage-pme-suisse.md) and [organization](../audiences/kit-enterprise.md) kits.

## Tier 1: individual ownership

A person chooses a task they know, frames the result, provides sources, and checks the proposal. They keep a short record of what worked and the difficulties encountered.

Governance first concerns authorized data. Freedom to structure the work allows learning before standardization. [Co-thinking in practice](pratiques-co-pensee.md) gives the individual practice without repeating it here.

## Tier 2: promote an individual practice into a team method {#tier-2-team-promotion}

The team regularly reviews proven practices. It promotes those that meet a recurring need into a shared, readable, versioned way of working.

Each promoted element receives:

- an owner;
- authoritative sources;
- success criteria;
- a way to report friction;
- a review date or trigger.

Promoting too early freezes an intuition. Promoting too late multiplies reinvention. The [expertise lifecycle](cycle-de-vie-expertise.md) describes maintenance after promotion.

## Tier 3: institutional ownership of common flows

The institution targets a few flows that block many people or carry high risk. It chooses the level of assistance according to how verifiable the task is. An external check sometimes permits more automation; where none exists, a human decision proportionate to the risk remains necessary.

Governance becomes formal: identity management, access rights, classification, retention, audit, and compliance. BASE replaces neither IAM, SSO, RBAC, DLP, nor SIEM.

BASE write and egress controls apply only to paths mediated by the broker or an MCP server that provides the required context. A tool with direct filesystem, shell, or API access bypasses them. Canonical limits are in [Security and limits](../trust/securite-et-limites.md).

## Circulate corrections

A field practice can become shared; an institutional flow returns to the field to be tested. Frictions must reach the flow owner, then become a reviewed change, a new test, or a withdrawal.

The organization need not standardize every practice. It must know which remain personal, which are shared, and which bind the institution.

## Next action

Choose one recurring flow and record its current tier, owner, authoritative source, check, and next review date. Do not promote it while one of these essential elements is missing.
