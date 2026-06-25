---
schema_version: base.resource.v1
id: accueil
type: process
title: Accueil BASE
scope: team
status: active
sensitivity: internal
name: accueil
description: "Accueillir l'utilisateur, montrer un petit menu d'options BASE et l'orienter vers la bonne étape. Cible de repli quand le routeur s'abstient."
use_when: Quand l'utilisateur demande le menu d'aide BASE ou la liste de ses options dans BASE.
routing:
  examples:
    - Quelles sont mes options dans BASE ?
    - Montre-moi le menu d'aide BASE
    - Par quoi je commence dans BASE ?
  avoid_when:
    - Créer un nouvel assistant métier.
    - Auditer ou nettoyer un BASE existant.
    - Question précise sur un concept BASE.
argument-hint: "[ce que l'utilisateur cherche, si connu]"
user-invocable: true
allowed-tools: Read
---

# Accueil BASE

Le point d'entrée amical de BASE. Ce process est surtout chargé en **repli**: quand le routeur s'abstient honnêtement (il ne trouve pas de workflow métier), l'assistant ouvre cet accueil au lieu de laisser l'utilisateur dans le vide.

Il sert aussi quand quelqu'un demande directement «par où je commence?» ou «quelles sont mes options?».

## Important

`accueil` n'est **pas** un aimant de routage pour toute demande floue. Une demande sans intention claire («Bonjour», «aide») doit produire une **abstention honnête** du routeur, qui retombe ensuite sur cet accueil via le repli. On ne transforme pas une salutation vide en route certaine.

## Étapes

### 1. Accueillir brièvement

Une phrase chaleureuse, sans jargon.

> «Bonjour! BASE vous aide à créer et utiliser des assistants IA pour votre métier, à partir de fichiers que vous gardez. Je peux vous orienter.»

### 2. Proposer un petit menu

Des options courtes:

- **Commencer selon mon profil**: particulier, PME, développeur, secteur public, curieux.
- **Essayer un exemple**: voir un assistant déjà prêt.
- **Créer mon assistant**: partir de mon métier.
- **Trouver quoi automatiser**: si je ne sais pas par où prendre mon activité.
- **Comprendre BASE**: comment ça marche.
- **Réparer / configurer**: si quelque chose ne marche pas.
- **Auditer un BASE existant**: vérifier, nettoyer, préparer à partager.

### 3. Poser une seule question

> «Laquelle vous parle le plus?»

### 4. Passer la main

Selon la réponse:

- commencer selon mon profil → `par-ou-commencer`;
- essayer un exemple → indiquer un dossier dans `exemples/`;
- créer → `createur-agent` / `creer-agent`;
- trouver quoi automatiser → `createur-agent` / `diagnostic`;
- comprendre → `comprendre-base` ou `faq-base`;
- réparer / configurer → `depannage-base`, puis `activer-routage` si c'est une installation;
- auditer → `createur-agent` / `entretien-base`.

## Si l'utilisateur était déjà sur une autre tâche

Réponds à l'orientation, puis propose: «Voulez-vous que je vous redirige, ou qu'on revienne à ce que vous faisiez?»

## Ce que tu ne fais jamais

- Lister des docs ou de la documentation brute.
- Poser d'abord des questions techniques (YAML, MCP, schéma).
- Rediriger vers un workflow métier au hasard.
- Faire le travail d'un spécialiste à sa place.
