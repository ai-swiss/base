# Ce que le cœur public de BASE fait aujourd'hui

Cette page s'adresse à qui veut savoir, au présent, ce que le cœur public de BASE sait faire et ce qu'il ne fait pas, sans deviner. Elle existe pour donner un repère honnête et renvoie aux trois sources qui font foi plutôt que de les recopier:

- **la frontière exacte** (dans le périmètre, hors périmètre): [`specs/current/00_overview/perimeter.md`](../../specs/current/00_overview/perimeter.md);
- **la preuve de chaque comportement**: la matrice exigences vers tests, [`specs/current/10_core/requirements-matrix.md`](../../specs/current/10_core/requirements-matrix.md);
- **l'historique et les orientations**: le [`CHANGELOG.md`](../../CHANGELOG.md).

En cas de divergence entre l'une de ces sources et cette page, la source fait foi. Pour comprendre quel niveau d'adoption correspond à votre situation, voyez aussi [`docs/audiences/pour-qui.md`](../audiences/pour-qui.md).

## Ce que fait le cœur public

- Inventaire local des ressources Markdown et JSON.
- Validation du frontmatter BASE, des identifiants, des liens relatifs, des sources locales et des entrypoints d'outils.
- Recherche locale explicable sur identifiant, titre, description, mots-clés, chemin et texte.
- Routage local agent vers process avec abstention structurée: `base route` et l'outil MCP `route_request` retournent `routed`, `ambiguous`, `needs_clarification` ou `out_of_scope`, avec candidats et raisons.
- Tests de routage métier: `base route-test` lit des fixtures JSON et échoue en cas de dérive.
- Package officiel de ranker sémantique avec vrais embeddings: `@ai-swiss/base-ranker-semantic`, séparé du cœur, accepte tout fournisseur d'embeddings, fournit un connecteur OpenAI-compatible sans SDK cloud, et un helper Ollama optionnel (`createOllamaEmbedder`, modèle `nomic-embed-text`). Robuste pour la production: timeouts par appel, annulation par `AbortSignal`, retries bornés sur erreurs transitoires uniquement (backoff plus jitter), batching explicite via `createBatchingEmbedder`, cache configurable sans empoisonnement par échec transitoire, erreurs typées (`.code`), validation stricte des vecteurs et observabilité sans contenu métier.
- Package officiel d'index local optionnel: `@ai-swiss/base-index-local`, séparé du cœur, projette un index dérivé et supprimable depuis l'inventaire et les signaux de routage. Le routage indexé réutilise le Ranker et le Router injectés et retourne les mêmes statuts qu'en mémoire par défaut, y compris avec un ranker sémantique sans match lexical; `candidateMode:"lexical"` est une optimisation explicite. Benchmarks reproductibles de 100 à 50 000 documents. Le cœur reste le défaut pour les petits et moyens corpus.
- Ouverture de ressource avec projections `metadata`, `instructions` et `full`.
- Accès local confiné dans le projet, avec refus des traversées de chemin et des symlinks sortants.
- Invocation d'outils locaux en dry-run par défaut, avec confirmation explicite pour l'exécution.
- Écriture métier médiée: `propose_change` prépare un diff lisible sans rien écrire, `commit_change` écrit après décision (confirmation requise par défaut, paramétrable par ressource via `requires_confirmation`, jamais optionnelle pour `sensitive`/`restricted`), vérifie l'état écrit et trace.
- Promotion de ressource (`promote`): met à jour `scope`, `promoted_from` et `promoted_at` via l'écriture médiée, avec diff et confirmation.
- Liste des marqueurs ouverts (`markers`): `[A VALIDER]`, `[A COMPLETER]`, `[ATTENTION]`, `[DECISION]` dans les documents métier.
- Projection multi-harness (`build`): génère depuis le noyau un index `AGENTS.md` (compatibilité famille Codex/AGENTS.md) et une matrice d'outils (`.ai/tools.md`) déclarant honnêtement le niveau d'enforcement réel par harness. `base build routing-registry` génère aussi, sur demande, `.ai/routing/registry.json`, projection déterministe des signaux de routage. Artefacts dérivés, jamais sources de vérité.
- Trace minimale JSONL pour les opérations médiées par BASE, sans contenu métier par défaut.
- Entretien local: erreurs, avertissements, marqueurs ouverts, descriptions manquantes et signaux issus des traces quand elles existent.
- Manifest dérivé et régénérable pour la découverte.
- Serveur MCP comme adaptateur vers les mêmes primitives, sans logique métier propre.

## Hors cœur public

La frontière de référence est [`specs/current/00_overview/perimeter.md`](../../specs/current/00_overview/perimeter.md). En résumé, le cœur public ne fournit pas seul:

- RBAC enterprise complet.
- SSO, IAM, DLP, SIEM, archivage légal et rétention réglementaire.
- Isolation stricte si l'agent dispose d'un accès direct au shell, au filesystem ou aux API hors BASE.
- Garantie d'exactitude automatique des réponses générées par un modèle.
- Moteur de workflow, DAG, interface d'automation ou DSL propriétaire.

## Règle de lecture

BASE guide partout par le texte. BASE applique seulement ce qui passe par son broker, sa CLI, son MCP ou un connecteur contrôlé.

Une métadonnée YAML exprime une unité sémantique stable. Le code décide ensuite ce qui peut être vérifié ou appliqué. Cette séparation permet de rester simple pour une personne seule, utile pour une PME et extensible pour une organisation plus grande.
