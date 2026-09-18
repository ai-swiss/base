---
schema_version: base.resource.v1
id: evidence
type: document
title: Vérifier les promesses de BASE, et ses limites
description: Relier les grandes promesses de BASE à des mécanismes, tests, exemples et limites vérifiables.
scope: public
status: active
sensitivity: public
doc_role: audit
audience: [developer, maintainer, institution, enterprise]
learning_level: advanced
related: [framework-public, routage-process-et-ressources, specification-v0, securite-et-limites]
keywords: [evidence, preuves, validation, limites, tests, confiance, audit]
---

# Vérifier les promesses de BASE, et ses limites

Avant de confier un travail réel à BASE, mieux vaut vérifier ses promesses que les croire sur parole: pour chacune, vous trouvez ici le mécanisme, le test ou l'exemple qui la soutient, et la limite qu'il faut connaître. C'est ce qu'attend quiconque doit auditer BASE avant de s'y fier: développeur, mainteneur, institution, entreprise. Une promesse ne tient que si elle pointe vers un fichier, un test, un exemple ou une limite vérifiables.

## Structure pour validation

**Promesse.** BASE rend le travail avec l'IA plus vérifiable parce que l'intention, le contexte, le process, les ressources et les sorties attendues sont écrits.

**Mécanismes.**

- `docs/reference/routage-process-et-ressources.md` explique la chaîne agent -> process -> ressources.
- `specs/current/10_core/writes.md` définit la discipline propose -> commit.
- `tests/base-routing.test.mjs` protège les abstentions, ambiguïtés et routes attendues.
- `tests/base-core.test.mjs` protège validation, liens, inventaire et garde-fous publics.
- `specs/current/10_core/requirements-matrix.md` relie chaque exigence (UR/FR/NFR) aux fichiers de test qui la citent; la matrice est générée (`npm run spec:matrix`) et sa fraîcheur est vérifiée par la suite de tests.

**Limite.** BASE rend le chemin de vérification plus explicite, mais ne garantit pas pour autant qu'une réponse soit juste.

## Local par défaut

**Promesse.** BASE peut fonctionner comme une structure locale, lisible et portable avant toute plateforme.

**Mécanismes.**

- `tools/base.mjs` expose les commandes locales.
- `docs/guides/connecter-votre-outil.md` montre comment connecter différents outils.
- `docs/guides/modeles-souverains.md` documente des options de modèles locaux ou souverains.
- `mcp/README.md` montre l'intégration sans déplacer la source de vérité.

**Limite.** Il revient encore aux organisations de définir, autour de BASE, l'IAM, la DLP, la rétention, la journalisation et la revue juridique.

## Couches optionnelles

**Promesse.** BASE peut rester simple pour un petit usage et ajouter des couches quand le besoin est réel.

**Mécanismes.**

- `docs/learn/comprendre-echelle.md` explique quand l'index local devient utile.
- `packages/base-index-local/README.md` documente l'index optionnel.
- `packages/base-ranker-semantic/README.md` documente le classement sémantique optionnel.
- `packages/base-eval/README.md` documente l'évaluation.

**Limite.** Chaque couche ajoutée élargit la surface de maintenance. La simplicité par défaut reste une règle de conception.

## Une évaluation par un juge IA ne prouve pas la qualité de BASE {#evaluer-votre-assistant-sans-en-faire-une-preuve}

**Un instrument, pas un argument.** BASE fournit l'évaluation (`npm run eval`): un utilisateur simulé dialogue avec votre assistant par le vrai broker, et une invocation de juge distincte note la conversation au regard des objectifs d'un scénario. Cette séparation ne rend pas le verdict indépendant du modèle ni du barème. C'est un instrument fait pour juger *votre* assemblage (votre agent, votre modèle, vos scénarios), et non une preuve de la qualité de BASE: ce qu'il mesure tient à votre modèle, à votre exemple et à votre matériel, non à BASE.

**Mécanismes.**

- `tools/eval/README.md` documente la commande et le rôle du juge.
- `exemples/assistant-devis/.ai/experiments/scenarios/` contient des scénarios versionnés et reproductibles à reprendre.

**Limite.** Les résultats sont les vôtres, non les nôtres. Un juge faible rend des verdicts faibles; les chiffres dépendent du modèle, de sa version et du matériel. Seuls le protocole et les scénarios sont stables, et BASE ne publie aucun résultat d'évaluation comme preuve de sa qualité.

## Documentation comme projection

**Promesse.** La documentation interactive peut être belle sans devenir une seconde source de vérité.

**Mécanismes.**

- `specs/current/10_core/docs.md` définit le modèle documentaire.
- `tools/docs/model.mjs` construit le modèle depuis les sources.
- `packages/base-docs-site/` rend le site comme adaptateur.
- `tests/base-docs.test.mjs` protège déterminisme, filtrage public et build déployable.

**Limite.** Les pages de présentation doivent rester sobres. Toute explication destinée à durer doit vivre dans `docs/` ou `specs/`.

## Boucle terrain, égress et santé du corpus

- **Contrôle d'égress**: `tools/core/egress.mjs` expose la décision pure `checkEgress`, protégée par
  `tests/base-egress.test.mjs` selon la localité du modèle, la policy de racine et le drapeau
  `confidential` (`FR-EGRESS-001`). Le chat refuse une édition confidentielle avec un modèle distant;
  le paquet de contexte et le prompt d'évaluation écartent les références retenues et annoncent
  l'omission.
- **Journal terrain**: `reportFriction` crée sans écraser les fiches Markdown de `.ai/feedback/`,
  tandis que `appendAbstention` ajoute des lignes à `abstentions.jsonl`. Résoudre une friction
  modifie ensuite sa fiche par propose → commit: seule sa création bénéficie de l'exception
  creation-only (`FR-FEEDBACK-001/002/005`, `tests/base-feedback.test.mjs`).
- **Abstentions du routeur**: les adaptateurs journalisent `out_of_scope`, `ambiguous` et
  `needs_clarification` dans `.ai/feedback/abstentions.jsonl` uniquement lorsqu'une racine est
  unique ou qu'un `root_id` est explicitement sélectionné. Le routage multi-racine et un serveur MCP en lecture seule
  n'écrivent rien; le broker reste sans effet de bord (`FR-FEEDBACK-002`,
  `mcp/tests/index.test.ts`).
- **`base doctor`**: pure projection sur des données existantes (inventaire, graphe de
  liens, runs, feedback), sans état propre. `diagnoseData` produit 18 catégories de constats, deux
  sévérités et un `fix_hint` obligatoire par constat (`FR-DOCTOR-001`,
  `tests/base-doctor.test.mjs`). La CLI `base doctor [--json]` et `GET /api/doctor` appellent la
  même fonction `diagnose`.
