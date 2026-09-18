---
schema_version: base.resource.v1
id: securite-et-limites
type: document
title: Sécurité et limites
description: Modèle de sécurité public de BASE, limites du cœur local et responsabilités selon le niveau d'adoption.
scope: public
status: active
sensitivity: public
keywords: [securite, limites, threat-model, donnees, permissions, enterprise, gouvernance]
---

# Sécurité et limites

Avant de confier des données ou des actions à BASE, sachez ce que le cœur local protège vraiment et ce qu'il vous reste à ajouter selon votre contexte: trop vous y fier laisse à découvert ce que vous croyiez protégé. Que vous décidiez pour vous-même ou pour une administration, voici où passe la frontière. BASE renforce votre maîtrise du travail avec l'IA, mais il ne hisse pas un outil IA généraliste au niveau de sécurité d'une grande organisation.

## Principe central

Le [glossaire](../reference/glossaire.md) fixe la distinction entre mécanisme et consigne. Ici, elle sert à borner chaque garde-fou au composant et au chemin qui l'appliquent.

Pour les contrôles à l'exécution de BASE public, cette portée passe le plus souvent par la CLI `base`, le broker dans `tools/base-core.mjs`, ou le serveur MCP lorsqu'il délègue au broker. Des barrières de test peuvent aussi constituer un mécanisme dans leur propre périmètre, par exemple le contrôle automatisé d'accessibilité des vues couvertes de Studio.

Si un agent dispose d'un accès direct au shell, au filesystem ou à une API externe sans passer par BASE, les métadonnées YAML restent utiles comme guide et comme signal d'audit, mais elles ne bloquent pas mécaniquement l'action.

**Conséquence concrète, sans équipe technique:** au navigateur seul, la lecture de la carte et des règles oriente un modèle coopératif. C'est le chemin normal du routage par modèle, mais cela reste une consigne. Pour le confinement, le contrôle d'égress ou la prévisualisation avant écriture, il faut emprunter le composant qui applique le contrôle. Le détail, palier par palier, figure dans [Essayer BASE sans rien installer](../start/essayer-sans-installer.md).

Un process peut déclarer qu'il a besoin de lire une source ou d'exécuter une tool. Cette déclaration exprime un besoin de travail; elle n'accorde aucune permission. Les droits réels restent portés par l'OS, le dossier partagé, le Drive, le connecteur, l'API, le token ou le harness utilisé.

## Actions qui passent par BASE

Une action passe par BASE quand elle utilise la CLI, le broker ou le serveur MCP pour demander à BASE d'agir. Exemples typiques:

- `base open <id>` ou `open_resource`: ouvrir une ressource inventoriée, avec projection et policy;
- `base access <path>` ou `access_resource`: lire un fichier confiné dans la racine du projet;
- `base invoke <tool>` ou `invoke_tool`: préparer une commande en dry-run, puis l'exécuter seulement si elle est confirmée;
- `base propose` puis `base commit`, ou `propose_change` puis `commit_change`: écrire via un changement proposé, confirmé et vérifié.

Dans ces cas, BASE peut appliquer confinement, décisions `allow` / `deny` / `needs_approval`, dry-run et confirmation. Les points instrumentés tentent aussi d'écrire une trace minimale, best-effort et non exhaustive. Si l'action contourne ces points d'entrée, elle dépend des droits natifs de l'outil ou de l'environnement.

## Trois portes, trois niveaux de garantie

Un dossier BASE s'atteint par trois portes. La même promesse n'y tient pas de la même façon, et la différence ne se lit pas dans le texte des fichiers: elle tient à ce qui se trouve sur le chemin de l'action.

### Porte 1: votre outil IA lit les fichiers directement

Claude Code, Cursor, un éditeur ouvert sur le dossier: rien ne s'interpose entre le modèle et le disque.

L'outil reçoit toute la méthode écrite. Il lit le point d'entrée généré (`CLAUDE.md`, `AGENTS.md`, la règle Cursor), puis l'index de routage `.ai/routing/index.md`, l'index de chaque agent et le texte des process, avec leurs «Quand l'utiliser» et «Éviter si», l'ordre de lecture recommandé, la consigne d'abstention et le frontmatter comme signal. Ces éléments orientent un modèle coopératif: ce sont des consignes, que l'outil suit par convention.

Deux contrôles, en revanche, sont absents de ce chemin. Une lecture directe des fichiers ne fournit aucun contexte d'égress: rien n'empêche l'outil d'ouvrir une ressource marquée `confidential`, ni de l'envoyer au fournisseur de son modèle. La porte d'écriture médiée (`tools/core/writes.mjs`) ne vaut que pour les écritures qui l'empruntent: l'outil peut réécrire le même fichier avec son propre outil d'édition, sans proposition ni diff préalable. La trace best-effort n'offre aucune couverture exhaustive d'une telle opération.

### Portes 2 et 3: le serveur MCP

