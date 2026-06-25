---
schema_version: base.resource.v1
id: ticket-incident
type: process
title: Ticket incident
scope: team
status: active
sensitivity: internal
name: ticket-incident
description: "Traiter un ticket d'incident pour Martin Digital."
use_when: Quand l'utilisateur veut ouvrir, qualifier ou résoudre un ticket d'incident pour Martin Digital.
routing:
  examples:
    - Ouvrir un ticket d'incident
    - Un client signale une panne
argument-hint: "[description de l'incident]"
user-invocable: true
allowed-tools: Read Write
---

# Ticket incident (Martin Digital)

Qualifier et suivre un incident de support, dans la racine Martin Digital uniquement.
