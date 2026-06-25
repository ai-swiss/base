---
schema_version: base.resource.v1
id: protection-des-donnees
type: document
title: Protection des données
description: Quelles données BASE traite, ce qui sort de la machine et quand, ce que BASE ne fait pas, et ce qui reste de la responsabilité de l'organisation (nLPD, RGPD).
scope: public
status: active
sensitivity: public
keywords: [protection, donnees, nlpd, rgpd, dpo, conformite, telemetrie, traces, opt-in, confidentialite]
---

# Protection des données

Quand on utilise BASE, où vont les données? Y répondre conditionne votre conformité nLPD et RGPD, et la confiance que vous pouvez accorder à l'outil. Pour le DPO, le responsable conformité ou le dirigeant prudent qui porte cette question, cette synthèse consolide ce qui est documenté ailleurs et y renvoie.

## Quelles données BASE traite

- **Vos fichiers locaux.** BASE structure des fichiers texte (Markdown, JSON) qui vivent dans vos dossiers et vous appartiennent. Il les lit et les écrit localement: les seules copies sont locales (un instantané de changement proposé dans `.ai/changes/`, et le journal local `.ai/trace/` qui enregistre des identifiants et des chemins, pas le contenu). Rien n'est envoyé ailleurs sans une action de votre part.
- **Des traces techniques minimales.** Les actions qui passent par BASE écrivent une ligne JSONL locale dans `.ai/trace/`: identifiants de ressources et chemins des opérations médiées (localement), décisions, durées, jamais le contenu des fichiers. Ces traces servent à l'entretien et à l'audit local, pas à la surveillance, et se gèrent avec `base trace prune`.

## Ce qui sort de votre machine, et quand

Rien, par défaut. Le cœur de BASE ne fait aucun appel réseau: le routage par défaut est local et lexical. Toute sortie de données correspond à un choix explicite de votre part, jamais à un réglage caché.

| Sortie possible | Quand | Qui décide | Où c'est documenté |
| --------------- | ----- | ---------- | ------------------ |
| L'outil IA que vous utilisez au-dessus de BASE | À chaque conversation où vous lui confiez du contenu | Vous, en choisissant l'outil et ce que vous lui montrez | [Sécurité et limites](securite-et-limites.md), section «Données et fournisseurs IA» |
| Un provider d'embeddings | Seulement si vous activez le ranker sémantique optionnel | Vous, par configuration explicite; une option locale (Ollama) existe | [Sécurité et données du routage](securite-donnees-routage.md) |
| Le serveur MCP | Seulement si vous l'exposez à une app de chat | Vous, par configuration explicite; lecture seule par défaut | [`mcp/README.md`](../../mcp/README.md) |

Pour chaque ligne, la règle est la même: la sortie est désactivée par défaut, activée par vous, et documentée à l'endroit indiqué.

## Ce que BASE ne fait pas

- **Pas de télémétrie.** BASE n'envoie aucune statistique d'usage, à personne.
- **Pas de compte.** Aucune inscription, aucun identifiant, aucun profil utilisateur.
- **Pas de cloud BASE.** Il n'existe aucun serveur BASE qui recevrait vos fichiers: le projet est un framework local que vous possédez.

## Vos responsabilités restantes

BASE ne vous rend pas conforme à la nLPD ni au RGPD à lui seul. Il limite, à la conception, ce qui quitte votre poste, et rend la frontière explicite. Le reste demeure organisationnel:

- les bases légales de vos traitements;
- le registre des traitements;
- les droits des personnes concernées (accès, rectification, effacement);
- l'évaluation du fournisseur IA que vous branchez au-dessus de BASE (conditions, rétention, localisation des traitements).

C'est la même honnêteté que pour la sécurité: BASE renforce la maîtrise locale, mais une politique de protection des données reste indispensable.

## Pour aller plus loin

- Vue d'ensemble pour justifier le choix: [Souveraineté, confiance et conformité](souverainete-et-confiance.md).
- Le détail du routage sémantique et des embeddings: [Sécurité et données du routage](securite-donnees-routage.md).
- Le modèle de sécurité complet et ses limites: [Sécurité et limites](securite-et-limites.md).
- Pour une PME: [Kit de démarrage PME suisse](../audiences/kit-demarrage-pme-suisse.md).
- Pour une institution publique: [Kit administration et secteur public](../audiences/kit-administration-secteur-public.md).

---

BASE est un framework par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
