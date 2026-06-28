<!-- fr-synced: 83854493f3532568c305224ae9af9b9f7fa007a5 -->

# Ihre Modelle souverän halten, lokal oder in der Schweiz

Ein Modell mit BASE zu nutzen darf nicht bedeuten, dass Sie Ihre Daten einem Anbieter ausserhalb Ihrer Kontrolle anvertrauen. Wenn das Ihre Anforderung ist, behalten zwei konkrete Wege die Kontrolle in Ihrer Hand, vollständig lokal oder in der Schweiz gehostet, mit einem Anhaltspunkt für die Wahl je nach Sensibilität dessen, was Sie verarbeiten.

Der Kern von BASE ruft niemals einen Modellanbieter auf. In der Grundkonfiguration verlässt nichts Ihre Maschine. Ein Modell laufen zu lassen (für eine Evaluation oder um einen Assistenten zu steuern) ist eine **bewusste Entscheidung**, und diese Entscheidung kann souverän bleiben.

Zwei Wege halten Ihre Daten unter Ihrer Kontrolle:

- **Vollständig lokal** mit Ollama: nichts verlässt die Maschine.
- **In der Schweiz gehostet** mit Infomaniak: eine OpenAI-kompatible API, in der Schweiz betrieben.

Keiner davon ist verpflichtend. Das Standard-Routing von BASE ist vollständig lokal und verlangt kein Modell.

## Welches Modell passt

BASE läuft nicht mit irgendeinem Modell, und das sollte man besser klar sagen. Ein Prozess braucht ein Modell, das Werkzeuge zuverlässig einsetzen kann (eine Datei lesen, eine vorschlagen, eine Ressource suchen, eine Funktion aufrufen), ohne einen Aufruf oder einen Parameter zu erfinden, das Anweisungen mit mehreren Bedingungen befolgt, bei Bedarf eine strukturierte Ausgabe liefert, über einige Austausche hinweg den Faden hält und sich allein an die gelieferten Daten hält. Was zählt, ist nicht ein einzelner gelungener Versuch, sondern die Beständigkeit über die Zeit. Mehrere offene, lokal ausführbare Modelle nehmen diese Hürde heute, als Beispiele und ohne Anspruch auf Vollständigkeit: Qwen (unter Apache-2.0-Lizenz) oder die Gemma-Familie von Google (unter ihrer eigenen Lizenz), die Funktionen aufrufen und strukturierte Ausgaben liefern können, halten gut abgesteckte Prozesse durch. Die Landschaft bewegt sich schnell, und das Kriterium, das zählt, ist nicht die Marke, sondern die Beständigkeit über die Zeit: Werkzeuge aufrufen, ohne einen Aufruf zu erfinden, mehrere Bedingungen zugleich befolgen, sich an die gelieferten Daten halten. Die komplexesten Verkettungen bleiben der Vorteil der grossen gehosteten Modelle. Die richtige Wahl hängt vom Prozess ab, nicht von einem Slogan.

## Vollständig lokal: Ollama

Nichts verlässt die Maschine. Ideal für einen Einzelarbeitsplatz, eine Demonstration oder eine vom Netzwerk isolierte Umgebung.

```js
import { createOllamaModel } from "@ai-swiss/base-llm";

const model = createOllamaModel({ model: "qwen3.5:9b-q4_K_M" });
```

Um eine vollständig lokale Evaluation zu starten (das Modell muss zuvor in Ollama verfügbar sein):

```bash
npm run eval -- --ollama --model qwen3.5:9b-q4_K_M
```

## In der Schweiz gehostet: Infomaniak

Infomaniak bietet offene Modelle über eine **OpenAI-kompatible** API an, in der Schweiz gehostet. Je nach Anbieter, den Sie wählen, und dessen Bedingungen können Ihre Daten in einer schweizerischen Jurisdiktion bleiben, ohne von einem aussereuropäischen Anbieter abzuhängen.

Der Port `base-llm` spricht bereits die OpenAI-kompatible API: geben Sie die Basis-URL von Infomaniak an, Ihren Key und ein Modell aus deren Katalog.

```js
import { createOpenAICompatibleModel } from "@ai-swiss/base-llm";

const model = createOpenAICompatibleModel({
  model: "<modele du catalogue Infomaniak>",
  apiKey: process.env.INFOMANIAK_TOKEN,
  baseUrl: "https://api.infomaniak.com/1/ai/<PRODUCT_ID>/openai",
});
```

