# Changelog

Tous les changements notables de BASE sont documentés ici. Le format suit l'esprit de [Keep a Changelog](https://keepachangelog.com/fr/): clair, humain, orienté impact.

BASE suit le [Semantic Versioning](https://semver.org/lang/fr/): la surface publique stable (format des ressources, commandes CLI, outils MCP, schémas de projection, contrat des points d'extension) ne casse pas sans incrément majeur. Détail: [Versions et stabilité](docs/reference/versions-et-stabilite.md).

## [1.0.0] - 2026-06-25

Première version publique de BASE: un cadre **local-first** et **ouvert** pour structurer la collaboration humain-IA. Le savoir métier vit dans des fichiers Markdown que vous possédez; un cœur **sans dépendance tierce** (Node 18 ou plus) médie les actions sensibles; et tout ce qui sort vers un outil tiers reste un **choix explicite**. La promesse tient en une ligne: l'IA travaille à partir de ce que vous avez structuré plutôt que de suppositions, et vous gardez la main sur ce qu'elle voit, ce qu'il faut vérifier et où elle s'arrête.

### Le cœur
- Agents et process écrits en Markdown à frontmatter, avec validation, découverte et **routage déterministe** d'un agent vers son process (le classeur propose des scores, le routeur décide, le médiateur applique; abstention honnête plutôt que fausse certitude).
- Racines multiples (espaces de travail), entretien local, et une CLI `base` adossée à un broker partagé, **source unique des garde-fous**.
- **Écritures médiées** en deux temps (proposer puis valider): un diff est montré avant d'écrire, l'écriture est atomique, un garde anti-collision protège le fichier.
- **Marqueurs** cherchables et traitables par programme (`[A VALIDER]`, `[DECISION]`…): on peut les lister, les compter, et bloquer tant qu'il en reste.

### Sécurité
- Confinement local des chemins; discipline proposer puis valider; et un **contrôle d'égress** qui, sur les chemins médiés (le broker, le serveur MCP, le chat du Studio), empêche une ressource confidentielle d'atteindre un modèle distant — la vérification a lieu **avant** l'appel.

### Studio
- L'atelier visuel local pour parcourir vos ressources, les éditer (revue de changement par bloc, à la main ou avec l'IA, une seule porte d'écriture) et évaluer vos process. Interface **bilingue (français/anglais)**, thème clair/sombre.

### Documentation
- Site de documentation généré depuis le dépôt (la prose canonique reste vos fichiers), **bilingue**: tout le corpus est disponible en français (langue de référence) et en anglais, avec bascule de langue.

### Outils optionnels
- Serveur **MCP** (lecture seule par défaut) pour connecter BASE à un outil IA; évaluation par un utilisateur simulé et un juge indépendant; rangs sémantiques et index local — tous hors du cœur, ajoutés quand le cas d'usage le mérite.

### Gouvernance et licence
- **Double licence**: Apache-2.0 pour le code, CC BY 4.0 pour la documentation et les exemples. Projet sous l'intendance d'AI Swiss, ouvert à la contribution et à la co-maintenance, avec un contrat de tests reproductible.
