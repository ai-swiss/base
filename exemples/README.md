# Exemples

Des assistants IA prêts à l'emploi pour vos métiers. La démo pré-remplie montre un résultat immédiatement; les autres exemples vous guident pour configurer vos propres données.

Pour voir BASE avant de lire l'architecture, suivez la [démo 60 secondes](../docs/start/demo-60-secondes.md).

## Exemples disponibles

| Exemple | Domaine | Ce qu'il fait |
|---------|---------|---------------|
| [assistant-devis-demo](assistant-devis-demo/) | Commercial | Montre un devis complet avec données fictives déjà remplies |
| [assistant-reflexion](assistant-reflexion/) | Personnel | Structure une décision ou une question pour rendre les hypothèses et validations visibles |
| [assistant-devis](assistant-devis/) | Commercial | Crée des devis professionnels à partir d'une demande client |
| [assistant-communication](assistant-communication/) | Marketing | Rédige des posts LinkedIn, newsletters et contenus dans votre ton |
| [assistant-courrier](assistant-courrier/) | Administration | Rédige vos courriers et emails clients et y répond, dans le bon registre |
| [assistant-rh](assistant-rh/) | Ressources humaines | Publie des offres d'emploi, prépare et évalue les entretiens |
| [assistant-projet](assistant-projet/) | Gestion de projet | Structure les projets, jalons, décisions et points d'avancement |
| [assistant-reunion](assistant-reunion/) | Réunions | Transforme vos notes en comptes-rendus structurés et suit décisions et actions |
| [assistant-enseignant](assistant-enseignant/) | Éducation | Prépare séquences d'enseignement et évaluations, sur profils de classe anonymisés |
| [routage-pme](routage-pme/) | Routage | Montre le routage déterministe par défaut (process proches, contre-exemples, abstention) et ses fixtures |
| [agence-multi-clients](agence-multi-clients/) | Workspace | Plusieurs BASE (un par client) via `base.workspace.json`: routage entre racines et confinement par racine |

> **Devis: démo ou point de départ?** `assistant-devis-demo` et `assistant-devis` sont le **même assistant** sous deux angles. La **démo** est livrée avec des données fictives (un client, un devis déjà généré) pour voir un résultat tout de suite. La version **`assistant-devis`** part vide: c'est le modèle à copier pour construire le vôtre. Commencez par la démo pour comprendre, partez de l'autre pour produire.

## Comment utiliser un exemple

### 1. Copier

Copiez le dossier de l'exemple choisi dans votre propre espace de travail (par exemple sur votre Bureau ou dans vos Documents).

### 2. Ouvrir

Ouvrez le dossier copié dans votre outil IA (Cursor, Claude Code, etc.).

### 3. Parler

Dites une demande concrète, par exemple «Bonjour, je voudrais configurer mon activité». Un simple «Bonjour» est une salutation: avec le routeur, il mène à l'accueil plutôt qu'à un workflow métier.

## Ajouter un exemple

La plupart des exemples métier sont des **dossiers agent unique**: `CLAUDE.md` et `.cursor/rules/assistant.mdc` donnent à l'outil le contexte BASE, puis le routeur choisit le process à partir d'une demande concrète. Les exemples de routage ou de workspace montrent un autre modèle: un routeur choisit entre plusieurs agents, process ou racines.

Structure recommandée pour un exemple agent unique:

```
mon-exemple/
├── README.md                      # Présentation
├── CLAUDE.md                      # Pont Claude Code
├── .cursor/rules/assistant.mdc    # Pont Cursor
├── .ai/agents/[nom-agent]/        # L'intelligence de l'agent
│   ├── AGENT.md
│   ├── skills/
│   │   ├── processes/             # Workflows invocables
│   │   └── competences/           # Connaissances et capacités
│   ├── templates/
│   └── tools/                     # Optionnel
└── [données-métier]/              # Les dossiers de données propres au métier
```

Pour un projet multi-agents ou multi-clients, partez plutôt du bootstrap routeur (`BASE_BOOTSTRAP.md`, `AGENTS.md`, `base.config.json`) et de `base.workspace.json` si plusieurs racines doivent rester séparées.

Pour créer un nouvel exemple, utilisez le **créateur d'agent**: ouvrez le dossier principal du projet et dites «J'aimerais créer un assistant pour [votre métier]».

---

BASE est un framework par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).

Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
