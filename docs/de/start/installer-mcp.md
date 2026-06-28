<!-- fr-synced: abf90266159c2550f827a635b37bb2473766dbe6 -->

# Den MCP-Server von BASE installieren

Wenn Ihr KI-Werkzeug Ihre Dateien nicht direkt liest oder wenn Sie einen Agenten über Ihren eigenen Arbeitsplatz hinaus teilen möchten, ist der MCP-Server der richtige Weg: Er macht Ihre BASE-Agenten von jeder kompatiblen Plattform aus erreichbar, ohne dass Sie Ihre Arbeit von Hand kopieren müssen. Im Gegenzug geben Sie einen Ordner Ihres Projekts für ein Drittwerkzeug frei, was einige Schutzvorkehrungen erfordert (siehe weiter unten). Der MCP-Server (Model Context Protocol) verbindet Ihre BASE-Agenten mit kompatiblen Plattformen: ChatGPT, Claude Desktop und den KI-Werkzeugen, die MCP sprechen können (zum Beispiel GitHub Copilot, Antigravity, Claude Code oder Cowork, OpenCode, Kilo Code).

## Voraussetzungen

- Node 18 oder höher (`node --version` zum Prüfen). Das ist die einzige Abhängigkeit des BASE-Kerns.
- Das BASE-Repository lokal. Noch kein Repository? Siehe [BASE beziehen](obtenir-base.md).

## 1. Den Server bauen

```bash
cd mcp/
npm install
npm run build
```

## 2. Den Server starten

```bash
npm start -- --root /pfad/zu/ihrem/projekt
```

Ohne `--root` erkennt der Server die nächstgelegene BASE-Wurzel ausgehend von seinem Startverzeichnis. Für den dauerhaften Einsatz sollten Sie eine explizite Wurzel bevorzugen.

## 3. Ihre Plattform verbinden

### Claude Desktop

In `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "base": {
      "command": "node",
      "args": ["/pfad/zu/mcp/dist/index.js", "--root", "/pfad/zu/ihrem/projekt"]
    }
  }
}
```

Die Konfiguration ist in den anderen KI-Werkzeugen, die MCP sprechen können, identisch (zum Beispiel GitHub Copilot, Antigravity, Claude Code oder Cowork, OpenCode, Kilo Code): Übertragen Sie denselben Block in deren MCP-Einstellungen.

Auch für Endnutzer gedachte MCP-kompatible Werkzeuge wie ChatGPT (über seinen Entwicklermodus) können sich mit diesem lokalen MCP-Server verbinden. Die Aktivierung und die jeweils geltenden Bedingungen erfolgen im Werkzeug selbst, gemäss seiner offiziellen Dokumentation: BASE macht daraus keinen geführten Ablauf und ist nicht davon abhängig.

### Erste Anfrage

Sobald die Plattform verbunden ist, fragen Sie:

> «Welche Agenten habe ich?»

dann «Lade meinen Agenten assistant-devis» und schliesslich «Guten Tag, ich möchte mein Geschäft einrichten». Der weitere Ablauf steht im [Schnellstart](quickstart.md).

## Sicherheit: Nur-Lesen und Authentifizierung

Zwei Schutzvorkehrungen sind standardmässig aktiv:

- **Nur-Lesen über HTTP.** Beim HTTP-Transport werden die Schreib- und Ausführungswerkzeuge nicht registriert: Die Oberfläche ist daher nachweislich nur lesbar. `--read-write` erweitert sie explizit und sollte authentifizierten Bereitstellungen vorbehalten bleiben. Über `stdio` (lokale Nutzung) steht die vollständige Oberfläche des Brokers zur Verfügung, einschliesslich vermittelter Schreibvorgänge.
- **Netzwerkfreigabe ohne Authentifizierung verweigert.** Das Binden an eine Nicht-Loopback-Schnittstelle (`--host 0.0.0.0`, eine LAN-IP) ohne Authentifizierung wird beim Start verweigert. Wenn Sie das Risiko akzeptieren (vertrauenswürdiges Netzwerk, kontrollierter Tunnel), dokumentiert `mcp/README.md` die explizite Ausweichmöglichkeit `BASE_MCP_ALLOW_INSECURE_REMOTE=1`. Setzen Sie `BASE_MCP_BEARER_TOKEN`, um ein Bearer-Token zu verlangen, die empfohlene Option für ein Team:

```bash
BASE_MCP_BEARER_TOKEN=ein-langes-und-zufaelliges-geheimnis npm start -- --transport http --host 0.0.0.0 --root /pfad/zu/ihrem/projekt
```

Für eine massgeschneiderte Authentifizierung (OAuth, mTLS) stellen Sie über `base.config.mjs` einen `AuthProvider` bereit oder setzen Sie den Server hinter einen authentifizierten Reverse Proxy.

Der Nur-Lese-Zugriff bleibt heikel: Die Lesewerkzeuge legen die auf das Projekt beschränkten Ressourcen und Dateien offen. Geben Sie über MCP keinen Ordner frei, der Geheimnisse oder Daten ausserhalb des Geltungsbereichs des verbundenen Clients enthält.

## Grundlegende Fehlerbehebung

| Symptom | Ansatz |
| --- | --- |
| `npm: command not found` | Node 18 oder höher von [nodejs.org](https://nodejs.org) installieren |
| Der Server startet im Netzwerk nicht | Erwartetes Verhalten ohne Authentifizierung: `BASE_MCP_BEARER_TOKEN` setzen |
| Die Plattform sieht keine Agenten | Den an `--root` übergebenen Pfad prüfen und sicherstellen, dass das Projekt `.ai/agents/*/AGENT.md` enthält |
| Hängenbleiben bei einem technischen Schritt | Ihre KI fragen: «Ich habe diesen Fehler: [Fehler einfügen]. Was ist los?» |

## Weiterführendes

[mcp/README.md](../../mcp/README.md) beschreibt im Detail die bereitgestellten Werkzeuge (`load_agent`, `route_request`, `propose_change`, usw.), den Mehrwurzel-Modus (`--workspace`), die Team-Bereitstellung hinter einem Reverse Proxy und die Grenzen: MCP ersetzt weder IAM noch DLP noch Archivierung.

---

BASE ist ein Framework von [AI Swiss](https://a-i.swiss). Anwendungsfall in Partnerschaft mit [Innovaud](https://innovaud.ch).
