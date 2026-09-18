---
schema_version: base.resource.v1
id: docs-audiences-pilote-institution-90-min
type: document
title: Pilote en institution, 90 minutes, données non personnelles
description: Un pilote borné dans le temps qu'une administration peut mener avec zéro donnée personnelle de citoyen, en commandes réelles, pour juger BASE avant tout traitement réel.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [secteur-public, pilote, donnees-non-personnelles, evaluation, routage, validation, egress, aipd]
---

# Pilote en institution, 90 minutes, données non personnelles

Avant d'engager une institution sur un outil d'IA, vous voulez juger sur pièces: ce pilote permet d'observer les fichiers, le routeur et les commandes, **sans aucune donnée personnelle de citoyen**. Il est borné à environ 90 minutes et ne met aucun service en production. Une seule condition: travailler sur des procédures internes non personnelles.

> **Note.** Cette page est **informative**: elle ne constitue ni un avis juridique ni un avis de conformité. Elle ne remplace ni votre analyse d'impact (AIPD/DPIA) ni votre politique de sécurité. Un pilote, même réussi, **n'établit pas** la conformité d'un futur traitement réel: il vous donne de quoi décider, en connaissance de cause, s'il faut aller plus loin.

## Ce que ce pilote établit, et ce qu'il n'établit pas

**Il établit:**

- que le routage par défaut tourne **en local** (lexical, zéro réseau) et peut **s'abstenir** plutôt que deviner;
- que le chemin médié produit un **diff** avant l'écriture et exige la confirmation prévue par sa politique;
- que le validateur contrôle la cohérence structurelle du corpus;
- où se situe la **frontière** entre ce qui reste sur votre poste et ce qu'un appel à un modèle enverrait.

**Il n'établit pas:**

- la conformité d'un traitement réel (cela relève de votre AIPD/DPIA et de votre registre);
- la qualité ou l'exactitude des réponses d'un modèle (le modèle est votre choix, hors de la structure documentaire);
- l'intégration à votre IAM, SSO, RBAC, DLP, SIEM, ni vos règles de rétention ou d'archivage légal. Les fichiers, le routeur et le composant de médiation (broker) ne fournissent aucun de ces composants (voir [Sécurité et limites](../trust/securite-et-limites.md)).

## Mécanisme et consigne

Le [diagnostic de la carte des publics](pour-qui.md) distingue la méthode, la structure, la référence approuvée et l'exécution. Pour ce pilote, distinguez aussi:

Tout au long du pilote, distinguez deux choses:

- un **mécanisme** est appliqué par le médiateur (le broker): il s'exécute que le modèle «veuille» ou non. Exemples: confinement des chemins et refus des liens symboliques qui sortent du périmètre (`tools/core/confine.mjs`), écritures **médiées et atomiques** après validation, tools en **dry-run par défaut**, contrôle d'égress **avant** l'appel à un modèle distant.
- une **consigne** est une instruction que le modèle suit (ou non): un ton, un format, un rappel de prudence.

Quand vous demandez «est-ce garanti?», vérifiez le chemin d'exécution: un mécanisme ne protège que les opérations qui passent par lui. La séparation entre consigne et contenu facilite la revue, mais ne prévient pas à elle seule l'injection de prompt.

## Prérequis exécutables

Installez Node 18 ou plus, récupérez le dépôt BASE, puis définissez son chemin. Chaque commande ci-dessous doit réussir avant de poursuivre:

```bash
node --version
export BASE_DIR="$HOME/base"
test -f "$BASE_DIR/tools/base.mjs"
```

Si le dernier contrôle échoue, suivez [Récupérer BASE](../start/obtenir-base.md).

## Étape 0: aucune donnée personnelle dans le premier assistant

Avant toute commande, posez la règle du pilote, par écrit, pour l'équipe:

- **Aucune donnée personnelle de citoyen** n'entre dans ce pilote. Pas de noms, pas de dossiers, pas d'extraits de courriers réels.
- On travaille uniquement sur des **modèles et des procédures internes** non personnelles: un gabarit de lettre type, une procédure d'accueil, une checklist interne, une note de cadrage.
- Si un document candidat contient le moindre élément personnel, il est **hors pilote**.

