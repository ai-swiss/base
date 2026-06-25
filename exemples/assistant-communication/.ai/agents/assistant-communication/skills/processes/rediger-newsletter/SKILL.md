---
schema_version: base.resource.v1
id: rediger-newsletter
type: process
title: Rédiger une newsletter
description: Rédiger une newsletter professionnelle de A à Z.
scope: team
status: active
sensitivity: internal
use_when: Quand l'utilisateur veut créer une newsletter, un email ou une infolettre.
argument-hint: "[thème ou sujet principal de la newsletter]"
user-invocable: true
allowed-tools: Read Write Edit Glob Grep
---

# Rédiger une newsletter

Rédiger une newsletter professionnelle de A à Z: définir l'objectif, structurer le contenu, rédiger section par section, et valider l'ensemble.

## Inputs

Demande à l'utilisateur:
- **Le thème ou sujet principal**: de quoi parle cette newsletter?
- **Les messages clés (1 à 3)**: qu'est-ce que le lecteur doit retenir?
- **L'audience cible**: à qui s'adresse cette newsletter? Si non précisé, utiliser l'audience principale dans `audiences/personas.md`

Avant de commencer, vérifie que les fichiers suivants sont remplis:
- `entreprise/identite.md`: sinon, charge `skills/processes/configuration/SKILL.md`
- `charte/ton-et-style.md`: sinon, charge `skills/processes/configuration/SKILL.md`

Si `.ai/journal/` contient des entrées récentes, lis-les pour le contexte.

## Étapes

### 1. Comprendre l'objectif et les messages clés

Lis la demande et reformule-la:

> «Si je comprends bien:
> - **Thème**: [reformulation du sujet]
> - **Message clé 1**: [reformulation]
> - **Message clé 2**: [reformulation] (si applicable)
> - **Message clé 3**: [reformulation] (si applicable)
> - **Objectif**: [informer / fidéliser / promouvoir / éduquer]
> - **Audience**: [persona cible]
>
> Est-ce correct?»

Clarifie si nécessaire:
- Y a-t-il une action que le lecteur doit faire après la lecture? (visiter un lien, répondre, s'inscrire)
- Y a-t-il une date ou un événement lié? (offre limitée, événement à venir)
- Quelle est la longueur souhaitée? (courte: 2 min de lecture, moyenne: 5 min, longue: 10 min)

← Reformulation

### 2. Vérifier la cohérence avec la charte et les publications récentes

Lis `charte/ton-et-style.md`, `charte/themes-cles.md` et les publications récentes dans `publications/`.

Lis aussi la compétence `skills/competences/metier-communication/SKILL.md` pour les bonnes pratiques newsletter.

Vérifie:
- Le sujet est-il cohérent avec les thèmes clés?
- N'a-t-on pas publié sur le même sujet récemment?
- Le ton prévu correspond-il à la charte?

Si un sujet similaire a été traité récemment, signale-le:
> «Je note que vous avez publié sur [sujet similaire] le [date]. Souhaitez-vous un angle différent ou un complément?»

### 3. Proposer une structure

Propose une structure avec des sections claires:

> «Voici la structure que je propose:
>
> **Objet de l'email**: [proposition d'objet accrocheur]
>
> 1. **Introduction**: [accroche + contexte en 2-3 phrases]
> 2. **Section principale**: [message clé 1, développé]
> 3. **Section secondaire**: [message clé 2, si applicable]
> 4. **Appel à l'action**: [ce que le lecteur doit faire]
> 5. **Conclusion**: [mot de fin + signature]
>
> Qu'en pensez-vous? Faut-il ajouter, retirer ou réorganiser des sections?»

← Reformulation

### 4. Rédiger section par section

Rédige chaque section individuellement et présente-la pour validation:

> «Voici la première section, l'introduction:
>
> ---
> [Texte de l'introduction]
> ---
>
> Est-ce que le ton et le contenu vous conviennent?»

Après validation, passe à la section suivante. Répète pour chaque section.

Règles de rédaction:
- **Un message par section.** Ne pas mélanger plusieurs idées dans une même section.
- **Phrases courtes.** Le lecteur scanne avant de lire. Facilitez le survol.
- **Ton conforme à la charte.** Relis `charte/ton-et-style.md` si besoin.
- **Lisible sur mobile.** Paragraphes courts (3-4 lignes max), sous-titres clairs.
- **Personnalisation.** Utiliser le prénom si possible («Bonjour [Prénom]»).

← Reformulation (validation de chaque section avant de passer à la suivante)

### 5. Relecture complète

Présente la newsletter complète d'un seul tenant:

> «Voici la newsletter complète:
>
> ---
>
> **Objet**: [objet de l'email]
>
> [Texte complet de la newsletter, toutes sections assemblées]
>
> ---
>
> **Résumé**:
> - Longueur: environ [nombre] mots ([X] minutes de lecture)
> - Ton: [description]
> - Messages clés: [liste]
> - Appel à l'action: [description]
>
> Souhaitez-vous modifier quelque chose avant de finaliser?»

← Reformulation

### 6. Finaliser et enregistrer

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer la newsletter validée dans `publications/[nom-fichier].md`. Confirmez-vous?»

Enregistre la newsletter validée dans `publications/YYYY-MM-DD_newsletter_sujet.md` en utilisant le template `templates/newsletter_v1.md`.

> «Votre newsletter est enregistrée:
> - Document: `publications/[nom-fichier].md`
>
> **Important: relisez une dernière fois avant d'envoyer.** Vérifiez en particulier:
> - Les liens fonctionnent
> - Le nom et l'objet sont corrects
> - L'appel à l'action est clair
>
> L'envoi est votre responsabilité. Copiez le contenu dans votre outil d'emailing.
>
> Souhaitez-vous créer un autre contenu?»

### 7. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`.

## Ce que tu ne fais jamais dans ce process

- **Envoyer la newsletter.** Tu rédiges, tu proposes. L'envoi via l'outil d'emailing est toujours la responsabilité de l'utilisateur.
- **Remplir avec du contenu générique.** Chaque phrase doit apporter de la valeur.
- **Mettre plus d'un message par section.** Une section = un message clé.
- **Rédiger sans avoir validé la structure.** L'étape 3 doit être validée avant de commencer à écrire.
- **Ignorer les publications récentes.** Toujours vérifier `publications/` pour éviter les répétitions.
