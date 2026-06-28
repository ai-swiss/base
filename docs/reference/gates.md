---
title: Les gates de BASE
description: Le catalogue des contrôles qui protègent BASE. Une ligne par gate: ce qu'elle vérifie, où elle tourne (hook local, npm run check, ou CI seulement) et comment la corriger.
keywords: [gates, contrôles, ci, check, contribution, qualité, discipline]
---

# Les gates de BASE

La discipline de BASE est tenue par des contrôles, pas par la confiance. Cette page les liste pour
qu'un contributeur sache, devant un échec, ce que le gate vérifie et comment le corriger.

Trois niveaux: le **hook** de commit (optionnel, `git config core.hooksPath .githooks`), la commande
locale **`npm run check`** (le cœur des gates, à passer avant de pousser), et la **CI** (qui en lance
davantage). «Vert en local» n'est donc pas «vert partout»: la CI ajoute la couverture, les
artefacts régénérés, le doctor, le smoke pack, et les suites MCP et Studio.

```mermaid
flowchart LR
    A[Hook de commit (optionnel)] --> B[npm run check (avant de pousser)]
    B --> C[CI (couverture, doctor, smoke, MCP, Studio)]
```

## `npm run check` (le cœur, en local)

| Gate | Vérifie | Corriger |
|---|---|---|
| `spec:matrix --check` | La matrice d'exigences est à jour; aucune citation ne pointe vers une preuve absente. | `npm run spec:matrix` puis relire les lignes du changement. |
| `check-ids` | Les identifiants sont stables: pas de renumérotation ni de réutilisation. | Garder l'id existant; un nouvel id s'alloue avec `spec:new`. |
| `check-id-namespaces` | Chaque id reste dans le namespace déclaré par sa section. | Aligner l'id sur le préfixe de sa section. |
| `check-leaf` | Une feuille de spec reste courte (≤ 250 lignes), sans statut, et routée. | Scinder la feuille, retirer le statut, la rattacher. |
| `check-markers` | Le jeu fermé de marqueurs (`[A VALIDER]`, `[ATTENTION]`, `[A COMPLETER]`, `[DECISION]`) reste cohérent. | N'employer que ces quatre marqueurs. |
| `check-statusless` | Les pages de référence sont au présent, sans statut. | Reformuler au présent; retirer le statut. |
| `check-emdash` | Aucun tiret cadratin dans le contenu français (`docs/`, README, CONTRIBUTING, MANIFESTO). | Remplacer par deux-points, parenthèses ou tiret simple. |
| `check-punctuation` | Ponctuation serrée romande dans le français (`docs/`, `exemples/`, README, CONTRIBUTING, MANIFESTO): pas d'espace avant `: ; ! ?`, guillemets serrés, pas de tiret cadratin dans les exemples. | Resserrer la ponctuation; une exception se déclare sur la ligne avec `[PUNCT-OK: raison]`. |
| `check-lexique` | Aucune formulation bannie n'apparaît dans la prose française. | Reformuler; une exception se déclare sur la ligne avec `[LEXIQUE-OK: raison]`. |
| `check-translations` | Les traductions nomment le français comme version de référence. | Ajouter la mention de la source française. |
| `check-tree` | Pas de fichier parasite; les pages de docs sont en kebab-case et ≤ 400 lignes. | Renommer ou scinder; retirer le parasite. |
| `typecheck` | Les types passent (`tsc`, sans variable inutilisée). | Corriger les erreurs de type signalées. |
| `validate` | Chaque ressource respecte le contrat `base.resource.v1`. | Corriger le frontmatter signalé. |
| `route-test` | Les routes attendues (fixtures `.ai/routing/route-tests.json`) sont stables. | Ajuster le signal de routage (`use_when` / `routing.examples`) ou la fixture. |
| `docs validate` | Le modèle de documentation est cohérent (zéro erreur). | Suivre l'erreur signalée par le modèle. |
| `npm test` | La suite de tests du cœur et des packages passe. | Corriger la cause; ne jamais désactiver un test. |

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

Une règle au-dessus de toutes: un gate rouge est une information, jamais un obstacle à contourner.
On corrige la cause, on ne désactive ni un hook (`--no-verify`) ni un test.
