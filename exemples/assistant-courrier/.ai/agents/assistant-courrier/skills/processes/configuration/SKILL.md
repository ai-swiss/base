---
schema_version: base.resource.v1
id: configuration
type: process
title: Configuration de la correspondance
description: Configurer l'entreprise, le signataire et le style de correspondance pas à pas.
scope: team
status: active
sensitivity: internal
use_when: Quand l'utilisateur démarre l'assistant courrier, veut configurer son entreprise ou quand les fichiers métier contiennent des placeholders.
routing:
  examples:
    - Bonjour je veux configurer mon assistant courrier
    - première utilisation
    - paramétrer mon identité et mes formules de politesse
    - mettre à jour les informations de mon entreprise
  avoid_when:
    - L'utilisateur veut rédiger un courrier avec une entreprise déjà configurée.
    - L'utilisateur veut répondre à un message reçu.
name: configuration
keywords: [configurer, paramétrer, identité, signataire, ton, formules, démarrer]
user-invocable: true
allowed-tools: Read Write Edit Glob Grep
---

# Configuration de la correspondance

Guider l'utilisateur pas à pas pour configurer toutes les informations nécessaires au fonctionnement de l'assistant courrier. Ce process se lance à la première utilisation ou quand les fichiers métier contiennent encore des placeholders.

## Inputs

Avant de commencer, vérifie:
- **`entreprise/identite.md`**: contient-il des placeholders (`[...]`) ou est-il rempli?
- **`entreprise/style-correspondance.md`**: contient-il des données réelles ou le template vide?

Si tout est déjà rempli, informe l'utilisateur et propose de passer directement à la rédaction d'un courrier.

Si `.ai/journal/` contient des entrées récentes, lis-les pour reprendre le contexte.

## Étapes

### 1. Accueil

> «Bienvenue! Je suis votre assistant courrier. Avant de pouvoir rédiger des courriers et emails à votre image, j'ai besoin de vous connaître un peu. Je vais vous poser quelques questions, ça prend environ 10 minutes. On commence?»

### 2. Identité de l'entreprise

Pose les questions une par une. Ne passe à la suivante que quand la réponse est claire.

Questions:
- Nom de l'entreprise
- Adresse complète (pour l'en-tête des courriers)
- Numéro IDE (si applicable)
- Forme juridique (SA, Sàrl, raison individuelle, etc.)
- Activité principale (en une phrase)
- Email de contact
- Téléphone
- Site web (si existant)

> «Voici ce que j'ai noté: [résumé]. Est-ce correct?»

← Reformulation

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer ces informations dans votre fiche entreprise. Confirmez-vous?»

Écris dans `entreprise/identite.md`. Utilise `[A COMPLETER: ...]` pour les champs non renseignés.

### 3. Signataire par défaut

> «Qui signe habituellement les courriers? C'est le nom et la fonction qui apparaîtront au bas de vos lettres et emails.»

Pose les questions une par une:
- Nom et prénom du signataire principal
- Fonction (ex. Directrice, Responsable administratif, Gérant)
- Y a-t-il d'autres signataires possibles selon le contexte?
- Faut-il une formule de signature particulière (ex. «Pour [Entreprise],»)?

> «Voici le signataire par défaut:
> - **Nom**: [nom]
> - **Fonction**: [fonction]
>
> Est-ce correct?»

← Reformulation

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer le signataire dans votre fiche entreprise. Confirmez-vous?»

Complète `entreprise/identite.md` avec la section signataire.

### 4. Style et registre de correspondance

> «Passons maintenant à votre manière d'écrire. C'est ce qui rend vos courriers reconnaissables et cohérents.»

Pose les questions une par une:
- Vouvoyez-vous toujours vos destinataires? (en Suisse romande, le vouvoiement est la norme en B2B)
- Quel niveau de formalité souhaitez-vous? (très formel, professionnel et chaleureux, direct et accessible)
- Avez-vous des formules d'appel préférées? (ex. «Madame, Monsieur,», «Cher Monsieur,», «Bonjour,»)
- Avez-vous des formules de politesse de clôture préférées? (ex. «Nous vous prions d'agréer, Madame, Monsieur, nos salutations distinguées.»)
- Y a-t-il des mots ou tournures que vous utilisez souvent? Ou que vous évitez?

Si l'utilisateur hésite, propose des exemples concrets:
> «Par exemple, une fiduciaire aura un ton formel et précis, tandis qu'un artisan adoptera un ton plus direct et chaleureux. Qu'est-ce qui vous ressemble le plus?»

> «Voici votre style de correspondance tel que je le comprends:
> - **Adresse**: [vouvoiement / tutoiement]
> - **Formalité**: [niveau]
> - **Formule d'appel courante**: [formule]
> - **Formule de politesse courante**: [formule]
> - **À éviter**: [mots ou registres]
>
> Est-ce que cela vous correspond?»

← Reformulation

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer votre style de correspondance. Confirmez-vous?»

Écris dans `entreprise/style-correspondance.md`.

### 5. Récapitulatif

> «Parfait! Votre assistant courrier est configuré. Voici un résumé:
>
> **Entreprise:** [nom], [activité]
> **Signataire:** [nom], [fonction]
> **Style:** [niveau de formalité], [formule d'appel courante]
>
> Tout est en ordre. Vous pouvez maintenant me demander de rédiger un courrier, un email, ou de répondre à un message reçu.»

Confirme:
- [ ] Identité de l'entreprise remplie
- [ ] Signataire par défaut défini
- [ ] Style de correspondance défini

### 6. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`.

## Ce que tu ne fais jamais dans ce process

- **Inventer des informations manquantes.** Si l'utilisateur ne répond pas à une question, utilise `[A COMPLETER: ...]`. Ne devine jamais un ton, une formule ou un signataire.
- **Poser toutes les questions d'un coup.** Une question à la fois.
- **Écrire dans un fichier sans point de décision.** Chaque écriture est précédée d'un point de décision explicite.
- **Sauter une étape.** Même si l'utilisateur veut aller vite.
- **Imposer un ton ou des formules.** L'identité de correspondance appartient à l'entreprise. Tu proposes des options, tu ne décides pas.
