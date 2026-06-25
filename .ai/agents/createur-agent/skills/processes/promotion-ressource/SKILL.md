---
schema_version: base.resource.v1
id: promotion-ressource
type: process
title: Promotion de ressource
description: Transformer une ressource personnelle en ressource d'équipe avec métadonnées minimales et validation humaine.
scope: team
status: active
sensitivity: internal
use_when: Quand l'utilisateur veut promouvoir une ressource personnelle en ressource d'équipe, la rendre réutilisable ou partagée.
routing:
  examples:
    - Promouvoir ce process pour l'équipe
    - Rendre cette ressource réutilisable par mes collègues
    - Partager ce fichier personnel avec mon équipe
  avoid_when:
    - Publier ou diffuser BASE publiquement (open source, releases).
name: promotion-ressource
argument-hint: "[chemin de la ressource personnelle]"
user-invocable: true
allowed-tools: Read Write
---

# Promotion de ressource

Aider l'utilisateur à promouvoir un fichier personnel vers une ressource d'équipe sans introduire une gouvernance enterprise.

## Déclencheurs

Utiliser ce process quand l'utilisateur dit:

- «Promouvoir ce process pour l'équipe.»
- «Partager cette ressource avec l'équipe.»
- «Rendre ce fichier réutilisable.»
- «Préparer ce workflow pour la PME.»

## Inputs

Demander:

- le fichier ou dossier source;
- l'usage prévu par l'équipe;
- la sensibilité du contenu;
- si la ressource doit être déplacée ou copiée.

## Étapes

### 1. Lire et comprendre

Lire la ressource source. Résumer:

- ce qu'elle permet de faire;
- ce qui est déjà clair;
- ce qui manque pour un usage d'équipe;
- les risques de sensibilité ou de contexte personnel.

### 2. Vérifier le minimum équipe

Une ressource d'équipe doit avoir:

- un titre clair;
- une description courte;
- une sensibilité explicite;
- un statut;
- un identifiant stable;
- un chemin cible lisible.

Frontmatter minimal recommandé:

```yaml
---
schema_version: base.resource.v1
id: exemple-ressource
type: process
title: Exemple de ressource
description: Décrire l'usage métier en une phrase.
scope: team
status: active
sensitivity: internal
promoted_from: personal/source
promoted_at: 2026-05-05
---
```

### 3. Proposer la promotion

Présenter une proposition complète:

- chemin source;
- chemin cible;
- frontmatter proposé;
- corrections éditoriales minimales;
- points à valider par l'utilisateur.

Point de décision: attendre la validation explicite avant copie, déplacement ou modification.

### 4. Appliquer proprement

Après validation:

- copier ou déplacer selon la décision;
- ajouter le frontmatter minimal;
- conserver le contenu métier lisible;
- ne pas ajouter de gouvernance enterprise sauf demande explicite;
- lancer ou recommander `base validate`.

### 5. Clôturer

Résumer:

- ce qui a été promu;
- ce qui reste personnel;
- les décisions prises;
- le test d'usage à faire avec l'équipe.

## Ce que tu ne fais jamais

- Promouvoir un contenu sensible sans alerte.
- Ajouter RBAC, SSO, audit ou rétention enterprise dans le cœur public.
- Écraser la ressource source sans demande explicite.
- Déplacer un fichier sans expliquer l'impact sur les liens.
