<!-- fr-synced: 8c742e8f9bd13f37f3cd27da36f4a0d2b08711c1 -->

Produrre con l'IA richiede ormai poco sforzo; difenderlo ne richiede molto. La posta in gioco non è quindi scrivere il prompt perfetto, ma **restare colui che mantiene il controllo**: inquadrare, affidare, valutare, aggiustare e sapere, alla fine, ciò che si firma. Questa pagina riunisce quanto serve per riuscirci, dal più semplice al più completo: la spirale che scandisce ogni interazione, cinque pratiche per renderla leggera, poi i sedici principi che le fondano. Potete fermarvi dopo le pratiche e già lavorare bene; scendere fino ai principi significa tenere il metodo nel tempo.

> [Perché BASE: co-pensare con l'IA](./co-penser-avec-lia.md) spiega *perché* la verifica è il cuore della questione. Questa pagina mostra *come*.

## La spirale: inquadrare, affidare, valutare, aggiustare

Lavorare con l'IA segue il più delle volte lo stesso ciclo, **INQUADRARE → AFFIDARE → VALUTARE → AGGIUSTARE**, poi si ricomincia. Non è un segno di inefficienza, è il metodo: i buoni risultati nascono da alcuni giri di questa spirale, non da una singola richiesta perfetta. Le cinque pratiche qui sotto rendono leggero ogni passo. Nessuna richiede di essere esperti: servono tanto alla persona di fretta quanto a chi vuole approfondire.

### 1. Inquadrare con chiarezza

Prima di generare, dite lo scopo, i vincoli e a cosa somiglia una buona risposta. Un quadro netto a monte rende leggera la verifica a valle.

> *«Redigi una risposta a questo cliente scontento. Tono: calmo e fattuale. Vincoli: nessun impegno di rimborso, proponi piuttosto un appuntamento. Una buona risposta riconosce il problema senza promettere ciò che non possiamo mantenere.»*

**Ciò che verificate:** il tono e che nessuna promessa non autorizzata si sia insinuata.
Esempio completo: `exemples/assistant-courrier/`.

### 2. Verificare rispetto alla realtà

Chi produce non può giudicare il proprio lavoro. L'IA propone, voi verificate rispetto ai vostri fatti, ai vostri file, alle vostre regole. È il debito di verifica: non scompare, lo si rende visibile e piccolo.

> *«Su cosa ti basi per questa cifra? Cita la fonte nei miei file.»*

**Ciò che verificate:** che la fonte esista e dica davvero ciò che le si fa dire.
Esempio completo: `exemples/assistant-devis/`, dove il tariffario proviene dai vostri file, non dalla memoria del modello.

### 3. Chiedere una scheda di decisione

Quando più scelte sono aperte allo stesso tempo, un filo di discussione si ingarbuglia. Chiedete una **scheda di decisione**: l'IA pone ogni punto con la sua raccomandazione in testa, voi annotate il vostro accordo e i vostri commenti, poi agisce sull'insieme in una sola volta. Decidete voi, la scheda struttura la decisione.

> *«Più scelte sono aperte. Creami una scheda di decisione: un punto per scheda, la tua raccomandazione per prima, e ti restituisco le mie risposte.»*

- **Quando:** non appena ci sono due o più decisioni da prendere insieme.
- **Ciò che recuperate:** un documento chiaro in cui decidete punto per punto, senza che l'IA decida al vostro posto.
- **Ciò che verificate:** che ogni raccomandazione sia giustificata e che nessun punto già risolto venga riaperto.

Esempio completo: `exemples/assistant-reflexion/`, che sa chiarire una decisione e preparare una nota di decisione.

### 4. Rendere visibili le ipotesi

Una buona interazione non seppellisce ciò che conta. Chiedete all'IA di marcare ciò che resta da confermare invece di presentarlo come acquisito. I marcatori `[A VALIDER]`, `[HYPOTHESE]` e `[A COMPLETER]` si individuano a colpo d'occhio, per voi come per i vostri strumenti.

> *«Marca `[A VALIDER]` tutto ciò che non è confermato, e `[HYPOTHESE]` i punti in cui supponi.»*

**Ciò che verificate:** che le zone di incertezza siano segnalate, non nascoste.

### 5. Iterare, non cercare il prompt perfetto

Il controllo fine fa l'efficienza. Piuttosto che riscrivere dieci volte la consegna, lasciate generare una prima versione, reagite con precisione, aggiustate. L'attrito è produttivo: ogni andata e ritorno vi avvicina, e voi mantenete la comprensione di ciò che cambia.

> *«Ci siamo quasi. Rendi il secondo paragrafo più corto e togli il gergo.»*

**Ciò che verificate:** che ogni versione si avvicini e che capiate ancora ciò che si muove.

Queste pratiche sono calibrate, non anti-automazione: vi mantengono capaci di verificare, senza rallentarvi. Ciò che mettono in pratica sono i sedici principi che seguono.

---

## I sedici principi

Le pratiche qui sopra sono la versione breve; ecco il metodo completo. Esistono numerosi quadri normativi ed etici per regolare l'uso dell'IA. Questi principi non li sostituiscono: danno orientamenti operativi per eccellere all'interno di tali quadri, restando efficaci e responsabili. Si organizzano in sei categorie: portare la propria responsabilità, conoscere i propri vincoli di affidabilità, saper interagire, evitare le trappole comuni, privilegiare il metodo agli strumenti e mantenere il controllo nel tempo.

### I. Portate la vostra responsabilità

#### 1. Siate voi stessi là dove è essenziale

I compiti che fanno appello alla vostra identità personale unica (la vostra voce, il vostro stile, la vostra visione o i vostri valori) devono essere guidati da voi.

Esempi: visione strategica, filosofia d'impresa, identità di marca, firma architettonica.

*Ponetevi la domanda: questo compito richiede ciò che mi rende unico?*

#### 2. Siate umani là dove è essenziale

I compiti che esigono un'esperienza umana (empatia, comprensione incarnata, intuizione morale) devono essere diretti da un essere umano.

Esempi: un messaggio delicato a un collaboratore, la mediazione di un conflitto, una decisione etica, un reclamo cliente sensibile.

*Ponetevi la domanda: questo può davvero essere fatto senza sapere cosa si prova in quanto esseri umani?*

#### 3. Usate l'IA con efficacia

Una volta deciso di usare l'IA, fatelo bene. Minimizzate le iterazioni inutili, le istruzioni vaghe e gli andirivieni superflui. Strutturate le vostre richieste, verificate i risultati ed evitate di usare l'IA per compiti che non può svolgere in modo affidabile.

*Ponetevi la domanda: sto usando l'IA in modo mirato e produttivo, o sto sprecando tempo e risorse?*

#### 4. Verificate rispetto alla realtà

L'IA simula, predice ed emette ipotesi, ma non può testare le sue affermazioni nel mondo reale. Formulare e testare le ipotesi di fronte alla realtà fisica è vostra responsabilità.

Esempi: un preventivo può sembrare corretto ma contenere un prezzo irrealistico per il vostro mercato. Un annuncio di lavoro può sembrare professionale ma ignorare i vostri vincoli locali. Solo voi potete verificare ciò che corrisponde alla vostra realtà.

#### 5. Valutate i rischi, i costi e le alternative

L'IA generativa non è sempre la scelta giusta. Prima di ogni uso, ponderate:

- **I rischi:** riservatezza, distorsione (bias), proprietà intellettuale, autenticità, sovranità dei dati, conformità normativa.
- **I costi:** energia, denaro, tempo, compromessi sulla qualità, dipendenza cognitiva.
- **Le alternative:** algoritmi deterministici, strumenti specializzati, metodi consolidati, competenza umana da sola.

*Ponetevi la domanda: l'IA generativa offre qui un beneficio netto, o un altro approccio sarebbe più sicuro, meno costoso o più efficace?*

*Le pratiche comuni su questi aspetti sono dettagliate in [appendice](#appendice-pratiche-comuni-per-il-principio-5).*

### II. Conoscete i vostri vincoli di affidabilità

#### 6. Siate consapevoli della complessità inerente al compito

Alcuni compiti richiedono fondamentalmente un certo numero di passi, una certa memoria o l'attraversamento di una certa quantità di informazione. Con IA o senza, non possono essere svolti in modo affidabile senza queste risorse. Non sono debolezze dell'IA, ma proprietà del problema: ciò che a voi costerebbe passi intermedi costa all'IA, come a qualsiasi sistema al mondo, lo stesso. In altre parole, l'IA non farà mai magie: nessun risultato aziendale senza lo sforzo che lo produce, nessuna rivoluzione in tutti i campi senza le risorse che essa richiede. Nel migliore dei casi, l'IA alleggerisce o sposta lo sforzo; non lo elimina.

Perché questi limiti dipendono dal problema e non dall'IA, fino alla tesi di Church-Turing: si veda [Perché BASE](co-penser-avec-lia.md), sezione «I limiti del compito, l'IA li condivide».

Esempi: estrarre informazioni attraverso più documenti, verificare la coerenza tra le fonti, sintetizzare punti comuni su volumi importanti.

*Ponetevi la domanda: se dovessi farlo io, avrei bisogno di scorrere molti documenti? Di fermarmi a riflettere? Di prendere appunti? Di seguire un processo preciso? Se sì, l'IA non può semplicemente «indovinare» la risposta in una volta. Anche lei ha bisogno di risorse (tempo e/o capacità di contesto).*

Per questo BASE utilizza **workflow strutturati**: scompongono i compiti complessi in passi gestibili, con punti di controllo regolari.

#### 7. Rivolgetevi ad algoritmi dedicati per ottenere garanzie

Per loro natura, i modelli linguistici non possono fornire garanzie rigorose. Per questo, rivolgetevi ad algoritmi specifici (verificatori, strumenti, processi di correzione degli errori).

Esempi: verificatori di conformità, analizzatori di documenti, verificatori di codice, calcolatori di IVA.

*Ponetevi la domanda: qual è il mio equilibrio rischi-benefici? Per quali elementi ho bisogno di verificatori esterni?*

### III. Sappiate come interagire

#### 8. Trattate la comunicazione uomo-IA come una competenza a sé stante

Il prompt perfetto in una sola volta non risolve granché. Ciò che conta è una comunicazione di qualità e strutturata su più passi, sviluppando un «sesto senso» per individuare ciò che, nelle risposte dell'IA, non corrisponde a quanto produrrebbe un interlocutore umano.

*Ponetevi la domanda: come reagisce l'IA a diverse formulazioni? Con quale frequenza devo intervenire per tenere il mio progetto in carreggiata?*

#### 9. Fornite la conoscenza che conta di più

Non lasciate che l'IA riempia la propria memoria basandosi solo su euristiche vaghe e ricerche superficiali. Del vostro mondo, il modello ritrova solo ciò che avete reso reperibile, alla grana in cui lo avete riposto. Strutturate la vostra conoscenza e puntate verso ciò che è necessario appena potete. E alla giusta maglia: pezzi abbastanza fini da poter indicare quello giusto senza trascinarsi dietro il resto, abbastanza grandi da mantenere il loro senso.

Esempi: puntate verso requisiti estratti piuttosto che verso una pila di verbali di riunione, verso scelte di progettazione piuttosto che verso una documentazione sparsa, verso un elenco di compiti mirato piuttosto che verso l'insieme dei vostri file.

*Ponetevi la domanda: come strutturare l'informazione per avere sempre a portata di mano ciò di cui ho bisogno, anche se riprendo il lavoro tra due mesi?*

È esattamente ciò che fanno i **file di mestiere** in BASE: la vostra identità, la vostra attività, il vostro catalogo, le vostre condizioni, strutturati e sempre aggiornati.

#### 10. Plasmate il funzionamento dell'IA

I passi che la vostra IA segue per impostazione predefinita non vi convengono? Il suo comportamento non vi piace? Plasmateli. Specificate esattamente cosa fare, quando, con quali informazioni o quali strumenti.

È esattamente il ruolo dell'**AGENT.md** e delle **skill** in BASE: plasmano il comportamento dell'IA affinché corrisponda al vostro mestiere.

### IV. Evitate le trappole comuni

#### 11. Non cadete nella trappola della facilità

Interrogare un'IA è facile; ottenere risultati di qualità è spesso impegnativo. Riflettete, strutturate. Restate padroni del processo.

Esempi: bozze non verificate, consigli legali improvvisati, proiezioni finanziarie non controllate.

*Ponetevi la domanda: è meglio ottenere qualcosa in fretta e pagare più tardi in correzioni e opacità, o strutturare per garantire il successo e la trasparenza?*

#### 12. Non cadete nella trappola dell'apparenza

I risultati prodotti dall'IA hanno il più delle volte un aspetto curato, ma ciò non significa che siano corretti. La qualità della scrittura non garantisce né l'esattezza dei fatti né la pertinenza delle raccomandazioni.

Esempi: una diagnosi plausibile ma falsa, un'analisi finanziaria apparentemente solida, un contratto professionale con errori, un preventivo ben formattato con prezzi inventati.

Ogni affermazione accettata senza esame crea un **debito di verifica**: ipotesi non testate che si accumulano e possono crollare al primo sguardo critico di un cliente o di un partner.

#### 13. Non cadete nella trappola del clamore mediatico

I fornitori fanno spesso promesse impressionanti che snaturano ciò che l'IA fa realmente. Imparate a decifrarle:

- *«Il nostro modello non allucina»*: i modelli linguistici generano testo plausibile senza meccanismo interno di verifica fattuale. La verifica è sempre richiesta.
- *«Il nostro modello è addestrato sui vostri dati»*: addestrare un modello da zero costa milioni. «Addestrato sui vostri dati» significa di solito una messa a punto fine (fine-tuning), che adatta il comportamento del modello ma non elimina il rischio fondamentale di allucinazione.
- *«Il nostro modello è totalmente sicuro»*: l'iniezione di prompt (influenzare il comportamento del modello tramite istruzioni indesiderate) è una vulnerabilità strutturale di questi sistemi. Una sicurezza esterna al modello è sempre necessaria.

*Ponetevi la domanda: questa affermazione riflette il reale funzionamento dei modelli linguistici? Promette qualcosa che la tecnologia fondamentalmente non può fornire?*

### V. Il metodo prima degli strumenti

#### 14. Non lasciate che lo strumento detti il processo

La maggior parte dei prodotti di IA non è progettata per aiutarvi a rispettare i principi da 1 a 13. Resistetevi attivamente. Usate gli strumenti che servono il vostro metodo. Progettate strumenti che alzino l'asticella.

BASE è costruito attorno a questo principio: le vostre skill, i vostri template e i vostri dati di mestiere sono il vostro vero capitale. Codificano il vostro saper fare, la vostra competenza, i vostri processi, e sono portabili da uno strumento all'altro. Gli strumenti cambiano in fretta. Una struttura di conoscenze ben organizzata vi servirà per anni.

Un caso particolare merita di essere nominato: **la grammatica degli agenti.** Molti strumenti vi invitano a ritagliare in anticipo il vostro lavoro in «agenti», ruoli e passaggi di consegne, nella loro interfaccia. Ma l'essenziale del lavoro consiste nel seguire il filo del proprio pensiero, fluido, non nel pre-articolarlo in agenti. Mantenere la libertà di pensare qualsiasi processo, compresa una semplice conversazione sui file giusti, fa parte del «non lasciare che lo strumento detti il processo». *(BASE impiega la parola «agente» per restare eseguibile su questi strumenti, che la conoscono, ma un agente BASE è soltanto il vostro Markdown, leggibile e opzionale. Si veda [Perché BASE: co-pensare con l'IA](co-penser-avec-lia.md).)*

