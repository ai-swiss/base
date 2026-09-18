---
schema_version: base.resource.v1
id: pour-qui
type: document
title: Trouver votre façon d'utiliser BASE
description: Comment une personne, une entreprise, une équipe de recherche ou une équipe d'ingénierie peut utiliser BASE, et par où commencer.
scope: public
status: active
sensitivity: public
keywords: [vie-privee, particulier, start-up, pme, entreprise, adoption, publics, societe, logiciel-numerique, charge-mentale]
---

# Trouver votre façon d'utiliser BASE

Utiliser l'IA sans perdre la maîtrise de votre contexte, de vos décisions et de votre mémoire de travail: tel est l'enjeu, que vous soyez une personne seule ou une organisation. Cette carte couvre aussi les équipes universitaires et de recherche, ainsi que les ingénieurs IA.

Ces situations ont un point commun: un modèle ne connaît pas spontanément votre terrain. Il ignore ce qui est vrai pour vous, ce qui est sensible, ce qui doit être vérifié et comment votre travail doit être fait.

Un dossier BASE permet de décrire ce contexte dans des fichiers lisibles et reliés.

## Le diagnostic

L'adoption de l'IA est souvent traitée comme un choix d'outil: quel modèle, quelle interface, quel abonnement. C'est nécessaire, mais insuffisant.

La question plus profonde est: quelle structure donnez-vous à la collaboration?

L'IA générative n'entre pas naturellement dans les catégories habituelles du logiciel numérique. On peut l'encadrer par des écrans, des boutons, des agents et des permissions, mais son usage réel passe aussi par le langage, le contexte, les exemples, les critères, les corrections et les habitudes de travail. Elle produit un comportement plausible, non une garantie. Elle donne souvent l'impression de comprendre la situation, mais elle ignore votre réalité locale tant que vous ne l'avez pas structurée.

La méthode proposée traite donc l'IA pour ce qu'elle est: un modèle peut produire des réponses compétentes dans certains domaines, sans connaître votre réalité ni garantir son résultat. Il ne partage pas votre mémoire par défaut et s'appuie sur un langage souvent sous-spécifié. La qualité de l'exécution dépend du modèle, des outils, du contexte projeté, des permissions et des vérifications humaines.

Quatre objets doivent rester distincts:

- la **méthode** décrit comment conduire le travail, contrôler les résultats et décider;
- la **structure BASE** relie les fichiers qui décrivent cette méthode;
- la **référence approuvée** est l'état versionné de ces fichiers à un instant donné;
- l'**exécution** est ce qu'un modèle, un outil ou une intégration fait effectivement à partir de cette référence.

- Quelles connaissances doivent être disponibles?
- Quels processus doivent être suivis?
- Quelles données sont utiles maintenant, et lesquelles ne doivent pas être ouvertes sans raison?
- Quelles actions peuvent être proposées par l'IA, mais validées par l'humain?
- Qu'est-ce qui doit être tracé pour pouvoir reprendre, corriger et améliorer?

Sans cette structure, l'IA reste brillante mais amnésique. Elle aide ponctuellement, puis vous oblige à répéter, vérifier, corriger et reconstruire le contexte à chaque fois.

## Pour une personne dans sa vie privée

Un dossier structuré peut organiser une mémoire personnelle d'action: démarches administratives, projets familiaux, suivi de santé non médical, apprentissage, préparation de voyage, gestion d'un déménagement, organisation d'un événement, suivi de documents.

Le but est de ne pas recommencer de zéro à chaque fois, pas de tout automatiser.

Ce que les fichiers et la méthode apportent:

- des fichiers locaux que vous pouvez comprendre;
- des fichiers lisibles que vous gardez;
- des workflows simples pour vos tâches récurrentes;
- des marqueurs simples qui signalent ce qui reste en attente et que l'IA ou un script peuvent retrouver;
- une méthode pour décider quand utiliser l'IA et quand ne pas l'utiliser.

Point d'attention:

