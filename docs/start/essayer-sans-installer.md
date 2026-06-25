---
schema_version: base.resource.v1
id: essayer-sans-installer
type: document
title: Essayer BASE sans rien installer de nouveau
description: Saisir BASE en le lisant, puis essayer un assistant sans rien installer côté BASE: le plus simple, un chat IA web où vous joignez les fichiers d'exemple, ou le plus complet, un outil IA qui ouvre le dossier.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
compatibility: [navigateur, cli]
keywords: [essayer, sans installation, zip, cursor, chatgpt, claude, debutant, navigateur]
audience: [beginner]
learning_level: beginner
---

# Essayer BASE sans rien installer de nouveau

Le plus rapide pour saisir BASE n'est pas de l'installer, c'est de le lire: [Pourquoi BASE](../learn/co-penser-avec-lia.md) en montre la méthode et la profondeur en quelques minutes. Quand vous voudrez le voir fonctionner, cette page donne deux façons d'essayer un vrai assistant sans rien installer côté BASE. Il vous faut seulement un outil IA, celui que vous utilisez déjà.

Les deux partent du même dossier d'exemple. Téléchargez le dépôt en un clic, **[base-main.zip](https://github.com/ai-swiss/base/archive/refs/heads/main.zip)**, puis décompressez-le (Windows: clic droit sur le fichier, **Extraire tout**, un double-clic ne suffit pas; Mac: double-clic). Vous obtenez un dossier **`base-main`**; l'exemple à ouvrir est **`base-main/exemples/veytaux-tourisme`**, l'office du tourisme de Veytaux, un projet jouet.

## Le plus simple: un chat IA dans le navigateur

Si vous avez déjà un assistant IA dans un navigateur (ChatGPT, Claude, ou un autre), rien à installer: un assistant BASE est un ensemble de fichiers texte qui structure votre collaboration (savoir-faire, savoir, données), pas une simple documentation, et que vous lui donnez comme contexte.

1. Dans le dossier `veytaux-tourisme`, repérez les fichiers Markdown: l'`AGENT.md` (sous `.ai/agents/...`) et ceux de `skills/`.
2. Créez, dans votre outil, un espace qui garde ces fichiers sous la main pendant la conversation (selon l'outil: un Projet, un assistant personnalisé, un espace de travail).
3. Collez le contenu de l'`AGENT.md` dans les instructions, et joignez les autres fichiers Markdown.
4. Parlez-lui: «Bonjour, je voudrais configurer mon activité.»

Le seul point à connaître: un chat web ne parcourt pas un dossier tout seul, vous lui donnez les fichiers une fois. C'est le chemin le plus accessible pour voir la méthode à l'œuvre.

## Le plus complet: un outil IA qui ouvre le dossier

Pour que l'assistant travaille de l'intérieur, en lisant tout le dossier et en agissant sous votre regard, il faut un outil IA capable d'ouvrir un dossier et d'en lire les fichiers (par exemple GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code; certains s'utilisent dans une fenêtre, d'autres au terminal, comme [Claude Code](installer-claude-code.md)). Prenez celui où vous êtes déjà à l'aise.

1. Installez-le depuis son site officiel et connectez-vous; un modèle gratuit suffit pour essayer.
2. Ouvrez-y le dossier **`base-main/exemples/veytaux-tourisme`** (souvent *File → Open Folder*), en **mode Agent** pour qu'il lise les fichiers.
3. Demandez «Quelles activités proposez-vous cet après-midi?». L'assistant suit la méthode décrite dans les fichiers; continuez avec le [tutoriel pas à pas](../tutoriel/index.md).

> **Panne courante**: si l'assistant vous parle de «routage» ou de «BASE» au lieu de Veytaux, vous avez ouvert la racine `base-main`, qui est le framework. Rouvrez le sous-dossier `exemples/veytaux-tourisme`.

## Votre propre dossier

Pour partir de VOS données: copiez `base-main/exemples/starter-perso` où vous voulez (vos
Documents), renommez-le, et rouvrez CE dossier dans votre outil. Ou demandez à votre assistant:
«copie le dossier starter-perso vers mes Documents».

## Le palier honnête, et l'étape d'après

Ici, c'est le **modèle** qui route en suivant des consignes (`CLAUDE.md`,
`.cursor/rules/assistant.mdc`): pratique, mais il peut déborder. Pour les **garanties
mécaniques** (routage déterministe, écritures validées, confinement), passez par
[la lettre à votre IA](installer-par-votre-ia.md) (5 minutes), ou voir
[Installer](installer.md) et [Sécurité et limites](../trust/securite-et-limites.md) pour la
frontière entre *consigne* (suivie) et *mécanisme* (appliqué).
