---
schema_version: base.resource.v1
id: ecrire-pour-le-routeur
type: document
title: Écrire pour le routeur
description: Formuler use_when, routing.examples et avoid_when pour que le routeur lexical trouve le bon process, puis vérifier et figer le comportement avec des fixtures.
scope: public
status: active
sensitivity: public
keywords: [routage, use_when, examples, avoid_when, fixtures, route-test, formulation, createur]
---

# Écrire pour le routeur

Si une demande comme «Prépare un devis pour Dupont SA» n'atteint pas le bon process, votre assistant reste muet ou répond à côté: c'est la formulation de vos fichiers qui décide. Ce guide s'adresse aux créateurs d'assistants: il explique comment le routeur lit vos fichiers, comment écrire pour lui et comment vérifier que vos demandes arrivent à bon port. Aucune compétence technique n'est requise, sauf une commande de terminal pour tester.

## Comment le routeur lit vos fichiers

Le routeur ne comprend pas le sens de votre texte: il **compare des mots**. Pour chaque process, il construit un texte de routage à partir du `use_when` (le signal le plus fort), complété par les `routing.examples`; à défaut, il se rabat sur la description, le titre puis les mots-clés. Une demande route bien quand ses mots recoupent ce texte. En pratique, votre `use_when` doit surtout contenir **les mots que vos utilisateurs emploieraient**, et non une formulation élégante.

## Formuler un bon `use_when`

Écrivez le `use_when` du point de vue de l'utilisateur, pas du vôtre. Le jargon interne («gestion du cycle de vente») ne route rien si personne ne le tape; les mots concrets («devis», «prix», «offre») routent.

Avant, un `use_when` faible:

```yaml
use_when: Gestion des propositions commerciales et du cycle de vente.
```

Après, un `use_when` fort:

```yaml
use_when: Quand un client demande un devis, un prix ou une offre chiffrée.
routing:
  examples:
    - Prépare un devis pour Dupont SA, 3 jours de conseil
    - Combien ça coûterait pour ce projet ?
    - Il me faut une offre avant vendredi
  avoid_when:
    - Relancer une facture impayée.
```

## Donner des exemples variés

Les `routing.examples` sont des formulations réelles d'utilisateurs. Donnez-en au moins trois pour la même intention, avec des mots différents: une formulation directe, une question, puis une demande exprimée dans l'urgence. Le routeur retrouve alors l'intention plus souvent, y compris quand la demande reprend les mots d'un exemple plutôt que les vôtres.

## Écarter les demandes voisines

`routing.avoid_when` liste les contre-exemples: des demandes proches qui doivent aller ailleurs. Si «relancer une facture» appartient à un autre process, le déclarer ici annule le score du mauvais candidat au lieu de laisser deux process se disputer la demande.

## Vérifier que ça route

```bash
node tools/base.mjs route "il me faut une offre pour un client" --root <dossier>
```

Lisez le résultat: le process choisi, le score, et les raisons (`route:<terme>` indique quels mots ont matché). Si le routeur s'abstient ou hésite, les raisons disent pourquoi: c'est en général un mot qui manque dans votre `use_when` ou vos exemples. Ajoutez `--json` pour le détail complet.

## Figer le comportement

Une fois les routes correctes, déclarez-les dans `.ai/routing/route-tests.json`: chaque entrée donne une demande et la route attendue. Puis:

```bash
node tools/base.mjs route-test --root <dossier>
```

La commande rejoue toutes les routes et échoue si l'une d'elles casse. Vos routes importantes sont protégées contre les régressions, même quand l'assistant grandit.

## Une limite honnête

Le routeur lexical par défaut est rudimentaire mais efficace, et il reste sensible à la formulation: des mots absents ne correspondent à rien, même quand le sens est proche. C'est le prix de l'explicabilité: chaque score se justifie par des raisons inspectables, sans réseau ni dépendance. Il reste par ailleurs extensible par adaptateurs. Pour les corpus difficiles (beaucoup de process proches, vocabulaire très varié), un ranker sémantique optionnel existe: voir le [Quickstart routage sémantique](routage-semantique-quickstart.md).

---

BASE est un framework par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
