---
schema_version: base.resource.v1
id: presse
type: document
title: Dossier de presse
description: Le dossier de presse de BASE pour journalistes et rédactions: ce qu'est le framework, le problème qu'il traite, son origine, sa licence et ses limites.
scope: public
status: active
sensitivity: public
keywords: [presse, media, dossier, communication, ai-swiss, open-source]
---

# Dossier de presse

Produire du texte ne demande presque plus d'effort; garder la maîtrise de ce qu'on publie en demande toujours autant. BASE, un cadre open source et local-first porté par AI Swiss, structure cette maîtrise. Ce dossier réunit les éléments publics stables; les citations, visuels et démonstrations absents de ce dépôt se demandent auprès d'AI Swiss.

## En une phrase

BASE (Bâtir des Assistants avec une Structure d'Expertise) est un framework **open source, local-first** qui permet de créer des assistants IA métier dont le savoir vit dans des fichiers que l'on possède, portables entre outils, et qui gardent l'humain **capable de vérifier**.

## Le problème

L'IA générative a rendu la production presque sans effort. La vérification, elle, reste coûteuse: pour la plupart du travail réel, aucun vérificateur automatique n'existe, et c'est l'humain qui doit y détecter et corriger les erreurs, et juger si une sortie sert vraiment son intention. Sans structure, on délègue sans comprendre et on produit sans contrôler. On finit par dépendre d'un outil qu'on ne possède pas et par déployer ce qu'on ne saura pas maintenir.

## Ce qu'apporte BASE

- Un savoir métier en **Markdown** que vous possédez, indépendant du modèle et portable entre outils (Claude, ChatGPT, Cursor via MCP, et l'outil suivant); BASE n'en privilégie aucun.
- Une distinction **honnête** entre une consigne (suivie par le modèle) et un mécanisme (réellement appliqué quand l'action passe par le broker, la CLI ou le MCP).
- Des points de décision avant les écritures et actions sensibles (proposition montrée, puis validation).
- Un cœur **zéro dépendance** (Node 18 ou plus), inspectable, avec des specs et des tests reproductibles.

## Ce que BASE n'est pas

- Pas une plateforme de conformité: il ne remplace ni IAM, ni SSO, ni RBAC, ni DLP, ni archivage légal.
- Pas une garantie d'exactitude des réponses d'un modèle.
- Pas un service cloud: le modèle reste votre choix et vit hors de BASE.

## Origine et gouvernance

BASE a été **créé par Charles-Edouard Bardyn** (Directeur Scientifique, VP et cofondateur d'**[AI Swiss](https://a-i.swiss)**, association suisse indépendante à but non lucratif) et est aujourd'hui **maintenu par un mainteneur principal** sous l'intendance d'AI Swiss, ouvert à la contribution et à la co-maintenance. [Innovaud](https://innovaud.ch), l'agence de promotion de l'innovation du canton de Vaud, est partenaire du projet et a contribué à amorcer les exemples métier pour PME. BASE est un **commun ouvert**: sa double licence (Apache-2.0 / CC BY 4.0) autorise chacun à le forker, l'adapter et le réutiliser. Il est conçu comme une amorce pour de nombreux projets, pas comme une plateforme fermée.

## Licence et disponibilité

- Double licence: **Apache-2.0** pour le code, **CC BY 4.0** pour les contenus (voir [Licence](../trust/licence.md)).
- Code public sur GitHub: `https://github.com/ai-swiss/base`. Comment l'obtenir: [Obtenir BASE](../start/obtenir-base.md).

## Citations

Les citations attribuables ne sont pas publiées dans ce dépôt. Pour une citation datée ou une prise de parole, contactez AI Swiss par le canal officiel.

## Visuels et démo

Le logo et le schéma d'architecture sont versionnés dans [`docs/public/assets/`](assets/), sous licence CC BY 4.0, avec l'attribution recommandée «BASE, par AI Swiss, https://a-i.swiss». Les autres formats (captures d'écran, courte démo vidéo, déclinaisons du logo) se demandent auprès d'AI Swiss. Les exemples du dépôt permettent déjà de reproduire une démonstration locale.

## Faits utiles

- Public visé: indépendants, PME, équipes, institutions; pensé d'abord pour un public francophone suisse, puis international.
- Approche: local-first, souveraineté autour des modèles, vérification humaine.

Les dates, jalons et chiffres communicables doivent être vérifiés au moment de la publication.

## Contact presse

Le canal officiel de contact est [a-i.swiss](https://a-i.swiss). Pour une demande média, indiquez le sujet, l'échéance, le média, la langue souhaitée et le format attendu.
