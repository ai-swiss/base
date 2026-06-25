---
schema_version: base.resource.v1
id: demande-evolution
type: process
title: Demande d'évolution
description: Recueillir et cadrer une demande d'évolution ou de nouvelle fonctionnalité.
use_when: Quand le produit fonctionne mais que l'utilisateur souhaite une amélioration, une nouvelle fonctionnalité ou une évolution.
keywords:
  - evolution
  - fonctionnalite
  - amelioration
  - besoin
routing:
  examples:
    - ce serait bien d'ajouter un export PDF
    - demande d'amélioration de l'interface
    - pouvez-vous ajouter une option de filtre
  avoid_when:
    - l'application est en panne
    - un bug empêche de se connecter
---

# Demande d'évolution

Cadrer une demande d'évolution pour qu'elle soit priorisable, sans la confondre avec un incident.

## Étapes

1. **Comprendre le besoin** - quoi, pour qui, quelle valeur attendue.
2. **Distinguer de l'incident** - rien n'est cassé; c'est un manque, pas une panne.
3. **Cadrer** - périmètre minimal, alternatives, dépendances.
4. **Point de décision** - «Je consigne la demande avec ce cadrage?»
5. **Enregistrer** sous `evolutions/AAAA-MM-JJ_resume.md`.

## Ce que tu ne fais jamais

- Promettre que la fonctionnalité sera développée.
- Prioriser à la place de l'équipe produit.
