---
schema_version: base.resource.v1
id: docs-trust-verrous-hors-de-base
type: document
title: Verrous hors de BASE
description: Ce qui empêche vraiment un assistant de faire ce qu'il ne doit jamais faire, du plus solide au plus fragile, ce qu'il faut régler dans l'outil et la façon d'essayer un verrou.
scope: public
status: active
sensitivity: public
license: CC-BY-4.0
keywords: [verrou, bac à sable, permissions, injection, moindre privilège, egress, confiance]
---

# Verrous hors de BASE

Une ligne rouge écrite dans un process est une consigne. BASE applique ses propres mécanismes sur les chemins qui passent par lui ([Mécanismes vs consignes](mecanismes-vs-consignes.md)). Cette page rassemble ce qui tient ailleurs: dans le système d'exploitation, dans l'outil d'IA, dans les systèmes que l'assistant touche. Le niveau à viser dépend de ce que coûterait une seule erreur.

## Du plus solide au plus fragile

1. **L'information hors d'atteinte.** Un code ou un IBAN que l'assistant ne peut atteindre par aucun chemin (le dossier, le reste du disque, un connecteur, une variable d'environnement, la mémoire de l'outil) ne peut ni fuir ni être modifié par lui. Ce verrou protège la donnée; il ne borne aucune action.
2. **Le contrôle dans le système externe.** La banque exige deux signatures, le compte de messagerie ne peut qu'écrire des brouillons, l'utilisateur de la base de données n'a que la lecture. L'assistant peut tout tenter: l'autre système refuse. Ce niveau tient tant que l'accès confié à l'assistant est lui-même limité, et une double signature tant que la seconde personne relit vraiment.
3. **Le bac à sable du système d'exploitation.** Le système refuse une écriture ou une connexion interdite, quelle que soit la commande qui la tente.
4. **Les permissions de l'outil d'IA.** Elles règlent ses outils intégrés (lire, écrire, chercher sur le web). Sans bac à sable, une commande les contourne: un petit script écrit là où l'outil d'écriture est interdit.
5. **La consigne.** Ce qu'on demande au modèle. Elle suffit quand une erreur coûte peu.

## Retirer une des trois conditions

Un assistant qui réunit des données privées, des contenus non fiables (un e-mail, une page web, un document reçu) et un moyen de communiquer vers l'extérieur peut être amené, par une consigne cachée dans ces contenus, à envoyer les données à un tiers. Aucune consigne ne l'en empêche de façon sûre. Retirez une des trois conditions: aucune donnée sensible à portée de l'assistant, aucun contenu externe soumis au modèle (une relecture humaine ne voit pas un texte caché), ou aucun moyen de communiquer vers l'extérieur (réseau, connecteur, envoi, dossier synchronisé, lien ou image affichés dans la réponse). Une consigne cachée peut encore provoquer une modification ou une action trompeuse: les verrous ci-dessus restent nécessaires.

## Ce qu'il faut régler dans l'outil

Quand l'outil offre un bac à sable, il couvre en général les commandes qu'il lance, pas ses propres outils de lecture et d'écriture. Dans Claude Code, par exemple, le bac à sable entoure les commandes, tandis que l'édition de fichiers obéit aux permissions: un verrou solide règle les deux. Ensuite:

- **Les chemins**: ceux que l'assistant ne doit jamais modifier, et ceux qu'il ne doit pas lire.
- **Le réseau**: une liste de destinations autorisées qui commence vide.
- **Les échappatoires**: aucune commande relancée hors du bac à sable, aucun démarrage sans lui quand il ne peut pas s'activer, aucun mode qui saute les confirmations.
- **La configuration elle-même**: imposée au lancement ou par l'organisation, pour qu'un fichier du dossier ne puisse pas l'assouplir.

Sans bac à sable, les permissions tiennent pour les outils intégrés et une commande les contourne: restent l'information hors d'atteinte (hors de la machine, ou dans un compte que l'outil ne lit pas) et le contrôle du système externe. Pour isoler tout le travail, un conteneur jetable ou une machine virtuelle sans vos identifiants est la solution la plus nette.

## Ce qu'un bac à sable ne couvre pas

- Les extensions de l'outil (serveurs de connecteurs, scripts déclenchés automatiquement) tournent souvent hors du bac à sable: chacune ouvre une porte de plus.
- Une destination réseau autorisée reste un canal de sortie. Une liste vide vaut mieux qu'une liste large.
- Les secrets placés dans les variables d'environnement suivent les commandes. Gardez-les hors de la session.
- Une personne peut lancer l'outil sans ses réglages. Pour une équipe, imposez-les par la configuration de l'organisation.

## Les filets qui restent

- **Des accès à moindre privilège.** Un jeton d'accès limité à ce que fait l'assistant, à durée courte et avec un plafond de dépense. Un accès en lecture à des exports plutôt qu'à la base de production.
- **La réversibilité.** Un dossier versionné, des sauvegardes, une branche protégée: une modification se répare. Une donnée sortie ou un message envoyé, non.
- **La trace.** Un journal des actions, tenu par le système plutôt que par le modèle.

## Essayer un verrou

Un verrou qu'on n'a jamais vu refuser compte comme une consigne. Essayez chaque verrou une fois, sur une cible sans conséquence (un fichier d'essai, un compte fictif), par plusieurs chemins: l'outil d'écriture intégré, un script, une copie de fichier, une requête réseau. Notez le refus constaté, et recommencez après une mise à jour de l'outil. Un refus ferme le chemin essayé; il ne prouve pas qu'aucun autre n'existe.

## Prochaine action

Dressez la liste des lignes rouges de votre assistant, notez pour chacune ce que coûterait une seule erreur, puis choisissez le niveau le plus haut que vous pouvez atteindre. Le process «Créer un agent» dresse ce tableau avec vous au moment de configurer l'outil.
