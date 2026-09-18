---
schema_version: base.resource.v1
id: kit-administration-secteur-public
type: document
title: Évaluer et utiliser BASE de façon responsable dans le secteur public
description: "Checklist pour décider si et comment déployer BASE dans une institution publique: données citoyens, classification, rétention, accessibilité, marchés publics, politique fournisseur de modèle."
scope: public
status: active
sensitivity: public
keywords: [secteur-public, administration, gouvernance, donnees-citoyens, nLPD, accessibilite, archivage, marches-publics, souverainete]
---

# Évaluer et utiliser BASE de façon responsable dans le secteur public

Déployer BASE dans une institution publique engage des données citoyens, une base légale et des marchés publics: décider si et comment le faire sans courir de risque inutile suppose des repères clairs. Cette checklist fournit ces repères concrets et signale les décisions qui restent les vôtres (juriste, délégué à la protection des données, archives, achats); elle ne tient pas lieu d'avis juridique.

> **Important.** La structure BASE est un **composant** local-first, non une plateforme de conformité. Les fichiers, le routeur et le composant de médiation de BASE (le broker) ne fournissent pas l'IAM, le SSO, le RBAC, la DLP, le SIEM, l'archivage légal ni la rétention réglementaire (voir [Sécurité et limites](../trust/securite-et-limites.md)). Les fichiers peuvent consigner un savoir métier; le broker peut médier les actions qui passent effectivement par lui.

Le [diagnostic de la carte des publics](pour-qui.md) distingue la méthode, la structure, la référence approuvée et l'exécution. Gardez cette distinction dans chaque décision institutionnelle ci-dessous.

## 1. Classer le périmètre des données

- Listez les données qu'un assistant touchera, et leur classification (publique, interne, confidentielle).
- Règle de départ prudente: pas de données personnelles de citoyens dans un premier assistant. Commencez par des processus internes (modèles, procédures, rédaction).
- La métadonnée `sensitivity` classe une ressource. Elle ne la retient pas automatiquement lors d'un envoi. Un validateur peut refuser une classification donnée à la validation du corpus; la retenue d'égress dépend, elle, de `confidential: true` ou d'une racine `local-only` sur un chemin médié (voir le [kit entreprise](kit-enterprise.md)).

> **Décision institutionnelle:** classification interne applicable et base légale (par exemple nLPD et droit cantonal/communal pertinent).

## 2. Données citoyens et protection des données

- Si des données personnelles sont en jeu, le palier navigateur seul ne suffit pas. La CLI ou le MCP ne médient et ne tracent que les actions qui passent par leurs commandes; les accès directs de l'outil aux fichiers restent hors de cette garantie.
- Le routage par défaut **ne fait aucun appel réseau** (lexical, zéro donnée qui sort). Le routage sémantique avancé n'envoie de texte à un fournisseur d'embeddings que si vous l'activez explicitement, et une option locale existe (Ollama) (voir [Sécurité des données de routage](../trust/securite-donnees-routage.md)).
- Les fichiers peuvent rester sur le poste alors qu'un outil projette des extraits vers un modèle distant. La politique d'égress est permissive par défaut (`any`) tant que vous ne configurez pas de retenue.

> **Décision institutionnelle:** analyse d'impact (AIPD/DPIA) si nécessaire, et registre des traitements.

## 3. Politique fournisseur de modèle

- Le modèle reste **votre choix** et demeure extérieur à la structure documentaire. Les fichiers ne lient l'institution à aucun fournisseur. Changer de modèle ne requiert pas nécessairement de réécrire la référence, mais exige de réévaluer l'exécution.
- Pour rester souverain, vous pouvez exécuter des modèles locaux (par exemple via Ollama); aucun service cloud n'est requis par les fichiers ou les commandes locales.
- **La localisation ne règle pas tout: la juridiction de l'hébergeur compte autant que le lieu où s'exécute le modèle.** Un hébergeur soumis à une loi étrangère (par exemple le CLOUD Act américain) peut y être contraint même pour des données stockées en Suisse. Voir la section CLOUD Act de [`souverainete-et-confiance.md`](../trust/souverainete-et-confiance.md).

> **Décision institutionnelle:** liste des fournisseurs de modèles autorisés et clauses contractuelles (localisation, sous-traitance, durée de conservation côté fournisseur).

## 4. Accessibilité

- Les ressources sont écrites en Markdown lisible: ce format est compatible avec les lecteurs d'écran et propice à des publications accessibles.
- Pour toute interface publique dérivée, visez les normes d'accessibilité applicables.

> **Décision institutionnelle:** référentiel d'accessibilité applicable à votre institution.

## 5. Archivage et rétention

- Git peut versionner les fichiers: les changements de décisions et de contenus deviennent alors traçables.
- Les traces des actions médiées sont minimales (opération, ressource, statut, durée), et ne consignent aucun contenu métier par défaut.

> **Décision institutionnelle:** durées de conservation et règles d'archivage légal de vos contenus et journaux.

## 6. Marchés publics et réutilisation

- Double licence: **Apache-2.0** pour le code (clause de brevet incluse) et **CC BY 4.0** pour les contenus (voir [Licence](../trust/licence.md)).
- Cœur **zéro dépendance** (Node 18 ou plus): surface auditable, sans chaîne d'approvisionnement lourde. Le serveur MCP et le Studio ont leurs propres dépendances, isolées et optionnelles.
- L'essentiel demeure local et inspectable: code, schémas, specs (`specs/`), et un contrat de tests reproductible (voir [`specs/TESTING.md`](../../specs/TESTING.md)).

> **Décision institutionnelle:** critères d'achat (souveraineté, réversibilité, support) et clauses de marché.

## 7. Validation humaine et traçabilité

- Sur le chemin médié, la commande de proposition produit un diff et n'écrit pas le fichier cible; la commande d'application exige une confirmation selon la politique. Le client doit réellement montrer le diff à une personne avant de transmettre cette confirmation. Les outils sont en dry-run par défaut.
- Les marqueurs (`[A VALIDER]`, `[DECISION]`) sont des repères cherchables, lisibles aussi bien par une personne que par un traitement algorithmique: ils maintiennent l'état d'un dossier visible, même après des mois.
- La séparation entre instructions et contenu facilite la revue, mais ne prévient pas à elle seule l'injection de prompt. Traitez tout contenu externe comme non fiable et ajoutez les contrôles adaptés au chemin d'exécution.

## 8. Garder les limites visibles

Affichez ce que les outils n'appliquent pas mécaniquement (surtout en mode navigateur seul), et ce qui relève de vos propres systèmes (IAM, DLP, rétention). Voir [Sécurité et limites](../trust/securite-et-limites.md) et [Souveraineté et confiance](../trust/souverainete-et-confiance.md). Pour la carte des garanties que le code applique réellement, chacune avec sa fonction et son test, voir [Mécanismes vérifiés](../trust/mecanismes-verifies.md).

## Votre prochaine action

Menez le [pilote institutionnel sans données personnelles](pilote-institution-90-min.md), puis consignez avec votre délégué à la protection des données les conditions qui autoriseraient, ou interdiraient, une étape suivante.
