---
schema_version: base.resource.v1
id: securite-donnees-routage
type: document
title: Garder vos données sous contrôle quand le routage utilise un provider
description: Pour les équipes techniques: savoir quelles chaînes partent vers un provider d'embeddings, comment réduire l'exposition, brancher un proxy interne et journaliser sans contenu métier.
scope: public
status: active
sensitivity: public
keywords: [securite, donnees, embeddings, confidentialite, proxy, journalisation]
---

# Garder vos données sous contrôle quand le routage utilise un provider

Dès que le routage sémantique de BASE s'appuie sur un provider d'embeddings, du texte quitte votre machine: il faut alors pouvoir dire précisément lequel, et comment le maîtriser. À l'intention des équipes qui branchent ce routage, cette page expose ce qui part réellement, comment réduire l'exposition, comment passer par un proxy interne et comment journaliser sans jamais révéler de contenu métier.

## Aucun envoi sans configuration explicite

Le cœur de BASE n'appelle **jamais** un fournisseur. En configuration sans provider, aucune donnée ne quitte la machine. Un envoi ne devient possible que si vous fournissez un `embed`, directement ou via `createOpenAICompatibleEmbedder` / `createOllamaEmbedder`. Le chemin zéro-config (lexical + `semanticHybrid`) reste entièrement local.

## Quelles chaînes sont envoyées

Une fois un provider configuré, deux types de texte peuvent partir vers lui:

1. **La requête**, c'est-à-dire la demande de l'utilisateur.
2. **Le texte de chaque ressource routable**: par défaut `route_text` + `title` + `description` +
   `keywords` + `body` (`textForResource`). Ce périmètre reste sous votre contrôle.

## Réduire l'exposition

- **Pré-calculez** les vecteurs des ressources dans un environnement maîtrisé (`@ai-swiss/base-index-local`)
  et servez-les via `getResourceEmbedding`. Au moment de la requête, **seule la requête** part.
- **Réduisez `textOf`** au strict nécessaire pour bien router; souvent, `route_text` seul suffit:

  ```js
  createSemanticRanker({ embed, textOf: (r) => [r.route_text, r.title].filter(Boolean).join("\n") });
  ```

- **Restez local** avec `createOllamaEmbedder()`: aucune sortie réseau.
- **Passez par une passerelle interne**: `createOpenAICompatibleEmbedder({ baseUrl })` pointé vers un reverse
  proxy sous votre contrôle (auth, mTLS, DLP). Bien réglé, ce proxy maintient le texte métier hors de tout point d'accès public.

## Secrets

`createOpenAICompatibleEmbedder` lit `OPENAI_API_KEY` par défaut, mais accepte aussi un `apiKey` explicite.
Conservez les clés dans un gestionnaire de secrets ou des variables d'environnement, jamais dans le
dépôt. Un échec d'authentification porte le type `EmbeddingAuthError` (`code: "semantic.auth"`) et **n'est jamais
retenté**: une clé erronée échoue aussitôt, au lieu de harceler le fournisseur.

## Journaliser sans contenu métier

Le hook `onMetric` ne remonte que des signaux opérationnels (`{ provider, batchSize, attempt,
latencyMs, cacheHit, similarity, dimension }`): **aucun texte, aucun vecteur**. Vous pouvez les journaliser
librement; en revanche, ne journalisez jamais les chaînes envoyées au provider ni la requête brute lorsque le corpus est sensible.

```js
createSemanticRanker({ embed, onMetric: (m) => logger.info({ embedding: m }) }); // sûr: pas de contenu
```

## Annulation et limites

Chaque appel au provider respecte un `timeoutMs` et un `AbortSignal` (`ctx.signal`): un embedding trop long ou
qui s'emballe peut être borné, puis annulé depuis la CLI, le MCP ou un serveur.

## Périmètre

Le routage sémantique améliore la **pertinence**; il ne se substitue pas aux politiques IAM, DLP, SIEM ou
de rétention de votre organisation. Voir aussi [`docs/trust/securite-et-limites.md`](securite-et-limites.md).
