---
schema_version: base.resource.v1
id: structurer-un-corpus-de-connaissance
type: document
title: Structurer un corpus de connaissance
description: Découper, nommer et déclarer un ensemble de documents pour qu'une question atteigne le passage qui y répond et que la réponse porte une référence réouvrable.
scope: public
status: active
sensitivity: public
keywords: [corpus, sections, ancres, citation, discover, grain, traduction, transcription, egress, createur]
---

# Structurer un corpus de connaissance

Cette page s'adresse à la personne qui écrit ou reprend un ensemble de documents et veut qu'un outil d'IA s'en serve. Elle décrit des mécanismes qui existent dans cette version et se vérifient en une commande. Le routage d'une demande vers un process relève d'un autre geste, décrit dans [Écrire pour le routeur](ecrire-pour-le-routeur.md).

## La question à laquelle cette page répond

Un ensemble de documents ne suffit pas à faire un corpus utilisable par un outil d'IA. Deux propriétés font la différence.

La première: une question doit pouvoir atteindre le passage qui y répond, sans charger le document entier. La seconde: ce qui revient doit porter une référence qu'une autre personne peut rouvrir et lire au même endroit.

Un document entier est le mauvais calibre aux deux bouts d'une lecture. Trop long à envoyer, trop vague à citer. Le corps est donc découpé là où la personne qui l'a écrit l'a déjà découpé, aux titres.

## Citer un passage précis sans charger le document entier: les titres sont des adresses {#les-titres-sont-des-adresses}

Chaque titre reçoit une ancre dérivée de son texte: décomposition Unicode, accents pliés, ponctuation retirée, espaces changés en traits d'union. «Délai de paiement» donne `delai-de-paiement`. Un bloc de code clôturé n'est jamais découpé, donc une ligne `# commentaire` dans un exemple shell n'invente aucune section. Une ancre répétée dans un même document prend le suffixe `-2`, `-3`, et ainsi de suite: une référence qui pourrait désigner deux passages n'en désigne aucun.

Une seule dérivation sert toutes les surfaces, donc `identifiant#ancre` signifie la même chose partout. Le plan d'un document se lit ainsi:

```bash
base open ecrire-pour-le-routeur --projection outline
```

```text
# Écrire pour le routeur  #ecrire-pour-le-routeur
  ## Comment le routeur lit vos fichiers  #comment-le-routeur-lit-vos-fichiers
  ## Formuler un bon `use_when`  #formuler-un-bon-use-when
```

La référence complète s'ouvre telle quelle, dans la CLI comme dans l'outil MCP `open_resource`:

```bash
base open "ecrire-pour-le-routeur#une-limite-honnete"
```

Le titre est remis au-dessus du passage retourné: un corps cité sans son titre se lit comme une affirmation venue de nulle part.

### Fixer une ancre à la main

Un titre peut fixer son ancre avec la syntaxe `{#slug}`, en minuscules et traits d'union. Deux cas le justifient: un titre qui se répète dans le document, et un titre que vous prévoyez de reformuler.

```markdown
## Délai de paiement à trente jours {#delai-paiement}
```

### Quand un titre change de nom

Reformuler un titre déplace son ancre, tandis que les citations déjà écrites ailleurs gardent l'ancien nom. La fiche dit alors où ce nom est passé, avec une table `superseded_anchors`:

```yaml
---
schema_version: base.resource.v1
id: tarifs
type: document
title: Tarifs de Dupont SA
description: Les tarifs horaires et les conditions de paiement de Dupont SA.
superseded_anchors:
  prix-horaire: tarif-horaire
---
```

La résolution se fait en un seul saut. Chaque entrée doit nommer une ancre encore présente dans le document. Une entrée dont la cible a disparu, comme un alias que personne n'a déclaré, se lit comme une section introuvable, avec la liste de celles qui existent:

```text
Section not found: tarifs#prix-horaire. Known sections: tarifs-de-dupont-sa, tarif-horaire.
```

