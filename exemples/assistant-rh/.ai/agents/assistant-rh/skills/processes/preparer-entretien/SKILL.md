---
schema_version: base.resource.v1
id: preparer-entretien
type: process
title: Préparer un entretien
description: Préparer un entretien d'embauche de manière structurée.
scope: team
status: active
sensitivity: internal
use_when: Quand l'utilisateur veut préparer, organiser ou mener un entretien avec un candidat.
argument-hint: "[nom du candidat et poste concerné]"
user-invocable: true
allowed-tools: Read Write Edit Glob Grep
---

# Préparer un entretien

Préparer un entretien d'embauche de manière structurée: relire l'offre, analyser le profil du candidat, formuler les questions, construire la grille d'évaluation, et après l'entretien, aider à capturer les notes et l'évaluation.

## Inputs

Demande à l'utilisateur:
- **Le nom du candidat**: pour vérifier s'il existe un dossier dans `candidatures/`
- **Le poste concerné**: pour identifier l'offre dans `postes-ouverts/`

Avant de commencer, vérifie:
- Qu'une offre d'emploi existe dans `postes-ouverts/` pour ce poste
- Si un dossier candidat existe déjà dans `candidatures/`

Si `.ai/journal/` contient des entrées récentes, lis-les pour le contexte.

## Étapes

### 1. Relire l'offre d'emploi

Lis le fichier correspondant dans `postes-ouverts/`.

Résume les points clés:
> «Pour rappel, voici les éléments clés du poste de [titre]:
> - **Missions principales:** [liste]
> - **Profil recherché:** [compétences clés]
> - **Qualités attendues:** [liste]
>
> Est-ce toujours à jour, ou y a-t-il des ajustements?»

← Reformulation

### 2. Analyser le dossier du candidat

Si un fichier existe dans `candidatures/`, lis-le et résume:
> «Voici ce que je sais de [nom du candidat]:
> - **Formation:** [résumé]
> - **Expérience:** [résumé]
> - **Points forts par rapport au poste:** [liste]
> - **Points à explorer en entretien:** [liste]
>»

Si aucun fichier n'existe, demande:
> «Je n'ai pas encore de dossier pour ce candidat. Pouvez-vous me décrire son profil en quelques mots? (formation, expérience, ce qui a retenu votre attention dans sa candidature)»

← Reformulation

### 3. Préparer les questions d'entretien

Lis `skills/competences/metier-rh/SKILL.md` pour les bonnes pratiques (méthode STAR, questions interdites).

Propose des questions réparties en catégories:

> «Voici les questions que je propose pour l'entretien:»
>
> **Compétences techniques** (liées au poste):
> 1. [Question adaptée à la compétence 1]
> 2. [Question adaptée à la compétence 2]
> 3. [Question adaptée à la compétence 3]
>
> **Compétences comportementales** (méthode STAR: Situation, Tâche, Action, Résultat):
> 1. «Décrivez une situation où vous avez dû [compétence comportementale]. Quel était le contexte, qu'avez-vous fait, et quel a été le résultat?»
> 2. «Racontez-moi un moment où [compétence comportementale].»
> 3. «Comment avez-vous géré [situation typique du poste]?»
>
> **Adéquation culturelle**:
> 1. «Qu'est-ce qui vous attire dans notre entreprise?»
> 2. «Décrivez votre environnement de travail idéal.»
> 3. «Comment décrivez-vous votre façon de collaborer en équipe?»
>
> **Motivation et projection**:
> 1. «Pourquoi ce poste vous intéresse-t-il?»
> 2. «Où vous voyez-vous dans 2-3 ans?»
> 3. «Qu'attendez-vous de ce nouveau poste?»
>
> «Souhaitez-vous modifier, ajouter ou retirer des questions?»

← Reformulation

### 4. Construire la grille d'évaluation

Lis `templates/grille-entretien_v1.md` et crée une grille personnalisée pour ce poste et ce candidat.

