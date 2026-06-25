---
title: Garder vos outils IA, posséder l'intelligence qu'ils exécutent
description: Comment BASE se combine avec vos outils IA sans les remplacer: périmètre par tâche, texte que vous possédez, agents planifiés sous validation humaine, et aide pour intégrer votre outil précis.
keywords: [outils, plateforme, suite, intégration, interopérabilité, mcp, souveraineté, exécution, agents planifiés, validés]
---

# Garder vos outils IA, posséder l'intelligence qu'ils exécutent

> Cette page s'adresse à qui utilise déjà un outil IA (assistant, plateforme, suite) et se demande où BASE se place. En deux mots: vous gardez vos outils pour l'exécution, et vous possédez dans BASE l'intelligence qu'ils exécutent.

«BASE ou mon outil?» est une fausse alternative: les deux ne jouent pas le même rôle. Une plateforme ou une suite vous donne l'exécution: le calcul, le stockage, les connecteurs, et de plus en plus des assistants et de l'automatisation par-dessus. BASE fournit autre chose: **l'articulation, possédée et portable, de la façon dont l'IA travaille sur votre métier**.

La vraie question est: **qui possède cette articulation, vous ou votre fournisseur?**

Pour situer BASE catégorie par catégorie dans le paysage des outils de 2026 (assistants hébergés, copilotes bureautiques, pipelines RAG, plateformes d'agents gouvernées, frameworks d'orchestration, et le reste: là où il est différencié, complémentaire, ou simple port), voir [Où se situe BASE](positionnement.md). La présente page donne le principe; cette carte donne la place.

## Là où ça se compare vraiment

Beaucoup d'outils permettent aujourd'hui de pointer l'IA vers vos fichiers (assistants personnalisés, carnets de sources, mémoires). C'est réel et utile. La différence se joue ailleurs.

«J'ai déjà un outil IA», dites-vous. Lequel? Ils ne jouent pas tous le même rôle, et aucun ne tient celui de BASE.

