<!-- fr-synced: 00bf174c6f95a30df6d63ad672c4ffb9ffd502a3 -->

# Configurare uno spazio di lavoro IA

Configurare uno spazio di lavoro locale significa mantenere i propri agenti e il proprio contesto nella propria cartella, sotto il proprio controllo, anziché in una piattaforma web. Comporta scegliere uno strumento e dedicargli qualche minuto. Questa pagina vi indirizza verso la guida adatta alla vostra situazione; ogni guida è breve e autosufficiente. BASE funziona con la maggior parte degli strumenti IA in grado di leggere i vostri file Markdown.

## La vostra situazione, la vostra pagina

| La vostra situazione | Seguite |
| --- | --- |
| Volete che la vostra IA esegua l'installazione per voi | [Fate installare BASE dalla vostra IA](installer-par-votre-ia.md) |
| Preferite un'interfaccia grafica: diversi strumenti vanno bene (Claude Code, Cursor, Antigravity, GitHub Copilot, OpenCode…), BASE non ne privilegia nessuno | [Installare Cursor](installer-cursor.md) |
| Vi trovate a vostro agio in un terminale | [Installare Claude Code](installer-claude-code.md) |
| Volete collegare ChatGPT, Claude Desktop o un'altra piattaforma ai vostri agenti | [Installare il server MCP](installer-mcp.md) |
| Avete solo un browser, niente da installare | [Provare BASE senza installare nulla](essayer-sans-installer.md) |
| Volete vedere, valutare e curare la vostra BASE | `base studio --root mon-dossier` (lo Studio grafico) |
| Non avete ancora il repository | [Ottenere BASE](obtenir-base.md) |

La maggior parte degli strumenti IA in grado di leggere i vostri file funziona anche (per esempio GitHub Copilot, Antigravity, Claude Code o Cowork, OpenCode, Kilo Code): dite loro «Leggi `.ai/agents/[nom-agent]/AGENT.md` e segui le sue istruzioni». Alcuni strumenti rilevano le skill nel formato `SKILL.md` in modo nativo; altrimenti l'agente carica le skill su richiesta leggendole come file Markdown.

## Prerequisiti comuni

- **Uno strumento IA in grado di leggere i vostri file** (per esempio GitHub Copilot, Antigravity, Claude Code o Cowork, OpenCode, Kilo Code): nient'altro che lo strumento stesso.
- **CLI BASE o server MCP**: Node 18 o superiore. È l'unica dipendenza del nucleo.
- **BASE Studio (il laboratorio)**: nient'altro. `base studio` installa le proprie dipendenze al primo avvio e apre il vostro browser.

> **Il vostro strumento IA è l'esperienza; Studio è il laboratorio.** Il lavoro quotidiano avviene nei vostri file, con il vostro strumento abituale; Studio serve a costruire, valutare e curare ciò che essi contengono.

## Perché uno spazio di lavoro locale?

I vostri file, le vostre istruzioni e il vostro contesto persistono nella vostra cartella, sotto il vostro controllo, invece di vivere in una piattaforma web. A seconda dello strumento scelto, il contenuto inviato al modello può comunque transitare attraverso il fornitore IA; verificate le condizioni applicabili prima di utilizzare dati sensibili.

## E poi?

- Primo successo in 5 minuti: [Avvio rapido](quickstart.md).
- Creare il proprio assistente: aprite la cartella principale di BASE e dite «Leggi `.ai/agents/createur-agent/AGENT.md` e segui le sue istruzioni». Il creatore vi guida dall'inizio alla fine e propone la configurazione adatta al vostro strumento.

---

BASE è un framework di [AI Swiss](https://a-i.swiss). Caso d'uso in collaborazione con [Innovaud](https://innovaud.ch).