Présente la grille:
> «Voici la grille d'évaluation que je propose. Pendant l'entretien, vous noterez chaque critère de 1 à 5:
>
> | Critère | Question associée | Notes | Score (1-5) |
> |---------|-------------------|-------|-------------|
> | [Compétence technique 1] | [Question] | | /5 |
> | [Compétence technique 2] | [Question] | | /5 |
> | [Compétence comportementale 1] | [Question] | | /5 |
> | [Adéquation culturelle] | [Question] | | /5 |
> | [Motivation] | [Question] | | /5 |
>
> Cette grille vous convient-elle?»

← Reformulation

### 5. Proposer la structure de l'entretien

Propose un déroulement type:

> «Voici une proposition de déroulement pour un entretien de 45 à 60 minutes:
>
> 1. **Accueil et mise à l'aise** (5 min): présentation des personnes, déroulement de l'entretien
> 2. **Présentation de l'entreprise et du poste** (5 min): contexte, missions, équipe
> 3. **Parcours du candidat** (10 min): formation, expérience, motivations
> 4. **Questions techniques** (10 min): compétences liées au poste
> 5. **Questions comportementales** (10 min): méthode STAR
> 6. **Adéquation culturelle et motivation** (5 min): valeurs, projection
> 7. **Questions du candidat** (5-10 min): laisser le candidat poser ses questions
> 8. **Conclusion** (5 min): prochaines étapes, délai de réponse
>
> Souhaitez-vous adapter cette structure?»

← Reformulation

### 6. Après l'entretien: capturer les notes

Quand l'utilisateur revient après l'entretien, aide-le à structurer ses observations:

> «Comment s'est passé l'entretien avec [nom]? Je vous propose de remplir la grille ensemble:»

Pour chaque critère de la grille:
- Demande les observations (ce qui a été dit, les impressions)
- Demande un score de 1 à 5
- Note les commentaires

Puis demande:
- Points forts du candidat
- Points de vigilance
- Questions restées sans réponse
- Impression générale

> «Voici le résumé de l'entretien:
> - **Score global:** [moyenne] / 5
> - **Points forts:** [liste]
> - **Points de vigilance:** [liste]
> - **Recommandation:** [embaucher / ne pas retenir / second entretien nécessaire]
>
> Est-ce que cela reflète bien votre ressenti?»

← Reformulation

### 7. Enregistrer l'évaluation

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer le compte-rendu d'entretien. Confirmez-vous?»

Crée le dossier candidat si nécessaire: `candidatures/nom-du-candidat/`

Sauvegarde le compte-rendu dans `candidatures/nom-du-candidat/entretien_YYYY-MM-DD.md` avec:
- Les informations du candidat
- La référence du poste
- La grille d'évaluation remplie
- Les observations
- La recommandation

> «Le compte-rendu d'entretien est enregistré.
>
> Souhaitez-vous:
> - Préparer un entretien avec un autre candidat pour ce poste?
> - Comparer les évaluations des candidats déjà rencontrés?
> - Passer à autre chose?»

### 8. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`.

## Ce que tu ne fais jamais dans ce process

- **Évaluer sans critères objectifs.** Chaque évaluation s'appuie sur la grille définie, pas sur des impressions vagues.
- **Prendre la décision d'embauche.** Tu structures l'évaluation et proposes une recommandation. La décision finale appartient toujours à l'utilisateur.
- **Poser ou suggérer des questions illégales.** Jamais de questions sur la situation familiale, la religion, les convictions politiques, l'état de santé, l'orientation sexuelle, l'appartenance syndicale ou le projet de grossesse.
- **Partager des informations entre candidats.** Les observations sur un candidat ne sont jamais mentionnées dans le contexte d'un autre candidat.
- **Inventer des informations sur le candidat.** Tu t'appuies uniquement sur ce que l'utilisateur te communique.
