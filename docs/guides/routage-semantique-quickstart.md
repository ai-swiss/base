---
schema_version: base.resource.v1
id: routage-semantique-quickstart
type: document
title: Mettre en place le routage sémantique, du zéro config aux embeddings réels
description: Distinguer les deux stratégies de routage de BASE des rankers configurables, puis choisir le classement lexical, hybride ou par embeddings adapté au projet.
scope: public
status: active
sensitivity: public
keywords: [routage, semantique, quickstart, embeddings, ollama, openai, provider]
---

# Mettre en place le routage sémantique, du zéro config aux embeddings réels

Dès l'installation de BASE, les demandes doivent atteindre le bon agent et le bon process sans
configuration initiale, puis gagner en qualité le jour où le besoin s'en fait sentir: c'est ce que
vous réglez ici. BASE route une demande, ou s'abstient honnêtement quand rien ne convient.

Deux réglages distincts ne doivent pas être confondus:

- la **stratégie de routage** choisit le chemin complet. La stratégie `lexical` (Voie 1) est celle par
  défaut. La stratégie `embedding` (Voie 2), activée quand `.ai/studio.settings.json` nomme à la fois
  un modèle d'embedding et un raffineur, retrouve quelques candidats puis demande au raffineur de
  choisir ou de demander une précision;
- les **rankers configurables** de `base.config` ne sélectionnent pas une stratégie. Ils ajoutent des
  scores au classement de la Voie 1 et à la recherche. Un ranker peut lui-même utiliser des embeddings
  sans activer la Voie 2.

Voir [Voie 2, le routage par embeddings](voie-2-routage-embeddings.md) pour la stratégie `embedding`.
La présente page montre surtout comment régler les rankers de la Voie 1. Un ranker classe les
candidats; la stratégie de routage produit la décision. Commencez sans extension et n'ajoutez un
ranker ou la Voie 2 que si vos cas réels le justifient.

Le routage BASE choisit le workflow primaire, non toutes les ressources possibles. La chaîne complète
est la suivante: choisir un agent, router vers un process, puis ouvrir les compétences, tools, templates,
documents ou données dont ce process a besoin. Pour la doctrine complète, voir
[`docs/reference/routage-process-et-ressources.md`](../reference/routage-process-et-ressources.md).

## Atteindre le bon agent (le plus simple d'abord)

Avant la *qualité* du classement (les «chemins» ci-dessous), voici comment l'assistant parvient au
bon agent, du plus simple au plus automatique:

