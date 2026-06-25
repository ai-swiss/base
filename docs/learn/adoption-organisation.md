---
title: L'adoption dans une organisation
description: Une organisation adopte l'IA quand deux mouvements de sens contraire se rencontrent: l'appropriation qui monte du terrain et les flux assistés qui descendent par le haut.
keywords: [adoption, appropriation, process d'équipe, flux assistés, gouvernance, super-utilisateur, promotion, remontée, deux moteurs, rôle de l'IT, outils]
---

# L'adoption dans une organisation

L'IA ne s'installe pas dans une organisation comme un logiciel: par décret, d'un coup, pour tout le monde. Une organisation peut cocher toutes les cases techniques et n'obtenir, six mois plus tard, qu'une poignée d'usages isolés que personne ne partage. L'adoption qui tient repose sur deux mouvements de sens contraire, et sur leur rencontre. Par le bas, des personnes s'approprient le dialogue avec l'IA et structurent leur travail à leur façon. Par le haut, l'organisation rend disponibles, assistés par l'IA, les quelques flux qui bloquent tout le monde. Le premier moteur fait remonter ce qui marche; le second fait descendre ce qui est commun.

L'adoption se lit à trois paliers: la personne qui s'approprie, l'équipe qui promeut un usage éprouvé en process partagé, l'institution qui ouvre les flux que chacun subit. Chaque palier a son geste, son rituel et sa gouvernance. Les pages liées en donnent les gestes: les pratiques individuelles dans [La co-pensée en pratique](./pratiques-co-pensee.md), la vie d'une expertise une fois promue dans [Faire vivre une expertise après le déploiement](./cycle-de-vie-expertise.md), les conditions de mise en route dans les kits [PME suisse](../audiences/kit-demarrage-pme-suisse.md) et [organisation](../audiences/kit-enterprise.md).

## L'autre extrême, et ce qu'il enferme

Face à l'IA, beaucoup d'organisations prennent l'extrême inverse: une grande plateforme centrale, un parc de licences déployé d'en haut, un catalogue d'outils imposés, des tableaux de bord de productivité, une cellule qui pilote tout. C'est rassurant, parfois efficace vite, et cela produit de vrais gains. Le prix se voit plus tard: la méthode finit enfermée dans la plateforme et dans le fournisseur, et la façon de travailler avec l'IA est traitée comme une chose à industrialiser au centre, pas comme une chose que chacun comprend et possède. Le jour où l'outil change, ou le contrat, ou le fournisseur, il reste des tableaux de bord et peu d'expertise transmissible.

BASE prend l'autre voie, et c'est tout l'objet de cette page: faire monter l'adoption par les gens, garder le savoir-faire dans des fichiers que vous possédez, n'industrialiser par le haut que le peu qui le mérite. Les deux ne s'excluent pas toujours, mais elles ne logent pas la valeur au même endroit: dans la plateforme d'un côté, dans l'articulation possédée de l'autre.

## Le rôle de l'IT: accès, couche et outils

Avant tout palier, l'IT pose le socle: trois décisions le conditionnent.

La première est l'**accès autorisé** à un ou plusieurs modèles. Le choix se pèse sur la balance bénéfice-risque propre à l'organisation: ce que les modèles font gagner, contre ce qu'ils exposent en confidentialité, en souveraineté des données, en perception interne et auprès des clients. Il relève de la direction et de la conformité, pas de la personne qui ouvrira l'outil le lendemain. Les modèles souverains et locaux entrent ici dans la balance (voir [Modèles souverains et locaux](../guides/modeles-souverains.md)), tout comme le cadre légal de l'organisation, nLPD, RGPD, obligations sectorielles, rappelé dans le [kit PME suisse](../audiences/kit-demarrage-pme-suisse.md).

La seconde est la **couche légère** posée par-dessus: un ou plusieurs outils, selon ce qui est faisable chez vous, qui donnent au minimum la capacité de lire et d'écrire des fichiers. C'est le seuil. En deçà, l'IA reste une boîte de dialogue sans mémoire; au-delà, chacun structure librement ses interactions, garde ses fichiers métier sous la main, et fait grandir une pratique au lieu de répéter des prompts. Les modes de déploiement de cette couche sont décrits dans le [kit organisation](../audiences/kit-enterprise.md).

