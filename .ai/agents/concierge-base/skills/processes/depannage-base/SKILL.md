---
schema_version: base.resource.v1
id: depannage-base
type: process
title: Dépannage BASE
scope: team
status: active
sensitivity: internal
name: depannage-base
description: "Aider quand BASE ne se comporte pas comme prévu: agent introuvable, mauvaise racine, MCP non connecté, routage qui échoue, outil qui ne voit pas les fichiers. Lire la doc, donner un contrôle concret, passer la main à l'installation si besoin."
use_when: Quand quelque chose ne fonctionne pas dans BASE: un agent introuvable, une mauvaise racine, le MCP non connecté, route_request qui échoue, ou un outil qui ne voit pas les fichiers.
routing:
  examples:
    - Le MCP ne trouve pas mes agents
    - BASE dit aucun agent trouvé
    - Mauvaise racine sélectionnée
    - route_request échoue
    - Cursor ne voit pas mes fichiers
  avoid_when:
    - Question de définition sur ce qu'est une racine.
    - Créer un nouvel assistant métier.
    - Première installation du routage à partir de zéro.
    - Auditer la cohérence globale d'un BASE sain.
argument-hint: "[l'outil utilisé et ce que l'utilisateur voit]"
user-invocable: true
allowed-tools: Read Bash
---

# Dépannage BASE

Débloquer vite, sans noyer l'utilisateur. Tu poses peu de questions, tu lis la doc utile, tu donnes **un** contrôle concret, puis tu passes la main s'il s'agit d'une installation ou d'une incohérence du cadre.

## Étapes

### 1. Identifier l'outil

> «Vous utilisez quoi: Cursor, Claude Code, ChatGPT via MCP, un terminal, ou autre?»

### 2. Identifier ce que voit l'utilisateur

En mots simples: un message d'erreur, un écran vide, le mauvais agent, ou rien qui ne se charge.

### 3. Vérifier les causes probables

- mauvais dossier ou mauvaise racine sélectionnée;
- absence de `.ai/agents/` à l'endroit ouvert;
- MCP non connecté ou serveur non lancé;
- espace de travail ambigu (plusieurs racines, aucune choisie);
- droits natifs ou accès aux fichiers de l'outil.

### 4. Lire la doc pertinente avant de conclure

- `mcp/README.md`;
- `specs/current/10_core/mcp.md`;
- `specs/current/10_core/cli.md`;
- `docs/trust/securite-et-limites.md` si l'accès ou la sécurité est en jeu.

### 5. Donner un seul contrôle concret

Par exemple: «Depuis le dossier du projet, lancez `base validate`: s'il répond `BASE root not found`, vous n'êtes pas dans la bonne racine.»

### 6. Passer la main

- S'il s'agit d'une **installation** du routage ou du MCP → `createur-agent` / `activer-routage`.
- S'il s'agit d'une **incohérence du cadre** (liens cassés, ressources manquantes) → `createur-agent` / `entretien-base`.

## Ce que tu ne fais jamais

- Lancer une commande qui écrit ou modifie sans accord explicite.
- Deviner une cause sans avoir lu la doc utile.
- Refaire ici l'installation complète (c'est le rôle d'`activer-routage`).
- Promettre que tout est réparé sans que l'utilisateur l'ait vérifié.
