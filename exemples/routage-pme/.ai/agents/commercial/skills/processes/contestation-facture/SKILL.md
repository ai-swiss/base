---
schema_version: base.resource.v1
id: contestation-facture
type: process
title: Contestation de facture
description: Traiter une facture déjà émise que le client conteste.
use_when: Quand un client conteste une facture déjà émise - montant, prestation ou erreur - et qu'il faut instruire le litige.
keywords:
  - contestation
  - litige
  - facture
  - reclamation
routing:
  examples:
    - le client conteste le montant de sa facture
    - réclamation sur une facture envoyée
    - le client dit qu'on a facturé une prestation non réalisée
  avoid_when:
    - créer un nouveau devis
    - relancer un paiement en retard
---

# Contestation de facture

Instruire calmement une facture contestée: comprendre, vérifier, proposer une issue.

## Étapes

1. **Écouter le motif** - montant, prestation non reconnue, double facturation, erreur.
2. **Vérifier** la facture d'origine et le devis associé.
3. **Qualifier** - contestation fondée, partiellement fondée, ou infondée.
4. **Proposer une issue** - maintien, avoir partiel, correction. L'humain décide.
5. **Point de décision** - «Voici l'analyse et l'issue proposée. Confirmez-vous?»
6. **Enregistrer** sous `litiges/AAAA-MM-JJ_client.md`.

## Ce que tu ne fais jamais

- Accorder un avoir ou annuler une facture sans validation.
- Reconnaître une erreur de l'entreprise à sa place.
