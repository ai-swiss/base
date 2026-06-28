<!-- fr-synced: ee0499d96aefb2aded077d221ef39d7bf0fe9f69 -->

# Ihr KI-Werkzeug anbinden

BASE an das KI-Werkzeug anzubinden, das Sie bereits verwenden, bedeutet, die Methode lesbar zu halten und **im richtigen Moment zu validieren**, statt blind zu delegieren: Sie bleiben die Person, die entscheidet, das Werkzeug führt unter Ihrer Aufsicht aus. Das setzt ein KI-Werkzeug voraus, das Ihre Dateien lesen kann (zum Beispiel GitHub Copilot, Antigravity, Claude Code oder Cowork, OpenCode, Kilo Code); BASE dockt daran an.

Zwei Stufen genügen in den meisten Fällen. Beginnen Sie mit der einfachsten.

## Am einfachsten: den Ordner öffnen

Keine Installation. Sie öffnen einen Beispielordner (oder Ihre eigene BASE) in einem Werkzeug, das Projektdateien liest. Die projizierten Artefakte (`CLAUDE.md`, `.cursor/rules/`) geben dem Werkzeug den BASE-Kontext und die routing-Regel. Sie wählen nicht automatisch einen Fachagenten: Ihre erste Anfrage muss eine Absicht tragen.

| Werkzeug | Was Sie tun |
|-------|--------------------|
| **Cursor** | Öffnen Sie den Ordner. Die Regel `.cursor/rules/assistant.mdc` lädt den BASE-Kontext. Sagen Sie zum Beispiel «Hallo, ich möchte meine Tätigkeit einrichten». |
| **Claude Code** | Öffnen Sie den Ordner. `CLAUDE.md` lädt den BASE-Kontext. Sagen Sie zum Beispiel «Hallo, ich möchte meine Tätigkeit einrichten». |
| **Claude Desktop / ChatGPT (ohne MCP)** | Fügen Sie ein Browser-Pack ein (siehe [BASE beziehen](../start/obtenir-base.md)) und formulieren Sie eine konkrete Anfrage. Anweisungsmodus, ohne mechanische Garantien. |
| **Anderer Editor, der `AGENTS.md` liest** | Öffnen Sie den Ordner; die projizierte `AGENTS.md` beschreibt den Agenten. |

Das ist die Browser- und Datei-Stufe: das Modell folgt der Methode, und Sie behalten die Kontrolle, um sie nachzulesen.

## Für ein Team: der MCP-Server von BASE

Wenn Sie die **mechanischen Garantien** wollen (deterministisches routing standardmässig, vermitteltes Schreiben, das vorschlägt und dann committet, gesicherte Ausführung), binden Sie den MCP-Server von BASE an. Es ist derselbe Broker wie in der CLI, Ihrem Werkzeug zugänglich gemacht.

| Werkzeug | Vorgehen |
|-------|-----------|
| **Claude Desktop** | Fügen Sie einen `mcpServers`-Eintrag hinzu, der auf den BASE-Server zeigt. Genaue Details: [`mcp/README.md`](../../mcp/README.md). |
| **Cursor** | MCP-Einstellungen, fügen Sie den BASE-Server hinzu. Details: [`mcp/README.md`](../../mcp/README.md). |
| **VS Code (MCP)** | MCP-Konfiguration der Erweiterung, Server über `stdio`. Details: [`mcp/README.md`](../../mcp/README.md). |
| **ChatGPT** | Entwicklermodus, authentifizierter HTTPS-Endpunkt. Vorgehen und Sicherheit: [`mcp/README.md`](../../mcp/README.md). |

Minimale Form eines lokalen Servers über `stdio` (Pfade anpassen):

```json
{
  "mcpServers": {
    "base": {
      "command": "node",
      "args": ["/chemin/vers/mcp/dist/index.js", "--root", "/chemin/vers/votre/projet"]
    }
  }
}
```

Für den Nur-Lese-Betrieb fügen Sie `--read-only` hinzu. Die vollständige Referenz (Modi, remote, Authentifizierung, Sicherheit) lebt in [`mcp/README.md`](../../mcp/README.md), der Quelle der Wahrheit.

## Welche Stufe für welchen Bedarf

| Bedarf | Stufe |
|--------|--------|
| Ausprobieren, entdecken, Einzelarbeitsplatz | Ordner öffnen |
| Einen Assistenten in einen Browser einfügen | Browser-Pack |
| Mechanische Garantien, Team, vermitteltes Schreiben | MCP-Server |

## Ihr Werkzeug ist nicht aufgeführt

Das Prinzip gilt für die meisten Werkzeuge, die Projektdateien lesen oder MCP sprechen. Laden Sie den Empfangsagenten (`concierge-base`) und fragen Sie «hilf mir, BASE an mein Werkzeug anzubinden»: er liest die Dokumentation Ihres Werkzeugs und führt Sie, wobei er die Validierungsnaht erhält. Siehe auch [BASE und Ihre KI-Werkzeuge](../reference/base-et-vos-outils-ia.md).
