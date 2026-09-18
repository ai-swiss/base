---
schema_version: base.resource.v1
id: gates
type: document
title: Les gates de BASE
description: "Le catalogue des contrôles qui protègent BASE. Une ligne par gate: ce qu'elle vérifie, où elle tourne (hook local, npm run check, ou CI seulement) et comment la corriger."
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [gates, controles, ci, check, contribution, qualite, discipline]
---

# Les gates de BASE

La discipline de BASE tient à des contrôles, non à la confiance. Cette page les recense pour qu'un
contributeur sache, devant un échec, ce que le gate vérifie et comment le corriger.

Il existe trois niveaux: le **hook** de commit (facultatif, `git config core.hooksPath .githooks`), la
commande locale **`npm run check`** (le cœur des gates, à passer avant de pousser) et la **CI** (qui en
lance davantage). «Vert en local» ne signifie donc pas «vert partout»: la CI y ajoute la couverture,
les artefacts régénérés, le doctor, le smoke pack ainsi que les suites MCP et Studio.

## `npm run check` (le cœur, en local)

| Gate | Vérifie | Corriger |
|---|---|---|
| `spec:matrix --check` | La matrice d'exigences est à jour; aucune citation ne renvoie à une preuve absente. | `npm run spec:matrix` puis relire les lignes du changement. |
| `check-ids` | Les identifiants sont stables: pas de renumérotation ni de réutilisation. | Garder l'id existant; un nouvel id s'alloue avec `spec:new`. |
| `check-id-namespaces` | Chaque id reste dans le namespace déclaré par sa section. | Aligner l'id sur le préfixe de sa section. |
| `check-leaf` | Une feuille de spec reste courte (≤ 250 lignes), sans statut et routée. | Scinder la feuille, retirer le statut, la rattacher. |
| `check-markers` | Le jeu fermé de marqueurs (`[A VALIDER]`, `[ATTENTION]`, `[A COMPLETER]`, `[DECISION]`) reste cohérent. | N'employer que ces quatre marqueurs. |
| `check-statusless` | Les pages de référence sont rédigées au présent, sans statut. | Reformuler au présent; retirer le statut. |
| `check-emdash` | Aucun tiret cadratin dans le contenu français (`docs/`, README, CONTRIBUTING, MANIFESTO). | Remplacer par deux-points, parenthèses ou tiret simple. |
| `check-frontmatter-yaml` | Le frontmatter reste valide pour un lecteur YAML strict (GitHub, Astro): une valeur non protégée par des guillemets ne contient pas de deux-points suivi d'une espace. | Encadrer la valeur de guillemets droits (`description: "texte avec un deux-points: ici"`). |
| `check-punctuation` | Ponctuation serrée romande dans le français (`docs/`, `exemples/`, README, CONTRIBUTING, MANIFESTO): pas d'espace avant `: ; ! ?`, guillemets serrés, pas de tiret cadratin dans les exemples. La langue est lue, non supposée: un dossier imbriqué dont le `base.config.json` déclare autre chose que le français est ignoré en entier, et la sortie le nomme. | Resserrer la ponctuation; une exception se déclare sur la ligne avec `[PUNCT-OK: raison]`. |
| `check-lexique` | Aucune formulation bannie n'apparaît dans la prose française. | Reformuler; une exception se déclare sur la ligne avec `[LEXIQUE-OK: raison]`. |
| `check-translations` | Les traductions nomment le français comme version de référence, et leur marqueur `fr-synced` est frais: les miroirs `docs/en|de|it/` face à la page française qu'ils doublent, et les tables de mots `tools/core/lang/{en,de,it}.mjs` face à `fr.mjs`. Une table absente n'est pas un échec; une table présente déclare ce qu'elle traduit. | Ajouter la mention de la source française; retraduire les clés modifiées puis recalculer le marqueur avec `git hash-object <source>`. |
| `check-tree` | Pas de fichier parasite; les pages de docs sont en kebab-case et ≤ 400 lignes. | Renommer ou scinder; retirer le parasite. |
| `typecheck` | Les types passent (`tsc`, sans variable inutilisée). | Corriger les erreurs de type signalées. |
| `validate` | Chaque ressource respecte le contrat `base.resource.v1`. | Corriger le frontmatter signalé. |
| `route-test` | Les fixtures et `routing.examples` disponibles rendent le résultat attendu sur la stratégie lexicale et les rankers configurés. Ce contrôle ne couvre la Voie 2 qu'avec `--strategy production`, un run modèle non déterministe. | Ajuster le signal (`use_when` / `routing.examples` / `routing.avoid_when`) ou la fixture; si la Voie 2 est active, la rejouer séparément. |
| `docs validate` | Le modèle de documentation est cohérent (zéro erreur). | Suivre l'erreur signalée par le modèle. |
| `npm test` | La suite de tests du cœur et des paquets passe. | Corriger la cause; ne jamais désactiver un test. |

