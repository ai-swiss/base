---
schema_version: base.resource.v1
id: docs-tutoriel-praticien-1-anatomie
type: document
title: L'anatomie d'un assistant
description: Lisez l'agent et un process de l'office du tourisme de Veytaux, écrivez un use_when, et vérifiez par base route que le routeur le comprend.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [praticien, agent, process, use_when, route, veytaux, tourisme]
audience: [builder]
learning_level: intermediate
---

# L'anatomie d'un assistant

*⏱ ~12 min · module 1/9, parcours Praticien*

**Vous allez**: écrire un use_when qui achemine une demande vers le bon process, prouvé par le ✅ ci-dessous.
**Il vous faut**: Node 18+ et le dépôt (à défaut, [la lettre](../start/installer-par-votre-ia.md)), un terminal ouvert dans `exemples/veytaux-tourisme`.

1. Ouvrez `.ai/agents/office-tourisme/AGENT.md`: la carte d'identité de l'assistant (qui, quand).
2. Ouvrez `.ai/agents/office-tourisme/skills/processes/renseigner-un-visiteur/SKILL.md`: les étapes,
   et surtout le champ `use_when` ainsi que `routing.examples`.
3. **Prédisez**: vers où la demande «Quelles activités à faire cet après-midi?» devrait-elle être acheminée? Dites-le à voix haute.
4. Vérifiez votre prédiction:

```routage-fixture
Quelles activités à faire cet après-midi ?
```

   (lancez `base route "Quelles activités à faire cet après-midi ?" --root .`)

✅ **Vérifiez**: `base route` répond `routed`, agent `office-tourisme`, process `renseigner-un-visiteur`. Votre prédiction se confirme.

💡 **Pourquoi ça a marché**: le `use_when` et les `routing.examples` sont précisément ce que lit le routeur. Un bon use_when décrit l'INTENTION («quand un visiteur veut savoir quoi faire»), et non le titre. Prédire avant de lancer transforme la vérification en test d'hypothèse: c'est ainsi que l'apprentissage s'ancre.

🔁 **Chez vous**: pour UNE de vos tâches, écrivez en une phrase son use_when: «Quand l'utilisateur veut …».

→ **Et maintenant**: [Module 2: le squelette de l'office](praticien-2-le-squelette.md): vous bâtirez un process à partir d'un squelette à trous.

🆘 **Pannes courantes**: *route répond out_of_scope*: votre terminal n'est pas dans le bon dossier (`--root .` depuis `exemples/veytaux-tourisme`). *Vous ne trouvez pas le SKILL.md*: il se trouve sous `skills/processes/<nom>/`.
