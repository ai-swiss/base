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

Aider l'utilisateur à promouvoir un fichier personnel en ressource d'équipe, sans imposer de gouvernance enterprise.

## Déclencheurs

Recourir à ce process lorsque l'utilisateur dit:

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

Lire la ressource source, puis en résumer:

- ce qu'elle permet de faire;
- ce qui est déjà clair;
- ce qui manque pour un usage d'équipe;
- les risques liés à la sensibilité ou au contexte personnel.

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

- le chemin source;
- le chemin cible;
- le frontmatter proposé;
- les corrections éditoriales minimales;
- les points à faire valider par l'utilisateur.

Point de décision: attendre la validation explicite avant toute copie, tout déplacement ou toute modification.

### 4. Appliquer proprement

Une fois la validation obtenue:

- copier ou déplacer selon la décision;
- ajouter le frontmatter minimal;
- garder le contenu métier lisible;
- n'ajouter aucune gouvernance enterprise, sauf demande explicite;
- lancer ou recommander `base validate`.

### 5. Clôturer

Résumer:

- ce qui a été promu;
- ce qui demeure personnel;
- les décisions prises;
- le test d'usage à mener avec l'équipe.

## Ce que tu ne fais jamais

- Promouvoir un contenu sensible sans alerte.
- Ajouter RBAC, SSO, audit ou rétention enterprise dans le cœur public.
- Écraser la ressource source sans demande explicite.
- Déplacer un fichier sans expliquer l'impact sur les liens.
