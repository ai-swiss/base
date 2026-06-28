<!-- fr-synced: 0a4c1d4c8fb7e3703f988769bb8ebf50f50a0fc8 -->

# Claude Code installieren

Am Ende dieser Seite verfügen Sie über einen Assistenten, der Ihre Dateien unter Ihrer Kontrolle liest und bearbeitet und bereit ist, an Ihren echten Dokumenten zu arbeiten: BASE ist dann kein Text mehr, den man liest, sondern ein Werkzeug, das handelt. Das setzt voraus, dass Sie mit einem Terminal vertraut sind und über ein Anthropic-Konto verfügen. In wenigen Minuten installieren Sie Claude Code, starten es in einem BASE-Beispiel und stellen eine erste Anfrage; Sie wissen ausserdem, was zu tun ist, falls Sie nicht weiterkommen.

Claude Code, der KI-Agent von Anthropic auf der Kommandozeile, ist nur einer von vielen Einstiegspunkten: Die meisten KI-Werkzeuge, die Ihre Dateien lesen und bearbeiten können, sind geeignet (zum Beispiel GitHub Copilot, Antigravity, Claude Code oder Cowork, OpenCode, Kilo Code). Diese Seite dokumentiert Claude Code; für die anderen halten Sie sich an deren Installationsanleitung.

Sie benötigen ein Anthropic-Konto (Claude-Abonnement oder API-Zugang). Mit dem nativen Installer ist keine weitere Abhängigkeit erforderlich.

## 1. Claude Code installieren

**macOS / Linux / WSL:**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows (PowerShell):**

```powershell
irm https://claude.ai/install.ps1 | iex
```

Wenn Sie bereits Node 18 oder höher haben, funktioniert auch `npm install -g @anthropic-ai/claude-code`. Die genauen Befehle können sich ändern: Halten Sie sich im Zweifelsfall an die [offizielle Dokumentation](https://code.claude.com/docs).

Prüfen Sie mit `claude --version`. Beim ersten Start fordert `claude` Sie auf, sich bei Ihrem Konto anzumelden.

## 2. `claude` in einem Beispiel starten

1. Kopieren Sie den Ordner eines Beispiels (zum Beispiel `exemples/assistant-devis/`) in Ihren Arbeitsbereich
2. Öffnen Sie ein Terminal in diesem Ordner
3. Führen Sie `claude` aus

Die Datei `CLAUDE.md` im Stammverzeichnis des Beispiels gibt Claude Code über `@import` den Ausgangskontext: Der Agent wird ohne weitere Konfiguration geladen.

Sie haben das Repository noch nicht? Siehe [BASE beziehen](obtenir-base.md).

## 3. Erste Anfrage

Geben Sie ein:

> «Hallo, ich möchte meine Tätigkeit einrichten»

Der Assistent führt Sie, schlägt Dateien vor und wartet bei wichtigen Entscheidungen auf Ihre Bestätigung. Der weitere Verlauf (erste Offerte, Markierungen `[A VALIDER]`) steht im [Schnelleinstieg](quickstart.md).

## Grundlegende Fehlerbehebung

| Symptom | Lösungsansatz |
| --- | --- |
| `claude: command not found` | Terminal schliessen und neu öffnen; andernfalls den vom Installer angezeigten Pfad zu Ihrem PATH hinzufügen |
| Problem bei der Anmeldung am Konto | `claude` starten, dann `/login` eingeben |
| Der Agent wird nicht geladen | Prüfen, dass `claude` im Beispielordner läuft, also in dem Ordner, der `CLAUDE.md` enthält (`pwd` zur Kontrolle) |
| Hilfe während der Sitzung benötigt | `/help` eingeben |
| Hängengeblieben bei einem technischen Schritt | Fragen Sie Claude Code selbst: «Ich habe diesen Fehler: [Fehler einfügen]. Was passiert da?» Geben Sie bei Bedarf Ihr Niveau an. |

---

BASE ist ein Framework von [AI Swiss](https://a-i.swiss). Anwendungsfall in Partnerschaft mit [Innovaud](https://innovaud.ch).
