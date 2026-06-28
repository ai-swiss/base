<!-- fr-synced: fb72357682a278742e8af5a2c5215d49a93ad6c0 -->

# I dati che scadono

*⏱ ~10 min · modulo 5/9, percorso Praticante*

**Farete**: far segnalare e poi sparire un dato scaduto con base doctor, dimostrato dal ✅ qui sotto.
**Vi serve**: il modulo 1 completato, un terminale in `exemples/veytaux-tourisme`.
↻ **Promemoria**: senza guardare: cosa fa instradare una richiesta verso un processo? (il suo use_when e i suoi examples)

1. Eseguite `base doctor --root .`. Individuate il segnale su `infos/agenda.md`.
2. Aprite `infos/agenda.md`: il campo `valid_until` è una data passata (è voluto,
   per l'esercizio).
3. Spostate `valid_until` a una data futura (per esempio tra una settimana) e salvate.
4. Rieseguite `base doctor --root .`.

✅ **Verificate**: dopo la correzione, `base doctor` non segnala più `infos/agenda.md` come scaduto (il segnale `expired` è sparito).

💡 **Perché ha funzionato**: una competenza invecchia. `valid_until` dichiara la durata di vita di un dato di riferimento; `base doctor` proietta queste date sui vostri file per individuare ciò che sta per rompersi, senza eseguire nulla, con una semplice lettura. La manutenzione diventa visibile.

🔁 **A casa vostra**: quale dato del vostro mestiere (una tariffa, un tariffario, una regola stagionale) dovrebbe avere una data di validità?

→ **E adesso**: [Modulo 6: aprite l'atelier](praticien-6-ouvrez-l-atelier.md): passiamo a Studio e colleghiamo un modello.

🆘 **Guasti comuni**: *doctor non segnala nulla*: non siete in `exemples/veytaux-tourisme`. *Il segnale resta dopo la correzione*: la data è davvero nel FUTURO, e il file è stato salvato?
