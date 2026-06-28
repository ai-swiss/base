<!-- fr-synced: 8c742e8f9bd13f37f3cd27da36f4a0d2b08711c1 -->

Mit KI zu produzieren erfordert heute wenig Aufwand; es zu verteidigen erfordert viel. Es geht also nicht darum, den perfekten Prompt zu schreiben, sondern darum, **derjenige zu bleiben, der die Kontrolle behält**: abstecken, übergeben, bewerten, anpassen und am Ende wissen, was Sie unterschreiben. Diese Seite versammelt alles, was Sie dafür brauchen, vom Einfachsten bis zum Vollständigsten: die Schleife, die jeder Interaktion ihren Rhythmus gibt, fünf Praktiken, um sie leicht zu machen, und dann die sechzehn Prinzipien, die ihnen zugrunde liegen. Sie können nach den Praktiken aufhören und schon gut arbeiten; bis zu den Prinzipien hinabzusteigen heisst, die Methode über die Zeit hinweg zu halten.

> [Warum BASE: mit der KI mitdenken](./co-penser-avec-lia.md) erklärt, *warum* die Überprüfung der Kern der Sache ist. Diese Seite zeigt, *wie*.

## Die Schleife: abstecken, übergeben, bewerten, anpassen

Mit KI zu arbeiten folgt meistens demselben Zyklus, **ABSTECKEN → ÜBERGEBEN → BEWERTEN → ANPASSEN**, und dann wieder von vorne. Das ist kein Zeichen von Ineffizienz, es ist die Methode: Gute Ergebnisse entstehen aus einigen Runden dieser Schleife, nicht aus einer einzigen perfekten Anfrage. Die fünf Praktiken unten machen jeden Schritt leicht. Keine erfordert Expertise: Sie dienen der eiligen Person ebenso wie derjenigen, die in die Tiefe gehen will.

### 1. Klar abstecken

Bevor Sie generieren, nennen Sie das Ziel, die Rahmenbedingungen und das, wie eine gute Antwort aussieht. Ein sauberer Rahmen im Vorfeld macht die Überprüfung im Nachgang leicht.

> *«Verfasse eine Antwort an diesen unzufriedenen Kunden. Ton: ruhig und sachlich. Rahmenbedingungen: keine Zusage einer Rückerstattung, schlage stattdessen einen Termin vor. Eine gute Antwort erkennt das Problem an, ohne zu versprechen, was wir nicht halten können.»*

**Was Sie überprüfen:** den Ton, und dass sich kein nicht autorisiertes Versprechen eingeschlichen hat.
Vollständiges Beispiel: `exemples/assistant-courrier/`.

### 2. Gegen die Realität überprüfen

Wer produziert, kann seine eigene Arbeit nicht beurteilen. Die KI schlägt vor, Sie überprüfen gegen Ihre Fakten, Ihre Dateien, Ihre Regeln. Das ist die Überprüfungsschuld: Sie verschwindet nicht, man macht sie sichtbar und klein.

> *«Worauf stützt du diese Zahl? Zitiere die Quelle in meinen Dateien.»*

**Was Sie überprüfen:** dass die Quelle existiert und tatsächlich das sagt, was man ihr unterstellt.
Vollständiges Beispiel: `exemples/assistant-devis/`, wo der Tarif aus Ihren Dateien stammt, nicht aus dem Gedächtnis des Modells.

### 3. Eine Entscheidungskarte verlangen

Wenn mehrere Optionen gleichzeitig offen sind, verheddert sich ein Gesprächsfaden. Verlangen Sie eine **Entscheidungskarte**: Die KI legt jeden Punkt mit ihrer Empfehlung vorneweg dar, Sie notieren Ihr Einverständnis und Ihre Kommentare, dann handelt sie auf das Ganze auf einmal. Sie entscheiden, die Karte strukturiert die Entscheidung.

> *«Mehrere Optionen sind offen. Erstelle mir eine Entscheidungskarte: ein Punkt pro Karte, deine Empfehlung zuerst, und ich gebe dir meine Antworten zurück.»*

- **Wann:** sobald zwei oder mehr Entscheidungen gemeinsam zu treffen sind.
- **Was Sie zurückbekommen:** ein klares Dokument, in dem Sie Punkt für Punkt entscheiden, ohne dass die KI an Ihrer Stelle entscheidet.
- **Was Sie überprüfen:** dass jede Empfehlung begründet ist und dass kein bereits geklärter Punkt wieder aufgemacht wird.

Vollständiges Beispiel: `exemples/assistant-reflexion/`, das eine Entscheidung klären und eine Entscheidungsnotiz vorbereiten kann.

