<!-- fr-synced: 73aa5063cc02dd7b4f51370e56c4f9e7fbf67133 -->

# Eine Dokumentationsseite aus Ihren kanonischen Dateien generieren und veröffentlichen

Die Dokumentation Ihres BASE einsehen oder veröffentlichen, ohne sie jemals anderswo zu kopieren: BASE generiert eine Seite, lokal oder öffentlich, direkt aus dem Repository. Die Markdown-, JSON- und Spec-Dateien bleiben die Quellen der Wahrheit, und die Seite ist nur eine interaktive Projektion davon (Navigation nach Abschnitten, Lernpfade, Explorer, Systemkarte, Routing-Labor, Qualität und Ressourcenseiten). Das dient allen, die eine navigierbare Sicht auf das Korpus möchten, ohne eine zweite Dokumentation zu pflegen, die mit der Zeit abdriftet.

Die Oberfläche der Seite ist zweisprachig, Französisch als Standard mit einem Umschalter zu Englisch. Die französische Version jeder Seite ist massgebend; siehe [Sprachen](langues.md). Der Inhalt behält die Sprache seiner Quelle, im Einklang mit den [Sprachen von BASE](langues.md). Die seitliche Navigation wird aus `navigation.json` generiert, der Navigationsprojektion des Dokumentationsmodells: keine Seitenliste wird von Hand gepflegt.

```mermaid
flowchart TD
    A[Kanonische Dateien (Markdown, JSON, Specs)] --> B[Dokumentationsmodell]
    B --> C[Interaktive Seite]
    C --> D[Lokal ansehen]
    C --> E[Interne statische Seite]
    C --> F[Gefilterte öffentliche Seite]
    B --> G[Validierung der Invarianten]
    G --> F
```

## Lokal ansehen

Vom Wurzelverzeichnis des Repositorys aus:

```bash
npm run docs:serve
```

Der Befehl generiert zuerst das Dokumentationsmodell und startet dann die Astro/Starlight-Seite lokal.

## Eine statische Seite erstellen

Um eine interne statische Seite zu erstellen:

```bash
npm run docs:build
```

Um eine öffentliche Seite zu erstellen, gefiltert auf die veröffentlichbaren Ressourcen:

```bash
npm run docs:build:public
```

Um den bereitstellbaren Ordner ausdrücklich zu wählen:

```bash
node tools/base.mjs docs build --public --out public-site
```

Der entstandene Ordner enthält eine statische Seite. Sie können sie mit den meisten Hostern bereitstellen, die statisches HTML unterstützen.

## Vor der Veröffentlichung validieren

```bash
node tools/base.mjs docs validate
```

Die Validierung prüft die Invarianten des Modells, insbesondere den Ausschluss von `.plans/` und `.temp/`, die Trennung von öffentlich und intern sowie die lokalen Links.

## Was die Seite zeigt

- die seitliche Navigation: die Abschnitte des Korpus (Einstieg, Verstehen, Anleitungen, Profile, Vertrauen, Beispiele, Referenz), aus dem Modell projiziert;
- die Ressourcenseiten: Darstellung der kanonischen Quellen, Inhalt zuerst, Metadaten und Rückverweise in einem einklappbaren Panel; die internen Links des Markdowns werden auf die Seiten der Website umgeschrieben;
- `Geführte Pfade`: Lesepfade nach Bedarf;
- `Konzepte`: visuelle Erklärung von route -> process -> validation -> écriture;
- `Geführte Beispiele`: schrittweiser Rundgang durch die kopierbaren Beispiele;
- `Explorer`: strukturiertes und filterbares Inventar der Ressourcen;
- `Systemkarte`: Familien und Beziehungen des Repositorys;
- `Routing-Labor`: Routing-Fixtures mit Anfragen und Erwartungen;
- `Belege`: Versprechen, verbunden mit Mechanismen, Tests und Grenzen;
- `Qualität`: Fehler, Warnungen und Einschlusspolitik;
- die Volltextsuche (Pagefind), erstellt beim statischen Build.

## Wartungsdisziplin

Schreiben Sie keine Prosa, die BASE beschreibt, direkt in die Seite. Legen Sie sie in die passende kanonische Datei und lassen Sie das Modell sie dann projizieren. Die Seiten der Website müssen Adapter bleiben, keine zweite Dokumentation.
