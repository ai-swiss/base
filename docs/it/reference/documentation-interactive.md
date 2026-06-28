<!-- fr-synced: 73aa5063cc02dd7b4f51370e56c4f9e7fbf67133 -->

# Generare e pubblicare un sito di documentazione dai vostri file canonici

Consultare o pubblicare la documentazione del vostro BASE senza mai ricopiarla altrove: BASE genera un sito, locale o pubblico, direttamente dal repository. I file Markdown, JSON e le specs restano le fonti di verità, e il sito ne è soltanto una proiezione interattiva (navigazione per sezioni, percorsi di apprendimento, esploratore, mappa del sistema, laboratorio di routing, qualità e pagine delle risorse). Questo serve a chi desidera una vista navigabile del corpus senza mantenere una seconda documentazione che diverge.

L'interfaccia del sito è bilingue, francese per impostazione predefinita con un'opzione di passaggio all'inglese. La versione francese di ogni pagina fa fede; vedere [Lingue](langues.md). Il contenuto mantiene la lingua della sua fonte, in linea con le [lingue di BASE](langues.md). La navigazione laterale è generata da `navigation.json`, la proiezione di navigazione del modello documentale: nessun elenco di pagine viene mantenuto a mano.

```mermaid
flowchart TD
    A[File canonici (Markdown, JSON, specs)] --> B[Modello documentale]
    B --> C[Sito interattivo]
    C --> D[Vedere in locale]
    C --> E[Sito statico interno]
    C --> F[Sito pubblico filtrato]
    B --> G[Validazione degli invarianti]
    G --> F
```

## Vedere in locale

Dalla radice del repository:

```bash
npm run docs:serve
```

Il comando genera prima il modello documentale, poi avvia il sito Astro/Starlight in locale.

## Costruire un sito statico

Per costruire un sito statico interno:

```bash
npm run docs:build
```

Per costruire un sito pubblico, filtrato sulle risorse pubblicabili:

```bash
npm run docs:build:public
```

Per scegliere esplicitamente la cartella distribuibile:

```bash
node tools/base.mjs docs build --public --out public-site
```

La cartella ottenuta contiene un sito statico. Potete servirla con la maggior parte degli host compatibili con HTML statico.

## Validare prima della pubblicazione

```bash
node tools/base.mjs docs validate
```

La validazione verifica gli invarianti del modello, in particolare l'esclusione di `.plans/` e `.temp/`, la separazione tra pubblico e interno e i link locali.

## Cosa mostra il sito

- la navigazione laterale: le sezioni del corpus (iniziare, comprendere, guide, profili, fiducia, esempi, riferimento), proiettate dal modello;
- le pagine delle risorse: rendering delle fonti canoniche, contenuto prima di tutto, metadati e backlink in un pannello richiudibile; i link interni del Markdown vengono riscritti verso le pagine del sito;
- `Percorsi guidati`: percorsi di lettura secondo il bisogno;
- `Concetti`: spiegazione visiva di route -> process -> validation -> écriture;
- `Esempi guidati`: visita passo passo degli esempi copiabili;
- `Esploratore`: inventario strutturato e filtrabile delle risorse;
- `Mappa del sistema`: famiglie e relazioni del repository;
- `Laboratorio di routing`: fixtures di routing con richieste e aspettative;
- `Prove`: promesse collegate a meccanismi, test e limiti;
- `Qualità`: errori, avvisi e politica di inclusione;
- la ricerca full text (Pagefind), costruita durante il build statico.

## Disciplina di manutenzione

Non scrivete direttamente nel sito una prosa che descrive BASE. Collocatela nel file canonico appropriato, poi lasciate che il modello la proietti. Le pagine del sito devono restare adattatori, non una seconda documentazione.
