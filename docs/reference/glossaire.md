---
schema_version: base.resource.v1
id: glossaire
type: document
title: Glossaire BASE
description: Le vocabulaire BASE défini en une phrase par terme, avec un lien vers la page qui développe. Source canonique des définitions.
scope: public
status: active
sensitivity: public
keywords: [glossaire, definitions, vocabulaire, terminologie, agent, process, broker, routeur]
---

# Glossaire BASE: le vocabulaire en un coup d'œil

Vous croisez un terme BASE et vous en cherchez la définition exacte: cette page la donne en une phrase, avec un lien vers le document qui l'approfondit. C'est la source canonique du vocabulaire; les autres pages renvoient ici plutôt que de redéfinir les mêmes termes. L'ordre est alphabétique.

**Abstention.** Quand aucune route n'est assez claire, la stratégie exécutée rend un statut explicite (`ambiguous`, `needs_clarification`, `out_of_scope`) accompagné d'une raison lisible, au lieu de fabriquer une route. Le résultat dépend de la stratégie et des rankers configurés; l'abstention est un repli honnête, non une garantie d'exactitude. Voir [Routage, process et ressources](routage-process-et-ressources.md).

**Adaptateur.** Le raccord entre une interface BASE et une technologie concrète, par exemple un fournisseur de modèles ou un outil IA. Voir [Framework public](framework-public.md).

