---
schema_version: base.resource.v1
id: quickstart
type: document
title: Façonnez votre premier assistant
description: "Le démarrage rapide: copier un exemple dans un outil IA qui lit vos fichiers, dire ce que vous voulez faire, et valider ce que l'assistant propose. Premier succès en quelques minutes, sans code."
scope: public
status: active
sensitivity: public
keywords: [demarrage, rapide, premier, assistant, copier, exemple, commencer, debuter]
---

# Façonnez votre premier assistant

En quelques minutes, vous confiez à un assistant une tâche que vous répétiez à la main, sans écrire de code: il vous aide à expliciter la méthode, propose les fichiers, puis attend votre validation. Concrètement, vous copiez un exemple dans un outil IA capable de lire vos fichiers et vous décrivez ce que vous voulez faire.

> **Pas encore le dépôt?** Consultez [Obtenir BASE](obtenir-base.md) pour choisir entre ZIP, clone Git, copie d'exemple ou pack navigateur.
>
> **Pas encore d'outil installé?** Consultez le [guide d'installation](installer.md) pour configurer un outil IA capable de lire vos fichiers.
>
> **Vous n'avez qu'un navigateur (ChatGPT, Claude)?** Inutile d'installer quoi que ce soit pour commencer: suivez [Essayer BASE sans rien installer](essayer-sans-installer.md).

Ce démarrage se prête à trois usages:

- pour votre vie privée, en copiant un exemple et en l'adaptant à vos propres tâches;
- pour une start-up ou une PME, en stabilisant un workflow utile avant de l'étendre;
- pour une organisation plus grande, comme démonstration locale avant d'ajouter les contrôles internes nécessaires.

---

## 1. Copiez

Copiez le dossier `exemples/assistant-devis/` dans votre espace de travail (par exemple sur votre Bureau ou dans vos Documents).

> **Vous voulez d'abord voir le résultat?** Ouvrez plutôt `exemples/assistant-devis-demo/` (déjà rempli avec une entreprise fictive) et demandez «Dupont SA a-t-il droit à la remise fidélité?». L'assistant devrait s'appuyer sur vos fichiers, nommer la règle et poser un `[A VALIDER]`. Le parcours exact figure dans [Voir BASE en action](demo-60-secondes.md).

## 2. Ouvrez

| Outil | Comment |
|-------|---------|
| **Cursor** | Fichier → Ouvrir un dossier → sélectionnez le dossier copié |
| **Claude Code** | Lancez `claude` dans le dossier copié |
| **ChatGPT / Claude (navigateur)** | Rien à installer pour essayer: collez le pack d'un exemple ([Essayer sans installer](essayer-sans-installer.md)). Pour connecter vos agents avec les garanties mécaniques, le [serveur MCP](installer-mcp.md) (chemin technique) |

> **Vous préférez un atelier visuel?** Studio est optionnel. Installez Node 18 ou plus, ouvrez un terminal dans le clone du dépôt BASE, puis lancez une fois `npm ci`. Après l'initialisation, lancez `cd mon-dossier && node .ai/base.mjs studio --root .` ([étape 0 du tutoriel](../tutoriel/harnais.md)). Ce lanceur n'installe pas la commande courte `base`. L'atelier montre vos fichiers, vos agents et leurs process. Votre outil IA reste l'expérience du quotidien; Studio n'est qu'un atelier d'appoint.

## 3. Dites ce que vous voulez faire

Par exemple: «Bonjour, je voudrais configurer mon activité». L'assistant vous guide pour configurer votre activité ou votre entreprise: nom, services, prix, conditions. Répondez à ses questions; il propose les fichiers à créer ou à modifier, puis vous validez les décisions importantes.

## 4. Créez votre premier devis

> «J'ai un client, Dupont SA, qui me demande 3 jours de conseil en stratégie.»

L'assistant reformule la demande, la chiffre et vous propose le devis. Vous validez, il génère les fichiers.

## Vous validez, l'assistant écrit ensuite

Deux repères rendent ce contrôle visible:

