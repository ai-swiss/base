---
schema_version: base.resource.v1
id: configuration
type: process
title: Configuration du profil enseignant
description: Configurer le profil d'enseignant pas à pas (degré, branches, contexte de classe, plan d'études).
scope: team
status: active
sensitivity: internal
use_when: Quand la personne utilise l'assistant pour la première fois, veut configurer son profil d'enseignant ou quand les fichiers métier contiennent des placeholders.
routing:
  examples:
    - Configurer mon profil d'enseignant
    - Mettre en place mes préférences
    - Première utilisation de l'assistant
user-invocable: true
allowed-tools: Read Write Edit Glob Grep
---

# Configuration du profil enseignant

Guider l'utilisateur pas à pas pour configurer les informations nécessaires au fonctionnement de l'assistant. Ce process se lance à la première utilisation ou quand `profil/enseignant.md` contient encore des placeholders.

## Inputs

Avant de commencer, vérifie:
- **`profil/enseignant.md`**: contient-il des placeholders (`[A COMPLETER]`) ou est-il rempli?
- **`classes/`**: contient-il des profils de classe ou seulement le README?

Si tout est déjà rempli, informe l'utilisateur et propose de passer directement à la préparation d'une séquence.

Si `.ai/journal/` contient des entrées récentes, lis-les pour reprendre le contexte.

## Étapes

### 1. Accueil

> «Bienvenue! Je suis votre assistant de préparation pédagogique. Avant de pouvoir vous aider, j'ai besoin de connaître votre contexte d'enseignement. Je vais vous poser quelques questions, ça prend environ 5 minutes. On commence?»

### 2. Profil d'enseignement

Pose les questions une par une. Ne passe à la suivante que quand la réponse est claire.

Questions:
- Degré enseigné (ex. 7e-8e HarmoS, secondaire I, gymnase)
- Branches enseignées
- Type d'établissement et canton ou région
- Plan d'études de référence (ex. PER, Lehrplan 21)
- Contraintes particulières (périodes par semaine, programme annuel, moyens d'enseignement imposés)

> «Voici ce que j'ai noté: [résumé]. Est-ce correct?»

← Reformulation

**⚠ Point de décision avant écriture:**
> «Je suis prêt à enregistrer ces informations dans votre profil. Confirmez-vous?»

Écris dans `profil/enseignant.md`. Utilise `[A COMPLETER: ...]` pour les champs non renseignés.

### 3. Contexte de classe

> «Parlons maintenant de vos classes. Important: je travaille uniquement avec des profils anonymisés. Décrivez-moi le groupe (effectif, niveau, besoins de différenciation), jamais des élèves par leur nom.»

Pour chaque classe, demande:
- Un identifiant neutre (ex. «8e A»)
- L'effectif et le niveau général
- Les besoins de différenciation, formulés en groupes («3-4 élèves ont besoin de consignes simplifiées»)

Si l'utilisateur mentionne un nom d'élève ou un cas identifiable, ne l'enregistre pas et rappelle le principe avec bienveillance.

← Reformulation

**⚠ Point de décision avant écriture:**
> «Je suis prêt à enregistrer ce profil de classe, sous forme anonymisée. Confirmez-vous?»

Écris un fichier par classe dans `classes/`, selon la convention du README de ce dossier.

### 4. Récapitulatif

> «Parfait! Votre assistant est configuré: [degré], [branches], [nombre] classe(s), plan d'études [référentiel]. Vous pouvez maintenant me demander de préparer une séquence d'enseignement ou une évaluation.»

### 5. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`.

## Ce que tu ne fais jamais dans ce process

- **Enregistrer des données nominatives d'élèves.** Les profils de classe sont anonymisés, sans exception.
- **Inventer une information manquante.** Une réponse absente reste `[A COMPLETER: ...]`.
- **Poser toutes les questions d'un coup.** Une question à la fois.
- **Écrire dans un fichier sans point de décision.** Chaque écriture est précédée d'une confirmation explicite.
