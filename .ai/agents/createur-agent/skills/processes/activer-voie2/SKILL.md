---
schema_version: base.resource.v1
id: activer-voie2
type: process
title: Activer la Voie 2 (routage par embeddings)
scope: team
status: active
sensitivity: internal
name: activer-voie2
description: "Accompagner l'utilisateur pour activer la Voie 2 du routage de BASE: installer Ollama, télécharger un modèle d'embedding et un petit modèle raffineur, puis renseigner les deux modèles dans les Réglages du Studio. Utiliser quand un BASE devient grand et que la Voie 1 ne suffit plus."
use_when: Quand l'utilisateur veut activer la Voie 2, brancher des embeddings et un raffineur Ollama, ou affiner le choix de process sur un grand catalogue.
routing:
  examples:
    - Activer la Voie 2 avec des embeddings Ollama
    - Brancher des embeddings et un raffineur Ollama sur le choix de process
    - Installer Ollama pour mieux choisir parmi beaucoup de process
    - Mon catalogue est grand, affiner le choix avec un modèle d'embedding
    - Configurer le modèle d'embedding et le raffineur Ollama
  avoid_when:
    - Brancher le serveur MCP, route_request ou la CLI base route.
    - Créer un nouvel assistant métier de zéro.
    - Auditer ou nettoyer un BASE existant.
argument-hint: "[taille du BASE, et si Ollama est déjà installé]"
user-invocable: true
allowed-tools: Read Bash
---

# Activer la Voie 2 (routage par embeddings)

BASE route de deux façons, et l'utilisateur choisit par la configuration.

