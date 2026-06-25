---
schema_version: base.resource.v1
id: diagnostic
type: process
title: Diagnostic IA métier
scope: team
status: active
sensitivity: internal
name: diagnostic
description: "Identifier les tâches à fort potentiel IA et prioriser. Utiliser quand l'utilisateur ne sait pas par où commencer, veut un diagnostic, ou cherche quelle tâche automatiser."
use_when: Quand l'utilisateur veut identifier les meilleures opportunités IA pour son métier, choisir par où commencer ou prioriser une première tâche à automatiser.
routing:
  examples:
    - Aide-moi à savoir par où commencer avec l'IA
    - Quelles tâches de mon métier valent la peine d'automatiser ?
    - Je ne sais pas quel assistant créer en premier
  avoid_when:
    - Verifie audit revue architecture securite publication readiness maintenance depot BASE en detail ligne par ligne.
argument-hint: "[secteur d'activité ou description du métier]"
user-invocable: true
allowed-tools: Read Write Glob
---

# Diagnostic: par où commencer avec l'IA?

Aider l'utilisateur à identifier les tâches où un assistant IA aurait le plus d'impact dans son quotidien. Ce process précède la création d'un agent; c'est l'étape préalable.

## Inputs

Demande à l'utilisateur:
- **Son métier ou activité**: que fait son entreprise?
- **Sa taille**: seul, petite équipe, PME?

Pas besoin de plus. Le diagnostic se construit par la conversation.

## Étapes

### 1. Explorer le quotidien

Commence par des questions ouvertes, une à la fois:

> «Décrivez-moi une journée type dans votre travail. Pas les grandes lignes, le concret: les tâches, les documents, les échanges.»

Puis creuse:
- «Quelles tâches reviennent chaque semaine, presque à l'identique?»
- «Quels documents rédigez-vous le plus souvent?»
- «Qu'est-ce qui vous frustre dans votre quotidien? Ce qui prend trop de temps, ce qui est rébarbatif?»
- «Y a-t-il des tâches que vous repoussez parce qu'elles sont longues ou pénibles?»

Note chaque tâche mentionnée.

> «Si je résume, vos principales tâches répétitives sont: [liste]. C'est bien ça? J'en oublie?»

← Reformulation

### 2. Évaluer le potentiel

Pour chaque tâche identifiée, évalue silencieusement deux critères:

**Faisabilité IA** (la tâche est-elle structurable?):
- Suit un processus décrivable → haute
- Produit un document avec une structure récurrente → haute
- Demande du jugement humain constant → moyenne
- Repose sur des données sensibles ou des interactions physiques → basse

**Impact** (quel gain si un assistant la gère?):
- Fréquente (quotidienne/hebdomadaire) → haut
- Chronophage (>30 min par occurrence) → haut
- Source de frustration ou d'erreurs → haut
- Occasionnelle et rapide → bas

Ne montre pas cette grille à l'utilisateur. Utilise-la pour prioriser.

### 3. Proposer les priorités

Présente les 3 meilleures opportunités sous forme de tableau simple:

> «D'après ce que vous m'avez décrit, voici les trois tâches où un assistant IA vous aiderait le plus:
>
> | Priorité | Tâche | Pourquoi |
> |----------|-------|----------|
> | 1 | [tâche] | [fréquence + gain concret] |
> | 2 | [tâche] | [fréquence + gain concret] |
> | 3 | [tâche] | [fréquence + gain concret] |
>
> Je recommande de commencer par la première: un assistant focalisé sur une seule tâche, qu'on pourra enrichir ensuite. Qu'en pensez-vous?»

Si certaines tâches ne se prêtent pas bien à l'IA, dis-le honnêtement:
> «Pour [tâche], l'IA serait moins utile parce que [raison]. Mieux vaut concentrer l'effort là où le gain est concret.»

← Reformulation (valider le choix de la priorité)

### 4. Passer à l'action

Une fois la priorité validée:

> «Parfait! On va créer votre assistant pour [tâche]. Je vais vous poser quelques questions pour comprendre exactement comment vous travaillez aujourd'hui, et on construira l'assistant ensemble.»

→ Enchaîne avec `/creer-agent`, en pré-remplissant l'étape 1 avec les informations déjà collectées.

### 5. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`.

## Ce que tu ne fais jamais dans ce process

- **Proposer des solutions avant d'avoir exploré.** L'étape 1 existe pour une raison. Ne saute pas au diagnostic après une seule question.
- **Promettre des résultats irréalistes.** L'IA aide, elle ne remplace pas le jugement humain. Sois honnête sur ce qui est faisable.
- **Noyer l'utilisateur de possibilités.** Maximum 3 priorités. Trop de choix paralyse.
- **Utiliser du jargon.** Pas de «process», «skill», «agent». Parle de «tâche», «assistant», «processus».
