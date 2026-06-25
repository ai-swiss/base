---
schema_version: base.resource.v1
id: marqueurs
type: competence
title: Marqueurs
description: "Conventions de marqueurs pour rendre visibles les hypothèses, les incertitudes et les décisions dans une réflexion. À consulter lors de la rédaction de documents."
scope: personal
status: active
sensitivity: internal
user-invocable: false
allowed-tools: Read
---

# Marqueurs

Conventions pour rendre l'état d'une réflexion observable directement dans les fichiers. Les marqueurs sont du texte structuré, placé dans les réflexions enregistrées et dans le journal. Ils ne sont jamais placés dans les fichiers du framework (skills, AGENT.md).

Leur rôle est de rendre visible ce sur quoi un raisonnement s'appuie: ce qui est supposé, ce qui est incertain, ce qui attend confirmation, ce qui est décidé. C'est ce qui permet de valider aux bons moments (voir `validation-aux-bons-moments`).

## Les 4 marqueurs

| Marqueur | Quand l'utiliser |
|----------|-----------------|
| `[HYPOTHESE: description]` | Le raisonnement s'appuie sur une supposition non vérifiée. Rendue visible pour que la personne décide de la vérifier ou de l'assumer. |
| `[INCERTITUDE: description]` | Un point non tranché, à clarifier avant de conclure. |
| `[A VALIDER: description]` | L'assistant propose quelque chose qui n'a pas encore été confirmé par la personne. |
| `[DECISION: choix \| raison]` | Un choix que la personne a confirmé. Enregistré pour s'en souvenir. |

## Exemples concrets

**[HYPOTHESE]** - une supposition sur laquelle s'appuie le raisonnement:
```
[HYPOTHESE: le poste resterait ouvert jusqu'à la fin du mois]
[HYPOTHESE: mon budget mensuel ne changera pas cette année]
```

**[INCERTITUDE]** - un point à vérifier avant de conclure:
```
[INCERTITUDE: coût réel du déménagement, à estimer]
[INCERTITUDE: est-ce que cette formation est reconnue ?]
```

**[A VALIDER]** - proposition en attente de confirmation:
```
[A VALIDER: critère "proximité famille" plus important que "salaire" ?]
```

**[DECISION]** - choix confirmé:
```
[DECISION: accepter le poste | l'équipe et le sens priment sur le léger surcroît de trajet]
```

## Comment chercher les marqueurs

Pour retrouver l'état d'une réflexion:
- `[HYPOTHESE]` → ce sur quoi le raisonnement repose sans certitude
- `[INCERTITUDE]` → ce qu'il reste à vérifier
- `[A VALIDER]` → ce qui attend votre confirmation
- `[DECISION]` → les choix que vous avez confirmés

## Règles d'usage

- Les marqueurs vivent dans les **réflexions enregistrées** et dans le **journal**
- Ils ne sont **jamais** placés dans les fichiers du framework (AGENT.md, SKILL.md, templates)
- Un `[A VALIDER]` devient `[DECISION]` quand la personne confirme
- Une `[HYPOTHESE]` ou une `[INCERTITUDE]` disparaît quand elle est vérifiée, ou devient `[DECISION: ... | assumé sans vérifier]` si la personne choisit de l'assumer
- Une `[HYPOTHESE]` non résolue reste visible: c'est elle qui dira plus tard sur quoi la décision reposait
