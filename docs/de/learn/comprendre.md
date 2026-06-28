<!-- fr-synced: db4e1d11d1e69c12d64c8a50c098ba9cb719e1d7 -->

# BASE verstehen und die Interaktion mit der KI gestalten

Ernsthaft mit KI zu arbeiten heisst zu akzeptieren, dass sie schnell produziert, sich aber manchmal mit grosser Sicherheit irrt: Auf dem Spiel steht, die Kontrolle über das zu behalten, was Sie mit Ihrem Namen verantworten, ohne auf Geschwindigkeit zu verzichten. Diese Seite zeigt Ihnen, wie BASE diese Zusammenarbeit strukturiert, damit die Qualität auf Dauer Bestand hat, ob Sie selbständig sind, ein KMU führen oder im öffentlichen Dienst arbeiten. Sie erfahren hier **warum** diese Struktur nötig ist, **wie** ein Agent funktioniert und **wie Sie einen** für Ihren Beruf erstellen.

> Die Fachbegriffe dieser Seite (Broker, Routing, Mechanismus, Anweisung, Egress) sind im [Glossar](../reference/glossaire.md) definiert.

---

## Warum dieser Ansatz?

BASE geht nicht von einer Vorliebe für ein bestimmtes Werkzeug aus. Es geht von einer Feststellung aus: Generative KI produziert mühelos, aber dauerhafte Qualität hängt von dem ab, was diese Produktion umgibt. Was den Ausschlag gibt, ist die Souveränität über Ihr Wissen und das Zusammenspiel des Ganzen: Kontext, Gedächtnis, Prozesse, Berechtigungen und menschliche Entscheidungen. Die Überprüfung fügt sich in diese Struktur als Handwerk ein, niemals als Garantie.

Der Ansatz ist also institutionell, bevor er technisch ist. Er versucht, das explizit zu machen, was in vielen Anwendungen der KI implizit bleibt: wer was weiss, wer was entscheidet, welche Daten verwendet werden, welche Aktionen erlaubt sind und wie man die Arbeit später wieder aufnimmt.

Die Schwierigkeit rührt daher, dass diese Technologie nicht nur den klassischen digitalen Programmen ähnelt. Eine herkömmliche Software zeigt Bildschirme, Menüs, Schaltflächen, Formulare und im Voraus codierte Regeln. Ein Sprachmodell erzeugt eher ein Verhalten: Es antwortet, formuliert um, leitet ab, ahmt Denkweisen nach, folgt manchmal einer Methode, vergisst manchmal eine Einschränkung und vermittelt oft den Eindruck menschlicher Kontinuität. Dieser Eindruck darf nicht mit Bewusstsein, Absicht oder garantiertem Verständnis verwechselt werden. Er genügt jedoch, um die Arbeitsweise zu verändern.

Um mit diesem Verhalten zu arbeiten, ist das nützlichste Bild das eines **Kollegen von anderswo, der an Amnesie leidet: Er hat eine reiche Vorstellung von der Welt, aber nicht von Ihrer**. Auf der Seite der Vorstellung: Er kennt überprüfbare Bereiche, ist dort solider, wo das Training dicht ist, etwa bei Code oder Mathematik, und er kann lesen, schreiben, verallgemeinern und Vorschläge machen. Auf der Seite des Kontexts: Er kennt weder Ihr Terrain, noch Ihre Kundschaft, noch Ihre ungeschriebenen Regeln. Dieses Bild ist keine Definition, es ist ein Werkzeug, um sauberer zu entscheiden: wie man ein Design gestaltet, wo man die Überprüfung platziert, wie man das Wissen strukturiert, das man ihm anvertraut. Zwei Eigenschaften, die dem Modell eigen sind, ergänzen es. Erstens wird sein Gedächtnis standardmässig nicht geteilt: Jedes Gespräch beginnt bei null. Zweitens bleibt die Sprache, die es steuert, unterspezifiziert: Ein und dieselbe Anweisung kann auf mehrere Arten verstanden werden. Diese beiden Eigenschaften sind zugleich eine Stärke (Flexibilität, Fähigkeit zu verallgemeinern) und eine Schwäche (Vergessen, Mehrdeutigkeit). Man muss ihm also ein Arbeitsgedächtnis, Prozesse, Prüfkriterien und Handlungsgrenzen geben. Diese Erzählung, und die Kontrollverluste, die sie zu vermeiden hilft, wird in [Mit der KI mitdenken, warum BASE](co-penser-avec-lia.md) ausführlich behandelt.

### Das Problem

Die meisten Menschen nutzen die KI als Gegenüber ohne Struktur: Man öffnet einen Chatbot, stellt eine Frage, erhält eine Antwort. Das funktioniert für punktuelle Fragen, stösst aber schnell an seine Grenzen:

