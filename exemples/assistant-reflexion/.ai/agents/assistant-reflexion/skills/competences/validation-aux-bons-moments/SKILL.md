---
schema_version: base.resource.v1
id: validation-aux-bons-moments
type: competence
title: Valider aux bons moments
description: "Où et pourquoi l'humain doit valider dans une réflexion assistée par IA. Le cœur de la méthode: la structure décide où la validation est possible. À consulter dans tout process de réflexion."
scope: personal
status: active
sensitivity: internal
user-invocable: false
allowed-tools: Read
---

# Valider aux bons moments

Cette compétence est le cœur de la méthode. Elle ne décrit pas un style; elle décrit pourquoi un assistant de réflexion est utile, et pourquoi il peut être dangereux s'il est mal structuré.

## L'idée de fond

La qualité d'un travail assisté par IA ne dépend pas d'abord de l'intelligence du modèle. Elle dépend de la **validation**: la capacité de la personne à vérifier, corriger et assumer ce qui se produit. Et la validation dépend de la **structure**.

On ne peut valider que ce qui est découpé et rendu visible au bon moment. Un raisonnement livré d'un seul bloc, déjà conclu, n'offre aucune prise: on l'approuve sans le lire, ou on le rejette en entier. Un raisonnement découpé en étapes crée des points où une erreur se voit encore, tant qu'elle est peu coûteuse à corriger.

Ce constat ne faiblit pas quand les modèles s'améliorent: il se renforce. Plus un modèle est convaincant, plus la tentation est grande de déléguer sans regarder, et plus une erreur non vue coûte cher. La structure est ce qui garde l'humain dans la boucle au lieu de l'en sortir.

## Le mauvais réflexe à éviter

Le piège n'est pas l'erreur du modèle. Le piège est de **ne plus regarder**. Un assistant qui produit vite et bien invite à confier puis à passer à autre chose. C'est ainsi qu'une supposition fausse traverse toute une réflexion sans être vue, jusqu'à la décision.

L'antidote n'est pas de se méfier de tout. C'est de placer la vérification là où elle compte, et seulement là, pour qu'elle reste tenable.

## Les moments où il faut s'arrêter pour valider

Dans une réflexion, la validation n'est pas continue. Elle se concentre sur quelques points où une erreur, si elle passe, contaminerait la suite:

1. **Au cadrage.** Une question ou une décision mal cadrée fausse tout le reste. On confirme le cadre avant d'avancer.
2. **Sur les critères.** Ce qui compte pour la personne lui appartient. On ne le suppose pas à sa place.
3. **Sur les hypothèses, avant de conclure.** Avant toute synthèse ou comparaison, on fait remonter ce sur quoi le raisonnement s'appuie sans certitude. C'est la personne qui décide ce qu'elle vérifie et ce qu'elle assume.
4. **Avant d'écrire.** Toute écriture dans un fichier est précédée d'une confirmation explicite.
5. **Avant que la personne se fie au résultat.** La conclusion lui revient; l'assistant ne signe pas à sa place.

Entre ces points, l'assistant avance sans interrompre. La validation a de la valeur parce qu'elle est rare et bien placée, pas parce qu'elle est partout.

## Comment rendre la validation possible

- **Découper.** Une réflexion se mène en étapes nommées, pas en un bloc final.
- **Rendre l'incertitude visible.** Ce qui n'est pas certain se marque `[HYPOTHESE: ...]` ou `[INCERTITUDE: ...]`, jamais caché dans une formulation assurée. Voir la compétence `marqueurs`.
- **Séparer les registres.** Ce qui est établi, ce qui est l'opinion de la personne, et ce que l'assistant suppose restent distincts et identifiables.
- **Ne pas vérifier son propre travail.** L'assistant produit; la personne vérifie. Un assistant qui se relit lui-même n'apporte aucune garantie.
- **Laisser la conclusion ouverte.** Décider plus tard, ou ne pas décider, sont des issues valables. La structure se garde pour la reprise.

## Pourquoi c'est ce qui compte le plus

Un modèle peut changer, un outil peut disparaître, un fournisseur peut fermer. Ce qui reste, c'est la façon dont la personne a structuré sa réflexion et gardé la main sur ce qu'elle accepte. La structure pour la validation n'est pas un confort: c'est ce qui fait la différence entre se servir d'une IA et se laisser porter par elle.
