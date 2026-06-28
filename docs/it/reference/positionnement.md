<!-- fr-synced: 218128215df7174b7067e7a3cd5dc5a0981e753f -->

# Dove si colloca BASE nel panorama degli strumenti IA

Scegliere uno strumento IA significa decidere cosa possiedi e cosa ti vincola: BASE sostituisce i tuoi strumenti, o si aggiunge a essi? Per chi lo valuta accanto ad altre soluzioni, ecco il suo posto, uno strato sovrano di competenza per un lavoro IA verificabile dall'essere umano, e l'elenco onesto di ciò che non fa.

> Tesi in una frase: BASE possiede l'articolazione (agenti Markdown portabili, instradamento deterministico, azioni mediate, competenza rileggibile) che i tuoi strumenti di esecuzione fanno girare, senza diventare esso stesso un motore di esecuzione.

Questa distinzione è la spina dorsale del documento. Uno strumento che **esegue** (un modello, un orchestratore, un connettore) fa girare il calcolo. BASE **possiede** il modo in cui quel lavoro è articolato: quale agente, quale processo, quali risorse mirate, con quale validazione. La maggior parte degli strumenti confrontati qui sotto sono strati su cui BASE si innesta, non concorrenti.

Un punto di vocabolario ricorrente in BASE: un **meccanismo** è applicato dal broker (del codice lo verifica), una **consegna** (consigne) è un'istruzione seguita dal modello (quindi fallibile). Là dove una garanzia conta, precisiamo quale delle due è in gioco.

## Confronto per categorie