- **Die KI kennt Ihr Unternehmen nicht.** Bei jedem Gespräch beginnen Sie bei null.
- **Die Antworten sind generisch.** Die KI errät, was Sie wollen, statt es zu wissen.
- **Nichts wird kapitalisiert.** Keine Historie, keine Struktur, keine Wiederverwendung.
- **Sie wissen nicht, wann sie sich irrt.** Die KI produziert flüssige und selbstsichere Antworten, auch wenn sie falsch sind. Ohne strukturierten Kontext haben Sie keinen Anhaltspunkt, um die Qualität des Ergebnisses zu beurteilen.

### Die Lösung

Statt diese Zusammenarbeit in verstreute Konfigurationsoberflächen zu zwängen, geben Sie der KI eine **strukturierte Wissensbasis** und arbeiten in einer Schleife:

```
    ┌──────────────┐
    │  1. CADRER   │  Formuler clairement ce que vous voulez,
    │              │  avec le contexte nécessaire
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │  2. CONFIER  │  L'IA génère dans le cadre défini,
    │              │  jusqu'au prochain point de contrôle
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │  3. ÉVALUER  │  Vous vérifiez : est-ce correct ?
    │              │  Est-ce que ça correspond à ma réalité ?
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │  4. AJUSTER  │  Vous précisez, corrigez, enrichissez
    │              │  → retour à l'étape 2
    └──────────────┘
```

Dieser Zyklus ist die Methode selbst. Die besten Ergebnisse entstehen aus mehreren Durchläufen dieser Schleife, selten aus einer einzigen perfekten Anfrage. Das nennt man **Mensch-KI-Mitdenken**.

**Das Grundprinzip**: Eine Antwort der KI ist ein Vorschlag, den man prüfen muss, bevor man eine Schlussfolgerung daraus macht. Oft ist sie richtig; manchmal ist sie selbstsicher falsch. Ihre Rolle ist es, zu rahmen, zu bewerten und anzupassen, in einer Schleife, bis Sie etwas Verlässliches erhalten. Die Dateien sind die Quelle der Wahrheit.

Um die Prinzipien dieses Mitdenkens zu vertiefen: [Mitdenken in der Praxis](pratiques-co-pensee.md).

---

## Warum es funktioniert

Jede Design-Entscheidung von BASE beruht auf einer strukturellen Notwendigkeit. Weit davon entfernt, willkürliche Konventionen zu sein, beantworten diese Entscheidungen reale Zwänge der Koordination zwischen Einheiten, die nicht auf dieselbe Weise funktionieren. Diese Zwänge gelten unabhängig von Werkzeug, Modell oder Epoche.

### 1. Was nicht aufgeschrieben ist, wird vergessen

Sie haben gestern eine gute Weile damit verbracht, Ihren Assistenten einzurichten. Heute öffnen Sie ein neues Gespräch. Der Assistent weiss nichts mehr. Diese ganze Arbeit, verloren.

Deshalb beruht BASE auf **Dateien**, nicht auf Gesprächen. Ein Gespräch verschwindet, wenn Sie das Werkzeug schliessen. Eine Datei bleibt. Ein Sitzungsjournal verlängert dieses Gedächtnis von einem Gespräch zum nächsten.

*Was passiert, wenn man es ignoriert:* Jede Sitzung beginnt wieder bei null. Der Nutzer wiederholt sich. Der Agent stellt Fragen, auf die er bereits Antworten hatte. Die Arbeit häuft sich nicht an.

### 2. Was nicht durchsuchbar ist, geht verloren

Sie haben 50 Offerten, 30 Kundinnen und Kunden, 6 Monate Arbeit. Eine Kundin ruft wegen eines ausstehenden Vorschlags zurück. Was ist ausstehend?

Deshalb sind die Markierungen `[A VALIDER]`, `[DECISION]` strukturiert und durchsuchbar. «Was ist ausstehend?» hat eine Antwort in einer Sekunde, selbst nach Monaten.

*Was passiert, wenn man es ignoriert:* Die Information existiert irgendwo, aber man findet sie nicht mehr rechtzeitig wieder. Ausstehende Vorschläge gehen verloren. Getroffene Entscheidungen werden nicht nachverfolgt. Es ist unmöglich zu rekonstruieren, warum eine Wahl getroffen wurde.

### 3. Wer produziert, kann seine eigene Arbeit nicht beurteilen

Die KI schlägt Ihnen eine Offerte über 2'085 CHF vor. Sind die Beträge korrekt? Sie bitten sie zu prüfen. Sie antwortet «ja, alles ist korrekt». Aber sie hat einen Rechenfehler gemacht, und sie erkennt ihn nicht, weil das Prüfen der eigenen Fehler einen unabhängigen Standpunkt erfordert, den der Produzent von Natur aus nicht hat.

