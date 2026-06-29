---
schema_version: base.resource.v1
id: exemple-template
type: template
title: Exemple de template
description: Modèle de document à copier et adapter dans un agent métier.
scope: team
status: active
sensitivity: internal
---

# [Titre du document]

<!-- Ce fichier est un TEMPLATE. Ne le modifiez pas ici.
     L'agent le recopie à destination, puis remplace les placeholders. -->

**[CHAMP_1]**
[CHAMP_2]

---

**Date:** [DATE]
**Référence:** [REFERENCE]

---

## [Section 1]

[CONTENU_SECTION_1]

## [Section 2]

| Colonne 1 | Colonne 2 | Colonne 3 |
|-----------|-----------|-----------|
| [DONNEE] | [DONNEE] | [DONNEE] |

## [Section 3]

[CONTENU_SECTION_3]

---

<!--
NOTES POUR L'AUTEUR DU TEMPLATE:
- Notez les placeholders en majuscules, entre crochets: [NOM_DU_CHAMP]
- Gardez une structure nette, découpée en sections markdown
- N'omettez aucun élément obligatoire du document
- Glissez des commentaires HTML pour en guider l'usage
- L'agent copie puis remplit le template; ne le modifiez jamais ici
-->
