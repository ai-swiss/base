# BASE MCP Server

Expose vos agents BASE sur n'importe quelle plateforme IA : ChatGPT, Claude, Cursor, etc.

## Installation

```bash
cd mcp/
npm install
npm run build
```

Ou avec make :

```bash
cd mcp/
make install
make build
```

## Utilisation

### Local (Cursor, Claude Desktop, VS Code)

```bash
npm start -- --root /chemin/vers/votre/projet
```

> **Sans installation manuelle.** Une fois le paquet publié, `npx @ai-swiss/base-mcp --root /chemin/vers/votre/projet` lance le serveur directement : le broker BASE est embarqué dans le paquet (`dist/`), donc aucun dépôt environnant n'est requis.

Sans `--root`, le serveur détecte la racine BASE ou le workspace le plus proche depuis son dossier de lancement. Pour un usage durable, préférez une configuration explicite (la commande `npx @ai-swiss/base-mcp` est disponible sur npm à partir de la publication; en attendant, lancez le serveur depuis le dépôt cloné: `node mcp/dist/index.js` après `npm --prefix mcp run build`):

```bash
npx @ai-swiss/base-mcp --root /chemin/vers/votre/projet
npx @ai-swiss/base-mcp --workspace /chemin/vers/base.workspace.json --root-id innovaud
```

Avec `--workspace` sans `--root-id`, `load_agent` liste les agents qualifiés par racine (`innovaud/assistant-devis`) et `route_request` peut router entre les racines déclarées. Les outils qui lisent, écrivent, exécutent, promeuvent ou listent des marqueurs restent confinés à une racine sélectionnée. Quand plusieurs racines sont visibles, passez le `root_id` retourné par `route_request` ou `load_agent`; sinon l'outil refuse l'action au lieu de choisir une racine implicitement.

Les réponses des outils indiquent la racine ou le workspace sélectionné; l'utilisateur ne doit pas lire les logs serveur pour comprendre le contexte actif.

Ou en développement (auto-reload) :

```bash
npm run dev -- --root /chemin/vers/votre/projet
```

Raccourci make (détecte automatiquement la racine du repo) :

```bash
make start   # production
make dev     # développement
make check   # build + tests
```

### Remote (ChatGPT, accès équipe, web)

```bash
npm start -- --transport http --port 3100 --root /chemin/vers/votre/projet
```

Le serveur écoute sur `http://127.0.0.1:3100/mcp` (localhost uniquement par défaut).

**Exposition réseau refusée par défaut.** Par défaut, BASE MCP n'active aucune authentification. Lier une interface non-loopback (`--host 0.0.0.0`, une IP de LAN, etc.) **sans authentification** est donc **refusé au démarrage** : sinon n'importe qui sur le réseau pourrait atteindre les outils MCP exposés. En HTTP, la surface est en lecture seule par défaut, mais elle peut être élargie explicitement.

**Garde anti-DNS-rebinding (loopback).** Quand le serveur écoute sur loopback (le défaut), une page web ouverte dans votre navigateur ne peut pas l'atteindre par rebinding DNS : l'endpoint MCP refuse (403) toute requête dont l'en-tête `Host` n'est pas loopback ou dont l'`Origin` est étrangère, avant toute authentification. Un client MCP local (sans `Origin`, `Host` loopback) passe normalement. Sur un bind non-loopback assumé, c'est l'authentification qui protège, et cette garde se retire.

**Option recommandée : un jeton bearer.** Définissez `BASE_MCP_BEARER_TOKEN`. Le serveur exige alors l'en-tête `Authorization: Bearer <jeton>` sur `/mcp`, l'exposition réseau est autorisée (le refus est levé), et c'est l'option «assez bien pour une équipe» entre rien et OAuth complet :

```bash
BASE_MCP_BEARER_TOKEN=un-secret-long-et-aleatoire npm start -- --transport http --host 0.0.0.0 --root /chemin/vers/votre/projet
```

Pour une authentification sur mesure (OAuth, mTLS…), fournissez un `AuthProvider` via `base.config.mjs` (clé `auth`), ou placez le serveur derrière un reverse proxy authentifié (voir plus bas).

Si vous savez ce que vous faites (réseau de confiance, tunnel maîtrisé) et acceptez le risque, forcez l'exposition **sans** authentification :

