---
schema_version: base.resource.v1
id: nouveau-devis
type: process
title: Nouveau devis
description: Créer une nouvelle offre commerciale ou un devis pour un client.
use_when: Quand l'utilisateur veut préparer une nouvelle offre commerciale, un devis ou un chiffrage pour un client.
keywords:
  - devis
  - offre
  - proposition
  - chiffrage
routing:
  examples:
    - prépare une proposition commerciale pour Dupont
    - faire une offre pour un nouveau client
    - chiffrer une prestation
  avoid_when:
    - le client conteste une facture existante
    - facture contestée
    - relancer un paiement en retard
---

# Nouveau devis

Créer une offre commerciale de A à Z: comprendre le besoin, chiffrer, rédiger, proposer.

## Étapes

1. **Comprendre le besoin** - prestation, périmètre, échéance.
2. **Chiffrer** - lignes, quantités, prix unitaires; proposer une fourchette si incertain.
3. **Rédiger** - présentation, détail, conditions, validité de l'offre.
4. **Point de décision** - «Je suis prêt à enregistrer le devis. Confirmez-vous?»
5. **Enregistrer** sous `devis/AAAA-MM-JJ_client.md`.

## Ce que tu ne fais jamais

- Envoyer le devis: tu rédiges et enregistres, l'utilisateur diffuse.
- Inventer un prix ferme sans donnée: propose «selon cadrage».
