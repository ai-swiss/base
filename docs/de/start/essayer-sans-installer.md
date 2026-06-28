<!-- fr-synced: ca9a05b8a4f5f34ad21f5041f5993e7265ce8ec9 -->

# BASE ausprobieren, ohne etwas Neues zu installieren

Der schnellste Weg, BASE zu erfassen, besteht nicht darin, es zu installieren, sondern es zu lesen: [Warum BASE](../learn/co-penser-avec-lia.md) zeigt die Methode und ihre Tiefe in wenigen Minuten. Wenn Sie es in Aktion sehen möchten, bietet diese Seite zwei Möglichkeiten, einen echten Assistenten auszuprobieren, ohne auf der BASE-Seite etwas zu installieren. Sie brauchen nur ein KI-Werkzeug, nämlich jenes, das Sie ohnehin schon nutzen.

Beide gehen vom selben Beispielordner aus. Laden Sie das Repository mit einem Klick herunter, **[base-main.zip](https://github.com/ai-swiss/base/archive/refs/heads/main.zip)**, und entpacken Sie es danach (Windows: Rechtsklick auf die Datei, **Alle extrahieren**, ein Doppelklick genügt nicht; Mac: Doppelklick). Sie erhalten einen Ordner **`base-main`**; das zu öffnende Beispiel ist **`base-main/exemples/veytaux-tourisme`**, das Tourismusbüro von Veytaux, ein Spielprojekt.

## Am einfachsten: ein KI-Chat im Browser

Wenn Sie bereits einen KI-Assistenten in einem Browser haben (ChatGPT, Claude oder einen anderen), gibt es nichts zu installieren: Ein BASE-Assistent ist eine Sammlung von Textdateien, die Ihre Zusammenarbeit strukturiert (Know-how, Wissen, Daten), keine blosse Dokumentation, und die Sie ihm als Kontext geben.

1. Suchen Sie im Ordner `veytaux-tourisme` die Markdown-Dateien: die `AGENT.md` (unter `.ai/agents/...`) und jene in `skills/`.
2. Erstellen Sie in Ihrem Werkzeug einen Raum, der diese Dateien während des Gesprächs griffbereit hält (je nach Werkzeug: ein Projekt, ein angepasster Assistent, ein Arbeitsbereich).
3. Fügen Sie den Inhalt der `AGENT.md` in die Anweisungen ein und hängen Sie die übrigen Markdown-Dateien an.
4. Sprechen Sie mit ihm: «Guten Tag, ich möchte meine Tätigkeit einrichten.»

Das Einzige, was Sie wissen müssen: Ein Web-Chat durchsucht einen Ordner nicht von selbst, Sie geben ihm die Dateien einmalig. Das ist der zugänglichste Weg, um die Methode in Aktion zu sehen.

## Am vollständigsten: ein KI-Werkzeug, das den Ordner öffnet

Damit der Assistent von innen heraus arbeitet, indem er den ganzen Ordner liest und unter Ihrer Aufsicht handelt, brauchen Sie ein KI-Werkzeug, das einen Ordner öffnen und dessen Dateien lesen kann (zum Beispiel GitHub Copilot, Antigravity, Claude Code oder Cowork, OpenCode, Kilo Code; manche laufen in einem Fenster, andere im Terminal, wie [Claude Code](installer-claude-code.md)). Nehmen Sie jenes, mit dem Sie bereits vertraut sind.

1. Installieren Sie es von der offiziellen Website und melden Sie sich an; ein kostenloses Modell genügt zum Ausprobieren.
2. Öffnen Sie darin den Ordner **`base-main/exemples/veytaux-tourisme`** (oft *File → Open Folder*), im **Agent-Modus**, damit es die Dateien liest.
3. Fragen Sie «Welche Aktivitäten bieten Sie heute Nachmittag an?». Der Assistent folgt der in den Dateien beschriebenen Methode; fahren Sie mit dem [Schritt-für-Schritt-Tutorial](../tutoriel/index.md) fort.

> **Häufige Panne**: Wenn der Assistent Ihnen von «Routing» oder «BASE» statt von Veytaux erzählt, haben Sie das Stammverzeichnis `base-main` geöffnet, das das Framework ist. Öffnen Sie erneut den Unterordner `exemples/veytaux-tourisme`.

## Ihr eigener Ordner

Um von IHREN Daten auszugehen: Kopieren Sie `base-main/exemples/starter-perso` an einen beliebigen Ort (Ihre
Dokumente), benennen Sie ihn um und öffnen Sie DIESEN Ordner erneut in Ihrem Werkzeug. Oder bitten Sie Ihren Assistenten:
«Kopiere den Ordner starter-perso in meine Dokumente».

## Die ehrliche Grenze und der nächste Schritt

Hier ist es das **Modell**, das anhand von Vorgaben routet (`CLAUDE.md`,
`.cursor/rules/assistant.mdc`): praktisch, aber es kann über die Stränge schlagen. Für **mechanische
Garantien** (deterministisches Routing, validierte Schreibvorgänge, Eingrenzung) gehen Sie über
[den Brief an Ihre KI](installer-par-votre-ia.md) (5 Minuten), oder sehen Sie sich
[Installieren](installer.md) und [Sicherheit und Grenzen](../trust/securite-et-limites.md) an für die
Grenze zwischen *Vorgabe* (befolgt) und *Mechanismus* (erzwungen).
