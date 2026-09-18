---
schema_version: base.resource.v1
id: protection-des-donnees
type: document
title: Protection des données
description: Quelles informations peuvent quitter votre ordinateur avec BASE et un outil IA, quand elles partent vers un fournisseur, et quelles responsabilités restent à l'organisation.
scope: public
status: active
sensitivity: public
keywords: [protection, donnees, informations, ordinateur, machine, fournisseur IA, sortie, nlpd, rgpd, dpo, conformite, telemetrie, traces, opt-in, confidentialite]
---

# Protection des données

Quand on utilise BASE, où vont les données? La réponse conditionne votre conformité nLPD et RGPD, ainsi que la confiance que vous pouvez accorder à BASE. À l'intention du DPO, du responsable conformité ou du dirigeant que la question préoccupe, cette synthèse rassemble ce qui est documenté ailleurs et renvoie aux sources.

## Quelles données BASE traite

- **Vos fichiers locaux.** BASE structure des fichiers texte (Markdown, JSON) qui résident dans vos dossiers et vous appartiennent. Il les lit et les écrit sur place. Un changement proposé est conservé localement dans `.ai/changes/`. Un outil IA qui ouvre ces fichiers peut toutefois les transmettre selon sa propre configuration.
- **Des traces techniques minimales.** Les points instrumentés tentent d'écrire une ligne JSONL locale dans `.ai/trace/`: identifiants de ressources, chemins, décisions et durées. Aucun contenu métier n'y figure par défaut. Cette trace est best-effort et non exhaustive: une action hors broker, un point non instrumenté ou un échec d'écriture peut ne laisser aucune ligne. Elle sert à l'entretien local, non à la surveillance ni à un audit complet. Vous décidez de sa rétention avec `base trace prune --keep-days <n>` et `base trace clear`.

## Ce qui peut quitter votre ordinateur, et quand {#ce-qui-sort-de-votre-machine-et-quand}

Le cœur de BASE ne contacte aucun service distant par défaut. Dans un outil IA, le modèle route normalement en lisant la carte locale; le routeur lexical local fournit le plancher déterministe aux appels sans modèle et aux tests. L'outil IA conserve toutefois sa propre politique réseau.

| Sortie possible | Quand | Qui décide | Où c'est documenté |
| --------------- | ----- | ---------- | ------------------ |
| L'outil IA que vous utilisez au-dessus de BASE | À chaque conversation où vous lui confiez du contenu | Vous, en choisissant l'outil et ce que vous lui montrez | [Sécurité et limites](securite-et-limites.md), section «Données et fournisseurs IA» |
| Les modèles de la Voie 2 livrée | Seulement si vous activez `routing.embedding_model` et `refiner_model`; la requête et les textes de routage nécessaires peuvent partir | Vous, par configuration explicite; une option locale (Ollama) existe | [Sécurité et données du routage](securite-donnees-routage.md) |
| Une intégration directe du paquet sémantique | Si vous lui fournissez un embedder; son périmètre par défaut peut inclure le corps des ressources | L'intégrateur, qui choisit l'embedder et `textOf` | [Sécurité et données du routage](securite-donnees-routage.md) |
| Le serveur MCP | Quand un client lui demande une ressource | Vous, en choisissant le client et le transport; HTTP est en lecture seule par défaut, tandis que `stdio` expose les écritures médiées sauf mode lecture seule | [`mcp/README.md`](../../mcp/README.md) |

Ces chemins n'ont pas le même responsable. BASE configure sa Voie 2 et son serveur; l'outil IA et une intégration sur mesure gardent leurs propres autorités et réglages.

## Ce que BASE ne fait pas

- **Pas de télémétrie.** BASE n'envoie aucune statistique d'usage, à personne.
- **Pas de compte.** Aucune inscription, aucun identifiant, aucun profil utilisateur.
- **Pas de cloud BASE.** Il n'existe aucun serveur BASE qui recevrait vos fichiers: le projet est un cadre local que vous possédez.

## Vos responsabilités restantes

BASE ne suffit pas, à lui seul, à vous rendre conforme à la nLPD ni au RGPD. Il limite dès la conception ce qui quitte votre poste, et rend la frontière explicite. Le reste demeure organisationnel:

- les bases légales de vos traitements;
- le registre des traitements;
- les droits des personnes concernées (accès, rectification, effacement);
- l'évaluation du fournisseur IA que vous branchez au-dessus de BASE (conditions, rétention, localisation des traitements).

C'est la même honnêteté que pour la sécurité: BASE renforce la maîtrise locale, mais ne dispense pas d'une véritable politique de protection des données.

## Pour aller plus loin

- Vue d'ensemble pour justifier le choix: [Souveraineté, confiance et conformité](souverainete-et-confiance.md).
- Le détail du routage sémantique et des embeddings: [Sécurité et données du routage](securite-donnees-routage.md).
- Le modèle de sécurité complet et ses limites: [Sécurité et limites](securite-et-limites.md).
- Pour une PME: [Kit de démarrage PME suisse](../audiences/kit-demarrage-pme-suisse.md).
- Pour une institution publique: [Kit administration et secteur public](../audiences/kit-administration-secteur-public.md).

---

BASE est un cadre par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
