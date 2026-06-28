<!-- fr-synced: 00bf174c6f95a30df6d63ad672c4ffb9ffd502a3 -->

# Einen KI-Arbeitsbereich einrichten

Einen lokalen Arbeitsbereich einzurichten bedeutet, Ihre Agenten und Ihren Kontext in Ihrem eigenen Ordner und unter Ihrer Kontrolle zu behalten, statt in einer Web-Plattform. Das setzt voraus, dass Sie ein Werkzeug auswählen und ihm einige Minuten widmen. Diese Seite verweist Sie auf die Anleitung, die zu Ihrer Situation passt; jede Anleitung ist kurz und in sich abgeschlossen. BASE funktioniert mit den meisten KI-Werkzeugen, die Ihre Markdown-Dateien lesen können.

## Ihre Situation, Ihre Seite

| Ihre Situation | Folgen Sie |
| --- | --- |
| Sie möchten, dass Ihre KI die Installation für Sie übernimmt | [BASE von Ihrer KI installieren lassen](installer-par-votre-ia.md) |
| Sie bevorzugen eine grafische Oberfläche: mehrere Werkzeuge eignen sich (Claude Code, Cursor, Antigravity, GitHub Copilot, OpenCode…), BASE bevorzugt keines davon | [Cursor installieren](installer-cursor.md) |
| Sie fühlen sich in einem Terminal wohl | [Claude Code installieren](installer-claude-code.md) |
| Sie möchten ChatGPT, Claude Desktop oder eine andere Plattform mit Ihren Agenten verbinden | [Den MCP-Server installieren](installer-mcp.md) |
| Sie haben nur einen Browser, nichts zu installieren | [BASE ohne Installation ausprobieren](essayer-sans-installer.md) |
| Sie möchten Ihre BASE ansehen, bewerten und pflegen | `base studio --root mon-dossier` (das grafische Studio) |
| Sie haben das Repository noch nicht | [BASE beziehen](obtenir-base.md) |

Die meisten KI-Werkzeuge, die Ihre Dateien lesen können, funktionieren ebenfalls (zum Beispiel GitHub Copilot, Antigravity, Claude Code oder Cowork, OpenCode, Kilo Code): sagen Sie ihnen «Lies `.ai/agents/[nom-agent]/AGENT.md` und folge seinen Anweisungen». Einige Werkzeuge erkennen Skills im Format `SKILL.md` nativ; andernfalls lädt der Agent die Skills bei Bedarf, indem er sie als Markdown-Dateien liest.

## Gemeinsame Voraussetzungen

- **Ein KI-Werkzeug, das Ihre Dateien lesen kann** (zum Beispiel GitHub Copilot, Antigravity, Claude Code oder Cowork, OpenCode, Kilo Code): nichts ausser dem Werkzeug selbst.
- **BASE CLI oder MCP-Server**: Node 18 oder höher. Das ist die einzige Abhängigkeit des Kerns.
- **BASE Studio (die Werkstatt)**: nichts weiter. `base studio` installiert seine Abhängigkeiten beim ersten Start und öffnet Ihren Browser.

> **Ihr KI-Werkzeug ist das Erlebnis; Studio ist die Werkstatt.** Der Alltag spielt sich in Ihren Dateien ab, mit Ihrem gewohnten Werkzeug; Studio dient dazu, ihren Inhalt aufzubauen, zu bewerten und zu pflegen.

## Warum ein lokaler Arbeitsbereich?

Ihre Dateien, Ihre Anweisungen und Ihr Kontext bleiben in Ihrem eigenen Ordner und unter Ihrer Kontrolle, statt in einer Web-Plattform zu leben. Je nach gewähltem Werkzeug kann der an das Modell gesendete Inhalt dennoch über den KI-Anbieter laufen; prüfen Sie die geltenden Bedingungen, bevor Sie sensible Daten verwenden.

## Und danach?

- Erster Erfolg in 5 Minuten: [Schnellstart](quickstart.md).
- Ihren eigenen Assistenten erstellen: öffnen Sie den Hauptordner von BASE und sagen Sie «Lies `.ai/agents/createur-agent/AGENT.md` und folge seinen Anweisungen». Der Ersteller begleitet Sie von A bis Z und schlägt die zu Ihrem Werkzeug passende Konfiguration vor.

---

BASE ist ein Framework von [AI Swiss](https://a-i.swiss). Anwendungsfall in Partnerschaft mit [Innovaud](https://innovaud.ch).
