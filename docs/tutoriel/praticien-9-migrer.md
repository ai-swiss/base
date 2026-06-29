---
schema_version: base.resource.v1
id: docs-tutoriel-praticien-9-migrer
type: document
title: Migrer VOS contenus
description: Reprenez votre liste «Chez vous» et importez deux ou trois vrais documents dans votre dossier, puis vérifiez par le protocole d'interrogation et une checklist d'import.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [praticien, migration, importer, documents, adoption, veytaux, tourisme]
audience: [builder]
learning_level: intermediate
---

# Migrer VOS contenus

*⏱ ~15 min · module 9/9, parcours Praticien*

**Vous allez**: transformer deux ou trois de vos vrais documents en contenu que votre assistant utilise vraiment, prouvé par le ✅ ci-dessous.
**Il vous faut**: les modules précédents; votre dossier `mon-office-tourisme` (ou un dossier à vous) ouvert.
↻ **Rappel**: sans regarder, par quoi passe toute écriture dans BASE? (le gate: propose puis commit)

Au fil des modules, vous avez accumulé une liste «Chez vous». Voilà votre réserve de tâches à venir.

1. Dans votre dossier, demandez: *«importer mes procédures existantes»*. Le routeur lance le
   process `importer-l-existant`, qui propose chaque conversion sous forme de diff: rien ne s'écrit sans vous.
2. Importez deux ou trois documents de votre liste.
3. Vérifiez chaque import par le **protocole d'interrogation** (module Découverte 3): une
   question à laquelle seul le document répond, une question piège hors document, une demande de routage.
4. Passez la **checklist d'import**:
   - [ ] le use_when de chaque process décrit une intention, pas un titre;
   - [ ] les données (tarifs, fiches) sont séparées des process qui les utilisent;
   - [ ] les étapes à décision humaine portent un `[A VALIDER]`;
   - [ ] ce qui peut périmer porte une date (`valid_until`).

✅ **Vérifiez**: pour chaque document importé, le protocole d'interrogation passe (cite le bon doc, admet l'ignorance, route bien) ET la checklist est cochée.

💡 **Pourquoi ça a marché**: c'est ici que le tutoriel devient votre base: la structure même de l'office du tourisme de Veytaux, appliquée à votre métier. La checklist condense ce que les modules ont enseigné: vous importez selon une grille, jamais à l'aveugle.

🔁 **Chez vous**: préparez la suite: quel troisième document, quelle prochaine tâche à automatiser?

→ **Et maintenant**: vous avez achevé le parcours Praticien: VOTRE assistant répond sur VOTRE contenu. Pour plusieurs personnes, voir le [parcours Equipe](equipe-1-workspace.md).

🆘 **Pannes courantes**: *L'import propose n'importe quoi*: guidez-le document par document plutôt que tout d'un bloc. *Le protocole échoue*: affinez le use_when, ou séparez les données des process.
