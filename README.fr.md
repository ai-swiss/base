# BASE

[English](README.md) · **Français**

> **Votre méthode de travail avec l'IA vous appartient-elle encore quand vous changez d'outil?**

À force de travailler avec l'IA, vous développez une méthode: comment poser un problème, quoi donner à lire, quelles corrections effectuer, ce que l'IA peut faire et ce qui reste à décider. Une partie vit parfois déjà dans vos fichiers. Le reste se disperse entre réglages, instructions propres à un outil et conversations passées. BASE donne à votre méthode une structure commune, dans des fichiers texte que vous pouvez lire, corriger et transmettre.

**Vous utilisez déjà un assistant intégré à votre environnement de travail, un agent de code ou une plateforme qui coordonne plusieurs agents?** BASE ne les remplace pas. Ces outils prennent en charge l'exécution; BASE décrit la méthode qu'ils appliquent, dans des fichiers ouverts, lisibles, qui vous appartiennent. Vous pouvez alors changer d'outil sans reconstruire votre méthode.

Certains outils enregistrent déjà vos consignes dans des fichiers que vous pouvez ouvrir et modifier. BASE part de ce principe et l'étend à toute l'organisation du travail. Le standard indique le rôle de chaque fichier, par exemple une procédure à suivre, une connaissance à consulter ou une donnée à traiter, et précise leurs liens. Vous formulez votre demande en langage courant; cette structure aide l'outil à repérer la procédure pertinente. BASE distingue les consignes, utiles mais faillibles, des mécanismes logiciels qui appliquent une règle indépendamment du modèle. Autour de ce cœur commun, il génère les fichiers de compatibilité attendus par différents outils. Votre méthode reste au centre; l'adaptateur change avec l'outil.

<sub>BASE = **Bâtir des Assistants avec une Structure d'Expertise** · *Build Assistants with Structured Expertise*</sub>

