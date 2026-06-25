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

Vous croisez un terme BASE et vous voulez sa définition exacte: cette page la donne en une phrase, avec un lien vers le document qui l'approfondit. C'est la source canonique du vocabulaire; les autres pages pointent ici plutôt que de redéfinir les mêmes termes. L'ordre est alphabétique.

**Abstention.** Quand aucune route n'est assez claire, le routeur refuse de deviner et rend un statut explicite (`ambiguous`, `needs_clarification`, `out_of_scope`) avec une raison lisible. Voir [Routage, process et ressources](routage-process-et-ressources.md).

**Agent.** Un fichier d'instructions (`AGENT.md` et ses skills): du Markdown qui dit au modèle quel rôle tenir, quels process il connaît, quels fichiers consulter et quels garde-fous respecter. C'est sa fiche de poste, et c'est du texte que vous écrivez, possédez et emportez d'un outil IA à l'autre. BASE garde le mot «agent» par compatibilité avec l'écosystème, parce que les modèles le reconnaissent, et non pour désigner une créature autonome: un agent est un fichier, pas une personne. Voir [Comprendre l'approche](../learn/comprendre.md).

**Assistant.** Votre agent animé par un modèle: ce que l'utilisateur final utilise. Vous possédez l'agent (vos fichiers), vous louez le modèle (l'outil IA, qui changera), et de leur rencontre naît l'assistant. Le même agent peut devenir un assistant dans Claude Code et un autre dans Cursor: l'agent est ce que vous gardez, l'assistant ce que vous utilisez. Voir [Comprendre l'approche](../learn/comprendre.md).

**Broker.** Le cœur local qui applique les garanties (confinement, policy, dry-run, trace) pour les actions qui passent par lui, via la CLI ou le MCP. Voir [Sécurité et limites](../trust/securite-et-limites.md).

**Co-pensée.** La science appliquée de l'interaction humain-IA: comment penser, travailler et décider avec une entité dont les représentations internes du monde sont assez compatibles avec les nôtres pour communiquer en langage naturel, sans pour autant partager notre contexte, notre mémoire ni nos garanties. Elle part des fondamentaux de ce qu'il faut expliciter, structurer et vérifier pour qu'une telle collaboration soit fiable, et s'invente par domaine, par métier et par personne. Voir [Pourquoi BASE: co-penser avec l'IA](../learn/co-penser-avec-lia.md).

**Compétence.** Un skill de connaissance réutilisable (TVA, ton de communication, marqueurs) que plusieurs process peuvent consulter. Voir [Comprendre l'approche](../learn/comprendre.md).

**Consigne.** Une instruction en texte, suivie par un modèle coopératif. Utile, mais sujette à dérive, là où un mécanisme tient par construction. Voir [Sécurité et limites](../trust/securite-et-limites.md).

**Dry-run.** L'exécution à blanc d'une tool: BASE montre l'action prévue sans rien exécuter; l'exécution réelle exige une confirmation. Voir [Sécurité et limites](../trust/securite-et-limites.md).

**Embedding.** La représentation vectorielle d'un texte, utilisée par le ranker sémantique optionnel, jamais par le cœur par défaut. Voir [Choisir son provider d'embeddings](../guides/choisir-provider-embeddings.md).

**Fixture de routage.** Une route attendue, déclarée dans `.ai/routing/route-tests.json` et rejouée par `base route-test` pour protéger les routes métier des régressions. Voir [Quickstart routage sémantique](../guides/routage-semantique-quickstart.md).

**Frontmatter.** L'en-tête YAML d'une ressource (id, titre, description, scope): les métadonnées que BASE valide et utilise pour découvrir et router. Voir [Framework public](framework-public.md).

**Harness.** L'outil IA dans lequel vous ouvrez votre BASE (Cursor, Claude Code, ChatGPT via MCP). Les garanties réelles varient selon le harness. Voir [Compatibilité harnesses](compatibilite-harnesses.md).

**Journal.** La mémoire de travail entre sessions, en fichiers dans `.ai/journal/`: l'agent y écrit une entrée à la fin de chaque workflow. Voir [Comprendre l'approche](../learn/comprendre.md).

**Manifest.** `base.manifest.json`, l'index des ressources généré par `base index`: une projection régénérable, jamais une source de vérité. Voir [Framework public](framework-public.md).

**Marqueur.** Un repère texte cherchable entre crochets, conçu pour être retrouvé et traité par les outils. Deux niveaux qui ne se mélangent pas: les marqueurs métier dans vos documents (`[A VALIDER]`, `[A COMPLETER]`, `[ATTENTION]`, `[DECISION]`), et les marqueurs du plan de spécification dans la spec et le code (`[NEEDS CLARIFICATION]`, `[SPEC-NEUTRAL]`). Registre complet et fermé: [Marqueurs](marqueurs.md).

**MCP.** Le protocole ouvert, et le serveur BASE qui l'implémente, pour exposer les primitives du broker aux apps de chat. Lecture seule par défaut. Voir [Serveur MCP](../../mcp/README.md).

**Mécanisme.** Une garantie réellement appliquée par le broker, la CLI ou le MCP, par opposition à une consigne en texte. Voir [Sécurité et limites](../trust/securite-et-limites.md).

**Process.** Un skill de workflow: une façon de faire étape par étape, avec reformulations et points de décision. C'est la cible du routage. Voir [Routage, process et ressources](routage-process-et-ressources.md).

**Projection.** Un fichier dérivé des sources (manifest, registre de routage, index): utile à l'audit ou à l'échelle, supprimable et régénérable. Voir [Comprendre l'approche](../learn/comprendre.md).

**Promotion.** Le passage contrôlé d'une ressource d'un scope à un autre (`base promote`), par exemple de personnel à équipe, via l'écriture médiée. Voir [État d'implémentation](etat-implementation.md).

**Propose/commit.** L'écriture médiée en deux temps: `base propose` montre un diff sans rien écrire, `base commit` applique après votre validation. Voir [Sécurité et limites](../trust/securite-et-limites.md).

**Ranker.** Le composant qui score les candidats d'une recherche ou d'un routage. Lexical par défaut, sémantique en option. Voir [Quickstart routage sémantique](../guides/routage-semantique-quickstart.md).

**Ressource.** Tout fichier utile que BASE peut inventorier, découvrir et ouvrir: agent, process, compétence, template, document, données. Voir [Framework public](framework-public.md).

**Routeur.** Le composant qui choisit un couple agent puis process pour une demande, ou s'abstient avec une raison lisible. Rudimentaire mais efficace, extensible par adaptateurs, il vous évite de chercher vous-même le bon process et ne charge jamais tout. Voir [Routage, process et ressources](routage-process-et-ressources.md).

**Scope.** Le périmètre de partage déclaré d'une ressource: `personal`, `team`, `org`, `public`. Les exigences de validation croissent avec le scope. Voir [Framework public](framework-public.md).

**Skill.** Un fichier `SKILL.md`: du Markdown avec un frontmatter, portable entre outils. Deux types: process et compétence. Voir [Comprendre l'approche](../learn/comprendre.md).

**Tool.** Un outil exécutable, souvent un script local, qu'un process peut invoquer: en dry-run par défaut, puis avec confirmation. Voir [Framework public](framework-public.md).

**Trace.** Le journal technique minimal en JSONL (`.ai/trace/`): identifiants, décisions, durées, jamais le contenu métier par défaut. Voir [Protection des données](../trust/protection-des-donnees.md).

**Voie 1 / Voie 2.** Les deux stratégies de routage, choisies par la configuration. La **Voie 1** est le défaut: l'assistant lit l'index généré et choisit, sous un plancher déterministe; le code l'appelle la *stratégie lexicale*. La **Voie 2** est optionnelle, pour les grands catalogues: des embeddings retrouvent quelques candidats et un petit modèle raffine; le code l'appelle la *stratégie par embeddings*. Les deux voies sont indépendantes. Voir [Quickstart routage](../guides/routage-semantique-quickstart.md) et [Voie 2, le routage par embeddings](../guides/voie-2-routage-embeddings.md).

**Workspace.** Plusieurs racines BASE déclarées dans `base.workspace.json`: le routage peut chercher entre elles, chaque action reste confinée à une racine. Voir [Routage, process et ressources](routage-process-et-ressources.md).

---

BASE est un framework par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
