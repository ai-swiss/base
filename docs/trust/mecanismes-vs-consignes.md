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

Dans la plupart des outils IA, une règle de sécurité n'est rien d'autre qu'une phrase adressée au modèle, du type «ne touche pas à ce fichier» ou «n'envoie jamais cette donnée à un service distant». Elle tient tant que le modèle coopère et cède dès qu'il se trompe, qu'on le détourne ou qu'une action contourne le chemin prévu. Une telle règle est une **consigne**, non une garantie.

Le [glossaire](../reference/glossaire.md) fixe la distinction entre mécanisme et consigne. Ici, elle s'applique propriété par propriété: le périmètre fait partie de la garantie. Un contrôle du broker ne vaut que pour l'action qui passe par son point d'entrée. Une barrière de test ne vaut que pour les surfaces et les critères qu'elle couvre. Hors de ce périmètre, la propriété n'est pas garantie par ce mécanisme.

## Les deux mondes d'un fichier

Cette frontière n'a rien d'abstrait: elle est inscrite dans la structure même d'un fichier BASE, dont les deux parties parlent chacune à un monde différent.

- L'**en-tête structuré** d'une ressource (le frontmatter: identité, périmètre, sensibilité, drapeau `confidential`) peut être lu par du **code testé**. Le broker s'en sert, sur les chemins médiés, pour décider et pour appliquer: confiner un accès, retenir une donnée confidentielle, médier une écriture. La politique `egress: local-only` porte sur toute une racine et réside dans `base.config.json`, non dans le frontmatter d'une ressource. Ces propriétés sont des **mécanismes** dans leur périmètre.
- Le **corps en texte** (la méthode, le savoir-faire, les instructions métier) est lu par l'**IA**. Il oriente un modèle coopératif, sans rien contraindre. C'est le monde des **consignes**, utiles et faillibles.

Ainsi le même fichier relie votre expertise au code. Une métadonnée n'est toutefois pas un mécanisme par sa seule présence: elle le devient pour une propriété précise lorsque du code testé l'applique dans un périmètre nommé.

## Tableau des propriétés

| Propriété | Périmètre du mécanisme | Hors de ce périmètre |
| --- | --- | --- |
| **Confinement des chemins et refus d'échappement par lien symbolique** (`tools/core/confine.mjs`) | Quand la lecture ou l'écriture passe par le broker: tout chemin hors de la racine autorisée est refusé, de même qu'une résolution de lien symbolique qui sortirait de cette racine. | Quand le modèle lit ou écrit via un outil direct du harness, hors du broker: le confinement reste une intention, rien n'empêche l'accès. |
| **Propose puis commit, écritures médiées et atomiques** | Quand l'écriture passe par le broker: la modification est d'abord proposée, puis validée, puis appliquée de façon atomique et médiée, ce qui ménage une revue avant tout effet. | Quand l'écriture emprunte un outil direct: elle est immédiate et non médiée, sans étape de proposition ni atomicité garantie par BASE. |
| **Exécution des capacités en dry-run par défaut** | Quand une capacité est exécutée par le broker: elle est simulée par défaut, et son effet réel suppose une demande explicite. | Quand le modèle déclenche une action équivalente hors broker: rien n'impose le dry-run, l'effet peut être immédiat. |
| **Routage et abstention** | Le chemin normal d'un modèle consiste à lire la carte et à décider ou s'abstenir: cette conduite reste une consigne. Le routeur lexical fournit, aux appels sans modèle et aux tests, un plancher déterministe qui peut renvoyer `out_of_scope`, `ambiguous` ou `needs_clarification`; ce comportement est appliqué par du code et protégé par des tests. | Un modèle peut mal lire la carte ou deviner. Le résultat lexical n'est qu'une indication à vérifier lorsqu'un modèle est présent. |
| **Contrôle d'égress avant l'appel** | Le serveur MCP, le chat du Studio et l'évaluation transmettent un contexte d'égress au broker. La Voie 2 livrée applique en plus sa barrière de stratégie quel que soit l'appelant, y compris `base route`: face à des modèles distants, une racine `local-only` reste sur le plancher lexical et les ressources `confidential` sont retirées des candidats qui pourraient atteindre le raffineur. | Une lecture directe, `base open` sans contexte d'égress ou un copier-coller vers un outil IA ne passe pas par ces contrôles. La politique par défaut reste permissive pour le reste. |
| **MCP en lecture seule par défaut sur HTTP** (option jeton bearer) | Sur le transport HTTP, les outils d'écriture et d'exécution ne sont pas enregistrés par défaut. Le transport local `stdio` expose les écritures médiées `propose` puis `commit`, sauf activation du mode lecture seule. | Un autre serveur ou un accès direct n'hérite pas de ces règles. Sur `stdio`, «par défaut» ne signifie pas lecture seule. |
| **Stockage des noms de variables d'environnement, pas des clés brutes** | Quand les réglages passent par le broker: ils enregistrent le NOM de la variable d'environnement, non la valeur de la clé API, qui reste hors du fichier. | Quand le modèle écrit une configuration par un autre moyen: rien n'empêche d'y inscrire une clé en clair. |
| **Journal de trace local** (`.ai/trace`) | Les points instrumentés tentent d'écrire localement une trace qui peut contenir des chemins et des identifiants, mais aucun contenu métier par défaut. L'écriture est best-effort et son échec n'interrompt pas le travail. | Le journal est non exhaustif: une action hors broker, un point non instrumenté ou un échec d'écriture peut ne laisser aucune ligne. Son absence ne prouve donc pas qu'aucune action n'a eu lieu. |

## Note de clôture

Hors du chemin du broker, ses contrôles retombent au niveau natif du harness. Les métadonnées et les consignes gardent leur utilité de guide et de signal pour un modèle coopératif, mais un accès direct au shell, au système de fichiers ou à une API externe échappe à ces contrôles. La table complète garantie → fonction → test est dans [Mécanismes vérifiés](mecanismes-verifies.md). Deux précisions de mesure: le journal de **session** (`.ai/journal/`, écrit par l'agent en fin de process) est une consigne, utile et faillible, distincte de la trace opérationnelle best-effort ci-dessus; et la **présence** d'une consigne sur les surfaces projetées est gelée par des tests, tandis que l'**obéissance** du modèle reste une consigne suivie avec une marge d'erreur, et n'est mesurée aujourd'hui que pour le routage.

Rappel de portée: BASE n'est ni un runtime d'agents, ni un moteur d'orchestration, ni un dispositif de RAG, ni une plateforme, ni un système IAM, DLP, SIEM, RBAC, ni un mécanisme de rétention ou d'archivage légal. Il ne garantit pas davantage l'exactitude des sorties d'un modèle. Le choix du modèle lui-même demeure externe à BASE.

Cette page est informative: elle ne constitue ni une certification de conformité, ni un avis juridique ou de sécurité. Une institution reste responsable de sa propre analyse d'impact (DPIA) et de sa politique de sécurité.
