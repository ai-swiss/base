---
schema_version: base.resource.v1
id: lire-dans-quel-ordre
type: document
title: Par où commencer
description: "Le parcours de lecture à suivre selon votre profil: personne seule, PME, grande entreprise ou institution publique, pour ne lire que ce qui vous concerne."
scope: public
status: active
sensitivity: public
keywords: [lecture, parcours, personnel, pme, entreprise, grande-entreprise, institution, secteur-public, integration, onboarding, structure]
---

# Par où commencer

Au premier abord, le dépôt peut sembler dense, car il réunit trois choses à la fois: une convention ouverte avec son implémentation de référence, des exemples métier et une base technique vérifiable. Cette page vous évite de tout lire: elle vous donne l'ordre de lecture adapté à votre situation, que vous soyez seul, en PME, en grande entreprise ou dans le secteur public.

C'est la page de référence pour les parcours de lecture. Les autres documents peuvent en reprendre une boussole abrégée, mais celle-ci conserve la hiérarchie complète par profil.

## Si vous êtes une personne seule

Objectif: essayer vite, comprendre assez, suivre votre propre fil de pensée avec l'IA et garder vos fichiers lisibles.

Lisez dans cet ordre:

1. **Voir BASE marcher une fois**, avant toute théorie: la démo [`exemples/assistant-devis-demo/`](../../exemples/assistant-devis-demo/) (posez la question sur la remise fidélité de Dupont), ou [Voir BASE en action](demo-60-secondes.md). Objectif: voir un `[A VALIDER]` d'abord.
2. **Essayer ou garder**, selon votre outil: [Façonnez votre premier assistant](quickstart.md) pour quelques minutes (ou [Essayer BASE sans installer BASE](essayer-sans-installer.md) si vous n'avez qu'un navigateur); repartez de vos propres données avec [`exemples/assistant-devis/`](../../exemples/assistant-devis/).
3. **Faire grandir:** le tutoriel [Apprendre en faisant](../tutoriel/index.md), pas à pas et vérifié à chaque étape (Découverte sans rien installer, Praticien, Équipe).
4. **Comprendre pourquoi**, quand vous le voulez: [`README.fr.md`](../../README.fr.md) (l'idée générale et les sections de fond), puis [Co-penser avec l'IA](../learn/co-penser-avec-lia.md) (la méthode) et [Pratiques de co-pensée](../learn/pratiques-co-pensee.md) (la méthode au quotidien, 16 principes).
5. [Comprendre BASE](../learn/comprendre.md) seulement si vous voulez approfondir la méthode.
6. [Preuves](../trust/evidence.md) si vous voulez vérifier les promesses et leurs limites.

Vous pouvez ignorer au début:

- `mcp/`;
- `tools/`;
- `tests/`;
- `base.schema.json`;
- `base.manifest.json`;
- `docs/reference/specification-v0.md`.

À ce niveau, BASE peut rester très simple: un assistant, quelques fichiers Markdown, des décisions humaines explicites.

Si vous êtes perdu, dites simplement «Aide» ou «Je suis perdu». Avec le routage activé, le routeur choisit l'accueil `concierge-base` au lieu de vous laisser sans réponse; sinon, chargez `.ai/agents/concierge-base/AGENT.md`.

## Si vous êtes une PME ou une petite équipe

Objectif: passer d'un usage individuel à une mémoire de travail partagée.

Lisez dans cet ordre:

