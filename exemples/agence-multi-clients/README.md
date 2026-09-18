# Agence multi-clients (workspace)

## Essayez en 30 secondes

1. Ouvrez le dossier **`clients/dupont-conseil`** (un des clients de l'agence) dans Claude Code ou Cursor. Le dossier de l'agence lui-même est un workspace, pas une base: le travail se fait dans un client.
2. Dites, mot pour mot: **«Prépare une offre commerciale pour un nouveau client»**
3. Vous devriez voir ceci: l'assistant devis recueille la demande et la catégorie du client, consulte la grille de remises sans la recopier dans l'offre, puis demande votre confirmation avant d'enregistrer le devis. Rester dans cette racine et demander votre confirmation sont ici des consignes à l'assistant. Pour une écriture, la confirmation n'est mécanique que via `base propose` puis `base commit`, ou leurs équivalents MCP.

Pour router entre les clients (choisir la bonne racine automatiquement), c'est en ligne de commande, ci-dessous.

Dans cet exemple, **Dupont Conseil** est l'entreprise conseillée par l'agence et l'émettrice des devis. Elle est distincte de **Dupont SA**, l'acheteur fictif de l'exemple `assistant-devis-demo`.

Cet exemple montre comment **une agence gère plusieurs BASE** (un par client) avec un seul `base.workspace.json`.

```
agence-multi-clients/
├── base.workspace.json          Déclare les racines (une par client)
└── clients/
    ├── dupont-conseil/          Racine BASE du client A (assistant devis)
    └── martin-digital/          Racine BASE du client B (assistant support)
```

Le workspace déclare deux racines nommées:

```json
{
  "schema_version": "base.workspace.v1",
  "id": "agence-demo",
  "roots": [
    { "id": "dupont-conseil", "path": "clients/dupont-conseil", "default": true },
    { "id": "martin-digital", "path": "clients/martin-digital" }
  ]
}
```

## En ligne de commande

Depuis ce dossier:

```bash
# Valider la racine par défaut (dupont-conseil)
node .ai/base.mjs validate --workspace base.workspace.json

# Cibler une racine précise
node .ai/base.mjs validate --workspace base.workspace.json --root-id martin-digital

# Router une demande en cherchant entre les racines
node .ai/base.mjs route "préparer un devis" --workspace base.workspace.json
node .ai/base.mjs route "ouvrir un ticket d'incident" --workspace base.workspace.json

# Router dans une racine précise
node .ai/base.mjs route "préparer un devis" --workspace base.workspace.json --root-id dupont-conseil
```

## Ce que l'exemple démontre

- **Routage entre racines.** Sans `--root-id`, `node .ai/base.mjs route` cherche dans toutes les racines déclarées et choisit, ou demande si plusieurs conviennent.
- **Confinement par racine.** Le routeur restreint la sélection de ressources à la racine choisie: l'assistant de Dupont travaille avec les fichiers de Dupont, pas ceux de Martin. Avec le broker (serveur MCP), ce confinement est un mécanisme vérifié; dans un éditeur en accès direct, c'est une consigne que l'outil doit suivre.
- **Défaut prévisible.** Sans `--root-id`, la racine choisie est celle marquée `default: true`, sinon la première déclarée.

Détail: [`docs/reference/routage-process-et-ressources.md`](../../docs/reference/routage-process-et-ressources.md) (section «Racine et workspace») et `specs/current/10_core/cli.md`.

---

BASE est un cadre porté par [AI Swiss](https://a-i.swiss).

Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