### VI. Mantenete il controllo nel tempo

I principi precedenti vi aiutano a produrre bene con l'IA, qui e ora. I due seguenti proteggono qualcosa di più lento da perdere e più difficile da ricostruire: la vostra capacità di restare ai comandi nel corso dei mesi.

#### 15. Mantenete un'intuizione sufficiente per verificare

Potete delegare la granularità all'IA, ma non potete delegare la capacità di giudicare ciò che produce. La verifica (principio 4) presuppone che capiate ancora ciò che verificate. A forza di delegare, si perde poco a poco l'intuizione fine del lavoro, e la verifica degenera allora in una validazione di facciata, senza che ce ne si accorga, perché il risultato «sembra corretto» (principio 12).

Mantenete dunque, in permanenza, abbastanza intuizione per restare un verificatore capace. Potete perdere il dettaglio; non dovete perdere la presa. Questo può richiedere di investire deliberatamente del tempo per ricaricare la visione d'insieme nella vostra stessa testa: rileggere in profondità, discutere in squadra ciò che è stato prodotto e perché, rifare voi stessi di tanto in tanto un frammento del lavoro.

*Ponetevi la domanda: se l'IA scomparisse domani, capirei ancora abbastanza di ciò che ha prodotto da difenderlo davanti a un cliente? La mia intuizione è ancora all'altezza di ciò che firmo?*

