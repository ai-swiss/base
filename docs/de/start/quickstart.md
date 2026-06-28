<!-- fr-synced: 8b120a1e1b1bc8fddc875ade3d6a6eff6339136e -->

# Gestalten Sie Ihren ersten Assistenten

In wenigen Minuten verwandeln Sie eine Aufgabe, die Sie von Hand wiederholen, in einen Assistenten, der sie übernimmt, ohne Code zu schreiben und ohne die Kontrolle abzugeben: Er schlägt vor, Sie bestätigen. Konkret kopieren Sie ein Beispiel in ein KI-Werkzeug, das Ihre Dateien lesen kann (zum Beispiel GitHub Copilot, Antigravity, Claude Code oder Cowork, OpenCode, Kilo Code), Sie sagen, was Sie tun möchten, und der Assistent erledigt den Rest.

> **Noch kein Repository?** Lesen Sie [BASE beziehen](obtenir-base.md), um zwischen ZIP, Git-Clone, Beispielkopie oder Browser-Paket zu wählen.
>
> **Noch kein Werkzeug installiert?** Lesen Sie die [Installationsanleitung](installer.md), um ein KI-Werkzeug einzurichten, das Ihre Dateien lesen kann (zum Beispiel GitHub Copilot, Antigravity, Claude Code oder Cowork, OpenCode, Kilo Code).
>
> **Sie haben nur einen Browser (ChatGPT, Claude)?** Sie müssen nichts installieren, um zu beginnen: Folgen Sie [BASE ausprobieren, ohne etwas zu installieren](essayer-sans-installer.md).

Sie können diesen Einstieg auf drei Arten nutzen:

- für Ihr Privatleben, indem Sie ein Beispiel kopieren und an Ihre eigenen Aufgaben anpassen;
- für ein Start-up oder ein KMU, indem Sie einen nützlichen Workflow stabilisieren, bevor Sie ihn erweitern;
- für eine grössere Organisation, als lokale Demonstration, bevor Sie die nötigen internen Kontrollen hinzufügen.

---

## 1. Kopieren

Kopieren Sie den Ordner `exemples/assistant-devis/` in Ihren Arbeitsbereich (zum Beispiel auf Ihren Desktop oder in Ihre Dokumente).

> **Zuerst nur das Ergebnis sehen?** Öffnen Sie stattdessen `exemples/assistant-devis-demo/` (bereits mit einem fiktiven Unternehmen gefüllt) und fragen Sie «Hat die Dupont SA Anspruch auf den Treuerabatt?». Der Assistent sollte sich auf Ihre Dateien stützen, die Regel benennen und ein `[A VALIDER]` setzen. Der genaue Ablauf steht in [BASE in Aktion sehen](demo-60-secondes.md).

## 2. Öffnen

| Werkzeug | Vorgehen |
|-------|---------|
| **Cursor** | Datei → Ordner öffnen → wählen Sie den kopierten Ordner |
| **Claude Code** | Starten Sie `claude` im kopierten Ordner |
| **ChatGPT** | Richten Sie den [MCP-Server](installer-mcp.md) ein → laden Sie den Agenten → formulieren Sie eine konkrete Anfrage |

> **Sie bevorzugen eine visuelle Werkstatt?** Studio ist optional: Starten Sie `npm run studio`, um die Werkstatt zu öffnen und Ihre Dateien, Ihre Agenten und deren Prozesse auf einen Blick zu sehen. Ihr KI-Werkzeug bleibt die tägliche Erfahrung; Studio dient als Werkstatt.

## 3. Sagen Sie, was Sie tun möchten

Zum Beispiel: «Guten Tag, ich möchte meine Tätigkeit einrichten». Der Assistent führt Sie durch die Einrichtung Ihrer Tätigkeit oder Ihres Unternehmens: Name, Leistungen, Preise, Bedingungen. Beantworten Sie seine Fragen; er schlägt die zu erstellenden oder zu ändernden Dateien vor, und dann bestätigen Sie die wichtigen Entscheidungen.

## 4. Erstellen Sie Ihre erste Offerte

> «Ich habe einen Kunden, die Dupont SA, der mich um 3 Tage Strategieberatung bittet.»

Der Assistent formuliert die Anfrage neu, beziffert sie und schlägt Ihnen die Offerte vor. Sie bestätigen, er erzeugt die Dateien.

## Sie bestätigen, der Assistent schreibt danach

Zwei Anhaltspunkte machen diese Kontrolle sichtbar:

- **`[A VALIDER]`**: Wenn der Assistent etwas vorschlägt, das noch nicht bestätigt ist (ein Preis, eine Offerte), markiert er es mit `[A VALIDER]`. Diese Markierung ist ein Anhaltspunkt, den Sie auf einen Blick wiederfinden, für Sie wie für Ihre Werkzeuge. Solange sie vorhanden ist, ist nichts festgelegt: Es liegt an Ihnen, zu bestätigen.
- **Das Schreiben geschieht in zwei Schritten**: Bei Aktionen, die über BASE laufen (`base propose`, dann `base commit`, oder das Äquivalent auf der MCP-Seite), wird eine Änderung zuerst *vorgeschlagen* (ein Diff wird Ihnen gezeigt, nichts wird geschrieben) und erst nach Ihrer Bestätigung *angewendet*. Sie sehen, was sich ändern wird, bevor es sich ändert. Ausserhalb dieser Werkzeuge führt Sie der Assistent zwar, wendet diese Kontrolle aber nicht für Sie an.

Konkret: Sie bitten darum, eine Zeile zur Offerte hinzuzufügen. Der Assistent schreibt sie nicht sofort, er zeigt Ihnen die Zeile und das neue Total; Sie sagen «ja», und erst dann ändert sich die Datei. Sie sehen die Wirkung, bevor sie existiert.

