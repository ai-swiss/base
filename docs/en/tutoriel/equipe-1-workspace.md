<!-- fr-synced: 07303f160b4d96676e79b74b872e12ef38fb764c -->
# The multi-perimeter workspace

*⏱ ~15 min · module 1/3, Team track*

**You will**: walk through a two-root workspace and grasp that a root is a write perimeter, proven by the ✅ below.
**You need**: Node 18+ and the repository; a terminal open at the root.

1. Launch the studio on the sample workspace:
   `base studio --root exemples/agence-multi-clients`.
2. The tree shows two roots (Dupont, Martin), each flagged with the `⌂` badge.
3. Search for `tarif` from the workspace header: cards from both roots appear,
   each tagged with its root.
4. Open one of Martin's cards: the context switches to Martin's root.

✅ **Check**: a workspace search returns cards from BOTH roots, each identified by its own; opening a card places you in that root's perimeter.

💡 **Why it worked**: a workspace brings together several independent BASEs. A root = a write perimeter: an edit in Martin cannot reach Dupont. That partition is what makes multi-client work safe.

🔁 **At home**: how many distinct perimeters (clients, teams, projects) would your organization have?

→ **And now**: [Module 2: perimeters and egress](equipe-2-perimetres-et-egress.md).

🆘 **Common failures**: *Only one root shows*: check `base.workspace.json` at the root of the opened folder. *Search does not span both roots*: run it from the workspace header, not from within a root.
