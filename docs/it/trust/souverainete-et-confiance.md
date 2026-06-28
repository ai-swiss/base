<!-- fr-synced: 3a97e156b3f1d0e2d354f8762cf273c113dba15a -->

# Giustificare la scelta di BASE: sovranità, fiducia, conformità

Adottare BASE significa spesso dover prima convincere: un cliente preoccupato per i suoi dati, un servizio informatico, un responsabile della conformità. Qui trovate, in un unico luogo, ciò che serve per difendere questa scelta senza eludere le domande scomode: sovranità dei dati, protezione dei dati, sicurezza, licenza e governance. Pensata per qualsiasi organizzazione che valuta BASE, dal lavoratore indipendente all'istituzione, questa pagina rimanda ai documenti di riferimento senza sostituirli.

## In una frase

BASE è un quadro **local-first** e **aperto** per strutturare il lavoro con l'IA: il vostro sapere resta in file di testo che possedete, e siete voi a decidere esplicitamente che cosa esce, se del caso, verso uno strumento IA.

La sovranità di BASE deriva dalla sua architettura, non da un'etichetta. Local-first, lo strumento viene eseguito sulla vostra macchina e conserva il sapere in file di testo che possedete: finché nessun fornitore remoto è connesso, nulla lascia la postazione, e non esiste alcun server da costringere. Tre precisazioni si impongono tuttavia. Un modello locale non è un modello svizzero: la località dice dove gira, non la sua origine. Un modello svizzero non è per questo confidenziale se è ospitato su un'infrastruttura sotto controllo estero: il CLOUD Act americano raggiunge i dati «ovunque siano archiviati», e persino un attore svizzero resta assoggettabile al diritto svizzero. Ciò che esce dipende dunque dalla vostra configurazione e dal contratto: residenza dei dati, uso per l'addestramento, subappaltatori, giurisdizione. Il quadro e l'esperienza sono sovrani; il modello resta la vostra scelta esterna, da verificare.

Al di là di questa sovranità di hosting, quella che decide nel lungo periodo è la **sovranità cognitiva**: possedere l'articolazione del vostro modo di pensare con l'IA, in un testo leggibile e portabile che potete rileggere, correggere e portare con voi. È lo strato che BASE mantiene dalla vostra parte, qualunque sia il modello. Vedi [Co-pensare con l'IA](../learn/co-penser-avec-lia.md).

## Sovranità dei dati

- Il cuore di BASE è **locale**: non effettua **alcuna chiamata di rete per impostazione predefinita**. Il routing predefinito è al 100 % locale (lessicale, zero rete).
- Una funzione che farebbe uscire dei dati (routing semantico avanzato, provider di embeddings, API esterna) è **disattivata per impostazione predefinita** e si attiva solo tramite una scelta esplicita, con un'opzione locale (Ollama) documentata.
- I vostri file restano portabili (Markdown): potete cambiare strumento IA senza perdere la vostra struttura.

Dettaglio: [Sicurezza e dati del routing](securite-donnees-routage.md), sezione «Sovranità dei dati» del [README](../../README.md).

## Protezione dei dati (nLPD / revLPD, GDPR)

BASE da solo **non vi rende conformi** alla legge svizzera sulla protezione dei dati (nLPD/revLPD) né al GDPR: la conformità dipende dalla vostra organizzazione, dai vostri trattamenti e dallo strumento IA che collegate. Ciò che BASE apporta concretamente:

- un funzionamento **locale per impostazione predefinita** che limita, fin dalla progettazione, ciò che lascia la vostra postazione;
- una **frontiera esplicita** tra ciò che resta locale e ciò che è affidato a un terzo, a voi la decisione;
- file **verificabili** e un **registro minimo** per tracciare le decisioni.

Ciò che fornite voi stessi: base giuridica, registro dei trattamenti, gestione dei diritti delle persone e la valutazione del fornitore di IA che utilizzate. Vedi [Sicurezza e limiti](securite-et-limites.md), sezione «Ciò che BASE non protegge da solo».

Non dovete decidere da soli queste questioni: **AI Swiss può rispondere e orientarvi verso esperti affermati**. Questi temi hanno risposte note, e specialisti per trattarli.

## Sicurezza

- Una postura **onesta**: BASE distingue ciò che è una **istruzione** (testo seguito da un modello cooperativo) da ciò che è un **meccanismo** (realmente applicato dal broker). Questa frontiera è documentata in modo chiaro, senza mascherarla.
- Il server di integrazione (MCP) è **in sola lettura per impostazione predefinita sulla rete** (trasporto HTTP), e la sua esposizione non locale è rifiutata senza autenticazione. In accesso **locale** (stdio, da uno strumento sulla vostra macchina), la scrittura è esposta per impostazione predefinita, da restringere all'occorrenza tramite `BASE_MCP_READ_ONLY=1`; ogni scrittura passa comunque attraverso il flusso mediato propose-then-commit, mai con un solo gesto.
- Modello di minaccia e limiti: [Sicurezza e limiti](securite-et-limites.md). Segnalazione di vulnerabilità: [`SECURITY.md`](../../SECURITY.md).

## Licenza e riutilizzo

- **Codice** sotto **Apache-2.0**; **documentazione, agents, skills ed esempi** sotto **CC BY 4.0**.
- Potete utilizzarlo, adattarlo e ridistribuirlo, anche internamente. Dettaglio leggibile: [Licenza](licence.md).

## Governance e durabilità

- **Creato da Charles-Edouard Bardyn** (Direttore Scientifico, VP e cofondatore di **[AI Swiss](https://a-i.swiss)**, associazione svizzera indipendente senza scopo di lucro la cui missione è promuovere l'IA attraverso il concreto, l'umano e i fondamentali), e oggi **mantenuto da un manutentore principale** sotto l'amministrazione di AI Swiss, aperto al contributo e alla co-manutenzione.
- **[Innovaud](https://innovaud.ch)** è partner del progetto: l'agenzia ha contribuito ad avviare gli esempi di settore destinati alle PMI.
- **Continuità tramite la reversibilità.** Oltre all'amministrazione di AI Swiss, la garanzia di durabilità più solida è strutturale: codice e contenuti sotto doppia licenza aperta (Apache-2.0 / CC BY 4.0), nucleo a zero dipendenze, file Markdown che possedete. Potete **forkare e riprendere il progetto** in qualsiasi momento, senza dipendere da alcun manutentore unico.
- Superficie pubblica stabile e versionata (SemVer): [Versioni e stabilità](../reference/versions-et-stabilite.md). Decisioni documentate nel `CHANGELOG` e nelle `specs/`.

## Per approfondire

- Modelli locali e svizzeri: [Modelli sovrani e locali](../guides/modeles-souverains.md).
- Visione d'insieme: [Framework pubblico](../reference/framework-public.md).
- Stato dell'implementazione: [Stato d'implementazione](../reference/etat-implementation.md).
- Distribuzione in organizzazione: [Kit enterprise](../audiences/kit-enterprise.md).
- Istituzioni pubbliche: [Kit amministrazione e settore pubblico](../audiences/kit-administration-secteur-public.md).
- Integrazione tecnica: [`mcp/README.md`](../../mcp/README.md).
