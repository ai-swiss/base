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

Avant de mettre un assistant entre les mains de vos équipes, vous devez pouvoir justifier ce qu'il fait des données, devant votre institution et votre délégué à la protection des données (DPO). Ce squelette vous donne une trame défendable pour cette analyse, et sépare nettement ce que BASE garantit techniquement de ce qui reste votre responsabilité: vous savez ainsi exactement ce qui vous engage.

> **Page informative, pas un avis juridique.** Ce document est un point de départ réutilisable. Il ne remplace pas une analyse d'impact relative à la protection des données (DPIA au sens du RGPD, AIPD au sens de la nLPD/nFADP). L'analyse réelle, sa validation et sa tenue à jour relèvent de votre institution et de son délégué à la protection des données (DPO). BASE ne fournit ni l'IAM, ni la DLP, ni le SIEM, ni la rétention réglementaire (voir [Sécurité et limites](../trust/securite-et-limites.md)).

## Comment utiliser ce squelette

Copiez cette structure dans votre registre. Remplacez chaque marqueur `[A COMPLETER]` par les éléments propres à votre traitement. La structure suit une trame compatible nLPD/nFADP et RGPD, mais l'adéquation à votre cadre légal exact reste à vérifier par votre DPO.

Une distinction traverse tout le document, parce qu'elle est au cœur de l'honnêteté de BASE:

- **Mécanisme**: une règle appliquée par le médiateur de BASE (le code), donc opposable et vérifiable.
- **Consigne**: une instruction suivie par le modèle, donc utile mais non garantie.

Une mesure n'est une garantie que si elle repose sur un mécanisme. Ne créditez pas une consigne comme un contrôle technique dans votre analyse de risque.

## 1. Description du traitement

- **Intitulé du traitement:** [A COMPLETER]
- **Responsable du traitement:** [A COMPLETER]
- **Service ou unité métier:** [A COMPLETER]
- **Description fonctionnelle:** [A COMPLETER] (par exemple: assistant de rédaction de courriers internes, structuration de procédures, aide à la réponse à des demandes).
- **Rôle de BASE:** BASE structure le savoir métier en fichiers que vous possédez et médiatise les actions sensibles. BASE n'est ni un runtime d'agent, ni un moteur d'orchestration, ni un dispositif de RAG, ni une plateforme de conformité.
- **Rôle du modèle:** l'exécution générative (le modèle) est votre choix et vit hors de BASE. Le modèle peut être local (par exemple via Ollama) ou distant (API). Ce choix est déterminant pour l'analyse (voir section 5).

## 2. Catégories de données

BASE en lui-même ne stocke que ce que vous y mettez:

- les **fichiers de ressources** que vous déposez (le savoir métier, en Markdown);
- un **journal de trace local** (`.ai/trace`) qui enregistre les opérations médiées: opération, ressource, statut, durée, sans contenu métier par défaut.

Le routage par défaut est **100 % local** (lexical, zéro réseau). Le routage sémantique avancé n'envoie du texte à un fournisseur d'embeddings que si vous l'activez explicitement, et une option locale existe (voir [Sécurité des données de routage](../trust/securite-donnees-routage.md)).

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

Par défaut, tout reste local. Le point à analyser en priorité est l'**égress**: l'appel au modèle distant, s'il a lieu. Voir le tutoriel [Périmètres et gouvernance d'égress](../tutoriel/equipe-2-perimetres-et-egress.md).

Mécanisme appliqué par BASE: une ressource marquée `confidential: true`, ou un root entier marqué `egress: local-only`, **n'est pas envoyée à un modèle distant**. Le contrôle a lieu **avant** l'appel, donc la donnée ne quitte pas la machine; le refus est affiché, jamais silencieux. C'est un mécanisme, pas une consigne.

Réserve: la distinction local/distant repose sur la localité déclarée ou déduite du fournisseur (`tools/core/model-settings.mjs`), qu'un proxy mal configuré placé devant un service distant pourrait travestir; c'est donc un contrôle honnête, pas une preuve absolue.

À compléter pour votre traitement:

- **Cartographie des flux:** [A COMPLETER] (qui saisit quoi, où les fichiers sont stockés, quels flux sortent de la machine).
- **Localisation du stockage des fichiers:** [A COMPLETER].
- **Localisation du journal de trace:** local, sur la machine où tourne BASE (`.ai/trace`).
- **Modèle choisi:** [A COMPLETER] (local ou distant). Si distant, décrire l'appel réseau vers le fournisseur comme le flux d'égress à évaluer.
- **Données marquées `confidential: true` / roots en `egress: local-only`:** [A COMPLETER].

