---
schema_version: base.resource.v1
id: docs-tutoriel-praticien-5-donnees-qui-periment
type: document
title: Les données qui périment
description: L'agenda du moment a une date dépassée: base doctor le signale, vous corrigez, le signal s'éteint. Le cycle de vie d'une expertise, vécu.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [praticien, doctor, valid_until, périmé, cycle de vie, veytaux, tourisme]
audience: [builder]
learning_level: intermediate
---

# Les données qui périment

*⏱ ~10 min · module 5/9, parcours Praticien*

**Vous allez**: faire signaler puis disparaître une donnée périmée avec base doctor, prouvé par le ✅ ci-dessous.
**Il vous faut**: le module 1 terminé, un terminal dans `exemples/veytaux-tourisme`.
↻ **Rappel**: sans regarder: qu'est-ce qui fait router une demande vers un process? (son use_when et ses examples)

1. Lancez `base doctor --root .`. Repérez le signal sur `infos/agenda.md`.
2. Ouvrez `infos/agenda.md`: le champ `valid_until` est une date passée (c'est exprès,
   pour l'exercice).
3. Repoussez `valid_until` à une date future (par exemple dans une semaine), enregistrez.
4. Relancez `base doctor --root .`.

✅ **Vérifiez**: après correction, `base doctor` ne signale plus `infos/agenda.md` comme périmé (le signal `expired` a disparu).

💡 **Pourquoi ça a marché**: une expertise vieillit. `valid_until` déclare la durée de vie d'une donnée de référence; `base doctor` projette ces dates sur vos fichiers pour repérer ce qui est sur le point de casser, sans rien exécuter, par simple lecture. La maintenance devient visible.

🔁 **Chez vous**: quelle donnée de votre métier (un tarif, un barème, une règle saisonnière) devrait porter une date de validité?

→ **Et maintenant**: [Module 6: ouvrez l'atelier](praticien-6-ouvrez-l-atelier.md): on passe à Studio et on connecte un modèle.

🆘 **Pannes courantes**: *doctor ne signale rien*: vous n'êtes pas dans `exemples/veytaux-tourisme`. *Le signal reste après correction*: la date est-elle bien dans le FUTUR, et le fichier enregistré?
