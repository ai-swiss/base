# Façonnez votre premier assistant

En quelques minutes, vous transformez une tâche que vous répétez à la main en un assistant qui la prend en charge, sans écrire de code et sans rien céder du contrôle: il propose, vous validez. Concrètement, vous copiez un exemple dans un outil IA capable de lire vos fichiers (par exemple GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code), vous dites ce que vous voulez faire, et l'assistant fait le reste.

> **Pas encore le dépôt?** Consultez [Obtenir BASE](obtenir-base.md) pour choisir ZIP, clone Git, copie d'exemple ou pack navigateur.
>
> **Pas encore d'outil installé?** Consultez le [guide d'installation](installer.md) pour configurer un outil IA capable de lire vos fichiers (par exemple GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code).
>
> **Vous n'avez qu'un navigateur (ChatGPT, Claude)?** Pas besoin d'installer quoi que ce soit pour commencer: suivez [Essayer BASE sans rien installer](essayer-sans-installer.md).

Vous pouvez utiliser ce démarrage de trois façons:

- pour votre vie privée, en copiant un exemple et en l'adaptant à vos propres tâches;
- pour une start-up ou une PME, en stabilisant un workflow utile avant de l'étendre;
- pour une organisation plus grande, comme démonstration locale avant d'ajouter les contrôles internes nécessaires.

---

## 1. Copiez

Copiez le dossier `exemples/assistant-devis/` dans votre espace de travail (par exemple sur votre Bureau ou dans vos Documents).

> **Juste voir le résultat d'abord?** Ouvrez plutôt `exemples/assistant-devis-demo/` (déjà rempli avec une entreprise fictive) et demandez «Dupont SA a-t-il droit à la remise fidélité?». L'assistant devrait s'appuyer sur vos fichiers, nommer la règle et poser un `[A VALIDER]`. Le parcours exact est dans [Voir BASE en action](demo-60-secondes.md).

## 2. Ouvrez

| Outil | Comment |
|-------|---------|
| **Cursor** | Fichier → Ouvrir un dossier → sélectionnez le dossier copié |
| **Claude Code** | Lancez `claude` dans le dossier copié |
| **ChatGPT** | Configurez le [serveur MCP](installer-mcp.md) → chargez l'agent → formulez une demande concrète |

> **Vous préférez un atelier visuel?** Studio est optionnel: lancez `npm run studio` pour ouvrir l'atelier et voir vos fichiers, vos agents et leurs process d'un coup d'œil. Votre outil IA reste l'expérience au quotidien; Studio sert d'atelier.

## 3. Dites ce que vous voulez faire

Par exemple: «Bonjour, je voudrais configurer mon activité». L'assistant vous guide pour configurer votre activité ou votre entreprise: nom, services, prix, conditions. Répondez à ses questions; il propose les fichiers à créer ou modifier, puis vous validez les décisions importantes.

## 4. Créez votre premier devis

> «J'ai un client, Dupont SA, qui me demande 3 jours de conseil en stratégie.»

L'assistant reformule la demande, la chiffre et vous propose le devis. Vous validez, il génère les fichiers.

## Vous validez, l'assistant écrit ensuite

Deux repères rendent ce contrôle visible:

- **`[A VALIDER]`**: quand l'assistant propose quelque chose qui n'est pas encore confirmé (un prix, un devis), il le marque `[A VALIDER]`. Ce marqueur est un repère facile à retrouver d'un coup d'œil, pour vous comme pour vos outils. Tant qu'il est présent, rien n'est figé: c'est à vous de confirmer.
- **L'écriture se fait en deux temps**: pour les actions qui passent par BASE (`base propose` puis `base commit`, ou l'équivalent côté MCP), un changement est d'abord *proposé* (un diff vous est montré, rien n'est écrit), puis *appliqué* seulement après votre confirmation. Vous voyez ce qui va changer avant que ça change. Hors de ces outils, l'assistant vous guide mais n'applique pas ce contrôle à votre place.

Concrètement: vous demandez d'ajouter une ligne au devis. L'assistant ne l'écrit pas tout de suite, il vous montre la ligne et le nouveau total; vous dites «oui», et seulement alors le fichier change. Vous voyez l'effet avant qu'il existe.

Ce contrôle vaut aussi pour ce qui sort de votre machine: une ressource marquée confidentielle n'est pas transmise à un modèle distant, et la vérification a lieu avant l'appel. Détail: [Ce qui peut sortir, et ce que BASE retient](../trust/frontiere-local-vs-sortant.md).

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
| Voir comment BASE route une demande | Depuis la racine du dépôt: `node tools/base.mjs route-test --root exemples/routage-pme` |
| Votre propre assistant | Ouvrez le dossier principal du projet et dites «Lis `.ai/agents/createur-agent/AGENT.md`» |
| Trouver par où commencer | Même chose, puis dites «Aide-moi à trouver par où commencer» |
| **Perdu, ou une question sur BASE?** | Dans le dépôt BASE ou un projet où le routeur est activé, dites «Je suis perdu» ou «Aide»: le concierge vous accueille. Chaque exemple métier embarque désormais un accueil de repli, donc «Je suis perdu» vous oriente même dans un dossier copié. |
| S'inspirer | Consultez la [galerie d'idées](../guides/idees-agents.md) |

> **Deux portes différentes.** Dans un projet avec routeur, «Aide / Je suis perdu» ouvre l'**accueil** (concierge): il oriente et répond aux questions sur BASE. «Aide-moi à trouver par où commencer» ouvre le **diagnostic** du créateur d'assistant: il identifie *quel assistant construire* pour votre métier.

---

**Rappel**: l'IA peut se tromper et inventer des détails. Relisez toujours un devis avant de l'envoyer.

Pour un usage personnel, ce guide suffit. Pour une équipe, ajoutez `base.config.json`, `base validate`, `base entretien` et les repères de `docs/reference/framework-public.md`. `BASE_BOOTSTRAP.md` sert à brancher un routeur dans un outil IA; il reste hors du champ de la gouvernance d'équipe. Pour une grande organisation, consultez aussi `docs/reference/framework-public.md` avant tout déploiement.

Pour une PME ou une petite équipe, ajoutez le [kit de démarrage PME suisse](../audiences/kit-demarrage-pme-suisse.md) avant de partager un assistant: données autorisées, validation humaine, versioning et entretien mensuel.

---

BASE est un framework par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).

## J'ai déjà un dossier de notes ou de procédures

On part rarement d'une page blanche. Deux portes, même résultat:

- **CLI**: `base init --root mon-dossier` montre exactement les fichiers qui seraient créés
  (un agent minimal, ou un fichier workspace si le dossier contient déjà plusieurs BASE);
  `--yes` les crée: jamais d'écrasement.
- **Studio**: lancez l'atelier sur le dossier (`base studio --root mon-dossier`): l'écran
  Bienvenue affiche le même plan, contenu lisible, et un bouton «Créer ces fichiers».
  L'application bascule ensuite en mode normal, sans redémarrer. Votre outil IA reste
  l'expérience au quotidien; Studio sert d'atelier, et vos fichiers restent au centre, avec
  l'outil IA de votre choix (par exemple GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code).

Ensuite, pour convertir vos documents en process et compétences, demandez à votre assistant:
«importer mes procédures existantes». Le routeur l'enverra sur `importer-l-existant`, qui
propose chaque conversion en diff. Ce routeur reste rudimentaire mais efficace, et extensible par
adaptateurs. Il vous évite de chercher vous-même le bon process.
