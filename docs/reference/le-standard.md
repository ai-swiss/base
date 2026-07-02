---
schema_version: base.resource.v1
id: le-standard
type: document
title: "Le standard BASE: base.resource.v1"
description: "La page citable du standard que BASE propose: le format base.resource.v1, sa portée, son modèle d'objet, les deux séparations, les conventions de routage, sa conformité vérifiable, sa promesse de stabilité et son implémentation de référence."
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [standard, format, base.resource.v1, frontmatter, conformite, interoperabilite, agents-md, okf]
audience: [developer, builder, decision-maker]
learning_level: intermediate
---

# Le standard BASE: `base.resource.v1`

BASE n'est pas une plateforme de plus: c'est un **standard ouvert que nous proposons**, avec son
implémentation de référence. Il ne standardise pas seulement la connaissance qu'une IA consulte:
il standardise l'articulation du travail entre l'humain et l'IA, quel agent, quel process, quelles
données, quelle vérification. Cette page est l'endroit citable du standard. Elle en nomme chaque
pièce et renvoie vers sa source de vérité, sans en copier aucune: une copie locale dériverait, et la
règle d'anti-dérive (`specs/current/30_schemas`) veut qu'il n'existe qu'une seule vérité machine.

Ce standard est encore jeune. Il est stabilisé et versionné, il a une implémentation de référence et
une conformité vérifiable, mais il n'est pas ratifié par un organisme tiers. Cette page dit ce que le
format garantit aujourd'hui, et ne présente rien d'autre comme acquis.

## Portée

Le standard couvre le **format d'une ressource** et les **conventions** qui la rendent utile à un
agent: comment un fichier se déclare, comment il se valide, comment un routeur le choisit. Il ne
définit ni les règles métier d'une organisation, ni un moteur d'exécution, ni un modèle: ces choix
restent au-dehors, et l'implémentation de référence les traite comme des points d'extension ou des
briques remplaçables. La place de BASE parmi les autres outils, et ce qu'il ne prétend pas être, sont
détaillés dans [Positionnement](positionnement.md); cette page-ci décrit le format lui-même.

## Identifiant versionné

L'identité du format est portée par un seul champ, requis dans chaque ressource:

```yaml
schema_version: base.resource.v1
```

