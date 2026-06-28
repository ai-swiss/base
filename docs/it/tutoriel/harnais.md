<!-- fr-synced: 7b63c08db9716f99d3669ade98ab99d38aa759d7 -->

# Passo 0: collegare il tuo strumento IA

**Farai** in modo che il tuo strumento IA sia capace di leggere una cartella BASE e di rispondere a partire da essa, dimostrato da una semplice domanda alla fine.
**Ti serve** un computer, una connessione internet e la cartella BASE sulla tua macchina. Se non ce l'hai ancora, [Provare senza installare nulla](../start/essayer-sans-installer.md) mostra il modo più semplice per ottenerla; esempi come `veytaux-tourisme` si trovano lì dentro.

Prima di ogni modulo, il tuo strumento deve essere installato E collegato. Scegli:

| Strumento | Primo gesto | Terminale richiesto? |
|-------|---------------|-------------------|
| **Cursor** | Scaricalo da cursor.com, accedi, *File -> Open Folder*. Chat: Cmd/Ctrl+L, modalità Agent. | No |
| **Claude Code** | Installalo, poi esegui `claude` nella cartella. | Sì |
| **ChatGPT / Claude Desktop** | Tramite il server MCP (garanzie meccaniche). | Sì (configurazione) |
| **Un altro strumento** | Chiedi al concierge: *aiutami a collegare BASE al mio strumento*. Legge la documentazione del tuo strumento e ti guida. | Secondo lo strumento |

Per le garanzie meccaniche (routing deterministico, scritture mediate), collega il server MCP: vedi la documentazione di avvio di BASE.

✅ **Verifica**: apri la cartella `exemples/veytaux-tourisme` nel tuo strumento e chiedi *«chi sei?»*. L'assistente deve, in sostanza, presentarsi come l'assistente dell'ufficio del turismo di Veytaux-les-Bains (informazioni ai visitatori e uscite di gruppo). Se parla d'altro, vedi i guasti qui sotto.

🆘 **Guasti comuni**:
- *L'assistente parla di «routing» o di «BASE» invece dell'ufficio del turismo*: hai aperto la radice del repository, non la sottocartella. Riapri `exemples/veytaux-tourisme`.
- *Non risponde nulla di specifico*: il tuo strumento non legge i file del progetto. Verifica di aver aperto la CARTELLA (non un singolo file) e che la chat sia in modalità agent.

## Il comando `base` (percorsi Professionista e Team)

Questi due percorsi usano un terminale. Quando un modulo scrive `base ...`, si tratta del lanciatore che ogni cartella BASE contiene: eseguilo con **`node .ai/base.mjs`** dalla cartella in cui stai lavorando (il repository, o il tuo progetto). Trova il motore da solo: niente da installare, niente da mettere sul PATH (il pacchetto `base` non è pubblicato; questo lanciatore lo sostituisce).

Per digitare di meno, crea una scorciatoia di sessione:

- macOS / Linux: `alias base='node .ai/base.mjs'`
- Windows (PowerShell): `function base { node .ai/base.mjs @args }`

Poi `base route "..."` funziona così com'è.

✅ **Verifica (prima del percorso Professionista)**: da `exemples/veytaux-tourisme`, `node .ai/base.mjs --help` mostra la lista dei comandi.

→ **E adesso**: torna all'[indice](index.md) e avvia il modulo 1 del tuo percorso.
