<!-- fr-synced: d53317ea2708bb4f9f7fb93e61693eb8979c4b46 -->

# Accessibilità, impegno e stato

Un'istituzione pubblica deve poter sapere quanto vale, e quanto non vale, l'accessibilità di BASE prima di servirsene. Qui trovate il nostro impegno per l'accessibilità, le prove che possiamo mostrare oggi e i limiti onesti di queste prove. Ciò non costituisce una dichiarazione formale di conformità: per noi una simile dichiarazione resta un obiettivo da raggiungere, non un fatto acquisito (vedi più sotto).

Questa pagina è informativa. Non costituisce né un parere giuridico né un audit di conformità. Ogni istituzione resta responsabile della propria valutazione dell'accessibilità, del proprio eventuale audit e della propria politica di accessibilità.

## Impegno

Per il sito di documentazione e per Studio, puntiamo a:

- il riferimento WCAG 2.1 livello AA;
- la norma svizzera eCH-0059 (accessibilità delle prestazioni online).

Questo impegno è un obiettivo di progettazione. Orienta le scelte di interfaccia e la revisione, ma non significa che la conformità sia raggiunta o verificata a oggi.

## Distinzione importante: meccanismo e istruzione

BASE distingue ovunque ciò che è applicato meccanicamente da ciò che rientra in un'istruzione seguita in buona fede. L'accessibilità segue la stessa griglia.

- Meccanismo: una verifica automatizzata di accessibilità si esegue nella suite di test Playwright (end-to-end) di Studio. Gira a ogni passaggio della suite e fallisce se rileva violazioni gravi o critiche. Impone un vincolo reale sull'interfaccia di Studio, al di là di una semplice intenzione.
- Istruzione: l'obiettivo WCAG 2.1 AA ed eCH-0059, la cura dedicata alla struttura delle pagine, ai contrasti e alla navigazione da tastiera rientrano in una disciplina di progettazione. Da soli, non sono una garanzia verificata.

Vedi anche la pagina [Sicurezza e limiti](securite-et-limites.md), che pone questa stessa distinzione per le protezioni di BASE.

## La prova di cui disponiamo

Studio include un test di accessibilità automatizzato (`tools/studio/ui/e2e/a11y.spec.ts`), integrato nella suite end-to-end. Concretamente:

- utilizza il motore `axe-core` tramite Playwright;
- analizza i criteri contrassegnati `wcag2a` e `wcag2aa`;
- copre le viste principali di Studio (la navigazione, la vista Valutazioni) nonché un cassetto modale, verificando anche il comportamento degli elementi nascosti;
- fa fallire la build quando viene rilevata una violazione con impatto `serious` o `critical`, e il rapporto descrive nel dettaglio il nodo e i valori misurati per rendere il fallimento diagnosticabile.

Questo test fa parte delle verifiche end-to-end eseguite dal progetto. L'accessibilità figura così nella rete dei test automatizzati, e non in una revisione occasionale presto dimenticata.

## Il limite di questa prova

Un controllo automatizzato ha una portata limitata: ecco ciò che copre e ciò che gli sfugge.

- Un controllo automatizzato come `axe-core` copre solo una parte dei criteri WCAG, dell'ordine di un terzo secondo le stime correnti per questo strumento. Rileva problemi strutturali (attributi mancanti, contrasti insufficienti, ruoli scorretti), ma non giudica la pertinenza di un testo alternativo, la logica dell'ordine di lettura, la chiarezza del linguaggio o la reale qualità di un percorso da tastiera complesso.
- Il test attuale si concentra sulle viste principali di Studio. Non copre ancora in modo esaustivo tutte le schermate, tutti gli stati di errore, né l'insieme del sito di documentazione.
- A oggi non è stato realizzato alcun audit manuale completo. Nessuna valutazione con tecnologie assistive (lettori di schermo) né con persone con disabilità è stata formalmente condotta e documentata.
- Di conseguenza, a oggi non esiste alcuna dichiarazione formale di conformità WCAG 2.1 AA né eCH-0059 per BASE.

In sintesi: disponiamo di un segnale automatizzato utile e continuo, ma non è una prova di conformità.

## Stato noto

Noto come buono (verificato dal test automatizzato, sulle viste coperte):

- assenza di violazioni di accessibilità con impatto grave o critico sulle viste principali di Studio testate;
- presa in considerazione degli elementi nascosti e dei cassetti modali nel perimetro del test;
- integrazione della verifica nella suite end-to-end, quindi rieseguita in continuo.

In attesa (non ancora fatto, o non coperto):

- audit manuale completo del sito di documentazione e di Studio;
- test con lettori di schermo e altre tecnologie assistive;
- valutazione con persone con disabilità;
- copertura automatizzata estesa all'insieme delle schermate e degli stati;
- verifica dedicata dell'accessibilità del contenuto redazionale (linguaggio chiaro, struttura dei titoli, testi alternativi);
- dichiarazione formale di conformità e procedura documentata di riscontro sull'accessibilità.

## La dichiarazione di conformità è un obiettivo

Una dichiarazione formale di conformità (ai sensi di WCAG 2.1 AA o di eCH-0059) presuppone un audit completo, comprese verifiche manuali e test con tecnologie assistive. Questo lavoro non è terminato. Consideriamo quindi la conformità come un obiettivo che perseguiamo attivamente.

Preferiamo annunciare un controllo automatizzato reale, con i suoi limiti, piuttosto che esibire una conformità che non potremmo sostenere.

## Per segnalare un problema

Se incontrate un ostacolo di accessibilità nel sito di documentazione o in Studio, segnalatelo tramite il canale di tracciamento del progetto (gestore di segnalazioni del repository). Un riscontro preciso (pagina interessata, browser, tecnologia assistiva utilizzata, comportamento atteso) aiuta a correggere più velocemente e a estendere la copertura dei test.
