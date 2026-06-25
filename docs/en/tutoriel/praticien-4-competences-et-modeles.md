<!-- fr-synced: 6d4491659db84827446557af13e63d689afdb6fe -->
# Competences and templates

*⏱ ~18 min · module 4/9, Practitioner track*

**You will**: add a competence and a template, reference them from a process, and generate a document that fills itself in and stops for validation, proven by the ✅ below.
**You need**: modules 1-3 done, your `~/mon-office-tourisme` directory.
↻ **Recall**: without looking, what is a process? (a frontmatter the router reads + a body the model follows)

A process says WHAT to do. But two more building blocks separate the simple routing of a request
from the production of **a real deliverable**, and this is what most assistants lack.

- a **competence** (`type: competence`): a reusable know-how (tone, rules, conventions)
  that a process **consults**. You cite it across several processes rather than repeating yourself.
- a **template** (`type: template`): a fill-in-the-blanks document you **complete** rather than
  follow. This is what produces an offer, a letter, a report.

1. **A competence.** Create `.ai/agents/mon-office-tourisme/skills/competences/parler-au-visiteur/SKILL.md`:

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

2. **A template.** Create `.ai/agents/mon-office-tourisme/templates/offre-groupe_v1.md`. A template carries
   `[PLACEHOLDERS]` to fill in and an `[A VALIDER]` wherever a human must decide:

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

3. **A process that uses them.** Create `.ai/agents/mon-office-tourisme/skills/processes/reserver-une-sortie-groupe/SKILL.md`.
   It `may_use` the template, and **consults the competence in its body**:

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

4. **Generate the document.** In your AI tool, on `~/mon-office-tourisme`, ask:
   *"prepare an offer for a group outing of 30 people"*. The assistant routes to
   `reserver-une-sortie-groupe`, follows the competence (tone, one question at a time), **fills in the template**, and leaves
   `[A VALIDER]` on the total. As in Discovery: it proposes, nothing is written without you.

```routage-fixture
Organiser une sortie pour notre groupe de 30 personnes
```

✅ **Check**: `base validate --root .` passes (competence, template, and process are valid resources); `base route "Organiser une sortie pour notre groupe de 30 personnes" --root .` routes to `reserver-une-sortie-groupe`; and the generated offer has its `[PLACEHOLDERS]` filled in with an `[A VALIDER]` on the amount.

💡 **Why it worked**: a process orchestrates, a **competence** factors out a reusable know-how, a **template** carries the shape of the deliverable. The router reads only the frontmatter (use_when, examples); the body, for its part, points to the competence and the template, which the language model then applies. The `[A VALIDER]` in the template asks that a human decide the figure: the instruction is for generation to stop rather than decide for you.

🔁 **At home**: which repetitive document in your line of work (quotes, form letters, reports) would benefit from becoming a fill-in-the-blanks template? Which know-how (a tone, some rules) deserves a reusable competence?

→ **And now**: [Module 5: data that goes stale](praticien-5-donnees-qui-periment.md): the life cycle of an expertise.

🆘 **Common breakdowns**: *`base route` does not find `reserver-une-sortie-groupe`*: bring your `routing.examples` closer to a real group-outing request. *The assistant invents a total instead of `[A VALIDER]`*: step 3 must require it explicitly, and the template must carry the marker. *validate fails*: a template has neither `name` nor `user-invocable`; a competence does (keep the shape of the skeletons).
