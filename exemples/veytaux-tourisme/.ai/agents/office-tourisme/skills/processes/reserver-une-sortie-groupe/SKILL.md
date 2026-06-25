---
schema_version: base.resource.v1
id: reserver-une-sortie-groupe
type: process
title: Réserver une sortie de groupe
description: "Recueillir les besoins d'un groupe, chiffrer au barème, et préparer une offre depuis le template."
scope: team
status: active
sensitivity: internal
use_when: Quand quelqu'un veut organiser une visite ou une sortie pour un groupe à Veytaux.
routing:
  examples:
    - Organiser une sortie pour notre groupe de 30 personnes
    - Réserver une visite guidée pour une classe
    - Un devis pour une journée d'entreprise à Veytaux
  avoid_when:
    - Poser une simple question d'information.
    - Une demande sans rapport avec Veytaux.
may_use:
  - infos/tarifs.md
  - partenaires/hebergeurs.md
name: reserver-une-sortie-groupe
keywords: [groupe, sortie, visite, réserver, classe, entreprise, offre]
argument-hint: "[type de groupe, date, nombre de personnes]"
user-invocable: true
allowed-tools: Read
---

# Réserver une sortie de groupe

## Étapes

1. **Recueillir les besoins**: type de groupe, date, nombre de personnes, activité souhaitée. Une question à la fois (`skills/competences/parler-au-visiteur/SKILL.md`). Pour un groupe logé chez un partenaire, consulte `partenaires/hebergeurs.md`.
2. **Chiffrer** au barème de `infos/tarifs.md` (tarif de groupe par personne, visite guidée, location de matériel éventuelle). N'invente aucun prix.
3. **Préparer l'offre** à partir des templates `templates/offre-groupe_v1.md` et `templates/offre-groupe_v1.json`: remplis les `[PLACEHOLDERS]` avec les éléments recueillis.
4. **Marquer `[A VALIDER]`** le montant total: l'office confirme avant l'envoi.
5. Une fois validé, l'offre est prête à envoyer au groupe.

## Ce que tu ne fais jamais

- Promettre une date sans la noter comme à confirmer.
- Inventer un tarif hors barème.
- Envoyer une offre dont le total n'a pas été validé.
