---
schema_version: base.resource.v1
id: ecrire-pour-le-routeur
type: document
title: Écrire pour le routeur
description: Corriger un assistant qui choisit le mauvais parcours en formulant use_when, routing.examples et avoid_when, puis vérifier le routage avec des fixtures.
scope: public
status: active
sensitivity: public
keywords: [routage, assistant, mauvais parcours, condition usage, use_when, examples, avoid_when, fixtures, route-test, formulation, createur]
---

# Écrire pour le routeur

Lorsqu'une demande telle que «Prépare un devis pour Dupont SA» n'atteint pas le bon process, votre assistant reste muet ou répond à côté: tout se joue dans la formulation de vos fichiers. Ce guide s'adresse aux créateurs d'assistants. Il explique comment le routeur lit vos fichiers, comment écrire à son intention et comment s'assurer que vos demandes arrivent à bon port. Aucune compétence technique n'est requise, hormis une commande de terminal pour les essais.

## Comment le routeur lit vos fichiers

Votre `use_when` sert deux lecteurs. Dans un outil d'IA, le modèle le lit et en comprend le sens; le plancher déterministe, lui, ne saisit pas le sens et **compare des mots**. Écrire pour le plancher, le plus littéral des deux, satisfait aussi le modèle. Pour chaque process, le plancher compose un texte de routage à partir du `use_when` (le signal le plus fort), complété par les `routing.examples`; faute de quoi, il s'appuie sur la description, le titre, puis les mots-clés. Une demande route bien quand ses mots recoupent ce texte. En pratique, votre `use_when` doit avant tout reprendre **les mots qu'emploieraient vos utilisateurs**, plutôt qu'une formule élégante.

## Corriger un mauvais parcours: formuler un bon `use_when` {#formuler-un-bon-use-when}

Rédigez le `use_when` du point de vue de l'utilisateur, non du vôtre. Le jargon interne («gestion du cycle de vente») ne route rien si personne ne le saisit; les mots concrets («devis», «prix», «offre»), eux, routent.

Avant, un `use_when` trop faible:

```yaml
use_when: Gestion des propositions commerciales et du cycle de vente.
```

Après, un `use_when` solide:

```yaml
use_when: Quand un client demande un devis, un prix ou une offre chiffrée.
routing:
  examples:
    - Prépare un devis pour Dupont SA, 3 jours de conseil
    - Combien ça coûterait pour ce projet ?
    - Il me faut une offre avant vendredi
  avoid_when:
    - Relancer une facture impayée.
```

## La langue de vos `use_when`

Le plancher lexical compare des mots, pas du sens: face à une demande dans une autre langue que vos
`use_when`, il s'abstient plutôt que de deviner. Dans un outil IA qui lit vos fichiers, le modèle
choisit d'après la carte et peut interpréter d'autres langues, sans garantie de résultat identique.
Pour les appels où le plancher lexical décide seul, notamment `base route` sans Voie 2 et
`route-test` par défaut, écrivez vos `use_when` et vos `routing.examples` dans les langues que vos
utilisateurs emploient réellement: une équipe bilingue met les deux formulations, et l'abstention
redevient ce qu'elle doit être, le signal d'une demande hors sujet plutôt que d'une langue absente.

## Donner des exemples variés

Les `routing.examples` sont des formulations telles que vos utilisateurs les emploient. Donnez-en au moins trois pour une même intention, avec des mots distincts: une tournure directe, une question, puis une demande exprimée dans l'urgence. Le routeur retrouve alors l'intention plus souvent, y compris lorsque la demande reprend les mots d'un exemple plutôt que les vôtres.

Une règle d'hygiène pour ces exemples et pour vos `keywords`: les mots outils ne portent rien. «Je voudrais», «est-ce que», «pour le», «merci de» se retrouvent dans toutes les demandes, donc distinguent zéro process. Gardez les mots du métier, ceux qu'un autre process ne contient pas.

## Écarter les demandes voisines

`routing.avoid_when` recense les contre-exemples: des demandes voisines qui doivent aboutir ailleurs. Si «relancer une facture» relève d'un autre process, le déclarer ici annule le score du mauvais candidat, plutôt que de laisser deux process se disputer la demande.

