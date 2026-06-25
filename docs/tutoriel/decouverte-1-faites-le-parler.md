---
schema_version: base.resource.v1
id: docs-tutoriel-decouverte-1-faites-le-parler
type: document
title: Faites parler l'office du tourisme
description: "Ouvrez l'office du tourisme déjà fini et passez quatre demandes: un renseignement, une sortie de groupe, une qui demande à préciser, une ambiguë. Vous voyez le routage et l'abstention honnête en vrai."
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [decouverte, routage, abstention, renseignement, veytaux, tourisme]
audience: [beginner]
learning_level: beginner
---

# Faites parler l'office du tourisme

*⏱ ~10 min · module 1/3, parcours Découverte*

**Vous allez**: reconnaître quand l'assistant route et quand il s'abstient honnêtement, prouvé par le ✅ ci-dessous.
**Il vous faut**: un outil IA installé et connecté, et le dossier exemples/veytaux-tourisme ouvert (voir [Étape 0](harnais.md)).

Passez ces quatre demandes, une par une:

```routage-fixture
Quelles activités à faire cet après-midi ?
Organiser une sortie pour notre groupe de 30 personnes
Vous avez une plage où se baigner ?
Quelles sont mes options ?
```

1. *«Quelles activités à faire cet après-midi?»*: il cherche dans les fiches et cite sa source.
   Il vérifie aussi que l'agenda est à jour, et s'appuie sur l'agenda et les fiches citées plutôt que d'inventer.
2. *«Organiser une sortie pour notre groupe de 30 personnes»*: il bascule sur la préparation d'une offre.
3. *«Vous avez une plage où se baigner?»*: une vraie question touristique, mais aucun process ne correspond.
4. *«Quelles sont mes options?»*: une demande d'aide générale.

✅ **Vérifiez**: l'assistant doit, en substance: (1-2) entrer dans la bonne tâche; (3) ne PAS inventer une plage et demander de préciser ce que vous cherchez plutôt que de deviner; (4) proposer un petit menu d'options. Les deux issues de (3) sont instructives: voir Pourquoi.

💡 **Pourquoi ça a marché**: le bon process est choisi par l'intention, pas par des mots-clés. Au palier consignes (sans CLI/MCP), c'est le modèle qui suit le routeur écrit dans CLAUDE.md: il PEUT déborder et improviser une réponse à «une plage?» au lieu de demander à préciser. C'est justement la limite que supprime le routage déterministe (la lettre, la mise à niveau).

🔁 **Chez vous**: quelles sont les 2 ou 3 demandes que vos clients/collègues vous adressent le plus? Notez-les: ce seront vos process.

→ **Et maintenant**: [Module 2: changez une règle](decouverte-2-changez-une-regle.md): vous allez voir l'assistant obéir à un fichier que VOUS modifiez.

🆘 **Pannes courantes**: *Il improvise une réponse à «une plage?» comme si c'était normal*: attendu au palier consignes; c'est la leçon, pas un bug. *Une demande n'entre pas dans la bonne tâche*: reformulez avec l'intention («je voudrais un renseignement», «organiser une sortie pour un groupe»).
