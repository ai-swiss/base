---
schema_version: base.resource.v1
id: signaler-une-friction
type: process
title: Signaler une friction
scope: team
status: active
sensitivity: internal
description: Consigner un dysfonctionnement vécu avec l'assistant (process qui déraille, donnée périmée, étape impossible) dans le journal de friction, pour qu'il devienne un amendement de process.
use_when: "Quand l'utilisateur exprime un problème avec son assistant lui-même: «ça n'a pas marché», «mon assistant s'est trompé», «le process donne un mauvais résultat», «le barème cité est faux»."
keywords: [friction, dysfonctionnement, erreur, feedback, terrain]
routing:
  examples:
    - Mon assistant s'est trompé
    - Ça n'a pas marché comme prévu
    - Le process devis donne un mauvais montant
    - Signaler un problème avec l'assistant
  avoid_when:
    - Question de définition d'un process.
    - Demander de l'aide pour réaliser une tâche métier.
    - Créer ou améliorer un agent (c'est le créateur d'agent).
    - Vérifier, auditer ou publier un BASE (c'est l'entretien du créateur d'agent).
---

# Signaler une friction

Une friction consignée est un amendement de process qui s'ignore encore. Ce process réunit le
contexte essentiel, puis inscrit l'entrée dans le journal de terrain (`.ai/feedback/`): on crée,
on ne modifie jamais. C'est le détecteur de lacunes le moins coûteux qui soit.

## Étapes

### 1. Identifier le process concerné

Demande (ou déduis de la conversation):
- **Quel process** était en cours (chemin ou id; `discover_resources` si le MCP est disponible, sinon `node .ai/base.mjs discover "<nom ou besoin>" --root .`).
- **À quelle étape** le problème est apparu.

### 2. Cerner l'écart

Fais préciser chacun en une phrase:
- **Attendu**: ce que le process annonce.
- **Observé**: ce qui s'est réellement passé (montant faux, donnée périmée, étape impossible…).

### 3. Situer le coût

Une friction est presque toujours un coût payé à chaque demande: une information retrouvée une
nouvelle fois, une règle réexpliquée, un fichier cherché. Pose la question pendant que le cas est
frais, et note la réponse: **où ce coût est-il payé aujourd'hui, et où devrait-il vivre?**

Deux exemples:

- «Je redemande le taux de TVA applicable à chaque devis.» Le coût est payé à chaque devis, par la
  personne qui le rédige. Il devrait vivre dans une ligne du dossier client, tenue à l'écriture.
- «L'assistant cherche le bon modèle de courrier dans trois dossiers.» Le coût est payé à chaque
  courrier. Il devrait vivre dans un lien depuis le process, ou dans une compétence qui nomme le
  modèle à utiliser.

La réponse peut rester vide: la friction est consignée quand même.

### 4. Consigner

Appelle l'outil `report_friction`:

- `process`: le chemin du process concerné
- `summary`: l'écart en une ligne (ex. «le barème cité n'est plus le bon»)
- `detail`: étape, attendu, observé, et toute correction faite à la main
- `via`: `user` si l'utilisateur dicte, `assistant` si tu consignes de toi-même

Si l'outil n'est pas disponible sur cet hôte, propose le contenu du fichier
`.ai/feedback/<date>_<process>.md` (frontmatter `process`, `reported`, `via`, `status: open`)
en passant par le gate propose → commit.

### 5. Confirmer la suite

Indique à l'utilisateur où vit la friction (`.ai/feedback/`) et ce qu'elle déclenche: elle figure
dans la pile Terrain de Studio et chez `base doctor` tant qu'un humain n'a pas amendé le process et
ne l'a pas marquée résolue.

## Ce que tu ne fais jamais dans ce process

- **Corriger le process toi-même.** La friction est un signal; l'amendement est une décision humaine.
- **Modifier une friction existante.** Le journal est append-only: un nouveau constat = une nouvelle entrée.
