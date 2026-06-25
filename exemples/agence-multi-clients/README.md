# Agence multi-clients (workspace)

## Essayez en 30 secondes

1. Ouvrez **ce dossier** (pas la racine du dépôt) dans Claude Code ou Cursor.
2. Dites, mot pour mot: **«Prépare un devis pour Dupont Conseil»**
3. Vous devriez voir ceci: BASE route vers la racine dupont-conseil et son assistant devis (process nouveau-devis), reste confiné à cette racine (aucun fichier de Martin Digital n'est touché) et consulte la grille de remises confidentielles pour fixer le prix sans la recopier dans l'offre. Rien n'est écrit ni envoyé sans vous.

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
base validate --workspace base.workspace.json

# Cibler une racine précise
base validate --workspace base.workspace.json --root-id martin-digital

# Router une demande en cherchant entre les racines
base route "préparer un devis" --workspace base.workspace.json
base route "ouvrir un ticket d'incident" --workspace base.workspace.json

# Router dans une racine précise
base route "préparer un devis" --workspace base.workspace.json --root-id dupont-conseil
```

## Ce que l'exemple démontre

- **Routage entre racines.** Sans `--root-id`, `base route` cherche dans toutes les racines déclarées et choisit, ou demande si plusieurs conviennent.
- **Confinement par racine.** Le routeur confine la sélection de ressources à la racine choisie: l'assistant de Dupont travaille avec les fichiers de Dupont, pas ceux de Martin. Par le broker (serveur MCP) ce confinement est un mécanisme vérifié; en agent d'éditeur direct, c'est une consigne que l'outil doit suivre.
- **Défaut prévisible.** Sans `--root-id`, la racine choisie est celle marquée `default: true`, sinon la première déclarée.

Détail: [`docs/reference/routage-process-et-ressources.md`](../../docs/reference/routage-process-et-ressources.md) (section «Racine et workspace») et `specs/current/10_core/cli.md`.

---

BASE est un framework par [AI Swiss](https://a-i.swiss).

Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
