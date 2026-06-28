<!-- fr-synced: a2ceba8213fa64543dce6cda779153a8cb7c5f05 -->

# BASE in Aktion sehen

Bevor Sie einer KI einen echten Fall anvertrauen, wollen Sie wissen, ob Sie ihr vertrauen koennen. Diese Demo zeigt es in weniger als einer Minute: ein BASE-Assistent, der sich auf Ihre Dateien stuetzt, die Regel benennt, die ihn rechtfertigt, und ein `[A VALIDER]` setzt, statt allein zu entscheiden, dort wo ein generischer Chat dazu neigen wuerde zu improvisieren. Dann liegt es an Ihnen zu beurteilen, ob diese Ehrlichkeit fuer Ihre Arbeit einen Unterschied macht.

Diese Demo verwendet `exemples/assistant-devis-demo/`, bereits gefuellt mit einem fiktiven Unternehmen, einem Dienstleistungskatalog, einem Kunden und einer Offerte.

Sie haben das Repository noch nicht zur Hand? [Ausprobieren, ohne etwas zu installieren](essayer-sans-installer.md) zeigt die einfachsten Wege, den Ordner zu beziehen und ihn Ihrer KI zu uebergeben, von der leichtesten bis zur vollstaendigsten Option.

## 1. Oeffnen Sie die Demo

In einem KI-Werkzeug, das Ihre Dateien lesen kann (zum Beispiel GitHub Copilot, Antigravity, Claude Code oder Cowork, OpenCode, Kilo Code), oeffnen Sie den Ordner (diesen Ordner, nicht die Wurzel des Repositorys):

```text
exemples/assistant-devis-demo/
```

## 2. Stellen Sie eine Frage, die eine Pruefung verlangt

Schreiben Sie in den Chat:

```text
Dupont SA a-t-il droit à la remise fidélité?
```

Das ist eine Fangfrage. Das Kundenblatt von Dupont SA gibt «Client (1er mandat)» an, waehrend die Treueregel zwei Mandate verlangt. Ein generischer Chat, der weder Ihren Kunden noch Ihre Regeln kennt, koennte eine plausible Antwort erfinden.

## 3. Lesen Sie die Antwort

Der Assistent soll zwei Ihrer Dateien lesen und in diesem Sinne antworten:

> Gemaess `catalogue/regles-tarification.md` gilt der Treuerabatt (-5%) fuer Kunden, die bereits zwei Mandate unterzeichnet haben. Das Blatt `clients/dupont-sa.md` gibt «Client (1er mandat)» an. Dupont SA hat also noch keinen Anspruch darauf. **[A VALIDER]** bestaetigen Sie den Status des Kunden, bevor Sie einen Rabatt anwenden.

Drei Dinge sind soeben geschehen. Der Assistent hat Ihre Dateien gelesen, statt zu raten. Er hat Ihnen die Wahrheit gesagt, auch eine enttaeuschende, statt eines gefaelligen «Ja». Und schliesslich hat er Ihnen die Entscheidung mit einem durchsuchbaren Marker zurueckgegeben.

## Was Sie soeben gesehen haben

- **Er liest Ihre Realitaet.** Die Antwort zitiert `regles-tarification.md` und `dupont-sa.md`, Ihre Dateien, nicht ein generisches Gedaechtnis.
- **Er schmeichelt nicht.** Wenn die ehrliche Antwort «nein» lautet, sagt er «nein» und zeigt die Regel, die es rechtfertigt.
- **Er haelt im richtigen Moment an.** Das `[A VALIDER]` ueberlaesst Ihnen die Entscheidung und bleibt mit einer einzigen Suche auffindbar, selbst in sechs Monaten.
- **Er beweist, statt zu versprechen.** Bei einer Offerte sind die Betraege nicht «ungefaehr»: das Werkzeug `calculer-devis` berechnet die MwSt und die Summen deterministisch neu, und der Assistent meldet eine Abweichung, statt sie zu behaupten.
- **Nichts hat sich bewegt.** Keine Datei geschrieben, nichts von BASE versendet (Ihr KI-Werkzeug seinerseits verarbeitet die Konversation gemaess seinen eigenen Bedingungen). Sie behalten die Kontrolle.

## Die zweite Runde: was ein generischer Chat nicht kann

Die erste Runde zeigte die Ehrlichkeit. Die zweite zeigt eine Garantie, die der gute Wille eines Modells nicht bietet. Markieren Sie eine Ressource als `confidential` (zum Beispiel ein Rabattraster) und lassen Sie den Assistenten **ueber den Broker** arbeiten (MCP-Server oder Studio-Chat): wenn er ein entferntes Modell aufrufen muss, **prueft BASE vor dem Versand** und haelt diese Ressource zurueck. Sie geht nicht hinaus. Das ist keine Anweisung, die das Modell vergessen koennte, es ist ein **Mechanismus**, verifiziert durch getesteten Code (`tools/core/egress.mjs`, `tests/base-egress.test.mjs`).

Die Reichweite ist genau: dieses Zurueckhalten wirkt **ueber den Broker** (MCP, Studio, Evaluation); als direkter Editor-Agent ist dieselbe Eingrenzung nur eine Anweisung. Das Beispiel `exemples/agence-multi-clients/` zeigt den Massstab: eine Agentur, mehrere Kunden, jeder Assistent auf seine Wurzel eingegrenzt, das vertrauliche Raster wird zur Preisfestlegung konsultiert, ohne je in das Angebot kopiert zu werden.

## Weitergehen

- **Ein fertiges Dokument ansehen:** fragen Sie «Zeig mir die Offerte DEV-2026-001». Sie existiert bereits in `devis/DEV-2026-001.md`.
- **Ihre eigene erstellen:** kopieren Sie `exemples/assistant-devis/`, und sagen Sie dann «Hallo, ich moechte meine Taetigkeit einrichten». Diese Version startet leer und fuehrt Sie.
- **Wissen, was als Naechstes zu lesen ist:** folgen Sie [Wo anfangen](lire-dans-quel-ordre.md).
