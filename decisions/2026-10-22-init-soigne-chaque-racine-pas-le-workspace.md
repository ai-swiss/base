---
schema_version: base.resource.v1
id: decision-init-soigne-chaque-racine-pas-le-workspace
type: document
title: base init soigne chaque racine, jamais le dossier d'un workspace
description: "Dans un workspace, chaque racine porte son propre point d'entrée et se soigne par base init --root <racine>; le dossier du workspace ne reçoit rien d'office, et base doctor y renvoie vers les racines."
scope: public
status: active
sensitivity: public
doc_role: decision
audience: [developer, maintainer]
learning_level: advanced
related: [decisions-index]
---

# base init soigne chaque racine, jamais le dossier d'un workspace

## Status

Accepted. Décidée le 9 juillet 2026, écrite le 22 octobre 2026 pour les issues #12 et #14 et la PR #13.

## Context

Un workspace (`base.workspace.json`) fédère des racines autonomes, par exemple un dossier par client. Sur une racine existante, `base init` propose les fichiers d'outil qui manquent, sans rien écraser (FR-INIT-004). Sur le dossier d'un workspace, il répond «rien à initialiser»: le plan d'un workspace est vide (FR-INIT-002).

Les issues #12 et #14 ont relevé la tension. `base doctor`, lancé sur une sous-racine sans point d'entrée, signale `missing_tool_artifacts` (FR-DOCTOR-001), et la personne qui lance ensuite `base init` sur le dossier du workspace n'obtient rien. La PR #13 proposait d'étendre le soin de racine au dossier du workspace.

Deux contraintes bornent le choix. Un outil d'IA lit le point d'entrée du dossier qu'on ouvre, et dans un workspace on ouvre une racine. Et `init` ne crée rien d'office dans les dossiers de la personne: chaque fichier est proposé, puis écrit seulement avec `--yes`.

## Decision

Le harnais vit par racine. `base init --root <racine> --tool <outil>` propose le point d'entrée de chaque racine qui n'en a pas (`runInit`, branche `root`), et le dossier du workspace ne reçoit aucun fichier généré. S'il en porte un, c'est un court fichier écrit à la main qui renvoie vers ses racines, comme `exemples/agence-multi-clients/CLAUDE.md`.

`base doctor`, lancé sur un dossier qui porte `base.workspace.json` et aucun point d'entrée, renvoie vers les racines listées au lieu de conseiller un `base init` qui ne peut pas agir à cet endroit (`diagnoseData`, conseil de `missing_tool_artifacts`).

## Consequences

- Le signal de `doctor` sur une sous-racine sans point d'entrée est voulu: une sous-racine est une racine.
- Chaque racine se soigne et se teste seule, avec le même code que hors workspace.
- Une personne qui ajoute dix clients lance `init` dix fois. C'est le prix accepté pour qu'aucun fichier n'apparaisse dans un dossier qu'elle n'a pas désigné.
- Le soin par racine devient une obligation tenue par un test (`tests/base-cli-init.test.mjs`): `--tool` sur une racine sans point d'entrée propose celui de cet outil. La 1.5.0 l'avait cassé; la 1.5.2 le rétablit.

## Alternatives considered

| Option | Verdict | Why |
|---|---|---|
| Soigner le dossier du workspace comme une racine (PR #13) | Rejected | Il y déposerait `.ai/tools.md` et le `BASE_BOOTSTRAP.md` générique, faits pour un BASE qui a des agents, dans un dossier qui n'en a aucun; et les sous-racines, celles que `doctor` signale, resteraient sans point d'entrée. |
| `init` sur le workspace soigne toutes ses racines d'un coup | Rejected | Il écrirait dans des dossiers que la personne n'a pas ouverts, et un même outil serait imposé à chaque client. |
| `doctor` exempte les sous-racines | Rejected | Une sous-racine sans point d'entrée reste invisible pour l'outil qu'on y ouvre: taire le signal masquerait un vrai défaut. |