Cette règle est une **consigne d'organisation**, pas un mécanisme: ni le routeur ni le modèle ne savent, à votre place, qu'un texte contient des données personnelles. Le tri en amont vous revient. Les métadonnées et le contrôle d'égress rendent certaines décisions visibles, mais la décision de faire entrer un contenu vous appartient.

## Phase 1: voir la forme d'un assistant (15 min)

Ouvrez l'exemple de l'office du tourisme de Veytaux pour voir, sans rien installer de nouveau, à quoi ressemble un assistant BASE: un agent, des process, des données, un template, des scénarios.

- Ouvrez le dossier `exemples/veytaux-tourisme/` dans un outil IA capable de lire vos fichiers, **ce dossier**, pas la racine du dépôt.
- Lisez `exemples/veytaux-tourisme/README.md`, puis parcourez l'agent et les deux process.
- Côté ligne de commande, depuis ce dossier, regardez comment une demande est routée:

  ```
  cd "$BASE_DIR/exemples/veytaux-tourisme"
  node .ai/base.mjs route "Quelles activités à faire cet après-midi?" --root .
  ```

Objectif de la phase: reconnaître la **forme** (agent, process, données, template) que vous reproduirez avec vos propres procédures internes. L'office de Veytaux est volontairement fictif et dépourvu de toute donnée personnelle.

## Phase 2: initialiser un dossier et importer 1 à 2 procédures internes non personnelles (40 min)

Créez un dossier vide, initialisez-le depuis le cadre, puis faites entrer une ou deux procédures internes **non personnelles**.

1. Initialisez un dossier de travail. Le premier appel montre le plan sans écrire; le second applique le plan après votre accord:

   ```bash
   export PILOT_DIR="$HOME/pilote-base-institution"
   mkdir -p "$PILOT_DIR"
   node "$BASE_DIR/tools/base.mjs" init --root "$PILOT_DIR"
   node "$BASE_DIR/tools/base.mjs" init --root "$PILOT_DIR" --tool agents-md --language fr --about "Pilote de procédures internes non personnelles" --egress local-only --yes
   cd "$PILOT_DIR"
   test -f .ai/base.mjs
   node .ai/base.mjs whereis
   ```

