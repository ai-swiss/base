---
schema_version: base.resource.v1
id: renseigner-un-visiteur
type: process
title: Renseigner un visiteur
description: "Répondre à la question d'un visiteur sur les activités, horaires et événements, en citant la source et sans rien inventer."
scope: team
status: active
sensitivity: internal
use_when: Quand un visiteur demande quoi faire, quand, ou à quelle heure à Veytaux.
routing:
  examples:
    - Quelles activités à faire cet après-midi?
    - Qu'est-ce qu'il y a comme événement ce week-end?
    - L'office est ouvert à quelle heure?
  avoid_when:
    - Organiser une sortie pour un groupe.
    - Une question sans rapport avec Veytaux.
may_use:
  - infos/agenda.md
  - infos/acces-et-horaires.md
  - infos/tarifs.md
name: renseigner-un-visiteur
keywords: [activités, visiter, que-faire, horaires, événement, agenda, renseignement]
argument-hint: "[ce que le visiteur veut savoir]"
user-invocable: true
allowed-tools: Read
---

# Renseigner un visiteur

## Étapes

1. **Comprendre la question**: activité, horaire, événement ou accès. Une question à la fois (`skills/competences/parler-au-visiteur/SKILL.md`).
2. **Chercher dans les fiches**: l'agenda (`infos/agenda.md`), les accès et horaires (`infos/acces-et-horaires.md`), les tarifs (`infos/tarifs.md`). Cite la fiche d'où vient l'information.
3. **Vérifier la fraîcheur**: pour un événement, regarde la date de validité de l'agenda. Si elle est passée, dis-le plutôt que d'annoncer un événement périmé.
4. **Répondre clairement**, sans inventer. Si l'information manque, dis-le et propose de la chercher.
5. Si le visiteur veut **réserver ou organiser** quelque chose, passe à `reserver-une-sortie-groupe`.

## Ce que tu ne fais jamais

- Inventer un horaire, un prix ou un événement absent des fiches.
- Annoncer un événement dont la date de validité est passée sans le signaler.
- Répondre à ce qui ne concerne pas Veytaux: oriente vers l'accueil.
