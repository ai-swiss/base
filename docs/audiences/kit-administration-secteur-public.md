---
schema_version: base.resource.v1
id: kit-administration-secteur-public
type: document
title: Évaluer et utiliser BASE de façon responsable dans le secteur public
description: Checklist pour décider si et comment déployer BASE dans une institution publique: données citoyens, classification, rétention, accessibilité, marchés publics, politique fournisseur de modèle.
scope: public
status: active
sensitivity: public
keywords: [secteur-public, administration, gouvernance, donnees-citoyens, nLPD, accessibilite, archivage, marches-publics, souverainete]
---

# Évaluer et utiliser BASE de façon responsable dans le secteur public

Déployer BASE dans une institution publique engage des données citoyens, une base légale et des marchés publics: décider si et comment le faire sans prendre de risque inutile demande des repères clairs. Cette checklist en donne, opérationnels, et signale les décisions qui restent les vôtres (juriste, délégué à la protection des données, archives, achats); elle ne remplace pas un avis juridique.

> **Important.** BASE est un **composant** local-first, et non une plateforme de conformité. Il ne fournit pas seul l'IAM, le SSO, le RBAC, la DLP, le SIEM, l'archivage légal ni la rétention réglementaire (voir [Sécurité et limites](../trust/securite-et-limites.md)). Ce qu'il apporte: un savoir métier en fichiers que vous possédez, et une médiation honnête des actions sensibles.

## 1. Classer le périmètre des données

- Listez les données qu'un assistant touchera, et leur classification (publique, interne, confidentielle).
- Règle de départ prudente: pas de données personnelles de citoyens dans un premier assistant. Commencez par des workflows internes (modèles, procédures, rédaction).
- BASE garde une frontière de sensibilité dans les métadonnées (`sensitivity`) et peut, si vous configurez un validateur, **refuser** les ressources trop sensibles (voir le [kit entreprise](kit-enterprise.md), validateur `forbidSensitivity`).

> **Décision institutionnelle:** classification interne applicable et base légale (par exemple nLPD et droit cantonal/communal pertinent).

## 2. Données citoyens et protection des données

- Si des données personnelles sont en jeu, le palier navigateur seul ne suffit pas: utilisez la CLI ou le MCP, qui médient les actions et tracent.
- Le routage reste **100 % local** par défaut (lexical, zéro réseau). Le routage sémantique avancé n'envoie du texte à un fournisseur d'embeddings que si vous l'activez explicitement, et il existe une option locale (Ollama) (voir [Sécurité des données de routage](../trust/securite-donnees-routage.md)).

> **Décision institutionnelle:** analyse d'impact (AIPD/DPIA) si nécessaire, et registre des traitements.

## 3. Politique fournisseur de modèle

- Le modèle (l'exécution générative) reste **votre choix** et vit hors de BASE. BASE structure le savoir que le modèle exécute; il ne vous lie à aucun fournisseur.
- Pour rester souverain, vous pouvez exécuter des modèles locaux (par exemple via Ollama); BASE n'impose aucun service cloud.
- **La localité ne règle pas tout: la juridiction de l'hébergeur compte autant que l'endroit où tourne le modèle.** Un hébergeur soumis à une loi étrangère (par exemple le CLOUD Act américain) peut être contraignable même pour des données stockées en Suisse. Voir la section CLOUD Act de [`souverainete-et-confiance.md`](../trust/souverainete-et-confiance.md).

> **Décision institutionnelle:** liste des fournisseurs de modèles autorisés et clauses contractuelles (localisation, sous-traitance, durée de conservation côté fournisseur).

## 4. Accessibilité

- Les ressources BASE sont du Markdown lisible: compatible avec les lecteurs d'écran et adapté à des publications accessibles.
- Pour toute interface publique dérivée, visez les standards d'accessibilité applicables.

> **Décision institutionnelle:** référentiel d'accessibilité applicable à votre institution.

## 5. Archivage et rétention

- BASE versionne par fichiers (Git recommandé): l'historique des décisions et des contenus est traçable.
- Les traces des actions médiées sont minimales (opération, ressource, statut, durée), sans contenu métier par défaut.

> **Décision institutionnelle:** durées de conservation et règles d'archivage légal de vos contenus et journaux.

## 6. Marchés publics et réutilisation

- Double licence: **Apache-2.0** pour le code (clause de brevet incluse) et **CC BY 4.0** pour les contenus (voir [Licence](../trust/licence.md)).
- Cœur **zéro dépendance** (Node 18 ou plus): surface auditable, pas de chaîne d'approvisionnement lourde. Le serveur MCP et le Studio ont leurs propres dépendances, isolées et optionnelles.
- L'essentiel est local et inspectable: code, schémas, specs (`specs/`), et un contrat de tests reproductible (voir [`specs/TESTING.md`](../../specs/TESTING.md)).

> **Décision institutionnelle:** critères d'achat (souveraineté, réversibilité, support) et clauses de marché.

## 7. Validation humaine et traçabilité

- Discipline propose puis commit: un diff est montré, vous validez, puis l'écriture a lieu. Les tools s'exécutent en dry-run par défaut.
- Les marqueurs (`[A VALIDER]`, `[DECISION]`) sont des repères cherchables, lisibles autant par une personne que par un traitement algorithmique: ils gardent l'état d'un dossier visible, même après des mois.

## 8. Garder les limites visibles

Affichez ce que BASE n'applique pas mécaniquement (surtout en mode navigateur seul), et ce qui relève de vos systèmes (IAM, DLP, rétention). Voir [Sécurité et limites](../trust/securite-et-limites.md) et [Souveraineté et confiance](../trust/souverainete-et-confiance.md). Et pour la carte des garanties que le code applique réellement, chacune avec sa fonction et son test, voir [Mécanismes vérifiés](../trust/mecanismes-verifies.md).

## Contact

Pour un échange institutionnel (évaluation, pilote, questions de conformité), écrivez à AI Swiss à [info@a-i.swiss](mailto:info@a-i.swiss): nous visons une première réponse sous une dizaine de jours ouvrés. Voir aussi [a-i.swiss](https://a-i.swiss).

La même adresse oriente vers la bonne personne pour les modalités d'accompagnement d'un pilote.
