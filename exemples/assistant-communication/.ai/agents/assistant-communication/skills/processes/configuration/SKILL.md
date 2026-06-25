---
schema_version: base.resource.v1
id: configuration
type: process
title: Configuration de la communication
description: Configurer l'entreprise et la charte de communication pas à pas.
scope: team
status: active
sensitivity: internal
use_when: Quand l'utilisateur démarre l'assistant communication, veut configurer l'entreprise ou quand les fichiers métier contiennent des placeholders.
user-invocable: true
allowed-tools: Read Write Edit Glob Grep
---

# Configuration de la communication

Guider l'utilisateur pas à pas pour configurer toutes les informations nécessaires au fonctionnement de l'assistant communication. Ce process se lance à la première utilisation ou quand les fichiers métier contiennent encore des placeholders.

## Inputs

Avant de commencer, vérifie:
- **`entreprise/identite.md`**: contient-il des placeholders (`[...]`) ou est-il rempli?
- **`entreprise/charte-editoriale.md`**: contient-il des données réelles ou le template vide?
- **`charte/ton-et-style.md`**: contient-il des données réelles ou le template vide?

Si tout est déjà rempli, informe l'utilisateur et propose de passer directement à la création de contenu.

Si `.ai/journal/` contient des entrées récentes, lis-les pour reprendre le contexte.

## Étapes

### 1. Accueil

> «Bienvenue! Je suis votre assistant communication. Avant de pouvoir créer du contenu adapté à votre entreprise, j'ai besoin de vous connaître un peu. Je vais vous poser quelques questions, ça prend environ 10 minutes. On commence?»

### 2. Identité de l'entreprise

Pose les questions une par une. Ne passe à la suivante que quand la réponse est claire.

Questions:
- Nom de l'entreprise
- Adresse complète
- Numéro IDE (si applicable)
- Forme juridique (SA, Sàrl, raison individuelle, etc.)
- Activité principale (en une phrase)
- Nombre de personnes dans l'équipe
- Types de clients (particuliers, entreprises, collectivités, etc.)
- Email de contact
- Téléphone
- Site web (si existant)

> «Voici ce que j'ai noté: [résumé]. Est-ce correct?»

← Reformulation

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer ces informations dans votre fiche entreprise. Confirmez-vous?»

Écris dans `entreprise/identite.md`. Utilise `[A COMPLETER: ...]` pour les champs non renseignés.

### 3. Approche éditoriale

> «Avant de définir votre ton de voix, parlons de votre approche globale de la communication.»

Pose les questions une par une:
- Pourquoi communiquez-vous? Quel est l'objectif principal? (ex. partager votre expertise, créer de la confiance, attirer de nouveaux clients)
- Quelle image souhaitez-vous projeter? (ex. une entreprise proche, compétente, innovante)
- Sur quels canaux communiquez-vous? (ex. LinkedIn, newsletter, site web) Et à quelle fréquence?
- Qui relit et valide les contenus avant publication?

> «Voici votre approche éditoriale:
> - **Objectif**: [pourquoi]
> - **Image**: [quelle image]
> - **Canaux**: [liste avec fréquence]
> - **Validation**: [processus]
>
> Est-ce que cela correspond?»

← Reformulation

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer votre approche éditoriale. Confirmez-vous?»

Écris dans `entreprise/charte-editoriale.md`.

### 4. Charte éditoriale: ton et style

> «Passons maintenant à votre voix de marque. C'est ce qui rend votre communication reconnaissable et cohérente.»

Pose les questions une par une:
- Comment décrivez-vous la personnalité de votre entreprise? (ex. innovante, rassurante, accessible, experte, chaleureuse)
- Quel registre de langue utilisez-vous? (vouvoiement ou tutoiement, formel ou décontracté)
- Quels adjectifs aimeriez-vous que vos clients associent à votre entreprise? (ex. fiable, moderne, proche)
- Y a-t-il des mots ou expressions que vous utilisez souvent? Ou que vous évitez?
- Avez-vous des exemples de communications passées qui vous représentent bien?

