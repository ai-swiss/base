# Assistant Réunion

## Essayez en 30 secondes

1. Ouvrez **ce dossier** (pas la racine du dépôt) dans Claude Code ou Cursor.
2. Dites, mot pour mot: **«Bonjour, je voudrais configurer mon activité»**
3. Vous devriez voir: l'assistant vous pose une question à la fois (nom de l'entreprise, activité, types de réunions, niveau de détail) puis propose de remplir entreprise/identite.md, qui contient encore des champs à personnaliser. Rien n'est écrit ni envoyé sans vous.

Un assistant IA qui transforme vos notes de réunion en comptes-rendus structurés et suit les décisions et les actions.

L'assistant vous guide pour configurer votre contexte et votre modèle de compte-rendu, puis transforme vos notes en documents clairs et suit ce qui reste à faire.

## Ce que fait cet agent

| Vous dites | Il fait |
|------------|---------|
| «Bonjour, je voudrais configurer mon activité» (première fois) | Configure votre contexte et votre modèle de compte-rendu pas à pas |
| «Fais le compte-rendu de la réunion...» | Transforme vos notes en compte-rendu structuré (participants, décisions, actions) |
| «Quelles actions sont ouvertes?» | Dresse l'état des actions et décisions de l'ensemble de vos réunions |
| «Montre-moi mes réunions» | Liste les comptes-rendus dans votre historique |
| «Qu'est-ce qui est en attente?» | Cherche les décisions, actions et éléments à compléter |

## Structure

```
assistant-reunion/
├── .ai/agents/assistant-reunion/          L'intelligence de l'agent
│   ├── AGENT.md                           Instructions principales
│   ├── skills/
│   │   ├── processes/                     Workflows (config, compte-rendu, suivi)
│   │   └── competences/                   Connaissances (métier, communication, marqueurs, journal)
│   └── templates/                         Modèles (compte-rendu, relevé de décisions)
│
├── entreprise/                            Votre contexte et vos préférences
└── reunions/                              Comptes-rendus et relevés générés
```

## Garde-fous

Cet assistant est conçu pour ne pas inventer ce qui a été dit: une information absente reste marquée à compléter. Il travaille uniquement à partir de vos notes: une information absente reste marquée à compléter, elle n'est pas comblée par une supposition. Il distingue rigoureusement **décision**, **action** et **information**, et n'attribue ni responsable ni échéance sans certitude. Il reste **neutre et factuel**: il structure, vous validez.

## Adapter à votre usage

Cet exemple est un point de départ. Pour créer un assistant totalement différent, utilisez le **créateur d'agent** à la racine du dossier principal du projet.

## Avertissement

Cet exemple est **illustratif**. Son objectif principal est de démontrer les possibilités d'interaction humain-IA à travers un assistant structuré. Les données métier (entreprise fictive, préférences) ne constituent pas un modèle juridique de procès-verbal. Avant toute utilisation réelle, remplacez l'ensemble des données par les vôtres.

---

BASE est un framework par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).

Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
