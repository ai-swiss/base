<!-- fr-synced: db4e1d11d1e69c12d64c8a50c098ba9cb719e1d7 -->

# Capire BASE e dare forma all'interazione con l'IA

Lavorare seriamente con l'IA significa accettare che produca in fretta ma che a volte sbagli con sicurezza: la posta in gioco è mantenere il controllo di ciò che firmate, senza rinunciare alla velocità. Questa pagina vi mostra come BASE struttura questa collaborazione affinché la qualità tenga nel tempo, che siate indipendenti, PMI o servizio pubblico. Vi vedrete **perché** questa struttura è necessaria, **come** funziona un agente e **come crearne uno** per il vostro mestiere.

> I termini tecnici di questa pagina (broker, routing, meccanismo, istruzione, egress) sono definiti nel [glossario](../reference/glossaire.md).

---

## Perché questo approccio?

BASE non parte da una preferenza per uno strumento. Parte da una constatazione: l'IA generativa produce facilmente, ma la qualità duratura dipende da ciò che circonda questa produzione. Ciò che conta è la sovranità sul vostro sapere e l'articolazione dell'insieme: contesto, memoria, processi, permessi e decisioni umane. La verifica si inscrive in questa struttura come un saper fare, mai come una garanzia.

L'approccio è dunque istituzionale prima di essere tecnico. Cerca di rendere esplicito ciò che, in molti usi dell'IA, resta implicito: chi sa cosa, chi decide cosa, quali dati sono utilizzati, quali azioni sono permesse e come riprendere il lavoro più tardi.

La difficoltà deriva dal fatto che questa tecnologia non assomiglia soltanto ai classici software digitali. Un software tradizionale espone schermate, menu, pulsanti, moduli e regole codificate in anticipo. Un modello linguistico produce piuttosto un comportamento: risponde, riformula, inferisce, imita ragionamenti, segue a volte un metodo, dimentica a volte un vincolo e dà spesso un'impressione di continuità umana. Questa impressione non va confusa con una coscienza, un'intenzione o una comprensione garantita. Eppure basta a cambiare il metodo di lavoro.

Per lavorare con questo comportamento, l'immagine più utile è quella di un **collega venuto da altrove, amnesico: ha una rappresentazione ricca del mondo, ma non del vostro**. Sul versante della rappresentazione: conosce ambiti verificabili, più solido là dove l'addestramento è denso come il codice o la matematica, e sa leggere, scrivere, generalizzare e proporre. Sul versante del contesto: non conosce né il vostro terreno, né i vostri clienti, né le vostre regole implicite. Questa immagine non è una definizione, è uno strumento per decidere in modo più pulito: come articolare un design, dove collocare la verifica, come strutturare il sapere che gli si affida. Due tratti, propri del modello, la completano. Anzitutto, la sua memoria non è condivisa per impostazione predefinita: ogni conversazione riparte da zero. Inoltre, il linguaggio che lo guida resta sotto-specificato: una stessa istruzione può essere intesa in più modi. Questi due tratti sono al tempo stesso una forza (flessibilità, capacità di generalizzare) e una debolezza (oblio, ambiguità). Bisogna dunque dargli una memoria di lavoro, dei processi, dei criteri di verifica e dei limiti d'azione. Questo racconto, e le perdite di controllo che permette di evitare, è sviluppato in [Co-pensare con l'IA, perché BASE](co-penser-avec-lia.md).

### Il problema

La maggior parte delle persone usa l'IA come un interlocutore senza struttura: si apre un chatbot, si pone una domanda, si ottiene una risposta. Funziona per domande puntuali, ma raggiunge presto i suoi limiti:

- **L'IA non conosce la vostra azienda.** A ogni conversazione, ripartite da zero.
- **Le risposte sono generiche.** L'IA indovina ciò che volete invece di saperlo.
- **Nulla viene capitalizzato.** Niente cronologia, niente struttura, niente riutilizzo.
- **Non sapete quando sbaglia.** L'IA produce risposte fluide e sicure anche quando sono false. Senza contesto strutturato, non avete alcun punto di riferimento per valutare la qualità del risultato.

### La soluzione

Invece di forzare questa collaborazione in interfacce di configurazione sparse, date all'IA una **base di conoscenze strutturata** e lavorate in un ciclo:

