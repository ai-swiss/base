---
schema_version: base.resource.v1
id: clarifier-une-decision
type: process
title: Clarifier une décision
description: Décomposer une décision hésitante en contexte, critères, options et hypothèses, en validant à chaque étape, sans trancher à la place de la personne.
scope: personal
status: active
sensitivity: internal
use_when: Quand la personne hésite, doit choisir entre des options, ou veut y voir plus clair avant de trancher une décision.
routing:
  examples:
    - Aide-moi à clarifier une décision que j'hésite à prendre
    - Je dois choisir entre deux options et je n'arrive pas à trancher
    - Aide-moi à peser le pour et le contre de ce choix
    - J'hésite, peux-tu m'aider à y voir clair
  avoid_when:
    - Mettre par écrit une décision déjà prise et réfléchie.
    - Explorer une question ouverte sans choix précis à faire.
    - Paramétrage initial de l'espace.
name: clarifier-une-decision
keywords: [décision, choix, hésiter, trancher, dilemme, options, critères, pour et contre, je ne sais pas si]
argument-hint: "[la décision ou le dilemme]"
user-invocable: true
allowed-tools: Read Write Edit Glob Grep
---

# Clarifier une décision

Aider la personne à y voir clair sur une décision, en découpant le raisonnement en morceaux qu'elle peut vérifier. Le but n'est pas que tu décides: c'est qu'à la fin, elle décide en connaissance de cause, en ayant vu sur quoi son choix repose.

Lis d'abord `skills/competences/validation-aux-bons-moments/SKILL.md`: elle définit où tu dois t'arrêter pour faire valider. Lis aussi `mon-espace/profil.md` pour connaître ce qui compte pour la personne. Si `.ai/journal/` contient une réflexion récente sur le même sujet, lis-la.

## Inputs

- **La décision**: ce que la personne hésite à faire (texte libre, même flou)
- **L'échéance**: y a-t-il un délai pour décider?

## Étapes

La règle du process: **on ne passe à l'étape suivante qu'une fois la précédente validée.** Chaque étape construit sur la précédente; valider au fur et à mesure évite de bâtir une conclusion sur un malentendu.

### 1. Cadrer la décision

Reformule la décision telle que tu la comprends, sans l'élargir ni la réduire:

> «Si je comprends bien, la décision est: **[reformulation]**. Ce n'est pas plutôt [variante proche]? Et y a-t-il une échéance?»

Une décision mal cadrée fausse tout le reste. Ne continue pas tant que le cadre n'est pas confirmé.

← Validation du cadre

### 2. Dégager les critères

Demande, ou propose à partir du profil, ce qui compte pour cette décision précise:

> «Qu'est-ce qui compte le plus pour vous ici? Par exemple: [critère 1], [critère 2], [critère 3]. Lesquels gardez-vous? Y en a-t-il un plus important que les autres?»

Note chaque critère. Si l'un repose sur une supposition («je suppose que le budget est limité»), marque-la `[HYPOTHESE: ...]`.

← Validation des critères

### 3. Lister les options

Reconstitue les options envisagées, et propose celles qui manquent peut-être:

> «Voici les options que je vois: [A], [B]. Il en manque souvent une: ne rien changer pour l'instant, ou une combinaison des deux. Voulez-vous en ajouter ou en écarter?»

← Validation des options

### 4. Rendre visibles les hypothèses et les incertitudes

C'est l'étape qui protège la décision. Pour chaque option, fais remonter ce sur quoi le raisonnement s'appuie mais qui n'est pas certain:

> «Avant de comparer, voici ce sur quoi mon raisonnement repose et que nous n'avons pas vérifié:
> - `[HYPOTHESE: l'option A reste disponible le mois prochain]`
> - `[INCERTITUDE: le coût réel de B, à confirmer]`
>
> Lesquelles voulez-vous vérifier maintenant, et lesquelles assumez-vous en l'état?»

C'est la personne qui décide ce qu'elle vérifie et ce qu'elle assume. Tu ne tranches pas à sa place ce qui mérite vérification.

← Validation: que fait-on de chaque hypothèse et incertitude

### 5. Comparer, sans pousser

Construis un tableau des options par critère (voir `templates/tableau-options_v1.md`). Présente-le à plat, sans recommander:

> «Voici la comparaison option par critère. Je ne recommande pas: je rends visible. Qu'est-ce qui ressort pour vous?»

Si une option l'emporte clairement sur les critères que la personne a jugés prioritaires, tu peux le **constater** («sur vos deux critères prioritaires, B ressort»), sans transformer ce constat en conseil.

← Réaction de la personne

### 6. Laisser la personne conclure

> «La décision vous revient. Voulez-vous: la prendre maintenant, vérifier d'abord une incertitude, ou laisser reposer?»

- Si elle tranche: enregistre le choix `[DECISION: choix | raison]`.
- Si elle veut formaliser: propose le process `preparer-une-note-de-decision`.
- Si elle veut laisser reposer: c'est une issue valable. Garde la structure pour la reprise.

### 7. Enregistrer la réflexion

**⚠ Point de validation - avant écriture:**
> «Je peux enregistrer cette réflexion (cadre, critères, options, hypothèses, comparaison) dans `reflexions/[sujet].md`, pour que vous la retrouviez. Confirmez-vous?»

Enregistre dans `reflexions/YYYY-MM-DD_sujet.md`, en conservant les marqueurs `[HYPOTHESE]`, `[INCERTITUDE]`, `[A VALIDER]` non résolus, pour que l'état du raisonnement reste visible.

### 8. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`. Note les hypothèses et incertitudes restées ouvertes.

## Ce que tu ne fais jamais dans ce process

- **Trancher à la place de la personne**: tu structures et rends visible, elle décide
- **Conclure sans avoir fait valider les hypothèses**: l'étape 4 précède toujours la comparaison
- **Pousser vers une option**: tu présentes équitablement, tu constates au plus, tu ne conseilles pas
- **Cacher une supposition**: ce qui n'est pas certain devient `[HYPOTHESE]` ou `[INCERTITUDE]`, visible
- **Sauter une étape de validation**: on ne construit pas l'étape suivante sur une étape non confirmée
