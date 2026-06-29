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

Avant d'adopter BASE, une institution publique doit pouvoir mesurer ce que vaut, et ce que ne vaut pas, son accessibilité. Vous trouverez ici notre engagement, les preuves que nous pouvons montrer aujourd'hui et les limites honnêtes de ces preuves. Rien de tout cela ne vaut déclaration formelle de conformité: à nos yeux, une telle déclaration reste un objectif à atteindre, non un fait acquis (voir plus bas).

Cette page est informative. Elle ne constitue ni un avis juridique ni un audit de conformité. Chaque institution demeure responsable de sa propre évaluation d'accessibilité, de son audit éventuel et de sa politique en la matière.

## Engagement

Nous visons, pour le site de documentation et pour Studio:

- le référentiel WCAG 2.1 niveau AA;
- la norme suisse eCH-0059 (accessibilité des prestations en ligne).

Cet engagement est une cible de conception. Il oriente nos choix d'interface et notre travail de relecture, sans pour autant signifier que la conformité soit atteinte, ni vérifiée à ce jour.

## Distinction importante: mécanisme et consigne

Partout, BASE distingue ce qui s'applique mécaniquement de ce qui relève d'une consigne suivie de bonne foi. L'accessibilité obéit à la même grille.

- Mécanisme: une vérification automatisée d'accessibilité s'exécute au sein de la suite de tests Playwright (end-to-end) de Studio. Elle tourne à chaque passage de la suite et échoue dès qu'elle détecte des violations graves ou critiques. Elle pèse ainsi d'une contrainte réelle sur l'interface de Studio, et non d'une simple intention.
- Consigne: la cible WCAG 2.1 AA et eCH-0059, comme le soin apporté à la structure des pages, aux contrastes et à la navigation au clavier, relèvent d'une discipline de conception. À eux seuls, ils ne constituent pas une garantie vérifiée.

Voir aussi la page [Sécurité et limites](securite-et-limites.md), qui pose cette même distinction pour les garde-fous de BASE.

## La preuve dont nous disposons

Studio comporte un test d'accessibilité automatisé (`tools/studio/ui/e2e/a11y.spec.ts`), intégré à la suite end-to-end. Concrètement:

- il s'appuie sur le moteur `axe-core` via Playwright;
- il examine les critères marqués `wcag2a` et `wcag2aa`;
- il couvre les vues principales de Studio (la navigation, la vue Évaluations) ainsi qu'un tiroir modal, et contrôle aussi le comportement des éléments masqués;
- il fait échouer la build dès qu'une violation d'impact `serious` ou `critical` apparaît, le rapport précisant alors le nœud et les valeurs mesurées afin que l'échec reste diagnosticable.

Ce test compte parmi les vérifications end-to-end exécutées par le projet. L'accessibilité prend ainsi place dans le filet des tests automatisés, plutôt que dans une revue ponctuelle vite oubliée.

## La limite de cette preuve

La portée d'un contrôle automatisé reste limitée: voici ce qu'il couvre et ce qui lui échappe.

- Un contrôle automatisé comme `axe-core` ne couvre qu'une part des critères WCAG, de l'ordre d'un tiers selon les estimations courantes de l'outillage. Il repère les problèmes structurels (attributs manquants, contrastes insuffisants, rôles incorrects), mais il ne sait juger ni la pertinence d'un texte alternatif, ni la logique de l'ordre de lecture, ni la clarté du langage, ni la qualité réelle d'un parcours au clavier complexe.
- Le test actuel porte sur les vues principales de Studio. Il ne couvre pas encore l'ensemble des écrans, tous les états d'erreur, ni la totalité du site de documentation.
- Aucun audit manuel complet n'a été mené à ce jour. Aucune évaluation au moyen de technologies d'assistance (lecteurs d'écran), ni avec des personnes en situation de handicap, n'a été formellement conduite et documentée.
- Il n'existe donc pas, à ce jour, de déclaration formelle de conformité WCAG 2.1 AA ni eCH-0059 pour BASE.

En somme: nous disposons d'un signal automatisé utile et continu, mais ce n'est pas une preuve de conformité.

## État connu

Tenu pour acquis (vérifié par le test automatisé, sur les vues couvertes):

- aucune violation d'accessibilité d'impact grave ou critique sur les vues principales de Studio mises à l'épreuve;
- prise en compte des éléments masqués et des tiroirs modaux dans le périmètre du test;
- intégration de la vérification à la suite end-to-end, et donc réexécution continue.

En attente (non encore fait, ou non couvert):

- audit manuel complet du site de documentation et de Studio;
- tests avec lecteurs d'écran et autres technologies d'assistance;
- évaluation avec des personnes en situation de handicap;
- couverture automatisée étendue à l'ensemble des écrans et des états;
- vérification dédiée de l'accessibilité du contenu rédactionnel (langage clair, structure des titres, textes alternatifs);
- déclaration formelle de conformité et procédure de retour d'accessibilité documentée.

## La déclaration de conformité est un objectif

Une déclaration de conformité formelle (au sens de WCAG 2.1 AA ou de eCH-0059) suppose un audit complet, assorti de vérifications manuelles et de tests menés avec des technologies d'assistance. Ce travail n'est pas achevé. Nous tenons donc la conformité pour un objectif que nous poursuivons activement.

Nous préférons annoncer un contrôle automatisé réel, avec ses limites, plutôt que d'afficher une conformité que nous ne saurions étayer.

## Pour signaler un problème

Si vous rencontrez un obstacle d'accessibilité dans le site de documentation ou dans Studio, signalez-le par le canal de suivi du projet (gestionnaire d'incidents du dépôt). Un signalement précis (page concernée, navigateur, technologie d'assistance utilisée, comportement attendu) aide à corriger plus vite et à étendre la couverture des tests.
