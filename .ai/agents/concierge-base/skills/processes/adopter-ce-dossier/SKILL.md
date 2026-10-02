---
schema_version: base.resource.v1
id: adopter-ce-dossier
type: process
title: Partir de ce que vous avez
scope: team
status: active
sensitivity: internal
name: adopter-ce-dossier
description: "Regarder ce qu'une personne a déjà (une discussion sur ses besoins, des documents de travail, une structure déjà écrite pour l'IA, ou rien) et lui rendre une fiche de proposition en mots simples: les tâches qu'un assistant prendrait en charge, ses lignes rouges, les limites de l'IA, et deux choix pour démarrer. Rien ne s'écrit dans son dossier tant que la fiche n'est pas revenue."
use_when: Quand une personne montre ce qu'elle a (une discussion ou un compte rendu sur ses besoins, un dossier de documents, des procédures, un CLAUDE.md ou des règles déjà écrites pour l'IA) et veut voir ce qu'un assistant pourrait faire pour elle avant que quoi que ce soit s'écrive.
keywords:
  - discussion
  - compte rendu
  - entretien
  - besoins
  - transcript
  - documents
  - dossier
  - procédures
  - structure
  - CLAUDE.md
  - règles
  - proposer
  - montre-moi
  - fiche
requires:
  - ref: faisabilite-ia
    access: read
    purpose: juger pour chaque tâche ce que l'IA peut faire maintenant, plus tard ou jamais, et nommer ses limites
may_use:
  - fiche-de-decision
  - creer-agent
  - importer-l-existant
  - ameliorer-agent
  - diagnostic
routing:
  examples:
    - Voici le compte rendu de nos besoins, aide-moi à concevoir une structure de fichiers pour que l'IA y réponde
    - Voici le compte rendu de notre réunion, dis-moi ce que l'IA pourrait faire pour nous
    - Voici nos procédures, regarde ce que tu en ferais avant d'écrire quoi que ce soit
    - On a déjà un CLAUDE.md et des règles, regarde ce qu'on peut en faire
    - J'ai un dossier plein de documents, qu'est-ce que BASE en ferait?
    - Regarde mon répertoire et propose-moi une structure
    - Montre à mon équipe ce qu'un assistant pourrait faire ou non pour elle
    - Évalue mes fichiers avant d'installer quoi que ce soit
    - Voici mes réponses à la fiche de proposition
    - J'ai rempli la fiche de proposition, voici l'export
    - Here is what we have. Show me what an assistant could do for us.
  avoid_when:
    - Plan de création approuvé, construis-le maintenant.
    - Construis l'assistant avec mes réponses.
    - Carte d'import validée, convertis chaque ressource en diff.
    - Corpus déjà en service, liens morts, frictions ouvertes, abstentions récurrentes.
    - Consigner un dysfonctionnement précis survenu à l'instant.
    - Audit de publication: est-ce prêt à partager, sûr et maintenable.
argument-hint: "[le chemin du dossier, du transcript ou des documents à regarder]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write
---

# Partir de ce que vous avez

Une personne montre ce qu'elle a et veut savoir ce qu'un assistant ferait pour elle. Ce process regarde,
juge, puis propose: il construit une fiche de proposition que la personne lit, remplit et renvoie.
Il ne crée ni agent, ni process, ni configuration. C'est l'export de la fiche qui déclenche la
suite, et c'est un autre process qui l'exécute.

La personne ne connaît peut-être rien à l'IA. La fiche parle de son travail, avec ses mots.

## Étapes

Avant l'étape 1, pose les sept étapes dans la liste de tâches de l'outil; sans elle, annonce-les une
fois, avec les mots de la personne, puis coche-les au fil (compétence `journal`, Progression). Avant
l'export, seule la fiche s'écrit, pas même le journal.

### 1. Reconnaître le point de départ

Avant de lire, dis d'où la personne part. Lance `node <cadre BASE>/tools/base.mjs init --root <dossier>` sans `--yes` (ou `base init`, si la commande courte est installée): la
commande dit de quelle sorte de dossier il s'agit (workspace, BASE, collection, dossier de
documents, dossier vide) et n'écrit rien. Puis regarde les noms de fichiers et les premiers titres.
Quatre points de départ, qui se combinent souvent:

