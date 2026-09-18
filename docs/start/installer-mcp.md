---
schema_version: base.resource.v1
id: installer-mcp
type: document
title: Installer le serveur MCP de BASE
description: Brancher le serveur MCP pour rendre vos agents accessibles depuis ChatGPT, Claude Desktop et toute plateforme compatible, avec les garde-fous qui accompagnent l'exposition d'un dossier à un outil tiers.
scope: public
status: active
sensitivity: public
keywords: [mcp, serveur, installer, chatgpt, claude, plateforme, connecteur, brancher]
---

# Installer le serveur MCP de BASE

Lorsque votre outil IA ne lit pas directement vos fichiers, ou lorsque vous souhaitez partager un agent au-delà de votre poste, c'est au serveur MCP (Model Context Protocol) qu'il faut recourir: il rend vos agents BASE accessibles depuis n'importe quelle plateforme compatible, sans que vous ayez à recopier votre travail à la main. En contrepartie, vous exposez un dossier de votre projet à un outil tiers, ce qui appelle quelques garde-fous (voir plus bas). Il relie vos agents BASE aux plateformes compatibles: ChatGPT, Claude Desktop et les outils IA capables de dialoguer en MCP.

## Prérequis

- [Node 18.14.1 ou plus](https://nodejs.org), avec `node` et `npm` accessibles dans le `PATH` (`node --version` et `npm --version` permettent de vérifier). Le cœur de BASE accepte Node 18 ou plus; le serveur MCP exige au minimum 18.14.1.
- Un terminal ouvert sur votre poste.
- L'implémentation de référence de BASE en local. Pas encore le dépôt? Voir [Obtenir BASE](obtenir-base.md).

## 1. Construire le serveur

```bash
cd <BASE_DIR>/mcp
npm install
npm run build
```

## 2. Lancer le serveur

```bash
npm start -- --root /chemin/vers/votre/projet
```

Sans `--root`, le serveur détecte la racine BASE la plus proche de son dossier de lancement. Pour un usage durable, mieux vaut indiquer une racine explicite.

## 3. Connecter votre plateforme

### Claude Desktop

Dans `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "base": {
      "command": "node",
      "args": ["/chemin/vers/mcp/dist/index.js", "--root", "/chemin/vers/votre/projet"]
    }
  }
}
```

La configuration est la même dans les autres outils IA capables de dialoguer en MCP: reportez le même bloc dans leurs paramètres MCP.

Les outils grand public compatibles MCP, comme ChatGPT (via son mode développeur), peuvent eux aussi se brancher sur ce serveur MCP local. L'activation et ses conditions du moment relèvent de l'outil et de sa documentation officielle: BASE n'en fait pas un parcours guidé et n'en dépend pas.

### Première demande

Une fois la plateforme connectée, demandez:

> «Quels agents j'ai?»

puis «Charge mon agent assistant-devis» et enfin «Bonjour, je voudrais configurer mon activité». La suite du parcours est dans le [démarrage express](quickstart.md).

## Sécurité: lecture seule et authentification

Deux garde-fous sont actifs par défaut sur les requêtes qui passent par ce serveur:

- **HTTP en lecture seule par défaut; `stdio` avec surface médiée complète.** En transport HTTP, les outils d'écriture et d'exécution ne sont pas enregistrés par défaut. `--read-write` élargit explicitement cette surface, à réserver aux déploiements authentifiés. En `stdio` (usage local), le composant de médiation, appelé broker, expose sa surface médiée complète, y compris les écritures.
- **Exposition réseau refusée sans authentification.** Lier une interface non-loopback (`--host 0.0.0.0`, une IP de LAN) sans authentification est refusé dès le démarrage. Si vous en acceptez le risque (réseau de confiance, tunnel maîtrisé), `mcp/README.md` documente l'échappatoire explicite `BASE_MCP_ALLOW_INSECURE_REMOTE=1`. Définissez `BASE_MCP_BEARER_TOKEN` pour exiger un jeton bearer, l'option recommandée pour une équipe:

```bash
BASE_MCP_BEARER_TOKEN=un-secret-long-et-aleatoire npm start -- --transport http --host 0.0.0.0 --root /chemin/vers/votre/projet
```

Pour une authentification sur mesure (OAuth, mTLS), fournissez un `AuthProvider` via `base.config.mjs`, ou placez le serveur derrière un reverse proxy authentifié.

La lecture seule n'est pas pour autant anodine: les outils de lecture donnent accès aux ressources et aux fichiers confinés au projet. Ces protections ne couvrent pas une lecture directe des fichiers ni un autre chemin d'exécution. N'exposez pas en MCP un dossier qui renferme des secrets ou des données hors périmètre pour le client connecté.

## Dépannage de base

| Symptôme | Piste |
| --- | --- |
| `npm: command not found` | Installer Node 18.14.1 ou plus depuis [nodejs.org](https://nodejs.org) |
| Le serveur refuse de démarrer en réseau | Comportement attendu sans authentification: définir `BASE_MCP_BEARER_TOKEN` |
| La plateforme ne voit aucun agent | Vérifier le chemin passé à `--root` et que le projet contient `.ai/agents/*/AGENT.md` |
| Blocage sur une étape technique | Demander à votre IA: «J'ai cette erreur: [coller l'erreur]. Que se passe-t-il?» |

## Pour aller plus loin

[mcp/README.md](../../mcp/README.md) détaille les outils exposés (`load_agent`, `route_request`, `propose_change`, etc.), le mode multi-racines (`--workspace`), le déploiement d'équipe derrière un reverse proxy, ainsi que les limites du dispositif: le MCP ne remplace ni IAM, ni DLP, ni archivage.

**Prochaine action:** connectez votre plateforme comme indiqué à l'étape 3, puis vérifiez la connexion avec la première demande proposée.

---

BASE est une convention ouverte accompagnée d'une implémentation de référence, portée par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
