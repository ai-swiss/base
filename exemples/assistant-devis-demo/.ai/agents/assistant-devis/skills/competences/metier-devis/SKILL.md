---
name: metier-devis
description: "Terminologie, structure et conventions des devis professionnels suisses. À consulter lors de la création de devis."
user-invocable: false
allowed-tools: Read
---

# Métier: Devis en Suisse

Connaissances métier sur la création de devis professionnels en contexte suisse.

## Structure d'un devis

Un devis professionnel suisse contient obligatoirement:

1. **En-tête entreprise**: nom, adresse, numéro IDE, logo
2. **Numéro de devis**: identifiant unique (ex. DEV-2026-001)
3. **Date d'émission**
4. **Informations client**: nom/raison sociale, adresse, personne de contact
5. **Objet du devis**: description courte de la demande
6. **Tableau des prestations**: description, quantité, unité, prix unitaire, total par ligne
7. **Sous-total HT**
8. **Remises** (si applicable): avec justification
9. **TVA**: taux et montant
10. **Total TTC**
11. **Conditions**: validité, acompte, délai de paiement, garantie
12. **Lieu et date**
13. **Espace signature**: pour les deux parties

## Terminologie

| Terme | Signification |
|-------|---------------|
| HT | Hors taxe (avant TVA) |
| TTC | Toutes taxes comprises (après TVA) |
| TVA | Taxe sur la valeur ajoutée |
| IDE | Numéro d'identification des entreprises (Suisse), format CHE-XXX.XXX.XXX |
| Acompte | Paiement partiel demandé à la commande |
| Forfait | Prix fixe pour une prestation complète |
| Régie | Facturation au temps passé (heures ou jours) |

## Taux de TVA en Suisse (2026)

| Type | Taux |
|------|------|
| Taux normal | 8.1% |
| Taux réduit (alimentation, livres, médicaments) | 2.6% |
| Taux spécial (hébergement) | 3.8% |
| Exonéré (santé, formation, assurance) | 0% |

Les entreprises avec un chiffre d'affaires annuel inférieur à CHF 100'000 peuvent être exonérées de TVA.

> **Note**: les taux de TVA peuvent évoluer. Vérifiez les taux en vigueur sur admin.ch avant d'émettre un devis engageant.

## Conventions de formatage

- **Monnaie**: toujours `CHF`, pas `Fr.` ni `SFr.`
- **Séparateur de milliers**: apostrophe (ex. `1'500.00 CHF`)
- **Décimales**: toujours 2 décimales pour les montants (ex. `150.00 CHF`)
- **Dates**: format `JJ.MM.AAAA` ou `JJ mois AAAA` (ex. `27.02.2026` ou `27 février 2026`)
- **Numérotation devis**: `DEV-AAAA-NNN` (ex. `DEV-2026-001`)
- **Arrondi**: au centime (0.01 CHF). Certaines entreprises arrondissent au 5 centimes.

## Numérotation séquentielle

Pour attribuer un numéro de devis:
1. Lister les fichiers dans `devis/`
2. Trouver le dernier numéro utilisé (dans les noms de fichiers ou le contenu JSON)
3. Incrémenter de 1
4. Si aucun devis n'existe, commencer à `DEV-AAAA-001`

## Protection des données (LPD)

Les devis contiennent des données personnelles. En vertu de la LPD:
- Ne collecter que les informations nécessaires
- Les données clients sont stockées dans les fichiers locaux. Les contenus échangés pendant la conversation sont transmis au fournisseur IA utilisé
- En cas de demande, le client peut exiger la suppression de ses données

## Bonnes pratiques

- **Détailler les prestations**: une ligne par service distinct, pas un forfait global opaque
- **Indiquer les hypothèses**: si le devis repose sur des suppositions, les mentionner
- **Préciser ce qui n'est pas inclus**: évite les malentendus
- **Proposer des options**: si pertinent, présenter une option de base et une option étendue
- **Validité explicite**: toujours indiquer la durée de validité du devis
