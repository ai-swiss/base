---
schema_version: base.resource.v1
id: nouveau-devis
type: process
title: Nouveau devis
description: Créer un devis professionnel de A à Z à partir d'une demande client.
scope: team
status: active
sensitivity: internal
use_when: Quand l'utilisateur veut créer, chiffrer ou préparer une nouvelle offre commerciale ou un devis client.
routing:
  examples:
    - Nouveau devis pour Dupont SA
    - préparer une proposition commerciale
    - chiffrer une demande client
    - faire une offre pour un prospect
  avoid_when:
    - Paramétrage initial de l'entreprise ou du catalogue.
    - Correction d'un document existant.
    - Modifier devis existant.
    - Client conteste facture envoyée.
requires:
  - ref: calculer-devis
    access: execute
    purpose: recalculer mécaniquement les montants du devis après validation humaine du contenu
  - ref: exporter-pdf-devis
    access: execute
    purpose: exporter le devis validé en PDF
may_use:
  - catalogue/services.json
  - catalogue/regles-tarification.md
  - entreprise/conditions-generales.md
name: nouveau-devis
keywords: [devis, offre, proposition, prospect, client, commercial]
argument-hint: "[description de la demande client]"
user-invocable: true
allowed-tools: Read Write Edit Glob Grep Bash
---

# Nouveau devis

Créer un devis professionnel de A à Z: comprendre la demande client, identifier les services, chiffrer, et générer le document.

## Inputs

Demande à l'utilisateur:
- **La demande client**: texte libre décrivant ce que le client souhaite
- **Le nom du client**: pour vérifier s'il existe déjà dans `clients/`

Avant de commencer, vérifie que les fichiers suivants sont remplis:
- `entreprise/identite.md`: sinon, redirige vers `/configuration`
- `catalogue/services.json`: sinon, redirige vers `/configuration`

Si `.ai/journal/` contient des entrées récentes, lis-les pour le contexte.

## Étapes

### 1. Comprendre la demande

Lis la demande client et reformule-la en termes clairs:

> «Si je comprends bien, votre client souhaite:
> - [point 1]
> - [point 2]
>
> Est-ce correct? Y a-t-il des précisions à ajouter?»

← Reformulation

Clarifie si nécessaire: date de livraison, contraintes, nouveau ou ancien client.

### 2. Identifier le client

Vérifie dans `clients/` si une fiche existe déjà.

**Si le client est nouveau**, demande: nom, adresse, personne de contact, email.

> «Je crée une fiche pour [nom]. D'accord?»

← Reformulation

### 3. Mapper sur le catalogue

Lis `catalogue/services.json` et `catalogue/regles-tarification.md`. Consulte `skills/competences/metier-devis/SKILL.md` pour les conventions.

Pour chaque point de la demande, identifie les services correspondants, quantités et remises/suppléments applicables.

Si un besoin ne correspond à aucun service du catalogue:
> «[A VALIDER: Le client demande [besoin], mais il n'est pas dans votre catalogue. Prix estimé à [montant] CHF.]»

Si le budget est serré:
> «[ATTENTION: Budget client [montant] CHF, proposition à [montant] CHF - marge de [montant] CHF seulement]»

### 4. Proposer le devis

> «Voici ma proposition de devis pour [client]:
>
> | Prestation | Quantité | Prix unitaire | Total |
> |------------|----------|---------------|-------|
> | [service 1] | [qté] [unité] | [prix] CHF | [total] CHF |
> | [service 2] | [qté] [unité] | [prix] CHF | [total] CHF |
>
> Sous-total: [montant] CHF
> TVA [taux]: [montant] CHF
> **Total TTC: [montant] CHF**
>
> Souhaitez-vous modifier quelque chose?»

← Reformulation

### 5. Générer les fichiers

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à créer le devis DEV-[YYYY]-[NNN] pour [montant] CHF.
> Fichiers qui seront créés:
> - `devis/[nom-fichier].md` (document lisible)
> - `devis/[nom-fichier].json` (données structurées)
> - `clients/[nom].md` (fiche client, si nouveau)
> Confirmez-vous?»

Utilise les templates `templates/devis_v1.md` et `templates/devis_v1.json`. Le numéro de devis suit le format `DEV-YYYY-NNN` (vérifier le dernier dans `devis/`).

Après la génération, si la plateforme permet d'exécuter des scripts:
- Recalculer mécaniquement les montants via la tool `calculer-devis`, d'abord en dry-run, puis après confirmation. Ce contrôle détecte des incohérences arithmétiques, mais ne remplace pas la validation humaine.
- Proposer l'export PDF via la tool `exporter-pdf-devis`, d'abord en dry-run, puis après confirmation.

Si le routeur BASE n'est pas disponible dans l'outil utilisé, présenter les commandes manuelles équivalentes au lieu de les exécuter directement.

Enregistre les décisions dans le devis:
- `[DECISION: choix | raison]` pour chaque choix fait pendant le processus

### 6. Mettre à jour le client

Si des informations nouvelles ont été collectées, mets à jour la fiche dans `clients/`.

### 7. Récapitulatif

> «Votre devis est prêt:
> - Document: `devis/[nom-fichier].md`
> - Données structurées: `devis/[nom-fichier].json`
>
> **Important: relisez le devis avant de l'envoyer à votre client.** C'est vous qui vérifiez les montants, pas moi.
>
> Souhaitez-vous créer un autre devis?»

### 8. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`.

## Ce que tu ne fais jamais dans ce process

- **Inventer un prix.** Tous les prix viennent du catalogue. Si un service n'est pas dans le catalogue, utilise `[A VALIDER: ...]` et demande le prix à l'utilisateur.
- **Envoyer ou communiquer un devis.** Tu génères les fichiers. L'envoi est toujours la responsabilité de l'utilisateur.
- **Créer un devis sans configuration.** Si les fichiers contiennent des placeholders, redirige vers `/configuration`.
- **Arrondir ou estimer les montants.** Calcule exactement. Les centimes comptent.
- **Vérifier tes propres montants.** Tu proposes, l'utilisateur vérifie. Rappelle-le au récapitulatif.
