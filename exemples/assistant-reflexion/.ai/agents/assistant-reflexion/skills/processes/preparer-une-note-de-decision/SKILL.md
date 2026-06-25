---
schema_version: base.resource.v1
id: preparer-une-note-de-decision
type: process
title: Préparer une note de décision
description: Rédiger une note de décision claire, uniquement à partir d'éléments que la personne a validés, en signalant ce qui reste supposé.
scope: personal
status: active
sensitivity: internal
use_when: Quand la personne veut formaliser par écrit une décision déjà réfléchie, pour la garder ou la justifier.
routing:
  examples:
    - Préparer une note de décision écrite
    - Mettre par écrit la décision que j'ai prise
    - Formaliser mon choix dans un mémo
    - Rédiger une note pour justifier ma décision
  avoid_when:
    - Hésiter encore ou peser des options non tranchées.
    - Explorer une question ouverte.
    - Paramétrage initial de l'espace.
name: preparer-une-note-de-decision
keywords: [note de décision, mémo, formaliser, mettre par écrit, rédiger ma décision, justifier mon choix]
argument-hint: "[la décision à formaliser]"
user-invocable: true
allowed-tools: Read Write Edit Glob Grep
---

# Préparer une note de décision

Mettre par écrit une décision déjà prise, dans une note claire et fidèle. Une note de décision n'invente rien: elle restitue un raisonnement que la personne a mené et validé. La structure de la note est elle-même une protection: elle oblige à rendre explicites le choix, ses raisons, et ce qui reste incertain.

Lis `skills/competences/validation-aux-bons-moments/SKILL.md`. Si une réflexion existe déjà dans `reflexions/` sur ce sujet, lis-la: elle contient probablement les critères, options et hypothèses.

## Inputs

- **La décision** prise (le choix arrêté)
- **La réflexion** qui y a mené, si elle existe dans `reflexions/`

## Étapes

### 1. Vérifier que la décision est mûre

Une note de décision formalise un choix **déjà fait**. Avant de rédiger, vérifie-le honnêtement:

> «Pour écrire une note de décision, il faut que le choix soit arrêté. Avez-vous bien tranché, ou hésitez-vous encore?»

**Point de validation - aiguillage:**
- Si la personne hésite encore: ne rédige pas une note qui figerait une décision non prise. Propose plutôt `clarifier-une-decision`, puis reviens.
- Si le choix est arrêté: continue.

Ce refus de formaliser trop tôt est volontaire: écrire une décision lui donne du poids, et il ne faut pas donner ce poids à une hésitation.

### 2. Réunir les éléments validés

Reprends, depuis la réflexion existante ou en le demandant: le contexte, le choix, les raisons, les options écartées, et les hypothèses restées ouvertes.

> «Voici ce que je reprends de votre réflexion. Dites-moi ce qui n'est pas à jour.»

Tout élément qui n'a pas été validé reste marqué `[A VALIDER: ...]` ou `[HYPOTHESE: ...]`. Tu ne transformes pas une hypothèse en certitude en la recopiant dans une note propre.

← Validation des éléments

### 3. Rédiger la note

Assemble la note avec le template `templates/note-de-decision_v1.md`: contexte, décision, raisons, options écartées, hypothèses et incertitudes assumées, et date.

> «Voici la note de décision:
>
> ---
>
> [Note assemblée]
>
> ---
>
> Remarquez la section *Hypothèses assumées*: elle garde visible ce sur quoi la décision repose sans certitude. C'est ce qui vous permettra, plus tard, de comprendre pourquoi vous aviez choisi ainsi. Qu'ajusteriez-vous?»

← Validation de la note

### 4. Enregistrer

**⚠ Point de validation - avant écriture:**
> «Je suis prêt à enregistrer la note dans `reflexions/[sujet]_decision.md`. Confirmez-vous?»

Enregistre dans `reflexions/YYYY-MM-DD_sujet_decision.md`.

> «C'est enregistré. Relisez-la avant de vous y fier: c'est votre décision, et c'est vous qui l'assumez.»

### 5. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`. Enregistre `[DECISION: choix | raison]`.

## Ce que tu ne fais jamais dans ce process

- **Formaliser une décision non prise**: si la personne hésite, tu reviens à la clarification
- **Transformer une hypothèse en certitude**: ce qui était supposé reste signalé dans la note
- **Inventer une raison**: tu restitues le raisonnement de la personne, tu n'en fabriques pas
- **Vérifier ta propre note**: tu proposes, la personne relit et assume
