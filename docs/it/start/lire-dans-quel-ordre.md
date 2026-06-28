<!-- fr-synced: 86b4a62cddb75aab9ef25365a895578a40f33061 -->

# Da dove cominciare

Il repository può sembrare denso a prima vista, perché riunisce tre cose allo stesso tempo: un framework utilizzabile, esempi di dominio e una base tecnica verificabile. Questa pagina vi evita di leggere tutto fornendovi l'ordine di lettura adatto alla vostra situazione, che siate da soli, in una PMI, in una grande impresa o nel settore pubblico.

È anche la fonte di verità dei percorsi di lettura. Gli altri documenti possono riprendere una bussola breve, ma questo mantiene la gerarchia completa per profilo.

## Se siete una persona singola

Obiettivo: provare in fretta, capire abbastanza, mantenere i vostri file leggibili.

Leggete in quest'ordine:

1. `README.md` per comprendere l'idea generale.
2. `docs/learn/co-penser-avec-lia.md` per capire *perché* BASE è necessario (il metodo, in breve).
3. **`docs/tutoriel/index.md`**, il tutorial «Imparare facendo»: il percorso consigliato, passo dopo passo e verificato a ogni tappa (Scoperta senza installare nulla, Praticante, Team).
4. `docs/start/quickstart.md` per provare in pochi minuti (oppure `docs/start/essayer-sans-installer.md` se avete solo un browser, senza installare nulla).
5. La demo `exemples/assistant-devis-demo/`, poi la cartella `exemples/assistant-devis/` se volete ripartire dai vostri dati.
6. `docs/learn/comprendre.md` solo se volete approfondire il metodo.
7. `docs/trust/evidence.md` se volete verificare le promesse e i loro limiti.

All'inizio potete ignorare:

- `mcp/`;
- `tools/`;
- `tests/`;
- `base.schema.json`;
- `base.manifest.json`;
- `docs/reference/specification-v0.md`.

A questo livello, BASE può restare molto semplice: un assistente, qualche file Markdown, decisioni umane esplicite.

Se siete persi, dite semplicemente «Aiuto» o «Sono perso». Con il routing attivato, BASE vi accoglie (`concierge-base`) invece di lasciarvi senza seguito; altrimenti caricate `.ai/agents/concierge-base/AGENT.md`.

## Se siete una PMI o una piccola squadra

Obiettivo: passare da un uso individuale a una memoria di lavoro condivisa.

Leggete in quest'ordine:

1. `README.md` per l'intuizione e gli esempi.
2. `docs/learn/co-penser-avec-lia.md` per il perché: la verifica, le quattro perdite, il metodo.
3. `docs/start/quickstart.md` per l'avvio locale e i comandi.
4. `docs/audiences/kit-demarrage-pme-suisse.md` per stabilire le regole di squadra: dati, validazione, versioning, manutenzione.
5. `docs/audiences/pour-qui.md` per collocare il vostro livello di adozione.
6. `docs/reference/framework-public.md` per comprendere le astrazioni stabili.
7. `docs/reference/routage-process-et-ressources.md` per comprendere la catena agent -> process -> risorse.
8. `docs/guides/routage-semantique-quickstart.md` per capire come BASE sceglie agent e process.
9. `docs/learn/pratiques-co-pensee.md` per evitare gli usi sbagliati dell'IA.
10. `docs/reference/documentation-interactive.md` se volete esporre o distribuire una documentazione viva senza duplicare le fonti.

A questo livello, i file importanti sono:

- `.ai/agents/` per gli agenti e gli skill;
- `exemples/` per copiare una base di dominio;
- `tools/` per validare, indicizzare, scoprire e mantenere;
- `base.schema.json` per stabilizzare i metadati condivisi.

