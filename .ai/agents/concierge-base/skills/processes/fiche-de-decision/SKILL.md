---
schema_version: base.resource.v1
id: fiche-de-decision
type: process
title: Fiche de décision
scope: team
status: active
sensitivity: internal
name: fiche-de-decision
description: "Construire une fiche interactive qui rassemble vos choix et vos commentaires sur plusieurs points ouverts à la fois, puis agir sur l'export. À utiliser quand plusieurs arbitrages attendent."
use_when: Quand plusieurs choix sont ouverts en même temps et qu'il faut les trancher d'un coup, plutôt qu'un par un dans la conversation.
routing:
  examples:
    - Crée-moi une fiche de décision pour trancher ces points
    - Aide-moi à arbitrer entre plusieurs options en une fois
    - Rassemble mes choix et mes accords sur une liste de points ouverts
    - J'ai plusieurs choix ouverts, fais-moi une fiche interactive
  avoid_when:
    - Une seule décision, déjà prise, à formaliser en note.
    - Un changement déjà décidé qu'il faut appliquer.
    - Enregistrer durablement une décision unique.
argument-hint: "[les points à décider]"
user-invocable: true
allowed-tools: Read, Write
---

# Fiche de décision

Quand plusieurs choix sont ouverts, une fiche vaut mieux qu'un fil de discussion: la personne note
chaque point, commente, puis renvoie l'ensemble d'un coup. La personne décide; la fiche structure la
décision.

## Étapes

1. **Lister les vraies décisions.** Une carte par point. Chaque carte: le contexte, **votre
   recommandation** (mettez-la en tête) et, si utile, votre lecture préalable. Ne gonflez pas avec
   des points déjà réglés.
2. **Construire depuis le modèle.** Copiez le modèle de l'agent,
   `.ai/agents/concierge-base/templates/decision-sheet.html`, vers `.temp/AAAA-MM-JJ_sujet/<nom>.html`.
   Renseignez le titre, l'intro, `STORAGE_KEY`, `EXPORT_FILE` et le tableau `POINTS` (`id`, `title`,
   `what`, `reco`, `recoSummary`, `scaleLabel`).
3. **Garder ça propre.** Pas de référence à un cadre externe; le style est déjà dans le modèle.
   `.temp/` est ignoré par git, la fiche reste un brouillon.
4. **Ouvrir la fiche** pour la personne et attendre. La fiche s'enregistre dans le navigateur;
   l'export est un Markdown qu'elle vous rend.
5. **Agir sur l'export.** Appliquez là où elle est d'accord, suivez ses commentaires là où elle
   nuance, gardez votre recommandation là où elle n'a pas répondu (et dites-le). Si une décision
   mérite d'être conservée, proposez d'en faire une courte note écrite.

## Ce que vous ne faites jamais

- Décider à la place de la personne, ou transformer une abstention honnête en choix forcé.
- Rouvrir des points déjà réglés, ou noyer la recommandation sous le contexte.
