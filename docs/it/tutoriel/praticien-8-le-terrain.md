<!-- fr-synced: ac21a2cfb1ddcfe5d96cca067536017390d371c8 -->

# Il campo: una frizione emerge

*⏱ ~10 min · modulo 8/9, percorso Praticante*

**Farete**: gestire una segnalazione dal campo e risolverla tramite il gate di scrittura, dimostrato dal ✅ qui sotto.
**Vi serve**: il modulo 7 completato, Studio aperto sull'ufficio del turismo.
↻ **Promemoria**: senza guardare: cosa produce una valutazione? (un verdetto del giudice + una pista di correzione)

La pila Campo parte vuota. Simuliamo una segnalazione.

Prima, tre parole di contesto: la **pila Campo** raccoglie le frizioni (un uso reale che si è inceppato); il **gate** è la regola d'oro: nulla viene scritto senza una proposta (un diff) che voi convalidate.

1. Create `.ai/feedback/2026-01-10_agenda-perime.md` nell'ufficio del turismo con questo contenuto:

```
---
process: .ai/agents/office-tourisme/skills/processes/renseigner-un-visiteur/SKILL.md
reported: 2026-01-10
via: user
status: open
---
# L'agenda était périmé et l'assistant a quand même annoncé l'événement

Le process devrait vérifier la date de validité avant d'annoncer un événement de l'agenda.
```

2. In Studio, scheda **Evaluations**: la frizione appare nella pila Campo.
3. Aprite il process interessato, modificatelo per verificare la data, poi «Segna come risolto»: appare un diff (il gate), convalidatelo.

✅ **Verificate**: la frizione lascia la pila delle «aperte» dopo la convalida, e il diff di risoluzione è passato per propose e poi commit (nulla è stato scritto prima della vostra convalida).

💡 **Perché ha funzionato**: il campo è la materia prima del miglioramento. Una frizione è un file datato, mai perso. Ogni scrittura, anche una risoluzione, passa per il gate: è ciò che rende l'IA sicura da lasciar vivere nei vostri file.

🔁 **Da voi**: quando il vostro assistente sbaglierà, chi annoterà la frizione, e dove? (è il vostro ciclo di miglioramento)

→ **E adesso**: [Modulo 9: migrare i vostri contenuti](praticien-9-migrer.md): il momento in cui l'esercizio diventa il VOSTRO strumento.

🆘 **Guasti comuni**: *La frizione non appare*: verificate la cartella `.ai/feedback/` e il frontmatter (status: open). *Nessun diff alla risoluzione*: la risoluzione passa sempre per una proposta; rileggete prima di convalidare.
