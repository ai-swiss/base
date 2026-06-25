# Matrice des outils BASE

<!-- Généré par `base build`. Déclaration honnête des garanties atteignables quand l'action passe vraiment par BASE. -->

Niveaux: 0 non supporté · 1 advisory (guide/audit) · 2 médiation partielle · 3 strict (médié).

Règle d'honnêteté: cette matrice indique le niveau maximal atteignable par garantie quand
l'action passe vraiment par BASE (CLI, broker, MCP ou connector configuré). Une action qui
contourne BASE reste au niveau natif du harness.

| Garantie | claude-code | cursor | chatgpt (mcp) | générique |
| --- | --- | --- | --- | --- |
| Confinement des chemins (accès médié) | 3 | 3 | 3 | 1 |
| Confirmation avant écriture (propose/commit) | 3¹ | 2 | 3¹ | 1 |
| Exécution d'outil (dry-run + confirm) | 3¹ | 2 | 3¹ | 1 |
| Découverte native des skills | 3 | 2 | 1 | 1 |
| Hooks / garde-fous mécaniques | 3² | 2² | 0 | 0 |

¹ Niveau 3 uniquement pour les actions routées par le broker BASE (`propose`/`commit`, `invoke`).
Une écriture ou exécution qui contourne le broker reste advisory.
² Niveau atteignable seulement si le harness est configuré pour router les actions concernées
vers le broker ou un hook. BASE ne livre pas ces hooks pour tous les harnesses.
