# Gouvernance

Ce document décrit qui décide quoi dans BASE, comment les décisions se prennent, et comment la responsabilité s'élargit. Il suit la même règle d'honnêteté que le reste du projet: décrire ce qui est, pas ce qu'on aimerait montrer.

## État actuel, sans fard

BASE a été créé par **Charles-Edouard Bardyn** (Directeur Scientifique, VP et cofondateur d'[AI Swiss](https://a-i.swiss), association suisse indépendante à but non lucratif) et reste aujourd'hui porté par un mainteneur principal. Le «bus factor» est donc de 1: c'est le principal risque de pérennité du projet, et ce document existe pour organiser sa réduction. Deux choses protègent déjà la continuité:

- **Tout est texte et tout est testé.** La spécification (`specs/`), la suite de tests et la checklist de publication (`specs/RELEASE.md`) rendent le projet reprenable par une personne compétente sans connaissance orale.
- **La licence est irrévocable.** Code sous Apache-2.0, contenus sous CC BY 4.0: personne ne peut fermer ce qui est publié, et chacun peut forker.

## L'intendance d'AI Swiss

AI Swiss, association suisse à but non lucratif, porte l'intendance de BASE dans le cadre de sa mission d'intérêt public de littératie IA: elle porte le nom «BASE» pour ce projet, veille à la cohérence de la spécification, et garde le projet neutre vis-à-vis des modèles et des fournisseurs. Aucun partenariat exclusif ne viendra lier un adoptant à une plateforme. C'est précisément ce qu'une association sans but lucratif peut tenir, et qu'un acteur commercial ne pourrait pas.

BASE ne désigne aucun successeur, et c'est délibéré. Si AI Swiss ne pouvait plus assurer cette intendance, elle s'engage à le signaler publiquement et sans délai. La continuité ne tient alors pas à la longévité d'une association, mais à la réversibilité: licences ouvertes (Apache-2.0, CC BY 4.0), cœur sans dépendance, et des fichiers que vous possédez. Aucun adoptant n'est captif; quiconque, institution ou personne, peut reprendre et continuer le projet.

## Rôles

| Rôle | Qui | Responsabilité |
| ---- | --- | -------------- |
| Mainteneur | Charles-Edouard Bardyn | Revue et fusion des contributions, publication des versions, arbitrage final en cas de désaccord. |
| Intendance | AI Swiss | Garantie de cohérence de la spécification et de stabilité de la surface publique ([Versions et stabilité](docs/reference/versions-et-stabilite.md)); hébergement institutionnel neutre et sans but lucratif. |
| Partenaire | [Innovaud](https://innovaud.ch) | Amorçage des cas d'usage PME; pas de rôle décisionnel sur le code ou la spécification. |
| Contributeurs | Vous | Issues, corrections, traductions, exemples, retours d'expérience. |

## Comment les décisions se prennent

1. **Les petites décisions** (correction, clarification, exemple) se prennent dans la pull request, avec la revue du mainteneur.
2. **Les décisions de surface publique** (format des ressources, commandes CLI, outils MCP, schémas, contrats des ports) passent par la spécification: une modification de `specs/current/` dans la même contribution, et une ligne dans le `CHANGELOG`. Ce qui n'est pas dans les specs n'est pas un engagement.
3. **Les orientations** (ce que le projet refuse de devenir) sont bornées par le [MANIFESTO](MANIFESTO.md) et la section «Ce que le projet évite volontairement» de [CONTRIBUTING](CONTRIBUTING.md). Les remettre en cause demande une discussion publique, pas un patch.

En cas de désaccord persistant, le mainteneur tranche et documente la raison. Le désaccord reste légitime: le fork est un droit, pas une trahison.

## Devenir co-mainteneur

Le projet cherche activement à élargir la maintenance. Le chemin est progressif et fondé sur la confiance démontrée:

1. plusieurs contributions fusionnées de qualité (code avec tests, ou documentation avec la même exigence);
2. des revues utiles sur les contributions des autres;
3. proposition par le mainteneur, droits de revue puis de fusion sur un périmètre (MCP, Studio, docs, traductions);
4. à terme, droits de publication partagés.

Aucune étape n'a de durée fixe. Le critère est simple: la personne protège-t-elle les invariants du projet (honnêteté documentaire, zéro dépendance du cœur, sobriété) sans qu'on le lui rappelle?

## Vers une gouvernance partagée

BASE est aujourd'hui maintenu par un mainteneur principal, sous l'intendance d'AI Swiss; cette concentration est assumée et nommée. Le projet est pensé pour s'ouvrir, et il a une vocation concrète: servir de socle commun aux ateliers et aux formations d'AI Swiss, dont celles menées en partenariat avec Innovaud. Une communauté en ligne accompagnera cette diffusion: y poser ses questions, partager ses retours, et progresser en apprenant les uns des autres (une plateforme est envisagée avec Innovaud).

À mesure que des contributeurs et des co-mainteneurs s'engagent durablement, la décision se partage et l'amendement de la spécification passe par une discussion publique. On ne crée pas de structure avant qu'il y ait des personnes pour la porter. La continuité, elle, est déjà acquise par la réversibilité décrite plus haut, pas par une promesse.

## Publication et sécurité

- Une version se publie en suivant [`specs/RELEASE.md`](specs/RELEASE.md), de haut en bas, depuis un état propre. Pas d'exception. Il n'y a pas de cadence fixe: une version sort quand un ensemble de changements stables et vérifiés le justifie, jamais selon un calendrier.
- Les vulnérabilités se signalent en privé via [SECURITY.md](SECURITY.md). Les correctifs de sécurité ont priorité sur tout le reste.

## Évolution de ce document

Ce document changera quand la réalité changera, pas avant. L'ajout d'un co-mainteneur, un changement d'intendance ou une modification du processus de décision se fait par pull request visible, avec une ligne de `CHANGELOG`.

---

BASE est un framework par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
