<!-- fr-synced: a78f823839d65a72fb41bb7b17e086044d331a88 -->

# Glossario BASE: il vocabolario in un colpo d'occhio

Vi imbattete in un termine BASE e ne volete la definizione esatta: questa pagina la fornisce in una frase, con un link al documento che la approfondisce. È la fonte canonica del vocabolario; le altre pagine puntano qui invece di ridefinire gli stessi termini. L'ordine è alfabetico.

**Astensione.** Quando nessuna rotta è abbastanza chiara, il routing si rifiuta di indovinare e restituisce uno stato esplicito (`ambiguous`, `needs_clarification`, `out_of_scope`) con una motivazione leggibile. Vedi [routing, processi e risorse](routage-process-et-ressources.md).

**Agente.** Un file di istruzioni (`AGENT.md` e i suoi skill): del Markdown che dice al modello quale ruolo ricoprire, quali processi conosce, quali file consultare e quali garde-fou rispettare. È la sua scheda di mansione, ed è testo che voi scrivete, possedete e portate da uno strumento IA all'altro. BASE conserva la parola «agente» per compatibilità con l'ecosistema, perché i modelli la riconoscono, e non per designare una creatura autonoma: un agente è un file, non una persona. Vedi [Comprendere l'approccio](../learn/comprendre.md).

**Assistente.** Il vostro agente animato da un modello: ciò che l'utente finale utilizza. Voi possedete l'agente (i vostri file), affittate il modello (lo strumento IA, che cambierà), e dal loro incontro nasce l'assistente. Lo stesso agente può diventare un assistente in Claude Code e un altro in Cursor: l'agente è ciò che conservate, l'assistente ciò che utilizzate. Vedi [Comprendere l'approccio](../learn/comprendre.md).

**Broker.** Il cuore locale che applica le garanzie (confinamento, policy, dry-run, traccia) per le azioni che passano attraverso di esso, tramite la CLI o l'MCP. Vedi [Sicurezza e limiti](../trust/securite-et-limites.md).

**Co-pensiero.** La scienza applicata dell'interazione uomo-IA: come pensare, lavorare e decidere con un'entità le cui rappresentazioni interne del mondo sono abbastanza compatibili con le nostre da comunicare in linguaggio naturale, senza però condividere il nostro contesto, la nostra memoria né le nostre garanzie. Parte dai fondamentali di ciò che bisogna esplicitare, strutturare e verificare affinché una tale collaborazione sia affidabile, e si inventa per ambito, per mestiere e per persona. Vedi [Perché BASE: co-pensare con l'IA](../learn/co-penser-avec-lia.md).

**Competenza.** Uno skill di conoscenza riutilizzabile (IVA, tono di comunicazione, marcatori) che più processi possono consultare. Vedi [Comprendere l'approccio](../learn/comprendre.md).

**Consegna (consigne).** Un'istruzione in testo, seguita da un modello cooperativo. Utile, ma soggetta a deriva, là dove un meccanismo tiene per costruzione. Vedi [Sicurezza e limiti](../trust/securite-et-limites.md).

**Dry-run.** L'esecuzione a vuoto di una tool: BASE mostra l'azione prevista senza eseguire nulla; l'esecuzione reale esige una conferma. Vedi [Sicurezza e limiti](../trust/securite-et-limites.md).

**Embedding.** La rappresentazione vettoriale di un testo, utilizzata dal ranker semantico opzionale, mai dal cuore per impostazione predefinita. Vedi [Scegliere il proprio provider di embeddings](../guides/choisir-provider-embeddings.md).

**Fixture di routing.** Una rotta attesa, dichiarata in `.ai/routing/route-tests.json` e rigiocata da `base route-test` per proteggere le rotte di business dalle regressioni. Vedi [Quickstart routing semantico](../guides/routage-semantique-quickstart.md).

**Frontmatter.** L'intestazione YAML di una risorsa (id, titolo, descrizione, scope): i metadati che BASE valida e utilizza per scoprire e instradare. Vedi [Framework pubblico](framework-public.md).

**Harness.** Lo strumento IA in cui aprite il vostro BASE (Cursor, Claude Code, ChatGPT tramite MCP). Le garanzie reali variano a seconda dell'harness. Vedi [Compatibilità harness](compatibilite-harnesses.md).

**Journal.** La memoria di lavoro tra le sessioni, in file in `.ai/journal/`: l'agente vi scrive una voce alla fine di ogni workflow. Vedi [Comprendere l'approccio](../learn/comprendre.md).

**Manifest.** `base.manifest.json`, l'indice delle risorse generato da `base index`: una proiezione rigenerabile, mai una fonte di verità. Vedi [Framework pubblico](framework-public.md).

**Marcatore.** Un riferimento testuale ricercabile tra parentesi quadre, concepito per essere ritrovato e trattato dagli strumenti. Due livelli che non si mescolano: i marcatori di business nei vostri documenti (`[A VALIDER]`, `[A COMPLETER]`, `[ATTENTION]`, `[DECISION]`), e i marcatori del piano di specifica nella spec e nel codice (`[NEEDS CLARIFICATION]`, `[SPEC-NEUTRAL]`). Registro completo e chiuso: [Marcatori](marqueurs.md).

**MCP.** Il protocollo aperto, e il server BASE che lo implementa, per esporre le primitive del broker alle app di chat. In sola lettura per impostazione predefinita. Vedi [Server MCP](../../mcp/README.md).

**Meccanismo.** Una garanzia realmente applicata dal broker, dalla CLI o dall'MCP, in contrapposizione a una consegna in testo. Vedi [Sicurezza e limiti](../trust/securite-et-limites.md).

**Processo.** Uno skill di workflow: un modo di procedere passo dopo passo, con riformulazioni e punti di decisione. È il bersaglio del routing. Vedi [routing, processi e risorse](routage-process-et-ressources.md).

**Proiezione.** Un file derivato dalle fonti (manifest, registro di routing, indice): utile all'audit o su larga scala, eliminabile e rigenerabile. Vedi [Comprendere l'approccio](../learn/comprendre.md).

