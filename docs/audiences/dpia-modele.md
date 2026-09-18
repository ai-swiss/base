---
schema_version: base.resource.v1
id: docs-audiences-dpia-modele
type: document
title: Modèle d'analyse d'impact (DPIA)
description: Squelette réutilisable d'analyse d'impact relative à la protection des données (DPIA/AIPD) pour un assistant BASE, à compléter par l'institution.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [dpia, aipd, nlpd, nfadp, gdpr, protection-des-donnees, gouvernance, egress]
---

# Modèle d'analyse d'impact (DPIA)

Avant de confier un assistant à vos équipes, vous devez pouvoir justifier ce que chaque personne, outil et modèle fait des données. Ce squelette sépare les contrôles techniques des responsabilités institutionnelles.

> **Page informative, pas un avis juridique.** Ce document est un point de départ réutilisable. Il ne remplace pas une analyse d'impact relative à la protection des données (DPIA au sens du RGPD, AIPD au sens de la nLPD/nFADP). L'analyse réelle, sa validation et sa tenue à jour relèvent de votre institution et de son délégué à la protection des données (DPO). Les fichiers et outils ne fournissent ni l'IAM, ni la DLP, ni le SIEM, ni la rétention réglementaire (voir [Sécurité et limites](../trust/securite-et-limites.md)).

## Utiliser ce squelette sans confondre consigne et contrôle technique {#comment-utiliser-ce-squelette}

Copiez cette structure dans votre registre. Remplacez chaque marqueur `[A COMPLETER]` par les éléments propres à votre traitement. La trame suit une logique compatible nLPD/nFADP et RGPD, mais son adéquation à votre cadre légal précis reste à vérifier par votre DPO.

Le [diagnostic de la carte des publics](pour-qui.md) distingue la méthode, la structure, la référence approuvée et l'exécution. Une seconde distinction traverse ce document:

- **Mécanisme**: une règle appliquée par le composant de médiation de BASE (le broker) sur le chemin médié, donc vérifiable sur ce chemin.
- **Consigne**: une instruction suivie par le modèle, donc utile mais non garantie.

Une mesure ne devient une garantie que si elle repose sur un mécanisme. Gardez-vous de faire passer une consigne pour un contrôle technique dans votre analyse de risque.

## 1. Description du traitement

- **Intitulé du traitement:** [A COMPLETER]
- **Responsable du traitement:** [A COMPLETER]
- **Service ou unité métier:** [A COMPLETER]
- **Description fonctionnelle:** [A COMPLETER] (par exemple: assistant de rédaction de courriers internes, structuration de procédures, aide à la réponse à des demandes).
- **Rôle des fichiers et du broker:** les fichiers structurent le savoir métier; le broker médie les actions qui passent par lui. La structure n'est ni un runtime d'agent, ni un moteur d'orchestration, ni un dispositif de RAG, ni une plateforme de conformité.
- **Rôle du modèle:** l'exécution générative relève de votre choix et se situe hors de la structure documentaire. Le modèle peut être local (par exemple via Ollama) ou distant (API). Ce choix est déterminant pour l'analyse (voir section 5).

## 2. Catégories de données

Le dossier contient ce que vous y déposez:

- les **fichiers de ressources** que vous déposez (le savoir métier, en Markdown);
- un **journal de trace local** (`.ai/trace`) qui enregistre les opérations médiées: opération, ressource, statut, durée, sans contenu métier par défaut.

Le routage par défaut **ne fait aucun appel réseau** (lexical). Le routage sémantique avancé n'envoie de texte à un fournisseur d'embeddings que si vous l'activez explicitement, et une option locale existe (voir [Sécurité des données de routage](../trust/securite-donnees-routage.md)).

À compléter pour votre traitement:

- **Catégories de données traitées:** [A COMPLETER] (données internes, données personnelles, données sensibles au sens de la loi, etc.).
- **Personnes concernées:** [A COMPLETER] (collaborateurs, citoyens, clients, etc.).
- **Volume et fréquence estimés:** [A COMPLETER].
- **Données personnelles sensibles éventuelles:** [A COMPLETER]. Recommandation prudente: pas de données personnelles sensibles dans un premier assistant.

