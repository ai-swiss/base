# BASE

> **Qui possède l'articulation de votre façon de penser avec l'IA, vous ou votre fournisseur?**

**Articulez avec vos mots votre façon de penser avec l'IA, dans des fichiers que vous possédez, lisibles par tous, exploitables par l'IA.**

<sub>BASE = **Bâtir des Assistants avec une Structure d'Expertise** · *Build Assistants with Structured Expertise*</sub>

[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)](CHANGELOG.md)
[![CI](https://github.com/ai-swiss/base/actions/workflows/ci.yml/badge.svg)](https://github.com/ai-swiss/base/actions/workflows/ci.yml)
[![Licence: Apache-2.0 + CC BY 4.0](https://img.shields.io/badge/licence-Apache--2.0%20%2B%20CC%20BY%204.0-blue.svg)](LICENSING.md)

🇬🇧 [English version](README.en.md)

![BASE: reprendre la main sur l'IA. Une personne travaille sereinement sous un dôme transparent sous un flux constant de nouveaux outils et d'informations. La souveraineté qui compte est avant tout cognitive: articuler ses interactions avec l'IA dans des fichiers qu'on possède.](docs/public/assets/base-cognitive-sovereignty.png)

> **En bref.** BASE est un **cadre** gratuit et ouvert pour articuler votre savoir et votre savoir-faire avec l'IA, dans des fichiers texte que vous possédez: un petit [**standard ouvert que nous proposons**](docs/reference/le-standard.md) (le format `base.resource.v1` et ses conventions), avec son **implémentation de référence** (des outils en ligne de commande, une interface visuelle, une connexion aux applications d'IA). **Pour qui:** d'abord les indépendants et les PME qui structurent leur métier avec l'IA (les ateliers d'AI Swiss et d'Innovaud en sont la première communauté de pratique); les mêmes fichiers portent du particulier curieux jusqu'à l'entreprise. **Ce que ça coûte:** BASE lui-même est gratuit; il vous faut un outil d'IA pour l'exécuter (gratuit ou payant, voir [§4](#4-votre-base-en-2-minutes)). **Ce que ça ne fait pas:** rendre l'IA infaillible ou remplacer vos dispositifs de sécurité; ça vous aide à reprendre la main sur votre façon de penser avec l'IA. *Les passages plus techniques sont là pour qui en veut; vous pouvez les sauter.*

**Commencer, deux portes, selon que votre outil d'IA lit vos fichiers ou non:**

- **S'il ne lit pas vos fichiers** (un simple chat web comme ChatGPT): vous pourrez essayer en y copiant vos fichiers, mais ce sera limité: l'assistant ne pourra pas ouvrir les autres fichiers auxquels les vôtres renvoient, ni faire un calcul, ni rien enregistrer chez vous. [**Parlez à BASE en y glissant vos fichiers**](#sans-terminal-le-plus-simple) → §9.
- **S'il lit vos fichiers** (le vrai socle): [**Votre base en 2 minutes**](#4-votre-base-en-2-minutes) → §4.

> **À quoi ça ressemble.** Vous posez votre question en langage courant: «Dupont SA a-t-il droit à la remise fidélité?» L'assistant lit *vos* fichiers et suit ce qu'ils décrivent: il répond en citant les fichiers d'où vient l'information, et vous laisse valider ce qu'il ne doit pas trancher seul. C'est l'exemple d'[une base que vous ouvrez en deux minutes](#4-votre-base-en-2-minutes); la même idée sert pour un courrier, une classe ou une commune.

<sub>Aussi: [Exemples](#3-reprendre-une-base-existante) · [Pourquoi BASE existe](#5-pourquoi-base-existe) · [BASE vs un chat ou une plateforme](#6-base-vs-un-chat-ou-une-plateforme) · [Pour qui](#7-pour-qui) · [Installer](#9-essayer-installer-connecter)</sub>
<br><sub>Porté par [AI Swiss](https://a-i.swiss) (association suisse à but non lucratif) · gratuit et ouvert (Apache-2.0 + CC BY 4.0, licences irrévocables) · des fichiers que vous possédez et pouvez emporter ([gouvernance](GOVERNANCE.md)).</sub>

---

## 1. BASE en bref

BASE est un **cadre**: une manière d'articuler votre savoir et votre savoir-faire avec l'IA, dans des fichiers texte que vous possédez. Pas un produit, pas une plateforme: un [standard ouvert que nous proposons](docs/reference/le-standard.md), avec son implémentation de référence. Ce que le standard fixe n'est pas la connaissance qu'une IA consulte, mais l'articulation du travail: quel assistant, quel process, quelles données, quelle vérification. Que vous soyez un particulier qui organise ses pensées ou une entreprise qui structure ses process, c'est de vos **interactions avec l'IA au quotidien** qu'il s'agit, pas seulement de votre travail. Un patron de PME ou un enseignant connaît son métier sur le bout des doigts; ce qui lui manque, c'est un moyen simple de donner à ce savoir une forme que l'IA peut exploiter. C'est ce moyen que BASE apporte.

**L'enjeu.** La souveraineté qui compte le plus n'est pas matérielle (où tournent les modèles, les puces, les serveurs) mais **cognitive**: qui structure vos interactions avec l'IA, qui y injecte de l'information à votre place, qui vous incite à déléguer plutôt qu'à vérifier. Cette **souveraineté cognitive** a une conséquence vérifiable: avec BASE, vous pouvez **ouvrir et lire vous-même** les fichiers qui portent votre savoir-faire. Vous reprenez la main, et ce que vous bâtissez devient **essentiellement indépendant du modèle** qui l'exécute. BASE n'est pas strictement indépendant du modèle: un modèle reste meilleur ici que là, plus ou moins élégant à rédiger, plus ou moins fidèle à suivre des consignes sur de longs contextes. Mais au niveau des **marches à suivre**, les modèles avancés d'aujourd'hui suivent de façon comparable des instructions bien exprimées; vos procédures tiennent à travers eux, et une structure forte en amont abaisse la capacité nécessaire pour qu'un modèle les suive de façon fiable. **Les outils passent, le contexte reste.**

**Le concret.** Vous externalisez votre savoir et votre savoir-faire dans une **base que vous possédez**, organisée en deux volets:

- **vos instructions**, d'un côté, faites d'une **fiche de poste** (qui est l'assistant, quoi faire selon la demande), de ses **processes** (le **savoir-faire**: comment faire, étape par étape) et de ses **compétences** (le **savoir**: ce qu'il connaît de votre domaine);
- **vos données**, de l'autre, séparées des instructions: l'assistant les lit et propose de les mettre à jour.

Ce sont des fichiers texte que vous ouvrez et lisez comme une note: les fichiers de votre ordinateur suffisent, aucune autre base de données n'est requise (vous pouvez en brancher une, sur un drive partagé par exemple, mais rien ne l'exige), et aucune expertise de développeur n'est requise.

Vous entendez souvent parler d'agents. Ici, les agents ne sont rien d'autre que vos **fils de pensée**: de simples fichiers texte que vous dictez vous-même selon vos besoins. La force vient de **deux axes de séparation**:

- **Axe 1, vos instructions séparées de vos données.** C'est la frontière de sécurité: une donnée lue ne doit pas pouvoir se faire passer pour une instruction. C'est ce qui rend le travail lisible, maintenable, et plus résistant à l'injection par une donnée externe (un principe de conception, voir [§5](#5-pourquoi-base-existe)).
- **Axe 2, le savoir-faire séparé du savoir,** à l'intérieur des instructions.

Vous entendez aussi souvent parler de «skill»: ici, un skill est simplement un savoir ou un savoir-faire articulé par vous dans un fichier texte, avec en plus la séparation qui compte, le savoir-faire distinct du savoir. (Ces deux axes sont posés une fois, proprement, dans [ARCHITECTURE.md](ARCHITECTURE.md); le README en est la vue lisible.)

> **Limite honnête.** BASE garde vos *fichiers* locaux; il ne contrôle pas ce que l'outil d'IA que vous y branchez transmet ensuite à son fournisseur. «Vos fichiers restent locaux» n'est pas «vos données restent locales»: dialoguer avec un modèle distant envoie du contenu au dehors, vers un fournisseur dont la juridiction (p. ex. CLOUD Act) n'est pas forcément celle de votre machine. C'est donc là, et non dans BASE, que devra se surveiller l'extraction de vos données.

### Le scénario du lundi matin

Lundi matin, un client demande un devis. Sur une plateforme web d'IA standard, vous réexpliquez peut-être votre activité pour la énième fois; ou vous portez la charge mentale de chercher des instructions particulières dans un menu, de retrouver une conversation, de remettre la main sur un assistant perdu quelque part dans l'interface. La réponse peut être approximative.

Avec une base qui articule votre savoir-faire, vous écrivez comme à un collègue, en langage naturel: «J'ai un nouveau devis à faire pour Dupont SA, trois jours de conseil en stratégie.» L'assistant charge vos process, commence à les suivre et travaille **avec vous**: il prépare un **brouillon** et pose un `[A VALIDER]`. Rien ne part sans vous. Vous calibrez soigneusement l'effort selon la nature de la tâche, et notamment selon la balance risque-bénéfice qui vous appartient: c'est une collaboration qui se construit, pas une délégation.

Surtout, vous tenez là une **base dans un format cohérent**, qui peut devenir votre standard: une seule grammaire pour tout le savoir et le savoir-faire que vous structurez, pour en avoir la visibilité, le maintenir, l'évaluer, et, à terme dans une grande entreprise, bâtir toute une gouvernance autour. Vous passez de petites pièces recollées au fil de l'eau à une **base solide** que vous possédez et que vous affinez à tout moment.

Vous ne lancez pas l'IA pour revenir le lendemain quand «c'est fini»: vous **observez, recadrez, itérez**. L'IA propose, vous décidez; c'est vous qui menez la danse, à chaque échange.

---

## 2. Le cadre, brique par brique

BASE produit une base de départ **délibérément minimale**, qui ne contient que les **briques** qui deviennent capitales à mesure que votre usage s'étend.

> **Deux registres dans BASE.** Un *mécanisme* est appliqué par le code quand l'action passe par BASE: le résultat est déterministe. Une *consigne* est lue par le modèle: utile, mais faillible, et le résultat peut varier. Chaque brique précise lequel. Une consigne n'est jamais une garantie.

Les briques, et pourquoi elles comptent quand vous grandissez:

- **Vos textes, avec un standard d'organisation.** Tout part de fichiers texte écrits avec vos mots, rangés selon une structure de dossiers lisible. C'est ce standard partagé ([le standard BASE](docs/reference/le-standard.md), `base.resource.v1`) qui rend votre base navigable et cohérente, pour vous comme pour l'IA, des premières notes jusqu'à une grande organisation.
- **Des métadonnées qui permettent d'activer des mécanismes.** De petits en-têtes simples au-dessus de vos fichiers (quelques lignes) suffisent à activer des comportements du code: marquer une ressource sensible, signaler un process, cadrer un accès. Le même fichier parle ainsi à deux mondes: l'en-tête est lu par du code testé (le monde des mécanismes), le corps par le modèle (le monde des consignes). Vous pilotez ces comportements par le texte. → [détail](docs/trust/mecanismes-vs-consignes.md)
- **Une séparation des instructions et des données, et du savoir-faire et du savoir.** Les deux axes posés en [§1](#1-base-en-bref): vos instructions d'un côté, vos données de l'autre (Axe 1, la frontière de sécurité); et, à l'intérieur des instructions, le savoir-faire séparé du savoir (Axe 2). C'est cette double séparation qui rend une base maintenable, auditable, et plus résistante à l'injection par une donnée externe. → [§8](#8-comment-cela-fonctionne)
- **Un routage progressif de vos intentions vers vos process.** À partir de ce que vous demandez, l'assistant descend de proche en proche, de la racine vers le bon agent puis le bon process, en lisant un index généré de votre base (`.ai/routing/index.md`). C'est une **découverte progressive**, menée par le modèle mais garantie par un **plancher déterministe**: le code (`base route`), sans aucun modèle, assure que pour une même demande vous obtenez la même réponse: la même route ou une abstention motivée, avec des raisons inspectables. Ce plancher compare des mots, il n'interprète pas le sens: il sert de socle reproductible et testable (`route-tests.json`), la compréhension fine restant au modèle qui lit l'index. Ce routage de base n'exige rien d'autre qu'un outil d'IA capable de lire vos fichiers; un mode sémantique optionnel (par embeddings) reste possible pour de très grands catalogues. → [détail](docs/reference/routage-process-et-ressources.md)
- **Le Studio: voir et éditer vos objets sur une page.** Une page web, ouverte uniquement sur votre propre ordinateur, qui vous permet de **voir d'un coup d'œil** tout ce que vous avez créé, vos process et vos ressources, de façon centralisée, et de les **éditer directement sur une page** plutôt que de les chercher dans vos fichiers. `base studio --root <dossier>` → [détail](tools/studio/ui/README.md)
- **L'évaluation et le monitoring: suivre la qualité de vos process dans le temps.** À mesure qu'on grandit, il devient important de suivre la qualité de ses process et leur évolution dans le temps. On peut faire tourner un modèle-juge qui essaie d'exécuter vos process et recense les échecs ou les difficultés. Ces évaluations ne reflètent pas exactement votre outil d'IA, et le juge lui-même est faillible (à calibrer); elles servent d'alarme de **régression relative** entre deux versions de vos process, pas de note absolue, mais elles livrent assez d'information utile pour surveiller la qualité et faire remonter les problèmes. Dans une organisation, un rôle de **monitoring** peut suivre tous les process partagés, avec des utilisateurs réels ou fictifs.
- **Une science appliquée de l'interaction humain-IA, et des mécanismes de vérification.** BASE embarque une interface vers toute une documentation sur la façon de bien travailler avec l'IA, et des mécanismes pour rendre cette interaction plus solide, dont des marqueurs cherchables (`[A VALIDER]`, `[DECISION]`). Rappel de fond: **un modèle de langage ne vérifie jamais, il génère.** Selon la balance risque-bénéfice que vous visez, vous outillez cette vérification: une **brique** que vous possédez et gardez en main, pas un axe imposé. → [§5](#5-pourquoi-base-existe)
- **Un contrôle des sorties de données (egress), pour montrer la gouvernance par métadonnées.** Quand un appel distant passe **par BASE**, une ressource marquée `confidential` est retenue avant l'appel puis remplacée par un avis explicite, jamais omise en silence: c'est un **mécanisme**, pas une consigne. Par défaut rien n'est retenu: la retenue se déclenche sur le drapeau explicite `confidential` ou une racine `local-only`, pas sur le simple niveau de sensibilité. Ce n'est ni un pare-feu ni une DLP autour des outils tiers. Et l'egress n'est qu'un exemple: ces métadonnées sont extensibles, et ce bref bloc de texte en tête de vos fichiers peut activer autant d'autres mécanismes de gouvernance que vous en concevez. → [détail](docs/trust/frontiere-local-vs-sortant.md)

> **Vérifiable en une commande (invariants du code).** Zéro dépendance runtime (`package.json` n'a aucun champ `dependencies`), le Studio refuse toute liaison non-loopback au démarrage, l'egress est une seule fonction pure partagée par toutes les surfaces. `git clone … && npm run check`. Détail et liens vers les `FR-*` en [§8](#8-comment-cela-fonctionne).

<details>
<summary><strong>Aspects de compatibilité (un peu plus technique): MCP, espaces multi-dossiers, CLI, confinement du Studio</strong></summary>

- **Le serveur MCP (le plus important ici).** Le MCP **expose la même intelligence**, celle que vous avez structurée dans BASE, à n'importe quel outil compatible. Là où l'usage courant tend à empiler dans le MCP quantité d'outils à exposer, BASE fait le choix inverse: exposer avant tout le **routage**, pour qu'il soit la porte structurée et portable, la seule qui compte vraiment. Or aujourd'hui la grande majorité des outils d'IA acceptent le MCP: vous branchez le serveur et vous retrouvez l'intelligence de votre base dans cet outil, qu'il s'agisse d'un outil grand public ou de votre propre ERP en entreprise. Côté sûreté: en local, il expose les mêmes primitives que la CLI, par la même voie d'écriture; **lecture seule par défaut sur HTTP**, et toute exposition non-locale exige un **jeton (bearer token)**. → [mcp/](mcp/)
- **Les espaces multi-dossiers.** Plusieurs dossiers chargés côte à côte dans BASE, isolés les uns des autres: vous évitez de tout mettre dans le même dossier sur votre ordinateur. Une racine imbriquée reste isolée.
- **La CLI.** `base <commande>` permet, à vous mais surtout à l'IA et à vos outils d'IA, de faire des choses structurées en lisant quelques commandes simples: bâtir, router, auditer, évaluer.
- **Le confinement du Studio.** Le Studio n'écoute que sur `127.0.0.1` (loopback) et refuse toute liaison non-locale au démarrage, sauf override explicite `BASE_STUDIO_ALLOW_INSECURE_REMOTE` (à vos risques, qui n'ajoute pas d'authentification), avec une protection contre le DNS-rebinding. C'est ce confinement, pas une authentification, qui le rend sûr dans ce cadre.
- **Le contrôle d'egress, en pratique.** Une seule fonction pure décide, partagée par toutes les surfaces, donc la règle ne peut pas diverger. Hors du chemin qui passe par BASE, c'est vous l'autorité d'egress. (Mécanisme et défaut décrits dans la liste des briques ci-dessus.) → [détail](docs/trust/frontiere-local-vs-sortant.md)
- **Le monitoring, par l'exemple.** Quand un modèle bute sur un process, l'incident remonte dans une interface; la personne responsable trie et oriente vers les bons correctifs. Ainsi: «les utilisateurs ne parviennent pas à connecter leur messagerie, faute du connecteur voulu», ce qui conduit à le mettre à disposition.
</details>

> **Des couches légères et indépendantes.** Vous prenez ce dont vous avez besoin, et rien de plus. On peut faire tourner l'UI de documentation ou le Studio, ou non. On peut faire tourner le serveur MCP, ou non. On peut s'en tenir à travailler un peu avec des fichiers structurés et quelques métadonnées, ou monter toute la mécanique vers une structure solide d'entreprise. Côté garanties du code (mêmes invariants que ci-dessus, détail et liens vers les `FR-*` en [§8](#8-comment-cela-fonctionne)): aucun champ `dependencies` runtime dans `package.json` (seuls des `devDependencies` de build et des `peerDependencies` optionnelles), le cœur n'importe que la bibliothèque standard de Node; une seule voie d'écriture pour CLI, Studio et MCP; l'egress est une seule fonction pure partagée; tout est vérifié par `npm run check`.

---

## 3. Reprendre une base existante

On parle beaucoup d'agents; le mot n'a pas à dicter la grammaire de nos interactions avec l'IA. Un agent peut être simplement un **fil de pensée** organisé dans un fichier texte: soit une marche à suivre particulière, soit une certaine personnalité qu'on infuse à l'IA. Les agents ne sont pas des choses à collectionner, ni des employés à recruter; les voir ainsi crée surtout la charge mentale de les retrouver et de deviner lequel s'applique à quel problème. Ce qui compte, c'est l'articulation de votre pensée, couchée dans des fichiers texte avec vos mots. Le formalisme est minimal et assumé: quelques lignes d'en-tête versionnées (le [standard `base.resource.v1`](docs/reference/le-standard.md)) quand vous voulez activer des mécanismes, rien tant que vous n'en voulez pas; le contenu, lui, s'écrit librement, avec vos mots. La finesse des modèles d'aujourd'hui, capables de suivre des instructions nuancées, nous laisse précisément cette liberté: articuler comme nous l'entendons.

Chacun des exemples ci-dessous est une **base que vous possédez**, votre savoir et votre savoir-faire articulés avec vos mots, séparés de vos données. Vous en copiez une comme tête de pont, vous la faites grandir, elle reste à vous, essentiellement indépendante du modèle.

| Exemple | Ce qu'il vous aide à faire |
| --- | --- |
| [Base de réflexion](exemples/assistant-reflexion/) | Structurer votre pensée, vos sources et vos positions sur un sujet, pour suivre votre propre fil |
| [Starter perso](exemples/starter-perso/) | Partir d'une base pour organiser votre savoir personnel: notes, projets, suivi |
| [Assistant devis](exemples/assistant-devis/) | Préparer des devis professionnels: prix, TVA, conditions, export optionnel |
| [Assistant RH](exemples/assistant-rh/) | Publier des offres, préparer les entretiens, évaluer les candidats |
| [Assistant communication](exemples/assistant-communication/) | Rédiger posts LinkedIn et newsletters dans votre ton de voix |
| [Assistant courrier](exemples/assistant-courrier/) | Rédiger et répondre à vos courriers et emails clients |
| [Assistant projet](exemples/assistant-projet/) | Structurer, planifier et suivre vos projets avec jalons |
| [Assistant enseignant](exemples/assistant-enseignant/) | Préparer séquences d'enseignement et évaluations |
| [Agence multi-clients](exemples/agence-multi-clients/) | Tenir un espace multi-dossiers, un BASE par client |

[Voir tous les exemples →](exemples/) · *Pour un autre besoin, décrivez-le simplement à BASE: il sait bâtir avec vous une structure simple qui rend votre interaction avec l'IA durable, en l'ancrant dans des fichiers que vous possédez.*

---

## 4. Votre base en 2 minutes

Voyez votre savoir structuré exploité par n'importe quel modèle que vous y branchez. Au préalable, une distinction qui change tout: il y a les outils d'IA capables de **lire vos fichiers locaux**, et les autres.

Aujourd'hui, l'enjeu est d'externaliser votre savoir et votre savoir-faire **en le possédant**, disponible sur votre ordinateur (ou votre drive partagé, ou tout emplacement auquel vous avez accès). Pour cela, le vrai socle, c'est un outil d'IA qui peut **lire et éditer des fichiers locaux que vous possédez**. Un simple chat dans le navigateur n'est pas ce socle: c'est une porte d'entrée pour tester et comprendre la structure, avec des limites immédiates.

D'abord, récupérez le dossier d'exemple `exemples/assistant-devis-demo/`, par clonage du dépôt ou par le bouton vert **Code** → **Download ZIP** (sur Windows, «Extraire tout»; un double-clic sur le ZIP ne suffit pas). Puis, selon votre outil:

**(a) Avec un outil d'IA qui lit vos fichiers (le vrai socle).** Ouvrez ce dossier (**pas** la racine du dépôt) dans l'outil, puis posez la question, mot pour mot: **«Dupont SA a-t-il droit à la remise fidélité?»**

**(b) Avec un simple chat web (pour tester).** Glissez les fichiers de `catalogue/` et `clients/` dans le chat (ou attachez `regles-tarification.md` et `dupont-sa.md`), puis posez la même question. Vous verrez vite les limites: il faut **téléverser** les fichiers, sans synchronisation continue avec vos fichiers locaux, et vous versez des fichiers entiers sur une plateforme. C'est bien pour comprendre; mais la condition de base pour être vraiment maître de vos interactions, c'est de pouvoir, au minimum, lire et éditer des fichiers texte que vous possédez. → [Essayer sans installer](docs/start/essayer-sans-installer.md)

> **Honnêteté sur la démo.** Ce dossier d'exemple route **directement vers un agent unique** (son `CLAUDE.md` pointe l'agent du devis): il ne livre pas d'index de routage. Pour voir le **routage progressif** lui-même, lancez `base route "<demande>" --root exemples/assistant-devis-demo` (qui régénère l'index `.ai/routing/index.md` et montre la route). La démo ne prétend donc pas embarquer un index qu'elle ne contient pas.

**Ce que vous devriez observer.** Un assistant qui suit la consigne répond **typiquement non** (la remise fidélité demande deux mandats, et `dupont-sa.md` indique «Client (1er mandat)»), cite `dupont-sa.md` et `regles-tarification.md`, pose un `[A VALIDER]`, et ne change rien à votre place.

> **Changez de modèle, observez.** La même base, repointée vers un autre modèle, refait la tâche: votre savoir-faire ne dépend pas du modèle du moment. Repointez et observez la différence par vous-même.

> **Les mécanismes de vérification sont visibles.** L'assistant cite ses sources et pose `[A VALIDER]`: ce sont des marqueurs que vous voyez passer. Ce sont aussi des *consignes* qui dépendent des instructions que vous avez données, et dont vous restez souverain et libre: vous pouvez les exiger sur n'importe quel outil. Si votre modèle ne cite pas, c'est la preuve vivante que c'est une consigne: ouvrez les deux fichiers vous-même (ils sont dans le ZIP, ou demandez à l'IA de vous les montrer) et constatez le «1er mandat».
> **Outils.** Tout outil d'IA capable de lire et d'éditer vos fichiers convient, par exemple Claude Code, Cursor, Antigravity, GitHub Copilot ou OpenCode; BASE n'en privilégie aucun.
> **Vous utilisez un autre outil d'IA?** BASE ne dépend d'aucun outil en particulier: la plupart des éditeurs lisent déjà le fichier d'instructions que BASE génère (`AGENTS.md`) et fonctionnent tels quels. Pour un outil au format différent, le lien à poser est court (dire à l'outil «lis cette base et suis-la»): demandez à BASE de vous aider à l'écrire, ou ajoutez ce petit adaptateur à la main, sur le modèle des exemples.

> **Coût.** **BASE lui-même est gratuit; il vous faut un outil d'IA pour l'exécuter, gratuit ou payant.** Beaucoup d'usages courants sont déjà possibles avec une option gratuite, d'autant qu'une structure forte en amont abaisse la capacité de modèle nécessaire; une option payante (à l'usage ou par abonnement) reste plus confortable pour les raisonnements les plus difficiles. Côté BASE, aucune sortie réseau dans le routage de base; ce qui sort ensuite dépend de l'outil d'IA que vous choisissez. Rien à payer par utilisateur, aucun abonnement imposé par BASE: le coût récurrent reste celui de cet outil, et il est le vôtre à négocier.

*Rappel: la racine du dépôt est le cadre. Pour un usage, ouvrez un dossier d'exemple.*

---

## 5. Pourquoi BASE existe

> **Qui possède l'articulation de votre façon de penser avec l'IA, vous ou votre fournisseur?**

BASE n'est ni un produit d'IA de plus (ChatGPT, Copilot, Claude Code…), ni un discours de concepts (esprit critique, transparence). C'est une **troisième voie**: apprendre, de façon **scientifique et souveraine**, à mener votre interaction avec l'IA et à bâtir une base qui est à vous. BASE n'outille pas seulement: il **embarque la documentation** de cette science appliquée de l'interaction humain-IA. La littératie IA qui en résulte ne se récite pas: elle se construit en pratiquant la structure; router une demande, séparer les instructions des données, marquer ce qui reste à valider sont autant d'exercices.

Travailler avec l'IA expose à de nombreuses **pertes de contrôle potentielles**: sur la souveraineté, sur la compréhension, sur la durée, sur la vérification. Les sections qui suivent en reprennent les principales.

### Souveraineté cognitive, pas seulement matérielle

La souveraineté qui compte ne se joue pas seulement dans vos serveurs, mais dans ces questions:

> **Qui structure mes interactions avec l'IA? Qui injecte de l'information à ma place? Qui m'incite à déléguer plutôt qu'à vérifier? Où est ma souveraineté cognitive?**

BASE y répond par trois ancrages: (a) vous articulez vos interactions, avec vos mots, dans des fichiers que vous possédez, lisibles par tous, exploitables par l'IA; (b) c'est vous qui injectez votre savoir et votre savoir-faire, pas un tiers à votre place: ce qui est versé dans le contexte vient de *vos* bases d'information, pas de commandes ou d'instructions glissées à votre insu; (c) votre savoir-faire devient **essentiellement indépendant du modèle** qui l'exécute, vous changez de modèle sans repartir de zéro.

> **Bornage honnête (pas de sovereign-washing).** La localité dit *où* un modèle tourne, pas son origine ni sa juridiction: le CLOUD Act existe, et un modèle exécuté localement n'est pas pour autant un modèle suisse. Ce qui sort dépend de votre configuration et de votre contrat. BASE garde souveraine la couche d'expertise; le choix du modèle reste le vôtre, à vérifier. → [Souveraineté et confiance](docs/trust/souverainete-et-confiance.md)

### Le déplacement de la valeur

Les modèles s'améliorent, bien moins vite que n'explose la quantité d'outils qui en tirent parti dans la société, mais ils s'améliorent. Et à mesure qu'ils progressent, ce qu'on attend d'eux, c'est qu'ils suivent **de plus en plus finement** les instructions qu'on leur donne, et qu'ils soient de plus en plus efficaces dans la collaboration avec nous: se comporter comme s'ils partageaient suffisamment notre représentation du monde pour que nous parlions de la même chose; susciter dans l'échange les points intermédiaires et les itérations nécessaires pour clarifier et s'aligner. Autrement dit, on attend des modèles qu'ils deviennent des **experts de l'interaction humain-IA**, posée sur les fondamentaux de toute interaction entre entités différentes, humaines ou non, selon la balance risque-bénéfice qu'on souhaite (s'il n'y avait aucun risque, on pourrait tout déléguer, mais ce n'est pas le but ici).

C'est pourquoi la valeur se déplace. Dans la plupart des discours actuels, elle tient au modèle ou au produit du moment; avec BASE, elle tient à l'**articulation de votre savoir-faire**, dans une base que vous possédez. Deux actifs se capitalisent: votre **contexte** et vos **outils**. Le risque, c'est de tout lier dans une boîte que vous ne possédez pas; BASE garde la couche de contexte (et le routage, et l'index) à vous et **séparable du modèle**, de sorte que changer de fournisseur devient un simple réglage, non une migration (selon la tâche, le recalage peut demander un peu de travail, mais on ne réécrit jamais la base). Les outils passent, le contexte reste.

### Pourquoi c'est durable, et non un palliatif

Ce besoin ne dépend pas de la puissance du modèle. Quelle que soit l'architecture à venir, deux choses ne changent pas: un modèle ne connaît pas votre contexte par défaut, et son cœur génératif ne se vérifie pas lui-même. Un cœur plus puissant génère mieux et raisonne mieux; il ne peut toujours pas deviner une information qu'il n'a jamais reçue: tant que votre réalité n'est consignée nulle part (votre contexte, vos fichiers), elle lui reste invisible. C'est pourquoi la structure est **durable**, pas un palliatif en attendant des modèles meilleurs.

### Co-penser avec l'IA

L'IA **ne se comporte pas comme un logiciel numérique classique**. Le raccourci mental le plus opérant est peut-être un **collègue venu d'ailleurs**, un peu amnésique, qui a une représentation riche du monde mais pas du vôtre; qui ne prend pas le café avec vous et ne connaît pas tout votre contexte. Le cœur génératif démarre **chaque conversation** avec une fenêtre de contexte vide. La clé, ce n'est pas un réglage qu'on fait une fois: c'est de **structurer l'information pour qu'elle soit disponible à la bonne granularité, au bon moment**, dans toutes vos interactions avec l'IA. Par exemple, du plus brut au plus élaboré:

- des **transcriptions brutes** de vos réunions et de vos échanges;
- aux **notes** que vous en dérivez;
- aux **articulations projet** que vous bâtissez par-dessus.

BASE rend ce geste rapide et fiable en gardant cette mémoire dans vos fichiers, prête à être refournie, et ciblée par le routage. Deux contraintes distinctes l'imposent: le cœur génératif est **sans état** (chaque appel redémarre à vide, rien n'est reporté d'un appel à l'autre), *et* sa fenêtre de contexte est de **taille finie**. La première impose de refournir le contexte; la seconde de le **cibler**, d'où l'enjeu d'y remettre la **bonne** information, pas toute l'information.

Cette méthode s'adosse à des principes éprouvés: un canal n'achemine de façon fiable que ce que sa capacité et un **code partagé** autorisent (Shannon, 1948), d'où l'enjeu de **termes compatibles**; des **objectifs clairs**, sans quoi la collaboration échoue même quand l'autre est brillant (par analogie avec la théorie des objectifs, Locke & Latham); des **boucles de correction**, comme une réunion qui recadre (Wiener, 1948). Le goulot de la collaboration humain-IA est la **compréhension partagée**, pas la puissance. → [Co-penser avec l'IA](docs/learn/co-penser-avec-lia.md) · [La co-pensée en pratique, 16 principes](docs/learn/pratiques-co-pensee.md)

### La vérification, une brique non optionnelle

Le cœur génératif génère, mais ne **vérifie jamais**; et comme générer ne coûte presque plus rien, c'est la vérification qui porte la valeur. Une large part des usages échoue faute d'une véritable ingénierie de la vérification. Traitez chaque réponse comme une **hypothèse**: la vérification vous incombe. Pour l'essentiel du travail quotidien, le seul vérificateur, c'est vous, sauf sur des terrains formels où une vérification externe automatique est possible, comme le code ou les maths (un compilateur, une preuve). La fiabilité d'une sortie est une propriété du flux de travail qui l'a produite, pas du modèle seul. La bonne nouvelle n'est pas seulement qu'une structure forte en amont allège la vérification en aval: c'est aussi que **la structure peut inclure la vérification elle-même**, sous forme d'itération, de relecture, de réancrage dans des données fiables. BASE outille cette ingénierie avec des éléments que vous possédez (marqueurs, gate d'écriture, évaluation), assez pour rendre la sortie fiable à livrer, sans pour autant garantir qu'une réponse soit vraie.

> **Ce que vous possédez vraiment.** Des fichiers Markdown, sans format propriétaire ni dépendance captive: versionnables, lisibles par les humains comme par l'IA, librement réutilisables. Ce que vous ne possédez pas: le modèle, sa juridiction, et ce qui sort une fois la conversation engagée.

<details>
<summary><strong>Une note d'honnêteté: ce que BASE n'est pas</strong></summary>

BASE ne rend pas l'IA infaillible. Il ne remplace ni IAM/SSO (gestion des identités et authentification unique), ni RBAC (droits par rôle), ni DLP/SIEM (prévention de fuite et supervision), ni archivage légal, ni conformité nLPD/RGPD, et cocher une case réglementaire ne se confond pas avec être conforme. Il se branche **en amont** de ces dispositifs, sans en modifier le cœur. La résistance à l'injection découle de la séparation instructions/données ([§1](#1-base-en-bref)); c'est un principe de conception, pas un mécanisme. Une revue de sécurité externe est prévue, pas encore réalisée. Modèle de menace: [Sécurité et limites](docs/trust/securite-et-limites.md).
</details>

---

## 6. BASE vs un chat ou une plateforme

La vraie alternative n'est pas «un produit plutôt qu'un autre»: c'est *consommer un produit d'IA* ou *réciter des concepts* d'un côté, *apprendre à mener l'interaction et posséder sa base* de l'autre. BASE ne remplace pas les plateformes; il vous rend propriétaire de la couche qui les rend utiles.

| | Un chat générique | Une plateforme d'IA | Avec BASE |
| --- | --- | --- | --- |
| Possession | échanges captifs | locataire | vos fichiers |
| Indépendance du modèle, capitalisation | non | parfois (choix du modèle) | oui: vous changez de modèle sans réécrire votre base |
| Structurer l'interaction | en partie, sans transparence sur ce qui est injecté | en partie, sans transparence sur ce qui est injecté | oui, et vous voyez ce qui est injecté |
| Maintenance | à refaire à chaque fois | écrans à entretenir | fichiers texte versionnables |
| Vérification (le cœur ne vérifie jamais) | possible, à votre charge | possible, à votre charge | oui, avec mécanismes en plus *et* la doc de la science appliquée |
| Coût de sortie, réversibilité | tout perdu | élevé | copie libre, à tout moment |
| Ce que cela demande | rien, mais tout est à refaire | prendre l'outil en main | un peu de structure, et un outil qui lit vos fichiers |

«Ingénierie de la vérification», pas «vérité»: BASE rend la vérification *tenable*, il ne garantit pas qu'une réponse soit vraie. On peut vérifier dans un chat ou ailleurs; BASE y ajoute des mécanismes et, surtout, la documentation qui dit *quoi* mettre dans l'interaction humain-IA selon votre niveau de risque-bénéfice.

| Au lieu de… | Ce que vous gagnez avec BASE |
| --- | --- |
| **Un seul gros `CLAUDE.md`** | Plutôt qu'un mur unique où tout est injecté en bloc, où instructions et données se mélangent (et où l'injection prospère), un **routage progressif**: l'assistant descend un index généré de votre base (`.ai/routing/index.md`) vers le bon process, sépare savoir-faire / savoir *et* garde vos données distinctes des instructions. |
| **Le format `SKILL.md` / `AGENTS.md` seul** | «Agent», «skill»: ce ne sont que des noms, et ces formats ouverts sont un terrain partagé que BASE lit et écrit (les `CLAUDE.md`, `AGENTS.md` et règles Cursor d'un BASE sont des adaptateurs générés depuis la source que vous possédez). Le [standard BASE](docs/reference/le-standard.md) ajoute ce qu'ils laissent de côté: le routage déterministe d'un agent et d'un process entiers, la double séparation instructions / données et savoir-faire / savoir, l'écriture médiée; un savoir-faire y puise dans autant de fichiers que vous le voulez. |
| **Un assemblage d'agents à configurer** | Vous n'entretenez ni tuyauterie ni écrans: l'orchestration reste au modèle, et BASE structure le *quoi* (vos textes, vos process, vos garde-fous) que vous possédez. |
| **La recherche sémantique (RAG) seule** | La recherche sémantique est une mise en correspondance mathématique: elle trouve des passages proches, mais sans toujours la finesse de porter *vos* intentions. Mieux vaut fournir d'emblée au modèle l'information pertinente; le laisser creuser reste possible, souvent au prix de ressources gaspillées. Le choix de ce qui compte doit vous rester. |

---

## 7. Pour qui

Quiconque interagit avec l'IA, du particulier curieux à l'entreprise. Les mêmes abstractions servent partout: clé en main pour démarrer, extensibles pour grandir.

Concrètement, c'est le même fichier qui monte l'échelle. L'`AGENT.md` qui organise vos notes personnelles peut devenir, sans changer de format, celui qu'une équipe partage puis qu'une organisation gouverne: on ajoute au fil du besoin quelques lignes d'en-tête (une sensibilité qui active le contrôle d'egress, des signaux de routage, une évaluation qui suit la qualité), et rien n'est à migrer.

| Profil | Ce que BASE apporte | Ce qui reste à votre charge |
| --- | --- | --- |
| **Particulier / curieux / étudiant** | Une structure pour travailler avec l'IA et suivre votre propre fil: organisez ce que vous savez au fur et à mesure de vos besoins, librement mais assez structuré pour faire grandir votre base. | Choisir ce que vous confiez à l'outil, relire, décider, tenir votre base à jour. |
| **Métier / indépendant** | Une base pour votre activité, à partir de vos règles et données, gardée quel que soit l'outil. | Relire, décider, tenir vos fichiers à jour. |
| **Dirigeant** | Souveraineté et durabilité: vous capitalisez le savoir-faire collectif, et changer de modèle devient un simple réglage, non une migration (voir [§6](#6-base-vs-un-chat-ou-une-plateforme)). | Gouvernance des accès, conformité, et le choix du modèle / fournisseur. |
| **Sécurité / conformité / secteur public** | Cœur auditable, mécanismes testés, routage local par défaut. BASE se branche **en amont** de vos dispositifs (IAM/SSO/RBAC/DLP/SIEM), il ne les remplace pas; egress borné sur ses propres surfaces. | IAM/SSO/RBAC/DLP/SIEM via vos systèmes. L'analyse d'impact (DPIA) reste de votre ressort: traiter des données personnelles via un modèle distant est un transfert à évaluer. Lire [Sécurité et limites](docs/trust/securite-et-limites.md) et [La frontière local / sortant](docs/trust/frontiere-local-vs-sortant.md). |
| **Développeur / contributeur** | Cœur sans dépendance runtime, tout testé et spécifié. | Voir le bloc dédié en [§8](#8-comment-cela-fonctionne). |
| **Sceptique / journaliste** | Ouvrez les fichiers, vérifiez les claims; consigne vs mécanisme assumé. | Aucune confiance préalable requise. → [Preuves](docs/trust/evidence.md) (claim → mécanisme/test → limite). |

### Risque, continuité, sortie (pour le décideur)

- **Indépendance du modèle = contrôle du risque:** votre savoir-faire survit à tout changement de modèle; changer de fournisseur tient du réglage, non de la migration. Le danger n'est pas «utiliser un fournisseur», c'est lier votre contexte *et* votre outillage dans une boîte que vous ne pouvez ni copier ni faire évoluer. BASE garde la couche de contexte et le routage à vous et séparables.
- **Captivité (lock-in):** des fichiers que vous possédez, portables d'un outil à l'autre, que vous pouvez copier et faire évoluer librement (**forker**) à tout moment.
- **Continuité:** BASE est conçu pour être **facile à reprendre**. Licences irrévocables (Apache-2.0 / CC BY 4.0) et cœur sans dépendance externe le rendent reprenable par quiconque: `git clone + npm ci + npm run check` (zéro dépendance runtime) suffit à le remettre en marche de bout en bout, tout étant testé et spécifié. La gouvernance et ses garanties de continuité sont détaillées dans [GOVERNANCE](GOVERNANCE.md).
- **Intendance:** AI Swiss, association à but non lucratif, neutre vis-à-vis des modèles; aucun lien vendeur exclusif.

Pour défendre le choix de BASE devant une DSI ou la conformité: [Souveraineté, confiance et conformité](docs/trust/souverainete-et-confiance.md).

---

## 8. Comment cela fonctionne

### La structure, en détail

Un assistant réunit, **d'un côté**, ses instructions (fiche de poste + savoir-faire + savoir, séparés), et **de l'autre**, vos données, séparées autant que possible, parce qu'une donnée lue ne doit pas pouvoir se faire passer pour une instruction (voir l'invariant de frontière dans [ARCHITECTURE.md](ARCHITECTURE.md)).

```
INSTRUCTIONS (ce que vous écrivez)            DONNÉES (séparées)
AGENT.md             La fiche de poste        data/        Vos fichiers métier
  └── skills/                                 sources/     Vos sources de référence
        ├── processes/   Le savoir-faire ┐
        │                  (savoir-faire ⟂ savoir, Axe 2)
        └── competences/ Le savoir       ┘    (lus par l'assistant,
  templates/          Formulaires (opt.)       mis à jour via propose→commit)
  tools/              Scripts (opt.)

  Axe 1 (frontière de sécurité):  données ──lues──▶ jamais exécutées comme instructions
```

Ces deux séparations sont les deux axes minimaux qui suffisent: l'un sépare ce qui est vrai de votre monde (savoir, données) de la façon d'agir dessus (savoir-faire, instructions); l'autre sépare ce que **vous** affirmez (instructions) de ce qui est lu et pourrait être adverse (données). C'est pourquoi le squelette peut rester minimal sans que rien manque. Tout le reste est optionnel et extensible: templates, scripts, ou n'importe quel fichier qu'une IA peut exploiter, ajoutés selon votre propre structure; l'essentiel est de cadrer le savoir et le savoir-faire, le reste vous appartient. Le savoir-faire et le savoir s'écrivent au format **SKILL.md**, un Markdown lisible: certains outils le découvrent nativement, d'autres demandent de pointer les fichiers; l'intégration varie, le format reste à vous.

### Le routage, en détail

Trois gestes, du plus guidé au plus direct, selon ce que vous savez déjà: **formuler votre demande** et laisser BASE la router vers le bon process; **choisir vous-même l'assistant** quand vous savez lequel; **ouvrir directement le fichier** voulu quand vous savez où aller. Par défaut, le routage est **progressif**: l'assistant lit un index généré de votre base (`.ai/routing/index.md`) et descend de proche en proche, de la racine vers l'agent puis le process. Un **plancher déterministe**, le code seul sans modèle (`base route` / `route_request`), confirme et sert de repli: pour une même demande, la même route, *ou* une abstention motivée. L'abstention honnête vaut quand ce plancher de BASE est sollicité (déterministe), pas quand le modèle devine seul (consigne). Un mode sémantique optionnel (embeddings, opt-in) reste possible pour de très grands catalogues. Un process n'ouvre que les ressources utiles à une tâche: contexte ciblé plutôt qu'exhaustif, donc plus d'information utile par token dans une fenêtre bornée.

Vous n'avez rien à reconfigurer quand votre base grandit. BASE dirige chaque demande vers ce que contient votre dossier, tel quel: s'il n'y a qu'un assistant «devis», tout va vers lui; ajoutez un assistant «support», et BASE tient compte des deux, sans que vous changiez quoi que ce soit. À l'inverse, limiter BASE à une partie de votre travail, c'est simplement ne mettre dans un dossier que cette partie.

### Évaluer et observer votre base

Quand vous le souhaitez (rien ne tourne automatiquement), vous pouvez **évaluer vos process**, et pas seulement la sortie d'un modèle: un juge-modèle (faillible, à calibrer) signale des **régressions relatives** entre deux versions de vos process, utile comme alarme, pas comme note absolue. Vous lancez cette évaluation à la demande, depuis le Studio ou par `npm run eval` (en local, sur Ollama par défaut). C'est ce qui rend une base possédée **maintenable** dans la durée, plutôt qu'un simple amas de fichiers. → [détail](docs/learn/cycle-de-vie-expertise.md)

### Pour le contributeur

Maintenu activement par un mainteneur principal sous l'intendance d'AI Swiss, et conçu pour être facilement repris: licences irrévocables, cœur sans dépendance, tout testé et spécifié. La continuité est détaillée dans [GOVERNANCE](GOVERNANCE.md).

```bash
git clone https://github.com/ai-swiss/base.git && cd base && npm ci && npm run check
```

`npm ci` d'abord (durée variable selon le réseau), puis `npm run check` (typiquement 1 à 2 minutes); les invariants sont *gate-enforced*, pas aspirationnels (`npm run check` vérifie spec, typecheck, validate, route-test, hygiène doc, suite complète, ratchet de couverture). Pour changer un comportement, trouvez son `FR-*` dans `specs/current/10_core/` (la carte est [ARCHITECTURE.md](ARCHITECTURE.md)), lisez le test, changez code + spec + test ensemble. Par où commencer: [CONTRIBUTING](CONTRIBUTING.md). Que vous travailliez avec ou sans IA, la démarche est la même.

<details>
<summary><strong>Souveraineté linguistique, et les trois plans</strong></summary>

**Langue.** Les assistants fonctionnent dans n'importe quelle langue: le routage progressif, mené par le modèle, descend votre index quelle que soit la langue de la demande, sans grammaire par langue. La souveraineté est aussi linguistique. (Pour qui écrit les signaux de routage: [Écrire pour le routeur](docs/guides/ecrire-pour-le-routeur.md) dit comment servir plusieurs langues.)

**Trois plans** pour qu'un état actuel ne soit jamais confondu avec un plan: vérité = specs + code; changement = decisions + CHANGELOG; brouillon = `.plans` + `.reviews`. Détail dans [ARCHITECTURE.md](ARCHITECTURE.md).
</details>

---

## 9. Essayer, installer, connecter

### Sans terminal (le plus simple)

**Parlez à BASE.** Téléchargez le dossier (bouton vert **Code** → **Download ZIP**; sur Windows, «Extraire tout», un double-clic ne suffit pas), ouvrez-le dans un outil d'IA qui lit vos fichiers locaux *ou* attachez les fichiers dans un chat web. Demandez «explique-moi BASE», «aide-moi à démarrer une base pour mon activité» ou «par où contribuer?», et laissez l'IA mener le setup avec vous.

→ [Essayer sans installer](docs/start/essayer-sans-installer.md) · [Faire installer par votre IA](docs/start/installer-par-votre-ia.md) · [Récupérer BASE](docs/start/obtenir-base.md) · [Démarrage express](docs/start/quickstart.md) · [Installer un espace de travail](docs/start/installer.md)

Quoi lire, dans quel ordre, selon votre profil: [Lire dans quel ordre](docs/start/lire-dans-quel-ordre.md), la source de vérité des parcours de lecture.

*La racine du dépôt est le cadre lui-même. Pour un usage, ouvrez un dossier sous `exemples/`, ou lancez `base init` sur votre propre dossier.*

<details>
<summary><strong>L'alternative en ligne de commande</strong> (optionnelle, pour les personnes à l'aise techniquement)</summary>

```bash
base studio --root <dossier>      # l'atelier graphique, loopback http://127.0.0.1:5174
npm run docs:serve                # la documentation, en local
base route "<demande>"            # router une demande (plancher déterministe, local)
base validate                     # vérifier structure et liens
npm run eval                      # évaluer vos process (local, Ollama par défaut)
```

Connecter le serveur MCP à un outil d'IA: [mcp/](mcp/). Quickstart contributeur: `git clone … && npm ci && npm run check`.

*Rappel: la racine est le cadre; pour un usage, ouvrez un exemple.*
</details>

---

## 10. Aller plus loin

**Apprendre** (BASE embarque la documentation de la science appliquée de l'interaction humain-IA): [Lire dans quel ordre](docs/start/lire-dans-quel-ordre.md) (votre parcours selon votre profil) · [Tutoriel pas à pas](docs/tutoriel/index.md) (un office du tourisme, de A à Z) · [Co-penser avec l'IA](docs/learn/co-penser-avec-lia.md) · [La co-pensée en pratique, 16 principes](docs/learn/pratiques-co-pensee.md) · [L'adoption dans une organisation](docs/learn/adoption-organisation.md) · [Le cycle de vie d'une expertise](docs/learn/cycle-de-vie-expertise.md) · [Routage, process et ressources](docs/reference/routage-process-et-ressources.md)
<br><sub>Ce faisant, vous bâtissez votre <strong>littératie IA</strong> en la pratiquant: co-pensée, réflexes de vérification, distinction consigne / mécanisme. C'est un effet recherché, pas un à-côté.</sub>

**Contribuer:** [CONTRIBUTING](CONTRIBUTING.md) (par où commencer) · [DEVELOPING](DEVELOPING.md) (la forge, la commande unique) · [ARCHITECTURE](ARCHITECTURE.md) (la carte du code) · [specs/](specs/README.md) (le contrat, les `FR-*`)

**Confiance et sécurité:** [Preuves](docs/trust/evidence.md) (claims → tests → limites) · [Sécurité et limites](docs/trust/securite-et-limites.md) (modèle de menace, revue externe à venir) · [La frontière local / sortant](docs/trust/frontiere-local-vs-sortant.md) · [Souveraineté et confiance](docs/trust/souverainete-et-confiance.md) (défendre le choix devant une DSI)

**Signaler, échanger, demander de l'aide:** [issues](https://github.com/ai-swiss/base/issues/new/choose) (templates fournis) · [Discussions](https://github.com/ai-swiss/base/discussions) pour les questions ouvertes · vulnérabilités en privé via [SECURITY](SECURITY.md)

**Gouvernance et pérennité:** [GOVERNANCE](GOVERNANCE.md) (continuité, co-maintenance)

**Contexte:** [Lancement de BASE](docs/public/2026-06-25-lancement-base.pdf), document de contexte (Innovaud × AI Swiss, 25.06.2026, en français).

---

## Licence et attribution

Code sous **Apache-2.0**; documentation, agents, skills et exemples sous **CC BY 4.0** (double licence détaillée dans [LICENSING.md](LICENSING.md), textes complets dans [LICENSES/](LICENSES/)). Voir [GOVERNANCE](GOVERNANCE.md) · [Code de conduite](CODE_OF_CONDUCT.md) · [CONTRIBUTING](CONTRIBUTING.md).

Créé par **Charles-Edouard Bardyn** à AI Swiss (association à but non lucratif, intendance neutre vis-à-vis des modèles). Innovaud est partenaire dans l'articulation des exemples de cas d'usage entreprise.

BASE est une **amorce** que vous copiez, adaptez et faites grandir; la double licence vous y autorise pleinement. On peut bâtir par-dessus, jusqu'à une plateforme d'entreprise, sans toucher au cœur.
