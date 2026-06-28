<!-- fr-synced: fec4b2e371f1e8e296bdd609be08ae81d8f7eaf0 -->

# Mechanismen vs. Vorgaben

## Warum diese Unterscheidung der Kern einer vertrauenswürdigen KI-Governance ist

In den meisten KI-Werkzeugen ist eine Sicherheitsregel in Wirklichkeit ein an das Modell gerichteter Satz, etwa «fass diese Datei nicht an» oder «sende diese Daten niemals an einen entfernten Dienst». Sie funktioniert, solange das Modell kooperiert, und hört in dem Moment auf zu funktionieren, in dem das Modell sich irrt, gekapert wird oder eine Aktion den vorgesehenen Pfad umgeht. Eine solche Regel ist eine **Vorgabe**, keine Garantie.

BASE unterscheidet zwei Ebenen, und diese Unterscheidung begründet seine Ehrlichkeit:

- ein **Mechanismus** wird vom Broker durchgesetzt (die `base`-CLI, der Kern in `tools/` oder der MCP-Server, wenn er an den Broker delegiert). Er greift vor oder während der Aktion und kann sie blockieren, vermitteln oder verweigern. Er hängt nicht vom guten Willen des Modells ab.
- eine **Vorgabe** ist eine Anweisung, die in den Metadaten oder im Kontext ausgedrückt wird. Sie lenkt ein kooperatives Modell und dient als Audit-Signal, erzwingt aber mechanisch nichts. Eine Vorgabe ist kein Code, der ausgeführt wird, auch wenn ein Modell sie manchmal so gut befolgt, dass es diesen Eindruck erweckt: es bleibt immer ein Fehlerspielraum, der je nach Bereich variiert. Für eine Regel, die strikt sein muss, verlässt man sich nie auf ein Modell, sondern braucht einen Mechanismus.

Die Bedingung, die eine Eigenschaft von der Vorgabe zum Mechanismus umschlagen lässt, ist immer dieselbe: **die Aktion läuft über den Pfad des Brokers** (CLI, Kern oder MCP, der an den Broker delegiert). Nimmt die Aktion einen anderen Weg (direkter Zugriff auf die Shell, das Dateisystem oder eine externe API, ohne über BASE zu gehen), wird dieselbe Eigenschaft wieder zur blossen Vorgabe.

```mermaid
flowchart TD
    A[Aktion auf einer Ressource] --> B{Läuft über den Pfad des Brokers (base-CLI, Kern oder delegierendes MCP) ?}
    B -->|Ja| C[Mechanismus: die Eigenschaft wird durchgesetzt, der Broker kann blockieren, vermitteln oder verweigern]
    B -->|Nein, direkter Zugriff auf Shell, Dateien oder eine externe API| D[Vorgabe: blosse Absicht, befolgt nach dem guten Willen des Modells]
```

## Die zwei Welten einer Datei

Diese Grenze ist nicht abstrakt: sie ist in die Struktur einer BASE-Datei selbst eingeschrieben, die aus zwei Teilen besteht, von denen jeder zu einer anderen Welt spricht.

- Der **strukturierte Header** (das Frontmatter: Identität, Geltungsbereich, Sensibilität, Egress-Richtlinie) wird von **getestetem Code** gelesen. Der Broker nutzt ihn, um zu entscheiden und durchzusetzen: einen Zugriff einschränken, vertrauliche Daten zurückhalten, einen Schreibvorgang vermitteln. Das ist die Welt der **Mechanismen**, die nicht vom guten Willen des Modells abhängen.
- Der **Textkörper** (die Methode, das Know-how, die fachlichen Anweisungen) wird von der **KI** gelesen. Er lenkt ein kooperatives Modell, ohne etwas zu erzwingen. Das ist die Welt der **Vorgaben**, nützlich und fehlbar.

Dieselbe Datei verbindet so Ihre Expertise mit dem Code: was garantiert sein muss, lebt im Header, den der Broker durchsetzt; was eine Frage des Urteils ist, lebt im Text, dem die KI folgt. Eine Eigenschaft wird erst dann zum Mechanismus, wenn die Aktion über den Broker läuft, dort, wo dieser Header gelesen wird.

## Tabelle der Eigenschaften

