# Assistant Courrier

Un assistant IA qui aide les PME et les indépendants à rédiger leurs courriers et leurs emails, et à y répondre: clients, fournisseurs, partenaires.

## Essayez en 30 secondes

1. Ouvrez **ce dossier** (pas la racine du dépôt) dans Claude Code ou Cursor.
2. Dites, mot pour mot: **«Bonjour, je voudrais configurer mon activité»**
3. Vous devriez voir ceci: l'assistant vous accueille et commence la configuration pas à pas (nom de l'entreprise, adresse, signataire, ton et formules de politesse), une question à la fois, avant d'écrire quoi que ce soit. Rien n'est écrit ni envoyé sans vous.

## Ce que fait cet agent

| Vous dites | Il fait |
|------------|---------|
| «Bonjour, je voudrais configurer mon activité» (première fois) | Configure votre identité, votre signataire et votre style de correspondance pas à pas |
| «Rédige un courrier de relance pour...» | Rédige un courrier ou un email adapté à votre ton et à votre destinataire |
| «Un client m'a écrit, aide-moi à répondre» | Lit le message reçu et propose une réponse calibrée |
| «Montre-moi mes courriers» | Liste les courriers dans votre historique |
| «Qu'est-ce qui est en attente?» | Cherche les éléments à valider ou à compléter |

## Structure

```
assistant-courrier/
├── .ai/agents/assistant-courrier/         L'intelligence de l'agent
│   ├── AGENT.md                           Instructions principales
│   ├── skills/
│   │   ├── processes/                     Workflows (config, rédiger, répondre)
│   │   └── competences/                   Connaissances (métier, communication, marqueurs, journal)
│   └── templates/                         Modèles (courrier, email)
│
├── entreprise/                            Votre identité et votre style de correspondance
├── contacts/                              Fiches de vos destinataires
└── courriers/                             Courriers et emails générés
```

## Garde-fous

Cet assistant **ne signe ni n'envoie jamais à votre place**. Il rédige, vous relisez, vous signez, vous envoyez. Il est conçu pour ne pas inventer un prix, une date, un délai ou un engagement: si une information manque, il vous la demande ou la marque comme à compléter. L'humain signe, donc l'humain vérifie.

## Adapter à votre usage

Cet exemple est un point de départ. Pour créer un assistant totalement différent, utilisez le **créateur d'agent** à la racine du dossier principal du projet.

## Avertissement

Cet exemple est **illustratif**. Son objectif principal est de démontrer les possibilités d'interaction humain-IA à travers un assistant structuré. Les données métier (entreprise fictive, style de correspondance) ne constituent pas des conseils juridiques ou rédactionnels. Avant toute utilisation réelle, remplacez l'ensemble des données par les vôtres.

---

BASE est un framework par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).

Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