**Una tensione da conoscere.** BASE cerca di rendere la verifica *leggera* (struttura forte a monte → verifica leggera a valle). È un vantaggio, ma portato all'estremo è anche il meccanismo attraverso cui ci si allontana dalla materia. La struttura deve alleggerire la verifica, mai svuotarla del suo senso.

#### 16. Mantenete la sovranità sul vostro dispositivo

Lavorare con l'IA significa operare un dispositivo fatto di più strati: i vostri file, che padroneggiate, e le istruzioni iniettate dallo strumento (prompt di sistema, regole, politiche del fornitore) che non sempre vedete. Perdere la sovranità significa operare un'IA plasmata da istruzioni esterne senza trasparenza su ciò che struttura realmente la vostra interazione.

BASE vi rende sovrani sul *vostro* strato: i vostri AGENT.md, le vostre skill e i vostri dati sono leggibili, portabili e vi appartengono (principio 14). Restate lucidi sugli strati che non scrivete: esigete trasparenza su ciò che lo strumento inietta, preferite i dispositivi verificabili e tenete il vostro sapere in file che potete portare altrove. La portabilità condiziona la vostra sovranità: vi lascia andare il giorno in cui lo strumento non vi conviene più.

*Ponetevi la domanda: so cosa, in questo dispositivo, orienta il comportamento dell'IA? Se lo strumento cambiasse domani le sue regole invisibili, lo saprei, e potrei andarmene?*

