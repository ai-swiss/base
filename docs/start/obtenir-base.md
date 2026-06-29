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

La façon dont vous récupérez BASE détermine ce que vous pourrez en faire ensuite: simplement essayer un assistant, repartir de vos propres données, ou suivre les mises à jour et contribuer. Les points ci-dessous sont des **options indépendantes**, et non des étapes à enchaîner: lisez-les, puis retenez celle qui correspond à votre besoin. Pour essayer un assistant, le ZIP ou la copie d'un exemple suffit; le clone Git devient utile dès que vous voulez suivre les mises à jour ou contribuer.

> **Le plus rapide, et sans terminal de votre côté:** laissez votre outil IA s'en charger. Collez un seul bloc dans un outil IA capable de lire vos fichiers (par exemple GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code): il installe BASE, crée votre espace de travail et vous prévient quand tout est prêt. Voir [Faites installer BASE par votre IA](installer-par-votre-ia.md).

> **Vous venez simplement de diriger votre outil IA vers le dépôt?** Dites-lui «applique BASE à mon dossier»: il doit d'abord lancer `base init` (qui crée l'agent au bon endroit, sous `.ai/agents/<nom>/`), puis vous proposer chaque conversion sous forme de diff, et ne jamais créer les fichiers à votre place.

## 1. Sans rien installer (navigateur seul)

Si vous voulez simplement éprouver la méthode dans ChatGPT ou Claude, sans outil technique, suivez [Essayer BASE sans rien installer](essayer-sans-installer.md). C'est le palier minimum: des consignes que le modèle se contente de suivre, sans les garanties mécaniques des paliers suivants.

## 2. Télécharger le dépôt en ZIP (le plus simple)

1. Ouvrez la page du projet sur GitHub: `https://github.com/ai-swiss/base`.
2. Bouton vert **Code**, puis **Download ZIP**.
3. Dézippez le dossier.
4. Ouvrez un dossier d'**exemple** (par exemple `exemples/assistant-devis-demo/`) dans un outil IA capable de lire vos fichiers (par exemple GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code), pas la racine du dépôt.

Chaque exemple est autonome: c'est un assistant complet que vous ouvrez dans l'outil IA pour lui adresser votre demande.

## 3. Copier un seul exemple

Vous n'avez pas besoin de tout le dépôt. Un dossier sous `exemples/` se copie où vous voulez et fonctionne seul. C'est la façon recommandée de partir de vos propres données: copiez l'exemple le plus proche de votre métier, renommez-le, puis remplacez-en le contenu.

## 4. Cloner avec Git (pour suivre les mises à jour)

```bash
git clone https://github.com/ai-swiss/base.git
cd base
```

Vous pouvez ensuite ouvrir un exemple dans votre outil IA, ou recourir à la CLI locale (palier équipe) décrite dans le [guide d'installation](installer.md). Son cœur ne réclame aucune dépendance (Node 18 ou plus suffit); voir `README.md` pour les commandes.

## 5. Pack navigateur (un seul fichier à coller)

Pour une personne qui ne dispose que d'un navigateur, vous pouvez préparer **un seul fichier Markdown** réunissant un agent et tous ses skills, prêt à coller dans ChatGPT ou Claude web. Depuis le dépôt (Node requis pour la génération, pas pour l'usage):

```bash
npm run browser-pack -- --root exemples/assistant-devis-demo --out assistant-devis.md
```

Partagez `assistant-devis.md`: la personne le colle dans sa conversation, puis écrit «Bonjour, je voudrais configurer mon activité». En mode navigateur, le modèle ne fait que suivre ces consignes: il n'offre pas les garanties mécaniques de la CLI ou du MCP (voir [Essayer BASE sans rien installer](essayer-sans-installer.md)).

## 6. Distribution npm et Releases

La distribution par paquets npm (`@ai-swiss/base` et les paquets optionnels) et par archives de **Releases** GitHub viendra à mesure que la surface publique se stabilisera (voir [Versions et stabilité](../reference/versions-et-stabilite.md)). En attendant, le ZIP, la copie d'exemple et le clone Git ci-dessus restent les chemins officiels.

## Et après?

- Premier succès en quelques minutes: [Démarrage express](quickstart.md).
- Brancher votre outil (un outil IA capable de lire vos fichiers, par exemple GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code; ou ChatGPT, Claude et le MCP): [Connecter votre outil IA](../guides/connecter-votre-outil.md).
- Quel chemin selon votre profil: [Lire dans quel ordre](lire-dans-quel-ordre.md).
- Bloqué dans un exemple: demandez de l'aide. Avec la CLI, le MCP ou un harness qui respecte le routage, BASE vous oriente mécaniquement vers l'accueil configuré; en mode navigateur seul, ce n'est qu'une consigne que le modèle suit.
