---
schema_version: base.resource.v1
id: docs-trust-accessibilite
type: document
title: Accessibilité, engagement et état
description: Engagement d'accessibilité de BASE, preuves disponibles et limites honnêtes, sans déclaration de conformité que nous ne pouvons pas encore tenir.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [accessibilite, wcag, ech-0059, a11y, studio, documentation, engagement]
---

# Accessibilité, engagement et état

Une institution publique doit pouvoir savoir ce que vaut, et ce que ne vaut pas, l'accessibilité de BASE avant de s'en servir. Vous trouverez ici notre engagement d'accessibilité, les preuves que nous pouvons montrer aujourd'hui et les limites honnêtes de ces preuves. Cela ne vaut pas déclaration formelle de conformité: pour nous, une telle déclaration reste un objectif à atteindre, pas un fait acquis (voir plus bas).

Cette page est informative. Elle ne constitue ni un avis juridique ni un audit de conformité. Chaque institution reste responsable de sa propre évaluation d'accessibilité, de son audit éventuel et de sa politique d'accessibilité.

## Engagement

Nous visons, pour le site de documentation et pour Studio:

- le référentiel WCAG 2.1 niveau AA;
- la norme suisse eCH-0059 (accessibilité des prestations en ligne).

Cet engagement est une cible de conception. Il oriente les choix d'interface et la revue, mais il ne signifie pas que la conformité est atteinte ou vérifiée à ce jour.

## Distinction importante: mécanisme et consigne

BASE distingue partout ce qui est appliqué mécaniquement de ce qui relève d'une consigne suivie de bonne foi. L'accessibilité suit la même grille.

- Mécanisme: une vérification automatisée d'accessibilité s'exécute dans la suite de tests Playwright (end-to-end) de Studio. Elle tourne à chaque passage de la suite et échoue si elle détecte des violations graves ou critiques. Elle impose une contrainte réelle sur l'interface de Studio, au-delà d'une simple intention.
- Consigne: la cible WCAG 2.1 AA et eCH-0059, le soin apporté à la structure des pages, aux contrastes et à la navigation au clavier relèvent d'une discipline de conception. Ils ne sont pas, à eux seuls, une garantie vérifiée.

Voir aussi la page [Sécurité et limites](securite-et-limites.md), qui pose cette même distinction pour les garde-fous de BASE.

## La preuve dont nous disposons

Studio inclut un test d'accessibilité automatisé (`tools/studio/ui/e2e/a11y.spec.ts`), intégré à la suite end-to-end. Concrètement:

- il utilise le moteur `axe-core` via Playwright;
- il analyse les critères marqués `wcag2a` et `wcag2aa`;
- il couvre les vues principales de Studio (la navigation, la vue Évaluations) ainsi qu'un tiroir modal, en vérifiant aussi le comportement des éléments masqués;
- il échoue la build lorsqu'une violation d'impact `serious` ou `critical` est détectée, et le rapport détaille le nœud et les valeurs mesurées pour rendre l'échec diagnosticable.

Ce test fait partie des vérifications end-to-end exécutées par le projet. L'accessibilité figure ainsi dans le filet de tests automatisés, et non dans une revue ponctuelle vite oubliée.

## La limite de cette preuve

Un contrôle automatisé a une portée limitée: voici ce qu'il couvre et ce qui lui échappe.

- Un contrôle automatisé comme `axe-core` ne couvre qu'une partie des critères WCAG, de l'ordre d'un tiers selon les estimations courantes de l'outillage. Il détecte des problèmes structurels (attributs manquants, contrastes insuffisants, rôles incorrects), mais il ne juge pas la pertinence d'un texte alternatif, la logique de l'ordre de lecture, la clarté du langage ou la qualité réelle d'un parcours au clavier complexe.
- Le test actuel se concentre sur les vues principales de Studio. Il ne couvre pas encore exhaustivement tous les écrans, tous les états d'erreur, ni l'ensemble du site de documentation.
- Aucun audit manuel complet n'a été réalisé à ce jour. Aucune évaluation avec des technologies d'assistance (lecteurs d'écran) ni avec des personnes en situation de handicap n'a été formellement conduite et documentée.
- En conséquence, il n'existe pas, à ce jour, de déclaration formelle de conformité WCAG 2.1 AA ni eCH-0059 pour BASE.

En résumé: nous disposons d'un signal automatisé utile et continu, mais ce n'est pas une preuve de conformité.

## État connu

Connu comme bon (vérifié par le test automatisé, sur les vues couvertes):

- absence de violation d'accessibilité d'impact grave ou critique sur les vues principales de Studio testées;
- prise en compte des éléments masqués et des tiroirs modaux dans le périmètre du test;
- intégration de la vérification à la suite end-to-end, donc réexécutée en continu.

En attente (non encore fait, ou non couvert):

- audit manuel complet du site de documentation et de Studio;
- tests avec lecteurs d'écran et autres technologies d'assistance;
- évaluation avec des personnes en situation de handicap;
- couverture automatisée étendue à l'ensemble des écrans et des états;
- vérification dédiée de l'accessibilité du contenu rédactionnel (langage clair, structure des titres, textes alternatifs);
- déclaration formelle de conformité et procédure de retour d'accessibilité documentée.

## La déclaration de conformité est un objectif

Une déclaration de conformité formelle (au sens de WCAG 2.1 AA ou de eCH-0059) suppose un audit complet, incluant des vérifications manuelles et des tests avec technologies d'assistance. Ce travail n'est pas terminé. Nous considérons donc la conformité comme un objectif que nous poursuivons activement.

Nous préférons annoncer un contrôle automatisé réel, avec ses limites, plutôt qu'afficher une conformité que nous ne pourrions pas étayer.

## Pour signaler un problème

Si vous rencontrez un obstacle d'accessibilité dans le site de documentation ou dans Studio, signalez-le via le canal de suivi du projet (gestionnaire d'incidents du dépôt). Un retour précis (page concernée, navigateur, technologie d'assistance utilisée, comportement attendu) aide à corriger plus vite et à étendre la couverture des tests.
