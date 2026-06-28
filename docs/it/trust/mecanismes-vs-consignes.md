<!-- fr-synced: fec4b2e371f1e8e296bdd609be08ae81d8f7eaf0 -->

# Meccanismi vs. istruzioni

## Perché questa distinzione è il cuore di una governance dell'IA degna di fiducia

Nella maggior parte degli strumenti di IA, una regola di sicurezza è in realtà una frase rivolta al modello, del tipo «non toccare questo file» o «non inviare mai questo dato a un servizio remoto». Funziona finché il modello coopera e smette di funzionare nel momento in cui sbaglia, viene dirottato o un'azione aggira il percorso previsto. Una regola del genere è un'**istruzione**, non una garanzia.

BASE distingue due livelli, e questa distinzione fonda la sua onestà:

- un **meccanismo** è applicato dal broker (la CLI `base`, il nucleo in `tools/`, o il server MCP quando delega al broker). Agisce prima o durante l'azione e può bloccarla, mediarla o rifiutarla. Non dipende dalla buona volontà del modello.
- un'**istruzione** è una direttiva espressa nei metadati o nel contesto. Orienta un modello cooperativo e funge da segnale di audit, ma non vincola nulla meccanicamente. Un'istruzione non è codice che viene eseguito, anche se a volte un modello la segue così bene da darne l'impressione: resta sempre un margine di errore, variabile a seconda dei domini. Per una regola che deve essere rigorosa, non ci si affida mai a un modello, serve un meccanismo.

La condizione che fa passare una proprietà da istruzione a meccanismo è sempre la stessa: **l'azione passa per il percorso del broker** (CLI, nucleo, o MCP che delega al broker). Se l'azione prende un altro percorso (accesso diretto alla shell, al file system o a una API esterna senza passare per BASE), la stessa proprietà torna a essere una semplice istruzione.

```mermaid
flowchart TD
    A[Azione su una risorsa] --> B{Passa per il percorso del broker (CLI base, nucleo, o MCP che delega) ?}
    B -->|Sì| C[Meccanismo: la proprietà è applicata, il broker può bloccare, mediare o rifiutare]
    B -->|No, accesso diretto a shell, file o una API esterna| D[Istruzione: semplice intenzione, seguita secondo la buona volontà del modello]
```

## I due mondi di un file

Questa frontiera non è astratta: è inscritta nella struttura stessa di un file BASE, che ha due parti, ciascuna delle quali parla a un mondo diverso.

- L'**intestazione strutturata** (il frontmatter: identità, ambito, sensibilità, politica di egress) è letta da **codice testato**. Il broker la usa per decidere e per applicare: confinare un accesso, trattenere un dato confidenziale, mediare una scrittura. È il mondo dei **meccanismi**, che non dipendono dalla buona volontà del modello.
- Il **corpo in testo** (il metodo, il saper fare, le istruzioni di dominio) è letto dall'**IA**. Orienta un modello cooperativo, senza vincolare nulla. È il mondo delle **istruzioni**, utili e fallibili.

Lo stesso file collega così la vostra competenza al codice: ciò che deve essere garantito vive nell'intestazione che il broker applica; ciò che è materia di giudizio vive nel testo che l'IA segue. Una proprietà diventa un meccanismo solo quando l'azione passa per il broker, là dove questa intestazione viene letta.

## Tabella delle proprietà

| Proprietà | Applicata dal broker (meccanismo) | Solo un'istruzione (buona volontà del modello) |
| --- | --- | --- |
| **Confinamento dei percorsi e rifiuto di evasione tramite link simbolico** (`tools/core/confine.mjs`) | Quando la lettura o la scrittura passa per il broker: ogni percorso fuori dalla radice autorizzata è rifiutato, e una risoluzione di link simbolico che uscirebbe dalla radice è rifiutata anch'essa. | Quando il modello scrive o legge tramite uno strumento diretto dell'harness, fuori dal broker: il confinamento è solo un'intenzione, nulla impedisce l'accesso. |
| **Proponi poi conferma, scritture mediate e atomiche** | Quando la scrittura passa per il broker: la modifica è dapprima proposta, poi validata, poi applicata in modo atomico e mediato, il che permette una revisione prima di qualsiasi effetto. | Quando la scrittura avviene tramite uno strumento diretto: è immediata e non mediata, senza fase di proposta né atomicità garantita da BASE. |
| **Esecuzione delle capacità in dry-run per impostazione predefinita** | Quando una capacità è eseguita dal broker: è simulata per impostazione predefinita, l'effetto reale richiede una richiesta esplicita. | Quando il modello attiva un'azione equivalente fuori dal broker: nulla impone il dry-run, l'effetto può essere immediato. |
| **Astensione dal routing invece di una falsa certezza** | Quando il routing passa per il router di BASE: può restituire `out_of_scope`, `ambiguous` o `needs_clarification` invece di imporre un agente predefinito. | Quando il modello sceglie da sé un agente senza chiamare il router: nulla garantisce l'astensione, può indovinare. |
| **Controllo dell'egress prima della chiamata** (per costruzione, una risorsa confidenziale o una radice locale non viene inviata a un modello remoto quando la chiamata passa per il broker) | Quando la chiamata passa per il broker (server MCP, chat dello Studio, valutazione): la verifica avviene prima dell'invio, e l'invio di una risorsa confidenziale o di una radice local-only verso un modello remoto è bloccato a monte. | Quando la chiamata a un modello remoto è fatta fuori dal broker (per esempio dalla riga di comando diretta, o in uno strumento di IA fuori da BASE): nessuna verifica preliminare è applicata, il dato può partire. |
| **MCP in sola lettura per impostazione predefinita** (opzione token bearer) | Quando l'accesso passa per il server MCP di BASE: è in sola lettura per impostazione predefinita su HTTP, la scrittura presuppone un'attivazione esplicita e può essere protetta da un token bearer. | Quando si usa un altro server o un accesso diretto: né la sola lettura predefinita né il token si applicano. |
| **Memorizzazione dei nomi delle variabili d'ambiente, non delle keys grezze** | Quando le impostazioni passano per il broker: registrano il NOME della variabile d'ambiente e non il valore della key API, che resta fuori dal file. | Quando il modello scrive una configurazione in altro modo: nulla impedisce di inserirvi una key in chiaro. |
| **Registro di traccia locale** (`.ai/trace`) | Quando l'operazione è mediata dal broker: è registrata localmente nel registro di traccia, il che fornisce una pista di audit. | Quando l'azione aggira il broker: non appare nel registro, l'audit è cieco rispetto a questa operazione. |

## Nota di chiusura

Fuori dal percorso del broker, tutto ritorna al livello nativo dell'harness. I metadati e le istruzioni restano utili come guida e come segnale per un modello cooperativo, ma non vincolano nulla: un accesso diretto alla shell, al file system o a una API esterna sfugge a queste proprietà. La regola pratica è semplice: una garanzia è reale solo se l'azione passa per la CLI `base`, per il nucleo, o per l'MCP che delega al broker.

Promemoria sull'ambito: BASE non è né un runtime di agenti, né un motore di orchestrazione, né un dispositivo di RAG, né una piattaforma, né un sistema IAM, DLP, SIEM, RBAC, né un meccanismo di conservazione o di archiviazione legale. Non garantisce nemmeno l'esattezza degli output di un modello. La scelta del modello stesso è esterna a BASE.

Questa pagina è informativa e non costituisce una certificazione di conformità né un parere legale o di sicurezza. Un'istituzione resta responsabile della propria analisi d'impatto (DPIA) e della propria politica di sicurezza.
