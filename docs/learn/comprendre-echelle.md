---
schema_version: base.resource.v1
id: comprendre-echelle
type: document
title: Choisir entre scan, index local et base externe selon votre échelle
description: Décider entre scan en mémoire, index local et moteur externe à partir de mesures sur son propre corpus.
scope: public
status: active
sensitivity: public
keywords: [echelle, index, scan, projection, performance, benchmark]
---

# Choisir entre scan, index local et base externe selon votre échelle

Commencez par le mécanisme le plus simple, mesurez-le sur votre corpus, puis changez seulement si la mesure révèle une limite. Les ordres de grandeur ci-dessous orientent un essai, ils ne promettent pas une vitesse universelle.

## Scan en mémoire

Par défaut, `routeRequest` lit les ressources et les score en mémoire. Cette option évite tout état et tout artefact à régénérer. Elle convient tant que sa latence, sa consommation de mémoire et son débit restent acceptables dans votre environnement.

## Index local

Un index local devient utile lorsque les scans répétés coûtent trop cher. Le paquet `@ai-swiss/base-index-local` permet de construire l'index, de router et de mesurer:

```bash
base-index-local build <projet>
base-index-local route <projet> "préparer un devis client"
base-index-local bench --sizes 100,1000,10000,50000
```

Les [benchmarks reproductibles](../guides/benchmarks-echelle.md) utilisent un corpus et des requêtes synthétiques. Ils isolent le coût technique sur un matériel et un logiciel explicités, mais ne mesurent ni la qualité du routage ni la latence de vos requêtes réelles. Mesurez celles-ci séparément sur un échantillon représentatif de votre corpus.

L'index reste une **projection**, au sens du [glossaire](../reference/glossaire.md): il se reconstruit depuis les sources. Par défaut, `routeWithIndex` utilise `candidateMode: "all"` et rescrore toutes les ressources routables avec le même ranker et le même routeur que le chemin en mémoire; c'est cette configuration qui vise la parité de statut, d'agent et de process. Le mode `"lexical"` ne rescrore que les candidats trouvés dans les postings. Il préserve cette parité avec un ranker lexical compatible, mais peut écarter un résultat qu'un ranker sémantique ou hybride aurait trouvé.

## Moteur externe

Un moteur dédié peut se justifier pour un corpus distribué, plusieurs locataires, des contraintes de disponibilité ou un volume que l'index local ne sert plus correctement. BASE n'en impose aucun: l'intégration conserve la forme candidats puis décision, tandis que l'exploitation, les permissions, l'egress et les tests relèvent du dispositif choisi.

## Garder l'index dérivé

- Supprimer `.ai/index/local.json` ne supprime aucune source.
- Deux constructions depuis les mêmes signaux dérivés doivent produire le même index.
- Les embeddings calculés à l'exécution ne rendent pas leurs scores sémantiques déterministes.
- Un catalogue tenu à la main ne doit pas devenir une seconde source de vérité.

## Prochaine action

Exécutez d'abord le benchmark synthétique sur trois tailles proches de votre corpus, puis rejouez un échantillon de requêtes réelles et notez séparément latence, route attendue et abstentions. Ne changez de stratégie que si un seuil métier explicite est dépassé.
