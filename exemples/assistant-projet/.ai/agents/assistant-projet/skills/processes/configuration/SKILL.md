---
schema_version: base.resource.v1
id: configuration
type: process
title: Configuration du profil
description: Configurer le profil et les préférences de travail.
scope: team
status: active
sensitivity: internal
use_when: Quand l'utilisateur démarre l'assistant projet, veut configurer son profil ou quand le profil contient des placeholders.
user-invocable: true
allowed-tools: Read Write Edit Glob Grep
---

# Configuration du profil

Guider l'utilisateur pas à pas pour configurer son profil et ses préférences de travail. Ce process se lance à la première utilisation ou quand `profil/identite.md` contient encore des placeholders.

## Inputs

Avant de commencer, vérifie:
- **`profil/identite.md`**: contient-il des placeholders (`[...]`) ou est-il rempli?

Si tout est déjà rempli, informe l'utilisateur et propose de passer directement à la création d'un projet.

Si `.ai/journal/` contient des entrées récentes, lis-les pour reprendre le contexte.

## Étapes

### 1. Accueil

> «Bienvenue! Je suis votre assistant projet. Avant de commencer, j'ai besoin de vous connaître un peu. Quelques questions rapides, ça prend 2 minutes. On y va?»

### 2. Identité

Pose les questions une par une. Ne passe à la suivante que quand la réponse est claire.

Questions:
- Votre prénom et nom
- Votre rôle ou fonction (ex. responsable marketing, indépendant, chef de projet)
- Votre organisation (nom, taille approximative, secteur d'activité)
- Votre lieu de travail principal (ville)

> «Voici ce que j'ai noté: [résumé]. Est-ce correct?»

← Reformulation

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer votre profil. Confirmez-vous?»

Écris dans `profil/identite.md`. Utilise `[A COMPLETER: ...]` pour les champs non renseignés.

### 3. Préférences de travail

> «Quelques questions sur votre manière de travailler, pour que je m'adapte.»

Questions:
- Comment estimez-vous habituellement les durées? (en jours, en semaines, en heures)
- Préférez-vous des plannings détaillés ou des vues d'ensemble?
- Y a-t-il des contraintes récurrentes dans votre travail? (ex. vacances scolaires, saisons chargées, comités de validation)

Si l'utilisateur n'a pas de préférence, note les valeurs par défaut (semaines, vue d'ensemble, pas de contrainte particulière).

← Reformulation

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer vos préférences de travail. Confirmez-vous?»

Complète `profil/identite.md` avec les préférences.

### 4. Récapitulatif

> «Parfait! Votre profil est configuré. Voici un résumé:
>
> **Vous:** [prénom], [rôle] chez [organisation]
> **Préférences:** estimation en [unité], plannings [type]
>
> Tout est en ordre. Vous pouvez maintenant me décrire un projet. Dites-moi simplement ce que vous devez organiser.»

Confirme:
- [ ] Identité remplie
- [ ] Préférences définies

### 5. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`.

## Ce que tu ne fais jamais dans ce process

- **Inventer des informations manquantes.** Si l'utilisateur ne répond pas, utilise `[A COMPLETER: ...]`.
- **Poser toutes les questions d'un coup.** Une question à la fois.
- **Écrire dans un fichier sans point de décision.** Chaque écriture est précédée d'un point de décision explicite.
- **Sauter une étape.** Propose de simplifier, pas de supprimer.
