# Assistant Projet

## Essayez en 30 secondes

1. Ouvrez **ce dossier** (pas la racine du dépôt) dans Claude Code ou Cursor.
2. Dites, mot pour mot: **«Bonjour, je voudrais configurer mon activité»**
3. Vous devriez voir: l'assistant vous accueille et vous pose, une question à la fois, votre prénom, votre rôle, votre organisation et votre lieu pour remplir votre profil. Rien n'est écrit ni envoyé sans vous.

Un assistant IA qui aide à structurer, planifier et suivre des projets professionnels ou personnels.

Il commence par configurer votre profil, puis vous accompagne projet après projet.

## Ce que fait cet agent

| Vous dites | Il fait |
|------------|---------|
| «Bonjour, je voudrais configurer mon activité» (première fois) | Configure votre profil et vos préférences de travail |
| «J'ai un projet à organiser...» | Structure le projet: étapes, jalons, calendrier, risques |
| «Où en est mon projet?» | Fait le point d'avancement et propose la suite |
| «Modifie le planning» | Ajuste les étapes, les dates ou les responsabilités |
| «Le projet est terminé» | Propose un bilan final et archive le projet |
| «Qu'est-ce qui est en attente?» | Cherche les marqueurs `[A VALIDER]` et `[A COMPLETER]` dans vos projets |

## Structure

```
assistant-projet/
├── .ai/agents/assistant-projet/       L'intelligence de l'agent
│   ├── AGENT.md                       Instructions principales
│   ├── skills/
│   │   ├── processes/                 Workflows (config, nouveau projet)
│   │   └── competences/               Connaissances (méthodologie, marqueurs, journal)
│   └── templates/                     Modèles (fiche projet, point d'avancement)
│
├── profil/                            Votre identité et préférences
├── projets/                           Projets actifs (un dossier par projet)
└── archives/                          Projets terminés
```

## Avertissement

Cet assistant est un **exemple illustratif** à des fins d'apprentissage. Les méthodologies et recommandations doivent être adaptées à votre contexte. L'assistant propose, **vous décidez**.

---

BASE est un framework par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).

Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
