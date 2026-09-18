---
schema_version: base.resource.v1
id: adoption-organisation
type: document
title: L'adoption dans une organisation
description: Faire rencontrer l'appropriation du terrain et les flux institutionnels sans enfermer le savoir-faire dans un outil.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [adoption, appropriation, process d'equipe, gouvernance, promotion, outils]
---

# L'adoption dans une organisation

Une adoption durable combine deux mouvements. Le terrain fait remonter les pratiques qui fonctionnent; l'institution rend disponibles les quelques flux communs qui méritent un cadre, des outils et une surveillance. L'équipe est le lieu où ces mouvements se rencontrent.

## Le socle fourni par l'organisation

Avant de généraliser un usage, l'organisation décide:

1. quels modèles et quelles données sont autorisés;
2. quels outils permettent de travailler sur des fichiers et des sources identifiées;
3. quels calculs, connecteurs et contrôles doivent être fournis par l'IT.

Trois responsabilités ne se confondent pas. Le métier **définit l'indicateur**, ses sources et ses règles de calcul. L'IT **implémente ce calcul** dans une requête ou un algorithme testable. Le système d'accès **autorise ou bloque l'opération** au moment de l'exécution. Brancher une base de données à un modèle ne remplit aucune de ces trois responsabilités à lui seul.

La portabilité des fichiers protège la méthode d'un enfermement complet, mais un changement de fournisseur peut demander des adaptateurs, une nouvelle configuration de permissions et des tests. Les critères d'hébergement et de conformité sont détaillés dans les kits [PME suisse](../audiences/kit-demarrage-pme-suisse.md) et [organisation](../audiences/kit-enterprise.md).

## Palier 1: une personne s'approprie

Une personne choisit une tâche qu'elle connaît, cadre le résultat, fournit les sources et vérifie la proposition. Elle garde une trace courte de ce qui a fonctionné et des difficultés rencontrées.

La gouvernance porte d'abord sur les données autorisées. La liberté de structurer le travail permet d'apprendre avant de normaliser. [La co-pensée en pratique](pratiques-co-pensee.md) donne le geste individuel sans le répéter ici.

## Palier 2: promouvoir une pratique individuelle en méthode d'équipe {#palier-2-l-equipe-promeut}

L'équipe examine régulièrement les pratiques éprouvées. Elle promeut celles qui répondent à un besoin récurrent en une façon de faire partagée, lisible et versionnée.

Chaque élément promu reçoit:

- un responsable;
- des sources faisant foi;
- des critères de réussite;
- un moyen de signaler une friction;
- une date ou un événement de revue.

Promouvoir trop tôt fige une intuition. Promouvoir trop tard multiplie les réinventions. Le [cycle de vie d'une expertise](cycle-de-vie-expertise.md) décrit l'entretien après promotion.

## Palier 3: l'institution tient les flux communs

L'institution cible quelques flux qui bloquent de nombreuses personnes ou portent un risque élevé. Elle choisit le niveau d'assistance selon la vérifiabilité de la tâche. Un contrôle externe permet parfois davantage d'automatisation; lorsqu'il n'existe pas, une décision humaine proportionnée au risque demeure nécessaire.

La gouvernance devient formelle: gestion des identités, droits d'accès, classification, rétention, audit et conformité. BASE ne remplace ni IAM, SSO, RBAC, DLP ni SIEM.

Les contrôles BASE d'écriture et d'egress ne s'appliquent qu'aux chemins médiés par le broker ou le serveur MCP qui lui transmettent le contexte requis. Un outil qui accède directement aux fichiers, au shell ou à une API les contourne. Les limites canoniques sont dans [Sécurité et limites](../trust/securite-et-limites.md).

## Faire circuler les corrections

Une pratique du terrain peut devenir commune; un flux institutionnel revient au terrain pour être éprouvé. Les frictions doivent remonter vers le responsable du flux, puis se traduire en modification relue, en nouveau test ou en retrait.

L'organisation n'a pas besoin d'uniformiser toutes les pratiques. Elle doit savoir lesquelles restent personnelles, lesquelles sont partagées et lesquelles engagent l'institution.

## Prochaine action

Choisissez un seul flux récurrent et notez son palier actuel, son responsable, sa source faisant foi, son contrôle et sa prochaine date de revue. Ne le promouvez pas tant qu'un de ces éléments essentiels manque.
