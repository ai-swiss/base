---
schema_version: base.resource.v1
id: demo-60-secondes
type: document
title: Voir BASE en action
description: "En moins d'une minute, observer un assistant BASE sur un cas vérifiable: deux sources à consulter, une règle à appliquer et une décision à laisser visible."
scope: public
status: active
sensitivity: public
keywords: [demo, 60-secondes, devis, quickstart, assistant-devis-demo, onboarding, verification, marqueur]
---

# Voir BASE en action

Avant de confier un vrai dossier à une IA, observez son comportement sur un cas que vous pouvez vérifier. Cette démo montre, en moins d'une minute, un assistant BASE qui consulte deux fichiers, cite la règle appliquée et marque `[A VALIDER]` au lieu de traiter la décision comme acquise.

Cette démo s'appuie sur `exemples/assistant-devis-demo/`, déjà garni d'une entreprise fictive, d'un catalogue de services, d'un client et d'un devis.

Vous n'avez pas encore le dépôt sous la main? [Essayer sans rien installer](essayer-sans-installer.md) montre les façons les plus simples d'essayer, sur ce même exemple; revenez ici quand vous aurez le dépôt.

## 1. Ouvrez la démo

Dans un outil d'IA capable de lire vos fichiers, ouvrez ce dossier précis, et non la racine du dépôt:

```text
exemples/assistant-devis-demo/
```

Avant de poser la question, demandez à l'outil de lire les instructions, puis de vous présenter la structure du dossier et le rôle des principaux fichiers.

## 2. Posez une question qui demande de vérifier

Dans le chat, écrivez:

```text
Dupont SA a-t-il droit à la remise fidélité?
```

C'est une question piège. La fiche de Dupont SA indique «Client (1er mandat)», alors que la règle de fidélité exige deux mandats. Sans ces deux informations, un modèle n'a aucun fondement pour trancher.

## 3. Lisez la réponse

L'assistant doit consulter deux de vos fichiers et répondre dans cet esprit:

> D'après `catalogue/regles-tarification.md`, la remise fidélité (-5%) s'applique aux clients ayant déjà signé deux mandats. La fiche `clients/dupont-sa.md` indique «Client (1er mandat)». Dupont SA n'y a donc pas encore droit. **[A VALIDER]** confirmez le statut du client avant d'appliquer une remise.

Vérifiez ce qui vient de se passer: la réponse s'appuie sur les deux fichiers attendus, expose le raisonnement et laisse la validation visible. Ce résultat ne prouve pas que toute réponse future sera correcte; il montre une méthode que vous pouvez inspecter.

## Ce que vous venez de voir

- **Les sources sont visibles.** La réponse cite `regles-tarification.md` et `dupont-sa.md`.
- **La conclusion peut être contrôlée.** Vous pouvez relire la règle et vérifier le statut du client.
- **La décision reste repérable.** Le marqueur `[A VALIDER]` se retrouve par une simple recherche.
- **Les calculs peuvent sortir du modèle.** L'outil `calculer-devis` recalcule la TVA et les totaux par du code; l'assistant peut alors signaler un écart.
- **La démo n'écrit rien.** Aucun fichier n'est modifié et aucun devis n'est envoyé au client. L'outil d'IA traite toutefois la conversation et les fichiers selon ses propres conditions.

## Le deuxième tour: une consigne et un mécanisme ne se valent pas

Le premier tour montre une méthode lisible. Le second montre une protection appliquée par du code. Marquez une ressource `confidential: true` (par exemple une grille de remises) et faites travailler l'assistant **par le broker** (serveur MCP ou chat du Studio): avant un appel distant, BASE retient cette ressource et la remplace par un avis. Cette protection ne dépend pas de la bonne volonté du modèle; elle est testée dans `tools/core/egress.mjs` et `tests/base-egress.test.mjs`.

La portée est précise: cette retenue opère **par le broker** (MCP, Studio, évaluation). Dans un agent d'éditeur direct, demander le même confinement reste une consigne. L'exemple `exemples/agence-multi-clients/` montre comment séparer plusieurs dossiers clients. Lorsque l'action passe par le broker, chaque assistant reste dans sa racine et les ressources confidentielles sont retenues avant l'appel distant.

## Aller plus loin

- **Voir un document fini:** demandez «Montre-moi le devis DEV-2026-001». Il existe déjà dans `devis/DEV-2026-001.md`.
- **Créer le vôtre:** copiez `exemples/assistant-devis/`, puis dites: «Bonjour, je voudrais configurer mon activité.» Ce gabarit contient la structure à personnaliser et vous guide pas à pas.
- **Savoir quoi lire ensuite:** suivez [Par où commencer](lire-dans-quel-ordre.md).
