<!-- fr-synced: ec9d02b13cf99b8cb102272c262bbc6ad8624da3 -->

# Öffnen Sie die Werkstatt, verbinden Sie ein Modell

*⏱ ~10 Min · Modul 6/9, Praktiker-Lernpfad*

**Sie werden**: die Werkstatt offen und ein Modell verbunden haben, bereit zur Evaluation, bewiesen durch das ✅ weiter unten.
**Sie brauchen**: das abgeschlossene Modul 5.
↻ **Erinnerung**: Was macht base doctor, ohne nachzuschauen? (es meldet, was kurz davor ist, kaputtzugehen)

1. Starten Sie die Werkstatt: `base studio --root exemples/veytaux-tourisme`. Ihr Browser öffnet sich.
2. Tab **Einstellungen**. Wenn kein Provider vorhanden ist, erscheint die Anleitung «Ein Modell verbinden».
3. Folgen Sie dem für Sie einfachsten Weg (lokales Ollama ohne key oder einen API-key, den Sie
   in Ihr Terminal einfügen). Die Anleitung zeigt jedes Mal den nächsten Schritt an.
4. Sobald der Verbindungstest grün ist, klicken Sie auf «als Evaluations-Standards festlegen».

✅ **Prüfen Sie**: Der Einstellungen-Bildschirm zeigt Ihren Provider mit einem grünen Verbindungstest, und Ihre Evaluations-Standards sind festgelegt.

💡 **Warum es funktioniert hat**: Studio ist die Werkstatt, es arbeitet an denselben Dateien wie Ihr KI-Werkzeug. API-keys werden nie im Bildschirm eingegeben oder gespeichert: Sie benennen eine Umgebungsvariable, was Ihre Geheimnisse aus den Dateien heraushält.

🔁 **Bei Ihnen zu Hause**: Welches Modell werden Sie für Ihre Evaluationen verwenden, ein lokales Modell (kostenlos, privat) oder eine API (leistungsstärker)?

→ **Und nun**: [Modul 7: die erste Evaluation](praticien-7-premiere-evaluation.md).

🆘 **Häufige Pannen**: *«Kein Modell»* nach der Installation von Ollama: Laden Sie die Einstellungsseite neu. *Der key wird nicht erkannt*: Exportieren Sie die Variable im selben Terminal wie `base studio` und starten Sie dann neu.