---

## La spirale del co-pensiero

Lavorare efficacemente con l'IA segue il più delle volte lo stesso ciclo:


```
    ┌──────────────┐
    │  1. CADRER   │  Formuler clairement ce que vous voulez,
    │              │  avec le contexte nécessaire
    └──────┬───────┘  (principes 1, 2, 5, 9, 10)
           │
    ┌──────▼───────┐
    │  2. CONFIER  │  L'IA génère dans le cadre défini,
    │              │  jusqu'au prochain point de contrôle
    └──────┬───────┘  (principes 3, 6)
           │
    ┌──────▼───────┐
    │  3. ÉVALUER  │  Vous vérifiez : est-ce correct ?
    │              │  Est-ce que ça correspond à ma réalité ?
    └──────┬───────┘  (principes 4, 7, 8, 11, 12)
           │
    ┌──────▼───────┐
    │  4. AJUSTER  │  Vous précisez, corrigez, enrichissez
    │              │  → retour à l'étape 2
    └──────────────┘
```

**Il principio chiave:** struttura forte a monte → verifica leggera a valle. Struttura debole a monte → debito di verifica esplosivo.

I principi 15 e 16 non si legano a una fase precisa della spirale. Proteggono la vostra capacità di tenerla nel tempo: mantenere abbastanza intuizione perché il passo *Valutare* resti reale, e mantenere la sovranità sul dispositivo che esegue l'intera spirale.

