<!-- fr-synced: 83854493f3532568c305224ae9af9b9f7fa007a5 -->
# Keeping your models sovereign, local or in Switzerland

Using a model with BASE should not mean handing your data to a provider outside your control. If that is your requirement, two concrete paths keep you in charge, fully local or hosted in Switzerland, with a guide for choosing based on the sensitivity of what you handle.

BASE's core never calls a model provider. In the default configuration, nothing leaves your machine. Running a model (for an evaluation, or to drive an assistant) is an **explicit choice**, and that choice can stay sovereign.

Two paths keep your data under your control:

- **Fully local** with Ollama: nothing leaves the machine.
- **Hosted in Switzerland** with Infomaniak: an OpenAI-compatible API, operated in Switzerland.

Neither is mandatory. BASE's default routing is entirely local and requires no model.

## Which model fits

BASE does not run with just any model, and it is worth saying so. A process needs a model that can use tools reliably (read a file, propose one, look up a resource, call a function) without inventing a call or a parameter, follow instructions with multiple constraints, produce structured output when needed, hold the thread across a few exchanges, and stick to the supplied data alone. What matters is not a single lucky run, but consistency over time. Several open models you can run locally clear this bar today, as examples and without aiming to be exhaustive: Qwen (Apache-2.0 licensed) or Google's Gemma family (under its own license), able to call functions and produce structured output, handle well-scoped processes. The landscape moves fast, and the criterion that matters is not the brand but consistency over time: calling tools without inventing a call, following several constraints at once, sticking to the supplied data. The most complex chains remain the advantage of large hosted models. The right choice depends on the process, not a slogan.

## Fully local: Ollama

Nothing leaves the machine. Ideal for an individual workstation, a demo, or an environment isolated from the network.

```js
import { createOllamaModel } from "@ai-swiss/base-llm";

const model = createOllamaModel({ model: "qwen3.5:9b-q4_K_M" });
```

To run a fully local evaluation (the model must be available in Ollama beforehand):

```bash
npm run eval -- --ollama --model qwen3.5:9b-q4_K_M
```

## Hosted in Switzerland: Infomaniak

Infomaniak offers open models through an **OpenAI-compatible** API, hosted in Switzerland. Depending on the provider you choose and its terms, your data can stay within a Swiss jurisdiction, with no dependence on a non-European provider.

The `base-llm` port already speaks the OpenAI-compatible API: supply Infomaniak's base URL, your key, and a model from their catalog.

```js
import { createOpenAICompatibleModel } from "@ai-swiss/base-llm";

const model = createOpenAICompatibleModel({
  model: "<modele du catalogue Infomaniak>",
  apiKey: process.env.INFOMANIAK_TOKEN,
  baseUrl: "https://api.infomaniak.com/1/ai/<PRODUCT_ID>/openai",
});
```

`<PRODUCT_ID>` is the identifier of your AI Tools product. You obtain it and choose your models from your Infomaniak workspace or their API (`GET /1/ai`). See the [Infomaniak documentation](https://www.infomaniak.com/fr/hebergement/ai-services).

For an evaluation through Infomaniak, supply the key via the environment and point to the base URL:

```bash
export OPENAI_API_KEY="$INFOMANIAK_TOKEN"
npm run eval -- --base-url "https://api.infomaniak.com/1/ai/<PRODUCT_ID>/openai" --model "<modele>"
```

## Choosing

| Need | Path |
|--------|--------|
| Maximum confidentiality, offline, individual workstation | Ollama (fully local) |
| Swiss sovereignty, larger models, team or institution | Infomaniak (hosted in Switzerland) |
| Evaluate the method with no model at all | Default routing, entirely local |

## Local or cloud, by data sensitivity

The right criterion is what you entrust to the model. This table gives a starting point; it is not legal advice, and for regulated cases the decision rests with your compliance officer.

| Data sensitivity | Reasonable options |
|-------------------------|----------------------|
| **Public** (published communications, site content) | Anything goes: a leading cloud model, Swiss hosting, or local, whatever you are comfortable with. |
| **Internal** (procedures, non-confidential project notes) | Swiss hosting or local; a non-European cloud only after reviewing its terms and its retention. |
| **Confidential** (clients, contracts, finances) | Local (Ollama), or Swiss hosting with written contractual guarantees. |
| **Personal or regulated** (HR, health, data subject to the nLPD or the GDPR) | Local first; otherwise an environment validated by your compliance team, or keep the AI out of the loop. |

A point these options often paper over: where the data resides is not who can, in law, reach it. A service "hosted in Switzerland" or "European cloud", but operated by a company under foreign control, remains subject to its parent's jurisdiction, the US CLOUD Act foremost among them, which reaches data "wherever it is stored". Sovereignty is read in the contract and in the operator's structure, not in the country of the data center. At high sensitivity, then, local remains the only option that rests on no one's trust.

The detail of the responsibilities that remain yours is in [Data protection](../trust/protection-des-donnees.md).

## What a small local model does well and badly

A model running on a good laptop is enough for a real share of the work, as long as you know where it stops.

What it does well:

- **Routing does without it.** BASE's default routing is lexical and requires no model. Rudimentary but effective, extensible through adapters, it spares the user the mental load of hunting for the right process and works the same way with or without a local model, small or large.
- **Drafting within a short process.** When the process supplies the structure, the rules, and the data, a small model produces an honest first draft.
- **Rephrasing.** Summarizing what it has understood, adjusting a tone, condensing a text: short, well-scoped tasks.

What it does badly:

- **Following a long process faithfully.** Beyond a hundred or so lines of instructions, a small model drops constraints along the way: it skips steps or forgets rules. Break processes up, or move to a larger model.
- **Calculating.** VAT, totals, margins: never ask the model for these results. Hand them to a deterministic tool (`base invoke`), which gives the same result on every run.

The `base eval` evaluation makes these limits visible rather than guessed: the judge role, in particular, often needs a stronger model than the one driving the assistant.

## The configuration tested in this repository

Two local configurations are actually used by the maintainers, as is:

- **`base eval` with Ollama and `qwen3.5:9b-q4_K_M`** for the simulated user and the judge; see [tools/eval/README.md](../../../tools/eval/README.md), including how to strengthen the judge with a larger model.
- **`nomic-embed-text` for local embeddings**: it is the default model of `createOllamaEmbedder()` in the `@ai-swiss/base-ranker-semantic` package, when a project enables the semantic ranker without sending anything off the machine.

In every case, the core stays the same text file you own. The model is a replaceable detail, not the place where your method lives.

## Going further

- [Sovereignty and trust](../trust/souverainete-et-confiance.md)
- [Data protection](../trust/protection-des-donnees.md)
- [Data security and routing](../trust/securite-donnees-routage.md)
- [Choosing an embeddings provider](choisir-provider-embeddings.md)

---

BASE is a framework by [AI Swiss](https://a-i.swiss). Use cases in partnership with [Innovaud](https://innovaud.ch).
