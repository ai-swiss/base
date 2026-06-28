<!-- fr-synced: b5573293fe891c7be374cfce89c1445d5f99cfbc -->

# Die Anatomie eines Assistenten

*⏱ ~12 Min · Modul 1/9, Praktiker-Parcours*

**Sie werden**: ein use_when schreiben, das eine Anfrage an den richtigen Process leitet, bewiesen durch das ✅ weiter unten.
**Sie brauchen**: Node 18+ und das Repository (sonst [der Brief](../start/installer-par-votre-ia.md)), ein Terminal in `exemples/veytaux-tourisme`.

1. Öffnen Sie `.ai/agents/office-tourisme/AGENT.md`: die Identitätskarte des Assistenten (wer, wann).
2. Öffnen Sie `.ai/agents/office-tourisme/skills/processes/renseigner-un-visiteur/SKILL.md`: die Schritte,
   und vor allem das Feld `use_when` und `routing.examples`.
3. **Sagen Sie voraus**: Wohin sollte die Anfrage «Um wie viel Uhr ist geöffnet?» geleitet werden? Sagen Sie es laut.
4. Überprüfen Sie Ihre Vorhersage:

```routage-fixture
Quelles activités à faire cet après-midi ?
```

   (führen Sie `base route "Quelles activités à faire cet après-midi ?" --root .` aus)

✅ **Überprüfen Sie**: `base route` antwortet `routed`, Agent `office-tourisme`, Process `renseigner-un-visiteur`. Ihre Vorhersage bestätigt sich.

💡 **Warum es funktioniert hat**: Das `use_when` und die `routing.examples` sind das, was der Router liest. Ein gutes use_when beschreibt die ABSICHT («wenn ein Besucher wissen will, was er tun kann»), nicht den Titel. Vorherzusagen, bevor Sie es ausführen, macht die Überprüfung zu einem Test einer Hypothese: Genau dort verfestigt sich das Gelernte.

🔁 **Bei Ihnen zu Hause**: Schreiben Sie für EINE Ihrer Aufgaben deren use_when in einem Satz: «Wenn der Benutzer … will».

→ **Und jetzt**: [Modul 2: das Skelett des Büros](praticien-2-le-squelette.md): Sie bauen einen Process aus einem Skelett mit Lücken auf.

🆘 **Häufige Pannen**: *route antwortet out_of_scope*: Ihr Terminal ist nicht im richtigen Ordner (`--root .` aus `exemples/veytaux-tourisme`). *Sie finden die SKILL.md nicht*: Sie liegt unter `skills/processes/<name>/`.
