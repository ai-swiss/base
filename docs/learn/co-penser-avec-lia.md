---
schema_version: base.resource.v1
id: co-penser-avec-lia
type: document
title: Pourquoi BASE
description: Pourquoi posséder la structure de ses interactions avec l'IA et garder une vérification proportionnée au risque.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [co-pensee, souverainete cognitive, interaction humain-IA, methode, verification, structure]
---

# Pourquoi BASE

> **La question n'est pas seulement où tourne le modèle, mais qui structure vos interactions avec lui.**

BASE sépare la couche que vous possédez, vos fichiers, vos façons de faire, vos sources et vos contrôles, de la couche d'exécution, le modèle, l'outil, ses instructions et ses connecteurs. Cette séparation soutient une souveraineté cognitive: pouvoir relire, corriger et emporter l'articulation de son travail avec l'IA.

La souveraineté d'hébergement reste importante, mais elle ne répond pas seule à cette question. [Souveraineté et confiance](../trust/souverainete-et-confiance.md) fixe la frontière des garanties de données et de sécurité.

Posséder cette articulation ne signifie pas tout automatiser ni tout formaliser. Cela signifie choisir ce que l'IA doit savoir pour une tâche, la façon dont elle doit travailler et les décisions qui restent humaines, sans abandonner ces choix à l'interface d'un fournisseur.

## Donner le bon contexte

Un modèle de langage répond à partir de son entraînement et de la fenêtre de contexte fournie à chaque appel. Il ne partage pas spontanément votre mémoire, vos intentions ni vos règles métier. La conséquence pratique n'est pas de tout lui montrer, mais de rendre la bonne information trouvable au bon grain.

Une unité utile doit être assez petite pour être ouverte sans bruit et assez complète pour garder son sens. Une décision nommée, une règle rangée au bon endroit et une source explicitement désignée servent plus longtemps qu'une conversation difficile à retrouver.

Cette mémoire est externe au modèle. Elle peut réunir des matériaux bruts, les notes qui les interprètent et les articulations de travail qui en découlent. La structurer revient à préparer ce dont un collègue aurait besoin pour reprendre le fil, pas à verser tout le dossier dans chaque conversation.

## Entrer par l'intention

BASE offre un point d'entrée fondé sur l'intention dans un ensemble structuré de savoir et de savoir-faire. La personne exprime ce qu'elle cherche à accomplir. Le routage désigne alors l'agent et la façon de faire qui couvrent cette intention, puis les éléments déclarés utiles sont chargés au besoin.

Le corpus n'a donc pas à être prédécoupé en une multitude d'agents supposés représenter tout le travail. Les agents servent de points d'entrée compatibles avec les outils. Le savoir, les façons de faire, les modèles de document et les outils restent des éléments distincts, reliés et mobilisés selon la tâche.

Ce choix préserve le fil du travail. Plusieurs exécutions sont utiles lorsque des parties indépendantes peuvent produire des résultats courts et faciles à réunir. Lorsque chaque découverte change les suivantes, garder un contexte commun évite de transformer la coordination en travail supplémentaire. [Au-delà des agents](au-dela-des-agents.md) développe ce critère.

BASE utilise des fichiers et un routage pour présenter les éléments pertinents. Un accès technique à un dossier ne garantit toutefois ni la pertinence de ce qui est choisi, ni le respect d'une permission: cela dépend du composant qui sélectionne et applique réellement la règle.

## Une méthode de correction

Bien travailler avec l'IA ne repose pas sur une demande parfaite, mais sur une boucle: énoncer le but et les contraintes, obtenir une proposition, l'évaluer contre un contrôle explicite, puis réviser.

