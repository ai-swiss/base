# Mettre à jour BASE sans casser votre travail

Cette page s'adresse à celles et ceux qui construisent sur BASE: un indépendant, une PME, une école ou une administration. Elle dit ce que la version 1.x garantit et ce qui peut encore évoluer, pour que vous puissiez adopter BASE et le mettre à jour sans craindre qu'une nouvelle version casse ce que vous avez bâti.

## Versionnage sémantique

À partir de la **1.0**, BASE suit le [Semantic Versioning](https://semver.org/lang/fr/):

- **MAJEUR** (`2.0.0`): un changement incompatible de la surface publique stable (ci-dessous).
- **MINEUR** (`1.1.0`): des ajouts rétrocompatibles (nouvelles commandes, nouveaux champs optionnels, nouveaux points d'extension).
- **CORRECTIF** (`1.0.1`): des corrections rétrocompatibles.

## Ce que la 1.x garantit (surface stable)

Ces éléments ne changent pas de façon incompatible sans incrément **majeur**:

- **Le format des ressources**: la frontmatter `schema_version: base.resource.v1`, ses champs et ses `type`. Un fichier valide aujourd'hui le reste.
- **Les commandes CLI existantes**: `validate`, `index`, `inventory`, `discover`, `route`, `route-test`, `open`, `access`, `invoke`, `propose`, `commit`, `promote`, `markers`, `trace`, `build` et `entretien`, avec leurs drapeaux documentés.
- **Les outils MCP existants**: leurs noms et leurs paramètres.
- **Les schémas des projections**: `base.manifest.v1`, `base.routing.v1`.
- **Le contrat des points d'extension**: `base.config` (rankers, validateurs, policy, auth) est purement **additif**, votre configuration continue de fonctionner.

C'est l'engagement **NFR-CORE-002**, dit «pas de rupture»: l'existant continue de marcher d'une version à l'autre.

## Ce qui peut encore évoluer

- Le **contenu** des projections dérivées (le détail d'un manifeste, d'un registre): ce sont des projections régénérables, jamais une source de vérité.
- Le **classement** d'un routeur, car un meilleur ranker peut changer l'ordre des candidats; le *contrat* de routage (statuts, abstention) reste stable.
- Les **paquets compagnons** optionnels suivent leur propre versionnage: `@ai-swiss/base-ranker-semantic` (embeddings), `@ai-swiss/base-index-local` (index à l'échelle), `@ai-swiss/base-llm` (le port LLM, derrière le Studio et l'évaluation) et `@ai-swiss/base-eval` (l'évaluation). Le cœur n'en **exige aucun**: ce sont des pairs optionnels, installés seulement si vous utilisez la fonction concernée, et ils n'ajoutent aucune dépendance tierce au cœur.
- Les **exemples** et la documentation peuvent s'enrichir sans préavis.

## Compatibilité d'exécution

- **Node.js ≥ 18.** Le cœur est zéro-dépendance et testé en intégration continue sur Node 18, 20, 22 et 24. Les outils facultatifs (évaluation, Studio) ont, eux, leurs propres dépendances, standard et isolées du cœur.
- **Portable entre outils.** Les fichiers `CLAUDE.md`, `.cursor/rules/`, `AGENTS.md` sont des adaptateurs générés; le cœur portable reste `.ai/`, les documents Markdown et les commandes locales.
- **Portable entre stacks.** À partir des spécifications livrées avec le framework (`specs/`), on peut changer de langage ou de librairies pour reconstruire des fonctionnalités équivalentes: une interface comme le Studio demande du code, donc des choix techniques standard.

## Déprécations

Quand un élément stable doit disparaître, il est d'abord **déprécié** (documenté dans le `CHANGELOG`, maintenu fonctionnel sur au moins une version mineure) avant d'être retiré dans une version **majeure**.

Voir le [CHANGELOG](../../CHANGELOG.md) pour l'historique, et [Sécurité et limites](../trust/securite-et-limites.md) pour la frontière honnête des garanties.