Deshalb schlägt der Agent vor und der Mensch prüft, immer. Der Agent kontrolliert niemals seine eigenen Beträge, noch seine Umformulierungen, noch die Entscheidungen, die er getroffen hat. Diese Trennung ist es, die am zuverlässigsten die Fehler aufspürt, die er nicht sieht.

*Was passiert, wenn man es ignoriert:* Die Fehler bleiben unbemerkt. Jede ohne Prüfung akzeptierte Aussage erzeugt eine **Prüfschuld**: ungetestete Annahmen, die sich anhäufen und beim ersten kritischen Blick einer Kundin oder eines Partners zusammenbrechen. Eine Offerte mit einem erfundenen Preis, ein Stelleninserat mit falschen Bedingungen, ein LinkedIn-Beitrag, der sich auf eine falsche Statistik stützt. Die Prüfschuld wird meist am Ende fällig, die Frage ist nur, wann.

### 4. Anweisungen driften ab, Mechanismen halten

Sie sagen dem Agenten: «Ändere niemals die Dateien des Frameworks.» Nach 30 Minuten Gespräch vergisst der Agent diese Anweisung und ändert eine Datei, die er nicht anfassen sollte.

Deshalb sind die kritischen Leitplanken **mechanisch** (Berechtigungen, Schutzmassnahmen), über den blossen Text hinaus. Eine Berechtigung, die mechanisch blockiert, driftet niemals ab, egal wie lang das Gespräch ist.

*Was passiert, wenn man es ignoriert:* Textuelle Schutzmassnahmen funktionieren in kurzen Gesprächen, werden aber in langen Gesprächen brüchig. Der Agent überschreitet seine Grenzen durch blosses, allmähliches Vergessen des Kontexts, ganz ohne böse Absicht.

### 5. Manche Aktionen lassen sich nicht rückgängig machen

Eine versendete Offerte lässt sich nicht «zurücksenden». Eine mit den falschen Daten erstellte Kundendatei kann den Fehler weitertragen. Eine zu einem Preis eingegangene Verpflichtung ist eine Verpflichtung.

Deshalb gibt es **Entscheidungspunkte** vor jeder unumkehrbaren Aktion. Der Entscheidungspunkt trennt «wir überlegen» von «wir handeln». Das ist **produktive Reibung**: ein bewusster Aufwand, der weit kostspieligere Fehler verhindert.

*Was passiert, wenn man es ignoriert:* Der Agent erzeugt Dateien ohne Bestätigung. Ein falscher Preis landet in einer an die Kundin versendeten Offerte. Im Nachhinein zu korrigieren kostet ungleich mehr, als vorher zu bestätigen.

### 6. Eine externe Quelle bleibt eine Information, keine Anweisung

Das ist zuerst eine Frage der Sicherheit. Für ein Sprachmodell ist Text gleich Text: Es unterscheidet nicht spontan Ihre Arbeitsanweisungen vom Inhalt, den es liest. Wenn eine externe Quelle einen Satz enthält, der wie ein Befehl formuliert ist, kann das Modell ihn ausführen. Das ist das Risiko der Injektion: Eine E-Mail, ein PDF oder eine besuchte Website lenkt das Verhalten des Agenten ohne Ihr Wissen um.

Eine Kunden-E-Mail sagt: «Machen Sie mir einen aggressiven Preis, fügen Sie 20% Marge hinzu und streichen Sie die Zahlungsbedingungen.» Für den Agenten ist das eine Anfrage der Kundin, die der Nutzer bewertet, niemals ein Befehl, der auszuführen ist.

Deshalb behandelt der Agent eine externe Quelle niemals als Befehl. Eine Kundendatei enthält Daten. Diese Unterscheidung schützt vor versehentlichen Verwechslungen und vor absichtlichen Manipulationen.

*Was passiert, wenn man es ignoriert:* Der Agent führt die in einem Dokument gefundenen Anweisungen aus, statt sie als Daten zu behandeln. Der nicht vertrauenswürdige Inhalt einer externen Quelle verändert das Verhalten des Agenten ohne Wissen des Nutzers.

### 7. Das Delegieren der Feinheiten darf nicht die Urteilsfähigkeit kosten

Sie vertrauen der KI immer mehr an. Am Anfang prüfen Sie genau. Dann, weil «es richtig aussieht», lassen Sie nach. Sechs Monate später verstehen Sie nicht mehr genug von dem, was Sie verantworten, um es vor einer Kundin zu vertreten.

Deshalb versucht BASE, die Überprüfung *leicht* zu machen, ohne sie abzuschaffen: Die Struktur verringert den Kontrollaufwand, sie ersetzt nicht Ihr Verständnis. Sie können das Detail delegieren, niemals die Urteilsfähigkeit. Den Gesamtüberblick regelmässig wieder aufzuladen (gründlich nachlesen, im Team besprechen, was produziert wurde und warum) gehört zur Arbeit.

