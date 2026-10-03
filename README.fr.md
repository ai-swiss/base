# BASE

[English](README.md) · **Français**

> **Pour une IA qui lit ce dépôt à la demande de quelqu'un**, avec ses documents (la transcription d'une réunion, des procédures, des règles écrites pour une IA): commencez par [PARTIR-DE-CE-QUE-VOUS-AVEZ.md](https://raw.githubusercontent.com/ai-swiss/base/main/PARTIR-DE-CE-QUE-VOUS-AVEZ.md) et suivez-le. Il montre à la personne ce qu'un assistant ferait pour elle, avant toute construction.

<p align="center">
  <img src="docs/public/assets/base-logo.png" alt="BASE" width="480">
</p>

> **Votre méthode de travail doit survivre aux outils d'IA. Vos compétences aussi.**

Par **méthode de travail**, BASE entend ici les éléments qui précisent comment un travail doit être conduit: les étapes à suivre, les sources qui font foi, les règles à appliquer, les contrôles à effectuer et les décisions qui doivent rester humaines.

Dans beaucoup de logiciels, une façon de travailler doit être traduite en écrans, menus, paramètres et automatisations propres à l'outil. Avec l'IA, une autre approche devient possible: **décrire directement en langage naturel le comportement que l'on attend.**

BASE organise cette description dans des fichiers lisibles, modifiables et versionnables que vous contrôlez. Votre façon de travailler n'est donc pas définie uniquement dans les réglages d'une plateforme ou les instructions d'un modèle particulier.

**La méthode est définie principalement hors de la plateforme qui l'exécute.**

**BASE est un cadre ouvert pour façonner, documenter et faire évoluer la méthode qui guide la manière dont des outils d'IA travaillent avec vous. Il comprend une proposition de standard ouvert et une implémentation de référence.**

Vous décrivez le travail. L'IA vous aide à en préciser les règles et à les structurer. Vous relisez et approuvez la version de référence. Un autre outil capable d'utiliser cette structure peut ensuite s'appuyer sur la même méthode.

Les modèles et les intégrations restent différents: ils peuvent interpréter les mêmes consignes différemment et disposer de capacités différentes. **Ce qui devient portable n'est pas le comportement exact du modèle, mais la méthode avec laquelle vous cherchez à le façonner.**

---

## 1. Décrivez le travail, pas l'outil

Avec BASE, vous commencez par expliquer comment le travail doit être fait, pas par configurer l'interface qui l'exécutera.

Vous pouvez commencer par parler du travail lui-même:

> «Nous préparons des offres commerciales. Voici comment nous travaillons, les documents que nous utilisons et les décisions qui doivent rester chez nous. Aide-moi à structurer cela.»

L'outil d'IA vous aide à rendre explicite ce qui compte: quelle grille tarifaire fait foi, quand appliquer une règle, quels contrôles effectuer, ce qui peut être automatisé et ce qui doit rester soumis à une décision humaine.

BASE transforme progressivement ce dialogue en une structure durable: procédures, règles, sources, contrôles et limites de délégation sont décrits dans les fichiers du projet. Vous pouvez les lire, les modifier, les versionner et les transmettre.

Vous pouvez ensuite simplement demander:

> «Prépare une offre pour Dupont SA, trois jours de conseil en stratégie.»

L'assistant utilise la méthode de référence, consulte les sources qu'elle désigne et signale les décisions qui doivent encore être prises par une personne.

Et si son comportement doit changer, vous pouvez le dire dans les termes du travail:

> «Ne me demande plus si la remise fidélité est possible lorsque la fiche client permet déjà de le déterminer. Vérifie la règle tarifaire et demande une validation seulement en cas de dérogation.»

L'outil peut proposer la modification correspondante de la méthode de référence. Après votre approbation, cette évolution ne reste pas enfermée dans la conversation: elle devient une partie explicite et versionnée de votre façon de travailler avec l'IA.

**Vous ne configurez donc pas seulement un outil. Vous développez, en langage naturel, une méthode de collaboration avec l'IA que vous pouvez conserver et réutiliser ailleurs.**

Changer de modèle ou de plateforme peut nécessiter une adaptation, de nouvelles permissions ou de nouveaux tests, et les résultats peuvent varier. **Mais la méthode de référence reste disponible: vous n'avez pas à la redéfinir entièrement dans l'interface et les réglages du nouvel outil.**

### Une démonstration vérifiable

Ouvrez [`exemples/assistant-devis-demo/`](exemples/assistant-devis-demo/) dans un outil d'IA qui lit les fichiers, puis demandez:

> «Dupont SA a-t-il droit à la remise fidélité?»

La réponse attendue est **non**: la règle exige deux mandats signés; la fiche client n'en mentionne qu'un. L'assistant doit citer la [règle tarifaire](exemples/assistant-devis-demo/catalogue/regles-tarification.md) et la [fiche client](exemples/assistant-devis-demo/clients/dupont-sa.md), puis signaler que toute dérogation reste à valider par une personne.

[Voir le parcours détaillé](docs/start/demo-60-secondes.md) · [Parcourir tous les exemples](exemples/)

---

## 2. Choisir votre point de départ

### Essayer sans installation

Téléchargez le [pack de démonstration](https://github.com/ai-swiss/base/releases/latest/download/assistant-devis-demo.pack.md), joignez-le à ChatGPT ou Claude et demandez:

> «Que dois-tu me faire valider avant de créer ou modifier un devis?»

[Essayer dans un navigateur](docs/start/essayer-sans-installer.md)

### Construire à partir d'un travail que vous connaissez

[Confiez l'installation de BASE et l'initialisation de votre dossier à votre outil d'IA](docs/start/installer-par-votre-ia.md), puis dites:

> «Voici le travail que je veux structurer avec BASE. Aide-moi à préciser la méthode, propose les fichiers nécessaires et attends mon accord avant de les créer.»

`base init` affiche d'abord ce qu'il propose de créer, sans modifier le dossier. Après vos choix et votre accord, une seconde invocation avec `--yes` crée les fichiers prévus sans écraser ceux qui existent déjà.

Vous n'avez pas besoin d'apprendre le format BASE avant de commencer.

### Partir de ce que vous avez

Un dossier de procédures, la transcription d'une discussion sur vos besoins, un `CLAUDE.md` déjà écrit: ouvrez-le dans votre outil d'IA, indiquez-lui où se trouve BASE, et dites:

> «Voici ce que nous avons. Montre-moi ce qu'un assistant pourrait faire pour nous.»

L'outil reconnaît d'où vous partez, lit, puis prépare une fiche à relire dans le navigateur, écrite dans les mots de votre travail: ce qu'il a compris, ce que l'assistant ferait (oui, plus tard, non), comment ce serait rangé, ce qu'il ne fera jamais, ce que l'IA ne réglera pas. Avant que vous ayez renvoyé vos réponses, seule cette fiche s'écrit, sous `.temp/`, un dossier que git ignore; la construction ou la conversion des documents vient ensuite, proposée séparément.

Sans aucun outil installé, si votre chat d'IA sait lire une adresse web, donnez-lui avec vos documents l'adresse du fichier d'entrée, https://raw.githubusercontent.com/ai-swiss/base/main/PARTIR-DE-CE-QUE-VOUS-AVEZ.md, et demandez-lui de le suivre: il vous rend la même fiche. Sinon, joignez-lui [PARTIR-DE-CE-QUE-VOUS-AVEZ.md](PARTIR-DE-CE-QUE-VOUS-AVEZ.md) avec vos documents.

[Récupérer BASE](docs/start/obtenir-base.md) · [Démarrage express](docs/start/quickstart.md) · [Tutoriel pas à pas](docs/tutoriel/index.md)

> **Coût.** BASE est gratuit. Le coût d'exécution, les limites d'usage et le traitement des données dépendent du modèle et de l'outil choisis.

---

## 3. Des documents ne constituent pas une méthode

Un modèle produit une réponse à partir de la demande et du contexte qui lui sont fournis. Si ce contexte ne précise pas la procédure à suivre, les sources qui font autorité, les contrôles requis ou les décisions à laisser à une personne, le modèle doit les déduire ou s'en passer.

Ajouter des documents augmente la quantité d'information disponible. **Cela ne dit pas au modèle quels documents font foi, quand les consulter, dans quel ordre agir ni quand s'arrêter pour demander une décision humaine.**

On peut donc posséder tous les documents nécessaires et perdre malgré tout les instructions qui expliquaient comment les utiliser ensemble.

Dans une structure BASE, ces relations sont décrites explicitement dans des fichiers: quelle procédure mobilise quelles sources, quelles règles s'appliquent, quels contrôles sont requis et quelles décisions restent humaines.

Cette séparation change aussi le lieu où la méthode est définie. Elle n'existe plus seulement dans les réglages, les prompts ou l'interface d'une plateforme donnée. La plateforme devient un contexte d'exécution parmi d'autres; les fichiers BASE restent la référence commune.

Cela ne rend pas les modèles interchangeables. Cela permet de changer de modèle ou d'outil sans devoir redéfinir toute sa façon de travailler dans une nouvelle interface.

L'hypothèse peut être testée: expliciter ces éléments réduit ce qui reste implicite dans le contexte fourni au modèle. L'effet réel sur la qualité, le temps de travail ou le coût d'une migration doit toutefois être mesuré pour chaque tâche, modèle et intégration.

Changer de fournisseur peut exiger un autre adaptateur, d'autres permissions ou de nouveaux tests, et deux modèles ne produiront pas nécessairement le même résultat. BASE ne supprime donc pas la dépendance à l'outil d'exécution.

Il permet en revanche de conserver, hors de cet outil, une description de référence de la méthode de travail et des limites de délégation.

BASE appelle **souveraineté cognitive** la capacité à conserver et à faire évoluer cette description de référence indépendamment de la plateforme d'exécution.

![BASE: reprendre la main sur l'IA. Une personne travaille sous un dôme transparent au milieu d'un flux d'outils et d'informations.](docs/public/assets/base-cognitive-sovereignty.png)

---

## 4. Ce que BASE représente

Pour décrire un travail, BASE peut distinguer:

- **l'intention**: le résultat recherché et ses contraintes;
- **la procédure**: les étapes à suivre et les conditions d'arrêt;
- **les connaissances**: les règles et explications réutilisables;
- **les sources**: les documents ou systèmes qui font autorité;
- **les données métier**: les informations propres au cas traité;
- **les contrôles**: les vérifications fondées sur une règle, une source, un calcul, un test ou une décision humaine;
- **les décisions humaines**: les décisions que l'assistant peut préparer mais ne doit pas prendre.

Les rôles et les procédures sont décrits en Markdown. Les sources, les données, les modèles de résultat et les outils peuvent conserver le format adapté à leur usage.

Dans BASE, un **agent** sert de point d'entrée et un **process** décrit une procédure. La spécification ouverte et versionnée [`base.resource.v1`](docs/reference/le-standard.md), au cœur de la proposition de standard, décrit comment déclarer ces ressources, leurs références et leurs relations. L'implémentation de référence peut les inventorier, vérifier leur structure et les rendre accessibles à d'autres outils.

Cette organisation n'oblige pas à construire un système complexe. Un premier assistant peut reposer sur un rôle, une procédure et quelques fichiers. Les responsables, dates de révision, niveaux de sensibilité ou contrôles supplémentaires ne sont utiles que lorsqu'un besoin réel les justifie.

Cette structuration rend explicites, et donc plus faciles à transmettre, plusieurs compétences du travail avec l'IA: formuler le résultat recherché, choisir le contexte, désigner les sources qui font autorité, limiter la délégation, vérifier le résultat et conserver les décisions humaines.

BASE aide à documenter ces choix. Il ne garantit pas qu'ils soient corrects.

[Pourquoi dépasser le simple agent](docs/learn/au-dela-des-agents.md) · [Co-penser avec l'IA](docs/learn/co-penser-avec-lia.md) · [Modèle orienté par l'intention](docs/reference/modele-de-calcul-oriente-par-l-intention.md)

### Une même méthode documentée, plusieurs contextes d'exécution

Une organisation peut utiliser BASE pour décrire les procédures, connaissances, sources, contrôles et limites de délégation qu'elle veut rendre accessibles à ses outils d'IA.

BASE ne remplace ni l'ERP, ni les bases de données, ni les applications métier. Il décrit quelles ressources doivent intervenir dans un travail donné et comment elles se rapportent à la procédure.

La même méthode de référence peut ensuite être utilisée dans plusieurs contextes. Une fonction d'IA intégrée à un ERP peut, par exemple, ne recevoir que la procédure de devis et les règles tarifaires. Un outil plus avancé peut consulter les mêmes fichiers tout en ayant accès à davantage de sources et d'actions. Un service interne peut y accéder par MCP.

Chaque intégration détermine ce que le modèle peut réellement lire ou faire.

**Partager la même méthode de référence ne signifie donc pas obtenir le même comportement partout.** Changer de modèle ou d'outil peut nécessiter de nouveaux adaptateurs, de nouvelles permissions et de nouveaux tests. Les résultats peuvent différer.

Ce qui reste commun est la description versionnée de la méthode; son interprétation et son exécution peuvent varier.

---

## 5. Ce qui est garanti, ce qui ne l'est pas

BASE distingue deux niveaux.

Une **consigne** exprime en texte un comportement attendu. Son application dépend de l'interprétation du modèle.

Un **mécanisme** applique une règle par du code. Son effet n'est garanti que pour les actions qui passent par le composant concerné.

L'implémentation de référence fournit notamment:

- une carte que l'intégration peut présenter au modèle afin qu'il choisisse une procédure ou s'abstienne;
- un routeur déterministe séparé pour les tests et les appels sans modèle;
- une recherche de passages citables dans les corpus structurés;
- une validation de la structure et des liens;
- une écriture médiée en deux temps, avec confirmation requise par défaut;
- un filtrage, avant un modèle distant, des ressources que la configuration désigne comme non transmissibles;
- un serveur MCP pour les intégrations, un atelier Studio pour la revue et un dispositif qui rejoue des scénarios et vérifie des critères explicites.

Ces mécanismes ne protègent que les actions qui passent par eux. Le filtrage ne s'applique qu'aux chemins d'exécution qui l'utilisent; une lecture directe des fichiers peut donc contourner cette protection. Séparer les instructions des données ne suffit pas non plus à protéger contre l'injection de prompt.

BASE ne remplace ni la gestion des accès, ni la protection des données, ni l'archivage, ni les obligations de conformité. Il n'a pas encore fait l'objet d'une revue de sécurité indépendante.

Une vérification indépendante d'une génération exige un critère qui ne soit pas simplement une nouvelle génération: une source, une règle, un calcul, un test ou le jugement d'une personne responsable.

Demander au même modèle de relire sa propre réponse sans lui fournir de nouvel élément produit une seconde génération. Cela ne constitue pas, à lui seul, une preuve indépendante.

Rejouer les mêmes scénarios avec plusieurs modèles permet de comparer les résultats et d'identifier ce qui reste stable ou dépend du modèle, de l'outil ou de l'intégration. C'est une manière d'éprouver la portabilité de la méthode.

BASE ne publie actuellement aucune mesure générale démontrant une réduction des erreurs, du temps de travail ou du coût de migration.

[Mécanismes contre consignes](docs/trust/mecanismes-vs-consignes.md) · [Sécurité et limites](docs/trust/securite-et-limites.md) · [Preuves](docs/trust/evidence.md) · [Compatibilité des outils](docs/reference/compatibilite-harnesses.md)

---

## 6. Trouver la documentation correspondant à votre besoin

Ce README présente la proposition générale. Pour aller plus loin:

- **Comprendre le fonctionnement de BASE:** [lire la documentation dans l'ordre](docs/start/lire-dans-quel-ordre.md);
- **Évaluer BASE sur vos propres fichiers:** [partir de ce que vous avez](#partir-de-ce-que-vous-avez);
- **Construire un assistant:** [démarrage express](docs/start/quickstart.md) et [tutoriel](docs/tutoriel/index.md);
- **Structurer un corpus de connaissances:** [guide des passages citables](docs/guides/structurer-un-corpus-de-connaissance.md);
- **Structurer les méthodes et connaissances d'une organisation:** [standard proposé](docs/reference/le-standard.md), [guide d'adoption](docs/learn/adoption-organisation.md) et [cadre public](docs/reference/framework-public.md);
- **Intégrer BASE à un outil ou une application:** [compatibilité](docs/reference/compatibilite-harnesses.md), [architecture](ARCHITECTURE.md) et [serveur MCP](docs/start/installer-mcp.md);
- **Examiner les limites, les preuves et l'état réel de l'implémentation:** [limites](docs/trust/securite-et-limites.md), [preuves](docs/trust/evidence.md) et [état de l'implémentation](docs/reference/etat-implementation.md);
- **Contribuer:** [guide de contribution](CONTRIBUTING.md), [développement](DEVELOPING.md), [spécifications](specs/README.md) et [gouvernance](GOVERNANCE.md).

Un outil d'IA capable de lire cette page et d'en suivre les liens peut lui aussi atteindre les documents correspondant à une question donnée.

---

## 7. Projet ouvert

BASE porte une proposition de standard ouverte et versionnée, accompagnée d'une implémentation de référence.

Cette proposition n'est pas ratifiée par un organisme tiers. Les exigences `FR-*` relient les comportements attendus aux tests et aux autres éléments de preuve présents dans le dépôt.

Pour vérifier le projet:

```bash
git clone https://github.com/ai-swiss/base.git
cd base
npm ci
npm run check
```

Le cœur de la CLI repose uniquement sur la bibliothèque standard de Node.js. Le serveur MCP, Studio, le site documentaire et les adaptateurs restent optionnels.

Code sous **Apache-2.0**; documentation, agents, skills et exemples sous **CC BY 4.0**. Voir [LICENSING](LICENSING.md), [SECURITY](SECURITY.md), [GOVERNANCE](GOVERNANCE.md) et le [code de conduite](CODE_OF_CONDUCT.md).

Créé par **Charles-Edouard Bardyn** au sein d'[AI Swiss](https://a-i.swiss), qui en assure la gouvernance. Innovaud contribue à la conception des exemples consacrés aux usages en entreprise.

**Les modèles passeront et les plateformes changeront. Vos méthodes de travail, les sources qui font autorité et les décisions que vous gardez humaines doivent pouvoir leur survivre.**
