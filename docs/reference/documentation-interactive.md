---
schema_version: base.resource.v1
id: documentation-interactive
type: document
title: Générer et publier la documentation interactive
description: Voir, valider et déployer la documentation interactive générée depuis les fichiers canoniques du dépôt.
scope: public
status: active
sensitivity: public
keywords: [documentation, astro, starlight, local, deploy, public, validation, portail]
---

# Générer et publier un site de documentation depuis vos fichiers canoniques

Consulter ou publier la documentation de son BASE sans jamais la recopier ailleurs: BASE engendre un site, local ou public, directement à partir du dépôt. Les fichiers Markdown, JSON et spécifications demeurent les sources de vérité, et le site n'en est qu'une projection interactive (navigation par sections, parcours d'apprentissage, explorateur, carte du système, laboratoire de routage, qualité et pages de ressources). Il rend service à qui veut une vue navigable du corpus sans entretenir une seconde documentation, vouée à diverger de la première.

L'interface du site est bilingue: français par défaut, avec une bascule vers l'anglais. La version française de chaque page fait foi; voir [Langues](langues.md). Chaque contenu conserve la langue de sa source, conformément aux [langues de BASE](langues.md). La navigation latérale est engendrée depuis `navigation.json`, la projection de navigation du modèle documentaire: aucune liste de pages n'est tenue à la main.

## Voir en local

Depuis la racine du dépôt:

```bash
npm run docs:serve
```

La commande engendre d'abord le modèle documentaire, puis lance le site Astro/Starlight en local.

## Construire un site statique

Pour construire un site statique interne:

```bash
npm run docs:build
```

Pour construire un site public, filtré sur les ressources publiables:

```bash
npm run docs:build:public
```

Pour choisir explicitement le dossier déployable:

```bash
node tools/base.mjs docs build --public --out public-site
```

Le dossier obtenu contient un site statique. Vous pouvez le servir depuis la plupart des hébergeurs compatibles avec le HTML statique.

## Valider avant publication

```bash
node tools/base.mjs docs validate
```

La validation contrôle les invariants du modèle, notamment l'exclusion de `.plans/` et `.temp/`, la séparation entre public et interne, et l'intégrité des liens locaux.

## Ce que le site montre

- la navigation latérale: les sections du corpus (démarrer, comprendre, guides, profils, confiance, exemples, référence), projetées depuis le modèle;
- les pages de ressources: le rendu des sources canoniques, le contenu d'abord, puis métadonnées et rétroliens dans un panneau repliable; les liens internes du Markdown sont réécrits vers les pages du site;
- `Parcours guidés`: parcours de lecture selon le besoin;
- `Concepts`: explication visuelle de route -> process -> validation -> écriture;
- `Exemples guidés`: visite pas à pas des exemples copiables;
- `Explorateur`: inventaire structuré et filtrable des ressources;
- `Carte du système`: familles et relations du dépôt;
- `Laboratoire de routage`: fixtures de routage avec demandes et attentes;
- `Preuves`: promesses reliées aux mécanismes, tests et limites;
- `Qualité`: erreurs, avertissements et politique d'inclusion;
- la recherche plein texte (Pagefind), construite lors de la génération statique.

## Discipline de maintenance

N'écrivez jamais directement dans le site une prose qui décrit BASE. Confiez-la au fichier canonique approprié, puis laissez le modèle la projeter. Les pages du site doivent rester des adaptateurs, et non une seconde documentation.