Si l'utilisateur hésite, propose des exemples concrets:
> «Par exemple, une fiduciaire pourrait avoir un ton rassurant et précis, tandis qu'une agence créative serait plutôt dynamique et directe. Qu'est-ce qui vous ressemble le plus?»

> «Voici votre voix de marque telle que je la comprends:
> - **Personnalité**: [adjectifs]
> - **Registre**: [formel/décontracté, vouvoiement/tutoiement]
> - **Mots-clés**: [mots à privilégier]
> - **À éviter**: [mots ou registres à éviter]
>
> Est-ce que cela vous correspond?»

← Reformulation

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer votre voix de marque. Confirmez-vous?»

Écris dans `charte/ton-et-style.md`.

### 5. Thèmes clés

> «Maintenant, parlons de ce sur quoi vous communiquez. Quels sont les grands sujets que votre entreprise aborde dans sa communication?»

Questions:
- Quels sont les 3 à 5 thèmes principaux sur lesquels vous communiquez? (ex. innovation, durabilité, expertise métier, vie d'équipe, conseils pratiques)
- Y a-t-il des sujets sur lesquels vous ne communiquez jamais? (ex. politique, sujets polémiques)
- Quelle est la répartition souhaitée entre contenu éducatif, promotionnel et relationnel?

Si l'utilisateur ne sait pas, propose des catégories courantes:
> «Beaucoup de PME communiquent sur ces axes: leur expertise métier, les coulisses de l'équipe, des conseils pratiques pour leurs clients, et leurs actualités. Qu'est-ce qui vous parle?»

> «Vos thèmes clés:
> 1. [Thème 1]: [brève description]
> 2. [Thème 2]: [brève description]
> 3. [Thème 3]: [brève description]
>
> Des ajustements?»

← Reformulation

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer vos thèmes clés. Confirmez-vous?»

Écris dans `charte/themes-cles.md`.

### 6. Audiences cibles

> «Dernière étape: à qui parlez-vous? Décrivons ensemble vos audiences principales.»

Pour chaque audience, demande:
- Qui sont-ils? (rôle, secteur, profil)
- Qu'est-ce qui les préoccupe? (besoins, problèmes, aspirations)
- Où les trouvez-vous? (LinkedIn, email, événements, bouche-à-oreille)
- Quel ton fonctionne le mieux avec eux? (formel, accessible, expert)

Après chaque audience, demande: «Une autre audience à ajouter?»

> «Vos audiences cibles:
> 1. **[Nom du persona]**: [description courte], préoccupé par [besoins], joignable via [canaux]
> 2. **[Nom du persona]**: [description courte], préoccupé par [besoins], joignable via [canaux]
>
> Est-ce complet?»

← Reformulation

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer vos audiences cibles. Confirmez-vous?»

Écris dans `audiences/personas.md`.

### 7. Récapitulatif

> «Parfait! Votre assistant communication est configuré. Voici un résumé:
>
> **Entreprise:** [nom], [activité]
> **Voix de marque:** [adjectifs clés du ton]
> **Thèmes:** [liste courte des thèmes]
> **Audiences:** [nombre] audiences définies
>
> Tout est en ordre. Vous pouvez maintenant me demander de créer un post LinkedIn, rédiger une newsletter, ou vous aider à répondre à un client.»

Confirme:
- [ ] Identité de l'entreprise remplie
- [ ] Approche éditoriale définie
- [ ] Charte de ton et style définie
- [ ] Thèmes clés identifiés
- [ ] Audiences cibles décrites

### 8. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`.

## Ce que tu ne fais jamais dans ce process

- **Inventer des informations manquantes.** Si l'utilisateur ne répond pas à une question, utilise `[A COMPLETER: ...]`. Ne devine jamais un ton, une audience ou un thème.
- **Poser toutes les questions d'un coup.** Une question à la fois.
- **Écrire dans un fichier sans point de décision.** Chaque écriture est précédée d'un point de décision explicite.
- **Sauter une étape.** Même si l'utilisateur veut aller vite.
- **Imposer un ton ou un style.** L'identité de communication appartient à l'entreprise. Tu proposes des options, tu ne décides pas.
