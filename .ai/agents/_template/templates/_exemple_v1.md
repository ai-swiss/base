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
     L'agent le copie vers sa destination et remplace les placeholders. -->

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
- Utilisez des PLACEHOLDERS EN MAJUSCULES entre crochets: [NOM_DU_CHAMP]
- Gardez une structure claire avec des sections markdown
- Incluez tous les éléments obligatoires du document
- Ajoutez des commentaires HTML pour guider l'utilisation
- Le template sera copié et rempli par l'agent, jamais modifié ici
-->
