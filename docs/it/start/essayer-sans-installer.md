<!-- fr-synced: ca9a05b8a4f5f34ad21f5041f5993e7265ce8ec9 -->

# Provare BASE senza installare nulla di nuovo

Il modo più rapido per cogliere BASE non è installarlo, ma leggerlo: [Perché BASE](../learn/co-penser-avec-lia.md) ne mostra il metodo e la profondità in pochi minuti. Quando vorrete vederlo funzionare, questa pagina propone due modi per provare un vero assistente senza installare nulla dal lato BASE. Vi serve soltanto uno strumento di IA, quello che già usate.

Entrambi partono dalla stessa cartella di esempio. Scaricate il repository con un clic, **[base-main.zip](https://github.com/ai-swiss/base/archive/refs/heads/main.zip)**, poi decomprimetelo (Windows: clic destro sul file, **Estrai tutto**, un doppio clic non basta; Mac: doppio clic). Ottenete una cartella **`base-main`**; l'esempio da aprire è **`base-main/exemples/veytaux-tourisme`**, l'ufficio del turismo di Veytaux, un progetto giocattolo.

## Il più semplice: una chat IA nel browser

Se avete già un assistente IA in un browser (ChatGPT, Claude o un altro), non c'è nulla da installare: un assistente BASE è un insieme di file di testo che struttura la vostra collaborazione (saper fare, sapere, dati), non una semplice documentazione, e che gli fornite come contesto.

1. Nella cartella `veytaux-tourisme`, individuate i file Markdown: l'`AGENT.md` (sotto `.ai/agents/...`) e quelli di `skills/`.
2. Create, nel vostro strumento, uno spazio che tenga questi file a portata di mano durante la conversazione (a seconda dello strumento: un Progetto, un assistente personalizzato, uno spazio di lavoro).
3. Incollate il contenuto dell'`AGENT.md` nelle istruzioni e allegate gli altri file Markdown.
4. Parlategli: «Buongiorno, vorrei configurare la mia attività.»

L'unica cosa da sapere: una chat web non esplora una cartella da sola, le fornite i file una volta. È il percorso più accessibile per vedere il metodo all'opera.

## Il più completo: uno strumento IA che apre la cartella

Affinché l'assistente lavori dall'interno, leggendo tutta la cartella e agendo sotto il vostro sguardo, serve uno strumento IA capace di aprire una cartella e leggerne i file (per esempio GitHub Copilot, Antigravity, Claude Code o Cowork, OpenCode, Kilo Code; alcuni si usano in una finestra, altri nel terminale, come [Claude Code](installer-claude-code.md)). Scegliete quello con cui siete già a vostro agio.

1. Installatelo dal suo sito ufficiale e accedete; un modello gratuito è sufficiente per provare.
2. Apritevi la cartella **`base-main/exemples/veytaux-tourisme`** (spesso *File → Open Folder*), in **modalità Agente** affinché legga i file.
3. Chiedete «Quali attività proponete questo pomeriggio?». L'assistente segue il metodo descritto nei file; proseguite con il [tutorial passo passo](../tutoriel/index.md).

> **Guasto comune**: se l'assistente vi parla di «routing» o di «BASE» invece che di Veytaux, avete aperto la radice `base-main`, che è il framework. Riaprite la sottocartella `exemples/veytaux-tourisme`.

## La vostra cartella

Per partire dai VOSTRI dati: copiate `base-main/exemples/starter-perso` dove preferite (i vostri
Documenti), rinominatela e riaprite QUESTA cartella nel vostro strumento. Oppure chiedete al vostro assistente:
«copia la cartella starter-perso nei miei Documenti».

## Il limite onesto e il passo successivo

Qui è il **modello** che instrada seguendo delle indicazioni (`CLAUDE.md`,
`.cursor/rules/assistant.mdc`): pratico, ma può sconfinare. Per le **garanzie
meccaniche** (routing deterministico, scritture validate, confinamento), passate per
[la lettera alla vostra IA](installer-par-votre-ia.md) (5 minuti), oppure consultate
[Installare](installer.md) e [Sicurezza e limiti](../trust/securite-et-limites.md) per il
confine tra *indicazione* (seguita) e *meccanismo* (applicato).
