<!-- fr-synced: 5c4b8bab645ea889e7d7dc3a07130e2165464668 -->

# Ottenere BASE: scegliere il proprio percorso di installazione

Il modo in cui ottieni BASE decide cosa potrai farne in seguito: semplicemente provare un assistente, partire dai tuoi dati, oppure seguire gli aggiornamenti e contribuire. I punti qui sotto sono **opzioni indipendenti**, non passaggi da concatenare: leggili, poi scegli quello che corrisponde alla tua esigenza. Per provare semplicemente un assistente, lo ZIP o la copia di un esempio bastano; il clone Git diventa utile se vuoi seguire gli aggiornamenti o contribuire.

> **Il più rapido, e senza terminale dalla tua parte:** lascia che lo faccia il tuo strumento IA. Incolla un solo blocco in uno strumento IA capace di leggere i tuoi file (per esempio GitHub Copilot, Antigravity, Claude Code o Cowork, OpenCode, Kilo Code) e installa BASE, crea il tuo spazio di lavoro e ti dice quando è pronto: vedi [Fai installare BASE dalla tua IA](installer-par-votre-ia.md).

## 1. Senza installare nulla (solo browser)

Se vuoi soltanto sperimentare il metodo in ChatGPT o Claude, senza strumenti tecnici, segui [Provare BASE senza installare nulla](essayer-sans-installer.md). È il livello minimo: istruzioni seguite dal modello, senza le garanzie meccaniche dei livelli successivi.

## 2. Scaricare il repository in ZIP (il più semplice)

1. Apri la pagina del progetto su GitHub: `https://github.com/ai-swiss/base`.
2. Pulsante verde **Code**, poi **Download ZIP**.
3. Decomprimi la cartella.
4. Apri una cartella di **esempio** (per esempio `exemples/assistant-devis-demo/`) in uno strumento IA capace di leggere i tuoi file (per esempio GitHub Copilot, Antigravity, Claude Code o Cowork, OpenCode, Kilo Code), non la radice del repository.

Ogni esempio è indipendente: è un assistente completo che apri nello strumento IA per formulare la tua richiesta.

## 3. Copiare un solo esempio

Non hai bisogno dell'intero repository. Una cartella sotto `exemples/` si copia dove vuoi e funziona da sola. È il modo consigliato per partire dai tuoi dati: copia l'esempio più vicino al tuo settore, rinominalo, sostituisci il contenuto.

## 4. Clonare con Git (per seguire gli aggiornamenti)

```bash
git clone https://github.com/ai-swiss/base.git
cd base
```

Puoi poi aprire un esempio nel tuo strumento IA, oppure usare la CLI locale (livello team) descritta nella [guida di installazione](installer.md). La CLI non richiede alcuna dipendenza per il nucleo (Node 18 o superiore basta); vedi `README.md` per i comandi.

## 5. Pack browser (un solo file da incollare)

Per una persona che ha solo un browser, puoi preparare **un solo file Markdown** che riunisce un agente e tutti i suoi skill, pronto da incollare in ChatGPT o Claude web. Dal repository (Node necessario per generare, non per usare):

```bash
npm run browser-pack -- --root exemples/assistant-devis-demo --out assistant-devis.md
```

Condividi `assistant-devis.md`: la persona lo incolla nella sua conversazione, poi scrive «Buongiorno, vorrei configurare la mia attività». In modalità browser, il modello si limita a seguire queste istruzioni: non offre le garanzie meccaniche della CLI o dell'MCP (vedi [Provare BASE senza installare nulla](essayer-sans-installer.md)).

## 6. Distribuzione npm e Releases

La distribuzione tramite pacchetti npm (`@ai-swiss/base` e i pacchetti opzionali) e tramite archivi **Releases** di GitHub è prevista man mano che la superficie pubblica si stabilizza (vedi [Versioni e stabilità](../reference/versions-et-stabilite.md)). Nel frattempo, lo ZIP, la copia di un esempio e il clone Git qui sopra sono i percorsi ufficiali.

## E poi?

- Primo successo in 5 minuti: [Avvio rapido](quickstart.md).
- Collegare il tuo strumento (uno strumento IA capace di leggere i tuoi file, per esempio GitHub Copilot, Antigravity, Claude Code o Cowork, OpenCode, Kilo Code; oppure ChatGPT, Claude e l'MCP): [Collega il tuo strumento IA](../guides/connecter-votre-outil.md).
- Quale percorso secondo il tuo profilo: [In quale ordine leggere](lire-dans-quel-ordre.md).
- Bloccato in un esempio: chiedi aiuto. Con la CLI, l'MCP o un harness che segue il routing, BASE ti orienta meccanicamente verso l'accoglienza configurata; in modalità solo browser, è un'istruzione seguita dal modello.