| Point de départ | Ce qui le signale | Ce qui suivra la fiche |
|---|---|---|
| **Des besoins décrits** | un transcript, un compte rendu, des notes d'entretien, un e-mail: des personnes qui parlent de leur travail, des irritants, des chiffres | `creer-agent`, avec le plan tiré de l'export |
| **Des documents de travail non pensés pour l'IA** | procédures, modes d'emploi, modèles de courrier, barèmes, annuaires, un wiki exporté | `importer-l-existant`, avec la carte d'import tirée de l'export |
| **Une structure déjà pensée pour l'IA** | `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/`, des prompts système, les instructions d'un GPT; ou un BASE (`base.config.json`, `.ai/agents/`) | `ameliorer-agent` si c'est un BASE; sinon `importer-l-existant`, la structure servant de source |
| **Rien** | un dossier vide, ou une phrase sans document | `diagnostic`, qui fait parler, puis revient ici avec ses notes |

Dis le point de départ en une phrase: «Vous me montrez une discussion sur vos besoins et un
classeur de procédures; je pars des deux.» Ne pose la question que si deux lectures restent
plausibles. S'il n'y a rien à regarder, passe à `diagnostic` sans fiche.

### 2. Lire et classer

Commence par un survol des métadonnées (noms, dossiers, premiers titres; `node .ai/base.mjs
discover "<besoin>" --root <dossier>` quand le dossier est déjà un BASE) et n'ouvre en entier que
ce qui compte. Sur un dossier volumineux, c'est la différence entre une lecture qui tient et un
contexte saturé avant la première proposition.

Dans ce que tu lis, relève, avec le fichier ou le passage qui le porte:

- **Ce qui se suit**: étapes, checklists, modes d'emploi, façons de faire racontées à l'oral.
- **Ce qui s'apprend**: règles, conventions, seuils, termes du métier, erreurs à éviter.
- **Ce qui se consulte**: barèmes, annuaires, listes, exports; note leur date.
- **Ce qui n'a servi qu'une fois**: un courrier, une note de séance.

Et, quand des personnes parlent de leurs besoins: les tâches qui reviennent, ce qui prend de
l'énergie, les règles dites à l'oral que personne n'a écrites, les lignes rouges posées («l'assistant
n'envoie rien», «jamais une donnée de santé dans un e-mail»), et ce qui a déjà coûté cher, avec les
chiffres.

Quand le dossier contient des règles déjà écrites pour l'IA (`CLAUDE.md`, règles Cursor, prompts),
range chacune dans l'un de trois bacs: ce qu'un modèle fait déjà de lui-même («sois poli»), qui ne
se recopie pas et que tu signales; ce qui est propre à la maison, qui se garde; ce dont un seul
manquement coûterait cher, en argent, en donnée qui sort ou en engagement envers un tiers («jamais un
code au téléphone»), qui devra recevoir un verrou. Dans la fiche, «Comment ce
sera rangé» dit ce qui est gardé et ce qui est retiré; le troisième bac va dans «Ce que l'assistant
ne fera jamais».

Note aussi ce qui manque: une liste tenue de mémoire, une personne qui part, une règle que
personne ne sait citer. Ces manques nourrissent les cartes «Plus tard» et «Ce que l'IA ne réglera pas».

### 3. Juger ce que l'IA peut faire

Applique `faisabilite-ia` à chaque tâche relevée: l'IA est-elle le bon choix, que faut-il encore,
jusqu'où déléguer. Lis d'abord, en entier, les deux pages de co-pensée que la compétence déclare,
même quand la personne attend une première réponse dans la conversation. Note le verdict (Oui, Plus
tard avec ce qui manque, Non) et ce qui reste humain, par le prénom ou le rôle de la personne qui
décide. Regroupe les tâches qui se suivent et écarte celles que rien dans le dossier ne justifie,
pour tenir dans les douze cartes de l'étape 4.

Avant de construire la fiche, relis chaque «Oui» contre les lignes rouges que la personne a posées:
un «Oui» qui en contredit une (des données de clients avant le choix de l'outil, un envoi sans
relecture) devient «Plus tard», avec ce qui manque, ou «Non».

