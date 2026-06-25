---
schema_version: base.resource.v1
id: signaler-une-friction
type: process
title: Signaler une friction
scope: team
status: active
sensitivity: internal
description: Consigner un dysfonctionnement vécu avec l'assistant (process qui déraille, donnée périmée, étape impossible) dans le journal de friction, pour qu'il devienne un amendement de process.
use_when: Quand l'utilisateur exprime un problème avec son assistant lui-même: «ça n'a pas marché», «mon assistant s'est trompé», «le process donne un mauvais résultat», «le barème cité est faux».
keywords: [friction, dysfonctionnement, erreur, feedback, terrain]
routing:
  examples:
    - Mon assistant s'est trompé
    - Ça n'a pas marché comme prévu
    - Le process devis donne un mauvais montant
    - Signaler un problème avec l'assistant
  avoid_when:
    - Demander de l'aide pour réaliser une tâche métier.
    - Créer ou améliorer un agent (c'est le créateur d'agent).
    - Vérifier, auditer ou publier un BASE (c'est l'entretien du créateur d'agent).
---

# Signaler une friction

Une friction consignée est un amendement de process en attente. Ce process collecte le contexte
minimal puis écrit l'entrée dans le journal de terrain (`.ai/feedback/`): création seule, jamais
de modification. C'est le détecteur de lacunes le moins cher qui existe.

## Étapes

### 1. Identifier le process concerné

Demande (ou déduis de la conversation):
- **Quel process** était en cours (chemin ou id; `discover_resources` si le nom est flou).
- **À quelle étape** le problème est apparu.

### 2. Cerner l'écart

Fais préciser en une phrase chacun:
- **Attendu**: ce que le process annonce.
- **Observé**: ce qui s'est réellement passé (montant faux, donnée périmée, étape impossible…).

### 3. Consigner

Appelle l'outil `report_friction`:

- `process`: le chemin du process concerné
- `summary`: l'écart en une ligne (ex. «le barème cité n'est plus le bon»)
- `detail`: étape, attendu, observé, et toute correction faite à la main
- `via`: `user` si l'utilisateur dicte, `assistant` si tu consignes de toi-même

Si l'outil n'est pas disponible dans cet hôte, propose le contenu du fichier
`.ai/feedback/<date>_<process>.md` (frontmatter `process`, `reported`, `via`, `status: open`)
via le gate propose → commit.

### 4. Confirmer la suite

Dis à l'utilisateur où la friction vit (`.ai/feedback/`) et ce qu'elle déclenche: elle apparaît
dans la pile Terrain de Studio et chez `base doctor` jusqu'à ce qu'un humain amende le process et
la marque résolue.

## Ce que tu ne fais jamais dans ce process

- **Corriger le process toi-même.** La friction est un signal; l'amendement est une décision humaine.
- **Modifier une friction existante.** Le journal est append-only: un nouveau constat = une nouvelle entrée.
