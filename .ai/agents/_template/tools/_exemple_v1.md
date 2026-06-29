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

Ce dossier est **optionnel**. On y range les scripts et les connecteurs que l'agent peut mobiliser lorsque la plateforme s'y prête.

## Types de tools

- **Scripts**: calculs, transformations de données, validations
- **Connecteurs**: appels aux API externes (CRM, ERP, messagerie)
- **Utilitaires**: génération de PDF, anonymisation, import et export

## Conventions

- Un fichier par outil: `[action]-[cible]_v1.[ext]`
- Documenter les entrées et les sorties en commentaire, en tête de fichier
- Pas de dépendances lourdes: un tool doit rester autonome
- Les règles métier demeurent dans les skills, jamais dans les tools
