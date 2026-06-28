<!-- fr-synced: a78f823839d65a72fb41bb7b17e086044d331a88 -->

# BASE-Glossar: das Vokabular auf einen Blick

Sie stossen auf einen BASE-Begriff und möchten seine genaue Definition: Diese Seite liefert sie in einem Satz, mit einem Link zum Dokument, das sie vertieft. Sie ist die kanonische Quelle des Vokabulars; die übrigen Seiten verweisen hierher, statt dieselben Begriffe erneut zu definieren. Die Reihenfolge ist alphabetisch.

**Abstention (Enthaltung).** Wenn keine Route klar genug ist, weigert sich das routing zu raten und gibt einen expliziten Status (`ambiguous`, `needs_clarification`, `out_of_scope`) mit einem lesbaren Grund zurück. Siehe [routing, Prozesse und Ressourcen](routage-process-et-ressources.md).

**Agent.** Eine Datei mit Anweisungen (`AGENT.md` und ihre skills): Markdown, das dem Modell sagt, welche Rolle es spielen soll, welche Prozesse es kennt, welche Dateien es konsultieren und welche Leitplanken es einhalten soll. Es ist seine Stellenbeschreibung, und es ist Text, den Sie schreiben, besitzen und von einem KI-Werkzeug zum nächsten mitnehmen. BASE behält das Wort «Agent» aus Kompatibilität mit dem Ökosystem bei, weil die Modelle es erkennen, und nicht um ein autonomes Wesen zu bezeichnen: Ein Agent ist eine Datei, keine Person. Siehe [Den Ansatz verstehen](../learn/comprendre.md).

**Assistent.** Ihr Agent, zum Leben erweckt durch ein Modell: das, was die Endnutzerin verwendet. Sie besitzen den Agenten (Ihre Dateien), Sie mieten das Modell (das KI-Werkzeug, das sich ändern wird), und aus ihrer Begegnung entsteht der Assistent. Derselbe Agent kann in Claude Code zu einem Assistenten werden und in Cursor zu einem anderen: Der Agent ist das, was Sie behalten, der Assistent das, was Sie verwenden. Siehe [Den Ansatz verstehen](../learn/comprendre.md).

**Broker.** Der lokale Kern, der die Garantien (Eingrenzung, policy, dry-run, Trace) für die Aktionen durchsetzt, die über ihn laufen, via CLI oder MCP. Siehe [Sicherheit und Grenzen](../trust/securite-et-limites.md).

**Co-Denken.** Die angewandte Wissenschaft der Mensch-KI-Interaktion: wie man mit einer Entität denkt, arbeitet und entscheidet, deren innere Weltrepräsentationen ausreichend mit unseren kompatibel sind, um in natürlicher Sprache zu kommunizieren, ohne dabei unseren Kontext, unser Gedächtnis oder unsere Garantien zu teilen. Sie geht von den Grundlagen dessen aus, was explizit gemacht, strukturiert und überprüft werden muss, damit eine solche Zusammenarbeit verlässlich ist, und sie erfindet sich Fachgebiet für Fachgebiet, Beruf für Beruf, Person für Person neu. Siehe [Warum BASE: mit der KI co-denken](../learn/co-penser-avec-lia.md).

**Kompetenz.** Ein wiederverwendbarer Wissens-skill (MwSt, Kommunikationston, Marker), den mehrere Prozesse konsultieren können. Siehe [Den Ansatz verstehen](../learn/comprendre.md).

**Anweisung (consigne).** Eine Anweisung in Textform, die ein kooperatives Modell befolgt. Nützlich, aber anfällig für Abdrift, dort wo ein Mechanismus von Konstruktion her hält. Siehe [Sicherheit und Grenzen](../trust/securite-et-limites.md).

**Dry-run.** Die Trockenlauf-Ausführung einer tool: BASE zeigt die vorgesehene Aktion, ohne etwas auszuführen; die tatsächliche Ausführung verlangt eine Bestätigung. Siehe [Sicherheit und Grenzen](../trust/securite-et-limites.md).

**Embedding.** Die Vektordarstellung eines Textes, verwendet vom optionalen semantischen ranker, niemals standardmässig vom Kern. Siehe [Den Embeddings-provider wählen](../guides/choisir-provider-embeddings.md).

**Routing-Fixture.** Eine erwartete Route, deklariert in `.ai/routing/route-tests.json` und durch `base route-test` erneut abgespielt, um die fachlichen Routen vor Regressionen zu schützen. Siehe [Quickstart semantisches routing](../guides/routage-semantique-quickstart.md).

**Frontmatter.** Der YAML-Kopf einer Ressource (id, Titel, Beschreibung, scope): die Metadaten, die BASE validiert und nutzt, um zu entdecken und zu routen. Siehe [Öffentliches Framework](framework-public.md).

**Harness.** Das KI-Werkzeug, in dem Sie Ihr BASE öffnen (Cursor, Claude Code, ChatGPT via MCP). Die tatsächlichen Garantien variieren je nach Harness. Siehe [Harness-Kompatibilität](compatibilite-harnesses.md).

**Journal.** Das Arbeitsgedächtnis zwischen Sitzungen, in Dateien in `.ai/journal/`: Der Agent schreibt dort am Ende jedes Workflows einen Eintrag. Siehe [Den Ansatz verstehen](../learn/comprendre.md).

