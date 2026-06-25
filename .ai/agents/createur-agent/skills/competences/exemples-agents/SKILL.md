---
schema_version: base.resource.v1
id: exemples-agents
type: competence
title: Exemples d'agents
description: Catalogue d'idées d'agents IA métier par secteur.
scope: team
status: active
sensitivity: internal
user-invocable: false
allowed-tools: Read
---

# Exemples d'agents par secteur

Catalogue d'idées d'agents IA métier pour PME et startups. Pour chaque idée: ce que l'agent ferait, les workflows, connaissances, documents et données typiques.

Ce catalogue sert d'inspiration; chaque agent doit être adapté aux besoins spécifiques de l'utilisateur.

État de livraison: huit exemples complets existent dans `exemples/` (devis, communication, courrier, enseignant, RH, projet, réunion, réflexion). Quand une idée ci-dessous a un exemple livré, il est indiqué; les autres idées sont à construire avec le process `creer-agent`, en montrant `exemples/assistant-devis/` comme modèle de structure.

---

## Services professionnels

### Assistant devis / propositions commerciales
- **Workflows**: configuration entreprise, création de devis, suivi relance
- **Connaissances**: structure d'un devis, TVA et fiscalité, terminologie commerciale
- **Documents**: devis (markdown + JSON), facture, bon de commande
- **Données**: entreprise/, catalogue/, clients/, devis/
- **Exemple livré**: `exemples/assistant-devis/` (et sa démo pré-remplie `exemples/assistant-devis-demo/`)

### Assistant gestion de projets
- **Workflows**: nouveau projet, point d'avancement, compte-rendu réunion, clôture projet
- **Connaissances**: méthodologies (agile, classique), indicateurs de suivi, gestion des risques
- **Documents**: fiche projet, compte-rendu, rapport d'avancement, bilan
- **Données**: projets/, equipe/, clients/
- **Exemples livrés**: `exemples/assistant-projet/` et, pour les comptes-rendus, `exemples/assistant-reunion/`

### Assistant comptable
- **Workflows**: saisie facture, préparation TVA, rapprochement bancaire, clôture mensuelle
- **Connaissances**: plan comptable suisse, taux TVA, délais fiscaux, amortissements
- **Documents**: facture, journal comptable, déclaration TVA
- **Données**: factures/, fournisseurs/, comptes/

---

## Commerce et vente

### Assistant support client
- **Workflows**: traitement demande, escalade problème, suivi satisfaction, FAQ dynamique
- **Connaissances**: ton et empathie, catégorisation des problèmes, SLA et priorités
- **Documents**: fiche incident, réponse type, rapport satisfaction
- **Données**: tickets/, clients/, base-connaissance/

### Assistant e-commerce
- **Workflows**: fiche produit, analyse ventes, gestion stock, campagne promo
- **Connaissances**: rédaction produit (SEO), pricing, logistique
- **Documents**: fiche produit, newsletter, rapport ventes
- **Données**: produits/, commandes/, clients/

### Assistant prospection commerciale
- **Workflows**: qualification prospect, préparation rendez-vous, suivi pipeline, relance
- **Connaissances**: techniques de vente, qualification BANT/MEDDIC, CRM best practices
- **Documents**: fiche prospect, compte-rendu RDV, proposition commerciale
- **Données**: prospects/, pipeline/, secteurs/

---

## Ressources humaines

### Assistant RH
- **Workflows**: rédaction offre d'emploi, préparation entretien, onboarding, gestion absences
- **Connaissances**: droit du travail suisse, conventions collectives, bonnes pratiques entretien
- **Documents**: offre d'emploi, grille d'entretien, contrat type, fiche collaborateur
- **Données**: collaborateurs/, postes-ouverts/, candidatures/
- **Exemple livré**: `exemples/assistant-rh/`

### Assistant formation
- **Workflows**: analyse besoins, conception programme, évaluation, bilan
- **Connaissances**: pédagogie adultes, méthodes d'évaluation, certifications
- **Documents**: programme formation, support cours, questionnaire évaluation
- **Données**: formations/, participants/, formateurs/