### 4. Annahmen sichtbar machen

Eine gute Interaktion vergräbt nicht, was zählt. Bitten Sie die KI, das zu markieren, was noch zu bestätigen ist, statt es als gesichert darzustellen. Die Marker `[A VALIDER]`, `[HYPOTHESE]` und `[A COMPLETER]` sind auf einen Blick zu erkennen, für Sie wie für Ihre Werkzeuge.

> *«Markiere `[A VALIDER]` bei allem, was nicht bestätigt ist, und `[HYPOTHESE]` bei den Punkten, wo du etwas annimmst.»*

**Was Sie überprüfen:** dass die Bereiche der Unsicherheit gekennzeichnet und nicht verborgen sind.

### 5. Iterieren, nicht den perfekten Prompt suchen

Die feine Steuerung macht die Effizienz aus. Statt die Anweisung zehnmal umzuschreiben, lassen Sie eine erste Fassung generieren, reagieren Sie präzise, passen Sie an. Reibung ist produktiv: Jeder Hin- und Rückweg bringt Sie näher, und Sie behalten das Verständnis dafür, was sich ändert.

> *«Das ist fast so. Mach den zweiten Absatz kürzer und entferne den Fachjargon.»*

**Was Sie überprüfen:** dass jede Fassung näher kommt und dass Sie noch verstehen, was sich bewegt.

Diese Praktiken sind kalibriert, nicht automatisierungsfeindlich: Sie halten Sie fähig zu überprüfen, ohne Sie zu bremsen. Was sie umsetzen, sind die sechzehn Prinzipien, die nun folgen.

---

## Die sechzehn Prinzipien

Die Praktiken oben sind die Kurzfassung; hier ist die vollständige Methode. Es gibt zahlreiche regulatorische und ethische Rahmenwerke, die den Einsatz von KI regeln. Diese Prinzipien ersetzen sie nicht: Sie geben operative Orientierung, um innerhalb dieser Rahmenwerke zu glänzen, effizient und verantwortungsvoll zu bleiben. Sie gliedern sich in sechs Kategorien: Ihre Verantwortung tragen, Ihre Zuverlässigkeitsgrenzen kennen, zu interagieren wissen, gängige Fallen vermeiden, die Methode den Werkzeugen vorziehen und die Kontrolle über die Zeit hinweg behalten.

### I. Tragen Sie Ihre Verantwortung

#### 1. Seien Sie selbst da, wo es wesentlich ist

Aufgaben, die Ihre einzigartige persönliche Identität ansprechen (Ihre Stimme, Ihr Stil, Ihre Vision oder Ihre Werte), müssen von Ihnen gesteuert werden.

Beispiele: strategische Vision, Unternehmensphilosophie, Markenidentität, architektonische Handschrift.

*Fragen Sie sich: Erfordert diese Aufgabe das, was mich einzigartig macht?*

#### 2. Seien Sie Mensch da, wo es wesentlich ist

Aufgaben, die eine menschliche Erfahrung verlangen (Empathie, verkörpertes Verständnis, moralische Intuition), müssen von einem Menschen geleitet werden.

Beispiele: eine heikle Nachricht an eine Mitarbeiterin, die Vermittlung eines Konflikts, eine ethische Entscheidung, eine sensible Kundenreklamation.

*Fragen Sie sich: Kann das wirklich geschehen, ohne zu wissen, wie es sich anfühlt, ein Mensch zu sein?*

#### 3. Nutzen Sie KI effizient

Sobald Sie entscheiden, KI zu nutzen, tun Sie es gut. Minimieren Sie unnötige Iterationen, vage Anweisungen und überflüssiges Hin und Her. Strukturieren Sie Ihre Anfragen, überprüfen Sie die Ergebnisse und vermeiden Sie es, KI für Aufgaben zu nutzen, die sie nicht zuverlässig erfüllen kann.

*Fragen Sie sich: Nutze ich KI gezielt und produktiv, oder verschwende ich Zeit und Ressourcen?*

#### 4. Überprüfen Sie gegen die Realität

KI simuliert, sagt voraus und stellt Hypothesen auf, aber sie kann ihre Behauptungen nicht in der realen Welt testen. Hypothesen gegenüber der physischen Realität zu formulieren und zu testen ist Ihre Verantwortung.

Beispiele: Ein Kostenvoranschlag kann korrekt wirken, aber einen für Ihren Markt unrealistischen Preis enthalten. Ein Stelleninserat kann professionell wirken, aber Ihre lokalen Rahmenbedingungen ignorieren. Nur Sie können überprüfen, was Ihrer Realität entspricht.

