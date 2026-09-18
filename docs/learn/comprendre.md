---
schema_version: base.resource.v1
id: docs-comprendre-md
type: document
title: Qu'est-ce que BASE et comment façonne-t-il l'interaction avec l'IA?
description: Ce qu'est BASE, à quoi il sert, comment il structure la collaboration avec l'IA et comment commencer.
scope: public
status: active
sensitivity: public
keywords: [comprendre, approche, co-pensee, contexte, comportement, verification]
---

# Qu'est-ce que BASE et à quoi sert-il? {#comprendre-base-et-faconner-l-interaction-avec-l-ia}

BASE aide à garder la maîtrise de ce que l'on produit avec une IA générative. Il place le contexte, les façons de faire, les contrôles et les décisions dans des fichiers lisibles que l'on peut relire et versionner. Cette page donne une vue d'ensemble avant d'entrer dans les pages de référence.

Quatre objets doivent rester distincts:

- la **méthode** est la manière dont le travail est conduit: étapes, sources faisant autorité, règles, contrôles et décisions humaines;
- la **structure BASE** est l'ensemble des ressources et des relations qui décrivent cette méthode;
- la **référence** est la description approuvée et versionnée de la méthode à un instant donné;
- l'**exécution** est ce qu'un modèle, un outil ou une intégration fait effectivement à partir de cette référence, dans un contexte donné.

La structure n'est donc pas la méthode elle-même, et la référence n'est pas son exécution. Une même référence peut conduire à des exécutions différentes selon le modèle, les outils, les données, les permissions et l'intégration. Les termes spécialisés de cette page sont définis dans le [glossaire](../reference/glossaire.md).

## Pourquoi structurer la collaboration

Un modèle produit des réponses plausibles à partir de son entraînement et du contexte fourni. Il ne connaît pas spontanément votre terrain, vos règles implicites ni l'état de votre travail. Son langage reste sous-spécifié et sa mémoire entre appels dépend du dispositif qui l'entoure.

BASE rend donc explicites cinq éléments: le but, les sources qui font foi, la façon de faire, les limites d'action et les décisions humaines. Une réponse reste une proposition à confronter aux faits et au risque accepté.

Le travail suit une boucle simple:

```text
CADRER → CONFIER → ÉVALUER → AJUSTER
```

Vous formulez le but et les contraintes, laissez l'IA proposer jusqu'au prochain point de contrôle, vérifiez contre les sources ou la réalité, puis corrigez. [La co-pensée en pratique](pratiques-co-pensee.md) détaille ce geste.

## De l'intention au contexte utile

L'entrée dans BASE est une intention: «préparer ce devis», «mettre à jour cette politique», «analyser ce retour». Le routage consulte la carte des agents et de leurs façons de faire, puis choisit ce qui couvre la demande ou s'abstient si rien ne convient. Une fois ce choix fait, seuls les éléments déclarés utiles sont ouverts au besoin.

Le mouvement est donc:

```text
intention → point d'entrée → façon de faire → savoir utile → contrôle
```

BASE ne demande pas de prédécouper tout un corpus en agents. Un agent est un point d'entrée pour un ensemble cohérent de travail. Les connaissances, les façons de faire, les modèles de document et les outils gardent leur rôle propre et peuvent être reliés là où ils servent réellement.

Prenons un devis. L'intention conduit à la façon de préparer un devis. Celle-ci peut ouvrir le barème, le modèle de document et les règles de validation, sans charger les politiques de recrutement ni les archives sans rapport. Le contexte est ciblé, mais chaque élément doit rester assez complet pour être compris hors de son fichier d'origine.

## Les nécessités qui guident BASE

### Écrire ce qui doit durer

Une conversation ne suffit pas comme mémoire durable. Les règles, décisions et données utiles vivent dans des fichiers afin d'être retrouvées, relues et corrigées. Un journal peut prolonger le travail entre sessions lorsqu'un agent ou un process prévoit explicitement de l'écrire.

