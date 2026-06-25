---
schema_version: base.resource.v1
id: docs-tutoriel-equipe-3-distribuer
type: document
title: Distribuer à une équipe
description: Versionnez votre BASE par git, puis levez vraiment le serveur MCP et connectez un outil: routage déterministe et écritures médiées, pour toute l'équipe.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [equipe, distribuer, git, mcp, versioning, pull request, veytaux, tourisme]
audience: [builder]
learning_level: advanced
---

# Distribuer à une équipe

*⏱ ~20 min · module 3/3, parcours Équipe*

**Vous allez**: versionner votre BASE par git ET lever un serveur MCP qu'un outil interroge, prouvé par le ✅ ci-dessous.
**Il vous faut**: le module 2 terminé; git et Node 18+ installés; le dépôt BASE en local; votre projet `~/mon-assistant`.
↻ **Rappel**: sans regarder: comment BASE empêche une fuite de données confidentielles? (la règle d'egress, contrôlée avant l'appel)

Distribuer un BASE, c'est distribuer des fichiers: **git** pour l'historique et la revue, **MCP**
pour les garanties mécaniques partagées (routage déterministe, écritures médiées), pour toute l'équipe.

1. **Versionnez.** Dans votre projet, initialisez git et commitez:

   ```
   cd ~/mon-assistant
   git init && git add -A && git commit -m "Mon BASE, départ"
   ```

   Les ressources sont du Markdown: un changement de process se relit comme un diff. Une
   amélioration = une branche + une **pull request**, relue avant de fusionner.

2. **Levez le serveur MCP.** Depuis le dépôt BASE:

   ```
   cd mcp/
   npm install
   npm run build
   npm start -- --root ~/mon-assistant
   ```

3. **Connectez un outil.** Pour Claude Desktop (Cursor est identique, dans ses réglages MCP),
   ajoutez à `claude_desktop_config.json` un chemin ABSOLU, puis redémarrez l'outil:

   ```
   {
     "mcpServers": {
       "base": {
         "command": "node",
         "args": ["/chemin/absolu/vers/mcp/dist/index.js", "--root", "/chemin/absolu/vers/mon-assistant"]
       }
     }
   }
   ```

   (ChatGPT exige en plus une URL HTTPS et un jeton: le pas à pas par outil est dans
   [installer le serveur MCP](../start/installer-mcp.md).)

✅ **Vérifiez**: `git log` montre votre commit (un changement de process apparaîtra comme un diff lisible, prêt pour une revue); et votre outil, connecté via MCP, répond à *«Quels agents j'ai?»* en listant les agents de `mon-assistant`.

💡 **Pourquoi ça a marché**: git rend l'évolution traçable et révisable; MCP donne à toute l'équipe le MÊME routeur déterministe et des écritures médiées, sans que chacun touche la CLI. La sécurité s'applique par défaut: en HTTP le serveur est en lecture seule, et une exposition réseau sans `BASE_MCP_BEARER_TOKEN` est refusée au démarrage. La gouvernance reste auditable parce qu'elle est en clair, dans les fichiers.

🔁 **Chez vous**: qui, dans votre équipe, relira les changements de process avant fusion? Et quel poste hébergera le serveur MCP?

→ **Et maintenant**: vous avez parcouru les trois parcours. Gardez le réflexe: geste, vérification, puis seulement le concept.

🆘 **Pannes courantes**: *`npm: command not found`*: installez Node 18+ depuis nodejs.org. *Le serveur refuse de démarrer en réseau*: c'est voulu sans authentification, définissez `BASE_MCP_BEARER_TOKEN`. *La plateforme ne voit aucun agent*: vérifiez le `--root` (chemin absolu) et qu'il contient `.ai/agents/*/AGENT.md`. *Config par outil*: voir [installer le serveur MCP](../start/installer-mcp.md).
