---
schema_version: base.resource.v1
id: exporter-pdf-devis
type: tool
title: Exporter un devis en PDF
description: Générer un PDF de devis à partir d'un devis JSON local.
scope: team
status: active
sensitivity: internal
execution:
  type: script
  runtime: python
  entrypoint: exporter-pdf_v1.py
  requires_confirmation: true
---

# Exporter un devis en PDF

Cette tool génère un PDF à partir d'un devis JSON validé.

Utilisation attendue:

```text
invoke_tool("exporter-pdf-devis", ["devis/DEV-2026-001.json"])
```

L'export est proposé après validation du contenu du devis. Le fichier produit reste à relire avant envoi au client.