`<PRODUCT_ID>` ist die Kennung Ihres AI-Tools-Produkts. Sie erhalten sie und wählen Ihre Modelle in Ihrem Infomaniak-Bereich oder über deren API (`GET /1/ai`). Siehe die [Infomaniak-Dokumentation](https://www.infomaniak.com/fr/hebergement/ai-services).

Für eine Evaluation über Infomaniak geben Sie den Key über die Umgebung an und zeigen auf die Basis-URL:

```bash
export OPENAI_API_KEY="$INFOMANIAK_TOKEN"
npm run eval -- --base-url "https://api.infomaniak.com/1/ai/<PRODUCT_ID>/openai" --model "<modele>"
```

## Wählen

| Bedarf | Weg |
|--------|--------|
| Maximale Vertraulichkeit, offline, Einzelarbeitsplatz | Ollama (vollständig lokal) |
| Schweizer Souveränität, grössere Modelle, Team oder Institution | Infomaniak (in der Schweiz gehostet) |
| Die Methode ohne jedes Modell evaluieren | Standard-Routing, vollständig lokal |

## Lokal oder Cloud, je nach Sensibilität der Daten

Das richtige Kriterium ist das, was Sie dem Modell anvertrauen. Diese Tabelle gibt einen Ausgangspunkt; sie ersetzt keine Rechtsberatung, und für regulierte Fälle liegt die Entscheidung bei Ihrer Compliance-Verantwortlichen.

| Sensibilität der Daten | Sinnvolle Optionen |
|-------------------------|----------------------|
| **Öffentlich** (veröffentlichte Kommunikation, Website-Inhalte) | Alles ist offen: führendes Cloud-Modell, Schweizer Hosting oder lokal, ganz nach gewünschtem Komfort. |
| **Intern** (Abläufe, nicht vertrauliche Projektnotizen) | Schweizer Hosting oder lokal; eine aussereuropäische Cloud erst nach Prüfung ihrer Bedingungen und ihrer Aufbewahrung. |
| **Vertraulich** (Kundschaft, Verträge, Finanzen) | Lokal (Ollama) oder Schweizer Hosting mit schriftlichen vertraglichen Garantien. |
| **Personenbezogen oder reguliert** (HR, Gesundheit, Daten, die dem nDSG oder der DSGVO unterliegen) | Zuerst lokal; sonst eine von Ihrer Compliance freigegebene Umgebung, oder die KI aus dem Spiel lassen. |

Ein Punkt, den diese Optionen oft verschleiern: wo die Daten liegen, ist nicht dasselbe wie wer rechtlich darauf zugreifen kann. Ein Dienst, der "in der Schweiz gehostet" oder eine "europäische Cloud" ist, aber von einer Gesellschaft unter ausländischer Kontrolle betrieben wird, bleibt der Jurisdiktion seiner Muttergesellschaft unterworfen, allen voran dem US-amerikanischen CLOUD Act, der Daten erreicht, "wo auch immer sie gespeichert sind". Souveränität liest man am Vertrag und an der Struktur des Betreibers ab, nicht am Land des Rechenzentrums. Bei hoher Sensibilität bleibt das Lokale also die einzige Option, die auf niemandes Vertrauen beruht.

Die Einzelheiten der Verantwortlichkeiten, die bei Ihnen bleiben, finden Sie unter [Datenschutz](../trust/protection-des-donnees.md).

## Was ein kleines lokales Modell gut und schlecht kann

Ein Modell, das auf einem guten Laptop läuft, genügt für einen echten Teil der Arbeit, sofern man weiss, wo es aufhört.

Was es gut kann:

- **Das Routing kommt ohne es aus.** Das Standard-Routing von BASE ist lexikalisch und verlangt kein Modell. Rudimentär, aber wirksam, durch Adapter erweiterbar, erspart es der nutzenden Person die geistige Last, den richtigen Prozess zu suchen, und funktioniert auf dieselbe Weise mit oder ohne lokales Modell, klein oder gross.
- **Innerhalb eines kurzen Prozesses schreiben.** Wenn der Prozess die Struktur, die Regeln und die Daten liefert, erzeugt ein kleines Modell einen ehrlichen ersten Entwurf.
- **Umformulieren.** Zusammenfassen, was es verstanden hat, einen Ton anpassen, einen Text verdichten: kurze und abgesteckte Aufgaben.

Was es schlecht kann:

- **Einen langen Prozess getreu befolgen.** Jenseits von rund hundert Zeilen Anweisungen verliert ein kleines Modell unterwegs Bedingungen: es überspringt Schritte oder vergisst Regeln. Zerlegen Sie die Prozesse, oder wechseln Sie zu einem grösseren Modell.
- **Rechnen.** Mehrwertsteuer, Summen, Margen: verlangen Sie diese Ergebnisse niemals vom Modell. Übergeben Sie sie einer deterministischen Tool (`base invoke`), die bei jeder Ausführung dasselbe Ergebnis liefert.

Die Evaluation `base eval` macht diese Grenzen sichtbar, statt sie erraten zu lassen: besonders die Rolle des Richters verlangt oft ein stärkeres Modell als jenes, das den Assistenten trägt.

## Die in diesem Repository getestete Konfiguration

Zwei lokale Konfigurationen werden von den Maintainern tatsächlich verwendet, so wie sie sind:

- **`base eval` mit Ollama und `qwen3.5:9b-q4_K_M`** für die simulierte Nutzerin und den Richter; siehe [tools/eval/README.md](../../../tools/eval/README.md), einschliesslich, wie man den Richter mit einem grösseren Modell verstärkt.
- **`nomic-embed-text` für lokale Embeddings**: es ist das Standardmodell von `createOllamaEmbedder()` im Paket `@ai-swiss/base-ranker-semantic`, wenn ein Projekt den semantischen Ranker aktiviert, ohne etwas ausser Haus zu senden.

In jedem Fall bleibt der Kern dieselbe Textdatei, die Ihnen gehört. Das Modell ist ein austauschbares Detail, nicht der Ort, an dem Ihre Methode lebt.

## Zum Weiterlesen

- [Souveränität und Vertrauen](../trust/souverainete-et-confiance.md)
- [Datenschutz](../trust/protection-des-donnees.md)
- [Datensicherheit und Routing](../trust/securite-donnees-routage.md)
- [Einen Embeddings-Provider wählen](choisir-provider-embeddings.md)

---

BASE ist ein Framework von [AI Swiss](https://a-i.swiss). Anwendungsfälle in Partnerschaft mit [Innovaud](https://innovaud.ch).
