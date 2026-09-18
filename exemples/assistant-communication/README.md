# Assistant Communication

## Essayez en 30 secondes

1. Ouvrez **ce dossier** (pas la racine du dépôt) dans Claude Code ou Cursor.
2. Dites, mot pour mot: **«Bonjour, je veux configurer mon assistant communication»**
3. Vous devriez voir: l'assistant lance la configuration et vous pose une seule question à la fois (nom de l'entreprise, activité, ton, thèmes) pour remplir votre identité et votre charte, en confirmant chaque étape avant d'écrire. Demander votre confirmation est ici une consigne à l'assistant. Pour une écriture, la confirmation n'est mécanique que via `base propose` puis `base commit`, ou leurs équivalents MCP.

Un assistant IA qui aide les PME et start-up à gérer leur communication: posts LinkedIn, newsletters, réponses clients.

L'assistant vous guide pour configurer votre identité et votre charte éditoriale, puis vous aide à créer du contenu professionnel.

## Ce que fait cet agent

| Vous dites | Il fait |
|------------|---------|
| «Bonjour, je veux configurer mon assistant communication» (première fois) | Configure votre identité et votre charte éditoriale pas à pas |
| «Je veux publier sur LinkedIn...» | Crée un post LinkedIn adapté à votre ton et vos audiences |
| «J'ai besoin d'une newsletter...» | Rédige une newsletter structurée section par section |
| «Un client m'a écrit, aide-moi à répondre» | Propose une réponse en respectant votre charte de ton |
| «Montre-moi mes publications» | Liste les publications dans votre historique |

## Structure

```
assistant-communication/
├── .ai/agents/assistant-communication/    L'intelligence de l'agent
│   ├── AGENT.md                           Instructions principales
│   ├── skills/
│   │   ├── processes/                     Procédures (config, LinkedIn, newsletter)
│   │   └── competences/                   Connaissances (communication, métier, marqueurs, journal)
│   └── templates/                         Modèles (post LinkedIn, newsletter)
│
├── entreprise/                            Votre identité d'entreprise
├── charte/                                Ton, style et thèmes clés
├── audiences/                             Vos personas cibles
└── publications/                          Contenus générés
```

## Adapter à votre usage

Cet exemple est un point de départ. Pour créer un assistant totalement différent, utilisez le **créateur d'agent** à la racine du dossier principal du projet.

## Avertissement

Cet exemple est **illustratif**. Il vise d'abord à montrer ce que permet l'interaction entre l'humain et l'IA dans un assistant structuré. Les données métier (entreprise fictive, charte éditoriale, audiences) ne constituent pas des conseils professionnels en communication. Avant toute utilisation réelle, remplacez l'ensemble des données par les vôtres.

---

BASE est un cadre porté par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).

Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