La troisième, la plus souvent négligée, ce sont les **bons outils**. Un modèle génératif ne sait pas, seul, calculer un indicateur métier, interroger la bonne table d'une base, ni appeler un service de prédiction: ces capacités n'arrivent pas avec l'accès au modèle. Il faut les lui fournir comme des outils qu'il déclenche à votre place, puis exploite dans la conversation: un algorithme déterministe, une requête vers les bonnes tables, un appel d'API, que quelqu'un a écrits. C'est le cœur du rôle de l'IT, au-delà de l'accès et de la couche: outiller les flux qui le demandent, et d'abord comprendre quel calcul il faut faire.

D'où un malentendu fréquent, et coûteux: croire qu'il suffit de nettoyer sa base de données et de la brancher sur l'IA. Nettoyer une base et la relier à un modèle donne accès à l'information, pas à l'information *pertinente*. On ne dit pas à un modèle «débrouille-toi avec ma base pour en sortir des insights»: pour un indicateur, il faut avoir établi en amont quelles tables croiser et quel calcul mener, puis confier ce calcul à un algorithme. Cette analyse se mène volontiers avec l'IA, mais elle se mène: trouver le bon algorithme a un coût, même avec les modèles les plus puissants. Au fond, aucun calcul n'est gratuit, ni en théorie de la complexité ni en physique.

L'erreur courante est d'attendre l'outillage parfait avant d'ouvrir l'accès. La pratique précède l'outil: donnez le seuil, laissez l'appropriation faire son travail, et outillez les flux à mesure qu'ils se révèlent.

## Palier 1: la personne s'approprie

Le moteur premier de l'adoption, et le plus important, est l'appropriation personnelle. Chacun structure à sa façon le dialogue humain-IA, sur ses propres tâches, à son propre rythme, et c'est cette variété qui fait la différence, pas un défaut à normaliser. Une organisation qui cherche d'emblée le processus unique éteint le moteur avant qu'il démarre. C'est là que naît l'intuition de vérification, celle sans laquelle aucun flux assisté ne sera relu sérieusement plus tard.

**Le geste.** Une personne prend une tâche qu'elle connaît, l'aborde avec l'IA, et garde la main: elle vérifie contre sa réalité, signale ses hypothèses, itère plutôt que de chercher le prompt parfait. La [co-pensée en pratique](./pratiques-co-pensee.md) décrit cette boucle et les cinq pratiques qui la rendent légère; rien à dupliquer ici, sinon le constat qu'une organisation entière repose d'abord sur des individus qui la tiennent.

**Le rituel.** À ce palier, il est personnel: garder trace de ce qui a marché. Une interaction qui a bien tourné se note, se reprend, se raffine. Une pratique se sédimente ainsi en quelque chose de transmissible, première candidate à la remontée.

**La gouvernance.** Minimale, et portant sur les données, pas sur la méthode. La personne sait ce qu'elle a le droit d'entrer dans l'outil, et ce qu'elle n'entre pas: la règle des données autorisées du [kit PME suisse](../audiences/kit-demarrage-pme-suisse.md) suffit. La liberté de structurer reste entière, c'est le but.

## Palier 2: l'équipe promeut un process

Une pratique individuelle qui reste individuelle se perd avec la personne. Le deuxième palier fait remonter ce qui marche: c'est la condition pour qu'une bonne interaction devienne un acquis collectif plutôt qu'un coup de chance répété. L'information doit remonter.

**Le geste.** Faire remonter, puis promouvoir. Les personnes les plus à l'aise, les super-utilisateurs, partagent leurs interactions intéressantes: non pas «l'IA, c'est bien», mais «voici comment j'ai obtenu ce résultat, sur cette tâche, avec ce cadrage». Les meilleures sont promues en **process d'équipe**. Une promotion n'est pas une mise en commun de fichiers, c'est un changement de statut: un Markdown lisible que chacun reprend, et non une recette qui vit dans une messagerie.

**Le rituel.** Un rendez-vous régulier, chaque semaine ou chaque quinzaine, où ces interactions remontent et se discutent, et où l'équipe tranche ce qui mérite d'être promu. Promouvoir trop tôt fige une intuition encore floue; trop tard laisse l'organisation réinventer ce qu'une personne sait déjà. Le rituel mensuel d'entretien du [kit PME suisse](../audiences/kit-demarrage-pme-suisse.md) en est la version outillée: il relève les ressources personnelles à promouvoir, les marqueurs qui vieillissent, les workflows qui ne correspondent plus à la pratique.

