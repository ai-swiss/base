<!-- fr-synced: 218128215df7174b7067e7a3cd5dc5a0981e753f -->

# Wo sich BASE in der Landschaft der KI-Werkzeuge einordnet

Ein KI-Werkzeug zu wählen heisst zu entscheiden, was Ihnen gehört und was Sie bindet: Ersetzt BASE Ihre Werkzeuge, oder ergänzt es sie? Für alle, die es im Vergleich mit anderen Lösungen bewerten, hier sein Platz, eine souveräne Ebene der Expertise für menschlich überprüfbare KI-Arbeit, und die ehrliche Liste dessen, was es nicht leistet.

> These in einem Satz: BASE besitzt die Artikulation (portable Markdown-Agenten, deterministisches Routing, vermittelte Aktionen, nachlesbare Expertise), die Ihre Ausführungswerkzeuge laufen lassen, ohne selbst zu einer Ausführungsmaschine zu werden.

Diese Unterscheidung ist das Rückgrat des Dokuments. Ein Werkzeug, das **ausführt** (ein Modell, ein Orchestrator, ein Konnektor), lässt die Berechnung laufen. BASE **besitzt** die Art, wie diese Arbeit artikuliert wird: welcher Agent, welcher Prozess, welche gezielten Ressourcen, mit welcher Validierung. Die meisten der unten verglichenen Werkzeuge sind Ebenen, auf die sich BASE aufsteckt, keine Konkurrenten.

Ein wiederkehrender Begriffspunkt in BASE: ein **Mechanismus** wird vom Broker durchgesetzt (Code überprüft ihn), eine **Anweisung** (consigne) ist eine Vorgabe, der das Modell folgt (also fehlbar). Wo eine Garantie zählt, präzisieren wir, welche der beiden im Spiel ist.

## Vergleich nach Kategorien

Die Landschaft der Werkzeuge zum Bauen oder Betreiben von KI-Assistenten lässt sich 2026 auf einige grosse Kategorien zurückführen. Hier der Platz von BASE gegenüber jeder einzelnen, und jeweils die Beziehung: **differenziert** (es verlagert die Artikulation weg von der Plattform), **komplementär** (die Kategorie führt aus, BASE besitzt das, was sie ausführt), **Port** (BASE spricht das Protokoll), **gemeinsamer Boden** (BASE erweitert das Format). Die genannten Produkte sind nur Beispiele einer Kategorie, niemals die Kategorie selbst.

