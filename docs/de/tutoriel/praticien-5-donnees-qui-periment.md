<!-- fr-synced: fb72357682a278742e8af5a2c5215d49a93ad6c0 -->

# Daten, die ablaufen

*⏱ ~10 Min · Modul 5/9, Praktiker-Pfad*

**Sie werden**: mit base doctor eine abgelaufene Information melden lassen und sie dann verschwinden sehen, belegt durch das ✅ weiter unten.
**Sie brauchen**: Modul 1 abgeschlossen, ein Terminal in `exemples/veytaux-tourisme`.
↻ **Erinnerung**: ohne nachzuschauen: was lässt eine Anfrage zu einem Prozess routen? (sein use_when und seine examples)

1. Führen Sie `base doctor --root .` aus. Erkennen Sie das Signal zu `infos/agenda.md`.
2. Öffnen Sie `infos/agenda.md`: das Feld `valid_until` ist ein Datum in der Vergangenheit (das ist Absicht,
   für die Übung).
3. Verschieben Sie `valid_until` auf ein Datum in der Zukunft (zum Beispiel in einer Woche) und speichern Sie.
4. Führen Sie `base doctor --root .` erneut aus.

✅ **Prüfen Sie**: nach der Korrektur meldet `base doctor` `infos/agenda.md` nicht mehr als abgelaufen (das Signal `expired` ist verschwunden).

💡 **Warum es funktioniert hat**: eine Expertise altert. `valid_until` deklariert die Lebensdauer einer Referenzinformation; `base doctor` projiziert diese Daten auf Ihre Dateien, um zu erkennen, was kurz davor ist zu brechen, ohne etwas auszuführen, durch blosses Lesen. Die Wartung wird sichtbar.

🔁 **Bei Ihnen**: welche Information aus Ihrem Fachgebiet (ein Tarif, eine Gebührenordnung, eine saisonale Regel) sollte ein Gültigkeitsdatum tragen?

→ **Und jetzt**: [Modul 6: öffnen Sie das Atelier](praticien-6-ouvrez-l-atelier.md): wir wechseln zu Studio und verbinden ein Modell.

🆘 **Häufige Pannen**: *doctor meldet nichts*: Sie befinden sich nicht in `exemples/veytaux-tourisme`. *Das Signal bleibt nach der Korrektur*: liegt das Datum wirklich in der ZUKUNFT, und wurde die Datei gespeichert?