**Agent.** Un point d'entrée `AGENT.md` et les skills qui lui sont liés: il décrit un rôle et donne accès aux façons de travailler correspondantes, sans constituer une unité d'exécution. Voir [Comprendre l'approche](../learn/comprendre.md).

**Assistant.** Un agent animé par un modèle dans un harness. Voir [Comprendre l'approche](../learn/comprendre.md).

**Broker.** Le cœur local qui médie les opérations qui passent par lui et y applique ses contrôles, notamment le confinement, les policies et le dry-run. Voir [Sécurité et limites](../trust/securite-et-limites.md).

**Co-pensée.** Un cadre pratique pour l'interaction entre l'humain et l'IA: comment penser, travailler et décider avec une entité dont les représentations internes du monde sont assez proches des nôtres pour communiquer en langage naturel, sans pour autant partager notre contexte, notre mémoire ni nos garanties. Il s'inspire de travaux de recherche et part de ce qu'il faut expliciter, structurer et vérifier pour rendre cette collaboration plus fiable; il s'adapte ensuite au domaine, au métier et à la personne. Voir [Pourquoi BASE: co-penser avec l'IA](../learn/co-penser-avec-lia.md).

**Compétence.** Un savoir réutilisable (TVA, ton de communication, marqueurs) que plusieurs process peuvent consulter; l'un des deux types de skill, l'autre étant le process. Voir [Comprendre l'approche](../learn/comprendre.md).

**Consigne.** Une instruction en texte, suivie par un modèle coopératif. Utile, mais sujette à dérive, là où un mécanisme tient par construction. Voir [Sécurité et limites](../trust/securite-et-limites.md).

**Connecteur.** Le composant qui tente de lire ou d'écrire une source avec les droits du système concerné. Voir [Framework public](framework-public.md).

**Dry-run.** L'exécution à blanc d'un outil (tool): BASE montre l'action prévue sans rien exécuter; l'exécution réelle demande une confirmation. Voir [Sécurité et limites](../trust/securite-et-limites.md).

**Embedding.** La représentation vectorielle d'un texte, utilisée par le ranker sémantique optionnel, jamais par le cœur par défaut. Voir [Choisir son provider d'embeddings](../guides/choisir-provider-embeddings.md).

**Égress.** Le transfert de données d'une racine vers un modèle distant; BASE retient les ressources marquées `confidential: true` et toutes celles d'une racine `local-only` sur les surfaces qui appliquent ce contrôle. Voir [La frontière entre local et sortant](../trust/frontiere-local-vs-sortant.md).

**Événement.** Un fait technique minimal émis pour la trace ou l'entretien, sans constituer à lui seul un historique exhaustif. Voir [Mécanismes vérifiés](../trust/mecanismes-verifies.md).

**Exécution.** Ce qu'un modèle, un outil ou une intégration fait effectivement à partir d'une référence, dans un contexte donné. Voir [Le standard BASE](le-standard.md).

**Fixture de routage.** Un cas écrit qui associe une demande à un résultat attendu et que `base route-test` rejoue sur la stratégie choisie. Voir [Quickstart routage sémantique](../guides/routage-semantique-quickstart.md).

**Frontmatter.** L'en-tête YAML d'une ressource (id, titre, description, scope): les métadonnées que BASE valide et utilise pour découvrir et router. Voir [Framework public](framework-public.md).

**Harness.** L'outil IA dans lequel vous ouvrez votre BASE (Cursor, Claude Code, ChatGPT via MCP). Les garanties réelles varient selon le harness. Voir [Compatibilité harnesses](compatibilite-harnesses.md).

**Journal.** La mémoire de travail entre sessions, en fichiers dans `.ai/journal/`: l'agent y écrit une entrée à la fin de chaque workflow. Voir [Comprendre l'approche](../learn/comprendre.md).

**Manifest.** `base.manifest.json`, l'index des ressources généré par `base index`: une projection régénérable, jamais une source de vérité. Voir [Framework public](framework-public.md).

**Marqueur.** Un repère textuel cherchable entre crochets, conçu pour être retrouvé et traité par les outils. Deux niveaux qui ne se mélangent pas: les marqueurs métier dans vos documents (`[A VALIDER]`, `[A COMPLETER]`, `[ATTENTION]`, `[DECISION]`), et les marqueurs du plan de spécification dans la spec et le code (`[NEEDS CLARIFICATION]`, `[SPEC-NEUTRAL]`). Registre complet et fermé: [Marqueurs](marqueurs.md).

**MCP.** Le protocole ouvert, et le serveur BASE qui l'implémente, pour exposer des opérations médiées aux apps de chat selon le transport et la configuration retenus. Voir [Serveur MCP](../../mcp/README.md).

**Mécanisme.** Une garantie appliquée par du code et protégée par un test, avec des chemins explicites vers l'un et l'autre, par opposition à une consigne en texte. Voir [Mécanismes vérifiés](../trust/mecanismes-verifies.md).

**Méthode.** La manière dont le travail est conduit: étapes, sources faisant autorité, règles, contrôles et décisions humaines. Voir [Le standard BASE](le-standard.md).

**Plancher lexical.** Le classement lexical sans modèle de la stratégie par défaut. Sans ranker externe, il est déterministe pour une même demande, un même corpus et une même configuration; `route_request` le présente comme une indication à vérifier quand un modèle lit la carte. Voir [Routage, process et ressources](routage-process-et-ressources.md).

**Policy.** Une règle d'accès ou d'usage que BASE applique seulement sur les opérations qui passent par le mécanisme concerné. Voir [Framework public](framework-public.md).

**Preuve.** Un élément vérifiable qui soutient une affirmation, tel qu'une fonction, un test, un exemple ou une limite explicite; elle ne garantit pas l'exactitude d'une sortie de modèle. Voir [Vérifier les promesses de BASE](../trust/evidence.md).

**Process.** Un skill de workflow: une façon de faire étape par étape, avec reformulations et points de décision. C'est la cible du routage. Voir [Routage, process et ressources](routage-process-et-ressources.md).

**Projection.** Un fichier dérivé des sources (manifest, registre de routage, index): utile à l'audit ou à l'échelle, supprimable et régénérable. Voir [Comprendre l'approche](../learn/comprendre.md).

**Promotion.** Le passage contrôlé d'une ressource d'un scope à un autre (`base promote`), par exemple de personnel à équipe, via l'écriture médiée. Voir [État d'implémentation](etat-implementation.md).

**Propose/commit.** L'écriture médiée en deux temps: `base propose` montre un diff sans rien écrire, `base commit` applique après votre validation. Voir [Sécurité et limites](../trust/securite-et-limites.md).

**Racine.** Un projet BASE confiné, sélectionné comme périmètre d'une lecture, d'une écriture ou d'une exécution. Voir [Racine et workspace](routage-process-et-ressources.md).

**Ranker.** Un composant configurable qui ajoute un score aux candidats de la stratégie lexicale ou d'une recherche; même fondé sur des embeddings, il ne sélectionne pas la stratégie de routage. Voir [Quickstart routage sémantique](../guides/routage-semantique-quickstart.md).

**Référence.** La description approuvée et versionnée de la méthode à un instant donné, distincte de son exécution par un modèle ou un outil. Voir [Le standard BASE](le-standard.md).

**Ressource.** Tout fichier utile que BASE peut inventorier, découvrir et ouvrir: agent, process, compétence, template, document, données. Voir [Framework public](framework-public.md).

**Route.** Le résultat d'un routage: une racine, un agent et un process sélectionnés, ou une abstention explicite lorsqu'aucun choix n'est assez clair. Voir [Routage, process et ressources](routage-process-et-ressources.md).

**Routeur.** Le composant qui choisit un couple agent puis process pour une demande, ou s'abstient en donnant une raison lisible. Rudimentaire mais efficace, extensible par adaptateurs, il vous épargne la recherche du bon process et ne charge jamais tout. Voir [Routage, process et ressources](routage-process-et-ressources.md).

**Routage.** L'opération qui choisit une route à partir d'une demande et du corpus disponible. Voir [Routage, process et ressources](routage-process-et-ressources.md).

**Scope.** Le périmètre de partage déclaré d'une ressource: `personal`, `team`, `org`, `public`. Les exigences de validation croissent avec le scope. Voir [Framework public](framework-public.md).

**Skill.** Un conteneur portable défini par `SKILL.md`, classé dans l'une de deux catégories: process ou compétence. Voir [Comprendre l'approche](../learn/comprendre.md).

**Source.** L'emplacement ou le système d'origine d'une ressource, par exemple le projet local, un Drive ou une API. Voir [Framework public](framework-public.md).

**Structure BASE.** L'ensemble des ressources et des relations qui décrivent la méthode. Voir [Le standard BASE](le-standard.md).

**Tool.** Un outil exécutable, souvent un script local, qu'un process peut invoquer: en dry-run par défaut, puis avec confirmation. Voir [Framework public](framework-public.md).

**Trace.** Un journal technique JSONL en best-effort (`.ai/trace/`), sans contenu métier par défaut; son écriture peut échouer sans bloquer le travail et son exhaustivité n'est pas garantie. Voir [Protection des données](../trust/protection-des-donnees.md).

**Voie 1 / Voie 2.** Les deux stratégies de routage, retenues par `.ai/studio.settings.json`. La **Voie 1**, ou stratégie `lexical`, est celle par défaut; la **Voie 2**, ou stratégie `embedding`, retrouve des candidats par embeddings puis les soumet à un raffineur. Les rankers de `base.config` sont des extensions de classement distinctes et n'activent aucune voie. Voir [Quickstart routage](../guides/routage-semantique-quickstart.md) et [Voie 2, le routage par embeddings](../guides/voie-2-routage-embeddings.md).

**Workspace.** Plusieurs racines BASE déclarées dans `base.workspace.json`: le routage peut chercher entre elles, chaque action reste confinée à une racine. Voir [Routage, process et ressources](routage-process-et-ressources.md).

---

BASE est un cadre porté par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
