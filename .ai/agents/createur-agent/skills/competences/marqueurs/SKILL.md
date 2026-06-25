---
schema_version: base.resource.v1
id: marqueurs
type: competence
title: Marqueurs
description: Conventions de marqueurs pour rendre l'état du travail cherchable et traçable dans les documents générés.
scope: team
status: active
sensitivity: internal
user-invocable: false
allowed-tools: Read
---

# Marqueurs

Conventions pour rendre l'état du travail observable directement dans les fichiers. Les marqueurs sont du texte structuré, placé dans les documents générés (devis, fiches clients, rapports) et dans le journal. Ils ne sont jamais placés dans les fichiers du framework (skills, AGENT.md).

Chaque marqueur correspond à une phase de la boucle de co-pensée (Cadrer → Confier → Évaluer → Ajuster).

## Les 4 marqueurs

| Marqueur | Phase | Quand l'utiliser |
|----------|-------|-----------------|
| `[A COMPLETER: champ]` | Cadrer | Une information manquante est nécessaire pour avancer. L'agent ou l'utilisateur devra la fournir. |
| `[A VALIDER: description]` | Confier | L'agent propose quelque chose qui n'a pas encore été confirmé par l'utilisateur. |
| `[ATTENTION: description]` | Évaluer | Un risque, une incohérence ou une alerte que l'utilisateur devrait examiner. |
| `[DECISION: choix \| raison]` | Ajuster | Un choix a été confirmé par l'utilisateur. Enregistré pour traçabilité. |

## Exemples concrets

**[A COMPLETER]**, information manquante:
```
- **TVA :** [A COMPLETER: numéro IDE si assujetti]
- **Email :** [A COMPLETER]
```

**[A VALIDER]**, proposition en attente:
```
[A VALIDER: Prix unitaire estimé à 150 CHF/h d'après le catalogue]
[A VALIDER: Délai de livraison 3 semaines à confirmer avec le fournisseur]
```

**[ATTENTION]**, alerte:
```
[ATTENTION: Montant supérieur à 10'000 CHF, conditions de paiement à vérifier]
[ATTENTION: Numéro TVA toujours manquant dans la fiche entreprise]
```

**[DECISION]**, choix confirmé:
```
[DECISION: Remise de 10% | Client fidèle depuis 2 ans]
[DECISION: Arche florale à 1'100 CHF | Pivoines plus coûteuses que les roses standard]
```

## Forme enrichie de [DECISION]

La forme courante suffit dans la plupart des cas. Quand le choix a des conséquences importantes (montant élevé, engagement ferme, donnée difficile à corriger), la forme enrichie aide à retracer pourquoi le choix a été fait:

**Forme courante** (par défaut):
```
[DECISION: Arche florale à 1'100 CHF | Pivoines plus coûteuses que les roses standard]
```

**Forme enrichie** (enjeux élevés):
```
[DECISION: Arche florale à 1'100 CHF | Pivoines plus coûteuses | Alternative: roses standard 850 CHF | Confiance: haute | Conséquence si erreur: devis à refaire]
```

## Comment chercher les marqueurs

Pour retrouver tous les éléments en attente dans un projet:
- `[A VALIDER]` → éléments en attente de confirmation
- `[A COMPLETER]` → informations manquantes
- `[ATTENTION]` → alertes à examiner
- `[DECISION]` → historique des choix confirmés

## Règles d'usage

- Les marqueurs vivent dans les **documents générés** (devis, fiches clients, rapports) et dans le **journal**
- Ils ne sont **jamais** placés dans les fichiers du framework (AGENT.md, SKILL.md, templates)
- Un marqueur `[A VALIDER]` devient `[DECISION]` quand l'utilisateur confirme
- Un marqueur `[A COMPLETER]` disparaît quand l'information est fournie
- Un marqueur `[ATTENTION]` reste tant que le risque n'a pas été traité
