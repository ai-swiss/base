# Installer le serveur MCP de BASE

Quand votre outil IA ne lit pas directement vos fichiers, ou quand vous voulez partager un agent au-delà de votre poste, le serveur MCP est le chemin à suivre: il rend vos agents BASE accessibles depuis n'importe quelle plateforme compatible, sans recopier votre travail à la main. En contrepartie, vous exposez un dossier de votre projet à un outil tiers, ce qui demande quelques garde-fous (voir plus bas). Le serveur MCP (Model Context Protocol) relie vos agents BASE aux plateformes compatibles: ChatGPT, Claude Desktop et les outils IA capables de parler MCP (par exemple GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code).

## Prérequis

- Node 18 ou plus (`node --version` pour vérifier). C'est la seule dépendance du cœur de BASE.
- Le dépôt BASE en local. Pas encore le dépôt? Voir [Obtenir BASE](obtenir-base.md).

## 1. Construire le serveur

```bash
cd mcp/
npm install
npm run build
```

## 2. Lancer le serveur

```bash
npm start -- --root /chemin/vers/votre/projet
```

Sans `--root`, le serveur détecte la racine BASE la plus proche de son dossier de lancement. Pour un usage durable, préférez une racine explicite.

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

La configuration est identique dans les autres outils IA capables de parler MCP (par exemple GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code): reportez le même bloc dans leurs paramètres MCP.

Les outils grand public compatibles MCP, comme ChatGPT (via son mode développeur), peuvent aussi se brancher sur ce serveur MCP local. L'activation et ses conditions du moment se font dans l'outil, selon sa documentation officielle: BASE n'en fait pas un parcours guidé et n'en dépend pas.

### Première demande

Une fois la plateforme connectée, demandez:

> «Quels agents j'ai?»

puis «Charge mon agent assistant-devis» et enfin «Bonjour, je voudrais configurer mon activité». La suite du parcours est dans le [démarrage express](quickstart.md).

## Sécurité: lecture seule et authentification

Deux garde-fous sont actifs par défaut:

- **Lecture seule en HTTP.** En transport HTTP, les outils d'écriture et d'exécution ne sont pas enregistrés: la surface est donc, de façon vérifiable, en lecture seule. `--read-write` l'élargit explicitement, à réserver aux déploiements authentifiés. En `stdio` (usage local), la surface complète du broker est disponible, écritures médiées comprises.
- **Exposition réseau refusée sans authentification.** Lier une interface non-loopback (`--host 0.0.0.0`, une IP de LAN) sans authentification est refusé au démarrage. Si vous acceptez le risque (réseau de confiance, tunnel maîtrisé), `mcp/README.md` documente l'échappatoire explicite `BASE_MCP_ALLOW_INSECURE_REMOTE=1`. Définissez `BASE_MCP_BEARER_TOKEN` pour exiger un jeton bearer, l'option recommandée pour une équipe:

```bash
BASE_MCP_BEARER_TOKEN=un-secret-long-et-aleatoire npm start -- --transport http --host 0.0.0.0 --root /chemin/vers/votre/projet
```

Pour une authentification sur mesure (OAuth, mTLS), fournissez un `AuthProvider` via `base.config.mjs`, ou placez le serveur derrière un reverse proxy authentifié.

La lecture seule reste sensible: les outils de lecture exposent les ressources et fichiers confinés au projet. N'exposez pas en MCP un dossier qui contient des secrets ou des données hors périmètre pour le client connecté.

## Dépannage de base

| Symptôme | Piste |
| --- | --- |
| `npm: command not found` | Installer Node 18 ou plus depuis [nodejs.org](https://nodejs.org) |
| Le serveur refuse de démarrer en réseau | Comportement attendu sans authentification: définir `BASE_MCP_BEARER_TOKEN` |
| La plateforme ne voit aucun agent | Vérifier le chemin passé à `--root` et que le projet contient `.ai/agents/*/AGENT.md` |
| Blocage sur une étape technique | Demander à votre IA: «J'ai cette erreur: [coller l'erreur]. Que se passe-t-il?» |

## Pour aller plus loin

[mcp/README.md](../../mcp/README.md) détaille les outils exposés (`load_agent`, `route_request`, `propose_change`, etc.), le mode multi-racines (`--workspace`), le déploiement d'équipe derrière un reverse proxy et les limites: le MCP ne remplace ni IAM, ni DLP, ni archivage.

---

BASE est un framework par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
