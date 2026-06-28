<!-- fr-synced: db50893283bf35fa5e9828119242bfa5090f3387 -->

# Wissen, welche Garantien Sie je nach Ihrem Werkzeug erhalten

Ihre BASE-Dateien funktionieren in einem KI-Werkzeug, das Ihre Dateien lesen kann (zum Beispiel GitHub Copilot, Antigravity, Claude Code oder Cowork, OpenCode, Kilo Code), sowie in einer gängigen KI-Webplattform über MCP (zum Beispiel ChatGPT, Claude, Gemini), aber **die Garantien unterscheiden sich von Werkzeug zu Werkzeug**. Diese Seite sagt Ihnen ohne Umschweife, was jedes Harness wirklich schützt, damit Sie Ihr Vertrauensniveau in voller Kenntnis der Sachlage wählen.

> Ehrlichkeitsregel: Eine Garantie ist nur dann **strikt**, wenn die Aktionen über BASE laufen (über die CLI, den Broker, den MCP-Server oder einen kontrollierten Konnektor). Eine Aktion, die BASE **umgeht** (ein Agent, der direkt in eine Datei schreibt), bleibt auf der nativen Ebene des Harness.

## Drei Ebenen

- **advisory** (1): BASE leitet an und protokolliert, aber das Werkzeug kann sich darüber hinwegsetzen.
- **teilweise Mediation** (2): Manche Aktionen laufen über BASE, andere nicht.
- **strikt** (3): Die Aktion wird vermittelt; der Broker ist das obligatorische Tor für die von BASE geleiteten Aktionen.

## Matrix

Diese Matrix wird **aus dem Kern generiert** (`base build tools`), wodurch sie mit der Deklaration des Frameworks synchron bleibt. Sie gibt die **maximal erreichbare Ebene** an, wenn die Aktion tatsächlich über BASE läuft und das Harness dafür konfiguriert ist. Sie misst nicht automatisch den tatsächlichen Zustand Ihrer Installation.

| Garantie | claude-code | cursor | chatgpt (mcp) | generisch |
| --- | --- | --- | --- | --- |
| Pfadeingrenzung (vermittelter Zugriff) | 3 | 3 | 3 | 1 |
| Bestätigung vor dem Schreiben (`propose`/`commit`) | 3¹ | 2 | 3¹ | 1 |
| Werkzeugausführung (dry-run + Bestätigung) | 3¹ | 2 | 3¹ | 1 |
| Native Erkennung der Skills | 3 | 2 | 1 | 1 |
| Hooks / mechanische Schutzmechanismen | 3² | 2² | 0 | 0 |

¹ Ebene 3 nur für Aktionen, die vom BASE-Broker geleitet werden (`propose`/`commit`, `invoke`). Ein Schreib- oder Ausführungsvorgang, der den Broker umgeht, bleibt advisory.

² Diese Ebene ist nur erreichbar, wenn das Harness so konfiguriert ist, dass es die betroffenen Aktionen an den Broker oder einen Hook leitet. BASE liefert diese Hooks nicht für alle Harnesses.

## Was das bedeutet

- **Für den persönlichen Gebrauch** reicht der advisory-Modus aus: Sie prüfen und bestätigen ohnehin.
- **Für ein Team oder eine Organisation** leiten Sie sensible Aktionen über den Broker (CLI, MCP) oder einen Hook und konfigurieren eine strikte Policy (`base.config`). Genau dort werden die Garantien real.
- **Der MCP-Server** bietet die dichteste Durchsetzung, da der Agent nur Zugriff auf die Werkzeuge hat und nie direkt auf die Dateien, aber er erfordert auch den meisten Einrichtungsaufwand; siehe [MCP-Server](../../mcp/).

Für die technischen Details (der Port `PolicyEnforcer`, die genaue Grenze) siehe `specs/current/10_core/policy.md`.

---

BASE ist ein Framework von [AI Swiss](https://a-i.swiss). Anwendungsfälle in Partnerschaft mit [Innovaud](https://innovaud.ch).
