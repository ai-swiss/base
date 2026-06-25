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

Brancher BASE sur l'outil IA que vous utilisez déjà, c'est garder la méthode lisible et **valider au bon moment** plutôt que de déléguer sans regarder: vous restez la personne qui décide, l'outil exécute sous votre regard. Cela suppose un outil IA capable de lire vos fichiers (par exemple GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code); BASE s'y greffe.

Deux niveaux suffisent dans la plupart des cas. Commencez par le plus simple.

## Le plus simple: ouvrir le dossier

Aucune installation. Vous ouvrez un dossier d'exemple (ou votre propre BASE) dans un outil qui lit les fichiers de projet. Les artefacts projetés (`CLAUDE.md`, `.cursor/rules/`) donnent à l'outil le contexte BASE et la règle de routage. Ils ne choisissent pas automatiquement un agent métier: votre première demande doit porter une intention.

| Outil | Ce que vous faites |
|-------|--------------------|
| **Cursor** | Ouvrez le dossier. La règle `.cursor/rules/assistant.mdc` charge le contexte BASE. Dites par exemple «Bonjour, je voudrais configurer mon activité». |
| **Claude Code** | Ouvrez le dossier. `CLAUDE.md` charge le contexte BASE. Dites par exemple «Bonjour, je voudrais configurer mon activité». |
| **Claude Desktop / ChatGPT (sans MCP)** | Collez un pack navigateur (voir [Obtenir BASE](../start/obtenir-base.md)) et formulez une demande concrète. Mode consignes, sans garanties mécaniques. |
| **Autre éditeur lisant `AGENTS.md`** | Ouvrez le dossier; l'`AGENTS.md` projeté décrit l'agent. |

C'est le palier navigateur et fichier: le modèle suit la méthode, et vous gardez la main pour la relire.

## Pour une équipe: le serveur MCP de BASE

Quand vous voulez les **garanties mécaniques** (routage déterministe par défaut, écriture médiée qui propose puis commit, exécution gardée), branchez le serveur MCP de BASE. C'est le même broker qu'en CLI, exposé à votre outil.

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

En lecture seule, ajoutez `--read-only`. La référence complète (modes, distant, authentification, sécurité) vit dans [`mcp/README.md`](../../mcp/README.md), source de vérité.

## Quel palier pour quel besoin

| Besoin | Palier |
|--------|--------|
| Essayer, découvrir, poste individuel | Ouvrir le dossier |
| Coller un assistant dans un navigateur | Pack navigateur |
| Garanties mécaniques, équipe, écriture médiée | Serveur MCP |

## Votre outil n'est pas listé

Le principe vaut pour la plupart des outils qui lisent des fichiers de projet ou parlent MCP. Chargez l'agent d'accueil (`concierge-base`) et demandez «aide-moi à connecter BASE à mon outil»: il lit la documentation de votre outil et vous guide, en gardant la couture de validation. Voir aussi [BASE et vos outils IA](../reference/base-et-vos-outils-ia.md).
