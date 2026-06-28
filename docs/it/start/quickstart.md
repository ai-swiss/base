<!-- fr-synced: 8b120a1e1b1bc8fddc875ade3d6a6eff6339136e -->

# Costruite il vostro primo assistente

In pochi minuti trasformate un compito che ripetete a mano in un assistente che se ne occupa, senza scrivere codice e senza cedere nulla del controllo: lui propone, voi convalidate. Concretamente, copiate un esempio in uno strumento IA capace di leggere i vostri file (per esempio GitHub Copilot, Antigravity, Claude Code o Cowork, OpenCode, Kilo Code), dite che cosa volete fare, e l'assistente fa il resto.

> **Non avete ancora il repository?** Consultate [Ottenere BASE](obtenir-base.md) per scegliere tra ZIP, clone Git, copia di esempio o pacchetto per browser.
>
> **Non avete ancora installato uno strumento?** Consultate la [guida all'installazione](installer.md) per configurare uno strumento IA capace di leggere i vostri file (per esempio GitHub Copilot, Antigravity, Claude Code o Cowork, OpenCode, Kilo Code).
>
> **Avete solo un browser (ChatGPT, Claude)?** Non serve installare nulla per cominciare: seguite [Provare BASE senza installare nulla](essayer-sans-installer.md).

Potete usare questo avvio in tre modi:

- per la vostra vita privata, copiando un esempio e adattandolo ai vostri compiti;
- per una start-up o una PMI, stabilizzando un workflow utile prima di estenderlo;
- per un'organizzazione più grande, come dimostrazione locale prima di aggiungere i controlli interni necessari.

---

## 1. Copiate

Copiate la cartella `exemples/assistant-devis/` nel vostro spazio di lavoro (per esempio sul Desktop o nei Documenti).

> **Volete prima solo vedere il risultato?** Aprite piuttosto `exemples/assistant-devis-demo/` (già compilato con un'azienda fittizia) e chiedete «Dupont SA ha diritto allo sconto fedeltà?». L'assistente dovrebbe basarsi sui vostri file, nominare la regola e porre un `[A VALIDER]`. Il percorso esatto si trova in [Vedere BASE in azione](demo-60-secondes.md).

## 2. Aprite

| Strumento | Come |
|-------|---------|
| **Cursor** | File → Apri una cartella → selezionate la cartella copiata |
| **Claude Code** | Avviate `claude` nella cartella copiata |
| **ChatGPT** | Configurate il [server MCP](installer-mcp.md) → caricate l'agente → formulate una richiesta concreta |

> **Preferite un laboratorio visivo?** Studio è opzionale: avviate `npm run studio` per aprire il laboratorio e vedere i vostri file, i vostri agenti e i loro processi a colpo d'occhio. Il vostro strumento IA resta l'esperienza quotidiana; Studio funge da laboratorio.

## 3. Dite che cosa volete fare

Per esempio: «Buongiorno, vorrei configurare la mia attività». L'assistente vi guida nella configurazione della vostra attività o della vostra azienda: nome, servizi, prezzi, condizioni. Rispondete alle sue domande; lui propone i file da creare o modificare, e poi voi convalidate le decisioni importanti.

## 4. Create il vostro primo preventivo

> «Ho un cliente, Dupont SA, che mi chiede 3 giorni di consulenza strategica.»

L'assistente riformula la richiesta, la quantifica e vi propone il preventivo. Voi convalidate, lui genera i file.

## Voi convalidate, l'assistente scrive dopo

Due riferimenti rendono visibile questo controllo:

- **`[A VALIDER]`**: quando l'assistente propone qualcosa che non è ancora confermato (un prezzo, un preventivo), lo contrassegna con `[A VALIDER]`. Questo marcatore è un riferimento facile da ritrovare a colpo d'occhio, per voi come per i vostri strumenti. Finché è presente, nulla è fissato: tocca a voi confermare.
- **La scrittura avviene in due tempi**: per le azioni che passano per BASE (`base propose` poi `base commit`, o l'equivalente lato MCP), una modifica viene dapprima *proposta* (vi viene mostrato un diff, nulla viene scritto), poi *applicata* solo dopo la vostra conferma. Vedete che cosa cambierà prima che cambi. Al di fuori di questi strumenti, l'assistente vi guida ma non applica questo controllo al posto vostro.

Concretamente: chiedete di aggiungere una riga al preventivo. L'assistente non la scrive subito, vi mostra la riga e il nuovo totale; voi dite «sì», e solo allora il file cambia. Vedete l'effetto prima che esista.

Questo controllo vale anche per ciò che esce dalla vostra macchina: una risorsa contrassegnata come riservata non viene trasmessa a un modello remoto, e la verifica avviene prima della chiamata. Dettaglio: [Ciò che può uscire, e ciò che BASE trattiene](../trust/frontiere-local-vs-sortant.md).

**Per andare oltre:** le [pratiche del co-pensiero](../learn/pratiques-co-pensee.md) mostrano, attraverso esempi, i modi di interagire con l'IA che hanno più valore.

## 5. E poi?

| Ciò che volete | Ciò che dite o fate |
|--------------------|----------------------------|
| Un altro preventivo | «Nuovo preventivo per [cliente]» |
| Provare la comunicazione | Copiate `exemples/assistant-communication/`: post LinkedIn, newsletter |
| Provare lettere ed email | Copiate `exemples/assistant-courrier/`: redigere e rispondere, nel registro giusto |
| Provare il reclutamento | Copiate `exemples/assistant-rh/`: offerte di lavoro, colloqui |
| Provare la gestione di progetto | Copiate `exemples/assistant-projet/`: pianificazione, traguardi, monitoraggio |
| Provare i verbali di riunione | Copiate `exemples/assistant-reunion/`: decisioni, azioni, monitoraggio |
| Vedere come BASE instrada una richiesta | Dalla radice del repository: `node tools/base.mjs route-test --root exemples/routage-pme` |
| Il vostro assistente | Aprite la cartella principale del progetto e dite «Leggi `.ai/agents/createur-agent/AGENT.md`» |
| Trovare da dove cominciare | Stessa cosa, poi dite «Aiutami a trovare da dove cominciare» |
| **Persi, o una domanda su BASE?** | Nel repository BASE o in un progetto in cui il router è attivato, dite «Sono perso» o «Aiuto»: il concierge vi accoglie. Ogni esempio di settore include ormai un'accoglienza di riserva, quindi «Sono perso» vi orienta anche in una cartella copiata. |
| Lasciarsi ispirare | Consultate la [galleria di idee](../guides/idees-agents.md) |

> **Due porte diverse.** In un progetto con router, «Aiuto / Sono perso» apre l'**accoglienza** (concierge): orienta e risponde alle domande su BASE. «Aiutami a trovare da dove cominciare» apre la **diagnosi** del creatore di assistenti: individua *quale assistente costruire* per la vostra attività.

---

**Promemoria**: l'IA può sbagliare e inventare dettagli. Rileggete sempre un preventivo prima di inviarlo.

Per un uso personale, questa guida basta. Per un team, aggiungete `base.config.json`, `base validate`, `base entretien` e i riferimenti di `docs/reference/framework-public.md`. `BASE_BOOTSTRAP.md` serve a collegare un router a uno strumento IA; resta al di fuori dell'ambito della governance di team. Per una grande organizzazione, consultate anche `docs/reference/framework-public.md` prima di qualsiasi distribuzione.

Per una PMI o una piccola squadra, aggiungete il [kit di avvio PMI svizzere](../audiences/kit-demarrage-pme-suisse.md) prima di condividere un assistente: dati autorizzati, convalida umana, versioning e manutenzione mensile.

---

BASE è un framework di [AI Swiss](https://a-i.swiss). Caso d'uso in collaborazione con [Innovaud](https://innovaud.ch).

## Ho già una cartella di note o di procedure

Si parte raramente da una pagina bianca. Due porte, stesso risultato:

- **CLI**: `base init --root mia-cartella` mostra esattamente i file che verrebbero creati
  (un agente minimo, o un file workspace se la cartella contiene già più BASE);
  `--yes` li crea: mai una sovrascrittura.
- **Studio**: avviate il laboratorio sulla cartella (`base studio --root mia-cartella`): la schermata
  Benvenuto mostra lo stesso piano, con contenuto leggibile, e un pulsante «Creare questi file».
  L'applicazione passa poi alla modalità normale, senza riavviare. Il vostro strumento IA resta
  l'esperienza quotidiana; Studio funge da laboratorio, e i vostri file restano al centro, con
  lo strumento IA di vostra scelta (per esempio GitHub Copilot, Antigravity, Claude Code o Cowork, OpenCode, Kilo Code).

In seguito, per convertire i vostri documenti in processi e competenze, chiedete al vostro assistente:
«importare le mie procedure esistenti». Il router lo invierà su `importer-l-existant`, che
propone ogni conversione come diff. Questo router resta rudimentale ma efficace, ed estensibile tramite
adattatori. Vi evita di cercare da soli il processo giusto.
