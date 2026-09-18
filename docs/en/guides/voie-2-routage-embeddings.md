<!-- fr-synced: 70c84f83a0192b21996ccfbde1e965f2cd1fa6ef -->
# Track 2, embedding-based routing (optional, for scale)

BASE routes in two ways, and configuration is what decides. Track 1 is the default setting and is enough
for most BASE roots. Track 2 is a convenience reserved for large catalogs. You only need it if you have
chosen it.

## The two tracks, in one sentence each

- **Track 1 (default, already active).** The assistant reads the generated index and chooses; a
  lexical keyword floor serves as an offline safety net. The strategy itself requires no model;
  rankers added in `base.config` may nevertheless use their own provider.
- **Track 2 (optional).** Embeddings bring back the few candidates closest to the request, then a small
  model reads them and decides: it chooses, or asks for clarification. Both models may be local or
  remote, depending on the configured providers.

The two tracks are independent: Track 2 is not a layer set on top of Track 1, but another track that the
configuration selects. A configurable ranker orders candidates within Track 1; it never activates
Track 2, even when it uses embeddings.

## Do you need it?

The trigger is **not catalog size**: on synthetic corpora of 15, 150, and 600 processes, lexical
routing handles requests that share the vocabulary of the `use_when` at every scale. What it misses,
at any scale, are **rephrasings** with no word in common, such as "I want an offer" when the process
says "quote". These abstentions may be recorded in `.ai/feedback/abstentions.jsonl` on paths that
write that journal.

Start by adding a recurring rephrasing to the target process's `routing.examples`. Consider Track 2
when paraphrase-shaped abstentions persist across many processes despite good examples.

## The installation is essentially "just Ollama"

The promise is simple. Here is how to go about it:

1. Install **Ollama** (the application that runs models locally).
2. Download **two models**: an embedding model and a small refiner model.
3. Enter both, one and the other, in the Studio **Settings** page, the "Routing / Track 2" section (or
   directly in the configuration file).

**Local, sovereign, no cloud, no API key.** Everything stays on your machine. An OpenAI-compatible hosted
provider remains possible for anyone who wishes, but the default scenario is *Ollama alone*.

Track 2 activates only when **both** models are entered. A single one changes nothing, and BASE stays on
Track 1. And if a model becomes unreachable, BASE falls back to Track 1 on its own: never a block, never a
silence.

With Track 2 active, `base route-test` still checks the lexical strategy by default. To replay the
path actually used by `base route`, explicitly run `base route-test --strategy production`; this run
calls the configured models and is not a deterministic CI gate.

## Which models should you choose? (you are free)

BASE imposes no model on you. As an **illustrative, non-prescriptive** example, two lightweight local
models are enough for a good demonstration: `qwen3-embedding:0.6b` for the embedding (multilingual, which
helps, since BASE is French-speaking) and `qwen3:4b` for the refiner (a small instruct model). These are
examples, not a fixed recommendation: choose your own if you prefer, for instance a long-context embedding,
or a refiner from another family.

The ecosystem evolves fast. Rather than holding on to versions, **check the currently recommended models**
in the Ollama documentation, and verify the exact tag when you download. For the criteria for choosing an
embeddings provider (local, cloud, gateway, internal), see
[Choosing your embeddings provider](choisir-provider-embeddings.md). For running models while staying
sovereign, see [Sovereign models](modeles-souverains.md).

Do not chase the "best" small refiner by points of percentage. What the routing eval honestly measures is
a **structural signal** (do the embeddings surface the right candidate?), and not a model's performance:
the final choice, or the request for clarification, falls to **your own AI**, far stronger than any small
local model. The local refiner is only a safety net to hold up at scale, with Studio closed. So there is
no point tuning your prompts or your structure to inflate a small model's score.

## Getting walked through it step by step

The simplest path is to ask your assistant for it: **"activate Track 2"**. The `activer-voie2` process
guides you in order: confirm the need is real, install Ollama by following its up-to-date official
documentation, choose and download the two models, then enter them in Settings. It shows each command
before running it, and freezes no version.

## Where the settings live

In the Studio, the "Routing / Track 2" section of Settings exposes the two models and the number of
candidates submitted to the refiner (a count, not a threshold to tune; the default value is fine). Outside
the Studio, the same values reside in the `routing` block of the `.ai/studio.settings.json` file
(`embedding_model`, `refiner_model`, and optional `k`). The all-or-nothing rule is checked on write: both
models, or none.

For the fuller setup of routing (zero config, embedding ranker, reading the scores), see
[Setting up semantic routing](routage-semantique-quickstart.md).
