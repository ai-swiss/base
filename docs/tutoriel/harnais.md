---
schema_version: base.resource.v1
id: docs-tutoriel-harnais
type: document
title: Étape 0: brancher votre outil IA
description: Installer et connecter votre outil (Claude Code, Cursor, ou un autre), et vérifier qu'il répond DANS le dossier d'exemple avant de commencer.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [harnais, outil, claude code, cursor, mcp, installer, connecter, veytaux, tourisme]
audience: [beginner, builder]
learning_level: beginner
---

# Étape 0: brancher votre outil IA

**Vous allez** rendre votre outil IA capable de lire un dossier BASE et d'y répondre, prouvé par
une question simple à la fin.
**Il vous faut** un ordinateur, une connexion internet, et le dossier de BASE sur votre machine. Si vous ne l'avez pas encore, [Essayer sans rien installer](../start/essayer-sans-installer.md) montre le moyen le plus simple de le récupérer; les exemples comme `veytaux-tourisme` s'y trouvent.

Avant tout module, votre outil doit être installé ET connecté. Choisissez:

| Outil | Premier geste | Terminal requis? |
|-------|---------------|-------------------|
| **Cursor** | Téléchargez sur cursor.com, connectez-vous, *File -> Open Folder*. Chat: Cmd/Ctrl+L, mode Agent. | Non |
| **Claude Code** | Installez-le, puis `claude` dans le dossier. | Oui |
| **ChatGPT / Claude Desktop** | Via le serveur MCP (garanties mécaniques). | Oui (config) |
| **Un autre outil** | Demandez au concierge: *aide-moi à connecter BASE à mon outil*. Il lit la doc de votre outil et vous guide. | Selon l'outil |

Pour les garanties mécaniques (routage déterministe, écritures validées), branchez le serveur
MCP: voir la documentation de démarrage de BASE.

✅ **Vérifiez**: ouvrez le dossier `exemples/veytaux-tourisme` dans votre outil et demandez
*«qui es-tu?»*. L'assistant doit, en substance, se présenter comme l'assistant de l'office du
tourisme de Veytaux-les-Bains (renseignements aux visiteurs et sorties de groupe). S'il parle
d'autre chose, voir les pannes ci-dessous.

🆘 **Pannes courantes**:
- *L'assistant parle de «routage» ou de «BASE» au lieu de l'office du tourisme*: vous avez
  ouvert la racine du dépôt, pas le sous-dossier. Rouvrez `exemples/veytaux-tourisme`.
- *Il ne répond rien de spécifique*: votre outil ne lit pas les fichiers du projet: vérifiez
  que vous avez ouvert le DOSSIER (pas un fichier seul), et que le chat est en mode agent.

## La commande `base` (parcours Praticien et Équipe)

Ces deux parcours utilisent un terminal. Quand un module écrit `base ...`, il s'agit du lanceur
que chaque dossier BASE contient: lancez-le avec **`node .ai/base.mjs`** depuis le dossier où vous
travaillez (le dépôt, ou votre propre projet). Il trouve le moteur tout seul: rien à installer,
rien à mettre sur le PATH (le paquet `base` n'est pas publié; ce lanceur le remplace).

Pour taper moins, créez un raccourci de session:

- macOS / Linux: `alias base='node .ai/base.mjs'`
- Windows (PowerShell): `function base { node .ai/base.mjs @args }`

Ensuite `base route "..."` marche tel quel.

✅ **Vérifiez (avant le parcours Praticien)**: depuis `exemples/veytaux-tourisme`,
`node .ai/base.mjs --help` affiche la liste des commandes.

→ **Et maintenant**: revenez à l'[index](index.md) et lancez le module 1 de votre parcours.
