<!-- fr-synced: ac21a2cfb1ddcfe5d96cca067536017390d371c8 -->

# Das Feld: eine Friktion taucht auf

*⏱ ~10 Min · Modul 8/9, Praktiker-Parcours*

**Sie werden**: eine Rückmeldung aus dem Feld bearbeiten und sie über das Schreib-Gate lösen, belegt durch das ✅ weiter unten.
**Sie brauchen**: Modul 7 abgeschlossen, Studio geöffnet auf dem Tourismusbüro.
↻ **Erinnerung**: ohne nachzuschauen: was produziert eine Evaluation? (ein Richterurteil + einen Ansatz zur Korrektur)

Der Feld-Stapel startet leer. Wir simulieren eine Rückmeldung.

Zuerst drei Worte zum Kontext: der **Feld-Stapel** sammelt die Friktionen (eine reale Nutzung, die geklemmt hat); das **Gate** ist die goldene Regel: nichts wird geschrieben ohne einen Vorschlag (ein Diff), den Sie validieren.

1. Erstellen Sie `.ai/feedback/2026-01-10_agenda-perime.md` im Tourismusbüro mit folgendem Inhalt:

```
---
process: .ai/agents/office-tourisme/skills/processes/renseigner-un-visiteur/SKILL.md
reported: 2026-01-10
via: user
status: open
---
# L'agenda était périmé et l'assistant a quand même annoncé l'événement

Le process devrait vérifier la date de validité avant d'annoncer un événement de l'agenda.
```

2. In Studio, Reiter **Evaluations**: die Friktion erscheint im Feld-Stapel.
3. Öffnen Sie den betroffenen Process, ergänzen Sie ihn, damit er das Datum prüft, und dann «Als gelöst markieren»: ein Diff erscheint (das Gate), validieren Sie es.

✅ **Prüfen Sie**: die Friktion verlässt den Stapel der «offenen» nach der Validierung, und das Diff der Lösung ist über propose und dann commit gelaufen (nichts wurde vor Ihrer Validierung geschrieben).

💡 **Warum es funktioniert hat**: das Feld ist der Rohstoff der Verbesserung. Eine Friktion ist eine datierte Datei, nie verloren. Jede Schreiboperation, selbst eine Lösung, läuft über das Gate: das ist es, was die KI sicher macht, um sie in Ihren Dateien leben zu lassen.

🔁 **Bei Ihnen**: wenn sich Ihr Assistent irrt, wer notiert die Friktion und wo? (das ist Ihre Verbesserungsschleife)

→ **Und jetzt**: [Modul 9: Ihre Inhalte migrieren](praticien-9-migrer.md): der Moment, in dem die Übung zu IHREM Werkzeug wird.

🆘 **Häufige Pannen**: *Die Friktion erscheint nicht*: prüfen Sie den Ordner `.ai/feedback/` und das Frontmatter (status: open). *Kein Diff bei der Lösung*: die Lösung läuft immer über einen Vorschlag; lesen Sie nach, bevor Sie validieren.
