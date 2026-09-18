---
schema_version: base.resource.v1
id: human-writing
type: competence
title: Conventions d'écriture (français)
description: Conventions typographiques et de langue de la documentation française de BASE. Load when writing or reviewing French prose.
scope: team
status: active
sensitivity: internal
user-invocable: false
allowed-tools: Read
---

# Conventions d'écriture (français)

Ces conventions valent pour toute la prose française de BASE: documentation, README, gouvernance, messages. Elles visent un rendu cohérent et soigné. Les barrières `check-emdash` et `check-lexique` en vérifient une partie automatiquement.

La règle qui prime est la cohérence: une seule convention, tenue d'un bout à l'autre. Un texte à moitié conforme trahit une relecture négligée.

## Guillemets

Guillemets français «», en composition serrée, sans espace intérieure: «texte», et non «texte».

## Ponctuation (usage suisse romand)

Pas d'espace avant les deux-points, le point-virgule, le point d'exclamation et le point d'interrogation: on écrit «un point:» et non «un point :».

## Tiret cadratin

Aucun tiret cadratin dans un texte français (le tiret long, distinct du trait d'union et du tiret moyen). Utiliser les deux-points, une virgule, un point, des parenthèses, ou restructurer la phrase.

## Anglicismes

Quand un terme français courant existe, le préférer: «point de friction» plutôt que «pain point», «transmission» plutôt que «handoff», «lacune» plutôt que «gap», «traiter un problème» plutôt que «adresser un problème». Garder les termes techniques établis (commit, hook, MCP, broker).

## Quatre objets à ne jamais confondre

Toute présentation de BASE distingue explicitement quatre objets:

- la **méthode** est la manière dont le travail est conduit: étapes, sources faisant autorité, règles, contrôles et décisions humaines;
- la **structure BASE** est l'ensemble des ressources et des relations qui décrivent cette méthode;
- la **référence** est la description approuvée et versionnée de la méthode à un instant donné;
- l'**exécution** est ce qu'un modèle, un outil ou une intégration fait effectivement à partir de cette référence, dans un contexte donné.

La structure n'est donc pas la méthode elle-même, et la référence n'est pas son exécution. Une même référence peut conduire à des exécutions différentes selon le modèle, les outils, les données, les permissions et l'intégration. Écrire ce que BASE décrit, conserve, vérifie ou rend accessible. Ne jamais lui attribuer ce que seul le dispositif d'exécution accomplit, ni présenter la référence comme une garantie de comportement.
