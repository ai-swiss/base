---
schema_version: base.resource.v1
id: langues
type: document
title: Comprendre quelle langue BASE utilise, et où
description: Pourquoi la documentation publique est en français, les spécifications en anglais, comment un dossier déclare sa propre langue, et comment les assistants BASE fonctionnent dans n'importe quelle langue.
scope: public
status: active
sensitivity: public
keywords: [langues, francais, anglais, traduction, souverainete, plurilingue, documentation, specifications, language, base-config]
---

# Comprendre quelle langue BASE utilise, et où

Si vous vous demandez pourquoi la documentation est en français alors que les spécifications sont en anglais, cette page vous l'explique en quelques lignes. Elle s'adresse à toute personne qui découvre le projet, y contribue ou souhaite bâtir un assistant: elle dit quelle langue gouverne quoi, dans quelle langue BASE écrit les fichiers de VOTRE dossier, et pourquoi vos propres assistants ne sont liés ni à l'une ni à l'autre.

## Le français pour la méthode

La documentation publique (`docs/`, [Manifeste](../../MANIFESTO.md)) est en français. C'est la langue de la méthode: celle dans laquelle BASE explique pourquoi structurer la collaboration avec l'IA, comment vérifier, comment garder la souveraineté sur ses fichiers. Dans un pays plurilingue, écrire la méthode dans une langue nationale la rapproche de ses lecteurs. Le README fait exception: il s'affiche en anglais par défaut sur GitHub, pour l'ouverture internationale, et sa source française, qui fait foi, vit dans [README.fr.md](../../README.fr.md).

## L'anglais pour le contrat technique

Les spécifications d'ingénierie ([`specs/`](../../specs/current/README.md)) sont en anglais, la langue du contrat technique. Les exigences, les invariants et les décisions d'architecture y sont reliés au code et aux tests; ils s'adressent aux contributeurs et aux mainteneurs, dont l'anglais est la langue de travail. La précision d'un contrat d'ingénierie pâtit des traductions approximatives: une seule version normative, en anglais, prévient les divergences.

## Vos assistants parlent la langue de leurs utilisateurs

Les assistants construits avec BASE ne sont attachés à aucune langue en particulier. Le routage par défaut est lexical: il compare les mots normalisés d'une demande à ceux de vos propres fichiers, sans s'appuyer sur la grammaire ni le lexique d'une langue donnée. Un assistant déclaré avec des mots-clés allemands, italiens ou anglais route dans cette langue. La langue de la documentation du cadre n'impose rien à celle de vos assistants.

