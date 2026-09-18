---
schema_version: base.resource.v1
id: modele-de-calcul-oriente-par-l-intention
type: document
title: Le modèle de calcul orienté par l'intention
description: "Les dimensions qui déterminent l'organisation d'un calcul orienté par une intention, au-delà du choix entre un ou plusieurs agents."
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [intention, calcul, topologie, complexite, dependances, parallelisme, interaction, verification]
audience: [builder, researcher, decision-maker]
learning_level: advanced
---

# Le modèle de calcul orienté par l'intention

Cette page expose le cadre conceptuel qui sous-tend [Au-delà des agents](../learn/au-dela-des-agents.md). Elle ne décrit ni une capacité actuelle de BASE ni une feuille de route produit. <!-- [STATUSLESS-OK: la page récuse une feuille de route, elle n'en annonce pas] --> Elle propose un langage commun pour raisonner sur l'organisation du calcul sans prendre l'agent pour unité fondamentale.

Une **intention** réunit l'objectif à satisfaire, les contraintes qui s'y appliquent, l'état à partir duquel agir et les critères qui permettent d'évaluer le résultat. Un prompt peut l'exprimer sans nécessairement en contenir tous les éléments.

## L'objet: un calcul qui construit sa propre forme

Une intention déclenche des opérations: trouver une source, lire, calculer, comparer, écrire, vérifier ou demander une décision. Certaines sont connues d'avance. D'autres ne deviennent nécessaires qu'après une découverte. Les résultats intermédiaires, par exemple un fait extrait, un total ou une hypothèse, rejoignent alors l'état du travail.

Nous appelons **topologie de calcul** l'organisation de ces opérations et de leurs dépendances. Le travail peut rester dans un même fil, se répartir entre plusieurs exécutions ou réunir des résultats produits séparément. Cette organisation n'est pas toujours déterminable avant de commencer, car l'information pertinente et ses relations peuvent se révéler pendant le travail.

## Les dimensions du problème

Le choix entre un et plusieurs agents ne décrit qu'une configuration d'exécution. L'organisation pertinente dépend de plusieurs dimensions distinctes:

- la **difficulté intrinsèque** de ce qu'il faut établir ou produire, compte tenu des méthodes disponibles. Répartir le travail ne rend pas simple un raisonnement difficile et ne raccourcit pas une chaîne d'étapes qui dépendent nécessairement les unes des autres;
- le **volume et l'accessibilité de l'information**: quantité à lire, coût des recherches, disponibilité des sources et appels d'outils nécessaires;
- la **structure des dépendances**: ce qui peut être traité séparément, ce qui doit être rapproché et ce qu'une découverte peut remettre en cause ailleurs;
- le **potentiel de parallélisme**: la part du travail qui peut réellement avancer en même temps, avec les ressources disponibles;
- le **mouvement d'information**: ce qu'il faut transmettre, résumer ou relire lorsque le calcul franchit une frontière entre contextes, outils ou exécutions;
- la **mémoire de travail**: l'état qui doit rester conjointement accessible pour préserver les relations importantes;
- l'**exigence de qualité**: précision attendue, tolérance à l'erreur, coût de la vérification et responsabilité attachée au résultat;
- les **conditions d'exécution**: modèles, outils, latence, coût, confidentialité et capacité à coordonner plusieurs travaux sans perdre leur provenance.

Ces dimensions ne se réduisent pas à un score universel. Elles interagissent. Une séparation peut réduire le délai tout en augmentant le travail total, les échanges et la vérification. Un résumé peut libérer de la mémoire tout en supprimant un détail qui deviendra décisif. Une architecture efficace dans un environnement peut cesser de l'être avec un autre modèle, un autre outil ou une autre exigence de preuve.

Le volume, notamment, ne suffit pas à caractériser une tâche. Cinq cents factures représentent beaucoup de lecture, mais chaque lot peut rendre un sous-total facile à réunir. Une décision de renouvellement mobilise moins de documents, mais une clause, un incident et une promesse peuvent devoir être interprétés ensemble. La première demande est volumineuse et séparable. La seconde est plus petite, mais fortement couplée.

## Les agents ne sont pas l'unité fondamentale

Une équipe permanente, par exemple juridique, finance, clientèle et support, inscrit une partition avant de connaître la demande. Cette partition peut être excellente lorsque les interfaces sont stables et explicites. Elle devient fragile lorsque la pertinence traverse les domaines d'une manière que seule l'exécution révèle.

La limite porte sur le découpage par personnages ou domaines. Lorsque des parties sont suffisamment indépendantes et rendent des résultats compacts, plusieurs exécutions peuvent avancer utilement. Lorsque leurs conclusions se modifient mutuellement, la séparation impose des transmissions, des relectures et des réconciliations. Le nombre d'agents ne dit rien, à lui seul, de cet arbitrage.

Un fil unique et une équipe fixe sont deux organisations possibles parmi d'autres. Un harnais plus général pourrait conserver un fil commun, ouvrir plusieurs travaux lorsqu'une séparation utile apparaît, puis réunir ce qui doit être apprécié ensemble. Il pourrait aussi explorer plusieurs hypothèses, traiter des données par lots ou confier une vérification indépendante. L'organisation suivrait alors la structure du problème telle qu'elle se révèle, plutôt qu'un organigramme arrêté avant la demande.

## La dépendance ne disparaît pas: son coût se déplace

Lorsque deux informations doivent être rapprochées, ce rapprochement se paie quelque part. Il peut être encodé avant la demande dans un lien, un index ou une procédure. Il peut être retrouvé pendant la demande par la recherche et la lecture. Il peut enfin être porté dans un contexte commun ou transmis entre plusieurs exécutions. Une architecture ne supprime pas ce coût; elle choisit où et quand l'assumer.

BASE privilégie la première voie chaque fois qu'une relation mérite de durer: un sommaire indique où chercher, une fiche signale une exception, une clause renvoie à l'incident qui l'éclaire, un calcul validé conserve sa date et ses sources. Cette structure est un capital de calcul autant qu'une documentation. Elle évite de redécouvrir à chaque demande ce qui a déjà été compris une fois.

Elle doit toutefois rester révisable. Aucun résumé ne peut garantir qu'il conservera tout ce qu'une intention future rendra pertinent. Une synthèse utile doit donc rester reliée à ses sources; un résultat dérivé doit garder sa provenance; une nouvelle exception peut imposer une relecture. La bonne abstraction réduit l'état actif sans prétendre abolir l'information dont elle procède.

## Plusieurs formes d'organisation

Répartir un calcul peut répondre à des besoins différents:

- **décomposer** des sous-problèmes suffisamment indépendants;
- **traiter par lots** un grand volume sous une règle commune, puis agréger des résultats compacts;
- **explorer** plusieurs hypothèses lorsqu'elles sont incertaines et que leur vérification permet de les départager;
- **vérifier** un résultat par une lecture ou une méthode indépendante;
- **recomposer** des travaux dont les dépendances exigent finalement une appréciation commune.

Ces formes ne sont pas interchangeables. Dupliquer une même question peut diversifier une recherche, mais augmente le travail total. Traiter des lots accélère une agrégation, mais n'aide pas un raisonnement indivisible. Une vérification indépendante renforce parfois la confiance, mais ne corrige pas une source fausse partagée par toutes les exécutions. Rester intégré est souvent le bon choix lorsque les étapes sont séquentielles ou fortement dépendantes.

## Une adaptation nécessairement imparfaite

Choisir l'organisation du calcul consomme lui-même du temps et des ressources. Le système décide avec une connaissance incomplète: il ignore parfois quelles sources seront utiles, quelles dépendances apparaîtront et si une séparation fera réellement gagner du temps. Changer d'organisation peut en outre imposer de transmettre l'état, de répéter une lecture ou de réconcilier des conclusions.

Il n'existe donc pas de stratégie adaptative qui soit toujours meilleure. L'enjeu est plus modeste: éviter d'imposer la même forme à toutes les demandes et rendre possibles plusieurs formes d'exécution lorsque leur coût est justifié.

## Statut de la proposition

Ce cadre articule des questions étudiées séparément par les algorithmes parallèles, la complexité de communication, les modèles de mémoire et d'entrées-sorties, ainsi que le métaraisonnement. Il ne constitue pas encore une théorie unifiée des harnais d'IA.

L'hypothèse à éprouver est que la structure observable d'une tâche, ses dépendances, son état actif, ses possibilités de séparation et ses exigences de vérification, aide davantage à choisir une organisation efficace que le nombre ou l'identité déclarée des agents. Cette hypothèse demande des mesures et des expériences comparatives. Elle ne doit pas être présentée comme une capacité acquise de BASE.

### Ancrages théoriques

- Richard P. Brent, «The Parallel Evaluation of General Arithmetic Expressions», *Journal of the ACM*, 1974: travail, profondeur et accélération parallèle.
- Eyal Kushilevitz et Noam Nisan, *Communication Complexity*, Cambridge University Press, 1997: information nécessaire entre parties séparées d'un calcul.
- Jia-Wei Hong et H. T. Kung, «I/O Complexity: The Red-Blue Pebble Game», *STOC*, 1981: déplacement et conservation des états intermédiaires.
- Stuart Russell et Eric Wefald, *Do the Right Thing: Studies in Limited Rationality*, MIT Press, 1991: coût du raisonnement consacré au choix du prochain calcul.

## Ce que BASE fixe, et ce qu'il laisse ouvert

BASE fixe une couche d'intelligence possédée: les rôles, les process, les connaissances, les sources, les liens et les points de décision sont écrits dans des fichiers lisibles et portables. Les index générés offrent au modèle une carte; le modèle est invité à la parcourir. La CLI et le MCP exposent aussi un routage déterministe, utile comme plancher reproductible. Ces deux registres, consigne au modèle et mécanisme logiciel, ne doivent pas être confondus.

BASE ne planifie pas l'exécution d'une demande. Il ne décide ni d'ouvrir plusieurs travaux, ni de les synchroniser, ni de les réunir. Ces fonctions appartiennent au harnais choisi. Celui-ci peut travailler dans un fil unique ou dans plusieurs exécutions en s'appuyant sur la méthode, la mémoire et l'adressage que BASE rend lisibles.

La conséquence pratique est sobre. Structurez ce qui doit durer. Rendez les sources et leurs relations trouvables. Conservez la provenance des résultats importants. Puis laissez l'intention déterminer, aussi tard que possible, la part du savoir qui doit devenir active et l'organisation du calcul qui la sert.

## Pour aller plus loin

- [Écrire pour le routeur](../guides/ecrire-pour-le-routeur.md): comment formuler ce qui aide l'assistant à trouver le bon process.
- [Pourquoi BASE](../learn/co-penser-avec-lia.md): la structure que vous possédez.
