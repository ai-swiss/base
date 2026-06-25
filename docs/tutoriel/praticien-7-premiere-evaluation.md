---
schema_version: base.resource.v1
id: docs-tutoriel-praticien-7-premiere-evaluation
type: document
title: La première évaluation
description: Lancez une évaluation de l'office du tourisme de Veytaux: un utilisateur simulé joue un scénario, un juge note. Vous lisez le verdict et une piste de correction.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [praticien, evaluation, juge, scenario, pulse, veytaux, tourisme]
audience: [builder]
learning_level: intermediate
---

# La première évaluation

*⏱ ~15 min · module 7/9, parcours Praticien*

**Vous allez**: lire le verdict d'un juge sur un scénario et repérer une piste d'amélioration, prouvé par le ✅ ci-dessous.
**Il vous faut**: le module 6 terminé (un modèle connecté, des défauts d'évaluation).
↻ **Rappel**: sans regarder, pourquoi les clés d'API ne sont-elles jamais dans l'écran? (elles vivent dans une variable d'environnement, jamais dans les fichiers)

1. Dans Studio, onglet **Évaluations**, bouton «▶ Évaluer».
2. Le panneau s'ouvre, pré-rempli. L'office du tourisme de Veytaux fournit deux scénarios (visiteur
   de passage déçu par la météo, responsable de groupe flou). Lancez.
3. Patientez: un utilisateur simulé joue le scénario, puis un juge indépendant note chaque
   conversation. Les cartes de résultat arrivent une à une.
4. Cliquez une carte pour dérouler le verdict du juge et sa piste de correction.

✅ **Vérifiez**: vous voyez au moins un verdict (atteint / partiel / manque) avec une raison et, si le but n'est pas atteint, une piste de correction (fix hint) concrète.

💡 **Pourquoi ça a marché**: évaluer, ce n'est pas «le code compile»: c'est un vrai utilisateur simulé confronté à un vrai juge, sur des scénarios que vous écrivez. Le verdict vous dit si le process tient AVANT vos vrais visiteurs.

🔁 **Chez vous**: quel scénario-piège aimeriez-vous que votre assistant passe à coup sûr (le visiteur qui oublie une info, la demande limite)?

→ **Et maintenant**: [Module 8: le terrain](praticien-8-le-terrain.md): quand un vrai usage remonte un problème.

🆘 **Pannes courantes**: *L'évaluation échoue au lancement*: un message liste les problèmes (provider/modèle) et vous renvoie vers les Réglages. *C'est lent*: un modèle local prend quelques minutes, c'est normal.
