---
name: journal
description: "Conventions pour le journal de session - mémoire externe entre conversations. À consulter à la fin de chaque process et lors de la reprise de session."
user-invocable: false
allowed-tools: Read Write
---

# Journal de session

Le journal est la mémoire externe de l'agent entre les conversations. Sans journal, chaque session recommence de zéro. Avec le journal, l'agent peut reprendre là où il s'est arrêté.

## Quand écrire une entrée

À la **fin de chaque process** (chaque workflow invocable), l'agent écrit une entrée de journal. C'est la dernière étape de tout process.

## Où écrire

Emplacement: `.ai/journal/YYYY-MM-DD_description.md`

Exemples:
- `.ai/journal/2026-04-20_configuration.md`
- `.ai/journal/2026-04-20_cr-comite-direction.md`
- `.ai/journal/2026-04-21_suivi-actions.md`

Si le dossier `.ai/journal/` n'existe pas, le créer avant d'écrire la première entrée.

## Format d'une entrée

```markdown
# Session : [titre descriptif]
Date : YYYY-MM-DD
Agent : [nom-agent]
Skill : /[nom-du-process]

## Ce qui a été fait
- [action concrète 1]
- [action concrète 2]

## Fichiers créés ou modifiés
- chemin/vers/fichier1.md
- chemin/vers/fichier2.json

## Décisions
- [DECISION: choix | raison]

## À suivre
- [A VALIDER: élément en attente de confirmation]
- [A COMPLETER: information manquante]
```

## Règles

- **Sections conditionnelles.** N'inclure une section que si elle a du contenu. Pas de section "Décisions" vide.
- **Concis.** Le journal est un aide-mémoire, pas un rapport. Une session courte donne une entrée courte.
- **Marqueurs dans le journal.** Utiliser les marqueurs `[DECISION]`, `[A VALIDER]`, `[A COMPLETER]` pour que le journal soit aussi cherchable que les documents générés.

## Reprise de session

Quand l'utilisateur revient après une interruption ("on en était où?", "bonjour", ou simplement reprend le travail), l'agent:

1. Lit les entrées récentes dans `.ai/journal/` (les 2-3 dernières)
2. Résume l'état actuel: ce qui a été fait, ce qui reste à faire
3. Propose la suite: traiter un `[A VALIDER]`, compléter un `[A COMPLETER]`, ou commencer un nouveau process

## Progression (pour les processes interrompus)

Si un process est interrompu en cours de route, l'entrée de journal inclut une section Progression:

```markdown
## Progression
- [x] Étape 1 : Découverte du besoin
- [x] Étape 2 : Identification des workflows
- [ ] Étape 3 : Connaissances métier
- [ ] Étape 4 : Documents types
- [ ] Étape 5 : Architecture complète
```

Lors de la reprise, l'agent lit cette progression et reprend à la première étape non cochée.
