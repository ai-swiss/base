---
schema_version: base.resource.v1
id: importer-l-existant
type: process
title: Importer l'existant
scope: team
status: active
sensitivity: internal
description: Convertir des documents existants (notes, modes d'emploi Word, wikis, checklists) en ressources BASE (process, compétences, documents, templates), proposées via le gate, jamais écrites d'office.
use_when: Quand l'utilisateur veut partir de ses documents existants: «importe mes procédures», «transforme ce mode d'emploi en process», «j'ai déjà tout dans un wiki».
keywords: [import, migration, conversion, existant, onboarding]
routing:
  examples:
    - Importer mes procédures existantes
    - Transformer ce document en process
    - J'ai déjà un wiki, comment le réutiliser ?
  avoid_when:
    - Créer un agent de zéro sans matériau existant (c'est créer-agent).
    - Signaler un dysfonctionnement de l'assistant.
---

# Importer l'existant

Personne ne part d'une page blanche: le savoir-faire est déjà dans des documents. Ce process
explore ce que l'utilisateur pointe et PROPOSE des conversions en ressources BASE: chaque
écriture passe par le gate propose → commit, l'humain valide chaque diff.

## Inputs

Demande à l'utilisateur:
- **Les chemins ou fichiers à importer** (un dossier, un export Word converti, des pages copiées).
- **L'agent de destination** (existant, ou à créer d'abord avec `creer-agent`).

## Étapes

### 1. Explorer le matériau

Lis chaque source (`open_resource`, ou `discover_resources` si les chemins sont flous). Classe
mentalement chaque contenu:
- **Se suit** (étapes, checklist, procédure) → futur `process`
- **S'apprend** (règles, conventions, savoir) → future `competence` ou `document`
- **Se remplit** (trame, modèle de courrier) → futur `template`
- **Se consulte avec une validité** (barème, tarifs) → `document` avec `valid_from`/`valid_until`

### 2. Proposer la carte d'import

Présente un tableau source → ressource cible (type, id, chemin) et fais valider la découpe AVANT
de convertir quoi que ce soit.

### 3. Convertir, une ressource à la fois

Pour chaque ressource validée, rédige le fichier complet (frontmatter `base.resource.v1`: id,
type, title, description, `use_when` digne du routeur) et propose-le via `propose_change`.
**N'appelle jamais `commit_change` toi-même**: l'humain valide chaque diff.

### 4. Vérifier la santé après import

Recommande `base doctor`: il relèvera les liens cassés par la copie et les ressources orphelines,
c'est le filet après toute migration.

## Ce que tu ne fais jamais dans ce process

- **Écrire sans diff validé.** Proposer, toujours; committer, jamais.
- **Inventer du contenu absent des sources.** Tu convertis, tu ne crées pas de savoir.
- **Importer en vrac.** Chaque ressource est découpée, nommée et validée une à une.
