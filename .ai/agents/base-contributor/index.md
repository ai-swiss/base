<!-- Généré par `base build routing-index`. Ne pas éditer: régénéré depuis les AGENT.md/SKILL.md. -->

# BASE contributor — process disponibles

**Quand utiliser cet agent**: The contributor workshop for the BASE framework itself: develop and maintain BASE source, applied to itself and kept deliberately minimal.

Choisissez le process dont le «Quand l'utiliser» couvre la demande. Respectez «Éviter si».

## Process

### Decision sheet — [`decide`](skills/processes/decide/SKILL.md)
**Quand l'utiliser**: Make a decision sheet to collect the human's choices and approvals on several open points at once, instead of deciding one at a time in chat. — Make a decision sheet for these open points — Collect my decisions and approvals on a list — I need to decide between options on BASE — Build a sheet so I can go through these choices
**Éviter si**: Build a change that is already decided (go to implement). — Record a single decision durably (that is open-change).

### Implement a spec — [`implement`](skills/processes/implement/SKILL.md)
**Quand l'utiliser**: Build BASE source whose approach is already clear - write or modify code, spec leaves, agents and tools, with tests, ending green. Also the landing for a contributor fixing a bug or sending a patch/PR to BASE. — Implement this BASE spec — Build this feature in the BASE core — Write the code and the spec for this feature — Fix a bug in the BASE CLI — Contribute a fix or patch to BASE
**Éviter si**: Audit or harden a user's existing BASE project (that is entretien-base). — Work out the approach first (that is plan).

### Open a change — [`open-change`](skills/processes/open-change/SKILL.md)
**Quand l'utiliser**: Open a durable change record in decisions/ for a unit of work or an architecture decision, with its context, the choice and the alternatives. — Open a change record for BASE — Record an architecture decision for the framework — Start a tracked unit of work on BASE
**Éviter si**: Plan the approach first (that is plan). — Build an already-recorded change (go to implement).

### Plan a change — [`plan`](skills/processes/plan/SKILL.md)
**Quand l'utiliser**: Plan a change to BASE before building it - work out the approach, the architecture and the slices first, when the work is consequential. — Plan a change to BASE before building it — Work out the approach for this BASE feature — Design the slices for this change to the framework
**Éviter si**: Implement an already-planned or obvious change (go to implement). — Just read the current state (that is understand-state).

### Understand the state — [`understand-state`](skills/processes/understand-state/SKILL.md)
**Quand l'utiliser**: Read the current state of the BASE framework - what exists, what is proven by tests, what is missing, and what to work on next. — What is the state of the BASE spec? — What is proven and what is not in BASE? — What should I work on next in BASE? — Show me the gaps in the requirements matrix
**Éviter si**: Audit or clean up a user's own BASE project (that is entretien-base). — Create or improve a business assistant (that is createur-agent). — Build a change that is already understood (go to implement).

### Verify the gates — [`verify`](skills/processes/verify/SKILL.md)
**Quand l'utiliser**: Run BASE's gates to confirm a built change is sound before committing or pushing - the matrix, the proof, the immutability check. — Run the BASE gates before pushing — Check the spec discipline is green — Verify the requirements matrix and the immutability check — Is BASE ready to commit?
**Éviter si**: Audit a user's BASE project for health (that is entretien-base). — Build the change first (that is implement).