Un client de chat relié au serveur MCP (porte 2) et votre propre couche IA qui appelle ce même serveur (porte 3) passent tous deux par le broker.

**La surface de lecture est traitée comme distante par défaut.** Le serveur ne peut pas savoir si le client connecté est un modèle local ou un modèle hébergé, donc il retient l'hypothèse la plus risquée: `mcpEgress` construit un contexte `modelLocality: "remote"`, que chaque entrée MCP transmet au broker (`mcp/src/base-core-adapter.ts`). Une ressource marquée `confidential`, et toute ressource d'une racine déclarée `egress: local-only` dans `base.config.json`, est retenue. À l'ouverture, le contenu cède la place à l'avis de retenue et la fiche jointe est réduite à ses identifiants. En découverte, en recherche, en routage et dans la liste des marqueurs, la ressource retenue est absente des résultats: son existence est masquée, et pas seulement son contenu.

Chaque contrôle qui retient une ressource est éprouvé sur une racine réelle, inventoriée par le moteur, et jamais sur une fiche écrite à la main pour le test. Un contrôle vérifié sur une fiche fabriquée peut chercher le champ là où une ressource réelle ne le porte pas: il laisse alors passer ce qu'il annonce retenir, sans que rien ne le signale.

**Une variable lève cette retenue: `BASE_MCP_ALLOW_CONFIDENTIAL=1`.** La poser revient à affirmer que le client connecté est local. L'égress ne retient rien vis-à-vis d'un modèle local, donc cette affirmation libère du même geste les ressources `confidential` et les racines `local-only`. Le serveur l'annonce au démarrage par un avertissement. BASE ne peut pas vérifier l'affirmation: elle engage l'opérateur.

**L'écriture passe par `propose` puis `commit`.** `propose_change` n'écrit rien: il enregistre le changement, retourne un identifiant et un diff lisible. `commit_change` applique ce changement, refuse si la cible a changé depuis la proposition, vérifie l'état écrit et retourne un reçu. La politique par défaut refuse un commit dépourvu de confirmation explicite, sauf si la ressource visée a déclaré `requires_confirmation: false`; une cible `sensitive` ou `restricted` ne peut jamais renoncer à la confirmation. Quand la cible est confidentielle ou relève d'une racine `local-only`, le diff lui-même est retenu, puisqu'il porte le contenu actuel du fichier. Une précision sur cette confirmation: `confirmed: true` est un paramètre que pose le client appelant. Le mécanisme garantit qu'une écriture non confirmée est refusée; que la confirmation vienne d'une personne dépend du client, qui doit présenter le diff avant de la poser.

**Le transport HTTP est en lecture seule par défaut.** Dans ce mode, les outils d'écriture et d'exécution ne sont pas enregistrés: aucun outil exposé ne mène à une écriture. Restent la découverte, le routage, la lecture, le paquet de contexte et la consultation des changements en attente. Le transport `stdio` local expose l'écriture médiée, sauf demande contraire (`--read-only`, ou `BASE_MCP_READ_ONLY=1`). Une écoute sur une adresse non locale est refusée sans authentification, sauf dérogation explicitement signalée comme dangereuse.

Une réserve pour la porte 3: une couche intégrée qui effectue une lecture directe ou appelle `base open` sans contexte d'égress se retrouve dans la situation de la porte 1. `base route` fait exception lorsque la Voie 2 livrée sélectionne la stratégie embeddings: sa barrière de stratégie dérive la localité des modèles configurés quel que soit l'appelant, y compris la CLI. Face à des modèles distants, elle garde une racine `local-only` sur le plancher lexical et retire les ressources `confidential` des candidats qui pourraient atteindre le raffineur.

Le modèle route normalement en lisant la carte. Le résultat lexical fourni par la CLI ou le MCP sert de plancher déterministe aux appels sans modèle et d'indication à vérifier lorsqu'un modèle est présent. Les garanties les plus fortes sont celles qu'un mécanisme applique, et le mécanisme présent sur le chemin dépend de la porte. Le détail propriété par propriété figure dans [Mécanismes vs consignes](mecanismes-vs-consignes.md); la frontière des données, dans [La frontière, local par défaut](frontiere-local-vs-sortant.md).

## Ce que BASE public protège

BASE public fournit des garde-fous locaux:

- confinement des chemins dans la racine du projet;
- refus des traversées de chemin;
- refus des symlinks qui sortent du projet;
- validation des identifiants, liens relatifs, sources locales et entrypoints;
- ouverture de ressources par projection `metadata`, `instructions` ou `full`;
- décisions d'accès explicables pour les ressources sensibles;
- invocation d'outils en dry-run par défaut;
- confirmation explicite avant exécution réelle;
- traces JSONL locales, best-effort et non exhaustives, sans contenu métier par défaut.

Ces protections rendent BASE auditable et maintenable pour un usage local, personnel, en PME ou en prototype d'intégration.

