---
schema_version: base.resource.v1
id: journal
type: competence
title: Journal de session
description: Conventions pour le journal de session, mémoire externe entre conversations. À consulter à la fin de chaque process et lors de la reprise de session.
scope: team
status: active
sensitivity: internal
user-invocable: false
allowed-tools: Read
---

# Journal de session

Le journal est la mémoire externe de l'agent d'une conversation à l'autre. Sans lui, chaque session repart de zéro; avec lui, l'agent reprend là où il s'était arrêté.

## Quand écrire une entrée

À la **fin de chaque process** (chaque procédure invocable), l'agent écrit une entrée de journal. C'est l'ultime étape de tout process.

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

- **Sections conditionnelles.** N'inclure une section que si elle a du contenu. Jamais de section «Décisions» vide.
- **Concis.** Le journal est un aide-mémoire, pas un rapport. À session courte, entrée courte.
- **Marqueurs dans le journal.** Utiliser les marqueurs `[DECISION]`, `[A VALIDER]`, `[A COMPLETER]`: le journal se prête ainsi à la recherche au même titre que les documents générés.

## Reprise de session

Quand l'utilisateur revient après une interruption («on en était où?», «bonjour», ou simplement en reprenant le travail), l'agent:

1. Lit les entrées récentes dans `.ai/journal/` (les 2-3 dernières)
2. Résume l'état actuel: ce qui a été fait, ce qui reste à faire
3. Propose la suite: traiter un `[A VALIDER]`, compléter un `[A COMPLETER]`, ou commencer un nouveau process

Cette reprise vaut aussi **en cours de session**: si tu ne peux plus citer le chemin du process actif (après un résumé, ou loin dans une longue conversation), rouvre l'`AGENT.md` et le `SKILL.md` actifs plutôt que de te fier au contexte courant.

## Progression

Un process de sept étapes ou plus, ou qui traite une liste d'éléments (des messages, des clients), pose sa liste au départ: dans la liste de tâches de l'outil quand il en a une, sinon annoncée une fois dans la conversation, avec les mots de la personne. Il coche au fil. Une liste posée d'avance empêche qu'une étape ou un élément glisse hors de l'attention au cours d'une longue tâche. Par exemple:

```markdown
## Progression
- [x] Étape 1: Découverte du besoin
- [x] Étape 2: Identification des procédures
- [ ] Étape 3: Connaissances métier
- [ ] Étape 4: Documents types
- [ ] Étape 5: Architecture complète
```

Un process long interrompu avant sa dernière étape écrit **immédiatement** une entrée réduite: la Progression cochée et les `[A VALIDER]` en cours, rien d'autre, dès lors que le process a le droit d'écrire. C'est l'unique cas où le journal s'écrit hors de la dernière étape. Lors de la reprise, l'agent lit cette progression et reprend à la première étape non cochée.
