---
schema_version: base.resource.v1
id: diffusion
type: document
title: Publier BASE en open source
description: Comment publier BASE en open source de façon claire, réutilisable, honnête et scientifiquement bornée.
scope: public
status: active
sensitivity: public
keywords: [diffusion, open-source, publication, release, licence, attribution, reutilisation, methode-praticable]
---

# Publier BASE en open source

Publier BASE en open source, c'est permettre à d'autres de reprendre et d'adapter une structure de travail qui leur reste, sans se lier à un fournisseur ni à une plateforme. L'enjeu n'est pas de montrer un produit fini: c'est de rendre ce socle réutilisable et honnête sur ce qu'il fait, pour que chacun puisse l'essayer, le critiquer et le faire grandir. Ce guide rassemble ce qu'il faut décider, vérifier et écrire pour que cette sortie publique tienne cette promesse.

BASE se présente comme un cadre local-first pour structurer la collaboration humain-IA: des fichiers lisibles, des workflows, des contrôles locaux et des extensions possibles. C'est volontairement un socle, pas une plateforme complète.

## Positionnement public

Message court:

> BASE aide les personnes et organisations à structurer leur collaboration avec l'IA: savoir, processus, données, décisions, actions contrôlées et mémoire durable.

Message long:

> Les modèles changent, les interfaces changent, les fournisseurs changent. Ce qui doit rester à vous, c'est la structure de votre expertise: vos fichiers métier, vos workflows, vos modèles, vos règles, vos décisions et les traces utiles pour reprendre le travail. BASE fournit un cadre ouvert et lisible pour organiser cette structure.

Message fondateur:

> L'IA générative se manipule autrement qu'un logiciel classique: par le langage, le contexte, les exemples, les limites et les corrections. Elle maîtrise des domaines vérifiables, mais elle a deux faiblesses bien réelles: par défaut, elle ne partage pas sa mémoire d'une session à l'autre, et le langage qui la pilote reste sous-spécifié, ce qui fait à la fois sa souplesse et sa fragilité. BASE transforme ce constat en méthode praticable: écrire ce qui compte, expliciter les processus, garder les décisions humaines visibles, et utiliser les plateformes IA sans leur abandonner la structure de votre travail.

Ce que BASE ne dit pas:

- que l'IA devient fiable automatiquement;
- que les permissions sont garanties hors des outils médiés;
- que le cœur public remplace la gouvernance enterprise;
- qu'une interface ou un modèle précis est indispensable;
- que l'IA possède une conscience, une intention ou une compréhension garantie;
- que tout doit être automatisé.

## Ce qui doit être visible au premier regard

- Un exemple concret en 5 minutes.
- Plusieurs assistants métier prêts à essayer.
- Une explication simple de la différence entre conversation et mémoire durable.
- Une page pour chaque niveau d'adoption: personnel, start-up, PME, grande entreprise.
- Une page d'état qui sépare implémenté, extensions prévues et hors périmètre.
- Des tests et une validation locale qui prouvent que le package est maintenable.

## Checklist avant publication

Documentation:

- `README.md` explique pourquoi BASE existe, comment essayer, pour qui, et où aller ensuite.
- `docs/start/obtenir-base.md` explique ZIP, clone Git, copie d'exemple et pack navigateur.
- `docs/start/demo-60-secondes.md` permet de voir un résultat concret avant de lire l'architecture.
- `docs/start/quickstart.md` permet un premier essai sans connaissance technique.
- `docs/tutoriel/index.md` accompagne une personne pas à pas, étape par étape.
- `docs/audiences/pour-qui.md` parle aux publics principaux.
- `docs/audiences/kit-demarrage-pme-suisse.md` donne les règles minimales pour une petite équipe: données, validation, versioning, entretien.
- `docs/audiences/kit-enterprise.md` cadre la configuration stricte et les modes de déploiement.
- `docs/audiences/kit-administration-secteur-public.md` cadre les décisions institutionnelles.
- `docs/public/presse.md` donne une page de référence publiable pour journalistes et rédactions.
- `docs/learn/comprendre.md` explique les mécanismes et le diagnostic.
- `docs/start/lire-dans-quel-ordre.md` aide chaque profil à distinguer quoi lire, quoi ignorer et quoi auditer.
- `docs/learn/pratiques-co-pensee.md` pose les principes de co-pensée humain-IA.
- `docs/reference/framework-public.md` cadre le cœur public et les extensions.
- `docs/reference/etat-implementation.md` borne les promesses.
- `docs/trust/securite-et-limites.md` explicite le modèle de sécurité, les limites et les responsabilités.
- `docs/trust/souverainete-et-confiance.md` rassemble souveraineté, conformité, licence et gouvernance.
- `docs/trust/licence.md` explique la double licence en langage lisible.
- `docs/reference/specification-v0.md` donne la lecture d'architecture.
- `mcp/README.md` explique l'adapter MCP sans le confondre avec le broker.
- `SECURITY.md` explique comment signaler un problème.
- `CODE_OF_CONDUCT.md` définit les règles de participation publique.
- `.github/ISSUE_TEMPLATE/` et `.github/PULL_REQUEST_TEMPLATE.md` guident les contributions sans promettre une gouvernance communautaire lourde.
- `specs/RELEASE.md` décrit la checklist de publication reproductible.
- `CHANGELOG.md` rend les changements publics suivables.