Se gestite **più radici BASE** (per esempio più clienti), un `base.workspace.json` dichiara più radici: `base route --workspace <fichier>` cerca tra di esse e `--root-id <id>` mira a una radice precisa (ogni lettura e scrittura resta confinata alla radice scelta). Vedi [Routing, process e risorse](../reference/routage-process-et-ressources.md) e `specs/current/10_core/cli.md`.

Non avete bisogno di una piattaforma pesante. Avete bisogno di convenzioni chiare, di una validazione locale, di descrizioni leggibili e di una manutenzione regolare.

## Se siete una grande impresa

Obiettivo: valutare BASE come linguaggio di strutturazione e base di integrazione, non come piattaforma di conformità completa.

Leggete in quest'ordine:

1. `docs/learn/co-penser-avec-lia.md` per il *perché* (comune a tutti i profili): la verifica, le quattro perdite, il metodo.
2. `docs/reference/framework-public.md` per il modello pubblico.
3. `docs/reference/base-et-vos-outils-ia.md` per capire come BASE coesiste con i vostri strumenti e piattaforme IA (e integrarvi un agente pianificato), poi `docs/reference/positionnement.md` per collocare BASE categoria per categoria nel panorama degli strumenti del 2026.
4. `docs/reference/etat-implementation.md` per distinguere consegnato, previsto e fuori perimetro.
5. `docs/guides/choisir-provider-embeddings.md` per confrontare locale, cloud, gateway e modello interno.
6. `docs/trust/securite-donnees-routage.md` per inquadrare i dati inviati ai provider.
7. `docs/learn/comprendre-echelle.md` e `docs/guides/benchmarks-echelle.md` per giudicare l'indice opzionale.
8. `docs/reference/specification-v0.md` per l'architettura a lungo termine.
9. `mcp/README.md` per l'integrazione alle piattaforme IA.
10. `docs/trust/securite-et-limites.md` per il modello di sicurezza e i suoi limiti.
11. `docs/audiences/kit-enterprise.md` per le modalità di distribuzione, la configurazione rigorosa e i limiti enterprise.
12. `docs/trust/souverainete-et-confiance.md` per giustificare la scelta (sovranità, nLPD, licenza, governance) in una pagina.
13. `base.schema.json` per ispezionare il contratto macchina.
14. `tests/` per vedere cosa viene verificato.

A questo livello, BASE deve essere collegato ai sistemi dell'organizzazione: IAM, SSO, RBAC, DLP, SIEM, conservazione, classificazione, revisione legale, gestione dei segreti e separazione degli ambienti.

La lettura corretta è dunque:

```text
BASE public = structure lisible + broker local + MCP + tests
Entreprise = gouvernance, sécurité et intégration autour de cette structure
```

## Se siete un'istituzione pubblica

Obiettivo: valutare BASE senza confondere componente local-first, conformità istituzionale e politica del fornitore.

Leggete in quest'ordine:

1. `docs/learn/co-penser-avec-lia.md` per il *perché*: verifica umana, responsabilità e memoria.
2. `docs/trust/souverainete-et-confiance.md` per la sintesi su nLPD, licenza, sicurezza e governance.
3. `docs/audiences/kit-administration-secteur-public.md` per inquadrare dati dei cittadini, classificazione, accessibilità, archiviazione e appalti pubblici.
4. `docs/trust/securite-et-limites.md` per tenere visibile ciò che BASE non applica da solo.
5. `docs/audiences/kit-enterprise.md` per la configurazione rigorosa e le modalità di distribuzione.
6. `mcp/README.md` se l'istituzione vuole collegare BASE a una piattaforma IA.
7. `specs/current/README.md`, `base.schema.json` e `tests/` per l'audit tecnico.

A questo livello, BASE è un componente auditabile. La conformità resta nelle vostre decisioni istituzionali: base giuridica, registro dei trattamenti, IAM, DLP, archiviazione, acquisti, fornitore del modello e revisione legale.

## Cosa significa ogni cartella

