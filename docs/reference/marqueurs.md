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

Un marqueur mal posé, ou compris d'une autre façon par l'humain, l'agent et l'outillage, fait perdre la trace de l'état réel du travail. Pour l'éviter, le vocabulaire se définit une seule fois, ici: quels marqueurs existent, ce que chacun signifie et quand le poser. Un marqueur est un repère textuel cherchable, écrit entre crochets dans un document, qui rend cet état visible sans quitter le fichier. Il sert de référence commune à qui rédige ou relit dans BASE, comme à l'agent qui l'assiste.

Un marqueur se traite par recherche de texte (cherchable, donc traçable et scriptable), et non à l'œil. C'est tout son intérêt: on le retrouve par une méthode algorithmique simple, lister les documents marqués et les traiter un par un, plutôt que de s'en remettre à une recherche sémantique floue, contrainte de tout brasser. BASE en reconnaît un ensemble **fermé**, réparti en deux niveaux qui ne se mélangent pas:

1. **Les marqueurs métier**, dans les documents utilisateurs (devis, fiches clients, rapports, journal). Ils rendent l'état du travail visible et traçable directement dans le fichier.
2. **Les marqueurs du plan de spécification**, dans la spec et le code. Ils signalent une zone d'incertitude assumée ou un changement de code déclaré sans changement de spec.

Cette page est la **source unique** de ce vocabulaire. Le scanner (`tools/core/markers.mjs`), l'exigence FR-CORE-010, le contrôle spec-sync et la compétence «marqueurs» de chaque agent dérivent tous de cet ensemble fermé. La dernière section explique pourquoi on n'y ajoute aucun marqueur à la légère.

## A. Marqueurs métier

