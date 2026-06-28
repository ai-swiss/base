<!-- fr-synced: 6542bdf34420104d7e76c1b61c41528360c5f58e -->

# BASE aktualisieren, ohne Ihre Arbeit zu beschädigen

Diese Seite richtet sich an alle, die auf BASE aufbauen: an Selbständige, an KMU, an Schulen oder an Verwaltungen. Sie beschreibt, was die Version 1.x garantiert und was sich noch ändern kann, damit Sie BASE einsetzen und aktualisieren können, ohne befürchten zu müssen, dass eine neue Version das beschädigt, was Sie aufgebaut haben.

## Semantische Versionierung

Ab der **1.0** folgt BASE dem [Semantic Versioning](https://semver.org/lang/fr/):

- **MAJOR** (`2.0.0`): eine inkompatible Änderung der stabilen öffentlichen Oberfläche (siehe unten).
- **MINOR** (`1.1.0`): rückwärtskompatible Ergänzungen (neue Befehle, neue optionale Felder, neue Erweiterungspunkte).
- **PATCH** (`1.0.1`): rückwärtskompatible Korrekturen.

## Was die 1.x garantiert (stabile Oberfläche)

Diese Elemente ändern sich nicht auf inkompatible Weise ohne einen **Major**-Schritt:

- **Das Format der Ressourcen**: die Frontmatter `schema_version: base.resource.v1`, ihre Felder und ihre `type`-Werte. Eine heute gültige Datei bleibt gültig.
- **Die bestehenden CLI-Befehle**: `validate`, `index`, `inventory`, `discover`, `route`, `route-test`, `open`, `access`, `invoke`, `propose`, `commit`, `promote`, `markers`, `trace`, `build` und `entretien`, mit ihren dokumentierten Flags.
- **Die bestehenden MCP-Tools**: ihre Namen und ihre Parameter.
- **Die Schemata der Projektionen**: `base.manifest.v1`, `base.routing.v1`.
- **Der Vertrag der Erweiterungspunkte**: `base.config` (rankers, Validatoren, policy, auth) ist rein **additiv**, Ihre Konfiguration funktioniert weiterhin.

Das ist die Zusage **NFR-CORE-002**, das Versprechen «keine Brüche»: das Bestehende funktioniert von einer Version zur nächsten weiter.

## Was sich noch ändern kann

- Der **Inhalt** der abgeleiteten Projektionen (die Details eines Manifests, eines Registers): das sind regenerierbare Projektionen, niemals eine Quelle der Wahrheit.
- Die **Rangordnung** eines routers, denn ein besserer ranker kann die Reihenfolge der Kandidaten ändern; der *Vertrag* des routing (Status, Enthaltung) bleibt stabil.
- Die optionalen **Begleitpakete** folgen ihrer eigenen Versionierung: `@ai-swiss/base-ranker-semantic` (embeddings), `@ai-swiss/base-index-local` (Index im grossen Massstab), `@ai-swiss/base-llm` (der LLM-Port, hinter dem Studio und der Evaluation) und `@ai-swiss/base-eval` (die Evaluation). Der Kern **verlangt keines** davon: es sind optionale Peers, die nur installiert werden, wenn Sie die betreffende Funktion nutzen, und sie fügen dem Kern keine Drittabhängigkeit hinzu.
- Die **Beispiele** und die Dokumentation können ohne Vorankündigung erweitert werden.

## Laufzeitkompatibilität

- **Node.js >= 18.** Der Kern ist abhängigkeitsfrei und wird in der Continuous Integration auf Node 18, 20, 22 und 24 getestet. Die optionalen Tools (Evaluation, Studio) haben ihrerseits ihre eigenen Abhängigkeiten, die standardisiert und vom Kern isoliert sind.
- **Portabel zwischen Tools.** Die Dateien `CLAUDE.md`, `.cursor/rules/`, `AGENTS.md` sind generierte Adapter; der portable Kern bleibt `.ai/`, die Markdown-Dokumente und die lokalen Befehle.
- **Portabel zwischen Stacks.** Ausgehend von den mit dem Framework gelieferten Spezifikationen (`specs/`) kann man die Sprache oder die Bibliotheken wechseln, um gleichwertige Funktionen neu aufzubauen: eine Oberfläche wie das Studio verlangt Code und damit standardisierte technische Entscheidungen.

## Veraltungen

Wenn ein stabiles Element verschwinden muss, wird es zuerst **als veraltet markiert** (im `CHANGELOG` dokumentiert, über mindestens eine Minor-Version funktionsfähig gehalten), bevor es in einer **Major**-Version entfernt wird.

Siehe das [CHANGELOG](../../CHANGELOG.md) für die Historie und [Sicherheit und Grenzen](../trust/securite-et-limites.md) für die ehrliche Grenze der Garantien.
