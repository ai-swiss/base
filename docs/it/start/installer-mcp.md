<!-- fr-synced: abf90266159c2550f827a635b37bb2473766dbe6 -->

# Installare il server MCP di BASE

Quando il vostro strumento di IA non legge direttamente i vostri file, o quando volete condividere un agente oltre la vostra postazione, il server MCP è la strada da seguire: rende i vostri agenti BASE raggiungibili da qualsiasi piattaforma compatibile, senza ricopiare il vostro lavoro a mano. In cambio, esponete una cartella del vostro progetto a uno strumento di terze parti, il che richiede alcune misure di protezione (vedi più sotto). Il server MCP (Model Context Protocol) collega i vostri agenti BASE alle piattaforme compatibili: ChatGPT, Claude Desktop e gli strumenti di IA capaci di parlare MCP (per esempio GitHub Copilot, Antigravity, Claude Code o Cowork, OpenCode, Kilo Code).

## Prerequisiti

- Node 18 o superiore (`node --version` per verificare). È l'unica dipendenza del cuore di BASE.
- Il repository BASE in locale. Non avete ancora il repository? Vedi [Ottenere BASE](obtenir-base.md).

## 1. Compilare il server

```bash
cd mcp/
npm install
npm run build
```

## 2. Avviare il server

```bash
npm start -- --root /percorso/del/vostro/progetto
```

Senza `--root`, il server rileva la radice BASE più vicina a partire dalla sua cartella di avvio. Per un uso duraturo, preferite una radice esplicita.

## 3. Connettere la vostra piattaforma

### Claude Desktop

In `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "base": {
      "command": "node",
      "args": ["/percorso/di/mcp/dist/index.js", "--root", "/percorso/del/vostro/progetto"]
    }
  }
}
```

La configurazione è identica negli altri strumenti di IA capaci di parlare MCP (per esempio GitHub Copilot, Antigravity, Claude Code o Cowork, OpenCode, Kilo Code): riportate lo stesso blocco nelle loro impostazioni MCP.

Anche gli strumenti destinati al grande pubblico compatibili con MCP, come ChatGPT (tramite la sua modalità sviluppatore), possono collegarsi a questo server MCP locale. L'attivazione e le condizioni di volta in volta vigenti avvengono nello strumento stesso, secondo la sua documentazione ufficiale: BASE non ne fa un percorso guidato e non ne dipende.

### Prima richiesta

Una volta connessa la piattaforma, chiedete:

> «Quali agenti ho?»

poi «Carica il mio agente assistant-devis» e infine «Buongiorno, vorrei configurare la mia attività». Il seguito del percorso si trova nell'[avvio rapido](quickstart.md).

## Sicurezza: sola lettura e autenticazione

Due misure di protezione sono attive per impostazione predefinita:

- **Sola lettura su HTTP.** Nel trasporto HTTP, gli strumenti di scrittura e di esecuzione non vengono registrati: la superficie è quindi, in modo verificabile, in sola lettura. `--read-write` la amplia esplicitamente, da riservare ai deployment autenticati. In `stdio` (uso locale), è disponibile la superficie completa del broker, comprese le scritture mediate.
- **Esposizione di rete rifiutata senza autenticazione.** Associare un'interfaccia non-loopback (`--host 0.0.0.0`, un IP di LAN) senza autenticazione viene rifiutato all'avvio. Se accettate il rischio (rete affidabile, tunnel controllato), `mcp/README.md` documenta la via di uscita esplicita `BASE_MCP_ALLOW_INSECURE_REMOTE=1`. Definite `BASE_MCP_BEARER_TOKEN` per richiedere un token bearer, l'opzione consigliata per un team:

```bash
BASE_MCP_BEARER_TOKEN=un-segreto-lungo-e-casuale npm start -- --transport http --host 0.0.0.0 --root /percorso/del/vostro/progetto
```

Per un'autenticazione su misura (OAuth, mTLS), fornite un `AuthProvider` tramite `base.config.mjs`, oppure collocate il server dietro un reverse proxy autenticato.

La sola lettura resta sensibile: gli strumenti di lettura espongono le risorse e i file confinati al progetto. Non esponete via MCP una cartella che contiene segreti o dati al di fuori del perimetro per il client connesso.

## Risoluzione dei problemi di base

| Sintomo | Pista |
| --- | --- |
| `npm: command not found` | Installare Node 18 o superiore da [nodejs.org](https://nodejs.org) |
| Il server rifiuta di avviarsi in rete | Comportamento previsto senza autenticazione: definire `BASE_MCP_BEARER_TOKEN` |
| La piattaforma non vede alcun agente | Verificare il percorso passato a `--root` e che il progetto contenga `.ai/agents/*/AGENT.md` |
| Blocco su una fase tecnica | Chiedere alla vostra IA: «Ho questo errore: [incollare l'errore]. Cosa succede?» |

## Per approfondire

[mcp/README.md](../../mcp/README.md) descrive in dettaglio gli strumenti esposti (`load_agent`, `route_request`, `propose_change`, ecc.), la modalità multi-radice (`--workspace`), il deployment di team dietro un reverse proxy e i limiti: l'MCP non sostituisce né IAM, né DLP, né archiviazione.

---

BASE è un framework di [AI Swiss](https://a-i.swiss). Caso d'uso in partnership con [Innovaud](https://innovaud.ch).
