<!-- fr-synced: 8964d66d011024684f4011941a56e7f9c3a23104 -->

# Verificare le promesse di BASE e i suoi limiti

Prima di affidare un lavoro reale a BASE, occorre poter verificare le sue promesse invece di crederci sulla parola: per ogni grande promessa trovate qui il meccanismo, il test o l'esempio che la sostiene, e il limite che bisogna conoscere. E' cio di cui ha bisogno chiunque debba sottoporre BASE a audit prima di affidarvisi: sviluppatore, manutentore, istituzione, impresa. Una formula visionaria vale solo se rimanda a un file, un test, un esempio, un limite o una decisione esplicita.

## Struttura per la validazione

**Claim.** BASE rende il lavoro con l'IA piu verificabile perche l'intenzione, il contesto, il processo, le risorse e gli output attesi sono scritti.

**Meccanismi.**

- `docs/reference/routage-process-et-ressources.md` spiega la catena agente -> processo -> risorse.
- `specs/current/10_core/writes.md` definisce la disciplina propose -> commit.
- `tests/base-routing.test.mjs` protegge le astensioni, le ambiguita e le rotte attese.
- `tests/base-core.test.mjs` protegge validazione, collegamenti, inventario e garanzie pubbliche.
- `specs/current/10_core/requirements-matrix.md` collega ogni requisito (UR/FR/NFR) ai file di test che lo citano; la matrice e generata (`npm run spec:matrix`) e la sua freschezza e verificata dalla suite di test.

**Limite.** BASE rende il percorso di verifica piu esplicito, ma con cio non garantisce che una risposta sia vera.

## Locale per impostazione predefinita

**Claim.** BASE puo funzionare come una struttura locale, leggibile e portabile prima di qualsiasi piattaforma.

**Meccanismi.**

- `tools/base.mjs` espone i comandi locali.
- `docs/guides/connecter-votre-outil.md` mostra come connettere strumenti diversi.
- `docs/guides/modeles-souverains.md` documenta opzioni di modelli locali o sovrani.
- `mcp/README.md` mostra l'integrazione senza spostare la fonte di verita.

**Limite.** Le organizzazioni devono ancora definire IAM, DLP, conservazione, registrazione e revisione legale intorno a BASE.

## Strati opzionali

**Claim.** BASE puo restare semplice per un piccolo utilizzo e aggiungere strati quando il bisogno e reale.

**Meccanismi.**

- `docs/learn/comprendre-echelle.md` spiega quando l'indice locale diventa utile.
- `packages/base-index-local/README.md` documenta l'indice opzionale.
- `packages/base-ranker-semantic/README.md` documenta il ranking semantico opzionale.
- `packages/base-eval/README.md` documenta la valutazione.

**Limite.** Aggiungere uno strato aumenta la superficie di manutenzione. La semplicita per impostazione predefinita resta una regola di progettazione.

## Valutare il vostro assistente, senza farne una prova

**Uno strumento, non un argomento.** BASE fornisce `base eval`: un utente simulato parla al vostro assistente attraverso il vero broker, e un giudice indipendente valuta la conversazione rispetto agli obiettivi di uno scenario. E uno strumento da esplorare per giudicare *il vostro* assemblaggio (il vostro agente, il vostro modello, i vostri scenari), mai una prova della qualita di BASE: cio che misura dipende dal vostro modello, dal vostro esempio e dal vostro hardware, non da BASE.

**Meccanismi.**

- `tools/eval/README.md` documenta il comando e il ruolo del giudice.
- `exemples/assistant-devis/.ai/experiments/scenarios/` contiene scenari versionati e riproducibili da riprendere.

**Limite.** I risultati sono i vostri, non i nostri. Un giudice debole produce verdetti deboli; i numeri dipendono dal modello, dalla sua versione e dall'hardware. Solo il protocollo e gli scenari sono stabili, e BASE non pubblica alcun risultato di valutazione come prova della sua qualita.

## Documentazione come proiezione

**Claim.** La documentazione interattiva puo essere bella senza diventare una seconda fonte di verita.

**Meccanismi.**

- `specs/current/10_core/docs.md` definisce il modello documentale.
- `tools/docs/model.mjs` costruisce il modello a partire dalle fonti.
- `packages/base-docs-site/` rende il sito come adattatore.
- `tests/base-docs.test.mjs` protegge determinismo, filtraggio pubblico e build distribuibile.

**Limite.** Le pagine di presentazione devono restare sobrie. Se e necessaria una spiegazione duratura, deve vivere in `docs/` o `specs/`.

## Ciclo sul campo, egress e salute del corpus

- **Controllo di egress**: una sola regola, un solo punto di controllo, `tools/core/egress.mjs`
  (`checkEgress`, funzione pura testata nella matrice localita x policy x riservatezza in
  `tests/base-egress.test.mjs`). La chat si rifiuta di modificare un documento riservato con un modello
  remoto. Il context pack trattiene i riferimenti interessati (badge «trattenuto» a schermo) e la
  traccia di valutazione registra i documenti espunti.
- **Diario di attrito**: `.ai/feedback/` e in sola creazione, lo strumento MCP
  `report_friction` non modifica mai una voce (collisione = suffisso; verificato da
  `tests/base-feedback.test.mjs` e `mcp/tests/index.test.ts`). «Segna come risolto» ripassa per la
  porta propose → diff → commit come ogni scrittura.
- **Astensioni del router**: ogni `out_of_scope` / `ambiguous` / `needs_clarification` e
  registrato dagli adattatori (CLI e MCP) in `.ai/feedback/abstentions.jsonl`; il broker
  resta privo di effetti collaterali. Entrambe le porte passano per la stessa funzione di scrittura.
- **`base doctor`**: proiezione pura su dati esistenti (inventario, grafo dei
  collegamenti, run, feedback), senza stato proprio. Sei verifiche, due gravita, una pista di
  correzione obbligatoria per segnale (`tests/base-doctor.test.mjs`). Due porte per una sola
  funzione: CLI `base doctor [--json]` e `GET /api/doctor` (banner Studio).
