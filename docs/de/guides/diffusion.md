<!-- fr-synced: 023d9db022d05afb1c8244a7391313b2479d8335 -->

# BASE als Open Source veröffentlichen

BASE als Open Source zu veröffentlichen bedeutet, anderen zu ermöglichen, eine Arbeitsstruktur zu übernehmen und anzupassen, die ihnen erhalten bleibt, ohne sich an einen Anbieter oder eine Plattform zu binden. Es geht nicht darum, ein fertiges Produkt zu zeigen: Es geht darum, dieses Fundament wiederverwendbar und ehrlich in Bezug auf seine Funktion zu machen, damit jede Person es ausprobieren, kritisieren und weiterentwickeln kann. Dieser Leitfaden fasst zusammen, was zu entscheiden, zu prüfen und zu schreiben ist, damit diese öffentliche Veröffentlichung dieses Versprechen einhält.

BASE versteht sich als ein local-first Rahmen zur Strukturierung der Zusammenarbeit zwischen Mensch und KI: lesbare Dateien, Workflows, lokale Kontrollen und mögliche Erweiterungen. Es ist bewusst ein Fundament und keine vollständige Plattform.

## Öffentliche Positionierung

Kurze Botschaft:

> BASE hilft Personen und Organisationen, ihre Zusammenarbeit mit KI zu strukturieren: Wissen, Prozesse, Daten, Entscheidungen, kontrollierte Aktionen und dauerhaftes Gedächtnis.

Lange Botschaft:

> Die Modelle ändern sich, die Schnittstellen ändern sich, die Anbieter ändern sich. Was Ihnen erhalten bleiben muss, ist die Struktur Ihres Fachwissens: Ihre fachlichen Dateien, Ihre Workflows, Ihre Modelle, Ihre Regeln, Ihre Entscheidungen und die Spuren, die Sie brauchen, um die Arbeit wieder aufzunehmen. BASE bietet einen offenen und lesbaren Rahmen, um diese Struktur zu organisieren.

Gründungsbotschaft:

> Generative KI wird anders gehandhabt als klassische Software: über Sprache, Kontext, Beispiele, Grenzen und Korrekturen. Sie beherrscht überprüfbare Bereiche, hat aber zwei sehr reale Schwächen: Standardmässig teilt sie ihr Gedächtnis nicht von einer Sitzung zur nächsten, und die Sprache, die sie steuert, bleibt unterspezifiziert, was zugleich ihre Flexibilität und ihre Fragilität ausmacht. BASE verwandelt diese Feststellung in eine praktikable Methode: aufschreiben, was zählt, Prozesse explizit machen, menschliche Entscheidungen sichtbar halten und KI-Plattformen nutzen, ohne ihnen die Struktur Ihrer Arbeit zu überlassen.

Was BASE nicht behauptet:

- dass KI automatisch zuverlässig wird;
- dass Berechtigungen ausserhalb der vermittelten Werkzeuge garantiert sind;
- dass der öffentliche Kern die Enterprise-Governance ersetzt;
- dass eine bestimmte Schnittstelle oder ein bestimmtes Modell unverzichtbar ist;
- dass KI ein Bewusstsein, eine Absicht oder ein garantiertes Verständnis besitzt;
- dass alles automatisiert werden soll.

## Was auf den ersten Blick sichtbar sein muss

- Ein konkretes Beispiel in 5 Minuten.
- Mehrere fachliche Assistenten, die zum Ausprobieren bereit sind.
- Eine einfache Erklärung des Unterschieds zwischen Konversation und dauerhaftem Gedächtnis.
- Eine Seite für jede Adoptionsstufe: persönlich, Start-up, KMU, Grossunternehmen.
- Eine Statusseite, die zwischen umgesetzt, geplanten Erweiterungen und ausserhalb des Geltungsbereichs trennt.
- Tests und lokale Validierung, die beweisen, dass das Paket wartbar ist.

## Checkliste vor der Veröffentlichung

Dokumentation:

- `README.md` erklärt, warum BASE existiert, wie man es ausprobiert, für wen es gedacht ist und wohin man als Nächstes geht.
- `docs/start/obtenir-base.md` erklärt ZIP, Git-Klon, Kopie eines Beispiels und das Browser-Paket.
- `docs/start/demo-60-secondes.md` ermöglicht es, ein konkretes Ergebnis zu sehen, bevor man die Architektur liest.
- `docs/start/quickstart.md` ermöglicht einen ersten Versuch ohne technische Kenntnisse.
- `docs/tutoriel/index.md` begleitet eine Person Schritt für Schritt.
- `docs/audiences/pour-qui.md` spricht die wichtigsten Zielgruppen an.
- `docs/audiences/kit-demarrage-pme-suisse.md` gibt die Mindestregeln für ein kleines Team: Daten, Validierung, Versionierung, Pflege.
- `docs/audiences/kit-enterprise.md` umreisst die strikte Konfiguration und die Bereitstellungsmodi.
- `docs/audiences/kit-administration-secteur-public.md` umreisst die institutionellen Entscheidungen.
- `docs/public/presse.md` bietet eine veröffentlichbare Referenzseite für Journalistinnen, Journalisten und Redaktionen.
- `docs/learn/comprendre.md` erklärt die Mechanismen und die Diagnose.
- `docs/start/lire-dans-quel-ordre.md` hilft jedem Profil zu unterscheiden, was zu lesen, was zu ignorieren und was zu prüfen ist.
- `docs/learn/pratiques-co-pensee.md` legt die Prinzipien des Mensch-KI-Mitdenkens dar.
- `docs/reference/framework-public.md` umreisst den öffentlichen Kern und die Erweiterungen.
- `docs/reference/etat-implementation.md` begrenzt die Versprechen.
- `docs/trust/securite-et-limites.md` erläutert das Sicherheitsmodell, die Grenzen und die Verantwortlichkeiten.
- `docs/trust/souverainete-et-confiance.md` führt Souveränität, Konformität, Lizenz und Governance zusammen.
- `docs/trust/licence.md` erklärt die Doppellizenz in verständlicher Sprache.
- `docs/reference/specification-v0.md` liefert die Lesart der Architektur.
- `mcp/README.md` erklärt den MCP-Adapter, ohne ihn mit dem Broker zu verwechseln.
- `SECURITY.md` erklärt, wie ein Problem zu melden ist.
- `CODE_OF_CONDUCT.md` definiert die Regeln für die öffentliche Teilnahme.
- `.github/ISSUE_TEMPLATE/` und `.github/PULL_REQUEST_TEMPLATE.md` leiten Beiträge an, ohne eine schwergewichtige Community-Governance zu versprechen.
- `specs/RELEASE.md` beschreibt die reproduzierbare Veröffentlichungs-Checkliste.
- `CHANGELOG.md` macht öffentliche Änderungen nachverfolgbar.