1. [`README.fr.md`](../../README.fr.md) pour l'intuition et les exemples.
2. [Co-penser avec l'IA](../learn/co-penser-avec-lia.md) pour le pourquoi: la souveraineté cognitive, les pertes de contrôle (dont la vérification), la méthode.
3. [Façonnez votre premier assistant](quickstart.md) pour le démarrage local et les commandes.
4. [Au-delà des agents](../learn/au-dela-des-agents.md) pour comprendre pourquoi l'intention, et non une partition fixée d'avance entre agents, doit guider l'organisation du travail.
5. [Kit de démarrage PME suisse](../audiences/kit-demarrage-pme-suisse.md) pour poser les règles d'équipe: données, validation, versioning, entretien.
6. [Pour qui](../audiences/pour-qui.md) pour situer votre niveau d'adoption.
7. [Cadre public](../reference/framework-public.md) pour comprendre les abstractions stables.
8. [Routage, process et ressources](../reference/routage-process-et-ressources.md) pour comprendre la chaîne agent → process → ressources.
9. [Démarrage du routage sémantique](../guides/routage-semantique-quickstart.md) pour comprendre comment le routeur choisit un agent et un process.
10. [Pratiques de co-pensée](../learn/pratiques-co-pensee.md) pour éviter les mauvais usages de l'IA.
11. [Documentation interactive](../reference/documentation-interactive.md) si vous voulez exposer ou déployer une documentation vivante sans dupliquer les sources.
12. [Adoption en organisation](../learn/adoption-organisation.md) pour la trajectoire d'adoption: comment une pratique individuelle devient un process d'équipe, qui le promeut et qui en répond.
13. [Cycle de vie de l'expertise](../learn/cycle-de-vie-expertise.md) pour l'entretien dans la durée: frictions du terrain, dates de validité, évaluation, ce que `node .ai/base.mjs doctor` surveille après l'initialisation.

À ce niveau, les fichiers importants sont:

- `.ai/agents/` pour les agents et skills;
- `exemples/` pour copier une base métier;
- `tools/` pour valider, indexer, découvrir et entretenir;
- `base.schema.json` pour stabiliser les métadonnées partagées.

Si vous gérez **plusieurs racines BASE** (par exemple plusieurs clients), un `base.workspace.json` les déclare: après l'initialisation, `node .ai/base.mjs route --workspace <fichier>` permet au routeur de chercher parmi elles et `--root-id <id>` cible une racine précise (chaque lecture et chaque écriture qui passe par ce chemin reste confinée à la racine choisie). Le lanceur n'installe pas la commande courte `base`. Voir [Routage, process et ressources](../reference/routage-process-et-ressources.md) et `specs/current/10_core/cli.md`.

Vous n'avez pas besoin d'une plateforme lourde, mais de conventions claires, d'une validation locale, de descriptions lisibles et d'un entretien régulier.

## Si vous êtes une grande entreprise

Objectif: évaluer BASE comme langage de structuration et socle d'intégration, pas comme plateforme de conformité complète.

Lisez dans cet ordre:

1. [Co-penser avec l'IA](../learn/co-penser-avec-lia.md) pour le *pourquoi* (commun à tous les profils): la vérification, les pertes de contrôle, la méthode.
2. [La convention `base.resource.v1`](../reference/le-standard.md) pour sa page citable (format, séparations, conventions de routage, stabilité), puis le [cadre public](../reference/framework-public.md) pour le modèle public.
3. [BASE et vos outils IA](../reference/base-et-vos-outils-ia.md) pour comprendre comment BASE coexiste avec vos outils et plateformes IA (et y intégrer un agent planifié), puis le [positionnement](../reference/positionnement.md) pour situer BASE catégorie par catégorie dans le paysage des outils de 2026.
4. [État de l'implémentation](../reference/etat-implementation.md) pour distinguer livré, prévu et hors périmètre.
5. [Choisir un fournisseur d'embeddings](../guides/choisir-provider-embeddings.md) pour comparer local, cloud, gateway et modèle interne.
6. [Sécurité des données et routage](../trust/securite-donnees-routage.md) pour cadrer les données envoyées aux fournisseurs.
7. [Comprendre l'échelle](../learn/comprendre-echelle.md) et [Benchmarks à l'échelle](../guides/benchmarks-echelle.md) pour juger l'index optionnel.
8. [Spécification d'ingénierie](../reference/specification-v0.md) pour rejoindre la spécification courante.
9. [Serveur MCP](../../mcp/README.md) pour l'intégration aux plateformes IA.
10. [Sécurité et limites](../trust/securite-et-limites.md) pour le modèle de sécurité et ses limites.
11. [Kit entreprise](../audiences/kit-enterprise.md) pour les modes de déploiement, la configuration stricte et les limites d'entreprise.
12. [Souveraineté et confiance](../trust/souverainete-et-confiance.md) pour justifier le choix (souveraineté, nLPD, licence, gouvernance) en une page.
13. [`base.schema.json`](../../base.schema.json) pour inspecter le contrat machine.
14. [`tests/`](../../tests/) pour voir ce qui est vérifié.

À ce niveau, BASE doit être relié aux systèmes de l'organisation: IAM, SSO, RBAC, DLP, SIEM, rétention, classification, revue juridique, gestion des secrets et séparation des environnements. [Adoption en organisation](../learn/adoption-organisation.md) décrit la trajectoire des usages individuels aux flux institués.

Il faut donc le lire ainsi:

```text
BASE public = convention ouverte + implémentation de référence + structure lisible + composant de médiation local + MCP + tests
Entreprise = gouvernance, sécurité et intégration autour de cette structure
```

## Si vous êtes une institution publique

Objectif: évaluer BASE sans confondre composant local-first, conformité institutionnelle et politique fournisseur.

Lisez dans cet ordre:

1. [Co-penser avec l'IA](../learn/co-penser-avec-lia.md) pour le *pourquoi*: vérification humaine, responsabilité et mémoire.
2. [Souveraineté et confiance](../trust/souverainete-et-confiance.md) pour la synthèse nLPD, licence, sécurité et gouvernance.
3. [Kit pour l'administration et le secteur public](../audiences/kit-administration-secteur-public.md) pour cadrer données citoyens, classification, accessibilité, archivage et marchés publics.
4. [Sécurité et limites](../trust/securite-et-limites.md) pour garder visible ce que l'implémentation de référence n'applique pas seule.
5. [Kit entreprise](../audiences/kit-enterprise.md) pour la configuration stricte et les modes de déploiement.
6. [Serveur MCP](../../mcp/README.md) si l'institution veut connecter BASE à une plateforme IA.
7. [`specs/current/README.md`](../../specs/current/README.md), [`base.schema.json`](../../base.schema.json) et [`tests/`](../../tests/) pour l'audit technique.

À ce niveau, BASE est un composant auditable. La conformité, elle, relève de vos décisions institutionnelles: base légale, registre des traitements, IAM, DLP, archivage, achats, fournisseur de modèle et revue juridique.

## Ce que chaque dossier veut dire

| Élément | Rôle | À lire quand |
| ------- | ---- | ------------ |
| [`README.fr.md`](../../README.fr.md) | Porte d'entrée française | Toujours |
| `BASE_BOOTSTRAP.md` | Bootstrap générique de routage pour harness IA | Quand vous intégrez BASE dans un outil IA |
| `.ai/agents/` | Cœur portable des assistants | Quand vous adaptez BASE |
| `.ai/agents/concierge-base/` | Accueil et aide BASE (cible de repli du routeur) | Quand vous êtes perdu ou avez une question sur BASE |
| `exemples/` | Assistants prêts à copier | Quand vous voulez essayer |
| `docs/` | Explications, principes, architecture | Selon votre profil |
| `docs/start/demo-60-secondes.md` | Voir BASE en action: il s'appuie sur un fichier, nomme sa source et pose un point de validation | Quand vous voulez voir BASE avant de lire |
| `docs/audiences/kit-demarrage-pme-suisse.md` | Règles pratiques pour une petite équipe suisse | Quand vous partagez un assistant en PME |
| `docs/audiences/kit-enterprise.md` | Configuration stricte, modes de déploiement et limites enterprise | Quand vous évaluez BASE en organisation |
| `docs/audiences/kit-administration-secteur-public.md` | Checklist pour institutions publiques | Quand données citoyens, achats ou archivage entrent dans le périmètre |
| `docs/reference/documentation-interactive.md` | Documentation locale, publique et déployable générée depuis les sources | Quand vous voulez apprendre, publier ou auditer BASE dans un portail |
| `docs/trust/evidence.md` | Promesses, mécanismes, tests et limites | Quand vous voulez auditer les affirmations de BASE |
| `docs/reference/glossaire.md` | Définitions des termes (broker, routage, mécanisme, consigne, egress) | Quand un mot technique n'est pas clair |
| `docs/reference/le-standard.md` | La page citable du standard `base.resource.v1`: format, séparations, conventions, stabilité | Quand vous citez, comparez ou réimplémentez le format |
| `docs/reference/routage-process-et-ressources.md` | Doctrine agent → process → ressources | Quand vous activez le routage ou structurez plusieurs workflows |
| `tools/` | CLI locale et composant de médiation | Quand vous voulez vérifier ou automatiser |
| `mcp/` | Adaptateur vers outils IA compatibles MCP | Quand vous voulez intégrer |
| `tests/` | Garanties vérifiables | Quand vous auditez ou contribuez |
| `specs/` | Spécification d'ingénierie (`UR/FR/NFR/AD`, schémas) | Quand vous intégrez ou auditez en profondeur |
| `packages/` | Packages officiels optionnels (ranker sémantique, index local) | À l'échelle, pour des corpus difficiles ou grands |
| `base.config.json` | Config locale: extensions et repli d'aide (`routing.fallback`) | Quand vous activez le routage ou un repli |
| `base.workspace.json` | Plusieurs racines BASE déclarées (multi-client) | Quand vous gérez plusieurs BASE |
| `base.schema.json` | Contrat des métadonnées | Quand vous partagez ou gouvernez |
| `base.manifest.json` | Index généré | Quand vous inspectez la découverte |
| `SECURITY.md` | Politique de signalement | Quand vous évaluez ou signalez un risque |
| `CHANGELOG.md` | Changements notables | Quand vous suivez les versions |
| [`LICENSING.md`](../../LICENSING.md) | Répartition de la double licence | Quand vous réutilisez ou publiez |
| `docs/trust/licence.md` | Explication lisible de la licence | Quand vous voulez comprendre la réutilisation |
| `CLAUDE.md` | Adaptateur Claude Code | Seulement pour ce harness |
| `.cursor/rules/` | Adaptateur Cursor | Seulement pour Cursor |

## Ce qui n'est pas le cœur

`CLAUDE.md` et `.cursor/rules/` existent pour aider tel ou tel outil à charger le bon contexte. Ils ne définissent pas BASE.

`base.manifest.json` est généré par `base index`. Il facilite la découverte, mais ne remplace pas les fichiers sources.

`mcp/` est une intégration. Elle atteste la portabilité, mais BASE s'utilise très bien sans serveur MCP.

`tests/` et `tools/` rendent l'implémentation de référence vérifiable et maintenable. Qui veut seulement essayer un assistant peut les laisser de côté.

**Prochaine action:** repérez votre profil ci-dessus et ouvrez le premier document de sa liste.
