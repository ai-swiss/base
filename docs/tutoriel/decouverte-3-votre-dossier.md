---
schema_version: base.resource.v1
id: docs-tutoriel-decouverte-3-votre-dossier
type: document
title: Votre dossier, votre premier document
description: Copiez le starter perso hors du dépôt, ouvrez-le, glissez-y un vrai document, et vérifiez par trois questions que l'assistant le lit vraiment.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [decouverte, dossier, importer, document, starter, veytaux, tourisme]
audience: [beginner]
learning_level: beginner
---

# Votre dossier, votre premier document

*⏱ ~12 min · module 3/3, parcours Découverte*

**Vous allez**: disposer de votre propre espace BASE, y placer l'un de vos vrais documents, et constater qu'il est bien lu, prouvé par le ✅ ci-dessous.
**Il vous faut**: les modules 1-2 terminés.
↻ **Rappel**: sans regarder, qu'est-ce qui change le comportement de l'assistant? (modifier ses fichiers)

1. Copiez le dossier `exemples/starter-perso` hors du dépôt, dans vos Documents, puis
   renommez-le, par exemple `mon-assistant`. Au clavier: clic droit -> Copier -> Coller. Ou
   demandez à votre assistant: *«copie le dossier starter-perso vers mes Documents»*.
2. Ouvrez CE nouveau dossier dans votre outil (*File -> Open Folder*).
3. Glissez-y l'un de vos vrais documents (une procédure, une fiche). Formats sûrs: `.md`, `.txt`.
   Si le format ne passe pas, recopiez le texte dans un nouveau fichier `.md`.
4. Posez trois demandes (le **protocole d'interrogation**):
   - une question dont SEUL votre document détient la réponse (il doit citer le document);
   - une question étrangère à votre document (il doit avouer qu'il l'ignore);
   - une demande censée router vers l'une de vos tâches.

✅ **Vérifiez**: la réponse 1 cite votre document; la réponse 2 reconnaît son ignorance au lieu d'inventer; la réponse 3 vise la bonne intention. Réunies, ces trois preuves attestent que l'import est réel et que l'assistant ne bluffe pas.

💡 **Pourquoi ça a marché**: un import réussi, ce n'est pas «le fichier est là», c'est «l'assistant s'en sert et reste honnête sur ses limites». Le protocole d'interrogation éprouve précisément cela, sans le moindre outil.

🔁 **Chez vous**: lequel de vos documents mérite d'être le premier vrai contenu de votre assistant?

→ **Et maintenant**: vous avez fait le tour de la Découverte. Pour construire pour de bon (process, évaluation, terrain), passez au [parcours Praticien](praticien-1-anatomie.md).

🆘 **Pannes courantes**: *Il invente une réponse à la question 2*: c'est le risque propre au palier consignes; le routage déterministe et un bon use_when l'atténuent (parcours Praticien). *Il ne voit pas votre document*: assurez-vous qu'il se trouve bien DANS le dossier ouvert, et non ailleurs.