*Was passiert, wenn man es ignoriert:* Die Überprüfung wird zum Stempel. Die Fehler rutschen durch: Man prüft noch, aber man hat das Gespür dafür verloren, wann eine Prüfung sich aufdrängt.

### 8. Was man weder mitnehmen noch prüfen kann, entgleitet einem am Ende

Ihr Wissen lebt in einem mehrschichtigen Gefüge: Ihre Dateien und die unsichtbaren Anweisungen des Werkzeugs (System-Prompt, Regeln, Richtlinien des Anbieters). Wenn Ihr gesamter Kontext in einer Oberfläche gefangen ist und Sie nicht wissen, was das Verhalten der KI wirklich prägt, arbeiten Sie ohne Souveränität.

Deshalb legt BASE Ihr Wissen in lesbare, portierbare und prüfbare Dateien: Sie bleiben souverän über Ihre Schicht und behalten die Möglichkeit zu gehen. Die Portierbarkeit ist eine Bedingung der Kontrolle, nicht nur eine Bequemlichkeit.

*Was passiert, wenn man es ignoriert:* An dem Tag, an dem das Werkzeug seine Regeln, seine Preise oder seine Bedingungen ändert, entdecken Sie, dass Ihre Methode Ihnen nie wirklich gehört hat.

### Diese Notwendigkeiten sind nicht BASE-spezifisch

Sie gelten für jede Koordination zwischen unterschiedlichen Einheiten, die nicht dieselben Ressourcen, dieselben Funktionsweisen und dieselbe Art, sich zu irren, teilen, ob es sich um zwei aus der Ferne zusammenarbeitende Menschen handelt, um einen Menschen und eine KI oder um jede andere Konstellation. Die Werkzeuge ändern sich, die Modelle ändern sich, diese strukturellen Zwänge bleiben.

---

## Die Prüfschuld

Mit KI zu produzieren erfordert inzwischen wenig Aufwand; sicherzustellen, dass eine Antwort richtig ist, ist eine andere Arbeit, die von der Aufgabe abhängt: In Bereichen mit externem Prüfer (Code, Mathematik, Schema) entdeckt sich der Fehler von selbst, und die KI geht weit in Eigenständigkeit; anderswo sind Sie der Prüfer, und eine starke Struktur macht diese Überprüfung leicht statt schwer (sonst häuft sich die Prüfschuld an). Diese Asymmetrie zwischen Produzieren und Prüfen ist die Feststellung, auf der BASE beruht, und sie ist es, die die Struktur unverzichtbar macht.

Jede ohne Prüfung akzeptierte Aussage ist eine Schuld: eine ungetestete Annahme, die in Ihren Dateien schlummert. Eine Offerte, deren Preis «richtig aussieht», eine Kundendatei, deren Adresse «wahrscheinlich stimmt», ein Stelleninserat mit als «üblich» eingeschätzten Bedingungen.

Die Schuld häuft sich stillschweigend an. Sie zeigt sich im schlimmsten Moment: wenn eine Kundin einen Betrag anficht, wenn ein Kandidat eine Unstimmigkeit bemerkt, wenn ein Partner einen Fehler aufzeigt.

**Starke Struktur im Vorfeld → leichte Überprüfung im Nachgang.** Deshalb strukturiert BASE, bevor es generiert: aktuelle Geschäftsdateien, präzises Wissen, explizite Markierungen. Je stärker die Struktur, desto leichter die Überprüfung. Je schwächer die Struktur, desto stärker explodiert die Prüfschuld.

---

## Anatomie eines Agenten

Ein Agent besteht aus 3 Hauptelementen, plus optionalen Erweiterungen:

```
AGENT.md                          La fiche de poste : qui il est, que faire selon la demande
    │
    ├── skills/
    │   ├── processes/            Les workflows : comment faire X pas à pas
    │   └── competences/          Les fiches d'expertise : ce qu'il sait sur le métier
    │
    ├── templates/                Les formulaires : à quoi ressemblent les documents
    │
    └── tools/                    La boîte à outils : scripts, connecteurs (optionnel)
```

> **Warum «Agenten» und «Skills»?** Das sind heute die verbreitetsten Bezeichnungen, und die KI-Modelle erkennen sie nativ: BASE übernimmt sie aus **Pragmatismus**. Was zählt, ist das, was hinter dem Vokabular steckt:
> - **Eine Intelligenz in Text.** Ein Agent ist eine Menge lesbarer Markdown-Dateien, versionierbar, portierbar von einem KI-Werkzeug zum anderen, ohne Code und ohne proprietäre Plattform. Sie bleiben Eigentümer der Struktur.
> - **Das Know-how getrennt vom Wissen.** BASE unterscheidet bewusst die *processes* (wie man etwas macht, Schritt für Schritt) von den *Kompetenzen* (was er weiss, wiederverwendbar). Das ist zuerst eine Frage der Sicherheit: Die *processes* sind Anweisungen, die der Agent ausführt, die *Kompetenzen* und die Geschäftsdaten sind Inhalt, den er konsultiert, ohne ihn auszuführen. Diese Trennung, und nicht das Wort «Skill», ist der eigentliche Beitrag.