```bash
BASE_MCP_ALLOW_INSECURE_REMOTE=1 npm start -- --transport http --host 0.0.0.0 --root /chemin/vers/votre/projet
```

### Connecter le MCP, c'est choisir une surface d'action

En `stdio`, le serveur expose la surface complète du broker par défaut: lecture, écriture médiée (`propose_change` / `commit_change` / `promote_resource`) et exécution d'outils (`invoke_tool`). Ce mode est local et destiné aux outils que vous lancez sur votre machine. Même en `stdio`, le confidentiel reste retenu par défaut (voir la puce «Confidentiel retenu par défaut» plus bas): le serveur ne présume pas que le client connecté est local.

En `http`, le serveur est **en lecture seule par défaut**. Les outils d'écriture et d'exécution ne sont alors **pas enregistrés**: la surface est prouvablement en lecture seule.

Lecture seule signifie: pas d'écriture et pas d'exécution. Les outils de lecture restent disponibles et peuvent exposer les ressources ou fichiers confinés au projet via `open_resource` et `access_resource`. N'exposez donc pas en MCP un dossier qui contient des secrets, des exports privés ou des fichiers hors périmètre pour le client connecté.

```bash
npm start -- --transport http --root /chemin/vers/votre/projet
```

Pour autoriser explicitement l'écriture et l'exécution en HTTP, utilisez `--read-write` ou `BASE_MCP_READ_ONLY=0`, puis ajoutez une authentification et une policy adaptée.

```bash
BASE_MCP_BEARER_TOKEN=un-secret-long-et-aleatoire npm start -- --transport http --read-write --root /chemin/vers/votre/projet
```

- **Confidentiel retenu par défaut**: le serveur ne peut pas vérifier si le client connecté est un modèle local ou distant, donc il applique l'egress comme pour un modèle distant: une ressource `confidential: true`, ou toute ressource d'un root `egress: local-only`, n'est ni lue (`open_resource`/`access_resource` renvoient un avis «retenu») ni même listée (`discover_resources`). Si vous savez que le client connecté est local et de confiance, autorisez-les avec `BASE_MCP_ALLOW_CONFIDENTIAL=1`.
- **Lecture seule explicite**: `--read-only` ou `BASE_MCP_READ_ONLY=1` forcent la surface lecture seule, y compris en `stdio`.
- **Confirmation d'exécution forcée à distance**: en HTTP, une tool qui désactive sa propre confirmation (`requires_confirmation: false`) n'est **jamais** honorée. L'exécution non-dry-run exige toujours un `confirmed: true` explicite du client.
- **Politique stricte recommandée en partage**: gardez la politique d'application en `strict` (via `base.config`) pour les déploiements partagés/distants, afin que les écritures sensibles exigent une confirmation côté serveur.
- **Jeton de grant (`grant_token`)**: les outils de lecture/écriture/exécution acceptent un paramètre optionnel `grant_token`, transmis tel quel à la politique. Une politique `strict` peut exiger ce jeton pour autoriser une ressource `restricted` (`strictPolicy({ grants })`). C'est un **secret porteur**, distinct de l'authentification du transport: traitez-le comme un mot de passe (haute entropie), ne le partagez qu'avec les clients autorisés. BASE ne le journalise jamais et ne le renvoie jamais au client.

## Configuration des plateformes

### Claude Desktop

Dans `claude_desktop_config.json` :

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

### Cursor

Dans les paramètres MCP de Cursor, ajoutez un serveur :

```json
{
  "base": {
    "command": "node",
    "args": ["/chemin/vers/mcp/dist/index.js", "--root", "/chemin/vers/votre/projet"]
  }
}
```

### ChatGPT et autres outils grand public

Les outils grand public compatibles MCP, comme ChatGPT (via son **mode développeur**, en bêta à ce jour), se branchent sur ce serveur. Côté BASE: exposez le transport HTTP avec un jeton bearer (voir ci-dessus). Côté outil: l'activation, les écrans et leurs conditions changent et relèvent de la documentation officielle, [developer.openai.com: Developer Mode](https://developers.openai.com/api/docs/guides/developer-mode) pour ChatGPT. BASE n'en fait pas un parcours guidé et n'en dépend pas.

