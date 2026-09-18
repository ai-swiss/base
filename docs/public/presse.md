---
schema_version: base.resource.v1
id: presse
type: document
title: Dossier de presse
description: "Le dossier de presse de BASE pour journalistes et rédactions: sa convention ouverte, son implémentation de référence, son origine, sa licence et ses limites."
scope: public
status: active
sensitivity: public
keywords: [presse, media, dossier, communication, ai-swiss, open-source]
---

# Dossier de presse

Produire du texte ne demande presque plus d'effort; en garder la maîtrise en demande toujours autant. BASE propose une convention ouverte pour décrire une méthode de travail avec l'IA, accompagnée d'une implémentation de référence open source et local-first portée par AI Swiss. Ce dossier rassemble les éléments publics stables.

## En une phrase

BASE (Bâtir des Assistants avec une Structure d'Expertise) est une **convention ouverte** pour décrire une méthode de travail, ses connaissances et ses contrôles dans des fichiers que l'on possède, accompagnée d'une **implémentation de référence open source et local-first** qui inventorie et vérifie cette structure sans promettre le résultat d'une exécution.

## Le problème

L'IA générative a rendu la production presque sans effort. La vérification, elle, reste coûteuse: pour l'essentiel du travail réel, aucun vérificateur automatique n'existe, et c'est à l'humain de déceler et de corriger les erreurs, puis de juger si une réponse sert vraiment son intention. Faute de structure, on délègue sans comprendre et l'on produit sans contrôler. On finit par dépendre d'un outil qu'on ne possède pas et par mettre en service ce qu'on ne saura pas entretenir.

## Les quatre objets

- La **méthode** est la manière de travailler: étapes, sources faisant autorité, règles, contrôles et décisions humaines.
- La **structure BASE** décrit cette méthode et ses relations dans des fichiers Markdown possédés par la personne ou l'organisation.
- La **référence** est l'état approuvé et versionné de cette méthode. L'implémentation de référence peut l'inventorier, vérifier sa structure et la rendre accessible à des outils.
- L'**exécution** est ce qu'un modèle, un outil ou une intégration fait effectivement à partir de cette référence. Elle varie selon le modèle, les données, les permissions et l'intégration.

L'implémentation de référence distingue une consigne, suivie de manière faillible par le modèle, d'un mécanisme appliqué lorsque l'action passe par la CLI, le composant de médiation de BASE (le broker) ou le serveur MCP. Elle fournit alors des points de décision avant les écritures médiées et certaines actions sensibles: la proposition est montrée, puis validée. Son cœur fonctionne avec Node 18 ou plus, sans dépendance d'exécution, et dispose de spécifications et de tests reproductibles.

## Ce que BASE n'est pas

- Pas une plateforme de conformité: la convention et son implémentation de référence ne remplacent ni IAM, ni SSO, ni RBAC, ni DLP, ni archivage légal.
- Pas une garantie d'exactitude des réponses d'un modèle.
- Pas un service cloud: le choix et l'hébergement du modèle restent extérieurs au dépôt.

## Origine et gouvernance

BASE a été **créé par Charles-Edouard Bardyn** (Directeur Scientifique, VP et cofondateur d'**[AI Swiss](https://a-i.swiss)**, association suisse indépendante à but non lucratif); il est aujourd'hui **maintenu par un mainteneur principal** sous l'intendance d'AI Swiss, et reste ouvert à la contribution et à la co-maintenance. [Innovaud](https://innovaud.ch), l'agence de promotion de l'innovation du canton de Vaud, est partenaire du projet et a contribué à amorcer les exemples métier destinés aux PME. La convention et l'implémentation de référence forment un **commun ouvert**: leur double licence (Apache-2.0 / CC BY 4.0) autorise chacun à les copier, les adapter et les réutiliser. Cet ensemble sert d'amorce à de nombreux projets, non de plateforme fermée.

## Licence et disponibilité

- Double licence: **Apache-2.0** pour le code, **CC BY 4.0** pour les contenus (voir [Licence](../trust/licence.md)).
- [Code public sur GitHub](https://github.com/ai-swiss/base) et [instructions pour obtenir BASE](../start/obtenir-base.md).

## Citations

Les citations attribuables ne sont pas publiées dans ce dépôt. Une citation datée ou une prise de parole doit être confirmée par AI Swiss.

## Visuels et démo

Le schéma de structure est versionné dans [les visuels publics](assets/), sous licence CC BY 4.0, avec l'attribution recommandée «BASE, par AI Swiss, https://a-i.swiss». Les exemples du dépôt permettent de préparer une démonstration locale; les captures, résultats et comportements observés dépendent toutefois de l'exécution choisie.

## Faits utiles

- Public visé: indépendants, PME, équipes, institutions; pensé d'abord pour un public francophone suisse, puis international.
- Approche: local-first, souveraineté autour des modèles, vérification humaine.

Les dates, jalons et chiffres communicables doivent être vérifiés au moment de la publication.

## Contact presse

Pour poursuivre, envoyez votre demande média par le [canal officiel d'AI Swiss](https://a-i.swiss), avec le sujet, l'échéance, le média, la langue souhaitée et le format attendu.
