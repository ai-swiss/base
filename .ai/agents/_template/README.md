# Créer votre propre agent

> **Voie assistée (recommandée)**: plutôt que de remplir ce template manuellement, dites simplement «Lis `.ai/agents/createur-agent/AGENT.md`». Le créateur d'agent vous guidera de A à Z.

Ce dossier est un **template** pour ceux qui préfèrent construire manuellement. Il contient la structure de base pour créer un nouvel agent IA adapté à votre métier.

## En 6 étapes

### 1. Copier ce dossier

Copiez le dossier `_template/` et renommez-le avec le nom de votre agent:

```
.ai/agents/
├── createur-agent/        ← le méta-agent
├── _template/             ← ce template
└── mon-nouvel-agent/      ← votre copie
```

Exemples de noms: `assistant-rh`, `gestionnaire-projets`, `support-client`, `planificateur-events`.

### 2. Remplir AGENT.md

Ouvrez `AGENT.md` et remplacez les placeholders:

- `[Nom de l'agent]` → le nom de votre assistant (ex. «Assistant RH»)
- `[Description du rôle]` → ce qu'il fait en une phrase
- **Table de routage** → les intentions que votre agent doit reconnaître et les skills correspondants
- **Fichiers métier** → les dossiers de données que votre agent utilise

Inspirez-vous de l'exemple dans `exemples/assistant-devis/.ai/agents/assistant-devis/AGENT.md`.

### 3. Créer vos processes (workflows)

Dans `skills/processes/`, créez un dossier par workflow avec un fichier `SKILL.md`:

```
skills/processes/
├── mon-workflow/SKILL.md
└── autre-workflow/SKILL.md
```

Un process typique contient:
- **Frontmatter YAML**: `name`, `description`, `user-invocable: true`, `allowed-tools`
- **Inputs**: ce qu'il faut demander à l'utilisateur
- **Étapes**: les phases de la conversation, avec reformulations (légères) et points de décision (avant action irréversible)
- **Étape Journal**: écrire une entrée dans `.ai/journal/` à la fin

Consultez `skills/processes/_exemple/SKILL.md` pour la structure.

### 4. Ajouter vos compétences (connaissances métier)

Dans `skills/competences/`, créez un dossier par domaine de connaissance avec un fichier `SKILL.md`:

```
skills/competences/
├── mon-domaine/SKILL.md       ← vos connaissances métier
├── marqueurs/SKILL.md         ← déjà inclus (standard)
├── journal/SKILL.md           ← déjà inclus (standard)
└── communication/SKILL.md     ← déjà inclus (standard)
```

Une compétence typique contient:
- **Frontmatter YAML**: `name`, `description`, `user-invocable: false`, `allowed-tools: Read`
- Terminologie du métier, conventions, bonnes pratiques

Les 3 compétences standard (marqueurs, journal, communication) sont déjà incluses dans le template.

Consultez `skills/competences/_exemple/SKILL.md` pour la structure.

### 5. Ajouter des tools (optionnel)

Dans `tools/`, ajoutez des scripts ou connecteurs si votre agent a besoin d'automatiser des tâches. Le dossier est optionnel: un agent fonctionne très bien sans.

### 6. Configurer votre outil IA

Le créateur d'agent peut s'en charger dans les outils compatibles si vous passez par la voie assistée. Si vous construisez manuellement:

- **Claude Code**: créez un `CLAUDE.md` à la racine avec `@.ai/agents/[nom]/AGENT.md`
- **Cursor**: créez `.cursor/rules/assistant.mdc` avec `alwaysApply: true` et l'instruction de lire AGENT.md
- **Autre outil**: chargez votre `AGENT.md` comme instructions système

## Besoin d'aide?

Utilisez le **créateur d'agent**: dites «Lis `.ai/agents/createur-agent/AGENT.md`». Il vous guidera dans tout le processus.

---

BASE est un framework par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
