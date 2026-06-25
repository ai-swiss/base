---
schema_version: base.resource.v1
id: _exemple-tool
type: tool
title: Exemple de tool
description: Template de tool (tool). Copier ce fichier, renommer, et décrire l'exécution.
scope: personal
status: active
sensitivity: internal
execution:
  type: script
  runtime: python
---

# Exemple de tool

Ce dossier est **optionnel**. Il contient des scripts et connecteurs que l'agent peut utiliser quand la plateforme le permet.

## Types de tools

- **Scripts**: calculs, transformations de données, validations
- **Connecteurs**: appels à des API externes (CRM, ERP, email)
- **Utilitaires**: génération de PDF, anonymisation, import/export

## Conventions

- Un fichier par outil: `[action]-[cible]_v1.[ext]`
- Documenter les entrées/sorties en commentaire en tête de fichier
- Pas de dépendances lourdes, les tools doivent être autonomes
- Les règles métier restent dans les skills, pas dans les tools
