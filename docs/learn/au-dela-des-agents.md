---
schema_version: base.resource.v1
id: au-dela-des-agents
type: document
title: "Au-delà des agents"
description: Organiser le travail selon l'intention et les dépendances plutôt que selon un nombre d'agents fixé d'avance.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [intention, agents, assistant, dependances, contexte, parallelisme]
audience: [beginner, decision-maker, builder]
learning_level: beginner
---

# Au-delà des agents

La première question n'est pas «combien d'agents?» ni «quel domaine doit recevoir la demande?», mais «quel résultat cherchons-nous, et qu'est-ce qui devient pertinent pour l'obtenir?». Une demande sérieuse révèle parfois ses sources en cours d'analyse: une clause rend un incident pertinent, l'incident rappelle une promesse, puis cette promesse change la décision.

Les définitions d'**agent** et d'**assistant** sont fixées dans le [glossaire](../reference/glossaire.md). Ici, «plusieurs exécutions» désigne seulement plusieurs traitements menés séparément, quel que soit le vocabulaire de l'outil.

## Un point d'accès par intention, pas une multitude d'agents {#un-point-d-acces-par-intention}

Dans BASE, un agent est un point d'entrée, pas une boîte dans laquelle enfermer un domaine. À partir de l'intention, le modèle lit une carte, choisit une procédure ou s'abstient, puis consulte les connaissances et les sources que cette procédure désigne. Une question factuelle peut aussi conduire directement au passage qui y répond.

Le savoir et le savoir-faire restent ainsi structurés et adressables sans être répartis d'avance entre une équipe d'agents. Une demande peut traverser contrat, support, finance et feuille de route dans un même fil si ces éléments se révèlent mutuellement. Seule la part utile devient active; le reste demeure disponible sans saturer le contexte.

Cette organisation ne garantit ni que le modèle choisira toujours le bon chemin, ni qu'il découvrira toute relation pertinente. Elle évite toutefois de transformer un organigramme supposé en frontière du raisonnement.

## Le critère de séparation: un seul fil ou plusieurs traitements parallèles {#le-critere-de-separation}

Gardez un même fil lorsque chaque découverte peut changer ce que les autres parties doivent chercher ou conclure. Séparez lorsque les parties:

- disposent de leurs entrées dès le départ;
- peuvent avancer indépendamment;
- rendent un résultat court et défini;
- peuvent être réunies par un contrôle explicite.

Plusieurs exécutions peuvent réduire la durée totale dans certains environnements. Elles ajoutent aussi de la coordination et ne produisent pas, à elles seules, une meilleure compréhension.

Avant de séparer les contextes, réduisez ce que chaque exécution doit décider. Demander un résultat borné peut suffire lorsque les parties ont peu à accorder entre elles. Si elles partagent de nombreuses contraintes, il faut aussi répartir le contexte et prévoir explicitement leur réconciliation.

Il n'existe pas de règle universelle selon laquelle davantage de contexte ou davantage de tâches dégrade toujours un modèle. La forme utile dépend du travail, du modèle et du contrôle attendu. Une organisation doit donc rester révisable lorsque la demande révèle de nouvelles dépendances.

## Quatre formes de demande

| Demande | Organisation utile |
| --- | --- |
| Préparer une facture à partir d'un contrat et d'un barème connus | Un flux borné, suivi de la validation du montant et de l'écriture comptable |
| Préparer quarante relevés selon la même procédure | Des traitements indépendants, puis un contrôle et une réunion des résultats |
| Calculer le total de cinq cents factures | Des lots et des sous-totaux réunis à la fin; le système comptable reste la source faisant foi |
| Évaluer le renouvellement d'un contrat | Une exploration dans un fil commun: chaque constat détermine la source suivante, puis les éléments sont appréciés ensemble |

Ces formes décrivent le calcul, pas l'autorisation d'agir. Un contrat définit des obligations entre ses parties; il ne bloque pas techniquement une lecture, une écriture ou une transmission. Seuls les mécanismes présents sur le chemin appliquent les permissions et la politique de données.

## Ce que BASE apporte

BASE rend les rôles, les procédures, les connaissances et les sources accessibles depuis l'intention qui les mobilise. Il peut aider à orienter une demande, mais ne garantit pas toujours le bon choix et ne coordonne pas lui-même une équipe d'exécutions.

Une modification passant par l'écriture médiée BASE est montrée avant application. Un outil qui écrit directement dans les fichiers contourne ce contrôle. Il en va de même pour l'egress: les retenues du broker protègent les chemins qui passent par lui, non les accès directs. Voir [Souveraineté et confiance](../trust/souverainete-et-confiance.md) et [Sécurité et limites](../trust/securite-et-limites.md).

Conserver les sources et les façons de faire dans des fichiers facilite leur transfert, sans garantir une exécution identique ailleurs. Un autre environnement peut exiger des adaptateurs, des permissions et des tests.

## Prochaine action

Prenez une demande actuelle et dessinez ses dépendances. Ne séparez que les branches dont les entrées sont connues, qui ne se modifient pas mutuellement et qui rendent un résultat contrôlable.