| Werkzeugkategorie (2026) | Was sie leistet | Was BASE anders macht | Beziehung |
| --- | --- | --- | --- |
| **Gehostete anpassbare Assistenten** (zum Beispiel benutzerdefinierte GPTs, Gemini Gems, Claude Projects) | Friert eine Anweisung und einige Kontextdateien in Ihrem Konto beim Anbieter ein, an ein Modell und seine Oberfläche gebunden, ohne Code. | Verlagert die Artikulation weg von der Plattform: Markdown-Agenten, die Ihnen gehören und die Sie versionieren, portabel von einem Modell zum anderen, mit einem Routing, das den Agenten auswählt, statt eines von Hand gewählten Assistenten. | **Differenziert** |
| **In Office-Suiten eingebettete Copiloten** (zum Beispiel Microsoft 365 Copilot, Gemini in Workspace) | Verwebt die KI in Produktivitätswerkzeuge und zieht Ihre Daten (Dokumente, E-Mails, Kalender) als Kontext heran, innerhalb einer Suite und bei einem Anbieter. | Macht die Artikulation explizit und besessen (Prozesse und Agenten als Text, ausserhalb der Suite), an die **Aufgabe** gebunden statt an das Werkzeug, das an jenem Morgen geöffnet ist, also wiederverwendbar unabhängig von der Suite. | **Differenziert** |
| **Pipelines für Retrieval und Gedächtnis** (RAG, Vektorindexierung, Agentengedächtnis; zum Beispiel Qdrant, Cohere Rerank, Mem0) | Ruft Fragmente per Ähnlichkeit ab, oder erinnert sich an einen vergangenen Zustand, und injiziert sie zur Inferenzzeit in den Kontext des Modells. | Macht kein RAG und hat keinen undurchsichtigen Zustand zum Abrufen: routet deterministisch und lexikalisch zu einer ganzen Arbeitseinheit (einem **Agenten und seinem Prozess**) und hält sein Gedächtnis explizit und versioniert. Eine Pipeline kann ein Werkzeug sein, das ein Prozess heranzieht. | **Differenziert** |
| **Gouvernierte Unternehmens-Agentenplattformen** (No-/Low-Code; zum Beispiel Copilot Studio, Gemini Enterprise) | Stellt zusammen, verankert per RAG, verbindet und veröffentlicht gouvernierte Agenten innerhalb des eigenen Perimeters: eine Kategorie der Ausführung und Orchestrierung. | Führt nicht aus; besitzt die Artikulation (welcher Agent, welcher Prozess, welche vermittelten Propose-then-Commit-Aktionen) als portablen Text, der diese Plattformen speisen kann, statt darin eingeschlossen zu sein. | **Komplementär** |
| **Frameworks zur Agentenorchestrierung** (Zustandsgraph, Rollen, dauerhafte Ausführung; zum Beispiel LangGraph, CrewAI, Temporal) | Lässt die Schleife laufen: verzweigt, wiederholt, führt einen Zustand zusammen, koordiniert mehrere Agenten, spielt nach einem Ausfall erneut ab. Das ist die Ausführungsmaschine. | Führt nichts davon aus; besitzt die vorgelagerte Artikulation (deterministisches lexikalisches Routing zu einem Agenten und einem Prozess) und bleibt vorsichtig beim autonomen Multi-Agenten-Betrieb: seine Schleife ist Propose-then-Commit, vom Menschen überprüft. Ein BASE-Agent kann zu einem Knoten im Graphen werden. | **Komplementär** |
| **Agenten-SDKs der Modellanbieter** (zum Beispiel Claude Agent SDK, OpenAI Agents SDK, Google ADK) | Lässt die agentische Schleife auf Anbieterseite laufen (Werkzeuge, Übergaben zwischen Agenten, Maschinenzugriff, Schutzmechanismen), an ein bestimmtes Modell gebunden. | Fügt darüber die besessene Artikulation und die Egress-Vermittlung hinzu: die Aktion wird vorgeschlagen, dann unter Kontrolle committet, nicht fortlaufend ausgeführt. Anbieterunabhängig. | **Komplementär** |
| **Coding-Agenten der Arbeitsumgebung** (Terminal, IDE, Hintergrund; zum Beispiel Claude Code, Cursor, Codex, Devin) | Liest Ihre Dateien, schlussfolgert, editiert, führt Befehle aus und läuft bis zur Aufgabe in Schleife, unter einstellbarer Freigabe, auf Ihrer Maschine oder in einer Sandbox. | Lässt die Schleife nicht laufen; lebt in diesem Werkzeug und liefert ihm die vorgelagerte Artikulation (deterministische Wahl eines ganzen Agenten und Prozesses) und die Propose-then-Commit-Vermittlung, die den Menschen am Punkt der Aktion hält. | **Komplementär** |
| **Interoperabilitätsprotokolle** (Agent-Werkzeug und Agent-zu-Agent; zum Beispiel MCP, A2A) | Standardisiert die Verbindung, über die ein Agent Werkzeuge und Daten entdeckt und aufruft oder andere Agenten koordiniert, unabhängig vom Werkzeug. | Ein Port, den BASE spricht: sein Server stellt das Routing und die Ressourcen (`route_request`, `load_agent`, `propose_change`, `commit_change`) über MCP bereit. Das Protokoll transportiert; BASE liefert das, was hindurchgeht. | **Port** |
| **Offene Formate zur Agentenkonfiguration** (zum Beispiel AGENTS.md, Agent Skills, CLAUDE.md) | Beschreibt in offenen Dateien die Anweisungen, Kompetenzen und Befehle, die einen Agenten zur Laufzeit leiten, unabhängig vom Werkzeug. | BASE strukturiert dieses Wissen in besessene Agenten und Prozesse, mit einem deterministischen Routing, das einen ganzen Agenten und Prozess auswählt, statt einen undifferenzierten Block von Anweisungen einzuspeisen. Es liest und schreibt diese Formate. | **Gemeinsamer Boden** |

