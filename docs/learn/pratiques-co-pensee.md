---
schema_version: base.resource.v1
id: pratiques-co-pensee
type: document
title: La co-pensée en pratique
description: Cadrer, confier, évaluer et ajuster une production avec l'IA tout en gardant la responsabilité du résultat.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [co-pensee, pratiques, principes, verification, methode, responsabilite, marqueurs]
---

# La co-pensée en pratique

Produire avec l'IA demande peu d'effort. Défendre le résultat peut en demander beaucoup. La co-pensée sert à garder la main avec une boucle courte: **CADRER → CONFIER → ÉVALUER → AJUSTER**.

Une réponse est une proposition à contrôler, non une conclusion acquise. Plusieurs tours ne signalent pas un échec de communication: ils permettent de préciser le but à partir d'un résultat concret. [Pourquoi BASE](co-penser-avec-lia.md) expose la raison de cette méthode; cette page sert à l'appliquer.

## Cinq pratiques

### 1. Cadrer le résultat attendu

Énoncez le but, les contraintes, les sources qui font foi et le critère de réussite.

> «Rédige une réponse calme et factuelle. Ne promets aucun remboursement. Propose un rendez-vous et appuie-toi sur la politique jointe.»

Un cadre utile indique aussi jusqu'où l'IA peut avancer seule et l'action qui exige une décision. Vérifiez que le résultat respecte chaque contrainte, pas seulement le ton.

### 2. Vérifier contre une source adaptée

Demandez sur quoi repose chaque fait important. Utilisez un vérificateur externe lorsqu'il existe, par exemple un calculateur, un schéma ou un test. Sinon, confrontez la proposition aux faits et au jugement métier proportionné au risque.

> «Cite le passage de mes fichiers qui justifie ce montant.»

Une relecture par le même modèle peut révéler un problème, mais ne constitue pas une vérification indépendante.

Vérifier une citation signifie ouvrir le passage et confirmer qu'il soutient réellement l'affirmation. La présence d'un lien ou d'un nom de fichier ne suffit pas.

### 3. Regrouper les décisions

Quand plusieurs choix sont liés, demandez une fiche de décision qui présente chaque option, une recommandation justifiée et la place de répondre. Vous tranchez; le document évite que des décisions se perdent dans la conversation ou soient rouvertes sans raison.

Une bonne fiche sépare les choix indépendants, montre leurs conséquences et distingue ce qui est recommandé de ce qui est déjà décidé.

### 4. Rendre l'incertitude visible

Utilisez les quatre marqueurs métier canoniques selon leur définition dans le [registre des marqueurs](../reference/marqueurs.md). `[A COMPLETER]`, `[A VALIDER]`, `[ATTENTION]` et `[DECISION]` sont les seuls marqueurs reconnus par le scanner.

Un agent peut ajouter des annotations de domaine, par exemple `[HYPOTHESE]`, mais celles-ci ne deviennent pas pour autant des marqueurs canoniques et ne sont pas remontées par `base markers`.

Le but n'est pas de couvrir le texte d'étiquettes. Marquez les incertitudes qui changeraient une décision, un montant, un engagement ou la suite du travail.

### 5. Ajuster par petits écarts

Faites produire une première version, nommez précisément l'écart, puis vérifiez la correction. Le nombre de tours varie selon la tâche; aucune rapidité universelle n'est promise.

> «Raccourcis le deuxième paragraphe et remplace le jargon par des mots courants.»

Demandez une modification à la fois lorsque les écarts interagissent. Vous voyez ainsi ce qui a changé et évitez qu'une correction discrète en annule une autre.

## Seize principes

Ces principes complètent les cinq pratiques. Ils ne remplacent ni les obligations professionnelles ni les cadres juridiques applicables. Ils aident à décider quoi confier, comment contrôler et ce qu'il faut continuer à comprendre soi-même.

### Porter sa responsabilité

1. **Soyez vous-même là où c'est essentiel.** Gardez la main sur votre voix, votre vision et vos valeurs. L'IA peut aider à structurer une position sans devenir l'auteur de ce qui vous engage personnellement.
2. **Soyez humain là où c'est essentiel.** L'empathie vécue et le jugement moral ne se délèguent pas au modèle. Pour un conflit, une annonce difficile ou une décision éthique, utilisez éventuellement l'IA pour préparer, puis conduisez vous-même l'échange.
3. **Employez l'IA de façon ciblée.** Renoncez-y lorsqu'une autre méthode est plus sûre ou plus simple. Un calcul déterministe, un formulaire ou une liste de contrôle peuvent être plus adaptés qu'une génération.
4. **Vérifiez par rapport à la réalité.** Le modèle ne peut pas éprouver seul ses affirmations dans votre terrain. Un devis plausible doit encore correspondre à vos prix, une règle citée à la version applicable et une recommandation à la situation vécue.
5. **Pesez risques, coûts et alternatives.** Incluez confidentialité, propriété intellectuelle, conformité, énergie, temps de contrôle et dépendance cognitive. Le bon critère est le bénéfice net pour cette tâche, pas la simple disponibilité de l'outil.

