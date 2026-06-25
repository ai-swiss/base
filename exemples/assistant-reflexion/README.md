# Assistant Réflexion

## Essayez en 30 secondes

1. Ouvrez **ce dossier** (pas la racine du dépôt) dans Claude Code ou Cursor.
2. Dites, mot pour mot: **«Aide-moi à clarifier une décision que j'hésite à prendre»**
3. Vous devriez voir: l'assistant reformule votre décision pour la cadrer, vous demande s'il a bien compris et s'il y a une échéance, puis attend votre validation avant de passer aux critères. Rien n'est écrit ni envoyé sans vous.

Un compagnon de réflexion personnel et privé. Il vous aide à clarifier une décision, explorer une question, ou mettre de l'ordre dans vos notes, sur votre machine, pour vous seul. Personne d'autre ne lit, personne ne surveille.

## Ce que fait cet agent

| Vous dites | Il fait |
|------------|---------|
| «Bonjour, je voudrais configurer mon espace de réflexion» (première fois) | Met en place votre espace et vos préférences, pas à pas |
| «Aide-moi à clarifier une décision...» | Décompose la décision en critères, options et hypothèses, en validant à chaque étape |
| «Aide-moi à explorer cette question...» | Approfondit, en séparant ce qui est établi de ce qui est supposé |
| «Prépare une note de décision» | Met par écrit une décision déjà prise, en gardant visibles ses hypothèses |
| «Qu'est-ce qui reste en attente?» | Cherche les hypothèses, incertitudes et points à valider ouverts |

## Pourquoi cet exemple existe

C'est l'exemple le plus personnel de BASE: un public d'une seule personne. Il montre l'idée au cœur de l'approche: **la structure décide où la validation est possible, et la validation décide de la qualité, quelle que soit l'intelligence du modèle.** Un assistant qui produit un bloc déjà conclu invite à signer sans lire. En découpant la réflexion, il ménage au contraire les moments où vous voyez encore une erreur à temps.

Ce principe vaut pour tous les usages: il protège le devis d'une PME, la décision d'une administration, et ici, votre propre réflexion.

## Structure

```
assistant-reflexion/
├── .ai/agents/assistant-reflexion/          L'intelligence de l'agent
│   ├── AGENT.md                            Instructions principales
│   ├── skills/
│   │   ├── processes/                      Workflows (config, clarifier, explorer, note de décision)
│   │   └── competences/                    Connaissances (validation aux bons moments, méthode, marqueurs, communication, journal)
│   └── templates/                          Modèles (note de décision, tableau d'options)
│
├── mon-espace/                             Vos préférences de réflexion
└── reflexions/                             Vos décisions et explorations structurées
```

## Garde-fous

Cet assistant est conçu pour ne pas décider à votre place et pour s'arrêter aux points de validation que vous fixez. Il rend visibles les hypothèses sur lesquelles un raisonnement repose (`[HYPOTHESE]`, `[INCERTITUDE]`), et ne conclut pas sur des suppositions non confirmées. Il ne vérifie pas son propre travail: il propose, vous vérifiez. Rien ne sort de votre machine.

## Adapter à votre usage

Cet exemple est un point de départ. Pour créer un assistant totalement différent, utilisez le **créateur d'agent** à la racine du dossier principal du projet.

## Avertissement

Cet exemple est **illustratif**. Son objectif est de démontrer une interaction humain-IA structurée pour la réflexion personnelle. Il n'est ni un conseil en décision, ni un substitut à un avis professionnel quand la situation l'exige.

---

BASE est un framework par [AI Swiss](https://a-i.swiss).

Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
