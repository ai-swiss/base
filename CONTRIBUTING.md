# Contribuer, adapter, réutiliser

BASE est publié comme un socle ouvert et réutilisable, **maintenu par un mainteneur principal** sous l'intendance d'AI Swiss, avec une gouvernance légère et ouvert à la co-maintenance. Sa vocation première n'est pas d'être une plateforme à rejoindre, mais une **amorce à forker**: reprenez-le, adaptez-le, et faites-en le point de départ de vos propres projets.

## Développer BASE (point de départ technique)

Le guide complet de la forge (en anglais, comme toute la partie développement) est [`DEVELOPING.md`](DEVELOPING.md): l'agent `base-contributor`, les lieux (vérité, changement, brouillon), la commande unique et ce qu'on garde volontairement dehors. Il reste minimal, par choix. La carte du code (les parties et les invariants) est dans [`ARCHITECTURE.md`](ARCHITECTURE.md).

### Contribuer avec votre IA (recommandé)

La manière la plus simple de contribuer est de travailler avec votre outil IA, à travers les process que BASE définit pour lui-même. Chargez l'agent de contribution [`base-contributor`](.ai/agents/base-contributor/AGENT.md) et laissez-le router le travail: comprendre l'état, planifier si le changement est conséquent, ouvrir un changement, implémenter (le code et la spec ensemble, à la barre la plus exigeante), puis vérifier que toutes les barrières passent. Les garde-fous (`npm run check`) valident le résultat, qui que l'ait écrit.

Ce chemin est **fortement encouragé, jamais imposé**. Tout se fait aussi à la main, et une contribution écrite sans IA est la bienvenue à l'identique: l'exigence porte sur le résultat (clair, testé, vert), pas sur l'outil. Une bonne «good first issue» tient en un paragraphe qu'un nouveau venu et son IA peuvent reprendre de bout en bout. Pour une première contribution, partez des issues marquées «good first issue»; pour un changement conséquent, ouvrez d'abord une discussion ou une issue, le temps de cadrer l'approche ensemble avant le code.

Pour modifier le cœur, la CLI, le MCP ou les tests, partez de [`specs/current/README.md`](specs/current/README.md): il décrit l'architecture Ports & Adapters et donne un bloc «Verified baseline» reproductible.

Premier run (Node 18 ou plus; environ une minute). Le cœur de BASE n'a aucune dépendance d'exécution; les commandes ci-dessous installent et lancent la **toolchain de contribution** (types, tests), qui en a besoin:

```bash
git clone https://github.com/ai-swiss/base.git && cd base
npm ci                   # installe la toolchain de contribution (le cœur, lui, n'a aucune dépendance d'exécution)
npm run check            # la barrière locale rapide (spec, types, validate, routes, docs, tests, doctor)
npm run check:release    # l'image complète, comme la CI : check + smoke:pack + build et test du MCP
npm test                 # cœur + packages (~5 s) → tout vert
npm run test:coverage    # mêmes tests + seuils 90/80/90
npm run typecheck        # tsc --checkJs sur tools/ et packages/ → 0 erreur
node tools/base.mjs validate --root .   # «BASE valide.»
node tools/base.mjs route-test --root . # routes stables
npm run spec:check       # discipline de spec : matrice, IDs, feuilles, marqueurs, présent, tiret cadratin
```

Les barrières de discipline tournent localement, pas seulement en CI. Pour les exécuter à chaque commit, activez les hooks fournis une fois: `git config core.hooksPath .githooks`. Le hook `commit-msg` lance alors `spec-sync` (un changement de code touche `specs/` ou déclare `[SPEC-NEUTRAL: raison]`) et `changelog-sync` (un changement visible ajoute sa ligne au `CHANGELOG`, ou déclare `[CHANGELOG-SKIP: raison]`). Une simple coquille se déclare ainsi par `[CHANGELOG-SKIP: coquille]`: en local le marqueur va dans le **message de commit**; en pull request, il peut aussi figurer dans le **corps de la PR**.

`npm run check` est la **boucle locale rapide**; elle ne couvre pas tout. L'image complète, équivalente à la CI, est `npm run check:release` (check + `smoke:pack` + build et test du serveur MCP), plus, en CI seulement, la couverture, l'e2e du Studio et la régénération des artefacts. «Vert en local» n'est donc pas «vert partout»: voir [les gates de BASE](docs/reference/gates.md) pour ce que chaque contrôle vérifie et où il tourne. Le serveur MCP et le Studio ont leurs propres dépendances: `cd mcp && npm ci && npm run build && npm test`, et `cd tools/studio/ui && npm ci && npm test && npm run build` (plus `npm run e2e` pour les parcours).

