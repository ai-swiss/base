---
schema_version: base.resource.v1
id: nouveau-devis
type: process
title: Nouveau devis
scope: team
status: active
sensitivity: internal
name: nouveau-devis
description: "Créer un devis pour un client de Dupont Conseil."
use_when: Quand l'utilisateur veut préparer un devis ou une offre commerciale pour Dupont Conseil.
routing:
  examples:
    - Nouveau devis pour un client
    - Préparer une offre commerciale
may_use:
  - tarifs/remises-confidentielles.md
argument-hint: "[description de la demande client]"
user-invocable: true
allowed-tools: Read Write
---

# Nouveau devis (Dupont Conseil)

1. Recueille le besoin et la catégorie du client nécessaires au chiffrage.
2. Consulte `tarifs/remises-confidentielles.md` localement pour appliquer la remise pertinente,
   sans recopier la grille ni ses catégories dans l'offre.
3. Prépare le devis dans la racine Dupont Conseil uniquement.
4. Demande confirmation avant de l'enregistrer. Tu ne l'envoies jamais.
