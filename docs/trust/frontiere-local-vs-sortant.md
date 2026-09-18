---
schema_version: base.resource.v1
id: docs-trust-frontiere-local-vs-sortant
type: document
title: La frontière, local par défaut
description: Ce qui reste local, quand une fiche confidentielle est bloquée avant un modèle distant, et pourquoi `sensitivity` seul ne commande pas cette retenue.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [local, reseau, embeddings, egress, modele distant, fournisseur, trace, confidentialite, fiche confidentielle, bloquer, sensitivity, confidential]
---

# La frontière, local par défaut

Savoir ce qui reste sur votre machine et ce qui peut partir vers un service distant, c'est savoir ce que vous pouvez confier à BASE en connaissance de cause. Cette page trace cette frontière, à l'usage d'une institution qui doit savoir à quoi s'attendre. Le propos est informatif: il ne constitue ni un avis juridique ni un avis de conformité, et l'institution reste responsable de sa propre analyse d'impact (DPIA) et de sa politique de sécurité.

Le [glossaire](../reference/glossaire.md) fixe le sens de «mécanisme» et «consigne». Cette page applique cette distinction à la frontière entre traitement local et transmission distante.

## 1. Ce qui est local par défaut

En configuration par défaut, le cœur de BASE ne contacte aucun service distant. L'outil IA utilisé au-dessus de BASE conserve sa propre politique réseau.

- **Le modèle route en lisant la carte locale.** C'est le chemin normal dans un outil IA: le modèle lit les «Quand l'utiliser» et «Éviter si», puis décide ou s'abstient. Le routeur lexical local fournit le plancher déterministe pour les appels sans modèle et les tests; son résultat n'est qu'une indication à vérifier lorsqu'un modèle est présent.
- **BASE conserve les ressources en local.** Le cœur n'appelle pas de lui-même un fournisseur. Un outil IA qui ouvre ces fichiers peut toutefois les transmettre selon sa propre configuration.
- **Le journal `.ai/trace` est local et best-effort.** Les points instrumentés tentent d'inscrire une ligne sans contenu métier par défaut. Ce journal n'est pas une piste exhaustive. Voir la section qui lui est consacrée plus bas.

Que vos fichiers restent locaux ne signifie pas que tout ce que vous confiez ensuite à un outil IA le reste. Le contenu d'une conversation, ou d'un fichier ouvert dans un outil IA, peut être transmis au fournisseur de cet outil. C'est l'objet des deux sections suivantes.

## 2. Ce qui peut sortir vers un fournisseur IA, seulement sur choix explicite {#2-ce-qui-ne-peut-sortir-que-sur-choix-explicite}

Deux chemins peuvent transmettre du texte à un service distant, chacun sous une autorité distincte.

- **La Voie 2 livrée, si vous l'activez.** Elle peut envoyer la requête et les seuls textes de routage des candidats à des modèles configurés. L'intégration sur mesure du paquet sémantique a un périmètre par défaut plus large, qui peut inclure le corps des ressources. Une exécution locale avec Ollama évite la transmission à un fournisseur distant. Le détail exact des deux périmètres figure dans [Sécurité et données du routage](securite-donnees-routage.md).
- **L'appel au modèle lui-même.** L'appel au modèle de langage est effectué par l'outil IA que vous utilisez (la CLI, l'extension ou l'application), vers le fournisseur que l'institution a choisi. Cet appel a lieu **en dehors de BASE**: le choix du modèle et du fournisseur, comme les traitements côté fournisseur, échappent au périmètre de BASE. Avant de traiter des données personnelles, clients, RH, financières, médicales ou réglementées, vérifiez les conditions d'utilisation, les options de rétention, les garanties contractuelles et la localisation des traitements de cet outil.

## 3. Une fiche confidentielle est-elle bloquée avant un modèle distant? `sensitivity` ou `confidential` {#3-sous-quelle-autorite}

La frontière est gardée à deux endroits, par deux autorités distinctes.