La vérité machine est [`base.schema.json`](../../base.schema.json), publié sous l'identifiant stable
`https://a-i.swiss/base/schemas/base.resource.v1.json`. Cet identifiant ne change qu'avec une version
**majeure** du format. Le format suit le versionnage sémantique (voir [Sa promesse de stabilité](#sa-promesse-de-stabilite)):
un ajout rétrocompatible reste `base.resource.v1`; une rupture incrémenterait le `v`.

## Le modèle d'objet

Une ressource est un fichier Markdown (ou JSON) portant un petit en-tête typé. Le principe est la
**métadonnée progressive**: peu de champs sont requis, le reste s'ajoute quand un mécanisme ou un
signal en a besoin. La grammaire complète du frontmatter est spécifiée dans
[`specs/current/10_core/frontmatter.md`](../../specs/current/10_core/frontmatter.md), assez
précisément pour être réimplémentée: un sous-ensemble strict, documenté, qui rejette bruyamment tout
ce qui en sort, plutôt qu'un moteur YAML complet.

### Champs requis

Quatre champs, et seulement quatre, sont exigés dès que `schema_version` est présent:

| Champ | Contrainte | Rôle |
| --- | --- | --- |
| `schema_version` | constante `base.resource.v1` | déclare le format et sa version |
| `id` | `^[a-z0-9][a-z0-9-]*$`, unique dans un BASE | nomme la ressource de façon stable |
| `type` | énumération fermée (voir ci-dessous) | dit ce qu'est la ressource |
| `description` | chaîne non vide | une phrase de sens, aussi utile au routeur |

### Les `type`

Le `type` est une énumération fermée: `agent`, `process`, `knowledge`, `competence`, `tool`,
`template`, `data`, `data_collection`, `document`, `note`, `journal`, `trace`, `source`, `connector`,
`policy`, `adapter`, `schema`. Deux d'entre eux, `agent` et `process`, sont **routables**; les autres
sont du **contexte**, récupéré une fois la route choisie. La liste fermée est ce qui rend la
distinction opérable au lieu d'être une convention molle.

### Champs optionnels

Le reste est progressif. Chaque champ optionnel sert un mécanisme ou un signal précis, jamais la
décoration. Quelques-uns, parmi les plus porteurs:

- `use_when`, `routing.examples`, `routing.avoid_when`: les signaux de routage (voir ci-dessous).
- `confidential` (booléen, **posé par un humain, jamais inféré**): la ressource ne part pas vers un
  modèle distant. C'est le champ qui pilote le contrôle d'egress.
- `sensitivity`, `scope`, `owner`, `license`: la classification et la propriété par ressource.
- `review_by`, `valid_from`, `valid_until`: l'ontologie de vieillissement, lue par `base doctor` et le
  contexte, pour qu'une donnée périmée soit signalée au lieu de circuler en silence.
- `status` (`draft`, `active`, `deprecated`, `archived`): une ressource dépréciée ou archivée n'est
  jamais candidate au routage; le corpus vieillit explicitement.
- `execution`, `requires`, `policy`, `trace`, `governance`, `source`: les points d'extension pour les
  tools, les dépendances, la gouvernance d'entreprise et la traçabilité.

Le contrat autorise les clés supplémentaires (`additionalProperties: true`): un producteur peut
enrichir sans casser un consommateur. Mais, à la différence d'un format qui n'exige presque rien, les
champs que BASE reconnaît sont contraints et vérifiés: c'est là que le standard prend ses quelques
opinions, précisément celles qui activent un mécanisme.

## Les deux séparations

Ce que le format seul ne dit pas, et que BASE ajoute, tient en deux frontières.

- **Les instructions séparées des données.** C'est la frontière de sécurité: ce qui guide le modèle
  ne se mélange pas à ce qui n'est que lu. Un contrôle d'egress s'y appuie (le champ `confidential`).
- **Le savoir-faire séparé du savoir.** Dans les instructions, le process (comment faire) est distinct
  de la compétence (ce qu'il faut savoir): c'est la frontière de maintenabilité.

Un format de connaissance voisin fait cohabiter un mode opératoire et la description d'une table avec
le même statut de contenu consultable. BASE les sépare, parce que la sécurité et la maintenabilité en
dépendent. Ces frontières sont posées dans [ARCHITECTURE.md](../../ARCHITECTURE.md) et le
[README](../../README.md).

## Les conventions de routage

Un standard qui décrit une unité de travail doit dire comment la choisir. BASE route vers un **agent
et un process entiers**, de façon déterministe et explicable, ou s'abstient; il ne récupère pas des
fragments par similarité. Les signaux vivent dans le fichier lui-même:

- `use_when`: une phrase courte sur *quand* utiliser la ressource, le signal le plus fort.
- `routing.examples`: de vraies formulations d'utilisateur, pour améliorer le rappel.
- `routing.avoid_when`: des contre-exemples, qui écartent une ressource mal appariée sans la rendre
  opaque.

Ces champs sont progressifs: une ressource route déjà depuis son titre et sa description seuls. La
décision retourne l'un de quatre statuts, `routed`, `ambiguous`, `needs_clarification`,
`out_of_scope`, jamais une confiance opaque, et s'abstient plutôt que de fabriquer une route depuis du
bruit. La spécification normative est [`routing.md`](../../specs/current/10_core/routing.md); le
guide d'écriture est [Écrire pour le routeur](../guides/ecrire-pour-le-routeur.md).

## La conformité vérifiable

Ici le standard se distingue nettement d'un format à consommation permissive. `base validate` est le
vérificateur de conformité, et il **bloque**: sur une violation d'un champ requis, d'un `id`, d'un
`type` ou d'une date, il refuse au lieu d'accepter au mieux. Les diagnostics sont des **codes
stables**, sur lesquels une CI et des extensions peuvent réagir, avec la ligne fautive; le message
lisible est découplé du code.

- Erreurs de grammaire du frontmatter: `base.yaml.*` (par exemple `base.yaml.duplicate_key`,
  `base.yaml.tab_indent`, `base.yaml.unterminated_quote`).
- Erreurs de conformité du modèle: `base.field.required`, `base.id.invalid`, `base.id.duplicate`,
  `base.type.invalid`, `base.schema.unsupported`, `base.confidential.type`, `base.validity.order`,
  entre autres.
- Règle d'or, la même que le parseur: **sur erreur, aucune valeur devinée**. Le code est enregistré,
  la clé omise, et la validation échoue proprement.

Le cœur ne valide que le minimum que BASE requiert. Les règles d'une organisation (champs obligatoires
par périmètre, détection de données personnelles, rétention) sont des validateurs **opt-in** qui
enregistrent leurs propres codes: le cœur ne prétend jamais connaître les règles d'une organisation.
La spécification est [`validator.md`](../../specs/current/10_core/validator.md).

## Sa promesse de stabilité

Le format suit le versionnage sémantique: un fichier valide aujourd'hui le demeure sur toute la 1.x.
C'est l'engagement **NFR-CORE-002**, dit «pas de rupture», détaillé dans
[Versions et stabilité](versions-et-stabilite.md). L'identifiant `base.resource.v1` ne change qu'avec
une version majeure du format. Un élément stable qui doit disparaître est d'abord déprécié, maintenu
fonctionnel sur au moins une version mineure, avant tout retrait. La surface stable englobe le format
et ses `type`, les commandes CLI et outils MCP existants, et les schémas des projections
(`base.manifest.v1`, `base.routing.v1`).

## L'implémentation de référence, et les autres

Le dépôt fournit l'implémentation de référence: la CLI `base`, le Studio et le serveur MCP, tous sur
le même cœur (Node.js ≥ 18, sans dépendance tierce au cœur). Les spécifications
([`specs/`](../../specs/README.md)) sont écrites pour permettre une réimplémentation indépendante:
changer de langage ou de bibliothèques et reconstruire des fonctionnalités équivalentes reste possible
à partir d'elles. Le standard, c'est le format et ses conventions; la CLI, le Studio et le serveur MCP
n'en sont qu'une implémentation.

## Un exemple minimal

Un process, la plus petite ressource routable utile:

```markdown
---
schema_version: base.resource.v1
id: rediger-un-devis
type: process
description: "Rédiger un devis client à partir du catalogue de prix en vigueur."
use_when: "l'utilisateur veut établir ou chiffrer un devis pour un client"
---

# Rédiger un devis
1. ...
```

Quatre champs requis, un signal de routage, et le corps en Markdown. Le reste s'ajoute quand un besoin
l'appelle: `confidential: true` pour retenir une ressource côté local, `valid_until` pour dater un
tarif, `owner` et `sensitivity` pour une ressource partagée.

## L'interopérabilité, aujourd'hui

Une ressource BASE est déjà lisible par les formats ouverts voisins (AGENTS.md, Agent Skills,
CLAUDE.md, Open Knowledge Format): c'est un simple fichier Markdown à frontmatter. Les `CLAUDE.md`,
`AGENTS.md` et règles Cursor d'un BASE sont des **adaptateurs générés** depuis la source que vous
possédez (`base build`), et le `SKILL.md` est le format natif des process. Là où un format de
connaissance décrit ce qu'un agent peut consulter, BASE articule comment un humain et une IA
travaillent: il ajoute les deux séparations, le routage déterministe, le contrôle d'egress, l'écriture
médiée et la boucle de vérification par l'humain. Le positionnement complet face à ces formats:
[Positionnement](positionnement.md). D'autres cibles d'export ne sont pas implémentées à ce jour et ne
sont pas présentées comme acquises.

---

BASE est un cadre porté par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).