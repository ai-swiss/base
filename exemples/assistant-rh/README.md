# Assistant RH

## Essayez en 30 secondes

1. Ouvrez **ce dossier** (pas la racine du dépôt) dans Claude Code ou Cursor.
2. Dites, mot pour mot: **«Bonjour, je voudrais configurer mon activité»**
3. Vous devriez voir: l'assistant vous accueille et lance la configuration pas à pas, en posant une seule question à la fois (en commençant par le nom de votre entreprise). Rien n'est écrit ni envoyé sans vous.

Un assistant IA qui aide les PME suisses à gérer leur recrutement par la conversation: publier des offres d'emploi, préparer des entretiens et évaluer des candidats.

L'assistant vous guide pour configurer votre entreprise, puis vous accompagne dans tout le processus de recrutement.

## Ce que fait cet agent

| Vous dites | Il fait |
|------------|---------|
| «Bonjour, je voudrais configurer mon activité» (première fois) | Configure votre entreprise et votre politique RH pas à pas |
| «Je cherche un développeur» | Crée une offre d'emploi complète |
| «J'ai un entretien avec Marie Dupont» | Prépare l'entretien (questions, grille d'évaluation) |
| «Évalue ce candidat» | Aide à structurer l'évaluation après entretien |
| «Quels postes sont ouverts?» | Liste les postes en cours de recrutement |
| «Où en sont les candidatures?» | Résume l'état des candidatures |

## Structure

```
assistant-rh/
├── .ai/agents/assistant-rh/    L'intelligence de l'agent
│   ├── AGENT.md                 Instructions principales
│   ├── skills/
│   │   ├── processes/           Workflows (config, offres, entretiens)
│   │   └── competences/         Connaissances (droit du travail, marqueurs, journal)
│   └── templates/               Modèles (offre d'emploi, grille d'entretien)
│
├── entreprise/                  Votre identité et politique RH
├── collaborateurs/              Votre équipe actuelle
├── postes-ouverts/              Offres d'emploi en cours
└── candidatures/                Dossiers de candidature et évaluations
```

## Adapter à votre usage

Cet exemple est un point de départ. Pour créer un assistant totalement différent, utilisez le **créateur d'agent** à la racine du dossier principal du projet.

## Avertissement

Cet exemple est **illustratif**. Il vise surtout à montrer les possibilités d'interaction entre l'humain et l'IA au moyen d'un assistant structuré. Les données métier (entreprise fictive, politique RH, informations légales) ne constituent pas des conseils juridiques en droit du travail. Avant toute utilisation réelle, remplacez l'ensemble des données par les vôtres et vérifiez les informations réglementaires (CO, LPP, LEg) auprès des sources officielles ou d'un conseiller juridique.

---

BASE est un framework par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).

Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
