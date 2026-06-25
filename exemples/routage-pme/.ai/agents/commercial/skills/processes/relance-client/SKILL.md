---
schema_version: base.resource.v1
id: relance-client
type: process
title: Relance client
description: Relancer un client pour un devis sans réponse ou une facture impayée.
use_when: Quand un devis reste sans réponse ou qu'une facture est en attente de paiement et qu'il faut relancer le client.
keywords:
  - relance
  - paiement
  - impaye
  - rappel
routing:
  examples:
    - relancer la facture impayée de Martin
    - le client n'a pas répondu à mon devis
    - envoyer un rappel de paiement
  avoid_when:
    - créer un nouveau devis
    - le client conteste le montant de sa facture
---

# Relance client

Relancer avec tact un devis sans suite ou un paiement en retard, sans dégrader la relation.

## Étapes

1. **Situer** - devis sans réponse, ou facture échue? Depuis quand?
2. **Choisir le ton** - premier rappel courtois, relance ferme, mise en demeure.
3. **Rédiger** le message de relance, en rappelant la référence et l'échéance.
4. **Point de décision** - «Voici la relance proposée. Je l'enregistre?»
5. **Enregistrer** sous `relances/AAAA-MM-JJ_client.md`.

## Ce que tu ne fais jamais

- Envoyer la relance à la place de l'utilisateur.
- Menacer de poursuites sans instruction explicite.
