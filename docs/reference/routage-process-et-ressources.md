---
schema_version: base.resource.v1
id: routage-process-et-ressources
type: document
title: Router une demande vers le bon process (et ouvrir les bonnes ressources)
description: Comment BASE choisit un agent, dirige une demande vers le process adapté, puis ouvre les ressources utiles, en gardant l'action et le contexte séparés.
scope: public
status: active
sensitivity: public
keywords: [routage, process, agent, ressources, skills, competences, outils, documents]
---

# Router une demande vers le bon process (et ouvrir les bonnes ressources)

Une demande mal aiguillée charge tout, mélange tout et noie les décisions qui comptent sous un mur d'instructions. BASE l'évite en distinguant trois gestes que les outils d'IA confondent souvent: choisir un agent, router vers un process, ouvrir les ressources. Les séparer, c'est garder sous les yeux ce qui se décide vraiment. Si vous construisez ou utilisez un BASE et cherchez à comprendre comment une demande trouve son chemin, cette page le montre.

## 1. Choisir un agent

Quand vous savez quel assistant utiliser, le plus simple est de le désigner directement:

```text
Lis .ai/agents/assistant-devis/AGENT.md
```

L'agent tient lieu de fiche de poste. Il indique quel rôle tenir, comment parler, quels workflows existent et où se trouvent les fichiers utiles.

Pour un assistant unique, cette sélection manuelle suffit souvent. Rien à installer, rien à indexer, aucun catalogue de routage à maintenir.

## 2. Router vers un process

Quand plusieurs workflows sont possibles, BASE peut router une demande vers le bon process:

```bash
base route "je dois préparer un devis client" --root <dossier-base>
```

