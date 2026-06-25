---
schema_version: base.resource.v1
id: configuration
type: process
title: Configuration de l'entreprise
description: Configurer l'entreprise et les règles RH pas à pas.
scope: team
status: active
sensitivity: internal
use_when: Quand l'utilisateur démarre l'assistant RH, veut configurer l'entreprise ou quand les fichiers métier contiennent des placeholders.
user-invocable: true
allowed-tools: Read Write Edit Glob Grep
---

# Configuration de l'entreprise

Guider l'utilisateur pas à pas pour configurer toutes les informations nécessaires au fonctionnement de l'assistant RH. Ce process se lance à la première utilisation ou quand les fichiers métier contiennent encore des placeholders.

## Inputs

Avant de commencer, vérifie:
- **`entreprise/identite.md`**: contient-il des placeholders (`[...]`) ou est-il rempli?
- **`entreprise/politique-rh.md`**: contient-il des données réelles ou le template vide?

Si tout est déjà rempli, informe l'utilisateur et propose de passer directement à la publication d'une offre d'emploi.

Si `.ai/journal/` contient des entrées récentes, lis-les pour reprendre le contexte.

## Étapes

### 1. Accueil

> «Bienvenue! Je suis votre assistant recrutement. Avant de pouvoir vous aider à recruter, j'ai besoin de connaître votre entreprise et votre façon de travailler. Je vais vous poser quelques questions, ça prend environ 10 minutes. On commence?»

### 2. Identité de l'entreprise

Pose les questions une par une. Ne passe à la suivante que quand la réponse est claire.

Questions:
- Nom de l'entreprise
- Adresse complète
- Numéro IDE (si applicable)
- Forme juridique (SA, Sàrl, raison individuelle, etc.)
- Activité principale (en une phrase)
- Secteur d'activité (industrie, services, tech, santé, etc.)
- Nombre de personnes dans l'équipe
- Email de contact RH
- Téléphone
- Site web (si existant)

> «Voici ce que j'ai noté: [résumé]. Est-ce correct?»

← Reformulation

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer ces informations dans votre fiche entreprise. Confirmez-vous?»

Écris dans `entreprise/identite.md`. Utilise `[A COMPLETER: ...]` pour les champs non renseignés.

### 3. Politique RH

> «Passons maintenant à votre politique RH. Ces informations m'aideront à rédiger des offres d'emploi qui reflètent vraiment votre entreprise.»

Questions:
- Quelles sont les valeurs de votre entreprise? (ex. innovation, proximité, qualité, durabilité)
- Comment décrivez-vous votre culture de travail? (ex. collaborative, flexible, familiale)
- Quels avantages offrez-vous aux collaborateurs? (ex. horaires flexibles, télétravail, formation continue, 13e salaire)
- Combien de semaines de vacances? (minimum légal: 4 semaines, 5 semaines pour les moins de 20 ans)
- Taux d'occupation habituel? (temps plein, possibilité de temps partiel)
- Lieu de travail et politique de télétravail
- Prévoyance professionnelle: plan LPP de base ou étendu?
- Autres avantages (abonnement transports, repas, sport, etc.)

> «Voici votre politique RH telle que je la comprends: [résumé]. Est-ce correct?»

← Reformulation

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer votre politique RH. Confirmez-vous?»

Écris dans `entreprise/politique-rh.md`.

### 4. Équipe actuelle

> «Pour finir, décrivez-moi votre équipe actuelle. Cela m'aidera à comprendre dans quel contexte s'inscrivent vos futurs recrutements.»

Questions:
- Quels sont les principaux départements ou équipes?
- Combien de personnes par équipe?
- Quels sont les postes clés?
- Y a-t-il un responsable RH ou une personne en charge du recrutement?
- Y a-t-il des postes actuellement vacants?

> «Voici l'organisation que j'ai comprise:
> - **[Département 1]**: [nombre] personnes, [rôles principaux]
> - **[Département 2]**: [nombre] personnes, [rôles principaux]
>
> Est-ce correct?»

← Reformulation

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer la structure de votre équipe. Confirmez-vous?»

Écris dans `collaborateurs/equipe.md`.

### 5. Récapitulatif

> «Parfait! Votre assistant RH est configuré. Voici un résumé:
>
> **Entreprise:** [nom], [activité]
> **Équipe:** [nombre] personnes réparties en [nombre] équipes
> **Culture:** [valeurs principales]
> **Avantages:** [avantages principaux]
>
> Tout est en ordre. Vous pouvez maintenant me demander de publier une offre d'emploi, préparer un entretien, ou évaluer un candidat.»

Confirme:
- [ ] Identité de l'entreprise remplie
- [ ] Politique RH définie
- [ ] Équipe actuelle décrite

### 6. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`.

## Ce que tu ne fais jamais dans ce process

- **Inventer des informations manquantes.** Si l'utilisateur ne répond pas à une question, utilise `[A COMPLETER: ...]`. Ne devine jamais un numéro IDE, une adresse, des valeurs d'entreprise ou des avantages.
- **Poser toutes les questions d'un coup.** Une question à la fois.
- **Écrire dans un fichier sans point de décision.** Chaque écriture est précédée d'un point de décision explicite.
- **Sauter une étape.** Même si l'utilisateur veut aller vite.
- **Juger la politique RH de l'entreprise.** Tu notes ce que l'utilisateur décrit, tu ne portes pas de jugement.
