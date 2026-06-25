---
schema_version: base.resource.v1
id: suivi-actions
type: process
title: Suivre les actions et décisions
description: Extraire et suivre les actions et décisions ouvertes à travers les comptes-rendus.
scope: team
status: active
sensitivity: internal
use_when: Quand l'utilisateur veut savoir quelles actions sont ouvertes, qui fait quoi, ou suivre les décisions prises lors des réunions.
routing:
  examples:
    - Quelles actions sont encore ouvertes?
    - qui fait quoi et pour quand
    - fais le point sur les décisions prises
    - relance les actions en retard
  avoid_when:
    - Rédiger un nouveau compte-rendu à partir de notes.
    - Paramétrage initial de l'entreprise.
name: suivi-actions
keywords: [suivi, actions, décisions, échéances, qui fait quoi, ouvert, en cours, relance, point]
argument-hint: "[période, projet ou personne à suivre]"
user-invocable: true
allowed-tools: Read Write Edit Glob Grep
---

# Suivre les actions et décisions

Extraire les actions et décisions à travers les comptes-rendus existants, dresser un état des lieux clair (qui fait quoi, pour quand, où ça en est), et aider à relancer ce qui est ouvert.

## Inputs

Demande à l'utilisateur (optionnel):
- **Le périmètre**: toutes les réunions, ou un projet / une personne / une période en particulier?
- **L'objectif**: faire un point général, préparer une relance, ou vérifier une décision précise?

Avant de commencer, vérifie que `entreprise/identite.md` est rempli: sinon, charge `skills/processes/configuration/SKILL.md`.

Lis la compétence `skills/competences/metier-reunion/SKILL.md` et la compétence `skills/competences/marqueurs/SKILL.md`.

## Étapes

### 1. Rassembler les actions et décisions

Parcours les fichiers de `reunions/` et le `.ai/journal/`. Repère:
- les marqueurs `[DECISION: ... | ...]` (décisions confirmées)
- les actions (tâche, responsable, échéance, statut) dans les tableaux d'actions
- les marqueurs `[A VALIDER: ...]` et `[A COMPLETER: ...]` (éléments en suspens)
- les marqueurs `[ATTENTION: ...]` (alertes)

Applique le périmètre demandé (projet, personne, période).

### 2. Classer par statut

Classe les actions par statut:
- **Ouvertes**: à faire, échéance future ou non datée
- **En retard**: échéance dépassée par rapport à la date du jour
- **Terminées**: marquées comme faites
- **À compléter**: responsable ou échéance manquant (`[A COMPLETER]`)

### 3. Présenter l'état des lieux

Présente un tableau clair:

> «Voici l'état des actions [périmètre]:
>
> **En retard**
> | Action | Responsable | Échéance | Réunion d'origine |
> |--------|-------------|----------|-------------------|
> | [tâche] | [nom] | [date] | [réunion] |
>
> **Ouvertes**
> | Action | Responsable | Échéance | Réunion d'origine |
> |--------|-------------|----------|-------------------|
> | [tâche] | [nom] | [date] | [réunion] |
>
> **À compléter** (responsable ou échéance manquant)
> | Action | Manque | Réunion d'origine |
> |--------|--------|-------------------|
> | [tâche] | [A COMPLETER: responsable / échéance] | [réunion] |
>
> **Décisions récentes**
> - [DECISION: ... | ...]
>
> Souhaitez-vous que je prépare une relance, mette à jour un statut, ou complète un élément manquant?»

### 4. Mettre à jour ou relancer (optionnel)

Selon la demande:
- **Mettre à jour un statut**: proposer la modification de l'action concernée dans son compte-rendu d'origine.
- **Préparer une relance**: proposer un texte court et neutre rappelant l'action, le responsable et l'échéance. Ne pas inventer de nouvelle échéance: si elle doit changer, c'est l'utilisateur qui la fixe.
- **Compléter un élément**: demander l'information manquante et proposer de remplacer le `[A COMPLETER]` par la valeur.

**⚠ Point de décision - avant toute modification d'un compte-rendu:**
> «Je suis prêt à mettre à jour [fichier]: [description du changement]. Confirmez-vous?»

Si l'utilisateur souhaite un relevé consolidé, propose d'utiliser le template `templates/releve-decisions_v1.md` et enregistre-le dans `reunions/YYYY-MM-DD_releve-actions.md`.

### 5. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`. Note l'état des actions ouvertes et tout `[A COMPLETER]` restant.

## Ce que tu ne fais jamais dans ce process

- **Inventer une action, une décision ou une échéance.** Tu ne rapportes que ce qui figure dans les comptes-rendus et le journal.
- **Changer une échéance ou un responsable de ton propre chef.** Toute modification est proposée et validée par l'utilisateur.
- **Considérer une action comme terminée sans confirmation.** Le statut vient de l'utilisateur.
- **Modifier un compte-rendu sans point de décision.** Chaque écriture est précédée d'une confirmation explicite.
- **Déformer une décision en la résumant.** On cite ce qui a été décidé, fidèlement.
