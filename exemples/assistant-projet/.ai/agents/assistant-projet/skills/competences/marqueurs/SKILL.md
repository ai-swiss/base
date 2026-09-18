---
name: marqueurs
description: "Conventions de marqueurs pour rendre l'état du travail cherchable et traçable dans les documents générés. À consulter lors de la rédaction de documents."
user-invocable: false
allowed-tools: Read
---

# Marqueurs

Conventions pour rendre l'état du travail observable directement dans les fichiers. Les marqueurs sont du texte structuré, placé dans les documents générés (fiches projet, points d’avancement) et dans le journal. Ils ne sont jamais placés dans les fichiers du cadre (skills, AGENT.md).

Chaque marqueur correspond à une phase de la boucle de co-pensée (Cadrer → Confier → Évaluer → Ajuster).

## Les 4 marqueurs

| Marqueur | Phase | Quand l'utiliser |
|----------|-------|-----------------|
| `[A COMPLETER: champ]` | Cadrer | Une information manquante est nécessaire pour avancer. L'agent ou l'utilisateur devra la fournir. |
| `[A VALIDER: description]` | Confier | L'agent propose quelque chose qui n'a pas encore été confirmé par l'utilisateur. |
| `[ATTENTION: description]` | Évaluer | Un risque, une incohérence ou une alerte que l'utilisateur devrait examiner. |
| `[DECISION: choix \| raison]` | Ajuster | Un choix a été confirmé par l'utilisateur. Enregistré pour traçabilité. |

## Exemples concrets

**[A COMPLETER]** - information manquante:
```
[A COMPLETER: responsable du jalon]
```

**[A VALIDER]** - proposition en attente:
```
[A VALIDER: priorité haute proposée pour la migration]
```

**[ATTENTION]** - alerte:
```
[ATTENTION: dépendance critique sans date confirmée]
```

**[DECISION]** - choix confirmé:
```
[DECISION: livrer en deux étapes | réduire le risque du déploiement]
```

## Forme enrichie de [DECISION]

La forme courante suffit dans la plupart des cas. Quand le choix a des conséquences importantes, la forme enrichie aide à retracer pourquoi il a été fait:

**Forme courante** (par défaut):
```
[DECISION: livrer en deux étapes | réduire le risque du déploiement]
```

**Forme enrichie** (enjeux élevés):
```
[DECISION: décaler le jalon au 15 octobre | dépendance fournisseur | Alternative: réduire le périmètre | Confiance: moyenne | Conséquence si erreur: lancement retardé]
```

## Comment chercher les marqueurs

Pour retrouver tous les éléments en attente dans un projet:
- `[A VALIDER]` → éléments en attente de confirmation
- `[A COMPLETER]` → informations manquantes
- `[ATTENTION]` → alertes à examiner
- `[DECISION]` → historique des choix confirmés

## Règles d'usage

- Les marqueurs vivent dans les **documents générés** (devis, fiches clients, rapports) et dans le **journal**
- Ils ne sont **jamais** placés dans les fichiers du cadre (AGENT.md, SKILL.md, templates)
- Un marqueur `[A VALIDER]` devient `[DECISION]` quand l'utilisateur confirme
- Un marqueur `[A COMPLETER]` disparaît quand l'information est fournie
- Un marqueur `[ATTENTION]` reste tant que le risque n'a pas été traité
