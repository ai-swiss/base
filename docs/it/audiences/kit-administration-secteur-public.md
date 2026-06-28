<!-- fr-synced: 4a00a506695e067660b55b061e7c1422eddec1a0 -->

# Valutare e usare BASE in modo responsabile nel settore pubblico

Adottare BASE in un'istituzione pubblica coinvolge dati dei cittadini, una base giuridica e gli appalti pubblici: decidere se e come farlo senza correre rischi inutili richiede punti di riferimento chiari. Questa checklist ne fornisce, di tipo operativo, e segnala le decisioni che restano vostre (giurista, responsabile della protezione dei dati, archivio, acquisti); non sostituisce un parere legale.

> **Importante.** BASE è un **componente** local-first, non una piattaforma di conformità. Da solo non fornisce IAM, SSO, RBAC, DLP, SIEM, archiviazione legale né conservazione regolamentare (vedi [Sicurezza e limiti](../trust/securite-et-limites.md)). Ciò che offre: conoscenza di dominio in file che vi appartengono, e una mediazione onesta delle azioni sensibili.

## 1. Classificare il perimetro dei dati

- Elencate i dati che un assistente toccherà, e la loro classificazione (pubblici, interni, riservati).
- Una regola di partenza prudente: nessun dato personale dei cittadini in un primo assistente. Iniziate con flussi di lavoro interni (modelli, procedure, redazione).
- BASE mantiene una frontiera di sensibilità nei metadati (`sensitivity`) e può, se configurate un validatore, **rifiutare** le risorse troppo sensibili (vedi il [kit enterprise](kit-enterprise.md), validatore `forbidSensitivity`).

> **Decisione istituzionale:** la classificazione interna applicabile e la base giuridica (ad esempio la nLPD e il diritto cantonale o comunale pertinente).

## 2. Dati dei cittadini e protezione dei dati

- Se sono in gioco dati personali, il solo livello browser non basta: utilizzate la CLI o l'MCP, che mediano le azioni e ne tengono traccia.
- Il routing resta **100% locale** per impostazione predefinita (lessicale, zero rete). Il routing semantico avanzato invia testo a un fornitore di embedding solo se lo attivate esplicitamente, ed esiste un'opzione locale (Ollama) (vedi [Sicurezza dei dati di routing](../trust/securite-donnees-routage.md)).

> **Decisione istituzionale:** una valutazione d'impatto (AIPD/DPIA) ove necessaria, e il registro dei trattamenti.

## 3. Politica sul fornitore del modello

- Il modello (l'esecuzione generativa) resta **vostra scelta** e vive al di fuori di BASE. BASE struttura la conoscenza che il modello esegue; non vi lega ad alcun fornitore.
- Per restare sovrani, potete eseguire modelli locali (ad esempio tramite Ollama); BASE non impone alcun servizio cloud.
- **La località non risolve tutto: la giurisdizione dell'host conta quanto il luogo in cui gira il modello.** Un host soggetto a una legge straniera (ad esempio il CLOUD Act statunitense) può essere obbligato anche per dati conservati in Svizzera. Vedi la sezione CLOUD Act di [`souverainete-et-confiance.md`](../trust/souverainete-et-confiance.md).

> **Decisione istituzionale:** l'elenco dei fornitori di modelli autorizzati e le clausole contrattuali (localizzazione dei dati, subappalto, durata di conservazione lato fornitore).

## 4. Accessibilità

- Le risorse BASE sono Markdown leggibile: compatibile con i lettori di schermo e adatto a pubblicazioni accessibili.
- Per qualsiasi interfaccia pubblica derivata, puntate agli standard di accessibilità applicabili.

> **Decisione istituzionale:** il riferimento di accessibilità applicabile alla vostra istituzione.

## 5. Archiviazione e conservazione

- BASE versiona per file (Git consigliato): la cronologia delle decisioni e dei contenuti è tracciabile.
- Le tracce delle azioni mediate sono minime (operazione, risorsa, stato, durata), senza contenuto di merito per impostazione predefinita.

> **Decisione istituzionale:** le durate di conservazione e le regole di archiviazione legale dei vostri contenuti e registri.

## 6. Appalti pubblici e riutilizzo

- Doppia licenza: **Apache-2.0** per il codice (clausola brevettuale inclusa) e **CC BY 4.0** per i contenuti (vedi [Licenza](../trust/licence.md)).
- Un nucleo **a zero dipendenze** (Node 18 o superiore): una superficie verificabile, senza una catena di fornitura pesante. Il server MCP e lo Studio hanno proprie dipendenze, isolate e opzionali.
- L'essenziale è locale e ispezionabile: codice, schemi, specifiche (`specs/`) e un contratto di test riproducibile (vedi [`specs/TESTING.md`](../../../specs/TESTING.md)).

> **Decisione istituzionale:** i criteri d'acquisto (sovranità, reversibilità, supporto) e le clausole di appalto.

## 7. Validazione umana e tracciabilità

- Una disciplina del tipo proponi poi conferma: viene mostrato un diff, voi validate, poi avviene la scrittura. I tool girano in dry-run per impostazione predefinita.
- I marcatori (`[A VALIDER]`, `[DECISION]`) sono riferimenti ricercabili, leggibili tanto da una persona quanto da un trattamento algoritmico: mantengono visibile lo stato di una pratica, anche dopo mesi.

## 8. Mantenere visibili i limiti

Mostrate ciò che BASE non applica meccanicamente (soprattutto in modalità solo browser) e ciò che spetta ai vostri sistemi (IAM, DLP, conservazione). Vedi [Sicurezza e limiti](../trust/securite-et-limites.md) e [Sovranità e fiducia](../trust/souverainete-et-confiance.md). E per la mappa delle garanzie che il codice applica davvero, ciascuna con la sua funzione e il suo test, vedi [Meccanismi verificati](../trust/mecanismes-verifies.md).

## Contatto

Per un confronto istituzionale (valutazione, pilota, domande di conformità), scrivete a AI Swiss all'indirizzo [info@a-i.swiss](mailto:info@a-i.swiss): puntiamo a una prima risposta entro una decina di giorni lavorativi. Vedi anche [a-i.swiss](https://a-i.swiss).

Lo stesso indirizzo vi indirizza alla persona giusta per le modalità di accompagnamento di un pilota.
