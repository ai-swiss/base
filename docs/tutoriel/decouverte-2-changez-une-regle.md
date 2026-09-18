---
schema_version: base.resource.v1
id: docs-tutoriel-decouverte-2-changez-une-regle
type: document
title: Changez une règle, vérifiez la nouvelle lecture
description: "Modifiez un tarif, enregistrez, demandez à l'outil de relire le fichier puis vérifiez que sa réponse s'appuie sur la valeur mise à jour."
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [decouverte, editer, fichier, tarif, veytaux, tourisme]
audience: [beginner]
learning_level: beginner
---

# Changez une règle, vérifiez la nouvelle lecture

*⏱ ~10 min · module 2/3, parcours Découverte*

**Vous allez**: vérifier qu'une réponse peut s'appuyer sur la version enregistrée d'un fichier, prouvé par le ✅ ci-dessous.
**Il vous faut**: le module 1 terminé et l'office du tourisme de Veytaux ouvert dans votre outil.
↻ **Rappel**: sans regarder, à quoi sert le routage? (à choisir la bonne tâche selon l'intention)

1. Ouvrez `infos/tarifs.md`. Changez le prix de la **Visite guidée du vieux village** de 12 à 14 CHF.
2. **Enregistrez** le fichier (Cmd+S / Ctrl+S: Cursor n'enregistre pas toujours tout seul).
3. Demandez à votre outil de relire `infos/tarifs.md`. Selon le harnais, cela passe par une ouverture
   explicite du fichier, une nouvelle conversation ou un contexte de projet actualisé.
4. Demandez: *«D'après infos/tarifs.md, combien coûte la visite guidée du vieux village?»*

✅ **Vérifiez**: l'assistant annonce 14 CHF (le nouveau prix), pas 12. S'il dit encore 12, voir les pannes.

💡 **Pourquoi ça a marché**: cette exécution a reçu la version enregistrée du fichier et l'a utilisée
pour répondre. BASE ne décide pas quand un harnais relit un fichier ni quel historique il conserve.
La demande explicite et la valeur annoncée vérifient donc ce run précis, pas toutes les réponses
futures.

🔁 **Chez vous**: quel chiffre, quelle règle ou quelle information change souvent dans votre métier et mériterait de tenir dans UN fichier que l'on met à jour?

→ **Et maintenant**: [Module 3: votre dossier](decouverte-3-votre-dossier.md). Vous quittez l'office du tourisme de Veytaux pour votre propre espace.

🆘 **Pannes courantes**: *Il dit encore 12 CHF*: (a) le fichier n'a pas été enregistré; (b) l'outil
n'a pas relu le fichier, demandez son ouverture explicite ou repartez avec un contexte actualisé.
*Vous ne trouvez pas tarifs.md*: il se trouve dans le sous-dossier `infos/`.
