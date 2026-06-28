<!-- fr-synced: 83854493f3532568c305224ae9af9b9f7fa007a5 -->

# Mantenere i vostri modelli sovrani, in locale o in Svizzera

Usare un modello con BASE non deve significare affidare i vostri dati a un fornitore fuori dal vostro controllo. Se questa è la vostra esigenza, due percorsi concreti vi mantengono il controllo, tutto in locale oppure ospitato in Svizzera, con un riferimento per scegliere in base alla sensibilità di ciò che trattate.

Il cuore di BASE non chiama mai un fornitore di modelli. Nella configurazione di base, nulla esce dalla vostra macchina. Far girare un modello (per una valutazione o per pilotare un assistente) è una **scelta esplicita**, e questa scelta può restare sovrana.

Due percorsi mantengono i vostri dati sotto il vostro controllo:

- **Tutto in locale** con Ollama: nulla lascia la macchina.
- **Ospitato in Svizzera** con Infomaniak: un'API compatibile con OpenAI, gestita in Svizzera.

Nessuno dei due è obbligatorio. Il routing predefinito di BASE è interamente locale e non richiede alcun modello.

## Quale modello è adatto

BASE non gira con un modello qualsiasi, ed è meglio dirlo. Un processo richiede un modello capace di servirsi di strumenti in modo affidabile (leggere un file, proporne uno, cercare una risorsa, chiamare una funzione) senza inventare una chiamata o un parametro, di seguire istruzioni con più vincoli, di restituire all'occorrenza un output strutturato, di mantenere il filo lungo alcuni scambi e di attenersi ai soli dati forniti. Ciò che conta non è un tentativo riuscito una volta, ma la costanza nel tempo. Diversi modelli aperti eseguibili in locale superano oggi questa soglia, a titolo di esempio e senza pretesa di esaustività: Qwen (con licenza Apache-2.0) o la famiglia Gemma di Google (con la propria licenza), capaci di chiamare funzioni e di restituire un output strutturato, reggono i processi ben delimitati. Il panorama si muove in fretta, e il criterio che conta non è la marca ma la costanza nel tempo: chiamare strumenti senza inventare una chiamata, seguire più vincoli alla volta, attenersi ai dati forniti. Le concatenazioni più complesse restano il vantaggio dei grandi modelli ospitati. La scelta giusta dipende dal processo, non da uno slogan.

## Tutto in locale: Ollama

Nulla esce dalla macchina. Ideale per una postazione individuale, una dimostrazione o un ambiente isolato dalla rete.

```js
import { createOllamaModel } from "@ai-swiss/base-llm";

const model = createOllamaModel({ model: "qwen3.5:9b-q4_K_M" });
```

Per avviare una valutazione interamente locale (il modello deve essere disponibile in Ollama in precedenza):

```bash
npm run eval -- --ollama --model qwen3.5:9b-q4_K_M
```

## Ospitato in Svizzera: Infomaniak

Infomaniak propone modelli aperti tramite un'API **compatibile con OpenAI**, ospitata in Svizzera. A seconda del fornitore che scegliete e delle sue condizioni, i vostri dati possono restare in una giurisdizione svizzera, senza dipendere da un fornitore extraeuropeo.

Il port `base-llm` parla già l'API compatibile con OpenAI: indicate l'URL di base di Infomaniak, la vostra key e un modello del loro catalogo.

```js
import { createOpenAICompatibleModel } from "@ai-swiss/base-llm";

const model = createOpenAICompatibleModel({
  model: "<modele du catalogue Infomaniak>",
  apiKey: process.env.INFOMANIAK_TOKEN,
  baseUrl: "https://api.infomaniak.com/1/ai/<PRODUCT_ID>/openai",
});
```

`<PRODUCT_ID>` è l'identificativo del vostro prodotto AI Tools. Lo ottenete e scegliete i vostri modelli dal vostro spazio Infomaniak o dalla loro API (`GET /1/ai`). Vedere la [documentazione Infomaniak](https://www.infomaniak.com/fr/hebergement/ai-services).

Per una valutazione tramite Infomaniak, fornite la key attraverso l'ambiente e puntate all'URL di base:

```bash
export OPENAI_API_KEY="$INFOMANIAK_TOKEN"
npm run eval -- --base-url "https://api.infomaniak.com/1/ai/<PRODUCT_ID>/openai" --model "<modele>"
```

## Scegliere

| Esigenza | Percorso |
|--------|--------|
| Riservatezza massima, offline, postazione individuale | Ollama (tutto in locale) |
| Sovranità svizzera, modelli più grandi, team o istituzione | Infomaniak (ospitato in Svizzera) |
| Valutare il metodo senza alcun modello | Routing predefinito, interamente locale |