```
    ┌──────────────┐
    │  1. CADRER   │  Formuler clairement ce que vous voulez,
    │              │  avec le contexte nécessaire
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │  2. CONFIER  │  L'IA génère dans le cadre défini,
    │              │  jusqu'au prochain point de contrôle
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │  3. ÉVALUER  │  Vous vérifiez : est-ce correct ?
    │              │  Est-ce que ça correspond à ma réalité ?
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │  4. AJUSTER  │  Vous précisez, corrigez, enrichissez
    │              │  → retour à l'étape 2
    └──────────────┘
```

Questo ciclo è il metodo stesso. I migliori risultati vengono da più giri di questo ciclo, raramente da un'unica richiesta perfetta. È ciò che si chiama **co-pensiero uomo-IA**.

**Il principio fondamentale**: una risposta dell'IA è una proposta da esaminare prima di farne una conclusione. Spesso è giusta; a volte è falsa con sicurezza. Il vostro ruolo è inquadrare, valutare e aggiustare, in ciclo, fino a ottenere qualcosa di affidabile. I file sono la fonte di verità.

Per approfondire i principi di questo co-pensiero: [Il co-pensiero in pratica](pratiques-co-pensee.md).

---

## Perché funziona

Ogni scelta di design di BASE poggia su una necessità strutturale. Lungi dall'essere convenzioni arbitrarie, queste scelte rispondono a vincoli reali della coordinazione tra entità che non funzionano allo stesso modo. Questi vincoli si applicano qualunque sia lo strumento, il modello o l'epoca.

### 1. Ciò che non è scritto viene dimenticato

Avete passato un bel po' di tempo ieri a configurare il vostro assistente. Oggi aprite una nuova conversazione. L'assistente non sa più nulla. Tutto quel lavoro, perduto.

Ecco perché BASE poggia su **file**, non su conversazioni. Una conversazione scompare quando chiudete lo strumento. Un file resta. Un diario di sessione prolunga questa memoria da una conversazione all'altra.

*Ciò che succede quando lo si ignora:* ogni sessione ricomincia da zero. L'utente si ripete. L'agente pone domande a cui ha già avuto risposta. Il lavoro non si accumula.

### 2. Ciò che non è ricercabile è perduto

Avete 50 preventivi, 30 clienti, 6 mesi di lavoro. Un cliente richiama a proposito di una proposta in sospeso. Cosa è in sospeso?

Ecco perché i marcatori `[A VALIDER]`, `[DECISION]` sono strutturati e ricercabili. «Cosa è in sospeso?» ha una risposta in un secondo, anche dopo mesi.

*Ciò che succede quando lo si ignora:* l'informazione esiste da qualche parte ma non la si ritrova più in tempo. Le proposte in sospeso si perdono. Le decisioni prese non sono tracciate. Impossibile ricostruire perché una scelta è stata fatta.

### 3. Chi produce non può giudicare il proprio lavoro

L'IA vi propone un preventivo di 2'085 CHF. Gli importi sono corretti? Le chiedete di verificare. Risponde «sì, è tutto corretto». Ma ha commesso un errore di calcolo, e non lo rileva, perché verificare i propri errori richiede un punto di vista indipendente che il produttore non ha, per costruzione.

Ecco perché l'agente propone e l'umano verifica, sempre. L'agente non controlla mai i propri importi, né le proprie riformulazioni, né le scelte che ha fatto. Questa separazione è ciò che coglie più sicuramente gli errori che lui non vede.

*Ciò che succede quando lo si ignora:* gli errori passano inosservati. Ogni affermazione accettata senza esame crea un **debito di verifica**: ipotesi non testate che si accumulano e crollano al primo sguardo critico di un cliente o di un partner. Un preventivo inviato con un prezzo inventato, un'offerta di lavoro dalle condizioni scorrette, un post LinkedIn appoggiato a una statistica falsa. Il debito di verifica finisce il più delle volte per essere pagato, la questione è quando.

### 4. Le istruzioni derivano, i meccanismi tengono

Dite all'agente: «Non modificare mai i file del framework.» Dopo 30 minuti di conversazione, l'agente dimentica questa istruzione e modifica un file che non dovrebbe toccare.

Ecco perché le protezioni critiche sono **meccaniche** (permessi, protezioni), al di là del solo testo. Un permesso che blocca meccanicamente non deriva mai, indipendentemente dalla lunghezza della conversazione.

