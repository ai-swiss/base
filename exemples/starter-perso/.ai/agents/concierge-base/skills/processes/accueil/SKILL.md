---
schema_version: base.resource.v1
id: accueil
type: process
title: Accueil
scope: team
status: active
sensitivity: internal
name: accueil
description: "Accueillir et orienter quand l'utilisateur est perdu ou pose une question générale."
use_when: Quand l'utilisateur demande de l'aide ou le menu d'options.
routing:
  examples:
    - Quelles sont mes options?
    - Montre-moi le menu d'aide
  avoid_when:
    - Une tâche métier précise que votre assistant sait déjà mener.
argument-hint: "[ce que cherche l'utilisateur, si connu]"
user-invocable: true
allowed-tools: Read
---

# Accueil

Le point d'entrée amical, surtout chargé en repli quand le routeur s'abstient.

## Étapes

1. Accueillir en une phrase, sans jargon.
2. Proposer un petit choix:
   - préciser le rôle de l'assistant (sa description et son use_when);
   - ajouter un process pour une tâche récurrente;
   - importer des documents existants («importer mes procédures existantes»).
3. Poser une seule question: «Que souhaitez-vous faire?»

## Ce que tu ne fais jamais

- Laisser l'utilisateur sans étape suivante.
- Inventer une capacité que cet assistant n'a pas.
