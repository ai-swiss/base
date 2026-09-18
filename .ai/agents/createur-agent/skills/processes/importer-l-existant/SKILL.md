---
schema_version: base.resource.v1
id: importer-l-existant
type: process
title: Importer l'existant
scope: team
status: active
sensitivity: internal
description: Convertir des documents existants (notes, modes d'emploi Word, wikis, checklists) en ressources BASE (process, compétences, documents, templates), proposées via le gate, jamais écrites d'office.
use_when: "Quand l'utilisateur veut partir de ses documents existants: «importe mes procédures», «transforme ce mode d'emploi en process», «j'ai déjà tout dans un wiki»."
keywords: [import, migration, conversion, existant, onboarding]
routing:
  examples:
    - Importer mes procédures existantes
    - Transformer ce document en process
    - J'ai déjà un wiki, comment le réutiliser ?
  avoid_when:
    - Question de définition d'un process.
    - Ajouter un workflow à un agent déjà en place.
    - Créer un agent de zéro sans matériau existant.
    - Signaler un dysfonctionnement de l'assistant.
    - Faire le point sur un dossier en service et dire ce qui pourrait aller mieux dans ses process.
---

# Importer l'existant

Personne ne part d'une page blanche: le savoir-faire est déjà consigné quelque part. Ce process
examine ce que l'utilisateur lui montre et PROPOSE des conversions en ressources BASE: chaque
écriture passe par le gate propose → commit, et l'humain valide chaque diff.

## Inputs

Demande à l'utilisateur:
- **Les chemins ou fichiers à importer** (un dossier, un export Word converti, des pages copiées).
- **L'agent de destination** (existant, ou à créer d'abord avec `creer-agent`).

## Étapes

### 1. Explorer le matériau

Commence par un survol de **métadonnées**, jamais une lecture intégrale de tout: la liste des fichiers
(noms, dossiers, premiers titres: `discover_resources` si le MCP est disponible,
`node .ai/base.mjs discover "<besoin>" --root .` depuis un terminal, ou la liste du dossier), puis un ordre de
lecture proposé; n'ouvre en entier (`open_resource`) que ce qui est retenu pour la carte. Sur un
dossier volumineux, c'est la différence entre une analyse qui tient et un contexte saturé avant la
première proposition. Range chaque contenu:
- **Se suit** (étapes, checklist, procédure) → futur `process`
- **S'apprend** (règles, conventions, savoir) → future `competence` ou `document`
- **Se remplit** (trame, modèle de courrier) → futur `template`
- **Se consulte avec une validité** (barème, tarifs) → `document` avec `valid_from`/`valid_until`

### 2. Proposer la carte d'import

Présente la découpe source → ressource cible (type, id, chemin) et fais-la valider AVANT de convertir
quoi que ce soit. Dès qu'il y a plus de trois ressources ou plusieurs arbitrages, présente-la sous forme de
**fiche de décision** (process `fiche-de-decision`) plutôt qu'en simple tableau: une carte par conversion
candidate, ta recommandation en tête, et les vraies options (process ou compétence, un agent ou deux,
scope personnel ou équipe). Garde de la souplesse: accompagne une migration **progressive** vers une structure
exploitable par l'IA, et laisse un point ouvert «voyez-vous d'autres choses utiles à ajouter?» pour que
la personne enrichisse la proposition, au lieu de se borner à l'accepter ou la refuser.

Écris la carte validée dans un **fichier** à la racine du projet (par exemple `import-carte.md`): un
tableau source → type BASE proposé → agent de destination, chaque ligne non tranchée portant
`[A VALIDER]`. Un import est un process long: la carte en fichier survit à la conversation (l'ancre
d'interruption du journal s'y applique), reste cherchable par `base markers`, et la conversion du
lendemain reprend à la ligne où l'on s'était arrêté. Jamais de carte qui ne vive qu'en mémoire de
conversation.

### 3. Convertir, une ressource à la fois

Pour chaque ressource validée, rédige le fichier complet avec son frontmatter `base.resource.v1`:
`id`, `type`, `title`, `description`, portée, statut et sensibilité. Un process reçoit un `use_when`
et des exemples dignes du routeur. Un document reçoit des mots-clés et des titres de section qui
correspondent aux questions du terrain. Propose ensuite le fichier via `propose_change`.
**N'appelle jamais `commit_change` toi-même**: l'humain valide chaque diff.

### 4. Vérifier la santé après import

`base doctor` signale notamment les liens cassés et les ressources orphelines, mais il ne prouve pas
que les connaissances importées sont retrouvables ni qu'elles répondent aux questions du terrain.

Avant de déclarer le corpus sain:

1. recueille avec l'utilisateur un petit ensemble représentatif de questions réelles;
2. pour chacune, lance la découverte au grain section avec une limite de cinq résultats;
3. choisis le passage canonique attendu, ouvre son `id#ancre` exact et vérifie avec l'utilisateur
   que ce passage répond réellement à la question;
4. consigne la question, la référence attendue, son rang et tout échec;
5. corrige seulement les métadonnées exactes ou le découpage en sections qui expliquent les échecs,
   puis rejoue les mêmes questions;
6. termine par une question voisine, choisie après les corrections et jamais utilisée pour les
   ajuster, afin de vérifier que le corpus ne répond pas seulement aux formulations travaillées.

**Condition de fin observable:** `base doctor` ne signale aucun blocage lié à l'import, chaque
question représentative retrouve dans les cinq premiers résultats un passage exact qui s'ouvre et
répond à la question, les échecs restants sont consignés et acceptés par l'utilisateur, et la
question voisine réussit sans nouvelle correction.

## Ce que tu ne fais jamais dans ce process

- **Écrire sans diff validé.** Proposer, toujours; committer, jamais.
- **Inventer du contenu absent des sources.** Tu convertis, tu ne crées pas de savoir.
- **Importer en vrac.** Chaque ressource est découpée, nommée et validée une à une.
