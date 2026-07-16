---
schema_version: base.resource.v1
id: faq-base
type: process
title: FAQ BASE
scope: team
status: active
sensitivity: internal
name: faq-base
description: "Répondre brièvement à une question de base sur BASE (un agent, un process, une racine, un workspace, le MCP, la confidentialité), en lisant la doc canonique avant de répondre."
use_when: "Quand l'utilisateur pose une question simple de définition sur BASE: c'est quoi un agent, un process, une racine, un workspace, le MCP, ou si ses données sont privées."
routing:
  examples:
    - Quelle est la définition d'un agent ?
    - C'est quoi un process ?
    - C'est quoi un agent et un process ?
    - C'est quoi une racine BASE ?
    - C'est quoi un workspace ?
    - Que fait le MCP ?
    - Mes données sont-elles privées avec BASE ?
    - C'est quoi BASE en deux phrases ?
  avoid_when:
    - Créer un nouvel assistant métier.
    - Auditer ou entretenir un BASE.
    - Installer ou configurer le routage et le MCP.
    - Explication longue d'architecture ou de design.
argument-hint: "[la question posée]"
user-invocable: true
allowed-tools: Read
---

# FAQ BASE

Répondre court et juste à une question de base, **sans** renvoyer l'utilisateur à la doc. La règle: tu lis d'abord la source canonique, puis tu réponds avec tes mots.

## Méthode

1. Identifie le sujet de la question.
2. Ouvre la ou les sources canoniques listées ci-dessous pour ce sujet.
3. Réponds en **3 à 8 phrases**, simplement.
4. Dis ce que cela change pour la situation de l'utilisateur.
5. Propose **une** action à suivre.

Tu ne te contentes pas d'un lien. Tu lis, puis tu aides à partir de ce que tu as lu.

## Sources à lire selon la question

- Définitions courtes (source canonique, toujours en premier pour un terme):
  - `docs/reference/glossaire.md`
- Vision / pourquoi BASE:
  - `README.md`
  - `MANIFESTO.md`
  - `docs/learn/pratiques-co-pensee.md`
- Concepts (agent, process, ressources, routage):
  - `docs/reference/routage-process-et-ressources.md`
  - `docs/learn/comprendre.md`
  - `docs/reference/framework-public.md`
- Sécurité / accès / données:
  - `docs/trust/frontiere-local-vs-sortant.md` (la première question: qu'est-ce qui sort de ma machine, et quand)
  - `docs/trust/securite-et-limites.md`
  - `docs/trust/mecanismes-verifies.md` (la table garantie → fonction → test, pour qui veut la preuve)
  - `docs/trust/securite-donnees-routage.md`
  - `SECURITY.md`
- Racines / workspace / MCP:
  - `specs/current/10_core/cli.md`
  - `specs/current/10_core/mcp.md`
  - `mcp/README.md`

C'est une simple consigne de process, pas une nouvelle abstraction.

## Repères de réponse (à vérifier dans la doc, pas à réciter de mémoire)

- **Agent**: une fiche de poste (`AGENT.md`) + des skills. Le «qui».
- **Process**: un workflow, une façon de faire étape par étape. Le «comment».
- **Compétence**: une connaissance réutilisable. Le «savoir».
- **Racine (root)**: un projet BASE, confiné. Lecture/écriture/exécution restent dedans.
- **Workspace**: plusieurs racines déclarées; le routage peut chercher parmi elles, mais chaque action reste dans la racine choisie.
- **MCP**: expose les primitives BASE aux applications de chat; en HTTP, il est en lecture seule par défaut.
- **Confidentialité**: par défaut, le routage est local; rien ne part vers un fournisseur tant que vous n'avez pas explicitement activé les embeddings.

## Si l'utilisateur était déjà sur une autre tâche

Réponds, puis: «Est-ce que cela vous débloque pour ce que vous faisiez? On y revient?»

## Ce que tu ne fais jamais

- Répondre de mémoire sans ouvrir la source.
- Recopier des pages entières de doc.
- Transformer une définition en cours d'architecture (renvoie à `comprendre-base`).
