---
schema_version: base.resource.v1
id: docs-tutoriel-praticien-6-ouvrez-l-atelier
type: document
title: Ouvrez l'atelier, connectez un modèle
description: Lancez base studio, ouvrez les Réglages, et connectez votre premier modèle avec le guide pas à pas. C'est la marche entre la CLI et l'évaluation.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [praticien, studio, atelier, modèle, réglages, ollama, veytaux, tourisme]
audience: [builder]
learning_level: intermediate
---

# Ouvrez l'atelier, connectez un modèle

*⏱ ~10 min · module 6/9, parcours Praticien*

**Vous allez**: avoir l'atelier ouvert et un modèle connecté, prêt à évaluer, prouvé par le ✅ ci-dessous.
**Il vous faut**: le module 5 terminé.
↻ **Rappel**: sans regarder, que fait base doctor? (il signale ce qui est sur le point de casser)

1. Lancez l'atelier: `base studio --root exemples/veytaux-tourisme`. Votre navigateur s'ouvre.
2. Onglet **Réglages**. S'il n'y a aucun provider, le guide «Connecter un modèle» s'affiche.
3. Suivez le chemin le plus simple pour vous (Ollama local sans clé, ou une clé d'API que vous
   collez dans votre terminal). Le guide imprime l'étape suivante à chaque fois.
4. Une fois le test de connexion vert, cliquez «définir comme défauts d'évaluation».

✅ **Vérifiez**: l'écran Réglages montre votre provider avec un test de connexion vert, et vos défauts d'évaluation sont définis.

💡 **Pourquoi ça a marché**: Studio est l'atelier, il travaille sur les MÊMES fichiers que votre outil IA. Les clés d'API ne sont jamais saisies ni stockées dans l'écran: vous nommez une variable d'environnement, ce qui garde vos secrets hors des fichiers.

🔁 **Chez vous**: quel modèle utiliserez-vous pour vos évaluations, un modèle local (gratuit, privé) ou une API (plus puissante)?

→ **Et maintenant**: [Module 7: la première évaluation](praticien-7-premiere-evaluation.md).

🆘 **Pannes courantes**: *«Aucun modèle»* après avoir installé Ollama: rechargez la page des Réglages. *La clé n'est pas détectée*: exportez la variable dans le MÊME terminal que `base studio`, puis relancez.