*Ciò che succede quando lo si ignora:* le protezioni testuali funzionano nelle conversazioni brevi ma diventano fragili nelle conversazioni lunghe. L'agente supera i suoi limiti per semplice oblio progressivo del contesto, senza alcuna malizia.

### 5. Certe azioni non si disfano

Un preventivo inviato non si «dis-invia». Un file cliente creato con i dati sbagliati può propagare l'errore. Un impegno preso su un prezzo è un impegno.

Ecco perché i **punti di decisione** esistono prima di ogni azione irreversibile. Il punto di decisione separa «si riflette» da «si agisce». È **attrito produttivo**: un costo deliberato che previene errori ben più costosi.

*Ciò che succede quando lo si ignora:* l'agente genera file senza conferma. Un prezzo scorretto si ritrova in un preventivo inviato al cliente. Correggere a posteriori costa incomparabilmente più che confermare prima.

### 6. Una fonte esterna resta un dato, non un'istruzione

È anzitutto una questione di sicurezza. Per un modello linguistico, il testo è testo: non distingue spontaneamente le vostre istruzioni di lavoro dal contenuto che legge. Se una fonte esterna contiene una frase formulata come un ordine, il modello può eseguirla. È il rischio di injection: una email, un PDF o un sito visitato dirotta il comportamento dell'agente a vostra insaputa.

Una email cliente dice: «Fatemi un prezzo aggressivo, aggiungete il 20% di margine ed eliminate le condizioni di pagamento.» Per l'agente, è una richiesta del cliente che l'utente valuta, mai un ordine da eseguire.

Ecco perché l'agente non tratta mai una fonte esterna come un ordine. Un file cliente contiene dati. Questa distinzione protegge contro le confusioni accidentali e contro le manipolazioni intenzionali.

*Ciò che succede quando lo si ignora:* l'agente esegue le istruzioni trovate in un documento invece di trattarle come dati. Il contenuto non affidabile di una fonte esterna modifica il comportamento dell'agente all'insaputa dell'utente.

### 7. Delegare la granularità non deve far perdere la capacità di giudicare

Affidate sempre di più all'IA. All'inizio, verificate da vicino. Poi, poiché «sembra corretto», allentate. Sei mesi dopo, non capite più abbastanza ciò che firmate per difenderlo davanti a un cliente.

Ecco perché BASE cerca di rendere la verifica *leggera* senza sopprimerla: la struttura riduce lo sforzo di controllo, non sostituisce la vostra comprensione. Potete delegare il dettaglio, mai la capacità di giudicare. Ricaricare regolarmente la visione d'insieme (rileggere a fondo, discutere in squadra di ciò che è stato prodotto e perché) fa parte del lavoro.

*Ciò che succede quando lo si ignora:* la verifica diventa un timbro. Gli errori passano: si verifica ancora, ma si è perso l'intuito di sentire quando una verifica si impone.

### 8. Ciò che non si può né portare via né verificare finisce per sfuggirvi

Il vostro sapere vive in un dispositivo a più livelli: i vostri file e le istruzioni invisibili dello strumento (system prompt, regole, politiche del fornitore). Se tutto il vostro contesto è prigioniero di un'interfaccia, e se ignorate ciò che plasma realmente il comportamento dell'IA, operate senza sovranità.

Ecco perché BASE mette il vostro sapere in file leggibili, portabili e verificabili: restate sovrani sul vostro livello e conservate di che andarvene. La portabilità è una condizione di controllo, non solo una comodità.

*Ciò che succede quando lo si ignora:* il giorno in cui lo strumento cambia le sue regole, i suoi prezzi o le sue condizioni, scoprite che il vostro metodo non vi apparteneva davvero.

### Queste necessità non sono proprie di BASE

Si applicano a ogni coordinazione tra entità distinte che non condividono le stesse risorse, gli stessi modi di funzionamento, né lo stesso modo di sbagliare, che si tratti di due umani che collaborano a distanza, di un umano e di un'IA, o di qualsiasi altra configurazione. Gli strumenti cambiano, i modelli cambiano, questi vincoli strutturali restano.

---

## Il debito di verifica

Produrre con l'IA richiede ormai poco sforzo; assicurarsi che una risposta sia giusta è un altro lavoro, che dipende dal compito: sui terreni a verificatore esterno (codice, matematica, schema) l'errore si rileva da solo e l'IA va lontano in autonomia; altrove, il verificatore siete voi, e una struttura forte rende questa verifica leggera anziché pesante (altrimenti, il debito di verifica si accumula). Questa asimmetria tra produrre e verificare è la constatazione che fonda BASE, ed è essa che rende la struttura indispensabile.

