# Gouvernance

Ce document décrit qui décide quoi dans BASE, comment les décisions se prennent et comment la responsabilité s'élargit. Il obéit à la règle d'honnêteté qui vaut pour le reste du projet: décrire ce qui est, non ce qu'on aimerait montrer.

## État actuel, sans fard

BASE a été créé par **Charles-Edouard Bardyn** (Directeur Scientifique, VP et cofondateur d'[AI Swiss](https://a-i.swiss), association suisse indépendante à but non lucratif) et repose aujourd'hui sur un mainteneur principal. Le «bus factor» est donc de 1: c'est le premier risque pesant sur la pérennité du projet, et ce document existe pour en organiser la réduction. Deux garanties protègent déjà la continuité:

- **Tout est texte et tout est testé.** La spécification (`specs/`), la suite de tests et la checklist de publication (`specs/RELEASE.md`) rendent le projet reprenable par une personne compétente, sans aucune connaissance orale.
- **La licence est irrévocable.** Le code relève d'Apache-2.0, les contenus de CC BY 4.0: nul ne peut refermer ce qui est publié, et chacun reste libre de forker (créer sa propre copie indépendante du projet).

## L'intendance d'AI Swiss

AI Swiss, association suisse à but non lucratif, assure l'intendance de BASE au titre de sa mission d'intérêt public en faveur de la littératie IA: elle porte le nom «BASE» pour ce projet, veille à la cohérence de la spécification et maintient le projet neutre vis-à-vis des modèles et des fournisseurs. Aucun partenariat exclusif ne liera un adoptant à une plateforme. Voilà ce qu'une association sans but lucratif peut garantir, là où un acteur commercial ne le pourrait pas.

BASE ne désigne aucun successeur, et ce choix est délibéré. Si AI Swiss ne pouvait plus assurer cette intendance, elle s'engage à l'annoncer publiquement et sans délai. La continuité ne repose donc pas sur la longévité d'une association, mais sur la réversibilité: licences ouvertes (Apache-2.0, CC BY 4.0), cœur sans dépendance, et des fichiers qui vous appartiennent. Aucun adoptant n'est captif; quiconque, institution ou personne, peut reprendre le projet et le poursuivre.

## Rôles

| Rôle | Qui | Responsabilité |
| ---- | --- | -------------- |
| Mainteneur | Charles-Edouard Bardyn | Revue et fusion des contributions, publication des versions, arbitrage final en cas de désaccord. |
| Intendance | AI Swiss | Garantie de cohérence de la spécification et de stabilité de la surface publique ([Versions et stabilité](docs/reference/versions-et-stabilite.md)); hébergement institutionnel neutre et sans but lucratif. |
| Partenaire | [Innovaud](https://innovaud.ch) | Amorçage des cas d'usage PME; pas de rôle décisionnel sur le code ou la spécification. |
| Contributeurs | Vous | Issues, corrections, traductions, exemples, retours d'expérience. |

## Comment les décisions se prennent

1. **Les petites décisions** (correction, clarification, exemple) se règlent dans la pull request, sous la revue du mainteneur.
2. **Les décisions de surface publique** (format des ressources, commandes CLI, outils MCP, schémas, contrats des ports) passent par la spécification: une modification de `specs/current/` dans la même contribution, et une ligne dans le `CHANGELOG`. Ce qui ne figure pas dans les specs ne constitue pas un engagement.
3. **Les orientations** (ce que le projet refuse de devenir) sont encadrées par le [MANIFESTO](MANIFESTO.md) et la section «Ce que le projet évite volontairement» de [CONTRIBUTING](CONTRIBUTING.md). Les remettre en cause appelle une discussion publique, non un patch.

En cas de désaccord persistant, le mainteneur tranche et en consigne la raison. Le désaccord demeure légitime: le fork est un droit, non une trahison.

## Devenir co-mainteneur

Le projet cherche activement à élargir sa maintenance. Le chemin est progressif et fondé sur une confiance démontrée:

1. plusieurs contributions de qualité déjà fusionnées (du code avec ses tests, ou de la documentation tenue à la même exigence);
2. des revues utiles portées sur les contributions des autres;
3. une proposition du mainteneur, puis des droits de revue et de fusion sur un périmètre donné (MCP, Studio, docs, traductions);
4. à terme, le partage des droits de publication.

Aucune étape n'a de durée fixe. Le critère est simple: la personne protège-t-elle les invariants du projet (honnêteté documentaire, zéro dépendance du cœur, sobriété) sans qu'on ait à le lui rappeler?

## Vers une gouvernance partagée

BASE est aujourd'hui maintenu par un mainteneur principal, sous l'intendance d'AI Swiss; cette concentration est assumée et clairement nommée. Le projet est pensé pour s'ouvrir, et sa vocation est concrète: servir de socle commun aux ateliers et aux formations d'AI Swiss, dont celles menées en partenariat avec Innovaud. Une communauté en ligne accompagnera cette diffusion, lieu où poser ses questions, partager ses retours et progresser en apprenant les uns des autres (une plateforme est envisagée avec Innovaud).

À mesure que des contributeurs et des co-mainteneurs s'engageront durablement, la décision se partagera et l'amendement de la spécification passera par une discussion publique. On ne bâtit pas de structure avant que des personnes soient là pour la porter. La continuité, elle, est déjà acquise par la réversibilité décrite plus haut, et non par une promesse.

## Publication et sécurité

- Une version se publie en suivant [`specs/RELEASE.md`](specs/RELEASE.md), de bout en bout, depuis un état propre. Sans exception. Aucune cadence fixe: une version paraît lorsqu'un ensemble de changements stables et vérifiés le justifie, jamais selon un calendrier.
- Les vulnérabilités se signalent en privé via [SECURITY.md](SECURITY.md). Les correctifs de sécurité priment sur tout le reste.

## Évolution de ce document

Ce document changera quand la réalité changera, pas avant. L'ajout d'un co-mainteneur, un changement d'intendance ou une modification du processus de décision passe par une pull request visible, accompagnée d'une ligne de `CHANGELOG`.

---

BASE est un cadre porté par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
