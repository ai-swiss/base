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

**Vous allez**: reconnaître quand l'assistant oriente une demande et quand il s'abstient honnêtement, prouvé par le ✅ ci-dessous.
**Il vous faut**: un outil IA installé et connecté, ainsi que le dossier exemples/veytaux-tourisme ouvert (voir [Étape 0](harnais.md)).

Passez ces quatre demandes, une par une:

```routage-fixture
Quelles activités à faire cet après-midi ?
Organiser une sortie pour notre groupe de 30 personnes
Vous avez une plage où se baigner ?
Quelles sont mes options ?
```

1. *«Quelles activités à faire cet après-midi?»*: il consulte les fiches et cite sa source.
   Il vérifie aussi que l'agenda est à jour, et s'appuie sur l'agenda et les fiches citées au lieu d'inventer.
2. *«Organiser une sortie pour notre groupe de 30 personnes»*: il passe à la préparation d'une offre.
3. *«Vous avez une plage où se baigner?»*: une vraie question touristique, mais aucun process n'y répond.
4. *«Quelles sont mes options?»*: une demande d'aide générale.

✅ **Vérifiez**: l'assistant doit, en substance: (1-2) entrer dans la bonne tâche; (3) ne PAS inventer une plage, mais demander ce que vous cherchez au lieu de le deviner; (4) proposer un bref menu d'options. Les deux issues possibles de (3) sont instructives: voir Pourquoi.

💡 **Pourquoi ça a marché**: le bon process est choisi selon l'intention, et non d'après des mots-clés. Au palier consignes (sans CLI/MCP), c'est le modèle qui suit le routeur écrit dans CLAUDE.md: il PEUT déborder et improviser une réponse à «une plage?» au lieu de demander à préciser. C'est précisément la limite que lève le routage déterministe.

🔁 **Chez vous**: quelles sont les 2 ou 3 demandes que vos clients ou collègues vous adressent le plus souvent? Notez-les: ce seront vos process.

→ **Et maintenant**: [Module 2: changez une règle](decouverte-2-changez-une-regle.md): vous allez voir l'assistant obéir à un fichier que VOUS modifiez.

🆘 **Pannes courantes**: *Il improvise une réponse à «une plage?» comme si de rien n'était*: c'est attendu au palier consignes, et c'est la leçon, pas un défaut. *Une demande n'entre pas dans la bonne tâche*: reformulez en disant votre intention («je voudrais un renseignement», «organiser une sortie pour un groupe»).
