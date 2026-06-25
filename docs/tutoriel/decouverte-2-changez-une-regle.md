---
schema_version: base.resource.v1
id: docs-tutoriel-decouverte-2-changez-une-regle
type: document
title: Changez une règle, voyez-le obéir
description: Modifiez un tarif dans le fichier des tarifs, enregistrez, ouvrez une nouvelle conversation, redemandez: l'assistant suit le fichier. Le déclic: l'expertise est un fichier.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [decouverte, editer, fichier, tarif, veytaux, tourisme]
audience: [beginner]
learning_level: beginner
---

# Changez une règle, voyez-le obéir

*⏱ ~10 min · module 2/3, parcours Découverte*

**Vous allez**: constater que l'assistant suit vos fichiers, pas une mémoire cachée, prouvé par le ✅ ci-dessous.
**Il vous faut**: le module 1 terminé, l'office du tourisme de Veytaux ouvert dans votre outil.
↻ **Rappel**: sans regarder, à quoi sert le routage? (à choisir la bonne tâche selon l'intention)

1. Ouvrez `infos/tarifs.md`. Changez le prix de la **Visite guidée du vieux village** de 12 à 14 CHF.
2. **Enregistrez** le fichier (Cmd+S / Ctrl+S: Cursor n'enregistre pas toujours tout seul).
3. **Ouvrez une nouvelle conversation** (important: voir Pourquoi).
4. Redemandez: *«Combien coûte la visite guidée du vieux village?»*

✅ **Vérifiez**: l'assistant annonce 14 CHF (le nouveau prix), pas 12. S'il dit encore 12, voir les pannes.

💡 **Pourquoi ça a marché**: l'assistant n'a pas de base de données ni de mémoire cachée, il LIT vos fichiers Markdown à chaque tâche. Modifiez le fichier et son comportement suit. La nouvelle conversation force une relecture; dans l'ancienne, il pouvait garder l'ancien prix en tête.

🔁 **Chez vous**: quel chiffre, règle ou information change régulièrement dans votre métier et devrait vivre dans UN fichier qu'on met à jour?

→ **Et maintenant**: [Module 3: votre dossier](decouverte-3-votre-dossier.md): vous quittez l'office du tourisme de Veytaux pour votre propre espace.

🆘 **Pannes courantes**: *Il dit encore 12 CHF*: (a) le fichier n'a pas été enregistré; (b) vous êtes resté dans la même conversation: ouvrez-en une nouvelle. *Vous ne trouvez pas tarifs.md*: il est dans le sous-dossier `infos/`.
