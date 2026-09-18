---
schema_version: base.resource.v1
id: souverainete-et-confiance
type: document
title: Justifier le choix de BASE (souveraineté, confiance, conformité)
description: "Tout ce qu'il faut pour défendre le choix de BASE devant un client, un service informatique ou un responsable conformité, rassemblé sur une page: souveraineté des données, protection des données, sécurité, licence et gouvernance."
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [souverainete, confiance, conformite, nLPD, revLPD, RGPD, securite, licence, gouvernance, donnees, evaluation]
---

# Justifier le choix de BASE: souveraineté, confiance, conformité

Adopter BASE suppose souvent de convaincre d'abord: un client inquiet pour ses données, un service informatique, un responsable conformité. Vous trouverez ici, rassemblé en un seul endroit, de quoi défendre ce choix sans esquiver les questions qui fâchent: souveraineté des données, protection des données, sécurité, licence et gouvernance. Conçue pour toute organisation qui évalue BASE, de l'indépendant à l'institution, cette page renvoie aux documents de référence sans s'y substituer.

## En une phrase

BASE est un cadre **local-first** et **ouvert** pour structurer le travail avec l'IA: votre savoir reste dans des fichiers texte que vous possédez, et vous décidez explicitement ce qui sort, le cas échéant, vers un outil IA.

La souveraineté de BASE tient à son architecture, non à un label. Local-first, le cadre s'exécute sur votre machine et conserve le savoir dans des fichiers texte que vous possédez. Son cœur ne contacte aucun fournisseur distant par défaut, mais l'outil IA utilisé au-dessus de BASE peut transmettre ce que vous lui montrez. Deux précisions s'imposent toutefois. Un modèle local n'est pas un modèle suisse: la localité dit où il tourne, non d'où il vient. Et un modèle suisse n'est pas pour autant confidentiel s'il est hébergé sur une infrastructure soumise à une juridiction étrangère. Selon le fournisseur, sa structure et les données concernées, des règles extraterritoriales comme le CLOUD Act américain peuvent s'appliquer. Un acteur suisse peut lui aussi être contraint de communiquer des données selon le droit applicable. Aucune localisation n'offre donc, à elle seule, une confidentialité absolue. Ce qui sort dépend de votre configuration et du contrat: résidence des données, usage pour l'entraînement, sous-traitants, juridiction. Le cadre et l'expertise restent sous votre contrôle; le modèle demeure un choix externe qu'il vous appartient d'évaluer.

Au-delà de cette souveraineté d'hébergement, celle qui pèse à long terme est la **souveraineté cognitive**: posséder l'articulation de votre façon de penser avec l'IA, sous la forme d'un texte lisible et portable que vous pouvez relire, corriger et emporter. Cette couche reste de votre côté, quel que soit le modèle. Voir [Co-penser avec l'IA](../learn/co-penser-avec-lia.md).

## Souveraineté des données

- Le cœur de BASE est **local**: il ne contacte **aucun service distant par défaut**.
- Dans un outil IA, le modèle route normalement en lisant la carte locale. Le routeur lexical est le plancher déterministe des appels sans modèle et des tests.
- La Voie 2 livrée ne transmet que la requête et les textes de routage nécessaires lorsqu'elle est activée. Une intégration directe du paquet sémantique peut avoir un périmètre plus large; une option locale avec Ollama est documentée.
- Vos fichiers restent portables (Markdown): vous pouvez changer d'outil IA sans rien perdre de votre structure.

Détail: [Sécurité et données du routage](securite-donnees-routage.md) et [La frontière, local par défaut](frontiere-local-vs-sortant.md).

## Protection des données (nLPD / revLPD, RGPD)

À lui seul, BASE **ne vous rend pas conforme** à la loi suisse sur la protection des données (nLPD/revLPD) ni au RGPD: la conformité dépend de votre organisation, de vos traitements et de l'outil IA que vous y raccordez. Ce que BASE apporte concrètement:

- un fonctionnement **local par défaut** qui limite, dès la conception, ce qui quitte votre poste;
- une **frontière explicite** entre ce qui reste local et ce qui est confié à un tiers, la décision vous revenant;
- des fichiers **auditables** et un **journal opérationnel best-effort**, utile comme indice mais non exhaustif.

Ce que vous fournissez vous-même: base légale, registre des traitements, gestion des droits des personnes et évaluation du fournisseur d'IA que vous utilisez. Voir [Sécurité et limites](securite-et-limites.md), section «Ce que BASE ne protège pas seul».

Vous n'avez pas à trancher seul ces questions: ce sont des sujets balisés, et **AI Swiss peut y répondre ou vous orienter vers des experts établis**.

## Sécurité

- Posture **honnête**: le [glossaire](../reference/glossaire.md) fixe la distinction entre **consigne** et **mécanisme**; [Mécanismes vs consignes](mecanismes-vs-consignes.md) montre comment elle s'applique aux garde-fous de BASE.
- Le serveur d'intégration (MCP) est en **lecture seule par défaut sur le réseau** (transport HTTP), et son exposition hors du poste est refusée sans authentification. En accès **local** (stdio, depuis un outil installé sur votre machine), l'écriture est ouverte par défaut, à restreindre au besoin par `BASE_MCP_READ_ONLY=1`; en tout état de cause, toute écriture emprunte le flux médié propose→commit, jamais d'un seul geste.
- Modèle de menace et limites: [Sécurité et limites](securite-et-limites.md). Signalement de vulnérabilité: [`SECURITY.md`](../../SECURITY.md).

## Licence et réutilisation

- **Code** sous **Apache-2.0**; **documentation, agents, skills et exemples** sous **CC BY 4.0**.
- Vous pouvez l'utiliser, l'adapter et le redistribuer, y compris en interne. Le détail, en clair: [Licence](licence.md).

## Gouvernance et pérennité

- **Créé par Charles-Edouard Bardyn** (Directeur Scientifique, VP et cofondateur d'**[AI Swiss](https://a-i.swiss)**, association suisse indépendante à but non lucratif dont la mission est de promouvoir l'IA par le concret, l'humain et les fondamentaux), et aujourd'hui **maintenu par un mainteneur principal** sous l'intendance d'AI Swiss, ouvert à la contribution et à la co-maintenance.
- **[Innovaud](https://innovaud.ch)** est partenaire du projet: l'agence a contribué à amorcer les exemples métier destinés aux PME.
- **Continuité par la réversibilité.** Au-delà de l'intendance d'AI Swiss, la garantie de pérennité la plus solide est d'ordre structurel: code et contenus sous double licence ouverte (Apache-2.0 / CC BY 4.0), cœur sans aucune dépendance, fichiers Markdown que vous possédez. Vous pouvez **forker et reprendre le projet** à tout moment, sans être lié à un mainteneur unique.
- Surface publique stable selon une politique de compatibilité documentée: [Versions et stabilité](../reference/versions-et-stabilite.md). Décisions documentées dans le `CHANGELOG` et les `specs/`.

## Pour aller plus loin

- Modèles locaux et suisses: [Modèles souverains et locaux](../guides/modeles-souverains.md).
- Vue d'ensemble: [Framework public](../reference/framework-public.md).
- État de l'implémentation: [État d'implémentation](../reference/etat-implementation.md).
- Déploiement organisation: [Kit entreprise](../audiences/kit-enterprise.md).
- Institutions publiques: [Kit administration et secteur public](../audiences/kit-administration-secteur-public.md).
- Intégration technique: [`mcp/README.md`](../../mcp/README.md).
