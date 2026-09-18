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

Donner à l'assistant une **carte explicite** pour choisir le bon agent et le bon process. Un assistant qui lit les fichiers suit l'index généré. `base route` et `route_request` fournissent aussi un résultat déterministe aux appels sans modèle et une indication à vérifier quand un modèle est présent; ils ne décident pas à sa place.

## Pourquoi c'est utile (à expliquer simplement)

> «L'assistant choisit en lisant une carte générée depuis vos fiches. La CLI et le MCP peuvent aussi fournir un résultat déterministe, utile pour un script sans modèle ou comme indication à vérifier. Si rien ne convient, le routage le dit et pose une question.»

## Inputs

Interroge l'utilisateur, une question à la fois:
- **Quel outil utilisez-vous?** Une application de chat (ChatGPT, Claude Desktop) ou un outil avec terminal (Claude Code, Cursor)?
- Au besoin: **disposez-vous d'un terminal** et de **Node.js**?

Si l'utilisateur l'ignore, propose de regarder ensemble; ne présume rien.

## Étapes

### 1. Choisir la porte

Trois situations:

- **Assistant qui peut lire le dossier** (Claude Code, Cursor) → lire `.ai/routing/index.md`, puis l'index de l'agent retenu.
- **Application de chat qui ne peut pas lire le dossier** (ChatGPT, Claude Desktop) → **serveur MCP** (étape 2).
- **Script ou intégration sans modèle** → **CLI** (étape 3).

> «D'après votre outil, je propose [la carte / le MCP / la CLI]. On y va?»

← Reformulation (confirmer le chemin)

### 2. Porte MCP (apps de chat)

Le serveur MCP expose la carte de routage à l'application. `route_request` renvoie cette carte avec un résultat déterministe présenté comme une indication; le modèle choisit en lisant «Quand l'utiliser» et «Éviter si».

1. **Construire le serveur** (une seule fois). Si tu disposes d'un terminal, propose d'exécuter les commandes; sinon, transmets-les à l'utilisateur:
   ```bash
   cd mcp && npm install && npm run build
   ```
2. **Brancher dans l'app**:
   - **Claude Code / Desktop**: `claude mcp add base -- node <chemin>/mcp/dist/index.js --root <chemin>/votre-projet`
   - **ChatGPT (Mode Développeur)**: le lancer en HTTP avec un jeton, puis l'ajouter comme connecteur; voir `mcp/README.md`.
3. **Vérifier**: `claude mcp list` doit afficher `base … ✓ Connected`.

**⚠ Point de décision, avant d'installer:**
> «Je suis prêt à construire et brancher le serveur MCP. Je vous montre chaque commande avant. On continue?»

### 3. Porte CLI (outils avec terminal)

La CLI fournit le routage déterministe aux scripts et intégrations sans modèle, sans rien à installer de plus que BASE.

1. **Vérifier qu'elle répond**:
   ```bash
   node tools/base.mjs route "une demande de test" --root .
   ```
   (ou `base route "…" --root <dossier-base>` si le paquet est installé.)
2. Dans un appel sans modèle, charger l'agent et le process retournés. Si un modèle est présent, utiliser ce résultat comme une indication à vérifier contre la carte générée.

> «La CLI répond. Son résultat est déterministe; avec un assistant IA, je le vérifie contre la carte avant de choisir.»

### 4. Tester ensemble

Propose une vraie demande de l'utilisateur. Montre le choix fait à partir de la carte et, si la CLI ou le MCP est branché, l'indication déterministe. En cas de désaccord, relis «Quand l'utiliser» et «Éviter si» ou pose une question.

> «Essayons avec une vraie demande: … → voici où elle est routée, et pourquoi.»

> Pour un très grand catalogue de process, un routage par embeddings (Voie 2) peut affiner le choix: c'est un autre process, `activer-voie2` (installer Ollama et deux modèles locaux). Inutile pour un petit BASE; la lecture de la carte générée suffit généralement.

### 5. Si c'est trop technique

Sois honnête, jamais culpabilisant:

> «Cette étape touche à l'installation, il est normal qu'elle soit moins évidente. Deux options: nous la faisons ensemble, pas à pas, ou vous sollicitez une personne à l'aise avec un terminal; la documentation se trouve dans `mcp/README.md` et `docs/`. Sans cela, je continue à vous aider en lisant la carte générée.»

### 6. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`: porte choisie, état (branché / à finir), prochaine étape.

## Ce que tu ne fais jamais dans ce process

- **Installer ou modifier une configuration sans avoir d'abord montré et fait valider** chaque commande.
- **Présumer un fournisseur ou un outil.** La carte générée, le MCP et la CLI répondent à des situations différentes; c'est l'utilisateur qui choisit.
- **Culpabiliser un utilisateur non technique.** Propose l'aide d'un tiers, sans jargon, et rappelle que l'assistant peut déjà choisir en lisant la carte générée.
- **Confondre le routage local de BASE avec l'outil IA distant.** `base route` et le calcul déterministe derrière `route_request` restent locaux dans leur configuration par défaut. Séparément, l'outil IA peut déjà transmettre la conversation ou les fichiers qu'il ouvre à son fournisseur; des modèles de routage distants, un connecteur ou une autre intégration peuvent ajouter d'autres sorties.
