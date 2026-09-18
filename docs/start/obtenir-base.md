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

> **Le plus rapide, et sans terminal de votre côté:** laissez votre outil IA s'en charger. Collez un seul bloc dans un outil IA capable de lire vos fichiers: il installe BASE, crée votre espace de travail et vous prévient quand tout est prêt. Voir [Faites installer BASE par votre IA](installer-par-votre-ia.md).

> **Vous venez simplement de diriger votre outil IA vers le dépôt?** Dites-lui «applique BASE à mon dossier». Depuis votre dossier de travail, il lance d'abord `node <BASE_DIR>/tools/base.mjs init` pour montrer les fichiers prévus sans écrire et recueillir vos choix. Après votre accord, une seconde invocation avec `--yes` initialise le dossier en tenant compte de vos réponses, sans garantir que l'aperçu initial reste identique. Le lanceur du dossier est alors `node .ai/base.mjs`; aucun de ces chemins n'installe la commande courte `base`. L'outil propose ensuite chaque conversion sous forme de diff et attend votre validation avant de l'appliquer. Le [guide d'installation par votre IA](installer-par-votre-ia.md) donne les commandes complètes lorsque le dossier BASE et votre dossier de travail sont distincts.

## 1. Sans rien installer (navigateur seul)

Si vous voulez simplement éprouver la méthode dans ChatGPT ou Claude, sans outil technique, suivez [Essayer BASE sans rien installer](essayer-sans-installer.md). C'est le palier minimum: des consignes que le modèle se contente de suivre, sans les garanties mécaniques des paliers suivants.

## 2. Télécharger le dépôt en ZIP (le plus simple)

1. Ouvrez la page du projet sur GitHub: `https://github.com/ai-swiss/base`.
2. Bouton vert **Code**, puis **Download ZIP**.
3. Dézippez le dossier.
4. Ouvrez un dossier d'**exemple** (par exemple `exemples/assistant-devis-demo/`) dans un outil IA capable de lire vos fichiers, pas la racine du dépôt.

Chaque exemple est autonome: c'est un assistant complet que vous ouvrez dans l'outil IA pour lui adresser votre demande.

Pour utiliser la CLI depuis l'archive, installez [Node 18 ou plus](https://nodejs.org), ouvrez un terminal, vérifiez que `node --version` fonctionne dans votre `PATH`, puis lancez `node <BASE_DIR>/tools/base.mjs <commande>`, où `<BASE_DIR>` est le dossier décompressé. Cette archive n'installe pas la commande courte `base` dans votre `PATH`.

## 3. Copier un seul exemple

Vous n'avez pas besoin de tout le dépôt. Un dossier sous `exemples/` se copie où vous voulez et fonctionne seul. C'est la façon recommandée de partir de vos propres données: copiez l'exemple le plus proche de votre métier, renommez-le, puis remplacez-en le contenu.

## 4. Cloner avec Git (pour suivre les mises à jour)

```bash
git clone https://github.com/ai-swiss/base.git
cd base
```

Vous pouvez ensuite ouvrir un exemple dans votre outil IA, ou recourir à la CLI locale (palier équipe) décrite dans le [guide d'installation](installer.md). Pour la CLI, installez [Node 18 ou plus](https://nodejs.org), ouvrez un terminal, vérifiez que `node --version` fonctionne dans votre `PATH`, puis lancez `node <BASE_DIR>/tools/base.mjs <commande>`, où `<BASE_DIR>` est le clone. Le clone n'installe pas la commande courte `base` dans votre `PATH`; consultez [`README.fr.md`](../../README.fr.md) pour les commandes.

## 5. Pack navigateur (un seul fichier à coller)

Pour une personne qui ne dispose que d'un navigateur, vous pouvez préparer **un seul fichier Markdown** réunissant un agent et tous ses skills, prêt à coller dans ChatGPT ou Claude web. Depuis le dépôt (Node requis pour la génération, pas pour l'usage):

```bash
npm run browser-pack -- --root exemples/assistant-devis-demo --out assistant-devis.md
```

Partagez `assistant-devis.md`: la personne le colle dans sa conversation, puis écrit «Bonjour, je voudrais configurer mon activité». En mode navigateur, le modèle ne fait que suivre ces consignes: il n'offre pas les garanties mécaniques de la CLI ou du MCP (voir [Essayer BASE sans rien installer](essayer-sans-installer.md)).

## 6. Distribution npm et Releases

Chaque version publiée porte ses fichiers sur la page **Releases** de GitHub: l'archive source à nom stable ([base.zip](https://github.com/ai-swiss/base/releases/latest/download/base.zip), toujours la dernière version publiée) et les packs navigateur des exemples phares. Un numéro de version publié désigne un état daté et figé, pas la tête mouvante d'une branche. La distribution par paquets npm (`@ai-swiss/base` et les paquets optionnels) viendra à mesure que la surface publique se stabilisera (voir [Versions et stabilité](../reference/versions-et-stabilite.md)); d'ici là, la Release, la copie d'exemple et le clone Git ci-dessus restent les chemins officiels.

## Et après?

**Prochaine action:** choisissez l'une des options 1 à 4 ci-dessus et exécutez sa première étape; pour commencer sans installation, ouvrez [Essayer BASE sans installer BASE](essayer-sans-installer.md).
