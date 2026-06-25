---
schema_version: base.resource.v1
id: creer-agent
type: process
title: Créer un agent
scope: team
status: active
sensitivity: internal
name: creer-agent
description: "Créer un assistant IA métier de A à Z. Utiliser quand l'utilisateur veut créer un nouvel assistant, construire un agent, ou adapter l'IA à son métier."
use_when: Quand l'utilisateur veut créer un nouvel assistant IA métier, construire un agent ou adapter l'IA à son activité.
routing:
  examples:
    - Je veux créer un assistant pour mon métier
    - Construire un agent pour mon entreprise
    - J'aimerais un assistant IA pour mon activité
  avoid_when:
    - Audit entretien vérification publication readiness d'un BASE existant.
    - Review audit harden an existing BASE after implementation.
argument-hint: "[description du métier ou du besoin]"
user-invocable: true
allowed-tools: Read Write Edit Glob Grep Bash
---

# Créer un agent

Guider l'utilisateur de la description de son besoin jusqu'à un agent IA métier fonctionnel.

## RÈGLE ABSOLUE

**Ne crée AUCUN fichier avant l'étape 7.** Les étapes 1 à 6 sont une conversation de découverte et de conception. L'étape 6 se termine par un plan complet que l'utilisateur doit approuver explicitement. Si l'utilisateur dit «Crée un assistant pour X», ta première réponse est une question, jamais une création de fichier.

## Inputs

Demande à l'utilisateur:
- **Son métier ou activité**: que fait son entreprise?
- **Ce qu'il aimerait que l'assistant fasse**: quelles tâches il automatiserait ou structurerait?

Avant de parler de fichiers ou de metadata, clarifie le niveau de structure souhaité avec des mots simples:

- assistant unique que l'utilisateur sélectionne lui-même;
- assistant avec plusieurs workflows proches;
- assistant où BASE choisit automatiquement le bon workflow;
- assistant destiné à une équipe ou à une publication.

Si l'utilisateur ne sait pas par où commencer, charge `skills/competences/exemples-agents/SKILL.md` pour lui montrer des idées.

## Étapes

### 1. Découvrir le besoin

Commence par des questions ouvertes. L'objectif est de comprendre le quotidien de l'utilisateur, pas de parler de technologie.

> «Racontez-moi votre journée type. Quelles tâches vous prennent le plus de temps? Qu'est-ce qui vous frustre dans votre travail quotidien?»

Questions complémentaires:
- «Quelles tâches faites-vous de manière répétitive?»
- «Quels documents rédigez-vous régulièrement?»
- «Quelles informations devez-vous chercher souvent?»
- «Si vous aviez un assistant parfait, que lui demanderiez-vous en premier?»

> «Si je comprends bien, vous passez beaucoup de temps à [tâche] et vous aimeriez que l'assistant vous aide à [objectif]. C'est correct?»

← Reformulation

### 2. Identifier les workflows → processes

Pour chaque tâche identifiée, approfondis:

> «Prenons [tâche]. Quand vous la faites aujourd'hui, quelles sont les étapes? De quoi avez-vous besoin pour commencer? Comment savez-vous que c'est terminé?»