Les fichiers peuvent rester sur votre machine, mais un outil relié à un modèle distant lui envoie le contexte qu'il projette. La politique d'égress est permissive par défaut sur les chemins médiés: marquez les ressources confidentielles ou la racine `local-only`, et configurez votre outil. Une classification de sensibilité décrit un risque; elle ne retient pas à elle seule un contenu. Pour les informations très sensibles, choisissez un environnement adapté ou tenez le modèle à l'écart.

## Pour une start-up

Une start-up invente vite ses pratiques: pitch, ventes, onboarding client, support, recrutement, communication, reporting, stratégie produit. Le risque: que tout reste dans les conversations, les têtes, les messages Slack et les documents improvisés.

L'équipe peut transformer ce qui marche en ressources réutilisables.

Ce que les fichiers et la méthode apportent:

- des workflows qui capturent les pratiques qui émergent;
- des modèles de documents cohérents;
- une mémoire d'équipe avant que la documentation devienne lourde;
- un moyen de distinguer brouillon, proposition, décision et action;
- une base portable quand les outils changent: les outils passent, le contexte reste.

Point d'attention:

Mesurez le bénéfice sur le cas choisi. Une meilleure structure peut éviter des répétitions, mais elle ne rend ni le modèle fiable ni le travail automatiquement plus rapide.

## Pour une PME

Une PME a souvent assez de complexité pour souffrir du manque de structure, mais trop peu de ressources pour déployer une plateforme lourde. Les informations se dispersent dans des dossiers, des tableurs, des courriels, des modèles de documents, et parfois dans la tête de quelques personnes clés.

Un dossier de fichiers contrôlé par l'équipe offre un niveau intermédiaire: plus explicite qu'un prompt isolé, sans prétendre remplacer une plateforme d'entreprise.

Pour commencer sans surcharger l'équipe, utilisez le [kit de démarrage PME suisse](kit-demarrage-pme-suisse.md). Il aide à fixer les règles minimales: quelles données peuvent être confiées à l'outil IA, qui valide, comment versionner simplement et quand lancer l'entretien.

Ce que les fichiers, le routeur et la méthode apportent:

- des assistants métier prêts à adapter;
- des processus partagés et vérifiables;
- une validation locale avant partage;
- un entretien régulier des liens, marqueurs, descriptions et ressources;
- une progression naturelle du personnel vers l'équipe.

Point d'attention:

Les fichiers et le routeur ne remplacent pas la gestion des droits, la politique de confidentialité ou la gouvernance documentaire. Ils fournissent une structure de travail qui peut être reliée à ces mécanismes.

## Pour une équipe universitaire ou de recherche

Une équipe de recherche doit relier questions, protocoles, sources, hypothèses, décisions et résultats sans faire passer une sortie de modèle pour une preuve.

La route utile consiste à consigner la méthode et les critères dans des fichiers, à versionner une référence approuvée, puis à faire citer au modèle les passages réellement ouverts. Les chercheurs restent responsables du protocole, de l'interprétation, de la reproductibilité et des données soumises à des règles éthiques ou contractuelles.

Point d'attention:

Une source structurée reste une source, pas une validation scientifique. Séparez le corpus, les instructions de travail, les résultats générés et les décisions des personnes.

Commencez par [Structurer un corpus de connaissance](../guides/structurer-un-corpus-de-connaissance.md).

## Pour une équipe d'ingénierie IA

Les ingénieurs IA peuvent utiliser la structure comme contrat lisible entre produit, expertise métier et intégration: routes attendues, sources autorisées, scénarios d'évaluation, politiques et limites.

La route utile consiste à versionner la référence, tester le routeur et les mécanismes médiés, puis mesurer chaque combinaison de modèle, d'outils et de contexte. Une référence identique peut produire des exécutions différentes.

Point d'attention:

Réservez le code aux garanties mécaniques. Une instruction adressée au modèle reste faillible, même si elle est bien écrite.

Commencez par [Votre première évaluation](../tutoriel/praticien-7-premiere-evaluation.md).