## 6. Destinataires et sous-traitants

- **Destinataires internes:** [A COMPLETER].
- **Sous-traitant principal à évaluer:** le fournisseur du modèle distant choisi, le cas échéant. BASE ne lie à aucun fournisseur; si vous exécutez un modèle local, il n'y a pas de transfert vers un tiers à ce titre.
- **Clauses contractuelles à vérifier (si modèle distant):** [A COMPLETER] (localisation des données, sous-traitance ultérieure, durée de conservation côté fournisseur, usage pour entraînement, sécurité).
- **Transferts hors du pays / hors zone applicable:** [A COMPLETER].
- **Juridiction de l'hébergeur et exposition extraterritoriale:** [A COMPLETER]. La localité d'exécution ne règle pas la juridiction: un hébergeur soumis à une loi étrangère, comme le CLOUD Act américain, peut être contraint de livrer des données où qu'elles soient stockées, alors qu'un acteur suisse reste contraignable en droit suisse. Voir [`souverainete-et-confiance.md`](../trust/souverainete-et-confiance.md).

Note: BASE stocke des **noms** de variables d'environnement, pas des clés d'API en clair, dans ses réglages. La gestion effective des secrets reste de votre ressort.

## 7. Conservation et suppression

- **Durée de conservation des fichiers de ressources:** [A COMPLETER] (définie par votre politique d'archivage).
- **Durée de conservation du journal de trace:** [A COMPLETER]. Le journal `.ai/trace` est local et peut être purgé selon votre politique. Décrivez la procédure de purge retenue.
- **Procédure de suppression / droit à l'effacement:** [A COMPLETER].

Rappel: BASE ne fournit pas de rétention réglementaire ni d'archivage légal automatiques. Ces obligations relèvent de vos systèmes et de vos procédures.

## 8. Risques et mesures d'atténuation

Pour chaque risque, distinguez ce qui est couvert par un **mécanisme** de BASE de ce qui relève d'une **consigne** ou de vos propres systèmes.

| Risque | Mesure | Type |
|---|---|---|
| Fuite de données confidentielles vers un modèle distant | Refus d'égress avant l'appel (ressource `confidential: true` ou racine `egress: local-only`) | Mécanisme |
| Écriture hors périmètre autorisé | Confinement des chemins et refus des échappements par lien symbolique (`tools/core/confine.mjs`) | Mécanisme |
| Modification non validée d'un fichier | Discipline propose puis commit; écritures médiées et atomiques; un diff est montré avant écriture | Mécanisme |
| Exécution involontaire d'une action | Tools en dry-run par défaut | Mécanisme |
| Réponse inventée par le routeur | Abstention plutôt que fausse certitude (`out_of_scope`, `ambiguous`, `needs_clarification`) | Mécanisme |
| Accès non contrôlé au serveur MCP | MCP HTTP en lecture seule par défaut, option de jeton porteur (bearer) | Mécanisme |
| Exposition réseau de Studio | Studio en loopback uniquement | Mécanisme |
| Absence de traçabilité des actions | Journal local des opérations médiées (`.ai/trace`) | Mécanisme |
| Saisie de données sensibles dans un assistant | Classification des ressources, consignes de manipulation | Consigne / organisation |
| Exactitude des sorties du modèle | Validation humaine (propose puis commit); relecture | Consigne / organisation |
| Authentification, RBAC, DLP, SIEM | Hors BASE: à couvrir par vos systèmes | Hors périmètre |

Mesures complémentaires à documenter: [A COMPLETER].

## 9. Risque résiduel

- **Évaluation du risque résiduel après mesures:** [A COMPLETER] (faible / moyen / élevé, avec justification).
- **Risques non couverts par BASE:** [A COMPLETER] (par exemple: authentification, prévention de fuite de données au sens DLP, journalisation centralisée, rétention réglementaire).
- **Décision:** [A COMPLETER] (traitement acceptable en l'état, sous conditions, ou à revoir).

## 10. Validation

- **Analyse rédigée par:** [A COMPLETER], le [A COMPLETER].
- **Avis du délégué à la protection des données (DPO):** [A COMPLETER].
- **Consultation de l'autorité de contrôle si requise:** [A COMPLETER].
- **Approbation du responsable du traitement:** [A COMPLETER], le [A COMPLETER].
- **Date de révision prévue:** [A COMPLETER].

---

Le DPO de votre institution est propriétaire de la DPIA réelle. Ce squelette ne fait que faciliter sa rédaction. Pour le modèle de menace public et les limites du cœur local, voir [Sécurité et limites](../trust/securite-et-limites.md) et [Souveraineté et confiance](../trust/souverainete-et-confiance.md).
