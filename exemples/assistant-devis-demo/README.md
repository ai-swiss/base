# Assistant Devis: démo pré-remplie

## Essayez en 30 secondes

1. Ouvrez **ce dossier** (pas la racine du dépôt) dans Claude Code ou Cursor.
2. Demandez, mot pour mot: **«Dupont SA a-t-il droit à la remise fidélité?»**
3. L'assistant lit `catalogue/regles-tarification.md` et `clients/dupont-sa.md`, répond non (la remise fidélité demande deux mandats, Dupont SA en est à son premier), cite sa source et pose un `[A VALIDER]`. Rien n'est écrit ni envoyé sans vous.

**Le moyen le plus rapide de voir BASE en action.** Ce dossier est déjà rempli avec les données d'une entreprise fictive, **Atelier Léman Sàrl**, un studio de design lausannois, et contient un devis déjà généré.

## Voir un résultat fini en 60 secondes

1. **Ouvrez** ce dossier dans Cursor ou Claude Code.
2. **Dites**: «Montre-moi le devis DEV-2026-001».

Vous obtenez un devis professionnel complet (prestations, TVA 8.1 %, acompte); voir [`devis/DEV-2026-001.md`](devis/DEV-2026-001.md). Aucune configuration n'est nécessaire: l'assistant lit les données déjà présentes.

## Ensuite, essayez d'en créer un

> «Nouveau devis pour Dupont SA: 2 jours de conseil et un site web vitrine.»

L'assistant connaît déjà le catalogue ([`catalogue/services.json`](catalogue/services.json)), les tarifs et les conditions. Il propose un devis; **vous validez** avant tout envoi (cherchez le marqueur `[A VALIDER]`).

La démo partage le même modèle structurel que `assistant-devis`: l'agent peut être chargé directement, et BASE peut router une demande vers le process `nouveau-devis` ou `configuration`. Les ressources utiles (catalogue, conditions, templates et outils) sont ouvertes ensuite par le process.

## Ce que contient la démo

| Dossier | Contenu pré-rempli |
|---------|--------------------|
| `entreprise/` | Identité d'Atelier Léman + conditions générales |
| `catalogue/` | 5 services avec prix + règles de tarification |
| `clients/` | Fiche client Dupont SA |
| `devis/` | Un devis déjà généré (`DEV-2026-001`) |
| `.ai/agents/assistant-devis/` | L'intelligence de l'agent (workflows, compétences, outils) |
| `.ai/routing/` | Fixtures de routage agent → process |

## Pour démarrer avec **vos** données

Cette démo sert à **voir** le résultat. Pour construire le vôtre à partir d'une page blanche, copiez plutôt le dossier voisin `assistant-devis` (au même niveau que ce dossier) et dites «Bonjour, je voudrais configurer mon activité»: l'assistant vous guide pour saisir votre entreprise, vos services et vos tarifs.

## Avertissement

Données **fictives et illustratives** (entreprise, prix, conditions, devis). Elles ne constituent pas un conseil professionnel. Avant tout usage réel, remplacez toutes les données par les vôtres et vérifiez les informations réglementaires (taux de TVA, obligations légales) auprès des sources officielles.

---

BASE est un framework par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).

Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
