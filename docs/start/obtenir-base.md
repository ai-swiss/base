---
schema_version: base.resource.v1
id: obtenir-base
type: document
title: "Récupérer BASE: choisir votre chemin d'installation"
description: Les façons concrètes de récupérer BASE selon votre niveau, du simple téléchargement ZIP au clone Git, ou la copie d'un seul exemple.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
compatibility: [navigateur, cli]
keywords: [obtenir, telecharger, installer, clone, git, zip, exemple, demarrer]
---

# Récupérer BASE: choisir votre chemin d'installation

Choisir comment récupérer BASE décide de ce que vous pourrez en faire ensuite: juste essayer un assistant, repartir de vos propres données, ou suivre les mises à jour et contribuer. Les points ci-dessous sont des **options indépendantes**, pas des étapes à enchaîner: lisez-les, puis prenez celle qui correspond à votre besoin. Pour simplement essayer un assistant, le ZIP ou la copie d'un exemple suffit; le clone Git devient utile si vous voulez suivre les mises à jour ou contribuer.

> **Le plus rapide, et sans terminal de votre côté:** laissez votre outil IA le faire. Collez un seul bloc dans un outil IA capable de lire vos fichiers (par exemple GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code) et il installe BASE, crée votre espace de travail et vous dit quand c'est prêt: voir [Faites installer BASE par votre IA](installer-par-votre-ia.md).

## 1. Sans rien installer (navigateur seul)

Si vous voulez juste expérimenter la méthode dans ChatGPT ou Claude, sans outil technique, suivez [Essayer BASE sans rien installer](essayer-sans-installer.md). C'est le palier minimum: des consignes suivies par le modèle, sans les garanties mécaniques des paliers suivants.

## 2. Télécharger le dépôt en ZIP (le plus simple)

1. Ouvrez la page du projet sur GitHub: `https://github.com/ai-swiss/base`.
2. Bouton vert **Code**, puis **Download ZIP**.
3. Dézippez le dossier.
4. Ouvrez un dossier d'**exemple** (par exemple `exemples/assistant-devis-demo/`) dans un outil IA capable de lire vos fichiers (par exemple GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code), pas la racine du dépôt.

Chaque exemple est indépendant: c'est un assistant complet que vous ouvrez dans l'outil IA pour formuler votre demande.

## 3. Copier un seul exemple

Vous n'avez pas besoin de tout le dépôt. Un dossier sous `exemples/` se copie où vous voulez et fonctionne seul. C'est la façon recommandée de partir de vos propres données: copiez l'exemple le plus proche de votre métier, renommez-le, remplacez le contenu.

## 4. Cloner avec Git (pour suivre les mises à jour)

```bash
git clone https://github.com/ai-swiss/base.git
cd base
```

Vous pouvez ensuite ouvrir un exemple dans votre outil IA, ou utiliser la CLI locale (palier équipe) décrite dans le [guide d'installation](installer.md). La CLI ne demande aucune dépendance pour le cœur (Node 18 ou plus suffit); voir `README.md` pour les commandes.

## 5. Pack navigateur (un seul fichier à coller)

Pour une personne qui n'a qu'un navigateur, vous pouvez préparer **un seul fichier Markdown** qui regroupe un agent et tous ses skills, prêt à coller dans ChatGPT ou Claude web. Depuis le dépôt (Node requis pour générer, pas pour utiliser):

```bash
npm run browser-pack -- --root exemples/assistant-devis-demo --out assistant-devis.md
```

Partagez `assistant-devis.md`: la personne le colle dans sa conversation, puis écrit «Bonjour, je voudrais configurer mon activité». En mode navigateur, le modèle se contente de suivre ces consignes: il n'offre pas les garanties mécaniques de la CLI ou du MCP (voir [Essayer BASE sans rien installer](essayer-sans-installer.md)).

## 6. Distribution npm et Releases

La distribution par paquets npm (`@ai-swiss/base` et les paquets optionnels) et par archives de **Releases** GitHub est prévue à mesure que la surface publique se stabilise (voir [Versions et stabilité](../reference/versions-et-stabilite.md)). En attendant, le ZIP, la copie d'exemple et le clone Git ci-dessus sont les chemins officiels.

## Et après?

- Premier succès en 5 minutes: [Démarrage express](quickstart.md).
- Brancher votre outil (un outil IA capable de lire vos fichiers, par exemple GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code; ou ChatGPT, Claude et le MCP): [Connecter votre outil IA](../guides/connecter-votre-outil.md).
- Quel chemin selon votre profil: [Lire dans quel ordre](lire-dans-quel-ordre.md).
- Bloqué dans un exemple: demandez de l'aide. Avec la CLI, le MCP ou un harness qui suit le routage, BASE vous oriente mécaniquement vers l'accueil configuré; en mode navigateur seul, c'est une consigne suivie par le modèle.