---

## In sintesi

| # | Principio | In una frase |
|---|----------|---------------|
| | **I. Portate la vostra responsabilità** | |
| 1 | Siate voi stessi là dove è essenziale | La vostra voce, la vostra visione, i vostri valori sono insostituibili |
| 2 | Siate umani là dove è essenziale | L'empatia e l'intuizione morale esigono l'esperienza umana |
| 3 | Usate l'IA con efficacia | Strutturate le vostre richieste, non sprecate le risorse |
| 4 | Verificate rispetto alla realtà | L'IA emette ipotesi, solo voi potete testare nel mondo reale |
| 5 | Valutate rischi, costi e alternative | L'IA non è sempre la scelta giusta |
| | **II. Conoscete i vostri vincoli** | |
| 6 | Complessità inerente al compito | Compito complesso = risorse necessarie, non una sola richiesta |
| 7 | Algoritmi dedicati per le garanzie | I modelli linguistici non possono garantire l'esattezza |
| | **III. Sappiate interagire** | |
| 8 | Comunicazione come competenza | Il prompt perfetto unico non esiste, iterate |
| 9 | Fornire la conoscenza che conta | Strutturate alla giusta grana e puntate, non lasciate indovinare l'IA |
| 10 | Plasmare il funzionamento | Definite il processo, il comportamento, i passi |
| | **IV. Evitate le trappole** | |
| 11 | Trappola della facilità | Chiedere è facile, ottenere un buon risultato è impegnativo |
| 12 | Trappola dell'apparenza | Testo fluido non è uguale a testo corretto |
| 13 | Trappola del clamore mediatico | Decifrate le promesse commerciali |
| | **V. Il metodo prima degli strumenti** | |
| 14 | Lo strumento non detta il processo | La vostra struttura di conoscenze è il vostro vero capitale |
| | **VI. Mantenete il controllo nel tempo** | |
| 15 | Mantenete un'intuizione sufficiente per verificare | Delegate la granularità, mai la capacità di giudicare |
| 16 | Mantenete la sovranità sul vostro dispositivo | Sappiate cosa plasma l'IA; tenete un modo per andarvene |

