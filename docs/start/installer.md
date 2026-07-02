# Installer un espace de travail IA

Installer un espace de travail local, c'est garder vos agents et votre contexte dans votre dossier, sous votre contrôle, plutôt que dans une plateforme web. Il vous faut pour cela choisir un outil et y consacrer quelques minutes. Cette page vous oriente vers le guide adapté à votre situation; chacun est court et se suffit à lui-même. BASE fonctionne avec la plupart des outils IA capables de lire vos fichiers Markdown.

## Votre situation, votre page

| Votre situation | Suivez |
| --- | --- |
| Vous voulez que votre IA installe pour vous | [Faites installer BASE par votre IA](installer-par-votre-ia.md) |
| Vous préférez une interface graphique: plusieurs outils conviennent (Cursor, Antigravity, GitHub Copilot, OpenCode…), et BASE n'en privilégie aucun | [Installer Cursor](installer-cursor.md) |
| Vous êtes à l'aise dans un terminal | [Installer Claude Code](installer-claude-code.md) |
| Vous voulez connecter ChatGPT, Claude Desktop ou une autre plateforme à vos agents | [Installer le serveur MCP](installer-mcp.md) |
| Vous n'avez qu'un navigateur, rien à installer | [Essayer BASE sans rien installer](essayer-sans-installer.md) |
| Vous voulez voir, évaluer et soigner votre BASE | `base studio --root mon-dossier` (l'atelier graphique) |
| Vous n'avez pas encore le dépôt | [Obtenir BASE](obtenir-base.md) |

La plupart des outils IA capables de lire vos fichiers conviennent également (par exemple GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code): dites-leur «Lis `.ai/agents/[nom-agent]/AGENT.md` et suis ses instructions». Certains reconnaissent nativement les skills au format `SKILL.md`; sinon, l'agent les charge à la demande, en les lisant comme de simples fichiers Markdown.

## Prérequis communs

- **Un outil IA capable de lire vos fichiers**: l'outil lui-même suffit.
- **CLI BASE ou serveur MCP**: Node 18 ou plus. C'est la seule dépendance du cœur.
- **BASE Studio (l'atelier)**: rien d'autre. `base studio` installe ses dépendances au premier lancement et ouvre votre navigateur.

> **Votre outil IA est l'expérience; Studio est l'atelier.** Au quotidien, vous travaillez dans vos fichiers, avec votre outil habituel; Studio sert à bâtir, évaluer et soigner ce qu'ils contiennent.

## Pourquoi un espace de travail local?

Vos fichiers, vos instructions et votre contexte demeurent dans votre dossier, sous votre contrôle, au lieu de résider sur une plateforme web. Selon l'outil choisi, le contenu envoyé au modèle peut néanmoins transiter par le fournisseur IA; vérifiez les conditions applicables avant de confier des données sensibles.

## Et ensuite?

- Premier succès en 5 minutes: [Démarrage express](quickstart.md).
- Créer votre propre assistant: ouvrez le dossier principal de BASE et dites «Lis `.ai/agents/createur-agent/AGENT.md` et suis ses instructions». Le créateur vous guide de A à Z et propose la configuration adaptée à votre outil.

---

BASE est un cadre porté par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