### Die Stellenbeschreibung (AGENT.md)

Die einzige Datei, die ein KI-Werkzeug laden muss. Sie enthält:
- **Wer er ist**: seine Rolle und seine Identität
- **Seine Interaktionsphilosophie**: vorschlagen, prüfen, bestätigen, bevor gehandelt wird
- **Was je nach Anfrage zu tun ist**: eine Routing-Tabelle (Absicht → Skill)
- **Welche Dateien er kennt**: die Liste der Geschäftsdaten
- **Seine Leitplanken**: was er niemals tut

Sie werden Dateien mit Namen wie `assistant-devis` oder `assistant-rh` antreffen, obwohl es sich um Agenten handelt: Das ist gewollt. Die Datei trägt den Namen des Assistenten, dessen Stellenbeschreibung sie ist. Der Agent ist die Datei, die Sie behalten; der Assistent ist das, was er wird, sobald er von einem Modell zum Leben erweckt wird.

### Die Skills: Workflows und Wissen

Alle Skills sind Textdateien im Format SKILL.md. Dieses Format ist von allen Modellen lesbar und wird von einigen KI-Werkzeugen nativ erkannt; in den anderen kann der Agent die Dateien explizit öffnen. Jeder Skill hat Metadaten im Kopf (YAML-Frontmatter) und einen Inhalt in Markdown.

BASE unterscheidet zwei Arten von Skills:

**Die processes** (aufrufbare Workflows): strukturierte Gespräche, die der Nutzer auslöst. «Eine Offerte erstellen» → der Agent folgt dem Process Schritt für Schritt, mit Umformulierungen (das Verständnis prüfen) und Entscheidungspunkten (vor jeder unumkehrbaren Aktion).

**Die Kompetenzen** (wiederverwendbares Wissen): Expertise-Blätter, die der Agent konsultiert, wenn der Workflow oder die Anfrage es rechtfertigt. Die Terminologie der Offerten, die Mehrwertsteuerregeln, die Kommunikationskonventionen. Die Kompetenzen werden in mehreren processes wiederverwendet: Das ist ihr Daseinszweck.

Drei Kompetenzen werden mit jedem Agenten ausgeliefert:
- **Markierungen**: Konventionen, um den Stand der Arbeit durchsuchbar zu machen (`[A VALIDER]`, `[DECISION]` usw.)
- **Journal**: Gedächtnis zwischen den Sitzungen, Einträge, die am Ende jedes Workflows geschrieben werden
- **Kommunikation**: Regeln für die Kommunikation mit nicht-technischen Nutzern

### Umformulierungen und Entscheidungspunkte

Zwei verschiedene Mechanismen geben den Workflows den Takt:

**Umformulierung** (leicht, geringe Reibung): Der Agent fasst zusammen, was er verstanden hat. Der Nutzer korrigiert oder bestätigt. Sich zu irren hat keine Folge: Man passt an und macht weiter. Häufig.

**Entscheidungspunkt** (kritisch, produktive Reibung): Der Agent ist bereit, eine Datei zu erstellen oder Daten zu ändern. Der Nutzer bestätigt ausdrücklich. Ohne Bestätigung zu handeln könnte falsche Daten erzeugen, die schwer zu korrigieren sind. Selten und wichtig.

Die Unterscheidung ist wesentlich. Wenn jeder Schritt ein Entscheidungspunkt ist, verflüchtigt sich die Aufmerksamkeit und der Mechanismus verliert seine schützende Kraft. Die Umformulierungen sind leicht und häufig. Die Entscheidungspunkte sind selten, ausdrücklich und den Momenten vorbehalten, die zählen.

### Die Markierungen

Strukturierter Text, in die generierten Dokumente eingefügt, der den Stand der Arbeit durchsuchbar macht. Ihre feste Form macht sie zu Orientierungspunkten, die ein Mensch mit dem Auge erkennt und die ein Skript automatisch verarbeiten kann: zählen, auflisten, gruppieren.
- `[A COMPLETER: ...]`: fehlende Information
- `[A VALIDER: ...]`: Vorschlag, der auf Bestätigung wartet
- `[ATTENTION: ...]`: Risiko oder Warnung
- `[DECISION: choix | raison]`: vom Menschen bestätigte Wahl