| | Chat générique | Suite bureautique IA | Plateforme d'agents | BASE |
|---|---|---|---|---|
| **Vous possédez les fichiers** | Non | Non | Non | **Oui, du Markdown lisible et portable** |
| **Périmètre du contexte** | La conversation | Par source connectée | Par agent configuré | **Par tâche: le process n'ouvre que l'utile** |
| **Contrôle d'égress (mécanisme)** | Non | Non | Variable | **Oui, avant l'appel, par le broker** |
| **Propose puis commit (un diff avant l'écriture)** | Non | Non | Variable | **Oui** |
| **Choix du modèle** | Imposé | Souvent imposé | Selon la plateforme | **Le vôtre, externe** |

Le point décisif: le périmètre est attaché à la **tâche** plutôt qu'à l'assistant. C'est **du texte que vous possédez** plutôt qu'un objet logé dans une plateforme, et il marche avec **le modèle de votre choix**. De là viennent une vérification plus fine, un usage portable et une intelligence souveraine.

Et ce que BASE ne remplace pas (IAM, DLP, archivage légal, gouvernance): voir [Sécurité et limites](../trust/securite-et-limites.md).

## Quatre promesses qu'on vous a vendues, et ce qu'elles oublient

On vous a sans doute branché tout cela: l'assistant voit la boîte mail et le drive partagé, vous pouvez vous monter une bibliothèque d'agents, l'IA touche à votre base de données soignée, et le tout coche les cases, AI Act compris. L'impression domine que la structure est faite. Reprenez chaque phrase: ce qui manque n'est jamais la puissance, c'est une structure que vous possédez et qui se rejoue.

**«Mon IA voit tous mes emails et mon drive partagé.»** Le défaut «tout-voir» laisse un processus opaque décider à votre place de ce qu'il lit, et un modèle se dégrade quand on le noie d'informations hors sujet: il répond moins bien, plus cher, plus dur à relire. Ces suites savent pourtant cibler. Mais le ciblage y est manuel et refait à chaque fois, jamais conservé. Le défaut, lui, reste «tout-voir».

**«Je peux créer toute une bibliothèque d'agents.»** Oui. Et avec elle, une charge: penser en agents au lieu de suivre votre fil, puis retrouver à chaque fois lequel s'applique. La complexité n'a pas disparu, elle a changé de place: de la tâche vers vous.

**«Mon IA voit toute ma base de données soigneusement structurée.»** Un accès n'est pas un accès utile. Sans dire à l'IA quoi lire et pourquoi, ouvrir toute la base ne crée aucune valeur, juste une surface de plus à surveiller.

**«Mon système coche toutes les cases, l'AI Act compris.»** Être conforme est nécessaire. Ça ne rend pas l'IA utile pour autant: la conformité borne le risque, elle ne produit pas la valeur.

Aucun de ces outils n'est en cause. Le problème, c'est le réglage par défaut, celui qui laisse la structuration à un processus opaque, ou à vous, sans la rendre possédée ni rejouable. BASE déplace ce réglage: il attache le périmètre à la **tâche**, l'écrit une fois, en texte que vous gardez, et le rejoue à l'identique au lieu de le refaire de mémoire. Vous dites au process quoi ouvrir et pourquoi, et ce choix se garde au lieu de se perdre. La leçon tient en une phrase: **un accès n'est pas un accès utile.**

## Complémentarité: BASE se laisse consommer par vos outils

Étant du texte plus un serveur MCP, BASE se branche sur vos outils plutôt que de s'y opposer:

- **MCP** (un standard ouvert): BASE expose un serveur MCP; un outil compatible peut l'appeler pour router, ouvrir et lire ses ressources.
- **Fichiers**: vos Markdown peuvent vivre là où votre outil les lit et nourrir un assistant existant.
- **Protocoles ouverts d'agents**: voie d'évolution pour faire coopérer des agents définis dans BASE avec d'autres; non implémentée à ce jour dans BASE.

### Une porte, pas un fouillis d'outils

Un serveur MCP peut exposer des dizaines d'outils granulaires. C'est une facilité trompeuse: chaque outil ajouté encombre le contexte du modèle, dilue son attention et multiplie les surfaces d'erreur et de permission. Plus on outille un modèle, moins il choisit bien.

BASE prend le parti inverse, et c'est un choix de conception, pas une limite. Sa surface tient surtout en un point: une **porte d'entrée sémantique**, le routeur, qui reçoit l'intention en langage naturel et la dirige vers le bon agent et le bon process, en n'ouvrant que les ressources utiles à *cette* tâche. Autour de cette porte, quelques opérations médiées (lire une ressource, proposer puis confirmer une écriture, lister les marqueurs) sous les garanties du broker, plutôt qu'une nuée de capacités. Le modèle n'a pas besoin de connaître vingt outils; il a besoin de bien franchir une porte, et de trouver derrière elle un contexte déjà cadré.

Autrement dit, gardez vos outils pour le calcul, le stockage et l'exécution; possédez, dans BASE, la couche d'intelligence. Voir aussi [Framework public](framework-public.md), section «Souveraineté autour des modèles».

## Agents planifiés et autonomes

Vous voulez un agent qui tourne sur un horaire (par exemple chaque lundi) à partir d'un process défini dans BASE? C'est un bon cas, à une condition: un agent qui tourne seul pendant des mois est souvent l'endroit où la vérification se relâche le plus. La règle tient en une phrase: **la génération peut être automatique, la validation reste tenue.**

Le chemin recommandé, quel que soit l'outil, gouverné et auditable:

1. Un **planificateur** lance l'exécution (un déclencheur planifié, un ordonnanceur). Il ne contient aucune logique métier.
2. L'**agent d'exécution** de votre plateforme appelle le **serveur MCP de BASE** pour obtenir le process et ses ressources ciblées.
3. Il **exécute la génération** avec le modèle et les connecteurs de la plateforme.
4. Aux **points de décision** du process, l'agent **s'arrête pour validation humaine** (la plupart des plateformes récentes proposent un mode «brouillon» ou «exiger une approbation»).
5. Après approbation, l'écriture est **appliquée**, et une trace en garde la mémoire (au niveau de détail que vous choisissez).

Côté BASE, rien ne s'écrit en aveugle: les actions à conséquence passent par une **proposition** (un diff montré) avant d'être appliquées; les étapes à faible risque, vérifiables par une règle, peuvent être confirmées automatiquement. Vous calibrez, étape par étape, ce qui est automatique et ce qui attend un humain.

La pièce maîtresse: le process est du texte que **vous possédez**. Vous pouvez changer de planificateur, de modèle ou de plateforme sans le réécrire.

> **Si l'on vous parle de planification ou d'agents autonomes:** gardez la logique dans BASE, faites-la appeler par la plateforme, et maintenez l'humain au point de validation. La planification automatise la *production*, pas la *décision*.

## Pour votre outil précis: demandez à BASE

Ce document décrit le **principe**, valable pour tout outil. Pour l'**intégration concrète à votre outil**, BASE peut vous guider:

- dites-lui de quel outil il s'agit;
- fournissez-lui le lien vers sa documentation d'intégration (ou laissez-le la chercher si votre environnement permet la navigation web);
- BASE lit cette documentation et vous guide pas à pas, en plaçant chaque étape dans le bon plan (planificateur, appel au serveur MCP de BASE, validation humaine, application), et en préservant les points de vérification.

Concrètement: chargez le concierge BASE et demandez «aide-moi à intégrer BASE à [mon outil]» ou «comment planifier un agent avec [mon outil]». Voir l'agent d'accueil dans `.ai/agents/concierge-base/`.

---

*Les capacités des outils tiers évoluent rapidement. Ce document décrit des différences et un principe structurels durables, sans dépendre d'un produit précis; pour les détails propres à votre outil, appuyez-vous sur sa documentation à jour (BASE peut vous y aider).*
