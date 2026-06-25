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

Avant de confier un travail réel à BASE, il faut pouvoir vérifier ses promesses plutôt que les croire sur parole: pour chaque grande promesse, vous trouvez ici le mécanisme, le test ou l'exemple qui la soutient, et la limite qu'il faut connaître. C'est ce dont a besoin quiconque doit auditer BASE avant de s'y fier: développeur, mainteneur, institution, entreprise. Une formule visionnaire ne vaut que si elle pointe vers un fichier, un test, un exemple, une limite ou une décision explicite.

## Structure pour validation

**Claim.** BASE rend le travail avec l'IA plus vérifiable parce que l'intention, le contexte, le process, les ressources et les sorties attendues sont écrits.

**Mécanismes.**

- `docs/reference/routage-process-et-ressources.md` explique la chaîne agent -> process -> ressources.
- `specs/current/10_core/writes.md` définit la discipline propose -> commit.
- `tests/base-routing.test.mjs` protège les abstentions, ambiguïtés et routes attendues.
- `tests/base-core.test.mjs` protège validation, liens, inventaire et garde-fous publics.
- `specs/current/10_core/requirements-matrix.md` relie chaque exigence (UR/FR/NFR) aux fichiers de test qui la citent; la matrice est générée (`npm run spec:matrix`) et sa fraîcheur est vérifiée par la suite de tests.

**Limite.** BASE rend le chemin de vérification plus explicite, mais ne garantit pas pour autant qu'une réponse soit vraie.

## Local par défaut

**Claim.** BASE peut fonctionner comme une structure locale, lisible et portable avant toute plateforme.

**Mécanismes.**

- `tools/base.mjs` expose les commandes locales.
- `docs/guides/connecter-votre-outil.md` montre comment connecter différents outils.
- `docs/guides/modeles-souverains.md` documente des options de modèles locaux ou souverains.
- `mcp/README.md` montre l'intégration sans déplacer la source de vérité.

**Limite.** Les organisations doivent encore définir IAM, DLP, rétention, journalisation et revue juridique autour de BASE.

## Couches optionnelles

**Claim.** BASE peut rester simple pour un petit usage et ajouter des couches quand le besoin est réel.

**Mécanismes.**

- `docs/learn/comprendre-echelle.md` explique quand l'index local devient utile.
- `packages/base-index-local/README.md` documente l'index optionnel.
- `packages/base-ranker-semantic/README.md` documente le ranking sémantique optionnel.
- `packages/base-eval/README.md` documente l'évaluation.

**Limite.** Ajouter une couche augmente la surface de maintenance. La simplicité par défaut reste une règle de conception.

## Évaluer votre assistant, sans en faire une preuve

**Un outil, pas un argument.** BASE fournit `base eval`: un utilisateur simulé parle à votre assistant à travers le vrai broker, et un juge indépendant note la conversation au regard des objectifs d'un scénario. C'est un instrument à explorer pour juger *votre* assemblage (votre agent, votre modèle, vos scénarios), jamais une preuve de la qualité de BASE: ce qu'il mesure dépend de votre modèle, de votre exemple et de votre matériel, pas de BASE.

**Mécanismes.**

- `tools/eval/README.md` documente la commande et le rôle du juge.
- `exemples/assistant-devis/.ai/experiments/scenarios/` contient des scénarios versionnés et reproductibles à reprendre.

**Limite.** Les résultats sont les vôtres, pas les nôtres. Un juge faible produit des verdicts faibles; les chiffres dépendent du modèle, de sa version et du matériel. Seuls le protocole et les scénarios sont stables, et BASE ne publie aucun résultat d'évaluation comme preuve de sa qualité.

## Documentation comme projection

**Claim.** La documentation interactive peut être belle sans devenir une seconde source de vérité.

**Mécanismes.**

- `specs/current/10_core/docs.md` définit le modèle documentaire.
- `tools/docs/model.mjs` construit le modèle depuis les sources.
- `packages/base-docs-site/` rend le site comme adaptateur.
- `tests/base-docs.test.mjs` protège déterminisme, filtrage public et build déployable.

**Limite.** Les pages de présentation doivent rester sobres. Si une explication durable est nécessaire, elle doit vivre dans `docs/` ou `specs/`.

## Boucle terrain, égress et santé du corpus

- **Contrôle d'égress**: une seule règle, un seul point de contrôle, `tools/core/egress.mjs`
  (`checkEgress`, fonction pure testée en matrice localité × policy × confidentialité dans
  `tests/base-egress.test.mjs`). Le chat refuse d'éditer un document confidentiel avec un modèle
  distant. Le context pack retient les références concernées (badge «retenu» à l'écran) et la
  trace d'évaluation consigne les documents expurgés.
- **Journal de friction**: `.ai/feedback/` est en création seule, l'outil MCP
  `report_friction` ne modifie jamais une entrée (collision = suffixe; vérifié par
  `tests/base-feedback.test.mjs` et `mcp/tests/index.test.ts`). «Marquer résolu» repasse par la
  porte propose → diff → commit comme toute écriture.
- **Abstentions du routeur**: chaque `out_of_scope` / `ambiguous` / `needs_clarification` est
  journalisé par les adaptateurs (CLI et MCP) dans `.ai/feedback/abstentions.jsonl`; le broker
  reste sans effet de bord. Les deux portes passent par la même fonction d'écriture.
- **`base doctor`**: pure projection sur des données existantes (inventaire, graphe de
  liens, runs, feedback), sans état propre. Six vérifications, deux sévérités, une piste de
  correction obligatoire par signal (`tests/base-doctor.test.mjs`). Deux portes pour une seule
  fonction: CLI `base doctor [--json]` et `GET /api/doctor` (bandeau Studio).
