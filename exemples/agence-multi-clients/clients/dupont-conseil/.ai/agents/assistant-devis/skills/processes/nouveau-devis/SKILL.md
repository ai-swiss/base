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

Préparer un devis à partir d'une demande client, dans la racine Dupont Conseil uniquement.
Les remises négociées (`tarifs/remises-confidentielles.md`) sont confidentielles: consulte-les
pour fixer le prix, mais ne les recopie jamais telles quelles dans l'offre envoyée.
