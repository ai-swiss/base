<!-- fr-synced: d53317ea2708bb4f9f7fb93e61693eb8979c4b46 -->
# Accessibility: commitment and status

Before relying on BASE, a public institution needs to know what its accessibility is worth, and what it is not worth. This page sets out our accessibility commitment, the evidence we can show today, and the honest limits of that evidence. It does not amount to a formal declaration of conformance: for us, such a declaration remains a goal to reach, not a settled fact (see below).

This page is informational. It is neither legal advice nor a conformance audit. Each institution remains responsible for its own accessibility assessment, for any audit it conducts, and for its accessibility policy.

## Commitment

For the documentation site and for Studio, we aim for:

- the WCAG 2.1 Level AA standard;
- the Swiss eCH-0059 standard (accessibility of online services).

This commitment is a design target. It guides interface choices and review, but it does not mean that conformance has been reached or verified to date.

## An important distinction: mechanism and consigne

Throughout, BASE distinguishes what is enforced mechanically from what rests on a *consigne* (model-followed, so fallible) followed in good faith. Accessibility follows the same grid.

- Mechanism: an automated accessibility check runs in Studio's Playwright (end-to-end) test suite. It runs on every pass of the suite and fails if it detects serious or critical violations. It imposes a real constraint on Studio's interface, beyond a mere intention.
- Consigne: the WCAG 2.1 AA and eCH-0059 target, the care taken with page structure, contrast, and keyboard navigation, all rest on a design discipline. On their own, they are not a verified guarantee.

See also the [Security and limits](securite-et-limites.md) page, which sets out this same distinction for BASE's guardrails.

## The evidence we have

Studio includes an automated accessibility test (`tools/studio/ui/e2e/a11y.spec.ts`), integrated into the end-to-end suite. Concretely:

- it uses the `axe-core` engine via Playwright;
- it analyzes the criteria tagged `wcag2a` and `wcag2aa`;
- it covers Studio's main views (the navigation, the Evaluations view) as well as a modal drawer, also checking the behavior of hidden elements;
- it fails the build when a violation with `serious` or `critical` impact is detected, and the report details the node and the measured values to make the failure diagnosable.

This test is one of the end-to-end checks the project runs. Accessibility is thus part of the automated test net, rather than a one-off review quickly forgotten.

## The limit of this evidence

An automated check has a limited reach: here is what it covers and what escapes it.

- An automated check like `axe-core` covers only part of the WCAG criteria, on the order of a third according to common estimates for this tooling. It detects structural problems (missing attributes, insufficient contrast, incorrect roles), but it does not judge the relevance of alternative text, the logic of the reading order, the clarity of the language, or the real quality of a complex keyboard path.
- The current test focuses on Studio's main views. It does not yet cover, exhaustively, every screen, every error state, or the documentation site as a whole.
- No complete manual audit has been carried out to date. No assessment with assistive technologies (screen readers) or with people with disabilities has been formally conducted and documented.
- As a result, there is, to date, no formal declaration of WCAG 2.1 AA or eCH-0059 conformance for BASE.

In short: we have a useful and continuous automated signal, but it is not proof of conformance.

## Known status

Known to be good (verified by the automated test, on the covered views):

- no accessibility violation of serious or critical impact on the tested main views of Studio;
- hidden elements and modal drawers accounted for within the scope of the test;
- the check integrated into the end-to-end suite, and therefore re-run continuously.

Pending (not yet done, or not covered):

- a complete manual audit of the documentation site and of Studio;
- testing with screen readers and other assistive technologies;
- assessment with people with disabilities;
- automated coverage extended to all screens and states;
- a dedicated accessibility check of the editorial content (plain language, heading structure, alternative text);
- a formal declaration of conformance and a documented accessibility feedback procedure.

## The declaration of conformance is a goal

A formal declaration of conformance (in the sense of WCAG 2.1 AA or eCH-0059) presupposes a complete audit, including manual checks and testing with assistive technologies. That work is not finished. We therefore consider conformance a goal we are actively pursuing.

We prefer to announce a real automated check, with its limits, rather than display a conformance we could not back up.

## To report a problem

If you run into an accessibility barrier in the documentation site or in Studio, report it through the project's tracking channel (the repository's issue tracker). Precise feedback (the page concerned, the browser, the assistive technology used, the expected behavior) helps fix it faster and extend test coverage.