Le routage choisit un couple agent → process, ou s'abstient en donnant une raison lisible. Il ne charge pas toutes les instructions et ne fouille pas librement le dépôt entier. Dans un outil d'IA, le modèle lit la carte (l'index généré) et décide; le plancher déterministe, lui, reste volontairement simple mais efficace, et s'étend par adaptateurs. Il épargne surtout à l'utilisateur la charge mentale de chercher le bon process.

**Deux couches, une seule source.** Au quotidien, votre outil d'IA route de façon **progressive**: il
lit l'index généré (`.ai/routing/index.md`), ou la carte que retourne l'outil MCP `route_request`, et
choisit en comprenant le «Quand l'utiliser». Sans Voie 2 configurée, `base route` utilise la stratégie
lexicale: le classement associe le plancher lexical aux éventuels rankers de `base.config`. Avec les
deux modèles de la Voie 2, `base route` utilise à la place la stratégie `embedding`, qui retrouve des
candidats puis les soumet à un raffineur. Un ranker améliore un classement; il ne sélectionne pas la
stratégie. Tous ces chemins dérivent du même `use_when`: c'est lui qui porte l'intention.

Cette limite est volontaire. Un process répond à la question:

```text
Que faut-il faire maintenant ?
```

C'est une décision de workflow. Elle doit rester brève, testable et explicable.

Pour rendre un process routable, on recommande les signaux suivants:

- `description`: ce que fait le process;
- `use_when`: quand l'utiliser;
- `routing.examples`: formulations réelles d'utilisateurs;
- `routing.avoid_when`: contre-exemples qui évitent les fausses routes.

Les fixtures `.ai/routing/route-tests.json` consignent les routes importantes. Par défaut,
`base route-test --root <dossier>` rejoue ces fixtures et les `routing.examples` disponibles avec la
stratégie lexicale et les rankers de `base.config`; il vérifie seulement les cas écrits. Si la Voie 2
est configurée, `base route-test --strategy production --root <dossier>` rejoue le chemin réellement
pris par `base route`, avec ses appels modèle et sans promesse de déterminisme. Ajoutez des cas
volontairement ambigus pour vérifier l'abstention, puis rejouez après chaque changement de signaux
(`use_when`, `routing.avoid_when`, `keywords`).

## 3. Ouvrir les ressources utiles

Une fois le process choisi, celui-ci peut référencer les ressources nécessaires:

- compétences métier;
- documents;
- templates;
- tools;
- données locales;
- sources externes via connecteurs.

Ces ressources répondent à une autre question:

```text
Avec quoi faut-il le faire ?
```

Il s'agit de contexte, d'outils ou de données. Maintenir cette frontière relève d'abord de la sécurité: les instructions d'un process s'exécutent, le contenu d'une ressource ne s'exécute pas. Confondre les deux ouvre la porte à l'injection, où une donnée tente de se faire passer pour une consigne. Le choix du workflow principal reste donc tenu à l'écart.

Un process peut les déclarer dans sa frontmatter:

```yaml
requires:
  - ref: calculer-devis
    access: execute
    purpose: chiffrer le devis
may_use:
  - catalogue/services.json
```

Réservez `requires` à une ressource que le process doit ouvrir ou exécuter de façon structurée, idéalement via son `id`. Le champ `access` décrit l'usage qu'en attend le process, par exemple lire ou exécuter; il ne confère aucun droit d'accès. `purpose` explique pourquoi cette dépendance est nécessaire: le pack de contexte le montre dans sa note, sans en faire une permission ni l'envoyer comme justification au broker.

Réservez `may_use` au contexte simple ou facultatif, souvent un chemin lisible dans le projet. Le process peut aussi citer ces ressources au fil de ses étapes quand le contexte reste simple. L'essentiel est que la logique demeure lisible: le routeur choisit le process, puis le process indique ce qu'il faut ouvrir.

## Qui applique les droits?

BASE ne se substitue pas aux droits ordinaires de l'environnement. Si une source réside dans un dossier, un Drive, une API ou un outil externe, les droits réels demeurent ceux de ce dossier, de ce Drive, de cette API ou de cet outil.

BASE n'applique ses propres garde-fous qu'aux seules actions qui passent par lui:

- `base open` ou `open_resource` pour ouvrir une ressource inventoriée;
- `base access` ou `access_resource` pour lire un chemin confiné au projet;
- `base invoke` ou `invoke_tool` pour préparer ou exécuter une tool;
- `base propose` puis `base commit`, ou `propose_change` puis `commit_change`, pour une écriture médiée.

La règle pratique est:

```text
Le process déclare les besoins.
BASE médie certaines actions.
Les droits réels restent portés par l'OS, l'outil, le connecteur ou l'API.
```

## Pourquoi ne pas router toutes les ressources?

BASE pourrait évoluer vers un routage plus large: trouver directement une compétence, un outil, un template ou un document à partir d'une demande.

Ce serait utile dans certains contextes, mais cela doit demeurer une extension explicite. Router une action et retrouver du contexte ne relèvent pas de la même responsabilité.

Le choix actuel est donc prudent:

```text
route = choisir le process à suivre
discover/open = trouver ou ouvrir les ressources utiles
```

Cette séparation garde le système compréhensible pour une personne seule, testable pour une équipe, extensible pour une organisation.

## Ce que BASE lit dans votre frontmatter, et ce qui reste à vous

BASE lit une liste fermée de champs: `id`, `type`, `title`, `description`, `use_when`,
`routing.examples`, `routing.avoid_when`, `may_use`, `requires`, `scope`, `status`, `sensitivity`,
`confidential`, `keywords`, `valid_from`, `valid_until`, `review_by`, `derived_from`, `execution`
et `schema_version`. Tout autre champ est conservé tel quel et n'est interprété par rien: vos propres
conventions (`kind: dossier-client`, `client: dupont`, un identifiant interne) traversent BASE sans
effet de bord et restent lisibles par vos outils. Les champs que votre outil d'IA lit pour son
compte, par exemple `name` ou `allowed-tools` dans une fiche de compétence Claude Code, entrent dans
la même catégorie: BASE ne les lit pas, il ne les touche pas.

Un document écrit à partir d'autres documents déclare ses sources dans `derived_from`, par leur identifiant ou leur chemin. Un résumé ne remplace jamais ses sources: cette ligne dit où revenir, et `base doctor` signale un document dont une source a été modifiée depuis.

Un dossier contient parfois des contenus qui ne doivent jamais router: des archives volumineuses,
des données brutes, des textes de fiction ou d'exemple. Déclarez-les dans `base.config.json`:

```json
{ "inventory": { "exclude": ["archives", "donnees-brutes"] } }
```

Ces préfixes de chemin sortent de l'inventaire: ni routage, ni recherche, ni contrôles. Ils restent
sur le disque et vos outils y accèdent normalement; BASE cesse simplement de les considérer comme du
savoir-faire à router.

## Quand BASE ne trouve pas de route: le repli (fallback)

Le routeur reste honnête: si la demande ne correspond à aucun workflow, il s'abstient (`out_of_scope`) plutôt que d'inventer une route. Pour autant, l'utilisateur ne doit jamais rester sans suite.

`base init` déclare l'accueil du cadre comme repli d'aide. `base upgrade` le propose aux dossiers
plus anciens qui n'ont pas déjà choisi leur propre porte. Un projet peut aussi déclarer une autre
cible dans `base.config.json` ou `base.config.mjs`:

```json
{
  "routing": {
    "fallback": { "agent": "concierge-base", "process": "accueil" }
  }
}
```

Quand le routeur s'abstient honnêtement, il joint au résultat un pointeur `fallback`. C'est une
métadonnée distincte, jamais une fausse route: le `status` demeure l'abstention honnête. La carte du
dossier affiche aussi cette porte. L'assistant charge alors le process d'accueil au lieu de laisser
l'utilisateur bloqué.

Le moteur reste agnostique: il suit la cible configurée. Il la cherche d'abord dans le dossier, puis
dans le cadre BASE installé. Rien n'est copié dans le dossier métier et le lien de la carte reste
ouvrable même si le cadre est ailleurs sur la machine. Une cible introuvable n'attache aucun repli,
et `base validate` le signale. Le repli se borne à orienter, sans rien promettre de plus.

```text
Routage "Bonjour": out_of_scope (below_floor)
Fallback: concierge-base -> accueil
```

Cette promesse vaut lorsque le routage est activé et que la cible existe dans le dossier ou dans son
cadre installé. Un client MCP reçoit le texte d'accueil et la carte de ses autres process, puisqu'il
ne peut pas ouvrir les chemins du serveur. Dans un exemple copié qui charge directement un agent
métier, «Aide» peut encore ouvrir l'aide métier locale.

## Racine et workspace

Une **racine** (root) est un projet BASE confiné: un dossier avec son `.ai/`, ses agents et ses données. Toute lecture, écriture ou exécution demeure dans la racine sélectionnée.

Trois situations, de la plus simple à la plus avancée:

- **Une seule racine.** Le cas par défaut. Ouvrez le dossier, c'est votre BASE.
- **Des sous-projets imbriqués.** Un dossier conteneur avec plusieurs `.ai/agents/` en dessous: la CLI et le MCP détectent la racine la plus proche.
- **Plusieurs racines déclarées (multi-client).** Un fichier `base.workspace.json` liste des racines nommées:

```json
{
  "schema_version": "base.workspace.v1",
  "id": "agence",
  "roots": [
    { "id": "client-a", "path": "clients/a", "default": true },
    { "id": "client-b", "path": "clients/b" }
  ]
}
```

`base route "<demande>" --workspace base.workspace.json` peut alors chercher parmi les racines; `--root-id client-b` en cible une précise. Le routage traverse les racines, mais chaque action demeure confinée à la racine choisie. Détail dans `specs/current/10_core/cli.md` et `mcp/README.md`.

## Règle pratique

- Si vous savez quel agent utiliser, chargez son `AGENT.md`.
- Si vous savez déjà quel process suivre, pointez directement son `SKILL.md`: le routage est un point d'entrée, non un passage obligé.
- Si la demande peut suivre plusieurs workflows, recourez à `base route` ou `route_request`.
- Si le process a besoin de contexte, n'ouvrez que les ressources qu'il référence ou que vous découvrez pour ce besoin.

Cette discipline évite le mur d'instructions, limite les tokens inutiles et garde visibles les décisions qui comptent.