- **`[A VALIDER]`**: lorsque l'assistant propose quelque chose qui n'est pas encore confirmé (un prix, un devis), il le marque `[A VALIDER]`. Ce marqueur est un repère facile à retrouver d'un coup d'œil, pour vous comme pour vos outils. Tant qu'il est présent, rien n'est figé: c'est à vous de confirmer.
- **L'écriture se fait en deux temps**: après l'initialisation, pour les actions qui passent par le lanceur du dossier (`node .ai/base.mjs propose` puis `node .ai/base.mjs commit`, ou l'équivalent côté MCP), un changement est d'abord *proposé* (un diff vous est montré, rien n'est écrit), puis *appliqué* seulement après votre confirmation. Ce lanceur n'installe pas la commande courte `base`. Hors de ces chemins médiés, l'assistant vous guide mais n'applique pas ce contrôle à votre place.

Concrètement: vous demandez d'ajouter une ligne au devis. L'assistant ne l'écrit pas aussitôt, il vous montre la ligne et le nouveau total; vous dites «oui», et le fichier ne change qu'à ce moment-là. Vous voyez l'effet avant qu'il existe.

Le composant de médiation, appelé broker, applique aussi un contrôle avant les appels distants qui passent par lui, notamment le serveur MCP et le chat de Studio: une ressource marquée confidentielle, ou une racine déclarée `local-only`, n'est pas transmise au modèle par ces chemins. Une lecture directe des fichiers ou un autre chemin d'exécution contourne ce contrôle. Détail: [Ce qui peut sortir, et ce que le broker retient](../trust/frontiere-local-vs-sortant.md).

**Pour aller plus loin:** les [pratiques de la co-pensée](../learn/pratiques-co-pensee.md) montrent, par l'exemple, les façons d'interagir avec l'IA qui ont le plus de valeur.

## 5. Et ensuite?

| Ce que vous voulez | Ce que vous dites ou faites |
|--------------------|----------------------------|
| Un autre devis | «Nouveau devis pour [client]» |
| Essayer la communication | Copiez `exemples/assistant-communication/`: posts LinkedIn, newsletters |
| Essayer les courriers et emails | Copiez `exemples/assistant-courrier/`: rédiger et répondre, dans le bon registre |
| Essayer le recrutement | Copiez `exemples/assistant-rh/`: offres d'emploi, entretiens |
| Essayer la gestion de projet | Copiez `exemples/assistant-projet/`: planning, jalons, suivi |
| Essayer les comptes-rendus de réunion | Copiez `exemples/assistant-reunion/`: décisions, actions, suivi |
| Vérifier le routage lexical reproductible | Avec Node 18 ou plus, depuis un terminal: `node <BASE_DIR>/tools/base.mjs route-test --strategy lexical --root <BASE_DIR>/exemples/routage-pme` |
| Votre propre assistant | [Faites initialiser votre dossier par votre IA](installer-par-votre-ia.md), puis dites «Voici le travail que je veux structurer avec BASE. Aide-moi à préciser la méthode et attends mon accord avant de créer les fichiers.» |
| Trouver par où commencer | Même chose, puis dites «Aide-moi à trouver par où commencer» |
| **Perdu, ou une question sur BASE?** | Dans le dépôt BASE ou un projet où le routeur est activé, dites «Je suis perdu» ou «Aide»: le routeur sélectionne la référence d'accueil, puis votre outil vous présente ses indications. Chaque exemple métier embarque cet accueil de repli. |
| S'inspirer | Consultez la [galerie d'idées](../guides/idees-agents.md) |

> **Deux portes différentes.** Dans un projet doté d'un routeur, «Aide / Je suis perdu» ouvre l'**accueil** (concierge): il oriente et répond aux questions sur BASE. «Aide-moi à trouver par où commencer» ouvre le **diagnostic** du créateur d'assistant: il détermine *quel assistant construire* pour votre métier.

> **Forcer un choix de route.** Dites **«R»** (ou «R votre demande») pour obliger l'assistant à passer par la carte de routage plutôt qu'à répondre de mémoire. Avec la stratégie lexicale par défaut, `node .ai/base.mjs route "<votre demande>"` est déterministe pour une même carte. Une stratégie sémantique ou fondée sur un modèle ne porte pas cette garantie. Le contrôle reproductible est `node .ai/base.mjs route-test --strategy lexical`.

---

**Rappel**: l'IA peut se tromper et inventer des détails. Relisez toujours un devis avant de l'envoyer.

Pour un usage personnel, ce guide suffit. Pour une équipe, relisez et configurez le `base.config.json` créé par `node <BASE_DIR>/tools/base.mjs init`, puis utilisez `node .ai/base.mjs validate`, `node .ai/base.mjs doctor` et les repères de `docs/reference/framework-public.md`. `BASE_BOOTSTRAP.md` sert à brancher un routeur dans un outil IA; il reste hors du champ de la gouvernance d'équipe. Pour une grande organisation, consultez également `docs/reference/framework-public.md` avant tout déploiement.

Pour une PME ou une petite équipe, ajoutez le [kit de démarrage PME suisse](../audiences/kit-demarrage-pme-suisse.md) avant de partager un assistant: données autorisées, validation humaine, versioning et entretien mensuel.

---

## J'ai déjà un dossier de notes ou de procédures

On part rarement d'une page blanche. Deux portes, un même résultat:

- **CLI**: avec Node 18 ou plus dans un terminal, `node <BASE_DIR>/tools/base.mjs init --root mon-dossier` montre les fichiers que l'outil prévoit de créer
  (un agent minimal, ou un fichier workspace si le dossier contient déjà plusieurs racines BASE).
  Après vos choix et votre accord, une seconde invocation avec `--yes` initialise le dossier sans
  écraser les fichiers existants; son résultat tient compte des réponses fournies.
- **Studio**: lancez une fois `npm ci` dans le clone de BASE. Après l'initialisation, lancez
  `cd mon-dossier && node .ai/base.mjs studio --root .`. L'écran Bienvenue présente
  les fichiers et les actions disponibles. Votre outil IA demeure l'expérience du quotidien;
  Studio fait office d'atelier.

Ensuite, pour convertir vos documents en process et en compétences, demandez à votre assistant:
«importer mes procédures existantes». Le routeur l'enverra sur `importer-l-existant`, qui
propose chaque conversion sous forme de diff. Ce routage reste simple mais efficace, et extensible par
adaptateurs. Il vous épargne la recherche du bon process.

---

**Prochaine action, nouveau dossier:** copiez `exemples/assistant-devis/` dans votre espace de travail, ouvrez cette copie dans votre outil IA, puis dites «Bonjour, je voudrais configurer mon activité».

**Prochaine action, dossier existant:** initialisez ce dossier par la CLI ou Studio comme indiqué ci-dessus, puis dites «Importer mes procédures existantes».

BASE est une convention ouverte accompagnée d'une implémentation de référence, portée par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
