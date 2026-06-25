---
schema_version: base.resource.v1
id: ameliorer-agent
type: process
title: Améliorer un agent
scope: team
status: active
sensitivity: internal
name: ameliorer-agent
description: Améliorer ou enrichir un agent existant.
use_when: Quand l'utilisateur veut ajouter un workflow, corriger un comportement, enrichir les connaissances ou faire évoluer un agent.
routing:
  examples:
    - Je veux améliorer mon assistant
    - Ajouter un workflow à un agent existant
    - Corriger le comportement de mon agent
  avoid_when:
    - Créer un nouvel agent de zéro.
    - Auditer ou entretenir un BASE existant.
argument-hint: "[nom de l'agent ou description du changement]"
user-invocable: true
allowed-tools: Read Write Edit Glob Grep
---

# Améliorer un agent

Enrichir ou modifier un agent existant: ajouter des workflows, des connaissances, corriger des comportements, ajuster la structure.

## Inputs

Demande à l'utilisateur:
- **Quel agent améliorer**: liste les agents dans `.ai/agents/` (en excluant `_template/` et `createur-agent/`)
- **Ce qui manque ou ne fonctionne pas**: description en langage naturel

## Étapes

### 1. Comprendre l'agent existant

Lis l'AGENT.md de l'agent ciblé. Résume à l'utilisateur:

> «Voici ce que fait actuellement votre assistant [nom]:
> - **Rôle:** [description]
> - **Workflows:** [liste des processes]
> - **Connaissances:** [liste des compétences]
> - **Documents:** [liste des templates]
>
> Que souhaitez-vous modifier ou ajouter?»

### 2. Diagnostiquer le besoin

Selon ce que dit l'utilisateur:

**«Il manque un workflow»**:
> «D'accord, décrivez-moi cette tâche. Quelles sont les étapes quand vous la faites aujourd'hui?»
→ Créer un nouveau process dans `skills/processes/`

**«Il ne connaît pas assez mon domaine»**:
> «Quelles informations lui manquent? Quelles erreurs fait-il par méconnaissance?»
→ Créer une nouvelle compétence dans `skills/competences/` ou enrichir une existante

**«Il ne produit pas le bon document»**:
> «À quoi devrait ressembler le résultat idéal?»
→ Créer ou modifier un template

**«Le comportement n'est pas bon»**:
> «Qu'est-ce qu'il fait qui ne vous convient pas?»
→ Ajuster AGENT.md (routage, philosophie, garde-fous)

**«Il lui manque des données»**:
> «Quelles informations devrait-il connaître en permanence?»
→ Créer de nouveaux dossiers métier

### 3. Proposer les modifications

Présente un plan clair:

> «Voici ce que je propose de modifier:
> - [Modification 1: description]
> - [Modification 2: description]
>
> Ça vous convient?»

**⚠ Point de décision, avant modification:**
Attendre la validation explicite.

### 4. Implémenter

Pour chaque modification validée:
- Crée les nouveaux SKILL.md dans `skills/processes/` ou `skills/competences/`
- Si c'est une modification d'un fichier existant, crée une nouvelle version plutôt que de modifier l'existant
- Mets à jour la table de routage et l'inventaire dans AGENT.md (point unique)
- Mets à jour la configuration outil si nécessaire (copie les nouveaux skills au bon endroit)

Montre un résumé de chaque changement.

### 5. Tester

> «Les modifications sont en place. Essayez de demander à votre assistant: "[suggestion de test]".
>
> Si le résultat n'est pas encore parfait, revenez, on peut ajuster.»

### 6. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`.

## Ce que tu ne fais jamais dans ce process

- **Modifier sans comprendre l'existant.** Toujours lire l'AGENT.md et les skills actuels.
- **Écraser une version existante.** Créer une nouvelle version plutôt que modifier l'originale.
- **Ajouter de la complexité inutile.** Résoudre le problème décrit, pas un problème imaginé.
- **Modifier sans point de décision.** Toute modification est proposée, validée, puis implémentée.
