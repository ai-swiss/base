<!-- fr-synced: 3a97e156b3f1d0e2d354f8762cf273c113dba15a -->

# Die Wahl von BASE begründen: Souveränität, Vertrauen, Compliance

Die Einführung von BASE bedeutet oft, dass man zuerst überzeugen muss: eine Kundin, die um ihre Daten besorgt ist, eine IT-Abteilung, eine oder einen Compliance-Verantwortlichen. Hier finden Sie an einem Ort alles, um diese Wahl zu verteidigen, ohne den unangenehmen Fragen auszuweichen: Datensouveränität, Datenschutz, Sicherheit, Lizenz und Governance. Diese Seite richtet sich an jede Organisation, die BASE evaluiert, vom Selbstständigen bis zur Institution, und verweist auf die Referenzdokumente, ohne sie zu ersetzen.

## In einem Satz

BASE ist ein **local-first** und **offenes** Rahmenwerk, um die Arbeit mit KI zu strukturieren: Ihr Wissen bleibt in Textdateien, die Ihnen gehören, und Sie entscheiden ausdrücklich, was gegebenenfalls an ein KI-Werkzeug hinausgeht.

Die Souveränität von BASE beruht auf seiner Architektur, nicht auf einem Label. Local-first läuft das Werkzeug auf Ihrer Maschine und bewahrt das Wissen in Textdateien auf, die Ihnen gehören: Solange kein entfernter Anbieter verbunden ist, verlässt nichts den Arbeitsplatz, und es gibt keinen Server, den man unter Druck setzen könnte. Drei Präzisierungen sind allerdings nötig. Ein lokales Modell ist kein Schweizer Modell: Die Lokalität sagt, wo es läuft, nicht woher es stammt. Ein Schweizer Modell ist deshalb noch nicht vertraulich, wenn es auf einer Infrastruktur unter ausländischer Kontrolle gehostet wird: Der amerikanische CLOUD Act erreicht Daten «wo auch immer sie gespeichert sind», und selbst ein Schweizer Akteur bleibt nach Schweizer Recht zur Herausgabe verpflichtbar. Was hinausgeht, hängt also von Ihrer Konfiguration und vom Vertrag ab: Datenresidenz, Nutzung für das Training, Unterauftragnehmer, Gerichtsbarkeit. Das Rahmenwerk und die Expertise sind souverän; das Modell bleibt Ihre externe Wahl, die zu überprüfen ist.

Über diese Hosting-Souveränität hinaus ist diejenige, die langfristig entscheidet, die **kognitive Souveränität**: die Artikulation Ihrer Denkweise mit KI zu besitzen, in lesbarem und portierbarem Text, den Sie erneut lesen, korrigieren und mitnehmen können. Das ist die Schicht, die BASE auf Ihrer Seite behält, unabhängig vom Modell. Siehe [Mit der KI mitdenken](../learn/co-penser-avec-lia.md).

## Datensouveränität

- Der Kern von BASE ist **lokal**: Er macht **standardmässig keine Netzwerkaufrufe**. Das Standard-Routing ist zu 100 % lokal (lexikalisch, null Netzwerk).
- Eine Funktion, die Daten hinaussenden würde (fortgeschrittenes semantisches Routing, ein Embeddings-Provider, eine externe API), ist **standardmässig deaktiviert** und wird nur durch eine ausdrückliche Wahl aktiviert, mit einer dokumentierten lokalen Option (Ollama).
- Ihre Dateien bleiben portierbar (Markdown): Sie können das KI-Werkzeug wechseln, ohne Ihre Struktur zu verlieren.

Details: [Sicherheit und Daten des Routings](securite-donnees-routage.md), Abschnitt «Datensouveränität» der [README](../../README.md).

## Datenschutz (nLPD / revLPD, DSGVO)

BASE allein **macht Sie nicht konform** mit dem Schweizer Datenschutzgesetz (nLPD/revLPD) oder mit der DSGVO: Die Konformität hängt von Ihrer Organisation, Ihren Bearbeitungen und dem KI-Werkzeug ab, das Sie anschliessen. Was BASE konkret beiträgt:

- ein **standardmässig lokaler** Betrieb, der bereits durch das Design begrenzt, was Ihren Arbeitsplatz verlässt;
- eine **ausdrückliche Grenze** zwischen dem, was lokal bleibt, und dem, was einem Dritten anvertraut wird, wobei Sie entscheiden;
- **prüfbare** Dateien und ein **minimales Protokoll**, um Entscheidungen nachzuverfolgen.

Was Sie selbst beisteuern: Rechtsgrundlage, Verzeichnis der Bearbeitungstätigkeiten, Wahrung der Rechte der betroffenen Personen und die Bewertung des KI-Anbieters, den Sie nutzen. Siehe [Sicherheit und Grenzen](securite-et-limites.md), Abschnitt «Was BASE nicht allein schützt».

Sie müssen diese Fragen nicht allein entscheiden: **AI Swiss kann sie beantworten und Sie an etablierte Fachleute verweisen**. Diese Themen haben bekannte Antworten und Spezialisten, die sie behandeln.

## Sicherheit

- Eine **ehrliche** Haltung: BASE unterscheidet, was eine **Anweisung** ist (Text, dem ein kooperatives Modell folgt), von dem, was ein **Mechanismus** ist (tatsächlich vom Broker durchgesetzt). Diese Grenze ist klar dokumentiert, ohne sie zu beschönigen.
- Der Integrationsserver (MCP) ist im Netzwerk **standardmässig schreibgeschützt** (HTTP-Transport), und seine nicht lokale Exposition wird ohne Authentifizierung verweigert. Im **lokalen** Zugriff (stdio, von einem Werkzeug auf Ihrer Maschine) ist das Schreiben standardmässig exponiert und bei Bedarf über `BASE_MCP_READ_ONLY=1` einzuschränken; jeder Schreibvorgang läuft ohnehin über den vermittelten Fluss propose-then-commit, niemals in einem einzigen Schritt.
- Bedrohungsmodell und Grenzen: [Sicherheit und Grenzen](securite-et-limites.md). Meldung von Schwachstellen: [`SECURITY.md`](../../SECURITY.md).

## Lizenz und Weiterverwendung

- **Code** unter **Apache-2.0**; **Dokumentation, Agents, Skills und Beispiele** unter **CC BY 4.0**.
- Sie können ihn nutzen, anpassen und weiterverteilen, auch intern. Lesbare Details: [Lizenz](licence.md).

## Governance und Langlebigkeit

- **Erstellt von Charles-Edouard Bardyn** (Wissenschaftlicher Direktor, VP und Mitgründer von **[AI Swiss](https://a-i.swiss)**, einem unabhängigen Schweizer gemeinnützigen Verein, dessen Auftrag es ist, die KI durch das Konkrete, das Menschliche und die Grundlagen zu fördern), und heute **von einem Hauptmaintainer betreut** unter der Obhut von AI Swiss, offen für Beiträge und Co-Maintenance.
- **[Innovaud](https://innovaud.ch)** ist Projektpartner: Die Agentur hat dazu beigetragen, die für KMU bestimmten fachlichen Beispiele anzustossen.
- **Kontinuität durch Reversibilität.** Über die Obhut von AI Swiss hinaus ist die solideste Garantie für Langlebigkeit struktureller Art: Code und Inhalte unter doppelter offener Lizenz (Apache-2.0 / CC BY 4.0), ein Kern ohne Abhängigkeiten, Markdown-Dateien, die Ihnen gehören. Sie können das Projekt **jederzeit forken und übernehmen**, ohne von einem einzigen Maintainer abhängig zu sein.
- Stabile und versionierte öffentliche Oberfläche (SemVer): [Versionen und Stabilität](../reference/versions-et-stabilite.md). Entscheidungen dokumentiert im `CHANGELOG` und in den `specs/`.

## Weiterführendes

- Lokale und Schweizer Modelle: [Souveräne und lokale Modelle](../guides/modeles-souverains.md).
- Überblick: [Öffentliches Framework](../reference/framework-public.md).
- Stand der Implementierung: [Implementierungsstand](../reference/etat-implementation.md).
- Organisations-Deployment: [Enterprise-Kit](../audiences/kit-enterprise.md).
- Öffentliche Institutionen: [Kit für Verwaltung und öffentlichen Sektor](../audiences/kit-administration-secteur-public.md).
- Technische Integration: [`mcp/README.md`](../../mcp/README.md).