Code et validation:

- `npm test` passe.
- `npm run validate` passe.
- `npm run entretien` ne signale pas d'action critique.
- `npm test` et `npm run build` passent dans `mcp/`.
- `npm run smoke:pack` passe.
- `base.manifest.json` est régénéré.
- `.ai/trace/` est ignoré par git.
- `git status --short` est relu: chaque fichier modifié ou non suivi est intentionnel.
- Les artefacts dérivés sont soit régénérés et inclus, soit explicitement laissés hors publication.
- Aucun brouillon local (`.temp/`, `.plans/`, traces, exports de test) n'entre dans le paquet publié.

Exemples:

- `exemples/assistant-devis-demo/` reste la démo immédiate; la page `docs/start/demo-60-secondes.md` décrit le parcours exact.
- `exemples/assistant-devis/` reste le fil rouge principal.
- `exemples/assistant-communication/`, `assistant-courrier/`, `assistant-rh/`, `assistant-projet/` et `assistant-reunion/` sont visibles et cohérents.
- Chaque exemple peut être copié dans un dossier séparé et ouvert dans un outil IA.

Licence et attribution:

- La double licence est explicite dans `LICENSE`: code sous Apache-2.0; documentation, agents, skills et exemples sous CC BY 4.0.
- Le README mentionne AI Swiss et le cas d'usage Innovaud.
- Les usages dérivés doivent conserver l'attribution prévue par la licence.

## Comment présenter BASE

Pour une conférence ou un atelier:

1. Commencer par une scène concrète: faire un devis, préparer une offre, organiser un projet.
2. Montrer ce qui manque au chat simple: contexte, mémoire, données, règles, validation.
3. Introduire les fichiers comme mémoire durable.
4. Montrer les workflows et les compétences.
5. Expliquer les points de décision et la dette de vérification.
6. Montrer le routeur/broker seulement après le besoin concret: rudimentaire mais efficace, extensible par adaptateurs, il réduit la charge mentale de chercher le bon processus.
7. Finir sur la souveraineté: le capital durable n'est pas le modèle, c'est la structure de l'expertise.

Pour une personne non technique:

- éviter les termes serveur, broker, schema, MCP au début;
- dire assistant, fichiers, workflows, modèles, décisions;
- commencer par copier un exemple.

Pour une personne technique:

- montrer `docs/reference/etat-implementation.md`;
- montrer `tools/base-core.mjs`;
- montrer les tests;
- expliquer que MCP est un adapter et non le routeur.

Pour une organisation:

- présenter BASE comme un socle de structuration;
- expliciter ce qui doit être ajouté autour: identité, droits, audit, DLP, rétention;
- pour une PME, commencer par le kit de démarrage plutôt que par l'architecture enterprise;
- insister sur la portabilité des ressources et sur la séparation entre YAML sémantique et détails techniques.

## Ton à maintenir

Fort, mais borné.

BASE peut affirmer:

- que la structure est nécessaire pour collaborer durablement avec l'IA;
- que la vérification ne disparaît pas;
- que les fichiers lisibles rendent le contexte portable;
- que les mécanismes sont plus fiables que les consignes seules;
- que le framework public est utile sans prétendre remplacer une plateforme enterprise.

BASE ne doit pas affirmer:

- que les modèles ne se trompent plus;
- que tout est sécurisé par défaut;
- que l'IA remplace l'expertise;
- que toutes les plateformes se comportent pareil;
- que l'adoption d'un outil suffit à transformer une organisation.

## Critère final

Une personne doit pouvoir regarder BASE et comprendre trois choses:

1. Elle peut l'essayer maintenant.
2. Elle peut l'adapter à son contexte.
3. Elle peut grandir avec cette structure sans se lier à une seule plateforme.
