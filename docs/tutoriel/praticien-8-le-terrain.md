---
schema_version: base.resource.v1
id: docs-tutoriel-praticien-8-le-terrain
type: document
title: Le terrain: une friction remonte
description: Copiez une friction d'exemple dans la pile Terrain, lisez-la, et résolvez-la par le gate propose puis commit. Le terrain nourrit l'expertise.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [praticien, terrain, friction, gate, feedback, veytaux, tourisme]
audience: [builder]
learning_level: intermediate
---

# Le terrain: une friction remonte

*⏱ ~10 min · module 8/9, parcours Praticien*

**Vous allez**: traiter une remontée de terrain et la résoudre par le gate d'écriture, prouvé par le ✅ ci-dessous.
**Il vous faut**: le module 7 terminé, Studio ouvert sur l'office du tourisme.
↻ **Rappel**: sans regarder: que produit une évaluation? (un verdict de juge + une piste de correction)

La pile Terrain démarre vide. On simule une remontée.

D'abord, trois mots de contexte: la **pile Terrain** rassemble les frictions (un usage réel
qui a coincé); le **gate** est la règle d'or: rien n'est écrit sans une proposition (un diff)
que vous validez.

1. Créez `.ai/feedback/2026-01-10_agenda-perime.md` dans l'office du tourisme avec ce contenu:

```
---
process: .ai/agents/office-tourisme/skills/processes/renseigner-un-visiteur/SKILL.md
reported: 2026-01-10
via: user
status: open
---
# L'agenda était périmé et l'assistant a quand même annoncé l'événement

Le process devrait vérifier la date de validité avant d'annoncer un événement de l'agenda.
```

2. Dans Studio, onglet **Evaluations**: la friction apparaît dans la pile Terrain.
3. Ouvrez le process concerné, amendez-le pour vérifier la date, puis «Marquer résolu»:
   un diff s'affiche (le gate), validez-le.

✅ **Vérifiez**: la friction quitte la pile des «ouvertes» après validation, et le diff de résolution est passé par propose puis commit (rien n'a été écrit avant votre validation).

💡 **Pourquoi ça a marché**: le terrain est la matière première de l'amélioration. Une friction est un fichier daté, jamais perdu. Toute écriture, même une résolution, passe par le gate: c'est ce qui rend l'IA sûre à laisser vivre dans vos fichiers.

🔁 **Chez vous**: quand votre assistant se trompera, qui notera la friction, et où? (c'est votre boucle d'amélioration)

→ **Et maintenant**: [Module 9: migrer vos contenus](praticien-9-migrer.md): le moment où l'exercice devient VOTRE outil.

🆘 **Pannes courantes**: *La friction n'apparaît pas*: vérifiez le dossier `.ai/feedback/` et le frontmatter (status: open). *Pas de diff à la résolution*: la résolution passe toujours par une proposition; relisez avant de valider.
