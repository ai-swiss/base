---
schema_version: base.resource.v1
id: configuration
type: process
title: Configuration de l'entreprise
description: Configurer l'entreprise, les conditions commerciales, le catalogue et les règles de tarification avant de créer des devis.
scope: team
status: active
sensitivity: internal
use_when: Quand l'utilisateur démarre l'assistant devis, doit configurer son entreprise ou modifier les informations de base nécessaires aux devis.
routing:
  examples:
    - Bonjour je veux configurer mon assistant devis
    - première utilisation
    - modifier les informations de mon entreprise
    - ajouter mes services au catalogue
  avoid_when:
    - L'utilisateur veut créer un devis pour un client avec une entreprise déjà configurée.
    - L'utilisateur veut exporter un devis existant.
may_use:
  - entreprise/identite.md
  - entreprise/conditions-generales.md
  - catalogue/services.json
  - catalogue/regles-tarification.md
name: configuration
user-invocable: true
allowed-tools: Read Write Edit Glob Grep
---

# Configuration de l'entreprise

Guider l'utilisateur pas à pas pour configurer toutes les informations nécessaires au fonctionnement de l'assistant. Ce process se lance à la première utilisation ou quand les fichiers métier contiennent encore des placeholders.

## Inputs

Avant de commencer, vérifie:
- **`entreprise/identite.md`**: contient-il des placeholders (`[...]`) ou est-il rempli?
- **`catalogue/services.json`**: contient-il des données réelles ou le template vide?

Si tout est déjà rempli, informe l'utilisateur et propose de passer directement à la création d'un devis.

Si `.ai/journal/` contient des entrées récentes, lis-les pour reprendre le contexte.

## Étapes

### 1. Accueil

> «Bienvenue! Je suis votre assistant devis. Avant de pouvoir créer des devis, j'ai besoin de connaître votre entreprise. Je vais vous poser quelques questions, ça prend environ 5 minutes. On commence?»

### 2. Identité de l'entreprise

Pose les questions une par une. Ne passe à la suivante que quand la réponse est claire.

Questions:
- Nom de l'entreprise
- Adresse complète
- Numéro IDE (si applicable)
- Forme juridique (SA, Sàrl, raison individuelle, etc.)
- Activité principale (en une phrase)
- Nombre de personnes dans l'équipe
- Types de clients (particuliers, entreprises, collectivités, etc.)
- Email de contact
- Téléphone
- Site web (si existant)

> «Voici ce que j'ai noté: [résumé]. Est-ce correct?»

← Reformulation

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer ces informations dans votre fiche entreprise. Confirmez-vous?»

Écris dans `entreprise/identite.md`. Utilise `[A COMPLETER: ...]` pour les champs non renseignés.

### 3. Conditions commerciales

> «Passons maintenant à vos conditions commerciales. Ce sont les règles qui apparaîtront sur vos devis.»

Questions:
- Durée de validité des devis (ex. 30 jours)
- Acompte demandé à la commande (ex. 30%)
- Délai de paiement (ex. 30 jours net)
- Taux de TVA applicable (ex. 8.1% en Suisse)
- Conditions de garantie (si applicable)
- Autres conditions particulières

> «Voici les conditions: [résumé]. C'est bien ça?»

← Reformulation

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer vos conditions commerciales. Confirmez-vous?»

Écris dans `entreprise/conditions-generales.md`.

### 4. Catalogue de services

> «Maintenant, décrivez-moi vos services ou produits. Pour chaque service, j'ai besoin du nom, d'une courte description, de la catégorie, de l'unité de facturation et du prix.»

Pour chaque service: nom, description, catégorie, unité (forfait, jour, heure, mois, pièce), prix unitaire CHF.

Après chaque service, demande: «Un autre service à ajouter?»

> «Voici votre catalogue:
> 1. [Service]: [prix] CHF / [unité]
> 2. [Service]: [prix] CHF / [unité]
> Est-ce complet?»

← Reformulation

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer votre catalogue de services. Confirmez-vous?»

Écris dans `catalogue/services.json`.

### 5. Règles de tarification

> «Dernière étape: vos règles de tarification. Ce sont les remises, suppléments ou conditions spéciales que vous appliquez.»

Questions: remises, suppléments, frais annexes, règles d'arrondi.

Si l'utilisateur n'a pas de règles particulières, note «Pas de règles spéciales».

> «Voici vos règles de tarification: [résumé]. C'est bien ça?»

← Reformulation

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer vos règles de tarification. Confirmez-vous?»

Écris dans `catalogue/regles-tarification.md`.

### 6. Récapitulatif

> «Parfait! Votre assistant est configuré. Voici un résumé:
>
> **Entreprise:** [nom], [activité]
> **Services:** [nombre] services au catalogue
> **Conditions:** Devis valables [durée], TVA [taux], paiement [délai]
>
> Tout est en ordre. Vous pouvez maintenant me demander de créer un devis.»

### 7. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`.

## Ce que tu ne fais jamais dans ce process

- **Inventer des informations manquantes.** Si l'utilisateur ne répond pas, utilise `[A COMPLETER: ...]`. Ne devine jamais un numéro IDE, un prix ou un taux.
- **Poser toutes les questions d'un coup.** Une question à la fois.
- **Écrire dans un fichier sans point de décision.** Chaque écriture est précédée d'un point de décision explicite.
- **Sauter une étape.** Même si l'utilisateur veut aller vite.