Écrivez chaque contre-exemple avec les mots du cas à exclure, jamais avec les vôtres. Le veto met le score à zéro: une ligne «pas pour l'intégration d'une personne, la procédure d'intégration le décrit», dans un process dont les exemples parlent déjà d'intégration et de procédure, retire à ce process les demandes qu'il sert. `base validate` signale ce cas, nomme les mots partagés et la formulation écartée.

## Vérifier que ça route

```bash
node tools/base.mjs route "il me faut une offre pour un client" --root <dossier>
```

Lisez le résultat: le process retenu, le score et les raisons (`route:<terme>` signale les mots qui ont concordé). Si le routeur s'abstient ou hésite, les raisons en disent la cause: le plus souvent, un mot fait défaut dans votre `use_when` ou vos exemples. Ajoutez `--json` pour le détail complet.

## Régénérer l'index de routage

Votre outil IA s'oriente d'abord par une carte générée, `.ai/routing/index.md` (et un index par agent), qui liste chaque process avec son «Quand l'utiliser» et son «Éviter si». Cette carte ne se met pas à jour toute seule: après avoir ajouté, retiré ou reformulé un process, régénérez-la:

```bash
node tools/base.mjs build routing-index --write --root <dossier>
```

Sans ce pas, le nouveau process reste invisible au routage progressif (l'index dit encore l'état d'avant), même si `base route` le trouve déjà. Le fichier généré porte un en-tête «Ne pas éditer»: la vérité vit dans vos `use_when`, l'index n'en est que la projection.

## Figer le comportement

Une fois les routes correctes, consignez-les dans `.ai/routing/route-tests.json`: chaque entrée associe une demande à la route attendue. Puis:

```bash
node tools/base.mjs route-test --root <dossier>
```

Par défaut, la commande rejoue les fixtures et les `routing.examples` disponibles avec la stratégie
lexicale et les rankers de `base.config`. Elle échoue si un cas écrit ne rend plus le statut, l'agent
ou le process attendu. Elle ne prouve ni toutes les formulations possibles, ni le choix d'un modèle
qui lit l'index.

Si `.ai/studio.settings.json` configure les deux modèles de la Voie 2, `base route` emprunte la
stratégie `embedding`. Vérifiez ce chemin séparément, en sachant qu'il appelle les modèles et n'est
pas un contrôle déterministe de CI:

```bash
node tools/base.mjs route-test --strategy production --root <dossier>
```

## Une limite honnête

Le run par défaut mesure le chemin de la stratégie lexicale. Sans ranker externe, ce plancher sert
les appels sans modèle et fournit un contrôle reproductible. Un ranker branché dans `base.config`
fait partie de ce run; s'il appelle un fournisseur d'embeddings, sa reproductibilité dépend de ce
fournisseur. Dans une conversation, la carte est l'index et c'est le modèle qui route.

Le plancher lexical est rudimentaire, mais efficace; il reste sensible à la formulation, car des mots absents ne correspondent à rien, le sens fût-il proche. C'est la rançon de l'explicabilité: chaque score se justifie par des raisons inspectables, sans réseau ni dépendance. Des adaptateurs permettent au demeurant de l'étendre. Pour les corpus délicats (process nombreux et voisins, vocabulaire très varié), un ranker sémantique facultatif existe: voir le [Quickstart routage sémantique](routage-semantique-quickstart.md).

La **négation** est la limite la plus nette: le routeur compte des mots, il ne les inverse pas. «Ne
crée pas un devis, annule-le» crédite créer ET annuler (les particules ne/pas ne scorent plus, mais
les deux intentions restent présentes). L'issue conçue est l'abstention honnête: le routeur pose sa
question avec les deux options dans les candidats, et votre outil IA, qui lit la liste, tranche; en
`base route` seul, attendez-vous à la question. Deux conséquences d'écriture: n'encodez **jamais** une
négation dans un `use_when` («quand le client ne veut pas…»), elle donnerait des points aux demandes
qui la contiennent; et figez les abstentions attendues dans `route-tests.json` (le mécanisme est
montré plus haut), pour que ce comportement reste un choix, pas un accident.

---

BASE est un cadre porté par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