## Locale o cloud, secondo la sensibilità dei dati

Il criterio giusto è ciò che affidate al modello. Questa tabella offre un punto di partenza; non sostituisce un parere legale, e per i casi regolamentati la decisione spetta alla vostra responsabile della conformità.

| Sensibilità dei dati | Opzioni ragionevoli |
|-------------------------|----------------------|
| **Pubblici** (comunicazione pubblicata, contenuti di un sito) | Tutto è aperto: modello cloud di punta, hosting svizzero o locale, secondo il comfort cercato. |
| **Interni** (procedure, note di progetto non riservate) | Hosting svizzero o locale; un cloud extraeuropeo solo dopo una verifica delle sue condizioni e della sua conservazione. |
| **Riservati** (clienti, contratti, finanze) | Locale (Ollama), oppure hosting svizzero con garanzie contrattuali scritte. |
| **Personali o regolamentati** (HR, salute, dati soggetti alla nLPD o al GDPR) | Prima il locale; altrimenti un ambiente convalidato dalla vostra conformità, o tenere l'IA fuori dal circuito. |

Un punto che queste opzioni spesso eludono: dove risiedono i dati non è chi può, per legge, raggiungerli. Un servizio "ospitato in Svizzera" o "cloud europeo", ma gestito da una società sotto controllo straniero, resta assoggettabile alla giurisdizione della casa madre, in primo luogo il CLOUD Act statunitense, che raggiunge i dati "ovunque siano archiviati". La sovranità si legge nel contratto e nella struttura dell'operatore, non nel paese del data center. Ad alta sensibilità, il locale resta dunque l'unica opzione che non poggia sulla fiducia di nessuno.

Il dettaglio delle responsabilità che restano vostre si trova in [Protezione dei dati](../trust/protection-des-donnees.md).

## Cosa un piccolo modello locale fa bene e male

Un modello che gira su un buon computer portatile basta per una parte reale del lavoro, a condizione di sapere dove si ferma.

Cosa fa bene:

- **Il routing fa a meno di lui.** Il routing predefinito di BASE è lessicale e non richiede alcun modello. Rudimentale ma efficace, estensibile tramite adattatori, risparmia all'utente il carico mentale di cercare il processo giusto e funziona allo stesso modo con o senza modello locale, piccolo o grande.
- **Redigere nell'ambito di un processo breve.** Quando il processo fornisce la struttura, le regole e i dati, un piccolo modello produce una prima bozza onesta.
- **Riformulare.** Riassumere ciò che ha capito, regolare un tono, condensare un testo: compiti brevi e delimitati.

Cosa fa male:

- **Seguire fedelmente un processo lungo.** Oltre un centinaio di righe di istruzioni, un piccolo modello perde vincoli per strada: salta passaggi o dimentica regole. Suddividete i processi, oppure passate a un modello più grande.
- **Calcolare.** IVA, totali, margini: non chiedete mai questi risultati al modello. Affidateli a una tool deterministica (`base invoke`), che dà lo stesso risultato a ogni esecuzione.

La valutazione `base eval` rende queste limitazioni visibili anziché indovinate: il ruolo di giudice, in particolare, richiede spesso un modello più forte di quello che regge l'assistente.

## La configurazione testata in questo repository

Due configurazioni locali sono realmente usate dai manutentori, così come sono:

- **`base eval` con Ollama e `qwen3.5:9b-q4_K_M`** per l'utente simulato e il giudice; vedere [tools/eval/README.md](../../../tools/eval/README.md), incluso come rafforzare il giudice con un modello più grande.
- **`nomic-embed-text` per gli embedding locali**: è il modello predefinito di `createOllamaEmbedder()` nel pacchetto `@ai-swiss/base-ranker-semantic`, quando un progetto attiva il ranker semantico senza inviare nulla fuori dalla macchina.

In ogni caso, il cuore resta lo stesso file di testo che possedete. Il modello è un dettaglio sostituibile, non il luogo dove vive il vostro metodo.

## Per approfondire

- [Sovranità e fiducia](../trust/souverainete-et-confiance.md)
- [Protezione dei dati](../trust/protection-des-donnees.md)
- [Sicurezza dei dati e routing](../trust/securite-donnees-routage.md)
- [Scegliere un provider di embedding](choisir-provider-embeddings.md)

---

BASE è un framework di [AI Swiss](https://a-i.swiss). Casi d'uso in partnership con [Innovaud](https://innovaud.ch).
