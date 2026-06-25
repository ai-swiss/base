---
schema_version: base.resource.v1
id: marqueurs-registre
type: document
title: Les marqueurs de BASE et quand les poser
description: Le registre unique du vocabulaire des marqueurs inline de BASE. Deux niveaux: les marqueurs métier des documents utilisateurs et les marqueurs du plan de spécification. Source canonique fermée dont dérivent le scanner, l'exigence FR-CORE-010 et la compétence marqueurs de chaque agent.
scope: public
status: active
sensitivity: public
keywords: [marqueurs, A COMPLETER, A VALIDER, ATTENTION, DECISION, NEEDS CLARIFICATION, SPEC-NEUTRAL, spec-sync, registre]
---

# Les marqueurs de BASE et quand les poser

Un marqueur mal posé, ou compris autrement par l'humain, l'agent et l'outillage, fait perdre la trace de l'état réel du travail. Pour l'éviter, le vocabulaire est défini une seule fois ici: quels marqueurs existent, ce que chacun signifie et quand le poser. Un marqueur est un repère texte cherchable, écrit entre crochets dans un document, qui rend cet état visible sans quitter le fichier. Il sert de référence commune à qui rédige ou relit dans BASE, comme à l'agent qui l'assiste.

Un marqueur se traite par recherche de texte (cherchable, donc traçable et scriptable), pas à l'œil. C'est tout l'intérêt: un marqueur est un repère qu'on retrouve par une méthode algorithmique standard (lister les documents marqués et les traiter un par un), au lieu de s'en remettre à une recherche floue sémantique qui doit tout absorber en volume. BASE en reconnaît un ensemble **fermé**, réparti en deux niveaux qui ne se mélangent pas:

1. **Les marqueurs métier**, dans les documents utilisateurs (devis, fiches clients, rapports, journal). Ils rendent l'état du travail visible et traçable directement dans le fichier.
2. **Les marqueurs du plan de spécification**, dans la spec et le code. Ils signalent une zone d'incertitude assumée ou un changement de code déclaré sans changement de spec.

Cette page est la **source unique** de ce vocabulaire. Le scanner (`tools/core/markers.mjs`), l'exigence FR-CORE-010, le contrôle spec-sync et la compétence «marqueurs» de chaque agent dérivent tous de cet ensemble fermé. La dernière section explique pourquoi on n'en ajoute aucun à la légère.

## A. Marqueurs métier

