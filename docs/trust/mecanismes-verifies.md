---
schema_version: base.resource.v1
id: docs-trust-mecanismes-verifies
type: document
title: "Mécanismes vérifiés: garantie, fonction, test"
description: La carte courte, pour un décideur, des garanties que le code de BASE applique réellement, chacune reliée à sa fonction et au test qui échouerait si elle cassait.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
---

# Mécanismes vérifiés: garantie, fonction, test

Une garantie ne vaut que si le code l'applique et qu'un test la protège. Cette vue rassemble les garanties que BASE tient ainsi: chaque ligne relie une garantie à la fonction qui l'applique et au test qui **échouerait** si elle cassait; rien n'y est inventé. C'est la lecture courte pour un dossier d'évaluation; la cartographie exhaustive exigences vers tests vit dans `specs/current/10_core/requirements-matrix.md`, régénérée et vérifiée en intégration continue.

Rappel de vocabulaire: un **mécanisme** est appliqué par le broker (du code le vérifie, un test le protège); une **consigne** est une instruction suivie par le modèle, donc faillible. Cette page ne liste que des mécanismes. La distinction est détaillée dans [`mecanismes-vs-consignes.md`](mecanismes-vs-consignes.md), et le lien entre chaque affirmation publique et sa preuve dans [`evidence.md`](evidence.md).

| Garantie | Mécanisme (code) | Test qui échouerait | Limite de portée |
| --- | --- | --- | --- |
| Une ressource confidentielle ne part pas vers un modèle distant, vérifié **avant** l'appel | `tools/core/egress.mjs` → `checkEgress` | `tests/base-egress.test.mjs` (un IBAN secret n'atteint pas le modèle) | Chemins médiés par le broker (serveur MCP, chat du Studio, évaluation); déclenché par le drapeau `confidential` ou une racine `local-only`, pas par la taxonomie `sensitivity`; **le défaut d'une racine est permissif (`any`)**, donc seule une ressource marquée (ou une racine `local-only`) est retenue (voir [La frontière](frontiere-local-vs-sortant.md)); en CLI directe, l'humain reste l'autorité. |
| Le serveur MCP traite un client connecté comme **distant par défaut**: confidentiel et racines `local-only` retenus quel que soit le transport (`stdio` comme HTTP) | `mcp/src/base-core-adapter.ts` (egress `modelLocality: remote` par défaut) | `mcp/tests/index.test.ts` (une ressource confidentielle est retenue sauf `BASE_MCP_ALLOW_CONFIDENTIAL=1`, FR-EGRESS-004) | Un opérateur qui sait le client local et de confiance peut l'autoriser avec `BASE_MCP_ALLOW_CONFIDENTIAL=1`. |
| Une écriture sensible n'est jamais appliquée sans confirmation | `tools/core/policy.mjs` (refus d'écriture `sensitive`/`restricted` non confirmée) | `tests/base-core.test.mjs` (l'opt-out ne s'applique jamais à ces niveaux) | Écritures passant par le broker. |
| Le modèle propose, l'humain valide: écriture en deux temps, médiée et atomique | `tools/core/writes.mjs` → `createBrokerWrites` | `tests/base-core.test.mjs` (un `commitChange` sans confirmation est refusé) | Rien n'est écrit sans l'étape de validation. |
| Les chemins sont confinés, les symlinks sortants refusés, les racines imbriquées isolées | `tools/core/confine.mjs` | `tests/base-core.test.mjs` | Protège l'accès aux fichiers sous le broker. |
| Le routage choisit un agent et un process, ou **s'abstient**, de façon déterministe | `tools/core/routing.mjs` → `decideRoute` | `base route-test`, rejoué racine par racine en CI (`.github/workflows/ci.yml`) | Routage lexical par défaut (zéro réseau); le ranking sémantique est optionnel et peut tourner localement. |
| Le cœur n'a aucune dépendance runtime (il tourne avec `node` nu) | `package.json` (zéro dépendance) et le moteur `tools/**` | `tests/architecture.test.mjs` (échoue sur toute dépendance déclarée ou import non relatif) | Le Studio (application web), le serveur MCP et la génération du site de doc ont leurs propres dépendances. |
| La documentation n'a ni lien mort ni page orpheline | `tools/docs/model.mjs`, `tools/doctor/diagnose.mjs` | `tests/base-docs.test.mjs`, `tests/base-doctor.test.mjs` | Couvre le corpus de documentation. |
| Le Studio n'écoute qu'en local (loopback) | `tools/studio/server.mjs` (refus de tout hôte non-loopback) | `tests/studio-server.test.mjs` | Le Studio ne s'expose pas au réseau. |

Chaque cellule «Mécanisme» et «Test» désigne un fichier réel du dépôt: vous pouvez l'ouvrir, lire la fonction, et exécuter le test. C'est là le sens de «vérifiable par un tiers»: la garantie n'est pas une promesse, c'est un comportement que le code applique et qu'un test protège.

Pour ce que BASE **ne** garantit pas seul (exactitude des sorties d'un modèle, IAM, DLP, archivage légal, et le reste), voir [`securite-et-limites.md`](securite-et-limites.md). Pour la juridiction de l'hébergeur et l'exposition extraterritoriale, voir [`souverainete-et-confiance.md`](souverainete-et-confiance.md).
