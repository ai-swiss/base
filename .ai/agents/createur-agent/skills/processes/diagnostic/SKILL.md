---
schema_version: base.resource.v1
id: diagnostic
type: process
title: Diagnostic IA métier
scope: team
status: active
sensitivity: internal
name: diagnostic
description: "Faire parler une personne de son quotidien quand elle n'a rien à montrer (ni discussion, ni documents), relever ses tâches, puis passer la main à «Partir de ce que vous avez» qui rend la fiche de proposition. Utiliser quand l'utilisateur ne sait pas par où commencer et n'a aucun document."
use_when: Quand l'utilisateur veut savoir par où commencer avec l'IA ou quelle tâche confier en premier, et n'a ni discussion, ni compte rendu, ni documents à montrer.
keywords:
  - commencer
  - diagnostic
  - automatiser
  - tâches
  - quotidien
  - opportunités
  - premier
routing:
  examples:
    - Aide-moi à savoir par où commencer avec l'IA
    - Quelles tâches de mon métier valent la peine d'automatiser ?
    - Je ne sais pas quel assistant créer en premier
  avoid_when:
    - Voici notre discussion sur nos besoins, voici le compte rendu de notre réunion.
    - Voici nos procédures, voici mon dossier de documents, regarde ce que tu en ferais.
    - On a déjà un CLAUDE.md et des règles écrites pour l'IA.
    - Verifie audit revue architecture securite publication readiness maintenance depot BASE en detail ligne par ligne.
argument-hint: "[secteur d'activité ou description du métier]"
user-invocable: true
allowed-tools: Read Write Glob
---

# Diagnostic: par où commencer avec l'IA?

Faire parler une personne de son quotidien quand elle n'a rien à montrer. La conversation remplace la discussion ou les documents que d'autres apportent; au bout, ses notes passent par la même porte, `adopter-ce-dossier`, qui juge chaque tâche et rend la même fiche de proposition. Ce process recueille et passe la main: il ne juge pas, ne classe pas et ne recommande rien. Si la personne a quelque chose à montrer, c'est la porte qui commence, pas ce process.

## Inputs

Demande à l'utilisateur:
- **Son métier ou activité**: que fait son entreprise?
- **Sa taille**: seul, petite équipe, PME?

Pas besoin de plus: le diagnostic se construit au fil de la conversation.

## Étapes

### 1. Explorer le quotidien

Commence par des questions ouvertes, une à la fois:

> «Décrivez-moi une journée type dans votre travail. Pas les grandes lignes, le concret: les tâches, les documents, les échanges.»

Puis creuse:
- «Quelles tâches reviennent chaque semaine, presque à l'identique?»
- «Quels documents rédigez-vous le plus souvent?»
- «Qu'est-ce qui vous frustre dans votre quotidien? Ce qui prend trop de temps, ce qui est rébarbatif?»
- «Y a-t-il des tâches que vous repoussez parce qu'elles sont longues ou pénibles?»
- «Qu'est-ce qui ne doit jamais sortir de vos mains, même si un assistant pouvait le faire?»

Note chaque tâche mentionnée.

> «Si je résume, vos principales tâches répétitives sont: [liste]. C'est bien ça? J'en oublie?»

← Reformulation

### 2. Passer la main

Une fois le résumé validé, écris des notes d'entretien sous `.temp/{AAAA-MM-JJ}_{sujet}/notes-entretien.md`, avec les mots de la personne: les tâches relevées avec leur fréquence, ce qui prend de l'énergie, les règles dites à l'oral, les lignes rouges. Rien d'autre ne s'écrit, pas même le journal: la porte l'écrit après l'export.

> «Je résume ce que vous m'avez dit dans une page, puis je vous prépare une fiche: ce qu'un assistant ferait pour vous, ce qu'il ne fera jamais, et par où commencer. Vous la lirez tranquillement, et rien ne se construit avant votre retour.»

→ Enchaîne avec `adopter-ce-dossier` sur ces notes: la porte reconnaît des besoins décrits et rend la fiche de proposition. La construction vient après l'export, par `creer-agent`.

## Ce que tu ne fais jamais dans ce process

- **Passer la main après une seule question.** L'étape 1 n'est pas là par hasard.
- **Juger, classer ou promettre dans la conversation.** Ce que l'IA peut faire, et ce qu'elle ne réglera pas, se dit dans la fiche.
- **Employer du jargon.** Pas de «process», «skill», «agent». Parle de «tâche», «assistant», «façon de faire».
- **Sauter à la construction.** La fiche de proposition vient d'abord, par la porte; `creer-agent` construit après l'export.
