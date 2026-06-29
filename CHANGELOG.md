# Changelog

Tous les changements notables de BASE sont documentés ici. Le format suit l'esprit de [Keep a Changelog](https://keepachangelog.com/fr/): clair, humain, orienté impact.

À partir de la 1.0, BASE suit le [Semantic Versioning](https://semver.org/lang/fr/): la surface publique stable (format des ressources, commandes CLI, outils MCP, schémas de projection, contrat des points d'extension) ne casse pas sans incrément majeur. Détail: [Versions et stabilité](docs/reference/versions-et-stabilite.md).

## [Unreleased]

## [1.0.0] - 2026-06-25

Première version publique de BASE: un cadre local-first et ouvert pour structurer la collaboration humain-IA. Le savoir métier vit dans des fichiers Markdown que vous possédez; un cœur zéro dépendance (Node 18 ou plus) médie les actions sensibles; et tout ce qui sort vers un outil tiers reste un choix explicite.

- Le cœur: agents et process en Markdown, avec validation, découverte, routage déterministe d'un agent vers son process, racines multiples et entretien local. CLI locale `base` et broker partagé, source unique des garde-fous.
- Studio: l'atelier visuel pour parcourir vos ressources, les éditer (revue de changement par bloc, à la main ou avec l'IA, une seule porte d'écriture) et évaluer vos process.
- Sécurité: confinement local des chemins, discipline propose puis commit, et contrôle d'egress qui, sur les chemins médiés (le broker, le serveur MCP), empêche une ressource confidentielle d'atteindre un modèle distant.
- Outils optionnels: serveur MCP (lecture seule par défaut), évaluation par un utilisateur simulé et un juge indépendant, rangs sémantiques et index local hors cœur.
- Documentation et gouvernance: site bilingue par profil, double licence (Apache-2.0 pour le code, CC BY 4.0 pour la documentation et les exemples), et contrat de tests reproductible.
