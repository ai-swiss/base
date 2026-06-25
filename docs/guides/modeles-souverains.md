---
schema_version: base.resource.v1
id: modeles-souverains
type: document
title: Garder vos modèles souverains, en local ou en Suisse
description: Faire tourner les évaluations et les assistants BASE sur un modèle local (Ollama) ou hébergé en Suisse (Infomaniak), sans dépendre d'un fournisseur hors de votre contrôle.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
compatibility: [cli, studio]
keywords: [souverainete, modele, local, ollama, infomaniak, suisse, evaluation, provider, confidentialite]
---

# Garder vos modèles souverains, en local ou en Suisse

Utiliser un modèle avec BASE ne doit pas signifier confier vos données à un fournisseur hors de votre contrôle. Si c'est votre exigence, deux chemins concrets gardent la main, tout local ou hébergé en Suisse, avec un repère pour choisir selon la sensibilité de ce que vous traitez.

Le cœur de BASE n'appelle jamais un fournisseur de modèle. En configuration de base, rien ne sort de votre machine. Faire tourner un modèle (pour une évaluation, ou pour piloter un assistant) est un **choix explicite**, et ce choix peut rester souverain.

Deux chemins gardent vos données sous votre contrôle:

- **Tout local** avec Ollama: rien ne quitte la machine.
- **Hébergé en Suisse** avec Infomaniak: une API compatible OpenAI, opérée en Suisse.

Aucun n'est obligatoire. Le routage par défaut de BASE est entièrement local et ne demande aucun modèle.

## Quel modèle convient

BASE ne tourne pas avec n'importe quel modèle, et il vaut mieux le dire. Un process demande un modèle capable de se servir d'outils de façon fiable (lire un fichier, en proposer un, chercher une ressource, appeler une fonction) sans inventer d'appel ni de paramètre, de suivre des instructions à plusieurs contraintes, de rendre au besoin une sortie structurée, de garder le fil sur quelques échanges, et de s'en tenir aux seules données fournies. Ce qui compte n'est pas un coup d'essai réussi, mais la régularité sur la durée. Plusieurs modèles ouverts exécutables localement franchissent ce palier aujourd'hui, à titre d'exemples et sans viser l'exhaustivité: Qwen (sous licence Apache-2.0) ou la famille Gemma de Google (sous sa propre licence), capables d'appeler des fonctions et de rendre une sortie structurée, tiennent les process bien cadrés. Le paysage bouge vite, et le critère qui compte n'est pas la marque mais la régularité sur la durée: appeler des outils sans inventer d'appel, suivre plusieurs contraintes à la fois, s'en tenir aux données fournies. Les enchaînements les plus complexes restent l'avantage des grands modèles hébergés. Le bon choix dépend du process, pas d'un slogan.

## Tout local: Ollama

Rien ne sort de la machine. Idéal pour un poste individuel, une démonstration, ou un environnement isolé du réseau.

```js
import { createOllamaModel } from "@ai-swiss/base-llm";

const model = createOllamaModel({ model: "qwen3.5:9b-q4_K_M" });
```

Pour lancer une évaluation entièrement locale (le modèle doit être disponible dans Ollama au préalable):

```bash
npm run eval -- --ollama --model qwen3.5:9b-q4_K_M
```

## Hébergé en Suisse: Infomaniak

Infomaniak propose des modèles ouverts via une API **compatible OpenAI**, hébergée en Suisse. Selon le fournisseur que vous choisissez et ses conditions, vos données peuvent rester dans une juridiction suisse, sans dépendre d'un fournisseur extra-européen.

Le port `base-llm` parle déjà l'API compatible OpenAI: renseignez l'URL de base d'Infomaniak, votre clé, et un modèle de leur catalogue.

```js
import { createOpenAICompatibleModel } from "@ai-swiss/base-llm";

const model = createOpenAICompatibleModel({
  model: "<modele du catalogue Infomaniak>",
  apiKey: process.env.INFOMANIAK_TOKEN,
  baseUrl: "https://api.infomaniak.com/1/ai/<PRODUCT_ID>/openai",
});
```

