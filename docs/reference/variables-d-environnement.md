---
schema_version: base.resource.v1
id: variables-d-environnement
type: document
title: Les variables d'environnement
description: "Les neuf variables d'environnement qu'un utilisateur ou un opérateur peut poser: ce que chacune fait, ce qui se passe quand elle est absente, et le fichier qui la lit. Les trois qui lèvent un refus de sécurité sont signalées comme telles."
scope: public
status: active
sensitivity: public
keywords: [variables, environnement, configuration, mcp, studio, securite, exposition, deploiement, trace, progression]
---

# Les variables d'environnement

BASE se configure d'abord par des fichiers (`base.config.json`, la configuration utilisateur) et par les drapeaux des commandes. Neuf variables d'environnement complètent cette surface. Les variables de développement et d'évaluation (`ROUTE_EVAL_*`, `STUDIO_*_PORT`, `BASE_DOCS_*`) ne font pas partie de la surface produit et sont décrites dans la documentation des contributeurs.

Aucune de ces neuf variables n'a besoin d'être posée pour que BASE fonctionne. Chaque ligne ci-dessous dit ce que BASE fait quand vous ne posez rien.

## Ce qu'un déploiement expose

Ces cinq variables changent le comportement d'un serveur, le serveur MCP ou le Studio. Trois d'entre elles lèvent un refus; elles sont détaillées juste après le tableau.

| Variable | Ce qu'elle fait | Absente | Lue dans |
|---|---|---|---|
| `BASE_MCP_READ_ONLY` | `1` impose la lecture seule: les outils d'écriture et d'exécution ne sont pas exposés, et rien n'est écrit dans le corpus. `0` autorise l'écriture sur le transport HTTP, qui l'interdit par défaut. Les drapeaux `--read-only` et `--read-write` l'emportent sur la variable. | Le transport stdio est en lecture-écriture, le transport HTTP en lecture seule. | `mcp/src/transport.ts` |
| `BASE_MCP_BEARER_TOKEN` | Le jeton partagé de l'authentification `Bearer`. Sa présence active l'authentification, ce qui autorise du même coup l'écoute sur une interface autre que la boucle locale. Une configuration qui déclare `auth: bearer` exige ce jeton et échoue en `base.config.invalid` s'il manque. | Aucune authentification. L'écoute reste alors limitée à la boucle locale. | `mcp/src/auth.ts` |
| `BASE_MCP_ALLOW_INSECURE_REMOTE` | `1` lève le refus d'écouter sur une interface autre que la boucle locale sans authentification. | Le serveur journalise le refus et s'arrête avec le code 1. | `mcp/src/transport.ts` |
| `BASE_MCP_ALLOW_CONFIDENTIAL` | `1` affirme que le client connecté est local, ce qui libère vers la surface de lecture les ressources confidentielles et celles d'une racine `local-only`. Le démarrage écrit un avertissement qui nomme la variable. | Le client est traité comme distant: ces ressources sont retenues, y compris dans l'inventaire et la recherche. | `mcp/src/base-core-adapter.ts`, `mcp/src/index.ts` |
| `BASE_STUDIO_ALLOW_INSECURE_REMOTE` | `1` lève le refus du Studio d'écouter ailleurs que sur la boucle locale. | Le Studio refuse de démarrer sur une telle adresse, que la liaison vienne de `startStudioServer` ou d'un `listen()` direct. | `tools/studio/server.mjs` |

### Les trois refus, et ce que vous acceptez en les levant

- **`BASE_MCP_ALLOW_INSECURE_REMOTE=1`.** Par défaut, le serveur MCP refuse d'écouter sur une interface autre que la boucle locale tant qu'aucune authentification n'est configurée. En levant ce refus sans configurer `BASE_MCP_BEARER_TOKEN` ou un proxy inverse authentifié, vous acceptez que toute machine capable d'atteindre ce port atteigne les outils MCP exposés.
- **`BASE_STUDIO_ALLOW_INSECURE_REMOTE=1`.** Le Studio refuse la même exposition, pour une raison plus lourde: il n'a aucune authentification, il expose des points d'écriture (`/api/propose`, `/api/commit`) et le lancement d'une évaluation qui peut appeler des fournisseurs de modèles avec les clés d'API du serveur. En levant ce refus, vous acceptez que quiconque atteint ce port écrive dans vos fichiers et dépense vos clés.
- **`BASE_MCP_ALLOW_CONFIDENTIAL=1`.** Par défaut, le serveur MCP ignore la localité du client qui l'appelle et traite donc sa surface de lecture comme un contexte distant: une ressource marquée confidentielle, ou une ressource d'une racine déclarée `local-only`, n'est ni ouverte, ni citée par le routage, ni même listée par l'inventaire. En posant la variable, vous affirmez que le client connecté est local, et ces ressources peuvent alors partir vers le modèle.

## Votre poste

Ces quatre variables ne changent rien à ce qu'un déploiement expose. Elles ajustent votre environnement de travail.

| Variable | Ce qu'elle fait | Absente | Lue dans |
|---|---|---|---|
| `BASE_CONFIG_HOME` | Remplace le dossier personnel servant à trouver la configuration utilisateur (`<home>/.config/base/config.json`), celle que `base init` écrit et que le lanceur consulte pour retrouver le cadre. Utile pour isoler une installation ou un test. | Le dossier personnel du système. | `tools/cli/framework.mjs`, `tools/cli/init.mjs`, `tools/core/launcher.mjs` |
| `BASE_TRACE_ACTOR` | Renseigne le champ `actor` des événements écrits dans le journal local `.ai/trace/`, pour une session en ligne de commande. Un acteur porté par la requête, celui de l'authentification MCP, l'emporte sur la variable. | Le champ `actor` est simplement omis. | `tools/core/trace.mjs` |
| `BASE_PROGRESS` | Rend visibles les lignes de progression sur la sortie d'erreur quand celle-ci n'est pas un terminal: une étape par ligne, lisible dans un tube ou un journal d'intégration continue. N'importe quelle valeur non vide suffit. | Hors terminal, aucune ligne de progression. Sur un terminal, elles s'affichent de toute façon et se réécrivent sur place. | `tools/core/progress.mjs` |
| `STUDIO_CHAT_CONTEXT_TOKENS` | Le budget de jetons estimé du chat du Studio avant que l'historique ancien soit compacté. Une valeur entière positive. | 12 000 jetons. | `tools/studio/chat.mjs` |

## Pour aller plus loin

- L'exposition du serveur MCP et ses transports: [`mcp/README.md`](../../mcp/README.md).
- Ce qui reste local et ce qui peut sortir: [La frontière, local par défaut](../trust/frontiere-local-vs-sortant.md).
- Le journal local et sa rétention: [Protection des données](../trust/protection-des-donnees.md).
- Le modèle de sécurité et ses limites: [Sécurité et limites](../trust/securite-et-limites.md).