Code und Validierung:

- `npm test` läuft durch.
- `npm run validate` läuft durch.
- `npm run entretien` meldet keine kritische Aktion.
- `npm test` und `npm run build` laufen in `mcp/` durch.
- `npm run smoke:pack` läuft durch.
- `base.manifest.json` wird neu generiert.
- `.ai/trace/` wird von git ignoriert.
- `git status --short` wird erneut gelesen: jede geänderte oder nicht verfolgte Datei ist beabsichtigt.
- Abgeleitete Artefakte werden entweder neu generiert und eingeschlossen oder ausdrücklich von der Veröffentlichung ausgenommen.
- Kein lokaler Entwurf (`.temp/`, `.plans/`, Spuren, Test-Exporte) gelangt in das veröffentlichte Paket.

Beispiele:

- `exemples/assistant-devis-demo/` bleibt die sofortige Demo; die Seite `docs/start/demo-60-secondes.md` beschreibt den genauen Ablauf.
- `exemples/assistant-devis/` bleibt das wichtigste durchgängige Beispiel.
- `exemples/assistant-communication/`, `assistant-courrier/`, `assistant-rh/`, `assistant-projet/` und `assistant-reunion/` sind sichtbar und konsistent.
- Jedes Beispiel kann in einen separaten Ordner kopiert und in einem KI-Werkzeug geöffnet werden.

Lizenz und Attribution:

- Die Doppellizenz ist in `LICENSE` explizit angegeben: Code unter Apache-2.0; Dokumentation, Agents, Skills und Beispiele unter CC BY 4.0.
- Das README erwähnt AI Swiss und den Anwendungsfall Innovaud.
- Abgeleitete Nutzungen müssen die von der Lizenz vorgesehene Attribution beibehalten.

## Wie man BASE präsentiert

Für eine Konferenz oder einen Workshop:

1. Mit einer konkreten Szene beginnen: eine Offerte erstellen, ein Angebot vorbereiten, ein Projekt organisieren.
2. Zeigen, was einem einfachen Chat fehlt: Kontext, Gedächtnis, Daten, Regeln, Validierung.
3. Die Dateien als dauerhaftes Gedächtnis einführen.
4. Die Workflows und die Kompetenzen zeigen.
5. Die Entscheidungspunkte und die Prüfschuld erläutern.
6. Den Router/Broker erst nach dem konkreten Bedarf zeigen: rudimentär, aber wirksam, durch Adapter erweiterbar, senkt er die mentale Last, den richtigen Prozess zu finden.
7. Mit der Souveränität abschliessen: Das dauerhafte Kapital ist nicht das Modell, sondern die Struktur des Fachwissens.

Für eine nicht-technische Person:

- die Begriffe Server, Broker, Schema, MCP am Anfang vermeiden;
- Assistent, Dateien, Workflows, Modelle, Entscheidungen sagen;
- damit beginnen, ein Beispiel zu kopieren.

Für eine technische Person:

- `docs/reference/etat-implementation.md` zeigen;
- `tools/base-core.mjs` zeigen;
- die Tests zeigen;
- erklären, dass MCP ein Adapter und nicht der Router ist.

Für eine Organisation:

- BASE als Strukturierungsfundament präsentieren;
- explizit machen, was darum herum hinzugefügt werden muss: Identität, Rechte, Audit, DLP, Aufbewahrung;
- für ein KMU mit dem Starter-Kit beginnen statt mit der Enterprise-Architektur;
- die Portabilität der Ressourcen und die Trennung zwischen semantischem YAML und technischen Details betonen.

## Der Ton, der zu halten ist

Stark, aber begrenzt.

BASE darf behaupten:

- dass Struktur notwendig ist, um dauerhaft mit KI zusammenzuarbeiten;
- dass die Prüfung nicht verschwindet;
- dass lesbare Dateien den Kontext portabel machen;
- dass Mechanismen zuverlässiger sind als Anweisungen allein;
- dass der öffentliche Rahmen nützlich ist, ohne den Anspruch zu erheben, eine Enterprise-Plattform zu ersetzen.

BASE darf nicht behaupten:

- dass Modelle keine Fehler mehr machen;
- dass alles standardmässig sicher ist;
- dass KI das Fachwissen ersetzt;
- dass sich alle Plattformen gleich verhalten;
- dass die Einführung eines Werkzeugs ausreicht, um eine Organisation zu verändern.

## Abschliessendes Kriterium

Eine Person muss BASE betrachten und drei Dinge verstehen können:

1. Sie kann es jetzt ausprobieren.
2. Sie kann es an ihren Kontext anpassen.
3. Sie kann mit dieser Struktur wachsen, ohne sich an eine einzige Plattform zu binden.
