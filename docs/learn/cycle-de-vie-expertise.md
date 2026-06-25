---
title: Faire vivre une expertise après le déploiement
description: La boucle complète d'un assistant BASE, du premier document importé jusqu'au vieillissement sous surveillance, pour les responsables qui veulent savoir ce qui se passe une fois l'assistant en service.
keywords: [cycle de vie, importer, evaluer, gouverner, vieillir, friction, doctor, maintenance]
---

# Faire vivre une expertise après le déploiement

«Et après le déploiement?» C'est la question que posent les décideurs, et c'est la bonne. Cette page s'adresse aux responsables qui déploient un assistant et veulent savoir comment il se maintient dans la durée. Un assistant n'est pas un projet qui se termine: c'est une expertise qui vit. BASE outille chaque étape de cette vie, du premier document importé jusqu'au vieillissement sous surveillance. Voici la boucle complète.

```
  importer ──> éditer ──> évaluer ──> exécuter (chez l'hôte)
     ▲                                        │
     │                                        ▼
  doctor <── vieillir <── gouverner <── retour du terrain
  (santé)    (status,     l'égress      (frictions,
              validité)   (modèles)      abstentions)
```

## 1. Importer l'existant

On part rarement d'une page blanche. Le process [`importer-l-existant`](../../.ai/agents/createur-agent/skills/processes/importer-l-existant/SKILL.md)
(livré avec BASE, rattaché au créateur d'assistant) explore vos documents (modes d'emploi, wikis,
checklists) et **propose** leur conversion en process, compétences, documents et templates.
Chaque écriture passe par le gate propose → commit: vous validez chaque diff.

## 2. Éditer, avec un co-penseur

Dans [BASE Studio](../../tools/studio/ui/README.md), vos fichiers s'ouvrent en cartes éditables;
le chat d'édition pense **avec** vous sur le document que vous avez sous les yeux, jamais à votre
place ailleurs. Chaque suggestion du modèle arrive en diff, vous appliquez ou refusez. La dette
commence le plus souvent par quelques paragraphes que personne n'a relus: ici, tout reste visible.

## 3. Évaluer, sur la surface réelle

Le harness d'évaluation ([`tools/eval`](../../tools/eval/README.md)) donne au modèle testé les
**mêmes outils que la production** (MCP): lire, chercher, router, proposer, jamais un terminal.
Un utilisateur simulé joue vos scénarios, un juge indépendant note la conversation, et ce que le
process déclare (liens, barèmes) est pré-chargé en contexte sous budget. Une étape qui exigerait
d'exécuter du code se **déclare** (`report_limitation`) au lieu de se simuler. L'évaluation prend
toute sa valeur au passage à l'échelle: tout BASE garde une base de process écrits et gérés par
les gens, mais quelques process sont **promus et institutionnalisés**, et ce sont eux qu'il faut
tenir sous évaluation.

## 4. Exécuter, chez l'hôte

L'assistant tourne dans un outil IA capable de lire vos fichiers (par exemple GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code), ou tout hôte MCP, avec le broker BASE
comme médiateur: confinement au root, gate d'écriture, trace locale. L'exécution de code reste
une capacité de l'hôte; BASE ne la simule jamais.

## 5. Le retour du terrain

La boucle ne s'arrête pas au déploiement. Une **friction** («le barème cité n'est plus le bon»)
se consigne en une phrase: outil MCP `report_friction`, ou simplement «ça n'a pas marché» qui
route vers le process [`signaler-une-friction`](../../.ai/agents/concierge-base/skills/processes/signaler-une-friction/SKILL.md).
Chaque **abstention du routeur** (demande qu'aucun agent ne couvre) se journalise toute seule.
Studio présente les deux en pile de travail: une friction est un amendement de process en
attente; une demande non servie qui revient est un process à créer.

## 6. Vieillir sous surveillance

Un corpus métier pourrit silencieusement. Deux champs de cycle de vie (`status`, `review_by`),
deux dates de validité (`valid_from`, `valid_until`): le routeur ignore les ressources
dépréciées, le contexte annonce «périmé depuis le …», et [`base doctor`](../reference/framework-public.md)
relève ce qui va casser: liens morts, ressources orphelines, évaluations périmées, relectures
échues, frictions ouvertes, chacun avec sa piste de correction.

## 7. Gouverner chaque sortie vers un modèle

Avant qu'un octet parte vers un modèle, une seule règle se vérifie: une ressource
`confidential`, ou tout un root `local-only`, ne part **jamais** vers un provider distant, et le
refus se dit, à l'écran et dans la trace. Voir [Protection des données](../trust/protection-des-donnees.md)
et [les preuves](../trust/evidence.md).

---

La boucle entière tient dans des fichiers que vous possédez. L'importer revient à copier un
dossier, l'auditer se fait avec `base doctor`, et la quitter, c'est partir avec vos fichiers.
