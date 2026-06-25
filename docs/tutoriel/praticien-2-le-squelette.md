---
schema_version: base.resource.v1
id: docs-tutoriel-praticien-2-le-squelette
type: document
title: Votre projet, et son premier process
description: Créez votre vrai projet avec base init (autonome, où qu'il soit), puis écrivez un premier process à partir d'un squelette et faites-le valider et router.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [praticien, base init, projet, process, squelette, validate, route, veytaux, tourisme]
audience: [builder]
learning_level: intermediate
---

# Votre projet, et son premier process

*⏱ ~20 min · module 2/9, parcours Praticien*

**Vous allez**: créer votre vrai projet avec `base init`, puis y écrire un premier process qui valide et route, prouvé par le ✅ ci-dessous.
**Il vous faut**: le module 1 terminé, un terminal à la racine du dépôt.
↻ **Rappel**: sans regarder: que décrit un bon use_when? (l'intention, pas le titre)

Jusqu'ici vous lisiez l'office du tourisme de Veytaux une fois terminé. Vous créez maintenant VOTRE projet: un vrai, autonome, hors du dépôt.

1. Depuis le dépôt (où `base` = `node .ai/base.mjs`, voir [l'étape 0](harnais.md)), créez votre
   projet ailleurs. `init` montre d'abord ce qu'il créerait, sans rien écrire:

   ```
   base init --root ~/mon-office-tourisme
   ```

   Relancez avec `--yes` pour appliquer:

   ```
   base init --root ~/mon-office-tourisme --yes
   ```

   Il crée un agent, `base.config.json` (avec `framework_dir`: OÙ vit le moteur), le lanceur
   `.ai/base.mjs`, et les fichiers que votre outil IA lit en ouvrant le dossier.

2. Entrez dans votre projet. Désormais, ici, `base` = `node .ai/base.mjs`. Tout fonctionne même si
   vous avez quitté le dépôt, parce qu'`init` a noté où se trouve le moteur:

   ```
   cd ~/mon-office-tourisme
   ```

Plutôt que recopier le corpus fini, vous remplissez un squelette: l'effort vous force à comprendre.

3. `init` a créé un agent nommé d'après votre dossier (`mon-office-tourisme`). Créez-lui un premier
   process dans `.ai/agents/mon-office-tourisme/skills/processes/renseigner-un-visiteur/SKILL.md`. Partez
   de ce squelette et remplissez les `<A COMPLETER>`:

   ```
   ---
   schema_version: base.resource.v1
   id: renseigner-un-visiteur
   type: process
   title: Renseigner un visiteur
   description: "<A COMPLETER: une phrase>"
   scope: team
   status: active
   sensitivity: internal
   use_when: <A COMPLETER: quand le routeur doit choisir CE process>
   routing:
     examples:
       - <A COMPLETER: une vraie phrase de visiteur>
   name: renseigner-un-visiteur
   user-invocable: true
   allowed-tools: Read
   ---

   # Renseigner un visiteur

   ## Étapes
   1. Comprendre la question du visiteur.
   2. <A COMPLETER: l'étape qui vérifie la fraîcheur de l'info (la date de l'agenda)>
   3. <A COMPLETER: l'étape de validation humaine, quel marqueur?>
   ```

4. **Prédisez** le résultat, puis lancez `base validate --root .` et
   `base route "<votre phrase d'exemple>" --root .`.

✅ **Vérifiez**: `base validate` dit «BASE valide»; `base route` sur votre phrase d'exemple route vers `renseigner-un-visiteur`; et tout ça depuis un dossier HORS du dépôt, preuve que votre projet est autonome. Comparez ensuite avec le fini: `exemples/veytaux-tourisme/.ai/agents/office-tourisme/skills/processes/renseigner-un-visiteur/SKILL.md`.

💡 **Pourquoi ça a marché**: au-delà des fichiers, `base init` inscrit dans `base.config.json` OÙ vit le moteur, et dépose un lanceur `.ai/base.mjs` qui le retrouve. Voilà pourquoi `base …` marche depuis votre projet, où qu'il soit, sans rien sur le PATH. Un process, lui, reste une donnée structurée: un frontmatter que le routeur lit (use_when, examples) et un corps que le modèle suit. En remplissant vous-même les trous porteurs de sens au lieu de recopier, vous ancrez la structure.

🔁 **Chez vous**: quelle étape de VOS process exige une validation humaine avant d'agir? Notez-la: ce sera votre `[A VALIDER]`.

→ **Et maintenant**: [Module 3: le défi](praticien-3-le-defi.md): un process à écrire SANS guide.

🆘 **Pannes courantes**: *`base init` dit «Déjà un BASE»*: le dossier contient déjà un `.ai/agents/`: choisissez un dossier vide. *`base route` échoue depuis votre projet*: êtes-vous bien DANS `~/mon-office-tourisme` (où `base` = `node .ai/base.mjs`)? *validate échoue sur le frontmatter*: pas de tabulation, pas de `|` ni `{}` en YAML; gardez la forme du squelette.