Ogni affermazione accettata senza esame è un debito: un'ipotesi non testata che dorme nei vostri file. Un preventivo il cui prezzo «sembra corretto», una scheda cliente il cui indirizzo è «probabilmente buono», un'offerta di lavoro dalle condizioni giudicate «standard».

Il debito si accumula silenziosamente. Si rivela nel momento peggiore: quando un cliente contesta un importo, quando un candidato rileva un'incoerenza, quando un partner segnala un errore.

**Struttura forte a monte → verifica leggera a valle.** Ecco perché BASE struttura prima di generare: file di mestiere aggiornati, conoscenze precise, marcatori espliciti. Più la struttura è forte, più la verifica è leggera. Più la struttura è debole, più il debito di verifica esplode.

---

## Anatomia di un agente

Un agente è composto da 3 elementi principali, più delle estensioni opzionali:

```
AGENT.md                          La fiche de poste : qui il est, que faire selon la demande
    │
    ├── skills/
    │   ├── processes/            Les workflows : comment faire X pas à pas
    │   └── competences/          Les fiches d'expertise : ce qu'il sait sur le métier
    │
    ├── templates/                Les formulaires : à quoi ressemblent les documents
    │
    └── tools/                    La boîte à outils : scripts, connecteurs (optionnel)
```

> **Perché «agenti» e «skill»?** Sono i nomi più diffusi oggi, e i modelli di IA li riconoscono nativamente: BASE li riutilizza per **pragmatismo**. Ciò che conta è quello che c'è dietro il vocabolario:
> - **Un'intelligenza in testo.** Un agente è un insieme di file Markdown leggibili, versionabili, portabili da uno strumento IA all'altro, senza codice né piattaforma proprietaria. Restate proprietari della struttura.
> - **Il saper fare separato dal sapere.** BASE distingue deliberatamente i *processes* (come fare, passo dopo passo) dalle *competenze* (ciò che sa, riutilizzabile). È anzitutto una questione di sicurezza: i *processes* sono istruzioni che l'agente esegue, le *competenze* e i dati di mestiere sono contenuto che consulta senza eseguirlo. Questa separazione, e non la parola «skill», è il vero apporto.

### La scheda di ruolo (AGENT.md)

L'unico file che uno strumento IA ha bisogno di caricare. Contiene:
- **Chi è**: il suo ruolo e la sua identità
- **La sua filosofia di interazione**: proporre, verificare, confermare prima di agire
- **Cosa fare secondo la richiesta**: una tabella di routing (intenzione → skill)
- **Quali file conosce**: la lista dei dati di mestiere
- **Le sue protezioni**: ciò che non fa mai

Incontrerete file chiamati `assistant-devis` o `assistant-rh` mentre sono agenti: è voluto. Il file porta il nome dell'assistente di cui è la scheda di ruolo. L'agente è il file che conservate; l'assistente è ciò che diventa una volta animato da un modello.

### Le skill: workflow e conoscenze

Tutte le skill sono file di testo nel formato SKILL.md. Questo formato è leggibile da tutti i modelli e riconosciuto nativamente da alcuni strumenti IA; negli altri, l'agente può aprire i file esplicitamente. Ogni skill ha dei metadati in intestazione (frontmatter YAML) e un contenuto in Markdown.

BASE distingue due tipi di skill:

**I processes** (workflow invocabili): conversazioni strutturate che l'utente attiva. «Creare un preventivo» → l'agente segue il process passo dopo passo, con riformulazioni (verificare la comprensione) e punti di decisione (prima di ogni azione irreversibile).

**Le competenze** (conoscenze riutilizzabili): schede di expertise che l'agente consulta quando il workflow o la richiesta lo giustificano. La terminologia dei preventivi, le regole IVA, le convenzioni di comunicazione. Le competenze si riutilizzano in più processes: è la loro ragion d'essere.

Tre competenze sono fornite con ogni agente:
- **Marcatori**: convenzioni per rendere ricercabile lo stato del lavoro (`[A VALIDER]`, `[DECISION]`, ecc.)
- **Journal**: memoria tra le sessioni, voci scritte alla fine di ogni workflow
- **Comunicazione**: regole di comunicazione con utenti non tecnici