#### 5. Wägen Sie Risiken, Kosten und Alternativen ab

Generative KI ist nicht immer die richtige Wahl. Wägen Sie vor jeder Nutzung ab:

- **Die Risiken:** Vertraulichkeit, Verzerrung (Bias), geistiges Eigentum, Authentizität, Datensouveränität, regulatorische Konformität.
- **Die Kosten:** Energie, Geld, Zeit, Kompromisse bei der Qualität, kognitive Abhängigkeit.
- **Die Alternativen:** deterministische Algorithmen, spezialisierte Werkzeuge, etablierte Methoden, menschliche Expertise allein.

*Fragen Sie sich: Bietet generative KI hier einen Nettonutzen, oder wäre ein anderer Ansatz sicherer, günstiger oder effizienter?*

*Die gängigen Praktiken zu diesen Aspekten sind im [Anhang](#anhang-gangige-praktiken-fur-prinzip-5) ausgeführt.*

### II. Kennen Sie Ihre Zuverlässigkeitsgrenzen

#### 6. Seien Sie sich der der Aufgabe innewohnenden Komplexität bewusst

Manche Aufgaben erfordern grundlegend eine bestimmte Anzahl an Schritten, ein gewisses Gedächtnis oder das Durchqueren einer gewissen Menge an Information. Ob mit KI oder ohne, sie lassen sich ohne diese Ressourcen nicht zuverlässig erledigen. Das sind keine Schwächen der KI, sondern Eigenschaften des Problems: Was Sie Zwischenschritte kosten würde, kostet die KI wie jedes System der Welt dasselbe. Mit anderen Worten, die KI wird niemals zaubern: keine Geschäftsergebnisse ohne den Aufwand, der sie hervorbringt, keine Revolution in allen Bereichen ohne die Ressourcen, die sie verlangt. Im besten Fall erleichtert oder verlagert die KI den Aufwand; sie beseitigt ihn nicht.

Warum diese Grenzen vom Problem herrühren und nicht von der KI, bis hin zur Church-Turing-These: siehe [Warum BASE](co-penser-avec-lia.md), Abschnitt «Die Grenzen der Aufgabe, die KI teilt sie».

Beispiele: Informationen über mehrere Dokumente hinweg extrahieren, die Kohärenz zwischen Quellen prüfen, Gemeinsamkeiten über grosse Mengen hinweg zusammenfassen.

*Fragen Sie sich: Wenn ich das tun müsste, müsste ich dann viele Dokumente durchgehen? Innehalten, um nachzudenken? Notizen machen? Einem genauen Prozess folgen? Falls ja, kann die KI die Antwort nicht einfach in einem Zug «erraten». Auch sie braucht Ressourcen (Zeit und/oder Kontextkapazität).*

Deshalb nutzt BASE **strukturierte Workflows**: Sie zerlegen komplexe Aufgaben in handhabbare Schritte, mit regelmässigen Kontrollpunkten.

#### 7. Wenden Sie sich an dedizierte Algorithmen, um Garantien zu erhalten

Ihrer Natur nach können Sprachmodelle keine strikten Garantien liefern. Wenden Sie sich dafür an spezifische Algorithmen (Prüfer, Werkzeuge, Fehlerkorrekturprozesse).

Beispiele: Konformitätsprüfer, Dokumentenanalysatoren, Code-Prüfer, Mehrwertsteuerrechner.

*Fragen Sie sich: Wie ist mein Verhältnis von Risiko und Nutzen? Für welche Elemente brauche ich externe Prüfer?*

### III. Wissen Sie, wie man interagiert

#### 8. Behandeln Sie die Kommunikation zwischen Mensch und KI als eigenständige Kompetenz

Der perfekte Prompt in einem Zug löst nicht viel. Was zählt, ist eine hochwertige und strukturierte Kommunikation über mehrere Schritte, indem man einen «sechsten Sinn» dafür entwickelt, was in den Antworten der KI nicht dem entspricht, was ein menschliches Gegenüber hervorbringen würde.

*Fragen Sie sich: Wie reagiert die KI auf unterschiedliche Formulierungen? Wie oft muss ich eingreifen, um mein Projekt auf Kurs zu halten?*

#### 9. Liefern Sie das Wissen, das am meisten zählt

Lassen Sie die KI nicht ihr eigenes Gedächtnis füllen, gestützt allein auf vage Heuristiken und oberflächliche Recherchen. Von Ihrer Welt findet das Modell nur wieder, was Sie auffindbar gemacht haben, in der Körnung, in der Sie es abgelegt haben. Strukturieren Sie Ihr Wissen und verweisen Sie auf das Nötige, sobald Sie können. Und in der richtigen Maschenweite: Stücke fein genug, dass man das richtige bezeichnet, ohne den Rest mitzuschleppen, gross genug, dass sie ihren Sinn behalten.

Beispiele: Verweisen Sie auf extrahierte Anforderungen statt auf einen Stapel Sitzungsprotokolle, auf Designentscheidungen statt auf verstreute Dokumentation, auf eine gezielte Aufgabenliste statt auf die Gesamtheit Ihrer Dateien.

*Fragen Sie sich: Wie strukturiere ich die Information so, dass ich immer das zur Hand habe, was ich brauche, selbst wenn ich die Arbeit in zwei Monaten wieder aufnehme?*

Genau das tun die **Fachdateien** in BASE: Ihre Identität, Ihre Tätigkeit, Ihr Katalog, Ihre Bedingungen, strukturiert und stets aktuell.

#### 10. Formen Sie die Funktionsweise der KI

Die Schritte, denen Ihre KI standardmässig folgt, passen Ihnen nicht? Ihr Verhalten gefällt Ihnen nicht? Formen Sie sie. Geben Sie genau an, was zu tun ist, wann, mit welchen Informationen oder welchen Werkzeugen.

Genau das ist die Rolle der **AGENT.md** und der **Skills** in BASE: Sie formen das Verhalten der KI, damit es zu Ihrem Fach passt.

### IV. Vermeiden Sie gängige Fallen

#### 11. Tappen Sie nicht in die Falle der Bequemlichkeit

Eine KI zu befragen ist leicht; hochwertige Ergebnisse zu erhalten ist oft anspruchsvoll. Denken Sie nach, strukturieren Sie. Bleiben Sie Herr des Prozesses.

Beispiele: ungeprüfte Entwürfe, aus dem Stegreif erteilter Rechtsrat, unkontrollierte Finanzprognosen.

*Fragen Sie sich: Ist es besser, etwas schnell zu bekommen und später mit Korrekturen und Undurchsichtigkeit zu bezahlen, oder zu strukturieren, um Erfolg und Transparenz zu sichern?*

#### 12. Tappen Sie nicht in die Falle des Scheins

Die von der KI erzeugten Ergebnisse haben meistens ein gepflegtes Aussehen, aber das bedeutet nicht, dass sie korrekt sind. Die Qualität des Schreibens garantiert weder die Richtigkeit der Fakten noch die Stichhaltigkeit der Empfehlungen.

Beispiele: eine plausible, aber falsche Diagnose, eine scheinbar solide Finanzanalyse, ein professioneller Vertrag mit Fehlern, ein gut formatierter Kostenvoranschlag mit erfundenen Preisen.

Jede ohne Prüfung akzeptierte Behauptung erzeugt eine **Überprüfungsschuld**: ungetestete Annahmen, die sich anhäufen und beim ersten kritischen Blick eines Kunden oder Partners zusammenbrechen können.

#### 13. Tappen Sie nicht in die Falle des Medienrummels

Anbieter machen oft beeindruckende Versprechen, die verzerren, was KI tatsächlich leistet. Lernen Sie, sie zu entschlüsseln:

- *«Unser Modell halluziniert nicht»*: Sprachmodelle erzeugen plausiblen Text ohne internen Mechanismus zur faktischen Überprüfung. Eine Überprüfung ist immer erforderlich.
- *«Unser Modell ist auf Ihren Daten trainiert»*: Ein Modell von Grund auf zu trainieren kostet Millionen. «Auf Ihren Daten trainiert» bedeutet in der Regel ein Feintuning (Fine-Tuning), das das Verhalten des Modells anpasst, aber das grundlegende Halluzinationsrisiko nicht beseitigt.
- *«Unser Modell ist vollkommen sicher»*: Die Prompt-Injektion (das Verhalten des Modells durch unerwünschte Anweisungen zu beeinflussen) ist eine strukturelle Verwundbarkeit dieser Systeme. Eine Sicherung ausserhalb des Modells ist immer nötig.

*Fragen Sie sich: Spiegelt diese Behauptung die tatsächliche Funktionsweise von Sprachmodellen wider? Verspricht sie etwas, das die Technologie grundlegend nicht liefern kann?*

### V. Die Methode vor den Werkzeugen

#### 14. Lassen Sie nicht das Werkzeug den Prozess diktieren

Die meisten KI-Produkte sind nicht darauf ausgelegt, Ihnen zu helfen, die Prinzipien 1 bis 13 einzuhalten. Widerstehen Sie dem aktiv. Nutzen Sie die Werkzeuge, die Ihrer Methode dienen. Gestalten Sie Werkzeuge, die die Messlatte höher legen.

BASE ist um dieses Prinzip herum gebaut: Ihre Skills, Templates und Fachdaten sind Ihr wahres Kapital. Sie kodieren Ihr Know-how, Ihre Expertise, Ihre Prozesse, und sie sind von einem Werkzeug zum anderen portabel. Werkzeuge ändern sich schnell. Eine gut organisierte Wissensstruktur dient Ihnen über Jahre.

Ein Sonderfall verdient es, benannt zu werden: **die Grammatik der Agenten.** Viele Werkzeuge laden Sie ein, Ihre Arbeit im Voraus in «Agenten», Rollen und Übergaben zu zerschneiden, in ihrer Oberfläche. Doch das Wesentliche der Arbeit besteht darin, dem Faden des eigenen Denkens zu folgen, fliessend, nicht darin, ihn im Voraus in Agenten zu gliedern. Die Freiheit zu bewahren, jeden beliebigen Prozess zu denken, einschliesslich eines schlichten Gesprächs über die richtigen Dateien, gehört zu «das Werkzeug nicht den Prozess diktieren lassen». *(BASE verwendet das Wort «Agent», um auf diesen Werkzeugen, die es kennen, ausführbar zu bleiben, aber ein BASE-Agent ist nur Ihr Markdown, lesbar und optional. Siehe [Warum BASE: mit der KI mitdenken](co-penser-avec-lia.md).)*

### VI. Behalten Sie die Kontrolle über die Zeit hinweg

Die vorangehenden Prinzipien helfen Ihnen, mit KI hier und jetzt gut zu produzieren. Die beiden folgenden schützen etwas, das langsamer zu verlieren und schwerer wieder aufzubauen ist: Ihre Fähigkeit, über die Monate hinweg am Steuer zu bleiben.

#### 15. Bewahren Sie genügend Intuition, um zu überprüfen

Sie können die Feinkörnigkeit an die KI delegieren, aber Sie können nicht die Fähigkeit delegieren, zu beurteilen, was sie hervorbringt. Die Überprüfung (Prinzip 4) setzt voraus, dass Sie noch verstehen, was Sie überprüfen. Durch fortgesetztes Delegieren verliert man nach und nach die feine Intuition der Arbeit, und die Überprüfung verkommt dann zu einer Schein-Validierung, ohne dass man es merkt, weil das Ergebnis «korrekt aussieht» (Prinzip 12).

Bewahren Sie also jederzeit genug Intuition, um ein fähiger Prüfer zu bleiben. Sie dürfen Details verlieren; Sie dürfen den Griff nicht verlieren. Das kann verlangen, bewusst Zeit zu investieren, um den Gesamtüberblick im eigenen Kopf wieder aufzuladen: in die Tiefe lesen, im Team besprechen, was hervorgebracht wurde und warum, von Zeit zu Zeit selbst ein Stück der Arbeit nachmachen.

*Fragen Sie sich: Würde ich, wenn die KI morgen verschwände, noch genug von dem verstehen, was sie hervorgebracht hat, um es vor einem Kunden zu verteidigen? Ist meine Intuition noch auf der Höhe dessen, was ich unterschreibe?*

**Eine Spannung, die man kennen sollte.** BASE versucht, die Überprüfung *leicht* zu machen (starke Struktur im Vorfeld → leichte Überprüfung im Nachgang). Das ist ein Vorteil, aber ins Extrem getrieben ist es auch der Mechanismus, durch den man sich von der Materie entfernt. Die Struktur soll die Überprüfung erleichtern, sie niemals ihres Sinns berauben.

#### 16. Bewahren Sie die Souveränität über Ihr Dispositiv

Mit KI zu arbeiten heisst, ein Dispositiv aus mehreren Schichten zu betreiben: Ihre Dateien, die Sie beherrschen, und die vom Werkzeug eingespeisten Anweisungen (System-Prompt, Regeln, Richtlinien des Anbieters), die Sie nicht immer sehen. Die Souveränität zu verlieren heisst, eine KI zu betreiben, die von externen Anweisungen geformt ist, ohne Transparenz darüber, was Ihre Interaktion tatsächlich strukturiert.

BASE macht Sie souverän über *Ihre* Schicht: Ihre AGENT.md, Skills und Daten sind lesbar, portabel und gehören Ihnen (Prinzip 14). Bleiben Sie klarsichtig gegenüber den Schichten, die Sie nicht schreiben: Verlangen Sie Transparenz über das, was das Werkzeug einspeist, bevorzugen Sie auditierbare Dispositive und bewahren Sie Ihr Wissen in Dateien, die Sie woanders hin mitnehmen können. Die Portabilität bedingt Ihre Souveränität: Sie lässt Sie an dem Tag gehen, an dem das Werkzeug Ihnen nicht mehr passt.

*Fragen Sie sich: Weiss ich, was in diesem Dispositiv das Verhalten der KI lenkt? Wenn das Werkzeug morgen seine unsichtbaren Regeln änderte, würde ich es wissen, und könnte ich gehen?*

---

## Die Schleife des Mitdenkens

Effizient mit KI zu arbeiten folgt meistens demselben Zyklus:


```
    ┌──────────────┐
    │  1. CADRER   │  Formuler clairement ce que vous voulez,
    │              │  avec le contexte nécessaire
    └──────┬───────┘  (principes 1, 2, 5, 9, 10)
           │
    ┌──────▼───────┐
    │  2. CONFIER  │  L'IA génère dans le cadre défini,
    │              │  jusqu'au prochain point de contrôle
    └──────┬───────┘  (principes 3, 6)
           │
    ┌──────▼───────┐
    │  3. ÉVALUER  │  Vous vérifiez : est-ce correct ?
    │              │  Est-ce que ça correspond à ma réalité ?
    └──────┬───────┘  (principes 4, 7, 8, 11, 12)
           │
    ┌──────▼───────┐
    │  4. AJUSTER  │  Vous précisez, corrigez, enrichissez
    │              │  → retour à l'étape 2
    └──────────────┘
```

**Das Schlüsselprinzip:** starke Struktur im Vorfeld → leichte Überprüfung im Nachgang. Schwache Struktur im Vorfeld → explosive Überprüfungsschuld.

Die Prinzipien 15 und 16 hängen nicht an einer bestimmten Phase der Schleife. Sie schützen Ihre Fähigkeit, sie über die Zeit hinweg zu halten: genug Intuition zu bewahren, damit der Schritt *Bewerten* real bleibt, und die Souveränität über das Dispositiv zu bewahren, das die ganze Schleife ausführt.

---

## Zusammengefasst

| # | Prinzip | In einem Satz |
|---|----------|---------------|
| | **I. Tragen Sie Ihre Verantwortung** | |
| 1 | Seien Sie selbst da, wo es wesentlich ist | Ihre Stimme, Ihre Vision, Ihre Werte sind unersetzlich |
| 2 | Seien Sie Mensch da, wo es wesentlich ist | Empathie und moralische Intuition verlangen menschliche Erfahrung |
| 3 | Nutzen Sie KI effizient | Strukturieren Sie Ihre Anfragen, verschwenden Sie keine Ressourcen |
| 4 | Überprüfen Sie gegen die Realität | KI stellt Hypothesen auf, nur Sie können in der realen Welt testen |
| 5 | Wägen Sie Risiken, Kosten und Alternativen ab | KI ist nicht immer die richtige Wahl |
| | **II. Kennen Sie Ihre Grenzen** | |
| 6 | Der Aufgabe innewohnende Komplexität | Komplexe Aufgabe = nötige Ressourcen, keine einzelne Anfrage |
| 7 | Dedizierte Algorithmen für Garantien | Sprachmodelle können die Richtigkeit nicht garantieren |
| | **III. Wissen Sie zu interagieren** | |
| 8 | Kommunikation als Kompetenz | Den einen perfekten Prompt gibt es nicht, iterieren Sie |
| 9 | Das Wissen liefern, das zählt | In der richtigen Körnung strukturieren und verweisen, die KI nicht raten lassen |
| 10 | Die Funktionsweise formen | Definieren Sie den Prozess, das Verhalten, die Schritte |
| | **IV. Vermeiden Sie die Fallen** | |
| 11 | Falle der Bequemlichkeit | Fragen ist leicht, ein gutes Ergebnis zu erhalten ist anspruchsvoll |
| 12 | Falle des Scheins | Flüssiger Text ist nicht gleich korrekter Text |
| 13 | Falle des Medienrummels | Entschlüsseln Sie die Marketingversprechen |
| | **V. Die Methode vor den Werkzeugen** | |
| 14 | Das Werkzeug diktiert nicht den Prozess | Ihre Wissensstruktur ist Ihr wahres Kapital |
| | **VI. Behalten Sie die Kontrolle über die Zeit hinweg** | |
| 15 | Bewahren Sie genügend Intuition, um zu überprüfen | Delegieren Sie die Feinkörnigkeit, niemals die Fähigkeit zu beurteilen |
| 16 | Bewahren Sie die Souveränität über Ihr Dispositiv | Wissen Sie, was die KI formt; bewahren Sie sich einen Ausweg |

---

## Entscheidungsleitfäden

Diese Leitfäden operationalisieren die obigen Prinzipien in konkreten Situationen.

### Leitfaden 1: «Ist KI die richtige Wahl?» (Prinzipien 1, 2, 5)

Vier Fragen, in dieser Reihenfolge:

1. **Erfordert diese Aufgabe das, was mich einzigartig macht?** (meine Stimme, mein Stil, meine Vision, meine Werte)
   → Falls ja: **tun Sie es selbst.** KI kann strukturieren, nicht Ihre Identität ersetzen. *(Prinzip 1)*

2. **Verlangt diese Aufgabe eine menschliche Erfahrung?** (Empathie, Intuition, moralisches Urteil)
   → Falls ja: **leiten Sie sie selbst.** KI kann vorbereiten, nicht fühlen. *(Prinzip 2)*

3. **Rechtfertigt der Nutzen die Risiken und Kosten?** (Vertraulichkeit, Zuverlässigkeit, Überprüfungszeit)
   → Falls nein: **nutzen Sie eine Alternative.** Eine Tabellenkalkulation, ein bestehendes Template, eine bewährte Methode. *(Prinzip 5)*

4. → Falls ja: **nutzen Sie KI mit Struktur.** Strukturieren Sie die Anfrage, liefern Sie das Wissen, überprüfen Sie das Ergebnis. *(Prinzipien 3, 6, 9, 10)*

### Leitfaden 2: «Wann iterieren vs. weitergehen» (Prinzipien 8, 11, 12)

Falls Sie die BASE-Marker in Ihren Dokumenten verwenden:

- **`[A VALIDER]` vorhanden** → iterieren. Ein Vorschlag wurde nicht bestätigt.
- **`[A COMPLETER]` vorhanden** → iterieren. Eine Information fehlt.
- **`[ATTENTION]` vorhanden** → das Risiko bewerten. Kann man trotz der Warnung weitergehen, oder muss man es behandeln?
- **Kein Marker, Ergebnis überprüft** → weitergehen. Die Arbeit ist vollständig.

Ohne Marker gilt dieselbe Logik: Gehen Sie weiter, wenn Sie gegen die Realität überprüft haben *(Prinzip 4)*, nicht wenn der Text «gut aussieht» *(Prinzip 12)*.

### Leitfaden 3: «Die Qualität eines Agenten bewerten» (Prinzip 10)

| Kriterium | Basis | Gut | Exzellent |
|---------|---------|-----|-----------|
| **Routing** | Der Agent versteht 1 bis 2 Absichten | Deckt alle gängigen Absichten ab | Behandelt mehrdeutige Absichten mit Rückfragen zur Klärung |
| **Workflows** | Schritte aufgelistet | Entscheidungspunkte vor jeder unumkehrbaren Aktion | Häufige Umformulierungen + seltene und präzise Entscheidungspunkte + Journal |
| **Wissen** | Generische Informationen | Präzise Zahlen, exakte Terminologie, aktualisierte Regeln | Regelmässig mit echten Fachdaten aktualisiert |
| **Daten** | Platzhalter überall | Identität und Bedingungen ausgefüllt | Katalog, Kunden und Verlauf aktuell |

---

## Anhang: wenn Ihre Praxis wächst

### Multi-Agenten

Falls Sie mehrere unterschiedliche Tätigkeiten haben, ist ein Agent pro Tätigkeit oft effizienter als ein Agent, der alles macht. Signal: Wenn ein Agent mehr als 5 Workflows hat, erwägen Sie, ihn aufzuteilen.

### Geteiltes Wissen

Die Standardkompetenzen (Kommunikation, Marker, Journal) sind über Agenten hinweg identisch. Anderes Wissen kann zwischen Agenten über relative Pfade geteilt werden (z. B. die Unternehmensinformationen).

### Arbeit im Team

Falls mehrere Personen denselben Agenten nutzen:
- Versionieren Sie die Dateien mit Git, um Änderungen sichtbar und besprechbar zu machen
- Teilen Sie die Workflows und das Wissen, die wirklich gemeinsam sein müssen
- Trennen Sie die Fachdaten, wenn Rollen, Kunden, Länder, Rechtsträger oder Sensibilitätsstufen es verlangen
- Das Journal erlaubt zu sehen, was andere Sitzungen hervorgebracht haben

Für eine grosse Organisation bleibt diese Ebene eine Arbeitskonvention. Sie muss durch die offiziellen Mechanismen für Zugriffsrechte, Klassifizierung, Audit, Aufbewahrung und Konformitätsprüfung ergänzt werden.

### Signale der Komplexität

- Mehr als 5 Workflows → teilen Sie den Agenten auf
- Mehr als 3 Agenten → erwägen Sie einen gemeinsamen Router
- Workflows, die mehr als 10 Schritte dauern → in Sub-Workflows zerlegen
- Wissen, das 200 Zeilen übersteigt → in Teilbereiche zerlegen

---

## Anpassung zwischen Modellen

KI-Modelle entwickeln sich schnell, und es gibt mehrere Familien davon. Ein Workflow, der mit einem perfekt funktioniert, kann mit einem anderen Anpassungen erfordern. Die Punkte, die am stärksten variieren:
- Die Kontextlänge (wie viele Dateien gleichzeitig ladbar sind)
- Die Neigung, Anweisungen zu folgen vs. zu improvisieren
- Die Qualität der Berechnungen und der Formatierung

**Faustregel:** Wenn das Ergebnis enttäuschend ist, liegt das Problem selten am Modell: Oft ist es der Workflow, der nicht strukturiert genug ist. Fügen Sie Dialogbeispiele hinzu, präzisieren Sie die erwarteten Formate, zerlegen Sie in kürzere Schritte.

---

## Anhang: gängige Praktiken für Prinzip 5

**Risiken, die der generativen KI innewohnen** (aus ihrer statistischen Natur herrührend):

- **Vertraulichkeit:** Die KI versteht das Konzept von privat vs. öffentlich, kann aber nicht wissen, was für Sie in Ihren Daten privat ist. Setzen Sie sensible Daten niemals unkontrollierten Systemen aus.
- **Verzerrung (Bias):** Die KI lernt Muster aus den Trainingsdaten. Prüfen Sie die Ergebnisse genau, insbesondere die, die Personen betreffen.
- **Geistiges Eigentum:** KI-Modelle können auf geschütztem Inhalt trainiert worden sein. Prüfen Sie die Lizenzen und Rechte, bevor Sie generierten Inhalt verbreiten.
- **Authentizität:** Das Ergebnis der KI ähnelt von der Konzeption her menschlichem Inhalt. Weisen Sie auf die Nutzung von KI hin, wenn Authentizität oder Nachvollziehbarkeit wichtig sind.
- **Datensouveränität:** Ihre Interaktionen können verwendet werden, um die Modelle zu trainieren. Prüfen Sie die Datenschutzrichtlinien und deaktivieren Sie bei Bedarf die Optionen zur Wiederverwendung.
- **Regulatorische Konformität:** Stellen Sie sicher, dass Ihre Nutzung die geltenden Vorschriften und die Richtlinien Ihrer Organisation einhält.

**Kosten** (direkt und indirekt):

- Energie, finanzielle Kosten, Zeit für die Gestaltung der Anweisungen und die Überprüfung, Qualitätsverlust, der Korrekturen erfordert, kognitive Abhängigkeit.

**Alternativen** (oft zuverlässiger oder effizienter):

- Deterministische Algorithmen für Suche, Berechnung, Überprüfung.
- Spezialisierte Werkzeuge, die für die Aufgabe konzipiert sind.
- Etablierte Methoden (Checklisten, Vorlagen, Prozesse).
- Menschliche Expertise allein, wenn das genügt.

---

## Um weiterzugehen

- **Den Ansatz verstehen**: [BASE verstehen und die Interaktion mit der KI formen](comprendre.md), Anatomie eines Agenten, warum es funktioniert, Portabilität.
- **In einer Organisation verbreiten**: [Die Einführung in einer Organisation](adoption-organisation.md), wie aus einer individuellen Praxis ein Team- und dann ein institutioneller Gebrauch wird.
- **In der Praxis starten**: das [Tutorial «Lernen durch Tun»](../tutoriel/index.md), Schritt für Schritt.
- **Ideengalerie**: [idees-agents.md](../guides/idees-agents.md), Dutzende Beispiele von Agenten nach Beruf.
- **Ihren eigenen Assistenten erstellen**: Öffnen Sie den Ordner eines Assistenten in einem KI-Werkzeug, das Ihre Dateien lesen kann, und sagen Sie «Ich möchte einen Assistenten für [Ihr Fach] erstellen».

---

*Angepasst aus den [Prinzipien des Mensch-KI-Mitdenkens](https://a-i.swiss) von AI Swiss.*

BASE ist ein Framework von [AI Swiss](https://a-i.swiss). Anwendungsfälle in Partnerschaft mit [Innovaud](https://innovaud.ch).
