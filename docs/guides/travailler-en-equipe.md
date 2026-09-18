---
schema_version: base.resource.v1
id: travailler-en-equipe
type: document
title: Travailler à plusieurs sur un BASE
description: "Ce qui change quand plusieurs personnes partagent un BASE: scope, écriture médiée, nommage des personnes, racine unique ou workspace, versionnage, fins de ligne, contrôles avant partage."
scope: public
status: active
sensitivity: public
keywords: [equipe, collaboration, workspace, roots, scope, git, gitignore, gitattributes, lfs, validate, doctor, upgrade]
---

# Travailler à plusieurs sur un BASE

Un dossier ouvert par une seule personne tolère les conventions implicites: elle les a toutes en
tête. Dès que deux personnes écrivent dans le même corpus, chaque implicite devient une divergence
qu'un diff finit par révéler. Cette page s'adresse à une équipe qui partage un BASE. Elle nomme les
mécanismes qui existent déjà, et les décisions qui restent à prendre, avec le coût de chaque branche.

## Ce qui change quand le BASE est partagé: proposer, revoir puis committer {#ce-qui-change-quand-le-base-est-partage}

Quand deux collègues modifient le même BASE, la séquence d'écriture est proposer, revoir, puis
committer après revue.

Le corpus devient la référence commune. Un process écrit par une personne est suivi par les autres,
et par leur outil d'IA: sa formulation engage l'équipe, au même titre qu'une procédure affichée.

Le champ `scope` d'une ressource déclare son périmètre de partage: `personal`, `team`, `org`,
`public`. La déclaration a des effets visibles. `base doctor` demande la ligne d'attribution dans le
`README.md` d'un dossier qui porte au moins une ressource en `team`, `org` ou `public`, et reste
muet sur un dossier entièrement personnel. Pour faire passer une ressource d'un périmètre à l'autre,
`base promote <ressource> --to <scope>` écrit le changement par le chemin médié, avec son diff.

Ce chemin médié est la troisième différence. Une écriture se propose (`base propose <cible> --from
<fichier>`), puis se valide (`base commit <change-id>`); `base changes` liste ce qui attend. Chaque
proposition est enregistrée sous `.ai/changes/` avec l'empreinte de l'état de départ, et le commit
la revérifie: un changement préparé sur une version dépassée du fichier ne l'écrase pas en silence.
Votre hébergeur ajoute sa propre relecture (demande de fusion, revue, pipeline); les deux contrôles
se cumulent.

## Nommer les personnes

Une équipe finit toujours par écrire qui fait quoi: la personne qui maintient un process, celle qui
a demandé une exception, celle qu'il faut prévenir. Ce nom doit être une chaîne stable, identique
partout: dans le frontmatter, dans vos journaux de décision, dans le corps des process.

BASE ne lit aucun champ de ce genre. Il lit une liste fermée de champs (voir
[Routage, process et ressources](../reference/routage-process-et-ressources.md)); tout autre champ
traverse BASE tel quel, sans interprétation ni effet de bord. Un `owner: j.dupont` relève donc de
votre convention d'équipe. Écrivez-la une fois, dans l'équivalent local de cette page, et tenez-vous-y.

Le choix de la forme a un coût de chaque côté.

- Un identifiant court (`jdup`, `mb`) se tape vite et reste court dans un frontmatter. Il devient
  ambigu dès que deux personnes se ressemblent, et il oblige à maintenir une table de correspondance
  que quelqu'un doit tenir à jour.
- Un identifiant dérivé du nom (`jean.dupont`) se lit sans table. Il change quand un nom change, et
  il apparaît tel quel dans tout ce que vous publiez: un corpus exporté en `scope: public` emporte
  ces chaînes avec lui.

Une équipe qui utilise déjà des identifiants chez son hébergeur ou dans son annuaire a intérêt à
reprendre les mêmes: une seule forme à mémoriser, et une recherche textuelle retrouve les deux
mondes d'un coup.

## Une racine, ou plusieurs

Une racine est un périmètre confiné: un dossier avec son `.ai/`, ses agents et ses données. Toute
lecture, écriture et exécution demeure dans la racine sélectionnée.