## CI seulement (au-delà de `npm run check`)

| Gate | Vérifie | Quand le lancer en local |
|---|---|---|
| `test:coverage` | Seuils de couverture (lignes 90, branches 80, fonctions 90). | `npm run test:coverage` quand vous touchez le cœur. |
| Diff du manifeste | `base index` régénéré; `base.manifest.json` est à jour. | `npm run index` puis `git diff base.manifest.json`. |
| Diff des projections | `base build bootstrap --write`; `AGENTS.md` / `CLAUDE.md` / `BASE_BOOTSTRAP.md` sont à jour. | `node tools/base.mjs build bootstrap --write` puis `git diff`. |
| `doctor` | Corpus sain: pas de lien mort, d'orphelin, ni de ressource périmée. | `node tools/base.mjs doctor --root .`. |
| `smoke:pack` | Le paquet npm s'installe et démarre. | `npm run smoke:pack`. |
| MCP | Le serveur MCP compile et ses tests passent. | Voir [`CONTRIBUTING.md`](../../CONTRIBUTING.md) quand vous touchez `mcp/`. |
| Studio | Le build et les suites UI / E2E de Studio passent. | Idem, quand vous touchez `tools/studio/`. |

`base route-eval` est un outil de mainteneur, conditionné à Ollama (`--ollama`): sans ce drapeau, la
commande imprime l'en-tête et la marche à suivre, rien de plus. Elle ne tourne ni dans `npm run check`
ni en CI.

## Probes manuels avec un harness réel

`npm run probes -- --suite smoke` prépare une qualification du paquet réellement publiable: il
affiche les scénarios, leur délai et l'emplacement des preuves, sans appeler de modèle. L'exécution
reste un geste explicite:

```bash
npm run probes -- --suite release --harness claude-code --model <modele> --effort medium --max-budget-usd <par-invocation> --yes
npm run probes -- --suite release --harness codex --model <modele> --effort medium --yes
```

Le runner empaquette puis installe BASE dans un environnement isolé, lance chaque scénario dans une
racine temporaire située hors du dépôt contributeur, puis recopie son état final sous
`.temp/probes/<date>_<suite>_<revision>/` avec la trace brute du harness, les appels d'outils
normalisés, les versions, les hashes des paquets, les changements du dossier et les verdicts. Ces
enregistrements peuvent contenir des chemins et du texte local: `.temp/` reste ignoré
par git. Les contrats de non-régression, eux, vivent dans `tests/probes/`.

`--harness` choisit explicitement `claude-code` ou `codex`; le runner utilise respectivement
`CLAUDE.md` ou `AGENTS.md` dans les racines créées. Claude Code exige un plafond monétaire par
invocation, que sa CLI applique. Le plan compte séparément les tentatives principales et les
évaluations sémantiques avant d'afficher le plafond total. Codex ne propose pas ce plafond: le délai
par invocation reste la borne appliquée par le runner.

La suite `release` suit des parcours visibles: réponse métier sourcée, abstention honnête,
configuration et devis demandés en langage courant, découverte du dépôt, création d'un travail
d'équipe avec revue HTML, amélioration fondée sur une friction, ambiguïté, contradiction soumise à
confirmation, première demande dans quatre langues, questions locales et MCP avec citations,
connaissance absente et non-divulgation d'une grille confidentielle.

Les lectures, commandes, citations et changements de fichiers restent des preuves mécaniques. Une
qualité sans formulation unique, par exemple une limite honnête ou une question réellement utile,
est évaluée par une seconde invocation sans outil, sur une grille versionnée. Elle doit justifier
chaque verdict par une citation exacte de la réponse et ne peut jamais annuler un échec mécanique.

Après publication, une suite séparée vérifie le parcours qui commence par un lien. Elle exige un
accès web et vise l'URL immuable de la version, jamais la branche courante:

```bash
npm run probes -- --suite public --harness claude-code --model <modele> --effort medium --max-budget-usd <par-invocation> --yes
npm run probes -- --suite public --harness codex --model <modele> --effort medium --yes
```

Un échec réseau dans cette suite n'altère pas le verdict obtenu avant publication sur le paquet
installé.

Ces probes ne tournent ni dans `npm run check`, ni dans `npm run check:release`, ni en CI, ni selon
un horaire. Ils observent la manière dont un vrai harness suit BASE. Les gates déterministes restent
les seules garanties de schéma, de confinement, d'écriture et d'égress.

Une règle prime sur toutes les autres: un gate rouge est une information, jamais un obstacle à
contourner. On en corrige la cause; on ne désactive ni un hook (`--no-verify`) ni un test.