---

## Guide di decisione

Queste guide rendono operativi i principi qui sopra in situazioni concrete.

### Guida 1: «L'IA è la scelta giusta?» (Principi 1, 2, 5)

Quattro domande, in quest'ordine:

1. **Questo compito richiede ciò che mi rende unico?** (la mia voce, il mio stile, la mia visione, i miei valori)
   → Se sì: **fatelo voi stessi.** L'IA può strutturare, non sostituire la vostra identità. *(Principio 1)*

2. **Questo compito esige un'esperienza umana?** (empatia, intuizione, giudizio morale)
   → Se sì: **dirigetelo voi stessi.** L'IA può preparare, non sentire. *(Principio 2)*

3. **Il beneficio giustifica i rischi e i costi?** (riservatezza, affidabilità, tempo di verifica)
   → Se no: **usate un'alternativa.** Un foglio di calcolo, un modello esistente, un metodo collaudato. *(Principio 5)*

4. → Se sì: **usate l'IA con struttura.** Strutturate la richiesta, fornite la conoscenza, verificate il risultato. *(Principi 3, 6, 9, 10)*

### Guida 2: «Quando iterare vs. andare avanti» (Principi 8, 11, 12)

Se usate i marcatori BASE nei vostri documenti:

- **`[A VALIDER]` presente** → iterare. Una proposta non è stata confermata.
- **`[A COMPLETER]` presente** → iterare. Manca un'informazione.
- **`[ATTENTION]` presente** → valutare il rischio. Si può andare avanti malgrado l'allerta, o bisogna trattarla?
- **Nessun marcatore, risultato verificato** → andare avanti. Il lavoro è completo.

Senza marcatori, vale la stessa logica: andate avanti quando avete verificato rispetto alla realtà *(Principio 4)*, non quando il testo «sembra buono» *(Principio 12)*.

### Guida 3: «Valutare la qualità di un agente» (Principio 10)

| Criterio | Base | Buono | Eccellente |
|---------|---------|-----|-----------|
| **Routing** | L'agente comprende 1-2 intenzioni | Copre tutte le intenzioni comuni | Gestisce le intenzioni ambigue con domande di chiarimento |
| **Workflow** | Passi elencati | Punti di decisione prima di ogni azione irreversibile | Riformulazioni frequenti + punti di decisione rari e precisi + giornale |
| **Conoscenze** | Informazioni generiche | Cifre precise, terminologia esatta, regole aggiornate | Aggiornate regolarmente con dati reali del mestiere |
| **Dati** | Segnaposto ovunque | Identità e condizioni compilate | Catalogo, clienti e storico aggiornati |

---

## Appendice: quando la vostra pratica cresce

### Multi-agenti

Se avete più attività distinte, un agente per attività è spesso più efficace di un agente che fa tutto. Segnale: quando un agente ha più di 5 workflow, considerate di scinderlo.

### Conoscenze condivise

Le competenze standard (comunicazione, marcatori, giornale) sono identiche tra gli agenti. Altre conoscenze possono essere condivise tra agenti tramite percorsi relativi (ad es. le informazioni aziendali).

