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

Une garantie est réelle seulement si l'action passe par un mécanisme capable de l'appliquer.

Dans BASE public, ces mécanismes sont:

- la CLI `base`;
- le broker dans `tools/base-core.mjs`;
- le serveur MCP quand il délègue au broker;
- un futur connecteur contrôlé.

Si un agent dispose d'un accès direct au shell, au filesystem ou à une API externe sans passer par BASE, les métadonnées YAML restent utiles comme guide et comme signal d'audit, mais elles ne bloquent pas mécaniquement l'action.

**Conséquence concrète, sans équipe technique:** au navigateur seul, les garanties sont des *consignes* qu'un modèle coopératif suit, non des mécanismes appliqués. Pour une application réelle (confinement, prévisualisation avant écriture, routage validé), il faut le broker, par la CLI ou par le MCP. Le détail, palier par palier, figure dans [Essayer BASE sans rien installer](../start/essayer-sans-installer.md), utile notamment pour une administration qui doit savoir ce qui est garanti à chaque niveau.

Un process peut déclarer qu'il a besoin de lire une source ou d'exécuter une tool. Cette déclaration exprime un besoin de travail; elle n'accorde aucune permission. Les droits réels restent portés par l'OS, le dossier partagé, le Drive, le connecteur, l'API, le token ou le harness utilisé.

## Actions qui passent par BASE

Une action passe par BASE quand elle utilise la CLI, le broker ou le serveur MCP pour demander à BASE d'agir. Exemples typiques:

- `base open <id>` ou `open_resource`: ouvrir une ressource inventoriée, avec projection et policy;
- `base access <path>` ou `access_resource`: lire un fichier confiné dans la racine du projet;
- `base invoke <tool>` ou `invoke_tool`: préparer une commande en dry-run, puis l'exécuter seulement si elle est confirmée;
- `base propose` puis `base commit`, ou `propose_change` puis `commit_change`: écrire via un changement proposé, confirmé et vérifié.

Dans ces cas, BASE peut appliquer confinement, décisions `allow` / `deny` / `needs_approval`, dry-run, confirmation et trace minimale. Si l'action contourne ces points d'entrée, elle dépend des droits natifs de l'outil ou de l'environnement.

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
- traces minimales JSONL sans contenu métier par défaut.

Ces protections rendent BASE auditable et maintenable pour un usage local, personnel, en PME ou en prototype d'intégration.

Pour le routage sémantique avec embeddings, voir aussi `docs/trust/securite-donnees-routage.md`: cette page
précise quelles chaînes peuvent partir vers un fournisseur, comment réduire l'exposition et comment
journaliser sans contenu métier.

## Ce que BASE public ne protège pas seul

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
| PME | Validation locale, entretien, conventions de sensibilité, traces minimales | Règles d'équipe, revue humaine, gestion des accès aux dossiers |
| Grande entreprise | Socle de structuration et d'intégration | IAM, SSO, RBAC, DLP, SIEM, rétention, secrets, audit, conformité |

## Menaces typiques

| Risque | Réponse BASE public | Limite |
| ------ | ------------------- | ------ |
| Chemin malveillant | Confinement local et refus des traversées | Seulement pour les accès médiés |
| Symlink sortant | Refus des symlinks hors projet | Dépend du connecteur utilisé |
| Donnée sensible ouverte sans raison | Métadonnées et décision d'accès explicable | Ne bloque pas un accès direct hors BASE |
| Action irréversible | Dry-run par défaut et confirmation | Ne protège pas les actions hors broker |
| Réponse fausse mais plausible | Points de décision, marqueurs, vérification humaine | Le modèle peut toujours se tromper |
| Prompt injection via donnée externe | Principe de conception (une consigne, non un mécanisme appliqué par le code comme le confinement ou le contrôle d'égress): une instruction s'exécute, une donnée externe demeure un contenu à lire | Exige discipline et médiation technique |
| Instructions invisibles de l'outil IA | Souveraineté sur votre couche: fichiers lisibles, portables, auditables | BASE ne voit pas ce que le harness injecte au-dessus de vos fichiers |

## Règle de responsabilité

BASE aide à structurer, à vérifier et à tracer. L'humain garde la responsabilité des décisions; l'organisation garde celle de la sécurité, de la conformité et des accès.

La bonne promesse est donc:

```text
BASE augmente la maîtrise locale.
BASE ne remplace pas une politique de sécurité.
```

## Conforme ne veut pas dire utile

Être en règle et être utile sont deux exigences distinctes. La conformité (registre des traitements, analyse d'impact, et selon la juridiction le RGPD, la nLPD suisse ou l'AI Act européen) encadre ce que vous avez le droit de faire avec l'IA. Elle ne rend pas pour autant le travail utile ni vérifiable: cocher les cases d'un cadre réglementaire ne structure pas l'interaction, ne cible pas l'information pertinente et ne referme pas la boucle de vérification. C'est précisément ce que BASE ajoute, aux côtés de la conformité et jamais à sa place. Ce repère est informatif et ne constitue pas un avis de conformité.
