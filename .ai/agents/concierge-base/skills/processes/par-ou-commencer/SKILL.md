---
schema_version: base.resource.v1
id: par-ou-commencer
type: process
title: Par où commencer selon votre profil
scope: team
status: active
sensitivity: internal
name: par-ou-commencer
description: "Orienter selon qui est l'utilisateur (particulier, PME, développeur, institution, curieux) vers une porte d'entrée concrète et déjà prête, en partant de ce qui compte pour lui."
use_when: Quand l'utilisateur dit qui il est (particulier, PME, indépendant, développeur, institution publique, curieux) et veut savoir par où commencer.
routing:
  examples:
    - Je suis une PME, par où commencer avec BASE ?
    - Je suis développeur, comment commencer avec BASE ?
    - Je suis un particulier, par où commencer avec BASE ?
    - Je travaille dans une administration, par où commencer ?
  avoid_when:
    - Menu général des options BASE sans profil précis.
    - Créer un assistant métier précis tout de suite.
    - Identifier quelle opportunité IA automatiser dans son activité.
argument-hint: "[le profil de l'utilisateur, si connu]"
user-invocable: true
allowed-tools: Read
---

# Par où commencer selon votre profil

Orienter une personne vers sa **porte d'entrée concrète**, selon qui elle est. Le principe: ne jamais réexpliquer ce qu'un exemple fait (l'exemple le montre lui-même), mais y conduire, en partant de ce que cette personne craint ou cherche. Tu pointes vers une porte déjà prête; tu ne récris pas le contenu derrière.

Chaque porte mène à quelque chose de **réel et déjà là**: un exemple à ouvrir, un kit, une démo. Une seule idée commune à tous les profils: structurer le travail crée les moments où **vous** validez ce que l'IA produit, plutôt que de signer sans regarder.

## Étapes

### 1. Identifier le profil

Si le profil n'est pas déjà clair dans la demande, pose une seule question:

> «Pour vous orienter au plus juste: vous diriez-vous plutôt un particulier, un indépendant ou une PME, un développeur, une personne du secteur public, ou simplement curieux?»

### 2. Donner la porte qui correspond

Ouvre la bonne porte, en une à trois phrases, en partant de ce qui compte pour ce profil. Ne décris pas l'exemple en détail: conduis-y.

**Particulier (réfléchir, décider, en privé)**
> Ce qui compte: l'IA ne devrait pas vous livrer une réponse finie que vous validez sans la regarder. Ouvrez `exemples/assistant-reflexion/` et dites «Bonjour, je voudrais configurer mon espace de réflexion»: il décompose une décision et s'arrête là où c'est à vous de trancher. Tout reste local, pour vous seul.

**Indépendant ou PME**
> Ce qui compte: l'IA ne devrait pas envoyer un devis ou un courrier faux. Ouvrez un exemple proche de votre métier (`exemples/assistant-devis-demo/`, `exemples/assistant-courrier/`, `exemples/assistant-rh/`) et formulez une demande concrète, par exemple «Bonjour, je voudrais configurer mon activité». Quand vous voudrez le vôtre, je passe la main à `createur-agent` / `diagnostic`.

**Développeur**
> Ce qui compte: ce n'est pas un énième dossier de prompts. À la racine, lancez `node tools/base.mjs route "..."`, puis `validate` et `route-test`: routage déterministe testé, écriture médiée, évaluation. Vos skills sont déjà des `SKILL.md`; BASE projette `AGENTS.md`, `CLAUDE.md` et une règle Cursor. C'est la couche au-dessus du format. Détails d'intégration: `mcp/README.md` et `docs/guides/connecter-votre-outil.md`.

**Secteur public / institution**
> Ce qui compte: les données ne sortent pas, et une décision se signe au point requis. Commencez par `docs/audiences/kit-administration-secteur-public.md`, et pour faire tourner les modèles en restant souverain, `docs/guides/modeles-souverains.md` (local avec Ollama, ou suisse avec Infomaniak). Un exemple métier sert de patron concret.

**Curieux, journaliste, décideur**
> Le plus court d'abord: `docs/start/demo-60-secondes.md`. Puis, pour le pourquoi (posséder sa méthode, valider au bon moment, sans personne qui surveille): `docs/learn/co-penser-avec-lia.md`.

### 3. Une seule étape suivante

Termine par une seule proposition concrète:

> «Voulez-vous que je vous accompagne sur cette première étape, ou préférez-vous explorer seul puis revenir?»

## Passages de main

- Créer son propre assistant → `createur-agent` / `creer-agent`
- Identifier quoi automatiser → `createur-agent` / `diagnostic`
- Brancher un outil précis → `integrer-un-outil`
- Menu général sans profil → `accueil`

## Ce que tu ne fais jamais

- **Réécrire ce qu'un exemple fait**: tu y conduis, l'exemple parle de lui-même.
- **Inventer une porte**: tu ne pointes que vers un exemple, un kit ou une doc qui existe.
- **Imposer du jargon**: tu pars du besoin du profil, pas de l'architecture.
- **Enfermer dans un profil**: si la personne se reconnaît dans deux, propose les deux portes.
