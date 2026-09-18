# Sécurité

BASE est une convention ouverte accompagnée d'une implémentation de référence local-first pour structurer la collaboration entre l'humain et l'IA. Cette implémentation fournit des garde-fous locaux, mais elle ne remplace pas la sécurité d'une organisation. La référence décrit les contrôles attendus; leur application effective dépend du chemin d'exécution et des permissions accordées.

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

## Périmètre de l'implémentation de référence

L'implémentation de référence vérifie notamment:

- le confinement local des chemins pour les opérations médiées;
- le refus des traversées de chemin et des symlinks sortants;
- la validation du frontmatter, des IDs, des liens relatifs et des entrypoints;
- l'invocation d'outils en dry-run par défaut;
- les traces minimales des opérations médiées par BASE.

Chaque garantie s'applique selon son mécanisme, lorsque l'action passe effectivement par la CLI, le composant de médiation de BASE (le broker) ou le serveur MCP.

## Localisation du cadre

`node <BASE_DIR>/tools/base.mjs init --yes` tente d'enregistrer l'emplacement de l'implémentation de référence dans
**`~/.config/base/config.json`**, avec un champ `framework_dir`. Cette configuration propre à
l'utilisateur permet au lanceur et aux autres outils de retrouver l'installation sans inscrire un
chemin propre à la machine dans chaque projet.

- L'enregistrement se fait **au mieux**: un dossier personnel en lecture seule ne fait pas échouer
  l'initialisation.
- Si cette configuration est absente, illisible ou inutilisable au moment de préparer une nouvelle
  racine, `node <BASE_DIR>/tools/base.mjs init --yes` inscrit `framework_dir` dans le
  `base.config.json` de cette racine. Le projet
  reste alors exécutable, mais ce chemin absolu peut devoir être adapté sur une autre machine.
- Le fichier utilisateur ne contient **aucun secret**: ni clé ni donnée métier, seulement sa version
  de schéma et le chemin du cadre.
- `BASE_CONFIG_HOME` redirige le dossier personnel utilisé pour cette configuration. Les tests
  l'emploient pour ne pas toucher au vrai `~/.config`.

Cette description concerne la découverte du cadre, pas toutes les écritures possibles d'un outil,
d'un modèle ou d'une intégration. Le confinement annoncé par BASE ne couvre que les opérations
médiées énumérées ci-dessus; un accès direct au shell ou au système de fichiers conserve ses propres
permissions.

## Hors périmètre

L'implémentation de référence ne fournit pas seule:

- IAM, SSO ou RBAC enterprise;
- DLP, SIEM, archivage légal ou rétention réglementaire;
- isolation stricte si l'agent possède un accès shell ou filesystem direct hors BASE;
- garantie d'exactitude des réponses générées par un modèle;
- protection contre les politiques propres aux fournisseurs IA utilisés.

Pour une analyse détaillée, consultez [Sécurité et limites](docs/trust/securite-et-limites.md), puis
signalez tout problème exploitable par [GitHub Security Advisories](https://github.com/ai-swiss/base/security/advisories/new).
