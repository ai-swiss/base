---
schema_version: base.resource.v1
id: versions-et-stabilite
type: document
title: Mettre à jour BASE sans casser votre travail
description: "Ce que la version 1.x garantit et ce qui peut évoluer: la surface stable (format, commandes, outils MCP, schémas), la règle des dépréciations, et comment base update suit les versions publiées."
scope: public
status: active
sensitivity: public
keywords: [versions, stabilite, garantie, compatibilite, mise, jour, update, semver, rupture]
---

# Mettre à jour BASE sans casser votre travail

Cette page s'adresse à celles et ceux qui construisent sur BASE: un indépendant, une PME, une école, une administration. Elle précise ce que la version 1.x garantit et ce qui peut encore évoluer, afin que vous puissiez adopter BASE et le mettre à jour sans craindre qu'une nouvelle version ne casse ce que vous avez bâti.

## Politique de versionnage

À partir de la **1.0**, BASE utilise des versions `MAJEUR.MINEUR.CORRECTIF` avec une politique de compatibilité explicite:

- **MAJEUR** (`2.0.0`): une modification incompatible de la surface publique stable qui n'a pas suivi la voie de dépréciation ci-dessous.
- **MINEUR** (`1.1.0`): des ajouts rétrocompatibles (nouvelles commandes, nouveaux champs optionnels, nouveaux points d'extension) et, après leur fenêtre annoncée, le retrait d'éléments explicitement dépréciés.
- **CORRECTIF** (`1.0.1`): des corrections rétrocompatibles.

## Ce que la 1.x garantit (surface stable)

Ces éléments ne changent pas de façon incompatible sans incrément **majeur**, sauf après une dépréciation explicite et sa fenêtre de transition:

- **Le format des ressources, [le standard `base.resource.v1`](le-standard.md)**: la frontmatter `schema_version: base.resource.v1`, ses champs et ses `type`. Un fichier valide reste valide au fil des versions mineures; seule exception, assumée et documentée dans le CHANGELOG: une valeur que rien ne consomme (aucun mécanisme, aucun fichier connu) peut être retirée en mineure: la 1.2.0 l'a fait pour onze valeurs de `type` spéculatives.
- **Les commandes CLI existantes**: `validate`, `index`, `inventory`, `discover`, `route`, `route-test`, `open`, `access`, `invoke`, `propose`, `commit`, `promote`, `context`, `markers`, `trace`, `build` et `doctor`, avec leurs drapeaux documentés.
- **Les outils MCP existants**: leurs noms et leurs paramètres.
- **Les schémas des projections**: `base.manifest.v1`, `base.routing.v1`.
- **Le contrat des points d'extension**: `base.config` (rankers, validateurs, policy, auth) est purement **additif**; votre configuration continue de fonctionner, à la réserve près d'une clé explicitement **dépréciée** (voir plus bas).

C'est l'engagement **NFR-CORE-002**, dit «pas de rupture»: l'existant non déprécié continue de fonctionner d'une version à l'autre, et aucun retrait n'arrive sans dépréciation préalable (voir plus bas).

## Ce qui peut encore évoluer

- Le **contenu** des projections dérivées (le détail d'un manifeste, d'un registre): ce sont des projections régénérables, jamais une source de vérité.
- Le **classement** d'un routeur: un meilleur ranker peut modifier l'ordre des candidats, mais le *contrat* de routage (statuts, abstention) reste stable.
- Les **paquets compagnons** optionnels suivent leur propre versionnage: `@ai-swiss/base-ranker-semantic` (embeddings), `@ai-swiss/base-index-local` (index à l'échelle), `@ai-swiss/base-llm` (le port LLM, sur lequel reposent le Studio et l'évaluation), `@ai-swiss/base-eval` (le moteur d'évaluation) et `@ai-swiss/base-docs-site` (le renderer HTML). Le cœur n'en **exige aucun**: ils sont installés uniquement si vous utilisez la fonction concernée et n'ajoutent aucune dépendance tierce au cœur.
- Les **exemples** et la documentation peuvent s'enrichir sans préavis.

## Compatibilité d'exécution

- **Node.js ≥ 18.** Le cœur ne dépend de rien et il est testé en intégration continue sur Node 18, 20, 22 et 24. Les outils facultatifs (évaluation, Studio) ont, eux, leurs propres dépendances, standard et isolées du cœur.
- **Portable entre outils.** Les fichiers `CLAUDE.md`, `.cursor/rules/`, `AGENTS.md` sont des adaptateurs générés; le cœur portable demeure `.ai/`, les documents Markdown et les commandes locales.
- **Portable entre environnements.** À partir des spécifications livrées avec le cadre (`specs/`), on peut changer de langage ou de bibliothèques pour reconstruire des fonctionnalités équivalentes: une interface comme le Studio demande du code, donc des choix techniques standard.

## Mettre à jour: `base update` et ses deux canaux

`base update` met à jour le cadre lui-même. Par défaut, il suit le canal **stable**: il avance votre clone jusqu'au **dernier tag de version** (`v1.x.y`), jamais au-delà; ce que vous exécutez ne change qu'à une release, ce qui donne son sens concret au versionnage ci-dessus. Les contributeurs qui veulent la tête de développement choisissent `base update --channel main`. Une installation par ZIP n'a pas d'historique git: la commande indique alors honnêtement le chemin (re-télécharger la [dernière version publiée](https://github.com/ai-swiss/base/releases/latest/download/base.zip) et remplacer le dossier). Avant toute mise à jour majeure, conservez une copie de votre dossier: vos fichiers sont la seule chose que BASE ne sait pas régénérer.

## Dépréciation avant retrait

C'est la voie normale par laquelle une surface disparaît. Un élément d'abord **déprécié**, signalé comme tel dans le `CHANGELOG`, continue de fonctionner le temps de l'annonce, puis il est retiré après cette fenêtre, y compris en version mineure. La dépréciation est la courtoisie de compatibilité: aucun retrait n'arrive sans elle, mais le retrait qui la suit n'attend pas nécessairement une version majeure.

La 1.5.0 exécute les trois retraits annoncés en 1.3.0. La commande `entretien` est retirée: ses signaux vivent dans `base doctor` (marqueurs dormants, descriptions manquantes, routage faible) et la requête brute des marqueurs dans `base markers`. Le drapeau MCP `include_data` de `load_agent` est retiré: un appel qui le porte encore fonctionne à l'identique, le champ inconnu étant écarté avant le traitement. La clé de configuration `routing.embedder` est retirée: elle était inerte depuis sa dépréciation en 1.3.0, et une configuration qui la porte encore reçoit un message nommant la référence qui la remplace, `routing.embedding_model`.

Deux surfaces sont dépréciées. `base docs preview` reste fonctionnel, mais son avertissement demande
de lancer `base docs build --out <dossier>`, puis de servir le dossier statique produit. L'alias
`name` de `label` dans `base.workspace.json` reste lu et déclenche un avertissement; sa suppression
attendra une version du contrat workspace qui autorise cette rupture.

Voir le [CHANGELOG](../../CHANGELOG.md) pour l'historique et le détail, et [Sécurité et limites](../trust/securite-et-limites.md) pour la frontière honnête des garanties.
