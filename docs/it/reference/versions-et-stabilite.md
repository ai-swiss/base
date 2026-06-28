<!-- fr-synced: 6542bdf34420104d7e76c1b61c41528360c5f58e -->

# Aggiornare BASE senza rompere il vostro lavoro

Questa pagina si rivolge a coloro che costruiscono su BASE: un professionista indipendente, una PMI, una scuola o un'amministrazione. Indica ciò che la versione 1.x garantisce e ciò che può ancora evolvere, affinché possiate adottare BASE e aggiornarlo senza temere che una nuova versione rompa ciò che avete costruito.

## Versionamento semantico

A partire dalla **1.0**, BASE segue il [Semantic Versioning](https://semver.org/lang/fr/):

- **MAJOR** (`2.0.0`): un cambiamento incompatibile della superficie pubblica stabile (qui sotto).
- **MINOR** (`1.1.0`): aggiunte retrocompatibili (nuovi comandi, nuovi campi opzionali, nuovi punti di estensione).
- **PATCH** (`1.0.1`): correzioni retrocompatibili.

## Cosa garantisce la 1.x (superficie stabile)

Questi elementi non cambiano in modo incompatibile senza un incremento **major**:

- **Il formato delle risorse**: la frontmatter `schema_version: base.resource.v1`, i suoi campi e i suoi valori `type`. Un file valido oggi rimane valido.
- **I comandi CLI esistenti**: `validate`, `index`, `inventory`, `discover`, `route`, `route-test`, `open`, `access`, `invoke`, `propose`, `commit`, `promote`, `markers`, `trace`, `build` ed `entretien`, con i loro flag documentati.
- **Gli strumenti MCP esistenti**: i loro nomi e i loro parametri.
- **Gli schemi delle proiezioni**: `base.manifest.v1`, `base.routing.v1`.
- **Il contratto dei punti di estensione**: `base.config` (rankers, validatori, policy, auth) è puramente **additivo**, la vostra configurazione continua a funzionare.

È l'impegno **NFR-CORE-002**, detto «nessuna rottura»: ciò che esiste continua a funzionare da una versione all'altra.

## Cosa può ancora evolvere

- Il **contenuto** delle proiezioni derivate (il dettaglio di un manifesto, di un registro): sono proiezioni rigenerabili, mai una fonte di verità.
- La **classifica** di un router, poiché un ranker migliore può cambiare l'ordine dei candidati; il *contratto* di routing (stati, astensione) rimane stabile.
- I **pacchetti compagni** opzionali seguono il proprio versionamento: `@ai-swiss/base-ranker-semantic` (embeddings), `@ai-swiss/base-index-local` (indice su larga scala), `@ai-swiss/base-llm` (la porta LLM, dietro lo Studio e la valutazione) e `@ai-swiss/base-eval` (la valutazione). Il nucleo non **esige nessuno** di essi: sono peer opzionali, installati solo se utilizzate la funzione interessata, e non aggiungono alcuna dipendenza di terze parti al nucleo.
- Gli **esempi** e la documentazione possono arricchirsi senza preavviso.

## Compatibilità di esecuzione

- **Node.js >= 18.** Il nucleo è a zero dipendenze e testato in integrazione continua su Node 18, 20, 22 e 24. Gli strumenti facoltativi (valutazione, Studio) hanno, da parte loro, le proprie dipendenze, standard e isolate dal nucleo.
- **Portabile tra strumenti.** I file `CLAUDE.md`, `.cursor/rules/`, `AGENTS.md` sono adattatori generati; il nucleo portabile rimane `.ai/`, i documenti Markdown e i comandi locali.
- **Portabile tra stack.** A partire dalle specifiche fornite con il framework (`specs/`), si può cambiare linguaggio o librerie per ricostruire funzionalità equivalenti: un'interfaccia come lo Studio richiede codice, quindi scelte tecniche standard.

## Deprecazioni

Quando un elemento stabile deve scomparire, viene dapprima **deprecato** (documentato nel `CHANGELOG`, mantenuto funzionante per almeno una versione minore) prima di essere rimosso in una versione **major**.

Vedere il [CHANGELOG](../../CHANGELOG.md) per la cronologia, e [Sicurezza e limiti](../trust/securite-et-limites.md) per il confine onesto delle garanzie.
