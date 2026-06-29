---
schema_version: base.resource.v1
id: _exemple-process
type: process
title: Exemple de process
description: Template de process. Copier ce dossier, renommer, et adapter le contenu.
scope: personal
status: active
sensitivity: internal
user-invocable: true
allowed-tools: Read
---

<!-- Ne modifiez pas les lignes entre les --- ci-dessus. Elles aident l'assistant à comprendre ce fichier. -->

<!--
OPTION BASE POUR UN PROCESS ROUTABLE:
Si cet assistant doit utiliser `base route` ou `route_request`, remplacez le frontmatter minimal par
un frontmatter BASE comme celui-ci, en gardant seulement les champs utiles:

---
schema_version: base.resource.v1
id: nom-du-process
type: process
title: Nom du process
description: Description courte du résultat obtenu.
scope: team
status: active
sensitivity: internal
use_when: Quand l'utilisateur veut [décrire l'intention métier].
routing:
  examples:
    - formulation réelle d'utilisateur
  avoid_when:
    - demande proche qui ne doit pas lancer ce process
requires:
  - ref: ressource-utile
    access: read
    purpose: expliquer pourquoi le process en a besoin
---

Le routeur choisit le process. Les compétences, templates, tools et données ne sont alors que des ressources
référencées par le process, et non des routes primaires.
-->

# [Nom du process]

[Description en une phrase: quel objectif ce process atteint.]

## Inputs

Demande à l'utilisateur:
- **[Input 1]**: [pourquoi c'est nécessaire]
- **[Input 2]**: [pourquoi c'est nécessaire]

Avant de commencer, vérifie:
- [Condition préalable, ex. le fichier X doit exister et ne contenir aucun placeholder]

Si `.ai/journal/` contient des entrées récentes liées à ce process, lis-les pour reprendre le fil.

## Étapes

### 1. [Nom de l'étape: collecte d'information]

[Ce que fait l'agent à cette étape. Donner un exemple de ce qu'il dit:]

> «[Exemple de message à l'utilisateur]»

[Questions à poser, informations à collecter.]

> «Voici ce que j'ai noté: [résumé]. Est-ce correct?»

← Reformulation (vérifie la compréhension, léger)

### 2. [Nom de l'étape: proposition]

[Ce que fait l'agent.]

> «[Exemple de message]»

← Reformulation si nécessaire

### 3. [Nom de l'étape: action]

[L'agent est prêt à créer ou modifier un fichier.]

**⚠ Point de décision, avant écriture:**
> «Je suis prêt à [action]. Voici ce qui sera fait:
> - [détail 1]
> - [détail 2]
> Confirmez-vous?»

← Point de décision (action irréversible: création/modification de fichier)

[Après confirmation, l'agent exécute l'action.]

### 4. Récapitulatif

> «Voici ce que nous avons fait:
> - [Point 1]
> - [Point 2]
>
> [Prochaine action suggérée.]»

### 5. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`.

<!--
NOTES POUR L'AUTEUR DU PROCESS:
- Distinguez la reformulation (légère, qui vérifie la compréhension) du point de décision (avant une action irréversible)
- Ne diluez pas les points de décision: réservez-les aux moments qui comptent
- L'agent reformule souvent, mais ne pose un point de décision qu'avant d'écrire
- Chaque process se termine par une étape Journal
- Référencez les compétences et templates par leur chemin relatif
- 3 à 7 étapes au maximum; au-delà, découpez en plusieurs processes
-->
