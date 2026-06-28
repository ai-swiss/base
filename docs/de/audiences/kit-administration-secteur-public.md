<!-- fr-synced: 4a00a506695e067660b55b061e7c1422eddec1a0 -->

# BASE im öffentlichen Sektor verantwortungsvoll bewerten und einsetzen

BASE in einer öffentlichen Institution einzusetzen betrifft Bürgerdaten, eine Rechtsgrundlage und das öffentliche Beschaffungswesen: zu entscheiden, ob und wie man dies ohne unnötiges Risiko tut, erfordert klare Orientierungspunkte. Diese Checkliste liefert solche, und zwar operative, und weist auf die Entscheidungen hin, die Ihnen vorbehalten bleiben (Juristin oder Jurist, Datenschutzbeauftragte, Archiv, Beschaffung); sie ersetzt keine Rechtsberatung.

> **Wichtig.** BASE ist eine local-first **Komponente** und keine Compliance-Plattform. Es liefert allein weder IAM, SSO, RBAC, DLP, SIEM noch rechtskonforme Archivierung oder regulatorische Aufbewahrung (siehe [Sicherheit und Grenzen](../trust/securite-et-limites.md)). Was es bietet: Fachwissen in Dateien, die Ihnen gehören, und eine ehrliche Vermittlung sensibler Aktionen.

## 1. Den Datenumfang klassifizieren

- Listen Sie die Daten auf, die ein Assistent berührt, und deren Klassifizierung (öffentlich, intern, vertraulich).
- Eine vorsichtige Ausgangsregel: keine personenbezogenen Bürgerdaten in einem ersten Assistenten. Beginnen Sie mit internen Workflows (Vorlagen, Verfahren, Redaktion).
- BASE hält eine Sensibilitätsgrenze in den Metadaten (`sensitivity`) und kann, wenn Sie einen Validator konfigurieren, zu sensible Ressourcen **ablehnen** (siehe das [Enterprise-Kit](kit-enterprise.md), Validator `forbidSensitivity`).

> **Institutionelle Entscheidung:** die anwendbare interne Klassifizierung und die Rechtsgrundlage (zum Beispiel das nDSG sowie das einschlägige kantonale oder kommunale Recht).

## 2. Bürgerdaten und Datenschutz

- Wenn personenbezogene Daten im Spiel sind, genügt die Browser-Ebene allein nicht: Verwenden Sie die CLI oder das MCP, die Aktionen vermitteln und nachvollziehbar machen.
- Das routing bleibt standardmässig **100 % lokal** (lexikalisch, ohne Netzwerk). Das erweiterte semantische routing sendet nur dann Text an einen Embedding-Anbieter, wenn Sie es ausdrücklich aktivieren, und es gibt eine lokale Option (Ollama) (siehe [Sicherheit der Routing-Daten](../trust/securite-donnees-routage.md)).

> **Institutionelle Entscheidung:** eine Folgenabschätzung (AIPD/DPIA), wo erforderlich, und das Verzeichnis der Verarbeitungstätigkeiten.

## 3. Politik zum Modellanbieter

- Das Modell (die generative Ausführung) bleibt **Ihre Wahl** und liegt ausserhalb von BASE. BASE strukturiert das Wissen, das das Modell ausführt; es bindet Sie an keinen Anbieter.
- Um souverän zu bleiben, können Sie lokale Modelle betreiben (zum Beispiel über Ollama); BASE schreibt keinen Cloud-Dienst vor.
- **Lokalität klärt nicht alles: die Gerichtsbarkeit des Hosters zählt ebenso wie der Ort, an dem das Modell läuft.** Ein Hoster, der einem ausländischen Recht unterliegt (zum Beispiel dem US-amerikanischen CLOUD Act), kann selbst für in der Schweiz gespeicherte Daten zur Herausgabe verpflichtet werden. Siehe den Abschnitt CLOUD Act in [`souverainete-et-confiance.md`](../trust/souverainete-et-confiance.md).

> **Institutionelle Entscheidung:** die Liste der zugelassenen Modellanbieter und die Vertragsklauseln (Datenstandort, Unterauftragsverarbeitung, Aufbewahrungsdauer auf Anbieterseite).

## 4. Barrierefreiheit

- BASE-Ressourcen sind lesbares Markdown: kompatibel mit Screenreadern und geeignet für barrierefreie Veröffentlichungen.
- Streben Sie für jede abgeleitete öffentliche Schnittstelle die anwendbaren Standards der Barrierefreiheit an.

> **Institutionelle Entscheidung:** der für Ihre Institution anwendbare Standard der Barrierefreiheit.

## 5. Archivierung und Aufbewahrung

- BASE versioniert über Dateien (Git empfohlen): die Historie der Entscheidungen und Inhalte ist nachvollziehbar.
- Die Spuren der vermittelten Aktionen sind minimal (Operation, Ressource, Status, Dauer), standardmässig ohne fachliche Inhalte.

> **Institutionelle Entscheidung:** die Aufbewahrungsfristen und die Regeln zur rechtskonformen Archivierung Ihrer Inhalte und Protokolle.

## 6. Öffentliches Beschaffungswesen und Weiterverwendung

- Doppellizenz: **Apache-2.0** für den Code (Patentklausel inbegriffen) und **CC BY 4.0** für die Inhalte (siehe [Lizenz](../trust/licence.md)).
- Ein Kern **ohne Abhängigkeiten** (Node 18 oder höher): eine prüfbare Oberfläche, keine schwere Lieferkette. Der MCP-Server und das Studio haben ihre eigenen Abhängigkeiten, isoliert und optional.
- Das Wesentliche ist lokal und einsehbar: Code, Schemata, Specs (`specs/`) und ein reproduzierbarer Testvertrag (siehe [`specs/TESTING.md`](../../../specs/TESTING.md)).

> **Institutionelle Entscheidung:** die Beschaffungskriterien (Souveränität, Reversibilität, Support) und die Vertragsklauseln.

## 7. Menschliche Validierung und Nachvollziehbarkeit

- Eine Disziplin nach dem Prinzip Vorschlagen, dann Festschreiben: ein Diff wird angezeigt, Sie validieren, dann erfolgt der Schreibvorgang. Die Tools laufen standardmässig im Dry-Run.
- Die Markierungen (`[A VALIDER]`, `[DECISION]`) sind durchsuchbare Orientierungspunkte, lesbar sowohl für eine Person als auch für eine algorithmische Verarbeitung: sie halten den Stand eines Dossiers sichtbar, selbst nach Monaten.

## 8. Die Grenzen sichtbar halten

Zeigen Sie auf, was BASE nicht mechanisch durchsetzt (besonders im reinen Browser-Modus) und was Ihren eigenen Systemen obliegt (IAM, DLP, Aufbewahrung). Siehe [Sicherheit und Grenzen](../trust/securite-et-limites.md) und [Souveränität und Vertrauen](../trust/souverainete-et-confiance.md). Und für die Übersicht der Garantien, die der Code tatsächlich durchsetzt, jede mit ihrer Funktion und ihrem Test, siehe [Geprüfte Mechanismen](../trust/mecanismes-verifies.md).

## Kontakt

Für einen institutionellen Austausch (Bewertung, Pilot, Compliance-Fragen) schreiben Sie an AI Swiss unter [info@a-i.swiss](mailto:info@a-i.swiss): wir streben eine erste Antwort innerhalb von etwa zehn Arbeitstagen an. Siehe auch [a-i.swiss](https://a-i.swiss).

Dieselbe Adresse verweist Sie an die richtige Person für die Modalitäten der Begleitung eines Piloten.