**La gouvernance.** Un process promu cesse d'être sans maître. Il reçoit un responsable, le plus souvent son propriétaire d'origine, qui le fait évoluer; et un versionnage, qui rend ses changements visibles et discutables. La règle tient: l'IA propose, la personne responsable signe. C'est ici que commence vraiment le [cycle de vie d'une expertise](./cycle-de-vie-expertise.md): un usage qui dérape se consigne en une phrase, et un process promu se corrige plutôt que de pourrir en silence.

## Palier 3: l'institution ouvre par le haut

Les deux premiers paliers montent depuis le terrain. Le troisième descend. Certains flux ne dépendent pas de l'appropriation: une demande d'achat, l'accueil d'un nouveau collaborateur, une vérification de conformité que tout le monde redoute. Ils bloquent chacun de la même façon, et attendre qu'un super-utilisateur les résolve par le bas serait une perte de temps collective. L'institution les identifie et les rend disponibles comme **flux assistés par l'IA**.

**Le geste.** Rendre un flux disponible, au juste niveau d'assistance. Quand le résultat se vérifie automatiquement, par un algorithme dédié qui donne la garantie qu'un modèle ne peut pas donner seul, le flux peut devenir entièrement automatique. Le plus souvent, il garde le juste niveau de friction dans l'interaction humain-IA: assez pour qu'une personne reste responsable de la sortie, pas trop pour ne pas reproduire le blocage qu'on voulait lever. Le bon niveau de friction est le sujet, pas l'automatisation maximale.

**Le rituel.** L'évaluation à l'échelle. Les flux institués sont ceux qu'on tient sous surveillance: un harness les évalue sur la surface réelle, un juge indépendant note, et ce qui se déprécie se signale. Le [cycle de vie d'une expertise](./cycle-de-vie-expertise.md) décrit ce dispositif, qui prend toute sa valeur précisément quand quelques process sont promus et institutionnalisés.

**La gouvernance.** Ici, elle devient formelle. L'institution applique ce que les deux premiers paliers ne portent pas: droits d'accès, classification, audit, rétention, revue de conformité. BASE fournit une médiation honnête des actions sensibles, confinement, gate d'écriture, gouvernance de chaque sortie vers un modèle, branchable sans céder le savoir-faire, mais il ne remplace ni IAM, ni SSO, ni RBAC, ni DLP, ni SIEM. Le [kit organisation](../audiences/kit-enterprise.md) détaille la configuration stricte et les modes de déploiement qui rendent ces flux opposables.

## Là où les deux moteurs se rencontrent

Les deux moteurs ne fonctionnent pas l'un sans l'autre. Par le bas, l'appropriation produit des pratiques que personne n'aurait dictées d'avance; sans elle, les flux institués restent des coquilles que personne ne s'approprie. Par le haut, les flux assistés lèvent les blocages communs et donnent un cadre; sans eux, l'appropriation reste un archipel d'usages personnels qui ne fait jamais organisation.

Ils se rencontrent au palier de l'équipe. C'est là qu'une pratique individuelle devient un process partagé, et là qu'un flux institué redescend pour être éprouvé sur le travail réel. La descente impose une discipline que la remontée ne réclame pas: une pratique personnelle n'engage que son auteur; un flux institutionnel engage tous ceux qui s'y fient. Peu de flux descendent, et ceux qui descendent restent sous surveillance. Une [friction](./cycle-de-vie-expertise.md) signalée sur un flux commun, c'est le moteur du bas qui corrige le moteur du haut.

Dans le temps, rien de tout cela ne s'installe d'un coup. On commence presque toujours par quelques essais isolés; l'usage se répand le jour où des personnes se l'approprient vraiment; et seule une poignée de flux finit tenue à l'échelle. C'est une pente, pas un escalier: les étapes se chevauchent, on en saute, on revient en arrière. Les repérer aide à savoir où l'on en est, à condition de ne pas en faire une marche obligée, identique pour tous.

La même unité circule dans les deux sens: un Markdown lisible que des gens écrivent, jugent, possèdent et versionnent, dont quelqu'un répond. L'adoption tient quand les trois paliers tournent ensemble: des personnes qui s'approprient, des équipes qui promeuvent, une institution qui ouvre et tient sous surveillance. Aucun ne suffit seul, et tous reposent sur le même socle, un accès autorisé, de quoi structurer et les bons outils, et sur la même règle, à chaque palier: l'IA propose, une personne signe.