Quatre marqueurs, et seulement quatre, vivent dans les documents utilisateurs. Chacun correspond à une phase de la boucle de co-pensée (Cadrer, Confier, Évaluer, Ajuster). Ils sont cherchés par `base markers` (et l'outil MCP `list_markers`), et **interdits** dans les fichiers du framework et de la spec.

Pour chaque marqueur: son sens, le moment où le poser, et qui le ferme.

### `[A COMPLETER: champ]`

- **Sens.** Une information nécessaire pour avancer est manquante.
- **Quand l'utiliser.** Phase Cadrer: au moment de rédiger, quand une donnée indispensable n'est pas encore connue (par exemple un numéro IDE, un email, un montant).
- **Qui le ferme.** Il disparaît quand l'information est fournie, par l'agent ou par l'utilisateur.

### `[A VALIDER: description]`

- **Sens.** L'agent propose quelque chose qui n'a pas encore été confirmé par l'utilisateur.
- **Quand l'utiliser.** Phase Confier: pour toute valeur, hypothèse ou formulation que l'agent a produite et qui attend une décision humaine.
- **Qui le ferme.** L'utilisateur. Un `[A VALIDER]` confirmé devient un `[DECISION]`.

### `[ATTENTION: description]`

- **Sens.** Un risque, une incohérence ou une alerte que l'utilisateur devrait examiner.
- **Quand l'utiliser.** Phase Évaluer: quand l'agent détecte un point qui mérite un regard humain avant de poursuivre.
- **Qui le ferme.** Il reste tant que le risque n'a pas été traité; il se ferme quand le point a été résolu ou explicitement accepté.

### `[DECISION: choix | raison]`

- **Sens.** Un choix a été confirmé par l'utilisateur, enregistré pour la traçabilité.
- **Quand l'utiliser.** Phase Ajuster: pour figer un choix validé et conserver pourquoi il a été fait.
- **Qui le ferme.** Rien. Un `[DECISION]` est une trace durable du choix, qui reste dans le document comme historique, et non un élément ouvert à traiter.
- **Forme enrichie (enjeux élevés).** Quand le choix a des conséquences importantes (montant élevé, engagement ferme, donnée difficile à corriger), on documente l'alternative écartée, le niveau de confiance et le coût d'un retour en arrière, par exemple: `[DECISION: Arche florale à 1100 CHF | Pivoines plus coûteuses | Alternative: roses standard 850 CHF | Confiance: haute | Réversibilité: faible (devis à refaire)]`. Vocabulaire suggéré, lu par l'humain comme par l'agent (ce n'est pas un champ analysé par le scanner): **Confiance: haute | moyenne | basse**, **Réversibilité: facile | moyenne | difficile**.
- **Règle d'escalade.** Un agent qui s'apprête à figer un `[DECISION]` en **confiance basse** *ou* dont le retour en arrière serait **difficile** ne tranche pas seul: il pose un `[A VALIDER]` et laisse l'humain décider. On automatise ce qui est sûr et facilement réversible; on remonte le reste. C'est une convention de jugement, pas une syntaxe imposée.

### Règles communes aux marqueurs métier

- Ils vivent dans les **documents générés** (devis, fiches clients, rapports) et dans le **journal**, jamais dans les fichiers du framework (`AGENT.md`, `SKILL.md`, templates) ni dans la spec.
- Ils sont scannés par `base markers` (et l'outil MCP `list_markers`), qui ne retourne que les fichiers métier: `listMarkers` ignore `.ai/agents/`, `docs/`, `specs/`, `tests/`, `tools/`, `mcp/`, les README et les fichiers de test (FR-MARKERS-001). Au démarrage d'une session, l'agent peut résumer l'état ouvert en une ligne (par exemple «2 `[A VALIDER]`, 1 `[DECISION]` enregistrée»).
- Le rapport de maintenance (`base entretien`, FR-CORE-010) compte ces mêmes marqueurs comme éléments ouverts, et signale les marqueurs **périmés**: un marqueur ouvert dans un fichier métier dont la date de modification dépasse 30 jours, le signal du «théâtre de la vérification».
- L'ensemble est **fermé et insensible à la casse** dans le scanner; tout autre crochet n'est pas un marqueur métier et n'est pas remonté.

### Variantes de domaine

Les quatre marqueurs métier forment l'ensemble **canonique**: c'est lui que le scanner reconnaît, que `base markers` remonte et que la compétence «marqueurs» standard enseigne. Un agent peut toutefois enseigner, **en plus**, des annotations propres à son domaine, pour rendre lisible ce qui compte chez lui: l'assistant de réflexion, par exemple, pose `[HYPOTHESE: …]` et `[INCERTITUDE: …]`. Ces annotations ne sont pas des marqueurs métier canoniques (le scanner ne les remonte pas) et ne prétendent pas au statut de l'ensemble fermé.

La frontière est tenue par un contrôle (`tools/spec/check-markers.mjs`): une compétence «marqueurs» qui emploie l'ensemble canonique (elle mentionne `A COMPLETER`) en est une **copie** et doit porter les quatre marqueurs, sans en omettre; une compétence qui n'emploie pas `A COMPLETER` est traitée comme une **variante de domaine**, distincte du canon et ignorée par ce contrôle de complétude. Choisir une variante reste un choix d'agent assumé; il ne modifie pas l'ensemble canonique, qui ne change que par décision (voir plus bas).

## B. Marqueurs du plan de spécification

Deux marqueurs vivent dans le plan technique (la spec et le code), jamais dans les documents utilisateurs. Ils ne sont pas remontés par `base markers`: ce sont des conventions du dépôt, appliquées par les contrôles de discipline de la spec.

### `[NEEDS CLARIFICATION: reason]`

- **Sens.** Une inconnue assumée dans la spécification: une zone où le comportement attendu n'est pas encore tranché.
- **Où il s'applique.** Dans les chapitres de `specs/current/`. La règle de la spec est de **ne jamais inventer une exigence**: une vraie inconnue se balise inline plutôt que de se deviner. La raison entre crochets est obligatoire.
- **Pourquoi.** La spec décrit le comportement présent, sans statut. Un `[NEEDS CLARIFICATION]` est la façon honnête de dire «ceci reste à décider» sans fabriquer une réponse ni glisser du travail planifié dans un chapitre (le travail planifié vit dans `CHANGELOG.md` et `.plans/`).

### `[SPEC-NEUTRAL: reason]`

- **Sens.** La déclaration honnête, et revue, qu'un changement de code runtime ne modifie aucun comportement décrit par la spec.
- **Où il s'applique.** Dans le message de commit ou le corps de la pull request, lu par le contrôle **spec-sync** (`tools/spec/spec-sync-check.mjs`).
- **Pourquoi.** Le contrôle spec-sync garantit que la vérité ne prend pas de retard sur la trajectoire: un changement de code source runtime doit toucher `specs/` dans le même changement, **ou** déclarer `[SPEC-NEUTRAL: reason]`. C'est la **soupape de sécurité** du contrôle, et non un raccourci silencieux: la déclaration est un point de revue explicite, et les relecteurs vérifient que le changement est réellement sans effet sur le comportement. La raison entre crochets est obligatoire.

Ces deux marqueurs relèvent de la discipline de la spec (NFR-CORE-010), au même titre que la matrice exigences vers tests régénérée et l'immuabilité des identifiants. Ils n'ont rien à faire dans un devis ou une fiche client, et les marqueurs métier n'ont rien à faire dans un chapitre de spec.

## Jamais (règles dures)

Les règles dures pour un agent qui travaille **dans** BASE (le dépôt du framework), pas pour les documents métier:

- **Jamais de marqueur métier dans un fichier du framework ou de spec.** Les marqueurs `[A COMPLETER]`, `[A VALIDER]`, `[ATTENTION]`, `[DECISION]` vivent dans les documents générés et le journal, jamais dans `AGENT.md`, `SKILL.md`, les templates ou l'arbre `specs/`.
- **Jamais éditer à la main un artefact généré.** Tout fichier dont l'en-tête indique qu'il est généré (`AGENTS.md`, `CLAUDE.md`, `BASE_BOOTSTRAP.md`, `.cursor/rules/assistant.mdc`, `base.manifest.json`, la matrice `requirements-matrix.md`) est une projection: modifie la source canonique (par exemple `tools/core/bootstrap.mjs` pour les quatre points d'entrée), puis régénère. Le gate de fraîcheur (`build --write` puis `git diff --exit-code`) refuse toute dérive.
- **Jamais inventer une donnée manquante.** Une information absente se note `[A COMPLETER: champ]` dans un document métier, et une inconnue dans une spec se signale en ligne par `[NEEDS CLARIFICATION: raison]`. Ne devine pas, ne fabrique pas de valeur, pas de confiance simulée.
- **Jamais d'écriture directe sur une cible protégée.** Toute écriture passe par le flux médié propose puis commit; proposer prépare un diff et n'écrit rien, committer revérifie la décision et le `base_hash` avant d'écrire et de vérifier. Une proposition ne s'auto-exempte jamais.
- **Jamais renuméroter, réutiliser ni supprimer un identifiant stable** (`UR`/`NFR`/`FR`/`RC`/`AD`). Un ID fusionné est immuable; une exigence retirée du périmètre garde son ID et porte `[DE-SCOPED: raison]`. Les nouveaux ID sont alloués par l'outillage (`base spec new <PREFIX> <DOMAIN>`), jamais à la main.

## Un ensemble fermé, modifié seulement par décision

Cette page est la source de vérité unique du vocabulaire des marqueurs. Tout le reste en dérive:

- le scanner `tools/core/markers.mjs`, dont le motif ne reconnaît que les quatre marqueurs métier;
- l'exigence FR-CORE-010, qui définit ce que le rapport de maintenance compte et signale;
- la compétence «marqueurs» de chaque agent, qui apprend à l'assistant quand poser chaque marqueur métier.

Parce que ces dérivés doivent rester cohérents avec cette page, **ajouter un marqueur (ou en changer le sens) est un changement de framework, pas une improvisation**: cela passe par un enregistrement de décision (`decisions/`) puis par la régénération des artefacts qui en dérivent. On n'invente pas un marqueur au fil de la rédaction: on choisit dans cet ensemble fermé, ou on ouvre une décision.
