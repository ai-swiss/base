---
schema_version: base.resource.v1
id: voie-2-routage-embeddings
type: document
title: Voie 2, le routage par embeddings (optionnel, pour l'échelle)
description: La Voie 2 du routage de BASE: optionnelle, pour les grands catalogues, des embeddings retrouvent quelques candidats et un petit modèle local raffine. Local et souverain, c'est essentiellement «juste Ollama».
scope: public
status: active
sensitivity: public
keywords: [routage, voie-2, embeddings, ollama, raffineur, souverainete, echelle]
---

# Voie 2, le routage par embeddings (optionnel, pour l'échelle)

BASE route de deux façons, et c'est la configuration qui décide. La Voie 1 est le réglage par défaut et
suffit à la plupart des BASE. La Voie 2 est un confort réservé aux grands catalogues. Vous n'en avez
besoin que si vous l'avez choisi.

## Les deux voies, en une phrase chacune

- **Voie 1 (par défaut, déjà active).** L'assistant lit l'index généré et choisit; un plancher
  déterministe par mots-clés tient lieu de filet hors-ligne. Aucun modèle, rien à installer.
- **Voie 2 (optionnelle).** Les embeddings ramènent les quelques candidats les plus proches de la
  demande, puis un petit modèle les lit et tranche: il choisit, ou réclame une précision. En local.

Les deux voies sont indépendantes: la Voie 2 n'est pas un étage posé sur la Voie 1, mais une autre voie,
que la configuration sélectionne.

## En avez-vous besoin?

Soyez honnête avec vous-même avant la moindre installation.

- **Petit ou moyen BASE** (quelques agents, quelques dizaines de process): la **Voie 1 suffit**. La Voie 2
  n'apporterait rien, sinon une installation de plus à entretenir.
- **Grand BASE** (beaucoup de process, ou un routage qui hésite parce que la liste est trop longue pour se
  départager aux mots-clés): la Voie 2 affine le choix. C'est là qu'elle prend tout son sens.

## L'installation, c'est essentiellement «juste Ollama»

La promesse est simple. Voici la marche à suivre:

1. Installer **Ollama** (l'application qui fait tourner des modèles en local).
2. Télécharger **deux modèles**: un modèle d'embedding et un petit modèle raffineur.
3. Renseigner l'un et l'autre dans la page **Réglages** du Studio, section «Routage / Voie 2» (ou
   directement dans le fichier de configuration).

**Local, souverain, sans nuage, sans clé d'API.** Tout reste sur votre machine. Un fournisseur hébergé
compatible OpenAI demeure possible pour qui le souhaite, mais le scénario par défaut, c'est *Ollama seul*.

La Voie 2 ne s'active que lorsque **les deux** modèles sont renseignés. Un seul n'y change rien, et BASE
reste sur la Voie 1. Et si un modèle devient injoignable, BASE revient d'elle-même à la Voie 1: jamais de
blocage, jamais de silence.

## Quels modèles choisir? (vous êtes libre)

BASE ne vous impose aucun modèle. À titre **illustratif et non prescriptif**, deux modèles locaux légers
suffisent à une bonne démonstration: `qwen3-embedding:0.6b` pour l'embedding (multilingue, ce qui sert,
puisque BASE est francophone) et `qwen3:4b` pour le raffineur (petit modèle instruct). Ce sont des
exemples, non une recommandation figée: choisissez les vôtres si vous préférez, par exemple un embedding
à contexte long, ou un raffineur d'une autre famille.

L'écosystème évolue vite. Plutôt que de retenir des versions, **consultez les modèles recommandés du
moment** dans la documentation d'Ollama, et vérifiez la balise exacte au téléchargement. Pour les critères
de choix d'un fournisseur d'embeddings (local, cloud, gateway, interne), voir
[Choisir son provider d'embeddings](choisir-provider-embeddings.md). Pour faire tourner des modèles en
restant souverain, voir [Modèles souverains](modeles-souverains.md).

Ne cherchez pas le «meilleur» petit raffineur à coups de pourcentages. Ce que l'éval de routage mesure
honnêtement, c'est un **signal de structure** (les embeddings font-ils remonter le bon candidat?), et non
la performance d'un modèle: le choix final, ou la demande de précision, revient à **votre propre IA**,
bien plus forte que n'importe quel petit modèle local. Le raffineur local n'est qu'un filet pour tenir
l'échelle, Studio fermé. Inutile, donc, d'ajuster vos prompts ou votre structure pour gonfler le score
d'un petit modèle.

## Se faire accompagner pas à pas

Le plus simple est de le demander à votre assistant: **«active la Voie 2»**. Le process `activer-voie2`
vous guide dans l'ordre: vérifier que le besoin est réel, installer Ollama en suivant sa documentation
officielle à jour, choisir et télécharger les deux modèles, puis les renseigner dans les Réglages. Il
montre chaque commande avant de l'exécuter, et ne fige aucune version.

## Où vivent les réglages

Dans le Studio, la section «Routage / Voie 2» des Réglages expose les deux modèles et le nombre de
candidats soumis au raffineur (un nombre, non un seuil à régler; la valeur par défaut convient).
Hors Studio, les mêmes valeurs résident dans le bloc `routing` du fichier `.ai/studio.settings.json`
(`embedding_model`, `refiner_model`, et `k` facultatif). La règle du tout ou rien est vérifiée à
l'écriture: les deux modèles, ou aucun.

Pour la mise en place plus complète du routage (zéro config, ranker à embeddings, lecture des scores),
voir [Mettre en place le routage sémantique](routage-semantique-quickstart.md).