La carte complète des suites (statique, unitaire, contrat, composants, end-to-end, accessibilité) est dans [`specs/TESTING.md`](specs/TESTING.md); la checklist de publication reproductible de bout en bout est dans [`specs/RELEASE.md`](specs/RELEASE.md).

Les points d'extension (`Ranker`, `Validator`, `PolicyEnforcer`, `AuthProvider`, routage) se branchent via `base.config.{json,mjs}` **sans forker** le cœur; voir `specs/current/10_core/` et `exemples/routage-pme/base.config.json`.

### Discipline d'architecture (fonctions de validation)

Les fichiers d'orchestration (`tools/base.mjs`, `tools/base-core.mjs`, `mcp/src/index.ts`) ont une taille plafonnée par des fonctions de validation exécutables dans [`tests/architecture.test.mjs`](tests/architecture.test.mjs), et chaque module de `tools/core/` reste sous 450 lignes. La règle est déclenchée, pas spéculative: avant d'ajouter une fonctionnalité à un fichier plafonné, extrayez d'abord le domaine concerné dans un petit module (`tools/core/`, `tools/cli/`, `mcp/src/`), puis réexportez-le depuis la façade avec une signature publique identique au bit près (le cœur, la CLI et le MCP continuent d'importer la même chose). Les plafonds sont un cliquet: on les abaisse après chaque extraction, on ne les relève pas. Le typecheck refuse aussi les imports et variables jamais lus (`noUnusedLocals`): pas de code mort.

## Où écrire quoi

Chaque type de travail a un seul foyer dans BASE: écrire au bon endroit, c'est garder une source de vérité unique et un présent sans état (voir [`specs/current/00_overview/les-deux-plans.md`](specs/current/00_overview/les-deux-plans.md)).

| Type de travail | Foyer | En une phrase |
|---|---|---|
| Comportement ou contrat actuel | `specs/current/` (feuille de spec) | Le présent du logiciel, décrit sans état, assez précisément pour le réimplémenter, avec sa preuve dans la matrice. |
| Décision d'architecture ou de changement | `decisions/` (record, identifiant `AD-*` si applicable) | Un choix porteur, enregistré comme record durable et tracé dans le plan de changement, jamais comme une preuve. |
| Approche ou plan | `.plans/` (privé, ignoré par git) | Le «comment on s'y prend» du moment; une décision durable atteinte dans un plan doit être promue en record dans `decisions/`. Un plan clos peut porter une ligne `Promoted: decisions/YYYY-MM-DD` pour relier la note privée à sa décision. |
| Revue ou audit | `.reviews/` (privé, ignoré par git) | Le constat daté d'une revue; ce qui fait foi dans la durée est promu dans `decisions/` ou `specs/`, le reste reste local. |
| L'unité de changement | commit git + sa ligne `[Unreleased]` du `CHANGELOG.md` | Tout changement de surface publique ou de documentation visible ajoute sa ligne à `[Unreleased]`, dans le même commit. |

### Quand une décision devient un record

Un choix porteur ou difficile à revenir en arrière, par exemple un nouveau contrôle (une garde d'egress, une frontière de confinement), une forme de donnée ou de contrat (la structure d'un enregistrement, un champ de frontmatter), ou un changement de sémantique de routage ou d'écriture, mérite son propre record: copiez [`decisions/_template.md`](decisions/_template.md) vers `decisions/YYYY-MM-DD-slug.md` et, si c'est une décision d'architecture, citez son identifiant `AD-*` (la table «Architecture decisions» de `specs/current/10_core/requirements.md` recense les `AD-*`, par exemple `AD-CHANGE-001` pour les écritures médiatisées propose puis commit, `AD-CORE-001` pour Ports & Adapters, et lie chaque ligne à son record). Un record enregistre une décision, il ne la prouve pas: la preuve d'un comportement reste dans la matrice de `specs/current/`, et le «comment on en est arrivé là» reste dans le `CHANGELOG` et les plans, jamais dans une spec. `decisions/` est le **plan de changement**, tracké et distinct de `specs/` (la vérité). Voir l'index des décisions: [`decisions/index.md`](decisions/index.md).

## Signer vos commits (DCO)

