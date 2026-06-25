---
schema_version: base.resource.v1
id: comprendre-base
type: process
title: Comprendre BASE
scope: team
status: active
sensitivity: internal
name: comprendre-base
description: "Expliquer le fonctionnement, la vision, l'architecture, les garanties ou les limites de BASE au bon niveau, en lisant la doc canonique avant d'expliquer."
use_when: Quand l'utilisateur veut comprendre comment BASE fonctionne, sa vision, son architecture, le routage, les permissions, ou les racines et workspaces.
routing:
  examples:
    - Explique l'architecture de BASE
    - Comment fonctionne le routage dans BASE ?
    - Comment marchent les permissions ?
    - Pourquoi BASE existe ?
    - Explique la vision de BASE pour un débutant
    - Comment marchent les racines et les workspaces ?
  avoid_when:
    - Créer un nouvel assistant métier.
    - Auditer ou entretenir un BASE existant.
    - Installer ou configurer le routage et le MCP.
    - Définition courte d'un seul terme.
argument-hint: "[le sujet à expliquer et, si connu, le profil de l'utilisateur]"
user-invocable: true
allowed-tools: Read
---

# Comprendre BASE

Expliquer BASE **à la bonne profondeur**, en lisant la doc canonique d'abord. Ce process est lui-même une démonstration du modèle BASE: agent → process → ressources référencées → réponse fondée → action suivante.

## Méthode

1. Repère le profil si utile: débutant, équipe, architecte, sécurité/IT, développeur.
2. Repère le sujet: vision, architecture, routage, policy, MCP, racines/workspace, données/sécurité.
3. Ouvre les sources canoniques listées pour ce sujet.
4. Réponds dans la langue et à la profondeur de l'utilisateur.
5. Dis ce que ça change pour sa tâche en cours, s'il y en a une.
6. Propose une action suivante, ou de revenir à la tâche interrompue.

## Sources à lire selon le sujet

- Vision / pourquoi:
  - `docs/learn/co-penser-avec-lia.md` (le pourquoi: vérification, quatre pertes, méthode), commence ici
  - `MANIFESTO.md`
  - `docs/learn/pratiques-co-pensee.md`
  - `docs/learn/comprendre.md`
- BASE et les autres outils, agents planifiés ou autonomes:
  - `docs/reference/base-et-vos-outils-ia.md` (dont «Agents planifiés et autonomes»: logique dans BASE, exécution par la plateforme, humain au point de validation; et «Pour votre outil précis: demandez à BASE»)
  - pour une intégration concrète à un outil donné, suis le process `integrer-un-outil`
- Architecture / modèle / six plans:
  - `docs/learn/comprendre.md` (section «L'architecture en six plans»)
  - `docs/reference/framework-public.md`
  - `specs/current/00_overview/vision.md`
- Routage agent → process → ressources:
  - `docs/reference/routage-process-et-ressources.md`
  - `specs/current/10_core/routing.md`
- Permissions / policy / frontières:
  - `docs/trust/securite-et-limites.md`
  - `specs/current/10_core/policy.md`
- Racines / workspace / MCP:
  - `specs/current/10_core/cli.md`
  - `specs/current/10_core/mcp.md`

## Profondeur selon le profil

- **Débutant**: la métaphore du collègue venu d'ailleurs, amnésique (représentation riche du monde, mais pas du vôtre); des fichiers texte que vous gardez; l'IA suit vos process.
- **Praticien**: agent / process / compétences / ressources; route d'abord, ouvre ensuite.
- **Architecte**: les six plans (texte = vérité, routeur = choix, broker = garanties, index = échelle, MCP = exposition, LLM = orchestration), ports & adaptateurs, confinement racine/workspace, abstention honnête.

Évite le code sauf si on te le demande. Ne cite pas de personne publique nommée en exemple; parle d'«architecte senior» si besoin.

## Ce que tu ne fais jamais

- Expliquer de mémoire sans ouvrir la source canonique.
- Noyer un débutant sous l'architecture.
- Confondre «comprendre» et «auditer» (l'audit, c'est `entretien-base`).
