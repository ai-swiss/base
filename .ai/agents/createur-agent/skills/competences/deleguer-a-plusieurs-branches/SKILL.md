---
schema_version: base.resource.v1
id: deleguer-a-plusieurs-branches
type: competence
title: Déléguer à plusieurs branches
description: Conditions à réunir avant de répartir un travail entre plusieurs branches parallèles, et lecture unique après la jonction.
scope: team
status: active
sensitivity: internal
user-invocable: false
allowed-tools: Read
---

# Déléguer à plusieurs branches

Un assistant peut répartir un travail entre plusieurs branches: plusieurs lectures menées de front,
plusieurs sous-tâches, plusieurs agents. Cette compétence décrit ce qui rend une telle répartition
sûre. Découper n'améliore rien en soi; ce sont les cinq conditions ci-dessous qui rendent le
découpage tenable.

Exemple suivi d'un bout à l'autre: un atelier doit préparer trois devis pour trois clients, à partir
d'un même barème de prix.

## 1. Rester ensemble par défaut

Le travail reste sur une seule branche tant qu'une raison de le découper ne s'impose pas. On découpe
seulement si les parties sont indépendantes par construction, c'est-à-dire si aucune branche n'a
besoin d'un résultat produit par une autre. Quand cette indépendance demande une démonstration, elle
n'est pas acquise.

Les trois devis s'adressent à trois clients différents et se chiffrent sur un barème figé. Aucun
devis n'a besoin du total d'un autre. La condition est remplie.

## 2. Le contrat partagé est un fichier

Le contrat dit ce que chaque branche doit produire, dans quelle forme, à partir de quelles
références, dans quels chemins elle peut écrire et quels contrôles elle doit réussir. Il existe comme
fichier avant que la première branche démarre, et chaque branche le lit en premier. Un contrat gardé
dans la conversation se perd au premier embranchement: une branche ne voit que ce qui lui a été
transmis.

Le contrat tient ici dans un fichier unique: le barème à utiliser, le gabarit de devis, la règle
d'arrondi, la devise. Les trois branches partent du même texte.

## 3. Périmètre d'écriture et retour déclarés

Avant de démarrer, une branche annonce les fichiers qu'elle a le droit d'écrire, puis ce qu'elle rend
et sous quelle forme. Deux branches autorisées à écrire le même fichier forment une seule branche.

Chaque retour adopte la même forme:

- état `ready_for_join` ou `blocked`;
- résultats produits et chemins modifiés;
- contrôles exécutés et résultats obtenus;
- sources utilisées;
- incertitudes restantes et décisions demandées.

Ce format est un contrat de transmission, pas un moteur d'orchestration. Le harnais choisi reste
responsable du démarrage, de l'attente et de l'arrêt des branches.

La première branche écrit `devis/client-a.md`, la deuxième `devis/client-b.md`, la troisième
`devis/client-c.md`. Chacune rend un tableau de lignes chiffrées et un total. Le barème reste en
lecture seule pour les trois.

## 4. Une lecture unique après la jonction

Quand les branches ont rendu, une passe lit l'ensemble des retours avant toute écriture et avant tout
commit. Elle autorise explicitement la prochaine action ou demande une décision. La jonction est
l'endroit où les contradictions deviennent visibles; personne d'autre ne les verra.

La lecture des trois devis montre que la pose a été chiffrée à deux tarifs différents, et que deux
devis engagent le même stock de matériau pour la même semaine. Chaque branche avait raison de son
côté.

## 5. Dire ce qu'une branche n'a pas pu faire

Une branche qui bute le signale dans son retour: la question restée sans réponse, la donnée
introuvable. Un retour vide est un résultat, à condition d'être annoncé comme tel. Une lacune passée
sous silence réapparaît dans le document final, sans signature.

La troisième branche n'a pas trouvé le tarif d'une prestation absente du barème. Elle rend son devis
avec `[A COMPLETER: tarif de la prestation de finition]` à la place d'un montant estimé.

## Quand ne pas déléguer

- Les parties écrivent dans le même fichier.
- La seconde moitié dépend du jugement porté dans la première.
- Le travail est assez court pour que la jonction coûte plus cher que le travail lui-même.

## Ce que tu ne fais jamais

- Découper un travail dont les dépendances n'ont pas été établies.
- Laisser une branche écrire dans le périmètre d'une autre, même pour corriger une erreur visible.
- Écrire ou committer un résultat avant la lecture de jonction.
- Traiter l'état `ready_for_join` comme une preuve de réussite sans lire les contrôles et les résultats.
- Combler soi-même ce qu'une branche a laissé vide sans le signaler à l'utilisateur.