Querlesen. BASE ist **differenziert** gegenüber den Kategorien von Besitz und Perimeter, wo die Artikulation der Arbeit an ein Konto, eine Suite oder einen Index von Fragmenten gefesselt bleibt. Es ist **komplementär** zu den Ausführungskategorien, die die Schleife laufen lassen, wo BASE es nicht tut. Es ist ein **Port** zu den Interoperabilitätsprotokollen, die es spricht statt mit ihnen zu konkurrieren, und **gemeinsamer Boden** mit den offenen Formaten, die es erweitert, indem es das Routing und die Wahl hinzufügt, die das Format allein nicht bietet. Die Trennlinie ist scharf: alles, was ausführt, indexiert oder hostet, fügt sich mit BASE zusammen oder unterscheidet sich von ihm durch den Perimeter; BASE selbst besitzt die deterministische Wahl des Agenten und des Prozesses, und die Vermittlung, die den Menschen am Punkt der Aktion hält.

## Ein integriertes Produkt, oder ein Rahmenwerk, das Ihnen gehört

Die meisten KI-Angebote für Unternehmen sind **integrierte Produkte**: ein Assistent, sein Modell, seine Oberfläche und Ihre Daten in einem einzigen Dienst zusammengeführt. Das ist sofort wirksam und oft ein guter Ausgangspunkt. Aber ein Produkt und ein Rahmenwerk werden nicht auf derselben Zeitskala beurteilt. Vier strukturelle Unterschiede gelten für jeden Leser.

- **Der Besitz.** In einem Produkt lebt die Artikulation Ihrer Arbeit (Ihre Regeln, Ihre Prozesse, die Art, wie Sie Aufgaben aufteilen) im Konto und Format des Anbieters. In einem Rahmenwerk ist es ein Ordner mit Textdateien, die Ihnen gehören, die Sie versionieren und mitnehmen. An dem Tag, an dem das Angebot Preis oder Bedingungen ändert oder verschwindet, beginnt das eine bei null, das andere behält alles.
- **Das Modell bleibt eine Wahl.** Ein Produkt bindet Sie an sein Modell und seinen Takt. Ein Rahmenwerk macht das Modell zu einem externen, austauschbaren Baustein: Sie folgen der Modellgrenze, statt den Kalender eines einzigen Anbieters zu heiraten. Das heute bestplatzierte Modell wird nicht das des nächsten Jahres sein; ein Rahmenwerk lässt Sie wechseln, ohne alles neu zu bauen, während ein an sein Modell gebundenes Produkt Sie dazu zwingt.
- **Die Überprüfbarkeit.** Die Garantien eines Produkts sind im Wesentlichen Anweisungen an sein Modell, innerhalb einer geschlossenen Box: Sie glauben sie auf Treu und Glauben. Ein offenes Rahmenwerk kann seine Garantien zu Mechanismen machen, zu Code, den Sie lesen und testen. Man auditiert ein Rahmenwerk; man glaubt einem Produkt.
- **Die Dauer.** Dateien in offenen Formaten überleben jedes Produkt. Ihre Expertise sammelt sich darin in einem Träger an, der nicht von den Entscheidungen eines Anbieters abhängt. Das macht ein Rahmenwerk auf Dauer weit tragfähiger: es macht aus der KI ein Gut, das Ihnen gehört, statt eines Abonnements, das Sie bindet.

Diese Produkte leisten echte Dienste, und BASE steckt sich gerne darauf auf (siehe den Vergleich oben). Diese Unterschiede sagen schlicht, wo der dauerhafte Wert sitzt: weniger in der Infrastruktur oder dem ausführenden Werkzeug als in der besessenen Artikulation, jener, die man behält, wenn der Rest sich ändert.

## Die offenen Wissensformate

Grosse Akteure konvergieren 2026 zu offenen Standards für die agentische KI: Interoperabilitätsprotokolle (MCP für Agent-Werkzeug, A2A für Agent-zu-Agent) und offene Formate, um das Wissen und die Konfiguration eines Agenten in Markdown zu beschreiben, das **Open Knowledge Format (OKF)** von Google oder die `AGENTS.md`-Dateien sind jüngste Beispiele, mehrere davon inzwischen in offener, gemeinsamer Governance getragen (die Linux Foundation beherbergt einen Teil). Das ist eine gute Nachricht. Jeder Schritt, der Menschen hilft, ihr Wissen in offenen, portablen, besessenen Dateien zu halten, geht in die Richtung, die BASE von Anfang an vertritt: Souveränität, bis hinein ins Format.

BASE geht auf demselben Weg weiter. Eine BASE-Ressource ist bereits eine einfache Markdown-Datei mit Frontmatter, lesbar durch diese Formate, und fügt hinzu, was sie auslassen: das deterministische Routing, die Egress-Kontrolle, das vermittelte Schreiben und die Schleife der menschlichen Überprüfung. Diese ersten Schritte gehen zu einem Terrain, das BASE bereits in der Tiefe erkundet, und wir freuen uns, dort andere Akteure vorankommen zu sehen.

