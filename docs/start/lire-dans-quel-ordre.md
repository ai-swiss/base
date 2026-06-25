---
schema_version: base.resource.v1
id: lire-dans-quel-ordre
type: document
title: Par où commencer
description: Le parcours de lecture à suivre selon votre profil: personne seule, PME, grande entreprise ou institution publique, pour ne lire que ce qui vous concerne.
scope: public
status: active
sensitivity: public
keywords: [lecture, parcours, personnel, pme, entreprise, grande-entreprise, institution, secteur-public, integration, onboarding, structure]
---

# Par où commencer

Le dépôt peut sembler dense au premier abord, car il réunit trois choses à la fois: un framework utilisable, des exemples métier et une base technique vérifiable. Cette page vous évite de tout lire en vous donnant l'ordre de lecture adapté à votre situation, que vous soyez seul, en PME, en grande entreprise ou dans le secteur public.

C'est aussi la source de vérité des parcours de lecture. Les autres documents peuvent reprendre une boussole courte, mais celle-ci garde la hiérarchie complète par profil.

## Si vous êtes une personne seule

Objectif: essayer vite, comprendre assez, garder vos fichiers lisibles.

Lisez dans cet ordre:

1. `README.md` pour comprendre l'idée générale.
2. `docs/learn/co-penser-avec-lia.md` pour comprendre *pourquoi* BASE est nécessaire (la méthode, en bref).
3. **`docs/tutoriel/index.md`**, le tutoriel «Apprendre en faisant»: le parcours recommandé, pas à pas et vérifié à chaque étape (Découverte sans rien installer, Praticien, Équipe).
4. `docs/start/quickstart.md` pour essayer en quelques minutes (ou `docs/start/essayer-sans-installer.md` si vous n'avez qu'un navigateur, sans rien installer).
5. La démo `exemples/assistant-devis-demo/`, puis le dossier `exemples/assistant-devis/` si vous voulez repartir de vos propres données.
6. `docs/learn/comprendre.md` seulement si vous voulez approfondir la méthode.
7. `docs/trust/evidence.md` si vous voulez vérifier les promesses et leurs limites.

Vous pouvez ignorer au début:

- `mcp/`;
- `tools/`;
- `tests/`;
- `base.schema.json`;
- `base.manifest.json`;
- `docs/reference/specification-v0.md`.

À ce niveau, BASE peut rester très simple: un assistant, quelques fichiers Markdown, des décisions humaines explicites.

Si vous êtes perdu, dites simplement «Aide» ou «Je suis perdu». Avec le routage activé, BASE vous accueille (`concierge-base`) au lieu de vous laisser sans suite; sinon chargez `.ai/agents/concierge-base/AGENT.md`.

## Si vous êtes une PME ou une petite équipe

Objectif: passer d'un usage individuel à une mémoire de travail partagée.

Lisez dans cet ordre:

1. `README.md` pour l'intuition et les exemples.
2. `docs/learn/co-penser-avec-lia.md` pour le pourquoi: la vérification, les quatre pertes, la méthode.
3. `docs/start/quickstart.md` pour le démarrage local et les commandes.
4. `docs/audiences/kit-demarrage-pme-suisse.md` pour poser les règles d'équipe: données, validation, versioning, entretien.
5. `docs/audiences/pour-qui.md` pour situer votre niveau d'adoption.
6. `docs/reference/framework-public.md` pour comprendre les abstractions stables.
7. `docs/reference/routage-process-et-ressources.md` pour comprendre la chaîne agent → process → ressources.
8. `docs/guides/routage-semantique-quickstart.md` pour comprendre comment BASE choisit agent et process.
9. `docs/learn/pratiques-co-pensee.md` pour éviter les mauvais usages de l'IA.
10. `docs/reference/documentation-interactive.md` si vous voulez exposer ou déployer une documentation vivante sans dupliquer les sources.

À ce niveau, les fichiers importants sont:

- `.ai/agents/` pour les agents et skills;
- `exemples/` pour copier une base métier;
- `tools/` pour valider, indexer, découvrir et entretenir;
- `base.schema.json` pour stabiliser les métadonnées partagées.

Si vous gérez **plusieurs BASE** (par exemple plusieurs clients), un `base.workspace.json` déclare plusieurs racines: `base route --workspace <fichier>` cherche entre elles et `--root-id <id>` cible une racine précise (chaque lecture/écriture reste confinée à la racine choisie). Voir [Routage, process et ressources](../reference/routage-process-et-ressources.md) et `specs/current/10_core/cli.md`.

Vous n'avez pas besoin d'une plateforme lourde. Vous avez besoin de conventions claires, d'une validation locale, de descriptions lisibles et d'un entretien régulier.

