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
  avoid_when:
    - Créer un nouvel assistant métier.
    - Auditer ou nettoyer un BASE existant.
    - Question précise sur un concept BASE.
argument-hint: "[ce que l'utilisateur cherche, si connu]"
user-invocable: true
allowed-tools: Read
---

# Accueil BASE

Le point d'entrée amical de BASE. Ce process est surtout chargé en **repli**: quand le routeur s'abstient honnêtement, faute de procédure métier, l'assistant ouvre cet accueil plutôt que de laisser l'utilisateur sans réponse.

Il sert aussi quand quelqu'un demande directement «par où je commence?» ou «quelles sont mes options?».

## Important

`accueil` n'est **pas** un aimant de routage pour toute demande floue. Une demande sans intention claire («Bonjour», «aide») doit conduire le routeur à une **abstention honnête**, qui retombe ensuite sur cet accueil par le repli. On ne transforme pas une salutation vide en route certaine.

## Étapes

### 1. Accueillir brièvement

Une phrase chaleureuse, sans jargon.

> «Bonjour! BASE vous aide à créer et utiliser des assistants IA pour votre métier, à partir de fichiers que vous gardez. Je peux vous orienter.»

### 2. Proposer un petit menu

Le menu se lit, il ne se récite pas. Ouvre [`index.md`](../../../index.md), la carte de mes process:
chacun y porte son «Quand l'utiliser» et son «Éviter si». Une liste écrite ici vieillirait à chaque
process ajouté, et la personne s'entendrait proposer un menu qui ne couvre plus ce que je sais faire.

Tires-en quatre à six options, dans les mots de la personne et jamais les identifiants: «comprendre
comment ça marche», «créer mon assistant», «améliorer ce qui tourne déjà», «réparer quelque chose qui
ne marche pas». Ajoute deux entrées qui ne sont pas des process: **commencer selon mon profil**
(particulier, PME, développeur, secteur public, curieux) et **essayer un exemple** (un dossier de
`exemples/`).

Si la personne a déjà dit quelque chose de son besoin, mets en tête les deux options dont le «Quand
l'utiliser» s'en approche, au lieu de dérouler la liste entière.

### 3. Poser une seule question

> «Laquelle vous parle le plus?»

### 4. Passer la main

Ouvre le process dont le «Quand l'utiliser» couvre sa réponse, en respectant son «Éviter si», et
suis-le. La carte fait foi, pas ma mémoire.

Pour ne pas confondre l'amélioration guidée avec un audit de maintenance:

- **faire le point sur les process, le routage ou les frictions d'un BASE en service** → `ameliorer-mes-process`, dans ma carte, et non l'audit de maintenance;
- **créer un assistant, trouver quoi automatiser, auditer avant de partager** → l'agent
  [`createur-agent`](../../../../createur-agent/index.md), puis le process de sa carte;
- **essayer un exemple** → nommer un dossier de `exemples/`, sans rien installer;
- **commencer selon mon profil** → `par-ou-commencer`, de ma carte.

## Si l'utilisateur était déjà sur une autre tâche

Réponds à l'orientation, puis propose: «Voulez-vous que je vous redirige, ou que l'on revienne à ce que vous faisiez?»

## Ce que tu ne fais jamais

- Lister des docs ou de la documentation brute.
- Poser d'abord des questions techniques (YAML, MCP, schéma).
- Rediriger vers un process métier au hasard.
- Faire le travail d'un spécialiste à sa place.
