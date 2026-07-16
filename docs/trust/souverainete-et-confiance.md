---
title: Justifier le choix de BASE (souveraineté, confiance, conformité)
description: "Tout ce qu'il faut pour défendre le choix de BASE devant un client, un service informatique ou un responsable conformité, rassemblé sur une page: souveraineté des données, protection des données, sécurité, licence et gouvernance."
keywords: [souverainete, confiance, conformite, nLPD, revLPD, RGPD, securite, licence, gouvernance, donnees, evaluation]
---

# Justifier le choix de BASE: souveraineté, confiance, conformité

Adopter BASE suppose souvent de convaincre d'abord: un client inquiet pour ses données, un service informatique, un responsable conformité. Vous trouverez ici, rassemblé en un seul endroit, de quoi défendre ce choix sans esquiver les questions qui fâchent: souveraineté des données, protection des données, sécurité, licence et gouvernance. Conçue pour toute organisation qui évalue BASE, de l'indépendant à l'institution, cette page renvoie aux documents de référence sans s'y substituer.

## En une phrase

BASE est un cadre **local-first** et **ouvert** pour structurer le travail avec l'IA: votre savoir reste dans des fichiers texte que vous possédez, et vous décidez explicitement ce qui sort, le cas échéant, vers un outil IA.

La souveraineté de BASE tient à son architecture, non à un label. Local-first, le cadre s'exécute sur votre machine et conserve le savoir dans des fichiers texte que vous possédez: tant qu'aucun fournisseur distant n'est connecté, rien ne quitte le poste, et il n'existe aucun serveur que l'on puisse contraindre. Deux précisions s'imposent toutefois. Un modèle local n'est pas un modèle suisse: la localité dit où il tourne, non d'où il vient. Et un modèle suisse n'est pas pour autant confidentiel s'il est hébergé sur une infrastructure sous contrôle étranger: le CLOUD Act américain atteint les données «où qu'elles soient stockées». Symétriquement, un acteur suisse reste lui aussi contraignable, mais en droit suisse: aucune juridiction n'offre de confidentialité absolue. Ce qui sort dépend donc de votre configuration et du contrat: résidence des données, usage pour l'entraînement, sous-traitants, juridiction. Le cadre et l'expertise sont souverains; le modèle, lui, reste un choix externe qu'il vous appartient de vérifier.

Au-delà de cette souveraineté d'hébergement, celle qui pèse à long terme est la **souveraineté cognitive**: posséder l'articulation de votre façon de penser avec l'IA, sous la forme d'un texte lisible et portable que vous pouvez relire, corriger et emporter. C'est la couche que BASE garde de votre côté, quel que soit le modèle. Voir [Co-penser avec l'IA](../learn/co-penser-avec-lia.md).

## Souveraineté des données

- Le cœur de BASE est **local**: il ne fait **aucun appel réseau par défaut**, et le routage par défaut est lexical (zéro réseau).
- Toute fonction susceptible de faire sortir des données (routage sémantique avancé, fournisseur d'embeddings, API externe) est **désactivée par défaut** et ne s'active que par un choix explicite, une option locale (Ollama) étant documentée.
- Vos fichiers restent portables (Markdown): vous pouvez changer d'outil IA sans rien perdre de votre structure.

Détail: [Sécurité et données du routage](securite-donnees-routage.md), section «Souveraineté des données» du [README](../../README.fr.md).

## Protection des données (nLPD / revLPD, RGPD)

À lui seul, BASE **ne vous rend pas conforme** à la loi suisse sur la protection des données (nLPD/revLPD) ni au RGPD: la conformité dépend de votre organisation, de vos traitements et de l'outil IA que vous y raccordez. Ce que BASE apporte concrètement:

- un fonctionnement **local par défaut** qui limite, dès la conception, ce qui quitte votre poste;
- une **frontière explicite** entre ce qui reste local et ce qui est confié à un tiers, la décision vous revenant;
- des fichiers **auditables** et un **journal minimal** pour garder trace des décisions.

Ce que vous fournissez vous-même: base légale, registre des traitements, gestion des droits des personnes et évaluation du fournisseur d'IA que vous utilisez. Voir [Sécurité et limites](securite-et-limites.md), section «Ce que BASE ne protège pas seul».

Vous n'avez pas à trancher seul ces questions: ce sont des sujets balisés, et **AI Swiss peut y répondre ou vous orienter vers des experts établis**.

## Sécurité

- Posture **honnête**: BASE distingue la **consigne** (un texte qu'un modèle coopératif suit) du **mécanisme** (ce que le broker applique réellement). Cette frontière est documentée en clair, sans fard.
- Le serveur d'intégration (MCP) est en **lecture seule par défaut sur le réseau** (transport HTTP), et son exposition hors du poste est refusée sans authentification. En accès **local** (stdio, depuis un outil installé sur votre machine), l'écriture est ouverte par défaut, à restreindre au besoin par `BASE_MCP_READ_ONLY=1`; en tout état de cause, toute écriture emprunte le flux médié propose→commit, jamais d'un seul geste.
- Modèle de menace et limites: [Sécurité et limites](securite-et-limites.md). Signalement de vulnérabilité: [`SECURITY.md`](../../SECURITY.md).

## Licence et réutilisation

- **Code** sous **Apache-2.0**; **documentation, agents, skills et exemples** sous **CC BY 4.0**.
- Vous pouvez l'utiliser, l'adapter et le redistribuer, y compris en interne. Le détail, en clair: [Licence](licence.md).

## Gouvernance et pérennité

- **Créé par Charles-Edouard Bardyn** (Directeur Scientifique, VP et cofondateur d'**[AI Swiss](https://a-i.swiss)**, association suisse indépendante à but non lucratif dont la mission est de promouvoir l'IA par le concret, l'humain et les fondamentaux), et aujourd'hui **maintenu par un mainteneur principal** sous l'intendance d'AI Swiss, ouvert à la contribution et à la co-maintenance.
- **[Innovaud](https://innovaud.ch)** est partenaire du projet: l'agence a contribué à amorcer les exemples métier destinés aux PME.
- **Continuité par la réversibilité.** Au-delà de l'intendance d'AI Swiss, la garantie de pérennité la plus solide est d'ordre structurel: code et contenus sous double licence ouverte (Apache-2.0 / CC BY 4.0), cœur sans aucune dépendance, fichiers Markdown que vous possédez. Vous pouvez **forker et reprendre le projet** à tout moment, sans être lié à un mainteneur unique.
- Surface publique stable et versionnée (SemVer): [Versions et stabilité](../reference/versions-et-stabilite.md). Décisions documentées dans le `CHANGELOG` et les `specs/`.

## Pour aller plus loin

- Modèles locaux et suisses: [Modèles souverains et locaux](../guides/modeles-souverains.md).
- Vue d'ensemble: [Framework public](../reference/framework-public.md).
- État de l'implémentation: [État d'implémentation](../reference/etat-implementation.md).
- Déploiement organisation: [Kit entreprise](../audiences/kit-enterprise.md).
- Institutions publiques: [Kit administration et secteur public](../audiences/kit-administration-secteur-public.md).
- Intégration technique: [`mcp/README.md`](../../mcp/README.md).
