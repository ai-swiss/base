# Corpus d'essai de la porte «Partir de ce que vous avez»

Quatre points de départ, un dossier chacun, tous inventés pour ces essais. Le script
`tools/eval/parcours-partir-de-l-existant.mjs` les copie un à un dans un dossier jetable, joue le
prompt de la porte dans Claude Code et contrôle la fiche obtenue. Pour jouer d'autres dossiers,
gardés hors du dépôt, passez leur dossier parent avec `--corpora`.

| Dossier | Point de départ |
|---|---|
| `besoins-cabinet/` | des besoins décrits: la transcription d'une réunion d'un cabinet vétérinaire |
| `procedures-fiduciaire/` | des documents de travail non pensés pour l'IA: procédures, modèle de lettre, barème |
| `structure-ia/` | une structure déjà pensée pour l'IA: un `CLAUDE.md`, une règle Cursor, deux documents, sans `base.config.json`; deux règles du `CLAUDE.md` sont des évidences qu'un modèle applique de lui-même, pour éprouver le tri |
| `vide/` | rien: la porte doit passer la main à «Diagnostic» sans écrire de fiche |