`<PRODUCT_ID>` est l'identifiant de votre produit AI Tools. Vous l'obtenez et choisissez vos modèles depuis votre espace Infomaniak ou leur API (`GET /1/ai`). Voir la [documentation Infomaniak](https://www.infomaniak.com/fr/hebergement/ai-services).

Pour une évaluation via Infomaniak, fournissez la clé par l'environnement et pointez l'URL de base:

```bash
export OPENAI_API_KEY="$INFOMANIAK_TOKEN"
npm run eval -- --base-url "https://api.infomaniak.com/1/ai/<PRODUCT_ID>/openai" --model "<modele>"
```

## Choisir

| Besoin | Chemin |
|--------|--------|
| Confidentialité maximale, hors ligne, poste individuel | Ollama (tout local) |
| Souveraineté suisse, modèles plus grands, équipe ou institution | Infomaniak (hébergé en Suisse) |
| Évaluer la méthode sans aucun modèle | Routage par défaut, entièrement local |

## Local ou cloud, selon la sensibilité des données

Le bon critère est ce que vous confiez au modèle. Ce tableau donne un point de départ; il ne tient pas lieu d'avis juridique, et pour les cas réglementés, la décision revient à votre responsable conformité.

| Sensibilité des données | Options raisonnables |
|-------------------------|----------------------|
| **Publiques** (communication publiée, contenu de site) | Tout est ouvert: modèle cloud de pointe, hébergement suisse ou local, selon le confort recherché. |
| **Internes** (procédures, notes de projet non confidentielles) | Hébergement suisse ou local; un cloud extra-européen seulement après revue de ses conditions et de sa rétention. |
| **Confidentielles** (clients, contrats, finances) | Local (Ollama), ou hébergement suisse avec garanties contractuelles écrites. |
| **Personnelles ou réglementées** (RH, santé, données soumises à la nLPD ou au RGPD) | Local d'abord; sinon un environnement validé par votre conformité, ou garder l'IA hors de la boucle. |

Un point que ces options escamotent souvent: où la donnée réside n'est pas qui peut, en droit, l'atteindre. Un service «hébergé en Suisse» ou «cloud européen», mais opéré par une société sous contrôle étranger, reste contraignable par la juridiction de sa maison mère, le CLOUD Act américain en tête, qui atteint les données «où qu'elles soient stockées». La souveraineté se lit au contrat et à la structure de l'opérateur, pas au pays du centre de données. À sensibilité élevée, le local reste donc la seule option qui ne repose sur la confiance de personne.

Le détail des responsabilités qui restent les vôtres est dans [Protection des données](../trust/protection-des-donnees.md).

## Ce qu'un petit modèle local fait bien et mal

Un modèle qui tourne sur un bon ordinateur portable suffit pour une vraie part du travail, à condition de savoir où il s'arrête.

Ce qu'il fait bien:

- **Le routage se passe de lui.** Le routage par défaut de BASE est lexical et ne demande aucun modèle. Rudimentaire mais efficace, extensible par adaptateurs, il épargne à l'utilisateur la charge mentale de chercher le bon process et fonctionne de la même façon avec ou sans modèle local, petit ou grand.
- **Rédiger dans le cadre d'un process court.** Quand le process fournit la structure, les règles et les données, un petit modèle produit un premier jet honnête.
- **Reformuler.** Résumer ce qu'il a compris, ajuster un ton, condenser un texte: des tâches courtes et cadrées.

Ce qu'il fait mal:

- **Suivre fidèlement un process long.** Au-delà d'une centaine de lignes d'instructions, un petit modèle perd des contraintes en route: il saute des étapes ou oublie des règles. Découpez les process, ou passez à un modèle plus grand.
- **Calculer.** TVA, totaux, marges: ne demandez jamais ces résultats au modèle. Confiez-les à une tool déterministe (`base invoke`), qui donne le même résultat à chaque exécution.

L'évaluation `base eval` rend ces limites visibles plutôt que devinées: le rôle de juge, en particulier, demande souvent un modèle plus fort que celui qui tient l'assistant.

## La configuration testée dans ce dépôt

Deux configurations locales sont réellement utilisées par les mainteneurs, telles quelles:

- **`base eval` avec Ollama et `qwen3.5:9b-q4_K_M`** pour l'utilisateur simulé et le juge; voir [tools/eval/README.md](../../tools/eval/README.md), y compris pour renforcer le juge avec un modèle plus grand.
- **`nomic-embed-text` pour les embeddings locaux**: c'est le modèle par défaut de `createOllamaEmbedder()` dans le package `@ai-swiss/base-ranker-semantic`, quand un projet active le ranker sémantique sans rien envoyer hors de la machine.

Dans tous les cas, le cœur reste le même fichier de texte que vous possédez. Le modèle est un détail remplaçable, pas le lieu où vit votre méthode.

## Pour aller plus loin

- [Souveraineté et confiance](../trust/souverainete-et-confiance.md)
- [Protection des données](../trust/protection-des-donnees.md)
- [Sécurité des données et routage](../trust/securite-donnees-routage.md)
- [Choisir un provider d'embeddings](choisir-provider-embeddings.md)

---

BASE est un framework par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