## 3. Finalités

- **Finalité principale:** [A COMPLETER].
- **Finalités secondaires:** [A COMPLETER].
- **Minimisation:** [A COMPLETER] (justifier que seules les données nécessaires aux finalités sont traitées).
- **Limitation de la conservation:** voir section 7.

## 4. Base légale

La détermination de la base légale relève de votre institution et de son DPO.

- **Base légale retenue:** [A COMPLETER] (par exemple: consentement, exécution d'un contrat, obligation légale, mission d'intérêt public, intérêt légitime, selon le cadre applicable).
- **Cadre légal de référence:** [A COMPLETER] (nLPD/nFADP, droit cantonal ou communal pertinent, RGPD si applicable).
- **Information des personnes concernées:** [A COMPLETER].

## 5. Flux de données et frontière

Les fichiers peuvent rester locaux alors qu'un outil transmet au modèle distant le contexte qu'il en projette. Le point à analyser en priorité est cet **égress**. Voir le tutoriel [Périmètres et gouvernance d'égress](../tutoriel/equipe-2-perimetres-et-egress.md).

Sur les surfaces qui passent par le broker, une ressource marquée `confidential: true`, ou une racine marquée `egress: local-only`, **n'est pas envoyée à un modèle distant**. Le contrôle intervient avant l'appel. C'est un mécanisme, et non une consigne.

Portée à cadrer dans votre analyse: ce contrôle s'applique aux appels modèle médiés par le broker (chat, évaluation, lecture via MCP), et non comme un pare-feu réseau autour de votre poste. La politique par défaut est permissive (`egress: any`): rien n'est retenu tant que vous n'avez pas marqué une ressource `confidential: true` ou une racine `egress: local-only`. Le broker ne peut empêcher ni un humain, ni un autre outil lisant les fichiers directement sur le disque, d'envoyer ces données ailleurs. Le mécanisme garantit le chemin médié, non l'ensemble de votre environnement.

La métadonnée `sensitivity` sert à classifier une ressource et peut alimenter des validateurs. Elle ne déclenche pas la retenue d'égress. Ne présentez donc jamais une classification comme une interdiction technique d'envoi.

Réserve: la distinction local/distant repose sur la localité déclarée ou déduite du fournisseur (`tools/core/model-settings.mjs`), qu'un proxy mal configuré placé devant un service distant pourrait fausser; c'est donc un contrôle honnête, non une preuve absolue.

À compléter pour votre traitement:

- **Cartographie des flux:** [A COMPLETER] (qui saisit quoi, où les fichiers sont stockés, quels flux sortent de la machine).
- **Localisation du stockage des fichiers:** [A COMPLETER].
- **Localisation du journal de trace:** local, sur la machine où tournent les outils (`.ai/trace`).
- **Modèle choisi:** [A COMPLETER] (local ou distant). Si distant, décrire l'appel réseau vers le fournisseur comme le flux d'égress à évaluer.
- **Données marquées `confidential: true` / roots en `egress: local-only`:** [A COMPLETER].

## 6. Destinataires et sous-traitants

- **Destinataires internes:** [A COMPLETER].
- **Sous-traitant principal à évaluer:** le cas échéant, le fournisseur du modèle distant retenu. Les fichiers ne vous lient à aucun fournisseur; si vous exécutez un modèle local, aucun transfert vers un tiers n'a lieu à ce titre.
- **Clauses contractuelles à vérifier (si modèle distant):** [A COMPLETER] (localisation des données, sous-traitance ultérieure, durée de conservation côté fournisseur, usage pour entraînement, sécurité).
- **Transferts hors du pays / hors zone applicable:** [A COMPLETER].
- **Juridiction de l'hébergeur et exposition extraterritoriale:** [A COMPLETER]. La localité d'exécution ne règle pas la question de la juridiction: un hébergeur soumis à une loi étrangère, comme le CLOUD Act américain, peut être contraint de livrer des données où qu'elles soient stockées, là où un acteur suisse demeure contraignable en droit suisse. Voir [`souverainete-et-confiance.md`](../trust/souverainete-et-confiance.md).

Note: les réglages stockent des **noms** de variables d'environnement, et non des clés d'API en clair. La gestion effective des secrets reste de votre ressort.

## 7. Conservation et suppression

- **Durée de conservation des fichiers de ressources:** [A COMPLETER] (définie par votre politique d'archivage).
- **Durée de conservation du journal de trace:** [A COMPLETER]. Le journal `.ai/trace` est local et peut être purgé selon votre politique. Décrivez la procédure de purge retenue.
- **Procédure de suppression / droit à l'effacement:** [A COMPLETER].

Rappel: les fichiers et outils ne fournissent ni rétention réglementaire ni archivage légal automatiques. Ces obligations relèvent de vos systèmes et de vos procédures.

## 8. Risques et mesures d'atténuation

Pour chaque risque, distinguez ce qui est couvert par un **mécanisme du broker** de ce qui relève d'une **consigne** ou de vos propres systèmes.

| Risque | Mesure | Type |
|---|---|---|
| Fuite de données confidentielles vers un modèle distant | Refus d'égress avant l'appel (ressource `confidential: true` ou racine `egress: local-only`) | Mécanisme |
| Écriture hors périmètre autorisé | Confinement des chemins et refus des échappements par lien symbolique (`tools/core/confine.mjs`) | Mécanisme |
| Modification non confirmée d'un fichier | Le broker refuse l'application sans la confirmation exigée par la politique et applique l'écriture de façon atomique | Mécanisme |
| Diff non présenté à une personne | Le client doit présenter le diff avant de transmettre la confirmation; le paramètre de confirmation ne prouve pas que cette présentation a eu lieu | Intégration / organisation |
| Exécution involontaire d'une action | Tools en dry-run par défaut | Mécanisme |
| Réponse inventée par le routeur | Abstention plutôt que fausse certitude (`out_of_scope`, `ambiguous`, `needs_clarification`) | Mécanisme |
| Accès non contrôlé au serveur MCP | MCP HTTP en lecture seule par défaut, option de jeton porteur (bearer) | Mécanisme |
| Exposition réseau de Studio | Studio en loopback uniquement | Mécanisme |
| Absence de traçabilité des actions | Journal local des opérations médiées (`.ai/trace`) | Mécanisme |
| Saisie de données sensibles dans un assistant | Classification des ressources, consignes de manipulation | Consigne / organisation |
| Injection de prompt par un contenu externe | Séparation lisible entre instructions et contenu, réduction du contexte, revue des sources | Consigne / organisation tant qu'aucun contrôle technique propre au chemin ne l'impose |
| Sortie inexacte du modèle | Relecture humaine selon les sources et critères approuvés; le flux proposer puis acter ne prouve pas l'exactitude | Consigne / organisation |
| Authentification, RBAC, DLP, SIEM | À couvrir par vos systèmes externes | Hors périmètre |

Mesures complémentaires à documenter: [A COMPLETER].

## 9. Risque résiduel

- **Évaluation du risque résiduel après mesures:** [A COMPLETER] (faible / moyen / élevé, avec justification).
- **Risques non couverts par les fichiers et le broker:** [A COMPLETER] (par exemple: authentification, prévention de fuite de données au sens DLP, journalisation centralisée, rétention réglementaire).
- **Décision:** [A COMPLETER] (traitement acceptable en l'état, sous conditions, ou à revoir).

## 10. Validation

- **Analyse rédigée par:** [A COMPLETER], le [A COMPLETER].
- **Avis du délégué à la protection des données (DPO):** [A COMPLETER].
- **Consultation de l'autorité de contrôle si requise:** [A COMPLETER].
- **Approbation du responsable du traitement:** [A COMPLETER], le [A COMPLETER].
- **Date de révision prévue:** [A COMPLETER].

## Votre prochaine action

Copiez ce squelette dans votre registre et faites compléter ses dix sections par le responsable du traitement avec le DPO avant toute utilisation de données personnelles réelles.