Une racine unique suffit tant que l'équipe travaille sur un même domaine, même avec plusieurs agents
et de nombreux process. Tout le monde ouvre le même dossier, aucun fichier supplémentaire à tenir,
aucune option à passer aux commandes.

Une organisation tient dans une racine: chaque projet ou chaque métier y est un agent avec ses
process, et la règle d'égress, la langue et l'attribution se déclarent une fois. Une seconde racine
se justifie dans deux cas: le projet vit dans son propre dépôt et l'outil d'IA doit y lire le code
et la méthode ensemble; ou ses fichiers ont leurs propres droits d'accès. Les racines se relient
alors par un workspace. Les frictions et les abstentions d'une racine restent dans son
`.ai/feedback/`, où le process «Améliorer mes process» du cadre les lit; ce qu'une racine apprend
et qui vaut pour les autres passe par une demande de fusion sur la racine qui le portera, relue
comme tout changement.

Déclarez un workspace quand les périmètres doivent rester cloisonnés: plusieurs clients, plusieurs
entités, des données qui ne doivent pas se mélanger. Le fichier `base.workspace.json` liste les
racines:

```json
{
  "schema_version": "base.workspace.v1",
  "id": "agence",
  "label": "Agence",
  "roots": [
    { "id": "client-a", "label": "Client A", "path": "clients/a", "default": true },
    { "id": "client-b", "label": "Client B", "path": "clients/b", "egress": "local-only" }
  ]
}
```

Chaque racine porte un `id` unique et un `path` relatif au fichier; `label` vaut l'`id` s'il est
absent. Une seule racine peut porter `default: true`, deux déclenchent une erreur; sans aucun
défaut, la première racine déclarée est retenue. Une racine marquée `egress: local-only` retient ses
ressources vis-à-vis d'un modèle distant sur les chemins que BASE médie (serveur MCP, chat du
Studio, évaluation).

Les commandes ciblent une racine avec `--workspace <fichier> --root-id <id>`. Passé hors d'un
workspace, `--root-id` est ignoré et la commande le dit. Seul `route` cherche en plus entre toutes
les racines déclarées quand `--root-id` est omis; les autres commandes retiennent la racine par
défaut. Le routage traverse les racines, chaque action reste confinée à celle qui a été choisie.

Le coût du workspace: un fichier de plus à tenir à jour, et un identifiant à passer sur la plupart
des commandes. Le coût de la racine unique: un seul périmètre d'écriture pour tout le monde. Si un
dossier contient déjà au moins deux BASE en sous-dossiers directs, `base init` propose le
`base.workspace.json` qui les réunit.

## Ce qui entre dans le versionnage

Dans un dossier neuf, `base init` écrit un `.gitignore` qui tient les données locales hors du dépôt
partagé:

```text
.ai/trace/
.ai/changes/
.ai/feedback/
.ai/studio.settings.json
base.manifest.json
```

Chaque ligne répond à une raison précise. `.ai/trace/` est le journal d'exploitation de la machine.
`.ai/changes/` contient des propositions en attente, dont le contenu peut viser un fichier
confidentiel. `.ai/feedback/` est la pile de terrain. `.ai/studio.settings.json` porte des réglages
de poste. `base.manifest.json` est un produit de construction, régénéré par `base index`: le suivre
en version fait diverger chaque machine sur un fichier que personne ne lit à la main.

Ce fichier est créé une fois, jamais complété ensuite: un `.gitignore` existant est respecté tel
quel. Deux lignes restent à trancher par l'équipe.

**Les frictions: locales ou partagées.** Retirez `.ai/feedback/` du `.gitignore` et la pile devient
commune: chacun voit les mêmes frictions ouvertes, `base doctor` les compte de la même façon sur
toutes les machines, et une demande que le routeur n'a pas su servir se discute sur pièce. Le prix
est que ces fichiers contiennent le texte des demandes, y compris les abstentions journalisées dans
`abstentions.jsonl`: une question posée par une personne, parfois avec un nom de client dedans,
entre alors dans le dépôt et dans ses sauvegardes. En la gardant ignorée, chaque poste ne voit que
sa propre pile, et la remontée se fait à la main.

