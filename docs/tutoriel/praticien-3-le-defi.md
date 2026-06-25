---
schema_version: base.resource.v1
id: docs-tutoriel-praticien-3-le-defi
type: document
title: "Le défi: donner les conditions du jour"
description: Sans guide, ajoutez un process donner-les-conditions-du-jour et faites-le router. Vous appliquez seul ce que les modules 1-2 ont montré.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [praticien, defi, process, route, autonomie, veytaux, tourisme]
audience: [builder]
learning_level: intermediate
---

# Le défi: donner les conditions du jour

*⏱ ~12 min · module 3/9, parcours Praticien*

**Vous allez**: créer un nouveau process et montrer qu'il route, sans pas-à-pas, prouvé par le ✅ ci-dessous.
**Il vous faut**: les modules 1-2 terminés, votre dossier `mon-office-tourisme`.
↻ **Rappel**: sans regarder, quels deux champs le routeur lit-il pour choisir un process? (use_when, routing.examples)

L'office du tourisme de Veytaux est fier de sa webcam braquée sur le parking, et les visiteurs n'arrêtent pas de demander la météo et les conditions du jour là-haut. Dans `.ai/feedback/abstentions.jsonl`, la même question revient sans réponse: «Quel temps fait-il là-haut aujourd'hui?» À vous d'éteindre cette abstention:

1. Créez un process `donner-les-conditions-du-jour` (même structure qu'au module 2).
2. Donnez-lui un `use_when` et des `routing.examples` qui captent ce genre de demande:

```routage-defi
Quel temps fait-il là-haut aujourd'hui ?
Il neige au village ce matin ?
```

3. Vérifiez votre travail vous-même (commandes ci-dessous).

✅ **Vérifiez**: `base validate --root .` passe, et `base route "Quel temps fait-il là-haut aujourd'hui ?" --root .` route vers `donner-les-conditions-du-jour`. Si ça route ailleurs, ajustez le use_when et les examples: c'est l'exercice.

💡 **Pourquoi ça a marché**: vous venez de faire, seul, la boucle complète: écrire la structure, prédire le résultat, vérifier, puis corriger. C'est exactement le geste que vous referez sur vos vrais process.

🔁 **Chez vous**: listez une tâche de votre métier que votre assistant ne sait pas encore faire, c'est votre prochain process.

→ **Et maintenant**: [Module 4: compétences et modèles](praticien-4-competences-et-modeles.md), les briques réutilisables et la génération de documents.

🆘 **Pannes courantes**: *Ça route vers renseigner-un-visiteur*: vos examples ressemblent trop à un renseignement classique; rapprochez-les de «la météo et les conditions du jour». *ambiguous*: deux process trop proches: distinguez leurs use_when.
