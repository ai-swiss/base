---
schema_version: base.resource.v1
id: installer-par-votre-ia
type: document
title: Faites installer BASE par votre IA
description: "Un seul bloc à coller dans un outil IA capable d'exécuter des commandes (par exemple GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code): l'outil récupère l'implémentation de référence, crée votre espace de travail et vous dit quand c'est prêt."
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
compatibility: [cli]
keywords: [installer, ia, claude code, cursor, agent, init, automatique, debutant]
audience: [beginner, builder]
learning_level: beginner
---

# Faites installer BASE par votre IA

Installer BASE peut revenir à votre IA plutôt qu'à vous: vous repartez avec un espace de
travail prêt à l'emploi sans avoir tapé une seule commande, pourvu que votre outil sache
exécuter ces commandes à votre place et vous laisse relire chaque étape avant qu'elle s'applique.
Concrètement, vous collez un bloc dans un outil IA capable d'exécuter des commandes: il procède à l'installation
à votre place, puis vous prévient lorsque votre espace de travail est prêt.

## Avant de coller le bloc

1. Créez un dossier vide pour votre travail: par exemple, dans vos Documents, un dossier
   `mon-dossier`.
2. Ouvrez ce dossier dans votre outil IA capable de lire vos fichiers: selon l'outil, ce sera
   un *File → Open Folder*, ou bien un `cd mon-dossier` suivi du lancement de l'outil dans ce
   dossier.
3. Ouvrez le chat en **mode agent** (celui qui sait exécuter des commandes): selon l'outil,
   c'est un mode *Agent* à activer dans le panneau de chat, ou tout simplement le mode par défaut.
4. Collez le bloc ci-dessous et envoyez.

## Le bloc à coller

```text
Mission: récupérer l'implémentation de référence de BASE et créer mon espace de travail dans le dossier courant.

D'abord, demande-moi: «Où veux-tu installer l'implémentation de référence de BASE?»
(propose le sous-dossier "base" de mes Documents, et appelle ce chemin <BASE_DIR>).

Étapes, vérifie chaque sortie avant de continuer:
1. `node --version`: il faut Node 18 ou plus. Sinon, guide-moi pour l'installer depuis
   nodejs.org. Après l'installation, je ferme et rouvre mon outil, je recolle cette
   lettre, et tu reprends ici.
2. Installe l'implémentation de référence dans <BASE_DIR> si elle n'y est pas déjà:
   `git clone https://github.com/ai-swiss/base.git <BASE_DIR>`
   Si git n'est pas disponible, télécharge la dernière version publiée,
   https://github.com/ai-swiss/base/releases/latest/download/base.zip, décompresse-la, et
   place son contenu dans <BASE_DIR>, puis continue. (Sur Mac, taper git peut ouvrir un
   dialogue d'installation des outils de développement: c'est normal, le ZIP l'évite.)
3. Montre-moi les fichiers que l'initialisation prévoit de créer ICI (mon dossier de travail, pas <BASE_DIR>):
   `node <BASE_DIR>/tools/base.mjs init`
   La sortie présente les choix qui manquent: quel outil IA lira ce dossier, ce que je fais en une
   phrase, la langue et la règle d'égress. Pose-moi ces questions, puis, après mon accord explicite,
   initialise le dossier avec mes réponses. Le résultat peut préciser l'aperçu initial:
   `node <BASE_DIR>/tools/base.mjs init --tool <mon outil> --about "<ma phrase>" --yes`
   (`--tool claude-code`, `cursor`, `agents-md` pour Codex, Copilot, Windsurf, ou `autre`.)
   `--egress local-only` déclare qu'aucune ressource du dossier n'est transmise à un modèle hébergé
   par les chemins médiés de l'implémentation. Une lecture directe ou un autre chemin d'exécution peut contourner ce contrôle.
4. Vérifie: `node .ai/base.mjs whereis` montre <BASE_DIR>,
   et le point d'entrée de mon outil existe maintenant dans mon dossier.
5. Dis-moi la phrase exacte à t'écrire pour commencer
   («importer mes procédures existantes» si j'ai déjà des documents à convertir).

Garde-fous: n'écrase JAMAIS un fichier existant; n'installe rien d'autre sans me
demander; si une étape échoue, montre-moi l'erreur exacte au lieu de bricoler.
```

## Ce qui se passe ensuite

Votre dossier contient désormais un agent, sa configuration, le lanceur `node .ai/base.mjs` et le fichier que **votre** outil
lit pour devenir le **routeur** de votre métier: un `CLAUDE.md` pour Claude Code, une règle
`.cursor/rules/` pour Cursor, un `AGENTS.md` pour les éditeurs qui le lisent, un
`BASE_BOOTSTRAP.md` sinon. L'outil d'initialisation n'écrit que le point d'entrée correspondant à l'outil
que vous avez nommé. Il n'installe pas la commande courte `base` dans votre `PATH`. Parlez au routeur
normalement: il oriente chaque demande vers le bon process, puis votre outil suit ce process, sans que vous ayez à
chercher lequel choisir.

- **Convertir vos documents existants**: dites «importer mes procédures existantes». Chaque
  conversion vous est soumise en diff; rien n'est écrit sans votre aval.
- **L'atelier**: avant la première utilisation, lancez `npm ci` dans `<BASE_DIR>`, puis
  `cd mon-dossier && node .ai/base.mjs studio --root .` pour ouvrir BASE Studio.
- **Garder l'implémentation de référence à jour**: `node .ai/base.mjs update`.
- **Où vit l'implémentation de référence**: `node .ai/base.mjs whereis` (l'emplacement est aussi noté
  dans `~/.config/base/config.json`, modifiable à la main).

**Prochaine action:** créez un dossier vide nommé `mon-dossier`, ouvrez précisément ce dossier en mode agent, puis collez le bloc ci-dessus.
