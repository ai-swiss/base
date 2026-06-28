<!-- fr-synced: 4c69f0cae012026065cc9232a1c25c4064d8bc73 -->

# Verstehen, welche Sprache BASE wo verwendet

Wenn Sie sich fragen, warum die Dokumentation auf Französisch ist, während die Spezifikationen auf Englisch sind, erklärt Ihnen diese Seite das in einem Lesedurchgang. Sie richtet sich an alle, die das Projekt entdecken, dazu beitragen oder einen Assistenten bauen möchten: Sie sagt, welche Sprache was bestimmt, und warum Ihre eigenen Assistenten an keine dieser beiden Sprachen gebunden sind.

## Französisch für die Methode

Die öffentliche Dokumentation (`docs/`, [README](../../README.md), [Manifest](../../MANIFESTO.md)) ist auf Französisch. Es ist die Sprache der Methode: jene, in der BASE erklärt, warum man die Zusammenarbeit mit KI strukturieren sollte, wie man überprüft und wie man die Souveränität über seine Dateien behält. In einem mehrsprachigen Land macht es das Schreiben der Methode in einer Landessprache schlicht zugänglicher für ihre Leserschaft.

## Englisch für den technischen Vertrag

Die Engineering-Spezifikationen ([`specs/`](../../specs/current/README.md)) sind auf Englisch, der Sprache des technischen Vertrags. Die Anforderungen, die Invarianten und die Architekturentscheidungen sind dort mit dem Code und den Tests verknüpft, und ihre Zielgruppe sind die Mitwirkenden und die Maintainer, deren Arbeitssprache Englisch ist. Die Präzision eines Engineering-Vertrags leidet unter ungenauen Übersetzungen; eine einzige normative Fassung, auf Englisch, vermeidet Abweichungen.

## Ihre Assistenten sprechen die Sprache ihrer Nutzer

Die mit BASE gebauten Assistenten sind an keine bestimmte Sprache gebunden. Das standardmässige routing ist lexikalisch: Es vergleicht die normalisierten Wörter einer Anfrage mit denen Ihrer eigenen Dateien, ohne Grammatik oder Lexikon einer bestimmten Sprache. Ein Assistent, der mit deutschen, italienischen oder englischen keys deklariert ist, routet und antwortet in dieser Sprache. Die Sprache der Dokumentation des Frameworks gibt der Sprache Ihrer Assistenten nichts vor.

## Wer liest was

| Profil | Sprache | Einstiegspunkt |
| ------ | ------ | -------------- |
| Nutzer, Assistenten-Ersteller, Entscheidungsträger | Französisch | [README](../../README.md), [In welcher Reihenfolge lesen](../start/lire-dans-quel-ordre.md) |
| Compliance-Verantwortlicher, Institution | Französisch | [Souveränität, Vertrauen und Compliance](../trust/souverainete-et-confiance.md) |
| Entwickler, Integrator, technischer Auditor | Englisch | [Aktuelle Spezifikation](../../specs/current/README.md) |
| Mitwirkender am Framework | Beide | [CONTRIBUTING](../../CONTRIBUTING.md) |

## Übersetzungen

Bereits vorhanden: das [README auf Englisch](../../README.en.md) und das Manifest auf [Englisch](../../MANIFESTO.en.md), [Deutsch](../../MANIFESTO.de.md) und [Italienisch](../../MANIFESTO.it.md). Die übrigen Übersetzungen (ein `README.de.md`, ein Ordner pro Sprache) sind besonders willkommene Beiträge. Die Konvention ist in [CONTRIBUTING](../../CONTRIBUTING.md) beschrieben: die Schlichtheit des Originals bewahren, technische Bezeichner nicht übersetzen und am Anfang der Datei daran erinnern, dass **die französische Fassung massgebend ist**.

---

BASE ist ein Framework von [AI Swiss](https://a-i.swiss). Anwendungsfall in Partnerschaft mit [Innovaud](https://innovaud.ch).
