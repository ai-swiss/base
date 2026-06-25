---
schema_version: base.resource.v1
id: journal
type: competence
title: Journal de session
description: "Conventions pour le journal de session, la mémoire externe entre conversations. À consulter à la fin de chaque process et lors de la reprise de session."
scope: personal
status: active
sensitivity: internal
user-invocable: false
allowed-tools: Read Write
---

# Journal de session

Le journal est la mémoire de la réflexion entre les conversations. Sans journal, chaque session recommence de zéro. Avec lui, une réflexion menée sur plusieurs jours garde son fil: les hypothèses ouvertes, les incertitudes à lever, ce qui restait à trancher.

## Quand écrire une entrée

À la **fin de chaque process**, l'assistant écrit une entrée de journal. C'est la dernière étape de tout process.

## Où écrire

Emplacement: `.ai/journal/YYYY-MM-DD_description.md`

Exemples:
- `.ai/journal/2026-06-09_configuration.md`
- `.ai/journal/2026-06-09_decision-poste.md`
- `.ai/journal/2026-06-10_exploration-orientation.md`

Si le dossier `.ai/journal/` n'existe pas, le créer avant d'écrire la première entrée.

## Format d'une entrée

```markdown
# Session : [titre descriptif]
Date : YYYY-MM-DD
Assistant : assistant-reflexion
Skill : /[nom-du-process]

## Ce qui a été fait
- [étape concrète 1]
- [étape concrète 2]

## Fichiers créés ou modifiés
- reflexions/[fichier].md

## Hypothèses et incertitudes ouvertes
- [HYPOTHESE: ...]
- [INCERTITUDE: ...]

## À suivre
- [A VALIDER: élément en attente de confirmation]
```

## Règles

- **Sections conditionnelles.** N'inclure une section que si elle a du contenu.
- **Concis.** Le journal est un aide-mémoire, pas un rapport.
- **Garder les fils ouverts visibles.** Les `[HYPOTHESE]` et `[INCERTITUDE]` non résolues sont l'essentiel à reporter: ce sont elles qu'on reprendra.

## Reprise de session

Quand la personne revient ("on en était où?", "bonjour", ou reprend simplement), l'assistant:

1. Lit les entrées récentes dans `.ai/journal/` (les 2-3 dernières)
2. Résume où en était le raisonnement et quelles hypothèses ou incertitudes restaient ouvertes
3. Propose la suite: vérifier une incertitude, valider un `[A VALIDER]`, ou continuer la réflexion

## Progression (pour les réflexions interrompues)

Si un process est interrompu en cours de route, l'entrée inclut une section Progression:

```markdown
## Progression
- [x] Étape 1 : Cadrer la décision
- [x] Étape 2 : Dégager les critères
- [ ] Étape 3 : Lister les options
- [ ] Étape 4 : Rendre visibles les hypothèses
```

Lors de la reprise, l'assistant lit cette progression et reprend à la première étape non cochée.
