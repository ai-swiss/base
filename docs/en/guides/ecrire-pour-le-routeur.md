<!-- fr-synced: 159cbca5a4dfa4be9744b7ff26d5b1eb3401d7d9 -->
# Writing for the router

When a request like "Draft a quote for Dupont SA" fails to reach the right process, your assistant stays silent or answers beside the point: it all comes down to how your files are worded. This guide is for assistant builders. It explains how the router reads your files, how to write with it in mind, and how to make sure your requests arrive where they should. No technical skill is required, apart from one terminal command for testing.

## How the router reads your files

The router doesn't grasp the meaning of your text: it **compares words**. For each process, it assembles a routing text from the `use_when` (the strongest signal), supplemented by the `routing.examples`; lacking those, it leans on the description, then the title, then the keywords. A request routes well when its words overlap that text. In practice, your `use_when` should above all echo **the words your users would use**, rather than an elegant turn of phrase.

## Writing a good `use_when`

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

## Giving varied examples

The `routing.examples` are phrasings just as your users would put them. Give at least three for a single intent, with distinct words: a direct phrasing, a question, then a request voiced under time pressure. The router then recovers the intent more often, including when the request picks up the words of an example rather than yours.

## Ruling out neighboring requests

`routing.avoid_when` catalogs the counterexamples: neighboring requests that should land elsewhere. If "chasing an invoice" falls under another process, declaring it here cancels the wrong candidate's score, rather than letting two processes fight over the request.

## Checking that it routes

```bash
node tools/base.mjs route "il me faut une offre pour un client" --root <dossier>
```

Read the result: the process retained, the score, and the reasons (`route:<terme>` flags the words that matched). If the router abstains or hesitates, the reasons tell you why: most often, a word is missing from your `use_when` or your examples. Add `--json` for the full detail.

## Locking in the behavior

Once the routes are correct, record them in `.ai/routing/route-tests.json`: each entry ties a request to its expected route. Then:

```bash
node tools/base.mjs route-test --root <dossier>
```

The command replays every route and fails the moment any one of them gives way. Your essential routes are thus shielded from regressions, even as the assistant grows richer.

## An honest limit

The default lexical router is rudimentary but effective; it stays sensitive to wording, because absent words match nothing, however close the meaning. That's the price of explainability: every score is justified by inspectable reasons, with no network and no dependency. Adapters, moreover, let you extend it. For tricky corpora (many close processes, highly varied vocabulary), an optional semantic ranker exists: see the [Semantic routing quickstart](routage-semantique-quickstart.md).

---

BASE is a framework by [AI Swiss](https://a-i.swiss). Use case in partnership with [Innovaud](https://innovaud.ch).
