<!-- fr-synced: 5c4b8bab645ea889e7d7dc3a07130e2165464668 -->

# BASE beziehen: Ihren Installationsweg wählen

Wie Sie BASE beziehen, entscheidet darüber, was Sie anschliessend damit machen können: einfach einen Assistenten ausprobieren, von Ihren eigenen Daten ausgehen oder Updates verfolgen und mitwirken. Die folgenden Punkte sind **unabhängige Optionen**, keine Schritte, die nacheinander auszuführen sind: Lesen Sie sie und wählen Sie dann diejenige, die zu Ihrem Bedarf passt. Um einfach einen Assistenten auszuprobieren, genügen das ZIP oder die Kopie eines Beispiels; der Git-Clone wird nützlich, wenn Sie Updates verfolgen oder mitwirken möchten.

> **Am schnellsten, und ohne Terminal auf Ihrer Seite:** Lassen Sie es Ihr KI-Tool erledigen. Fügen Sie einen einzigen Block in ein KI-Tool ein, das Ihre Dateien lesen kann (zum Beispiel GitHub Copilot, Antigravity, Claude Code oder Cowork, OpenCode, Kilo Code), und es installiert BASE, erstellt Ihren Arbeitsbereich und sagt Ihnen, wann alles bereit ist: siehe [BASE von Ihrer KI installieren lassen](installer-par-votre-ia.md).

## 1. Ohne irgendetwas zu installieren (nur Browser)

Wenn Sie die Methode einfach nur in ChatGPT oder Claude ausprobieren möchten, ohne technisches Werkzeug, folgen Sie [BASE ohne Installation ausprobieren](essayer-sans-installer.md). Das ist die Minimalstufe: Anweisungen, die vom Modell befolgt werden, ohne die mechanischen Garantien der nachfolgenden Stufen.

## 2. Das Repository als ZIP herunterladen (am einfachsten)

1. Öffnen Sie die Projektseite auf GitHub: `https://github.com/ai-swiss/base`.
2. Grüner Button **Code**, dann **Download ZIP**.
3. Entpacken Sie den Ordner.
4. Öffnen Sie einen **Beispielordner** (zum Beispiel `exemples/assistant-devis-demo/`) in einem KI-Tool, das Ihre Dateien lesen kann (zum Beispiel GitHub Copilot, Antigravity, Claude Code oder Cowork, OpenCode, Kilo Code), nicht die Wurzel des Repositorys.

Jedes Beispiel ist eigenständig: Es ist ein vollständiger Assistent, den Sie im KI-Tool öffnen, um Ihre Anfrage zu formulieren.

## 3. Ein einzelnes Beispiel kopieren

Sie brauchen nicht das gesamte Repository. Ein Ordner unter `exemples/` lässt sich beliebig kopieren und funktioniert für sich allein. Das ist der empfohlene Weg, um von Ihren eigenen Daten auszugehen: Kopieren Sie das Beispiel, das Ihrem Tätigkeitsbereich am nächsten kommt, benennen Sie es um, ersetzen Sie den Inhalt.

## 4. Mit Git klonen (um Updates zu verfolgen)

```bash
git clone https://github.com/ai-swiss/base.git
cd base
```

Anschliessend können Sie ein Beispiel in Ihrem KI-Tool öffnen oder die lokale CLI (Teamstufe) verwenden, die im [Installationshandbuch](installer.md) beschrieben ist. Die CLI benötigt für den Kern keine Abhängigkeiten (Node 18 oder höher genügt); siehe `README.md` für die Befehle.

## 5. Browser-Pack (eine einzige Datei zum Einfügen)

Für eine Person, die nur einen Browser hat, können Sie **eine einzige Markdown-Datei** vorbereiten, die einen Agenten und alle seine Skills bündelt, bereit zum Einfügen in ChatGPT oder Claude web. Aus dem Repository heraus (Node zum Generieren erforderlich, nicht zum Verwenden):

```bash
npm run browser-pack -- --root exemples/assistant-devis-demo --out assistant-devis.md
```

Teilen Sie `assistant-devis.md`: Die Person fügt es in ihre Unterhaltung ein und schreibt dann «Guten Tag, ich möchte meine Tätigkeit einrichten». Im Browsermodus befolgt das Modell lediglich diese Anweisungen: Es bietet nicht die mechanischen Garantien der CLI oder des MCP (siehe [BASE ohne Installation ausprobieren](essayer-sans-installer.md)).

## 6. npm-Distribution und Releases

Die Distribution über npm-Pakete (`@ai-swiss/base` und die optionalen Pakete) sowie über GitHub-**Releases**-Archive ist vorgesehen, sobald sich die öffentliche Oberfläche stabilisiert (siehe [Versionen und Stabilität](../reference/versions-et-stabilite.md)). In der Zwischenzeit sind das ZIP, die Beispielkopie und der Git-Clone oben die offiziellen Wege.

## Und danach?

- Erster Erfolg in 5 Minuten: [Schnelleinstieg](quickstart.md).
- Ihr Werkzeug anbinden (ein KI-Tool, das Ihre Dateien lesen kann, zum Beispiel GitHub Copilot, Antigravity, Claude Code oder Cowork, OpenCode, Kilo Code; oder ChatGPT, Claude und das MCP): [Ihr KI-Tool verbinden](../guides/connecter-votre-outil.md).
- Welcher Weg je nach Profil: [In welcher Reihenfolge lesen](lire-dans-quel-ordre.md).
- In einem Beispiel feststeckt: Bitten Sie um Hilfe. Mit der CLI, dem MCP oder einem Harness, das dem routing folgt, leitet BASE Sie mechanisch zum konfigurierten Empfang; im reinen Browsermodus ist es eine Anweisung, die vom Modell befolgt wird.
