<!-- fr-synced: a84b167307b90a9fc59f5d32e75abcbf8b453cbf -->
# Your project, and its first process

*⏱ ~20 min · module 2/9, Practitioner track*

**You will**: create your real project with `base init`, then write a first process in it that validates and routes, proven by the ✅ below.
**You need**: module 1 finished, a terminal at the root of the repository.
↻ **Reminder**: without looking: what does a good use_when describe? (the intent, not the title)

Until now you read Veytaux's tourist office once it was finished. Now you create YOUR project: a real one, self-contained, outside the repository.

1. From the repository (where `base` = `node .ai/base.mjs`, see [step 0](harnais.md)), create your
   project elsewhere. `init` first shows what it would create, without writing anything:

   ```
   base init --root ~/mon-office-tourisme
   ```

   Run it again with `--yes` to apply:

   ```
   base init --root ~/mon-office-tourisme --yes
   ```

   It creates an agent, `base.config.json` (with `framework_dir`: WHERE the engine lives), the launcher
   `.ai/base.mjs`, and the files your AI tool reads when it opens the folder.

2. Enter your project. From now on, here, `base` = `node .ai/base.mjs`. Everything works even if
   you have left the repository, because `init` recorded where the engine is:

   ```
   cd ~/mon-office-tourisme
   ```

Rather than copy the finished corpus, you fill in a skeleton: the effort forces you to understand.

3. `init` created an agent named after your folder (`mon-office-tourisme`). Create a first
   process for it in `.ai/agents/mon-office-tourisme/skills/processes/renseigner-un-visiteur/SKILL.md`. Start
   from this skeleton and fill in the `<A COMPLETER>`:

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

4. **Predict** the result, then run `base validate --root .` and
   `base route "<your example sentence>" --root .`.

✅ **Check**: `base validate` says "BASE valide"; `base route` on your example sentence routes to `renseigner-un-visiteur`; and all of this from a folder OUTSIDE the repository, proof that your project is self-contained. Then compare with the finished version: `exemples/veytaux-tourisme/.ai/agents/office-tourisme/skills/processes/renseigner-un-visiteur/SKILL.md`.

💡 **Why it worked**: beyond the files, `base init` records in `base.config.json` WHERE the engine lives, and drops a launcher `.ai/base.mjs` that finds it again. That is why `base …` works from your project, wherever it is, with nothing on the PATH. A process, in turn, stays structured data: a frontmatter the router reads (use_when, examples) and a body the model follows. By filling in the meaning-bearing gaps yourself instead of copying, you anchor the structure.

🔁 **At home**: which step of YOUR processes requires human validation before acting? Note it down: that will be your `[A VALIDER]`.

→ **And now**: [Module 3: the challenge](praticien-3-le-defi.md): a process to write WITHOUT a guide.

🆘 **Common failures**: *`base init` says "Déjà un BASE"*: the folder already contains a `.ai/agents/`: choose an empty folder. *`base route` fails from your project*: are you really IN `~/mon-office-tourisme` (where `base` = `node .ai/base.mjs`)? *validate fails on the frontmatter*: no tabs, no `|` or `{}` in YAML; keep the form of the skeleton.
