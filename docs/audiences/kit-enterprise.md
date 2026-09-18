---
schema_version: base.resource.v1
id: kit-enterprise
type: document
title: Déployer BASE en organisation
description: Ce que les fichiers, le routeur et le composant de médiation de BASE apportent en organisation, leurs limites, une configuration stricte et les modes de déploiement.
scope: public
status: active
sensitivity: public
keywords: [entreprise, gouvernance, strict, policy, validators, deploiement, configuration, securite]
---

# Déployer BASE en organisation

Déployer un dossier BASE en organisation, c'est décider qui peut faire quoi avec vos assistants et garder la main sur les actions sensibles, sans céder votre savoir-faire à une plateforme. L'enjeu, pour une équipe ou une DSI: maîtriser ce que chaque fichier, outil et intégration applique réellement, puis choisir un mode de déploiement à la mesure de vos exigences. Les fichiers apportent un langage de l'expertise; le broker, composant de médiation de BASE, peut médier certaines actions sensibles. Ni l'un ni l'autre ne remplace IAM, SSO, RBAC, DLP, SIEM ou la rétention réglementaire (voir [Sécurité et limites](../trust/securite-et-limites.md)).

Avant de choisir les contrôles, reprenez la distinction entre méthode, structure, référence approuvée et exécution dans le [diagnostic de la carte des publics](pour-qui.md).

## Ce qui est réellement appliqué

Les règles mécaniques ne s'appliquent qu'aux actions qui passent par le broker, la CLI, le MCP ou un connecteur contrôlé. Selon ce chemin, le code applique le confinement des chemins, le flux proposer puis acter, le dry-run des outils, des traces minimales ou une politique configurée via `base.config.{json,mjs}`. Le routeur propose le workflow adapté ou s'abstient; il n'applique pas les permissions.

Les fichiers peuvent rester locaux alors qu'un outil en projette des extraits vers un modèle distant. Sur les chemins médiés, l'égress est permissif par défaut (`any`): le broker retient une ressource seulement si elle est marquée `confidential: true` ou si sa racine est `local-only`. Le champ `sensitivity` sert à classer; il ne déclenche pas cette retenue. Un accès direct aux fichiers contourne ces contrôles.

La séparation entre instructions et contenu facilite la revue, mais elle ne prévient pas à elle seule l'injection de prompt. Une défense réelle combine réduction du contexte, contrôles techniques, permissions et validation humaine.

## Exemple de configuration stricte

`base.config.mjs` est du code projet de confiance, chargé uniquement depuis la racine confinée du BASE, jamais depuis des données de ressources. Les mêmes descripteurs fonctionnent en `base.config.json`; le format `.mjs` permet en outre de passer des fonctions pour les cas avancés.

```js
// base.config.mjs : configuration stricte (équipe / organisation).
export default {
  // Enforcement médié : exige un grant pour les lectures restreintes,
  // et une confirmation explicite pour les écritures et invocations.
  policy: { type: "strict", grants: ["devis:nouveau-devis"] },

  // Validateurs d'organisation, appliqués par `node .ai/base.mjs validate --root .`.
  validators: [
    { type: "requireSchemaVersion" },
    { type: "requireFields", fields: ["owner", "review_date"], whenScope: "team" },
    { type: "forbidSensitivity", level: "restricted" },
    { type: "piiScanner", patterns: ["\\b\\d{13,16}\\b"], severity: "error" },
    { type: "routability" },
  ],

  // Seuils de routage plus prudents, et repli vers le concierge sur abstention honnête.
  routing: {
    floor_score: 40,
    top2_margin: 0.15,
    max_candidates: 5,
    fallback: { agent: "concierge-base", process: "accueil" },
  },
};
```

Le fallback ci-dessus cherche `concierge-base` dans la racine déployée, puis dans le cadre BASE
installé. Si vous distribuez une copie autonome sans ce cadre, pointez-le vers un accueil local
équivalent.

Pour le MCP, ajoutez un descripteur `auth` (jeton porteur ou `AuthProvider` maison): le serveur MCP refuse de toute façon toute exposition non-loopback dépourvue d'authentification (voir [`mcp/`](../../mcp/)).

## Modes de déploiement

| Mode | Médiation | Pour qui |
| --- | --- | --- |
| Local, navigateur seul | Aucune (consignes suivies par le modèle) | Découverte, sans installation |
| Outil IA + dossier | Faible (l'outil suit le routage) | Individu, première mise en place |
| CLI locale | Forte sur les actions médiées (propose/commit, dry-run) | Équipe, entretien d'un BASE |
| MCP authentifié | Lecture seule par défaut, écritures explicites, auth requise hors loopback | Intégration multi-clients |
| Politique stricte (`policy: { type: "strict" }`) | Grants de lecture et confirmations explicites sur les actions médiées | Organisation, gouvernance fine |

## Votre prochaine action

Faites relire [Sécurité et limites](../trust/securite-et-limites.md) par les responsables métier, sécurité et conformité, puis consignez le mode de déploiement et les contrôles externes exigés avant tout essai avec des données réelles.
