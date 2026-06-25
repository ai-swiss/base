---
schema_version: base.resource.v1
id: outils-connus
type: competence
title: Outils connus
description: Configurations connues par outil IA quand l'accès web n'est pas disponible.
scope: team
status: active
sensitivity: internal
user-invocable: false
allowed-tools: Read
---

# Outils connus: référence de base

**Dernière vérification: avril 2026.**

Ce fichier sert de fallback quand le créateur-agent n'a pas accès au web pour chercher la documentation actuelle d'un outil. **Toujours préférer la documentation en ligne**: les outils évoluent vite et ces informations peuvent être périmées.

## Rappel: les 5 primitives abstraites

Tout outil IA a besoin de 5 choses pour faire tourner un agent BASE:

1. **Contexte permanent**: charger AGENT.md à chaque session
2. **Skills découvrables**: l'outil trouve et invoque les SKILL.md
3. **Règles par chemin**: garde-fous activés selon le fichier touché
4. **Permissions**: contrôler ce que l'agent peut faire
5. **Protection framework**: empêcher la modification de `.ai/`

## Claude Code

| Primitive | Implémentation |
|---|---|
| Contexte permanent | `CLAUDE.md` à la racine avec `@.ai/agents/[nom]/AGENT.md` (import mécanique) |
| Skills découvrables | Copier les skills dans `.claude/skills/` (auto-découverte, dossiers plats) |
| Règles par chemin | `.claude/rules/*.md` avec frontmatter `paths: ["chemin/**"]` |
| Permissions | `.claude/settings.json` avec `permissions.allow` et `permissions.deny` |
| Protection framework | Hook PreToolUse ou permission deny sur `.ai/**` dans settings.json |

**Structure résultante:**
```
CLAUDE.md                              ← @.ai/agents/[nom]/AGENT.md
.claude/
  settings.json                        ← permissions + hooks
  rules/
    guardrails.md                      ← paths: ["devis/**", "clients/**"]
  skills/                              ← copie aplatie de tous les SKILL.md
    nouveau-devis/SKILL.md
    configuration/SKILL.md
    metier-devis/SKILL.md
    communication/SKILL.md
    marqueurs/SKILL.md
    journal/SKILL.md
```

## Codex (OpenAI)

| Primitive | Implémentation |
|---|---|
| Contexte permanent | `AGENTS.md` à la racine (contenu généré depuis AGENT.md, pas d'import) |
| Skills découvrables | `.codex/skills/` ou `.agents/skills/` (enregistrés dans config.toml) |
| Règles par chemin | `AGENTS.md` imbriqué dans les sous-dossiers (ex. `devis/AGENTS.md`) |
| Permissions | `.codex/config.toml` avec sandbox_mode et approval_policy |
| Protection framework | Filesystem permissions dans config.toml |

**Note:** Codex n'a pas d'import: AGENTS.md doit contenir le contenu de AGENT.md (duplication générée, pas manuelle).

## Cursor

| Primitive | Implémentation |
|---|---|
| Contexte permanent | `.cursor/rules/agent.mdc` avec `alwaysApply: true` + instruction de lire AGENT.md |
| Skills découvrables | `.agents/skills/` (auto-découverte) ou `.cursor/skills/` |
| Règles par chemin | `.cursor/rules/*.mdc` avec `globs: "chemin/**"` |
| Permissions | Pas d'équivalent natif (garde-fous textuels uniquement) |
| Protection framework | Instruction dans la rule (textuel, pas mécanique) |

## Windsurf

| Primitive | Implémentation |
|---|---|
| Contexte permanent | `.windsurf/rules/agent.md` avec `trigger: always_on` |
| Skills découvrables | `.windsurf/skills/` ou `.agents/skills/` (auto-découverte) |
| Règles par chemin | `.windsurf/rules/*.md` avec `trigger: glob` et `globs: ["chemin/**"]` |
| Permissions | Pas d'équivalent natif |
| Protection framework | Instruction dans la rule (textuel) |

## Autre outil / mode générique

Si l'outil n'est pas listé ci-dessus:

> «Je ne connais pas encore les spécificités de [outil]. Voici ce dont votre assistant a besoin pour fonctionner:
>
> 1. **Contexte permanent**: trouvez comment charger un fichier texte au démarrage, et faites-le pointer vers `.ai/agents/[nom]/AGENT.md`
> 2. **Skills**: si votre outil découvre nativement des fichiers SKILL.md, copiez les skills au bon endroit. Sinon, l'agent chargera les skills à la demande en les lisant.
> 3. **Règles**: si votre outil supporte des règles par chemin, créez des garde-fous pour les dossiers de données métier.
> 4. **Permissions**: si votre outil le permet, restreignez la modification de `.ai/` et auto-approuvez la lecture des fichiers métier.
> 5. **Sans rien de tout ça**: dites simplement à votre outil "Lis .ai/agents/[nom]/AGENT.md et suis ses instructions". Tout fonctionnera, sans les garde-fous mécaniques.»
