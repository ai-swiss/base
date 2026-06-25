---
schema_version: base.resource.v1
id: docs-tutoriel-equipe-2-perimetres-et-egress
type: document
title: Périmètres et gouvernance d'egress
description: Sur une vraie ressource confidentielle, choisissez un modèle distant et voyez BASE refuser la fuite AVANT tout appel: la règle d'egress se DIT, elle ne fuit pas en silence.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [equipe, egress, confidential, local-only, securite, veytaux, tourisme]
audience: [builder]
learning_level: advanced
---

# Périmètres et gouvernance d'egress

*⏱ ~15 min · module 2/3, parcours Équipe*

**Vous allez**: déclencher puis lire un refus d'egress sur une vraie ressource confidentielle, prouvé par le ✅ ci-dessous.
**Il vous faut**: le module 1 terminé; l'atelier ouvert sur `exemples/agence-multi-clients`; un modèle DISTANT (API) connecté dans les Réglages (guide «Connecter un modèle», parcours Praticien module 6). Le contrôle se fait AVANT tout appel au modèle: même une clé non valide suffit à observer le refus.
↻ **Rappel**: sans regarder: qu'est-ce qu'un root garantit? (un périmètre d'écriture isolé)

Le client Dupont Conseil contient une ressource déjà marquée confidentielle:
`clients/dupont-conseil/tarifs/remises-confidentielles.md` (`confidential: true`).

1. Dans Studio, ouvrez cette ressource.
2. Ouvrez son chat, choisissez votre modèle DISTANT.
3. Demandez une modification (par ex. *«reformule cette grille de remises»*).

✅ **Vérifiez**: BASE refuse l'envoi vers le modèle distant et l'explique («ce document est confidentiel … choisissez un modèle local»); vous voyez le motif à l'écran. La même demande avec un modèle LOCAL (Ollama) passe: c'est exactement la règle.

💡 **Pourquoi ça a marché**: la gouvernance vit dans des fichiers (`confidential: true` sur une ressource, ou `egress: local-only` sur un root entier), pas dans une console. La règle est unique: rien de confidentiel ne part vers un modèle distant, et le contrôle se fait AVANT l'appel, donc le document ne quitte jamais la machine. Le refus se DIT: c'est la différence entre une consigne (suivie) et un mécanisme (appliqué).

🔁 **Chez vous**: quelles de vos données ne doivent JAMAIS quitter votre machine vers une API? Marquez-les `confidential: true`, ou passez tout le root en `egress: local-only`.

→ **Et maintenant**: [Module 3: distribuer](equipe-3-distribuer.md).

🆘 **Pannes courantes**: *Pas de refus*: le modèle choisi est-il bien DISTANT? (un modèle local comme Ollama est autorisé, c'est voulu). La ressource porte-t-elle `confidential: true`? *Aucun modèle à choisir dans le chat*: ajoutez d'abord un provider dans les Réglages (parcours Praticien module 6).