Il panorama 2026 degli strumenti per costruire o far girare assistenti IA si riassume in alcune grandi categorie. Ecco il posto di BASE di fronte a ciascuna, e ogni volta la relazione: **differenziato** (sposta l'articolazione fuori dalla piattaforma), **complementare** (la categoria esegue, BASE possiede ciò che essa esegue), **porta** (BASE parla il protocollo), **terreno condiviso** (BASE prolunga il formato). I prodotti citati sono solo esempi di una categoria, mai la categoria stessa.

| Categoria di strumenti (2026) | Cosa fa | Cosa fa BASE in modo diverso | Relazione |
| --- | --- | --- | --- |
| **Assistenti personalizzabili ospitati** (per esempio GPT personalizzati, Gemini Gems, Claude Projects) | Congela una consegna e qualche file di contesto nel tuo account presso il fornitore, legato a un modello e alla sua interfaccia, senza codice. | Sposta l'articolazione fuori dalla piattaforma: agenti in Markdown che possiedi e versioni, portabili da un modello all'altro, con un instradamento che sceglie l'agente invece di un assistente selezionato a mano. | **Differenziato** |
| **Copiloti integrati nelle suite per ufficio** (per esempio Microsoft 365 Copilot, Gemini in Workspace) | Intreccia l'IA negli strumenti di produttività e mobilita i tuoi dati (documenti, e-mail, calendario) come contesto, dentro una suite e presso un fornitore. | Rende l'articolazione esplicita e posseduta (processi e agenti in testo, fuori dalla suite), legata al **compito** piuttosto che allo strumento aperto quella mattina, dunque riutilizzabile qualunque sia la suite. | **Differenziato** |
| **Pipeline di recupero e di memoria** (RAG, indicizzazione vettoriale, memoria d'agente; per esempio Qdrant, Cohere Rerank, Mem0) | Recupera frammenti per similarità, o richiama uno stato passato, e li inietta nel contesto del modello al momento dell'inferenza. | Non fa RAG e non ha uno stato opaco da richiamare: instrada verso un'unità di lavoro intera (un **agente e il suo processo**) in modo deterministico e lessicale, e mantiene la sua memoria esplicita e versionata. Una pipeline può essere uno strumento che un processo mobilita. | **Differenziato** |
| **Piattaforme d'agenti aziendali governate** (no/low-code; per esempio Copilot Studio, Gemini Enterprise) | Assembla, ancora tramite RAG, connette e pubblica agenti governati nel proprio perimetro: una categoria di esecuzione e di orchestrazione. | Non esegue; possiede l'articolazione (quale agente, quale processo, quali azioni mediate proponi-poi-conferma) in testo portabile, che può alimentare queste piattaforme invece di esservi rinchiuso. | **Complementare** |
| **Framework di orchestrazione d'agenti** (grafo di stati, ruoli, esecuzione durevole; per esempio LangGraph, CrewAI, Temporal) | Fa girare il ciclo: dirama, riprova, fonde uno stato, coordina più agenti, riesegue dopo un guasto. È il motore di esecuzione. | Non esegue nulla di tutto ciò; possiede l'articolazione a monte (instradamento lessicale deterministico verso un agente e un processo) e resta prudente sul multi-agente autonomo: il suo ciclo è proponi-poi-conferma, verificato dall'essere umano. Un agente BASE può diventare un nodo del grafo. | **Complementare** |
| **SDK d'agenti dei fornitori di modelli** (per esempio Claude Agent SDK, OpenAI Agents SDK, Google ADK) | Esegue il ciclo agentico lato fornitore (strumenti, passaggi tra agenti, accesso alla macchina, salvaguardie), ancorato a un modello preciso. | Aggiunge sopra l'articolazione posseduta e la mediazione di egress: l'azione è proposta poi confermata sotto controllo, non eseguita di continuo. Indipendente dal fornitore. | **Complementare** |
| **Agenti di codifica dell'ambiente di lavoro** (terminale, IDE, sfondo; per esempio Claude Code, Cursor, Codex, Devin) | Legge i tuoi file, ragiona, modifica, lancia comandi e cicla fino al compito, sotto approvazione regolabile, sulla tua macchina o in una sandbox. | Non esegue il ciclo; vive dentro quello strumento e gli fornisce l'articolazione a monte (scelta deterministica di un agente e di un processo interi) e la mediazione proponi-poi-conferma, che tiene l'essere umano al punto d'azione. | **Complementare** |
| **Protocolli di interoperabilità** (agente-strumento e agente-a-agente; per esempio MCP, A2A) | Standardizza il collegamento con cui un agente scopre e chiama strumenti e dati, o coordina altri agenti, indipendentemente dallo strumento. | Una porta che BASE parla: il suo server espone l'instradamento e le risorse (`route_request`, `load_agent`, `propose_change`, `commit_change`) tramite MCP. Il protocollo trasporta; BASE fornisce ciò che transita. | **Porta** |
| **Formati aperti di configurazione d'agente** (per esempio AGENTS.md, Agent Skills, CLAUDE.md) | Descrive in file aperti le istruzioni, le competenze e i comandi che guidano un agente all'esecuzione, indipendentemente dallo strumento. | BASE struttura questa conoscenza in agenti e processi posseduti, con un instradamento deterministico che sceglie un agente e un processo interi invece di iniettare un blocco di istruzioni indifferenziato. Legge e scrive questi formati. | **Terreno condiviso** |

Lettura trasversale. BASE è **differenziato** di fronte alle categorie di possesso e di perimetro, là dove l'articolazione del lavoro resta prigioniera di un account, di una suite o di un indice di frammenti. È **complementare** alle categorie di esecuzione, che fanno girare il ciclo là dove BASE non lo fa. È una **porta** verso i protocolli di interoperabilità, che parla invece di concorrervi, e un **terreno condiviso** con i formati aperti, che prolunga aggiungendo l'instradamento e la scelta che il formato da solo non porta. La linea di demarcazione è netta: tutto ciò che esegue, indicizza od ospita si compone con BASE o ne differisce per il perimetro; BASE, da parte sua, possiede la scelta deterministica dell'agente e del processo, e la mediazione che tiene l'essere umano al punto d'azione.

## Un prodotto integrato, o un quadro che possiedi

La maggior parte delle offerte IA per le imprese sono **prodotti integrati**: un assistente, il suo modello, la sua interfaccia e i tuoi dati riuniti in un solo servizio. È efficace da subito, ed è spesso un buon punto di partenza. Ma un prodotto e un quadro non si giudicano sulla stessa scala temporale. Quattro differenze strutturali valgono per qualsiasi lettore.

- **Il possesso.** In un prodotto, l'articolazione del tuo lavoro (le tue regole, i tuoi processi, il modo in cui suddividi i compiti) vive nell'account e nel formato del fornitore. In un quadro, è una cartella di file di testo che possiedi, versioni e porti con te. Il giorno in cui l'offerta cambia prezzo o condizioni o scompare, l'una riparte da zero, l'altra conserva tutto.
- **Il modello resta una scelta.** Un prodotto ti lega al suo modello e al suo ritmo. Un quadro fa del modello un mattone esterno e sostituibile: segui la frontiera dei modelli invece di sposare il calendario di un solo fornitore. Il modello meglio posizionato oggi non sarà quello dell'anno prossimo; un quadro ti lascia cambiarlo senza ricostruire tutto, là dove un prodotto legato al suo modello ti obbliga a farlo.
- **La verificabilità.** Le garanzie di un prodotto sono, per l'essenziale, istruzioni date al suo modello, dentro una scatola chiusa: le credi sulla parola. Un quadro aperto può fare delle sue garanzie dei meccanismi, del codice che leggi e provi. Si verifica un quadro; si crede a un prodotto.
- **La durata.** File in formati aperti sopravvivono a qualsiasi prodotto. La tua competenza vi si accumula in un supporto che non dipende dalle decisioni di un fornitore. È ciò che rende un quadro ben più fecondo nel tempo: fa dell'IA un bene che ti appartiene, piuttosto che un abbonamento che ti vincola.

Questi prodotti rendono veri servizi, e BASE si innesta volentieri su di essi (vedi il confronto qui sopra). Queste differenze dicono semplicemente dove si annida il valore durevole: meno nell'infrastruttura o nello strumento che esegue che nell'articolazione posseduta, quella che si conserva quando il resto cambia.

## I formati aperti di conoscenza

Grandi attori convergono nel 2026 verso standard aperti per l'IA agentica: protocolli di interoperabilità (MCP per l'agente-strumento, A2A per l'agente-a-agente) e formati aperti per descrivere la conoscenza e la configurazione di un agente in Markdown, l'**Open Knowledge Format (OKF)** di Google o i file `AGENTS.md` ne sono esempi recenti, parecchi ormai portati in governance aperta e comune (la Linux Foundation ne ospita una parte). È una buona notizia. Ogni passo che aiuta le persone a tenere il proprio sapere in file aperti, portabili e posseduti va nella direzione che BASE difende fin dall'inizio: la sovranità, fin dentro il formato.

BASE avanza più lontano sullo stesso cammino. Una risorsa BASE è già un semplice file Markdown con frontmatter, leggibile da questi formati, e vi aggiunge ciò che essi tralasciano: l'instradamento deterministico, il controllo di egress, la scrittura mediata e il ciclo di verifica da parte dell'essere umano. Questi primi passi vanno verso un terreno che BASE esplora già in profondità, e siamo lieti di vedervi avanzare altri attori.

## Ciò che BASE NON pretende di essere

Per restare onesti, ecco ciò che BASE non è e non fornisce da solo.

- **Non un runtime di agenti** né un motore di orchestrazione, di workflow o di DAG. BASE non fa girare agenti in ciclo; possiede l'articolazione che altri fanno girare.
- **Non del RAG** né un indice documentale generalista. L'instradamento sceglie un agente e un processo, non recupera passaggi.
- **Non una piattaforma**: né calcolo, né archiviazione, né connettori gestiti forniti per impostazione predefinita.
- **Non un sistema IAM, DLP, SIEM, RBAC, di conservazione o di archiviazione legale.** Queste funzioni competono alla tua organizzazione e ai suoi strumenti.
- **Non una garanzia di esattezza** degli output prodotti da un modello. BASE struttura la verifica da parte dell'essere umano, non la sostituisce.

## Tre prove per lo scettico

**1. Meccanismi applicati, non solo consegne.** Più garanzie sono verificate da codice, indipendentemente da ciò che il modello decide:

- confinamento dei percorsi e rifiuto dei symlink uscenti (`tools/core/confine.mjs`);
- scrittura in due tempi, proporre poi applicare, mediata e atomica;
- esecuzione dei tool in dry-run per impostazione predefinita;
- astensione di instradamento (`out_of_scope`, `ambiguous`, `needs_clarification`) piuttosto che una falsa certezza;
- server MCP in HTTP sola lettura per impostazione predefinita, opzione di token bearer;
- Studio solo in loopback;
- le impostazioni memorizzano **nomi** di variabili d'ambiente, mai le chiavi API in chiaro;
- controllo di egress: una risorsa confidenziale o una radice dichiarata locale non viene inviata a un modello remoto, verifica fatta **prima** della chiamata;
- il registro `.ai/trace` registra localmente le operazioni mediate.

Sono meccanismi (broker), da distinguere dalle consegne (istruzioni al modello), che restano fallibili.

**2. L'instradamento sceglie, non recupera.** L'instradamento predefinito è 100% locale e lessicale (nessuna rete); restituisce un agente e un processo, oppure si astiene. La sua stabilità è testata: `base route-test` legge delle fixture e fallisce alla minima deriva. Un recupero per similarità, invece, non sarebbe riproducibile in modo identico fixture per fixture. Il ranking semantico resta opzionale e può girare localmente (per esempio tramite Ollama); il **modello** è la scelta dell'utente, fuori dal perimetro di BASE.

**3. Le affermazioni sono cablate a prove e a test.** Lo stato reale è documentato (`docs/reference/etat-implementation.md`) e la copertura è mantenuta e verificata in CI: l'architettura dei test (statico, unitario, contratto, componenti Studio, end-to-end, accessibilità) è descritta in `specs/TESTING.md`, e la prova requisiti verso test nella matrice generata. La CI esegue `base validate` e `npm audit` (escluse le dipendenze di sviluppo, soglia high). Là dove BASE non fornisce una funzione, il presente documento lo dice chiaramente invece di affermarlo.

## Licenza e portata

Il codice è sotto Apache-2.0, la documentazione sotto CC-BY-4.0.

Questa pagina è **informativa**: non costituisce né un parere giuridico né un parere di conformità. Un'istituzione resta responsabile della propria analisi d'impatto (DPIA) e della propria politica di sicurezza. Vedi anche `docs/reference/base-et-vos-outils-ia.md` e `docs/reference/etat-implementation.md`.
