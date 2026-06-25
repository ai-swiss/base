---
schema_version: base.resource.v1
id: docs-tutoriel-index
type: document
title: Apprendre BASE en faisant
description: "Trois parcours pas à pas, des exercices à vérification intégrée, et un projet jouet: l'office du tourisme de Veytaux-les-Bains. Choisissez votre point de départ."
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [tutoriel, apprendre, parcours, exercices, veytaux, tourisme, debutant]
audience: [beginner, builder]
learning_level: beginner
---

# Apprendre BASE en faisant

**Votre outil IA est l'expérience; Studio est l'atelier.** Ce tutoriel vous fait construire,
de vos mains, un assistant pour un office du tourisme imaginaire (**Veytaux-les-Bains**) puis
l'amène sur VOS fichiers. Chaque étape se termine par une vérification: vous ne passez jamais à
la suite sans preuve que tout fonctionne. C'est l'avantage de BASE: chaque étape se valide par un contrôle déterministe que vous inspectez et confirmez.

## Choisissez votre point de départ

### Découverte: 32 min, rien à installer côté BASE
Vous n'avez jamais structuré le travail d'une IA. Vous ouvrez l'office du tourisme déjà fini,
vous lui parlez, vous changez une règle, vous voyez l'assistant obéir au fichier. **3 modules.**
À la fin: vous avez votre propre dossier, et un de vos vrais documents dedans.
→ [Étape 0: brancher votre outil](harnais.md) puis [Module 1](decouverte-1-faites-le-parler.md).

### Praticien: 122 min, Node installé
Vous voulez construire. Vous créez votre vrai projet avec `base init`, reconstruisez l'office du
tourisme à partir de squelettes à trous, ajoutez compétences et modèles pour générer des
documents, évaluez la qualité, traitez une remontée de terrain, puis migrez vos propres
procédures. **9 modules.**
À la fin: VOTRE assistant répond sur VOTRE contenu et prépare vos livrables.
→ [Étape 0](harnais.md) puis [Module 1](praticien-1-anatomie.md).

### Équipe: 50 min
Vous déployez pour plusieurs personnes. Workspace multi-périmètres, gouvernance d'egress sur une
vraie ressource confidentielle, distribution par git et serveur MCP. **3 modules.**
→ [Étape 0](harnais.md) puis [Module 1](equipe-1-workspace.md).

---

Chaque module affiche une durée indicative (une estimation, pas un chronomètre) et votre progression; les totaux ci-dessus en sont la somme. Bloqué? Chaque
module se termine par les pannes courantes et un point de comparaison dans
`exemples/veytaux-tourisme`.
