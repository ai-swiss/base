<!-- fr-synced: 25e0fc55650c859ba0c79972a7f10540ab37a82b -->

# Le gate di BASE

La disciplina di BASE è retta da controlli, non dalla fiducia. Questa pagina li elenca affinché una
persona che contribuisce sappia, davanti a un fallimento, che cosa verifica il gate e come correggerlo.

Tre livelli: l'**hook** di commit (opzionale, `git config core.hooksPath .githooks`), il comando
locale **`npm run check`** (il cuore dei gate, da superare prima di fare push) e la **CI** (che ne
esegue di più). «Verde in locale» non è quindi «verde ovunque»: la CI aggiunge la copertura, gli
artefatti rigenerati, il doctor, lo smoke pack e le suite MCP e Studio.

```mermaid
flowchart LR
    A[Hook di commit (opzionale)] --> B[npm run check (prima del push)]
    B --> C[CI (copertura, doctor, smoke, MCP, Studio)]
```

## `npm run check` (il cuore, in locale)

| Gate | Verifica | Correggere |
|---|---|---|
| `spec:matrix --check` | La matrice dei requisiti è aggiornata; nessuna citazione punta a una prova assente. | `npm run spec:matrix`, poi rileggere le righe della modifica. |
| `check-ids` | Gli identificatori sono stabili: nessuna rinumerazione né riutilizzo. | Mantenere l'id esistente; un nuovo id si alloca con `spec:new`. |
| `check-id-namespaces` | Ogni id resta nel namespace dichiarato dalla sua sezione. | Allineare l'id al prefisso della sua sezione. |
| `check-leaf` | Una foglia di spec resta breve (≤ 250 righe), senza stato e instradata. | Suddividere la foglia, togliere lo stato, collegarla. |
| `check-markers` | L'insieme chiuso dei marcatori (`[A VALIDER]`, `[ATTENTION]`, `[A COMPLETER]`, `[DECISION]`) resta coerente. | Usare solo questi quattro marcatori. |
| `check-statusless` | Le pagine di riferimento sono al presente, senza stato. | Riformulare al presente; togliere lo stato. |
| `check-emdash` | Nessun trattino lungo nel contenuto francese (`docs/`, README, CONTRIBUTING, MANIFESTO). | Sostituire con due punti, parentesi o trattino semplice. |
| `check-punctuation` | Punteggiatura stretta romanda nel francese (`docs/`, `exemples/`, README, CONTRIBUTING, MANIFESTO): nessuno spazio prima di `: ; ! ?`, virgolette strette, nessun trattino lungo negli esempi. | Stringere la punteggiatura; un'eccezione si dichiara sulla riga con `[PUNCT-OK: raison]`. |
| `check-lexique` | Nessuna formulazione vietata compare nella prosa francese. | Riformulare; un'eccezione si dichiara sulla riga con `[LEXIQUE-OK: raison]`. |
| `check-translations` | Le traduzioni indicano il francese come versione di riferimento. | Aggiungere la menzione della fonte francese. |
| `check-tree` | Nessun file parassita; le pagine di docs sono in kebab-case e ≤ 400 righe. | Rinominare o suddividere; togliere il parassita. |
| `typecheck` | I tipi passano (`tsc`, senza variabile inutilizzata). | Correggere gli errori di tipo segnalati. |
| `validate` | Ogni risorsa rispetta il contratto `base.resource.v1`. | Correggere il frontmatter segnalato. |
| `route-test` | Le rotte attese (fixture `.ai/routing/route-tests.json`) sono stabili. | Regolare il segnale di routing (`use_when` / `routing.examples`) o la fixture. |
| `docs validate` | Il modello di documentazione è coerente (zero errori). | Seguire l'errore segnalato dal modello. |
| `npm test` | La suite di test del cuore e dei pacchetti passa. | Correggere la causa; non disattivare mai un test. |

## Solo CI (oltre `npm run check`)

| Gate | Verifica | Quando eseguirlo in locale |
|---|---|---|
| `test:coverage` | Soglie di copertura (righe 90, branch 80, funzioni 90). | `npm run test:coverage` quando tocchi il cuore. |
| Diff del manifesto | `base index` rigenerato; `base.manifest.json` è aggiornato. | `npm run index`, poi `git diff base.manifest.json`. |
| Diff delle proiezioni | `base build bootstrap --write`; `AGENTS.md` / `CLAUDE.md` / `BASE_BOOTSTRAP.md` sono aggiornati. | `node tools/base.mjs build bootstrap --write`, poi `git diff`. |
| `doctor` | Corpus sano: nessun link morto, orfano o risorsa scaduta. | `node tools/base.mjs doctor --root .`. |
| `smoke:pack` | Il pacchetto npm si installa e si avvia. | `npm run smoke:pack`. |
| MCP | Il server MCP compila e i suoi test passano. | Vedi [`CONTRIBUTING.md`](../../CONTRIBUTING.md) quando tocchi `mcp/`. |
| Studio | Il build e le suite UI / E2E di Studio passano. | Idem, quando tocchi `tools/studio/`. |

Una regola sopra tutte: un gate rosso è un'informazione, mai un ostacolo da aggirare. Si corregge la
causa, non si disattiva né un hook (`--no-verify`) né un test.
