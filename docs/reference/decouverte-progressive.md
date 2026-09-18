---
schema_version: base.resource.v1
id: decouverte-progressive
type: document
title: La découverte progressive, du premier fichier au geste final
description: "Dans quel ordre un outil d'IA lit quoi dans un BASE, et quand il s'arrête: la racine, le point d'entrée, la route, le process, le contexte, l'outil, l'écriture. Une page au niveau des gestes du contrat, que tout harnais peut suivre."
scope: public
status: active
sensitivity: public
keywords: [decouverte, progressive, lecture, ordre, harnais, integration, routage, contexte, budget, playbook]
---

# L'ordre de lecture: racine, agent, process et contexte {#la-decouverte-progressive-du-premier-fichier-au-geste-final}

Un BASE est fait pour être découvert petit à petit. Cette page répond à la question d'un intégrateur
de harnais: dans quel ordre je lis quoi, et quand est-ce que je m'arrête? Elle décrit chaque étape au
niveau des **gestes du contrat** (router, lire, lier, chercher, invoquer, proposer, committer), pas au
niveau des commandes d'un outil particulier: la CLI, le serveur MCP et un harnais fichier offrent
chacun leur porte vers les mêmes gestes (voir [BASE et vos outils d'IA](base-et-vos-outils-ia.md)).

L'ordre est: trouver la racine, lire le point d'entrée, router si nécessaire, lire l'agent puis le
process choisi, et enfin lier le contexte utile avant d'ouvrir ou d'exécuter autre chose.

La portée diffère selon la porte. Dans un harnais fichier, cet ordre est une **consigne au modèle**:
elle guide un modèle coopératif, sans empêcher techniquement une autre lecture. La CLI et le MCP
appliquent seulement les mécanismes de leurs opérations nommées, par exemple le confinement d'une
ouverture ou le plan de contexte; ils n'imposent pas à eux seuls tout l'ordre de lecture au harnais.

Une seule consigne gouverne toute la page:

> À chaque étape, lis le plus petit objet qui prouve la décision suivante. Si la preuve manque,
> abstiens-toi et demande.

## 1. Trouver la racine

Un dossier est une racine BASE s'il porte un point d'entrée (`CLAUDE.md` ou équivalent), une
configuration (`base.config.json`) et le noyau `.ai/`. Si un `base.workspace.json` existe, il déclare
plusieurs racines: le lire d'abord. Si plusieurs racines restent possibles, demander (ou utiliser la
sélection explicite de racine que la surface offre), jamais deviner.

## 2. Lire le point d'entrée

Le point d'entrée dit si le dossier a déjà choisi son agent. S'il pointe directement vers un
`AGENT.md`, lire cet agent et travailler: le routage global serait une dépense inutile. S'il décrit
un routeur (le cas général), passer à l'étape suivante au premier besoin de process.

## 3. Si le résultat est `ambiguous`, questionner avant d'ouvrir les process concurrents {#3-router-quand-le-process-est-inconnu}

Le geste `router` prend la demande et rend une route ou une abstention honnête. L'ordre du premier
mouvement dépend de la surface:

- **Harnais fichier**: l'index de routage généré (ou le pointeur direct) d'abord; le routeur
  déterministe confirme ou sert de repli.
- **Broker ou MCP**: `route_request` d'abord, parce que la politique d'accès et l'audit vivent dans
  le broker.
- **Preuve et CI**: `route-test` avec la stratégie lexicale d'abord; `--strategy production` appelle
  les modèles lorsque la Voie 2 est configurée et n'est pas un contrôle déterministe.
- **Mode dégradé** (ni index, ni CLI, ni MCP): recherche sur les métadonnées seulement (voir la
  dernière section).

La consigne donnée au modèle reste la même: **ne pas ouvrir de corps complets avant une shortlist**.
Le routeur rend quatre statuts, et chacun appelle un geste précis:

| Statut | Le geste qui suit |
| --- | --- |
| `routed` | Charger l'agent puis le process désignés, rien d'autre. |
| `ambiguous` | Poser la question proposée. Ne pas ouvrir les corps des process concurrents pour trancher: au plus leurs métadonnées. |
| `needs_clarification` | Poser la question proposée. |
| `out_of_scope` | Charger le fallback d'aide s'il est configuré, sinon dire simplement la limite. |

## 4. Lire le process choisi

Lire le `SKILL.md` du process routé, et lui seul: pas ses voisins, pas tout l'agent. Un process se
suffit; ce qu'il lui faut d'autre, il le déclare.

## 5. Lier le contexte

Avant de suivre le process, demander ce qu'il déclare à précharger (le geste `contexte`: la CLI
`base context`, l'outil MCP `get_context_pack`). La réponse liste des chemins et des notes sous un
budget, jamais des contenus: lire un chemin retenu reste un geste explicite. L'ordre:

1. Les références déclarées (`requires`), toujours.
2. Les références optionnelles (`may_use`), seulement si la tâche les appelle.
3. Les entités nommées par la demande (un client, un dossier), cherchées dans les périmètres que le
   process déclare, jamais dans tout le dépôt.

La règle de lecture qui borne tout le reste: une ressource se lit parce qu'elle est **déclarée**,
**trouvée dans un périmètre borné**, ou **demandée explicitement**. Aucune autre raison.

## 6. Résoudre une ressource

Pour ouvrir une ressource dont on connaît l'intention mais pas le chemin, du moins cher au plus cher:

1. La référence exacte (id ou chemin), si elle existe.
2. Le README du dossier attendu.
3. La recherche sur les métadonnées (le geste `chercher`: `base discover`, `discover_resources`).
4. Le secours approximatif du ranker, seulement si le score est net.
5. La question, si rien ne résout.

## 7. Chercher une entité métier

«Où est Dupont SA?» Le slug probable d'abord si la convention du dossier est connue
(`clients/dupont-sa.md`), puis la recherche dans le périmètre métier attendu, en lisant les
correspondances les plus plausibles dans une limite nommée. Si plusieurs fiches restent proches,
demander. Ce qu'il ne faut jamais faire: chercher dans tout le dépôt, lire tous les clients, lire
tous les devis.

Les variantes contextuelles d'un process (un sous-fichier par valeur d'un discriminant) ne sont pas
un mécanisme BASE: quand deux variantes changent l'intention ou la sortie, ce sont deux process;
quand le delta est minime, c'est une branche dans le corps du process.

