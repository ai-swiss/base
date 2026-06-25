# BASE

[![CI](https://github.com/ai-swiss/base/actions/workflows/ci.yml/badge.svg)](https://github.com/ai-swiss/base/actions/workflows/ci.yml)
[![Licence: Apache-2.0 + CC BY 4.0](https://img.shields.io/badge/licence-Apache--2.0%20%2B%20CC%20BY%204.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A518-43853d.svg)](https://nodejs.org)

**Bâtir des Assistants avec une Structure d'Expertise**
*Build Assistants with Structured Expertise*

🇬🇧 [English version](README.en.md)

> **Reprenez la main sur votre travail avec l'IA.** BASE vous garde souverain sur la façon dont vous structurez et articulez cette collaboration: ce que l'IA doit savoir, ce qu'elle peut faire, ce que vous attendez, les instructions que vous lui donnez. Tout cela vit dans des fichiers que vous possédez et emportez d'un outil à l'autre. La souveraineté qui compte se joue **autour des modèles**, pas seulement dans vos serveurs.

**Par où entrer:** [Essayer maintenant](#essayer-maintenant) · [Pourquoi BASE](#pourquoi-base-existe) · [Pour votre profil](#pour-qui) · [Lire dans le bon ordre](#lire-dans-le-bon-ordre)

## Ce qu'apporte BASE

Articulez librement votre façon de penser et de travailler avec l'IA, de manière portable. Un assistant pour votre métier en découle.

Ce que BASE met entre vos mains, c'est la **structure de votre intelligence de travail**: ce que l'assistant sait, ce qu'il sait faire, ce qu'il doit vérifier, vos règles, vos instructions. Cette structure est posée en texte lisible, surtout du Markdown, à côté de vos données dans les formats qui vous arrangent. Vous la lisez et la modifiez comme une simple note, et la force vient de la façon dont elle est structurée, pas d'une plateforme.

L'enjeu n'est pas d'adopter un grand produit d'IA. Il est d'**organiser la collaboration humain-IA**: ce qu'elle doit savoir, ce qu'elle peut faire, ce qui doit être vérifié, ce qui doit rester portable et sous votre contrôle. C'est ce que BASE structure.

## Comment se présente un assistant

Pour comprendre ce que vous construisez, une image suffit. Un assistant BASE tient en quelques pièces lisibles:

- **une fiche de poste**: qui il est, et quoi faire selon la demande;
- **son savoir-faire et son savoir, séparés**: les *processes* (comment faire, étape par étape) d'un côté, les *compétences* (ce qu'il connaît de votre métier) de l'autre;
- **vos données**, à côté, dans des dossiers simples qu'il lit et propose de mettre à jour.

C'est cette séparation du savoir-faire et du savoir, bien plus que le mot «skill», qui fait la différence. Le détail complet est plus bas, dans la section «Comment ça fonctionne».

## Le plus simple: parlez-lui

Que vous vouliez **comprendre, utiliser ou contribuer**, le plus direct est de parler à BASE. Deux gestes suffisent.

1. **Téléchargez le contenu du dépôt** sur votre ordinateur (le ZIP, ou un clone). Tout est en fichiers texte, en local.
2. **Ouvrez ce dossier dans un outil d'IA qui lit vos fichiers locaux**, c'est-à-dire qui voit l'entièreté du dépôt, pas seulement un message que vous collez. Par exemple Claude Code, Cursor, Antigravity, GitHub Copilot ou OpenCode. Un chat web classique, lui, ne parcourt pas un dossier local (ChatGPT n'y accède qu'en mode développeur, via MCP). Dites-lui de charger `AGENTS.md`, puis demandez ce que vous cherchez: «explique-moi BASE», «aide-moi à démarrer pour mon métier», «par où contribuer?».

Il a alors accès à tout, vous oriente, et pose pour vous les questions utiles. Et pour une première victoire concrète en deux minutes, voici par où commencer.

## Votre première victoire, en 2 minutes

1. **Ouvrez un dossier d'exemple et regardez ce qu'il contient.** Prenez **`exemples/assistant-devis-demo/`** (ce dossier, pas la racine du dépôt) dans un outil d'IA capable de lire les fichiers de votre ordinateur. Parcourez `catalogue/regles-tarification.md` et `clients/dupont-sa.md`: vous voyez la matière dont l'assistant se nourrit.
2. **Posez la question, mot pour mot:** «Dupont SA a-t-il droit à la remise fidélité?»
3. **Observez.** L'assistant s'appuie sur ce que vous venez de voir, répond **non** (la remise fidélité demande deux mandats, Dupont SA en est à son premier). Conformément à sa consigne, il nomme les fichiers qui le justifient et pose un `[A VALIDER]`. Faute de vos règles, un assistant générique aurait servi un «oui» plausible. Ici, il a proposé et signalé ce qui reste à valider; il n'a rien changé à votre place.

Envie d'un document fini? Demandez ensuite «Montre-moi le devis DEV-2026-001». Rien à installer côté BASE; bloqué? dites «aide».

> **Outils.** N'importe quel outil d'IA capable de lire les fichiers de votre ordinateur convient, par exemple Claude Code, Cursor, Antigravity, GitHub Copilot ou OpenCode. Toutes les plateformes ne sont pas compatibles, et BASE n'en privilégie aucune.

<details>
<summary><strong>Autres portes d'entrée</strong>: selon votre situation</summary>

- **Apprendre en construisant** (30 min, chaque étape vérifiée): le [tutoriel «Apprendre en faisant»](docs/tutoriel/index.md), un office du tourisme de village, de A à Z.
- **Sans éditeur de code**: si vous avez une IA qui permet de téléverser des fichiers, c'est une voie possible pour tester. Voir [Essayer BASE sans rien installer](docs/start/essayer-sans-installer.md): ouvrez un exemple dans un chat IA web en y joignant ses fichiers.
- **Poser des questions à BASE**: ouvrez le contenu du dépôt dans une IA, chargez `AGENTS.md` (le point d'entrée) et demandez-lui de vous expliquer BASE et de poser, pour vous, toutes les questions utiles.
- **Que votre IA l'installe pour vous** (sans toucher un terminal vous-même): [Faites installer BASE par votre IA](docs/start/installer-par-votre-ia.md).
- **Encore plus court**: [voir BASE en action](docs/start/demo-60-secondes.md), en moins d'une minute.

La racine du dépôt, c'est le framework (le routeur et les outils pour bâtir ou auditer un BASE), pas un assistant prêt à l'emploi. Ouvrez toujours un dossier d'exemple.
</details>

---

## L'essentiel

L'IA a rendu la production presque sans effort. Mais elle ne supprime pas le besoin de contexte, de méthode, de vérification, de responsabilité et de mémoire: plus il devient facile de produire, plus il devient important de structurer ce qui guide la production.

C'est là que se joue la souveraineté qui compte. Pas seulement «où sont mes serveurs?», mais **autour des modèles**: qui possède l'articulation de votre façon de penser avec l'IA, vous ou votre fournisseur? Vos instructions, votre savoir, vos process forment la couche des interactions. C'est la souveraineté cognitive, et personne ne vous la rend si vous la cédez. BASE la garde dans des fichiers que vous possédez, indépendants du modèle: gardez votre suite IA pour l'exécution, possédez l'intelligence qu'elle exécute.

Concrètement, BASE vous aide à éviter quatre pertes de contrôle:

- **la souveraineté**: opérer sans posséder;
- **la compréhension**: délivrer sans intuition;
- **la durée**: déployer sans savoir maintenir;
- **la vérification**: produire sans contrôle.

La vérification, justement, n'est pas une garantie que BASE vous donnerait: c'est un savoir-faire que vous gardez, et que la structure rend tenable. Un *process* n'ouvre que les ressources utiles à une tâche (moins de bruit, moins de coût, une revue plus légère); les décisions importantes restent visibles (un `[A VALIDER]`, une proposition montrée avant toute écriture); et BASE distingue honnêtement une *consigne* (suivie par le modèle) d'un *mécanisme* (réellement appliqué par le code).

**Ce que BASE change, et pourquoi: [Pourquoi BASE](docs/learn/co-penser-avec-lia.md).** BASE ne se réduit pas à un format de fichiers: il embarque une documentation sur la façon d'interagir avec l'IA, cette science appliquée de la collaboration humain-IA qui fait la différence dans les usages réels.

> **Apprendre en faisant?** Construisez un assistant pour un office du tourisme de village en 30 minutes, sans rien installer côté BASE: [le tutoriel pas à pas](docs/tutoriel/index.md).

---

## Le routage: BASE va chercher le bon process

Une demande mal aiguillée charge tout, mélange tout, et noie les décisions qui comptent sous un mur d'instructions. BASE l'évite en routant vers **vos** process. Trois gestes, selon ce que vous savez déjà:

- **choisir un assistant** directement, si vous savez lequel;
- **formuler une demande centralisée**: BASE route vers le bon process quand plusieurs sont possibles;
- **ouvrir directement** l'assistant ou les sous-fichiers que vous voulez utiliser.

Le routeur peut aussi s'abstenir honnêtement, avec une raison lisible, plutôt que de deviner. Si rien ne correspond, il vous oriente vers un accueil au lieu de vous laisser sans suite. Voir [Routage, process et ressources](docs/reference/routage-process-et-ressources.md).

## Voir et soigner votre travail: Studio et la documentation

Au quotidien, vous travaillez dans votre outil d'IA, sur vos fichiers. À mesure que vos process s'accumulent, vous voudrez les **voir et les éditer d'un coup d'œil**, plutôt que de fouiller des sous-dossiers. Deux interfaces locales sont là pour ça, en agrément, jamais en obligation:

- **BASE Studio** (`npm run studio -- <dossier>`, sur `http://127.0.0.1:5174`, en loopback): parcourir et éditer vos ressources avec la même barrière propose puis commit, lancer une évaluation et lire les verdicts, et dialoguer avec un panneau de co-pensée. Voir [BASE Studio](tools/studio/ui/README.md).
- **La documentation, en local** (`npm run docs:serve`): une interface pour parcourir toute la documentation. Vous pouvez aussi demander à votre IA de lancer la commande pour vous.

---

## Pourquoi BASE existe

Cette technologie ne se comporte pas comme un logiciel numérique classique. On ne l'utilise pas seulement en cliquant sur des boutons ou en remplissant des champs. On interagit avec un système capable de produire des comportements linguistiques proches de ceux d'un interlocuteur: il reformule, généralise, infère, propose, se trompe avec assurance, et peut suivre une méthode si on la lui donne. Il ne pense pas pour autant comme un humain. La bonne conclusion: il demande une **méthode** pratique de collaboration, savoir quand, quoi et comment vérifier. C'est l'objet de [Pourquoi BASE](docs/learn/co-penser-avec-lia.md).

Une image utile est celle d'un **collègue venu d'ailleurs, amnésique**: il a une représentation riche du monde, mais pas du vôtre. Il comprend le langage, repère des régularités, se montre plus solide là où il a été le plus entraîné comme le code ou les maths, et peut aider vite. Mais il ne prend pas le café avec vous tous les matins: il ne connaît ni vos clients, ni vos contraintes, ni vos habitudes, ni votre seuil de risque, ni l'histoire de vos dossiers, et chaque conversation repart de zéro. Si rien n'est écrit, il improvise. Si tout est dispersé dans une interface, il devient difficile à maintenir. Donnez-lui un contexte structuré, et il travaille enfin dans votre réalité.

Le réflexe hérité du monde numérique consiste souvent à faire rentrer cette collaboration dans des interfaces complexes: agents configurés à la main, instructions réparties dans plusieurs écrans, permissions disséminées, combinaisons fragiles. BASE prend le chemin inverse: un point d'accès conversationnel simple, et la structure durable dans des fichiers lisibles, versionnables et portables. L'objectif n'est pas de remplacer les plateformes IA, mais de vous rendre propriétaire de la structure qui les rend utiles. Ce socle est aussi une pierre de fondation: on bâtit par-dessus, jusqu'à une plateforme d'entreprise solide, sans toucher au cœur.

> **Le contexte du lancement.** BASE a été présenté publiquement le 25 juin 2026 (Innovaud × AI Swiss). La présentation de cadrage est disponible comme document de contexte: [Lancement de BASE, la présentation](docs/public/2026-06-25-lancement-base.pdf) (en français seulement).

---

## Le scénario du lundi matin

Lundi matin. Un client vous demande un devis. Sur une plateforme web d'IA standard, vous réexpliquez votre activité pour la énième fois, vous obtenez une réponse approximative, vous corrigez, reformulez, corrigez encore, et finissez un bon moment plus tard avec quelque chose d'à peu près utilisable.

Avec des fichiers qui articulent votre savoir-faire, structurés en amont, il suffit de dire: «Nouveau devis pour Dupont SA, 3 jours de conseil en stratégie.» Vos process connaissent déjà vos prix, vos conditions, votre modèle de document. L'assistant correspondant propose un devis complet; il peut même vous challenger, vous inciter à valider, vous pousser à itérer. Et si vous bâtissez, au fil des échanges, quelque chose qui fonctionne et a la bonne granularité, vous tenez un actif puissant.

Cette structure ne tombe pas du ciel. Vous la **bâtissez au fil de vos échanges**: à chaque fois que vous touchez une information, vous la rangez à la bonne granularité, pour l'avoir à portée de main la prochaine fois. C'est un actif que vous affinez, et dont vous tirez parti à tout moment. Au passage, vous pouvez demander à BASE d'en faire l'entretien.

---

## Démo rapide et assistants prêts à configurer

BASE fournit une série d'exemples: des façons de structurer différents métiers. Ce ne sont que des exemples, et c'est volontaire. Ils montrent concrètement que ces structures sont simples et intuitives, des fichiers texte avec peu de rigidité. Surtout, pour un autre besoin, vous n'avez pas à les refaire à la main: demandez à BASE d'articuler quelque chose de similaire pour votre cas, et il vous propose une structure efficace, celle qui rend l'IA vraiment utile sur ce que vous voulez faire. Copiez un dossier, ouvrez-le, et formulez votre demande, par exemple «aide-moi à préparer un devis pour un nouveau client».

| Exemple                                                          | Ce qu'il fait pour vous                                                                    |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **[Démo devis pré-remplie](exemples/assistant-devis-demo/)**     | Montre un devis complet en moins d'une minute, avec des données fictives déjà prêtes |
| **[Assistant réflexion](exemples/assistant-reflexion/)**         | Structure une décision ou une question personnelle pour rendre les hypothèses vérifiables |
| **[Assistant devis](exemples/assistant-devis/)**                 | Prépare des devis professionnels à partir d'une demande client: prix, TVA, conditions, export optionnel |
| **[Assistant communication](exemples/assistant-communication/)** | Rédige vos posts LinkedIn et newsletters dans votre ton de voix                            |
| **[Assistant courrier](exemples/assistant-courrier/)**           | Rédige et répond à vos courriers et emails clients, dans le bon registre                   |
| **[Assistant RH](exemples/assistant-rh/)**                       | Publie des offres d'emploi, prépare les entretiens, évalue les candidats                   |
| **[Assistant projet](exemples/assistant-projet/)**               | Structure, planifie et suit vos projets avec jalons et points d'avancement                 |
| **[Assistant réunion](exemples/assistant-reunion/)**             | Transforme vos notes en comptes-rendus structurés et suit décisions et actions             |
| **[Assistant enseignant](exemples/assistant-enseignant/)**       | Prépare des séquences d'enseignement et des évaluations à partir de votre programme        |
| **[Starter personnel](exemples/starter-perso/)**                 | Un point de départ personnel dont vous précisez le rôle au fil de l'usage                  |
| **[Office du tourisme (Veytaux)](exemples/veytaux-tourisme/)**   | Exemple territorial de bout en bout, le fil rouge du tutoriel pas à pas                    |
| **[Routage PME](exemples/routage-pme/)**                         | Démontre le Router: process proches, ambiguïtés, contre-exemples et fixtures               |
| **[Agence multi-clients](exemples/agence-multi-clients/)**       | Un workspace multi-racines, un BASE par client                                             |

Chaque assistant est **prêt à configurer** et conçu pour vous garder la main: il vous pose des questions sur votre activité, vos services, vos règles, propose, et s'arrête là où vous avez demandé à valider. Le niveau de friction est celui que vous inscrivez dans ses instructions.

*Besoin d'un assistant pour un autre métier?* Ouvrez le dossier BASE et dites «Lis `.ai/agents/createur-agent/AGENT.md`». Le créateur d'assistant vous guide de A à Z, par la conversation. [Plus d'idées →](docs/guides/idees-agents.md)

> Côté outils d'IA, le mot technique pour ce que vous appelez un assistant est «agent» (d'où `AGENT.md` et `.ai/agents/`). BASE le réutilise par pragmatisme, pour que les outils s'y retrouvent, sans en faire le modèle mental du travail.

---

## Ce qui change face à une plateforme web d'IA standard

| Sur une plateforme web d'IA standard                  | Avec un assistant BASE                                     |
| ----------------------------------------------------- | ---------------------------------------------------------- |
| Vous réexpliquez votre contexte à chaque conversation | L'assistant s'appuie sur vos fichiers métier à jour |
| Les réponses sont génériques et approximatives        | Les réponses s'appuient sur vos process, sur ce que vous attendez, sur les données que vous avez pointées et les outils que vous autorisez |
| Vos échanges restent captifs, ni portables ni à vous  | Vos documents vivent dans vos dossiers, lisibles, versionnables, portables d'un outil à l'autre |
| L'IA devine ce que vous voulez                        | L'IA suit vos process, étape par étape                     |

## Pourquoi la vérification compte

Sur certains terrains, un vérificateur existe en dehors de vous: un compilateur pour le code, une preuve en mathématiques. Là, l'IA peut aller loin en autonomie, parce que l'erreur se détecte d'elle-même. Mais pour l'essentiel des tâches du quotidien, dans la plupart des métiers, le seul vérificateur possible, c'est vous. Comme avec ce collègue venu d'ailleurs et amnésique, il faut sans cesse interagir: pour recadrer, pour vérifier, pour garder l'intuition de ce qui se crée. Faire partie du processus, afin que la dette de vérification ne s'accumule pas et que vous restiez capable de juger, parce que c'est en travaillant avec l'IA qu'on développe l'intuition de ce qu'elle produit.

Traitez chaque réponse de l'IA comme une **hypothèse**, plus ou moins solide selon ce que vous lui avez donné: avec des instructions et des informations claires, elle s'appuie souvent fidèlement dessus; sans elles, elle improvise. Accepter sans vérifier, c'est accumuler une **dette de vérification**: des affirmations non testées qui s'effondrent au premier regard critique d'un client ou d'un partenaire.

C'est vous qui décidez du niveau de friction. BASE vous permet de placer des **points de décision** avant les écritures, les exécutions sensibles et les actions difficiles à annuler, et vous encourage à le faire au bon endroit. Pour juger où les poser et à quelle intensité, BASE embarque justement l'articulation de cette science appliquée de l'interaction humain-IA. Leur application mécanique dépend ensuite de l'outil et du passage par le broker, la CLI, le MCP ou un connecteur contrôlé; le routeur choisit le workflow, il n'applique pas les permissions. Les **marqueurs** (`[A VALIDER]`, `[DECISION]`) rendent l'état de votre travail cherchable en une seconde, même après des mois. Et si c'est utile, vous gardez une trace des échanges, non pas complète mais réglée au bon niveau: quelques grandes étapes, juste de quoi reprendre le travail plus tard. Vous améliorez ces process au fil du temps, en restant souverain. C'est le principe de la [co-pensée humain-IA](docs/learn/pratiques-co-pensee.md): on éprouve ce que l'IA produit avant de s'y fier.

## Des principes éprouvés pour collaborer avec l'IA

Bien collaborer avec l'IA n'est pas une intuition neuve. Cela s'appuie sur des idées éprouvées de longue date sur la façon d'articuler la communication et la coopération avec une entité qui n'est pas un autre soi, humaine ou non. Trois exemples qui valent encore:

- des **termes compatibles** pour échanger sans perte (Shannon, 1948);
- des **objectifs clairs**, sans quoi la collaboration échoue même quand l'autre est brillant (Locke & Latham, 1990);
- des **boucles de correction**, comme une réunion qui recadre (Wiener, 1948).

BASE met ces principes au travail avec l'IA. Le détail, principe par principe: [la co-pensée en pratique](docs/learn/pratiques-co-pensee.md).

## Pourquoi BASE, et pas…?

BASE n'est pas un produit d'IA de plus. C'est la **couche que vous possédez** sous l'outil que vous utilisez.

| Au lieu de… | Ce que vous gagnez avec BASE |
| ----------- | ----------------------------- |
| **Un chat générique, en vrac** | Votre contexte ne se réexplique plus à chaque session: il vit dans vos fichiers, repris d'une fois sur l'autre. |
| **Un assistant personnalisé de plateforme** | Vous n'êtes pas locataire d'une plateforme: votre savoir est articulé dans des fichiers portables, versionnables, qui marchent d'un outil d'IA à l'autre et survivent au prochain. |
| **Un assemblage d'agents à configurer** | Vous n'entretenez ni tuyauterie ni écrans de configuration: l'orchestration reste au modèle, et BASE structure le *quoi* (vos textes, vos process, vos garde-fous) que vous possédez, pas une mécanique à maintenir. |
| **Un seul gros `CLAUDE.md`** | Le routeur n'injecte que le bon process, pas tout, tout le temps; et il **sépare le savoir-faire du savoir**, au lieu d'un mur d'instructions qui finit en usine à gaz. |
| **Le format `SKILL.md` / `AGENTS.md` seul** | «Agent», «skill»: ce ne sont que des noms, la grammaire que les grands fournisseurs d'IA ont imposée aujourd'hui. L'essentiel est ailleurs: une **articulation libre et portable** qui suit *votre* fil de pensée, où un savoir-faire puise dans autant de fichiers et de textes que vous voulez. Vous ne pliez pas votre pensée à une grammaire rigide d'un skill par tâche; vous structurez juste ce qu'il faut pour retrouver, articuler et router votre savoir. C'est ça, la méthode de BASE, cette science appliquée de l'interaction humain-IA: tout se dit en fichiers texte, au fil de la pensée. Et par-dessus, vous greffez routage testé, validation, écriture médiée, évaluation. |
| **La recherche sémantique (RAG) seule** | L'accès à l'information est un **outil** pour l'IA: un modèle ne lance pas de lui-même une recherche coûteuse, il lui faut un moteur, et la recherche sémantique sert à ça (BASE peut s'en servir). Mais elle ne remplace pas l'articulation de votre savoir ni ce que vous attendez de l'IA. |

Le détail dans [Comprendre BASE](docs/learn/comprendre.md) et [le cadre public](docs/reference/framework-public.md).

---

## Pour qui?

| Niveau | Ce que BASE apporte | Ce qui reste à votre charge |
| ------ | ------------------- | --------------------------- |
| **Vie privée / personnel** | Reprendre la main pour organiser, avec l'IA, vos projets, vos documents, vos démarches, votre apprentissage ou vos tâches récurrentes, à partir de fichiers simples. | Choisir ce que vous confiez à l'outil IA, relire, décider, garder vos fichiers à jour. |
| **Start-up** | Une base solide pour s'approprier l'IA: partir de ses process personnels, faire remonter ceux qui servent à l'équipe, expérimenter vite et créer de nouveaux flux de travail qui font de la valeur. | Stabiliser ce qui devient répétable, éviter les promesses non vérifiées, protéger les données sensibles. |
| **PME / équipe** | Des workflows partagés, des ressources découvrables, une validation légère, un entretien régulier et une promotion Personal → Team. | Définir qui valide, versionner les fichiers, gérer les données sensibles. |
| **Grande entreprise** | Un cœur portable et durable, autour duquel se greffent facilement vos exigences: savoir, processus, ressources, connecteurs, et le réglementaire. | Ajouter IAM, SSO, RBAC, audit, rétention, DLP, SIEM et exigences réglementaires via vos systèmes enterprise. |

> **Pas sûr du bon point de départ?** Ne lisez pas un mode d'emploi: demandez-le à BASE. Ouvrez le projet, puis «je suis [un particulier, une PME, un développeur, une personne du secteur public, un curieux], par où commencer?». L'accueil vous conduit à la porte qui vous correspond.

BASE est clé en main pour démarrer localement, extensible pour grandir, et une grande organisation peut l'affiner sans changer les abstractions sous-jacentes: les mêmes abstractions servent du débutant à l'entreprise. Il ne remplace ni la politique de sécurité, ni l'IAM, ni l'archivage légal, ni la gouvernance documentaire d'une grande organisation.

---

## Combien ça coûte

BASE est gratuit et ouvert (code Apache-2.0, contenus CC BY 4.0). Ce que vous payez, c'est l'**outil d'IA qui l'exécute**, et vous avez le choix:

- **Gratuit et local.** Une bonne part du travail de connaissance courant (dialoguer, rédiger, reformuler, suivre un process cadré) tient déjà avec un **modèle libre tournant sur un bon ordinateur portable**: pas d'abonnement, et rien qui sorte vers un tiers.
- **Plus confortable avec un modèle de pointe** (ouvert ou propriétaire): l'expérience est plus fluide, en général à l'usage ou par abonnement.

Vous n'avez pas à trancher seul: pour choisir un modèle et une configuration adaptés à votre métier et à vos contraintes de données, **demandez à BASE de vous guider**, ou ouvrez la documentation (`npm run docs:serve`), qui traite ces questions de choix et de configuration.

---

## Lire dans le bon ordre

Vous n'avez pas besoin de tout comprendre pour commencer. **Quel que soit votre profil, commencez par [Pourquoi BASE](docs/learn/co-penser-avec-lia.md).** Cette boussole donne les premiers pas; le parcours complet par profil vit dans [Lire dans quel ordre](docs/start/lire-dans-quel-ordre.md), la source de vérité.

| Si vous êtes... | Commencez par | Ignorez au début |
| --------------- | ------------- | ---------------- |
| **Une personne seule, indépendant ou usage privé** | `README.md`, `docs/learn/co-penser-avec-lia.md`, `docs/start/quickstart.md` (ou `docs/start/essayer-sans-installer.md` si vous n'avez qu'un navigateur), puis un dossier dans `exemples/` | `mcp/`, `tools/`, `tests/`, `base.schema.json`, `base.manifest.json` |
| **Une PME ou petite équipe** | `README.md`, `docs/learn/co-penser-avec-lia.md`, `docs/start/quickstart.md`, `docs/audiences/kit-demarrage-pme-suisse.md` | `docs/reference/specification-v0.md` tant que vous ne concevez pas d'intégration |
| **Une grande entreprise** | `docs/learn/co-penser-avec-lia.md`, `docs/reference/framework-public.md`, `docs/audiences/kit-enterprise.md`, `docs/reference/etat-implementation.md` | Les exemples métier comme preuve d'usage, pas comme architecture finale |
| **Une institution publique** | `docs/trust/souverainete-et-confiance.md`, `docs/audiences/kit-administration-secteur-public.md`, `docs/trust/securite-et-limites.md` | Le mode navigateur seul pour des données personnelles ou sensibles |

Règle simple: pour essayer, partez de `exemples/`. Pour adapter, regardez `.ai/agents/`. Pour intégrer ou auditer, regardez `tools/`, `mcp/`, `tests/` et la spécification.

Les fichiers `CLAUDE.md` et `.cursor/rules/` ne sont pas le cœur de BASE: ce sont des adaptateurs pour que Claude Code et Cursor trouvent le bon assistant automatiquement. Pour un autre outil, **demandez à BASE comment le relier à votre système**. Le cœur portable reste dans `.ai/agents/`, les documents Markdown, les schémas et les commandes locales.

### Une note sur la langue

La documentation de BASE existe en français et en anglais (la version française fait foi; voir [Langues](docs/reference/langues.md)); l'allemand et l'italien sont bienvenus en contribution. Et **les assistants que vous construisez fonctionnent dans n'importe quelle langue**: le routage compare les mots d'une demande à ceux de vos propres assistants, sans grammaire ni lexique d'une langue donnée. Construisez votre assistant avec des mots-clés français, allemands, italiens ou anglais, et il route et répond dans cette langue. La souveraineté est aussi linguistique.

---

## Essayer maintenant

Chaque exemple est un dossier indépendant dans `exemples/`. Téléchargez-le, ouvrez-le dans votre outil d'IA, puis formulez votre demande, par exemple «aide-moi à préparer un devis pour un nouveau client».

| Outil | Comment démarrer |
| ----- | ---------------- |
| **Cursor** | Ouvrez un dossier d'exemple comme projet, puis dites votre demande dans le chat. `.cursor/rules/` charge l'assistant. |
| **Claude Code** | Lancez `claude` dans le dossier d'un exemple, puis dites votre demande. `CLAUDE.md` donne le contexte. |
| **ChatGPT, Claude Desktop et autres apps** | Via le [serveur MCP](mcp/). Pour l'installer, ouvrez la documentation (`npm run docs:serve`) ou demandez simplement à BASE de vous guider; il expose alors les ressources locales que vous choisissez de connecter. |
| **Codex, Windsurf, Antigravity, GitHub Copilot, OpenCode…** | Chargez `AGENT.md` comme contexte. La découverte automatique des compétences dépend de l'outil. |

Toutes les plateformes ne sont pas compatibles, et BASE n'en privilégie aucune: choisissez celle que vous préférez. [Obtenir BASE (ZIP, clone, copie d'exemple) →](docs/start/obtenir-base.md) · [Guide d'installation →](docs/start/installer.md) · [Guide express →](docs/start/quickstart.md) · [Tutoriel pas à pas →](docs/tutoriel/index.md)

**Vous êtes une PME ou une petite équipe?** Avant de partager un assistant, lisez le [kit de démarrage PME suisse](docs/audiences/kit-demarrage-pme-suisse.md): données autorisées, validation humaine, versioning simple et entretien mensuel.

**Vous avez déjà une base structurée comme dans BASE?** Dites «Fais l'entretien de ma base». L'assistant vérifie les liens, les marqueurs ouverts, les descriptions manquantes et les ressources à promouvoir, puis attend votre validation avant toute modification.

---

## Comment ça fonctionne

Reprenons la structure vue plus haut, en détail. Un assistant réunit une fiche de poste, son savoir-faire et son savoir séparés, et vos données à côté.

```
AGENT.md                          La fiche de poste : qui il est, que faire selon la demande
    │
    ├── skills/
    │   ├── processes/            Le savoir-faire : comment faire X, étape par étape
    │   └── competences/          Le savoir : ce qu'il connaît de votre métier
    │
    ├── templates/                Les formulaires : à quoi ressemblent les documents
    │
    └── tools/                    La boîte à outils : scripts (optionnel)
```

Ce squelette est volontairement minimal: tout le reste est libre. Autour, vous placez les fichiers que vous voulez comme contexte (un document Word, un PowerPoint, un tableur, ce que vous manipulez déjà), comme matière à discuter dans la marche à suivre que vous articulez avec l'IA. Vous pouvez même donner accès à certaines tables d'une base de données, pour peu que l'outil correspondant existe (en entreprise, c'est souvent l'IT qui le fournit). BASE structure la marche à suivre; le matériau, lui, reste le vôtre, dans ses formats.

Les données métier (votre activité, vos clients, vos documents) vivent **à côté**, dans des dossiers simples. L'assistant les lit et propose de les créer ou de les mettre à jour. Les actions sensibles passent par un point de décision; les garanties strictes exigent un outil ou un connecteur qui médie réellement l'action.

Le savoir-faire et le savoir s'écrivent au format **SKILL.md**, un fichier Markdown lisible, de plus en plus reconnu par les outils d'IA. Certains harnesses les découvrent nativement, d'autres demandent de pointer l'assistant vers les fichiers pertinents; le format reste portable même quand l'intégration varie. La distinction compte: une liste de compétences ne dit pas quel process suivre ni quelles connaissances ouvrir pour bien l'exécuter. BASE route donc d'abord vers un process; les compétences, outils, templates et données sont ensuite référencés ou découverts comme ressources de contexte.

## CLI locale

BASE inclut une CLI légère pour les usages Personal/PME et les premiers contrôles d'équipe. Ces commandes sont optionnelles pour essayer un exemple, mais utiles pour maintenir un BASE fiable.

Par défaut, la CLI détecte la racine BASE la plus proche depuis le dossier courant (`.ai/` ou `base.manifest.json`) et l'affiche, par exemple `BASE root: .`. Pour les scripts, la CI et les dossiers ambigus, gardez `--root <dossier>`. Pour plusieurs racines explicites, utilisez un `base.workspace.json`.

Au cœur du dépôt (entretien du framework):

```bash
npm install
npm run validate                 # structure et liens du dépôt
npm run index                    # (re)génère base.manifest.json (projection dérivée)
npm run entretien                # rapport d'entretien (marqueurs ouverts, descriptions manquantes)
node tools/base.mjs route-test --root .   # rejoue les routes attendues du dépôt
```

Sur un assistant (ici la démo devis; `--root` cible n'importe quel dossier d'assistant):

```bash
ex=exemples/assistant-devis-demo
node tools/base.mjs discover "devis client" --root $ex
node tools/base.mjs route "Je dois préparer une proposition commerciale pour un prospect" --root $ex
node tools/base.mjs open calculer-devis --projection metadata --root $ex
node tools/base.mjs invoke calculer-devis devis/DEV-2026-001.json --root $ex   # dry-run par défaut
```

`base invoke` fait un dry-run par défaut: il montre l'action prévue avant toute exécution. `base propose` montre un diff sans rien écrire; `base commit` applique après votre validation (confirmation par défaut, paramétrable par ressource). Le Router choisit un assistant et un process, ou s'abstient avec une raison lisible; il ne charge pas toutes les instructions.

> **Souveraineté des données.** Par défaut, le routage est **100 % local** (lexical, zéro réseau). Le routage sémantique optionnel peut, **si vous l'activez explicitement**, envoyer du texte à un fournisseur d'embeddings, jamais par défaut, et vous choisissez quoi envoyer (option locale Ollama disponible). Détail: [Sécurité et données du routage](docs/trust/securite-donnees-routage.md).

Pour les corpus plus difficiles, le package officiel `@ai-swiss/base-ranker-semantic` ajoute un ranker à vrais embeddings, sans alourdir le cœur. Pour les très grands corpus, `@ai-swiss/base-index-local` fournit un index dérivé et supprimable (voir `docs/guides/routage-semantique-quickstart.md` et `docs/learn/comprendre-echelle.md`).

## Évaluer un assistant

L'évaluation (`base eval`) mesure un assistant en conditions réelles: un utilisateur simulé (un modèle) dialogue avec le process via le vrai broker, puis un juge indépendant (un autre modèle) note la conversation au regard des objectifs du scénario. Le verdict est structuré (résultat, mode d'échec, gravité, preuves, piste de correction) et tourne en local avec Ollama, sans clé. Voir [tools/eval/README.md](tools/eval/README.md).

```bash
npm run eval -- --root exemples/assistant-devis --agent assistant-devis \
  --process nouveau-devis --scenarios exemples/assistant-devis/.ai/experiments/scenarios/ \
  --ollama --model qwen3.5:9b-q4_K_M --json-mode
npm run studio -- exemples/assistant-devis    # http://127.0.0.1:5174 (onglet Évaluations)
```

## Portable entre outils d'IA

| Plateforme | Fonctionnement |
| ---------- | -------------- |
| **Cursor** | Ouvrez le dossier comme projet. `.cursor/rules/` charge l'assistant selon les règles du projet. |
| **Claude Code (terminal)** | Lancez `claude` dans le dossier. `CLAUDE.md` donne le contexte de départ. |
| **Claude Code (extension)** | Ouvrez un chat et pointez vers le chemin de `AGENT.md`. |
| **ChatGPT, Claude Desktop** | Via le [serveur MCP](mcp/). Pour l'installer, ouvrez la documentation (`npm run docs:serve`) ou demandez à BASE de vous guider; il expose alors les ressources locales que vous choisissez de connecter. |
| **Codex, Windsurf, Antigravity, GitHub Copilot, OpenCode…** | Chargez `AGENT.md` comme contexte. La découverte automatique des compétences dépend de l'outil. |

Pas de base de données obligatoire. Des fichiers texte, principalement Markdown, qui restent lisibles partout. Votre assistant est **portable**: changez d'outil quand vous voulez, vos fichiers restent.

---

## Aller plus loin

| Ce que vous voulez | Où aller |
| --- | --- |
| La raison d'être de BASE | [Pourquoi BASE](docs/learn/co-penser-avec-lia.md) |
| Apprendre en faisant | [Tutoriel pas à pas](docs/tutoriel/index.md) |
| Les principes de la co-pensée | [La co-pensée en pratique (16 principes)](docs/learn/pratiques-co-pensee.md) |
| Savoir quoi lire selon votre profil | [Lire dans quel ordre](docs/start/lire-dans-quel-ordre.md) |
| Confiance, sécurité et preuves | [Sécurité et limites](docs/trust/securite-et-limites.md) · [Preuves](docs/trust/evidence.md) |
| Souveraineté et conformité | [Souveraineté, confiance et conformité](docs/trust/souverainete-et-confiance.md) |
| Évaluer et soigner vos assistants | [BASE Studio](tools/studio/ui/README.md) · [Évaluation](tools/eval/README.md) |
| La documentation interactive | [Documentation interactive](docs/reference/documentation-interactive.md) |
| Déployer en organisation ou en administration | [Kit entreprise](docs/audiences/kit-enterprise.md) · [Kit secteur public](docs/audiences/kit-administration-secteur-public.md) |
| Le cadre public et les couches | [Cadre public BASE](docs/reference/framework-public.md) |
| La vision et la contribution | [Manifeste](MANIFESTO.md) · [Contribuer](CONTRIBUTING.md) |

Le reste se trouve par profil dans [Lire dans quel ordre](docs/start/lire-dans-quel-ordre.md), ou en parcourant la [documentation](docs/).

### Structure du projet

Arborescence non exhaustive (le détail complet est dans la [documentation](docs/)):

```
base/
│
├── docs/                              Apprendre l'approche
│   ├── start/                         Premiers pas, installation, quickstart, parcours de lecture
│   ├── learn/                         Concepts, philosophie, principes et passage à l'échelle
│   ├── guides/                        Guides pratiques: routage, providers, diffusion, idées métier
│   ├── audiences/                     PME, entreprise, institution publique, profils d'usage
│   ├── reference/                     Cadre public, CLI/docs, compatibilité, versioning, langues
│   ├── trust/                         Sécurité, souveraineté, preuves, limites et licence
│   ├── public/                        Presse, matériaux publics et présentation de lancement
│   └── en/                            Traduction anglaise de la documentation
│
├── BASE_BOOTSTRAP.md                   Bootstrap générique pour harness IA
├── base.schema.json                    Schéma progressif des ressources BASE
├── LICENSE                             Double licence : code Apache-2.0, contenus CC BY 4.0
├── SECURITY.md                         Politique de signalement et périmètre sécurité
├── CONTRIBUTING.md                     Adapter et réutiliser sans alourdir
├── tools/                             CLI locale, Studio, évaluation, génération de doc
├── tests/                             Tests du contrat public et des garde-fous
├── specs/                             Spécification d'ingénierie (UR/FR/NFR/AD, schémas)
├── packages/                          Packages officiels optionnels (ranker sémantique, index local)
├── base.manifest.json                  Index généré par `base index`, régénérable
│
├── exemples/                          Exemples indépendants (copiez et utilisez)
│   ├── assistant-devis-demo/          Démo pré-remplie avec devis déjà généré
│   ├── assistant-devis/               Générateur de devis pour PME
│   ├── assistant-communication/       Rédaction LinkedIn, newsletters, communication
│   ├── assistant-courrier/            Courriers et emails clients : rédaction et réponse
│   ├── assistant-rh/                  Recrutement, offres d'emploi, entretiens
│   ├── assistant-projet/              Gestion de projets
│   ├── assistant-reflexion/           Réflexion personnelle : structurer pour valider
│   ├── assistant-reunion/             Comptes-rendus de réunion, suivi des décisions et actions
│   ├── assistant-enseignant/          Séquences d'enseignement et évaluations
│   ├── starter-perso/                 Point de départ personnel à préciser au fil de l'usage
│   ├── veytaux-tourisme/              Office du tourisme de village (fil rouge du tutoriel)
│   ├── routage-pme/                   Routage déterministe : process proches, contre-exemples, fixtures
│   └── agence-multi-clients/          Workspace multi-racines, un BASE par client
│
├── mcp/                               Serveur MCP (connecter à ChatGPT, Claude Desktop, etc.)
├── CLAUDE.md                           Adaptateur Claude Code, pas le cœur du framework
├── .cursor/rules/                      Adaptateur Cursor, pas le cœur du framework
│
└── .ai/agents/                        Le framework
    ├── concierge-base/               Accueil et aide BASE (cible de repli du routeur)
    ├── createur-agent/                Créez votre propre assistant par la conversation
    │   └── skills/
    │       ├── processes/             /creer-agent, /ameliorer-agent, /diagnostic
    │       └── competences/           architecture, exemples, outils-connus
    └── _template/                     Base de copie pour nouveaux assistants
        └── skills/
            ├── processes/             Templates de workflows
            └── competences/           Marqueurs, journal, communication (standard)
```

---

BASE est un framework **créé par Charles-Edouard Bardyn** (Directeur Scientifique, VP et cofondateur d'[AI Swiss](https://a-i.swiss), association suisse indépendante à but non lucratif) et aujourd'hui **maintenu par un mainteneur principal**, sous l'intendance d'AI Swiss et ouvert à la contribution et à la co-maintenance. [Innovaud](https://innovaud.ch) est partenaire du projet et a contribué à amorcer les exemples métier pour PME.

BASE est pensé comme une **amorce**: un point de départ que vous **forkez, adaptez et faites grandir** dans la direction qu'il trace. Il est conçu pour servir de socle à une architecture d'IA souveraine et portable. La double licence (Apache-2.0 pour le code, CC BY 4.0 pour les contenus) vous y autorise pleinement: reprenez-le pour démarrer une multitude de projets, personnels ou collectifs, et gardez vos fichiers à vous.

Licence: code sous Apache-2.0; documentation, agents, skills et exemples sous CC BY 4.0. Voir `LICENSE`.
