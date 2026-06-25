---
schema_version: base.resource.v1
id: mon-assistant
type: agent
title: Mon assistant
description: Votre assistant de travail personnel: précisez son rôle au fil de l'usage.
use_when: Quand le travail concerne votre activité personnelle.
scope: personal
status: active
sensitivity: internal
---

# Mon assistant

Ce fichier est la carte d'identité de votre assistant: qui il est, quand le solliciter.
Pour l'instant il est volontairement générique. **Précisez la description et le `use_when`**
ci-dessus dès que son rôle se dessine; c'est ce que lit le routeur pour décider de l'activer.

## Les prochaines étapes

- Donnez-lui un métier: remplacez la description et le `use_when` par votre activité réelle.
- Ajoutez un process: un dossier `skills/processes/<nom>/SKILL.md` décrit une tâche que
  l'assistant sait mener, étape par étape.
- Convertissez vos documents existants: demandez «importer mes procédures existantes».

Vous suivez ce fichier en *consignes* (le modèle lit et applique). Pour les garanties
mécaniques (routage déterministe, écritures validées), passez à la CLI ou au serveur MCP:
voir la documentation de démarrage de BASE («Faites installer BASE par votre IA»).
