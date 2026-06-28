<!-- fr-synced: 25e0fc55650c859ba0c79972a7f10540ab37a82b -->

# Die Gates von BASE

Die Disziplin von BASE wird durch Kontrollen sichergestellt, nicht durch Vertrauen. Diese Seite
listet sie auf, damit eine Mitwirkende oder ein Mitwirkender bei einem Fehlschlag weiss, was das Gate
prüft und wie es zu beheben ist.

Drei Ebenen: der Commit-**Hook** (optional, `git config core.hooksPath .githooks`), der lokale Befehl
**`npm run check`** (das Herzstück der Gates, vor dem Pushen auszuführen) und die **CI** (die noch
mehr davon ausführt). «Lokal grün» ist also nicht «überall grün»: Die CI ergänzt die Abdeckung, die
neu generierten Artefakte, den Doctor, das Smoke Pack sowie die MCP- und Studio-Suiten.

```mermaid
flowchart LR
    A[Commit-Hook (optional)] --> B[npm run check (vor dem Pushen)]
    B --> C[CI (Abdeckung, Doctor, Smoke, MCP, Studio)]
```

## `npm run check` (das Herzstück, lokal)

| Gate | Prüft | Beheben |
|---|---|---|
| `spec:matrix --check` | Die Anforderungsmatrix ist aktuell; kein Zitat verweist auf einen fehlenden Nachweis. | `npm run spec:matrix`, dann die geänderten Zeilen erneut prüfen. |
| `check-ids` | Die Bezeichner sind stabil: keine Neunummerierung, keine Wiederverwendung. | Den bestehenden Bezeichner behalten; ein neuer Bezeichner wird mit `spec:new` zugeteilt. |
| `check-id-namespaces` | Jeder Bezeichner bleibt im von seiner Sektion deklarierten Namespace. | Den Bezeichner am Präfix seiner Sektion ausrichten. |
| `check-leaf` | Ein Spec-Blatt bleibt kurz (<= 250 Zeilen), ohne Status und geroutet. | Das Blatt aufteilen, den Status entfernen, es anbinden. |
| `check-markers` | Der geschlossene Satz an Markern (`[A VALIDER]`, `[ATTENTION]`, `[A COMPLETER]`, `[DECISION]`) bleibt konsistent. | Nur diese vier Marker verwenden. |
| `check-statusless` | Die Referenzseiten stehen im Präsens, ohne Status. | Im Präsens umformulieren; den Status entfernen. |
| `check-emdash` | Kein Geviertstrich im französischen Inhalt (`docs/`, README, CONTRIBUTING, MANIFESTO). | Durch Doppelpunkt, Klammern oder einfachen Bindestrich ersetzen. |
| `check-punctuation` | Enge Westschweizer Interpunktion im Französischen (`docs/`, `exemples/`, README, CONTRIBUTING, MANIFESTO): kein Leerzeichen vor `: ; ! ?`, enge Anführungszeichen, kein Geviertstrich in den Beispielen. | Die Interpunktion enger setzen; eine Ausnahme wird auf der Zeile mit `[PUNCT-OK: raison]` deklariert. |
| `check-lexique` | Keine verbotene Formulierung erscheint in der französischen Prosa. | Umformulieren; eine Ausnahme wird auf der Zeile mit `[LEXIQUE-OK: raison]` deklariert. |
| `check-translations` | Die Übersetzungen nennen das Französische als Referenzversion. | Den Hinweis auf die französische Quelle hinzufügen. |
| `check-tree` | Keine Streudatei; die Doc-Seiten sind in Kebab-Case und <= 400 Zeilen. | Umbenennen oder aufteilen; die Streudatei entfernen. |
| `typecheck` | Die Typen bestehen (`tsc`, ohne ungenutzte Variable). | Die gemeldeten Typfehler beheben. |
| `validate` | Jede Ressource hält den Vertrag `base.resource.v1` ein. | Das gemeldete Frontmatter korrigieren. |
| `route-test` | Die erwarteten Routen (Fixtures `.ai/routing/route-tests.json`) sind stabil. | Das Routing-Signal (`use_when` / `routing.examples`) oder die Fixture anpassen. |
| `docs validate` | Das Dokumentationsmodell ist konsistent (null Fehler). | Dem vom Modell gemeldeten Fehler folgen. |
| `npm test` | Die Testsuite des Kerns und der Pakete besteht. | Die Ursache beheben; niemals einen Test deaktivieren. |

## Nur in der CI (über `npm run check` hinaus)

| Gate | Prüft | Wann lokal ausführen |
|---|---|---|
| `test:coverage` | Abdeckungsschwellen (Zeilen 90, Branches 80, Funktionen 90). | `npm run test:coverage`, wenn Sie den Kern anfassen. |
| Manifest-Diff | `base index` neu generiert; `base.manifest.json` ist aktuell. | `npm run index`, dann `git diff base.manifest.json`. |
| Projektions-Diff | `base build bootstrap --write`; `AGENTS.md` / `CLAUDE.md` / `BASE_BOOTSTRAP.md` sind aktuell. | `node tools/base.mjs build bootstrap --write`, dann `git diff`. |
| `doctor` | Gesunder Korpus: kein toter Link, keine Waise, keine veraltete Ressource. | `node tools/base.mjs doctor --root .`. |
| `smoke:pack` | Das npm-Paket installiert und startet. | `npm run smoke:pack`. |
| MCP | Der MCP-Server kompiliert und seine Tests bestehen. | Siehe [`CONTRIBUTING.md`](../../CONTRIBUTING.md), wenn Sie `mcp/` anfassen. |
| Studio | Der Build und die UI- / E2E-Suiten von Studio bestehen. | Dasselbe, wenn Sie `tools/studio/` anfassen. |

Eine Regel über allen anderen: Ein rotes Gate ist eine Information, niemals ein zu umgehendes
Hindernis. Wir beheben die Ursache; wir deaktivieren weder einen Hook (`--no-verify`) noch einen
Test.
