<!-- fr-synced: 7bd22841f0b5e714d4d8df302ccf499524bc2e6c -->

# Cosa fa oggi il nucleo pubblico di BASE

Questa pagina si rivolge a chi vuole sapere, al presente, cosa il nucleo pubblico di BASE sa fare e cosa non fa, senza indovinare. Esiste per offrire un punto di riferimento onesto e rimanda alle tre fonti che fanno fede, anziché ricopiarle:

- **la frontiera esatta** (nel perimetro, fuori dal perimetro): [`specs/current/00_overview/perimeter.md`](../../specs/current/00_overview/perimeter.md);
- **la prova di ogni comportamento**: la matrice requisiti verso test, [`specs/current/10_core/requirements-matrix.md`](../../specs/current/10_core/requirements-matrix.md);
- **lo storico e gli orientamenti**: il [`CHANGELOG.md`](../../CHANGELOG.md).

In caso di divergenza tra una di queste fonti e questa pagina, fa fede la fonte. Per capire quale livello di adozione corrisponde alla vostra situazione, vedete anche [`docs/audiences/pour-qui.md`](../audiences/pour-qui.md).

## Cosa fa il nucleo pubblico

- Inventario locale delle risorse Markdown e JSON.
- Validazione del frontmatter BASE, degli identificatori, dei link relativi, delle sorgenti locali e degli entrypoint degli strumenti.
- Ricerca locale spiegabile su identificatore, titolo, descrizione, parole chiave, percorso e testo.
- routing locale da agente a processo con astensione strutturata: `base route` e lo strumento MCP `route_request` restituiscono `routed`, `ambiguous`, `needs_clarification` oppure `out_of_scope`, con candidati e motivazioni.
- Test di routing di dominio: `base route-test` legge fixture JSON e fallisce in caso di deriva.
- Pacchetto ufficiale di ranker semantico con veri embedding: `@ai-swiss/base-ranker-semantic`, separato dal nucleo, accetta qualsiasi fornitore di embedding, fornisce un connettore OpenAI-compatibile senza SDK cloud e un helper Ollama opzionale (`createOllamaEmbedder`, modello `nomic-embed-text`). Robusto per la produzione: timeout per chiamata, annullamento tramite `AbortSignal`, retry limitati solo su errori transitori (backoff più jitter), batching esplicito tramite `createBatchingEmbedder`, cache configurabile senza avvelenamento da fallimento transitorio, errori tipizzati (`.code`), validazione rigorosa dei vettori e osservabilità senza contenuto di dominio.
- Pacchetto ufficiale di indice locale opzionale: `@ai-swiss/base-index-local`, separato dal nucleo, proietta un indice derivato ed eliminabile a partire dall'inventario e dai segnali di routing. Il routing indicizzato riutilizza il Ranker e il Router iniettati e restituisce gli stessi stati che in memoria per impostazione predefinita, anche con un ranker semantico senza corrispondenza lessicale; `candidateMode:"lexical"` è un'ottimizzazione esplicita. Benchmark riproducibili da 100 a 50'000 documenti. Il nucleo resta l'impostazione predefinita per i corpus piccoli e medi.
- Apertura di risorsa con le proiezioni `metadata`, `instructions` e `full`.
- Accesso locale confinato nel progetto, con rifiuto delle traversate di percorso e dei symlink in uscita.
- Invocazione di strumenti locali in dry-run per impostazione predefinita, con conferma esplicita per l'esecuzione.
- Scrittura di dominio mediata: `propose_change` prepara un diff leggibile senza scrivere nulla, `commit_change` scrive dopo una decisione (conferma richiesta per impostazione predefinita, configurabile per risorsa tramite `requires_confirmation`, mai opzionale per `sensitive`/`restricted`), verifica lo stato scritto e traccia.
- Promozione di risorsa (`promote`): aggiorna `scope`, `promoted_from` e `promoted_at` tramite la scrittura mediata, con diff e conferma.
- Elenco dei marcatori aperti (`markers`): `[A VALIDER]`, `[A COMPLETER]`, `[ATTENTION]`, `[DECISION]` nei documenti di dominio.
- Proiezione multi-harness (`build`): genera dal kernel un indice `AGENTS.md` (compatibilità con la famiglia Codex/AGENTS.md) e una matrice di strumenti (`.ai/tools.md`) che dichiara onestamente il livello reale di enforcement per ogni harness. `base build routing-registry` genera inoltre, su richiesta, `.ai/routing/registry.json`, proiezione deterministica dei segnali di routing. Artefatti derivati, mai fonti di verità.
- Traccia minima JSONL per le operazioni mediate da BASE, senza contenuto di dominio per impostazione predefinita.
- Manutenzione locale: errori, avvisi, marcatori aperti, descrizioni mancanti e segnali provenienti dalle tracce quando esistono.
- Manifest derivato e rigenerabile per la scoperta.
- Server MCP come adattatore verso le stesse primitive, senza logica di dominio propria.

## Fuori dal nucleo pubblico

La frontiera di riferimento è [`specs/current/00_overview/perimeter.md`](../../specs/current/00_overview/perimeter.md). In sintesi, il nucleo pubblico da solo non fornisce:

- RBAC enterprise completo.
- SSO, IAM, DLP, SIEM, archiviazione legale e conservazione regolamentare.
- Isolamento rigoroso se l'agente dispone di un accesso diretto alla shell, al filesystem o ad API esterne a BASE.
- Garanzia di esattezza automatica delle risposte generate da un modello.
- Un motore di workflow, un DAG, un'interfaccia di automazione o un DSL proprietario.

## Regola di lettura

BASE guida ovunque tramite il testo. BASE applica solo ciò che passa attraverso il suo broker, la sua CLI, il suo MCP o un connettore controllato.

Un metadato YAML esprime un'unità semantica stabile. Il codice decide poi cosa può essere verificato o applicato. Questa separazione permette di restare semplice per una singola persona, utile per una PMI ed estensibile per un'organizzazione più grande.