### Connaître les contraintes de fiabilité

6. **Respectez la complexité intrinsèque de la tâche.** Parcourir beaucoup d'information, conserver des étapes intermédiaires ou appliquer un calcul exige les données, la mémoire de travail et les opérations correspondantes, quel que soit l'exécutant. Si vous auriez besoin de chercher, prendre des notes ou suivre une procédure, donnez aussi au dispositif les moyens de le faire. L'IA peut déplacer ou réduire cet effort, pas supprimer les dépendances du problème.
7. **Utilisez des algorithmes dédiés pour les garanties.** Confiez les calculs, schémas, tests et règles formalisables aux vérificateurs adaptés. Les contrôles externes n'existent que pour certaines tâches; concevez le reste autour d'une revue humaine proportionnée aux conséquences.

### Savoir interagir

8. **Traitez la communication comme une pratique.** Reformulez et corrigez au lieu de chercher une demande parfaite. Nommez l'écart observé, puis demandez une nouvelle version qui permet de vérifier la correction.
9. **Fournissez la connaissance utile.** Rendez les sources trouvables au bon grain. Une règle courte avec son contexte vaut mieux qu'un dossier entier chargé sans distinction.
10. **Façonnez la façon de faire.** Décrivez les étapes, outils, contrôles et décisions attendus. Une intention peut ainsi conduire au savoir-faire et au savoir utiles, chargés au besoin, sans transformer d'avance tout le corpus en agents.

### Éviter les pièges

11. **Ne confondez pas facilité de demander et qualité du résultat.** La production instantanée reporte souvent l'effort vers le cadrage, la sélection des sources et la vérification.
12. **Ne confondez pas fluidité et exactitude.** Un texte assuré peut contenir un chiffre inventé, une citation déformée ou une décision incompatible avec vos contraintes.
13. **Exigez la preuve des promesses commerciales.** Demandez quel composant applique chaque garantie, dans quelles conditions et avec quelles limites. Aucun modèle génératif n'abolit à lui seul l'hallucination, l'injection ou le besoin de sécurité extérieure.

### Garder le contrôle

14. **Ne laissez pas l'outil dicter la méthode.** Partez de l'intention et du travail réel, puis organisez les points d'entrée nécessaires. Ne découpez pas une expertise en agents uniquement parce qu'une interface présente le monde ainsi. Les définitions de skill, process, compétence, agent et assistant se trouvent dans le [glossaire](../reference/glossaire.md).
15. **Conservez assez d'intuition pour juger.** Reprenez périodiquement une partie du travail en profondeur. Si vous ne pouvez plus expliquer les hypothèses, reconnaître un ordre de grandeur ou défendre le résultat, la délégation a dépassé votre capacité de contrôle.
16. **Restez souverain sur votre dispositif.** Sachez quels fichiers orientent le travail, quelles données sont envoyées et quels composants appliquent les règles. Les fichiers sont portables, mais changer d'environnement peut demander des adaptateurs, des permissions et des tests.

## Trois décisions rapides

### L'IA est-elle le bon choix?

Demandez-vous d'abord si la tâche engage votre singularité ou exige une expérience humaine. Évaluez ensuite le bénéfice face aux risques, aux coûts et aux alternatives. Si l'IA reste pertinente, fournissez les sources, la façon de faire et le contrôle attendu.

### Faut-il encore itérer?

Continuez lorsqu'une information importante manque, qu'une proposition reste à confirmer ou qu'une alerte n'a pas été traitée. Avancez lorsque le résultat a été comparé à la source ou à la réalité pertinente, pas seulement lorsqu'il paraît convaincant.

### Peut-on déléguer davantage?

Cherchez un contrôle externe, des conséquences faibles et des étapes indépendantes. Plus la tâche engage des personnes, des droits, des montants ou une vue d'ensemble difficile à reconstruire, plus le point de décision humain doit rester proche.

## Données et confidentialité

Un modèle ne «comprend» pas votre confidentialité au sens d'une politique applicable. Un contrat définit des obligations, des responsabilités et des recours pour le fournisseur; il ne bloque pas techniquement une transmission. Seuls les mécanismes effectivement placés sur le chemin de la donnée, par exemple un contrôle d'accès, une retenue d'egress ou une politique appliquée par un connecteur, peuvent empêcher l'opération. Avant de transmettre des données sensibles, suivez la page canonique [Protection des données](../trust/protection-des-donnees.md).

Les droits d'accès, règles et classifications ne valent que dans le composant qui les applique. Une lecture ou une écriture directe peut contourner les mécanismes BASE; [Sécurité et limites](../trust/securite-et-limites.md) décrit ces frontières.

## Prochaine action

Prenez un résultat IA récent et ajoutez quatre lignes: le but, la source qui fait foi, ce qui reste incertain et le contrôle effectué. Ne le livrez pas tant qu'une de ces lignes reste vide pour un point important.