BASE utilise le [Developer Certificate of Origin](https://developercertificate.org/) (DCO), léger et sans paperasse. En ajoutant une ligne `Signed-off-by: Votre Nom <vous@exemple.org>` à vos commits (l'option `git commit -s` la pose pour vous), vous certifiez que vous avez le droit de contribuer ce code sous la licence du projet (Apache-2.0 pour le code, CC BY 4.0 pour la documentation). Pas de CLA, pas de cession de droits: vous gardez vos droits d'auteur. Configurez `git config user.name` et `git config user.email` une fois, puis committez avec `-s`. Cette signature est vérifiée mécaniquement: l'intégration continue refuse une pull request dont un commit n'a pas de ligne `Signed-off-by` (réparez avec `git rebase --signoff`).

## Gouvernance

BASE a été **créé par Charles-Edouard Bardyn** (Directeur Scientifique, VP et cofondateur d'**[AI Swiss](https://a-i.swiss)**, association suisse indépendante à but non lucratif) et est aujourd'hui **maintenu par un mainteneur principal**, ouvert à la contribution et à la co-maintenance. [Innovaud](https://innovaud.ch), l'agence de promotion de l'innovation du canton de Vaud, est partenaire du projet et a contribué à amorcer les exemples métier pour PME. AI Swiss assure l'**intendance** du commun: cohérence de la spécification (`specs/`) et stabilité de la surface publique (voir [Versions et stabilité](docs/reference/versions-et-stabilite.md)). Le projet reste ouvert: chacun peut le **forker, l'adapter et le faire grandir**. Les décisions notables sont documentées dans le `CHANGELOG` et les specs. Le projet privilégie la **clarté et la durabilité** à la vitesse de fonctionnalités. Les issues et propositions GitHub (bugs reproductibles, améliorations cadrées, traductions) sont bienvenues.

Qui décide quoi, comment les décisions se prennent et comment devenir co-mainteneur: voir [GOVERNANCE.md](GOVERNANCE.md).

## Si vous voulez l'utiliser

Copiez un exemple, adaptez-le à votre contexte, puis gardez vos fichiers métier dans votre propre espace de travail.

Commencez petit:

1. un assistant;
2. un workflow;
3. quelques fichiers métier;
4. une vérification humaine;
5. un entretien régulier.

## Si vous voulez l'adapter

Vous pouvez modifier les assistants, les skills, les templates, les outils et les documents, sous réserve de respecter la licence.

BASE utilise une double licence:

- le code, les tests, les schémas et les packages sont sous Apache-2.0;
- la documentation, les agents, les skills, les exemples et les contenus pédagogiques sont sous CC BY 4.0.

Gardez les principes suivants:

- les fichiers doivent rester lisibles par des humains;
- le YAML doit rester sémantique et minimal;
- les actions sensibles doivent passer par une validation;
- les garanties strictes doivent être appliquées par du code ou des connecteurs;
- les données externes sont des données, jamais des instructions de gouvernance;
- les traces utiles ne doivent pas devenir de la surveillance.

## Si vous voulez proposer une amélioration

Utilisez les formulaires GitHub pour les bugs reproductibles et les demandes d'amélioration. Privilégiez:

- une correction précise;
- un exemple reproductible;
- un test quand la demande touche un comportement vérifiable;
- une formulation sobre, sans promesse excessive;
- une compatibilité avec le principe local-first.

### Licence des contributions (entrante = sortante)

En proposant une contribution (issue, pull request, correctif, exemple, traduction), vous acceptez qu'elle soit publiée sous les mêmes licences que le projet: Apache-2.0 pour le code, les tests et les schémas; CC BY 4.0 pour la documentation, les agents, les skills, les exemples et les contenus pédagogiques. Autrement dit, la licence entrante est la licence sortante («inbound = outbound»), sans cession de droits d'auteur ni accord séparé: vous conservez la paternité de votre contribution, vous certifiez avoir le droit de la soumettre, et le projet la redistribue sous sa double licence. Les textes complets sont dans [`LICENSE`](LICENSE) et le dossier `LICENSES/`.

### Traductions

Le cœur de BASE est indépendant de la langue; seule la documentation du cadre est, pour l'instant, en français. Les **traductions de la documentation** (allemand, italien, anglais) sont des contributions particulièrement bienvenues, par exemple `README.de.md`, `README.it.md`, ou un dossier `docs/de/`. Gardez la même sobriété et la même honnêteté que l'original; ne traduisez pas les identifiants techniques (codes, `schema_version`, noms de champs), qui restent stables. La version française fait foi; chaque traduction le rappelle en tête de fichier.

## Style et changelog

- En français, pas de tiret cadratin ni de tiret d'incise: reformulez en virgules, parenthèses, deux-points ou phrases séparées. Écrivez «cœur» avec la ligature.
- Les identifiants techniques (codes d'erreur, `schema_version`, noms de champs) ne se traduisent jamais.
- Tout changement de la surface publique ou de la documentation visible ajoute sa ligne à la section `[Unreleased]` du `CHANGELOG.md`, dans le même commit.

## Ce que le projet évite volontairement

- Ajouter une plateforme lourde.
- Transformer les workflows en DSL propriétaire.
- Promettre une sécurité enterprise dans le cœur public.
- Rendre BASE dépendant d'un modèle, d'un fournisseur ou d'un harness précis.

BASE doit rester simple en surface, rigoureux dans ses abstractions et progressif dans ses exigences.