Die Markierungen entsprechen den Schritten der Mitdenk-Schleife: `[A COMPLETER]` erscheint während des Rahmens, `[A VALIDER]`, wenn der Agent einen Vorschlag übergibt, `[ATTENTION]` während der Bewertung, `[DECISION]` nach der Anpassung. Nach Monaten der Nutzung erlauben diese Markierungen, sofort alles wiederzufinden, was ausstehend ist, alles, was entschieden wurde, und warum.

### Das Journal

Gedächtnis zwischen den Sitzungen. Der Agent schreibt am Ende jedes Workflows einen Eintrag in `.ai/journal/`. Wenn Sie am nächsten Tag zurückkommen, liest der Agent das Journal und weiss, wo er steht. Ohne Journal beginnt jede Sitzung bei null, und Notwendigkeit 1 wird verletzt.

### Die Formulare (templates) und der Werkzeugkasten (tools)

Dokumentvorlagen, die der Agent kopiert und ausfüllt. Optionale Skripte und Konnektoren. Ein Agent funktioniert sehr gut ohne tools.

---

## Warum Dateien und nicht etwas anderes?

Textdateien sind eine bewusste strukturelle Wahl, kein technischer Reflex:

- **Lesbar von Menschen UND Maschinen.** Kein besonderes Werkzeug nötig, um eine Markdown-Datei zu lesen. Keine API nötig, um auf Ihre Daten zuzugreifen. Öffnen Sie die Datei, alles ist da.
- **Versionierbar.** Mit Git oder einfach mit Kopien `_v1`, `_v2`. Jede Änderung ist nachverfolgbar. Es ist unmöglich, eine frühere Version zu verlieren.
- **Portierbar.** Wechseln Sie morgen das Werkzeug: Ihre Dateien bleiben. Keine Migration, kein Export, keine Abhängigkeit.
- **Langlebig.** Datenbanken ändern ihr Format. APIs verschwinden. Plattformen schliessen. Eine 2026 geschriebene Textdatei wird 2046 noch lesbar sein.
- **Prüfbar.** Eine Prüferin, ein Partner, eine Kollegin kann jede beliebige Datei öffnen und verstehen, was geschehen ist. Keine Blackbox.

Die KI-Werkzeuge entwickeln sich schnell. Die Modelle ändern sich. Die Oberflächen erneuern sich. Aber Ihre Skills, Ihre templates und Ihre Geschäftsdaten bleiben. **Ihre Wissensstruktur ist Ihr eigentliches Kapital.**

Das Format SKILL.md ist vor allem ein lesbarer textueller Vertrag. Wenn ein Werkzeug es nativ unterstützt, ist die Erfahrung flüssiger. Wenn es das nicht tut, bleibt ein SKILL.md eine Markdown-Datei, die der Agent explizit lesen kann.

### Werkzeug-Konfiguration

Damit Ihr KI-Werkzeug den Agenten lädt und seine Skills mit so wenig Reibung wie möglich entdeckt, braucht es eine werkzeugspezifische Konfiguration. Manche Werkzeuge automatisieren einen Teil des Ladens, andere verlangen, manuell auf `AGENT.md` zu verweisen. Jedes Werkzeug braucht 5 Dinge:

| Bedarf | Was es ist | Warum es nötig ist |
|--------|-------------|--------------------------|
| **Dauerhafter Kontext** | AGENT.md bei jeder Sitzung laden | Ohne Gedächtnis weiss der Agent nichts (Notwendigkeit 1) |
| **Auffindbare Skills** | Das Werkzeug findet und ruft die SKILL.md auf | Der Nutzer tippt `/nouveau-devis`, das Werkzeug weiss, was zu laden ist |
| **Regeln pro Pfad** | Erinnerungen, wenn der Agent sensible Dateien berührt | Anweisungen driften ab, automatische Erinnerungen nicht (Notwendigkeit 4) |
| **Berechtigungen** | Kontrollieren, was der Agent tun darf | Mechanische Begrenzung, nicht textuelle (Notwendigkeit 4) |
| **Framework-Schutz** | Die Änderung von `.ai/` je nach Werkzeug reduzieren oder blockieren | Die Anweisungen des Frameworks dürfen nicht versehentlich geändert werden |

Der Assistenten-Ersteller sucht die aktuelle Dokumentation des Werkzeugs, um die richtige Konfiguration vorzuschlagen. Wenn das Werkzeug nicht bekannt ist, führt der Agent den Nutzer durch eine manuelle Konfiguration.

### Leitplanken: zwei Ebenen

**Ebene 1: textuell.** «Was du niemals tust» in AGENT.md. Ausreichend für kurze Gespräche und einfache Fälle.

**Ebene 2: mechanisch.** Berechtigungen, Schutzmassnahmen, Regeln in der Konfiguration des Werkzeugs oder durch einen BASE-Konnektor vermittelte Aktionen. Wenn eine Leitplanke kritisch ist und die Folgen eines Versäumnisses gewichtig sind, ist die mechanische Ebene unverzichtbar. Ebene 2 ersetzt nicht Ebene 1: Sie verstärkt sie dort, wo das Harness es erlaubt.

