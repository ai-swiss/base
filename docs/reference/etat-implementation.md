---
schema_version: base.resource.v1
id: etat-implementation
type: document
title: Ce que le cœur public de BASE fait aujourd'hui
description: Le repère honnête de ce que le cœur public sait faire et ne fait pas aujourd'hui, avec les trois sources qui font foi (spécification, exigences, matrice de couverture).
scope: public
status: active
sensitivity: public
keywords: [etat, implementation, couverture, fonctionnalites, aujourd, hui, perimetre]
---

# Ce que le cœur public de BASE fait aujourd'hui

Cette page s'adresse à qui veut savoir, aujourd'hui, ce que le cœur public de BASE sait faire et ce qu'il ne fait pas, sans avoir à le deviner. Elle offre un repère honnête et renvoie aux trois sources qui font foi plutôt que de les recopier:

- **la frontière exacte** (dans le périmètre, hors périmètre): [`specs/current/00_overview/perimeter.md`](../../specs/current/00_overview/perimeter.md);
- **la preuve de chaque comportement**: la matrice exigences vers tests, [`specs/current/10_core/requirements-matrix.md`](../../specs/current/10_core/requirements-matrix.md);
- **l'historique et les orientations**: le [`CHANGELOG.md`](../../CHANGELOG.md).

En cas de divergence entre l'une de ces sources et cette page, c'est la source qui fait foi. Pour savoir quel niveau d'adoption correspond à votre situation, voyez aussi [`docs/audiences/pour-qui.md`](../audiences/pour-qui.md).

## Ce que fait le cœur public

- Inventaire local des ressources Markdown et JSON.
- Validation du frontmatter BASE, des identifiants, des liens relatifs, des sources locales et des entrypoints d'outils.
- Recherche locale explicable sur identifiant, titre, description, mots-clés, chemin et texte.
- Routage local agent vers process avec abstention structurée: `base route` et l'outil MCP `route_request` retournent `routed`, `ambiguous`, `needs_clarification` ou `out_of_scope`, avec candidats et raisons.
- Tests de routage métier: `base route-test` lit des fixtures JSON et échoue en cas de dérive.
- Package officiel de ranker sémantique reposant sur de vrais embeddings: `@ai-swiss/base-ranker-semantic`, distinct du cœur, accepte tout fournisseur d'embeddings, fournit un connecteur compatible OpenAI sans SDK cloud, et un helper Ollama facultatif (`createOllamaEmbedder`, modèle `nomic-embed-text`). Il est taillé pour la production: délais par appel, annulation par `AbortSignal`, reprises bornées sur les seules erreurs transitoires (backoff et jitter), batching explicite via `createBatchingEmbedder`, cache configurable qu'aucun échec transitoire ne vient corrompre, erreurs typées (`.code`), validation stricte des vecteurs et observabilité dépourvue de contenu métier.
- Package officiel d'index local facultatif: `@ai-swiss/base-index-local`, distinct du cœur, projette depuis l'inventaire et les signaux de routage un index dérivé et supprimable. Le routage indexé réutilise le Ranker et le Router injectés et retourne par défaut les mêmes statuts qu'en mémoire, y compris avec un ranker sémantique sans correspondance lexicale; `candidateMode:"lexical"` n'est qu'une optimisation explicite. Benchmarks reproductibles de 100 à 50 000 documents. Pour les petits et moyens corpus, le cœur demeure l'option par défaut.
- Ouverture de ressource avec projections `metadata`, `instructions` et `full`.
- Accès local confiné dans le projet, avec refus des traversées de chemin et des symlinks sortants.
- Invocation d'outils locaux en dry-run par défaut, l'exécution réelle exigeant une confirmation explicite.
- Écriture métier médiée: `propose_change` prépare un diff lisible sans rien écrire; `commit_change` écrit une fois la décision prise (confirmation requise par défaut, réglable ressource par ressource via `requires_confirmation`, jamais facultative pour `sensitive`/`restricted`), vérifie l'état écrit et le consigne.
- Promotion de ressource (`promote`): met à jour `scope`, `promoted_from` et `promoted_at` via l'écriture médiée, avec diff et confirmation.
- Liste des marqueurs ouverts (`markers`): `[A VALIDER]`, `[A COMPLETER]`, `[ATTENTION]`, `[DECISION]` dans les documents métier.
- Projection multi-harness (`build`): génère depuis le noyau un index `AGENTS.md` (compatibilité avec la famille Codex/AGENTS.md) et une matrice d'outils (`.ai/tools.md`) qui déclare honnêtement le niveau d'enforcement réel de chaque harness. Sur demande, `base build routing-index` produit en outre la carte de routage lisible par l'agent (`.ai/routing/index.md` et un index par agent), projection déterministe des signaux de routage. Ce sont des artefacts dérivés, jamais des sources de vérité.
- Trace minimale JSONL pour les opérations médiées par BASE, sans contenu métier par défaut.
- Entretien local: erreurs, avertissements, marqueurs ouverts, descriptions manquantes et signaux issus des traces quand elles existent.
- Manifest dérivé et régénérable pour la découverte.
- Serveur MCP comme adaptateur vers les mêmes primitives, sans logique métier propre.

## Hors cœur public

La frontière de référence est [`specs/current/00_overview/perimeter.md`](../../specs/current/00_overview/perimeter.md). En résumé, le cœur public ne fournit pas, à lui seul:

- RBAC enterprise complet.
- SSO, IAM, DLP, SIEM, archivage légal et rétention réglementaire.
- Isolation stricte si l'agent dispose d'un accès direct au shell, au filesystem ou aux API hors BASE.
- Garantie d'exactitude automatique des réponses générées par un modèle.
- Moteur de workflow, DAG, interface d'automation ou DSL propriétaire.

## Règle de lecture

BASE guide partout par le texte. BASE applique seulement ce qui passe par son broker, sa CLI, son MCP ou un connecteur contrôlé.

Une métadonnée YAML exprime une unité sémantique stable. C'est le code qui décide ensuite ce qui peut être vérifié ou appliqué. Cette séparation lui permet de rester simple pour une personne seule, utile pour une PME et extensible pour une organisation plus vaste.