Le cadre lui-même est développé par AI Swiss dans le guide public [*Human-AI Co-Thinking in Action*](https://a-i.swiss/guides/co-thinking-in-action). BASE transpose cette pratique dans une structure durable pour le travail.

Trois références servent ici d'analogies de conception, non de preuves de l'efficacité de BASE:

- par analogie avec le canal formalisé par Shannon, un vocabulaire partagé aide à réduire les pertes de sens: C. E. Shannon, [«A Mathematical Theory of Communication»](https://doi.org/10.1002/j.1538-7305.1948.tb01338.x), *Bell System Technical Journal*, 27(3), 1948;
- par analogie avec les objectifs étudiés dans le travail humain, un résultat attendu explicite aide à cadrer l'action et son évaluation: E. A. Locke et G. P. Latham, [*A Theory of Goal Setting & Task Performance*](https://search.worldcat.org/title/20219875), Prentice Hall, 1990;
- par analogie avec la rétroaction en cybernétique, comparer le résultat au but permet de corriger l'écart: N. Wiener, [*Cybernetics: Or Control and Communication in the Animal and the Machine*](https://lccn.loc.gov/48011017), Wiley, 1948.

Ces rapprochements expliquent trois choix, un vocabulaire partagé, des objectifs explicites et des boucles de correction. Leur utilité doit être évaluée sur chaque usage.

[La co-pensée en pratique](pratiques-co-pensee.md) transforme cette boucle en gestes concrets.

## Vérifier sans promettre l'impossible

Une sortie fiable dépend du dispositif qui la produit, pas du modèle seul. Certaines tâches possèdent un vérificateur externe, comme un compilateur, un schéma de données ou un calcul déterministe. D'autres demandent un jugement humain sur les faits, les intentions ou les conséquences. Une seconde réponse du même modèle peut aider à relire, mais n'est pas une preuve indépendante.

La fluidité d'une réponse et la facilité avec laquelle elle a été obtenue ne disent rien de sa justesse. Chaque affirmation acceptée sans examen ajoute une dette de vérification: des hypothèses non contrôlées que quelqu'un devra reprendre plus tard, souvent au moment où l'erreur coûte le plus cher.

La structure peut réduire ce coût en rendant les sources, hypothèses, contrôles et décisions visibles. Elle peut aussi inscrire la vérification dans la façon de faire, par exemple avec un test, une comparaison à une source ou un point de décision. Elle ne garantit pas la vérité. Déléguer du détail ne doit pas faire perdre la compréhension nécessaire pour défendre ce que l'on signe.

La complexité intrinsèque ne disparaît pas avec l'IA. Une tâche qui exige de parcourir de nombreuses sources, de conserver des étapes intermédiaires ou d'appliquer un calcul précis exige toujours l'information, la mémoire de travail et les opérations correspondantes. Un modèle peut déplacer ou réduire une partie de cet effort; il ne peut tirer une donnée absente de ses entrées ni sauter sans risque les dépendances du problème.

## Des frontières lisibles

BASE distingue le savoir-faire suivi comme instruction du savoir consulté comme contenu. Le [glossaire](../reference/glossaire.md) fixe les sens de **skill**, **process** et **compétence**. Cette séparation aide à présenter chaque élément dans son rôle, mais ne constitue pas à elle seule une barrière de sécurité.

Une consigne oriente le modèle. Une garantie tient seulement lorsqu'un composant présent sur le chemin l'applique. [Sécurité et limites](../trust/securite-et-limites.md) décrit cette frontière sans attribuer aux fichiers des pouvoirs qu'ils n'ont pas.

Les décisions et les incertitudes peuvent rester visibles et cherchables dans les fichiers. Le [registre des marqueurs](../reference/marqueurs.md) précise les repères reconnus par BASE.

## Changer d'outil ou de modèle: une portabilité à vérifier {#une-portabilite-a-verifier}

Conserver la référence en Markdown déplace une partie de la valeur du produit du moment vers l'articulation durable du travail. Le contexte, les décisions et les façons de faire peuvent être relus, versionnés et transmis sans dépendre d'une mémoire interne opaque.

Cela évite de réécrire son expertise à chaque changement de fournisseur, mais ne rend pas l'exécution interchangeable. Un autre outil peut demander un adaptateur, de nouvelles permissions, une configuration différente et des tests de non-régression. Un modèle plus puissant ne connaît pas davantage les faits absents de son contexte.

La promesse raisonnable est donc de garder une couche lisible et transférable, puis de vérifier son comportement dans chaque environnement pris en charge.

## Co-penser, pas tout déléguer

Co-penser ne consiste pas à garder une personne dans chaque détail. Il s'agit de calibrer la délégation. Une tâche à faible conséquence et munie d'un contrôle externe peut être largement confiée. Une tâche qui engage des faits incertains, une relation, un droit ou une décision mérite davantage de dialogue et de revue.

Le risque n'est pas seulement l'erreur ponctuelle. Lorsque la production s'accumule plus vite que la compréhension, la vue d'ensemble s'érode et la validation devient un rituel. BASE peut rendre les points de contrôle visibles. La personne reste responsable de choisir où ils sont nécessaires.

## Prochaine action

Choisissez une tâche récurrente et écrivez, sur une page, son but, la source qui fait foi, le contrôle attendu et l'action qui exige votre décision. Si l'un de ces quatre éléments manque, commencez par le clarifier avant d'automatiser.
