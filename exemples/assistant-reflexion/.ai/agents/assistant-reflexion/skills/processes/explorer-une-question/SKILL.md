---
schema_version: base.resource.v1
id: explorer-une-question
type: process
title: Explorer une question
description: Approfondir une question ouverte ou synthétiser ses propres notes, en séparant ce qui est établi de ce qui est supposé, sources à l'appui.
scope: personal
status: active
sensitivity: internal
use_when: Quand la personne veut approfondir une question ouverte, faire le point sur un sujet, ou mettre de l'ordre dans ses notes, sans décision précise à trancher.
routing:
  examples:
    - Aide-moi à explorer la question de mon orientation
    - Mets de l'ordre dans mes notes sur ce sujet
    - Je veux approfondir cette idée, faire le point
    - Aide-moi à comprendre ce que je pense vraiment de ça
  avoid_when:
    - Trancher une décision précise entre des options.
    - Mettre par écrit une décision déjà prise.
    - Paramétrage initial de l'espace.
name: explorer-une-question
keywords: [explorer, approfondir, comprendre, réfléchir, faire le point, mettre de l'ordre, synthétiser, notes]
argument-hint: "[la question ou le sujet]"
user-invocable: true
allowed-tools: Read Write Edit Glob Grep
---

# Explorer une question

Aider la personne à approfondir une question ouverte ou à mettre de l'ordre dans ses notes, en gardant toujours visible la différence entre ce qui est établi, ce qui est son opinion, et ce que tu supposes. Le but est qu'elle pense mieux, pas que tu penses à sa place.

Lis `skills/competences/validation-aux-bons-moments/SKILL.md`. Si la personne a des notes, demande où elles se trouvent et lis-les avant de synthétiser.

## Inputs

- **La question ou le sujet** à explorer (texte libre)
- **Les notes existantes**, si la personne en a (un dossier, un fichier)

## Étapes

### 1. Cadrer la question

> «Reformulons la question pour être sûr de partir du bon endroit: **[reformulation]**. C'est bien cela que vous voulez explorer?»

← Validation du cadre

### 2. Partir de ce qui existe

Si la personne a des notes, lis-les et restitue ce qu'elles contiennent, **sans rien ajouter** à ce stade:

> «Voici ce que je lis dans vos notes, fidèlement: [synthèse]. Ai-je bien restitué ce que vous aviez écrit?»

Distingue clairement les trois registres, et garde-les distincts dans tout ce qui suit:
- ce que **vos notes disent** (cité, attribué);
- ce qui est **votre opinion** déjà formée;
- ce que **je suppose ou propose** (marqué `[HYPOTHESE: ...]`).

← Validation de la restitution

### 3. Ouvrir des angles

Propose des angles que la personne n'a peut-être pas vus, en les présentant comme des questions, pas des vérités:

> «Voici quelques angles pour ouvrir la réflexion:
> - [angle 1, sous forme de question]
> - [angle 2]
>
> Tout ce qui n'est pas dans vos notes est une proposition de ma part, à prendre ou à laisser. Lesquels vous parlent?»

Ce que tu avances et qui n'est ni dans les notes ni vérifiable se marque `[INCERTITUDE: ...]`. Tu ne présentes jamais une supposition comme un fait.

← Réaction de la personne

### 4. Synthétiser, en gardant les registres séparés

Propose une synthèse structurée qui conserve la distinction établie / opinion / hypothèse:

> «Voici une synthèse. Remarquez que j'ai gardé séparé ce qui vient de vos notes, ce qui est votre position, et ce que je suppose. Cela vous permet de voir sur quoi votre réflexion s'appuie. Qu'ajusteriez-vous?»

← Validation de la synthèse

### 5. Enregistrer

**⚠ Point de validation - avant écriture:**
> «Je peux enregistrer cette exploration dans `reflexions/[sujet].md`. Confirmez-vous?»

Enregistre dans `reflexions/YYYY-MM-DD_sujet.md`, en conservant les marqueurs et la distinction des registres.

### 6. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`.

## Ce que tu ne fais jamais dans ce process

- **Mélanger ce qui est établi et ce que tu supposes**: les registres restent séparés et visibles
- **Présenter une supposition comme un fait**: ce qui n'est pas vérifié est `[HYPOTHESE]` ou `[INCERTITUDE]`
- **Déformer les notes de la personne**: tu restitues fidèlement avant d'ajouter quoi que ce soit
- **Imposer une conclusion**: une exploration peut rester ouverte, c'est une issue valable
