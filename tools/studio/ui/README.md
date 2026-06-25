# BASE Studio (UI)

**Votre outil IA est l'expérience; Studio est l'atelier.** Le quotidien se passe dans vos fichiers,
avec Claude Code ou Cursor; Studio est là pour bâtir, évaluer et soigner ce que ces fichiers contiennent.

Browse, search, edit and evaluate the resources BASE picks up — a thin React + Vite + TypeScript app
that talks to the Studio API server (`tools/studio/server.mjs`). Deliberately lean: no UI framework
beyond React, plain CSS, so the dependency surface stays small and legible. Loopback only.

## Run it (one command)

```bash
cd tools/studio/ui
npm install
npm run dev                       # serves the UI + the API against exemples/assistant-devis
# npm run dev -- exemples/assistant-rh    # against another BASE root
```

- UI: http://127.0.0.1:5174
- API: http://127.0.0.1:4319 (the Vite dev server proxies `/api` to it)

`npm run dev` starts both the API server and Vite together; Ctrl-C stops both.

## Security: loopback only, no authentication

The API has **no authentication** and exposes write endpoints (`/api/propose`, `/api/commit`) and an
evaluation launch (`/api/experiments/run`) that can call model providers with the server's own API
keys. It is meant for local single-user use and binds `127.0.0.1` by default. This is **mechanically
enforced**: the standalone server **refuses to bind a non-loopback `--host`** (it exits with an
error) unless you explicitly set `BASE_STUDIO_ALLOW_INSECURE_REMOTE=1` — and even then you should put
it behind an authenticated reverse proxy. Do not expose Studio on a shared network.

## Build

```bash
npm run build       # tsc --noEmit && vite build  → dist/
npm run preview
```

## What's here today

- **Parcourir — l'explorateur** : l'arbre montre la vérité du disque (workspace multi-roots : un
  nœud `⌂` par root, le défaut déplié) ; le filtre est une liste de cases par type avec case
  maîtresse tri-état (aucune case = structure complète, non-ressources atténuées) ; un dossier
  cliqué montre toute sa descendance en **cartes pleine largeur**, groupées par root puis dossier,
  en-têtes cliquables. La recherche élague l'arbre, classe les cartes par pertinence (raisons
  affichées) et reste scopée au nœud sélectionné, avec sortie «Chercher partout». L'état (root,
  dossier, filtres, requête, carte ouverte) vit dans le hash : recharger ou partager restaure tout.
- **La carte extensible** : un clic n'importe où étend la carte en place (une seule à la fois) ;
  corps directement éditable, métadonnées dans «Détails» replié ; la barre «Modifications non
  écrites» n'apparaît que si le contenu change ; **Proposer** montre le diff, **Valider** écrit —
  propose→commit, serializer strict, TOCTOU : rien n'est écrit sans diff validé. ⌘S propose,
  ⌘Entrée valide, Échap replie (garde si modifié). Les non-ressources s'ouvrent en lecture seule.
- **Le chat co-penseur** : panneau droit de la carte étendue — le document reste visible. Le modèle
  (choisi dans un sélecteur style Cursor, mémorisé par surface) reçoit le document, le **process de
  méthode BASE** du kind édité, le **context pack** (les fichiers que le process déclare, sous
  budget) et des outils de lecture confinés ; chaque suggestion arrive en **diff dans le document** (le chat
  annonce, le document montre) — Appliquer passe par le même commit que l'édition manuelle. La conversation se compacte en mémoire de
  protocole («Mémoire : N messages résumés», résumé lisible).
- **Réglages** : providers (`openai-compatible`, `ollama`, `anthropic`, `google`), alias, défauts
  d'évaluation. Découverte des modèles par provider (repli «hors ligne»), test de connexion avec
  l'URL réellement appelée.
- **Évaluations** : le **Pulse** d'abord — une barre par exécution, colorée par verdict,
  groupée par jour, un seul chiffre en tête (taux de réussite + delta vs période précédente,
  affiché seulement si la comparaison est honnête) ; survol = détail, clic = la carte du run.
  En dessous, recherche + **chips façon Drive** (Process, Verdict, Mode d'échec, Modèle,
  Période) : compteurs dans les popovers, chip actif avec ✕, chips inutiles masqués, toute la
  sélection dans le hash (rechargez, partagez : tout se restaure). Une seule sélection pilote
  chips, Pulse et cartes. Le lancement vit dans un **panneau latéral** («▶ Évaluer», en haut
  à droite, focus piégé, Échap ferme), pré-rempli par les défauts des Réglages ; pendant un
  run : pastille «⏳ scénario 2/5», carte squelette, résultats au fil de l'eau. Les modèles
  s'affichent par leur alias. «Évaluer ▶» depuis une carte process arrive panneau ouvert ;
  «← Retour à Parcourir» restaure Parcourir exactement.