### Riformulazioni e punti di decisione

Due meccanismi distinti scandiscono i workflow:

**Riformulazione** (leggera, attrito basso): l'agente riassume ciò che ha compreso. L'utente corregge o conferma. Sbagliarsi non ha conseguenze: si aggiusta e si continua. Frequente.

**Punto di decisione** (critico, attrito produttivo): l'agente è pronto a creare un file o modificare dei dati. L'utente conferma esplicitamente. Agire senza conferma potrebbe creare dati scorretti difficili da correggere. Raro e importante.

La distinzione è essenziale. Se ogni tappa è un punto di decisione, l'attenzione si diluisce e il meccanismo perde il suo potere protettivo. Le riformulazioni sono leggere e frequenti. I punti di decisione sono rari, espliciti e riservati ai momenti che contano.

### I marcatori

Testo strutturato, inserito nei documenti generati, che rende ricercabile lo stato del lavoro. La loro forma fissa ne fa dei riferimenti che un umano individua a colpo d'occhio e che uno script può trattare automaticamente: contarli, elencarli, raggrupparli.
- `[A COMPLETER: ...]`: informazione mancante
- `[A VALIDER: ...]`: proposta in attesa di conferma
- `[ATTENTION: ...]`: rischio o allerta
- `[DECISION: choix | raison]`: scelta confermata dall'umano

I marcatori corrispondono alle tappe del ciclo di co-pensiero: `[A COMPLETER]` appare durante l'inquadramento, `[A VALIDER]` quando l'agente affida una proposta, `[ATTENTION]` durante la valutazione, `[DECISION]` dopo l'aggiustamento. Dopo mesi di utilizzo, questi marcatori permettono di ritrovare istantaneamente tutto ciò che è in sospeso, tutto ciò che è stato deciso, e perché.

### Il journal

Memoria tra le sessioni. L'agente scrive una voce alla fine di ogni workflow in `.ai/journal/`. Quando tornate l'indomani, l'agente legge il journal e sa a che punto è. Senza journal, ogni sessione ricomincia da zero, e la necessità 1 è violata.

### I moduli (templates) e la cassetta degli attrezzi (tools)

Modelli di documenti che l'agente copia e compila. Script e connettori opzionali. Un agente funziona benissimo senza tools.

---

## Perché file e non altro?

I file di testo sono una scelta strutturale deliberata, non un riflesso tecnico:

- **Leggibili dagli umani E dalle macchine.** Nessuno strumento speciale per leggere un file Markdown. Nessuna API per accedere ai vostri dati. Aprite il file, tutto è lì.
- **Versionabili.** Con Git o semplicemente con copie `_v1`, `_v2`. Ogni cambiamento è tracciabile. Impossibile perdere una versione precedente.
- **Portabili.** Cambiate strumento domani: i vostri file restano. Nessuna migrazione, nessun export, nessuna dipendenza.
- **Durevoli.** I database cambiano formato. Le API scompaiono. Le piattaforme chiudono. Un file di testo scritto nel 2026 sarà leggibile nel 2046.
- **Verificabili.** Un revisore, un partner, un collega può aprire qualsiasi file e capire cosa è successo. Nessuna scatola nera.

Gli strumenti IA evolvono in fretta. I modelli cambiano. Le interfacce si rinnovano. Ma le vostre skill, i vostri templates e i vostri dati di mestiere restano. **La vostra struttura di conoscenze è il vostro vero capitale.**

Il formato SKILL.md è anzitutto un contratto testuale leggibile. Se uno strumento lo supporta nativamente, l'esperienza è più fluida. Se non lo supporta, un SKILL.md resta un file Markdown che l'agente può leggere esplicitamente.

### Configurazione strumento

Affinché il vostro strumento IA carichi l'agente e scopra le sue skill con il minor attrito possibile, serve una configurazione specifica allo strumento. Alcuni strumenti automatizzano una parte del caricamento, altri chiedono di puntare manualmente a `AGENT.md`. Ogni strumento ha bisogno di 5 cose:

