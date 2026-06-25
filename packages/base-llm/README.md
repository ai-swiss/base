# @ai-swiss/base-llm

The **owned, provider-agnostic chat/tool-calling port** for BASE. BASE owns this small, stable seam; adapters serve it — so swapping a provider never ripples into the engine. Zero dependencies; uses the platform `fetch`.

## Why a port (and not a provider SDK)

Re-implementing a universal LLM client is a fool's errand, and depending wholesale on one would import its churn. So BASE applies the same pattern it uses for the `Ranker`: **own a narrow port, treat each powerful library as one adapter behind it, and keep a tiny owned fallback** so there is never lock-in.

- **Owned port** — `LanguageModel = { id, complete(request, ctx?) => Promise<Completion> }` with a normalized, provider-neutral message model. Tool `parameters` are **JSON Schema** (the BASE core already speaks it — no new schema dependency).
- **Owned fallback adapter** — `createOpenAICompatibleModel` implements the widely spoken `/chat/completions` *wire API*; many *providers* speak it, so it is implemented once and providers are config (baseUrl + auth + model). `createOllamaModel` is just that provider, locally.
- **`faux` test double** — `createFauxModel(...)` implements the same port with scripted replies, so the eval engine and its tests run deterministically, offline.
- A richer multi-provider adapter (e.g. pi-ai) can be wired behind the same port later without touching callers.

## Quick use

```js
import { createOpenAICompatibleModel, systemMessage, userMessage, getText } from "@ai-swiss/base-llm";

const model = createOpenAICompatibleModel({ model: "gpt-4o-mini", apiKey: process.env.OPENAI_API_KEY });
const { message } = await model.complete({
  messages: [systemMessage("Be terse."), userMessage("Bonjour")],
});
console.log(getText(message));
```

Tool-calling, typed errors (`.code`, `.retriable`), bounded retries with jitter, deadlines and abort are all handled in one tested transport layer (mirrors `@ai-swiss/base-ranker-semantic`). Choosing a model is always an explicit decision — there is no "default/best model" helper.