### Lavoro in squadra

Se più persone usano lo stesso agente:
- Versionate i file con Git per rendere i cambiamenti visibili e discutibili
- Condividete i workflow e le conoscenze che devono davvero essere comuni
- Separate i dati di mestiere quando ruoli, clienti, paesi, entità giuridiche o livelli di sensibilità lo esigono
- Il giornale permette di vedere ciò che le altre sessioni hanno prodotto

Per una grande organizzazione, questo livello resta una convenzione di lavoro. Deve essere completato dai meccanismi ufficiali di diritti di accesso, classificazione, audit, conservazione e revisione di conformità.

### Segnali di complessità

- Più di 5 workflow → scindete l'agente
- Più di 3 agenti → considerate un router comune
- Workflow che durano più di 10 passi → suddividete in sub-workflow
- Conoscenze che superano 200 righe → suddividete in sotto-domini

---

## Adattamento tra modelli

I modelli di IA evolvono in fretta, e ne esistono più famiglie. Un workflow che funziona perfettamente con uno può richiedere aggiustamenti con un altro. I punti che variano di più:
- La lunghezza del contesto (quanti file caricabili simultaneamente)
- La tendenza a seguire le istruzioni vs. improvvisare
- La qualità dei calcoli e della formattazione

**Regola pratica:** se il risultato è deludente, il problema è raramente il modello: è spesso il workflow che non è abbastanza strutturato. Aggiungete esempi di dialogo, precisate i formati attesi, suddividete in passi più corti.

---

## Appendice: pratiche comuni per il principio 5

**Rischi inerenti all'IA generativa** (derivanti dalla sua natura statistica):

- **Riservatezza:** l'IA comprende il concetto di privato vs pubblico, ma non può sapere cosa è privato per voi nei vostri dati. Non esponete mai dati sensibili a sistemi non controllati.
- **Distorsione (bias):** l'IA apprende schemi a partire dai dati di addestramento. Scrutinate i risultati, in particolare quelli che coinvolgono persone.
- **Proprietà intellettuale:** i modelli di IA possono essere stati addestrati su contenuti protetti. Verificate le licenze e i diritti prima di diffondere contenuti generati.
- **Autenticità:** il risultato dell'IA somiglia per concezione a un contenuto umano. Segnalate l'uso dell'IA quando l'autenticità o la tracciabilità sono importanti.
- **Sovranità dei dati:** le vostre interazioni possono essere usate per addestrare i modelli. Verificate le politiche di protezione dei dati e disattivate le opzioni di riutilizzo se necessario.
- **Conformità normativa:** assicuratevi che il vostro uso rispetti le normative in vigore e le direttive della vostra organizzazione.

**Costi** (diretti e indiretti):

- Energia, costi finanziari, tempo speso a concepire le istruzioni e a verificare, perdita di qualità che richiede correzioni, dipendenza cognitiva.

**Alternative** (spesso più affidabili o efficienti):

- Algoritmi deterministici per la ricerca, il calcolo, la verifica.
- Strumenti specializzati concepiti per il compito.
- Metodi consolidati (liste di controllo, modelli, processi).
- Competenza umana da sola quando è sufficiente.

---

## Per approfondire

- **Comprendere l'approccio**: [Comprendere BASE e plasmare l'interazione con l'IA](comprendre.md), anatomia di un agente, perché funziona, portabilità.
- **Diffondere in un'organizzazione**: [L'adozione in un'organizzazione](adoption-organisation.md), come una pratica individuale diventa un uso di squadra e poi di istituzione.
- **Iniziare in pratica**: il [tutorial «Imparare facendo»](../tutoriel/index.md), passo dopo passo.
- **Galleria di idee**: [idees-agents.md](../guides/idees-agents.md), decine di esempi di agenti per mestiere.
- **Creare il vostro assistente**: aprite la cartella di un assistente in uno strumento di IA capace di leggere i vostri file e dite «Vorrei creare un assistente per [il vostro mestiere]».

---

*Adattato dai [principi di co-pensiero uomo-IA](https://a-i.swiss) di AI Swiss.*

BASE è un framework di [AI Swiss](https://a-i.swiss). Casi d'uso in partnership con [Innovaud](https://innovaud.ch).
