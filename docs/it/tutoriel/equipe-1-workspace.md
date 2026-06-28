<!-- fr-synced: 9d7aed17a4ae32c71898e8b2e3eaf9dde82e5ee2 -->

# Il workspace multi-perimetro

*⏱ ~15 min · modulo 1/3, percorso Team*

**Farete**: navigare un workspace con due root e capire che un root è un perimetro di scrittura, dimostrato dal ✅ qui sotto.
**Vi serve**: Node 18+ e il repository; un terminale nella radice.

1. Avviate lo Studio sul workspace di esempio:
   `base studio --root exemples/agence-multi-clients`.
2. L'albero mostra due root (Dupont, Martin), ciascuno con il badge `⌂`.
3. Cercate `tarif` dall'intestazione del workspace: compaiono le schede di entrambi i root,
   ciascuna con il badge del proprio root.
4. Aprite una scheda di Martin: il contesto passa al root di Martin.

✅ **Verificate**: una ricerca nel workspace restituisce schede di ENTRAMBI i root, ciascuna identificata dal proprio root; aprire una scheda vi colloca nel perimetro di quel root.

💡 **Perché ha funzionato**: un workspace riunisce più BASE indipendenti. Un root = un perimetro di scrittura: una modifica in Martin non può toccare Dupont. È la paratia che rende sicuro il multi-cliente.

🔁 **Da voi**: quanti perimetri distinti (clienti, team, progetti) avrebbe la vostra organizzazione?

→ **E adesso**: [Modulo 2: perimetri ed egress](equipe-2-perimetres-et-egress.md).

🆘 **Guasti comuni**: *Si visualizza un solo root*: verificate `base.workspace.json` nella radice della cartella aperta. *La ricerca non si espande*: cercate dall'intestazione del workspace, non da un singolo root.
