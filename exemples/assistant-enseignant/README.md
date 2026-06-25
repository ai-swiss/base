# Assistant Enseignant

Un assistant IA qui aide les enseignantes et enseignants à préparer leur enseignement par la conversation: construire des séquences, préparer des évaluations avec grilles de critères et corrigés, garder une trace de ce qui est prêt.

## Essayez en 30 secondes

1. Ouvrez **ce dossier** (pas la racine du dépôt) dans Claude Code ou Cursor.
2. Dites, mot pour mot: **«Bonjour, je voudrais configurer mon profil d'enseignant»**
3. Vous devriez voir: l'assistant vous accueille et propose de configurer votre profil pas à pas (degré, branches, plan d'études), une question à la fois, en cinq minutes environ. Rien n'est écrit ni envoyé sans vous.

## Ce que fait cet agent

| Vous dites | Il fait |
|------------|---------|
| «Bonjour, je voudrais configurer mon profil d'enseignant» (première fois) | Configure votre profil pas à pas: degré, branches, classes, plan d'études |
| «Prépare un cours sur les fractions» | Construit une séquence complète: objectifs, prérequis, déroulé, différenciation |
| «Crée une évaluation sur cette séquence» | Prépare l'évaluation: grille de critères, barème, corrigé proposé |
| «Qu'est-ce que j'ai déjà préparé?» | Liste vos séquences et évaluations existantes |
| «Qu'est-ce qui reste en attente?» | Cherche les éléments à valider ou à compléter |

## Structure

```
assistant-enseignant/
├── .ai/agents/assistant-enseignant/   L'intelligence de l'agent
│   ├── AGENT.md                        Instructions principales
│   ├── skills/
│   │   ├── processes/                  Workflows (config, séquences, évaluations)
│   │   └── competences/                Connaissances (pédagogie, marqueurs, journal)
│   └── templates/                      Modèles (séquence, grille d'évaluation)
│
├── profil/                             Votre profil d'enseignant
├── classes/                            Profils de classe anonymisés
├── sequences/                          Séquences d'enseignement préparées
└── evaluations/                        Évaluations préparées
```

## Limites

Cet assistant a des limites assumées:

- **Il ne remplace jamais le jugement pédagogique.** Il structure le matériel: séquences, grilles, corrigés. C'est l'enseignant qui enseigne, qui évalue les élèves et qui connaît sa classe.
- **Les données d'élèves sont sensibles.** L'assistant travaille avec des profils de classe anonymisés (effectif, niveau général, besoins de différenciation), jamais avec des noms d'élèves ni des dossiers individuels.
- **Il ne garantit pas la conformité au plan d'études.** Il propose des contenus à vérifier; la conformité au PER, au Lehrplan 21 ou à tout autre référentiel reste à valider par l'enseignant.

## Adapter à votre usage

Cet exemple est un point de départ. Pour créer un assistant totalement différent, utilisez le **créateur d'agent** à la racine du dossier principal du projet.

## Avertissement

Cet exemple est **illustratif**. Son objectif principal est de démontrer les possibilités d'interaction humain-IA à travers un assistant structuré. Les contenus pédagogiques générés ne constituent pas un référentiel officiel. Avant toute utilisation réelle, remplacez les données par les vôtres et vérifiez les contenus auprès des plans d'études et des directives de votre établissement.

---

BASE est un framework par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).

Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
