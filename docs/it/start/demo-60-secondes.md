<!-- fr-synced: a2ceba8213fa64543dce6cda779153a8cb7c5f05 -->

# Vedere BASE in azione

Prima di affidare un caso reale a un'IA, volete sapere se potete fidarvi. Questa demo lo mostra in meno di un minuto: un assistente BASE che si appoggia ai vostri file, nomina la regola che lo giustifica e pone un `[A VALIDER]` invece di decidere da solo, là dove un chat generico tenderebbe a improvvisare. Poi sta a voi giudicare se questa onestà cambia le carte in tavola per il vostro lavoro.

Questa demo utilizza `exemples/assistant-devis-demo/`, già riempito con un'azienda fittizia, un catalogo di servizi, un cliente e un preventivo.

Non avete ancora il repository a portata di mano? [Provare senza installare nulla](essayer-sans-installer.md) mostra i percorsi più semplici per recuperare la cartella e darla alla vostra IA, dall'opzione più leggera alla più completa.

## 1. Aprite la demo

In uno strumento IA capace di leggere i vostri file (per esempio GitHub Copilot, Antigravity, Claude Code o Cowork, OpenCode, Kilo Code), aprite la cartella (questa cartella, non la radice del repository):

```text
exemples/assistant-devis-demo/
```

## 2. Ponete una domanda che richiede una verifica

Nel chat, scrivete:

```text
Dupont SA a-t-il droit à la remise fidélité?
```

È una domanda trabocchetto. La scheda di Dupont SA indica «Client (1er mandat)», mentre la regola di fedeltà richiede due mandati. Un chat generico, che non conosce né il vostro cliente né le vostre regole, rischia di inventare una risposta plausibile.

## 3. Leggete la risposta

L'assistente deve andare a leggere due dei vostri file e rispondere in questo spirito:

> Secondo `catalogue/regles-tarification.md`, lo sconto fedeltà (-5%) si applica ai clienti che hanno già firmato due mandati. La scheda `clients/dupont-sa.md` indica «Client (1er mandat)». Dupont SA non vi ha quindi ancora diritto. **[A VALIDER]** confermate lo stato del cliente prima di applicare uno sconto.

Tre cose sono appena successe. L'assistente ha letto i vostri file invece di indovinare. Vi ha detto la verità, anche deludente, piuttosto che un «sì» accomodante. Infine, vi ha restituito la decisione con un marcatore ricercabile.

## Ciò che avete appena visto

- **Legge la vostra realtà.** La risposta cita `regles-tarification.md` e `dupont-sa.md`, i vostri file, non una memoria generica.
- **Non lusinga.** Quando la risposta onesta è «no», dice «no» e mostra la regola che lo giustifica.
- **Si ferma al momento giusto.** Il `[A VALIDER]` vi lascia la decisione e rimane ritrovabile con una sola ricerca, anche tra sei mesi.
- **Dimostra invece di promettere.** Su un preventivo, gli importi non sono «all'incirca»: lo strumento `calculer-devis` ricalcola l'IVA e i totali in modo deterministico, e l'assistente segnala uno scarto invece di affermarlo.
- **Nulla si è mosso.** Nessun file scritto, nulla inviato da BASE (il vostro strumento IA, da parte sua, tratta la conversazione secondo le proprie condizioni). Mantenete il controllo.

## Il secondo turno: ciò che un chat generico non può fare

Il primo turno mostrava l'onestà. Il secondo mostra una garanzia che la buona volontà di un modello non offre. Contrassegnate una risorsa come `confidential` (per esempio una griglia di sconti) e fate lavorare l'assistente **tramite il broker** (server MCP o chat dello Studio): se deve chiamare un modello remoto, BASE **verifica prima dell'invio** e trattiene questa risorsa. Non esce. Non è un'istruzione che il modello potrebbe dimenticare, è un **meccanismo**, verificato da codice testato (`tools/core/egress.mjs`, `tests/base-egress.test.mjs`).

La portata è precisa: questa ritenuta opera **tramite il broker** (MCP, Studio, valutazione); come agente di editor diretto, lo stesso confinamento è solo un'istruzione. L'esempio `exemples/agence-multi-clients/` mostra la scala: un'agenzia, più clienti, ogni assistente confinato alla sua radice, la griglia confidenziale consultata per fissare il prezzo senza mai essere ricopiata nell'offerta.

## Andare oltre

- **Vedere un documento finito:** chiedete «Mostrami il preventivo DEV-2026-001». Esiste già in `devis/DEV-2026-001.md`.
- **Creare il vostro:** copiate `exemples/assistant-devis/`, poi dite «Salve, vorrei configurare la mia attività». Questa versione parte vuota e vi guida.
- **Sapere cosa leggere dopo:** seguite [Da dove cominciare](lire-dans-quel-ordre.md).