## Si vous êtes une grande entreprise

Objectif: évaluer BASE comme langage de structuration et socle d'intégration, pas comme plateforme de conformité complète.

Lisez dans cet ordre:

1. `docs/learn/co-penser-avec-lia.md` pour le *pourquoi* (commun à tous les profils): la vérification, les quatre pertes, la méthode.
2. `docs/reference/framework-public.md` pour le modèle public.
3. `docs/reference/base-et-vos-outils-ia.md` pour comprendre comment BASE coexiste avec vos outils et plateformes IA (et y intégrer un agent planifié), puis `docs/reference/positionnement.md` pour situer BASE catégorie par catégorie dans le paysage des outils de 2026.
4. `docs/reference/etat-implementation.md` pour distinguer livré, prévu et hors périmètre.
5. `docs/guides/choisir-provider-embeddings.md` pour comparer local, cloud, gateway et modèle interne.
6. `docs/trust/securite-donnees-routage.md` pour cadrer les données envoyées aux providers.
7. `docs/learn/comprendre-echelle.md` et `docs/guides/benchmarks-echelle.md` pour juger l'index optionnel.
8. `docs/reference/specification-v0.md` pour l'architecture long terme.
9. `mcp/README.md` pour l'intégration aux plateformes IA.
10. `docs/trust/securite-et-limites.md` pour le modèle de sécurité et ses limites.
11. `docs/audiences/kit-enterprise.md` pour les modes de déploiement, la configuration stricte et les limites enterprise.
12. `docs/trust/souverainete-et-confiance.md` pour justifier le choix (souveraineté, nLPD, licence, gouvernance) en une page.
13. `base.schema.json` pour inspecter le contrat machine.
14. `tests/` pour voir ce qui est vérifié.

À ce niveau, BASE doit être relié aux systèmes de l'organisation: IAM, SSO, RBAC, DLP, SIEM, rétention, classification, revue juridique, gestion des secrets et séparation des environnements.

La bonne lecture est donc:

```text
BASE public = structure lisible + broker local + MCP + tests
Entreprise = gouvernance, sécurité et intégration autour de cette structure
```

## Si vous êtes une institution publique

Objectif: évaluer BASE sans confondre composant local-first, conformité institutionnelle et politique fournisseur.

Lisez dans cet ordre:

1. `docs/learn/co-penser-avec-lia.md` pour le *pourquoi*: vérification humaine, responsabilité et mémoire.
2. `docs/trust/souverainete-et-confiance.md` pour la synthèse nLPD, licence, sécurité et gouvernance.
3. `docs/audiences/kit-administration-secteur-public.md` pour cadrer données citoyens, classification, accessibilité, archivage et marchés publics.
4. `docs/trust/securite-et-limites.md` pour garder visible ce que BASE n'applique pas seul.
5. `docs/audiences/kit-enterprise.md` pour la configuration stricte et les modes de déploiement.
6. `mcp/README.md` si l'institution veut connecter BASE à une plateforme IA.
7. `specs/current/README.md`, `base.schema.json` et `tests/` pour l'audit technique.

À ce niveau, BASE est un composant auditable. La conformité reste dans vos décisions institutionnelles: base légale, registre des traitements, IAM, DLP, archivage, achats, fournisseur de modèle et revue juridique.

## Ce que chaque dossier veut dire

| Élément | Rôle | À lire quand |
| ------- | ---- | ------------ |
| `README.md` | Porte d'entrée | Toujours |
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
| `docs/reference/routage-process-et-ressources.md` | Doctrine agent → process → ressources | Quand vous activez le routage ou structurez plusieurs workflows |
| `tools/` | CLI locale et broker | Quand vous voulez vérifier ou automatiser |
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
| `LICENSE` | Double licence | Quand vous réutilisez ou publiez |
| `docs/trust/licence.md` | Explication lisible de la licence | Quand vous voulez comprendre la réutilisation |
| `CLAUDE.md` | Adaptateur Claude Code | Seulement pour ce harness |
| `.cursor/rules/` | Adaptateur Cursor | Seulement pour Cursor |

## Ce qui n'est pas le cœur

`CLAUDE.md` et `.cursor/rules/` existent pour aider des outils précis à charger le bon contexte. Ils ne définissent pas BASE.

`base.manifest.json` est généré par `base index`. Il facilite la découverte, mais il n'est pas la source de vérité.

`mcp/` est une intégration. Elle prouve la portabilité, mais vous pouvez utiliser BASE sans serveur MCP.

`tests/` et `tools/` rendent le framework crédible et maintenable. Une personne qui veut seulement essayer un assistant peut les ignorer.
