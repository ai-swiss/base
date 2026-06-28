<!-- fr-synced: b5573293fe891c7be374cfce89c1445d5f99cfbc -->

# L'anatomia di un assistente

*⏱ ~12 min · modulo 1/9, percorso Praticante*

**Farete**: scrivere un use_when che instrada una richiesta verso il process giusto, dimostrato dal ✅ qui sotto.
**Vi serve**: Node 18+ e il repository (altrimenti [la lettera](../start/installer-par-votre-ia.md)), un terminale in `exemples/veytaux-tourisme`.

1. Aprite `.ai/agents/office-tourisme/AGENT.md`: la carta d'identità dell'assistente (chi, quando).
2. Aprite `.ai/agents/office-tourisme/skills/processes/renseigner-un-visiteur/SKILL.md`: i passaggi,
   e soprattutto il campo `use_when` e `routing.examples`.
3. **Prevedete**: dove dovrebbe essere instradata la richiesta «a che ora è aperto?»? Ditelo ad alta voce.
4. Verificate la vostra previsione:

```routage-fixture
Quelles activités à faire cet après-midi ?
```

   (lanciate `base route "Quelles activités à faire cet après-midi ?" --root .`)

✅ **Verificate**: `base route` risponde `routed`, agente `office-tourisme`, process `renseigner-un-visiteur`. La vostra previsione si conferma.

💡 **Perché ha funzionato**: il `use_when` e i `routing.examples` sono ciò che legge il router. Un buon use_when descrive l'INTENZIONE («quando un visitatore vuole sapere cosa fare»), non il titolo. Prevedere prima di lanciare trasforma la verifica in un test di un'ipotesi: è lì che l'apprendimento si fissa.

🔁 **A casa vostra**: per UNO dei vostri compiti, scrivete il suo use_when in una frase: «Quando l'utente vuole …».

→ **E adesso**: [Modulo 2: lo scheletro dell'ufficio](praticien-2-le-squelette.md): costruite un process a partire da uno scheletro con dei vuoti.

🆘 **Guasti comuni**: *route risponde out_of_scope*: il vostro terminale non è nella cartella giusta (`--root .` da `exemples/veytaux-tourisme`). *Non trovate il SKILL.md*: si trova sotto `skills/processes/<nome>/`.
