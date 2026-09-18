---
schema_version: base.resource.v1
id: installer
type: document
title: Installer un espace de travail IA
description: "Choisir et installer un espace de travail local où l'IA lit vos fichiers: la page d'orientation vers le guide adapté (Cursor, Claude Code, autre outil, ou serveur MCP)."
scope: public
status: active
sensitivity: public
keywords: [installer, installation, espace, travail, outil, poste, local]
---

# Installer un espace de travail IA

Installer un espace de travail local, c'est garder vos agents et votre contexte dans votre dossier, sous votre contrôle, plutôt que dans une plateforme web. Il vous faut pour cela choisir un outil et y consacrer quelques minutes. Cette page vous oriente vers le guide adapté à votre situation; chacun est court et se suffit à lui-même. BASE fonctionne avec la plupart des outils IA capables de lire vos fichiers Markdown.

## Choisir votre installation: Cursor, Claude Code, MCP ou navigateur {#votre-situation-votre-page}

| Votre situation | Suivez |
| --- | --- |
| Vous voulez que votre IA installe pour vous | [Faites installer BASE par votre IA](installer-par-votre-ia.md) |
| Vous préférez une interface graphique: plusieurs outils conviennent (Cursor, Antigravity, GitHub Copilot, OpenCode…), et BASE n'en privilégie aucun | [Installer Cursor](installer-cursor.md) |
| Vous êtes à l'aise dans un terminal | [Installer Claude Code](installer-claude-code.md) |
| Vous voulez connecter ChatGPT, Claude Desktop ou une autre plateforme à vos agents | [Installer le serveur MCP](installer-mcp.md) |
| Vous n'avez qu'un navigateur, rien à installer | [Essayer BASE sans rien installer](essayer-sans-installer.md) |
| Vous voulez voir, évaluer et soigner votre structure BASE | [Faites installer BASE par votre IA](installer-par-votre-ia.md), puis lancez `cd mon-dossier && node .ai/base.mjs studio --root .` |
| Vous n'avez pas encore le dépôt | [Obtenir BASE](obtenir-base.md) |

La plupart des outils IA capables de lire vos fichiers conviennent également (par exemple GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code): dites-leur «Lis `.ai/agents/[nom-agent]/AGENT.md` et suis ses instructions». Certains reconnaissent nativement les skills au format `SKILL.md`; sinon, l'agent les charge à la demande, en les lisant comme de simples fichiers Markdown.

## Prérequis communs

- **Un outil IA capable de lire vos fichiers**: l'outil lui-même suffit.
- **Cœur et CLI de l'implémentation de référence**: [Node 18 ou plus](https://nodejs.org), un terminal et une commande `node` accessible dans le `PATH` (`node --version` permet de vérifier).
- **Serveur MCP**: Node 18.14.1 ou plus, avec `node` et `npm` accessibles dans le `PATH`.
- **BASE Studio (l'atelier)**: lancez une fois `npm ci` dans le clone de BASE. Après l'initialisation, lancez `cd mon-dossier && node .ai/base.mjs studio --root .`; Studio ouvre votre navigateur. Le lanceur `.ai/base.mjs` n'installe pas la commande courte `base`.

> **Votre outil IA est l'expérience; Studio est l'atelier.** Au quotidien, vous travaillez dans vos fichiers, avec votre outil habituel; Studio sert à bâtir, évaluer et soigner ce qu'ils contiennent.

## L'assistant ignore les instructions du dossier: quatre pièges d'environnement {#quatre-pieges-d-environnement}

Ils ne viennent pas de BASE, mais ils coûtent chacun une demi-heure la première fois.

- **Lancez votre outil depuis le dossier.** Un outil démarré ailleurs ne lit pas le point d'entrée du dossier et se comporte comme s'il n'existait pas. Ouvrez le dossier, puis l'outil.
- **Déverrouillez une fois votre clé protégée par phrase secrète, dans un vrai terminal.** Un assistant qui lance une commande n'a pas d'endroit où taper votre phrase secrète: la commande reste bloquée sans message utile. Faites le premier accès vous-même, l'agent système garde la clé ouverte ensuite.
- **Authentifiez-vous auprès de votre hébergeur avant de toucher aux réglages du dépôt.** GitHub, GitLab, Forgejo ou autre: chacun a sa commande d'authentification, et les réglages (branches protégées, droits) ne répondent pas tant qu'elle n'a pas été passée. La documentation de votre hébergeur donne la commande exacte; elle change plus vite que cette page.
- **Vérifiez l'organisation distante avant le premier envoi.** Un dépôt créé par défaut sous votre compte personnel, alors qu'il devait vivre dans celui de votre organisation, se corrige d'autant plus difficilement qu'il a déjà servi. Regardez l'adresse distante avant d'envoyer, pas après.

## Pourquoi un espace de travail local?

Vos fichiers, vos instructions et votre contexte demeurent dans votre dossier, sous votre contrôle, au lieu de résider sur une plateforme web. Selon l'outil choisi, le contenu envoyé au modèle peut néanmoins transiter par le fournisseur IA; vérifiez les conditions applicables avant de confier des données sensibles.

## Et ensuite?

**Prochaine action:** dans le tableau, ouvrez le guide de la première ligne qui décrit votre situation.

---

BASE est une convention ouverte accompagnée d'une implémentation de référence, portée par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