**Manifest.** `base.manifest.json`, der durch `base index` generierte Index der Ressourcen: eine regenerierbare Projektion, niemals eine Quelle der Wahrheit. Siehe [Öffentliches Framework](framework-public.md).

**Marker.** Ein durchsuchbarer Textmarker in eckigen Klammern, dafür gemacht, von den Werkzeugen gefunden und verarbeitet zu werden. Zwei Ebenen, die sich nicht vermischen: die fachlichen Marker in Ihren Dokumenten (`[A VALIDER]`, `[A COMPLETER]`, `[ATTENTION]`, `[DECISION]`) und die Marker des Spezifikationsplans in der Spec und im Code (`[NEEDS CLARIFICATION]`, `[SPEC-NEUTRAL]`). Vollständiges und geschlossenes Register: [Marker](marqueurs.md).

**MCP.** Das offene Protokoll, und der BASE-Server, der es implementiert, um die Primitive des Broker den Chat-Apps zugänglich zu machen. Standardmässig nur lesend. Siehe [MCP-Server](../../mcp/README.md).

**Mechanismus.** Eine Garantie, die tatsächlich vom Broker, von der CLI oder vom MCP durchgesetzt wird, im Gegensatz zu einer Anweisung in Textform. Siehe [Sicherheit und Grenzen](../trust/securite-et-limites.md).

**Prozess.** Ein Workflow-skill: eine Vorgehensweise Schritt für Schritt, mit Umformulierungen und Entscheidungspunkten. Er ist das Ziel des routing. Siehe [routing, Prozesse und Ressourcen](routage-process-et-ressources.md).

**Projektion.** Eine aus den Quellen abgeleitete Datei (Manifest, routing-Register, Index): nützlich für die Prüfung oder bei grossem Massstab, löschbar und regenerierbar. Siehe [Den Ansatz verstehen](../learn/comprendre.md).

**Promotion.** Der kontrollierte Übergang einer Ressource von einem scope zu einem anderen (`base promote`), zum Beispiel von persönlich zu Team, via vermitteltes Schreiben. Siehe [Implementierungsstand](etat-implementation.md).

**Propose/commit.** Das vermittelte Schreiben in zwei Schritten: `base propose` zeigt einen Diff, ohne etwas zu schreiben, `base commit` wendet ihn nach Ihrer Validierung an. Siehe [Sicherheit und Grenzen](../trust/securite-et-limites.md).

**Ranker.** Die Komponente, die die Kandidaten einer Suche oder eines routing bewertet. Standardmässig lexikalisch, optional semantisch. Siehe [Quickstart semantisches routing](../guides/routage-semantique-quickstart.md).

**Ressource.** Jede nützliche Datei, die BASE inventarisieren, entdecken und öffnen kann: Agent, Prozess, Kompetenz, Template, Dokument, Daten. Siehe [Öffentliches Framework](framework-public.md).

**Router.** Die Komponente, die ein Paar aus Agent und dann Prozess für eine Anfrage auswählt, oder sich mit einem lesbaren Grund enthält. Rudimentär, aber wirksam, erweiterbar durch Adapter, erspart sie Ihnen die Suche nach dem richtigen Prozess und lädt niemals alles. Siehe [routing, Prozesse und Ressourcen](routage-process-et-ressources.md).

**Scope.** Der deklarierte Teilungsbereich einer Ressource: `personal`, `team`, `org`, `public`. Die Validierungsanforderungen wachsen mit dem scope. Siehe [Öffentliches Framework](framework-public.md).

**Skill.** Eine `SKILL.md`-Datei: Markdown mit einem Frontmatter, übertragbar zwischen Werkzeugen. Zwei Typen: Prozess und Kompetenz. Siehe [Den Ansatz verstehen](../learn/comprendre.md).

**Tool.** Ein ausführbares Werkzeug, oft ein lokales Skript, das ein Prozess aufrufen kann: standardmässig im dry-run, dann mit Bestätigung. Siehe [Öffentliches Framework](framework-public.md).

**Trace.** Das minimale technische Protokoll in JSONL (`.ai/trace/`): Identifikatoren, Entscheidungen, Dauern, standardmässig niemals der fachliche Inhalt. Siehe [Datenschutz](../trust/protection-des-donnees.md).

**Voie 1 / Voie 2 (Weg 1 / Weg 2).** Die beiden routing-Strategien, durch die Konfiguration gewählt. **Voie 1** ist der Standard: Der Assistent liest den generierten Index und wählt, unter einer deterministischen Untergrenze; der Code nennt sie die *lexikalische Strategie*. **Voie 2** ist optional, für grosse Kataloge: Embeddings finden einige Kandidaten und ein kleines Modell verfeinert; der Code nennt sie die *Embedding-Strategie*. Die beiden Wege sind unabhängig. Siehe [Quickstart routing](../guides/routage-semantique-quickstart.md) und [Voie 2, das routing per Embeddings](../guides/voie-2-routage-embeddings.md).

**Workspace.** Mehrere BASE-Wurzeln, deklariert in `base.workspace.json`: Das routing kann zwischen ihnen suchen, jede Aktion bleibt auf eine Wurzel eingegrenzt. Siehe [routing, Prozesse und Ressourcen](routage-process-et-ressources.md).

---

BASE ist ein Framework von [AI Swiss](https://a-i.swiss). Anwendungsfall in Partnerschaft mit [Innovaud](https://innovaud.ch).
