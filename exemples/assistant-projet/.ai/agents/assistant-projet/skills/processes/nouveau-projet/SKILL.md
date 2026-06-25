---
schema_version: base.resource.v1
id: nouveau-projet
type: process
title: Nouveau projet
description: Démarrer et structurer un nouveau projet de A à Z.
scope: team
status: active
sensitivity: internal
use_when: Quand l'utilisateur veut lancer, organiser ou planifier un projet.
argument-hint: "[description du projet à organiser]"
user-invocable: true
allowed-tools: Read Write Edit Glob Grep
---

# Nouveau projet

Démarrer et structurer un nouveau projet de A à Z: comprendre le besoin, décomposer en tâches, définir les jalons, et créer la fiche projet.

## Inputs

Demande à l'utilisateur:
- **Le projet**: description libre de ce qu'il doit organiser ou accomplir
- **Le contexte**: pourquoi ce projet, pour qui, quelles contraintes

Avant de commencer, vérifie que `profil/identite.md` est rempli. Sinon, charge `skills/processes/configuration/SKILL.md`.

Si `.ai/journal/` contient des entrées récentes, lis-les pour le contexte.

## Étapes

### 1. Comprendre le projet

Lis la description et reformule-la en termes clairs:

> «Si je comprends bien, votre projet consiste à:
> - [objectif principal]
> - [contexte / destinataires]
> - [contraintes mentionnées]
>
> Est-ce correct? Y a-t-il des précisions à ajouter?»

Clarifie si nécessaire:
- Y a-t-il une date butoir?
- Qui sont les parties prenantes?
- Y a-t-il un budget ou des ressources définies?
- Quels sont les critères de réussite?

← Reformulation

### 2. Décomposer en grandes étapes

Lis la compétence `skills/competences/methode-projet/SKILL.md` pour la méthodologie.

Propose une décomposition en 3 à 7 grandes étapes (pas plus). Pour chaque étape:
- Un nom clair et actionnable
- Ce qu'elle produit concrètement (livrable ou décision)
- Les dépendances éventuelles (quelle étape doit être terminée avant)

> «Voici comment je propose de structurer votre projet:
>
> 1. **[Étape]** -> produit: [livrable]
> 2. **[Étape]** -> produit: [livrable]
> 3. **[Étape]** -> produit: [livrable]
>
> Est-ce que cette structure vous convient? Voulez-vous ajouter, regrouper ou détailler certaines étapes?»

← Reformulation

### 3. Définir les jalons et le calendrier

Pour chaque grande étape, propose:
- Une date cible (d'après les contraintes connues et le profil de l'utilisateur)
- Le responsable si plusieurs personnes sont impliquées

Présente sous forme de calendrier:

> «Voici un rétroplanning proposé:
>
> | Jalon | Date cible | Responsable |
> |-------|-----------|-------------|
> | [Étape 1] terminée | [date] | [qui] |
> | [Étape 2] terminée | [date] | [qui] |
> | **Projet livré** | **[date]** | |
>
> Ces dates sont-elles réalistes pour vous?»

Si l'utilisateur n'a pas donné de date butoir, demande:
> «Avez-vous une date limite pour ce projet? Sinon, sur combien de temps souhaitez-vous l'étaler?»

← Reformulation

### 4. Identifier les risques et points d'attention

Propose 2-3 risques potentiels et comment les anticiper:

> «Quelques points d'attention:
> - **[Risque 1]**: [suggestion pour l'anticiper]
> - **[Risque 2]**: [suggestion pour l'anticiper]
>
> Voyez-vous d'autres risques?»

### 5. Créer la fiche projet

Utilise le template `templates/fiche-projet_v1.md` pour générer la fiche complète.

Crée un dossier pour le projet dans `projets/`:
- Nommage: `AAAA-MM_nom-court-du-projet` (ex. `2026-05_seminaire-equipe`)
- Fichier principal: `fiche-projet.md`

**⚠ Point de décision - avant écriture:**
> «Je propose de créer votre fiche projet dans `projets/[nom-dossier]/`. D'accord?»

### 6. Récapitulatif

> «Votre projet est structuré:
>
> **Projet:** [nom]
> **Objectif:** [objectif en une phrase]
> **Étapes:** [nombre] grandes étapes
> **Échéance:** [date butoir]
> **Fiche:** `projets/[nom-dossier]/fiche-projet.md`
>
> Vous pouvez à tout moment me demander un point d'avancement, ajouter des tâches ou ajuster le planning.
>
> **Important: relisez la fiche projet et vérifiez que les dates et responsabilités correspondent à votre réalité.**»

### 7. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`.

## Ce que tu ne fais jamais dans ce process

- **Inventer des dates.** Si l'utilisateur ne donne pas de contrainte temporelle, demande. Ne pose jamais une date arbitraire.
- **Inventer un budget.** Si l'utilisateur ne mentionne pas de budget, ne propose pas de chiffres.
- **Sous-estimer.** Si le projet semble complexe pour le calendrier proposé, dis-le.
- **Créer un planning de 50 tâches.** Reste à 3-7 grandes étapes.
- **Écrire dans un fichier sans point de décision.** Chaque écriture est précédée d'un point de décision explicite.