- **Manuel, zéro outil.** Si vous savez quel agent vous voulez, pointez directement son `AGENT.md`:
  c'est le seul fichier à charger. «Lis `exemples/assistant-devis/.ai/agents/assistant-devis/AGENT.md`»
  suffit (chemin relatif au dépôt; dans un projet d'assistant, ce n'est rien d'autre que `.ai/agents/<agent>/AGENT.md`).
  Aucun routage, aucune installation.
- **CLI.** `base route "<demande>" --root <projet>` exécute la stratégie de production configurée et
  s'abstient honnêtement si rien ne convient.
- **MCP.** L'outil `route_request` expose ce même routeur à un outil IA capable de lire vos fichiers
 .
  Pour le brancher, suivez le process `activer-routage`.

Le routage CLI/MCP sert surtout lorsque plusieurs process ou agents peuvent répondre. Sans modèle ni
ranker externe, la Voie 1 est déterministe. Un ranker à embeddings rend son classement dépendant du
fournisseur; la Voie 2 ajoute en plus un raffineur. Les deux chemins conservent les mêmes statuts de
décision, mais leur résultat n'est pas pour autant identique ni reproductible. Pour un seul assistant
simple, le chargement manuel suffit.

Les options ci-dessous traitent de la qualité du classement au sein de la Voie 1. Elles sont
indépendantes de la stratégie Voie 2.

## Classement par défaut: zéro configuration

Écrivez des agents et des process en Markdown, avec un `use_when` par process. BASE route grâce à son
cœur zéro-dépendance: lexical + `semanticHybridRanker` (token overlap, alias par sous-ensemble de
tokens, similarité floue), abstention structurée, fixtures de routage, MCP.

```bash
node tools/base.mjs route "le client conteste sa facture" --root exemples/routage-pme
node tools/base.mjs route-test --root exemples/routage-pme   # rejoue les routes attendues
```

Idéal pour une personne seule, une petite équipe, une démo, un premier déploiement. Voir l'exemple
[`exemples/routage-pme`](../../exemples/routage-pme/README.md).

### Renforcer sans dépendance: `semanticHybrid`

Dans `base.config.json`, déclarez des alias (synonymes métier), toujours sans la moindre dépendance:

```json
{
  "rankers": [
    { "type": "semanticHybrid", "aliases": { "proposition": ["offre commerciale", "devis"] } }
  ]
}
```

La règle est simple: réservez `base.config.json` aux options déclaratives (`semanticHybrid`, seuils,
validateurs), et `base.config.mjs` aux cas où vous devez importer du code, par exemple un fournisseur
d'embeddings. Si les deux coexistent, BASE préfère le JSON déclaratif; ne gardez donc qu'un seul format
par projet dès lors que vous activez des embeddings réels.

## Ranker optionnel: embeddings réels

Installez `@ai-swiss/base-ranker-semantic`, choisissez un fournisseur, ajoutez un ranker dans
`base.config.mjs` (config exécutable, car un ranker est du code). Le cœur, lui, ne gagne aucune
dépendance modèle ou cloud.

```bash
npm install @ai-swiss/base-ranker-semantic
```

Dans le monorepo BASE, pour contribuer en local, le package vit dans
`packages/base-ranker-semantic/`.

```js
// base.config.mjs : endpoint OpenAI-compatible (OpenAI, Azure-like, gateway interne)
import { createOpenAICompatibleEmbedder, createSemanticRanker } from "@ai-swiss/base-ranker-semantic";

const embed = createOpenAICompatibleEmbedder({
  model: "text-embedding-3-small",
  // baseUrl: "https://gateway.interne/v1",  // un gateway d'entreprise
  timeoutMs: 10_000,
  retries: 2,
});

export default { rankers: [createSemanticRanker({ embed, minSimilarity: 0.25 })] };
```

```js
// base.config.mjs : Ollama, tout reste en local
import { createOllamaEmbedder, createSemanticRanker } from "@ai-swiss/base-ranker-semantic";
export default { rankers: [createSemanticRanker({ embed: createOllamaEmbedder() })] };
```

```js
// base.config.mjs : n'importe quel provider, ou des vecteurs pré-calculés (aucun texte ressource envoyé)
import { createSemanticRanker } from "@ai-swiss/base-ranker-semantic";
import { vectorFor } from "@ai-swiss/base-index-local";
export default {
  rankers: [createSemanticRanker({
    embed: async (textOrTexts, ctx) => monModele.embed(textOrTexts, { signal: ctx?.signal }),
    getResourceEmbedding: (r) => vectorFor(index, r),
  })],
};
```

Le package est robuste par défaut face aux appels provider: il gère les timeouts, l'`AbortSignal`, des
retries bornés (transitoires seulement) et des erreurs typées. Pour regrouper de nombreux appels
concurrents, enveloppez le provider dans `createBatchingEmbedder`. Détails:
[`packages/base-ranker-semantic/README.md`](../../packages/base-ranker-semantic/README.md) et
[la page provider](choisir-provider-embeddings.md).

## Index local optionnel

Quand le corpus s'étoffe, dérivez un index local supprimable avec `@ai-swiss/base-index-local`.
Le modèle utilisateur reste le même, sans catalogue à tenir à la main, et les statuts de routage par
défaut ne bougent pas. Voir [Comprendre l'échelle](../learn/comprendre-echelle.md).

## Lancer les fixtures

`.ai/routing/route-tests.json` liste des demandes et la route attendue (statut, agent, process).
Par défaut, `route-test` rejoue les fixtures et les `routing.examples` disponibles avec la stratégie
lexicale et les rankers de `base.config`. Il vérifie ces cas écrits, pas toutes les formulations
possibles, ni la décision d'un modèle qui lit l'index:

```bash
node tools/base.mjs route-test --root <projet>          # sortie lisible, exit ≠ 0 si une route casse
```

Si les deux modèles de la Voie 2 sont configurés, `base route` prend la stratégie `embedding`.
Rejouez alors volontairement le chemin réel:

```bash
node tools/base.mjs route-test --strategy production --root <projet>
```

Cette seconde commande appelle les modèles configurés. Elle vérifie le chemin de production pendant
ce run; elle n'est ni déterministe ni destinée au contrôle reproductible de CI. De même, un ranker
externe branché dans `base.config` peut rendre le run lexical dépendant de son fournisseur.

## Lire les raisons de score

`route --json` rend chaque composante de score explicite, avec des raisons consultables plutôt qu'un
score de confiance opaque.

```bash
node tools/base.mjs route "panne au login" --root exemples/routage-pme --json
```

| Raison | Signifie |
|---|---|
| `route:<terme>` | le terme a matché le `route_text` (signal de routage le plus fort) |
| `route_text:use_when` | le `route_text` vient du `use_when` (signal voulu); `:title`/`:path` = signal faible |
| `route_avoid:<terme>` | un `routing.avoid_when` a matché: le score est **annulé** (contre-exemple) |
| `semantic:alias:*`, `semantic:fuzzy:*` | apport du `semanticHybridRanker` zéro-dépendance |
| `semantic:embedding:<sim>` | similarité cosinus d'embeddings réels (package sémantique) |

Le statut (`routed | ambiguous | needs_clarification | out_of_scope`) et son `reason_code` disent
*pourquoi* BASE a tranché, ou pourquoi il a préféré demander.
