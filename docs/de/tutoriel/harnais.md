<!-- fr-synced: 7b63c08db9716f99d3669ade98ab99d38aa759d7 -->

# Schritt 0: Ihr KI-Werkzeug anschliessen

**Sie werden** Ihr KI-Werkzeug dazu bringen, einen BASE-Ordner zu lesen und daraus zu antworten, belegt durch eine einfache Frage am Ende.
**Sie brauchen** einen Computer, eine Internetverbindung und den BASE-Ordner auf Ihrem Gerät. Falls Sie ihn noch nicht haben, zeigt [Ausprobieren ohne Installation](../start/essayer-sans-installer.md) den einfachsten Weg, ihn zu erhalten; Beispiele wie `veytaux-tourisme` sind darin enthalten.

Vor jedem Modul muss Ihr Werkzeug installiert UND verbunden sein. Wählen Sie:

| Werkzeug | Erster Schritt | Terminal nötig? |
|-------|---------------|-------------------|
| **Cursor** | Auf cursor.com herunterladen, anmelden, *File -> Open Folder*. Chat: Cmd/Ctrl+L, Modus Agent. | Nein |
| **Claude Code** | Installieren, dann `claude` im Ordner ausführen. | Ja |
| **ChatGPT / Claude Desktop** | Über den MCP-Server (mechanische Garantien). | Ja (Konfiguration) |
| **Ein anderes Werkzeug** | Fragen Sie den Concierge: *hilf mir, BASE mit meinem Werkzeug zu verbinden*. Er liest die Dokumentation Ihres Werkzeugs und leitet Sie an. | Je nach Werkzeug |

Für die mechanischen Garantien (deterministisches routing, vermittelte Schreibvorgänge) schliessen Sie den MCP-Server an: siehe die Einstiegsdokumentation von BASE.

✅ **Prüfen**: Öffnen Sie den Ordner `exemples/veytaux-tourisme` in Ihrem Werkzeug und fragen Sie *«wer bist du?»*. Der Assistent soll sich im Wesentlichen als Assistent des Tourismusbüros von Veytaux-les-Bains vorstellen (Auskünfte für Besucher und Gruppenausflüge). Wenn er von etwas anderem spricht, siehe die Störungen unten.

🆘 **Häufige Störungen**:
- *Der Assistent spricht von «routing» oder «BASE» statt vom Tourismusbüro*: Sie haben die Wurzel des Repositorys geöffnet, nicht den Unterordner. Öffnen Sie `exemples/veytaux-tourisme` erneut.
- *Er antwortet nichts Konkretes*: Ihr Werkzeug liest die Projektdateien nicht. Prüfen Sie, dass Sie den ORDNER geöffnet haben (nicht eine einzelne Datei) und dass der Chat im Agent-Modus ist.

## Der Befehl `base` (Pfade Praktiker und Team)

Diese beiden Pfade verwenden ein Terminal. Wenn ein Modul `base ...` schreibt, ist der Starter gemeint, den jeder BASE-Ordner enthält: Führen Sie ihn mit **`node .ai/base.mjs`** aus dem Ordner aus, in dem Sie arbeiten (das Repository oder Ihr eigenes Projekt). Er findet die Engine von selbst: nichts zu installieren, nichts auf den PATH zu setzen (das Paket `base` ist nicht veröffentlicht; dieser Starter ersetzt es).

Um weniger zu tippen, erstellen Sie eine Sitzungsabkürzung:

- macOS / Linux: `alias base='node .ai/base.mjs'`
- Windows (PowerShell): `function base { node .ai/base.mjs @args }`

Danach funktioniert `base route "..."` unverändert.

✅ **Prüfen (vor dem Praktiker-Pfad)**: Aus `exemples/veytaux-tourisme` zeigt `node .ai/base.mjs --help` die Liste der Befehle an.

→ **Und jetzt**: Kehren Sie zum [Index](index.md) zurück und starten Sie Modul 1 Ihres Pfads.
