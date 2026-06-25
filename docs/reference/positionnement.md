---
schema_version: base.resource.v1
id: docs-reference-positionnement
type: document
title: Où se situe BASE dans le paysage des outils IA
description: Comprendre où BASE se place parmi les grandes catégories d'outils IA de 2026 (assistants personnalisables, orchestration d'agents, récupération, agents de codage, protocoles, formats ouverts), et ce qu'il ne prétend pas faire.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
---

# Où se situe BASE dans le paysage des outils IA

Choisir un outil IA, c'est décider ce que vous possédez et ce qui vous tient: BASE remplace-t-il vos outils, ou s'y ajoute-t-il? Pour qui l'évalue en parallèle d'autres solutions, voici sa place, une couche d'expertise souveraine pour un travail IA vérifiable par l'humain, et la liste honnête de ce qu'il ne fait pas.

> Thèse en une phrase: BASE possède l'articulation (agents Markdown portables, routage déterministe, actions médiées, expertise relisible) que vos outils d'exécution font tourner, sans devenir lui-même un moteur d'exécution.

Cette distinction est la colonne vertébrale du document. Un outil qui **exécute** (un modèle, un orchestrateur, un connecteur) fait tourner le calcul. BASE **possède** la façon dont ce travail est articulé: quel agent, quel process, quelles ressources ciblées, avec quelle validation. La plupart des outils comparés ci-dessous sont des couches sur lesquelles BASE se branche, pas des concurrents.

Un point de vocabulaire récurrent dans BASE: un **mécanisme** est appliqué par le broker (du code le vérifie), une **consigne** est une instruction suivie par le modèle (donc faillible). Là où une garantie compte, on précise laquelle des deux est en jeu.

## Comparaison par catégories

Le paysage 2026 des outils pour bâtir ou faire tourner des assistants IA tient en quelques grandes catégories. Voici la place de BASE face à chacune, et la relation à chaque fois: **différencié** (il déplace l'articulation hors de la plateforme), **complémentaire** (la catégorie exécute, BASE possède ce qu'elle exécute), **port** (BASE parle le protocole), **terrain partagé** (BASE prolonge le format). Les produits cités ne sont que des exemples d'une catégorie, jamais la catégorie elle-même.

