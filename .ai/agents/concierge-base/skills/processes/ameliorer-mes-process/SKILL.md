---
schema_version: base.resource.v1
id: ameliorer-mes-process
type: process
title: Améliorer mes process
scope: team
status: active
sensitivity: internal
name: ameliorer-mes-process
description: "Lire ce que l'outillage sait déjà d'un BASE en service (doctor, validate, route-test, frictions), en tirer des propositions adossées à leur preuve, et les soumettre carte par carte sur une fiche."
use_when: Quand une personne dont le BASE fonctionne déjà demande ce qui pourrait aller mieux dans ses process, son routage ou ses fiches.
may_use:
  - fiche-de-decision
routing:
  examples:
    - Qu'est-ce qui pourrait aller mieux dans mes process?
    - Mes process sont-ils encore bons?
    - Fais le point sur mon BASE et propose des améliorations
    - Des frictions traînent depuis des semaines, qu'en faire?
  avoid_when:
    - Un répertoire plein de fichiers Word, sans rien d'installé encore.
    - Partir de documents existants, avant toute installation, pour bâtir une première structure.
    - Consigner un dysfonctionnement précis qui vient de se produire.
    - C'est quoi un agent, une compétence, un process: une question de vocabulaire, pas un examen du dossier.
argument-hint: "[la zone à examiner, si connue]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write
---

# Améliorer mes process

Un BASE en service accumule des signaux: des liens qui ne mènent plus nulle part, des demandes que
le routeur refuse encore et encore, des frictions consignées et jamais reprises. L'outillage les
connaît déjà. Ce process les lit d'abord et n'ajoute rien avant.

Il vise un BASE existant: un `base.config.json` et au moins un `.ai/agents/<nom>/AGENT.md`. Un
dossier de documents qui n'a jamais été initialisé relève de `adopter-ce-dossier`.

## Étapes

### 1. Lire ce que l'outillage sait déjà

Quatre lectures, dans cet ordre, avant la moindre idée personnelle.

`base doctor --root .` nomme chaque défaut avec son fichier. Les signaux qui portent une
amélioration de process: `dead_link`, un lien mort; `orphan`, une ressource que rien n'atteint;
`stale_marker`, un marqueur ouvert et non touché depuis trente jours; `weak_routing`, un process
sans `use_when` ni exemples déclarés; `template_residue`, une fiche qui garde le texte du gabarit;
`derived_stale`, un document dont une source a changé depuis; `unresolved_declaration`, un
`may_use` ou un `requires` qui ne mène à rien; `open_friction` et `recurring_abstention`.

`base validate --root .` relève les fiches qui s'excluent elles-mêmes: un exemple de
`routing.examples` écarté par le «éviter si» de la même fiche, et le veto met le score à zéro. Il
relève aussi les ressources sans description, que la recherche ne voit pas.

`base route-test --root .` exécute deux suites distinctes lorsqu'elles existent: les demandes et
résultats attendus de `route-tests.json`, puis les formulations de `routing.examples`, qui doivent
encore atteindre leur propre fiche. Il vérifie le routeur déterministe destiné aux scripts et
intégrations sans modèle. Un modèle lit plutôt la carte générée et juge le process à suivre. Chaque
échec déterministe est une promesse écrite qui ne tient plus. Sans fixtures, `--scaffold` en rédige
un premier jeu, à réécrire ensuite dans les mots de ces personnes.

`.ai/feedback/` garde les frictions consignées, `.ai/feedback/abstentions.jsonl` les demandes que
le routeur a refusées. Relis chaque friction ouverte avec sa question de triage: où ce coût est-il
payé aujourd'hui, et où devrait-il vivre?

### 2. Transformer les signaux en propositions

Une proposition tient en trois lignes: la preuve, le plus petit changement qui y répond, ce qu'il
coûte.

- **Une abstention récurrente est un process qui attend d'exister.** Trois refus de la même
  demande la font remonter. Le plus petit changement: un process qui la sert, puis une fixture
  `route-test` qui protège la route.
- **Une friction est un coût payé à chaque demande.** Le déplacer une fois dans la structure le
  supprime partout: une ligne dans une fiche, une colonne tenue à l'écriture, un lien depuis le
  process, une compétence qui nomme le modèle à utiliser.
- **Un `weak_routing` ou une fiche qui s'exclut elle-même laisse la route dériver.** Le plus petit
  changement: réécrire le «éviter si» avec les mots du cas à exclure, jamais avec ceux du process.
- **Un `orphan` ou un `unresolved_declaration` signale une déclaration manquante.** Déclare la
  ressource dans le `may_use` du process qui s'en sert.
- **Un `stale_marker` est une décision en attente.** La trancher, ou retirer le marqueur.

Une proposition sans signal derrière elle n'entre pas dans la fiche. Un signal peut rester sans
proposition: dis-le, cela vaut mieux qu'une invention.

### 3. Soumettre carte par carte

Suis `fiche-de-decision` et son modèle `../../../templates/decision-sheet.html`, copié sous
`.temp/{AAAA-MM-JJ}_ameliorations-{dossier}/`. Une proposition, une carte. Sur chaque carte: ta
recommandation en tête, la preuve citée avec son fichier, le changement exact que tu écrirais.
Groupe les cartes par famille (routage, frictions, liens, marqueurs) et garde le même ordre de
familles d'une fiche à la suivante.

Dans la réponse qui remet la fiche, résume chaque proposition en une ligne avec le signal observé
et l'endroit précis où le plus petit changement agirait. La fiche porte le détail; la réponse doit
néanmoins permettre à la personne de comprendre ce qu'elle s'apprête à arbitrer avant de l'ouvrir.

### 4. Agir sur l'export

La personne répond, exporte un Markdown `..._decisions-filled.md`, te le rend. Applique là où elle
est d'accord, suis son commentaire là où elle nuance, laisse en l'état là où elle n'a pas répondu
et dis-le. Chaque écriture passe par le gate: `base propose`, puis `base commit` une fois le diff
validé. Après tout ajout ou retrait de process, relance `base build routing-index --write --root .`,
puis `base route-test --root .`. Marque résolue chaque friction dont le process a été amendé.

Si le dossier a été créé par une version antérieure du cadre, `base upgrade --root .` montre ce
qui lui manquerait aujourd'hui et n'écrit qu'avec `--write`.

## Ce que tu ne fais jamais

- **Changer un process sans la réponse de la personne sur sa carte.**
- **Proposer sans preuve.** Chaque carte nomme le signal et le fichier qui l'ont produite.
- **Tout refondre d'un coup.** Le plus petit changement qui répond au signal, et rien de plus.
- **Supprimer une ressource orpheline.** La déclaration se corrige, le fichier se garde.
- **Réécrire une friction consignée.** Le journal ne se récrit pas: on amende le process, puis on
  marque la friction résolue.
