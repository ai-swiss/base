# Assistant Devis

## Essayez en 30 secondes

1. Ouvrez **ce dossier** (pas la racine du dépôt) dans Claude Code ou Cursor.
2. Dites, mot pour mot: **«Bonjour, je veux configurer mon assistant devis»**
3. L'assistant devrait vous accueillir: il annonce que la configuration prend environ 5 minutes, puis vous interroge une à une sur votre entreprise (nom, adresse, numéro IDE, forme juridique, activité) avant de remplir `entreprise/identite.md` et `catalogue/services.json`. Rien n'est écrit ni envoyé sans vous.

Un assistant IA qui aide les PME et les jeunes pousses à établir des devis professionnels par la conversation.

Il vous guide d'abord pour configurer votre entreprise, puis rédige des devis à partir de vos demandes clients.

Cet exemple illustre aussi la doctrine BASE dans son ensemble: vous pouvez charger directement l'agent devis, puis laisser BASE acheminer une demande vers le bon process (`configuration` ou `nouveau-devis`). Le process ouvre alors les ressources utiles: catalogue, conditions, modèles et outils.

## Ce que fait cet agent

| Vous dites | Il fait |
|------------|---------|
| «Bonjour, je voudrais configurer mon activité» (première fois) | Configure votre entreprise pas à pas |
| «J'ai un client qui demande...» | Crée un devis complet |
| «Exporte le devis en PDF» | Génère un PDF professionnel |
| «Modifie le devis de Dupont» | Ajuste un devis existant |
| «Ajoute un service au catalogue» | Met à jour votre catalogue |

## Structure

```
assistant-devis/
├── .ai/agents/assistant-devis/    L'intelligence de l'agent
│   ├── AGENT.md                   Instructions principales
│   ├── skills/
│   │   ├── processes/             Workflows (config, devis)
│   │   └── competences/           Connaissances (TVA, format devis, marqueurs, journal)
│   ├── templates/                 Modèles (devis .md et .json)
│   └── tools/                     Calculs et export PDF
│
├── .ai/routing/                   Fixtures de routage agent → process
├── entreprise/                    Votre identité et conditions
├── catalogue/                     Vos services et tarifs
├── clients/                       Fiches clients (auto-remplies)
└── devis/                         Devis générés
```

## Routage BASE

Si vous utilisez la CLI ou le MCP BASE, vous pouvez vérifier que les demandes importantes parviennent au bon process:

```bash
node ../../tools/base.mjs route "nouveau devis pour Dupont SA" --root .
node ../../tools/base.mjs route-test --root .
```

Le routeur se borne à choisir le process à suivre. Les compétences, documents, modèles, données et outils demeurent des ressources que le process ouvre ensuite.

## Export PDF (optionnel)

L'assistant peut générer des PDF professionnels. Cela requiert la bibliothèque `fpdf2`. Si Python est installé sur votre machine, tapez `pip install fpdf2` dans un terminal. À défaut, l'export PDF reste indisponible, mais le reste de l'assistant fonctionne normalement.

Une fois la bibliothèque installée, dites «Exporte le devis en PDF», ou laissez l'assistant le proposer après la création d'un devis.

## Adapter à votre usage

Cet exemple est un point de départ. Pour bâtir un assistant tout autre, utilisez le **créateur d'agent**, à la racine du dossier principal du projet.

## Avertissement

Cet exemple est **illustratif**. Il vise avant tout à montrer ce que permet l'interaction entre l'humain et l'IA au sein d'un assistant structuré. Les données métier (entreprise fictive, services, prix, conditions) ne valent pas conseil professionnel. Avant tout usage réel, remplacez toutes les données par les vôtres et vérifiez les informations réglementaires (taux de TVA, obligations légales) auprès des sources officielles.

---

BASE est un cadre porté par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).

Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
