---
schema_version: base.resource.v1
id: integrer-un-outil
type: process
title: Intégrer BASE à un outil
scope: team
status: active
sensitivity: internal
name: integrer-un-outil
description: "Guider l'intégration de BASE à un outil ou une plateforme précis: agents planifiés, agents autonomes, connexion via MCP. Lit la documentation de l'outil (fournie ou cherchée) et adapte le principe générique."
use_when: Quand l'utilisateur veut intégrer BASE à un outil ou une plateforme précis, faire tourner un agent planifié ou autonome, ou connecter BASE à une suite IA.
routing:
  examples:
    - Comment intégrer BASE à mon outil ?
    - Faire tourner un agent planifié à partir d'un process BASE
    - Connecter BASE à ma plateforme d'agents
    - Mettre en place un agent autonome avec BASE
  avoid_when:
    - Comprendre la vision ou la méthode de BASE en général.
argument-hint: "[l'outil ou la plateforme visé, et un lien vers sa doc si possible]"
user-invocable: true
allowed-tools: Read
---

# Intégrer BASE à un outil

Le principe est le même pour tous les outils; seuls les détails changent. Ton rôle: poser le principe, puis l'adapter à l'outil précis de l'utilisateur en t'appuyant sur **la documentation de cet outil**.

## Sources à lire d'abord

- `docs/reference/base-et-vos-outils-ia.md` (le principe: couche d'intelligence possédée vs exécution; agents planifiés; la couture de vérification)
- `mcp/README.md` (comment exposer et appeler le serveur MCP de BASE)

## Étapes

1. **Identifier l'outil.** Demande à l'utilisateur de quel outil ou plateforme il s'agit (planificateur, plateforme d'agents, suite IA), et ce qu'il veut faire (agent planifié, autonome, simple connexion).
2. **Obtenir la documentation de l'outil.**
   - Demande un lien vers la documentation d'intégration de cet outil (déclencheurs planifiés, agents, support de MCP, étapes de validation humaine).
   - Si ton environnement permet la navigation web, propose de la chercher toi-même, puis fais valider la source à l'utilisateur.
   - Ne devine pas les capacités d'un produit: appuie-toi sur sa doc à jour, et signale ce que tu n'as pas pu vérifier.
3. **Adapter le principe générique** (de `base-et-vos-outils-ia.md`) à cet outil, plan par plan:
   - le **planificateur** de l'outil lance l'exécution;
   - l'**agent d'exécution** appelle le **serveur MCP de BASE** pour obtenir le process et ses ressources;
   - la **génération** se fait avec le modèle et les connecteurs de l'outil;
   - aux **points de décision**, l'agent **s'arrête pour validation humaine** (repère le mode «brouillon» ou «exiger une approbation» de l'outil);
   - après approbation, l'écriture est **appliquée** (proposition puis application côté BASE).
4. **Garder la couture de vérification.** Rappelle la règle: la génération peut être automatique, la validation reste tenue. Aide l'utilisateur à calibrer, étape par étape, ce qui est automatique et ce qui attend un humain.
5. **Donner des étapes concrètes et vérifiables**, dans l'ordre, propres à l'outil, et proposer un premier essai à faible risque (mode brouillon).

## Ce que tu ne fais jamais

- Affirmer des capacités d'un outil que sa documentation ne confirme pas.
- Mettre la logique métier dans la plateforme plutôt que dans BASE.
- Proposer un agent qui écrit ou agit sans point de validation humain quand l'action a des conséquences.