Sans cette mémoire extérieure, les mêmes questions reviennent et les décisions se dispersent dans l'historique des conversations. Écrire ne rend pas une information vraie, mais permet de la retrouver et de la corriger.

### Rendre l'état cherchable

Les marqueurs canoniques signalent les informations manquantes, les propositions à confirmer, les alertes et les décisions. Leur sens et leur emplacement sont définis une seule fois dans le [registre des marqueurs](../reference/marqueurs.md). Une annotation propre à un domaine peut compléter ce registre, mais le scanner ne la traite pas comme un marqueur canonique.

Une information introuvable au moment de décider se comporte presque comme une information absente. Les titres, relations et marqueurs donnent des prises à la recherche sans transformer l'index en nouvelle source faisant autorité.

### Vérifier selon la tâche

Certaines tâches disposent d'un contrôle externe, par exemple un compilateur, un schéma ou un calcul déterministe. Beaucoup d'autres exigent une comparaison humaine avec des faits, des intentions ou des contraintes métier. Dans tous les cas, demander au même modèle de «se vérifier» ne constitue pas une preuve indépendante.

Une structure précise réduit le travail de contrôle, sans garantir la vérité ni remplacer la capacité de juger. Chaque affirmation acceptée sans examen ajoute une dette de vérification.

Le contrôle se place avant l'action coûteuse ou difficile à défaire. Une reformulation peut être corrigée dans la conversation. Un prix envoyé, une publication ou une modification de données mérite un point de décision explicite.

### Séparer les consignes des mécanismes

Une consigne oriente un modèle coopératif. Une permission, une règle ou une politique ne bloque réellement une action que si un composant présent sur son chemin l'applique. Les protections du broker valent donc pour les lectures, écritures et appels médiés par lui; un accès direct au système de fichiers, au shell ou à une API peut les contourner. La frontière complète est décrite dans [Sécurité et limites](../trust/securite-et-limites.md).

Une source externe reste un contenu à examiner, non une instruction de travail. Cette règle réduit le risque d'injection, mais demeure textuelle tant qu'un composant technique ne sépare pas effectivement données et commandes.

### Conserver de quoi partir

Les fichiers Markdown facilitent l'audit et le changement d'outil. Cette portabilité n'est pas automatique: un nouvel environnement peut demander des adaptateurs, une nouvelle configuration de permissions et des tests pour vérifier que la référence produit encore le comportement attendu.

## Anatomie minimale

Un dossier d'agent peut réunir:

```text
AGENT.md
├── skills/
│   ├── processes/
│   └── competences/
├── templates/
└── tools/
```

Le [glossaire](../reference/glossaire.md) fixe les distinctions entre **agent** et **assistant**, ainsi qu'entre **skill**, **process** et **compétence**. En pratique, `AGENT.md` sert de point d'entrée, un process décrit une façon de faire, une compétence apporte un savoir réutilisable, un template donne la forme d'un document et un outil exécute une opération.

Cette anatomie n'impose pas qu'un agent possède chaque sous-dossier ni qu'une connaissance soit dupliquée pour chacun. La structure suit les besoins réels et les relations explicites.

## Comment commencer

Choisissez une tâche récurrente dont vous connaissez le résultat attendu. Réunissez une source qui fait foi, une façon de faire courte, un modèle de sortie si sa forme compte et un contrôle qui pourrait révéler une erreur. Testez ensuite le parcours complet sur un cas réel.

Commencer petit permet d'observer où le contexte manque et où une décision humaine est nécessaire. L'expertise se développe à partir de ces écarts, pas à partir d'une architecture exhaustive imaginée avant l'usage. [Le cycle de vie d'une expertise](cycle-de-vie-expertise.md) montre comment entretenir cette structure après sa mise en service.

## Prochaine action

Ouvrez l'[agent de l'exemple assistant-devis](../../exemples/assistant-devis/.ai/agents/assistant-devis/AGENT.md), choisissez un de ses process et repérez, dans cet ordre, l'intention couverte, son but, ses sources, son point de contrôle et sa sortie attendue.