Pour chaque workflow, note:
- **Nom** (en termes métier, pas techniques)
- **Déclencheur** (quand est-ce que l'utilisateur lance cette tâche?)
- **Étapes principales** (3 à 7 étapes, pas plus)
- **Résultat attendu** (quel document ou action à la fin?)
- **Signal de routage éventuel** (si BASE doit choisir automatiquement ce workflow, une phrase simple qui dit quand l'utiliser)

Après avoir identifié 2-3 workflows:
> «Voici les workflows que je propose pour votre assistant:
> 1. **[Workflow 1]**: [description courte]
> 2. **[Workflow 2]**: [description courte]
>
> Chacun deviendra un "guide de conversation" que l'assistant suivra quand vous lui demandez. On pourra en ajouter d'autres plus tard. Ça vous convient?»

Ne propose pas plus de 3 workflows pour commencer.

← Reformulation

### 3. Identifier les connaissances métier → compétences

> «Pour bien vous aider, l'assistant aura besoin de connaître certaines choses sur votre domaine. Par exemple, dans le cas d'un assistant devis, il connaît les taux de TVA suisses, la structure d'un devis, la terminologie.»

Questions:
- «Quels termes spécifiques utilise-t-on dans votre métier?»
- «Y a-t-il des règles ou des normes à respecter?»
- «Quelles sont les bonnes pratiques de votre domaine?»
- «Quelles erreurs un débutant ferait-il?»

> «Voici les domaines de connaissance que je propose:
> 1. **[Connaissance 1]**: [ce qu'elle contient]
> 2. **[Connaissance 2]**: [ce qu'elle contient]
>
> L'assistant consultera ces fiches quand il en a besoin.»

← Reformulation

### 4. Identifier les documents types → templates

> «Quels documents produisez-vous régulièrement? Par exemple: des rapports, des propositions, des fiches, des formulaires?»

Pour chaque type de document:
- **Nom** (ex. «Rapport de visite», «Fiche client»)
- **Sections principales** (les parties qui reviennent à chaque fois)
- **Données variables** (ce qui change d'un document à l'autre)

← Reformulation

### 5. Identifier les données → dossiers métier

> «Quelles informations votre assistant devrait-il connaître en permanence? Par exemple, l'assistant devis connaît l'identité de l'entreprise, le catalogue de services, et les fiches clients.»

Questions:
- «Quelles informations de base sur votre entreprise sont nécessaires?»
- «Quelles données de référence utilise-t-on souvent?» (catalogue, barème, annuaire, etc.)
- «Quelles données s'accumulent au fil du temps?» (clients, projets, historique, etc.)

← Reformulation

### 6. Proposer l'architecture complète

Charge `skills/competences/architecture-agent/SKILL.md` pour suivre les patterns.

Présente un récapitulatif complet:

> «Voici l'architecture de votre assistant **[Nom de l'agent]**:
>
> **Rôle:** [description en une phrase]
>
> **Workflows:**
> 1. [Workflow 1]: [description]
> 2. [Workflow 2]: [description]
>
> **Choix de routage:** [chargement manuel de l'agent / routage BASE vers les workflows / fixtures de routage si besoin]
>
> **Connaissances:**
> 1. [Connaissance 1]: [contenu]
> 2. [Connaissance 2]: [contenu]
> 3. Communication (règles d'interaction standard)
> 4. Marqueurs (suivi et traçabilité)
> 5. Journal (mémoire entre sessions)
>
> **Documents:**
> 1. [Template 1]: [sections]
>
> **Données:**
> - `[dossier]/`: [contenu]
>
> Est-ce que cette architecture vous convient? On peut ajuster avant que je crée les fichiers.»

**⚠ Point de décision, avant création:**
**STOP: ne passe PAS à l'étape 7 tant que l'utilisateur n'a pas dit explicitement qu'il approuve ce plan.** Attends un accord clair («oui», «c'est bon», «on y va») avant de créer quoi que ce soit.

### 7. Créer les fichiers de l'agent

Crée la structure dans `.ai/agents/[nom-agent]/`:

1. **AGENT.md**: remplis avec l'identité, la philosophie d'interaction (5 points), la table d'intentions, la doctrine agent → process → ressources, les fichiers métier, l'inventaire des skills, et les garde-fous (6 points incluant contrôle mécanique, validation humaine et séparation instructions/données). Utilise `.ai/agents/_template/AGENT.md` comme base.

2. **skills/processes/**: un dossier par workflow identifié, chaque dossier contient un SKILL.md au format standard avec frontmatter. Si l'utilisateur veut le routage BASE ou si plusieurs workflows sont proches, ajoute `schema_version`, `id`, `kind: process`, `description`, `use_when` et, si utile, `routing.examples` / `routing.avoid_when`. **Rédige `use_when`, `description` et `routing.examples` dans la langue de l'utilisateur** (le routage compare les mots de la demande à ceux-ci; en allemand, écris-les en allemand). Distingue reformulations (légères) et points de décision (avant action irréversible). Chaque process se termine par une étape Journal.

3. **skills/competences/**: un dossier par domaine de connaissance identifié, chaque dossier contient un SKILL.md avec `user-invocable: false`. Plus les 3 compétences standard:
   - Copie `marqueurs/SKILL.md` depuis `_template/skills/competences/marqueurs/`
   - Copie `journal/SKILL.md` depuis `_template/skills/competences/journal/`
   - Copie `communication/SKILL.md` depuis `_template/skills/competences/communication/`

4. **templates/**: un fichier par document type, avec des placeholders en MAJUSCULES

5. **tools/** (optionnel): scripts si des besoins d'automatisation ont été identifiés

6. **.ai/routing/route-tests.json** (si routage BASE activé): quelques demandes réalistes et la route attendue. Ce fichier sert à vérifier que BASE choisit le bon workflow et s'abstient quand la demande sort du périmètre.

Pour chaque fichier créé, montre un résumé à l'utilisateur (pas le contenu technique, juste ce que ça fait).

### 8. Créer les dossiers métier

À la racine du projet, crée les dossiers identifiés à l'étape 5. Pour chaque dossier, un fichier principal avec des placeholders `[A COMPLETER: ...]`.

### 9. Configurer l'outil

> «Quel outil utilisez-vous? Claude Code, Cursor, Codex, ou autre?»

Selon la réponse:
1. Cherche la documentation actuelle de l'outil en ligne (si accès web disponible)
2. Sinon, consulte `skills/competences/outils-connus/SKILL.md` comme référence
3. Génère les fichiers de configuration outil en implémentant les 5 primitives:
   - **Contexte permanent**: fichier qui charge AGENT.md au démarrage (ex. CLAUDE.md avec `@import`)
   - **Skills découvrables**: copier/lier les skills au bon emplacement pour l'outil
   - **Règles par chemin**: garde-fous activés quand l'agent touche des fichiers métier
   - **Permissions**: contrôler ce que l'agent peut faire (si l'outil le supporte)
   - **Protection framework**: empêcher la modification de `.ai/`

**⚠ Point de décision, avant configuration:**
> «Voici ce que je vais configurer pour [outil]: [description]. Confirmez-vous?»

### 10. Tester et itérer

> «Votre assistant est prêt! Essayons-le ensemble.
>
> Fermez cette conversation et ouvrez-en une nouvelle. Votre nouvel assistant devrait se présenter.
>
> Essayez de lui demander: [suggestion tirée du premier workflow créé].»

### 11. Journal

Écris une entrée dans `.ai/journal/` selon la compétence `journal`.

## Ce que tu ne fais jamais dans ce process

- **Créer des fichiers avant d'avoir compris le besoin.** Les étapes 1 à 5 existent pour une raison.
- **Proposer plus de 3 workflows au départ.** Un agent focalisé est plus utile qu'un agent qui fait tout.
- **Utiliser du jargon technique.** L'utilisateur parle de «workflows», de «connaissances métier», de «modèles de documents». Pas de «process», «compétence», «SKILL.md» dans la conversation.
- **Remplir des fichiers avec des données inventées.** Tous les contenus viennent de l'utilisateur. Si une information manque, utilise un marqueur `[A COMPLETER: ...]`.
- **Passer à la création sans le point de décision de l'étape 6.** C'est le point de décision le plus critique.
- **Oublier les compétences standard.** Chaque agent reçoit marqueurs, journal et communication.
- **Oublier le contexte sur les longues conversations.** Ce process a 11 étapes. Avant les étapes 6 et 7, résume ce qui a été décidé.