2. Choisissez **une ou deux** procédures internes non personnelles (un gabarit de lettre type, une procédure d'accueil).
3. Définissez le chemin réel d'un fichier source, puis proposez son import:

   ```bash
   export SOURCE_FILE="$HOME/procedure-accueil.md"
   test -f "$SOURCE_FILE"
   mkdir -p sources
   cp "$SOURCE_FILE" "sources/procedure-accueil.md"
   node .ai/base.mjs propose "documents/procedure-accueil.md" --from "sources/procedure-accueil.md" --root .
   ```

   La copie place volontairement le fichier source dans la racine du pilote, car `--from` refuse de lire hors de cette racine. La proposition n'écrit pas le fichier cible. Notez l'identifiant affiché, relisez le diff, puis transmettez cet identifiant uniquement si vous l'approuvez:

   ```bash
   printf "Identifiant du changement approuvé: "
   read -r CHANGE_ID
   node .ai/base.mjs commit "$CHANGE_ID" --root . --confirmed
   ```

Le broker refuse une application non confirmée. Il ne peut toutefois pas prouver que le client a montré le diff à une personne avant d'envoyer `--confirmed`. Les opérations médiées sont consignées localement dans `.ai/trace` (opération, ressource, statut, durée), sans contenu métier par défaut.

## Phase 3: prouver que ça marche, valider et router (15 min)

Vérifiez la cohérence du corpus, puis routez deux ou trois demandes réalistes.

- Validez le corpus:

  ```
  node .ai/base.mjs validate --root .
  ```

  Le validateur contrôle la cohérence (frontmatter, schéma, références). La CI du dépôt exécute ce contrôle séparément. L'audit des dépendances de production appartient aux barrières de publication et n'est pas une propriété de cette commande.

- Routez quelques demandes correspondant à vos procédures importées:

  ```
  node .ai/base.mjs route "rediger une lettre type d'accuse de reception" --root .
  ```

  Observez deux comportements possibles, tous deux **mécanismes**:
  - le routeur propose l'agent et le process pertinents, **en local** (lexical, zéro réseau par défaut);
  - ou il **s'abstient** (hors périmètre, ambigu, clarification nécessaire) plutôt que de donner une fausse certitude. L'abstention est un résultat **voulu**, non un échec.

> Pour aller plus loin, le dépôt fournit un jeu de routes attendues rejouables (`route-test`). Le contrat de tests est documenté dans [`specs/TESTING.md`](../../specs/TESTING.md).

## Phase 4: ce qui est resté local, ce qu'un appel modèle enverrait (20 min)

Faites le point, explicitement, sur la frontière des données.

- **Reste local, sans aucun appel modèle:** le routage lexical par défaut, `node .ai/base.mjs validate --root .`, l'import médié et le journal `.ai/trace`. Le ranking sémantique avancé n'envoie du texte à un fournisseur d'embeddings **que si vous l'activez**, et une option locale (Ollama) existe (voir [Sécurité des données de routage](../trust/securite-donnees-routage.md)).
- **Ce qu'un appel à un modèle enverrait:** les fichiers peuvent rester locaux alors que l'outil envoie au modèle distant le contexte qu'il en projette. Le fournisseur et les conditions de traitement relèvent de votre dispositif.
- **Le garde-fou médié à documenter:** ce pilote n'exécute aucun appel modèle médié, il identifie donc la frontière sans tester le contrôle en exécution. Sur un chemin médié qui appelle un modèle distant, le contrôle d'**égress** bloque une ressource `confidential: true` ou une racine `local-only` avant l'appel. La politique est permissive par défaut (`any`). La métadonnée `sensitivity` classe une ressource, mais ne la retient pas. Un outil qui lit directement les fichiers contourne ce contrôle.

Pour comprendre cette frontière en détail, lisez la page de référence: [Périmètres et gouvernance d'égress](../tutoriel/equipe-2-perimetres-et-egress.md), complétée par [Protection des données](../trust/protection-des-donnees.md).

## Checklist de fin de pilote

- [ ] Règle Étape 0 posée par écrit: aucune donnée personnelle, procédures internes uniquement.
- [ ] Exemple de l'office du tourisme de Veytaux ouvert et route observée (Phase 1).
- [ ] Dossier de travail initialisé; `.ai/base.mjs` existe et `node .ai/base.mjs whereis` aboutit (Phase 2).
- [ ] Une à deux procédures internes importées par `node .ai/base.mjs propose`, puis par `node .ai/base.mjs commit --confirmed` après relecture du diff (Phase 2).
- [ ] `node .ai/base.mjs validate --root .` passe; `node .ai/base.mjs route "rediger une lettre type d'accuse de reception" --root .` propose ou s'abstient comme attendu (Phase 3).
- [ ] Frontière local / appel modèle documentée, et absence de test exécutable du contrôle d'égress notée (Phase 4).
- [ ] Distinction mécanisme / consigne claire pour l'équipe.
- [ ] Limites notées: les fichiers, le routeur et le broker ne fournissent ni IAM, SSO, RBAC, DLP, SIEM, rétention, archivage légal, ni garantie d'exactitude.

## Avant toute donnée réelle: l'AIPD/DPIA

Ce pilote s'arrête **avant** la moindre donnée personnelle réelle. Pour franchir cette étape, votre institution doit conduire son analyse d'impact (AIPD/DPIA) et tenir son registre des traitements. Le [Modèle d'analyse d'impact DPIA](dpia-modele.md) fournit un **squelette réutilisable** à compléter; ni ce document ni les outils ne réalisent l'analyse à votre place. Le cadrage institutionnel (classification, base légale, fournisseur de modèle autorisé, rétention) est détaillé, côté décisions, dans le [Kit administration et secteur public](kit-administration-secteur-public.md) et la page [Protection des données](../trust/protection-des-donnees.md).

Rappel: cette page est informative. La responsabilité de l'AIPD/DPIA et de la politique de sécurité reste celle de votre institution.

## Votre prochaine action

Si la checklist est complète, remettez les observations du pilote et le [modèle de DPIA](dpia-modele.md) à votre délégué à la protection des données avant toute décision sur des données réelles.
