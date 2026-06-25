---
schema_version: base.resource.v1
id: docs-trust-mecanismes-vs-consignes
type: document
title: Mécanismes vs consignes
description: La distinction centrale de BASE, entre une garantie appliquée par le broker et une simple consigne suivie par la bonne volonté du modèle.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [mecanisme, consigne, broker, gouvernance, confiance, enforcement, audit]
---

# Mécanismes vs consignes

## Pourquoi cette distinction est le cœur d'une gouvernance IA digne de confiance

Dans la plupart des outils IA, une règle de sécurité est en réalité une phrase adressée au modèle, du type «ne touche pas à ce fichier» ou «n'envoie jamais cette donnée à un service distant». Elle fonctionne tant que le modèle coopère et cesse de fonctionner dès qu'il se trompe, qu'il est détourné ou qu'une action contourne le chemin prévu. Une telle règle est une **consigne**, pas une garantie.

BASE distingue deux niveaux, et cette distinction fonde son honnêteté:

- un **mécanisme** est appliqué par le broker (la CLI `base`, le cœur dans `tools/`, ou le serveur MCP quand il délègue au broker). Il agit avant ou pendant l'action et peut la bloquer, la médiatiser ou la refuser. Il ne dépend pas de la bonne volonté du modèle.
- une **consigne** est une instruction exprimée dans les métadonnées ou le contexte. Elle oriente un modèle coopératif et sert de signal d'audit, mais elle ne contraint rien mécaniquement. Une consigne n'est pas du code qui s'exécute, même si un modèle la suit parfois si bien qu'elle en donne l'impression: il subsiste toujours une marge d'erreur, variable selon les domaines. Pour une règle qui doit être stricte, on ne s'en remet jamais à un modèle, il faut un mécanisme.

La condition qui fait basculer une propriété de consigne à mécanisme est toujours la même: **l'action passe par le chemin du broker** (CLI, cœur, ou MCP déléguant au broker). Si l'action emprunte un autre chemin (accès direct au shell, au système de fichiers ou à une API externe sans passer par BASE), la même propriété redevient une simple consigne.

## Les deux mondes d'un fichier

Cette frontière n'est pas abstraite: elle est inscrite dans la structure même d'un fichier BASE, qui a deux parties parlant chacune à un monde différent.

- L'**en-tête structuré** (le frontmatter: identité, périmètre, sensibilité, politique d'égress) est lu par du **code testé**. Le broker s'en sert pour décider et pour appliquer: confiner un accès, retenir une donnée confidentielle, médier une écriture. C'est le monde des **mécanismes**, qui ne dépendent pas de la bonne volonté du modèle.
- Le **corps en texte** (la méthode, le savoir-faire, les instructions métier) est lu par l'**IA**. Il oriente un modèle coopératif, sans rien contraindre. C'est le monde des **consignes**, utiles et faillibles.

Le même fichier relie ainsi votre expertise au code: ce qui doit être garanti vit dans l'en-tête que le broker applique; ce qui relève du jugement vit dans le texte que l'IA suit. Une propriété ne devient un mécanisme que lorsque l'action passe par le broker, là où cet en-tête est lu.

## Tableau des propriétés

| Propriété | Appliquée par le broker (mécanisme) | Seulement une consigne (bonne volonté du modèle) |
| --- | --- | --- |
| **Confinement des chemins et refus d'échappement par lien symbolique** (`tools/core/confine.mjs`) | Quand la lecture ou l'écriture passe par le broker: tout chemin hors de la racine autorisée est refusé, et une résolution de lien symbolique qui sortirait de la racine est refusée également. | Quand le modèle écrit ou lit via un outil direct du harness, hors du broker: le confinement n'est qu'une intention, rien n'empêche l'accès. |
| **Propose puis commit, écritures médiées et atomiques** | Quand l'écriture passe par le broker: la modification est d'abord proposée, puis validée, puis appliquée de façon atomique et médiée, ce qui permet une revue avant tout effet. | Quand l'écriture se fait par un outil direct: elle est immédiate et non médiée, sans étape de proposition ni atomicité garantie par BASE. |
| **Exécution des capacités en dry-run par défaut** | Quand une capacité est exécutée par le broker: elle est simulée par défaut, l'effet réel exige une demande explicite. | Quand le modèle déclenche une action équivalente hors broker: rien n'impose le dry-run, l'effet peut être immédiat. |
| **Abstention du routage plutôt que fausse certitude** | Quand le routage passe par le routeur de BASE: il peut renvoyer `out_of_scope`, `ambiguous` ou `needs_clarification` au lieu d'imposer un agent par défaut. | Quand le modèle choisit lui-même un agent sans appeler le routeur: rien ne garantit l'abstention, il peut deviner. |
| **Contrôle d'égress avant l'appel** (par construction, une ressource confidentielle ou une racine locale n'est pas envoyée à un modèle distant quand l'appel passe par le broker) | Quand l'appel passe par le broker (serveur MCP, chat du Studio, évaluation): la vérification a lieu avant l'envoi, et l'envoi d'une ressource confidentielle ou d'une racine local-only vers un modèle distant est bloqué en amont. | Quand l'appel à un modèle distant est fait hors du broker (par exemple en ligne de commande directe, ou dans un outil IA hors BASE): aucune vérification préalable n'est appliquée, la donnée peut partir. |
| **MCP en lecture seule par défaut** (option jeton bearer) | Quand l'accès passe par le serveur MCP de BASE: il est en lecture seule par défaut sur HTTP, l'écriture suppose une activation explicite et peut être protégée par un jeton bearer. | Quand un autre serveur ou un accès direct est utilisé: ni la lecture seule par défaut ni le jeton ne s'appliquent. |
| **Stockage des noms de variables d'environnement, pas des clés brutes** | Quand les réglages passent par le broker: ils enregistrent le NOM de la variable d'environnement et non la valeur de la clé API, qui reste hors du fichier. | Quand le modèle écrit une configuration par un autre moyen: rien n'empêche d'y inscrire une clé en clair. |
| **Journal de trace local** (`.ai/trace`) | Quand l'opération est médiée par le broker: elle est consignée localement dans le journal de trace, ce qui fournit une piste d'audit. | Quand l'action contourne le broker: elle n'apparaît pas dans le journal, l'audit est aveugle à cette opération. |

## Note de clôture

Hors du chemin du broker, tout revient au niveau natif du harness. Les métadonnées et les consignes restent utiles comme guide et comme signal pour un modèle coopératif, mais elles ne contraignent rien: un accès direct au shell, au système de fichiers ou à une API externe échappe à ces propriétés. La règle pratique est simple: une garantie n'est réelle que si l'action passe par la CLI `base`, par le cœur, ou par le MCP déléguant au broker.

Rappel de portée: BASE n'est ni un runtime d'agents, ni un moteur d'orchestration, ni un dispositif de RAG, ni une plateforme, ni un système IAM, DLP, SIEM, RBAC, ni un mécanisme de rétention ou d'archivage légal. Il ne garantit pas non plus l'exactitude des sorties d'un modèle. Le choix du modèle lui-même est externe à BASE.

Cette page est informative et ne constitue pas une certification de conformité ni un avis juridique ou de sécurité. Une institution reste responsable de sa propre analyse d'impact (DPIA) et de sa politique de sécurité.
