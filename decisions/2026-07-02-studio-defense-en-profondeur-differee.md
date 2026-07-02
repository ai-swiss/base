---
schema_version: base.resource.v1
id: decision-studio-defense-en-profondeur-differee
type: document
title: Studio defence-in-depth is layered, and two layers are deliberately deferred
description: The Studio's network defences stop at loopback bind + all-method cross-origin guard + UI dependency audit; a session token and a prebuilt static UI are named, deferred layers with explicit triggers.
scope: public
status: active
sensitivity: public
doc_role: decision
audience: [developer, maintainer]
learning_level: advanced
related: [decisions-index]
---

# Studio defence-in-depth is layered, and two layers are deliberately deferred

## Status

Accepted.

## Context

The Studio is an unauthenticated local web application over the broker. Its enforced defences
are: refuse any non-loopback bind unless `BASE_STUDIO_ALLOW_INSECURE_REMOTE=1`
(`remoteExposureError`), refuse cross-origin / DNS-rebinding requests on every method ahead of
routing (`crossOriginError`, FR-STUDIO-007), and a CI dependency audit on the UI package (the
repo's largest third-party tree). A pre-release review of the Studio's exposure surface flagged two more
layers: an optional loopback session token (multi-user hosts and containers share `localhost`,
so loopback alone is not identity), and shipping a prebuilt static UI served by the node:http
server (deleting the npm-install-plus-Vite first run, an unexecuted path in tests). The
project's bar for adding mechanisms is lean elegance: only the abstractions needed for the
long run, each carrying its spec and test.

## Decision

Keep the three enforced layers as the Studio's security surface today. Defer the session token
and the prebuilt UI as NAMED layers with explicit triggers, rather than half-building them:

- **Session token**: build when a supported deployment actually places several users on one
  host (the team/MCP path is the recommended multi-user surface today, and it has auth).
- **Prebuilt UI**: build when the first-run experience or the untested tarball launch path
  produces real field friction, or when the UI dependency tree makes dev-server installs a
  supply-chain concern CI cannot cover.

## Consequences

- The threat model stays honest and documented: `mecanismes-verifies.md` names what is
  enforced (and the override), nothing more.
- A shared-host operator has no per-user control on the Studio; the documented answer is the
  MCP server with auth, not the Studio.
- The `base studio` first run keeps the npm-install + Vite path, still only plan-tested.
- Whoever adds either layer must add its FR-STUDIO requirement and test in the same change.

## Alternatives considered

| Option | Verdict | Why |
|---|---|---|
| Build the session token now | Rejected | No supported multi-user Studio deployment exists to protect; a token without a keyholder story is ceremony. |
| Ship the prebuilt UI now | Rejected | Real work (build pipeline, static serving, cache headers) for a first-run path that has produced no field friction yet; the audit gate covers the supply-chain angle CI can cover today. |
| Do nothing and leave the layers unnamed | Rejected | An unnamed gap reads as an unknown one; a named deferral with triggers is reviewable and honest. |
