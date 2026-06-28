<!-- fr-synced: 270eef117f2e9c6c8e5e3eccda344304b9942590 -->

# Eine Expertise nach dem Deployment am Leben halten

«Und nach dem Deployment?» Das ist die Frage, die Entscheidungstraeger stellen, und es ist die richtige. Diese Seite richtet sich an die Verantwortlichen, die einen Assistenten ausrollen und wissen wollen, wie er sich ueber die Zeit haelt. Ein Assistent ist kein Projekt, das endet: Er ist eine Expertise, die lebt. BASE bietet Werkzeuge fuer jede Phase dieses Lebens, vom ersten importierten Dokument bis zum Altern unter Beobachtung. Hier ist die vollstaendige Schleife.

```
  importieren ──> bearbeiten ──> bewerten ──> ausführen (beim Host)
     ▲                                            │
     │                                            ▼
  doctor <── altern <── steuern <── Rückmeldung vom Feld
  (Gesundheit) (status,  Egress       (Frictions,
                Gültigkeit) (Modelle)   Abstentionen)
```

```mermaid
flowchart LR
    A[Bestehendes importieren] --> B[Bearbeiten]
    B --> C[Bewerten]
    C --> D[Beim Host ausfuehren]
    D --> E[Rueckmeldung vom Feld]
    E --> F[Egress steuern]
    F --> G[Altern unter Beobachtung]
    G --> H[Doctor, Gesundheit]
    H --> A
```

## 1. Das Bestehende importieren

Man startet selten von einer leeren Seite. Der Prozess [`importer-l-existant`](../../.ai/agents/createur-agent/skills/processes/importer-l-existant/SKILL.md)
(mit BASE ausgeliefert, an den Assistenten-Ersteller angebunden) durchsucht Ihre Dokumente (Bedienungsanleitungen, Wikis,
Checklisten) und **schlaegt** deren Umwandlung in Prozesse, Kompetenzen, Dokumente und Templates vor.
Jeder Schreibvorgang laeuft ueber das Gate propose → commit: Sie bestaetigen jeden Diff.

## 2. Bearbeiten, mit einem Mitdenker

In [BASE Studio](../../tools/studio/ui/README.md) oeffnen sich Ihre Dateien als editierbare Karten;
der Bearbeitungs-Chat denkt **mit** Ihnen am Dokument, das Sie vor sich haben, niemals an Ihrer
Stelle anderswo. Jeder Vorschlag des Modells kommt als Diff, Sie wenden ihn an oder lehnen ihn ab. Die Schuld
beginnt meistens mit ein paar Absaetzen, die niemand gegengelesen hat: hier bleibt alles sichtbar.

## 3. Bewerten, auf der echten Oberflaeche

Das Evaluations-Harness ([`tools/eval`](../../tools/eval/README.md)) gibt dem getesteten Modell die
**gleichen Werkzeuge wie die Produktion** (MCP): lesen, suchen, routen, vorschlagen, niemals ein Terminal.
Ein simulierter Benutzer spielt Ihre Szenarien durch, ein unabhaengiger Richter bewertet die Konversation, und was der
Prozess deklariert (Links, Bewertungsraster) wird unter Budget in den Kontext vorgeladen. Ein Schritt, der das
Ausfuehren von Code erfordern wuerde, **deklariert** sich (`report_limitation`), statt sich zu simulieren. Die Evaluation entfaltet
ihren vollen Wert beim Skalieren: Ganz BASE haelt eine Basis von Prozessen, die von Menschen geschrieben und verwaltet werden,
aber einige wenige Prozesse werden **gefoerdert und institutionalisiert**, und genau diese muss man
unter Evaluation halten.

## 4. Ausfuehren, beim Host

Der Assistent laeuft in einem KI-Werkzeug, das Ihre Dateien lesen kann (zum Beispiel GitHub Copilot, Antigravity, Claude Code oder Cowork, OpenCode, Kilo Code), oder in jedem MCP-Host, mit dem BASE-Broker
als Vermittler: Confinement auf den Root, Schreib-Gate, lokale Spur. Das Ausfuehren von Code bleibt
eine Faehigkeit des Hosts; BASE simuliert es niemals.

## 5. Die Rueckmeldung vom Feld

Die Schleife endet nicht beim Deployment. Eine **Friction** («das zitierte Bewertungsraster ist nicht mehr das richtige»)
wird in einem Satz festgehalten: MCP-Werkzeug `report_friction`, oder einfach «das hat nicht funktioniert», was
zum Prozess [`signaler-une-friction`](../../.ai/agents/concierge-base/skills/processes/signaler-une-friction/SKILL.md) routet.
Jede **Abstention des Routers** (eine Anfrage, die kein Agent abdeckt) protokolliert sich von selbst.
Studio stellt beide als Arbeitsstapel dar: Eine Friction ist eine ausstehende Prozessanpassung;
eine nicht bediente Anfrage, die immer wiederkehrt, ist ein zu erstellender Prozess.

## 6. Altern unter Beobachtung

Ein Fachkorpus verrottet still. Zwei Lebenszyklus-Felder (`status`, `review_by`),
zwei Gueltigkeitsdaten (`valid_from`, `valid_until`): Der Router ignoriert veraltete Ressourcen,
der Kontext meldet «abgelaufen seit dem …», und [`base doctor`](../reference/framework-public.md)
zeigt auf, was kaputtzugehen droht: tote Links, verwaiste Ressourcen, abgelaufene Evaluationen, ueberfaellige Gegenlesungen,
offene Frictions, jede mit ihrem Korrekturpfad.

## 7. Jeden Ausgang zu einem Modell steuern

Bevor ein einziges Byte zu einem Modell geht, wird eine einzige Regel geprueft: Eine
`confidential`-Ressource oder ein ganzer `local-only`-Root geht **niemals** zu einem entfernten Provider, und die
Ablehnung wird ausgesprochen, am Bildschirm und in der Spur. Siehe [Datenschutz](../trust/protection-des-donnees.md)
und [die Belege](../trust/evidence.md).

---

Die gesamte Schleife steckt in Dateien, die Ihnen gehoeren. Sie zu importieren bedeutet, einen
Ordner zu kopieren, sie zu auditieren geschieht mit `base doctor`, und sie zu verlassen heisst, mit Ihren Dateien zu gehen.
