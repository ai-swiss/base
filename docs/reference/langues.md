---
schema_version: base.resource.v1
id: langues
type: document
title: Comprendre quelle langue BASE utilise, et où
description: Pourquoi la documentation publique est en français, les spécifications en anglais, et comment les assistants BASE fonctionnent dans n'importe quelle langue.
scope: public
status: active
sensitivity: public
keywords: [langues, francais, anglais, traduction, souverainete, plurilingue, documentation, specifications]
---

# Comprendre quelle langue BASE utilise, et où

Si vous vous demandez pourquoi la documentation est en français alors que les spécifications sont en anglais, cette page vous l'explique en quelques lignes. Elle s'adresse à toute personne qui découvre le projet, y contribue ou souhaite bâtir un assistant: elle dit quelle langue gouverne quoi, et pourquoi vos propres assistants ne sont liés ni à l'une ni à l'autre.

## Le français pour la méthode

La documentation publique (`docs/`, [README](../../README.md), [Manifeste](../../MANIFESTO.md)) est en français. C'est la langue de la méthode: celle dans laquelle BASE explique pourquoi structurer la collaboration avec l'IA, comment vérifier, comment garder la souveraineté sur ses fichiers. Dans un pays plurilingue, écrire la méthode dans une langue nationale la rapproche de ses lecteurs.

## L'anglais pour le contrat technique

Les spécifications d'ingénierie ([`specs/`](../../specs/current/README.md)) sont en anglais, la langue du contrat technique. Les exigences, les invariants et les décisions d'architecture y sont reliés au code et aux tests; ils s'adressent aux contributeurs et aux mainteneurs, dont l'anglais est la langue de travail. La précision d'un contrat d'ingénierie pâtit des traductions approximatives: une seule version normative, en anglais, prévient les divergences.

## Vos assistants parlent la langue de leurs utilisateurs

Les assistants construits avec BASE ne sont attachés à aucune langue en particulier. Le routage par défaut est lexical: il compare les mots normalisés d'une demande à ceux de vos propres fichiers, sans s'appuyer sur la grammaire ni le lexique d'une langue donnée. Un assistant déclaré avec des mots-clés allemands, italiens ou anglais route dans cette langue. La langue de la documentation du cadre n'impose rien à celle de vos assistants.

Une nuance, parce qu'un routage lexical apparie des mots: il route dans la langue où vos signaux sont écrits, et une demande formulée dans une autre langue que vos fichiers n'y correspond pas. C'est le **niveau zéro**, déterministe et reproductible (aucun modèle, aucun appel réseau): un plancher testable et une confirmation, pas le routage le plus fin. Dès qu'un modèle lit vos fichiers, la langue cesse d'être une contrainte: dans un harnais, l'assistant descend l'index et les `AGENT.md`/`SKILL.md` quelle que soit la langue de la demande (et vous pouvez changer de langue en cours de route), et le routage sémantique optionnel, par embeddings, franchit lui aussi les langues. L'appariement à la langue ne pèse donc que sur le plancher lexical déterministe (`base route`, ou l'outil MCP `route_request` sans embeddings), pas sur la découverte progressive menée par le modèle.

## Qui lit quoi

| Profil | Langue | Porte d'entrée |
| ------ | ------ | -------------- |
| Utilisateur, créateur d'assistant, décideur | Français | [README](../../README.md), [Lire dans quel ordre](../start/lire-dans-quel-ordre.md) |
| Responsable conformité, institution | Français | [Souveraineté, confiance et conformité](../trust/souverainete-et-confiance.md) |
| Développeur, intégrateur, auditeur technique | Anglais | [Spécification courante](../../specs/current/README.md) |
| Contributeur au cadre | Les deux | [CONTRIBUTING](../../CONTRIBUTING.md) |

## Traductions

Existent déjà: le [README en anglais](../../README.en.md), le **miroir anglais intégral de la documentation** (`docs/en/`, chaque page synchronisée sur sa source française par une empreinte `fr-synced` vérifiée en intégration continue), ainsi que le manifeste en [anglais](../../MANIFESTO.en.md), [allemand](../../MANIFESTO.de.md) et [italien](../../MANIFESTO.it.md). Les autres traductions (un `README.de.md`, un dossier `docs/de/` par langue) comptent parmi les contributions les plus bienvenues. La convention figure dans [CONTRIBUTING](../../CONTRIBUTING.md): garder la sobriété de l'original, ne pas traduire les identifiants techniques et rappeler en tête de fichier que **la version française fait foi**.

---

BASE est un cadre porté par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
