# Sécurité

BASE est un cadre local-first qui structure la collaboration entre l'humain et l'IA. Le cœur public fournit des garde-fous locaux, mais il ne remplace pas la sécurité d'une organisation.

## Signaler un problème

Si vous découvrez une vulnérabilité ou un risque sérieux lié à BASE, signalez-le en privé par l'un de ces deux canaux:

- **GitHub Security Advisories** (recommandé): onglet «Security» du dépôt, «Report a vulnerability». Le signalement reste confidentiel jusqu'à la correction.
- **AI Swiss**: par le canal officiel indiqué sur [a-i.swiss](https://a-i.swiss).

Incluez si possible:

- le composant concerné;
- les étapes de reproduction;
- l'impact potentiel;
- l'environnement utilisé;
- une proposition de correction si elle existe.

Nos engagements de bonne foi, indicatifs et non contractuels: **accusé de réception sous 3 jours ouvrés**, **première évaluation sous 10 jours ouvrés** et **divulgation coordonnée sous 90 jours**, selon la gravité et la complexité du correctif. Nous vous tenons informé de son avancement. Ne divulguez pas publiquement un exploit actif tant qu'un correctif ou une mesure d'atténuation raisonnable n'est pas disponible.

## Périmètre du cœur public

BASE public vérifie notamment:

- le confinement local des chemins pour les opérations médiées;
- le refus des traversées de chemin et des symlinks sortants;
- la validation du frontmatter, des IDs, des liens relatifs et des entrypoints;
- l'invocation d'outils en dry-run par défaut;
- les traces minimales des opérations médiées par BASE.

Ces garanties valent seulement pour les actions qui passent par la CLI, le broker, le MCP ou un futur connecteur contrôlé.

## Écriture hors du projet: une seule, déclarée

Tout l'état de BASE réside dans le dossier du projet, à une exception près: `base init` enregistre
l'emplacement du cadre dans **`~/.config/base/config.json`** (un seul champ, `framework_dir`),
afin que `base whereis` et les autres outils retrouvent l'installation. C'est la seule écriture
hors du root.

- Elle se fait **au mieux**: si le dossier personnel est en lecture seule (cas fréquent pour un agent
  IA en bac à sable), `base init` réussit malgré tout et affiche le contenu à créer à la main.
- Le fichier ne contient **aucun secret**: ni clé ni donnée métier, seulement un chemin.
- Pour la désactiver ou la rediriger, pointez la variable d'environnement `BASE_CONFIG_HOME` vers
  un dossier de votre choix (les tests s'en servent pour ne jamais toucher le vrai `~/.config`).

## Hors périmètre

BASE public ne fournit pas seul:

- IAM, SSO ou RBAC enterprise;
- DLP, SIEM, archivage légal ou rétention réglementaire;
- isolation stricte si l'agent possède un accès shell ou filesystem direct hors BASE;
- garantie d'exactitude des réponses générées par un modèle;
- protection contre les politiques propres aux fournisseurs IA utilisés.

Pour une analyse détaillée, voir `docs/trust/securite-et-limites.md`.
