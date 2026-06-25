---
schema_version: base.resource.v1
id: publier-linkedin
type: process
title: Créer un post LinkedIn
description: Créer un post LinkedIn professionnel de A à Z.
scope: team
status: active
sensitivity: internal
use_when: Quand l'utilisateur veut publier, partager ou communiquer sur LinkedIn.
argument-hint: "[sujet ou message à transmettre]"
user-invocable: true
allowed-tools: Read Write Edit Glob Grep
---

# Créer un post LinkedIn

Créer un post LinkedIn professionnel de A à Z: comprendre le message, choisir l'angle, rédiger dans le bon ton, et valider avant publication.

## Inputs

Demande à l'utilisateur:
- **Le sujet ou message à transmettre**: texte libre décrivant ce qu'il veut communiquer
- **L'audience cible** (optionnel): à qui s'adresse ce post? Si non précisé, utiliser l'audience principale dans `audiences/personas.md`

Avant de commencer, vérifie que les fichiers suivants sont remplis:
- `entreprise/identite.md`: sinon, charge `skills/processes/configuration/SKILL.md`
- `charte/ton-et-style.md`: sinon, charge `skills/processes/configuration/SKILL.md`

Si `.ai/journal/` contient des entrées récentes, lis-les pour le contexte.

## Étapes

### 1. Comprendre le message

Lis la demande et reformule-la en termes clairs:

> «Si je comprends bien, vous souhaitez communiquer sur:
> - **Message principal**: [reformulation]
> - **Objectif**: [informer / engager / promouvoir / partager une expérience]
> - **Contexte**: [pourquoi maintenant?]
>
> Est-ce correct? Y a-t-il des précisions à ajouter?»

Clarifie si nécessaire:
- Y a-t-il un événement ou une actualité liée?
- Y a-t-il des informations spécifiques à mentionner (chiffres, noms, dates)?
- Y a-t-il des éléments à ne surtout pas mentionner?

← Reformulation

### 2. Consulter la charte et les audiences

Lis `charte/ton-et-style.md`, `charte/themes-cles.md` et `audiences/personas.md`.

Lis aussi la compétence `skills/competences/metier-communication/SKILL.md` pour les bonnes pratiques LinkedIn.

Vérifie:
- Le sujet est-il cohérent avec les thèmes clés de l'entreprise?
- Le ton prévu correspond-il à la charte?
- L'audience cible est-elle identifiée?

Si le sujet sort des thèmes habituels, signale-le:
> «Ce sujet ne fait pas partie de vos thèmes clés habituels. Souhaitez-vous quand même publier dessus, ou préférez-vous un angle plus proche de [thème existant]?»

### 3. Proposer des angles et des accroches

Propose 2 à 3 angles différents avec une accroche pour chacun:

> «Voici trois façons d'aborder ce sujet:
>
> **Angle 1: [nom de l'angle]**
> Accroche: «[première phrase du post]»
> Approche: [description en une phrase]
>
> **Angle 2: [nom de l'angle]**
> Accroche: «[première phrase du post]»
> Approche: [description en une phrase]
>
> **Angle 3: [nom de l'angle]**
> Accroche: «[première phrase du post]»
> Approche: [description en une phrase]
>
> Lequel vous attire? On peut aussi combiner.»

← Reformulation

### 4. Rédiger le post

Rédige un post complet en respectant:
- **Accroche**: première ligne percutante (c'est elle qui donne envie de cliquer «voir plus»)
- **Corps**: 2 à 3 paragraphes courts (150 à 300 mots au total)
- **Ton**: conforme à `charte/ton-et-style.md`
- **Appel à l'action**: question, invitation à commenter, ou lien
- **Hashtags**: 3 à 5 hashtags pertinents

Présente le post avec une mise en forme lisible:

> «Voici le post que je propose:
>
> ---
>
> [Texte complet du post]
>
> [hashtags]
>
> ---
>
> Longueur: [nombre] mots
> Ton: [description du ton utilisé]
> Audience: [persona cible]»

### 5. Réviser et ajuster

> «Qu'en pensez-vous? Souhaitez-vous:
> - Modifier le ton (plus formel, plus décontracté)?
> - Ajuster la longueur?
> - Changer l'accroche?
> - Ajouter ou retirer des informations?
>
> N'hésitez pas à me dire ce qui ne vous ressemble pas.»

← Reformulation

Itère autant de fois que nécessaire. Chaque modification est présentée en entier pour relecture facile.

### 6. Finaliser et enregistrer

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer le post validé dans `publications/[nom-fichier].md`. Confirmez-vous?»

Enregistre le post validé dans `publications/YYYY-MM-DD_linkedin_sujet.md` en utilisant le template `templates/post-linkedin_v1.md`.

> «Votre post est enregistré:
> - Document: `publications/[nom-fichier].md`
>
> **Important: relisez une dernière fois avant de publier sur LinkedIn.** C'est vous qui publiez, je ne peux pas le faire à votre place.
>
> Conseil: publiez de préférence en début de matinée (7h-9h) ou à la pause de midi (12h-14h) pour maximiser la visibilité.
>
> Souhaitez-vous créer un autre contenu?»

### 7. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`.

## Ce que tu ne fais jamais dans ce process

- **Publier à la place de l'utilisateur.** Tu rédiges, tu proposes. La publication sur LinkedIn est toujours la responsabilité de l'utilisateur.
- **Utiliser du jargon que l'utilisateur n'utilise pas.** Si le client écrit simplement, le post doit être simple.
- **Ignorer la charte éditoriale.** Toujours lire `charte/ton-et-style.md` avant de rédiger.
- **Inventer des faits ou des statistiques.** Si tu n'as pas l'information, demande-la.
- **Rédiger sans avoir validé le message clé.** L'étape 1 doit être complétée et validée avant toute rédaction.
