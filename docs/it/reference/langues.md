<!-- fr-synced: 4c69f0cae012026065cc9232a1c25c4064d8bc73 -->

# Capire quale lingua usa BASE, e dove

Se vi state chiedendo perché la documentazione è in francese mentre le specifiche sono in inglese, questa pagina ve lo spiega in una sola lettura. Si rivolge a chiunque scopra il progetto, vi contribuisca o voglia costruire un assistente: indica quale lingua governa cosa, e perché i vostri assistenti non sono vincolati a nessuna di queste due lingue.

## Il francese per il metodo

La documentazione pubblica (`docs/`, [README](../../README.md), [Manifesto](../../MANIFESTO.md)) è in francese. È la lingua del metodo: quella in cui BASE spiega perché strutturare la collaborazione con l'IA, come verificare, come mantenere la sovranità sui propri file. In un paese plurilingue, scrivere il metodo in una lingua nazionale lo rende semplicemente più accessibile ai suoi lettori.

## L'inglese per il contratto tecnico

Le specifiche di ingegneria ([`specs/`](../../specs/current/README.md)) sono in inglese, la lingua del contratto tecnico. I requisiti, gli invarianti e le decisioni di architettura vi sono collegati al codice e ai test, e il loro pubblico è quello dei contributori e dei manutentori, la cui lingua di lavoro è l'inglese. La precisione di un contratto di ingegneria soffre delle traduzioni approssimative; un'unica versione normativa, in inglese, evita le divergenze.

## I vostri assistenti parlano la lingua dei loro utenti

Gli assistenti costruiti con BASE non sono vincolati a nessuna lingua in particolare. Il routing predefinito è lessicale: confronta le parole normalizzate di una richiesta con quelle dei vostri file, senza grammatica né lessico di una lingua specifica. Un assistente dichiarato con keys tedesche, italiane o inglesi instrada e risponde in quella lingua. La lingua della documentazione del framework non impone nulla alla lingua dei vostri assistenti.

## Chi legge cosa

| Profilo | Lingua | Punto d'ingresso |
| ------ | ------ | -------------- |
| Utente, creatore di assistenti, decisore | Francese | [README](../../README.md), [In quale ordine leggere](../start/lire-dans-quel-ordre.md) |
| Responsabile della conformità, istituzione | Francese | [Sovranità, fiducia e conformità](../trust/souverainete-et-confiance.md) |
| Sviluppatore, integratore, auditor tecnico | Inglese | [Specifica corrente](../../specs/current/README.md) |
| Contributore al framework | Entrambe | [CONTRIBUTING](../../CONTRIBUTING.md) |

## Traduzioni

Già disponibili: il [README in inglese](../../README.en.md) e il manifesto in [inglese](../../MANIFESTO.en.md), [tedesco](../../MANIFESTO.de.md) e [italiano](../../MANIFESTO.it.md). Le altre traduzioni (un `README.de.md`, una cartella per lingua) sono contributi particolarmente benvenuti. La convenzione è descritta in [CONTRIBUTING](../../CONTRIBUTING.md): mantenere la sobrietà dell'originale, non tradurre gli identificatori tecnici e ricordare in cima al file che **la versione francese fa fede**.

---

BASE è un framework di [AI Swiss](https://a-i.swiss). Caso d'uso in partnership con [Innovaud](https://innovaud.ch).
