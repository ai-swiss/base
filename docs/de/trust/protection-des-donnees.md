<!-- fr-synced: 9695aebc013ecf6b35330f4278d7a704d6e9b518 -->

# Datenschutz

Wenn man BASE nutzt, wohin gehen die Daten? Die Antwort darauf bestimmt Ihre Konformität mit dem DSG und der DSGVO sowie das Vertrauen, das Sie dem Werkzeug entgegenbringen können. Für den Datenschutzbeauftragten, die Compliance-Verantwortliche oder die umsichtige Führungsperson, die diese Frage trägt, fasst diese Übersicht zusammen, was andernorts dokumentiert ist, und verweist darauf zurück.

## Welche Daten BASE verarbeitet

- **Ihre lokalen Dateien.** BASE strukturiert Textdateien (Markdown, JSON), die in Ihren Ordnern liegen und Ihnen gehören. Es liest und schreibt sie lokal: die einzigen Kopien sind lokal (ein Schnappschuss der vorgeschlagenen Änderung in `.ai/changes/` sowie das lokale Journal `.ai/trace/`, das Bezeichner und Pfade erfasst, nicht den Inhalt). Nichts wird anderswohin gesendet, ohne dass Sie selbst tätig werden.
- **Minimale technische Spuren.** Aktionen, die über BASE laufen, schreiben eine lokale JSONL-Zeile in `.ai/trace/`: Bezeichner von Ressourcen und Pfade der vermittelten Operationen (lokal), Entscheidungen, Dauern, niemals den Dateiinhalt. Diese Spuren dienen der lokalen Wartung und Prüfung, nicht der Überwachung, und werden mit `base trace prune` verwaltet.

## Was Ihre Maschine verlässt, und wann

Nichts, standardmässig. Der Kern von BASE führt keine Netzwerkaufrufe durch: das standardmässige Routing ist lokal und lexikalisch. Jeder Datenabfluss entspricht einer ausdrücklichen Entscheidung Ihrerseits, niemals einer versteckten Einstellung.

| Möglicher Abfluss | Wann | Wer entscheidet | Wo es dokumentiert ist |
| --------------- | ----- | ---------- | ------------------ |
| Das KI-Werkzeug, das Sie über BASE nutzen | In jedem Gespräch, in dem Sie ihm Inhalte anvertrauen | Sie, indem Sie das Werkzeug und das, was Sie ihm zeigen, wählen | [Sicherheit und Grenzen](securite-et-limites.md), Abschnitt «Daten und KI-Anbieter» |
| Ein Embeddings-Anbieter | Nur wenn Sie den optionalen semantischen Ranker aktivieren | Sie, durch ausdrückliche Konfiguration; eine lokale Option (Ollama) besteht | [Sicherheit und Daten des Routings](securite-donnees-routage.md) |
| Der MCP-Server | Nur wenn Sie ihn einer Chat-App freigeben | Sie, durch ausdrückliche Konfiguration; standardmässig nur Lesezugriff | [`mcp/README.md`](../../mcp/README.md) |

Für jede Zeile gilt dieselbe Regel: der Abfluss ist standardmässig deaktiviert, wird von Ihnen aktiviert und ist an der angegebenen Stelle dokumentiert.

## Was BASE nicht tut

- **Keine Telemetrie.** BASE sendet niemandem irgendwelche Nutzungsstatistiken.
- **Kein Konto.** Keine Anmeldung, kein Bezeichner, kein Benutzerprofil.
- **Keine BASE-Cloud.** Es gibt keinen BASE-Server, der Ihre Dateien empfangen würde: das Projekt ist ein lokales Framework, das Ihnen gehört.

## Ihre verbleibenden Verantwortlichkeiten

BASE macht Sie nicht allein konform mit dem DSG oder der DSGVO. Es begrenzt von der Konzeption her, was Ihren Arbeitsplatz verlässt, und macht die Grenze ausdrücklich. Der Rest bleibt organisatorisch:

- die Rechtsgrundlagen Ihrer Bearbeitungen;
- das Verzeichnis der Bearbeitungstätigkeiten;
- die Rechte der betroffenen Personen (Auskunft, Berichtigung, Löschung);
- die Bewertung des KI-Anbieters, den Sie über BASE anbinden (Bedingungen, Aufbewahrung, Ort der Bearbeitung).

Es ist dieselbe Ehrlichkeit wie bei der Sicherheit: BASE stärkt die lokale Kontrolle, aber eine Datenschutzrichtlinie bleibt unverzichtbar.

## Weiterführendes

- Überblick zur Begründung der Wahl: [Souveränität, Vertrauen und Konformität](souverainete-et-confiance.md).
- Die Einzelheiten des semantischen Routings und der Embeddings: [Sicherheit und Daten des Routings](securite-donnees-routage.md).
- Das vollständige Sicherheitsmodell und seine Grenzen: [Sicherheit und Grenzen](securite-et-limites.md).
- Für ein KMU: [Starter-Kit Schweizer KMU](../audiences/kit-demarrage-pme-suisse.md).
- Für eine öffentliche Institution: [Kit Verwaltung und öffentlicher Sektor](../audiences/kit-administration-secteur-public.md).

---

BASE ist ein Framework von [AI Swiss](https://a-i.swiss). Anwendungsfall in Partnerschaft mit [Innovaud](https://innovaud.ch).
