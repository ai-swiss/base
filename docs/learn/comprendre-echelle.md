---
schema_version: base.resource.v1
id: comprendre-echelle
type: document
title: Choisir entre scan, index local et base externe selon votre échelle
description: Comment décider entre le scan en mémoire, un index local ou une base externe selon la taille de votre corpus, et pourquoi l'index reste une projection régénérable.
scope: public
status: active
sensitivity: public
keywords: [echelle, index, scan, projection, performance, benchmark]
---

# Choisir entre scan, index local et base externe selon votre échelle

Bien dimensionner le routage de BASE, c'est éviter deux écueils: payer une infrastructure dont vous
n'avez pas besoin, ou heurter un mur de lenteur quand le corpus grossit. Cette page vous donne une règle
de décision chiffrée, des petits projets aux corpus volumineux, pour savoir quand le scan en mémoire
suffit, quand un index local devient utile, et quand une base externe se justifie.

## Quand le scan en mémoire suffit

Par défaut, `routeRequest` lit les ressources et les score en mémoire. Cette approche est simple, sans
état ni artefact à régénérer, et elle **suffit** pour des centaines, voire quelques milliers de
ressources. La plupart des projets n'ont pas besoin d'autre chose. Ne complexifiez pas avant
d'observer un coût.

## Quand un index local aide

Quand le corpus grandit (dizaines de milliers de ressources) et qu'un scan par requête devient
inconfortable, dérivez un index local avec `@ai-swiss/base-index-local`:

```bash
base-index-local build  <projet>
base-index-local route  <projet> "préparer un devis client"
base-index-local bench  --sizes 100,1000,10000,50000
```

L'index est une **projection locale**: il évite de relire tout le filesystem et peut servir une liste de
postings pour la recherche lexicale. Mesuré sur un portable (voir [Benchmarks](../guides/benchmarks-echelle.md)):
un index de **52 500 documents** se construit en ~0,4 s et se recherche à chaud en **moins d'1 ms**.

Le routage indexé retourne les mêmes statuts que le routage en mémoire par défaut. Pour
préserver cette parité, `routeWithIndex` score tous les routables stockés dans l'index avec le même
Ranker et le même Router injectés. Les équipes qui savent que leur routage est compatible lexicalement
peuvent activer un préfiltrage par postings (`candidateMode: "lexical"`) comme optimisation explicite.

## Quand une base externe devient légitime

Au-delà (millions de documents, recherche distribuée, multi-tenant), un moteur dédié (OpenSearch, une
base vectorielle, un gateway interne) devient justifié. BASE ne l'impose pas et ne l'embarque pas dans
le cœur: il expose la même forme (candidats → décision) pour que vous branchiez le moteur de votre
choix derrière elle.

## Pourquoi l'index reste une projection

L'index n'est **jamais** une source de vérité. Il est reconstruit de façon déterministe depuis:
inventaire, signaux de routage dérivés, frontmatter, titres/descriptions, `route_text`, et embeddings
optionnels. Conséquences:

- **Supprimable.** Effacez `.ai/index/local.json`: vous ne perdez rien, régénérez-le.
- **Déterministe.** Deux builds des mêmes fichiers sont identiques: un gate CI peut en vérifier la
  fraîcheur (`git diff --exit-code`). *Les embeddings runtime ne sont pas concernés par ce gate:
  l'index reste déterministe pour les signaux dérivés, pas pour des scores sémantiques calculés.*
- **Pas de catalogue manuel.** Aucune table maintenue à la main ne peut diverger des fichiers.

## En une phrase

BASE sait quand le scan suffit, quand l'index aide et combien chaque option coûte. Des benchmarks
reproductibles le mesurent: c'est mieux qu'une affirmation.
