---
schema_version: base.resource.v1
id: essayer-sans-installer
type: document
title: Essayer BASE sans installer BASE
description: Tester le même exemple dans un chat web ou dans un outil capable d'ouvrir un dossier local, puis vérifier la conclusion, les sources et la décision laissée visible.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
compatibility: [navigateur, cli]
keywords: [essayer, sans installation, zip, cursor, chatgpt, claude, debutant, navigateur, devis, dupont-sa]
audience: [beginner]
learning_level: beginner
---

# Essayer BASE sans installer BASE

Avant de confier un vrai dossier à une IA, essayez BASE sur un exemple dont vous pouvez vérifier la réponse. Cette page propose deux chemins sans installation côté BASE. Un seul outil d'IA vous suffit, celui dont vous vous servez déjà.

Les deux façons montrent le même exemple: l'assistant devis pré-rempli, avec une question qui demande de vérifier plutôt que de deviner.

## Le plus simple: un chat d'IA dans le navigateur

Si vous disposez déjà d'un outil d'IA dans un navigateur, comme ChatGPT ou Claude, rien à installer. L'objectif ici est de voir comment un assistant BASE est fait, et comment il se comporte. Le pack rassemble dans un seul document le rôle, les process et les conventions de l'assistant.

1. Téléchargez le pack prêt à coller de l'exemple: **[assistant-devis-demo.pack.md](https://github.com/ai-swiss/base/releases/latest/download/assistant-devis-demo.pack.md)**.
2. Ouvrez-le dans un éditeur de texte pour en observer la structure, puis joignez-le à une nouvelle conversation. Si votre outil ne permet pas de joindre un fichier, collez son contenu.
3. Posez la question: «Que dois-tu me faire valider avant de créer ou de modifier un devis?»

Vérifiez que la réponse distingue ce que l'assistant peut préparer de ce que vous devez décider. La remise fidélité, elle, croise deux sources absentes du pack, une règle tarifaire et une fiche client: elle se teste plus bas, dans un outil qui ouvre le dossier.

Un chat web ne maintient aucun dossier structuré par BASE sur votre ordinateur. Les fichiers lui donnent le contexte de cette conversation, mais les corrections ne reviennent pas automatiquement dans votre dossier. Pour générer un pack depuis la racine du projet: `npm run browser-pack -- --root exemples/assistant-devis-demo --out assistant-devis-demo.pack.md`.

## Le plus complet: un outil d'IA qui ouvre le dossier

Pour lire les fichiers séparément et conserver vos modifications dans le dossier, utilisez un outil d'IA capable d'ouvrir un dossier, par exemple Claude Code, Codex, Cursor, GitHub Copilot ou OpenCode. Certains s'emploient dans une fenêtre, d'autres au terminal. BASE n'en privilégie aucun.

1. Installez l'outil choisi depuis son site officiel et connectez-vous. Les modèles disponibles, leurs coûts et leurs limites dépendent de cet outil.
2. Téléchargez le projet BASE en un clic, **[base.zip](https://github.com/ai-swiss/base/releases/latest/download/base.zip)** (la dernière version publiée), puis décompressez-le (Windows: clic droit sur le fichier, **Extraire tout**, un double-clic ne suffit pas; Mac: double-clic). Vous obtenez un dossier **`base`**.
3. Ouvrez-y le dossier **`base/exemples/assistant-devis-demo`** (souvent *File → Open Folder*), en **mode Agent** pour qu'il lise les fichiers.
4. Demandez-lui de lire les instructions, puis de vous présenter la structure du dossier et le rôle des principaux fichiers.
5. Posez la question qui demande de vérifier: «Dupont SA a-t-il droit à la remise fidélité?» C'est une question piège: la fiche indique «Client (1er mandat)», alors que la règle de fidélité exige deux mandats. La réponse attendue est «non». Vérifiez la conclusion, les deux sources citées et le marqueur `[A VALIDER]`; poursuivez avec le [tutoriel pas à pas](../tutoriel/index.md).

> Si l'assistant vous parle de «routage» ou de «BASE» au lieu du devis, vous avez probablement ouvert la racine `base`, qui contient le cadre lui-même. Rouvrez le sous-dossier `exemples/assistant-devis-demo`.

## Votre propre dossier

Pour partir de vos données: copiez `base/exemples/starter-perso` où bon vous semble (vos Documents), renommez-le, puis rouvrez ce dossier dans votre outil. Ou demandez à votre outil d'IA: «Copie le dossier starter-perso vers mes Documents.» Pour créer votre propre assistant devis à partir d'un gabarit à personnaliser, copiez plutôt `exemples/assistant-devis` et dites: «Configure mon activité.»

## Ce que cet essai ne garantit pas

Dans cet essai, le modèle suit les consignes de `CLAUDE.md` ou des règles de l'éditeur; il peut se tromper. Pour utiliser les mécanismes de BASE, comme le routage sans modèle ou les écritures médiées, passez par [la lettre à votre IA](installer-par-votre-ia.md), puis consultez [Installer](installer.md) et [Sécurité et limites](../trust/securite-et-limites.md). Une garantie ne vaut que lorsque l'action passe par le composant qui l'applique.
