---
schema_version: base.resource.v1
id: configuration
type: process
title: Configurer mon espace de réflexion
description: Mettre en place l'espace personnel et les préférences de réflexion, pas à pas.
scope: personal
status: active
sensitivity: internal
use_when: Première utilisation, ou quand la personne veut mettre en place ou modifier son espace et ses préférences.
routing:
  examples:
    - Configurer mon espace de réflexion
    - Mettre en place mes préférences
    - Commencer, je débute avec cet assistant
    - Paramétrer mon profil
  avoid_when:
    - Clarifier une décision précise.
    - Explorer une question ou synthétiser des notes.
name: configuration
keywords: [configurer, installer, commencer, démarrer, paramétrer, profil, préférences, première utilisation]
argument-hint: "[rien, ou ce que la personne veut régler]"
user-invocable: true
allowed-tools: Read Write Edit Glob Grep
---

# Configurer mon espace de réflexion

Mettre en place l'espace personnel pour que l'assistant connaisse la façon de réfléchir de la personne, sans rien imposer. La configuration est légère et se modifie à tout moment.

## Inputs

Rien n'est obligatoire. Demande, une question à la fois:
- **Les domaines** sur lesquels la personne réfléchit souvent (travail, études, projets, choix de vie)
- **Ce qui compte** pour elle quand elle décide (ses valeurs, ses critères récurrents)
- **Sa façon de décider**: plutôt rapide ou prudente, plutôt seule ou en discutant

## Étapes

### 1. Expliquer et rassurer

> «Je vais mettre en place votre espace de réflexion. Tout reste sur votre machine, pour vous seul. Vous pourrez tout modifier plus tard. On peut s'arrêter quand vous voulez.»

### 2. Recueillir les préférences, une question à la fois

Pose les questions ci-dessus une par une. N'enchaîne pas. Si la personne ne sait pas, propose de laisser le champ ouvert (`[A COMPLETER]`) plutôt que d'inventer.

← Reformulation après chaque réponse

### 3. Récapituler avant d'écrire

> «Voici ce que je retiens pour votre profil:
> - **Domaines**: [...]
> - **Ce qui compte pour vous**: [...]
> - **Votre façon de décider**: [...]
>
> Est-ce juste? Souhaitez-vous corriger quelque chose?»

← Reformulation

### 4. Enregistrer

**⚠ Point de validation - avant écriture:**
> «Je suis prêt à enregistrer ceci dans `mon-espace/profil.md`. Confirmez-vous?»

Écris le profil validé dans `mon-espace/profil.md`, en remplaçant les placeholders. Laisse `[A COMPLETER]` là où la personne a préféré ne pas répondre.

> «C'est en place. Vous pouvez maintenant me demander de clarifier une décision, d'explorer une question, ou de mettre de l'ordre dans vos notes.»

### 5. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`.

## Ce que tu ne fais jamais dans ce process

- **Imposer une structure**: la personne organise son espace comme elle veut, tu t'adaptes
- **Inventer une préférence**: une réponse manquante reste `[A COMPLETER]`
- **Écrire sans confirmation**: l'étape 4 valide avant toute écriture
