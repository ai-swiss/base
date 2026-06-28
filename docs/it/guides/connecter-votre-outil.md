<!-- fr-synced: ee0499d96aefb2aded077d221ef39d7bf0fe9f69 -->

# Collegare il tuo strumento IA

Collegare BASE allo strumento IA che usi già significa mantenere il metodo leggibile e **validare al momento giusto** invece di delegare senza guardare: resti tu la persona che decide, lo strumento esegue sotto il tuo sguardo. Questo presuppone uno strumento IA capace di leggere i tuoi file (per esempio GitHub Copilot, Antigravity, Claude Code o Cowork, OpenCode, Kilo Code); BASE vi si innesta.

Due livelli bastano nella maggior parte dei casi. Inizia dal più semplice.

## Il più semplice: aprire la cartella

Nessuna installazione. Apri una cartella di esempio (o la tua BASE) in uno strumento che legge i file di progetto. Gli artefatti proiettati (`CLAUDE.md`, `.cursor/rules/`) danno allo strumento il contesto BASE e la regola di routing. Non scelgono automaticamente un agente di dominio: la tua prima richiesta deve portare un'intenzione.

| Strumento | Cosa fai |
|-------|--------------------|
| **Cursor** | Apri la cartella. La regola `.cursor/rules/assistant.mdc` carica il contesto BASE. Di' per esempio «Buongiorno, vorrei configurare la mia attività». |
| **Claude Code** | Apri la cartella. `CLAUDE.md` carica il contesto BASE. Di' per esempio «Buongiorno, vorrei configurare la mia attività». |
| **Claude Desktop / ChatGPT (senza MCP)** | Incolla un pacchetto browser (vedi [Ottenere BASE](../start/obtenir-base.md)) e formula una richiesta concreta. Modalità istruzioni, senza garanzie meccaniche. |
| **Altro editor che legge `AGENTS.md`** | Apri la cartella; l'`AGENTS.md` proiettato descrive l'agente. |

Questo è il livello browser e file: il modello segue il metodo, e tu mantieni il controllo per rileggerlo.

## Per un team: il server MCP di BASE

Quando vuoi le **garanzie meccaniche** (routing deterministico per impostazione predefinita, scrittura mediata che propone e poi committa, esecuzione protetta), collega il server MCP di BASE. È lo stesso broker della CLI, esposto al tuo strumento.

| Strumento | Procedura |
|-------|-----------|
| **Claude Desktop** | Aggiungi una voce `mcpServers` che punta al server BASE. Dettaglio esatto: [`mcp/README.md`](../../mcp/README.md). |
| **Cursor** | Impostazioni MCP, aggiungi il server BASE. Dettaglio: [`mcp/README.md`](../../mcp/README.md). |
| **VS Code (MCP)** | Configurazione MCP dell'estensione, server in `stdio`. Dettaglio: [`mcp/README.md`](../../mcp/README.md). |
| **ChatGPT** | Modalità sviluppatore, endpoint HTTPS autenticato. Procedura e sicurezza: [`mcp/README.md`](../../mcp/README.md). |

Forma minima di un server locale in `stdio` (adatta i percorsi):

```json
{
  "mcpServers": {
    "base": {
      "command": "node",
      "args": ["/chemin/vers/mcp/dist/index.js", "--root", "/chemin/vers/votre/projet"]
    }
  }
}
```

In sola lettura, aggiungi `--read-only`. Il riferimento completo (modalità, remoto, autenticazione, sicurezza) vive in [`mcp/README.md`](../../mcp/README.md), la fonte di verità.

## Quale livello per quale esigenza

| Esigenza | Livello |
|--------|--------|
| Provare, esplorare, postazione individuale | Aprire la cartella |
| Incollare un assistente in un browser | Pacchetto browser |
| Garanzie meccaniche, team, scrittura mediata | Server MCP |

## Il tuo strumento non è elencato

Il principio vale per la maggior parte degli strumenti che leggono i file di progetto o parlano MCP. Carica l'agente di accoglienza (`concierge-base`) e chiedi «aiutami a collegare BASE al mio strumento»: legge la documentazione del tuo strumento e ti guida, mantenendo la cucitura di validazione. Vedi anche [BASE e i tuoi strumenti IA](../reference/base-et-vos-outils-ia.md).
