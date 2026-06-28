<!-- fr-synced: 8964d66d011024684f4011941a56e7f9c3a23104 -->

# Die Versprechen von BASE und ihre Grenzen ueberpruefen

Bevor man BASE echte Arbeit anvertraut, muss man seine Versprechen ueberpruefen koennen, statt sie auf Treu und Glauben zu nehmen: Fuer jedes grosse Versprechen finden Sie hier den Mechanismus, den Test oder das Beispiel, das es stuetzt, sowie die Grenze, die Sie kennen sollten. Genau das braucht jeder, der BASE pruefen muss, bevor er sich darauf verlaesst: Entwickler, Maintainer, Institution, Unternehmen. Eine visionaere Formel ist nur dann etwas wert, wenn sie auf eine Datei, einen Test, ein Beispiel, eine Grenze oder eine explizite Entscheidung verweist.

## Struktur zur Validierung

**Claim.** BASE macht die Arbeit mit KI besser ueberpruefbar, weil Absicht, Kontext, Prozess, Ressourcen und erwartete Ausgaben schriftlich festgehalten sind.

**Mechanismen.**

- `docs/reference/routage-process-et-ressources.md` erklaert die Kette Agent -> Prozess -> Ressourcen.
- `specs/current/10_core/writes.md` definiert die Disziplin propose -> commit.
- `tests/base-routing.test.mjs` schuetzt die erwarteten Enthaltungen, Mehrdeutigkeiten und Routen.
- `tests/base-core.test.mjs` schuetzt Validierung, Verknuepfungen, Inventar und oeffentliche Schutzmechanismen.
- `specs/current/10_core/requirements-matrix.md` verbindet jede Anforderung (UR/FR/NFR) mit den Testdateien, die sie zitieren; die Matrix wird generiert (`npm run spec:matrix`) und ihre Aktualitaet wird von der Testsuite geprueft.

**Grenze.** BASE macht den Pfad der Ueberpruefung expliziter, garantiert damit aber nicht, dass eine Antwort wahr ist.

## Lokal als Standard

**Claim.** BASE kann als lokale, lesbare und portable Struktur funktionieren, noch vor jeder Plattform.

**Mechanismen.**

- `tools/base.mjs` stellt die lokalen Befehle bereit.
- `docs/guides/connecter-votre-outil.md` zeigt, wie man verschiedene Werkzeuge anbindet.
- `docs/guides/modeles-souverains.md` dokumentiert Optionen fuer lokale oder souveraene Modelle.
- `mcp/README.md` zeigt die Integration, ohne die Quelle der Wahrheit zu verschieben.

**Grenze.** Organisationen muessen rund um BASE weiterhin IAM, DLP, Aufbewahrung, Protokollierung und juristische Pruefung definieren.

## Optionale Schichten

**Claim.** BASE kann fuer eine kleine Nutzung einfach bleiben und Schichten hinzufuegen, wenn der Bedarf real ist.

**Mechanismen.**

- `docs/learn/comprendre-echelle.md` erklaert, wann der lokale Index nuetzlich wird.
- `packages/base-index-local/README.md` dokumentiert den optionalen Index.
- `packages/base-ranker-semantic/README.md` dokumentiert das optionale semantische Ranking.
- `packages/base-eval/README.md` dokumentiert die Evaluation.

**Grenze.** Eine Schicht hinzuzufuegen vergroessert die Wartungsflaeche. Einfachheit als Standard bleibt eine Gestaltungsregel.

## Ihren Assistenten bewerten, ohne daraus einen Beweis zu machen

**Ein Werkzeug, kein Argument.** BASE stellt `base eval` bereit: Ein simulierter Nutzer spricht ueber den echten Broker mit Ihrem Assistenten, und ein unabhaengiger Richter bewertet das Gespraech anhand der Ziele eines Szenarios. Es ist ein Instrument, das man erkunden kann, um *Ihre* Zusammenstellung zu beurteilen (Ihr Agent, Ihr Modell, Ihre Szenarien), niemals ein Beweis fuer die Qualitaet von BASE: Was es misst, haengt von Ihrem Modell, Ihrem Beispiel und Ihrer Hardware ab, nicht von BASE.

**Mechanismen.**

- `tools/eval/README.md` dokumentiert den Befehl und die Rolle des Richters.
- `exemples/assistant-devis/.ai/experiments/scenarios/` enthaelt versionierte und reproduzierbare Szenarien zum Wiederverwenden.

**Grenze.** Die Ergebnisse sind die Ihren, nicht die unseren. Ein schwacher Richter liefert schwache Urteile; die Zahlen haengen vom Modell, seiner Version und der Hardware ab. Nur das Protokoll und die Szenarien sind stabil, und BASE veroeffentlicht kein Evaluationsergebnis als Beweis fuer seine Qualitaet.

## Dokumentation als Projektion

**Claim.** Interaktive Dokumentation kann schoen sein, ohne zu einer zweiten Quelle der Wahrheit zu werden.

**Mechanismen.**

- `specs/current/10_core/docs.md` definiert das Dokumentationsmodell.
- `tools/docs/model.mjs` baut das Modell aus den Quellen.
- `packages/base-docs-site/` rendert die Website als Adapter.
- `tests/base-docs.test.mjs` schuetzt Determinismus, oeffentliche Filterung und einen deploybaren Build.

**Grenze.** Praesentationsseiten muessen schlicht bleiben. Wenn eine dauerhafte Erklaerung noetig ist, soll sie in `docs/` oder `specs/` leben.

## Feldschleife, Egress und Gesundheit des Korpus

- **Egress-Kontrolle**: eine einzige Regel, ein einziger Kontrollpunkt, `tools/core/egress.mjs`
  (`checkEgress`, eine reine Funktion, getestet in der Matrix Lokalitaet x Policy x Vertraulichkeit in
  `tests/base-egress.test.mjs`). Der Chat weigert sich, ein vertrauliches Dokument mit einem entfernten
  Modell zu bearbeiten. Das Context Pack haelt die betroffenen Referenzen zurueck (Badge «zurueckgehalten» auf dem Bildschirm) und die
  Evaluationsspur protokolliert die geschwaerzten Dokumente.
- **Frictions-Journal**: `.ai/feedback/` ist nur zum Erstellen, das MCP-Werkzeug
  `report_friction` veraendert niemals einen Eintrag (Kollision = Suffix; geprueft durch
  `tests/base-feedback.test.mjs` und `mcp/tests/index.test.ts`). «Als geloest markieren» geht erneut durch das
  Tor propose → diff → commit wie jede Schreiboperation.
- **Enthaltungen des Routers**: jedes `out_of_scope` / `ambiguous` / `needs_clarification` wird
  von den Adaptern (CLI und MCP) in `.ai/feedback/abstentions.jsonl` protokolliert; der Broker
  bleibt ohne Nebenwirkungen. Beide Tore gehen durch dieselbe Schreibfunktion.
- **`base doctor`**: reine Projektion auf vorhandene Daten (Inventar, Verknuepfungsgraph,
  Runs, Feedback), ohne eigenen Zustand. Sechs Pruefungen, zwei Schweregrade, eine obligatorische
  Korrekturspur pro Signal (`tests/base-doctor.test.mjs`). Zwei Tore fuer eine einzige
  Funktion: CLI `base doctor [--json]` und `GET /api/doctor` (Studio-Banner).