| Elemento | Ruolo | Da leggere quando |
| ------- | ---- | ------------ |
| `README.md` | Porta d'ingresso | Sempre |
| `BASE_BOOTSTRAP.md` | Bootstrap di routing generico per harness IA | Quando integrate BASE in uno strumento IA |
| `.ai/agents/` | Cuore portabile degli assistenti | Quando adattate BASE |
| `.ai/agents/concierge-base/` | Accoglienza e aiuto di BASE (obiettivo di ripiego del router) | Quando siete persi o avete una domanda su BASE |
| `exemples/` | Assistenti pronti da copiare | Quando volete provare |
| `docs/` | Spiegazioni, principi, architettura | Secondo il vostro profilo |
| `docs/start/demo-60-secondes.md` | Vedere BASE in azione: si appoggia su un file, nomina la sua fonte e pone un punto di validazione | Quando volete vedere BASE prima di leggere |
| `docs/audiences/kit-demarrage-pme-suisse.md` | Regole pratiche per una piccola squadra svizzera | Quando condividete un assistente in una PMI |
| `docs/audiences/kit-enterprise.md` | Configurazione rigorosa, modalità di distribuzione e limiti enterprise | Quando valutate BASE in un'organizzazione |
| `docs/audiences/kit-administration-secteur-public.md` | Checklist per istituzioni pubbliche | Quando dati dei cittadini, acquisti o archiviazione entrano nel perimetro |
| `docs/reference/documentation-interactive.md` | Documentazione locale, pubblica e distribuibile generata dalle fonti | Quando volete imparare, pubblicare o auditare BASE in un portale |
| `docs/trust/evidence.md` | Promesse, meccanismi, test e limiti | Quando volete auditare le affermazioni di BASE |
| `docs/reference/glossaire.md` | Definizioni dei termini (broker, routing, meccanismo, consigne, egress) | Quando una parola tecnica non è chiara |
| `docs/reference/routage-process-et-ressources.md` | Dottrina agent -> process -> risorse | Quando attivate il routing o strutturate più workflow |
| `tools/` | CLI locale e broker | Quando volete verificare o automatizzare |
| `mcp/` | Adattatore verso strumenti IA compatibili MCP | Quando volete integrare |
| `tests/` | Garanzie verificabili | Quando auditate o contribuite |
| `specs/` | Specifica di ingegneria (`UR/FR/NFR/AD`, schemi) | Quando integrate o auditate in profondità |
| `packages/` | Package ufficiali opzionali (ranker semantico, indice locale) | Su larga scala, per corpora difficili o grandi |
| `base.config.json` | Config locale: estensioni e ripiego di aiuto (`routing.fallback`) | Quando attivate il routing o un ripiego |
| `base.workspace.json` | Più radici BASE dichiarate (multi-cliente) | Quando gestite più radici BASE |
| `base.schema.json` | Contratto dei metadati | Quando condividete o governate |
| `base.manifest.json` | Indice generato | Quando ispezionate la scoperta |
| `SECURITY.md` | Politica di segnalazione | Quando valutate o segnalate un rischio |
| `CHANGELOG.md` | Modifiche notevoli | Quando seguite le versioni |
| `LICENSE` | Doppia licenza | Quando riutilizzate o pubblicate |
| `docs/trust/licence.md` | Spiegazione leggibile della licenza | Quando volete capire il riutilizzo |
| `CLAUDE.md` | Adattatore Claude Code | Solo per questo harness |
| `.cursor/rules/` | Adattatore Cursor | Solo per Cursor |

## Cosa non è il cuore

`CLAUDE.md` e `.cursor/rules/` esistono per aiutare strumenti precisi a caricare il contesto giusto. Non definiscono BASE.

`base.manifest.json` è generato da `base index`. Facilita la scoperta, ma non è la fonte di verità.

`mcp/` è un'integrazione. Prova la portabilità, ma potete usare BASE senza server MCP.

`tests/` e `tools/` rendono il framework credibile e mantenibile. Chi vuole solo provare un assistente può ignorarli.
