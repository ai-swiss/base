---
schema_version: base.resource.v1
id: docs-tutoriel-praticien-4-competences-et-modeles
type: document
title: Compétences et modèles
description: Ajoutez une compétence réutilisable et un modèle (template) à votre assistant, référencez-les depuis un process, et générez un document qui se remplit et s'arrête pour validation.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [praticien, compétence, template, modèle, génération, document, may_use, veytaux, tourisme]
audience: [builder]
learning_level: intermediate
---

# Compétences et modèles

*⏱ ~18 min · module 4/9, parcours Praticien*

**Vous allez**: ajouter une compétence et un modèle, les référencer depuis un process, et générer un document qui se remplit et s'arrête pour validation, prouvé par le ✅ ci-dessous.
**Il vous faut**: les modules 1-3 terminés, votre dossier `~/mon-office-tourisme`.
↻ **Rappel**: sans regarder: qu'est-ce qu'un process? (un frontmatter que le routeur lit + un corps que le modèle suit)

Un process dit QUOI faire. Mais deux briques de plus séparent le simple routage d'une demande
de la production d'**un vrai livrable**, et c'est ce qui manque à la plupart des assistants.

- une **compétence** (`type: competence`): un savoir-faire réutilisable (ton, règles, conventions)
  qu'un process **consulte**. On la cite dans plusieurs process plutôt que de se répéter.
- un **modèle / template** (`type: template`): un document à trous qu'on **remplit** plutôt que de
  le suivre. C'est ce qui produit une offre, un courrier, un compte rendu.

1. **Une compétence.** Créez `.ai/agents/mon-office-tourisme/skills/competences/parler-au-visiteur/SKILL.md`:

   ```
   ---
   schema_version: base.resource.v1
   id: parler-au-visiteur
   type: competence
   title: Parler au visiteur
   description: "Ton et clarté pour parler aux visiteurs. À consulter dans toute interaction."
   scope: team
   status: active
   sensitivity: internal
   name: parler-au-visiteur
   user-invocable: false
   allowed-tools: Read
   ---

   # Parler au visiteur

   - Dans la langue du visiteur, accueillant et bref.
   - Une question à la fois.
   - Annoncer le prix au barème, jamais un chiffre inventé.
   ```

2. **Un modèle.** Créez `.ai/agents/mon-office-tourisme/templates/offre-groupe_v1.md`. Un template porte des
   `[PLACEHOLDERS]` à remplir et un `[A VALIDER]` là où un humain doit trancher:

   ```
   ---
   schema_version: base.resource.v1
   id: template-offre-groupe
   type: template
   title: Trame d'offre de sortie de groupe
   description: Modèle d'offre à remplir (un template se remplit, il ne se suit pas).
   scope: team
   status: active
   sensitivity: internal
   ---
   # Offre de sortie de groupe: [NOM_GROUPE]

   **Type:** [TYPE_GROUPE]  ·  **Personnes:** [NOMBRE_PERSONNES]
   | Poste | Montant (CHF) |
   |-------|---------------|
   | Visite guidée | [NOMBRE_PERSONNES] x [PRIX_PAR_PERSONNE] = [SOUS_TOTAL] |
   | **Total** | **[TOTAL] [A VALIDER]** |
   ```

3. **Un process qui les utilise.** Créez `.ai/agents/mon-office-tourisme/skills/processes/reserver-une-sortie-groupe/SKILL.md`.
   Il `may_use` le modèle, et **consulte la compétence dans son corps**:

   ```
   ---
   schema_version: base.resource.v1
   id: reserver-une-sortie-groupe
   type: process
   title: Réserver une sortie de groupe
   description: "Chiffrer une sortie de groupe et préparer une offre depuis le modèle."
   scope: team
   status: active
   sensitivity: internal
   use_when: Quand quelqu'un veut organiser une visite ou une sortie pour un groupe à Veytaux.
   routing:
     examples:
       - Organiser une sortie pour notre groupe de 30 personnes
   may_use:
     - templates/offre-groupe_v1.md
   name: reserver-une-sortie-groupe
   user-invocable: true
   allowed-tools: Read
   ---

   # Réserver une sortie de groupe

   ## Étapes
   1. Recueillir les besoins (type de groupe, date, nombre de personnes), une question à la fois
      (compétence `skills/competences/parler-au-visiteur/SKILL.md`).
   2. Remplir le modèle `templates/offre-groupe_v1.md`: compléter les `[PLACEHOLDERS]`.
   3. Laisser `[A VALIDER]` sur le total. Ne rien envoyer sans accord.
   ```

4. **Générez le document.** Dans votre outil IA, sur `~/mon-office-tourisme`, demandez:
   *«prépare une offre pour une sortie de groupe de 30 personnes»*. L'assistant route vers
   `reserver-une-sortie-groupe`, suit la compétence (ton, une question à la fois), **remplit le modèle**, et laisse
   `[A VALIDER]` sur le total. Comme en Découverte: il propose, rien n'est écrit sans vous.

```routage-fixture
Organiser une sortie pour notre groupe de 30 personnes
```

✅ **Vérifiez**: `base validate --root .` passe (compétence, modèle et process sont des ressources valides); `base route "Organiser une sortie pour notre groupe de 30 personnes" --root .` route vers `reserver-une-sortie-groupe`; et l'offre générée a ses `[PLACEHOLDERS]` remplis avec un `[A VALIDER]` sur le montant.

💡 **Pourquoi ça a marché**: un process orchestre, une **compétence** factorise un savoir-faire réutilisable, un **modèle** porte la forme du livrable. Le routeur ne lit que le frontmatter (use_when, examples); le corps, lui, pointe vers la compétence et le modèle, que le modèle de langage applique ensuite. Le `[A VALIDER]` dans le modèle demande qu'un humain tranche le chiffre: la consigne est que la génération s'arrête plutôt que de décider à votre place.

🔁 **Chez vous**: quel document répétitif de votre métier (devis, courrier-type, compte rendu) gagnerait à devenir un modèle à trous? Quel savoir-faire (un ton, des règles) mérite une compétence réutilisable?

→ **Et maintenant**: [Module 5: les données qui périment](praticien-5-donnees-qui-periment.md): le cycle de vie d'une expertise.

🆘 **Pannes courantes**: *`base route` ne trouve pas `reserver-une-sortie-groupe`*: rapprochez vos `routing.examples` d'une vraie demande de sortie de groupe. *L'assistant invente un total au lieu de `[A VALIDER]`*: l'étape 3 doit l'exiger explicitement, et le modèle doit porter le marqueur. *validate échoue*: un template n'a ni `name` ni `user-invocable`; une compétence, si (gardez la forme des squelettes).