**Sécurité, en une règle.** Le serveur Node écoute sur `127.0.0.1` seulement; n'exposez un endpoint sur le réseau que derrière une authentification (jeton bearer, ou un reverse proxy avec TLS et OAuth pour un usage d'équipe), jamais un vrai projet via un tunnel public non authentifié. Les outils MCP délèguent au broker BASE local (confinement, refus des symlinks sortants, dry-run, confirmation, trace minimale); ils ne remplacent pas les politiques IAM, DLP, SIEM ou rétention de l'organisation.

## Comment ça marche

Le serveur MCP est un adaptateur. Il expose les primitives publiques du broker BASE, plus `load_agent` comme bootstrap léger de compatibilité :

- `load_agent` : charge seulement `AGENT.md`, le catalogue des ressources et les références de données; il ne charge pas tous les skills, templates, tools ou données métier.
- `discover_resources` : recherche locale explicable dans les ressources BASE. La réponse est limitée aux métadonnées de découverte; ouvrez ensuite une ressource avec `open_resource` ou `access_resource` pour lire son contenu sous policy BASE.
- `route_request` : route une demande vers le bon agent et process, ou s'abstient honnêtement (statut + candidats + raisons). Si le projet a configuré `routing.fallback`, une abstention porte un `fallback` (agent → process d'aide) à charger pour ne pas laisser l'utilisateur sans suite. C'est une métadonnée séparée, jamais une fausse route.
- `open_resource` : ouvre une ressource par ID ou chemin relatif.
- `access_resource` : lit un fichier local confiné au projet, sous policy BASE. Le fichier doit aussi être accessible par les droits natifs de l'environnement.
- `invoke_tool` : prépare ou exécute une tool locale, avec dry-run par défaut et confirmation explicite avant exécution.
- `propose_change` : prépare une écriture médiée et retourne un diff sans écrire le fichier cible.
- `commit_change` : applique une proposition après confirmation et vérification.
- `promote_resource` : prépare la promotion d'une ressource vers un scope plus large via le même flux médié.
- `list_markers` : liste les marqueurs ouverts (`[A VALIDER]`, `[A COMPLETER]`, `[ATTENTION]`, `[DECISION]`).

`load_agent` découvre les agents du root configuré et des sous-projets BASE imbriqués. Un sous-projet est un dossier qui contient `.ai/agents/*/AGENT.md`; ses ressources restent lues depuis ce dossier, pas depuis le root parent. Cette règle permet de placer librement plusieurs assistants dans des dossiers métier sans fusionner leurs inventaires.

### Lister les agents

> «Quels agents j'ai ?»

→ La plateforme appelle `load_agent()` → retourne la liste des agents disponibles.

### Charger un agent

> «Charge mon agent assistant-devis»

→ La plateforme appelle `load_agent(name: "assistant-devis")` → retourne le bootstrap de l'agent (`AGENT.md`), le catalogue des ressources disponibles et la liste des données métier accessibles.

### Accéder aux ressources nécessaires

> «Je dois préparer un devis client»

→ La plateforme appelle `route_request(request: "Je dois préparer un devis client")` → retourne l'agent et le process proposés, ou une question si le choix est ambigu.

> «Trouve les ressources liées aux devis clients»

→ La plateforme appelle `discover_resources(query: "devis clients")` → retourne les ressources classées avec raisons de ranking.

> «Ouvre le process nouveau devis»

→ La plateforme appelle `open_resource(id_or_path: "nouveau-devis")` → retourne la ressource choisie.

> «Lis le catalogue de services nécessaire au devis»

→ La plateforme appelle `access_resource(path: "donnees/catalogue-services.json", purpose: "préparer le devis")` → retourne seulement la donnée demandée, avec la justification transmise au broker.

### Écrire avec validation

> «Propose une mise à jour du devis»

→ La plateforme appelle `propose_change(...)` → retourne un `change_id` et un diff lisible, sans modifier le fichier cible.

> «J'ai relu, applique ce changement»

→ La plateforme appelle `commit_change(change_id: "...", confirmed: true)` → re-vérifie la décision, protège contre les modifications concurrentes, écrit puis vérifie le résultat.

## Spécifications

Voir [Framework public BASE](../docs/reference/framework-public.md) pour les abstractions, le routeur local et les extensions enterprise documentées.

---

BASE est un framework par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
