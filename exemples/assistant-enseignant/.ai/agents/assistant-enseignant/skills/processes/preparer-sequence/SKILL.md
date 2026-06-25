---
schema_version: base.resource.v1
id: preparer-sequence
type: process
title: Préparer une séquence
description: Préparer une séquence d'enseignement complète (objectifs, prérequis, déroulé par phases, différenciation, supports).
scope: team
status: active
sensitivity: internal
use_when: Quand l'enseignant veut préparer un cours, construire une séquence d'enseignement ou planifier ses leçons.
routing:
  examples:
    - Préparer un cours sur les fractions
    - Je dois construire une séquence sur la Révolution française
    - Planifier mes leçons de la semaine
  avoid_when:
    - Préparer une évaluation, un contrôle ou une grille de critères.
    - Calculer des moyennes ou remplir une déclaration administrative.
argument-hint: "[sujet ou thème de la séquence]"
user-invocable: true
allowed-tools: Read Write Edit Glob Grep
---

# Préparer une séquence

Préparer une séquence d'enseignement de A à Z: objectifs d'apprentissage, prérequis, déroulé par phases, différenciation, matériel. La séquence est un document de travail pour l'enseignant, pas un script à suivre mot à mot.

## Inputs

Demande à l'utilisateur:
- **Le sujet**: quelle notion, quel thème?
- **La classe concernée**: pour lire son profil dans `classes/`
- **La durée**: combien de périodes, sur combien de semaines?

Avant de commencer, vérifie que `profil/enseignant.md` est rempli: sinon, charge `skills/processes/configuration/SKILL.md`.

Lis la compétence `skills/competences/metier-enseignement/SKILL.md` pour l'alignement pédagogique et la formulation des objectifs.

Si `.ai/journal/` contient des entrées récentes, lis-les pour le contexte.

## Étapes

### 1. Comprendre le besoin

> «Si je comprends bien, vous préparez [sujet] pour la classe [identifiant], sur [durée]. Quelques questions pour bien cerner le besoin:»

Questions à poser une par une:
- Où cette séquence s'inscrit-elle dans votre programme annuel?
- Qu'est-ce que les élèves savent déjà sur ce sujet?
- Y a-t-il un passage du plan d'études que vous visez en particulier?

← Reformulation

### 2. Objectifs d'apprentissage

Propose 2 à 4 objectifs observables, formulés avec des verbes d'action (voir la taxonomie dans la compétence métier):

> «Voici les objectifs que je propose. À la fin de la séquence, les élèves seront capables de:
> 1. [objectif avec verbe d'action observable]
> 2. [objectif]
>
> Est-ce que cela correspond à ce que vous visez? Faut-il en ajouter, en retirer, ou viser plus haut ou plus bas?»

← Reformulation

### 3. Prérequis

Liste ce que les élèves doivent déjà maîtriser pour aborder la séquence. Croise avec le profil de classe:

> «Pour ces objectifs, les prérequis sont: [liste]. D'après le profil de votre classe, [point d'attention éventuel]. Prévoyons-nous un rappel en début de séquence?»

← Reformulation

### 4. Déroulé par phases

Construis le déroulé période par période, en phases courtes:

> «Voici le déroulé que je propose pour la première période:
>
> | Phase | Durée | Activité | Rôle de l'enseignant |
> |-------|-------|----------|----------------------|
> | Ouverture | 10 min | [accroche, lien avec le connu] | [cadre, questionne] |
> | Construction | 20 min | [activité de découverte] | [guide, observe] |
> | Entraînement | 10 min | [exercices] | [circule, soutient] |
> | Synthèse | 5 min | [institutionnalisation, trace écrite] | [formalise] |
>
> On ajuste?»

← Reformulation, période par période

### 5. Différenciation

Pour chaque activité centrale, propose deux variantes en t'appuyant sur le profil de classe anonymisé:

- **Élèves en difficulté**: consignes simplifiées, étapes intermédiaires, support visuel ou matériel concret
- **Élèves avancés**: prolongement, problème ouvert, rôle de tuteur

> «Pour l'activité [nom], voici la version d'appui et le prolongement. Cela correspond-il aux besoins décrits dans le profil de classe?»

← Reformulation

### 6. Matériel

Liste le matériel et les supports nécessaires, phase par phase. Marque `[A COMPLETER: ...]` ce qui dépend de ressources que tu ne connais pas (manuel utilisé, fiches existantes).

### 7. Enregistrer la séquence

**⚠ Point de décision avant écriture:**
> «La séquence est prête. Je suis prêt à l'enregistrer dans vos séquences. Confirmez-vous?»

Lis le template `templates/sequence_v1.md`, remplis-le avec tout ce qui a été validé, et sauvegarde dans `sequences/YYYY-MM-DD_titre-de-la-sequence.md` (date du jour, titre en minuscules, tirets, sans accents).

### 8. Récapitulatif

> «Votre séquence [titre] est enregistrée: [nombre] objectifs, [nombre] périodes, différenciation prévue pour [groupes].
>
> **Important: relisez la séquence avant de l'enseigner.** Vérifiez la conformité au plan d'études et l'adéquation à votre classe. C'est vous qui connaissez vos élèves.
>
> Souhaitez-vous préparer l'évaluation associée à cette séquence?»

Si oui, charge `skills/processes/preparer-evaluation/SKILL.md`.

### 9. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`.

## Ce que tu ne fais jamais dans ce process

- **Affirmer la conformité au plan d'études.** Tu cites le passage visé avec `[A VALIDER: ...]`; l'enseignant vérifie dans le référentiel officiel.
- **Inventer un contenu disciplinaire douteux.** Un fait, une date ou une formule dont tu n'es pas sûr est marqué `[A VALIDER: ...]`.
- **Utiliser des données nominatives d'élèves.** La différenciation s'appuie sur le profil de classe anonymisé, jamais sur des cas individuels.
- **Écrire un fichier sans point de décision.** L'étape 7 confirme avant toute écriture.
- **Imposer une méthode pédagogique.** Tu proposes un déroulé; l'enseignant choisit sa façon d'enseigner.
