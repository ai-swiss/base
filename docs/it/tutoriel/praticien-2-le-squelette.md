<!-- fr-synced: a84b167307b90a9fc59f5d32e75abcbf8b453cbf -->

# Il vostro progetto, e il suo primo process

*⏱ ~20 min · modulo 2/9, percorso Praticante*

**Farete**: creare il vostro vero progetto con `base init`, poi scrivere al suo interno un primo process che valida e instrada, dimostrato dal ✅ qui sotto.
**Vi serve**: il modulo 1 completato, un terminale nella radice del repository.
↻ **Promemoria**: senza guardare: che cosa descrive un buon use_when? (l'intenzione, non il titolo)

Finora leggevate l'ufficio del turismo di Veytaux una volta terminato. Ora create il VOSTRO progetto: uno vero, autonomo, fuori dal repository.

1. Dal repository (dove `base` = `node .ai/base.mjs`, vedi [il passo 0](harnais.md)), create il vostro
   progetto altrove. `init` mostra prima ciò che creerebbe, senza scrivere nulla:

   ```
   base init --root ~/mon-office-tourisme
   ```

   Rilanciate con `--yes` per applicare:

   ```
   base init --root ~/mon-office-tourisme --yes
   ```

   Crea un agente, `base.config.json` (con `framework_dir`: DOVE vive il motore), il launcher
   `.ai/base.mjs` e i file che il vostro strumento IA legge aprendo la cartella.

2. Entrate nel vostro progetto. D'ora in poi, qui, `base` = `node .ai/base.mjs`. Tutto funziona anche se
   avete lasciato il repository, perché `init` ha annotato dove si trova il motore:

   ```
   cd ~/mon-office-tourisme
   ```

Anziché ricopiare il corpus finito, riempite uno scheletro: lo sforzo vi costringe a capire.

3. `init` ha creato un agente che prende il nome dalla vostra cartella (`mon-office-tourisme`). Creategli un primo
   process in `.ai/agents/mon-office-tourisme/skills/processes/renseigner-un-visiteur/SKILL.md`. Partite
   da questo scheletro e riempite i `<A COMPLETER>`:

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

4. **Prevedete** il risultato, poi lanciate `base validate --root .` e
   `base route "<la vostra frase di esempio>" --root .`.

✅ **Verificate**: `base validate` dice «BASE valide»; `base route` sulla vostra frase di esempio instrada verso `renseigner-un-visiteur`; e tutto questo da una cartella FUORI dal repository, prova che il vostro progetto è autonomo. Confrontate poi con la versione finita: `exemples/veytaux-tourisme/.ai/agents/office-tourisme/skills/processes/renseigner-un-visiteur/SKILL.md`.

💡 **Perché ha funzionato**: oltre ai file, `base init` iscrive in `base.config.json` DOVE vive il motore, e deposita un launcher `.ai/base.mjs` che lo ritrova. Ecco perché `base …` funziona dal vostro progetto, ovunque esso sia, senza nulla nel PATH. Un process, a sua volta, resta un dato strutturato: un frontmatter che il router legge (use_when, examples) e un corpo che il modello segue. Riempiendo voi stessi le lacune portatrici di senso anziché ricopiare, ancorate la struttura.

🔁 **Da voi**: quale passo dei VOSTRI process esige una validazione umana prima di agire? Annotatelo: sarà il vostro `[A VALIDER]`.

→ **E ora**: [Modulo 3: la sfida](praticien-3-le-defi.md): un process da scrivere SENZA guida.

🆘 **Guasti comuni**: *`base init` dice «Déjà un BASE»*: la cartella contiene già un `.ai/agents/`: scegliete una cartella vuota. *`base route` fallisce dal vostro progetto*: siete davvero DENTRO `~/mon-office-tourisme` (dove `base` = `node .ai/base.mjs`)? *validate fallisce sul frontmatter*: niente tabulazioni, niente `|` né `{}` in YAML; mantenete la forma dello scheletro.
