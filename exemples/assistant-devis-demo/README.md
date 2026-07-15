# Assistant Devis: démo pré-remplie

## Essayez en 30 secondes

1. Ouvrez **ce dossier** (pas la racine du dépôt) dans un outil d'IA qui lit vos fichiers, par exemple Claude Code, Codex, Cursor, GitHub Copilot ou OpenCode. BASE n'en privilégie aucun.
2. Demandez d'abord à l'outil de lire les instructions, puis de vous présenter la structure du dossier et le rôle des principaux fichiers.
3. Demandez, mot pour mot: **«Dupont SA a-t-il droit à la remise fidélité?»**
4. Vérifiez que la réponse consulte `catalogue/regles-tarification.md` et `clients/dupont-sa.md`, conclut «non» (la remise exige deux mandats, Dupont SA en est à son premier) et pose un `[A VALIDER]`. Cette question ne demande aucune écriture et la démo n'envoie rien au client.

Ce dossier contient déjà les données d'une entreprise fictive, **Atelier Léman Sàrl**, un studio de design lausannois, ainsi qu'un devis d'exemple.

## Voir un résultat fini en 60 secondes

1. **Ouvrez** ce dossier dans votre outil d'IA.
2. **Dites**: «Montre-moi le devis DEV-2026-001».

L'outil doit retrouver le devis existant dans [`devis/DEV-2026-001.md`](devis/DEV-2026-001.md), avec ses prestations, sa TVA et son acompte. Vérifiez qu'il montre ce fichier plutôt que d'en recréer un.

## Ensuite, essayez d'en créer un

> «Nouveau devis pour Dupont SA: 2 jours de conseil et un site web vitrine.»

Les fichiers contiennent déjà le catalogue ([`catalogue/services.json`](catalogue/services.json)), les tarifs et les conditions. Le process demande à l'assistant de proposer un devis et de marquer `[A VALIDER]` avant tout envoi. Cette consigne reste à contrôler dans l'outil que vous utilisez.

La démo reprend la structure d'`assistant-devis`: l'agent peut être chargé directement, et BASE peut router une demande vers le process `nouveau-devis` ou `configuration`. Le process indique ensuite les ressources utiles à ouvrir: catalogue, conditions, templates et outils.

## Ce que contient la démo

| Dossier | Contenu pré-rempli |
|---------|--------------------|
| `entreprise/` | Identité d'Atelier Léman + conditions générales |
| `catalogue/` | 5 services avec prix + règles de tarification |
| `clients/` | Fiche client Dupont SA |
| `devis/` | Un devis déjà généré (`DEV-2026-001`) |
| `.ai/agents/assistant-devis/` | Le rôle, les process, les compétences et les outils de l'agent |
| `.ai/routing/` | Fixtures de routage agent → process |

## Pour démarrer avec **vos** données

Cette démo sert à **voir** le résultat. Pour construire le vôtre à partir d'un gabarit à personnaliser, copiez plutôt le dossier voisin `assistant-devis` et dites: «Bonjour, je voudrais configurer mon activité.» Son process est conçu pour recueillir votre entreprise, vos services et vos tarifs.

## Avertissement

Données **fictives et illustratives** (entreprise, prix, conditions, devis). Elles ne constituent pas un conseil professionnel. Avant tout usage réel, remplacez toutes les données par les vôtres et vérifiez les informations réglementaires (taux de TVA, obligations légales) auprès des sources officielles.

---

BASE est un cadre porté par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).

Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