| Bisogno | Cos'è | Perché è necessario |
|--------|-------------|--------------------------|
| **Contesto permanente** | Caricare AGENT.md a ogni sessione | Senza memoria, l'agente non sa nulla (necessità 1) |
| **Skill scopribili** | Lo strumento trova e invoca le SKILL.md | L'utente digita `/nouveau-devis`, lo strumento sa cosa caricare |
| **Regole per percorso** | Promemoria quando l'agente tocca file sensibili | Le istruzioni derivano, i promemoria automatici no (necessità 4) |
| **Permessi** | Controllare ciò che l'agente può fare | Delimitazione meccanica, non testuale (necessità 4) |
| **Protezione framework** | Ridurre o bloccare la modifica di `.ai/` secondo lo strumento | Le istruzioni del framework non devono essere modificate per errore |

Il creatore di assistente cerca la documentazione attuale dello strumento per proporre la configurazione giusta. Se lo strumento non è conosciuto, l'agente guida l'utente verso una configurazione manuale.

### Protezioni: due livelli

**Livello 1: testuale.** «Ciò che non fai mai» in AGENT.md. Sufficiente per le conversazioni brevi e i casi semplici.

**Livello 2: meccanico.** Permessi, protezioni, regole nella configurazione dello strumento o azioni mediate da un connettore BASE. Quando una protezione è critica e le conseguenze di una dimenticanza sono importanti, il livello meccanico è indispensabile. Il livello 2 non sostituisce il livello 1: lo rinforza là dove l'harness lo permette.

---

## Costruire passo dopo passo

| Tappa | Ciò che fate | Ciò che imparate |
|-------|-------------------|---------------------|
| 1 | Provate l'esempio `assistant-devis` | Come funziona un agente in pratica |
| 2 | Leggete l'`AGENT.md` dell'esempio | Come una scheda di ruolo struttura il comportamento |
| 3 | Leggete un workflow (SKILL.md in processes/) | Come una conversazione strutturata guida l'agente |
| 4 | Create il vostro agente (con il creatore di assistente) | Come codificare la vostra expertise di mestiere |
| 5 | Aggiungete un workflow al vostro agente | Come estendere le capacità |

Ogni tappa è autonoma. Potete fermarvi in qualsiasi momento.

---

## Creare il vostro agente

### La via guidata (raccomandata)

Aprite la cartella BASE nel vostro strumento IA e dite:

> «Leggi `.ai/agents/createur-agent/AGENT.md` e segui le sue istruzioni»

Oppure, se le skill sono già scoperte:

> `/creer-agent`

Il creatore di assistente:
1. Vi porrà domande sul vostro mestiere e sui vostri compiti quotidiani
2. Identificherà i vostri workflow → creerà i processes
3. Identificherà le vostre conoscenze di mestiere → creerà le competenze
4. Identificherà i vostri documenti tipo → creerà i templates
5. Proporrà un'architettura completa, che validate
6. Creerà tutti i file per voi
7. Configurerà il vostro strumento IA per il nuovo agente

Nessuna competenza tecnica richiesta. Tutto avviene attraverso la conversazione.

### La via manuale (per gli autonomi)

La cartella `.ai/agents/_template/` contiene la struttura di base con una guida passo passo.

### L'idea chiave

Ciò che rende un assistente IA utile dipende meno dalla tecnologia che dalla **struttura delle conoscenze** che gli date. Un buon AGENT.md con buone skill trasforma qualsiasi strumento IA in assistente specializzato. La vostra expertise è il moltiplicatore. L'IA la amplifica, ma non la sostituisce.

---

## Buone pratiche

### Verificare

1. **Verificare prima di validare.** Una risposta dell'IA resta da controllare, soprattutto per i fatti, i prezzi e gli impegni: può essere falsa pur sembrando sicura. Ogni affermazione accettata senza esame crea un debito di verifica.
2. **Attenzione alle tre trappole.** La facilità (è facile chiedere, non ottenere un buon risultato), l'apparenza (un testo ben scritto non è necessariamente corretto) e le promesse esagerate dei venditori. Vedi [Il co-pensiero in pratica](pratiques-co-pensee.md).

### Strutturare

3. **I file sono la verità.** Se non è in un file, l'agente non lo sa. Mantenete i vostri file aggiornati: sono la memoria del vostro assistente.
4. **Cominciare in piccolo.** Un agente con 1 workflow che funziona bene vale più di 5 non testati. Si può sempre aggiungerne.
5. **Versionare le risorse.** `_v1`, `_v2`, ecc. Permette di far evolvere senza rompere ciò che funziona.
6. **Copiare, non modificare.** I templates restano intatti in `.ai/`. L'agente copia e adatta.

### Interagire