---

## Santé et bien-être

### Assistant cabinet médical
- **Workflows**: préparation consultation, suivi patient, rappel rendez-vous, rapport
- **Connaissances**: terminologie médicale, confidentialité (LPD), assurances maladie suisses
- **Documents**: note de consultation, ordonnance, lettre de transfert
- **Données**: patients/, consultations/, praticiens/

### Assistant cabinet vétérinaire
- **Workflows**: accueil patient, suivi traitement, rappel vaccins, facturation
- **Connaissances**: terminologie vétérinaire, pharmacologie courante, tarifs
- **Documents**: fiche animal, ordonnance, carnet de santé
- **Données**: animaux/, proprietaires/, traitements/

---

## Immobilier et construction

### Assistant agence immobilière
- **Workflows**: estimation bien, création annonce, visite, négociation, closing
- **Connaissances**: marché immobilier local, réglementation, fiscalité immobilière
- **Documents**: fiche bien, annonce, rapport estimation, compromis
- **Données**: biens/, clients-acheteurs/, clients-vendeurs/, transactions/

### Assistant bureau d'architecte
- **Workflows**: brief client, programme des besoins, suivi chantier, réception travaux
- **Connaissances**: normes construction suisses (SIA), étapes d'un projet, autorisations
- **Documents**: programme, procès-verbal chantier, décompte travaux
- **Données**: projets/, mandants/, artisans/

---

## Restauration et hôtellerie

### Assistant restaurant
- **Workflows**: création menu, gestion réservations, commande fournisseurs, inventaire
- **Connaissances**: allergènes et déclaration, saisonnalité, calcul food cost
- **Documents**: menu, fiche recette, bon de commande, inventaire
- **Données**: menus/, fournisseurs/, reservations/

### Assistant hôtel
- **Workflows**: check-in, conciergerie, gestion avis, reporting taux occupation
- **Connaissances**: accueil multilingue, réglementation hôtelière, plateformes de réservation
- **Documents**: fiche client, réponse avis, rapport occupation
- **Données**: chambres/, reservations/, clients/

---

## Éducation et formation

### Assistant école / centre de formation
- **Workflows**: inscription élève, planification cours, communication parents, bulletin
- **Connaissances**: pédagogie, réglementation scolaire, évaluation
- **Documents**: bulletin, convocation, programme cours, fiche élève
- **Données**: eleves/, cours/, enseignants/
- **Exemple livré**: `exemples/assistant-enseignant/` (préparation de cours et évaluations)

---

## Agriculture et artisanat

### Assistant exploitation agricole
- **Workflows**: planification cultures, suivi parcelles, gestion stock, vente directe
- **Connaissances**: calendrier cultural, labels bio, subventions agricoles suisses
- **Documents**: fiche parcelle, bon de livraison, déclaration cultures
- **Données**: parcelles/, cultures/, stocks/, clients/

### Assistant artisan
- **Workflows**: devis travaux, planification chantier, facturation, SAV
- **Connaissances**: normes métier, tarifs horaires, garanties légales
- **Documents**: devis travaux, facture, PV réception, fiche intervention
- **Données**: chantiers/, clients/, fournisseurs/, materiel/

---

## Associations et organisations

### Assistant association
- **Workflows**: gestion membres, préparation AG, communication, suivi dons
- **Connaissances**: droit associatif suisse, comptabilité associative, subventions
- **Documents**: PV assemblée, rapport annuel, appel à dons, newsletter
- **Données**: membres/, evenements/, finances/

---

## Comment choisir

Demandez à l'utilisateur:
1. «Dans quel secteur travaillez-vous?»
2. «Quel est votre premier besoin: gagner du temps, être plus professionnel, ou mieux vous organiser?»
3. «Si votre assistant ne pouvait faire qu'une seule chose, ce serait quoi?»

Commencez par cette seule chose. Un agent focalisé est plus utile qu'un agent qui fait tout.
