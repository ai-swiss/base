<!-- fr-synced: 023d9db022d05afb1c8244a7391313b2479d8335 -->

# Pubblicare BASE come open source

Pubblicare BASE come open source significa permettere ad altri di riprendere e adattare una struttura di lavoro che resta loro, senza legarsi a un fornitore o a una piattaforma. Lo scopo non è mostrare un prodotto finito: è rendere questa base riutilizzabile e onesta riguardo a ciò che fa, affinché ciascuno possa provarla, criticarla e farla crescere. Questa guida raccoglie ciò che bisogna decidere, verificare e scrivere affinché questa uscita pubblica mantenga tale promessa.

BASE si presenta come un quadro local-first per strutturare la collaborazione umano-IA: file leggibili, workflow, controlli locali ed estensioni possibili. È volutamente una base, non una piattaforma completa.

## Posizionamento pubblico

Messaggio breve:

> BASE aiuta le persone e le organizzazioni a strutturare la loro collaborazione con l'IA: conoscenza, processi, dati, decisioni, azioni controllate e memoria duratura.

Messaggio lungo:

> I modelli cambiano, le interfacce cambiano, i fornitori cambiano. Ciò che deve restare vostro è la struttura della vostra competenza: i vostri file di dominio, i vostri workflow, i vostri modelli, le vostre regole, le vostre decisioni e le tracce utili per riprendere il lavoro. BASE fornisce un quadro aperto e leggibile per organizzare questa struttura.

Messaggio fondativo:

> L'IA generativa si manovra in modo diverso da un software classico: attraverso il linguaggio, il contesto, gli esempi, i limiti e le correzioni. Padroneggia ambiti verificabili, ma ha due debolezze ben reali: per impostazione predefinita, non condivide la sua memoria da una sessione all'altra, e il linguaggio che la guida resta sotto-specificato, il che costituisce al tempo stesso la sua flessibilità e la sua fragilità. BASE trasforma questa constatazione in un metodo praticabile: scrivere ciò che conta, esplicitare i processi, mantenere visibili le decisioni umane e usare le piattaforme IA senza abbandonare loro la struttura del vostro lavoro.

Ciò che BASE non afferma:

- che l'IA diventi affidabile automaticamente;
- che i permessi siano garantiti al di fuori degli strumenti mediati;
- che il nucleo pubblico sostituisca la governance enterprise;
- che un'interfaccia o un modello preciso sia indispensabile;
- che l'IA possieda una coscienza, un'intenzione o una comprensione garantita;
- che tutto debba essere automatizzato.

## Ciò che deve essere visibile a colpo d'occhio

- Un esempio concreto in 5 minuti.
- Diversi assistenti di dominio pronti da provare.
- Una spiegazione semplice della differenza tra conversazione e memoria duratura.
- Una pagina per ogni livello di adozione: personale, start-up, PMI, grande impresa.
- Una pagina di stato che separa implementato, estensioni previste e fuori perimetro.
- Test e validazione locale che provano che il pacchetto è manutenibile.

## Checklist prima della pubblicazione

Documentazione:

- `README.md` spiega perché BASE esiste, come provarlo, per chi è e dove andare poi.
- `docs/start/obtenir-base.md` spiega ZIP, clone Git, copia di un esempio e pacchetto per browser.
- `docs/start/demo-60-secondes.md` permette di vedere un risultato concreto prima di leggere l'architettura.
- `docs/start/quickstart.md` permette un primo tentativo senza conoscenze tecniche.
- `docs/tutoriel/index.md` accompagna una persona passo dopo passo.
- `docs/audiences/pour-qui.md` parla ai pubblici principali.
- `docs/audiences/kit-demarrage-pme-suisse.md` fornisce le regole minime per una piccola squadra: dati, validazione, versioning, manutenzione.
- `docs/audiences/kit-enterprise.md` inquadra la configurazione rigorosa e le modalità di distribuzione.
- `docs/audiences/kit-administration-secteur-public.md` inquadra le decisioni istituzionali.
- `docs/public/presse.md` fornisce una pagina di riferimento pubblicabile per giornalisti e redazioni.
- `docs/learn/comprendre.md` spiega i meccanismi e la diagnosi.
- `docs/start/lire-dans-quel-ordre.md` aiuta ogni profilo a distinguere cosa leggere, cosa ignorare e cosa verificare.
- `docs/learn/pratiques-co-pensee.md` espone i principi della co-riflessione umano-IA.
- `docs/reference/framework-public.md` inquadra il nucleo pubblico e le estensioni.
- `docs/reference/etat-implementation.md` delimita le promesse.
- `docs/trust/securite-et-limites.md` esplicita il modello di sicurezza, i limiti e le responsabilità.
- `docs/trust/souverainete-et-confiance.md` riunisce sovranità, conformità, licenza e governance.
- `docs/trust/licence.md` spiega la doppia licenza in linguaggio leggibile.
- `docs/reference/specification-v0.md` fornisce la lettura dell'architettura.
- `mcp/README.md` spiega l'adapter MCP senza confonderlo con il broker.
- `SECURITY.md` spiega come segnalare un problema.
- `CODE_OF_CONDUCT.md` definisce le regole di partecipazione pubblica.
- `.github/ISSUE_TEMPLATE/` e `.github/PULL_REQUEST_TEMPLATE.md` guidano i contributi senza promettere una governance comunitaria pesante.
- `specs/RELEASE.md` descrive la checklist di pubblicazione riproducibile.
- `CHANGELOG.md` rende tracciabili le modifiche pubbliche.

