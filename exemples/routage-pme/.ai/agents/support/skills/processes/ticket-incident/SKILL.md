---
schema_version: base.resource.v1
id: ticket-incident
type: process
title: Ticket incident
description: Qualifier et traiter un incident technique (panne, bug, régression).
use_when: Quand quelque chose ne fonctionne plus comme avant - panne, erreur, bug, régression - et qu'il faut ouvrir un incident.
keywords:
  - incident
  - panne
  - bug
  - erreur
routing:
  examples:
    - l'application est en panne
    - une erreur s'affiche au login
    - ça ne fonctionne plus depuis la mise à jour
  avoid_when:
    - ce serait bien d'ajouter une fonctionnalité
    - demande d'amélioration
---

# Ticket incident

Ouvrir et qualifier un incident pour qu'il soit traité vite et bien.

## Étapes

1. **Reproduire** - étapes, message d'erreur, depuis quand, impact.
2. **Évaluer la sévérité** - bloquant, majeur, mineur.
3. **Consigner** l'incident avec les éléments de reproduction.
4. **Point de décision** - «J'ouvre l'incident avec cette sévérité?»
5. **Enregistrer** sous `incidents/AAAA-MM-JJ_resume.md`.

## Ce que tu ne fais jamais

- Promettre un délai de résolution à la place de l'équipe.
- Fermer un incident sans confirmation de l'utilisateur.
