---
schema_version: base.resource.v1
id: publier-offre
type: process
title: Publier une offre d'emploi
description: Créer une offre d'emploi professionnelle de A à Z.
scope: team
status: active
sensitivity: internal
use_when: Quand l'utilisateur veut recruter, publier un poste ou rédiger une annonce d'emploi.
routing:
  avoid_when:
    - Quand l'utilisateur veut rédiger un post LinkedIn, une newsletter ou un contenu marketing sans lien avec le recrutement.
argument-hint: "[titre du poste recherché]"
user-invocable: true
allowed-tools: Read Write Edit Glob Grep
---

# Publier une offre d'emploi

Créer une offre d'emploi professionnelle de A à Z: comprendre le besoin, définir le profil, rédiger l'annonce, et préparer la grille d'évaluation.

## Inputs

Demande à l'utilisateur:
- **Le poste recherché**: titre ou description du rôle
- **Le département ou l'équipe**: dans quelle équipe s'inscrit ce poste
- **L'urgence**: quand le poste doit-il être pourvu?

Avant de commencer, vérifie que les fichiers suivants sont remplis:
- `entreprise/identite.md`: sinon, charge `skills/processes/configuration/SKILL.md`
- `entreprise/politique-rh.md`: sinon, charge `skills/processes/configuration/SKILL.md`

Si `.ai/journal/` contient des entrées récentes, lis-les pour le contexte.

## Étapes

### 1. Comprendre le besoin

Lis la demande et pose des questions de clarification:

> «Si je comprends bien, vous cherchez un(e) [titre du poste] pour l'équipe [département]. Quelques questions pour bien cerner le besoin:»

Questions à poser une par une:
- Pourquoi ce recrutement? (nouveau poste, remplacement, croissance)
- Quelles seront les missions principales? (3 à 5 missions clés)
- À qui ce poste sera-t-il rattaché? (responsable hiérarchique)
- Y a-t-il des interactions particulières? (équipe, clients, partenaires)
- Quel est le taux d'occupation? (100%, 80%, etc.)
- Quelle est la date d'entrée souhaitée?
- S'agit-il d'un CDI ou d'un CDD? (si CDD, quelle durée?)

← Reformulation

### 2. Vérifier les informations entreprise

Lis `entreprise/identite.md` et `entreprise/politique-rh.md` pour:
- Récupérer la description de l'entreprise (pour l'introduction de l'annonce)
- Vérifier les avantages à mentionner
- Confirmer les conditions de travail (vacances, télétravail, prévoyance)

Lis aussi la compétence `skills/competences/metier-rh/SKILL.md` pour les bonnes pratiques de rédaction.

### 3. Définir le profil recherché

Pose les questions suivantes:

**Compétences requises** (indispensables):
- Formation souhaitée (CFC, Bachelor, Master, etc.)
- Années d'expérience minimum
- Compétences techniques spécifiques
- Langues requises et niveau

**Compétences souhaitées** (un plus, pas éliminatoires):
- Compétences complémentaires
- Certifications ou formations supplémentaires
- Expérience dans un secteur particulier

**Qualités personnelles**:
- Traits de caractère recherchés (autonomie, esprit d'équipe, rigueur, etc.)

> «Voici le profil que je propose:
> - **Indispensable:** [liste]
> - **Un plus:** [liste]
> - **Qualités:** [liste]
>
> Est-ce que ça correspond à ce que vous cherchez?»

← Reformulation

### 4. Rédiger l'offre d'emploi

Lis le template `templates/offre-emploi_v1.md` et remplis-le avec toutes les informations collectées.

Présente l'offre complète à l'utilisateur, section par section:

> «Voici le projet d'annonce. Je vous la présente section par section:»
>
> **Présentation de l'entreprise:** [texte]
>
> **Le poste:** [titre, missions]
>
> **Votre profil:** [compétences requises et souhaitées]
>
> **Ce que nous offrons:** [avantages, culture, conditions]
>
> **Conditions:** [taux, salaire, lieu, date d'entrée]
>
> **Pour postuler:** [processus de candidature, délai]

← Reformulation

### 5. Vérification légale

Avant de finaliser, vérifie que l'annonce respecte les règles de non-discrimination. Lis `skills/competences/metier-rh/SKILL.md` pour la checklist.

Points de contrôle:
- Pas de mention d'âge ou de tranche d'âge
- Pas de préférence de genre (utiliser l'écriture inclusive ou les deux formes)
- Pas de critère de nationalité (sauf si légalement justifié)
- Pas de critère physique non lié au poste
- Indication salariale présente (fourchette ou «selon expérience»)
- Date limite de candidature mentionnée
- Processus de candidature clair

> «J'ai vérifié que l'annonce respecte les bonnes pratiques de non-discrimination. [Résultat de la vérification].»

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer l'offre d'emploi. Confirmez-vous?»

### 6. Enregistrer l'offre

Sauvegarde l'offre dans `postes-ouverts/YYYY-MM-DD_titre-du-poste.md` en utilisant la date du jour et un titre lisible (en minuscules, tirets, sans accents).

> «L'offre a été enregistrée. Vous pouvez la retrouver dans votre dossier de postes ouverts.
>
> **Important: relisez l'annonce avant de la diffuser.** Vérifiez les conditions, le salaire et la date limite. C'est vous qui décidez où et quand la publier.»

### 7. Préparer la grille d'entretien

Propose de préparer une grille d'évaluation adaptée à ce poste:

> «Souhaitez-vous que je prépare aussi une grille d'entretien pour ce poste? Elle vous servira à évaluer les candidats de manière structurée et équitable.»

Si oui, lis `templates/grille-entretien_v1.md` et crée une grille personnalisée avec:
- Les compétences techniques identifiées à l'étape 3
- Les qualités personnelles recherchées
- Des questions d'entretien adaptées au poste

Présente la grille à l'utilisateur pour validation.

← Reformulation

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer la grille d'entretien. Confirmez-vous?»

Sauvegarde dans `postes-ouverts/YYYY-MM-DD_titre-du-poste_grille.md`.

### 8. Récapitulatif

> «Votre offre d'emploi est prête:
> - **Annonce:** enregistrée dans vos postes ouverts
> - **Grille d'entretien:** [préparée / à préparer plus tard]
>
> Prochaines étapes de votre côté:
> 1. Relire l'annonce une dernière fois
> 2. La publier sur vos canaux (site web, jobup.ch, LinkedIn, etc.)
> 3. Quand vous recevez des candidatures, dites-le-moi. Je vous aiderai à préparer les entretiens.
>
> Souhaitez-vous publier un autre poste?»

### 9. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`.

## Ce que tu ne fais jamais dans ce process

- **Discriminer.** Jamais de critères liés à l'âge, au genre, à l'origine ethnique, à la religion, à l'orientation sexuelle, à la situation familiale ou à l'état de santé.
- **Publier l'annonce directement.** Tu rédiges et enregistres. La publication sur les plateformes d'emploi est toujours la responsabilité de l'utilisateur.
- **Inventer des fourchettes salariales.** Si l'utilisateur ne donne pas d'indication, propose «selon expérience et qualifications».
- **Ignorer la vérification légale.** L'étape 5 n'est pas optionnelle.
- **Créer une offre sans configuration.** Si les fichiers contiennent des placeholders, redirige vers `/configuration`.
