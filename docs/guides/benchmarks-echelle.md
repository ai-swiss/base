---
schema_version: base.resource.v1
id: benchmarks-echelle
type: document
title: Savoir quand activer l'index local (benchmarks)
description: Chiffres reproductibles pour décider, selon le nombre de documents, si le scan suffit ou si l'index local devient utile, et ce qu'il coûte.
scope: public
status: active
sensitivity: public
keywords: [benchmark, echelle, index, performance, reproductible]
---

# Savoir quand activer l'index local (benchmarks)

Si vous gérez un dépôt BASE et hésitez à activer l'index local, cette page vous donne des chiffres reproductibles pour trancher. Vous y verrez à partir de combien de documents le scan en mémoire ne suffit plus, ce que l'index apporte alors, et ce qu'il coûte.

## Reproduire

```bash
node packages/base-index-local/bin/base-index-local.mjs bench --sizes 100,1000,10000,50000
# ou
npm run bench:index
```

Corpus synthétique (agents + process, 20 process par agent), médiane de 20 requêtes par taille. Build à
froid; recherche mesurée à froid (scan du vocabulaire à chaque requête) et à chaud (vocabulaire en
cache sur l'objet index).

## Résultats (portable, Node 24)

| documents | build | recherche (froid) | recherche (chaud) |
|---:|---:|---:|---:|
| 105 | 9 ms | 0,01 ms | 0 ms |
| 1 050 | 10 ms | 0,03 ms | 0,01 ms |
| 10 500 | 83 ms | 0,65 ms | 0,13 ms |
| 52 500 | 394 ms | 5,3 ms | 0,9 ms |

Les chiffres varient selon la machine: relancez `bench` pour mesurer la vôtre. Aucun seuil agressif
n'est imposé en CI: un test *smoke* vérifie seulement que le rapport est produit, pas qu'il atteint un
nombre fragile.

## Lecture

- **Jusqu'à quelques milliers de documents**, le scan en mémoire du cœur est déjà instantané: l'index
  n'apporte rien d'observable. Ne l'activez pas.
- **À 10 000–50 000**, la construction reste sous la seconde et la recherche à chaud sous la
  milliseconde: l'index rend confortable ce qu'un scan répété rendrait coûteux.
- **Au-delà**, voir [Comprendre l'échelle](../learn/comprendre-echelle.md): un moteur externe devient
  légitime, derrière la même forme candidats → décision.

## Avec et sans embeddings

Les chiffres ci-dessus sont **lexicaux** (zéro dépendance). Les embeddings pré-calculés ajoutent un
coût au build (un appel fournisseur par document, groupé par lots) et un vecteur stocké par document; à la
requête, seule la requête est embeddée. Cette partie s'exécute à l'usage et dépend du modèle ou du
fournisseur; elle n'entre pas dans le gate de fraîcheur déterministe de l'index.
