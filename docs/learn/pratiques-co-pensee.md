---
title: La co-pensée en pratique
description: Garder la main quand on produit avec l'IA: la boucle du quotidien, cinq pratiques concrètes, et les seize principes qui les fondent. Du geste de tous les jours à la méthode complète.
keywords: [co-pensée, pratiques, principes, vérification, méthode, collaboration humain-IA, responsabilité, souveraineté, fiche de décision, marqueurs]
---

Produire avec l'IA demande désormais peu d'effort; le défendre en demande beaucoup. L'enjeu n'est donc pas d'écrire le prompt parfait, mais de **rester celui qui garde la main**: cadrer, confier, évaluer, ajuster, et savoir, à la fin, ce que vous signez. Cette page réunit de quoi y arriver, du plus simple au plus complet: la boucle qui rythme chaque interaction, cinq pratiques pour la rendre légère, puis les seize principes qui les fondent. Vous pouvez vous arrêter après les pratiques et déjà bien travailler; descendre jusqu'aux principes, c'est tenir la méthode dans la durée.

> [Pourquoi BASE: co-penser avec l'IA](./co-penser-avec-lia.md) explique *pourquoi* la vérification est le cœur du sujet. Cette page-ci montre *comment*.

## La boucle: cadrer, confier, évaluer, ajuster

Travailler avec l'IA suit le plus souvent le même cycle, **CADRER → CONFIER → ÉVALUER → AJUSTER**, puis on recommence. Ce n'est pas un signe d'inefficacité, c'est la méthode: les bons résultats viennent de quelques tours de cette boucle, pas d'une seule demande parfaite. Les cinq pratiques ci-dessous rendent chaque étape légère. Aucune n'exige d'être expert: elles servent autant la personne pressée que celle qui veut creuser.

### 1. Cadrer clairement

Avant de générer, dites le but, les contraintes, et ce à quoi ressemble une bonne réponse. Un cadre net en amont rend la vérification légère en aval.

> *«Rédige une réponse à ce client mécontent. Ton: calme et factuel. Contraintes: pas d'engagement de remboursement, propose plutôt un rendez-vous. Une bonne réponse reconnaît le problème sans promettre ce qu'on ne peut pas tenir.»*

**Ce que vous vérifiez:** le ton, et qu'aucune promesse non autorisée n'a été glissée.
Exemple complet: `exemples/assistant-courrier/`.

### 2. Vérifier contre la réalité

Celui qui produit ne peut pas juger son propre travail. L'IA propose, vous vérifiez contre vos faits, vos fichiers, vos règles. C'est la dette de vérification: elle ne disparaît pas, on la rend visible et petite.

> *«Sur quoi t'appuies-tu pour ce chiffre? Cite la source dans mes fichiers.»*

**Ce que vous vérifiez:** que la source existe et dit bien ce qu'on lui fait dire.
Exemple complet: `exemples/assistant-devis/`, où le barème vient de vos fichiers, pas de la mémoire du modèle.

### 3. Demander une fiche de décision

Quand plusieurs choix sont ouverts en même temps, un fil de discussion s'emmêle. Demandez une **fiche de décision**: l'IA pose chaque point avec sa recommandation en tête, vous notez votre accord et vos commentaires, puis elle agit sur l'ensemble d'un coup. Vous décidez, la fiche structure la décision.

> *«Plusieurs choix sont ouverts. Crée-moi une fiche de décision: un point par carte, ta recommandation d'abord, et je te rends mes réponses.»*

- **Quand:** dès qu'il y a deux décisions ou plus à prendre ensemble.
- **Ce que vous récupérez:** un document clair où vous tranchez point par point, sans que l'IA décide à votre place.
- **Ce que vous vérifiez:** que chaque recommandation est justifiée, et qu'aucun point déjà réglé n'est rouvert.

Exemple complet: `exemples/assistant-reflexion/`, qui sait clarifier une décision et préparer une note de décision.

### 4. Rendre visibles les hypothèses

Une bonne interaction n'enterre pas ce qui compte. Demandez à l'IA de marquer ce qui reste à confirmer plutôt que de le présenter comme acquis. Les marqueurs `[A VALIDER]`, `[HYPOTHESE]` et `[A COMPLETER]` se repèrent d'un coup d'œil, pour vous comme pour vos outils.

> *«Marque `[A VALIDER]` tout ce qui n'est pas confirmé, et `[HYPOTHESE]` les points où tu supposes.»*

**Ce que vous vérifiez:** que les zones d'incertitude sont signalées, pas masquées.

### 5. Itérer, pas chercher le prompt parfait

Le contrôle fin fait l'efficacité. Plutôt que de réécrire dix fois la consigne, laissez générer une première version, réagissez précisément, ajustez. La friction est productive: chaque aller-retour vous rapproche, et vous gardez la compréhension de ce qui change.

> *«C'est presque ça. Rends le deuxième paragraphe plus court et enlève le jargon.»*

**Ce que vous vérifiez:** que chaque version se rapproche, et que vous comprenez encore ce qui bouge.

Ces pratiques sont calibrées, pas anti-automatisation: elles vous gardent capable de vérifier, sans ralentir. Ce qu'elles appliquent, ce sont les seize principes qui suivent.

---

## Les seize principes

Les pratiques ci-dessus sont la version courte; voici la méthode complète. Il existe de nombreux cadres réglementaires et éthiques pour régir l'utilisation de l'IA. Ces principes ne les remplacent pas: ils donnent des orientations opérationnelles pour exceller au sein de ces cadres, en restant efficace et responsable. Ils s'organisent en six catégories: porter sa responsabilité, connaître ses contraintes de fiabilité, savoir interagir, éviter les pièges courants, privilégier la méthode aux outils, et garder le contrôle dans la durée.

### I. Portez votre responsabilité

#### 1. Soyez vous-même là où c'est essentiel

Les tâches qui font appel à votre identité personnelle unique (votre voix, votre style, votre vision ou vos valeurs) doivent être pilotées par vous.

Exemples: vision stratégique, philosophie d'entreprise, identité de marque, signature architecturale.

*Posez-vous la question: cette tâche nécessite-t-elle ce qui me rend unique?*

#### 2. Soyez humain là où c'est essentiel

Les tâches qui exigent une expérience humaine (empathie, compréhension incarnée, intuition morale) doivent être dirigées par un être humain.

Exemples: message délicat à un collaborateur, médiation d'un conflit, décision éthique, réclamation client sensible.

*Posez-vous la question: cela peut-il vraiment être fait sans savoir ce que l'on ressent en tant qu'humain?*

#### 3. Utilisez l'IA avec efficacité

Une fois que vous décidez d'utiliser l'IA, faites-le bien. Minimisez les itérations inutiles, les instructions vagues et les allers-retours superflus. Structurez vos demandes, vérifiez les résultats et évitez d'utiliser l'IA pour des tâches qu'elle ne peut pas accomplir de manière fiable.

*Posez-vous la question: est-ce que j'utilise l'IA de manière ciblée et productive, ou est-ce que je gaspille du temps et des ressources?*

#### 4. Vérifiez par rapport à la réalité

L'IA simule, prédit et émet des hypothèses, mais elle ne peut pas tester ses affirmations dans le monde réel. Formuler et tester des hypothèses face à la réalité physique, c'est votre responsabilité.

Exemples: un devis peut sembler correct mais contenir un prix irréaliste pour votre marché. Une offre d'emploi peut sembler professionnelle mais ignorer vos contraintes locales. Seul vous pouvez vérifier ce qui correspond à votre réalité.

#### 5. Évaluez les risques, les coûts et les alternatives

L'IA générative n'est pas toujours le bon choix. Avant chaque utilisation, soupesez:

- **Les risques:** confidentialité, biais, propriété intellectuelle, authenticité, souveraineté des données, conformité réglementaire.
- **Les coûts:** énergie, argent, temps, compromis sur la qualité, dépendance cognitive.
- **Les alternatives:** algorithmes déterministes, outils spécialisés, méthodes établies, expertise humaine seule.

*Posez-vous la question: l'IA générative offre-t-elle un bénéfice net ici, ou une autre approche serait-elle plus sûre, moins chère ou plus efficace?*

*Les pratiques courantes sur ces aspects sont détaillées en [annexe](#annexe-pratiques-courantes-pour-le-principe-5).*

### II. Connaissez vos contraintes de fiabilité

#### 6. Soyez conscient de la complexité inhérente à la tâche

Certaines tâches nécessitent fondamentalement un nombre d'étapes, une certaine mémoire, ou la traversée d'une certaine quantité d'information. IA ou non, elles ne peuvent être accomplies de manière fiable sans ces ressources. Ce ne sont pas des faiblesses de l'IA, mais des propriétés du problème: ce qui vous coûterait des étapes intermédiaires en coûte à l'IA comme à tout système au monde. Autrement dit, l'IA ne fera jamais de magie: pas de résultats d'entreprise sans l'effort qui les produit, pas de révolution dans tous les domaines sans les ressources qu'elle réclame. Au mieux, l'IA allège ou déplace l'effort; elle ne le supprime pas.

Pourquoi ces limites tiennent du problème et non de l'IA, jusqu'à la thèse de Church-Turing: voir [Pourquoi BASE](co-penser-avec-lia.md), section «Les limites de la tâche, l'IA les partage».

Exemples: extraire des informations à travers plusieurs documents, vérifier la cohérence entre les sources, synthétiser des points communs sur des volumes importants.

*Posez-vous la question: si je devais faire cela, aurais-je besoin de parcourir de nombreux documents? De m'arrêter pour réfléchir? De prendre des notes? De suivre un processus précis? Si oui, l'IA ne peut pas simplement «deviner» la réponse en une fois. Elle a aussi besoin de ressources (temps et/ou capacité de contexte).*

C'est pourquoi BASE utilise des **workflows structurés**: ils découpent les tâches complexes en étapes gérables, avec des points de contrôle réguliers.

#### 7. Tournez-vous vers des algorithmes dédiés pour obtenir des garanties

Par nature, les modèles de langage ne peuvent fournir de garanties strictes. Pour cela, tournez-vous vers des algorithmes spécifiques (vérificateurs, outils, processus de correction d'erreurs).

Exemples: vérificateurs de conformité, analyseurs de documents, vérificateurs de code, calculateurs de TVA.

*Posez-vous la question: quel est mon équilibre risques-bénéfices? Pour quels éléments ai-je besoin de vérificateurs externes?*

### III. Sachez comment interagir

#### 8. Traitez la communication humain-IA comme une compétence à part entière

Le prompt parfait en une seule fois ne résout pas grand-chose. Ce qui compte, c'est une communication de qualité et structurée sur plusieurs étapes, en développant un «sixième sens» pour repérer ce qui, dans les réponses de l'IA, ne correspond pas à ce qu'un interlocuteur humain produirait.

*Posez-vous la question: comment l'IA réagit-elle à différentes formulations? À quelle fréquence dois-je interagir pour garder mon projet sur les rails?*

#### 9. Fournissez la connaissance qui compte le plus

Ne laissez pas l'IA remplir sa propre mémoire en se basant uniquement sur des heuristiques vagues et des recherches superficielles. De votre monde, le modèle ne retrouve que ce que vous avez rendu trouvable, au grain où vous l'avez rangé. Structurez votre connaissance et pointez vers ce qui est nécessaire dès que vous le pouvez. Et à la bonne maille: des morceaux assez fins pour qu'on désigne le bon sans charrier le reste, assez gros pour qu'ils gardent leur sens.

Exemples: pointez vers des exigences extraites plutôt que vers une pile de comptes rendus de réunion, vers des choix de conception plutôt que vers une documentation éparse, vers une liste de tâches ciblée plutôt que vers l'ensemble de vos fichiers.

*Posez-vous la question: comment structurer l'information pour toujours avoir ce dont j'ai besoin sous la main, même si je reprends le travail dans deux mois?*

C'est exactement ce que font les **fichiers métier** dans BASE: votre identité, votre activité, votre catalogue, vos conditions, structurés et toujours à jour.

#### 10. Façonnez le fonctionnement de l'IA

Les étapes que votre IA suit par défaut ne vous conviennent pas? Son comportement ne vous plaît pas? Façonnez-les. Spécifiez exactement quoi faire, quand, avec quelles informations ou quels outils.

C'est exactement le rôle de l'**AGENT.md** et des **skills** dans BASE: ils façonnent le comportement de l'IA pour qu'il corresponde à votre métier.

### IV. Évitez les pièges courants

#### 11. Ne tombez pas dans le piège de la facilité

Interroger une IA est facile; obtenir des résultats de qualité est souvent exigeant. Réfléchissez, structurez. Restez maître du processus.

Exemples: brouillons non vérifiés, conseils juridiques improvisés, projections financières non contrôlées.

*Posez-vous la question: vaut-il mieux obtenir quelque chose rapidement et payer plus tard en corrections et en opacité, ou structurer pour garantir le succès et la transparence?*

#### 12. Ne tombez pas dans le piège de l'apparence

Les résultats produits par l'IA ont le plus souvent une apparence soignée, mais cela ne signifie pas qu'ils sont corrects. La qualité de l'écriture ne garantit ni l'exactitude des faits, ni la pertinence des recommandations.

Exemples: un diagnostic plausible mais faux, une analyse financière apparemment solide, un contrat professionnel comportant des erreurs, un devis bien formaté avec des prix inventés.

Chaque affirmation acceptée sans examen crée une **dette de vérification**: des hypothèses non testées qui s'accumulent et peuvent s'effondrer au premier regard critique d'un client ou d'un partenaire.

#### 13. Ne tombez pas dans le piège du battage médiatique

Les fournisseurs font souvent des promesses impressionnantes qui dénaturent ce que l'IA fait réellement. Apprenez à les décoder:

- *«Notre modèle n'hallucine pas»*: les modèles de langage génèrent du texte plausible sans mécanisme interne de vérification factuelle. La vérification est toujours requise.
- *«Notre modèle est entraîné sur vos données»*: l'entraînement d'un modèle depuis zéro coûte des millions. «Entraîné sur vos données» signifie généralement un réglage fin (fine-tuning), qui adapte le comportement du modèle mais ne supprime pas le risque fondamental d'hallucination.
- *«Notre modèle est totalement sécurisé»*: l'injection de prompts (influencer le comportement du modèle par des instructions indésirables) est une vulnérabilité structurelle de ces systèmes. Une sécurité externe au modèle est toujours nécessaire.

*Posez-vous la question: cette affirmation reflète-t-elle le fonctionnement réel des modèles de langage? Promet-elle quelque chose que la technologie ne peut fondamentalement pas livrer?*

### V. La méthode avant les outils

#### 14. Ne laissez pas l'outil dicter le processus

La plupart des produits d'IA ne sont pas conçus pour vous aider à respecter les principes 1 à 13. Résistez-y activement. Utilisez les outils qui servent votre méthode. Concevez des outils qui placent la barre plus haut.

BASE est conçu autour de ce principe: vos skills, templates et données métier sont votre vrai capital. Ils encodent votre savoir-faire, votre expertise, vos processus, et ils sont portables d'un outil à l'autre. Les outils changent vite. Une structure de connaissances bien organisée vous servira pendant des années.

Un cas particulier mérite d'être nommé: **la grammaire des agents.** Beaucoup d'outils vous invitent à découper d'avance votre travail en «agents», rôles et passages de relais, dans leur interface. Mais l'essentiel du travail consiste à suivre le fil de sa propre pensée, fluide, pas à le pré-articuler en agents. Garder la liberté de penser n'importe quel processus, y compris une simple conversation sur les bons fichiers, fait partie de «ne pas laisser l'outil dicter le processus». *(BASE emploie le mot «agent» pour rester exécutable sur ces outils, qui le connaissent, mais un agent BASE est seulement votre Markdown, lisible et optionnel. Voir [Pourquoi BASE: co-penser avec l'IA](co-penser-avec-lia.md).)*

### VI. Gardez le contrôle dans la durée

Les principes précédents vous aident à bien produire avec l'IA, ici et maintenant. Les deux suivants protègent quelque chose de plus lent à perdre et plus difficile à reconstruire: votre capacité à rester aux commandes au fil des mois.

#### 15. Gardez une intuition suffisante pour vérifier

Vous pouvez déléguer la granularité à l'IA, mais vous ne pouvez pas déléguer la capacité à juger ce qu'elle produit. La vérification (principe 4) suppose que vous comprenez encore ce que vous vérifiez. À force de déléguer, on perd peu à peu l'intuition fine du travail, et la vérification se dégrade alors en validation de façade, sans qu'on s'en aperçoive, parce que le résultat «a l'air correct» (principe 12).

Gardez donc, en permanence, assez d'intuition pour rester un vérificateur capable. Vous pouvez perdre du détail; vous ne devez pas perdre la prise. Cela peut exiger d'investir délibérément du temps pour recharger la vue d'ensemble dans votre propre tête: relire en profondeur, discuter en équipe de ce qui a été produit et pourquoi, refaire vous-même un fragment du travail de temps en temps.

*Posez-vous la question: si l'IA disparaissait demain, comprendrais-je encore assez ce qu'elle a produit pour le défendre devant un client? Mon intuition est-elle encore au niveau de ce que je signe?*

**Tension à connaître.** BASE cherche à rendre la vérification *légère* (structure forte en amont → vérification légère en aval). C'est un atout, mais poussé à l'extrême, c'est aussi le mécanisme par lequel on s'éloigne de la matière. La structure doit alléger la vérification, jamais la vider de son sens.

#### 16. Gardez la souveraineté sur votre dispositif

Travailler avec l'IA, c'est opérer un dispositif fait de plusieurs couches: vos fichiers, que vous maîtrisez, et les instructions injectées par l'outil (prompt système, règles, politiques du fournisseur) que vous ne voyez pas toujours. Perdre la souveraineté, c'est opérer une IA façonnée par des instructions externes sans transparence sur ce qui structure réellement votre interaction.

BASE vous rend souverain sur *votre* couche: vos AGENT.md, skills et données sont lisibles, portables et vous appartiennent (principe 14). Restez lucide sur les couches que vous n'écrivez pas: exigez de la transparence sur ce que l'outil injecte, préférez les dispositifs auditables, et gardez votre savoir dans des fichiers que vous pouvez emporter ailleurs. La portabilité conditionne votre souveraineté: elle vous laisse partir le jour où l'outil ne vous convient plus.

*Posez-vous la question: est-ce que je sais ce qui, dans ce dispositif, oriente le comportement de l'IA? Si l'outil changeait ses règles invisibles demain, est-ce que je le saurais, et pourrais-je partir?*

---

## La boucle de co-pensée

Travailler efficacement avec l'IA suit le plus souvent le même cycle:

```
    ┌──────────────┐
    │  1. CADRER   │  Formuler clairement ce que vous voulez,
    │              │  avec le contexte nécessaire
    └──────┬───────┘  (principes 1, 2, 5, 9, 10)
           │
    ┌──────▼───────┐
    │  2. CONFIER  │  L'IA génère dans le cadre défini,
    │              │  jusqu'au prochain point de contrôle
    └──────┬───────┘  (principes 3, 6)
           │
    ┌──────▼───────┐
    │  3. ÉVALUER  │  Vous vérifiez : est-ce correct ?
    │              │  Est-ce que ça correspond à ma réalité ?
    └──────┬───────┘  (principes 4, 7, 8, 11, 12)
           │
    ┌──────▼───────┐
    │  4. AJUSTER  │  Vous précisez, corrigez, enrichissez
    │              │  → retour à l'étape 2
    └──────────────┘
```

**Le principe clé:** structure forte en amont → vérification légère en aval. Structure faible en amont → dette de vérification explosive.

Les principes 15 et 16 ne s'attachent pas à une phase précise de la boucle. Ils protègent votre capacité à la tenir dans la durée: garder assez d'intuition pour que l'étape *Évaluer* reste réelle, et garder la souveraineté sur le dispositif qui exécute toute la boucle.

---

## En résumé

| # | Principe | En une phrase |
|---|----------|---------------|
| | **I. Portez votre responsabilité** | |
| 1 | Soyez vous-même là où c'est essentiel | Votre voix, votre vision, vos valeurs sont irremplaçables |
| 2 | Soyez humain là où c'est essentiel | L'empathie et l'intuition morale exigent l'expérience humaine |
| 3 | Utilisez l'IA avec efficacité | Structurez vos demandes, ne gaspillez pas les ressources |
| 4 | Vérifiez par rapport à la réalité | L'IA émet des hypothèses, vous seul pouvez tester dans le monde réel |
| 5 | Évaluez risques, coûts et alternatives | L'IA n'est pas toujours le bon choix |
| | **II. Connaissez vos contraintes** | |
| 6 | Complexité inhérente à la tâche | Tâche complexe = ressources nécessaires, pas une seule demande |
| 7 | Algorithmes dédiés pour les garanties | Les modèles de langage ne peuvent pas garantir l'exactitude |
| | **III. Sachez interagir** | |
| 8 | Communication comme compétence | Le prompt parfait unique n'existe pas, itérez |
| 9 | Fournir la connaissance qui compte | Structurez au bon grain et pointez, ne laissez pas l'IA deviner |
| 10 | Façonner le fonctionnement | Définissez le processus, le comportement, les étapes |
| | **IV. Évitez les pièges** | |
| 11 | Piège de la facilité | Demander est facile, obtenir un bon résultat est exigeant |
| 12 | Piège de l'apparence | Texte fluide ≠ texte correct |
| 13 | Piège du battage médiatique | Décryptez les promesses commerciales |
| | **V. La méthode avant les outils** | |
| 14 | L'outil ne dicte pas le processus | Votre structure de connaissances est votre vrai capital |
| | **VI. Gardez le contrôle dans la durée** | |
| 15 | Gardez une intuition suffisante pour vérifier | Déléguez la granularité, jamais la capacité à juger |
| 16 | Gardez la souveraineté sur votre dispositif | Sachez ce qui façonne l'IA; gardez de quoi partir |

---

## Guides de décision

Ces guides opérationnalisent les principes ci-dessus dans des situations concrètes.

### Guide 1: «L'IA est-elle le bon choix?» (Principes 1, 2, 5)

Quatre questions, dans cet ordre:

1. **Cette tâche nécessite-t-elle ce qui me rend unique?** (ma voix, mon style, ma vision, mes valeurs)
   → Si oui: **faites-le vous-même.** L'IA peut structurer, pas remplacer votre identité. *(Principe 1)*

2. **Cette tâche exige-t-elle une expérience humaine?** (empathie, intuition, jugement moral)
   → Si oui: **dirigez vous-même.** L'IA peut préparer, pas ressentir. *(Principe 2)*

3. **Le bénéfice justifie-t-il les risques et les coûts?** (confidentialité, fiabilité, temps de vérification)
   → Si non: **utilisez une alternative.** Un tableur, un modèle existant, une méthode éprouvée. *(Principe 5)*

4. → Si oui: **utilisez l'IA avec structure.** Structurez la demande, fournissez la connaissance, vérifiez le résultat. *(Principes 3, 6, 9, 10)*

### Guide 2: «Quand itérer vs. avancer» (Principes 8, 11, 12)

Si vous utilisez les marqueurs BASE dans vos documents:

- **`[A VALIDER]` présent** → itérer. Une proposition n'a pas été confirmée.
- **`[A COMPLETER]` présent** → itérer. Une information manque.
- **`[ATTENTION]` présent** → évaluer le risque. Peut-on avancer malgré l'alerte, ou faut-il traiter?
- **Aucun marqueur, résultat vérifié** → avancer. Le travail est complet.

Sans marqueurs, la même logique s'applique: avancez quand vous avez vérifié par rapport à la réalité *(Principe 4)*, pas quand le texte «a l'air bien» *(Principe 12)*.

### Guide 3: «Évaluer la qualité d'un agent» (Principe 10)

| Critère | Basique | Bon | Excellent |
|---------|---------|-----|-----------|
| **Routage** | L'agent comprend 1-2 intentions | Couvre toutes les intentions courantes | Gère les intentions ambiguës avec des questions de clarification |
| **Workflows** | Étapes listées | Points de décision avant chaque action irréversible | Reformulations fréquentes + points de décision rares et précis + journal |
| **Connaissances** | Informations génériques | Chiffres précis, terminologie exacte, règles actualisées | Mis à jour régulièrement avec données réelles du métier |
| **Données** | Placeholders partout | Identité et conditions remplies | Catalogue, clients et historique à jour |

---

## Annexe: quand votre pratique grandit

### Multi-agents

Si vous avez plusieurs activités distinctes, un agent par activité est souvent plus efficace qu'un agent qui fait tout. Signal: quand un agent a plus de 5 workflows, envisagez de le scinder.

### Connaissances partagées

Les compétences standard (communication, marqueurs, journal) sont identiques entre agents. D'autres connaissances peuvent être partagées entre agents via des chemins relatifs (ex. les informations entreprise).

### Travail en équipe

Si plusieurs personnes utilisent le même agent:
- Versionnez les fichiers avec Git pour rendre les changements visibles et discutables
- Partagez les workflows et connaissances qui doivent vraiment être communs
- Séparez les données métier quand les rôles, clients, pays, entités juridiques ou niveaux de sensibilité l'exigent
- Le journal permet de voir ce que les autres sessions ont produit

Pour une grande organisation, ce niveau reste une convention de travail. Il doit être complété par les mécanismes officiels de droits d'accès, classification, audit, rétention et revue conformité.

### Signaux de complexité

- Plus de 5 workflows → scindez l'agent
- Plus de 3 agents → envisagez un routeur commun
- Des workflows qui durent plus de 10 étapes → découpez en sous-workflows
- Des connaissances qui dépassent 200 lignes → découpez en sous-domaines

---

## Adaptation entre modèles

Les modèles IA évoluent vite, et il en existe plusieurs familles. Un workflow qui fonctionne parfaitement avec l'un peut nécessiter des ajustements avec un autre. Les points qui varient le plus:
- La longueur de contexte (combien de fichiers chargeables simultanément)
- La tendance à suivre les instructions vs. improviser
- La qualité des calculs et du formatage

**Règle pratique:** si le résultat est décevant, le problème est rarement le modèle: c'est souvent le workflow qui n'est pas assez structuré. Ajoutez des exemples de dialogue, précisez les formats attendus, découpez en étapes plus courtes.

---

## Annexe: pratiques courantes pour le principe 5

**Risques inhérents à l'IA générative** (découlant de sa nature statistique):

- **Confidentialité:** l'IA comprend le concept de privé vs public, mais ne peut savoir ce qui est privé pour vous dans vos données. N'exposez jamais de données sensibles à des systèmes non contrôlés.
- **Biais:** l'IA apprend des schémas issus des données d'entraînement. Scrutez les résultats, en particulier ceux impliquant des personnes.
- **Propriété intellectuelle:** les modèles d'IA peuvent avoir été entraînés sur du contenu protégé. Vérifiez les licences et les droits avant de diffuser du contenu généré.
- **Authenticité:** le résultat de l'IA ressemble par conception à un contenu humain. Signalez l'utilisation de l'IA lorsque l'authenticité ou la traçabilité sont importantes.
- **Souveraineté des données:** vos interactions peuvent être utilisées pour entraîner les modèles. Vérifiez les politiques de protection des données et désactivez les options de réutilisation si nécessaire.
- **Conformité réglementaire:** assurez-vous que votre utilisation respecte les réglementations en vigueur et les directives de votre organisation.

**Coûts** (directs et indirects):

- Énergie, coûts financiers, temps passé à concevoir les instructions et à vérifier, perte de qualité nécessitant des corrections, dépendance cognitive.

**Alternatives** (souvent plus fiables ou efficaces):

- Algorithmes déterministes pour la recherche, le calcul, la vérification.
- Outils spécialisés conçus pour la tâche.
- Méthodes établies (listes de contrôle, modèles, processus).
- Expertise humaine seule lorsque c'est suffisant.

---

## Pour aller plus loin

- **Comprendre l'approche**: [Comprendre BASE et façonner l'interaction avec l'IA](comprendre.md), anatomie d'un agent, pourquoi ça marche, portabilité.
- **Diffuser dans une organisation**: [L'adoption dans une organisation](adoption-organisation.md), comment une pratique individuelle devient un usage d'équipe puis d'institution.
- **Démarrer en pratique**: le [tutoriel «Apprendre en faisant»](../tutoriel/index.md), pas à pas.
- **Galerie d'idées**: [idees-agents.md](../guides/idees-agents.md), des dizaines d'exemples d'agents par métier.
- **Créer votre propre assistant**: ouvrez le dossier d'un assistant dans un outil IA capable de lire vos fichiers et dites «J'aimerais créer un assistant pour [votre métier]».

---

*Adapté des [principes de co-pensée humain-IA](https://a-i.swiss) d'AI Swiss.*

BASE est un framework par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
