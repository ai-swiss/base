<!-- fr-synced: a5aee6f04a1af3c7e131f033545cd33018f40750 -->

# Installare Cursor per i vostri agenti BASE

Per far lavorare i vostri agenti BASE, vi serve una postazione in cui l'IA legge i vostri file, ne scrive ed esegue comandi sotto il vostro controllo: questa pagina ne configura una con Cursor, pronta all'uso. Alla fine avrete aperto un esempio, fatto la vostra prima richiesta e saprete cosa fare se qualcosa si blocca. Questo presuppone l'installazione di un software e la creazione di un account presso il fornitore. Cursor è solo una porta d'ingresso: vanno bene anche altri strumenti IA in grado di leggere i vostri file (per esempio GitHub Copilot, Antigravity, Claude Code o Cowork, OpenCode, Kilo Code); scegliete quello che fa per voi.

Cursor è uno spazio di lavoro IA con interfaccia grafica.

## 1. Installare Cursor

**Scaricare:** [cursor.com](https://cursor.com)

| OS | Istruzioni |
| --- | --- |
| **Windows** | Scaricare `.exe`, avviare il programma di installazione |
| **macOS** | Scaricare `.dmg`, aprirlo, trascinarlo nella cartella Applicazioni (versione ARM64 per i chip M) |
| **Linux** | Scaricare l'AppImage, renderlo eseguibile (`chmod +x`), avviarlo |

**Al primo avvio:**

1. Creare un account o accedere (necessario per accedere ai modelli IA)
2. Scegliere un tema (modificabile in seguito)
3. Importare le impostazioni esistenti di VS Code (opzionale)

## 2. Configurare la riservatezza

1. Aprire **Settings** (icona dell'ingranaggio in alto a destra)
2. Andare in **General**, sezione **Privacy**
3. Selezionare **Privacy Mode**

Questa impostazione mira a limitare l'uso dei vostri dati per l'addestramento dei modelli, secondo le condizioni dello strumento, che dovete verificare voi stessi. Offre una protezione parziale: per dati personali, dei clienti o regolamentati, fate validare l'uso da una revisione legale o di sicurezza.

## 3. Aprire un esempio BASE

1. Copiate la cartella di un esempio (per esempio `exemples/assistant-devis/`) nel vostro spazio di lavoro
2. Apritela in Cursor (File → Apri cartella)
3. Il file `.cursor/rules/assistant.mdc` fornisce a Cursor le regole di caricamento dell'agente

Non avete ancora il repository? Vedi [Ottenere BASE](obtenir-base.md).

## 4. Prima richiesta

Scrivete nella chat:

> «Buongiorno, vorrei configurare la mia attività»

L'assistente vi guida, propone file e attende la vostra conferma per le decisioni importanti. Il seguito del percorso (primo preventivo, marcatori `[A VALIDER]`) è nell'[avvio rapido](quickstart.md).

## 5. Leggere i vostri PDF, Word ed Excel (opzionale)

L'IA legge nativamente il testo (Markdown, TXT, codice). I PDF, Word ed Excel sono formati binari che richiedono uno strumento. L'estensione **Office Viewer** (pannello Estensioni, `Cmd/Ctrl + Shift + X`) permette già di visualizzarli in Cursor. Perché l'IA li legga, due opzioni che possono coesistere:

**Opzione A, convertire in Markdown con [Docling](https://docling-project.github.io/docling/)** (documenti di riferimento, uso frequente):

```bash
pip install docling   # ou: uv tool install docling
docling --to md --output "/chemin/sortie/" "/chemin/document.pdf"
```

Il file `.md` generato conserva titoli e tabelle. Per automatizzare, aggiungete il comando come esempio in `Cursor Settings > General > Rules and Commands`, poi dite semplicemente «Converti questo file [percorso]».

**Opzione B, server MCP [Document Loader](https://awslabs.github.io/mcp/servers/document-loader-mcp-server)** (lettura occasionale, estrazione al volo):

1. Installare `uv`: `curl -LsSf https://astral.sh/uv/install.sh | sh` (macOS/Linux) oppure `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"` (Windows). Verificare con `uvx --version`.
2. In `Cursor Settings > MCP`, cliccare «Add MCP Server» e aggiungere:

```json
{
  "mcpServers": {
    "awslabs.document-loader-mcp-server": {
      "command": "uvx",
      "args": ["awslabs.document-loader-mcp-server@latest"],
      "env": { "FASTMCP_LOG_LEVEL": "ERROR" }
    }
  }
}
```

3. Attivate solo `read_document`. Lo strumento `read_image` interferisce con la lettura nativa delle immagini da parte degli LLM.
4. Provate: «Leggi questo PDF [percorso] e riassumilo.» Su macOS, se `uvx` non viene trovato, indicate il suo percorso completo (`/usr/local/bin/uvx` o `~/.local/bin/uvx`).

## Risoluzione dei problemi di base

| Sintomo | Indicazione |
| --- | --- |
| L'esplora risorse è vuoto | Riaprire la cartella giusta (File → Apri cartella) |
| L'IA non trova un file | Clic destro sul file → **Copy Path**, incollare il percorso esatto nella chat |
| Un PDF resta illeggibile | Riprendere l'opzione A o B qui sopra |
| Blocco su un passaggio tecnico | Chiedere all'IA stessa: «Ho questo errore: [incollare l'errore]. Cosa succede?» Precisate il vostro livello se serve. |

Consigli per la chat: `Cmd/Ctrl + V` incolla un URL come contesto (se l'IA ha accesso al web); `Cmd/Ctrl + Shift + V` incolla il contenuto testuale dell'URL, utile se il sito blocca i robot.

Per verificare l'installazione: trascinate un `.md` nella chat e chiedete un riassunto, poi «Crea un file test.md con Hello», poi «Elenca i miei file con il comando ls in un terminale». Se tutto funziona, l'IA vede, legge, scrive ed esegue. Riferimento completo: [docs.cursor.com](https://docs.cursor.com).

Cursor eccelle nel lavoro iterativo sui file. Per la ricerca web approfondita (Deep Research, Perplexity), la generazione di immagini (Midjourney, Ideogram) o di video (Veo, Runway), usate strumenti specializzati.

---

BASE è un framework di [AI Swiss](https://a-i.swiss). Caso d'uso in partnership con [Innovaud](https://innovaud.ch).