**Promozione.** Il passaggio controllato di una risorsa da uno scope a un altro (`base promote`), per esempio da personale a team, tramite la scrittura mediata. Vedi [Stato di implementazione](etat-implementation.md).

**Propose/commit.** La scrittura mediata in due tempi: `base propose` mostra un diff senza scrivere nulla, `base commit` applica dopo la vostra validazione. Vedi [Sicurezza e limiti](../trust/securite-et-limites.md).

**Ranker.** Il componente che assegna un punteggio ai candidati di una ricerca o di un routing. Lessicale per impostazione predefinita, semantico in opzione. Vedi [Quickstart routing semantico](../guides/routage-semantique-quickstart.md).

**Risorsa.** Qualsiasi file utile che BASE può inventariare, scoprire e aprire: agente, processo, competenza, template, documento, dati. Vedi [Framework pubblico](framework-public.md).

**Router.** Il componente che sceglie una coppia agente poi processo per una richiesta, oppure si astiene con una motivazione leggibile. Rudimentale ma efficace, estensibile tramite adattatori, vi evita di cercare voi stessi il processo giusto e non carica mai tutto. Vedi [routing, processi e risorse](routage-process-et-ressources.md).

**Scope.** Il perimetro di condivisione dichiarato di una risorsa: `personal`, `team`, `org`, `public`. I requisiti di validazione crescono con lo scope. Vedi [Framework pubblico](framework-public.md).

**Skill.** Un file `SKILL.md`: del Markdown con un frontmatter, portabile tra gli strumenti. Due tipi: processo e competenza. Vedi [Comprendere l'approccio](../learn/comprendre.md).

**Tool.** Uno strumento eseguibile, spesso uno script locale, che un processo può invocare: in dry-run per impostazione predefinita, poi con conferma. Vedi [Framework pubblico](framework-public.md).

**Traccia.** Il registro tecnico minimo in JSONL (`.ai/trace/`): identificatori, decisioni, durate, mai il contenuto di business per impostazione predefinita. Vedi [Protezione dei dati](../trust/protection-des-donnees.md).

**Voie 1 / Voie 2 (Via 1 / Via 2).** Le due strategie di routing, scelte dalla configurazione. La **Voie 1** è il default: l'assistente legge l'indice generato e sceglie, sotto una soglia deterministica; il codice la chiama *strategia lessicale*. La **Voie 2** è opzionale, per i grandi cataloghi: degli embeddings ritrovano alcuni candidati e un piccolo modello raffina; il codice la chiama *strategia per embeddings*. Le due vie sono indipendenti. Vedi [Quickstart routing](../guides/routage-semantique-quickstart.md) e [Voie 2, il routing per embeddings](../guides/voie-2-routage-embeddings.md).

**Workspace.** Più radici BASE dichiarate in `base.workspace.json`: il routing può cercare tra di esse, ogni azione resta confinata a una radice. Vedi [routing, processi e risorse](routage-process-et-ressources.md).

---

BASE è un framework di [AI Swiss](https://a-i.swiss). Caso d'uso in partnership con [Innovaud](https://innovaud.ch).