**Les cartes générées: suivies ou ignorées.** L'index de routage (`.ai/routing/index.md` et les
index par agent) n'est pas ignoré par défaut. Suivi en version, il se relit en diff comme le reste,
et un clone route correctement sans rien lancer; le prix est un conflit de fusion chaque fois que
deux personnes ajoutent un process, sur un fichier que personne n'écrit à la main. Ignoré, le
conflit disparaît, et chacun lance `base build routing-index --write` après un `git pull` pour que
sa carte dise l'état du jour. Dans les deux cas, la vérité vit dans les `use_when`; la carte en est
la projection.

## Fins de ligne et gros fichiers

Quand le dossier est un dépôt git, `base init` propose aussi un `.gitattributes`:

```text
* text=auto
*.sh text eol=lf
*.py text eol=lf
*.mjs text eol=lf
```

Sans cela, un même process lu sous Windows et sous macOS produit un diff entier que personne n'a
provoqué, et la relecture devient impraticable. Les scripts restent en LF parce qu'un shebang en
CRLF ne s'exécute pas.

Git LFS n'y figure jamais, et ce silence est délibéré: un motif LFS casse le clone sur une machine
où `git lfs` est absent, et l'échec est silencieux, jusqu'au jour où quelqu'un ouvre un fichier qui
semble vide. Si votre corpus porte des binaires lourds (PDF scannés, images, jeux de données),
l'activation est une décision explicite: vérifiez `git lfs version` sur chaque poste et chez votre
hébergeur avant d'ajouter le moindre motif, puis documentez l'installation dans votre README. Les
commandes exactes et les quotas dépendent de votre hébergeur, consultez sa documentation. L'autre
voie est de garder ces fichiers hors du dépôt, ou hors de l'inventaire avec `inventory.exclude` dans
`base.config.json` quand ils vivent dans le dossier sans devoir router.

## Rester en phase à plusieurs

Trois commandes se lancent avant de proposer un changement à la branche partagée.

- `base validate` vérifie la conformité des fiches et signale les pièges de formulation, dont une
  fiche dont un `routing.examples` est écarté par son propre «éviter si».
- `base doctor` rend la santé du corpus: liens morts, ressources orphelines, déclarations `may_use`
  ou `requires` qui ne mènent à rien, relectures échues, frictions ouvertes, restes de gabarit.
- `base route-test` rejoue vos fixtures (`.ai/routing/route-tests.json`) et les `routing.examples`
  déclarés, et affiche les deux nombres séparément. Par défaut, il vérifie la stratégie lexicale avec
  les rankers de `base.config`. Si la Voie 2 est active, rejouez aussi
  `base route-test --strategy production`: ce run appelle les modèles et ne convient pas à un
  contrôle déterministe de CI. `base route-test --scaffold` rédige un premier fichier quand il
  n'existe pas.

Faire passer ces trois commandes dans le pipeline de votre hébergeur est possible; la configuration
exacte relève de sa documentation.

Reste le cas du dossier créé par une version antérieure du cadre. `base upgrade` affiche la
différence entre ce qu'il porte et ce que `base init` lui donnerait aujourd'hui; `--write` applique.
La commande crée, ajoute une ligne, ou réécrit la configuration JSON de BASE, et ne supprime jamais
rien: ce qui est devenu inutile, par exemple quatre points d'entrée d'outils quand un seul est lu,
est nommé dans la sortie et vous décidez.

## À décider une fois

1. La forme du handle: identifiant court, ou identifiant dérivé du nom.
2. Une racine unique, ou un workspace avec des racines déclarées.
3. Les frictions de `.ai/feedback/`: locales à chaque poste, ou suivies en version.
4. Les cartes générées de `.ai/routing/`: suivies en version, ou ignorées et régénérées.
5. Git LFS: activé après vérification sur tous les postes, ou binaires tenus hors du dépôt.

Écrivez ces cinq réponses dans votre dossier, une phrase chacune. Une personne qui arrive dans
l'équipe les lit avant son premier commit.

---

BASE est un cadre porté par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec
[Innovaud](https://innovaud.ch).
