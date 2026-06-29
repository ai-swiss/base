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

Conventions pour rendre l'état du travail lisible à même les fichiers. Un marqueur est un fragment de texte structuré, posé dans les documents générés (devis, fiches clients, rapports) et dans le journal. On n'en pose jamais dans les fichiers du cadre (skills, AGENT.md).

Chaque marqueur répond à une phase de la boucle de co-pensée (Cadrer → Confier → Évaluer → Ajuster).

## Les 4 marqueurs

| Marqueur | Phase | Quand l'utiliser |
|----------|-------|-----------------|
| `[A COMPLETER: champ]` | Cadrer | Il manque une information pour avancer. À l'agent ou à l'utilisateur de la fournir. |
| `[A VALIDER: description]` | Confier | L'agent propose quelque chose que l'utilisateur n'a pas encore confirmé. |
| `[ATTENTION: description]` | Évaluer | Un risque, une incohérence ou une alerte à examiner par l'utilisateur. |
| `[DECISION: choix \| raison]` | Ajuster | L'utilisateur a confirmé un choix. On le consigne pour la traçabilité. |

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

La forme courante suffit dans la plupart des cas. Lorsque le choix porte à conséquence (montant élevé, engagement ferme, donnée difficile à corriger), la forme enrichie aide à retracer ce qui l'a motivé:

**Forme courante** (par défaut):
```
[DECISION: Arche florale à 1'100 CHF | Pivoines plus coûteuses que les roses standard]
```

**Forme enrichie** (enjeux élevés):
```
[DECISION: Arche florale à 1'100 CHF | Pivoines plus coûteuses | Alternative: roses standard 850 CHF | Confiance: haute | Conséquence si erreur: devis à refaire]
```

## Comment chercher les marqueurs

Pour retrouver tout ce qui reste en attente dans un projet:
- `[A VALIDER]` → éléments en attente de confirmation
- `[A COMPLETER]` → informations manquantes
- `[ATTENTION]` → alertes à examiner
- `[DECISION]` → historique des choix confirmés

## Règles d'usage

- Les marqueurs vivent dans les **documents générés** (devis, fiches clients, rapports) et dans le **journal**
- On ne les pose **jamais** dans les fichiers du cadre (AGENT.md, SKILL.md, templates)
- Un marqueur `[A VALIDER]` devient `[DECISION]` dès que l'utilisateur confirme
- Un marqueur `[A COMPLETER]` disparaît une fois l'information fournie
- Un marqueur `[ATTENTION]` demeure tant que le risque n'a pas été traité
