<!-- fr-synced: d53317ea2708bb4f9f7fb93e61693eb8979c4b46 -->

# Barrierefreiheit, Verpflichtung und Stand

Eine öffentliche Institution muss wissen können, was die Barrierefreiheit von BASE wert ist und was nicht, bevor sie BASE einsetzt. Hier finden Sie unsere Verpflichtung zur Barrierefreiheit, die Nachweise, die wir heute zeigen können, und die ehrlichen Grenzen dieser Nachweise. Dies gilt nicht als formelle Konformitätserklärung: Für uns bleibt eine solche Erklärung ein Ziel, das es zu erreichen gilt, und keine feststehende Tatsache (siehe weiter unten).

Diese Seite ist informativ. Sie stellt weder eine Rechtsberatung noch ein Konformitätsaudit dar. Jede Institution bleibt für ihre eigene Bewertung der Barrierefreiheit, für ihr allfälliges Audit und für ihre Richtlinie zur Barrierefreiheit verantwortlich.

## Verpflichtung

Für die Dokumentationswebsite und für Studio streben wir an:

- den Standard WCAG 2.1 Stufe AA;
- die Schweizer Norm eCH-0059 (Barrierefreiheit von Online-Dienstleistungen).

Diese Verpflichtung ist ein Gestaltungsziel. Sie leitet die Entscheidungen zur Benutzeroberfläche und die Überprüfung, bedeutet aber nicht, dass die Konformität bis heute erreicht oder überprüft worden ist.

## Wichtige Unterscheidung: Mechanismus und Anweisung

BASE unterscheidet überall, was mechanisch durchgesetzt wird, von dem, was eine in gutem Glauben befolgte Anweisung ist. Die Barrierefreiheit folgt demselben Raster.

- Mechanismus: Eine automatisierte Prüfung der Barrierefreiheit läuft in der Playwright-Testsuite (end-to-end) von Studio. Sie läuft bei jedem Durchlauf der Suite und schlägt fehl, wenn sie schwerwiegende oder kritische Verstösse feststellt. Sie erlegt der Benutzeroberfläche von Studio eine reale Einschränkung auf, die über eine blosse Absicht hinausgeht.
- Anweisung: Das Ziel WCAG 2.1 AA und eCH-0059, die Sorgfalt bei der Seitenstruktur, bei den Kontrasten und bei der Tastaturnavigation sind Teil einer Gestaltungsdisziplin. Für sich genommen sind sie keine überprüfte Garantie.

Siehe auch die Seite [Sicherheit und Grenzen](securite-et-limites.md), die dieselbe Unterscheidung für die Schutzmechanismen von BASE darlegt.

## Der Nachweis, über den wir verfügen

Studio enthält einen automatisierten Test zur Barrierefreiheit (`tools/studio/ui/e2e/a11y.spec.ts`), der in die End-to-End-Suite integriert ist. Konkret:

- er verwendet die Engine `axe-core` über Playwright;
- er analysiert die mit `wcag2a` und `wcag2aa` gekennzeichneten Kriterien;
- er deckt die Hauptansichten von Studio ab (die Navigation, die Ansicht Evaluationen) sowie eine modale Schublade und prüft dabei auch das Verhalten der ausgeblendeten Elemente;
- er lässt den Build fehlschlagen, wenn ein Verstoss mit der Auswirkung `serious` oder `critical` festgestellt wird, und der Bericht beschreibt den Knoten und die gemessenen Werte im Detail, um den Fehler diagnostizierbar zu machen.

Dieser Test ist Teil der End-to-End-Prüfungen, die das Projekt ausführt. Die Barrierefreiheit ist somit im Netz der automatisierten Tests verankert und nicht in einer einmaligen, schnell vergessenen Überprüfung.

## Die Grenze dieses Nachweises

Eine automatisierte Prüfung hat eine begrenzte Reichweite: Hier ist, was sie abdeckt und was ihr entgeht.

- Eine automatisierte Prüfung wie `axe-core` deckt nur einen Teil der WCAG-Kriterien ab, nach gängigen Schätzungen für dieses Werkzeug etwa ein Drittel. Sie erkennt strukturelle Probleme (fehlende Attribute, unzureichende Kontraste, falsche Rollen), beurteilt aber nicht die Eignung eines Alternativtextes, die Logik der Lesereihenfolge, die Klarheit der Sprache oder die tatsächliche Qualität eines komplexen Tastaturpfades.
- Der aktuelle Test konzentriert sich auf die Hauptansichten von Studio. Er deckt noch nicht erschöpfend jeden Bildschirm, jeden Fehlerzustand oder die gesamte Dokumentationswebsite ab.
- Bis heute wurde kein vollständiges manuelles Audit durchgeführt. Es wurde keine Bewertung mit assistiven Technologien (Screenreader) oder mit Menschen mit Behinderungen formell durchgeführt und dokumentiert.
- Folglich gibt es bis heute keine formelle Konformitätserklärung WCAG 2.1 AA oder eCH-0059 für BASE.

Zusammengefasst: Wir verfügen über ein nützliches und kontinuierliches automatisiertes Signal, aber das ist kein Konformitätsnachweis.

## Bekannter Stand

Als gut bekannt (durch den automatisierten Test überprüft, auf den abgedeckten Ansichten):

- kein Verstoss gegen die Barrierefreiheit mit schwerwiegender oder kritischer Auswirkung auf den getesteten Hauptansichten von Studio;
- Berücksichtigung der ausgeblendeten Elemente und der modalen Schubladen im Rahmen des Tests;
- Integration der Prüfung in die End-to-End-Suite, also kontinuierlich erneut ausgeführt.

Ausstehend (noch nicht erledigt oder nicht abgedeckt):

- vollständiges manuelles Audit der Dokumentationswebsite und von Studio;
- Tests mit Screenreadern und anderen assistiven Technologien;
- Bewertung mit Menschen mit Behinderungen;
- erweiterte automatisierte Abdeckung auf alle Bildschirme und Zustände;
- eigene Prüfung der Barrierefreiheit der redaktionellen Inhalte (klare Sprache, Struktur der Überschriften, Alternativtexte);
- formelle Konformitätserklärung und dokumentiertes Verfahren zur Rückmeldung von Barrieren.

## Die Konformitätserklärung ist ein Ziel

Eine formelle Konformitätserklärung (im Sinne von WCAG 2.1 AA oder eCH-0059) setzt ein vollständiges Audit voraus, einschliesslich manueller Prüfungen und Tests mit assistiven Technologien. Diese Arbeit ist nicht abgeschlossen. Wir betrachten die Konformität daher als ein Ziel, das wir aktiv verfolgen.

Wir ziehen es vor, eine reale automatisierte Prüfung mit ihren Grenzen anzukündigen, statt eine Konformität auszuweisen, die wir nicht belegen könnten.

## Um ein Problem zu melden

Wenn Sie auf der Dokumentationswebsite oder in Studio auf eine Barriere stossen, melden Sie diese über den Verfolgungskanal des Projekts (Issue-Tracker des Repositorys). Eine präzise Rückmeldung (betroffene Seite, Browser, verwendete assistive Technologie, erwartetes Verhalten) hilft, schneller zu korrigieren und die Testabdeckung zu erweitern.
