<!-- fr-synced: 0a4c1d4c8fb7e3703f988769bb8ebf50f50a0fc8 -->

# Installare Claude Code

Al termine di questa pagina avrai un assistente che legge e modifica i tuoi file sotto il tuo controllo, pronto a lavorare sui tuoi documenti reali: BASE smette di essere un testo da leggere e diventa uno strumento che agisce. Questo presuppone che tu sia a tuo agio in un terminale e che disponga di un account Anthropic. In pochi minuti installi Claude Code, lo avvii in un esempio BASE e fai una prima richiesta; saprai anche cosa fare se ti blocchi.

Claude Code, l'agente IA di Anthropic da riga di comando, è solo uno tra i tanti punti di accesso: la maggior parte degli strumenti IA in grado di leggere e modificare i tuoi file va bene (per esempio GitHub Copilot, Antigravity, Claude Code o Cowork, OpenCode, Kilo Code). Questa pagina documenta Claude Code; per gli altri, fai riferimento al loro installatore.

Ti serve un account Anthropic (abbonamento Claude o accesso API). Con l'installatore nativo non è richiesta nessun'altra dipendenza.

## 1. Installare Claude Code

**macOS / Linux / WSL:**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows (PowerShell):**

```powershell
irm https://claude.ai/install.ps1 | iex
```

Se hai già Node 18 o superiore, funziona anche `npm install -g @anthropic-ai/claude-code`. I comandi esatti possono cambiare: in caso di dubbio, segui la [documentazione ufficiale](https://code.claude.com/docs).

Verifica con `claude --version`. Al primo avvio, `claude` ti chiede di accedere al tuo account.

## 2. Avviare `claude` in un esempio

1. Copia la cartella di un esempio (per esempio `exemples/assistant-devis/`) nel tuo spazio di lavoro
2. Apri un terminale in quella cartella
3. Esegui `claude`

Il file `CLAUDE.md` nella radice dell'esempio fornisce a Claude Code il contesto iniziale tramite `@import`: l'agente viene caricato senza ulteriore configurazione.

Non hai ancora il repository? Vedi [Ottenere BASE](obtenir-base.md).

## 3. Prima richiesta

Digita:

> «Ciao, vorrei configurare la mia attività»

L'assistente ti guida, propone file e attende la tua conferma per le decisioni importanti. Il seguito del percorso (primo preventivo, marcatori `[A VALIDER]`) si trova nell'[avvio rapido](quickstart.md).

## Risoluzione dei problemi di base

| Sintomo | Cosa provare |
| --- | --- |
| `claude: command not found` | Chiudere e riaprire il terminale; altrimenti aggiungere al PATH il percorso indicato dall'installatore |
| Problema di connessione all'account | Avviare `claude`, poi digitare `/login` |
| L'agente non si carica | Verificare che `claude` sia avviato nella cartella dell'esempio, quella che contiene `CLAUDE.md` (`pwd` per controllare) |
| Serve aiuto durante la sessione | Digitare `/help` |
| Bloccato su un passaggio tecnico | Chiedi a Claude Code stesso: «Ho questo errore: [incolla l'errore]. Cosa succede?» Indica il tuo livello se necessario. |

---

BASE è un framework di [AI Swiss](https://a-i.swiss). Caso d'uso in collaborazione con [Innovaud](https://innovaud.ch).