Si la personne demande d'abord une présentation dans la conversation («commence par me présenter
les usages et la structure»), donne-la avec le même jugement (les tâches, leur verdict, qui décide,
ce que l'IA ne réglera pas), puis propose la fiche: c'est elle que l'équipe remplit.

### 4. Construire la fiche de proposition

Si la personne a dit de ne rien changer, présente d'abord la proposition dans la conversation et
demande avant d'écrire la fiche, même sous `.temp/`. Ne la range jamais ailleurs pour contourner sa
consigne.

Copie `../../../templates/proposition.html` vers
`.temp/{AAAA-MM-JJ}_{sujet}/{AAAA-MM-JJ}_{sujet}_proposition.html` dans le dossier de la personne,
celui qu'elle montre (jamais dans le cadre BASE ni dans un dossier temporaire du système), un
radical daté, unique par fiche. Tout ce qui se remplit est dans les constantes en tête du script,
rien d'autre ne se modifie dans la page: `LANG`, la langue de la personne (`fr`, `en`, `de` ou `it`), qui règle les
titres, les boutons et l'export; `STARTING_POINT`, le point de départ reconnu à l'étape 1, que
l'export reprend; puis le titre et l'intro dans ses mots, `STORAGE_KEY`
(`{AAAA-MM-JJ}_{sujet}_proposition`), `EXPORT_FILE` (`{AAAA-MM-JJ}_{sujet}_proposition-filled.md`),
puis le contenu. Les sections, dans cet ordre:

1. **Ce que j'ai compris** (`SUMMARY`): au plus quatre blocs de trois lignes, avec les chiffres
   et les faits de la personne.
2. **Les tâches** (`POINTS`, sous un titre de groupe pris dans `GROUPS`, par exemple «Ce que
   l'assistant fera pour vous»): une carte par tâche; avec
   les deux choix, douze cartes au plus. Le titre est un verbe. Deux phrases de contexte. La
   recommandation commence par le verdict et dit qui décide; `verdict` (`oui`, `plus-tard`, `non`)
   porte la même réponse, celle que «Tout accepter» applique. Une carte «Plus tard» dit ce qui
   manque. Une idée que personne n'a demandée porte `beyond: true`.
3. **Deux choix pour démarrer** (cartes à `options`, sous leur propre titre de groupe): comment organiser l'assistant (par moment de
   travail, par personne, par service) et par où commencer. Une option recommandée par carte.
4. **D'autres idées** (`MORE_IDEAS`): une ligne par idée regroupée ou écartée, sans bouton.
   Rien si tout tient dans les cartes.
5. **Comment ce sera rangé** (`STRUCTURE`): la structure proposée en mots de tous les jours: tant de
   modes d'emploi, tant de règles écrites une fois, les listes telles qu'elles sortent du logiciel,
   des modèles, des petits outils qui calculent toujours pareil.
6. **Ce que l'assistant ne fera jamais** (`NEVER`): les lignes rouges de la personne, et celles
   que la méthode impose.
7. **Ce que l'IA ne réglera pas** (`LIMITS`): chaque ligne cite un fait du dossier.

Ce qui n'entre pas dans cette fiche: l'outil qui lira le dossier, le dépôt git, les frictions
partagées, les vues, le routage sémantique, la confidentialité et l'égress. Ces réglages viennent
après l'export, à l'étape 6.

Les mots du cadre n'entrent pas non plus: relis la fiche une fois pour traquer ceux que liste
`faisabilite-ia`, et remplace chacun par ce qu'il veut dire pour la personne.

### 5. Ouvrir la fiche et attendre

La fiche vit sous `.temp/`. Si le dossier est suivi par git et que `.temp/` n'y est pas ignoré,
dis-le à la personne: la fiche reprend des faits de ses documents. Dis-lui ensuite ce qui se passe: elle répond
dans son navigateur, exporte un fichier `..._proposition-filled.md`, et te le rend. Le dossier
reste intact jusque-là.

### 6. Lire l'export et passer la main

Lis l'export: il reprend le point de départ et les réponses. Si la personne répond dans la
conversation plutôt que par l'export, ses réponses valent l'export. Applique là où elle dit Oui,
note ce qu'elle reporte à plus tard avec sa nuance, retire ce qu'elle refuse. Là où elle n'a pas
répondu, la recommandation que l'export rappelle s'applique, comme la fiche le lui annonce: dis-le
carte par carte dans le plan, avant de construire. Les lignes rouges que l'export reprend entrent
telles quelles dans l'assistant. Ses réponses valent accord
pour construire; aucun commit git ne se fait à sa place.
Puis passe la main selon le point de départ:

- **Des besoins décrits**: écris, à partir de l'export, le plan que `creer-agent` accepte comme
  approuvé: la mission de l'assistant, le premier travail, les connaissances à utiliser, le
  résultat attendu, les décisions humaines. Le premier travail est celui que la personne a choisi
  pour démarrer; les autres «Oui» suivent dans le plan, dans son ordre, et ce qui dépasse ce que
  `creer-agent` construit d'un coup reste noté pour la suite. Propose-le en une page; `creer-agent`
  construit sans redemander l'accord.
- **Des documents de travail**: écris `import-carte.md` à la racine du dossier, une ligne par
  document retenu (source, ce qu'il devient, pour qui), et passe à `importer-l-existant` à sa
  conversion.
- **Une structure déjà pensée pour l'IA**: si c'est un BASE, `ameliorer-agent`, qui ajoute à
  l'agent existant les tâches acceptées; sinon, `importer-l-existant` avec la structure comme
  première source.
- **Des points de départ combinés** (une discussion et des procédures, par exemple): écris d'abord
  le plan, puis la carte d'import des seuls documents que ce plan utilise.
- **Les réglages**, quand ils ont du sens (une équipe, un dépôt partagé, des données sensibles):
  une seconde fiche, avec `fiche-de-decision`, pour l'outil qui lira le dossier, le dépôt git et
  ses fins de ligne, les frictions locales ou partagées, une vue par métier, le routage sémantique,
  ce qui ne doit jamais atteindre un modèle hébergé (`confidential: true`, `egress: local-only`).
  Pour une personne seule avec un seul outil, applique les valeurs par défaut de `base init` et
  dis-le en une ligne.

### 7. Journal

Après l'export, quand le dossier a un `.ai/journal/`, écris une entrée selon la compétence
`journal`: le point de départ reconnu, le chemin de la fiche, ce que la personne a répondu et le
process qui a pris la main.

## Dans un chat, sans dossier

Tu lis peut-être cette porte depuis le web, dans un chat d'IA où la personne a joint ses documents,
sans dossier ni terminal. Le jugement et la fiche restent les mêmes; seuls les
gestes changent:

- **Étape 1**: pas de `base init`. Dis le point de départ d'après les documents joints.
- **Étape 4**: rends la fiche comme une page HTML autonome, que la personne ouvre dans son
  navigateur: un artefact, un canevas ou un fichier à télécharger, selon ce que l'outil permet. Pars
  du modèle de la fiche, annexé au fichier d'entrée de BASE pour les chats, et ne remplis que ses
  constantes. Si tu ne peux pas le lire en entier, écris une page qui garde ses
  sections, les trois réponses par carte, «D'autres idées» et le format d'export ci-dessous.
- **Étape 5**: dis à la personne d'ouvrir la page, de répondre, puis de joindre ici le fichier que
  «Envoyer mes réponses» télécharge.
- **Étape 6**: tire le plan de ses réponses. Construire l'assistant demande un outil d'IA qui ouvre
  un dossier: dis-le, et donne la suite en une phrase: ouvrir un dossier
  avec BASE et y confier l'export.
- **Étape 7**: pas de journal.

Dans un chat, tout repose sur des consignes: ni verrou, ni écriture validée. Si la personne
s'apprête à joindre des données de personnes réelles, rappelle-lui qu'elles partent chez le
fournisseur du chat.

Le format d'export, une section par carte, que l'étape 6 relit:

```markdown
Point de départ: des besoins décrits

### P1 · Titre de la carte
- Recommandation: la recommandation, en une phrase
- Réponse: Oui | Plus tard | Non | non répondu (la recommandation s'applique: Oui)
- Nuance: la nuance de la personne | aucune

## Ce que l'assistant ne fera jamais

- une ligne rouge par ligne
```

## Preuves pour conclure

- Le point de départ a été dit en une phrase avant de lire les documents en entier.
- Avant l'export, un seul fichier a été écrit, sous `.temp/`, suffixé `_proposition.html`.
- La fiche contient ses sections, douze cartes au plus, «D'autres idées» pour ce qui a été
  regroupé ou écarté, et aucun mot du cadre.
- Chaque ligne de «Ce que l'IA ne réglera pas» cite un fait du dossier.

## Ce que tu ne fais jamais

- **Écrire dans le dossier évalué avant l'export**, hors la fiche: ni `base init --yes`, ni un fichier posé à la main.
- **Proposer une tâche que rien dans le dossier ne justifie.** Chaque carte dit ce qu'elle a vu.
- **Promettre un temps gagné ou des erreurs évitées** avant un essai mesuré.
- **Employer un mot du cadre dans la fiche**, ou nommer la méthode: elle se voit dans la justesse de la fiche.
- **Trancher un choix à la place de la personne.** Tu recommandes sur la carte, elle décide.
