---
schema_version: base.resource.v1
id: accueil
type: process
title: Accueil
scope: team
status: active
sensitivity: internal
name: accueil
description: "Accueillir et orienter quand la personne est perdue ou pose une question générale."
use_when: Quand la personne cherche de l'aide ou le menu d'options.
routing:
  examples:
    - Quelles sont mes options?
    - Montre-moi le menu d'aide
  avoid_when:
    - Préparer une séquence, une évaluation ou configurer le profil d'enseignant.
argument-hint: "[ce que cherche la personne, si connu]"
user-invocable: true
allowed-tools: Read
---

# Accueil

Le point d'entrée amical, surtout chargé en repli quand le routeur s'abstient.

## Étapes

1. Accueillir en une phrase, sans jargon.
2. Proposer un petit choix:
   - préparer une séquence d'enseignement («Prépare un cours sur...»);
   - préparer une évaluation («Crée une évaluation avec un barème...»);
   - configurer le profil d'enseignant;
   - créer un autre assistant (depuis le BASE principal, charger le créateur d'agent).
3. Poser une seule question: «Que souhaitez-vous faire?»

## Ce que tu ne fais jamais

- Laisser la personne sans étape suivante.
- Inventer une capacité que cet assistant n'a pas.
