<!-- fr-synced: 3f3cbcabd8070f3132f31a97a5bb4d670d765e3a -->

# La sfida: fornire le condizioni del giorno

*⏱ ~12 min · modulo 3/9, percorso Praticante*

**Farete**: creare un nuovo process e dimostrare che instrada, senza guida passo-passo, provato dal ✅ qui sotto.
**Vi serve**: i moduli 1-2 completati, la vostra cartella `mon-office-tourisme`.
↻ **Promemoria**: senza guardare, quali due campi legge il routing per scegliere un process? (use_when, routing.examples)

L'ufficio del turismo di Veytaux è fiero della sua webcam puntata sul parcheggio, e i visitatori non smettono di chiedere il meteo e le condizioni del giorno lassù. In `.ai/feedback/abstentions.jsonl`, la stessa domanda ritorna senza risposta: «Che tempo fa lassù oggi?» Tocca a voi spegnere questa abstention:

1. Create un process `donner-les-conditions-du-jour` (stessa struttura del modulo 2).
2. Dategli un `use_when` e dei `routing.examples` che catturino questo tipo di richiesta:

```routage-defi
Quel temps fait-il là-haut aujourd'hui ?
Il neige au village ce matin ?
```

3. Verificate il vostro lavoro voi stessi (comandi qui sotto).

✅ **Verificate**: `base validate --root .` passa, e `base route "Quel temps fait-il là-haut aujourd'hui ?" --root .` instrada verso `donner-les-conditions-du-jour`. Se instrada altrove, regolate use_when e examples: è questo l'esercizio.

💡 **Perché ha funzionato**: avete appena svolto, da soli, il ciclo completo: scrivere la struttura, prevedere il risultato, verificare e poi correggere. È esattamente il gesto che rifarete sui vostri veri process.

🔁 **A casa vostra**: elencate un compito del vostro mestiere che il vostro assistente non sa ancora svolgere, è il vostro prossimo process.

→ **E adesso**: [Modulo 4: competenze e modelli](praticien-4-competences-et-modeles.md), i mattoni riutilizzabili e la generazione di documenti.

🆘 **Guasti comuni**: *Instrada verso renseigner-un-visiteur*: i vostri examples assomigliano troppo a un'informazione classica; avvicinateli a «il meteo e le condizioni del giorno». *ambiguous*: due process troppo simili: distinguete i loro use_when.