Renvoyer un autre passage sous la référence demandée produirait une citation qui a l'air sourcée et ne l'est pas. Aucun contrôle ne vérifie ces entrées à votre place: relisez-les quand vous réorganisez un document.

## Retrouver puis ouvrir le passage qui répond à une question factuelle: deux grains {#deux-grains-deux-questions}

Une tâche passe par le routage et arrive à un process. Un fait passe par la recherche de sections et arrive à un passage.

```bash
base route "je dois préparer un devis client"
base discover "contre-exemple qui annule un score" --grain section --scope docs/guides --limit 2
```

La première commande répond à «que faut-il faire maintenant». La seconde répond à «où est-ce écrit». Chaque résultat de la seconde porte son chemin de titres, un extrait et la référence citable:

```text
- ecrire-pour-le-routeur#ecarter-les-demandes-voisines [score 9.44; text:contre, text:exemple, text:annule, text:score]
  Écrire pour le routeur › Écarter les demandes voisines
  `routing.avoid_when` recense les contre-exemples: des demandes voisines qui doivent aboutir ailleurs. …
```

`--scope` restreint la recherche à un dossier, ce qui sert dès qu'un corpus tient plusieurs collections. Deux familles de fichiers restent hors des résultats à ce grain. Un fichier sans fiche, donc sans `schema_version`, reste trouvable au grain ressource et ouvrable par son chemin, mais il ne porte aucune identité choisie à l'écriture, donc il n'est pas citable en `identifiant#ancre`. Une projection générée, comme la carte de routage, est écartée de la recherche: elle résume les ressources qu'elle liste et concourt avec elles sur leurs propres mots.

L'ordre dans lequel un outil d'IA lit un dossier, de la racine au geste final, est décrit dans [La découverte progressive](../reference/decouverte-progressive.md).

## Ce qui rend un passage trouvable

Le classement des passages pèse chaque terme par sa rareté dans le corpus. Un mot présent presque partout rapporte peu. Un mot qui nomme un sujet rapporte beaucoup. Une concordance dans un titre compte trois fois une concordance dans le corps. Une concordance dans les signaux de la fiche parente, son titre, son `use_when` et ses exemples de routage, compte deux fois et profite à toutes les sections du document. La comparaison se fait sur le mot entier, avec une concordance par préfixe à partir de cinq lettres, de sorte que «priorisation» atteint «prioriser» sans racinisation.

Deux conséquences pour qui écrit.

Un titre nomme son sujet avec les mots qu'emploierait la personne qui cherche. «Étape 2» ne porte rien. «Délai de paiement d'une facture» porte le sujet et le vocabulaire.

Un premier paragraphe répond plutôt qu'il n'introduit. L'extrait montré dans les résultats est le début de la section, coupé à la limite d'un mot après quelques centaines de caractères. Une section qui s'ouvre sur «cette partie présente les règles applicables» montre cette phrase et rien d'autre.

Les règles de formulation des `use_when`, des `routing.examples` et des `avoid_when` sont différentes et vivent dans [Écrire pour le routeur](ecrire-pour-le-routeur.md). Elles servent le routage d'une tâche, pas la recherche d'un fait.

## Les documents traduits et les documents transcrits

Une édition déclare sa langue avec `lang`, en code ISO 639-1. À défaut, le suffixe du nom de fichier répond, par exemple `tarifs.de.md`. Une ressource sans langue, comme une fiche de dossier, ne déclare rien: annoncer une langue inventée serait pire.

Une traduction nomme sa ressource canonique avec `translation_of`, du seul côté de la traduction. La famille se résout depuis l'un ou l'autre bout.

```yaml
---
schema_version: base.resource.v1
id: tarifs-de
type: document
title: Tarife der Dupont SA
description: Die Stundensätze und die Zahlungsfristen der Dupont SA.
lang: de
translation_of: tarifs
---
```

Ouvrir avec une langue rend l'édition correspondante quand elle existe. Sinon, la canonique revient signalée comme repli, avec la liste des langues disponibles. Ce rapport voyage dans le champ `edition`, que la CLI montre avec `--json`:

