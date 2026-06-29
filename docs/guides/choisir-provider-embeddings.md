---
schema_version: base.resource.v1
id: choisir-provider-embeddings
type: document
title: Choisir son provider d'embeddings
description: Comparer local, cloud, gateway d'entreprise, modèle interne et embeddings pré-calculés selon confidentialité, coût, latence, qualité et gouvernance.
scope: public
status: active
sensitivity: public
keywords: [embeddings, provider, ollama, openai, gateway, confidentialite, gouvernance]
---

# Choisir son provider d'embeddings

Cette page aide quiconque met BASE en production à choisir la provenance de ses embeddings, selon ses
contraintes de confidentialité, de coût et de gouvernance. Calculer les embeddings d'un texte relève
d'un choix explicite: vous passez un `embed` à `createSemanticRanker`, et BASE ne vous en impose
**aucun**.

## Les options

| Option | Comment | Quand |
|---|---|---|
| **Local (Ollama)** | `createOllamaEmbedder()`, tout reste sur `localhost` | confidentialité maximale, offline, démos, postes individuels |
| **Cloud (OpenAI-like)** | `createOpenAICompatibleEmbedder({ model })` | qualité élevée, aucune infrastructure à gérer, mais les données peuvent sortir |
| **Gateway d'entreprise** | `createOpenAICompatibleEmbedder({ baseUrl })` vers un proxy interne | grande organisation: auth, journalisation, DLP au niveau du proxy |
| **Modèle interne** | un `embed: async (t) => monModele.embed(t)` quelconque | pile ML maison, souveraineté, modèle spécialisé |
| **Pré-calculé (index)** | `getResourceEmbedding` servi par `vectorFor(index, resource)` de `@ai-swiss/base-index-local` | gros corpus; le texte ressource ne transite pas à la requête |

BASE ne fournit volontairement **aucun** assistant «meilleur provider»: graver une préférence technique
dans le cœur reviendrait à choisir à votre place.

## Les critères

- **Confidentialité.** Le texte sort-il de votre périmètre? Local et gateway interne le retiennent;
  le cloud public l'expédie au-dehors. Voir [Sécurité & données](../trust/securite-donnees-routage.md).
- **Coût.** Le cloud se paie au token; le local, en matériel; le pré-calculé s'amortit dès le build.
- **Latence.** Le local dépend de votre machine, le cloud de la liaison réseau; le pré-calculé est
  quasi nul, puisque seule la requête se calcule au moment voulu.
- **Qualité.** Les grands modèles cloud l'emportent souvent; pour du routage, un bon modèle local
  suffit le plus souvent, car le `route_text` est court et discriminant.
- **Gouvernance.** Un gateway offre un point unique pour l'authentification, la journalisation
  expurgée, la rétention et la conformité, sans toucher au cœur de BASE.

## Robustesse, quel que soit le choix

Tous les providers du package héritent des mêmes garanties: `timeoutMs`, `AbortSignal` (`ctx.signal`),
relances bornées sur les seules erreurs transitoires, backoff avec jitter, erreurs typées (`.code`).
Une clé erronée échoue aussitôt (`semantic.auth`, jamais relancée); une panne réseau, elle, donne
lieu à de nouvelles tentatives (`semantic.network`).

## Réduire ce qui est envoyé

- **Pré-calculez** les vecteurs ressource au moyen d'un index: seule la requête part en direct.
- **Limitez `textOf`** au strict nécessaire; bien souvent, `route_text` suffit.
- **Passez par un proxy** interne pour ne pas exposer directement un endpoint public.

Pour le détail complet: [Sécurité & données du routage](../trust/securite-donnees-routage.md).