Codice e validazione:

- `npm test` passa.
- `npm run validate` passa.
- `npm run entretien` non segnala azioni critiche.
- `npm test` e `npm run build` passano in `mcp/`.
- `npm run smoke:pack` passa.
- `base.manifest.json` è rigenerato.
- `.ai/trace/` è ignorato da git.
- `git status --short` è riletto: ogni file modificato o non tracciato è intenzionale.
- Gli artefatti derivati sono rigenerati e inclusi, oppure esplicitamente lasciati fuori dalla pubblicazione.
- Nessuna bozza locale (`.temp/`, `.plans/`, tracce, export di test) entra nel pacchetto pubblicato.

Esempi:

- `exemples/assistant-devis-demo/` resta la demo immediata; la pagina `docs/start/demo-60-secondes.md` descrive il percorso esatto.
- `exemples/assistant-devis/` resta il principale filo conduttore.
- `exemples/assistant-communication/`, `assistant-courrier/`, `assistant-rh/`, `assistant-projet/` e `assistant-reunion/` sono visibili e coerenti.
- Ogni esempio può essere copiato in una cartella separata e aperto in uno strumento IA.

Licenza e attribuzione:

- La doppia licenza è esplicita in `LICENSE`: codice sotto Apache-2.0; documentazione, agent, skill ed esempi sotto CC BY 4.0.
- Il README menziona AI Swiss e il caso d'uso Innovaud.
- Gli usi derivati devono conservare l'attribuzione prevista dalla licenza.

## Come presentare BASE

Per una conferenza o un workshop:

1. Iniziare con una scena concreta: fare un preventivo, preparare un'offerta, organizzare un progetto.
2. Mostrare cosa manca a una semplice chat: contesto, memoria, dati, regole, validazione.
3. Introdurre i file come memoria duratura.
4. Mostrare i workflow e le competenze.
5. Spiegare i punti di decisione e il debito di verifica.
6. Mostrare il router/broker solo dopo il bisogno concreto: rudimentale ma efficace, estensibile tramite adapter, riduce il carico mentale di cercare il processo giusto.
7. Concludere sulla sovranità: il capitale duraturo non è il modello, è la struttura della competenza.

Per una persona non tecnica:

- evitare i termini server, broker, schema, MCP all'inizio;
- dire assistente, file, workflow, modelli, decisioni;
- iniziare copiando un esempio.

Per una persona tecnica:

- mostrare `docs/reference/etat-implementation.md`;
- mostrare `tools/base-core.mjs`;
- mostrare i test;
- spiegare che MCP è un adapter e non il router.

Per un'organizzazione:

- presentare BASE come una base di strutturazione;
- esplicitare ciò che va aggiunto attorno: identità, diritti, audit, DLP, conservazione;
- per una PMI, iniziare dal kit di avvio piuttosto che dall'architettura enterprise;
- insistere sulla portabilità delle risorse e sulla separazione tra YAML semantico e dettagli tecnici.

## Il tono da mantenere

Forte, ma delimitato.

BASE può affermare:

- che la struttura è necessaria per collaborare in modo duraturo con l'IA;
- che la verifica non scompare;
- che i file leggibili rendono il contesto portabile;
- che i meccanismi sono più affidabili delle sole istruzioni;
- che il framework pubblico è utile senza pretendere di sostituire una piattaforma enterprise.

BASE non deve affermare:

- che i modelli non sbaglino più;
- che tutto sia sicuro per impostazione predefinita;
- che l'IA sostituisca la competenza;
- che tutte le piattaforme si comportino allo stesso modo;
- che l'adozione di uno strumento basti a trasformare un'organizzazione.

## Criterio finale

Una persona deve poter guardare BASE e comprendere tre cose:

1. Può provarlo ora.
2. Può adattarlo al proprio contesto.
3. Può crescere con questa struttura senza legarsi a una sola piattaforma.