## Pour une grande entreprise

Dans une grande entreprise, l'enjeu est d'éviter que chaque équipe inscrive ses processus dans des interfaces propriétaires, des prompts dispersés et des configurations impossibles à auditer. Ajouter un outil IA de plus n'y suffit pas.

La structure BASE peut servir de langage commun pour les ressources, sources, connecteurs, politiques, événements et adaptateurs. Le cœur public reste volontairement léger; les systèmes de l'organisation portent les contrôles supplémentaires.

Ce que la structure et les outils apportent:

- un modèle conceptuel stable pour décrire le savoir et les workflows;
- une séparation lisible entre instructions et contenu, utile pour les relire et les gouverner, mais qui ne prévient pas à elle seule l'injection de prompt: le modèle peut encore interpréter un contenu malveillant comme une instruction;
- un chemin vers des connecteurs, des policies et des traces gouvernées;
- une façon de rester portable entre harnesses et modèles;
- une base de discussion entre métiers, IT, sécurité, conformité et data.

Point d'attention:

Le cœur public n'est pas une plateforme de conformité. Pour un usage en grande entreprise, ajoutez IAM, SSO, DLP, SIEM, rétention, classification, revue juridique et séparation des environnements. Exigez aussi de l'outil la transparence sur le contexte qu'il projette vers le modèle.

## Pourquoi c'est important pour la société

Une société qui adopte l'IA par les seules interfaces fermées, agents propriétaires et prompts dispersés risque de perdre la maîtrise de ses processus. Elle ne sait pas toujours ce qui a guidé la production, ce qui a été vérifié, ce qui est réutilisable, ni ce qui reste sous responsabilité humaine.

Au-delà de la technique, le risque est aussi cognitif et organisationnel. Si chaque personne doit retenir quel agent utiliser, quelles instructions ont été placées dans quelle interface, quelles permissions ont été accordées et quel contexte a été oublié, l'IA alourdit la charge mentale au lieu de la réduire. C'est là qu'un routeur, même simple, rend service: il épargne à l'utilisateur la peine de chercher le bon process. Le progrès réel consiste à structurer la relation: écrire ce que le système doit savoir, borner ce qu'il peut faire, et garder les décisions importantes visibles. Deux exigences traversent tout cela dans la durée: conserver une intuition suffisante pour rester capable de vérifier, et garder la souveraineté sur le dispositif qui exécute le travail.

La méthode défend une autre trajectoire:

- écrire le savoir qui compte;
- rendre les processus explicites;
- garder les décisions visibles;
- utiliser le code pour les garanties que le langage naturel ne peut pas donner;
- conserver la portabilité du contexte de travail;
- permettre aux personnes et organisations de progresser sans dépendre d'une seule plateforme.

Cette ambition reste modeste dans ses promesses et exigeante dans sa méthode. L'approche ne rend pas l'IA infaillible; elle vise une collaboration plus structurée, plus vérifiable et plus durable.

## Votre prochaine action

- Si vous êtes une personne seule: copiez un exemple et dites ce que vous voulez configurer ou clarifier, par exemple «Bonjour, je voudrais configurer mon activité».
- Si vous êtes en start-up: commencez par un workflow répétable qui coûte du temps chaque semaine.
- Si vous êtes une PME: choisissez un assistant métier, suivez le kit de démarrage PME suisse, validez les fichiers, puis installez un rituel d'entretien.
- Si vous travaillez dans une université ou un institut de recherche: choisissez un protocole non sensible et décrivez ses sources, critères et validations humaines.
- Si vous êtes ingénieur IA: choisissez une route critique et écrivez son résultat attendu avant de comparer les exécutions.
- Si vous êtes une grande entreprise: lisez [Cadre public](../reference/framework-public.md), [Spécification v0](../reference/specification-v0.md) et [État de l'implémentation](../reference/etat-implementation.md), puis décidez quels contrôles doivent être ajoutés autour du cœur public.
