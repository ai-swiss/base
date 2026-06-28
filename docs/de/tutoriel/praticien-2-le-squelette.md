<!-- fr-synced: a84b167307b90a9fc59f5d32e75abcbf8b453cbf -->

# Ihr Projekt und sein erster Process

*⏱ ~20 Min · Modul 2/9, Praktiker-Pfad*

**Sie werden**: Ihr echtes Projekt mit `base init` erstellen und dann einen ersten Process darin schreiben, der validiert und routet, bewiesen durch das ✅ weiter unten.
**Sie brauchen**: Modul 1 abgeschlossen, ein Terminal im Wurzelverzeichnis des Repositorys.
↻ **Erinnerung**: ohne nachzusehen: was beschreibt ein gutes use_when? (die Absicht, nicht den Titel)

Bisher haben Sie das Tourismusbüro von Veytaux gelesen, nachdem es fertig war. Jetzt erstellen Sie IHR Projekt: ein echtes, eigenständiges, ausserhalb des Repositorys.

1. Aus dem Repository heraus (wo `base` = `node .ai/base.mjs`, siehe [Schritt 0](harnais.md)) erstellen Sie Ihr
   Projekt anderswo. `init` zeigt zuerst, was es erstellen würde, ohne etwas zu schreiben:

   ```
   base init --root ~/mon-office-tourisme
   ```

   Führen Sie es erneut mit `--yes` aus, um es anzuwenden:

   ```
   base init --root ~/mon-office-tourisme --yes
   ```

   Es erstellt einen Agenten, `base.config.json` (mit `framework_dir`: WO die Engine lebt), den Launcher
   `.ai/base.mjs` und die Dateien, die Ihr KI-Werkzeug liest, wenn es den Ordner öffnet.

2. Betreten Sie Ihr Projekt. Ab jetzt gilt hier `base` = `node .ai/base.mjs`. Alles funktioniert, auch wenn
   Sie das Repository verlassen haben, denn `init` hat notiert, wo sich die Engine befindet:

   ```
   cd ~/mon-office-tourisme
   ```

Statt den fertigen Korpus abzuschreiben, füllen Sie ein Gerüst aus: die Mühe zwingt Sie zum Verstehen.

3. `init` hat einen Agenten erstellt, der nach Ihrem Ordner benannt ist (`mon-office-tourisme`). Erstellen Sie ihm einen ersten
   Process in `.ai/agents/mon-office-tourisme/skills/processes/renseigner-un-visiteur/SKILL.md`. Gehen Sie
   von diesem Gerüst aus und füllen Sie die `<A COMPLETER>` aus:

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

4. **Sagen Sie** das Ergebnis voraus, dann führen Sie `base validate --root .` und
   `base route "<Ihr Beispielsatz>" --root .` aus.

✅ **Prüfen Sie**: `base validate` sagt «BASE valide»; `base route` auf Ihren Beispielsatz routet zu `renseigner-un-visiteur`; und das alles aus einem Ordner AUSSERHALB des Repositorys, der Beweis, dass Ihr Projekt eigenständig ist. Vergleichen Sie danach mit der fertigen Fassung: `exemples/veytaux-tourisme/.ai/agents/office-tourisme/skills/processes/renseigner-un-visiteur/SKILL.md`.

💡 **Warum es funktioniert hat**: über die Dateien hinaus schreibt `base init` in `base.config.json`, WO die Engine lebt, und legt einen Launcher `.ai/base.mjs` ab, der sie wiederfindet. Deshalb funktioniert `base …` aus Ihrem Projekt heraus, wo auch immer es liegt, ohne irgendetwas im PATH. Ein Process wiederum bleibt strukturierte Daten: ein Frontmatter, das der Router liest (use_when, examples), und ein Körper, dem das Modell folgt. Indem Sie die bedeutungstragenden Lücken selbst ausfüllen, statt abzuschreiben, verankern Sie die Struktur.

🔁 **Bei Ihnen**: welcher Schritt IHRER Processes verlangt eine menschliche Validierung, bevor gehandelt wird? Notieren Sie ihn: das wird Ihr `[A VALIDER]`.

→ **Und jetzt**: [Modul 3: die Herausforderung](praticien-3-le-defi.md): ein Process, den Sie OHNE Anleitung schreiben.

🆘 **Häufige Pannen**: *`base init` sagt «Déjà un BASE»*: der Ordner enthält bereits ein `.ai/agents/`: wählen Sie einen leeren Ordner. *`base route` schlägt aus Ihrem Projekt fehl*: sind Sie wirklich IN `~/mon-office-tourisme` (wo `base` = `node .ai/base.mjs`)? *validate schlägt beim Frontmatter fehl*: keine Tabulatoren, kein `|` oder `{}` in YAML; behalten Sie die Form des Gerüsts bei.
