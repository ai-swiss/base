---
schema_version: base.resource.v1
id: preparer-evaluation
type: process
title: Préparer une évaluation
description: Préparer une évaluation alignée sur la séquence (objectifs évalués, grille de critères, barème, corrigé proposé).
scope: team
status: active
sensitivity: internal
use_when: Quand l'enseignant veut préparer une évaluation, un contrôle ou un test, avec une grille de critères, un barème et un corrigé.
routing:
  examples:
    - Créer une évaluation avec un barème et un corrigé
    - Préparer une évaluation pour mes élèves
    - Construire une grille de critères pour un travail écrit
  avoid_when:
    - Préparer une séquence d'enseignement ou planifier des leçons.
    - Noter un élève ou décider de sa note finale.
argument-hint: "[séquence ou sujet concerné]"
user-invocable: true
allowed-tools: Read Write Edit Glob Grep
---

# Préparer une évaluation

Préparer une évaluation alignée sur une séquence: reprendre les objectifs, construire la grille de critères et le barème, rédiger les tâches et un corrigé proposé. L'assistant prépare le matériel d'évaluation; évaluer les élèves reste un acte de l'enseignant.

## Inputs

Demande à l'utilisateur:
- **La séquence concernée**: pour la lire dans `sequences/`
- **Le type d'évaluation**: formative (pour apprendre) ou sommative (pour attester)
- **La durée et le format**: écrit, oral, travail pratique

Si aucune séquence n'existe pour ce sujet, demande les objectifs visés directement, ou propose de préparer la séquence d'abord.

Lis la compétence `skills/competences/metier-enseignement/SKILL.md` pour l'alignement et le feedback.

Si `.ai/journal/` contient des entrées récentes, lis-les pour le contexte.

## Étapes

### 1. Reprendre les objectifs

Lis la séquence dans `sequences/` et résume:

> «Pour rappel, la séquence [titre] vise ces objectifs: [liste]. Lesquels voulez-vous évaluer? Tous, ou une sélection?»

← Reformulation

### 2. Vérifier l'alignement

Pour chaque objectif évalué, vérifie qu'une activité de la séquence l'a réellement travaillé. Signale tout écart:

> «[ATTENTION: l'objectif 3 n'a été travaillé que dans le prolongement pour élèves avancés. L'évaluer pour toute la classe serait inéquitable.] On le garde, on l'adapte, ou on le retire?»

← Reformulation

### 3. Construire la grille de critères

Propose une grille reliant chaque objectif à des critères observables:

> «Voici la grille que je propose:
>
> | Objectif évalué | Critère observable | Points |
> |-----------------|--------------------|--------|
> | [objectif 1] | [ce qu'une réussite montre concrètement] | [n] |
> | [objectif 2] | [critère] | [n] |
>
> Les critères sont-ils justes et observables?»

← Reformulation

### 4. Barème

Propose la répartition des points et le seuil de suffisance, marqués `[A VALIDER: ...]`:

> «[A VALIDER: total de 30 points, seuil de suffisance à 18 points, conformément à votre pratique habituelle]. Le barème final relève de votre responsabilité et des règles de votre établissement. Cette répartition vous convient-elle?»

← Reformulation

### 5. Rédiger les tâches

Rédige les questions ou tâches, des plus simples aux plus exigeantes, en réutilisant les types d'exercices travaillés dans la séquence. Présente-les une section à la fois.

← Reformulation, section par section

### 6. Corrigé proposé

Rédige un corrigé complet. Chaque réponse attendue qui demande une vérification disciplinaire est marquée `[A VALIDER: ...]`:

> «Voici le corrigé proposé. J'ai marqué [nombre] points à vérifier, notamment [exemple]. Relisez-le en entier: c'est votre corrigé, pas le mien.»

### 7. Enregistrer l'évaluation

**⚠ Point de décision avant écriture:**
> «L'évaluation est prête (tâches, grille, barème, corrigé). Je suis prêt à l'enregistrer. Confirmez-vous?»

Lis le template `templates/grille-evaluation_v1.md`, remplis-le, et sauvegarde dans `evaluations/YYYY-MM-DD_titre-de-l-evaluation.md`.

### 8. Récapitulatif

> «Votre évaluation est enregistrée: [nombre] objectifs évalués, [total] points, corrigé proposé avec [nombre] éléments à valider.
>
> **Rappel: l'évaluation des élèves reste votre acte professionnel.** Je prépare la grille et le corrigé; c'est vous qui corrigez les copies, attribuez les notes et décidez des suites.»

### 9. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`.

## Ce que tu ne fais jamais dans ce process

- **Noter un élève ou corriger une copie à la place de l'enseignant.** Tu prépares grilles et corrigés; l'enseignant évalue.
- **Évaluer un objectif jamais travaillé.** L'alignement de l'étape 2 n'est pas optionnel.
- **Présenter le corrigé comme vérité certifiée.** Les réponses sensibles portent `[A VALIDER: ...]` et l'enseignant relit tout.
- **Utiliser des données nominatives d'élèves.** Ni dans les exemples, ni dans les tâches, ni dans le fichier généré.
- **Écrire un fichier sans point de décision.** L'étape 7 confirme avant toute écriture.