```bash
base open tarifs --lang it --json
```

```json
{ "requested": "it", "language": "fr", "fallback": true, "available": ["de", "fr"],
  "note": "No it edition of tarifs; the fr edition is returned." }
```

Un repli silencieux ferait citer le texte d'une langue pour celui d'une autre.

Pour un document converti depuis un scan, la phrase que le lectorat veut vérifier vit souvent dans l'image. La fiche déclare alors la citation à faire porter au passage, et les pages imprimées derrière le texte:

```yaml
cite_as: "Tarifs Dupont SA (2026), p. 2"
source:
  connector: scan
  pages: [2]
  page_images: "scans/tarifs-{page:03}.png"
```

`{page}` et `{page:03}`, la seconde forme complétée par des zéros, sont résolus pour chaque entrée de `pages`. La projection `source` rend la fiche de source, la citation et les pages:

```bash
base open tarifs --projection source
```

```text
Citation: Tarifs Dupont SA (2026), p. 2
Source: {"connector":"scan","pages":[2],"page_images":"scans/tarifs-{page:03}.png"}
page 2: scans/tarifs-002.png (not present in this deployment)
```

Chaque page est nommée, y compris celle qui n'est pas jointe, avec la raison: absente du déploiement, au-delà du budget d'octets de la réponse, ou d'un type que le serveur n'attache pas. Un déploiement qui livre le texte sans les scans reste un cas normal.

## Ce qui reste hors du corpus

Trois déclarations distinctes, pour trois questions distinctes.

`inventory.exclude`, dans `base.config.json`, sort des préfixes de chemin de l'inventaire: ni routage, ni recherche, ni contrôles. C'est la réponse pour des archives volumineuses, des données brutes ou des textes de fiction. Les fichiers restent sur le disque et vos outils y accèdent normalement. Détail dans [Router une demande vers le bon process](../reference/routage-process-et-ressources.md).

`confidential: true`, dans la fiche d'une ressource, la retient face à un modèle distant. Sur la surface MCP, traitée comme distante par défaut, une telle ressource est absente de la découverte comme du routage: son existence est masquée, pas seulement son contenu. Ce champ est posé par une personne, jamais déduit. Ce que chaque porte garantit est détaillé dans [Sécurité et limites](../trust/securite-et-limites.md).

La section `mcp` de `base.config.json` dit ce qu'un déploiement expose. `mcp.tools` et `mcp.agents` sont des listes d'autorisation: absentes, toute la surface; présentes, seulement ce qu'elles nomment. `mcp.attribution_prefix` fait porter à chaque lecture la ligne `attribution` de la fiche de dossier la plus proche, de sorte qu'une règle d'usage voyage avec le contenu jusque dans le client qui le reçoit.

## Vérifier son travail

Quatre commandes, de la plus rapide à la plus engageante.

```bash
base discover "quel est le délai de paiement" --grain section --limit 5
base open "tarifs#tarif-horaire"
base doctor
base route-eval --ollama
```

La première montre ce qu'une question rapporte vraiment, avec les raisons qui ont produit chaque score. Posez les questions que pose votre public, pas celles que vos titres appellent.

La deuxième lit le passage qu'une citation produirait. C'est le texte exact qu'un modèle reprendra.

La troisième rend les signaux de structure du corpus: liens morts, ressources orphelines, relectures échues, document dont une source déclarée a changé, projections périmées. Un corpus sain ne rend aucun signal.

La quatrième mesure le rappel de la recherche sur un jeu étiqueté, déposé dans `.ai/routing/route-eval-golden.json` ou passé avec `--golden <fichier>`. Elle demande un modèle d'embeddings réel, donc un Ollama local, et reste un outil de mainteneur, hors de `npm run check`. Le rapport nomme le jeu et le corpus mesurés, pour qu'un chiffre ne soit jamais lu comme portant sur autre chose.

---

BASE est un cadre porté par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
