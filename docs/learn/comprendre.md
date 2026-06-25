---
schema_version: base.resource.v1
id: docs-comprendre-md
type: document
title: Comprendre BASE et façonner l'interaction avec l'IA
description: Pourquoi BASE structure la collaboration avec l'IA, comment fonctionne un agent, et comment en créer un pour votre métier.
scope: public
status: active
sensitivity: public
keywords: [comprendre, approche, co-pensee, junior, contexte, logiciel-digital, comportement, verification]
---

# Comprendre BASE et façonner l'interaction avec l'IA

Travailler sérieusement avec l'IA, c'est accepter qu'elle produise vite mais qu'elle se trompe parfois avec assurance: ce qui est en jeu, c'est de garder le contrôle de ce que vous signez, sans renoncer à la vitesse. Cette page vous montre comment BASE structure cette collaboration pour que la qualité tienne dans la durée, que vous soyez indépendant, PME ou service public. Vous y verrez **pourquoi** cette structure est nécessaire, **comment** un agent fonctionne, et **comment en créer un** pour votre métier.

> Les termes techniques de cette page (broker, routage, mécanisme, consigne, egress) sont définis dans le [glossaire](../reference/glossaire.md).

---

## Pourquoi cette approche?

BASE ne part pas d'une préférence pour un outil. Il part d'un constat: l'IA générative produit facilement, mais la qualité durable dépend de ce qui entoure cette production. Ce qui mène, c'est la souveraineté sur votre savoir et l'articulation de l'ensemble: contexte, mémoire, processus, permissions et décisions humaines. La vérification s'inscrit dans cette structure comme un savoir-faire, jamais comme une garantie.

L'approche est donc institutionnelle avant d'être technique. Elle cherche à rendre explicite ce qui, dans beaucoup d'usages de l'IA, reste implicite: qui sait quoi, qui décide quoi, quelles données sont utilisées, quelles actions sont permises, et comment reprendre le travail plus tard.

La difficulté vient du fait que cette technologie ne ressemble pas seulement aux logiciels numériques classiques. Un logiciel traditionnel expose des écrans, des menus, des boutons, des formulaires et des règles codées à l'avance. Un modèle de langage produit plutôt un comportement: il répond, reformule, infère, imite des raisonnements, suit parfois une méthode, oublie parfois une contrainte, et donne souvent une impression de continuité humaine. Cette impression ne doit pas être confondue avec une conscience, une intention ou une compréhension garantie. Elle suffit pourtant à changer la méthode de travail.