Diese Kontrolle gilt auch für das, was Ihre Maschine verlässt: Eine als vertraulich markierte Ressource wird nicht an ein entferntes Modell übermittelt, und die Prüfung findet vor dem Aufruf statt. Detail: [Was hinausgehen kann und was BASE zurückhält](../trust/frontiere-local-vs-sortant.md).

**Um weiterzugehen:** Die [Praktiken des Mitdenkens](../learn/pratiques-co-pensee.md) zeigen anhand von Beispielen die wertvollsten Arten, mit der KI zu interagieren.

## 5. Und dann?

| Was Sie möchten | Was Sie sagen oder tun |
|--------------------|----------------------------|
| Eine weitere Offerte | «Neue Offerte für [Kunde]» |
| Kommunikation ausprobieren | Kopieren Sie `exemples/assistant-communication/`: LinkedIn-Posts, Newsletter |
| Briefe und E-Mails ausprobieren | Kopieren Sie `exemples/assistant-courrier/`: verfassen und antworten, im richtigen Register |
| Rekrutierung ausprobieren | Kopieren Sie `exemples/assistant-rh/`: Stellenausschreibungen, Gespräche |
| Projektmanagement ausprobieren | Kopieren Sie `exemples/assistant-projet/`: Planung, Meilensteine, Nachverfolgung |
| Sitzungsprotokolle ausprobieren | Kopieren Sie `exemples/assistant-reunion/`: Entscheidungen, Massnahmen, Nachverfolgung |
| Sehen, wie BASE eine Anfrage routet | Vom Wurzelverzeichnis des Repositorys: `node tools/base.mjs route-test --root exemples/routage-pme` |
| Ihr eigener Assistent | Öffnen Sie den Hauptordner des Projekts und sagen Sie «Lies `.ai/agents/createur-agent/AGENT.md`» |
| Finden, wo man anfängt | Dasselbe, und sagen Sie dann «Hilf mir herauszufinden, wo ich anfangen soll» |
| **Verloren oder eine Frage zu BASE?** | Sagen Sie im BASE-Repository oder in einem Projekt, in dem der Router aktiviert ist, «Ich bin verloren» oder «Hilfe»: Der Concierge empfängt Sie. Jedes Branchenbeispiel enthält nun einen Ersatz-Empfang, sodass «Ich bin verloren» Sie auch in einem kopierten Ordner orientiert. |
| Sich inspirieren lassen | Werfen Sie einen Blick in die [Ideengalerie](../guides/idees-agents.md) |

> **Zwei verschiedene Türen.** In einem Projekt mit Router öffnet «Hilfe / Ich bin verloren» den **Empfang** (Concierge): Er orientiert und beantwortet Fragen zu BASE. «Hilf mir herauszufinden, wo ich anfangen soll» öffnet die **Diagnose** des Assistenten-Erstellers: Sie ermittelt, *welchen Assistenten Sie bauen* sollen, für Ihre Tätigkeit.

---

**Erinnerung**: Die KI kann sich irren und Details erfinden. Lesen Sie eine Offerte immer noch einmal durch, bevor Sie sie versenden.

Für den persönlichen Gebrauch genügt dieser Leitfaden. Für ein Team fügen Sie `base.config.json`, `base validate`, `base entretien` und die Anhaltspunkte aus `docs/reference/framework-public.md` hinzu. `BASE_BOOTSTRAP.md` dient dazu, einen Router in ein KI-Werkzeug einzubinden; es bleibt ausserhalb des Geltungsbereichs der Team-Governance. Für eine grosse Organisation lesen Sie ausserdem `docs/reference/framework-public.md` vor jeder Bereitstellung.

Für ein KMU oder ein kleines Team fügen Sie das [Starter-Kit für Schweizer KMU](../audiences/kit-demarrage-pme-suisse.md) hinzu, bevor Sie einen Assistenten teilen: zulässige Daten, menschliche Validierung, Versionierung und monatlicher Unterhalt.

---

BASE ist ein Framework von [AI Swiss](https://a-i.swiss). Anwendungsfall in Partnerschaft mit [Innovaud](https://innovaud.ch).

## Ich habe bereits einen Ordner mit Notizen oder Abläufen

Man beginnt selten mit einem leeren Blatt. Zwei Türen, dasselbe Ergebnis:

- **CLI**: `base init --root mein-ordner` zeigt genau die Dateien, die erstellt würden
  (ein minimaler Agent oder eine Workspace-Datei, falls der Ordner bereits mehrere BASE enthält);
  `--yes` erstellt sie: niemals ein Überschreiben.
- **Studio**: Starten Sie die Werkstatt auf dem Ordner (`base studio --root mein-ordner`): Der Bildschirm
  Willkommen zeigt denselben Plan, in lesbarem Inhalt, und eine Schaltfläche «Diese Dateien erstellen».
  Die Anwendung wechselt anschliessend in den Normalmodus, ohne Neustart. Ihr KI-Werkzeug bleibt
  die tägliche Erfahrung; Studio dient als Werkstatt, und Ihre Dateien bleiben im Mittelpunkt, mit
  dem KI-Werkzeug Ihrer Wahl (zum Beispiel GitHub Copilot, Antigravity, Claude Code oder Cowork, OpenCode, Kilo Code).

Um Ihre Dokumente anschliessend in Prozesse und Kompetenzen umzuwandeln, bitten Sie Ihren Assistenten:
«meine bestehenden Abläufe importieren». Der Router schickt ihn zu `importer-l-existant`, das
jede Umwandlung als Diff vorschlägt. Dieser Router bleibt rudimentär, aber wirksam, und ist erweiterbar durch
Adapter. Er erspart Ihnen, selbst den richtigen Prozess zu suchen.
