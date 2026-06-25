---
schema_version: base.resource.v1
id: rediger-courrier
type: process
title: Rédiger un courrier ou un email
description: Rédiger un courrier ou un email professionnel de A à Z à partir d'un brief.
scope: team
status: active
sensitivity: internal
use_when: Quand l'utilisateur veut rédiger, écrire ou préparer un nouveau courrier, une lettre ou un email à un client, fournisseur ou partenaire.
routing:
  examples:
    - Rédige un courrier de relance pour Dupont SA
    - écrire un email de confirmation à un client
    - préparer une lettre de remerciement
    - j'ai besoin d'un courrier pour mon fournisseur
  avoid_when:
    - Répondre à un message déjà reçu.
    - Paramétrage initial de l'entreprise.
name: rediger-courrier
keywords: [rédiger, écrire, courrier, lettre, email, relance, confirmation, remerciement, demande]
argument-hint: "[destinataire et objet du courrier]"
user-invocable: true
allowed-tools: Read Write Edit Glob Grep
---

# Rédiger un courrier ou un email

Rédiger un courrier ou un email professionnel de A à Z: comprendre l'intention, choisir le bon format et le bon registre, rédiger dans le ton de l'entreprise, et valider avant envoi.

## Inputs

Demande à l'utilisateur:
- **Le destinataire**: qui reçoit ce courrier? (nom, rôle, type de relation: client, fournisseur, partenaire)
- **L'intention**: que veut-on obtenir? (informer, demander, confirmer, relancer, remercier, refuser poliment)
- **Les points clés**: les faits à transmettre (texte libre)
- **Le format souhaité**: courrier formel (lettre) ou email? Si non précisé, le proposer selon le contexte.

Avant de commencer, vérifie que les fichiers suivants sont remplis:
- `entreprise/identite.md`: sinon, charge `skills/processes/configuration/SKILL.md`
- `entreprise/style-correspondance.md`: sinon, charge `skills/processes/configuration/SKILL.md`

Si `.ai/journal/` contient des entrées récentes, lis-les pour le contexte.

## Étapes

### 1. Comprendre l'intention

Lis la demande et reformule-la en termes clairs:

> «Si je comprends bien, vous souhaitez écrire à:
> - **Destinataire**: [nom et type de relation]
> - **Intention**: [informer / demander / confirmer / relancer / remercier / refuser]
> - **Points clés à transmettre**: [liste reformulée]
> - **Résultat attendu**: [ce que le destinataire doit comprendre ou faire]
>
> Est-ce correct? Y a-t-il des précisions à ajouter?»

Clarifie si nécessaire:
- Y a-t-il une date, un montant, un délai ou un engagement à mentionner? Demande-les précisément - ne les invente jamais.
- Y a-t-il un historique avec ce destinataire (courrier précédent, dossier en cours)?
- Y a-t-il des éléments à ne surtout pas mentionner?

Si un fait nécessaire manque (prix, date, référence), marque-le `[A COMPLETER: ...]` et demande-le. Tu n'inventes jamais un fait: c'est l'humain qui signe.

← Reformulation

### 2. Choisir le format et le registre

Lis `entreprise/style-correspondance.md` et la compétence `skills/competences/metier-courrier/SKILL.md`.

Détermine, et propose à l'utilisateur:
- **Format**: lettre formelle (sujets officiels, contractuels, premiers contacts) ou email (échanges courants, suivis rapides)?
- **Registre**: formel, professionnel chaleureux, ou direct, selon le destinataire et le style de l'entreprise
- **Formule d'appel** et **formule de politesse** adaptées (voir la compétence métier)

> «Pour ce message, je propose:
> - **Format**: [lettre / email]
> - **Registre**: [niveau de formalité]
> - **Formule d'appel**: «[formule]»
> - **Formule de politesse**: «[formule]»
>
> Cela vous convient, ou préférez-vous un autre registre?»

← Reformulation

### 3. Proposer une structure

Propose un plan en quelques points avant de rédiger:

> «Voici la structure que je propose:
> 1. **Ouverture**: [accroche / objet du courrier]
> 2. **Corps**: [point clé 1, point clé 2...]
> 3. **Demande ou conclusion**: [ce qu'on attend du destinataire]
> 4. **Clôture**: formule de politesse et signature
>
> Faut-il ajouter, retirer ou réorganiser quelque chose?»

← Reformulation

### 4. Rédiger le courrier

Rédige le courrier complet en respectant:
- La structure validée et le registre choisi
- Le ton de `entreprise/style-correspondance.md`
- Les formules d'appel et de politesse suisses romandes (voir la compétence métier)
- **Aucun fait inventé**: tout prix, date, montant ou engagement provient de l'utilisateur ou reste un marqueur `[A COMPLETER: ...]`

Présente le courrier avec une mise en forme lisible:

> «Voici le courrier que je propose:
>
> ---
>
> [Texte complet du courrier, en-tête, corps, formule de politesse, signature]
>
> ---
>
> Format: [lettre / email]
> Registre: [description]
> Destinataire: [nom]»

Signale tout marqueur restant:
> «Note: j'ai laissé [A COMPLETER: ...] là où une information me manque. Pouvez-vous me la donner?»

### 5. Réviser et ajuster

> «Qu'en pensez-vous? Souhaitez-vous:
> - Ajuster le ton (plus formel, plus direct)?
> - Modifier ou compléter un passage?
> - Changer la formule de politesse?
> - Ajouter ou retirer une information?
>
> N'hésitez pas à me dire ce qui ne vous ressemble pas.»

← Reformulation

Itère autant de fois que nécessaire. Chaque modification est présentée en entier pour relecture facile.

### 6. Finaliser et enregistrer

**⚠ Point de décision - avant écriture:**
> «Je suis prêt à enregistrer le courrier validé dans `courriers/[nom-fichier].md`. Confirmez-vous?»

Enregistre le courrier validé dans `courriers/YYYY-MM-DD_destinataire_objet.md` en utilisant le template `templates/courrier_v1.md` (lettre) ou `templates/email_v1.md` (email).

> «Votre courrier est enregistré:
> - Document: `courriers/[nom-fichier].md`
>
> **Important: relisez une dernière fois avant d'envoyer et de signer.** Vérifiez en particulier les noms, dates, montants et engagements. C'est vous qui signez et envoyez, je ne peux pas le faire à votre place.
>
> Souhaitez-vous rédiger un autre courrier?»

### 7. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`.

## Ce que tu ne fais jamais dans ce process

- **Envoyer ou signer à la place de l'utilisateur.** Tu rédiges, tu proposes. L'envoi et la signature sont toujours la responsabilité de l'utilisateur.
- **Inventer un fait.** Prix, date, montant, délai, engagement: si tu ne l'as pas, c'est `[A COMPLETER: ...]`, jamais une supposition. L'humain signe, donc l'humain doit pouvoir tout vérifier.
- **Ignorer le style de l'entreprise.** Toujours lire `entreprise/style-correspondance.md` avant de rédiger.
- **Rédiger sans avoir validé l'intention.** L'étape 1 doit être complétée et validée avant toute rédaction.
- **Utiliser un registre que l'entreprise n'utilise pas.** Le ton appartient à l'entreprise.
