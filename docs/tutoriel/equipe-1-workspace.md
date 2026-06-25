---
schema_version: base.resource.v1
id: docs-tutoriel-equipe-1-workspace
type: document
title: Le workspace multi-périmètres
description: Ouvrez un workspace à deux roots et voyez comment BASE garde chaque périmètre d'écriture séparé.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [equipe, workspace, roots, perimetre]
audience: [builder]
learning_level: advanced
---

# Le workspace multi-périmètres

*⏱ ~15 min · module 1/3, parcours Équipe*

**Vous allez**: naviguer un workspace à deux roots et comprendre qu'un root est un périmètre d'écriture, prouvé par le ✅ ci-dessous.
**Il vous faut**: Node 18+ et le dépôt; un terminal à la racine.

1. Lancez l'atelier sur le workspace d'exemple:
   `base studio --root exemples/agence-multi-clients`.
2. L'arbre montre deux roots (Dupont, Martin), chacun badgé `⌂`.
3. Cherchez `tarif` depuis l'en-tête workspace: les cartes des deux roots apparaissent,
   chacune badgée par son root.
4. Ouvrez une carte de Martin: le contexte bascule sur le root de Martin.

✅ **Vérifiez**: une recherche workspace renvoie des cartes des DEUX roots, chacune identifiée par son root; ouvrir une carte vous place dans le périmètre de ce root.

💡 **Pourquoi ça a marché**: un workspace réunit plusieurs BASE indépendants. Un root = un périmètre d'écriture: une édition dans Martin ne peut pas toucher Dupont. C'est la cloison qui rend le multi-client sûr.

🔁 **Chez vous**: combien de périmètres distincts (clients, équipes, projets) votre organisation aurait-elle?

→ **Et maintenant**: [Module 2: périmètres et egress](equipe-2-perimetres-et-egress.md).

🆘 **Pannes courantes**: *Un seul root s'affiche*: vérifiez `base.workspace.json` à la racine du dossier ouvert. *La recherche ne fan-out pas*: cherchez depuis l'en-tête workspace, pas depuis un root.