Une nuance, parce qu'un routage lexical apparie des mots: il route dans la langue où vos signaux sont écrits, et une demande formulée dans une autre langue que vos fichiers n'y correspond pas. C'est le **niveau zéro**, déterministe et reproductible (aucun modèle, aucun appel réseau): un plancher testable et une confirmation, pas le routage le plus fin. Dès qu'un modèle lit vos fichiers, la langue cesse d'être une contrainte: dans un harnais, l'assistant descend l'index et les `AGENT.md`/`SKILL.md` quelle que soit la langue de la demande (et vous pouvez changer de langue en cours de route), et le routage sémantique optionnel, par embeddings, franchit lui aussi les langues. L'appariement à la langue ne pèse donc que sur le plancher lexical déterministe (`base route`, ou l'outil MCP `route_request` sans embeddings), pas sur la découverte progressive menée par le modèle.

## La langue de votre dossier

`base.config.json` porte une clé `language`. Elle décide dans quelle langue BASE écrit les fichiers
qu'il génère pour ce dossier:

- le point d'entrée de votre outil (`CLAUDE.md`, `AGENTS.md`, `BASE_BOOTSTRAP.md` ou `.cursor/rules/assistant.mdc`);
- l'index de routage, à la racine et par agent (`.ai/routing/index.md`, `.ai/agents/<agent>/index.md`), avec les étiquettes «Quand l'utiliser» et «Éviter si»;
- la matrice des outils (`.ai/tools.md`);
- le `README.md` du dossier et sa ligne d'attribution CC BY;
- l'agent de départ écrit par `base init`, son process d'import, le `.gitignore` et le `.gitattributes` qui l'accompagnent.

Quatre tables de mots existent dans `tools/core/lang/`: le français (`fr.mjs`), l'anglais
(`en.mjs`), l'allemand (`de.mjs`) et l'italien (`it.mjs`). `base init` n'annonce que les langues
que ce build porte réellement, la question étant construite depuis ces tables.

Le français est le repli, clé par clé. Une table qui ne traduit que la moitié des textes donne un
fichier traduit là où elle traduit et français ailleurs, plutôt qu'un fichier troué.

### Une langue inconnue est notée, jamais fatale

La valeur est ramenée à sa partie principale, en minuscules: `de-CH` donne `de`, parce qu'une table
de mots s'écrit par langue et non par région. Une langue dont ce build n'a pas la table est
enregistrée telle quelle dans `base.config.json`, et les textes sortent en français. Le dossier reste
chargeable. `base init` le dit en une ligne:

```
Langue «es» inconnue de ce build: elle est notée dans base.config.json, et les textes sont écrits en français (langues disponibles: fr, en, de, it).
```

Un identifiant d'outil décide quel fichier est écrit, donc un identifiant inconnu arrête le
chargement. Une langue décide seulement des mots à l'intérieur des fichiers, et un dossier écrit
contre un BASE plus récent, qui connaît plus de langues, doit rester lisible par un BASE plus ancien.

### La poser

À la création du dossier:

```bash
base init --language en
```

Sur un dossier déjà en service, la clé s'écrit dans `base.config.json`, puis la construction
régénère les fichiers:

```json
{ "language": "en" }
```

```bash
base build --write
base build routing-index --write   # si votre dossier porte les index de routage
```

`base build` relit `language` à chaque passage, donc un dossier traduit ne revient pas au français à
la première reconstruction. La question de la langue n'est posée que sur un dossier neuf: sur un
dossier existant, le plan vient de `base build`, qui lit la langue déjà déclarée, et `--language` n'y
changerait rien.

### La langue de BASE et la langue de vos contenus sont deux choix

Le plancher de routage lexical compare les mots d'une demande aux mots de vos fichiers. Un corpus
rédigé en allemand route les demandes formulées en allemand, que `language` vaille `de`, `fr` ou
rien. `language` porte sur les phrases que BASE écrit; vos fiches portent les mots qui routent. Le
routage suit le second choix.

Un dossier dont les process sont rédigés en allemand et dont `language` vaut `fr` fonctionne: l'index
s'introduit en français et liste des fiches allemandes, le routage suit l'allemand des fiches.
L'inverse tient aussi. Déclarer `language` rend la page lisible; rédiger vos fiches dans la langue de
vos utilisateurs rend le routage juste.

### Ce qui ne suit pas la langue du dossier

Deux surfaces restent en dehors, par décision.

Les messages de la CLI. Ce que le terminal imprime est lu par la personne qui lance la commande, pas
par l'agent qui ouvrira le dossier ensuite. Ces phrases vivent à leur point d'appel, hors des tables.

Les instructions MCP (les constantes `MCP_*` de `tools/core/bootstrap.mjs`). Elles sont en anglais et
le restent: elles sont lues par des clients qui n'ouvrent jamais ces fichiers, donc la langue déclarée
dans le dossier ne les concerne pas.

## Qui lit quoi

| Profil | Langue | Porte d'entrée |
| ------ | ------ | -------------- |
| Utilisateur, créateur d'assistant, décideur | Français | [README](../../README.fr.md), [Lire dans quel ordre](../start/lire-dans-quel-ordre.md) |
| Responsable conformité, institution | Français | [Souveraineté, confiance et conformité](../trust/souverainete-et-confiance.md) |
| Développeur, intégrateur, auditeur technique | Anglais | [Spécification courante](../../specs/current/README.md) |
| Contributeur au cadre | Les deux | [CONTRIBUTING](../../CONTRIBUTING.md) |

## Traductions

Existent déjà: le README, affiché en anglais par défaut ([README.md](../../README.md)) et sourcé en français dans [README.fr.md](../../README.fr.md); le **miroir anglais intégral de la documentation** (`docs/en/`, chaque page synchronisée sur sa source française par une empreinte `fr-synced` vérifiée en intégration continue); ainsi que le manifeste en [anglais](../../MANIFESTO.en.md), [allemand](../../MANIFESTO.de.md) et [italien](../../MANIFESTO.it.md). BASE maintient la documentation normative en français avec son miroir anglais; les tables allemande et italienne portent les fichiers générés dans les dossiers, sans promettre deux miroirs documentaires supplémentaires. Les autres traductions, comme un `README.de.md` ou un dossier `docs/de/`, restent bienvenues. La convention figure dans [CONTRIBUTING](../../CONTRIBUTING.md): garder la sobriété de l'original, ne pas traduire les identifiants techniques et rappeler en tête de fichier que **la version française fait foi**.

---

BASE est un cadre porté par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
