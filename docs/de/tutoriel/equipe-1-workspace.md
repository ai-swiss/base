<!-- fr-synced: 9d7aed17a4ae32c71898e8b2e3eaf9dde82e5ee2 -->

# Der Workspace mit mehreren Perimetern

*⏱ ~15 Min · Modul 1/3, Parcours Team*

**Sie werden**: durch einen Workspace mit zwei Roots navigieren und verstehen, dass ein Root ein Schreibperimeter ist, bewiesen durch das ✅ weiter unten.
**Sie benötigen**: Node 18+ und das Repository; ein Terminal im Stammverzeichnis.

1. Starten Sie das Studio auf dem Beispiel-Workspace:
   `base studio --root exemples/agence-multi-clients`.
2. Der Baum zeigt zwei Roots (Dupont, Martin), jeweils mit dem Badge `⌂`.
3. Suchen Sie nach `tarif` aus dem Workspace-Header heraus: Karten aus beiden Roots erscheinen,
   jede mit dem Badge ihres Roots.
4. Öffnen Sie eine Karte von Martin: Der Kontext wechselt auf den Root von Martin.

✅ **Prüfen Sie**: Eine Workspace-Suche liefert Karten aus BEIDEN Roots, jede über ihren Root identifiziert; das Öffnen einer Karte versetzt Sie in den Perimeter dieses Roots.

💡 **Warum es funktioniert hat**: Ein Workspace vereint mehrere unabhängige BASE. Ein Root = ein Schreibperimeter: Eine Bearbeitung in Martin kann Dupont nicht berühren. Das ist die Trennwand, die den Multi-Client-Betrieb sicher macht.

🔁 **Bei Ihnen**: Wie viele eigenständige Perimeter (Kunden, Teams, Projekte) hätte Ihre Organisation?

→ **Und jetzt**: [Modul 2: Perimeter und Egress](equipe-2-perimetres-et-egress.md).

🆘 **Häufige Pannen**: *Nur ein Root wird angezeigt*: Prüfen Sie `base.workspace.json` im Stammverzeichnis des geöffneten Ordners. *Die Suche fächert nicht auf*: Suchen Sie aus dem Workspace-Header heraus, nicht aus einem Root.