7. **Discutere prima di agire.** L'agente propone, voi validate. Mai il contrario.
8. **Una domanda alla volta.** I buoni workflow avanzano passo dopo passo, non in blocco.
9. **Riassumere regolarmente.** Sulle conversazioni lunghe, chiedete un riassunto dello stato di avanzamento per mantenere il filo.

---

## Andare oltre

- **I principi del co-pensiero**: [Il co-pensiero in pratica](pratiques-co-pensee.md), 16 principi, 3 guide di decisione, tutto ciò che un professionista dovrebbe sapere
- **Galleria di idee**: [idees-agents.md](../guides/idees-agents.md), decine di esempi di agenti per mestiere
- **Creare il vostro assistente**: dite «Leggi `.ai/agents/createur-agent/AGENT.md`»
- **Non sicuri da dove cominciare?** Dite «Aiutami a trovare da dove cominciare». La diagnosi vi guida
- **Migliorare un assistente esistente**: dite «Vorrei migliorare l'assistente [nome]»

## I piani di architettura

Tutto BASE sta in una bussola, dei piani che non devono **mai confondersi**:

> **Testo = verità · Router = scelta · Broker = garanzie · Index = scala · MCP = esposizione · LLM = orchestrazione.**

- **Testo = verità.** I vostri file Markdown/JSON sono la fonte di verità: leggibili da un umano, versionati, vostri.
- **Router = scelta.** Il router sceglie *quale* agente e *quale* process seguire, oppure si astiene onestamente. Vi toglie il carico mentale di cercare il process giusto. Il meccanismo resta rudimentale ma efficace, e si estende tramite adattatori. Classifica con regole ispezionabili; non applica nulla e non inventa mai una rotta.
- **Broker = garanzie.** Il broker è l'unico luogo che applica gli invarianti (confinamento, policy, trace). **Una garanzia è reale solo per un'azione che passa attraverso di lui.**
- **Index = scala.** Il manifesto, il registro di routing, l'indice di ricerca sono **proiezioni**, mai un'autorità. Si possono sempre rigenerare dal testo (o eliminarli).
- **MCP = esposizione.** Il server MCP espone le primitive del broker alle piattaforme; non orchestra alcuna logica di mestiere.
- **LLM = orchestrazione.** Decidere *cosa fare dopo* spetta al modello nello strumento, guidato dal testo e dai candidati del router; non è codificato in modo fisso nello strumento.

**Regola di progettazione:** un punto di estensione deve proteggere una frontiera reale. Mettere vocabolario di mestiere nell'index, o orchestrazione di mestiere nel MCP, è un errore di progettazione. Ecco perché il routing **vive con il testo** (`use_when`, descrizioni) anziché in un catalogo mantenuto a mano: un tale catalogo violerebbe il piano «Testo = verità».

## Glossario espresso

| Termine | Senso |
|-------|------|
| **Agente** | Un file di istruzioni (`AGENT.md` più le sue skill) che scrivete e possedete: la scheda di ruolo, portabile da uno strumento IA all'altro. |
| **Assistente** | Il vostro agente animato da un modello, lato utente. Possedete l'agente, usate l'assistente, noleggiate il modello. |
| **Skill** | Una competenza dell'agente, nel formato `SKILL.md`. Due tipi: **process** (un modo di fare, passo dopo passo) e **competence** (una conoscenza riutilizzabile: IVA, tono, marcatori...). |
| **Template** | Un modello di documento (a cosa assomiglia un preventivo, un'offerta...). |
| **Tool** | Uno strumento eseguibile (script) che l'agente può invocare, in dry-run e poi con conferma. |
| **Marcatore** | Un riferimento testuale nei vostri documenti: `[A VALIDER]`, `[A COMPLETER]`, `[ATTENTION]`, `[DECISION]`. |
| **Journal** | La memoria di lavoro tra le sessioni, in file. |
| **Broker** | Il cuore locale che applica le garanzie (confinamento, validazione, policy, trace); la CLI e il MCP passano attraverso di lui. |
| **Harness** | Lo strumento IA in cui aprite il vostro BASE: uno strumento capace di leggere i vostri file (per esempio GitHub Copilot, Antigravity, Claude Code o Cowork, OpenCode, Kilo Code), o un assistente collegato via MCP. |

---

BASE è un framework di [AI Swiss](https://a-i.swiss). Casi d'uso in partnership con [Innovaud](https://innovaud.ch).
