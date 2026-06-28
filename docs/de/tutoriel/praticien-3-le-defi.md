<!-- fr-synced: 3f3cbcabd8070f3132f31a97a5bb4d670d765e3a -->

# Die Herausforderung: die Tagesbedingungen liefern

*⏱ ~12 Min · Modul 3/9, Praktiker-Pfad*

**Sie werden**: einen neuen Process erstellen und zeigen, dass er routet, ohne Schritt-für-Schritt-Anleitung, bewiesen durch das ✅ weiter unten.
**Sie brauchen**: die abgeschlossenen Module 1-2, Ihren Ordner `mon-office-tourisme`.
↻ **Erinnerung**: welche zwei Felder liest das Routing, um einen Process auszuwählen, ohne nachzuschauen? (use_when, routing.examples)

Das Tourismusbüro von Veytaux ist stolz auf seine Webcam, die auf den Parkplatz gerichtet ist, und die Besucher fragen ununterbrochen nach dem Wetter und den Tagesbedingungen dort oben. In `.ai/feedback/abstentions.jsonl` taucht immer wieder dieselbe Frage ohne Antwort auf: «Wie ist das Wetter dort oben heute?» Es liegt an Ihnen, diese Abstention zu beseitigen:

1. Erstellen Sie einen Process `donner-les-conditions-du-jour` (gleiche Struktur wie in Modul 2).
2. Geben Sie ihm ein `use_when` und `routing.examples`, die diese Art von Anfrage erfassen:

```routage-defi
Quel temps fait-il là-haut aujourd'hui ?
Il neige au village ce matin ?
```

3. Überprüfen Sie Ihre Arbeit selbst (Befehle weiter unten).

✅ **Überprüfen**: `base validate --root .` läuft durch, und `base route "Quel temps fait-il là-haut aujourd'hui ?" --root .` routet zu `donner-les-conditions-du-jour`. Wenn es woanders hin routet, passen Sie das use_when und die examples an: das ist die Übung.

💡 **Warum es funktioniert hat**: Sie haben gerade allein die komplette Schleife durchlaufen: die Struktur schreiben, das Ergebnis vorhersagen, überprüfen und dann korrigieren. Genau diesen Handgriff werden Sie an Ihren echten Processes wieder machen.

🔁 **Bei Ihnen**: listen Sie eine Aufgabe aus Ihrem Beruf auf, die Ihr Assistent noch nicht erledigen kann, das ist Ihr nächster Process.

→ **Und jetzt**: [Modul 4: Kompetenzen und Vorlagen](praticien-4-competences-et-modeles.md), die wiederverwendbaren Bausteine und die Dokumentgenerierung.

🆘 **Häufige Pannen**: *Es routet zu renseigner-un-visiteur*: Ihre examples ähneln zu sehr einer klassischen Auskunft; bringen Sie sie näher an «das Wetter und die Tagesbedingungen». *ambiguous*: zwei zu ähnliche Processes: unterscheiden Sie ihre use_when.
