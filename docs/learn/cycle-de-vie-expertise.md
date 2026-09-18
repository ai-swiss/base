---
schema_version: base.resource.v1
id: cycle-de-vie-expertise
type: document
title: Faire vivre une expertise après le déploiement
description: La boucle d'entretien d'un assistant BASE, de l'import au retour du terrain et à la revue.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [cycle de vie, importer, evaluer, gouverner, vieillir, friction, doctor, maintenance]
---

# Faire vivre une expertise après le déploiement

Un assistant en service n'est pas un livrable figé. Ses sources vieillissent, ses usages révèlent des lacunes et son environnement d'exécution change. Le cycle utile relie ces signaux à une correction dont une personne reste responsable.

L'objet durable n'est pas une configuration parfaite au jour du lancement. C'est une expertise entretenue: des sources, des façons de faire, des contrôles et des décisions que le terrain continue d'éprouver.

```text
importer → éditer → évaluer → exécuter
   ↑                                ↓
doctor ← revoir ← gouverner ← retour du terrain
```

## 1. Importer et éditer

Le process [`importer-l-existant`](../../.ai/agents/createur-agent/skills/processes/importer-l-existant/SKILL.md) propose de transformer les documents utiles en façons de faire, connaissances et modèles de document. Dans le flux médié, chaque proposition vise un fichier précis et n'est pas encore appliquée; le commit correspondant ne l'applique qu'après confirmation et contrôle que cette cible n'a pas changé.

[BASE Studio](../../tools/studio/ui/README.md) présente les fichiers et les modifications proposées. Cette visibilité aide à repérer la dette éditoriale, sans prouver que le contenu est juste.

Importer ne consiste pas à découper mécaniquement tout le corpus en agents. On conserve les sources qui font foi, on distingue le savoir des façons de faire et on crée les points d'entrée correspondant aux intentions observées. L'édition sert ensuite à préciser ces relations sans dupliquer la même règle partout.

## 2. Évaluer ce qui compte

Le [harnais d'évaluation](../../tools/eval/README.md) rejoue des scénarios avec la surface MCP prévue et fait noter la conversation par une invocation distincte. Cette séparation réduit certains biais, mais le verdict dépend encore du modèle juge, du barème et des cas testés.

Tous les usages ne justifient pas la même profondeur d'évaluation. Les tâches promues à l'échelle d'une équipe ou d'une institution, ainsi que les sorties à risque, méritent des scénarios suivis dans le temps. Une étape non exécutable dans le harnais se déclare comme limitation au lieu d'être simulée.

Les scénarios les plus utiles représentent des parcours réels: une intention courante, les sources attendues, un point de décision et une sortie que le barème sait distinguer d'une réponse seulement plausible. Quand la référence change, ils aident à voir si le comportement important a dérivé.

## 3. Exécuter dans un environnement explicite

L'assistant s'exécute dans l'outil IA choisi. Le broker BASE peut appliquer confinement, politique d'accès, écriture médiée et trace uniquement aux actions qui passent par ses entrées. Un accès direct au disque, au shell ou à une API contourne ces contrôles. Voir [Sécurité et limites](../trust/securite-et-limites.md).

Changer d'outil ou de modèle conserve la référence textuelle, mais peut exiger des adaptateurs, des permissions différentes et de nouveaux tests avant de retrouver un comportement équivalent.

## 4. Recueillir le terrain

Une friction se consigne par `report_friction` lorsque cet outil d'écriture est disponible, ou par le process [`signaler-une-friction`](../../.ai/agents/concierge-base/skills/processes/signaler-une-friction/SKILL.md). Elle décrit ce qui a coûté du temps, créé un risque ou empêché la tâche.

Une friction n'est pas seulement un défaut à corriger. Elle peut révéler une source devenue ambiguë, une intention sans point d'entrée, un contrôle absent ou une étape qui demande inutilement une décision. Une demande récurrente restée sans route peut justifier une nouvelle façon de faire. Un incident isolé ne suffit pas toujours.

Les abstentions ne sont pas journalisées partout. Sur une racine unique, la CLI `base route` et un serveur MCP en lecture-écriture enregistrent les abstentions honnêtes. Les branches multi-racines ne le font pas, et un serveur MCP en lecture seule n'écrit rien, car la requête peut contenir le texte d'un tiers. Le routeur central reste sans effet de bord.

Studio et `base doctor` peuvent ensuite faire remonter les frictions ouvertes et les abstentions récurrentes effectivement enregistrées. Une absence dans cette pile ne prouve donc pas qu'aucune abstention n'a eu lieu.

## 5. Revoir et gouverner

Les champs `status`, `review_by`, `valid_from` et `valid_until` rendent le vieillissement explicite. `base doctor` relève notamment les liens morts, les ressources orphelines, les évaluations périmées, les relectures échues et les frictions ouvertes.

Les règles d'egress du broker ne valent que sur les chemins médiés qui lui fournissent un contexte d'egress. Le serveur MCP traite les lectures comme distantes par défaut; une lecture directe par un outil IA ou la CLI peut contourner cette retenue. La politique complète, y compris les choix opérateur, est canonique dans [Protection des données](../trust/protection-des-donnees.md) et [Sécurité et limites](../trust/securite-et-limites.md).

La revue relie chaque constat à une décision: corriger, remplacer, déprécier, accepter temporairement ou retirer. Un nom de responsable et une date évitent que la surveillance se résume à une liste de problèmes sans suite.

## 6. Capitaliser sans figer

Le retour du terrain doit modifier la référence seulement après examen. Une correction locale peut enrichir une source, une façon de faire ou un scénario. Une évolution plus large peut changer le point d'entrée lui-même. Dans les deux cas, l'historique versionné permet de comprendre pourquoi l'expertise a évolué.

Cette capitalisation ne promet pas un comportement identique avec tous les modèles. Elle conserve ce qui peut l'être, l'intention, les sources, les règles, les contrôles et les décisions, puis impose de réévaluer l'exécution lorsqu'un outil ou un environnement change.

Le cycle est fermé lorsque le constat du terrain devient une amélioration vérifiée, attribuée et datée. Il recommence dès que les usages ou les sources produisent un nouveau signal.

## Prochaine action

Depuis la racine de votre dossier, lancez `node .ai/base.mjs doctor --root .`, choisissez le constat ouvert qui présente le plus grand risque métier et attribuez sa correction à une personne avec une date de revue.