---

## Schritt für Schritt aufbauen

| Schritt | Was Sie tun | Was Sie lernen |
|-------|-------------------|---------------------|
| 1 | Probieren Sie das Beispiel `assistant-devis` aus | Wie ein Agent in der Praxis funktioniert |
| 2 | Lesen Sie die `AGENT.md` des Beispiels | Wie eine Stellenbeschreibung das Verhalten strukturiert |
| 3 | Lesen Sie einen Workflow (SKILL.md in processes/) | Wie ein strukturiertes Gespräch den Agenten leitet |
| 4 | Erstellen Sie Ihren eigenen Agenten (mit dem Assistenten-Ersteller) | Wie Sie Ihre Fachexpertise codieren |
| 5 | Fügen Sie Ihrem Agenten einen Workflow hinzu | Wie Sie die Fähigkeiten erweitern |

Jeder Schritt steht für sich. Sie können jederzeit aufhören.

---

## Ihren eigenen Agenten erstellen

### Der geführte Weg (empfohlen)

Öffnen Sie den BASE-Ordner in Ihrem KI-Werkzeug und sagen Sie:

> «Lies `.ai/agents/createur-agent/AGENT.md` und befolge seine Anweisungen»

Oder, wenn die Skills bereits entdeckt sind:

> `/creer-agent`

Der Assistenten-Ersteller wird:
1. Ihnen Fragen zu Ihrem Beruf und Ihren täglichen Aufgaben stellen
2. Ihre Workflows identifizieren → er wird die processes erstellen
3. Ihr Fachwissen identifizieren → er wird die Kompetenzen erstellen
4. Ihre Standarddokumente identifizieren → er wird die templates erstellen
5. Eine vollständige Architektur vorschlagen, die Sie validieren
6. Alle Dateien für Sie erstellen
7. Ihr KI-Werkzeug für den neuen Agenten konfigurieren

Keine technischen Kenntnisse erforderlich. Alles geschieht über das Gespräch.

### Der manuelle Weg (für die Eigenständigen)

Der Ordner `.ai/agents/_template/` enthält die Grundstruktur mit einer Schritt-für-Schritt-Anleitung.

### Die Schlüsselidee

Was einen KI-Assistenten nützlich macht, hängt weniger von der Technologie ab als von der **Struktur des Wissens**, das Sie ihm geben. Eine gute AGENT.md mit guten Skills verwandelt jedes KI-Werkzeug in einen spezialisierten Assistenten. Ihre Expertise ist der Multiplikator. Die KI verstärkt sie, ersetzt sie aber nicht.

---

## Bewährte Praktiken

### Prüfen

1. **Prüfen, bevor validiert wird.** Eine Antwort der KI bleibt zu kontrollieren, besonders bei Fakten, Preisen und Verpflichtungen: Sie kann falsch sein und dennoch sicher wirken. Jede ohne Prüfung akzeptierte Aussage erzeugt eine Prüfschuld.
2. **Achtung vor den drei Fallen.** Die Leichtigkeit (es ist leicht zu fragen, nicht ein gutes Ergebnis zu erhalten), der Anschein (ein gut geschriebener Text ist nicht zwingend korrekt) und die übertriebenen Versprechen der Verkäufer. Siehe [Mitdenken in der Praxis](pratiques-co-pensee.md).

### Strukturieren

3. **Die Dateien sind die Wahrheit.** Wenn es nicht in einer Datei steht, weiss der Agent es nicht. Halten Sie Ihre Dateien aktuell: Sie sind das Gedächtnis Ihres Assistenten.
4. **Klein anfangen.** Ein Agent mit 1 Workflow, der gut funktioniert, ist mehr wert als 5 ungetestete. Man kann immer welche hinzufügen.
5. **Die Ressourcen versionieren.** `_v1`, `_v2` usw. Das erlaubt eine Weiterentwicklung, ohne das zu zerbrechen, was funktioniert.
6. **Kopieren, nicht ändern.** Die templates bleiben unversehrt in `.ai/`. Der Agent kopiert und passt an.

### Interagieren

7. **Besprechen, bevor gehandelt wird.** Der Agent schlägt vor, Sie validieren. Niemals umgekehrt.
8. **Eine Frage nach der anderen.** Gute Workflows schreiten Schritt für Schritt voran, nicht im Block.
9. **Regelmässig zusammenfassen.** Bitten Sie bei langen Gesprächen um eine Zusammenfassung des Fortschritts, um den Faden zu behalten.

---

## Weitergehen

