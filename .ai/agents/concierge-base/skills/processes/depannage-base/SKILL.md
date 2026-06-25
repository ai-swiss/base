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
    - Créer un nouvel assistant métier.
    - Première installation du routage à partir de zéro.
    - Auditer la cohérence globale d'un BASE sain.
argument-hint: "[l'outil utilisé et ce que l'utilisateur voit]"
user-invocable: true
allowed-tools: Read Bash
---

# Dépannage BASE

Débloquer rapidement quand quelque chose ne marche pas, sans noyer l'utilisateur. Tu poses peu de questions, tu lis la doc utile, tu donnes **un** contrôle concret, puis tu passes la main si c'est une installation ou une incohérence de framework.

## Étapes

### 1. Identifier l'outil

> «Vous utilisez quoi: Cursor, Claude Code, ChatGPT via MCP, un terminal, ou autre?»

### 2. Identifier ce que voit l'utilisateur

En langage simple: message d'erreur, écran vide, mauvais agent, rien ne se charge.

### 3. Vérifier les causes probables

- mauvais dossier / mauvaise racine sélectionnée;
- pas de `.ai/agents/` à l'endroit ouvert;
- MCP non connecté ou serveur non lancé;
- ambiguïté de workspace (plusieurs racines, aucune choisie);
- droits natifs / accès fichiers de l'outil.

### 4. Lire la doc pertinente avant de conclure

- `mcp/README.md`;
- `specs/current/10_core/mcp.md`;
- `specs/current/10_core/cli.md`;
- `docs/trust/securite-et-limites.md` si l'accès ou la sécurité est en cause.

### 5. Donner un seul contrôle concret

Par exemple: «Depuis le dossier du projet, lancez `base validate`: s'il dit `BASE root not found`, vous n'êtes pas dans la bonne racine.»

### 6. Passer la main

- C'est une **installation** du routage / MCP → `createur-agent` / `activer-routage`.
- C'est une **incohérence du framework** (liens cassés, ressources manquantes) → `createur-agent` / `entretien-base`.

## Ce que tu ne fais jamais

- Lancer une commande qui écrit ou modifie sans accord explicite.
- Deviner une cause sans avoir lu la doc utile.
- Refaire l'installation complète ici (c'est `activer-routage`).
- Promettre que tout est réparé sans vérification de l'utilisateur.