- **L'institution choisit le modèle et le fournisseur.** Ce choix est externe à BASE. BASE ne sélectionne pas de modèle, n'impose pas de fournisseur et ne se substitue pas à la politique de l'institution.
- **Le contrôle d'égress du broker retient les ressources confidentielles ou strictement locales avant un appel à un modèle distant.** Une ressource marquée confidentielle, ou une racine déclarée locale uniquement, n'est pas transmise par ce chemin. Le mécanisme ne contrôle ni ce que l'utilisateur saisit directement dans un outil IA hors BASE, ni ce que le fournisseur fait ensuite des données reçues.

Un exemple concret. Une fiche client contient un IBAN; vous la marquez `confidential`. Vous demandez à votre assistant, relié au broker, de rédiger un rappel de paiement avec un modèle distant. Avant l'appel, le contrôle détecte le drapeau et retient la fiche: son contenu n'est pas transmis au fournisseur par ce chemin. L'assistant travaille alors sans cette source.

**Portée exacte du mécanisme.** Le serveur MCP, le chat du Studio et l'évaluation transmettent un contexte d'égress au broker. La Voie 2 livrée ajoute une barrière de stratégie quel que soit l'appelant, y compris depuis `base route`: si ses modèles sont distants, une racine `local-only` reste sur le plancher lexical, et les ressources `confidential` sont retirées des candidats qui pourraient atteindre le raffineur. En revanche, une lecture directe, `base open` sans contexte d'égress ou un copier-coller vers un outil IA ne déclenche pas cette retenue. Par ailleurs, la retenue dépend du **drapeau explicite `confidential`** d'une ressource ou d'une racine locale uniquement, non de la taxonomie `sensitivity`: une donnée classée `restricted` ou `sensitive`, mais non marquée `confidential`, n'est pas retenue. Enfin, le **défaut est permissif**: sauf déclaration contraire, une racine relève de la politique d'égress `any`.

En résumé, l'institution décide où vont les données au niveau du fournisseur; sur les chemins médiés, le broker retient une ressource explicitement confidentielle ou locale avant l'appel à un modèle distant.

## Le journal de trace

Le journal `.ai/trace` fournit un indice opérationnel local, best-effort et non exhaustif. Il ne constitue ni un journal d'audit complet ni une preuve d'absence d'activité.

- **Ce qu'il tente d'enregistrer.** Les points instrumentés peuvent inscrire une ligne JSONL minimale: chemins, identifiants, décisions, durées. Par défaut, **aucun contenu métier** n'est enregistré.
- **Ce qui peut manquer.** Une action hors broker, un point non instrumenté ou un échec d'écriture peut ne laisser aucune ligne. La trace ne bloque jamais le travail si son écriture échoue.
- **Où il vit.** Le journal est local, dans le dossier `.ai/trace/` du projet. BASE ne le transmet à aucun service distant, et ce dossier est ignoré par git.
- **Comment le purger.** Vous pouvez vider le journal avec `base trace clear`, ne conserver que les N derniers jours avec `base trace prune --keep-days N`, ou, en dernier recours, supprimer le dossier `.ai/trace/` à la main.

La rétention de ce journal n'incombe pas à BASE. Elle relève de l'opérateur ou de l'institution: en fixer la durée de conservation, la purge et, le cas échéant, l'archivage relèvent de votre politique interne. BASE ne fournit ni rétention réglementaire ni archivage légal.

## Limites à garder en tête

- BASE n'est ni un runtime d'agents, ni un moteur d'orchestration, ni un système RAG, ni une plateforme, ni un IAM, DLP, SIEM, RBAC. Il ne fournit ni rétention réglementaire, ni archivage légal.
- BASE ne garantit ni l'exactitude des réponses du modèle, ni les traitements réalisés par le fournisseur IA.
- Les mécanismes d'égress et de confinement s'appliquent aux actions médiées par le broker. Une action qui contourne BASE dépend des droits natifs de l'outil et de l'environnement.

Pour le modèle de sécurité complet et les limites par niveau d'adoption, voir [Sécurité et limites](securite-et-limites.md). Pour le détail des chaînes envoyées en routage sémantique, voir [Sécurité et données du routage](securite-donnees-routage.md).
