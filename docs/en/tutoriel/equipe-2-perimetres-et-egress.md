<!-- fr-synced: 0dde1631f557ff101fa3105a3c5e858f74733056 -->
# Perimeters and egress governance

*⏱ ~15 min · module 2/3, Team track*

**You will**: trigger, then read, an egress refusal on a real confidential resource, proven by the ✅ below.
**You need**: module 1 completed; the workshop open on `exemples/agence-multi-clients`; a REMOTE model (API) connected in Settings (guide "Connect a model", Practitioner track module 6). The check happens BEFORE any call to the model: even an invalid key is enough to observe the refusal.
↻ **Reminder**: without looking, what does a root guarantee? (an isolated write perimeter)

The Dupont Conseil client contains a resource already marked confidential:
`clients/dupont-conseil/tarifs/remises-confidentielles.md` (`confidential: true`).

1. In Studio, open this resource.
2. Open its chat, choose your REMOTE model.
3. Ask for a modification (for example, *"rephrase this discount table"*).

✅ **Check**: BASE refuses to send it to the remote model and explains why ("this document is confidential ... choose a local model"); you see the reason on screen. The same request with a LOCAL model (Ollama) goes through: that is exactly the rule.

💡 **Why it worked**: governance lives in files (`confidential: true` on a resource, or `egress: local-only` on a whole root), not in a console. The rule is single: nothing confidential leaves for a remote model, and the check happens BEFORE BASE calls the model, so the confidential document is never sent. BASE watches over its own surfaces (chat, eval, MCP reads); it does not act as a firewall around the other tools you might run. The refusal is SPOKEN: that is the whole difference between an instruction (which one follows) and a mechanism (which enforces itself).

🔁 **At home**: which of your data must NEVER leave your machine for an API? Mark it `confidential: true`, or switch the whole root to `egress: local-only`.

→ **And now**: [Module 3: distribute](equipe-3-distribuer.md).

🆘 **Common failures**: *No refusal*: is the chosen model really REMOTE? (a local model like Ollama is allowed, that's intended). Does the resource carry `confidential: true`? *No model to choose in the chat*: first add a provider in Settings (Practitioner track module 6).
