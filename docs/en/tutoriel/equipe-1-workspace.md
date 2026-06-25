<!-- fr-synced: 9d7aed17a4ae32c71898e8b2e3eaf9dde82e5ee2 -->
# The multi-perimeter workspace

*⏱ ~15 min · module 1/3, Team track*

**You will**: navigate a two-root workspace and understand that a root is a write perimeter, proven by the ✅ below.
**You need**: Node 18+ and the repository; a terminal at the root.

1. Launch the Studio on the example workspace:
   `base studio --root exemples/agence-multi-clients`.
2. The tree shows two roots (Dupont, Martin), each badged `⌂`.
3. Search for `tarif` from the workspace header: cards from both roots appear,
   each badged with its root.
4. Open one of Martin's cards: the context switches to Martin's root.

✅ **Check**: a workspace search returns cards from BOTH roots, each identified by its root; opening a card places you in that root's perimeter.

💡 **Why it worked**: a workspace brings together several independent BASEs. A root = a write perimeter: an edit in Martin cannot touch Dupont. This is the partition that makes multi-client safe.

🔁 **At home**: how many distinct perimeters (clients, teams, projects) would your organization have?

→ **And now**: [Module 2: perimeters and egress](equipe-2-perimetres-et-egress.md).

🆘 **Common failures**: *Only one root shows*: check `base.workspace.json` at the root of the opened folder. *Search does not fan out*: search from the workspace header, not from within a root.
