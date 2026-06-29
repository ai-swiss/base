# Savoir quelles garanties vous obtenez selon votre outil

Vos fichiers BASE fonctionnent dans tout outil IA capable de les lire (par exemple GitHub Copilot, Antigravity, Claude Code ou Cowork, OpenCode, Kilo Code), comme dans une plateforme web IA standard via MCP (par exemple ChatGPT, Claude, Gemini), mais **les garanties varient d'un outil à l'autre**. Cette page vous dit sans détour ce que chaque harness protège réellement, afin que vous choisissiez votre niveau de confiance en connaissance de cause.

> Règle d'honnêteté: une garantie n'est **stricte** que pour les actions qui passent par BASE (sa CLI, son broker, son serveur MCP ou un connecteur contrôlé). Une action qui **contourne** BASE, par exemple un agent qui écrit directement dans un fichier, reste au niveau natif du harness.

## Trois niveaux

- **advisory** (1): BASE guide et trace, mais l'outil peut passer outre.
- **médiation partielle** (2): certaines actions passent par BASE, d'autres non.
- **strict** (3): l'action est médiée; pour toute action routée par BASE, le broker est le passage obligé.

## Matrice

Cette matrice est **générée** depuis le noyau (`base build tools`), ce qui la maintient synchronisée avec la déclaration du cadre. Elle indique le **niveau maximal atteignable** lorsque l'action passe effectivement par BASE et que le harness est configuré en ce sens. Elle ne mesure pas pour autant l'état réel de votre installation.

| Garantie | claude-code | cursor | chatgpt (mcp) | générique |
| --- | --- | --- | --- | --- |
| Confinement des chemins (accès médié) | 3 | 3 | 3 | 1 |
| Confirmation avant écriture (`propose`/`commit`) | 3¹ | 2 | 3¹ | 1 |
| Exécution d'outil (dry-run + confirmation) | 3¹ | 2 | 3¹ | 1 |
| Découverte native des skills | 3 | 2 | 1 | 1 |
| Hooks / garde-fous mécaniques | 3² | 2² | 0 | 0 |

¹ Niveau 3 réservé aux actions routées par le broker BASE (`propose`/`commit`, `invoke`). Une écriture ou une exécution qui contourne le broker reste advisory.

² Niveau atteignable à la seule condition que le harness soit configuré pour router les actions concernées vers le broker ou un hook. BASE ne fournit pas ces hooks pour tous les harnesses.

## Ce que cela implique

- **Pour un usage personnel**, le mode advisory suffit: de toute façon, vous relisez et validez.
- **Pour une équipe ou une organisation**, faites passer les actions sensibles par le broker (CLI, MCP) ou un hook, et configurez une policy stricte (`base.config`). C'est alors que les garanties deviennent réelles.
- **Le serveur MCP** offre l'enforcement le plus étanche, puisque l'agent n'a accès qu'aux outils et jamais directement aux fichiers; c'est aussi celui qui demande le plus de mise en place; voir [serveur MCP](../../mcp/).

Pour le détail d'ingénierie (le port `PolicyEnforcer`, le tracé exact de la frontière), voir `specs/current/10_core/policy.md`.

---

BASE est un cadre porté par [AI Swiss](https://a-i.swiss). Cas d'usage en partenariat avec [Innovaud](https://innovaud.ch).