| Catégorie d'outils (2026) | Ce qu'elle fait | Ce que BASE fait différemment | Relation |
| --- | --- | --- | --- |
| **Assistants personnalisables hébergés** (par exemple GPTs personnalisés, Gemini Gems, Claude Projects) | Fige une consigne et quelques fichiers de contexte dans votre compte chez le fournisseur, lié à un modèle et à son interface, sans code. | Déplace l'articulation hors de la plateforme: des agents en Markdown que vous possédez et versionnez, portables d'un modèle à l'autre, avec un routage qui choisit l'agent au lieu d'un assistant qu'on sélectionne à la main. | **Différencié** |
| **Copilotes intégrés aux suites bureautiques** (par exemple Microsoft 365 Copilot, Gemini dans Workspace) | Tisse l'IA dans les outils de productivité et mobilise vos données (documents, courriels, agenda) comme contexte, dans une suite et chez un fournisseur. | Rend l'articulation explicite et possédée (process et agents en texte, hors suite), rattachée à la **tâche** plutôt qu'à l'outil ouvert ce matin-là, donc réutilisable quelle que soit la suite. | **Différencié** |
| **Pipelines de récupération et de mémoire** (RAG, indexation vectorielle, mémoire d'agent; par exemple Qdrant, Cohere Rerank, Mem0) | Récupère des fragments par similarité, ou rappelle un état passé, et les injecte dans le contexte du modèle au moment de l'inférence. | Ne fait pas de RAG et n'a pas d'état opaque à rappeler: route vers une unité de travail entière (un **agent et son process**) de façon déterministe et lexicale, et garde sa mémoire explicite et versionnée. Un pipeline peut être un outil qu'un process mobilise. | **Différencié** |
| **Plateformes d'agents d'entreprise gouvernées** (no/low-code; par exemple Copilot Studio, Gemini Enterprise) | Assemble, ancre par RAG, connecte et publie des agents gouvernés dans son propre périmètre: une catégorie d'exécution et d'orchestration. | N'exécute pas; possède l'articulation (quel agent, quel process, quelles actions médiées propose-puis-commit) en texte portable, qui peut nourrir ces plateformes au lieu d'y être enfermée. | **Complémentaire** |
| **Frameworks d'orchestration d'agents** (graphe d'états, rôles, exécution durable; par exemple LangGraph, CrewAI, Temporal) | Fait tourner la boucle: branche, retente, fusionne un état, coordonne plusieurs agents, rejoue après une panne. C'est le moteur d'exécution. | N'exécute rien de cela; possède l'articulation en amont (routage lexical déterministe vers un agent et un process) et reste prudent sur le multi-agent autonome: sa boucle est propose-puis-commit, vérifiée par l'humain. Un agent BASE peut devenir un nœud du graphe. | **Complémentaire** |
| **SDK d'agents des fournisseurs de modèles** (par exemple Claude Agent SDK, OpenAI Agents SDK, Google ADK) | Exécute la boucle agentique côté fournisseur (outils, transferts entre agents, accès à la machine, garde-fous), arrimée à un modèle précis. | Ajoute par-dessus l'articulation possédée et la médiation d'egress: l'action est proposée puis committée sous contrôle, pas exécutée en continu. Indépendant du fournisseur. | **Complémentaire** |
| **Agents de codage de l'environnement de travail** (terminal, IDE, arrière-plan; par exemple Claude Code, Cursor, Codex, Devin) | Lit vos fichiers, raisonne, édite, lance des commandes et boucle jusqu'à la tâche, sous approbation réglable, sur votre machine ou un sandbox. | N'exécute pas la boucle; vit dans cet outil et lui fournit l'articulation en amont (choix déterministe d'un agent et d'un process entiers) et la médiation propose-puis-commit, qui garde l'humain au point d'action. | **Complémentaire** |
| **Protocoles d'interopérabilité** (agent-outil et agent-à-agent; par exemple MCP, A2A) | Standardise le branchement par lequel un agent découvre et appelle des outils et des données, ou coordonne d'autres agents, indépendamment de l'outil. | Un port que BASE parle: son serveur expose le routage et les ressources (`route_request`, `load_agent`, `propose_change`, `commit_change`) via MCP. Le protocole transporte; BASE fournit ce qui transite. | **Port** |
| **Formats ouverts de configuration d'agent** (par exemple AGENTS.md, Agent Skills, CLAUDE.md) | Décrit en fichiers ouverts les instructions, compétences et commandes qui guident un agent à l'exécution, indépendamment de l'outil. | BASE structure cette connaissance en agents et process possédés, avec un routage déterministe qui choisit un agent et un process entiers au lieu d'injecter un bloc d'instructions indifférencié. Il lit et écrit ces formats. | **Terrain partagé** |

Lecture transverse. BASE est **différencié** face aux catégories de possession et de périmètre, là où l'articulation du travail reste captive d'un compte, d'une suite ou d'un index de fragments. Il est **complémentaire** face aux catégories d'exécution, qui font tourner la boucle là où BASE ne la fait pas. Il est un **port** face aux protocoles d'interopérabilité, qu'il parle plutôt qu'il ne concurrence, et un **terrain partagé** face aux formats ouverts, qu'il prolonge en ajoutant le routage et le choix que le format seul n'apporte pas. La ligne de partage est nette: tout ce qui exécute, indexe ou héberge se compose avec BASE ou en diffère par le périmètre; BASE, lui, possède le choix déterministe de l'agent et du process, et la médiation qui garde l'humain au point d'action.

## Un produit intégré, ou un cadre que vous possédez

La plupart des offres IA pour les entreprises sont des **produits intégrés**: un assistant, son modèle, son interface et vos données réunis dans un même service. C'est efficace tout de suite, et c'est souvent un bon point de départ. Mais un produit et un cadre ne se jugent pas sur la même échelle de temps. Quatre différences structurelles valent pour n'importe quel lecteur.

- **La possession.** Dans un produit, l'articulation de votre travail (vos règles, vos process, la façon dont vous découpez les tâches) vit dans le compte et le format du fournisseur. Dans un cadre, c'est un dossier de fichiers texte que vous possédez, versionnez et emportez. Le jour où l'offre change de prix, de conditions ou disparaît, l'un repart de zéro, l'autre garde tout.
- **Le modèle reste un choix.** Un produit vous lie à son modèle et à son rythme. Un cadre fait du modèle une brique externe et remplaçable: vous suivez la frontière des modèles au lieu d'épouser le calendrier d'un seul fournisseur. Le modèle le mieux placé aujourd'hui ne sera pas celui de l'an prochain; un cadre vous laisse en changer sans tout reconstruire, là où un produit lié à son modèle vous y oblige.
- **La vérifiabilité.** Les garanties d'un produit sont, pour l'essentiel, des instructions données à son modèle, à l'intérieur d'une boîte fermée: vous les croyez sur parole. Un cadre ouvert peut faire de ses garanties des mécanismes, du code que vous lisez et testez. On audite un cadre; on croit un produit.
- **La durée.** Des fichiers dans des formats ouverts survivent à n'importe quel produit. Votre expertise s'y accumule dans un support qui ne dépend pas des décisions d'un fournisseur. C'est ce qui rend un cadre bien plus porteur à terme: il fait de l'IA un actif qui vous appartient, plutôt qu'un abonnement qui vous tient.

Ces produits rendent de vrais services, et BASE se branche volontiers dessus (voir la comparaison ci-dessus). Ces différences disent simplement où se loge la valeur durable: moins dans l'infrastructure ou l'outil qui exécute que dans l'articulation possédée, celle qu'on garde quand le reste change.

## Les formats ouverts de connaissance

De grands acteurs convergent en 2026 vers des standards ouverts pour l'IA agentique: des protocoles d'interopérabilité (MCP pour l'agent-outil, A2A pour l'agent-à-agent) et des formats ouverts pour décrire la connaissance et la configuration d'un agent en Markdown, l'**Open Knowledge Format (OKF)** de Google ou les fichiers `AGENTS.md` en étant des exemples récents, plusieurs désormais portés en gouvernance ouverte et commune (la Linux Foundation en héberge une partie). C'est une bonne nouvelle. Chaque pas qui aide les gens à garder leur savoir dans des fichiers ouverts, portables et possédés va dans le sens que BASE défend depuis le départ: la souveraineté, jusque dans le format.

BASE avance plus loin sur le même chemin. Une ressource BASE est déjà un simple fichier Markdown à frontmatter, lisible par ces formats, et y ajoute ce qu'ils laissent de côté: le routage déterministe, le contrôle d'egress, l'écriture médiée et la boucle de vérification par l'humain. Ces premiers pas vont vers un terrain que BASE explore déjà en profondeur, et nous sommes heureux d'y voir d'autres acteurs avancer.

## Ce que BASE ne prétend PAS être

Pour rester honnête, voici ce que BASE n'est pas et ne fournit pas seul.

- **Pas un runtime d'agents** ni un moteur d'orchestration, de workflow ou de DAG. BASE ne fait pas tourner d'agents en boucle; il possède l'articulation que d'autres font tourner.
- **Pas du RAG** ni un index documentaire généraliste. Le routage choisit un agent et un process, il ne récupère pas de passages.
- **Pas une plateforme**: ni calcul, ni stockage, ni connecteurs managés fournis par défaut.
- **Pas un système IAM, DLP, SIEM, RBAC, de rétention ou d'archivage légal.** Ces fonctions relèvent de votre organisation et de ses outils.
- **Pas une garantie d'exactitude** des sorties produites par un modèle. BASE structure la vérification par l'humain, il ne la remplace pas.

## Trois preuves pour le sceptique

**1. Des mécanismes appliqués, pas seulement des consignes.** Plusieurs garanties sont vérifiées par du code, indépendamment de ce que le modèle décide:

- confinement des chemins et refus des symlinks sortants (`tools/core/confine.mjs`);
- écriture en deux temps, proposer puis appliquer, médiée et atomique;
- exécution des tools en dry-run par défaut;
- abstention de routage (`out_of_scope`, `ambiguous`, `needs_clarification`) plutôt qu'une fausse certitude;
- serveur MCP en HTTP lecture seule par défaut, option de jeton bearer;
- Studio en loopback uniquement;
- les réglages stockent des **noms** de variables d'environnement, jamais les clés d'API en clair;
- contrôle d'egress: une ressource confidentielle ou une racine déclarée locale n'est pas envoyée à un modèle distant, vérification faite **avant** l'appel;
- le journal `.ai/trace` enregistre localement les opérations médiées.

Ce sont des mécanismes (broker), à distinguer des consignes (instructions au modèle), qui restent faillibles.

**2. Le routage choisit, il ne récupère pas.** Le routage par défaut est 100 % local et lexical (aucun réseau); il retourne un agent et un process, ou s'abstient. Sa stabilité est testée: `base route-test` lit des fixtures et échoue à la moindre dérive. Une récupération par similarité, elle, ne serait pas reproductible à l'identique fixture par fixture. Le ranking sémantique reste optionnel et peut tourner localement (par exemple via Ollama); le **modèle** est le choix de l'utilisateur, hors périmètre de BASE.

**3. Les affirmations sont câblées à des preuves et à des tests.** L'état réel est documenté (`docs/reference/etat-implementation.md`) et la couverture est tenue et vérifiée en CI: l'architecture des tests (statique, unitaire, contrat, composants Studio, bout en bout, accessibilité) est décrite dans `specs/TESTING.md`, et la preuve exigences vers tests dans la matrice générée. La CI exécute `base validate` et `npm audit` (hors dépendances de dev, seuil high). Là où BASE ne fournit pas une fonction, le présent document le dit en clair plutôt que de l'affirmer.

## Licence et portée

Le code est sous Apache-2.0, la documentation sous CC-BY-4.0.

Cette page est **informative**: elle ne constitue ni un conseil juridique ni un conseil de conformité. Une institution reste responsable de sa propre analyse d'impact (DPIA) et de sa politique de sécurité. Voir aussi `docs/reference/base-et-vos-outils-ia.md` et `docs/reference/etat-implementation.md`.
