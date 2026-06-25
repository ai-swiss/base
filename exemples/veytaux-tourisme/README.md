# Office du tourisme de Veytaux-les-Bains (projet jouet du tutoriel)

## Essayez en 30 secondes

1. Ouvrez **ce dossier** (pas la racine du dépôt) dans Claude Code ou Cursor.
2. Dites, mot pour mot: **«Quelles activités à faire cet après-midi?»**
3. Vous devriez voir ceci: l'assistant cherche dans l'agenda et les fiches infos, cite sa source et signale un événement périmé au lieu de l'annoncer. Rien n'est réservé ni envoyé sans vous.

Un assistant complet pour l'office du tourisme d'un hameau de montagne imaginaire, **Veytaux-les-Bains**, dont l'ambition dépasse largement la taille: un car postal, une webcam sur le parking et le rêve tranquille de devenir Saint-Moritz. Il sait deux choses et les fait bien: renseigner un visiteur, préparer une sortie de groupe. Il sert de fil rouge au tutoriel «Apprendre en faisant» de la documentation BASE, mais il fonctionne tel quel.

## Démarrer

1. Ouvrez **ce dossier** dans votre outil IA, pas la racine du dépôt.
2. Demandez «Quelles activités à faire cet après-midi?»: l'assistant répond depuis les fiches, en citant sa source.
3. Ou «Organiser une sortie pour notre groupe de 30 personnes»: il recueille les besoins, les chiffre au barème et prépare une offre.

## Ce qu'il contient

- **L'assistant** office-tourisme et deux process: renseigner un visiteur, réserver une sortie de groupe.
- **Les données**: les tarifs (`infos/tarifs.md`), l'agenda (`infos/agenda.md`, avec une date de validité passée, exprès, pour l'exercice doctor du tutoriel), les accès et horaires (`infos/acces-et-horaires.md`), les hébergeurs partenaires (`partenaires/hebergeurs.md`).
- **Un template** d'offre de sortie de groupe (Markdown + JSON).
- **Des scénarios d'évaluation** dans `.ai/experiments/scenarios/`.

## Le palier honnête

Ouvert tel quel, c'est le **modèle** qui route en suivant les consignes projetées. Pour le routage déterministe et les écritures validées, passez à la CLI ou au MCP: voir la documentation de démarrage de BASE («Faites installer BASE par votre IA»).

> Données et contenus illustratifs: Veytaux-les-Bains n'existe pas (encore).

---

BASE est un framework par [AI Swiss](https://a-i.swiss).

Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
