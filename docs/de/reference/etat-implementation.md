<!-- fr-synced: 7bd22841f0b5e714d4d8df302ccf499524bc2e6c -->

# Was der öffentliche Kern von BASE heute leistet

Diese Seite richtet sich an alle, die im Präsens wissen möchten, was der öffentliche Kern von BASE kann und was nicht, ohne zu raten. Sie liefert einen ehrlichen Bezugspunkt und verweist auf die drei massgeblichen Quellen, statt sie zu kopieren:

- **die genaue Grenze** (im Geltungsbereich, ausserhalb des Geltungsbereichs): [`specs/current/00_overview/perimeter.md`](../../specs/current/00_overview/perimeter.md);
- **den Nachweis jedes Verhaltens**: die Matrix von Anforderungen zu Tests, [`specs/current/10_core/requirements-matrix.md`](../../specs/current/10_core/requirements-matrix.md);
- **die Historie und die Ausrichtung**: das [`CHANGELOG.md`](../../CHANGELOG.md).

Bei Abweichungen zwischen einer dieser Quellen und dieser Seite ist die Quelle massgeblich. Um zu verstehen, welche Adoptionsstufe zu Ihrer Situation passt, siehe auch [`docs/audiences/pour-qui.md`](../audiences/pour-qui.md).

## Was der öffentliche Kern leistet

- Lokale Bestandsaufnahme von Markdown- und JSON-Ressourcen.
- Validierung des BASE-Frontmatters, der Bezeichner, der relativen Links, der lokalen Quellen und der Entrypoints von Werkzeugen.
- Erklärbare lokale Suche über Bezeichner, Titel, Beschreibung, Schlüsselwörter, Pfad und Text.
- Lokales routing von Agent zu Prozess mit strukturierter Enthaltung: `base route` und das MCP-Werkzeug `route_request` liefern `routed`, `ambiguous`, `needs_clarification` oder `out_of_scope`, mit Kandidaten und Begründungen.
- Fachliche routing-Tests: `base route-test` liest JSON-Fixtures und schlägt bei Abweichungen fehl.
- Offizielles Paket eines semantischen Rankers mit echten Embeddings: `@ai-swiss/base-ranker-semantic`, getrennt vom Kern, akzeptiert jeden Embeddings-Anbieter, liefert einen OpenAI-kompatiblen Konnektor ohne Cloud-SDK und einen optionalen Ollama-Helfer (`createOllamaEmbedder`, Modell `nomic-embed-text`). Produktionstauglich: Timeouts pro Aufruf, Abbruch über `AbortSignal`, begrenzte Retries nur bei transienten Fehlern (Backoff plus Jitter), explizites Batching über `createBatchingEmbedder`, konfigurierbarer Cache ohne Vergiftung durch transiente Fehler, typisierte Fehler (`.code`), strenge Validierung der Vektoren und Beobachtbarkeit ohne fachlichen Inhalt.
- Offizielles optionales Paket für einen lokalen Index: `@ai-swiss/base-index-local`, getrennt vom Kern, projiziert einen abgeleiteten und löschbaren Index aus der Bestandsaufnahme und den routing-Signalen. Das indizierte routing verwendet den injizierten Ranker und Router wieder und liefert standardmässig dieselben Status wie im Speicher, auch mit einem semantischen Ranker ohne lexikalischen Treffer; `candidateMode:"lexical"` ist eine explizite Optimierung. Reproduzierbare Benchmarks von 100 bis 50'000 Dokumenten. Der Kern bleibt der Standard für kleine und mittlere Korpora.
- Öffnen von Ressourcen mit den Projektionen `metadata`, `instructions` und `full`.
- Lokaler Zugriff, eingegrenzt auf das Projekt, mit Ablehnung von Pfad-Traversierungen und ausgehenden Symlinks.
- Aufruf lokaler Werkzeuge standardmässig im Dry-Run, mit expliziter Bestätigung für die Ausführung.
- Vermittelte fachliche Schreibvorgänge: `propose_change` bereitet ein lesbares Diff vor, ohne etwas zu schreiben, `commit_change` schreibt nach einer Entscheidung (Bestätigung standardmässig erforderlich, pro Ressource über `requires_confirmation` einstellbar, niemals optional bei `sensitive`/`restricted`), prüft den geschriebenen Zustand und protokolliert.
- Promotion von Ressourcen (`promote`): aktualisiert `scope`, `promoted_from` und `promoted_at` über den vermittelten Schreibvorgang, mit Diff und Bestätigung.
- Liste der offenen Marker (`markers`): `[A VALIDER]`, `[A COMPLETER]`, `[ATTENTION]`, `[DECISION]` in fachlichen Dokumenten.
- Multi-Harness-Projektion (`build`): erzeugt aus dem Kern einen `AGENTS.md`-Index (Kompatibilität mit der Codex/AGENTS.md-Familie) und eine Werkzeugmatrix (`.ai/tools.md`), die das tatsächliche Enforcement-Niveau pro Harness ehrlich deklariert. `base build routing-registry` erzeugt auf Anfrage zusätzlich `.ai/routing/registry.json`, eine deterministische Projektion der routing-Signale. Abgeleitete Artefakte, niemals Quellen der Wahrheit.
- Minimale JSONL-Spur für die von BASE vermittelten Operationen, standardmässig ohne fachlichen Inhalt.
- Lokale Wartung: Fehler, Warnungen, offene Marker, fehlende Beschreibungen und Signale aus den Spuren, sofern vorhanden.
- Abgeleitetes und regenerierbares Manifest für die Entdeckung.
- MCP-Server als Adapter zu denselben Primitiven, ohne eigene fachliche Logik.

## Ausserhalb des öffentlichen Kerns

Die Referenzgrenze ist [`specs/current/00_overview/perimeter.md`](../../specs/current/00_overview/perimeter.md). Kurz gesagt liefert der öffentliche Kern allein nicht:

- Vollständiges Enterprise-RBAC.
- SSO, IAM, DLP, SIEM, rechtliche Archivierung und regulatorische Aufbewahrung.
- Strikte Isolation, wenn der Agent direkten Zugriff auf die Shell, das Filesystem oder API ausserhalb von BASE hat.
- Automatische Garantie der Korrektheit von durch ein Modell generierten Antworten.
- Eine Workflow-Engine, einen DAG, eine Automations-Schnittstelle oder eine proprietäre DSL.

## Leseregel

BASE leitet überall durch den Text. BASE wendet nur das an, was durch seinen Broker, seine CLI, sein MCP oder einen kontrollierten Konnektor läuft.

Ein YAML-Metadatum drückt eine stabile semantische Einheit aus. Der Code entscheidet anschliessend, was geprüft oder angewendet werden kann. Diese Trennung ermöglicht es, einfach für eine einzelne Person zu bleiben, nützlich für ein KMU und erweiterbar für eine grössere Organisation.
