<!-- fr-synced: a8bce2a7a3623ed3b3305153551c66f10f80b442 -->
# Writing for the router

When a request like "Draft a quote for Dupont SA" fails to reach the right process, your assistant stays silent or answers beside the point: it all comes down to how your files are worded. This guide is for assistant builders. It explains how the router reads your files, how to write with it in mind, and how to make sure your requests arrive where they should. No technical skill is required, apart from one terminal command for testing.

## How the router reads your files

Your `use_when` serves two readers. In an AI tool, the model reads it and grasps its meaning; the deterministic floor, for its part, does not grasp meaning and **compares words**. Writing for the floor, the more literal of the two, also satisfies the model. For each process, the floor assembles a routing text from the `use_when` (the strongest signal), supplemented by the `routing.examples`; lacking those, it leans on the description, then the title, then the keywords. A request routes well when its words overlap that text. In practice, your `use_when` should above all echo **the words your users would use**, rather than an elegant turn of phrase.

## Correcting a wrong route: writing a good `use_when` {#writing-a-good-use-when}

Write the `use_when` from the user's point of view, not your own. Internal jargon ("sales-cycle management") routes nothing if no one types it; concrete words ("quote", "price", "offer"), by contrast, do route.

Before, a `use_when` that is too weak:

```yaml
use_when: Gestion des propositions commerciales et du cycle de vente.
```

After, a solid `use_when`:

```yaml
use_when: Quand un client demande un devis, un prix ou une offre chiffrée.
routing:
  examples:
    - Prépare un devis pour Dupont SA, 3 jours de conseil
    - Combien ça coûterait pour ce projet ?
    - Il me faut une offre avant vendredi
  avoid_when:
    - Relancer une facture impayée.
```

## The language of your `use_when`

The lexical floor compares words, not meaning: facing a request in a language other than your
`use_when`, it abstains rather than guessing. In an AI tool that reads your files, the model chooses
from the map and may interpret other languages, with no guarantee of an identical result. For calls
where the lexical floor decides alone, notably `base route` without Track 2 and `route-test` by
default, write your `use_when` and `routing.examples` in the languages your users actually use: a
bilingual team includes both phrasings, and abstention goes back to being what it should be, the
signal of an off-topic request rather than a missing language.

## Giving varied examples

The `routing.examples` are phrasings just as your users would put them. Give at least three for a single intent, with distinct words: a direct phrasing, a question, then a request voiced under time pressure. The router then recovers the intent more often, including when the request picks up the words of an example rather than yours.

One hygiene rule for those examples and for your `keywords`: function words carry nothing. "I would like", "can you", "please" appear in every request, so they separate no process. Keep the words of the work, the ones another process does not contain.

## Ruling out neighboring requests

`routing.avoid_when` catalogs the counterexamples: neighboring requests that should land elsewhere. If "chasing an invoice" falls under another process, declaring it here cancels the wrong candidate's score, rather than letting two processes fight over the request.

Write each counterexample with the words of the case it rules out, never with your own. The veto zeroes the score: a line "not for onboarding a person, the onboarding procedure describes it", in a process whose own examples already speak of onboarding and procedure, takes away from that process the requests it serves. `base validate` names this case, the shared words, and the phrasing it discards.

## Checking that it routes

```bash
node tools/base.mjs route "il me faut une offre pour un client" --root <dossier>
```

Read the result: the process retained, the score, and the reasons (`route:<terme>` flags the words that matched). If the router abstains or hesitates, the reasons tell you why: most often, a word is missing from your `use_when` or your examples. Add `--json` for the full detail.

## Regenerating the routing index

Your AI tool orients itself first by a generated map, `.ai/routing/index.md` (plus one index per agent), which lists every process with its "When to use it" and "Avoid if". That map does not update itself: after adding, removing, or rewording a process, regenerate it:

```bash
node tools/base.mjs build routing-index --write --root <dossier>
```

Without this step, the new process stays invisible to progressive routing (the index still describes the previous state), even though `base route` already finds it. The generated file carries a "Do not edit" header: the truth lives in your `use_when`; the index is only its projection.

## Locking in the behavior

Once the routes are correct, record them in `.ai/routing/route-tests.json`: each entry ties a request to its expected route. Then:

```bash
node tools/base.mjs route-test --root <dossier>
```

By default, the command replays the available fixtures and `routing.examples` with the lexical
strategy and the rankers from `base.config`. It fails if a written case no longer returns the
expected status, agent, or process. It proves neither every possible phrasing nor the choice of a
model reading the index.

If `.ai/studio.settings.json` configures both Track 2 models, `base route` uses the `embedding`
strategy. Check that path separately, knowing that it calls the models and is not a deterministic CI
gate:

```bash
node tools/base.mjs route-test --strategy production --root <folder>
```

## An honest limit

The default run measures the lexical-strategy path. With no external ranker, this floor serves
callers with no model and provides a reproducible check. A ranker wired through `base.config` is part
of this run; if it calls an embeddings provider, reproducibility depends on that provider. In a
conversation the map is the index, and the model routes.

The lexical floor is rudimentary but effective; it stays sensitive to wording, because absent words match nothing, however close the meaning. That's the price of explainability: every score is justified by inspectable reasons, with no network and no dependency. Adapters, moreover, let you extend it. For tricky corpora (many close processes, highly varied vocabulary), an optional semantic ranker exists: see the [Semantic routing quickstart](routage-semantique-quickstart.md).

---

BASE is a framework by [AI Swiss](https://a-i.swiss). Use case in partnership with [Innovaud](https://innovaud.ch).