| Eigenschaft | Vom Broker durchgesetzt (Mechanismus) | Nur eine Vorgabe (guter Wille des Modells) |
| --- | --- | --- |
| **Einschränkung der Pfade und Verweigerung von Ausbrüchen über symbolische Links** (`tools/core/confine.mjs`) | Wenn das Lesen oder Schreiben über den Broker läuft: jeder Pfad ausserhalb der erlaubten Wurzel wird verweigert, und eine Auflösung eines symbolischen Links, die aus der Wurzel hinausführen würde, wird ebenfalls verweigert. | Wenn das Modell über ein direktes Werkzeug des Harness schreibt oder liest, ausserhalb des Brokers: die Einschränkung ist nur eine Absicht, nichts verhindert den Zugriff. |
| **Erst vorschlagen, dann festschreiben, vermittelte und atomare Schreibvorgänge** | Wenn der Schreibvorgang über den Broker läuft: die Änderung wird zuerst vorgeschlagen, dann validiert, dann atomar und vermittelt angewendet, was eine Prüfung vor jeder Wirkung erlaubt. | Wenn der Schreibvorgang über ein direktes Werkzeug erfolgt: er ist unmittelbar und unvermittelt, ohne Vorschlagsschritt und ohne von BASE garantierte Atomarität. |
| **Ausführung der Fähigkeiten standardmässig im Dry-Run** | Wenn eine Fähigkeit vom Broker ausgeführt wird: sie wird standardmässig simuliert, die tatsächliche Wirkung erfordert eine ausdrückliche Anforderung. | Wenn das Modell eine gleichwertige Aktion ausserhalb des Brokers auslöst: nichts erzwingt den Dry-Run, die Wirkung kann unmittelbar sein. |
| **Enthaltung beim Routing statt falscher Gewissheit** | Wenn das Routing über den Router von BASE läuft: er kann `out_of_scope`, `ambiguous` oder `needs_clarification` zurückgeben, statt einen Standard-Agenten aufzuzwingen. | Wenn das Modell selbst einen Agenten wählt, ohne den Router aufzurufen: nichts garantiert die Enthaltung, es kann raten. |
| **Egress-Kontrolle vor dem Aufruf** (von Bauart her wird eine vertrauliche Ressource oder eine lokale Wurzel nicht an ein entferntes Modell gesendet, wenn der Aufruf über den Broker läuft) | Wenn der Aufruf über den Broker läuft (MCP-Server, Chat des Studios, Evaluation): die Prüfung erfolgt vor dem Senden, und das Senden einer vertraulichen Ressource oder einer local-only-Wurzel an ein entferntes Modell wird im Vorfeld blockiert. | Wenn der Aufruf an ein entferntes Modell ausserhalb des Brokers erfolgt (zum Beispiel direkt auf der Kommandozeile oder in einem KI-Werkzeug ausserhalb von BASE): keine vorherige Prüfung wird angewendet, die Daten können abfliessen. |
| **MCP standardmässig schreibgeschützt** (Option Bearer-Token) | Wenn der Zugriff über den MCP-Server von BASE läuft: er ist standardmässig schreibgeschützt über HTTP, das Schreiben setzt eine ausdrückliche Aktivierung voraus und kann durch ein Bearer-Token geschützt werden. | Wenn ein anderer Server oder ein direkter Zugriff verwendet wird: weder der standardmässige Schreibschutz noch das Token gelten. |
| **Speicherung der Namen von Umgebungsvariablen, nicht der rohen keys** | Wenn die Einstellungen über den Broker laufen: sie speichern den NAMEN der Umgebungsvariable und nicht den Wert des API-keys, der ausserhalb der Datei bleibt. | Wenn das Modell eine Konfiguration auf andere Weise schreibt: nichts verhindert, einen key im Klartext einzutragen. |
| **Lokales Trace-Protokoll** (`.ai/trace`) | Wenn die Operation vom Broker vermittelt wird: sie wird lokal im Trace-Protokoll festgehalten, was eine Audit-Spur liefert. | Wenn die Aktion den Broker umgeht: sie erscheint nicht im Protokoll, das Audit ist für diese Operation blind. |

## Schlussbemerkung

Ausserhalb des Pfads des Brokers fällt alles auf die native Ebene des Harness zurück. Die Metadaten und die Vorgaben bleiben nützlich als Leitfaden und als Signal für ein kooperatives Modell, aber sie erzwingen nichts: ein direkter Zugriff auf die Shell, das Dateisystem oder eine externe API entzieht sich diesen Eigenschaften. Die praktische Regel ist einfach: eine Garantie ist nur dann real, wenn die Aktion über die `base`-CLI, über den Kern oder über das an den Broker delegierende MCP läuft.

Hinweis zum Geltungsbereich: BASE ist weder eine Agenten-Runtime noch eine Orchestrierungs-Engine, noch ein RAG-Dispositiv, noch eine Plattform, noch ein IAM-, DLP-, SIEM-, RBAC-System, noch ein Mechanismus zur Aufbewahrung oder zur rechtlichen Archivierung. Es garantiert auch nicht die Korrektheit der Ausgaben eines Modells. Die Wahl des Modells selbst ist BASE äusserlich.

Diese Seite ist informativ und stellt weder eine Konformitätszertifizierung noch eine rechtliche oder sicherheitstechnische Beratung dar. Eine Institution bleibt für ihre eigene Folgenabschätzung (DPIA) und ihre eigene Sicherheitsrichtlinie verantwortlich.