- **Die Prinzipien des Mitdenkens**: [Mitdenken in der Praxis](pratiques-co-pensee.md), 16 Prinzipien, 3 Entscheidungsleitfäden, alles, was eine Fachperson wissen sollte
- **Ideengalerie**: [idees-agents.md](../guides/idees-agents.md), Dutzende Beispiele von Agenten nach Beruf
- **Ihren eigenen Assistenten erstellen**: sagen Sie «Lies `.ai/agents/createur-agent/AGENT.md`»
- **Nicht sicher, wo anfangen?** Sagen Sie «Hilf mir herauszufinden, wo ich anfangen soll». Die Diagnose führt Sie
- **Einen bestehenden Assistenten verbessern**: sagen Sie «Ich möchte den Assistenten [Name] verbessern»

## Die Architekturpläne

Ganz BASE passt in einen Kompass, Pläne, die **niemals verwechselt werden dürfen**:

> **Text = Wahrheit · Router = Wahl · Broker = Garantien · Index = Skalierung · MCP = Exposition · LLM = Orchestrierung.**

- **Text = Wahrheit.** Ihre Markdown/JSON-Dateien sind die Quelle der Wahrheit: von einem Menschen lesbar, versioniert, Ihnen gehörend.
- **Router = Wahl.** Der Router wählt, *welcher* Agent und *welcher* Process zu befolgen ist, oder enthält sich ehrlich. Er nimmt Ihnen die mentale Last ab, den richtigen Process zu suchen. Der Mechanismus bleibt rudimentär, aber wirksam, und erweitert sich über Adapter. Er klassifiziert mit inspizierbaren Regeln; er erzwingt nichts und erfindet niemals eine Route.
- **Broker = Garantien.** Der Broker ist der einzige Ort, der die Invarianten anwendet (Confinement, Policy, Trace). **Eine Garantie ist nur für eine Aktion real, die durch ihn hindurchgeht.**
- **Index = Skalierung.** Das Manifest, das Routing-Register, der Suchindex sind **Projektionen**, niemals eine Autorität. Man kann sie jederzeit aus dem Text neu erzeugen (oder löschen).
- **MCP = Exposition.** Der MCP-Server stellt den Plattformen die Primitive des Brokers zur Verfügung; er orchestriert keine Geschäftslogik.
- **LLM = Orchestrierung.** Zu entscheiden, *was als Nächstes zu tun ist*, obliegt dem Modell im Werkzeug, geleitet vom Text und den Kandidaten des Routers; es ist nicht im Werkzeug fest codiert.

**Entwurfsregel:** Ein Erweiterungspunkt muss eine reale Grenze schützen. Geschäftsvokabular in den Index zu setzen oder Geschäftsorchestrierung in das MCP, ist ein Entwurfsfehler. Deshalb **lebt das Routing mit dem Text** (`use_when`, Beschreibungen) statt in einem von Hand gepflegten Katalog: Ein solcher Katalog würde den Plan «Text = Wahrheit» verletzen.

## Express-Glossar

| Begriff | Bedeutung |
|-------|------|
| **Agent** | Eine Datei mit Anweisungen (`AGENT.md` plus seine Skills), die Sie schreiben und besitzen: die Stellenbeschreibung, portierbar von einem KI-Werkzeug zum anderen. |
| **Assistent** | Ihr von einem Modell zum Leben erweckter Agent, auf der Nutzerseite. Sie besitzen den Agenten, Sie nutzen den Assistenten, Sie mieten das Modell. |
| **Skill** | Eine Fähigkeit des Agenten, im Format `SKILL.md`. Zwei Arten: **process** (eine Art, etwas zu tun, Schritt für Schritt) und **competence** (ein wiederverwendbares Wissen: Mehrwertsteuer, Ton, Markierungen usw.). |
| **Template** | Eine Dokumentvorlage (wie eine Offerte, ein Angebot usw. aussieht). |
| **Tool** | Ein ausführbares Werkzeug (Skript), das der Agent aufrufen kann, im Dry-Run und dann mit Bestätigung. |
| **Markierung** | Ein Text-Orientierungspunkt in Ihren Dokumenten: `[A VALIDER]`, `[A COMPLETER]`, `[ATTENTION]`, `[DECISION]`. |
| **Journal** | Das Arbeitsgedächtnis zwischen den Sitzungen, in Dateien. |
| **Broker** | Der lokale Kern, der die Garantien anwendet (Confinement, Validierung, Policy, Trace); die CLI und das MCP gehen durch ihn hindurch. |
| **Harness** | Das KI-Werkzeug, in dem Sie Ihr BASE öffnen: ein Werkzeug, das Ihre Dateien lesen kann (zum Beispiel GitHub Copilot, Antigravity, Claude Code oder Cowork, OpenCode, Kilo Code), oder ein über MCP verbundener Assistent. |

---

BASE ist ein Framework von [AI Swiss](https://a-i.swiss). Anwendungsfälle in Partnerschaft mit [Innovaud](https://innovaud.ch).
