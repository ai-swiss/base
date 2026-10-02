---
schema_version: base.resource.v1
id: decision-partir-de-ce-que-vous-avez
type: document
title: Une seule porte d'entrée regarde, juge et propose avant toute écriture
description: "«Adopter ce dossier» devient la porte «Partir de ce que vous avez»: elle reconnaît le point de départ, applique la méthode de co-pensée à chaque tâche et rend une fiche de proposition en mots simples; Diagnostic, Créer un agent et Importer l'existant gardent chacun un rôle unique."
scope: public
status: active
sensitivity: public
doc_role: decision
audience: [developer, maintainer]
learning_level: advanced
related: [decisions-index, pratiques-co-pensee]
---

# Une seule porte d'entrée regarde, juge et propose avant toute écriture

## Status

Accepted.

## Context

Jusqu'en 1.5.0, chaque process d'entrée supposait son point de départ: `diagnostic` et
`creer-agent` partaient d'une conversation sans document, `importer-l-existant` de procédures
écrites, `adopter-ce-dossier` d'un dossier de documents. Aucun ne prenait un document qui décrit
des besoins (un transcript d'entretien, un compte rendu), alors que c'est l'usage le plus courant:
on donne la discussion à l'outil et on lui demande ce que l'IA pourrait faire. Le
routeur envoyait cette demande vers `diagnostic`, qui ignorait le document et reposait ses
questions. `importer-l-existant` et `adopter-ce-dossier` fabriquaient chacun leur fiche de
décision, et cette fiche tranchait la structure (outil, dépôt, égress) devant des personnes qui
voulaient d'abord savoir ce que l'assistant ferait pour elles. La grille de faisabilité vivait
dans `diagnostic` et n'atteignait jamais une fiche.

Forces en tension: ne rien écrire avant un accord lisible (gate propose → commit), parler le
langage du métier et non celui du cadre, garder un process par rôle, et appliquer la méthode de
co-pensée sans la transformer en renvois.

## Decision

`adopter-ce-dossier` garde son identifiant et devient la porte «Partir de ce que vous avez». Elle
reconnaît le point de départ (des besoins décrits, des documents de travail, une structure déjà
pensée pour l'IA, rien), lit et classe, juge chaque tâche avec la compétence partagée
`faisabilite-ia` (qui déclare les deux pages de co-pensée et les fait lire en entier), puis rend
une fiche de proposition construite sur le modèle
`.ai/agents/concierge-base/templates/proposition.html`: ce que j'ai compris, les tâches (Oui, Plus
tard, Non) et deux choix pour démarrer, douze cartes en tout, d'autres idées, comment ce sera rangé,
ce qu'il ne fera jamais, ce que l'IA ne réglera pas. Cette fiche est distincte de la fiche de
décision (`decision-sheet.html`), qui continue de trancher des arbitrages sur une échelle de 1 à 5.
Avant l'export, la porte n'écrit que la fiche, sous `.temp/`. Après l'export, elle passe la main: `creer-agent`
construit à partir du plan tiré de l'export, `importer-l-existant` convertit à partir de la carte
d'import tirée de l'export, `ameliorer-agent` ajoute les tâches acceptées à un BASE en service, `diagnostic` fait
parler quand il n'y a rien et revient à la porte avec ses notes. Les réglages techniques forment
une seconde fiche, facultative, avec `fiche-de-decision`.

## Consequences

- Une personne qui ne connaît rien à l'IA reçoit une fiche dans ses mots, et rien ne s'écrit dans
  son dossier avant son retour. Une demande comme «voici notre discussion, montre-moi ce que
  l'IA ferait» atteint la porte, ce que `route-tests.json` vérifie.
- `diagnostic` ne juge plus les tâches et ne saute plus à la construction; `importer-l-existant` n'explore plus de son côté
  quand une fiche a été remplie; `creer-agent` accepte le plan tiré de l'export comme approuvé.
- Deux modèles de fiche à faire vivre, avec un test de conformité chacun. Les mots du cadre et
  la méthode sont interdits dans la fiche de proposition; un parcours réel
  (`tools/eval/parcours-partir-de-l-existant.mjs`) le vérifie sur quatre corpus avant une release.

## Alternatives considered

| Option | Verdict | Why |
|---|---|---|
| Un nouveau process `partir-des-besoins` à côté d'`adopter-ce-dossier` | Rejected | Deux portes pour la même fiche, et une question de plus pour le routeur; la combinaison discussion + procédures, fréquente, n'aurait pas eu de porte. |
| Étendre `diagnostic` pour lire un document | Rejected | `diagnostic` fait parler quand il n'y a rien et rend ses notes à la porte; lui faire lire des documents en aurait fait une seconde porte, avec son propre jugement. |
| Étendre `creer-agent` pour accepter un transcript | Rejected | `creer-agent` crée; la personne veut voir avant que quoi que ce soit s'écrive. |
| Un seul modèle de fiche avec un mode «échelle» et un mode «Oui, Plus tard, Non» | Rejected | Trancher des arbitrages et dire à un métier ce que l'IA fera sont deux documents; les fusionner aurait rendu le second technique. |
| Citer dans la compétence les principes de co-pensée par numéro | Rejected | La méthode se lit en entier et s'applique; des renvois numérotés n'aident pas l'assistant et finiraient dans la fiche. |