[![Version](https://img.shields.io/badge/version-1.3.1-blue.svg)](CHANGELOG.md)
[![CI](https://github.com/ai-swiss/base/actions/workflows/ci.yml/badge.svg)](https://github.com/ai-swiss/base/actions/workflows/ci.yml)
[![Licence: Apache-2.0 + CC BY 4.0](https://img.shields.io/badge/licence-Apache--2.0%20%2B%20CC%20BY%204.0-blue.svg)](LICENSING.md)

![BASE: reprendre la main sur l'IA. Une personne travaille sereinement sous un dôme transparent, au milieu d'un flux constant de nouveaux outils et d'informations. La souveraineté qui compte est avant tout cognitive: articuler ses interactions avec l'IA dans des fichiers qu'on possède.](docs/public/assets/base-cognitive-sovereignty.png)

**Pour comprendre en une minute.** Si votre outil d'IA peut lire une page GitHub, donnez-lui l'adresse de ce dépôt et demandez-lui en quoi BASE peut structurer votre façon de travailler avec l'IA. Sinon, passez directement à la démonstration. La documentation est conçue pour être lisible par un humain comme par un modèle.

**Par où commencer:**
- **Voir concrètement.** → [Démarrer](#2-demarrer)
- **Comprendre l'idée.** → [L'idée, un lundi matin](#1-l-idee-un-lundi-matin), puis [Pourquoi ça compte](#4-pourquoi-ca-compte)
- **Décider, examiner la sécurité ou contribuer.** → [Pour qui](#6-pour-qui) · [Les briques](#7-les-briques-selon-vos-besoins) · [Contribuer](#pour-le-contributeur)

<sub>Porté par [AI Swiss](https://a-i.swiss) (association suisse à but non lucratif) · gratuit et ouvert (Apache-2.0 + CC BY 4.0) · fondé sur des fichiers ouverts que vous pouvez conserver, copier et adapter ([gouvernance](GOVERNANCE.md)).</sub>

---

## 1. L'idée, un lundi matin

BASE propose un [standard ouvert](docs/reference/le-standard.md), accompagné d'une implémentation de référence, pour décrire votre méthode de travail dans des fichiers que vous contrôlez. La structure peut rester simple ou gagner en détail selon le besoin.

La difficulté n'est généralement pas de connaître votre métier. Vous savez expliquer comment préparer une offre, quelles règles doivent toujours être respectées et où une personne doit trancher. Le travail consiste à donner à ce savoir-faire une forme que vous pouvez relire et qu'un modèle peut exploiter. Avec BASE, vous construisez cette forme directement en langage naturel, plutôt que de la disperser entre menus, réglages et conversations liés à un outil particulier.

Lundi matin, un client demande un devis. Vous avez peut-être déjà configuré un assistant, conservé une bonne conversation ou écrit quelques règles. Encore faut-il retrouver ces éléments et savoir lesquels font foi.

Une fois ce savoir-faire structuré avec BASE, vous demandez simplement: «J'ai un devis à préparer pour Dupont SA, trois jours de conseil en stratégie.» La procédure, appelée *process* dans BASE, indique à l'assistant les fichiers à consulter, les règles à appliquer et les points qui requièrent votre validation. Elle lui demande de préparer un brouillon, de citer ses sources et de marquer `[A VALIDER]` les points qui appellent votre décision. La méthode reste dans vos fichiers: vous pouvez la relire, la corriger et la réutiliser.

Au fil du travail, vous pouvez observer et recadrer la méthode, puis intégrer les corrections utiles à vos fichiers plutôt que les laisser disparaître avec la conversation.

---

## 2. Démarrer

Choisissez la porte qui correspond à votre situation.

**Porte 0: comprendre en une question.** Si votre outil d'IA peut lire une page web, donnez-lui l'adresse du dépôt et demandez-lui: «Concrètement, que fait BASE et comment peut-il structurer ma façon de travailler avec l'IA?» Vous souhaitez évaluer BASE pour votre organisation? Demandez une analyse du point de vue d'un dirigeant ou d'un responsable conformité, puis lisez [Souveraineté, confiance et conformité](docs/trust/souverainete-et-confiance.md). Vous voulez voir le code? Commencez par [ARCHITECTURE.md](ARCHITECTURE.md), qui présente l'architecture, les principales abstractions et leurs limites.

**Porte 1: voir sans installer.** L'objectif: voir comment un assistant BASE est fait, et comment il se comporte. Dans un chat web comme ChatGPT ou Claude, téléchargez le [pack de l'assistant devis](https://github.com/ai-swiss/base/releases/latest/download/assistant-devis-demo.pack.md). Ce simple fichier texte, au format Markdown, rassemble son rôle, ses procédures et ses conventions: parcourez-le pour en observer la structure. Puis joignez-le à une nouvelle conversation et demandez: «Que dois-tu me faire valider avant de créer ou de modifier un devis?» Vérifiez que la réponse distingue ce que l'assistant peut préparer de ce que vous devez décider. Pour tester la remise fidélité elle-même, qui croise deux sources absentes du pack (une règle tarifaire et une fiche client), passez à la Porte 2.

**Porte 2: travailler dans vos fichiers.** Utilisez un outil d'IA qui peut ouvrir un dossier sur votre ordinateur, par exemple Claude Code, Codex, Cursor, GitHub Copilot ou OpenCode. BASE n'en privilégie aucun. Téléchargez l'exemple et ouvrez `exemples/assistant-devis-demo/`, pas la racine du dépôt. Demandez d'abord à l'outil de lire les instructions, puis de vous montrer la structure du dossier et le rôle des principaux fichiers. Posez ensuite la question: «Dupont SA a-t-il droit à la remise fidélité?» La réponse attendue est «non»: la remise exige deux mandats, tandis que la fiche indique «1er mandat». Vérifiez que l'assistant cite les deux sources et fait apparaître le marqueur `[A VALIDER]`.

**Vous n'avez pas à rédiger cette structure seul.** BASE est conçu pour que vous articuliez votre méthode en conversation, sans devoir connaître le format. Votre outil d'IA suit une procédure qui pose les questions utiles, propose une structure et vous soumet les modifications avant de les écrire. La décision vous appartient.

**Créer votre dossier au format BASE.** Pour l'exemple devis, copiez `exemples/assistant-devis/`, un gabarit complet à personnaliser, puis dites: «Configure mon activité.» La procédure vous pose une question à la fois et remplit avec votre accord l'identité de l'entreprise, les conditions commerciales, le catalogue et les règles de tarification.

Pour partir d'un autre dossier, l'interface en ligne de commande (CLI) et Studio proposent la même structure de départ. `base init` montre d'abord les fichiers envisagés; `base init --yes` les crée avec votre accord. `base studio --root <dossier>` installe les dépendances de l'interface au premier lancement et ouvre BASE Studio, l'atelier graphique, dans votre navigateur. Si le dossier n'est pas encore structuré par BASE, l'écran de bienvenue montre le contenu exact des fichiers proposés avant leur création. Parcourir et éditer les fichiers ne demande aucune configuration de modèle; le chat et les évaluations demandent de choisir un fournisseur dans les réglages. → [Installer](docs/start/installer.md) · [Studio](tools/studio/ui/README.md)

> **Coût.** BASE est gratuit. L'outil d'IA et le modèle que vous choisissez peuvent être gratuits ou payants; leurs coûts et leurs limites dépendent des services retenus.

> **Limite des contrôles.** Les contrôles de BASE ne s'appliquent qu'aux actions qui passent par ses composants. Un outil disposant d'un accès direct aux fichiers, au terminal ou à une API peut les contourner. BASE ne remplace ni la gestion des accès, ni un dispositif de prévention des fuites de données (DLP), ni vos obligations de conformité.

---

## 3. Partir d'un exemple

Vous pouvez partir d'un exemple ou d'un travail que vous faites déjà. Décrivez à votre outil d'IA ce que vous souhaitez accomplir, les documents disponibles et les décisions qui doivent vous revenir. Discutez d'abord avec lui du déroulement du travail. Il peut ensuite traduire cet échange dans le format BASE, vous montrer les fichiers proposés et vous aider à les affiner. Vous n'avez pas besoin de connaître le standard pour commencer.

Dans le dossier obtenu, un agent définit un rôle et sert de point d'entrée. Les process décrivent la façon de travailler; les compétences réunissent les connaissances nécessaires; les sources fournissent l'information de référence. Les métadonnées du [standard `base.resource.v1`](docs/reference/le-standard.md) permettent ensuite au code de reconnaître ces rôles et d'activer, selon vos besoins, le routage, les validations ou des règles d'accès.

Les exemples ci-dessous organisent savoir-faire, connaissances et données dans des fichiers ouverts et distincts. Vous pouvez les copier et les adapter librement à vos besoins.

| Exemple | Ce qu'il vous aide à faire |
| --- | --- |
| [Assistant réflexion](exemples/assistant-reflexion/) | Structurer votre pensée, vos sources et vos positions sur un sujet, pour suivre votre propre fil |
| [Starter perso](exemples/starter-perso/) | Partir d'un dossier structuré par BASE pour organiser votre savoir personnel: notes, projets, suivi |
| [Assistant devis](exemples/assistant-devis/) | Préparer des devis professionnels: prix, TVA, conditions, export optionnel |
| [Assistant RH](exemples/assistant-rh/) | Publier des offres, préparer les entretiens, évaluer les candidats |
| [Assistant communication](exemples/assistant-communication/) | Rédiger des publications LinkedIn et des lettres d'information dans votre ton |
| [Assistant courrier](exemples/assistant-courrier/) | Rédiger et traiter vos courriers et courriels clients |
| [Assistant projet](exemples/assistant-projet/) | Structurer, planifier et suivre vos projets avec jalons |
| [Assistant enseignant](exemples/assistant-enseignant/) | Préparer séquences d'enseignement et évaluations |
| [Agence multi-clients](exemples/agence-multi-clients/) | Tenir un espace multi-dossiers, avec un dossier structuré par BASE pour chaque client |

[Voir tous les exemples →](exemples/) · *Pour un autre besoin, dites simplement: «Voici ce que je souhaite faire avec l'IA. Aide-moi à préciser le travail, puis structure-le avec BASE.» Vous pourrez ensuite discuter des fichiers proposés et les affiner.*

---

## 4. Pourquoi ça compte

> «Quand l'IA peut avoir des conséquences réelles, la transparence est la condition de la responsabilité. Une organisation devrait pouvoir voir et montrer, en langage clair et en un seul endroit, comment elle a articulé son travail avec l'IA.»
> <br>*Charles-Edouard Bardyn*

Travailler avec l'IA expose à plusieurs formes de perte de contrôle à la fois: celle de votre méthode, de votre compréhension du travail produit, de ce qui subsiste quand l'outil change, de ce que vous vérifiez. Les sections qui suivent examinent ces dimensions une à une, et ce que BASE y change.

### Faire de chaque correction un acquis

Une correction dans une conversation peut améliorer la réponse en cours. Inscrite dans une règle, un exemple ou une procédure, elle devient réutilisable lors des demandes suivantes. Certains outils conservent déjà des instructions ou une mémoire, mais ce contenu s'accumule souvent au fil des conversations sans rester entièrement visible ni offrir un contrôle fin sur ce qui est gardé, modifié ou supprimé. BASE place ces éléments dans des fichiers que vous pouvez relire, modifier, supprimer, versionner et emporter.

### Réduire ce que le modèle doit deviner

Les modèles de langage restent importants et ne se valent pas. Pour de nombreuses tâches concrètes, les capacités du modèle ne suffisent cependant pas. Le résultat dépend surtout de la structure du travail, des faits pertinents et des contrôles exigés. Lorsque les étapes, le contexte et les critères sont explicites, le modèle n'a plus à reconstruire seul l'organisation souhaitée à chaque demande. Des modèles plus petits ou locaux peuvent alors convenir à certaines tâches, non parce qu'ils équivalent aux modèles les plus puissants, mais parce qu'on leur demande moins de deviner.

Cette structure reste dans vos fichiers lorsque vous changez de modèle ou d'outil. Vous devrez parfois adapter les fichiers de compatibilité, les outils disponibles ou les paramètres d'exécution, mais vous n'aurez pas à reconstituer votre façon de travailler à partir de mémoires, de réglages, d'instructions propriétaires et d'anciennes conversations.

### Garder la maîtrise de la méthode

Dans BASE, l'expression **souveraineté cognitive** désigne une capacité précise: garder la main sur votre façon de travailler et de décider avec l'IA. La méthode que vous suivez, ce que vous déléguez, ce que vous vous réservez sont écrits dans des fichiers que vous possédez, que vous pouvez relire et corriger. Cette capacité ne promet ni indépendance totale, ni résultats identiques d'un modèle à l'autre.

La souveraineté matérielle, quant à elle, concerne le lieu où le modèle s'exécute et celui où les données sont traitées. Les deux dimensions se complètent. Le fait que les fichiers restent sur votre appareil n'empêche pas un outil cloud d'en transmettre le contenu à un service distant; cela dépend de votre configuration et de vos contrats avec un ou plusieurs fournisseurs. → [Souveraineté et confiance](docs/trust/souverainete-et-confiance.md)

### Préserver la vue d'ensemble

Lorsque l'on travaille avec l'IA générative, une erreur se voit parfois tout de suite. La perte de compréhension est plus insidieuse: les réponses et les documents s'accumulent, tandis que la relecture devient plus superficielle. On reste pourtant responsable d'un travail que l'on maîtrise de moins en moins. BASE ne préserve pas votre jugement à votre place. Il encourage une méthode de travail lisible, avec des hypothèses et des points de décision qui vous aident à voir ce que vous déléguez et ce que vous approuvez.

Travailler avec BASE rend aussi transmissibles les critères et les décisions qui guident le travail. Un nouveau collègue peut les lire, les appliquer, les questionner et proposer une correction. L'enjeu principal de la littératie en IA n'est donc pas d'apprendre l'interface du mois. Enseignerait-on l'informatique en se limitant à l'usage d'un tableur? De la même manière, une littératie durable en IA porte sur les objectifs, le contexte, la délégation, la vérification et la responsabilité.

### Structurer l'interaction et la vérification

Un modèle de langage produit la suite la plus probable de ce qu'on lui donne à lire; il ne suit pas des règles fixées d'avance. Il ne fonctionne donc pas comme un logiciel ordinaire, et deux traits changent votre façon de travailler avec lui. D'abord, il connaît quantité de régularités générales, mais pas votre organisation: même s'il peut accéder à une base de données, à des courriels ou à un ensemble de documents, il faut lui indiquer quoi y chercher, quelles sources font foi et à quel moment les consulter. Ensuite, son cœur génère, il ne vérifie pas: la vérification vous revient.

BASE organise non seulement l'accès à l'information, mais son usage. Dans chaque process, vous pouvez préciser quelles ressources consulter, à quelle étape et avec quel niveau de détail. Les connaissances, les sources et les données métier restent distinctes afin de fournir l'information pertinente, à la bonne granularité et au bon moment, plutôt que d'accumuler tout le contexte disponible.

Avec l'IA générative, vérifier exige toujours un point d'appui extérieur à la génération elle-même: une source, une règle, un calcul, un test ou le jugement d'une personne responsable. Demander au même modèle de relire sa réponse sans élément de référence produit une nouvelle génération, pas une vérification indépendante. BASE permet d'inscrire dans la façon de travailler les sources à consulter, les contrôles à exécuter et les décisions à laisser visibles. Il ne garantit pas, à lui seul, la véracité d'une réponse.

Le dépôt documente aussi un travail de recherche appliquée sur l'interaction humain-IA. Ce travail est au cœur de l'approche de la littératie en IA qu'AI Swiss développe et promeut avec ses partenaires de l'éducation: objectifs explicites, contexte choisi, boucles de correction, niveau de délégation et vérifications adaptés au risque. Ces pages n'en font ni des lois établies ni des garanties. Elles rendent les hypothèses, les pratiques et les corrections explicites, transmissibles et révisables. → [Co-penser avec l'IA](docs/learn/co-penser-avec-lia.md) · [La co-pensée en pratique, 16 principes](docs/learn/pratiques-co-pensee.md)

> **Ce que vous contrôlez.** La copie de référence de votre méthode reste dans des fichiers Markdown que vous pouvez versionner et emporter. Les conventions BASE sont publiques et l'implémentation de référence est ouverte. BASE ne détermine ni la propriété juridique de vos données, ni leur hébergement, ni les traitements réalisés par l'outil d'IA choisi.

<details>
<summary><strong>Limites de BASE</strong></summary>

BASE ne rend pas l'IA infaillible. Il ne fournit à lui seul ni IAM/SSO (gestion des identités et authentification unique), ni RBAC (droits par rôle), ni DLP/SIEM (prévention de fuite et supervision), ni archivage légal, ni mise en conformité nLPD/RGPD. Le respect d'une exigence isolée ne vaut pas conformité.

Le standard est toutefois conçu pour être étoffé. Ses métadonnées peuvent notamment désigner un responsable, une date de révision, un niveau de sensibilité ou une politique; des validateurs et des points d'extension permettent ensuite de relier ces informations à des contrôles d'accès, à l'authentification ou à d'autres couches de gouvernance. BASE fournit ainsi des fondations cohérentes, pas une conformité clé en main. Chaque intégration doit être mise en œuvre et vérifiée dans son contexte. → [Cadre public et extensions](docs/reference/framework-public.md) · [Le standard](docs/reference/le-standard.md)

La séparation instructions/données ([§7](#7-les-briques-selon-vos-besoins)) contribue à limiter certaines confusions, mais elle ne constitue pas à elle seule un mécanisme de résistance à l'injection. Une revue de sécurité externe est prévue, mais n'a pas encore été réalisée. Modèle de menace: [Sécurité et limites](docs/trust/securite-et-limites.md).
</details>

---

## 5. Ce que BASE ajoute

BASE complète les couches qui existent déjà:

- un **modèle de langage** fournit des capacités de génération et de raisonnement;
- un **harnais** fournit l'interface, les outils, la mémoire d'exécution et l'orchestration;
- un **format ou une couche de connaissance** organise les informations que l'IA peut consulter, par exemple un corpus documentaire, un catalogue, un glossaire ou une ontologie métier;
- **BASE étend ce principe à toute l'articulation du travail avec l'IA**: process, connaissances, sources, données, contrôles et décisions humaines reçoivent chacun un rôle distinct.

Autrement dit, BASE occupe la couche la moins outillée: comment le travail est décrit, vérifié et préservé.

Les métadonnées que le code reconnaît relient cette structure à des mécanismes. Elles peuvent signaler une révision, orienter une demande ou servir de point d'appui à une politique d'accès. Le standard accepte aussi des champs supplémentaires: une organisation peut enrichir son schéma, puis relier ces champs à ses propres validateurs, politiques et contrôles sans enfermer ses fichiers dans une plateforme particulière.

Concrètement, vous pouvez garder le modèle et le harnais que vous utilisez déjà. Vous reliez à BASE vos documents, vos données ou votre couche de connaissance, si vous en avez une, puis vous décrivez comment les mobiliser au cours du travail. Sans format de connaissance particulier, de simples fichiers suffisent. BASE ne remplace ni le modèle, ni le harnais, ni la recherche documentaire; il rend leur articulation lisible, modifiable et durable. → [La carte du paysage 2026](docs/reference/positionnement.md)

À partir du même cœur de fichiers, BASE peut générer les adaptateurs attendus par différents harnais, par exemple `CLAUDE.md`, `AGENTS.md` ou les règles de Cursor. Ces fichiers permettent à chaque outil de retrouver la même structure sans faire de son format propriétaire la source de vérité. → [Le standard](docs/reference/le-standard.md) · [Compatibilité](docs/reference/compatibilite-harnesses.md)

Multiplier les agents ne constitue pas, en soi, une meilleure structure. Plusieurs agents peuvent être utiles lorsque des tâches peuvent réellement être isolées, menées en parallèle ou évaluées séparément. Ils introduisent aussi un coût de coordination et de transmission du contexte. Lorsqu'un travail suit un même fil de raisonnement ou dépend d'un contexte largement partagé, le découper entre plusieurs agents ajoute surtout des pertes et de la complexité; un seul agent guidé par un process explicite fait alors souvent aussi bien, sans le coût de coordination. BASE n'impose aucune architecture: un process peut être suivi par un seul agent, réparti entre plusieurs, ou exécuté par un autre harnais. Multiplier les agents ne remplace ni une décomposition claire du travail, ni une vérification extérieure au modèle.

---

## 6. Pour qui

Un fournisseur peut fermer un service ou en changer les conditions. Vos fichiers, eux, restent chez vous.

BASE devient utile dès que vous souhaitez faire évoluer votre méthode de travail avec l'IA: la maintenir, la versionner, l'améliorer, la transmettre et la préserver au fil des changements de modèles ou d'outils. Pour une question ponctuelle, un chat suffit souvent. Dès que le travail s'accumule, des fichiers que vous contrôlez permettent de conserver les décisions, les procédures et les corrections sans dépendre du cycle de vie d'une interface ou d'un fournisseur.

Vous pouvez commencer par une tâche ou un dossier existant. Dites à votre outil d'IA: «Voici ce que j'aimerais faire. Qu'est-ce qui est possible et comment structurerais-tu le travail?» La discussion peut préciser les étapes, les informations nécessaires, les décisions humaines et les vérifications. L'outil applique ensuite le standard BASE aux fichiers proposés; vous les relisez et les affinez sans avoir à concevoir vous-même le format.

Un dossier initialement léger peut ensuite s'enrichir de dispositifs de gouvernance: responsables, dates de révision, niveaux de sensibilité, routage, contrôles et évaluations. Le format peut rester le même; les exigences d'accès, de sécurité et de conformité augmentent à mesure que le déploiement s'étend.

| Profil | Ce que BASE apporte | Ce qui reste à votre charge |
| --- | --- | --- |
| **Particulier / étudiant** | Conserver une méthode de recherche, d'écriture ou d'organisation au-delà d'une conversation. | Choisir les données confiées au modèle, relire et entretenir les fichiers. |
| **Enseignant / professionnel / indépendant** | Réutiliser des règles, des sources et des étapes propres à l'activité. | Valider le contenu métier et décider ce qui peut être délégué. |
| **Équipe / PME** | Partager et améliorer une méthode commune, avec des responsabilités visibles. | Organiser les accès, les revues et la transmission du savoir-faire. |
| **Direction / secteur public** | Conserver une source inspectable de la méthode, indépendante de l'interface d'exécution. | Choisir les fournisseurs, encadrer les usages, démontrer et maintenir la conformité. |
| **Sécurité / conformité** | Distinguer les consignes des mécanismes, documenter les flux et vérifier les limites annoncées. | Intégrer BASE aux dispositifs IAM, RBAC, DLP, SIEM et aux analyses d'impact. |
| **Développeur / contributeur** | Utiliser ou étendre une spécification ouverte et son implémentation de référence. | Vérifier les exigences, les tests et les limites avant déploiement. |

Avant de lancer un pilote dans une organisation, vérifiez quatre points: quel travail faut-il structurer; quelles données l'outil d'IA peut-il lire; qui valide les résultats; quels contrôles externes restent nécessaires? BASE aide à décomposer et à documenter le travail; il n'apporte pas une conformité clé en main. → [Adoption](docs/learn/adoption-organisation.md) · [Souveraineté et confiance](docs/trust/souverainete-et-confiance.md) · [Preuves](docs/trust/evidence.md)

---

## 7. Les briques, selon vos besoins

Un dossier structuré par BASE peut commencer avec un agent, un process et quelques fichiers. Les fonctions suivantes s'ajoutent lorsque le besoin apparaît.

À première vue, le standard peut sembler lourd; il est en réalité sobre. Chaque brique reste optionnelle et ne s'ajoute que lorsqu'elle vous rend service, et vous n'avez pas à la construire ni à l'entretenir seul: votre outil d'IA la bâtit avec vous en conversation, et peut reprendre votre organisation existante pour la traduire dans ce format. Le cadre lui-même prend en charge une part de l'entretien, avec ses propres garde-fous et vérifications (`base doctor` signale un process sans exemple, une ressource routable sans description, un marqueur dormant; les adaptateurs générés et l'index se régénèrent; l'évaluation permet de suivre la qualité). La structure est faite pour alléger la charge mentale, pas pour l'alourdir.

> **Deux registres, à ne jamais confondre.** Un *mécanisme* est appliqué par du code lorsque l'action passe par le composant BASE concerné. Une *consigne* est interprétée par le modèle: utile, mais faillible. Chaque brique précise son registre. Une consigne n'est pas une garantie.

- **Des textes organisés.** Les fichiers sont écrits avec vos mots, par vous ou avec l'aide de votre outil d'IA, selon une structure lisible. Le standard partagé [`base.resource.v1`](docs/reference/le-standard.md) rend le dossier navigable, pour vous comme pour l'IA.
- **Des métadonnées qui activent des mécanismes.** Quelques lignes d'en-tête peuvent signaler un process, marquer une ressource sensible ou définir une règle d'accès. Du code peut interpréter ces métadonnées pour appliquer un contrôle; elles ne garantissent pas la façon dont le modèle interprète le texte. → [détail](docs/trust/mecanismes-vs-consignes.md)
- **La double séparation.** Les instructions sont séparées des données; le savoir-faire est séparé des informations utilisées pendant le travail. Cette structure clarifie l'autorité et facilite la maintenance. Elle réduit les confusions accidentelles, mais ne suffit pas à éliminer l'injection de prompt. → [§8](#8-comment-cela-fonctionne)
- **Un routage progressif, de votre demande au bon process.** Vous formulez votre intention en langage courant; votre outil d'IA parcourt un index généré (`.ai/routing/index.md`) pour repérer le rôle et la procédure pertinents. La conversation reste le point d'entrée. Pour les tests et les intégrations, la CLI offre aussi un routage lexical, plus sommaire, mais indépendant du modèle et reproductible. → [détail](docs/reference/routage-process-et-ressources.md)
- **Un connecteur pour les outils qui n'ouvrent pas directement vos fichiers.** Le serveur MCP de BASE donne à un outil compatible un accès contrôlé aux ressources et aux fonctions du projet. En local, il peut lire les fichiers et proposer des modifications soumises à confirmation; par HTTP, il reste en lecture seule par défaut. BASE peut ainsi se greffer à un chat ou à une interface qui ne sait pas parcourir seule votre dossier. → [détail](mcp/)
- **Le Studio.** Une application web permet de voir et d'éditer les ressources sans parcourir les dossiers à la main. Par défaut, elle n'est accessible que depuis l'interface réseau locale. `base studio --root <dossier>` → [détail](tools/studio/ui/README.md)
- **L'évaluation.** Un utilisateur simulé dialogue avec l'assistant, puis un modèle-juge évalue la transcription selon des scénarios versionnés. Vous pouvez comparer plusieurs versions; le résultat sert de signal de régression, pas de note absolue.
- **Un contrôle des sorties de données (egress).** Le broker de BASE est le composant qui filtre les ressources avant leur envoi. Lorsqu'un appel distant passe par lui, une ressource portant `confidential: true` ou située sous une racine `local-only` est retenue et remplacée par un avis explicite. Par défaut, la politique est permissive. Le texte saisi directement et les actions hors broker ne sont pas filtrés. Ce mécanisme n'est ni un pare-feu ni une DLP. → [détail](docs/trust/frontiere-local-vs-sortant.md)

> **Contrôles du dépôt.** `npm run check` exécute les vérifications prévues par le projet. Les affirmations de sécurité et les exigences `FR-*` renvoient vers leurs mécanismes, leurs tests et leurs limites en [§8](#8-comment-cela-fonctionne) et dans [Preuves](docs/trust/evidence.md).

<details>
<summary><strong>Compatibilité et déploiement: MCP, espaces multi-dossiers, CLI, confinement du Studio</strong></summary>

- **Le serveur MCP.** Le *Model Context Protocol* (MCP) est le protocole qui relie ici l'outil d'IA aux ressources et aux fonctions de BASE. Le serveur lui expose notamment la découverte, le routage, la lecture et, en mode local, l'écriture médiée. Son interface HTTP est en lecture seule par défaut; une liaison non locale est refusée sans authentification, sauf dérogation explicitement signalée comme dangereuse. → [mcp/](mcp/)
- **Les espaces multi-dossiers.** Plusieurs dossiers chargés côte à côte, isolés les uns des autres. Une racine imbriquée reste isolée.
- **La CLI.** `base <commande>` expose aux humains et aux outils des commandes pour bâtir, router, auditer et évaluer un dossier structuré par BASE.
- **Le confinement du Studio.** Il n'écoute que sur `127.0.0.1` par défaut et protège contre le *DNS rebinding*, une attaque qui tente de contourner la frontière du réseau local. Cela réduit l'exposition réseau; ce n'est pas une authentification et cela ne protège pas contre un processus local malveillant.
- **Des couches indépendantes.** Vous pouvez vous en tenir aux fichiers structurés ou ajouter la documentation, le Studio et le serveur MCP. Un déploiement organisationnel exige les contrôles d'accès, l'intégration et la gouvernance adaptés à son contexte.
</details>

---

## 8. Comment cela fonctionne

### La structure, en détail

BASE attribue des rôles distincts aux fichiers. L'agent décrit le rôle; les process portent le savoir-faire; les compétences apportent les connaissances utiles; les sources fournissent l'information de référence; les données métier restent dans leurs propres dossiers. Cette séparation clarifie ce qui donne une instruction et ce qui fournit une information. Elle aide à concevoir des contrôles; elle n'empêche pas à elle seule qu'une donnée lue influence le modèle.

```
MÉTHODE ET EXPERTISE                         CONTENU MÉTIER
AGENT.md             Le rôle                data/        Vos fichiers métier
  └── skills/                                sources/     Vos sources de référence
        ├── processes/   Le savoir-faire
        └── competences/ Les connaissances
  templates/          Formulaires (opt.)
  tools/              Scripts (opt.)

  Frontière recherchée: la méthode fait autorité;
  le contenu métier fournit l'information.
```

Deux distinctions structurent ce classement: la méthode est séparée des informations utilisées pendant le travail; les instructions sont séparées des données potentiellement hostiles. Les templates, scripts et autres fichiers restent optionnels. Les process et les compétences suivent la convention **SKILL.md**, dans des fichiers Markdown lisibles. Certains outils les découvrent nativement; d'autres demandent un adaptateur ou un lien explicite.

### Le routage, en détail

Trois modes d'accès sont possibles, du plus guidé au plus direct: **formuler votre demande** et laisser votre outil s'orienter dans BASE; **choisir vous-même l'agent**; **ouvrir directement le fichier** voulu. Par défaut, l'outil lit un index généré (`.ai/routing/index.md`) et descend de la racine vers l'agent, puis vers le process. Pour les tests et les intégrations, `base route` et l'outil MCP `route_request` utilisent un routage lexical plus sommaire, sans modèle. Avec le même corpus, la même configuration, la même version et la même demande, ce mécanisme produit le même résultat: une route ou une abstention motivée. Cette reproductibilité le rend testable; elle ne rend son choix ni plus fin ni nécessairement juste. Un désaccord avec le choix proposé par le modèle signale un cas à clarifier; il ne permet pas, à lui seul, de déterminer quel routage convient. Pour de grands catalogues, un mode optionnel peut ajouter des *embeddings*, des représentations numériques utilisées pour rapprocher des demandes semblables, puis un affinage par le modèle.

L'index est régénéré lorsque le dossier évolue. Avec un seul agent «devis», le choix est simple; l'ajout d'un agent «support» introduit une nouvelle route à décrire et à tester.

### Évaluer et observer votre dossier

L'évaluation fait dialoguer un utilisateur simulé avec l'assistant testé, puis un modèle-juge évalue la transcription selon des scénarios versionnés. Le verdict dépend des modèles et doit être relu; il peut signaler une régression, pas prouver une qualité absolue. Vous la lancez sur un agent et des scénarios, par exemple `npm run eval -- --root . --agent <agent> --process <process> --scenarios <fichier>`. Par défaut, elle appelle un fournisseur compatible avec l'API d'OpenAI; `--ollama` bascule en local. → [détail](tools/eval/README.md)

À grande échelle, cette évaluation mesure aussi la portabilité de vos process. En rejouant les mêmes scénarios avec différents modèles, comme utilisateur simulé et comme juge, vous obtenez un signal, faible mais réel, de la variabilité de vos résultats d'un modèle à l'autre. C'est un enjeu de souveraineté: certains modèles récents sont optimisés pour leur propre environnement et suivent moins fidèlement une structure conçue pour un autre outil; quantifier cet écart révèle quels modèles s'adaptent le mieux à votre méthode, au lieu de vous imposer leurs propres conventions.

### Pour le contributeur

BASE compte aujourd'hui un mainteneur principal et demeure sous l'intendance d'AI Swiss. Les licences permettent à d'autres de reprendre le projet. Le cœur CLI utilise la bibliothèque standard de Node.js; le MCP et les interfaces optionnelles ont leurs propres dépendances.

```bash
git clone https://github.com/ai-swiss/base.git && cd base && npm ci && npm run check
```

`npm run check` vérifie les spécifications, le typage, les schémas, les cas de test enregistrés pour le routage, l'hygiène documentaire et les suites de tests associées. La couverture et certains contrôles de publication s'exécutent séparément en CI. Pour changer un comportement, trouvez son exigence `FR-*` dans `specs/current/10_core/`, lisez les tests correspondants, puis modifiez code, spécification et tests ensemble. → [ARCHITECTURE](ARCHITECTURE.md) · [CONTRIBUTING](CONTRIBUTING.md)

<details>
<summary><strong>Langues et sources de vérité</strong></summary>

**Langue.** Vous pouvez écrire la méthode dans les langues que le modèle choisi comprend. Le routage par le modèle peut fonctionner dans ces langues; le routage lexical sans modèle dépend, lui, des signaux présents dans l'index. → [Écrire pour le routeur](docs/guides/ecrire-pour-le-routeur.md)

**Sources de vérité.** L'état attendu est défini dans les spécifications; le code l'implémente et les tests apportent les éléments de preuve. Les décisions et le `CHANGELOG` tracent les changements; `.plans` et `.reviews` restent des brouillons. Toute divergence entre spécification et code est un défaut. → [ARCHITECTURE](ARCHITECTURE.md)
</details>

---

## 9. Aller plus loin

**Apprendre:** [Lire dans quel ordre](docs/start/lire-dans-quel-ordre.md) · [Tutoriel pas à pas](docs/tutoriel/index.md) · [Co-penser avec l'IA](docs/learn/co-penser-avec-lia.md) · [La co-pensée en pratique, 16 principes](docs/learn/pratiques-co-pensee.md) · [L'adoption dans une organisation](docs/learn/adoption-organisation.md) · [Le cycle de vie d'une expertise](docs/learn/cycle-de-vie-expertise.md)
<br><sub>Ces parcours développent une littératie qui ne dépend pas d'une interface particulière: choisir le contexte, distinguer consigne et mécanisme, vérifier, puis assumer la responsabilité du résultat.</sub>

**Contribuer:** [CONTRIBUTING](CONTRIBUTING.md) · [DEVELOPING](DEVELOPING.md) · [ARCHITECTURE](ARCHITECTURE.md) · [specs/](specs/README.md)

**Confiance et sécurité:** [Preuves](docs/trust/evidence.md) · [Sécurité et limites](docs/trust/securite-et-limites.md) · [La frontière entre données locales et sortantes](docs/trust/frontiere-local-vs-sortant.md) · [Souveraineté et confiance](docs/trust/souverainete-et-confiance.md)

**Signaler ou échanger:** [issues](https://github.com/ai-swiss/base/issues/new/choose) · [Discussions](https://github.com/ai-swiss/base/discussions) · vulnérabilités en privé via [SECURITY](SECURITY.md)

**Gouvernance et pérennité:** [GOVERNANCE](GOVERNANCE.md)

**Contexte:** [Lancement de BASE](docs/public/2026-06-25-lancement-base.pdf) (Innovaud × AI Swiss, 25.06.2026, en français).

---

## Licence et attribution

Code sous **Apache-2.0**; documentation, agents, skills et exemples sous **CC BY 4.0** (double licence détaillée dans [LICENSING.md](LICENSING.md), textes complets dans [LICENSES/](LICENSES/)). Voir [GOVERNANCE](GOVERNANCE.md) · [Code de conduite](CODE_OF_CONDUCT.md) · [CONTRIBUTING](CONTRIBUTING.md).

Créé par **Charles-Edouard Bardyn** au sein d'AI Swiss, association à but non lucratif qui en assure une intendance neutre vis-à-vis des modèles. Innovaud contribue à la conception des exemples consacrés aux usages en entreprise.

BASE fournit un **point de départ** que vous pouvez copier et adapter. La double licence autorise aussi la création d'outils et de services complémentaires. Leur usage en entreprise doit être évalué au regard des intégrations, des contrôles et de la gouvernance nécessaires.