## 8. Invoquer un outil

Le geste `invoquer` suit un seul rythme: comprendre, proposer, valider, agir. Lire la fiche de
l'outil (pas son code), passer par le tour à vide quand il existe, montrer le résultat ou le plan,
et n'exécuter qu'après confirmation explicite.

## 9. Écrire

Le geste d'écriture se fait en deux temps (`proposer` puis `committer`): proposer le diff ou la
liste des fichiers, obtenir la validation, appliquer par la voie médiée quand elle existe, tracer.
Sur cette voie, la confirmation avant écriture est un mécanisme. Dans un harnais qui édite
directement les fichiers, «pas de fichier final sans confirmation» et «pas de modification du noyau
`.ai/` au milieu d'un process métier» restent des consignes au modèle.

## 10. La conversation qui continue

Le routage a lieu aux frontières de tâche, pas à chaque message. Deux cas raffinent cette règle:

- **Une précision** («en fait c'est pour un client existant, Dupont»): rester dans le process, lier
  la nouvelle information, chercher dans le périmètre déclaré. Ne pas rerouter.
- **Un changement de finalité** («finalement je veux contester une facture déjà envoyée»): rerouter,
  parce que l'unité de travail change.

Et si le harnais résume une longue conversation au point de faire perdre le fil: rouvrir le
`SKILL.md` du process actif et son `AGENT.md` sur le disque avant d'agir. Le fichier fait foi, pas le
résumé conservé par le harnais.

## Mode dégradé (diagnostic seulement)

Sans index, sans CLI et sans MCP, il reste la recherche de fichiers (`AGENT.md`, `SKILL.md`) et la
lecture de leurs seules métadonnées de routage pour construire une shortlist. Ce mode sert au
diagnostic et à la robustesse, pas au quotidien d'un BASE installé, et il ne justifie jamais de lire
tout le corpus: la règle du plus petit objet qui prouve la décision suivante tient jusque dans la
panne.
