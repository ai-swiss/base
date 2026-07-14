---
schema_version: base.resource.v1
id: journal
type: competence
title: Journal de session
description: Conventions pour le journal de session, mémoire externe entre conversations.
scope: team
status: active
sensitivity: internal
user-invocable: false
allowed-tools: Read Write
---

# Journal de session

Le journal est la mémoire externe de l'agent d'une conversation à l'autre. Sans lui, chaque session repart de zéro; avec lui, l'agent reprend là où il s'était arrêté.

## Quand écrire une entrée

À la **fin de chaque process** (chaque workflow invocable), l'agent écrit une entrée de journal. C'est la dernière étape de tout process, sans exception.

## Où écrire

Emplacement: `.ai/journal/YYYY-MM-DD_description.md`

Exemples:
- `.ai/journal/2026-04-20_configuration.md`
- `.ai/journal/2026-04-20_devis-favre.md`
- `.ai/journal/2026-04-21_devis-mueller.md`

Si le dossier `.ai/journal/` n'existe pas encore, le créer avant la première entrée.

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
- **Concis.** Le journal est un aide-mémoire, non un rapport. À session courte, entrée courte.
- **Marqueurs dans le journal.** Employer les marqueurs `[DECISION]`, `[A VALIDER]`, `[A COMPLETER]`: le journal devient ainsi aussi facile à parcourir que les documents générés.

## Reprise de session

Quand l'utilisateur revient après une interruption («on en était où?», «bonjour», ou en reprenant simplement le travail), l'agent:

1. Lit les entrées récentes de `.ai/journal/` (les 2 ou 3 dernières)
2. Résume l'état des lieux: ce qui a été fait, ce qui reste à faire
3. Propose la suite: traiter un `[A VALIDER]`, compléter un `[A COMPLETER]`, ou lancer un nouveau process

Cette reprise vaut aussi **en cours de session**: si tu ne peux plus citer le chemin du process actif (après un résumé, ou loin dans une longue conversation), rouvre l'`AGENT.md` et le `SKILL.md` actifs plutôt que de te fier au contexte courant.

## Progression (pour les processes interrompus)

Si un process est interrompu en cours de route, l'entrée de journal comporte une section Progression:

```markdown
## Progression
- [x] Étape 1 : Découverte du besoin
- [x] Étape 2 : Identification des workflows
- [ ] Étape 3 : Connaissances métier
- [ ] Étape 4 : Documents types
- [ ] Étape 5 : Architecture complète
```

À la reprise, l'agent lit cette progression et repart de la première étape non cochée.

Un process long (7 étapes ou plus) interrompu avant sa dernière étape écrit **immédiatement** cette entrée réduite: la Progression cochée et les `[A VALIDER]` en cours, rien d'autre. C'est l'unique cas où le journal s'écrit hors de la dernière étape: sans lui, l'ancre de reprise n'existerait jamais au moment d'une interruption.
