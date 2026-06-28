<!-- fr-synced: 9695aebc013ecf6b35330f4278d7a704d6e9b518 -->

# Protezione dei dati

Quando si usa BASE, dove vanno i dati? La risposta condiziona la vostra conformità alla nLPD e al RGPD, e la fiducia che potete riporre nello strumento. Per il DPO, il responsabile della conformità o il dirigente prudente che si fa carico di questa domanda, questa sintesi consolida ciò che è documentato altrove e vi rimanda.

## Quali dati tratta BASE

- **I vostri file locali.** BASE struttura file di testo (Markdown, JSON) che vivono nelle vostre cartelle e vi appartengono. Li legge e li scrive localmente: le uniche copie sono locali (un'istantanea della modifica proposta in `.ai/changes/`, e il giornale locale `.ai/trace/` che registra identificatori e percorsi, non il contenuto). Nulla viene inviato altrove senza un'azione da parte vostra.
- **Tracce tecniche minime.** Le azioni che passano attraverso BASE scrivono una riga JSONL locale in `.ai/trace/`: identificatori di risorse e percorsi delle operazioni mediate (localmente), decisioni, durate, mai il contenuto dei file. Queste tracce servono alla manutenzione e all'audit locale, non alla sorveglianza, e si gestiscono con `base trace prune`.

## Cosa esce dalla vostra macchina, e quando

Nulla, per impostazione predefinita. Il cuore di BASE non effettua alcuna chiamata di rete: il routing predefinito è locale e lessicale. Ogni uscita di dati corrisponde a una scelta esplicita da parte vostra, mai a un'impostazione nascosta.

| Uscita possibile | Quando | Chi decide | Dove è documentato |
| --------------- | ----- | ---------- | ------------------ |
| Lo strumento IA che usate sopra BASE | In ogni conversazione in cui gli affidate del contenuto | Voi, scegliendo lo strumento e ciò che gli mostrate | [Sicurezza e limiti](securite-et-limites.md), sezione «Dati e fornitori IA» |
| Un fornitore di embeddings | Solo se attivate il ranker semantico opzionale | Voi, tramite configurazione esplicita; esiste un'opzione locale (Ollama) | [Sicurezza e dati del routing](securite-donnees-routage.md) |
| Il server MCP | Solo se lo esponete a un'app di chat | Voi, tramite configurazione esplicita; sola lettura per impostazione predefinita | [`mcp/README.md`](../../mcp/README.md) |

Per ogni riga, la regola è la stessa: l'uscita è disattivata per impostazione predefinita, attivata da voi, e documentata nel luogo indicato.

## Cosa BASE non fa

- **Nessuna telemetria.** BASE non invia alcuna statistica d'uso, a nessuno.
- **Nessun account.** Nessuna registrazione, nessun identificatore, nessun profilo utente.
- **Nessun cloud BASE.** Non esiste alcun server BASE che riceverebbe i vostri file: il progetto è un framework locale che vi appartiene.

## Le vostre responsabilità residue

BASE non vi rende conformi alla nLPD o al RGPD da solo. Limita, fin dalla progettazione, ciò che lascia la vostra postazione, e rende la frontiera esplicita. Il resto rimane organizzativo:

- le basi giuridiche dei vostri trattamenti;
- il registro dei trattamenti;
- i diritti delle persone interessate (accesso, rettifica, cancellazione);
- la valutazione del fornitore IA che collegate sopra BASE (condizioni, conservazione, localizzazione dei trattamenti).

È la stessa onestà che vale per la sicurezza: BASE rafforza il controllo locale, ma una politica di protezione dei dati resta indispensabile.

## Per approfondire

- Visione d'insieme per giustificare la scelta: [Sovranità, fiducia e conformità](souverainete-et-confiance.md).
- Il dettaglio del routing semantico e degli embeddings: [Sicurezza e dati del routing](securite-donnees-routage.md).
- Il modello di sicurezza completo e i suoi limiti: [Sicurezza e limiti](securite-et-limites.md).
- Per una PMI: [Kit di avvio PMI svizzera](../audiences/kit-demarrage-pme-suisse.md).
- Per un'istituzione pubblica: [Kit amministrazione e settore pubblico](../audiences/kit-administration-secteur-public.md).

---

BASE è un framework di [AI Swiss](https://a-i.swiss). Caso d'uso in partnership con [Innovaud](https://innovaud.ch).
