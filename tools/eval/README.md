# `base eval` — evaluate a BASE assistant with simulated users + an independent judge

**The idea, in one sentence:** a *simulated user* (an LLM) talks to your assistant through the **real
broker**; an *independent judge* (another LLM) scores the conversation against the scenario's goals.
You get a structured verdict per scenario — outcome · failure-mode · severity · evidence · fix-hint —
a report, and a Studio page to browse it all.

Three roles, three models (they can differ): **SUT** (the assistant under test) · **runner** (the
simulated user) · **judge** (the evaluator). The engine is deterministic and fully tested; this CLI
just wires real models to a real process.

**The judge is itself a fallible model.** Read its verdict as a *signal to verify*, not proof — the
judge model's evidence-cited reading of the transcript, never established truth. The engine that runs
and records the verdict is deterministic; the judgement inside it is not. That is why every verdict
carries its cited turns and quotes: so you can check it, not take it on faith.

## Quickstart (3 steps)

**1 — Start a model.** Local and free, with [Ollama](https://ollama.com):

```bash
ollama serve            # or just open the Ollama app
ollama pull qwen3.5:9b-q4_K_M    # any model works; `ollama list` shows what you have
```

**2 — Run the sample evaluation** (two scenarios ship with the devis example):

```bash
npm run eval -- \
  --root exemples/assistant-devis \
  --agent assistant-devis --process nouveau-devis \
  --scenarios exemples/assistant-devis/.ai/experiments/scenarios/ \
  --ollama --model qwen3.5:9b-q4_K_M --json-mode
```

It **preflights** the provider + model first (so if Ollama is down or the model isn't pulled, it
tells you the exact fix *before* running), then runs each scenario and prints PASS/fail + a report.
Results persist under `<root>/.ai/experiments/`.

**3 — Browse the results in Studio:**

```bash
cd tools/studio/ui && npm install     # first time only
cd ../../.. && npm run studio -- exemples/assistant-devis
```

Open http://127.0.0.1:5174 → **Évaluations**: pass rate, failure-mode histogram, and every run's
verdict + transcript (including the tool calls the assistant made against the broker).

## Trustworthy verdicts: judge with a stronger model

The **judge** is the role most sensitive to model quality — a small local model often can't emit a
strict structured verdict. Two ways to strengthen it:

```bash
# A) stay fully local, judge with a bigger model you've pulled
npm run eval -- --root exemples/assistant-devis --agent assistant-devis --process nouveau-devis \
  --scenarios exemples/assistant-devis/.ai/experiments/scenarios/ \
  --ollama --model qwen3.5:9b-q4_K_M --evaluator-model qwen2.5:14b --json-mode

# B) run the assistant locally, judge on a capable API model (needs OPENAI_API_KEY)
OPENAI_API_KEY=sk-... npm run eval -- --root exemples/assistant-devis --agent assistant-devis \
  --process nouveau-devis --scenarios exemples/assistant-devis/.ai/experiments/scenarios/ \
  --ollama --model qwen3.5:9b-q4_K_M --evaluator-openai --evaluator-model gpt-4o-mini --json-mode
```

`--json-mode` asks the provider for a guaranteed JSON object (Ollama + OpenAI), which sharply cuts
"non-JSON" error runs.

## Layout

```
<root>/.ai/experiments/
  scenarios/*.json   # specs you author + commit  ({ id, seedInput, goals, persona? } or an array)
  runs/*.json        # per-scenario results (gitignored, derived)
  reports/*.json     # aggregated reports (gitignored, derived)
```

## Flags

| Flag | Meaning |
|---|---|
| `--root` `--agent` `--process` | the BASE root + the agent/process under test (required) |
| `--scenarios <file\|dir>` | a scenario file, or a folder of `*.json` (runs them all) (required) |
| `--ollama` | run on a local Ollama (else OpenAI-compatible; needs `OPENAI_API_KEY`) |
| `--model <name>` | default model for all three roles |
| `--base-url <url>` | override the provider endpoint (remote Ollama, internal gateway) |
| `--runner-model <name>` | model for the simulated user (defaults to `--model`) |
| `--evaluator-model <name>` | model for the judge (defaults to `--model`) |
| `--evaluator-openai` | run the judge on OpenAI-compatible even when `--ollama` runs the SUT |
| `--evaluator-base-url <url>` | endpoint for the judge's provider |
| `--json-mode` | request `response_format: json_object` for the runner + judge |
| `--no-preflight` | skip the provider/model reachability check |
| `--maxTurns <n>` | conversation turn budget (default 6) |

Models come from the environment; this CLI is intentionally outside the offline test suite (it needs
a real provider), but it drives the exact engine the deterministic tests cover.

## La panoplie du modèle évalué (sans terminal, par doctrine)

Le SUT reçoit la **surface MCP de production**, jamais un shell : `route_request`,
`discover_resources` (le ranker, avec ses raisons), `open_resource` (un chemin introuvable répond
par une erreur réparatrice `did_you_mean` — les 3 plus proches correspondances), `propose_change`
et `commit_change` (refusé par le seam de médiation : proposer et s'arrêter, c'est la discipline
sous test). Un test d'isomorphisme compare noms et paramètres des deux surfaces. Un shell (grep,
find) testerait un système qui n'existe pas : l'assistant réel n'a pas de terminal via BASE.

L'exécution de code est une **capacité de l'hôte** (Cursor, Claude Code…), pas un outil BASE :
quand un process l'exige, le SUT appelle `report_limitation({ tool: "code_execution", step })`
et poursuit. Les déclarations s'agrègent dans `limitations` des métadonnées du run ; le juge les
classe comme une dépendance du process, pas une faute du modèle — et pénalise toute exécution
prétendue sans tool call.

## Le context pack (pré-charger le déclaré, outiller le découvert)

Au lancement d'un run, les références que le process déclare (liens Markdown, chemins inline) sont
résolues — chemin exact → dossier (README) → ranker (annoté «≈») — et injectées dans la consigne
système sous un budget de tokens ; le reste demeure accessible par les outils, et une référence
morte est signalée donc visible du juge. Le pack résumé figure dans la trace de chaque run, et le
contrôle d'égress en retire ce qui ne doit pas partir vers un modèle distant — en le disant.

## `origin` : terrain et simulation ne se mélangent jamais

Chaque run du harness porte `origin: "simulation"` (plus `process`, `model`, `at`, `turns`). Les
signaux du terrain (frictions `report_friction`, abstentions du routeur) portent `origin:
"terrain"` par construction et vivent sous `.ai/feedback/`. Les compteurs ne s'additionnent
jamais : un taux de réussite qui mélangerait scénarios synthétiques et plaintes réelles ne voudrait
rien dire.
