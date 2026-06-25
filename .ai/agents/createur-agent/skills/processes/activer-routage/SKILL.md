---
schema_version: base.resource.v1
id: activer-routage
type: process
title: Activer le routage
scope: team
status: active
sensitivity: internal
name: activer-routage
description: "Activer le routage déterministe de BASE (serveur MCP ou CLI). Utiliser quand le routage n'est pas branché, quand l'assistant doit choisir lui-même le bon agent, ou quand l'utilisateur demande à installer/configurer le routeur."
use_when: Quand l'utilisateur veut activer, installer, brancher ou configurer le routage BASE, la CLI `base route`, le serveur MCP ou `route_request`.
routing:
  examples:
    - Activer le routage BASE
    - Brancher route_request
    - Installer le serveur MCP pour choisir le bon agent
    - Configurer base route
  avoid_when:
    - Créer un nouvel assistant métier.
    - Auditer ou nettoyer un BASE existant.
    - Comprendre ou expliquer comment fonctionne le routage (c'est quoi, comment ça marche).
argument-hint: "[outil utilisé : Claude, ChatGPT, Cursor, terminal…]"
user-invocable: true
allowed-tools: Read Bash
---

# Activer le routage

Donner à l'assistant un **routeur fiable**: au lieu de deviner quel agent répond à une demande, il interroge un moteur déterministe (testé, capable de dire honnêtement «je ne sais pas»). Ce process branche ce moteur, par l'une de deux portes: le **serveur MCP** (pour les apps de chat) ou la **CLI** (pour les outils avec terminal).

## Pourquoi c'est utile (à expliquer simplement)

> «Aujourd'hui, l'assistant choisit le bon savoir-faire en lisant des instructions; ça marche, mais ça peut se tromper sans le dire. En activant le routage, il s'appuie sur un moteur qui choisit toujours de la même façon, et qui dit clairement quand la demande sort de son périmètre. Cinq minutes à brancher, et c'est plus fiable pour toujours.»

## Inputs

Demande à l'utilisateur, une question à la fois:
- **Quel outil utilisez-vous?** Une app de chat (ChatGPT, Claude Desktop) ou un outil avec terminal (Claude Code, Cursor)?
- Au besoin: **avez-vous un terminal** et **Node.js** installés?

Si l'utilisateur ne sait pas, propose de regarder ensemble; ne présume rien.

## Étapes

### 1. Choisir la porte

Deux chemins, même moteur:

- **App de chat sans terminal** (ChatGPT, Claude Desktop) → **serveur MCP** (étape 2).
- **Outil avec terminal** (Claude Code, Cursor) → **CLI**, plus simple (étape 3).

> «D'après votre outil, je propose [MCP / la CLI]. On y va?»

← Reformulation (confirmer le chemin)

### 2. Porte MCP (apps de chat)

Le serveur MCP expose le routeur comme un outil que l'app peut appeler.

1. **Construire le serveur** (une fois). Si tu as un terminal, propose d'exécuter; sinon, donne les commandes à l'utilisateur:
   ```bash
   cd mcp && npm install && npm run build
   ```
2. **Brancher dans l'app**:
   - **Claude Code / Desktop**: `claude mcp add base -- node <chemin>/mcp/dist/index.js --root <chemin>/votre-projet`
   - **ChatGPT (Mode Développeur)**: lancer en HTTP avec un jeton, puis l'ajouter comme connecteur; voir `mcp/README.md`.
3. **Vérifier**: `claude mcp list` doit afficher `base … ✓ Connected`.

**⚠ Point de décision, avant d'installer:**
> «Je suis prêt à construire et brancher le serveur MCP. Je vous montre chaque commande avant. On continue?»

### 3. Porte CLI (outils avec terminal)

La CLI, c'est **le même routeur déterministe**, sans rien installer de plus que BASE.

1. **Vérifier que ça répond**:
   ```bash
   node tools/base.mjs route "une demande de test" --root .
   ```
   (ou `base route "…" --root <dossier-base>` si le paquet est installé.)
2. L'assistant peut alors, pour toute demande, exécuter `base route "<demande>" --root <dossier-base>`, lire l'agent → process retourné, et le charger.

> «Le routeur répond. À partir de maintenant, je peux router vos demandes de façon fiable.»

### 4. Tester ensemble

Propose une vraie demande de l'utilisateur et montre le résultat (agent + process, ou abstention honnête).

> «Essayons avec une vraie demande: … → voici où ça route, et pourquoi.»

> Pour un très grand catalogue de process, un routage par embeddings (Voie 2) peut affiner le choix: c'est un autre process, `activer-voie2` (installer Ollama, deux modèles locaux). Inutile pour un petit BASE; le routage déterministe branché ici suffit.

### 5. Si c'est trop technique

Sois honnête, jamais culpabilisant:

> «Cette étape touche à l'installation, c'est normal qu'elle soit moins évidente. Deux options: on la fait ensemble pas à pas, ou vous demandez à une personne à l'aise avec un terminal; la doc est dans `mcp/README.md` et `docs/`. Sans ça, je continue à vous aider en lisant les fichiers; c'est juste un peu moins fiable.»

### 6. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`: porte choisie, état (branché / à finir), prochaine étape.

## Ce que tu ne fais jamais dans ce process

- **Installer ou modifier une configuration sans montrer et faire valider** chaque commande d'abord.
- **Présumer un fournisseur ou un outil.** MCP et CLI sont deux portes; l'utilisateur choisit.
- **Culpabiliser un utilisateur non technique.** Propose l'aide d'un tiers, sans jargon, et rappelle que l'assistant fonctionne déjà sans routage (juste moins fiable).
- **Promettre qu'aucun fournisseur ne sera jamais appelé**: `base route` et `route_request` avec le ranker local ne sortent rien du projet. Une configuration d'embeddings, un connecteur ou une plateforme IA externe peut en revanche transmettre du contenu selon le choix explicite de l'utilisateur.