Pour le routage sémantique avec embeddings, voir aussi [Sécurité et données du routage](securite-donnees-routage.md): cette page distingue la Voie 2 livrée de l'intégration directe du paquet sémantique.

## Ce que BASE public ne protège pas seul: conformité, IAM, DLP et archivage {#ce-que-base-public-ne-protege-pas-seul}

BASE public ne fournit pas:

- gestion d'identité;
- SSO;
- RBAC enterprise complet;
- DLP;
- SIEM;
- rétention réglementaire;
- archivage légal;
- classification documentaire obligatoire;
- gestion centralisée des secrets;
- sandbox complète;
- garantie d'exactitude des réponses du modèle;
- garantie sur les traitements réalisés par le fournisseur IA;
- transparence sur les instructions que l'outil IA injecte au-dessus de vos fichiers (prompt système, règles, politiques du fournisseur).

Ces éléments relèvent de l'organisation, de son environnement technique et de ses contrats avec les fournisseurs.

**Revue de sécurité externe: prévue, pas encore réalisée.** Le cœur est conçu pour l'audit (aucune dépendance, des mécanismes testés et documentés), mais BASE n'a pas encore été soumis à une revue de sécurité indépendante.

## Données et fournisseurs IA

BASE garde vos fichiers localement. Cela ne signifie pas que tout ce que vous donnez à un outil IA reste local.

Selon l'outil utilisé, le contenu d'une conversation, d'un fichier ouvert ou d'un prompt peut être transmis au fournisseur du modèle. Avant de traiter des données personnelles, clients, RH, financières, médicales ou réglementées, vérifiez:

- les conditions d'utilisation de l'outil IA;
- les options de rétention;
- les garanties contractuelles;
- la localisation des traitements;
- les règles internes de votre organisation.

Pour les données très sensibles, recourez à un environnement adapté ou tenez l'IA hors de la boucle.

## Lecture par niveau d'adoption

| Niveau | Attente raisonnable | Ce qui reste à ajouter |
| ------ | ------------------- | ---------------------- |
| Personnel | Fichiers lisibles, décisions humaines, prudence sur les données sensibles | Choisir ce qui est confié à l'outil IA |
| PME | Validation locale, entretien, conventions de sensibilité, indices de trace best-effort | Règles d'équipe, revue humaine, gestion des accès aux dossiers |
| Grande entreprise | Socle de structuration et d'intégration | IAM, SSO, RBAC, DLP, SIEM, rétention, secrets, audit, conformité |

## Menaces typiques

| Risque | Réponse BASE public | Limite |
| ------ | ------------------- | ------ |
| Chemin malveillant | Confinement local et refus des traversées | Seulement pour les accès médiés |
| Symlink sortant | Refus des symlinks hors projet | Dépend du connecteur utilisé |
| Donnée sensible ouverte sans raison | Métadonnées et décision d'accès explicable | Ne bloque pas un accès direct hors BASE |
| Action irréversible | Dry-run par défaut et confirmation | Ne protège pas les actions hors broker |
| Réponse fausse mais plausible | Points de décision, marqueurs, vérification humaine | Le modèle peut toujours se tromper |
| Prompt injection via donnée externe | Principe de conception: une instruction est destinée au modèle, une donnée externe demeure un contenu à examiner | Cette séparation textuelle reste faillible; elle exige des contrôles techniques adaptés au chemin d'exécution |
| Instructions invisibles de l'outil IA | Souveraineté sur votre couche: fichiers lisibles, portables, auditables | BASE ne voit pas ce que le harness injecte au-dessus de vos fichiers |

La taxonomie `sensitivity` conseille la prudence et peut imposer une confirmation d'écriture. Elle ne bloque pas à elle seule l'égress. Sur les chemins médiés, cette retenue dépend du drapeau `confidential` ou d'une racine déclarée `local-only`.

## Règle de responsabilité

BASE aide à structurer et à vérifier; sa trace opérationnelle reste best-effort et non exhaustive. L'humain garde la responsabilité des décisions; l'organisation garde celle de la sécurité, de la conformité et des accès.

La bonne promesse est donc:

```text
BASE augmente la maîtrise locale.
BASE ne remplace pas une politique de sécurité.
```

## Conforme ne veut pas dire utile

Être en règle et être utile sont deux exigences distinctes. La conformité (registre des traitements, analyse d'impact, et selon la juridiction le RGPD, la nLPD suisse ou l'AI Act européen) encadre ce que vous avez le droit de faire avec l'IA. Elle ne rend pas pour autant le travail utile ni vérifiable: cocher les cases d'un cadre réglementaire ne structure pas l'interaction, ne cible pas l'information pertinente et ne referme pas la boucle de vérification. C'est précisément ce que BASE ajoute, aux côtés de la conformité et jamais à sa place. Ce repère est informatif et ne constitue pas un avis de conformité.
