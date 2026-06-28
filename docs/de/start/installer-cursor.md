<!-- fr-synced: a5aee6f04a1af3c7e131f033545cd33018f40750 -->

# Cursor für Ihre BASE-Agenten installieren

Damit Ihre BASE-Agenten arbeiten können, brauchen Sie einen Arbeitsplatz, an dem die KI Ihre Dateien liest, Dateien schreibt und unter Ihrer Kontrolle Befehle ausführt: Diese Seite richtet einen solchen mit Cursor ein, einsatzbereit. Am Ende haben Sie ein Beispiel geöffnet, Ihre erste Anfrage gestellt, und Sie wissen, was zu tun ist, falls etwas klemmt. Das setzt voraus, dass Sie eine Software installieren und ein Konto beim Anbieter erstellen. Cursor ist nur ein Einstieg: Auch andere KI-Werkzeuge, die Ihre Dateien lesen können, eignen sich (zum Beispiel GitHub Copilot, Antigravity, Claude Code oder Cowork, OpenCode, Kilo Code); wählen Sie das, was Ihnen passt.

Cursor ist ein KI-Arbeitsbereich mit grafischer Benutzeroberfläche.

## 1. Cursor installieren

**Herunterladen:** [cursor.com](https://cursor.com)

| OS | Anleitung |
| --- | --- |
| **Windows** | `.exe` herunterladen, Installationsprogramm starten |
| **macOS** | `.dmg` herunterladen, öffnen, in den Ordner Programme ziehen (ARM64-Version für M-Chips) |
| **Linux** | AppImage herunterladen, ausführbar machen (`chmod +x`), starten |

**Beim ersten Start:**

1. Ein Konto erstellen oder sich anmelden (erforderlich für den Zugang zu den KI-Modellen)
2. Ein Design auswählen (später änderbar)
3. Vorhandene VS-Code-Einstellungen importieren (optional)

## 2. Datenschutz konfigurieren

1. **Settings** öffnen (Zahnrad-Symbol oben rechts)
2. Zu **General**, Abschnitt **Privacy** gehen
3. **Privacy Mode** auswählen

Diese Einstellung soll die Nutzung Ihrer Daten für das Training der Modelle einschränken, gemäss den Bedingungen des Werkzeugs, die Sie selbst prüfen müssen. Sie bietet einen Teilschutz: Lassen Sie bei persönlichen, Kunden- oder regulierten Daten die Nutzung durch eine rechtliche oder sicherheitsbezogene Prüfung freigeben.

## 3. Ein BASE-Beispiel öffnen

1. Kopieren Sie den Ordner eines Beispiels (zum Beispiel `exemples/assistant-devis/`) in Ihren Arbeitsbereich
2. Öffnen Sie ihn in Cursor (Datei → Ordner öffnen)
3. Die Datei `.cursor/rules/assistant.mdc` gibt Cursor die Regeln zum Laden des Agenten

Noch kein Repository? Siehe [BASE beziehen](obtenir-base.md).

## 4. Erste Anfrage

Schreiben Sie im Chat:

> «Hallo, ich möchte meine Tätigkeit einrichten»

Der Assistent führt Sie, schlägt Dateien vor und wartet bei wichtigen Entscheidungen auf Ihre Bestätigung. Der weitere Verlauf (erste Offerte, Markierungen `[A VALIDER]`) steht im [Schnellstart](quickstart.md).

## 5. Ihre PDF-, Word- und Excel-Dateien lesen (optional)

Die KI liest Text nativ (Markdown, TXT, Code). PDF, Word und Excel sind Binärformate, die ein Werkzeug erfordern. Die Erweiterung **Office Viewer** (Erweiterungen-Bereich, `Cmd/Ctrl + Shift + X`) erlaubt es bereits, sie in Cursor anzuzeigen. Damit die KI sie liest, gibt es zwei Optionen, die nebeneinander bestehen können:

**Option A, mit [Docling](https://docling-project.github.io/docling/) nach Markdown konvertieren** (Referenzdokumente, häufige Nutzung):

```bash
pip install docling   # ou: uv tool install docling
docling --to md --output "/chemin/sortie/" "/chemin/document.pdf"
```

Die erzeugte `.md`-Datei behält Überschriften und Tabellen. Zum Automatisieren fügen Sie den Befehl als Beispiel in `Cursor Settings > General > Rules and Commands` ein und sagen dann einfach «Konvertiere diese Datei [Pfad]».

**Option B, MCP-Server [Document Loader](https://awslabs.github.io/mcp/servers/document-loader-mcp-server)** (gelegentliches Lesen, Extraktion im laufenden Betrieb):

1. `uv` installieren: `curl -LsSf https://astral.sh/uv/install.sh | sh` (macOS/Linux) oder `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"` (Windows). Mit `uvx --version` prüfen.
2. In `Cursor Settings > MCP` auf «Add MCP Server» klicken und hinzufügen:

```json
{
  "mcpServers": {
    "awslabs.document-loader-mcp-server": {
      "command": "uvx",
      "args": ["awslabs.document-loader-mcp-server@latest"],
      "env": { "FASTMCP_LOG_LEVEL": "ERROR" }
    }
  }
}
```

3. Aktivieren Sie nur `read_document`. Das Werkzeug `read_image` stört das native Bildlesen der LLM.
4. Testen Sie: «Lies dieses PDF [Pfad] und fasse es zusammen.» Falls `uvx` unter macOS nicht gefunden wird, geben Sie seinen vollständigen Pfad an (`/usr/local/bin/uvx` oder `~/.local/bin/uvx`).

## Grundlegende Fehlerbehebung

| Symptom | Ansatz |
| --- | --- |
| Der Explorer ist leer | Den richtigen Ordner erneut öffnen (Datei → Ordner öffnen) |
| Die KI findet eine Datei nicht | Rechtsklick auf die Datei → **Copy Path**, den genauen Pfad in den Chat einfügen |
| Ein PDF bleibt unlesbar | Option A oder B oben erneut versuchen |
| Hängen an einem technischen Schritt | Fragen Sie die KI selbst: «Ich habe diesen Fehler: [Fehler einfügen]. Was passiert da?» Geben Sie bei Bedarf Ihr Niveau an. |

Chat-Tipps: `Cmd/Ctrl + V` fügt eine URL als Kontext ein (wenn die KI Webzugriff hat); `Cmd/Ctrl + Shift + V` fügt den Textinhalt der URL ein, nützlich, wenn die Website Bots blockiert.

Zum Prüfen der Installation: Ziehen Sie eine `.md`-Datei in den Chat und bitten Sie um eine Zusammenfassung, dann «Erstelle eine Datei test.md mit Hello», dann «Liste meine Dateien mit dem Befehl ls in einem Terminal». Wenn alles funktioniert, sieht, liest, schreibt und führt die KI aus. Vollständige Referenz: [docs.cursor.com](https://docs.cursor.com).

Cursor brilliert bei der iterativen Arbeit an Dateien. Für tiefgehende Webrecherche (Deep Research, Perplexity), die Erzeugung von Bildern (Midjourney, Ideogram) oder Videos (Veo, Runway) nutzen Sie spezialisierte Werkzeuge.

---

BASE ist ein Framework von [AI Swiss](https://a-i.swiss). Anwendungsfall in Partnerschaft mit [Innovaud](https://innovaud.ch).
