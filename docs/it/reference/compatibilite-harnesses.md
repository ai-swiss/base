<!-- fr-synced: db50893283bf35fa5e9828119242bfa5090f3387 -->

# Sapere quali garanzie ottieni a seconda del tuo strumento

I tuoi file BASE funzionano in uno strumento IA capace di leggere i tuoi file (per esempio GitHub Copilot, Antigravity, Claude Code o Cowork, OpenCode, Kilo Code), così come in una piattaforma web IA standard tramite MCP (per esempio ChatGPT, Claude, Gemini), ma **le garanzie variano da uno strumento all'altro**. Questa pagina ti dice, senza giri di parole, cosa protegge davvero ciascun harness, affinché tu possa scegliere il tuo livello di fiducia con piena cognizione di causa.

> Regola di onestà: una garanzia è **stretta** solo per le azioni che passano attraverso BASE (la sua CLI, il suo broker, il suo server MCP o un connettore controllato). Un'azione che **aggira** BASE (un agente che scrive direttamente in un file) rimane al livello nativo dell'harness.

## Tre livelli

- **advisory** (1): BASE guida e traccia, ma lo strumento può ignorarlo.
- **mediazione parziale** (2): alcune azioni passano attraverso BASE, altre no.
- **stretto** (3): l'azione è mediata; il broker è la porta obbligata per le azioni instradate da BASE.

## Matrice

Questa matrice è **generata** dal nucleo (`base build tools`), il che la mantiene sincronizzata con la dichiarazione del framework. Indica il **livello massimo raggiungibile** quando l'azione passa davvero attraverso BASE e l'harness è configurato per farlo. Non misura automaticamente lo stato reale della tua installazione.

| Garanzia | claude-code | cursor | chatgpt (mcp) | generico |
| --- | --- | --- | --- | --- |
| Confinamento dei percorsi (accesso mediato) | 3 | 3 | 3 | 1 |
| Conferma prima della scrittura (`propose`/`commit`) | 3¹ | 2 | 3¹ | 1 |
| Esecuzione di strumenti (dry-run + conferma) | 3¹ | 2 | 3¹ | 1 |
| Scoperta nativa delle skill | 3 | 2 | 1 | 1 |
| Hook / barriere meccaniche | 3² | 2² | 0 | 0 |

¹ Livello 3 solo per le azioni instradate dal broker BASE (`propose`/`commit`, `invoke`). Una scrittura o esecuzione che aggira il broker rimane advisory.

² Livello raggiungibile solo se l'harness è configurato per instradare le azioni interessate verso il broker o un hook. BASE non fornisce questi hook per tutti gli harness.

## Cosa comporta

- **Per un uso personale**, la modalità advisory è sufficiente: rivedi e convalidi comunque.
- **Per un team o un'organizzazione**, fai passare le azioni sensibili attraverso il broker (CLI, MCP) o un hook, e configura una policy stretta (`base.config`). È qui che le garanzie diventano reali.
- **Il server MCP** offre l'enforcement più ermetico, poiché l'agente ha accesso solo agli strumenti e mai direttamente ai file, ma è anche quello che richiede la maggiore configurazione; vedi [server MCP](../../mcp/).

Per il dettaglio ingegneristico (la porta `PolicyEnforcer`, il confine esatto), vedi `specs/current/10_core/policy.md`.

---

BASE è un framework di [AI Swiss](https://a-i.swiss). Casi d'uso in partnership con [Innovaud](https://innovaud.ch).