- **Bandeau doctor** : le compteur de signaux de `base doctor` (liens morts, orphelines, évals
  périmées, relectures échues, frictions ouvertes), liste au clic, jamais de modale.

## L'écran Bienvenue (bootstrap)

Lancé sur un dossier qui n'est pas encore un BASE, Studio n'affiche pas une page vide : il
détecte la situation (Markdown en vrac — et vous félicite si des SKILL.md imités existent
déjà —, collection de BASE voisins, dossier vide), liste les fichiers EXACTS qu'il créerait
(chacun dépliable, contenu intégral lisible avant le clic) et propose «Créer ces fichiers».
Le serveur recalcule le plan lui-même (le navigateur n'envoie jamais de contenu) et l'applique
en création seule, puis l'application bascule en mode normal sans redémarrer. La même logique
sert la CLI : `base init [--yes]`.

## La revue, dans l'éditeur

Toute écriture passe par une revue qui montre LE DOCUMENT, dans le cadre même de l'éditeur
(même boîte, même police) : les lignes changées colorées à leur position réelle, le passage
modifié surligné dans la ligne, et seules les plages identiques de plus de 40 lignes se
replient («⋯ N lignes identiques»). Chaque bloc de changement porte son contrôle façon
Cursor — **Garder ⌘Y / Annuler ⌘N**, `n`/`p` naviguent entre les blocs — et la barre de
décision dit ce qu'elle fera («Appliquer 2 blocs»). La même revue sert le ⌘S manuel et les
propositions du chat : la colonne de chat ne rend jamais un diff, elle ANNONCE
(«± Proposition · 3 blocs · +12 −4 · voir dans le document ↩»). Une sélection partielle
recompose le document et repasse par propose → commit ; un document inchangé donne «aucun
changement» ; un modèle ne peut ni effacer les métadonnées par omission (ses clés fusionnent),
ni les saccager avec un `data` illisible (chaîne, tableau… : ignoré, avec avertissement
affiché). L'espace éditeur/chat se redimensionne à la poignée (double-clic : largeur par
défaut), la largeur survit au rechargement. La pile Terrain garde la vue diff compacte
(`DiffView`) : pas d'éditeur là-bas.

## Sécurité : chat, clés, workspace, égress

- **Clés API** : jamais persistées, jamais envoyées au navigateur. Un provider nomme la VARIABLE
  d'environnement de sa clé ; l'API ne renvoie qu'un booléen «clé détectée» ; un settings
  contenant une clé en clair est refusé à l'écriture.
- **Un seul chemin d'écriture** : édition manuelle et chat fabriquent tous deux un `changeId` via
  `proposeEdit` ; le même commit applique. Le chat n'a aucun chemin d'écriture privé.
- **Workspace** : un root = un périmètre d'écriture. Chaque carte, proposition et chat porte le
  `rootId` du fichier ; aucun diff ne traverse les roots.
- **Égress** : une ressource `confidential` ou un root `local-only` ne part jamais vers un
  provider `remote` — le chat refuse (message actionnable), le pack retient (badge «retenu»), la
  trace d'éval le consigne.

## Clavier

Le parcours complet est utilisable sans souris, vérifié manuellement et par les tests :

Chaque raccourci est AFFICHÉ à l'endroit de son action (chip `kbd`) ; la table ci-dessous est
vérifiée par test contre la table `SHORTCUTS` de `src/lib.ts` (hors mac, `⌘` s'affiche `Ctrl+`).

| Touche | Contexte | Effet |
|---|---|---|
| `/` | partout (hors champ) | rechercher |
| `↑` `↓` | arbre | déplacer la sélection (roving tabindex, `role=tree`) |
| `→` `←` | arbre | déplier / replier le dossier (ou remonter au parent) |
| `Entrée` | arbre | afficher les cartes du nœud |
| `j/k` | liste de cartes | carte suivante / précédente |
| `Entrée` | carte | ouvrir ou replier la carte sélectionnée |
| `e` | carte étendue | éditer avec l'IA (ouvrir ou fermer) |
| `⌘K` | chat / panneau d'évaluation | choisir le modèle |
| `⌘S` | carte étendue modifiée | proposer les changements (ouvre la revue) |
| `⌘⏎` | revue affichée | appliquer la revue |
| `Échap` | revue, chat, carte, panneau | refuser la revue, replier ou fermer |
| `⌘Y` | revue | garder le bloc courant |
| `⌘N` | revue | annuler le bloc courant |
| `n/p` | revue | bloc suivant / précédent dans la revue |

Accessibilité : `role=tree`/`treeitem` avec `aria-expanded`/`aria-selected`/`aria-level`, case
maîtresse `aria-checked="mixed"`, focus visible sur chaque rangée et carte ; l'audit axe (WCAG 2
A/AA, impacts serious/critical) tourne dans `e2e/a11y.spec.ts`.