## Was BASE NICHT zu sein beansprucht

Um ehrlich zu bleiben, hier, was BASE nicht ist und nicht allein bereitstellt.

- **Keine Agenten-Runtime** und keine Orchestrierungs-, Workflow- oder DAG-Maschine. BASE lässt keine Agenten in Schleife laufen; es besitzt die Artikulation, die andere laufen lassen.
- **Kein RAG** und kein allgemeiner Dokumentenindex. Das Routing wählt einen Agenten und einen Prozess, es ruft keine Passagen ab.
- **Keine Plattform**: weder Rechenleistung noch Speicher noch verwaltete Konnektoren standardmässig bereitgestellt.
- **Kein IAM-, DLP-, SIEM-, RBAC-, Aufbewahrungs- oder Rechtsarchivierungssystem.** Diese Funktionen fallen Ihrer Organisation und ihren Werkzeugen zu.
- **Keine Garantie für die Richtigkeit** der von einem Modell erzeugten Ausgaben. BASE strukturiert die menschliche Überprüfung, es ersetzt sie nicht.

## Drei Beweise für den Skeptiker

**1. Durchgesetzte Mechanismen, nicht nur Anweisungen.** Mehrere Garantien werden durch Code überprüft, unabhängig davon, was das Modell entscheidet:

- Pfadeingrenzung und Ablehnung ausgehender Symlinks (`tools/core/confine.mjs`);
- Schreiben in zwei Schritten, vorschlagen dann anwenden, vermittelt und atomar;
- Ausführung der Tools standardmässig im Dry-Run;
- Routing-Enthaltung (`out_of_scope`, `ambiguous`, `needs_clarification`) statt einer falschen Gewissheit;
- MCP-Server standardmässig als HTTP nur-lesend, Option eines Bearer-Tokens;
- Studio nur über Loopback;
- die Einstellungen speichern **Namen** von Umgebungsvariablen, niemals die API-Keys im Klartext;
- Egress-Kontrolle: eine vertrauliche Ressource oder eine als lokal deklarierte Wurzel wird nicht an ein entferntes Modell gesendet, die Prüfung erfolgt **vor** dem Aufruf;
- das Protokoll `.ai/trace` zeichnet die vermittelten Operationen lokal auf.

Das sind Mechanismen (Broker), zu unterscheiden von Anweisungen (Vorgaben an das Modell), die fehlbar bleiben.

**2. Das Routing wählt, es ruft nicht ab.** Das Standard-Routing ist zu 100 % lokal und lexikalisch (kein Netzwerk); es gibt einen Agenten und einen Prozess zurück, oder es enthält sich. Seine Stabilität wird getestet: `base route-test` liest Fixtures und scheitert bei der geringsten Abweichung. Ein Abruf per Ähnlichkeit wäre dagegen nicht Fixture für Fixture identisch reproduzierbar. Das semantische Ranking bleibt optional und kann lokal laufen (zum Beispiel über Ollama); das **Modell** ist die Wahl des Benutzers, ausserhalb des Perimeters von BASE.

**3. Die Behauptungen sind an Beweise und an Tests verdrahtet.** Der reale Zustand ist dokumentiert (`docs/reference/etat-implementation.md`) und die Abdeckung wird gepflegt und in der CI überprüft: die Architektur der Tests (statisch, Unit, Vertrag, Studio-Komponenten, End-to-End, Barrierefreiheit) ist in `specs/TESTING.md` beschrieben, und der Beweis Anforderungen zu Tests in der generierten Matrix. Die CI führt `base validate` und `npm audit` aus (ohne Dev-Abhängigkeiten, Schwelle high). Wo BASE eine Funktion nicht bereitstellt, sagt das vorliegende Dokument es klar, statt es zu behaupten.

## Lizenz und Reichweite

Der Code steht unter Apache-2.0, die Dokumentation unter CC-BY-4.0.

Diese Seite ist **informativ**: sie stellt weder eine Rechtsberatung noch eine Compliance-Beratung dar. Eine Institution bleibt für ihre eigene Folgenabschätzung (DPIA) und ihre Sicherheitsrichtlinie verantwortlich. Siehe auch `docs/reference/base-et-vos-outils-ia.md` und `docs/reference/etat-implementation.md`.