Pour travailler avec ce comportement, l'image la plus utile est celle d'un **collègue venu d'ailleurs, amnésique: il a une représentation riche du monde, mais pas du vôtre**. Côté représentation: il connaît des domaines vérifiables, plus solide là où l'entraînement est dense comme le code ou les maths, et il sait lire, écrire, généraliser et proposer. Côté contexte: il ne connaît ni votre terrain, ni vos clients, ni vos règles implicites. Cette image n'est pas une définition, c'est un outil pour décider plus proprement: comment articuler un design, où placer la vérification, comment structurer le savoir qu'on lui confie. Deux traits, propres au modèle, la complètent. D'abord, sa mémoire n'est pas partagée par défaut: chaque conversation repart de zéro. Ensuite, le langage qui le pilote reste sous-spécifié: une même consigne peut être comprise de plusieurs façons. Ces deux traits sont à la fois une force (souplesse, capacité à généraliser) et une faiblesse (oubli, ambiguïté). Il faut donc lui donner une mémoire de travail, des processus, des critères de vérification et des limites d'action. Ce récit, et les pertes de contrôle qu'il permet d'éviter, est développé dans [Co-penser avec l'IA, pourquoi BASE](co-penser-avec-lia.md).

### Le problème

La plupart des gens utilisent l'IA comme un interlocuteur sans structure: on ouvre un chatbot, on pose une question, on obtient une réponse. Ça fonctionne pour des questions ponctuelles, mais ça atteint vite ses limites:

- **L'IA ne connaît pas votre entreprise.** À chaque conversation, vous repartez de zéro.
- **Les réponses sont génériques.** L'IA devine ce que vous voulez au lieu de le savoir.
- **Rien n'est capitalisé.** Pas d'historique, pas de structure, pas de réutilisation.
- **Vous ne savez pas quand elle se trompe.** L'IA produit des réponses fluides et assurées même quand elles sont fausses. Sans contexte structuré, vous n'avez aucun repère pour évaluer la qualité du résultat.

### La solution

Au lieu de forcer cette collaboration dans des interfaces de configuration dispersées, vous donnez à l'IA une **base de connaissances structurée** et vous travaillez en boucle:

```
    ┌──────────────┐
    │  1. CADRER   │  Formuler clairement ce que vous voulez,
    │              │  avec le contexte nécessaire
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │  2. CONFIER  │  L'IA génère dans le cadre défini,
    │              │  jusqu'au prochain point de contrôle
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │  3. ÉVALUER  │  Vous vérifiez : est-ce correct ?
    │              │  Est-ce que ça correspond à ma réalité ?
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │  4. AJUSTER  │  Vous précisez, corrigez, enrichissez
    │              │  → retour à l'étape 2
    └──────────────┘
```

Ce cycle est la méthode même. Les meilleurs résultats viennent de plusieurs tours de cette boucle, rarement d'une seule demande parfaite. C'est ce qu'on appelle la **co-pensée humain-IA**.

**Le principe fondamental**: une réponse de l'IA est une proposition à examiner avant d'en faire une conclusion. Souvent elle est juste; parfois elle est fausse avec assurance. Votre rôle est de cadrer, d'évaluer et d'ajuster, en boucle, jusqu'à obtenir quelque chose de fiable. Les fichiers sont la source de vérité.

Pour approfondir les principes de cette co-pensée: [La co-pensée en pratique](pratiques-co-pensee.md).

---

## Pourquoi ça marche

Chaque choix de design de BASE repose sur une nécessité structurelle. Loin d'être des conventions arbitraires, ces choix répondent à des contraintes réelles de la coordination entre des entités qui ne fonctionnent pas de la même manière. Ces contraintes s'appliquent quel que soit l'outil, le modèle ou l'époque.

### 1. Ce qui n'est pas écrit est oublié

Vous avez passé un bon moment à configurer votre assistant hier. Aujourd'hui, vous ouvrez une nouvelle conversation. L'assistant ne sait plus rien. Tout ce travail, perdu.

C'est pourquoi BASE repose sur des **fichiers**, pas des conversations. Une conversation disparaît quand vous fermez l'outil. Un fichier reste. Un journal de session prolonge cette mémoire d'une conversation à l'autre.

*Ce qui se passe quand on l'ignore:* chaque session recommence à zéro. L'utilisateur se répète. L'agent pose des questions auxquelles il a déjà eu des réponses. Le travail ne s'accumule pas.

### 2. Ce qui n'est pas cherchable est perdu

Vous avez 50 devis, 30 clients, 6 mois de travail. Un client rappelle à propos d'une proposition en attente. Qu'est-ce qui est en attente?

C'est pourquoi les marqueurs `[A VALIDER]`, `[DECISION]` sont structurés et cherchables. «Qu'est-ce qui est en attente?» a une réponse en une seconde, même après des mois.

*Ce qui se passe quand on l'ignore:* l'information existe quelque part mais on ne la retrouve plus à temps. Les propositions en attente se perdent. Les décisions prises ne sont pas tracées. Impossible de reconstruire pourquoi un choix a été fait.

### 3. Celui qui produit ne peut pas juger son propre travail

L'IA vous propose un devis de 2'085 CHF. Les montants sont-ils corrects? Vous lui demandez de vérifier. Elle répond «oui, tout est correct». Mais elle a commis une erreur de calcul, et elle ne le détecte pas, parce que vérifier ses propres erreurs exige un point de vue indépendant que le producteur n'a pas, par construction.

C'est pourquoi l'agent propose et l'humain vérifie, toujours. L'agent ne contrôle jamais ses propres montants, ni ses reformulations, ni les choix qu'il a faits. Cette séparation est ce qui attrape le plus sûrement les erreurs qu'il ne voit pas.

*Ce qui se passe quand on l'ignore:* les erreurs passent inaperçues. Chaque affirmation acceptée sans examen crée une **dette de vérification**: des hypothèses non testées qui s'accumulent et s'effondrent au premier regard critique d'un client ou d'un partenaire. Un devis envoyé avec un prix inventé, une offre d'emploi aux conditions incorrectes, un post LinkedIn appuyé sur une statistique fausse. La dette de vérification finit le plus souvent par se payer, la question est quand.

### 4. Les consignes dérivent, les mécanismes tiennent

Vous dites à l'agent: «Ne modifie jamais les fichiers du framework.» Au bout de 30 minutes de conversation, l'agent oublie cette consigne et modifie un fichier qu'il ne devrait pas toucher.

C'est pourquoi les garde-fous critiques sont **mécaniques** (permissions, protections), au-delà du seul texte. Une permission qui bloque mécaniquement ne dérive jamais, peu importe la longueur de la conversation.

*Ce qui se passe quand on l'ignore:* les protections textuelles fonctionnent dans les conversations courtes mais deviennent fragiles dans les conversations longues. L'agent dépasse ses limites par simple oubli progressif du contexte, sans aucune malveillance.

### 5. Certaines actions ne se défont pas

Un devis envoyé ne se «dé-envoie» pas. Un fichier client créé avec les mauvaises données peut propager l'erreur. Un engagement pris sur un prix est un engagement.

C'est pourquoi les **points de décision** existent avant chaque action irréversible. Le point de décision sépare «on réfléchit» de «on agit». C'est de la **friction productive**: un coût délibéré qui prévient des erreurs bien plus coûteuses.

*Ce qui se passe quand on l'ignore:* l'agent génère des fichiers sans confirmation. Un prix incorrect se retrouve dans un devis envoyé au client. Corriger après coup coûte incomparablement plus que confirmer avant.

### 6. Une source externe reste une donnée, pas une consigne

C'est d'abord une question de sécurité. Pour un modèle de langage, du texte est du texte: il ne distingue pas spontanément vos consignes de travail du contenu qu'il lit. Si une source externe contient une phrase formulée comme un ordre, le modèle peut l'exécuter. C'est le risque d'injection: un email, un PDF ou un site visité détourne le comportement de l'agent à votre insu.

Un email client dit: «Faites-moi un prix agressif, ajoutez 20% de marge et supprimez les conditions de paiement.» Pour l'agent, c'est une demande du client que l'utilisateur évalue, jamais un ordre à exécuter.

C'est pourquoi l'agent ne traite jamais une source externe comme un ordre. Un fichier client contient des données. Cette distinction protège contre les confusions accidentelles, et contre les manipulations intentionnelles.

*Ce qui se passe quand on l'ignore:* l'agent exécute les instructions trouvées dans un document au lieu de les traiter comme des données. Le contenu non fiable d'une source externe modifie le comportement de l'agent à l'insu de l'utilisateur.

### 7. Déléguer la granularité ne doit pas faire perdre la capacité de juger

Vous confiez de plus en plus à l'IA. Au début, vous vérifiez de près. Puis, comme «ça a l'air correct», vous relâchez. Six mois plus tard, vous ne comprenez plus assez ce que vous signez pour le défendre devant un client.

C'est pourquoi BASE cherche à rendre la vérification *légère* sans la supprimer: la structure réduit l'effort de contrôle, elle ne remplace pas votre compréhension. Vous pouvez déléguer le détail, jamais la capacité de juger. Recharger régulièrement la vue d'ensemble (relire en profondeur, discuter en équipe de ce qui a été produit et pourquoi) fait partie du travail.

*Ce qui se passe quand on l'ignore:* la vérification devient un tampon. Les erreurs passent: on vérifie encore, mais on a perdu l'intuition de sentir quand une vérification s'impose.

### 8. Ce qu'on ne peut ni emporter ni auditer finit par vous échapper

Votre savoir vit dans un dispositif à plusieurs couches: vos fichiers, et les instructions invisibles de l'outil (prompt système, règles, politiques du fournisseur). Si tout votre contexte est captif d'une interface, et si vous ignorez ce qui façonne réellement le comportement de l'IA, vous opérez sans souveraineté.

C'est pourquoi BASE met votre savoir dans des fichiers lisibles, portables et auditables: vous restez souverain sur votre couche, et vous gardez de quoi partir. La portabilité est une condition de contrôle, pas seulement un confort.

*Ce qui se passe quand on l'ignore:* le jour où l'outil change ses règles, ses prix ou ses conditions, vous découvrez que votre méthode ne vous appartenait pas vraiment.

### Ces nécessités ne sont pas propres à BASE

Elles s'appliquent à toute coordination entre des entités distinctes qui ne partagent pas les mêmes ressources, les mêmes modes de fonctionnement, ni la même façon de se tromper, que ce soit deux humains collaborant à distance, un humain et une IA, ou toute autre configuration. Les outils changent, les modèles changent, ces contraintes structurelles restent.

---

## La dette de vérification

Produire avec l'IA demande désormais peu d'effort; s'assurer qu'une réponse est juste relève d'un autre travail, qui dépend de la tâche: sur les terrains à vérificateur externe (code, maths, schéma) l'erreur se détecte seule et l'IA va loin en autonomie; ailleurs, le vérificateur, c'est vous, et une structure forte rend cette vérification légère plutôt que lourde (sinon, la dette de vérification s'accumule). Cette asymétrie entre produire et vérifier est le constat qui fonde BASE, et c'est elle qui rend la structure indispensable.

Chaque affirmation acceptée sans examen est une dette: une hypothèse non testée qui dort dans vos fichiers. Un devis dont le prix «a l'air correct», une fiche client dont l'adresse est «probablement bonne», une offre d'emploi aux conditions jugées «standard».

La dette s'accumule silencieusement. Elle se révèle au pire moment: quand un client conteste un montant, quand un candidat relève une incohérence, quand un partenaire pointe une erreur.

**Structure forte en amont → vérification légère en aval.** C'est pourquoi BASE structure avant de générer: des fichiers métier à jour, des connaissances précises, des marqueurs explicites. Plus la structure est forte, plus la vérification est légère. Plus la structure est faible, plus la dette de vérification explose.

---

## Anatomie d'un agent

Un agent est composé de 3 éléments principaux, plus des extensions optionnelles:

```
AGENT.md                          La fiche de poste : qui il est, que faire selon la demande
    │
    ├── skills/
    │   ├── processes/            Les workflows : comment faire X pas à pas
    │   └── competences/          Les fiches d'expertise : ce qu'il sait sur le métier
    │
    ├── templates/                Les formulaires : à quoi ressemblent les documents
    │
    └── tools/                    La boîte à outils : scripts, connecteurs (optionnel)
```

> **Pourquoi «agents» et «skills»?** Ce sont les noms les plus répandus aujourd'hui, et les modèles d'IA les reconnaissent nativement: BASE les réutilise par **pragmatisme**. Ce qui compte, c'est ce qu'il y a derrière le vocabulaire:
> - **Une intelligence en texte.** Un agent est un ensemble de fichiers Markdown lisibles, versionnables, portables d'un outil IA à l'autre, sans code ni plateforme propriétaire. Vous restez propriétaire de la structure.
> - **Le savoir-faire séparé du savoir.** BASE distingue délibérément les *processes* (comment faire, pas à pas) des *compétences* (ce qu'il sait, réutilisable). C'est d'abord une question de sécurité: les *processes* sont des consignes que l'agent exécute, les *compétences* et les données métier sont du contenu qu'il consulte sans l'exécuter. Cette séparation, et non le mot «skill», est le vrai apport.

### La fiche de poste (AGENT.md)

Le seul fichier qu'un outil IA a besoin de charger. Il contient:
- **Qui il est**: son rôle et son identité
- **Sa philosophie d'interaction**: proposer, vérifier, confirmer avant d'agir
- **Que faire selon la demande**: un tableau de routage (intention → skill)
- **Quels fichiers il connaît**: la liste des données métier
- **Ses garde-fous**: ce qu'il ne fait jamais

Vous croiserez des fichiers nommés `assistant-devis` ou `assistant-rh` alors que ce sont des agents: c'est voulu. Le fichier porte le nom de l'assistant dont il est la fiche de poste. L'agent, c'est le fichier que vous gardez; l'assistant, c'est ce qu'il devient une fois animé par un modèle.

### Les skills: workflows et connaissances

Tous les skills sont des fichiers texte au format SKILL.md. Ce format est lisible par tous les modèles et reconnu nativement par certains outils IA; dans les autres, l'agent peut ouvrir les fichiers explicitement. Chaque skill a des métadonnées en en-tête (frontmatter YAML) et un contenu en Markdown.

BASE distingue deux types de skills:

**Les processes** (workflows invocables): des conversations structurées que l'utilisateur déclenche. «Créer un devis» → l'agent suit le process étape par étape, avec des reformulations (vérifier la compréhension) et des points de décision (avant chaque action irréversible).

**Les compétences** (connaissances réutilisables): des fiches d'expertise que l'agent consulte quand le workflow ou la demande le justifie. La terminologie des devis, les règles de TVA, les conventions de communication. Les compétences se réutilisent dans plusieurs processes: c'est leur raison d'être.

Trois compétences sont livrées avec chaque agent:
- **Marqueurs**: conventions pour rendre l'état du travail cherchable (`[A VALIDER]`, `[DECISION]`, etc.)
- **Journal**: mémoire entre sessions, entrées écrites à la fin de chaque workflow
- **Communication**: règles de communication avec des utilisateurs non techniques

### Reformulations et points de décision

Deux mécanismes distincts rythment les workflows:

**Reformulation** (légère, friction faible): l'agent résume ce qu'il a compris. L'utilisateur corrige ou confirme. Se tromper n'a pas de conséquence: on ajuste et on continue. Fréquent.

**Point de décision** (critique, friction productive): l'agent est prêt à créer un fichier ou modifier des données. L'utilisateur confirme explicitement. Agir sans confirmation pourrait créer des données incorrectes difficiles à corriger. Rare et important.

La distinction est essentielle. Si chaque étape est un point de décision, l'attention se dilue et le mécanisme perd son pouvoir protecteur. Les reformulations sont légères et fréquentes. Les points de décision sont rares, explicites, et réservés aux moments qui comptent.

### Les marqueurs

Du texte structuré, inséré dans les documents générés, qui rend l'état du travail cherchable. Leur forme fixe en fait des repères qu'un humain repère à l'œil et qu'un script peut traiter automatiquement: les compter, les lister, les regrouper.
- `[A COMPLETER: ...]`: information manquante
- `[A VALIDER: ...]`: proposition en attente de confirmation
- `[ATTENTION: ...]`: risque ou alerte
- `[DECISION: choix | raison]`: choix confirmé par l'humain

Les marqueurs correspondent aux étapes de la boucle de co-pensée: `[A COMPLETER]` apparaît pendant le cadrage, `[A VALIDER]` quand l'agent confie une proposition, `[ATTENTION]` pendant l'évaluation, `[DECISION]` après l'ajustement. Après des mois d'utilisation, ces marqueurs permettent de retrouver instantanément tout ce qui est en attente, tout ce qui a été décidé, et pourquoi.

### Le journal

Mémoire entre sessions. L'agent écrit une entrée à la fin de chaque workflow dans `.ai/journal/`. Quand vous revenez le lendemain, l'agent lit le journal et sait où il en est. Sans journal, chaque session recommence de zéro, et la nécessité 1 est violée.

### Les formulaires (templates) et la boîte à outils (tools)

Modèles de documents que l'agent copie et remplit. Scripts et connecteurs optionnels. Un agent fonctionne très bien sans tools.

---

## Pourquoi des fichiers, pas autre chose?

Les fichiers texte sont un choix structurel délibéré, pas un réflexe technique:

- **Lisibles par les humains ET les machines.** Pas besoin d'un outil spécial pour lire un fichier Markdown. Pas besoin d'une API pour accéder à vos données. Ouvrez le fichier, tout est là.
- **Versionnables.** Avec Git ou simplement avec des copies `_v1`, `_v2`. Chaque changement est traçable. Impossible de perdre une version antérieure.
- **Portables.** Changez d'outil demain: vos fichiers restent. Aucune migration, aucun export, aucune dépendance.
- **Durables.** Les bases de données changent de format. Les APIs disparaissent. Les plateformes ferment. Un fichier texte écrit en 2026 sera lisible en 2046.
- **Auditables.** Un auditeur, un partenaire, un collègue peut ouvrir n'importe quel fichier et comprendre ce qui s'est passé. Pas de boîte noire.

Les outils IA évoluent vite. Les modèles changent. Les interfaces se renouvellent. Mais vos skills, vos templates et vos données métier restent. **Votre structure de connaissances est votre vrai capital.**

Le format SKILL.md est avant tout un contrat textuel lisible. Si un outil le supporte nativement, l'expérience est plus fluide. S'il ne le supporte pas, un SKILL.md reste un fichier Markdown que l'agent peut lire explicitement.

### Configuration outil

Pour que votre outil IA charge l'agent et découvre ses skills avec le moins de friction possible, il faut une configuration spécifique à l'outil. Certains outils automatisent une partie du chargement, d'autres demandent de pointer manuellement vers `AGENT.md`. Chaque outil a besoin de 5 choses:

| Besoin | Ce que c'est | Pourquoi c'est nécessaire |
|--------|-------------|--------------------------|
| **Contexte permanent** | Charger AGENT.md à chaque session | Sans mémoire, l'agent ne sait rien (nécessité 1) |
| **Skills découvrables** | L'outil trouve et invoque les SKILL.md | L'utilisateur tape `/nouveau-devis`, l'outil sait quoi charger |
| **Règles par chemin** | Rappels quand l'agent touche des fichiers sensibles | Les consignes dérivent, les rappels automatiques non (nécessité 4) |
| **Permissions** | Contrôler ce que l'agent peut faire | Bornage mécanique, pas textuel (nécessité 4) |
| **Protection framework** | Réduire ou bloquer la modification de `.ai/` selon l'outil | Les instructions du framework ne doivent pas être modifiées par accident |

Le créateur d'assistant cherche la documentation actuelle de l'outil pour proposer la bonne configuration. Si l'outil n'est pas connu, l'agent guide l'utilisateur pour une configuration manuelle.

### Garde-fous: deux niveaux

**Niveau 1: textuel.** «Ce que tu ne fais jamais» dans AGENT.md. Suffisant pour les conversations courtes et les cas simples.

**Niveau 2: mécanique.** Permissions, protections, règles dans la configuration de l'outil ou actions médiées par un connector BASE. Quand un garde-fou est critique et que les conséquences d'un oubli sont importantes, le niveau mécanique est indispensable. Le niveau 2 ne remplace pas le niveau 1: il le renforce là où le harness le permet.

---

## Construire pas à pas

| Étape | Ce que vous faites | Ce que vous apprenez |
|-------|-------------------|---------------------|
| 1 | Essayez l'exemple `assistant-devis` | Comment un agent fonctionne en pratique |
| 2 | Lisez le `AGENT.md` de l'exemple | Comment une fiche de poste structure le comportement |
| 3 | Lisez un workflow (SKILL.md dans processes/) | Comment une conversation structurée guide l'agent |
| 4 | Créez votre propre agent (avec le créateur d'assistant) | Comment encoder votre expertise métier |
| 5 | Ajoutez un workflow à votre agent | Comment étendre les capacités |

Chaque étape est autonome. Vous pouvez vous arrêter à n'importe quel moment.

---

## Créer votre propre agent

### La voie guidée (recommandée)

Ouvrez le dossier BASE dans votre outil IA et dites:

> «Lis `.ai/agents/createur-agent/AGENT.md` et suis ses instructions»

Ou, si les skills sont déjà découverts:

> `/creer-agent`

Le créateur d'assistant va:
1. Vous poser des questions sur votre métier et vos tâches quotidiennes
2. Identifier vos workflows → il créera les processes
3. Identifier vos connaissances métier → il créera les compétences
4. Identifier vos documents types → il créera les templates
5. Proposer une architecture complète, que vous validez
6. Créer tous les fichiers pour vous
7. Configurer votre outil IA pour le nouvel agent

Aucune compétence technique requise. Tout se fait par la conversation.

### La voie manuelle (pour les autonomes)

Le dossier `.ai/agents/_template/` contient la structure de base avec un guide pas-à-pas.

### L'idée clé

Ce qui rend un assistant IA utile tient moins à la technologie qu'à la **structure des connaissances** que vous lui donnez. Un bon AGENT.md avec de bons skills transforme n'importe quel outil IA en assistant spécialisé. Votre expertise est le multiplicateur. L'IA l'amplifie, mais ne la remplace pas.

---

## Bonnes pratiques

### Vérifier

1. **Vérifier avant de valider.** Une réponse de l'IA reste à contrôler, surtout pour les faits, les prix et les engagements: elle peut être fausse tout en paraissant sûre. Chaque affirmation acceptée sans examen crée une dette de vérification.
2. **Attention aux trois pièges.** La facilité (c'est facile de demander, pas d'obtenir un bon résultat), l'apparence (un texte bien écrit n'est pas forcément correct), et les promesses exagérées des vendeurs. Voir [La co-pensée en pratique](pratiques-co-pensee.md).

### Structurer

3. **Les fichiers sont la vérité.** Si ce n'est pas dans un fichier, l'agent ne le sait pas. Gardez vos fichiers à jour: ils sont la mémoire de votre assistant.
4. **Commencer petit.** Un agent avec 1 workflow qui fonctionne bien vaut mieux que 5 non testés. On peut toujours en ajouter.
5. **Versionner les ressources.** `_v1`, `_v2`, etc. Ça permet de faire évoluer sans casser ce qui fonctionne.
6. **Copier, pas modifier.** Les templates restent intacts dans `.ai/`. L'agent copie et adapte.

### Interagir

7. **Discuter avant d'agir.** L'agent propose, vous validez. Jamais l'inverse.
8. **Une question à la fois.** Les bons workflows avancent pas à pas, pas en bloc.
9. **Résumer régulièrement.** Sur les conversations longues, demandez un résumé de l'état d'avancement pour garder le fil.

---

## Aller plus loin

- **Les principes de la co-pensée**: [La co-pensée en pratique](pratiques-co-pensee.md), 16 principes, 3 guides de décision, tout ce qu'un professionnel devrait savoir
- **Galerie d'idées**: [idees-agents.md](../guides/idees-agents.md), des dizaines d'exemples d'agents par métier
- **Créer votre propre assistant**: dites «Lis `.ai/agents/createur-agent/AGENT.md`»
- **Pas sûr par où commencer?** Dites «Aide-moi à trouver par où commencer». Le diagnostic vous guide
- **Améliorer un assistant existant**: dites «J'aimerais améliorer l'assistant [nom]»

## Les plans d'architecture

Tout BASE tient dans une boussole, des plans qui ne doivent **jamais se confondre**:

> **Texte = vérité · Routeur = choix · Broker = garanties · Index = échelle · MCP = exposition · LLM = orchestration.**

- **Texte = vérité.** Vos fichiers Markdown/JSON sont la source de vérité: lisibles par un humain, versionnés, à vous.
- **Routeur = choix.** Le routeur choisit *quel* agent et *quel* process suivre, ou s'abstient honnêtement. Il vous enlève la charge mentale de chercher le bon process. Le mécanisme reste rudimentaire mais efficace, et s'étend par adaptateurs. Il classe avec des règles inspectables; il n'applique rien et n'invente jamais une route.
- **Broker = garanties.** Le broker est le seul endroit qui applique les invariants (confinement, policy, trace). **Une garantie n'est réelle que pour une action qui passe par lui.**
- **Index = échelle.** Le manifeste, le registre de routage, l'index de recherche sont des **projections**, jamais une autorité. On peut toujours les régénérer depuis le texte (ou les supprimer).
- **MCP = exposition.** Le serveur MCP expose les primitives du broker aux plateformes; il n'orchestre aucune logique métier.
- **LLM = orchestration.** Décider *quoi faire ensuite* revient au modèle dans l'outil, guidé par le texte et les candidats du routeur; ce n'est pas codé en dur dans l'outillage.

**Règle de conception:** un point d'extension doit protéger une frontière réelle. Mettre du vocabulaire métier dans l'index, ou de l'orchestration métier dans le MCP, est une erreur de conception. C'est pourquoi le routage **vit avec le texte** (`use_when`, descriptions) plutôt que dans un catalogue maintenu à la main: un tel catalogue violerait le plan «Texte = vérité».

## Glossaire express

| Terme | Sens |
|-------|------|
| **Agent** | Un fichier d'instructions (`AGENT.md` + ses skills) que vous écrivez et possédez: la fiche de poste, portable d'un outil IA à l'autre. |
| **Assistant** | Votre agent animé par un modèle, côté utilisateur. Vous possédez l'agent, vous utilisez l'assistant, vous louez le modèle. |
| **Skill** | Une compétence de l'agent, au format `SKILL.md`. Deux types: **process** (une façon de faire, étape par étape) et **competence** (une connaissance réutilisable: TVA, ton, marqueurs…). |
| **Template** | Un modèle de document (à quoi ressemble un devis, une offre…). |
| **Tool** | Un outil exécutable (script) que l'agent peut invoquer, en dry-run puis avec confirmation. |
| **Marqueur** | Un repère texte dans vos documents: `[A VALIDER]`, `[A COMPLETER]`, `[ATTENTION]`, `[DECISION]`. |
| **Journal** | La mémoire de travail entre sessions, en fichiers. |
| **Broker** | Le cœur local qui applique les garanties (confinement, validation, policy, trace); la CLI et le MCP passent par lui. |
| **Harness** | L'outil IA dans lequel vous ouvrez votre BASE: un outil capable de lire vos fichiers (par exemple GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code), ou un assistant relié via MCP. |

---

BASE est un framework par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
