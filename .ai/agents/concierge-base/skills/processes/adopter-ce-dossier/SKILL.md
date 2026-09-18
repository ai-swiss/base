---
schema_version: base.resource.v1
id: adopter-ce-dossier
type: process
title: Adopter ce dossier
scope: team
status: active
sensitivity: internal
name: adopter-ce-dossier
description: "Examiner un dossier de documents qui n'est pas encore un BASE, puis construire une fiche d'évaluation que la personne remplit et renvoie. Rien ne s'écrit dans son dossier tant que la fiche n'est pas revenue."
use_when: Quand une personne a un dossier rempli de documents, sans base.config.json ni .ai/agents/, et veut savoir ce que BASE en ferait avant d'installer quoi que ce soit.
may_use:
  - fiche-de-decision
routing:
  examples:
    - J'ai un dossier plein de documents, qu'est-ce que BASE en ferait?
    - Regarde mon répertoire et propose-moi une structure
    - Je voudrais faire de ce dossier un BASE
    - Évalue mes fichiers avant d'installer quoi que ce soit
  avoid_when:
    - Mon assistant tourne déjà, dis-moi ce qui pourrait aller mieux dans mes process.
    - Relever les liens morts, les frictions ouvertes et les abstentions récurrentes d'un corpus déjà en service.
    - Consigner un dysfonctionnement précis qui vient de se produire.
    - Prépare, vérifie, audite ou publie un BASE existant avant de le partager avec une équipe.
argument-hint: "[le chemin du dossier à évaluer]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write
---

# Adopter ce dossier

Quelqu'un a un dossier rempli de documents et veut savoir ce que BASE en ferait. Ce process
regarde, puis propose. Il ne crée ni agent, ni process, ni configuration: il construit une fiche
d'évaluation que la personne remplit, et c'est son export qui déclenche la suite.

Il vise un dossier qui n'est pas encore un BASE: pas de `base.config.json`, pas de
`.ai/agents/<nom>/AGENT.md`. Quand ces fichiers existent, la demande relève de
`ameliorer-mes-process`.

## Étapes

### 1. Regarder avant de proposer

Lance `base init --root <dossier>` sans `--yes`. La commande dit de quelle sorte de dossier il
s'agit et affiche la liste exacte des fichiers qu'elle créerait, sans en écrire aucun. Cinq
réponses possibles: un workspace (il porte déjà `base.workspace.json`), un BASE (il porte
`.ai/agents/<nom>/AGENT.md`), une collection (deux sous-dossiers au moins sont eux-mêmes des BASE),
un dossier de documents, un dossier vide. Les deux derniers sont le terrain de ce process.

Puis lis le matériau. Relève quatre choses, chacune avec le chemin du fichier qui la porte.

- **Ce qui se suit**: étapes, checklist, mode d'emploi. Un process qui existe déjà sans le nom.
- **Ce qui s'apprend**: règles, conventions, terminologie, erreurs à éviter.
- **Ce qui se consulte**: barème, tarifs, annuaire, catalogue. Des données de référence, datées.
- **Ce qui n'a servi qu'une fois**: un compte rendu, un courrier, une note de séance.

Note le volume et les structures qui reviennent. Trente fichiers au même format valent un modèle
de document. Dix dossiers nommés pareil valent une convention à écrire une fois.

### 2. Construire la fiche d'évaluation

Suis `fiche-de-decision` et son modèle `../../../templates/decision-sheet.html`, copié sous
`.temp/{AAAA-MM-JJ}_adoption-{dossier}/`. N'invente pas un autre format.

Les cartes, dans cet ordre:

1. **Ce que BASE fera pour ce dossier**, en mots de tous les jours, sur une seule carte.
2. **Un process trouvé, une carte**: le fichier d'origine cité par son chemin, ce qu'il décrit,
   ce qu'il deviendrait.
3. **Un process proposé, une carte**: ce qui a été vu dans le dossier, et pourquoi cela mérite un
   mode d'emploi écrit.
4. **Un choix ouvert, une carte.** L'outil qui lira ce dossier (`--tool claude-code`, `cursor`,
   `agents-md` ou `autre`). La phrase qui décrit le travail (`--about`), qui devient la
   description du premier agent et son «Quand l'utiliser». Un dépôt git ou non: dans un dépôt,
   `base init` ajoute un `.gitattributes` qui fixe les fins de ligne. Les frictions locales ou
   partagées: le `.gitignore` écrit par `base init` tient `.ai/feedback/` hors du dépôt, une
   équipe qui veut les lire retire cette ligne. Une vue par métier: déclarée dans
   `base.config.json`, `base view <nom> --write` écrit `.ai/views/<nom>/` et ne copie rien. La
   route sémantique: le routage compare des mots par défaut, `routing.embedding_model` dans
   `.ai/studio.settings.json` et `base build routing-embeddings` y ajoutent un modèle, donc un
   appel de plus par demande.
   Ce qui ne doit jamais atteindre un modèle hébergé: les fiches concernées reçoivent
   `confidential: true`, et BASE les retient, dès que le modèle choisi est distant, sur
   les chemins qu'il sert lui-même (serveur MCP, chat, évaluations); un modèle installé sur la
   machine les lit normalement. Si tout le dossier est concerné, `egress: local-only` dans
   `base.config.json` le dit une fois (`base init --egress local-only` l'écrit à la création). Un
   outil d'IA qui ouvre les fichiers directement ne passe par aucun de ces chemins: face à lui, la
   limite est le dossier qu'on lui ouvre.
5. **Ce que BASE ne fera pas**: aucun fichier déplacé, aucun document réécrit, aucun contenu
   inventé, aucun envoi à un modèle qui dépasse les limites d'égress déclarées.

### 3. Écrire pour quelqu'un qui découvre BASE

Chaque mot du cadre s'explique dans la phrase qui l'emploie. Un process est un mode d'emploi que
l'assistant suit. Une compétence est ce qu'il doit savoir pour bien faire. Une vue est une porte
ouverte sur une partie du dossier. Un mot que la fiche n'explique pas n'entre pas dans la fiche.

### 4. Dire ce qui se passe à l'export

Écris-le sur la fiche, avant la première carte. La personne répond dans son navigateur, exporte un
fichier Markdown `..._decisions-filled.md`, et te le rend. Tu le lis. Alors seulement quelque
chose s'écrit: `base init` avec l'outil et la phrase retenus, puis le process
`importer-l-existant` que cette commande installe dans le dossier, une ressource à la fois, chaque
écriture proposée en diff et validée par la personne.

### 5. Ouvrir la fiche et attendre

La fiche est la seule chose que ce process écrit, et elle vit sous `.temp/`, ignoré par git. Le
dossier évalué reste intact jusqu'à l'export.

## Ce que tu ne fais jamais

- **Écrire dans le dossier évalué.** Ni `base init --yes`, ni un fichier posé à la main.
- **Proposer un process que rien dans le dossier ne justifie.** Chaque carte dit ce qu'elle a vu.
- **Confondre une trouvaille et une proposition.** La première cite son fichier, la seconde son motif.
- **Employer un mot que la fiche n'explique pas au même endroit.**
- **Trancher un choix ouvert.** Tu recommandes sur la carte, la personne décide.