Quatre marqueurs, et seulement quatre, vivent dans les documents utilisateurs. Chacun répond à une phase de la boucle de co-pensée (Cadrer, Confier, Évaluer, Ajuster). On les retrouve par `base markers` (et par l'outil MCP `list_markers`); ils sont **interdits** dans les fichiers du cadre et de la spec.

Pour chaque marqueur: son sens, le moment où le poser et qui le ferme.

### `[A COMPLETER: champ]`

- **Sens.** Une information nécessaire pour avancer fait défaut.
- **Quand l'utiliser.** Phase Cadrer: au moment de rédiger, lorsqu'une donnée indispensable n'est pas encore connue (par exemple un numéro IDE, un courriel, un montant).
- **Qui le ferme.** Il disparaît une fois l'information fournie, par l'agent ou par l'utilisateur.

### `[A VALIDER: description]`

- **Sens.** L'agent propose quelque chose que l'utilisateur n'a pas encore confirmé.
- **Quand l'utiliser.** Phase Confier: pour toute valeur, hypothèse ou formulation produite par l'agent et qui attend une décision humaine.
- **Qui le ferme.** L'utilisateur. Un `[A VALIDER]` confirmé devient un `[DECISION]`.

### `[ATTENTION: description]`

- **Sens.** Un risque, une incohérence ou une alerte que l'utilisateur devrait examiner.
- **Quand l'utiliser.** Phase Évaluer: lorsque l'agent détecte un point qui mérite un regard humain avant de poursuivre.
- **Qui le ferme.** Il demeure tant que le risque n'est pas traité; il se ferme une fois le point résolu ou explicitement accepté.

### `[DECISION: choix | raison]`

- **Sens.** L'utilisateur a confirmé un choix, consigné pour la traçabilité.
- **Quand l'utiliser.** Phase Ajuster: pour figer un choix validé et conserver la raison qui l'a motivé.
- **Qui le ferme.** Rien. Un `[DECISION]` est la trace durable d'un choix, qui reste dans le document comme historique, et non un élément ouvert à traiter.
- **Forme enrichie (enjeux élevés).** Lorsque le choix a des conséquences importantes (montant élevé, engagement ferme, donnée difficile à corriger), on consigne l'alternative écartée, le niveau de confiance et le coût d'un retour en arrière, par exemple: `[DECISION: Arche florale à 1100 CHF | Pivoines plus coûteuses | Alternative: roses standard 850 CHF | Confiance: haute | Réversibilité: faible (devis à refaire)]`. Vocabulaire suggéré, lu par l'humain comme par l'agent (ce n'est pas un champ analysé par le scanner): **Confiance: haute | moyenne | basse**, **Réversibilité: facile | moyenne | difficile**.
- **Règle d'escalade.** Un agent qui s'apprête à figer un `[DECISION]` en **confiance basse** *ou* dont le retour en arrière serait **difficile** ne tranche pas seul: il pose un `[A VALIDER]` et laisse l'humain décider. On automatise ce qui est sûr et aisément réversible; on remonte le reste. C'est une convention de jugement, non une syntaxe imposée.

### Règles communes aux marqueurs métier

- Ils vivent dans les **documents générés** (devis, fiches clients, rapports) et dans le **journal**, jamais dans les fichiers du cadre (`AGENT.md`, `SKILL.md`, templates) ni dans la spec.
- Ils sont scannés par `base markers` (et par l'outil MCP `list_markers`), qui ne retourne que les fichiers métier: `listMarkers` ignore `.ai/agents/`, `docs/`, `specs/`, `tests/`, `tools/`, `mcp/`, les README et les fichiers de test (FR-MARKERS-001). Au début d'une session, l'agent peut résumer l'état ouvert en une ligne (par exemple «2 `[A VALIDER]`, 1 `[DECISION]` enregistrée»).
- Le rapport de maintenance (`base entretien`, FR-CORE-010) compte ces mêmes marqueurs comme éléments ouverts et signale les marqueurs **périmés**: un marqueur resté ouvert dans un fichier métier dont la date de modification remonte à plus de 30 jours, le signe du «théâtre de la vérification».
- L'ensemble est **fermé et insensible à la casse** dans le scanner; tout autre crochet n'est pas un marqueur métier et n'est pas remonté.

### Variantes de domaine

Les quatre marqueurs métier forment l'ensemble **canonique**: c'est lui que le scanner reconnaît, que `base markers` remonte et que la compétence «marqueurs» standard enseigne. Un agent peut toutefois enseigner, **en plus**, des annotations propres à son domaine, afin de rendre lisible ce qui compte chez lui: l'assistant de réflexion, par exemple, pose `[HYPOTHESE: …]` et `[INCERTITUDE: …]`. Ces annotations ne sont pas des marqueurs métier canoniques (le scanner ne les remonte pas) et ne prétendent pas au statut de l'ensemble fermé.

La frontière est tenue par un contrôle (`tools/spec/check-markers.mjs`): une compétence «marqueurs» qui emploie l'ensemble canonique (elle mentionne `A COMPLETER`) en est une **copie** et doit porter les quatre marqueurs, sans en omettre aucun; une compétence qui n'emploie pas `A COMPLETER` est traitée comme une **variante de domaine**, distincte du canon et ignorée par ce contrôle de complétude. Choisir une variante demeure un choix d'agent assumé; il ne modifie pas l'ensemble canonique, lequel ne change que par décision (voir plus bas).

## B. Marqueurs du plan de spécification

Deux marqueurs vivent dans le plan technique (la spec et le code), jamais dans les documents utilisateurs. `base markers` ne les remonte pas: ce sont des conventions du dépôt, appliquées par les contrôles de discipline de la spec.

### `[NEEDS CLARIFICATION: reason]`

- **Sens.** Une inconnue assumée dans la spécification: une zone où le comportement attendu n'est pas encore tranché.
- **Où il s'applique.** Dans les chapitres de `specs/current/`. La règle de la spec est de **ne jamais inventer une exigence**: une vraie inconnue se balise sur place plutôt que de se deviner. La raison entre crochets est obligatoire.
- **Pourquoi.** La spec décrit le comportement présent, sans statut. Un `[NEEDS CLARIFICATION]` est la manière honnête de dire «ceci reste à décider» sans fabriquer une réponse ni glisser du travail planifié dans un chapitre (le travail planifié vit dans `CHANGELOG.md` et `.plans/`).

### `[SPEC-NEUTRAL: reason]`

- **Sens.** La déclaration honnête, et revue, qu'un changement de code runtime ne modifie aucun comportement décrit par la spec.
- **Où il s'applique.** Dans le message de commit ou le corps de la pull request, lu par le contrôle **spec-sync** (`tools/spec/spec-sync-check.mjs`).
- **Pourquoi.** Le contrôle spec-sync garantit que la vérité ne prend pas de retard sur la trajectoire: un changement de code source runtime doit toucher `specs/` dans le même geste, **ou** déclarer `[SPEC-NEUTRAL: reason]`. C'est la **soupape de sécurité** du contrôle, non un raccourci silencieux: la déclaration est un point de revue explicite, et les relecteurs vérifient que le changement est réellement sans effet sur le comportement. La raison entre crochets est obligatoire.

Ces deux marqueurs relèvent de la discipline de la spec (NFR-CORE-010), au même titre que la matrice exigences vers tests régénérée et l'immuabilité des identifiants. Ils n'ont pas leur place dans un devis ou une fiche client, pas plus que les marqueurs métier dans un chapitre de spec.

## Jamais (règles dures)

Les règles dures pour un agent qui travaille **dans** BASE (le dépôt du cadre), et non pour les documents métier:

- **Jamais de marqueur métier dans un fichier du cadre ou de spec.** Les marqueurs `[A COMPLETER]`, `[A VALIDER]`, `[ATTENTION]`, `[DECISION]` vivent dans les documents générés et le journal, jamais dans `AGENT.md`, `SKILL.md`, les templates ou l'arbre `specs/`.
- **Jamais éditer à la main un artefact généré.** Tout fichier dont l'en-tête indique qu'il est généré (`AGENTS.md`, `CLAUDE.md`, `BASE_BOOTSTRAP.md`, `.cursor/rules/assistant.mdc`, `base.manifest.json`, la matrice `requirements-matrix.md`) est une projection: modifie la source canonique (par exemple `tools/core/bootstrap.mjs` pour les quatre points d'entrée), puis régénère. Le gate de fraîcheur (`build --write` puis `git diff --exit-code`) refuse toute dérive.
- **Jamais inventer une donnée manquante.** Une information absente se note `[A COMPLETER: champ]` dans un document métier; une inconnue dans une spec se signale en ligne par `[NEEDS CLARIFICATION: raison]`. Ne devine pas, ne fabrique aucune valeur, aucune confiance simulée.
- **Jamais d'écriture directe sur une cible protégée.** Toute écriture passe par le flux médié propose puis commit: proposer prépare un diff et n'écrit rien, committer revérifie la décision et le `base_hash` avant d'écrire et de vérifier. Une proposition ne s'auto-exempte jamais.
- **Jamais renuméroter, réutiliser ni supprimer un identifiant stable** (`UR`/`NFR`/`FR`/`RC`/`AD`). Un ID fusionné est immuable; une exigence retirée du périmètre conserve son ID et porte `[DE-SCOPED: raison]`. Les nouveaux ID sont alloués par l'outillage (`base spec new <PREFIX> <DOMAIN>`), jamais à la main.

## Un ensemble fermé, modifié seulement par décision

Cette page est la source de vérité unique du vocabulaire des marqueurs. Tout le reste en dérive:

- le scanner `tools/core/markers.mjs`, dont le motif ne reconnaît que les quatre marqueurs métier;
- l'exigence FR-CORE-010, qui définit ce que le rapport de maintenance compte et signale;
- la compétence «marqueurs» de chaque agent, qui apprend à l'assistant quand poser chaque marqueur métier.

Parce que ces dérivés doivent rester cohérents avec cette page, **ajouter un marqueur (ou en changer le sens) est un changement du cadre, non une improvisation**: cela passe par un enregistrement de décision (`decisions/`), puis par la régénération des artefacts qui en dérivent. On n'invente pas un marqueur au fil de la rédaction: on choisit dans cet ensemble fermé, ou l'on ouvre une décision.
