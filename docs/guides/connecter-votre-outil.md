---
schema_version: base.resource.v1
id: connecter-votre-outil
type: document
title: Connecter votre outil IA
description: Un tableau par outil pour brancher BASE en une étape, du simple dossier ouvert dans un outil IA jusqu'au serveur MCP pour une équipe.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
compatibility: [navigateur, cli, mcp]
keywords: [connecter, outil, cursor, claude, chatgpt, copilot, mcp, installer, demarrer]
---

# Connecter votre outil IA

Brancher BASE sur l'outil IA que vous utilisez déjà, c'est garder la méthode lisible et **valider au bon moment** au lieu de déléguer sans regarder: vous demeurez la personne qui décide, l'outil exécute sous vos yeux. Encore faut-il un outil IA capable de lire vos fichiers (GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code, par exemple); BASE s'y greffe.

Dans la plupart des cas, deux niveaux suffisent. Commencez par le plus simple.

## Le plus simple: ouvrir le dossier

Aucune installation. Vous ouvrez un dossier d'exemple (ou votre propre BASE) dans un outil qui lit les fichiers de projet. Les artefacts projetés (`CLAUDE.md`, `.cursor/rules/`) transmettent à l'outil le contexte BASE et la règle de routage. Ils ne désignent pas pour autant un agent métier: c'est à votre première demande de porter une intention.

| Outil | Ce que vous faites |
|-------|--------------------|
| **Cursor** | Ouvrez le dossier. La règle `.cursor/rules/assistant.mdc` charge le contexte BASE. Dites par exemple «Bonjour, je voudrais configurer mon activité». |
| **Claude Code** | Ouvrez le dossier. `CLAUDE.md` charge le contexte BASE. Dites par exemple «Bonjour, je voudrais configurer mon activité». |
| **Claude Desktop / ChatGPT (sans MCP)** | Collez un pack navigateur (voir [Obtenir BASE](../start/obtenir-base.md)) et formulez une demande concrète. Mode consignes, sans garanties mécaniques. |
| **Autre éditeur lisant `AGENTS.md`** | Ouvrez le dossier; l'`AGENTS.md` projeté décrit l'agent. |

C'est le palier du navigateur et du fichier: le modèle suit la méthode, et vous gardez la main pour la relire.

## Pour une équipe: le serveur MCP de BASE

Lorsque vous tenez aux **garanties mécaniques** (routage déterministe par défaut, écriture médiée qui propose puis commit, exécution gardée), branchez le serveur MCP de BASE. C'est le même broker qu'en CLI, exposé cette fois à votre outil.

| Outil | Procédure |
|-------|-----------|
| **Claude Desktop** | Ajoutez un `mcpServers` pointant le serveur BASE. Détail exact: [`mcp/README.md`](../../mcp/README.md). |
| **Cursor** | Paramètres MCP, ajoutez le serveur BASE. Détail: [`mcp/README.md`](../../mcp/README.md). |
| **VS Code (MCP)** | Configuration MCP de l'extension, serveur en `stdio`. Détail: [`mcp/README.md`](../../mcp/README.md). |
| **ChatGPT** | Mode développeur, endpoint HTTPS authentifié. Procédure et sécurité: [`mcp/README.md`](../../mcp/README.md). |

Forme minimale d'un serveur local en `stdio` (chemins à adapter):

```json
{
  "mcpServers": {
    "base": {
      "command": "node",
      "args": ["/chemin/vers/mcp/dist/index.js", "--root", "/chemin/vers/votre/projet"]
    }
  }
}
```

Pour une lecture seule, ajoutez `--read-only`. La référence complète (modes, distant, authentification, sécurité) figure dans [`mcp/README.md`](../../mcp/README.md), qui fait foi.

## Quel palier pour quel besoin

| Besoin | Palier |
|--------|--------|
| Essayer, découvrir, poste individuel | Ouvrir le dossier |
| Coller un assistant dans un navigateur | Pack navigateur |
| Garanties mécaniques, équipe, écriture médiée | Serveur MCP |

## Votre outil n'est pas listé

Le principe vaut pour la plupart des outils qui lisent des fichiers de projet ou dialoguent en MCP. Chargez l'agent d'accueil (`concierge-base`) et demandez «aide-moi à connecter BASE à mon outil»: il lit la documentation de votre outil et vous guide, sans jamais relâcher la couture de validation. Voir aussi [BASE et vos outils IA](../reference/base-et-vos-outils-ia.md).