- **Voie 1 (défaut, déjà active).** L'assistant lit l'index généré et choisit; un plancher déterministe par mots-clés sert de filet. Aucun modèle, rien à installer. Pour la plupart des BASE, elle suffit largement.
- **Voie 2 (optionnelle, pour l'échelle).** Quand le catalogue de process devient grand, les embeddings retrouvent les quelques candidats les plus proches de la demande, puis un petit modèle les lit et tranche (il choisit, ou demande une précision). Tout en local, souverain, sans clé d'API.

Ce process accompagne quelqu'un qui veut activer la Voie 2. La promesse: c'est essentiellement **«juste Ollama»**, installer l'application, télécharger deux modèles, renseigner les deux dans les Réglages. La Voie 2 s'allume seulement quand **les deux** modèles sont renseignés; un seul ne fait rien.

> Note durable: ce process est une consigne suivie par le modèle, pas un script figé. **Il ne fige aucune version, aucun nom de modèle exact, aucune commande d'installation**, parce que l'écosystème Ollama bouge. À chaque étape technique, tu **consultes la documentation officielle courante** (installation, modèles recommandés) au moment où tu agis, puis tu proposes ce qui est juste aujourd'hui. Les noms de modèles cités plus bas sont des **exemples illustratifs**, pas une prescription.

## Pourquoi c'est utile (à expliquer simplement)

> «Aujourd'hui, l'assistant choisit le bon savoir-faire en lisant la liste de vos process. Tant qu'ils sont peu nombreux, ça marche très bien. Quand ils se comptent par dizaines ou centaines, on peut aider: un petit modèle local retrouve d'abord les quelques candidats les plus proches de votre demande, puis tranche. Tout reste sur votre machine, rien ne part dans le nuage.»

## D'abord: en avez-vous besoin?

Ne vends pas la Voie 2. Aide à décider, honnêtement.

- **Petit ou moyen BASE** (quelques agents, quelques dizaines de process au plus) → la **Voie 1 suffit**. Dis-le clairement: activer la Voie 2 ajouterait une installation pour un gain nul ou marginal.
- **Grand BASE** (beaucoup de process, ou un routage qui se trompe parce que la liste est trop longue à départager par mots-clés) → la Voie 2 vaut la peine.

> «Pour vous situer: combien de process environ, et avez-vous l'impression que le routage se trompe parce qu'il y en a trop? Si c'est un petit ensemble, je vous déconseille d'installer quoi que ce soit, la Voie 1 fera mieux le travail.»

← Reformulation (confirmer que le besoin est réel avant d'installer)

## Inputs

Demande à l'utilisateur, une question à la fois:

- **Ollama est-il déjà installé** sur la machine? (Si l'utilisateur ne sait pas, on vérifie ensemble.)
- **Avez-vous un terminal** à disposition? (Le téléchargement des modèles passe par une commande.)

Si l'utilisateur ne sait pas, propose de regarder ensemble; ne présume rien.

## Étapes

### 1. Installer Ollama

Ollama fait tourner des modèles en local. C'est le seul logiciel à installer.

1. **Consulte la documentation d'installation officielle courante d'Ollama** (le site officiel) pour la plateforme de l'utilisateur (macOS, Windows, Linux). Ne récite pas une commande de mémoire: ouvre la page d'installation à jour et suis-la.
2. Propose la voie la plus simple pour cette plateforme (souvent l'application à télécharger, ou la commande officielle d'installation telle qu'elle est documentée **aujourd'hui**).
3. **Vérifie qu'Ollama répond** avant d'aller plus loin. Si tu as un terminal, propose d'exécuter une commande de vérification simple (par exemple lister les modèles installés, selon la doc courante); sinon, demande à l'utilisateur de confirmer qu'Ollama tourne.

**⚠ Point de décision, avant d'installer:**
> «Je suis prêt à vous guider sur l'installation d'Ollama, en suivant sa documentation officielle à jour. Je vous montre chaque étape avant. On y va?»

### 2. Choisir et télécharger deux modèles

Il faut deux modèles: un **modèle d'embedding** (étape 1 du routage) et un **petit modèle raffineur** (étape 2).

1. **Consulte les recommandations courantes** pour chaque rôle, plutôt que de figer un nom:
   - Pour l'**embedding**, cherche un modèle d'embedding **multilingue** récent et léger (BASE est francophone, donc le multilingue compte), disponible sur Ollama.
   - Pour le **raffineur**, cherche un **petit** modèle instruct récent, capable de suivre une consigne simple «choisis, ou demande une précision».
2. **Exemples illustratifs, non prescriptifs** (à vérifier et adapter, ils peuvent avoir changé): un embedding multilingue léger de la famille `qwen3-embedding` (petite taille), et un petit raffineur de la famille `qwen3`. Propose-les comme point de départ raisonnable, pas comme une obligation; l'utilisateur reste libre de choisir les siens (par exemple un autre embedding à contexte long, ou un raffineur d'une autre famille).
3. **Télécharge les deux** avec la commande de téléchargement d'Ollama (consulte la doc pour la forme exacte de la commande et le nom de balise courant de chaque modèle). Si tu as un terminal, propose d'exécuter, en montrant chaque commande d'abord; sinon, donne les commandes à l'utilisateur.

> «Pour le rôle d'embedding et le rôle de raffineur, voici deux modèles locaux légers qui conviennent bien aujourd'hui. Je vérifie qu'ils sont toujours recommandés, je vous montre les commandes de téléchargement, et vous restez libre d'en choisir d'autres.»

### 3. Renseigner les deux modèles dans les Réglages

Une fois les modèles téléchargés, ils se déclarent dans les Réglages du Studio.

1. **Ajouter le fournisseur Ollama** dans les Réglages, s'il n'y est pas déjà (Ollama, local, aucune clé requise).
2. Dans la section **«Routage / Voie 2»** des Réglages, renseigner:
   - le **modèle d'embedding** (étape 1);
   - le **modèle raffineur** (étape 2);
   - le **nombre de candidats** que voit le raffineur (laisser la valeur par défaut convient; c'est un compte, pas un seuil à régler).
3. **La règle tout-ou-rien:** la Voie 2 ne s'active que lorsque **les deux** modèles sont renseignés. Un seul ne fait rien, et BASE reste sur la Voie 1.

Variante sans Studio: les mêmes valeurs vivent dans le bloc `routing` du fichier `.ai/studio.settings.json` (`embedding_model`, `refiner_model`, et `k` optionnel). Le serveur valide la règle tout-ou-rien à l'écriture.

> «Vos deux modèles sont prêts. Dans les Réglages, section Routage, je renseigne l'embedding et le raffineur. Dès que les deux y sont, la Voie 2 s'active; tant qu'il en manque un, on reste sur la Voie 1.»

### 4. Vérifier ensemble

Propose une vraie demande de l'utilisateur et montre où elle route, pour confirmer que la Voie 2 répond. Si elle échoue (modèle injoignable, par exemple), rappelle que BASE **retombe sur la Voie 1** automatiquement: jamais de blocage, jamais de silence.

> «Essayons avec une vraie demande: … → voici où ça route. Et si un jour un modèle ne répond pas, BASE repasse tout seul sur la Voie 1.»

### 5. Si c'est trop technique

Sois honnête, jamais culpabilisant:

> «Cette étape touche à l'installation, c'est normal qu'elle soit moins évidente. Deux options: on la fait ensemble pas à pas, ou vous demandez à une personne à l'aise avec un terminal. Et rappelez-vous: la Voie 1 fonctionne déjà très bien, la Voie 2 est un confort pour les grands catalogues, pas une obligation.»

### 6. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`: besoin confirmé ou non, modèles choisis (rôle, pas seulement le nom), état (activé / à finir), prochaine étape.

## Ce que tu ne fais jamais dans ce process

- **Figer une version, une balise de modèle ou une commande d'installation.** Tu consultes la documentation officielle courante au moment d'agir, et tu adaptes. Les noms cités ici sont des exemples, pas une prescription.
- **Installer ou modifier une configuration sans montrer et faire valider** chaque commande d'abord.
- **Pousser la Voie 2 quand elle n'est pas utile.** Pour un petit BASE, tu recommandes la Voie 1 et tu n'installes rien.
- **Imposer un modèle.** Tu proposes un point de départ raisonnable, l'utilisateur reste libre de choisir le sien.
- **Promettre une infaillibilité.** La Voie 2 améliore le rappel sur un grand catalogue; elle reste bornée par le mécanisme, et retombe sur la Voie 1 en cas d'échec.
- **Présenter la Voie 2 comme un étage de la Voie 1.** Ce sont deux voies indépendantes; la configuration en choisit une.
