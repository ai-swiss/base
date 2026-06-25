---
schema_version: base.resource.v1
id: demo-60-secondes
type: document
title: Voir BASE en action
description: En moins d'une minute, voir un assistant BASE qui s'appuie sur vos fichiers, nomme la règle qui le justifie et pose un `[A VALIDER]` plutôt que de décider seul. À comparer avec un chat générique.
scope: public
status: active
sensitivity: public
keywords: [demo, 60-secondes, devis, quickstart, assistant-devis-demo, onboarding, verification, marqueur]
---

# Voir BASE en action

Avant de confier un vrai dossier à une IA, vous voulez savoir si vous pouvez lui faire confiance. Cette démo le montre en moins d'une minute: un assistant BASE qui s'appuie sur vos fichiers, nomme la règle qui le justifie et pose un `[A VALIDER]` plutôt que de décider seul, là où un chat générique aurait tendance à improviser. À vous, ensuite, de juger si cette honnêteté change la donne pour votre travail.

Cette démo utilise `exemples/assistant-devis-demo/`, déjà rempli avec une entreprise fictive, un catalogue de services, un client et un devis.

Vous n'avez pas encore le dépôt sous la main? [Essayer sans rien installer](essayer-sans-installer.md) montre les chemins les plus simples pour récupérer le dossier et le donner à votre IA, du plus léger au plus complet.

## 1. Ouvrez la démo

Dans un outil IA capable de lire vos fichiers (par exemple GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code), ouvrez le dossier (ce dossier, pas la racine du dépôt):

```text
exemples/assistant-devis-demo/
```

## 2. Posez une question qui demande de vérifier

Dans le chat, écrivez:

```text
Dupont SA a-t-il droit à la remise fidélité?
```

C'est une question piège. La fiche de Dupont SA indique «Client (1er mandat)», alors que la règle de fidélité demande deux mandats. Un chat générique, qui ne connaît ni votre client ni vos règles, risque d'inventer une réponse plausible.

## 3. Lisez la réponse

L'assistant doit aller lire deux de vos fichiers et répondre dans cet esprit:

> D'après `catalogue/regles-tarification.md`, la remise fidélité (-5%) s'applique aux clients ayant déjà signé deux mandats. La fiche `clients/dupont-sa.md` indique «Client (1er mandat)». Dupont SA n'y a donc pas encore droit. **[A VALIDER]** confirmez le statut du client avant d'appliquer une remise.

Trois choses viennent de se passer. L'assistant a lu vos fichiers au lieu de deviner. Il vous a dit la vérité, même décevante, plutôt qu'un «oui» arrangeant. Enfin, il vous a rendu la décision avec un marqueur cherchable.

## Ce que vous venez de voir

- **Il lit votre réalité.** La réponse cite `regles-tarification.md` et `dupont-sa.md`, vos fichiers, pas une mémoire générique.
- **Il ne flatte pas.** Quand la réponse honnête est «non», il dit «non» et montre la règle qui le justifie.
- **Il s'arrête au bon moment.** Le `[A VALIDER]` vous laisse la décision et reste retrouvable d'un coup de recherche, même dans six mois.
- **Il prouve plutôt qu'il promet.** Sur un devis, les montants ne sont pas «à peu près»: l'outil `calculer-devis` recalcule la TVA et les totaux de façon déterministe, et l'assistant signale un écart au lieu de l'affirmer.
- **Rien n'a bougé.** Aucun fichier écrit, rien envoyé par BASE (votre outil IA, lui, traite la conversation selon ses conditions). Vous gardez la main.

## Le deuxième tour: ce qu'un chat générique ne peut pas faire

Le premier tour montrait l'honnêteté. Le second montre une garantie que la bonne volonté d'un modèle ne donne pas. Marquez une ressource `confidential` (par exemple une grille de remises) et faites travailler l'assistant **par le broker** (serveur MCP ou chat du Studio): s'il doit appeler un modèle distant, BASE **vérifie avant l'envoi** et retient cette ressource. Elle ne part pas. Ce n'est pas une consigne que le modèle pourrait oublier, c'est un **mécanisme**, vérifié par du code testé (`tools/core/egress.mjs`, `tests/base-egress.test.mjs`).

La portée est exacte: cette retenue opère **par le broker** (MCP, Studio, évaluation); en agent d'éditeur direct, le même confinement n'est qu'une consigne. L'exemple `exemples/agence-multi-clients/` montre l'échelle: une agence, plusieurs clients, chaque assistant confiné à sa racine, la grille confidentielle consultée pour fixer le prix sans jamais être recopiée dans l'offre.

## Aller plus loin

- **Voir un document fini:** demandez «Montre-moi le devis DEV-2026-001». Il existe déjà dans `devis/DEV-2026-001.md`.
- **Créer le vôtre:** copiez `exemples/assistant-devis/`, puis dites «Bonjour, je voudrais configurer mon activité». Cette version part vide et vous guide.
- **Savoir quoi lire ensuite:** suivez [Par où commencer](lire-dans-quel-ordre.md).
