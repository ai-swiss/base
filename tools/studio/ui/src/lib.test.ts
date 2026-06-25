import { act, renderHook, waitFor } from "@testing-library/react";
import {
  DEFAULT_EVAL_DAYS,
  applyDiffSelection,
  buildPulse,
  modelLabel,
  chipOptions,
  diffStats,
  errorText,
  filterRuns,
  intralineRanges,
  orderFields,
  parseDiff,
  REQUIRED_FIELDS,
  useResource,
} from "./lib";

describe("errorText", () => {
  it("returns the message of an Error", () => {
    expect(errorText(new Error("boom"))).toBe("boom");
  });
  it("stringifies non-Error values", () => {
    expect(errorText("nope")).toBe("nope");
    expect(errorText(42)).toBe("42");
  });
});

describe("useResource", () => {
  it("loads data and clears the loading flag", async () => {
    const loader = vi.fn().mockResolvedValue({ ok: 1 });
    const { result } = renderHook(() => useResource(loader, []));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ ok: 1 });
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("captures a rejected loader into error", async () => {
    const loader = vi.fn().mockRejectedValue(new Error("nope"));
    const { result } = renderHook(() => useResource(loader, []));
    await waitFor(() => expect(result.current.error).toBe("nope"));
    expect(result.current.data).toBeNull();
  });

  it("reload() refetches", async () => {
    const loader = vi.fn().mockResolvedValueOnce("a").mockResolvedValueOnce("b");
    const { result } = renderHook(() => useResource(loader, []));
    await waitFor(() => expect(result.current.data).toBe("a"));

    act(() => result.current.reload());
    await waitFor(() => expect(result.current.data).toBe("b"));
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("keeps stale data visible during a reload (stale-while-revalidate)", async () => {
    let resolveSecond: (v: string) => void = () => {};
    const loader = vi
      .fn()
      .mockResolvedValueOnce("first")
      .mockImplementationOnce(() => new Promise<string>((r) => (resolveSecond = r)));

    const { result } = renderHook(() => useResource(loader, []));
    await waitFor(() => expect(result.current.data).toBe("first"));

    act(() => result.current.reload());
    expect(result.current.data).toBe("first"); // not blanked while revalidating

    await act(async () => resolveSecond("second"));
    await waitFor(() => expect(result.current.data).toBe("second"));
  });

  it("ignores a stale in-flight result when deps change (cancellation)", async () => {
    let resolveFirst: (v: string) => void = () => {};
    const loader = vi
      .fn()
      .mockImplementationOnce(() => new Promise<string>((r) => (resolveFirst = r)))
      .mockResolvedValueOnce("v2");

    const { result, rerender } = renderHook(({ dep }) => useResource(loader, [dep]), { initialProps: { dep: 1 } });
    rerender({ dep: 2 }); // deps changed → the first load is abandoned
    await waitFor(() => expect(result.current.data).toBe("v2"));

    await act(async () => resolveFirst("v1-late"));
    expect(result.current.data).toBe("v2"); // the late, cancelled result must not win
  });
});

// --- Explorer pure functions -------------------------------------------------

import { buildHash, type BrowseState, type EvalState, countByKind, findTreeFile, pruneToPaths, flattenVisible, groupCardsByDir, kindOrder, parseHash, pruneTree, rowKey, triState, type PrunedNode } from "./lib";
import type { TreeNode } from "./api";

const FIX: TreeNode = {
  name: "root", path: "", dirs: [
    { name: ".ai", path: ".ai", dirs: [
      { name: "agents", path: ".ai/agents", dirs: [], files: [
        { name: "AGENT.md", path: ".ai/agents/AGENT.md", resource: { type: "agent", id: "a", hasErrors: false } },
        { name: "SKILL.md", path: ".ai/agents/SKILL.md", resource: { type: "process", id: "p", hasErrors: true } },
      ] },
    ], files: [] },
    { name: "clients", path: "clients", dirs: [], files: [
      { name: "notes.txt", path: "clients/notes.txt", resource: null },
      { name: "acme.md", path: "clients/acme.md", resource: { type: "document", id: "acme", hasErrors: false } },
    ] },
    { name: "vide", path: "vide", dirs: [], files: [] },
  ],
  files: [{ name: "README.md", path: "README.md", resource: { type: "document", id: "readme", hasErrors: false } }],
};

describe("pruneTree (filter truth table)", () => {
  it("no type checked → full structure, non-resources kept, counters still count resources", () => {
    const t = pruneTree(FIX, new Set())!;
    expect(t.count).toBe(4);
    expect(t.dirs.map((d) => d.name)).toEqual([".ai", "clients", "vide"]); // empty dir kept
    const clients = t.dirs.find((d) => d.name === "clients")!;
    expect(clients.files.map((f) => f.name)).toEqual(["notes.txt", "acme.md"]); // non-resource kept
  });

  it("subset checked → prune: only matching files, dirs without match disappear, ancestors stay", () => {
    const t = pruneTree(FIX, new Set(["process"]))!;
    expect(t.count).toBe(1);
    expect(t.dirs.map((d) => d.name)).toEqual([".ai"]); // clients + vide pruned
    expect(t.files).toEqual([]); // README.md is a document, masked
    const agents = t.dirs[0].dirs[0];
    expect(agents.files.map((f) => f.name)).toEqual(["SKILL.md"]);
  });

  it("all types checked → only resource files, of any type", () => {
    const t = pruneTree(FIX, new Set(["agent", "process", "document"]))!;
    expect(t.count).toBe(4);
    const clients = t.dirs.find((d) => d.name === "clients")!;
    expect(clients.files.map((f) => f.name)).toEqual(["acme.md"]); // notes.txt masked
    expect(t.dirs.find((d) => d.name === "vide")).toBeUndefined();
  });

  it("returns null when nothing matches, and propagates hasErrors to ancestors", () => {
    expect(pruneTree(FIX, new Set(["template"]))).toBeNull();
    const t = pruneTree(FIX, new Set())!;
    expect(t.hasErrors).toBe(true); // SKILL.md has frontmatter errors
    expect(t.dirs.find((d) => d.name === "clients")!.hasErrors).toBe(false);
  });
});

describe("triState", () => {
  const all = ["a", "b", "c"];
  it("none / some / all", () => {
    expect(triState(new Set(), all)).toBe("none");
    expect(triState(new Set(["a"]), all)).toBe("some");
    expect(triState(new Set(all), all)).toBe("all");
  });
});

describe("countByKind / kindOrder", () => {
  it("counts resources by type over the whole tree", () => {
    expect(countByKind(FIX)).toEqual({ agent: 1, process: 1, document: 2 });
  });
  it("orders known types first, then the rest alphabetically", () => {
    expect(kindOrder({ document: 2, zeta: 1, process: 3, alpha: 1 })).toEqual(["process", "document", "alpha", "zeta"]);
  });
});

describe("flattenVisible (keyboard model)", () => {
  const pruned = pruneTree(FIX, new Set())! as PrunedNode;
  it("emits only the rows of expanded nodes, in tree order", () => {
    const collapsed = flattenVisible([{ rootId: null, node: pruned }], new Set());
    expect(collapsed.map((r) => r.name)).toEqual(["root"]);

    const open = flattenVisible([{ rootId: null, node: pruned }], new Set([rowKey(null, ""), rowKey(null, "clients")]));
    expect(open.map((r) => r.name)).toEqual(["root", ".ai", "clients", "notes.txt", "acme.md", "vide", "README.md"]);
    expect(open.find((r) => r.name === "clients")!.expanded).toBe(true);
    expect(open.find((r) => r.name === "notes.txt")!.depth).toBe(2);
  });
  it("multi-root: each root is a level-0 row keyed by its rootId", () => {
    const rows = flattenVisible(
      [{ rootId: "a", node: pruned }, { rootId: "b", node: pruned }],
      new Set(),
    );
    expect(rows.map((r) => r.key)).toEqual(["a:", "b:"]);
    expect(rows.every((r) => r.isRoot)).toBe(true);
  });
});

describe("groupCardsByDir", () => {
  const c = (path: string) => ({ path });
  it("groups contiguous same-dir cards, in incoming order, headers = parent dir", () => {
    const groups = groupCardsByDir(
      [c(".ai/agents/a/AGENT.md"), c(".ai/agents/a/skills/p/SKILL.md"), c(".ai/agents/a/skills/p/AUTRE.md"), c("clients/acme.md")],
      "",
    );
    expect(groups.map((g) => g.dir)).toEqual([".ai/agents/a", ".ai/agents/a/skills/p", "clients"]);
    expect(groups[1].cards).toHaveLength(2);
  });
  it("cards directly inside the selected dir take the scope itself as group", () => {
    const groups = groupCardsByDir([c("README.md")], "");
    expect(groups).toEqual([{ dir: "", cards: [c("README.md")] }]);
  });
});

describe("parseHash / buildHash", () => {
  it("round-trips a full Parcourir state and omits defaults", () => {
    const state: BrowseState = { view: "browse", root: "dupont-conseil", dir: "clients", types: ["process", "competence"], q: "tva", open: ".ai/x/SKILL.md", chat: true };
    const hash = buildHash(state);
    expect(hash).toContain("#/b?");
    expect(parseHash(hash)).toEqual(state);
    expect(buildHash({ view: "browse", root: null, dir: "", types: [], q: "", open: null, chat: false })).toBe("#/b");
  });

  it("round-trips a full eval selection (chips, period, search, open run) with its back hash", () => {
    const back = buildHash({ view: "browse", root: "r", dir: "d", types: [], q: "", open: null, chat: false });
    const state: EvalState = {
      view: "eval",
      root: "r",
      process: "nouveau-devis",
      back,
      verdict: "not_met",
      failure: "wrong_routing",
      model: "ollama:llama3.1",
      days: 7,
      q: "tva",
      open: "run-3",
    };
    expect(parseHash(buildHash(state))).toEqual(state);

    // Defaults stay OUT of the hash: a fresh eval state writes only the route.
    const fresh: EvalState = { view: "eval", root: null, process: null, back: null, verdict: null, failure: null, model: null, days: DEFAULT_EVAL_DAYS, q: "", open: null };
    expect(buildHash(fresh)).toBe("#/eval");
    expect(parseHash("#/eval")).toEqual(fresh);

    // «tout» (no period bound) is explicit, not absent.
    expect(parseHash(buildHash({ ...fresh, days: null })).view === "eval" && (parseHash(buildHash({ ...fresh, days: null })) as EvalState).days).toBeNull();
  });

  it("falls back to the default browse state on anything unknown", () => {
    expect(parseHash("")).toEqual({ view: "browse", root: null, dir: "", types: [], q: "", open: null, chat: false });
    expect(parseHash("#/nope?x=1")).toMatchObject({ view: "browse" });
    expect(parseHash("#/settings")).toEqual({ view: "settings" });
  });
});

describe("pruneToPaths (a query prunes the tree to the matches)", () => {
  const full = pruneTree(FIX, new Set())!;
  it("keeps only matching files and their ancestors", () => {
    const t = pruneToPaths(full, new Set(["clients/acme.md"]))!;
    expect(t.dirs.map((d) => d.name)).toEqual(["clients"]);
    expect(t.dirs[0].files.map((f) => f.name)).toEqual(["acme.md"]);
    expect(t.count).toBe(1);
    expect(t.files).toEqual([]); // README.md not matched
  });
  it("returns null when nothing matches", () => {
    expect(pruneToPaths(full, new Set())).toBeNull();
  });
});

describe("findTreeFile", () => {
  it("finds nested files and reports non-resources", () => {
    expect(findTreeFile(FIX, "clients/notes.txt")?.resource).toBeNull();
    expect(findTreeFile(FIX, ".ai/agents/SKILL.md")?.resource?.type).toBe("process");
    expect(findTreeFile(FIX, "nope.md")).toBeNull();
  });
});

describe("parseDiff — the broker's full-file diff, typed once", () => {
  const DIFF = [
    "  ---",
    "  id: doc",
    "  ---",
    "  contexte",
    "- ancienne ligne",
    "+ nouvelle ligne",
    "  milieu",
    "+ ajout isolé",
    "  fin",
  ].join("\n");

  it("parses markers, groups consecutive changes into hunks", () => {
    const model = parseDiff(DIFF);
    expect(model.lines).toHaveLength(9);
    expect(model.lines[4]).toEqual({ type: "del", text: "ancienne ligne" });
    expect(model.lines[5]).toEqual({ type: "add", text: "nouvelle ligne" });
    // Two hunks: the del+add pair, and the isolated addition.
    expect(model.hunks).toEqual([{ from: 4, to: 6 }, { from: 7, to: 8 }]);
  });

  it("sentinels and empty input degrade safely", () => {
    expect(parseDiff("")).toEqual({ lines: [], hunks: [] });
    expect(parseDiff("(aucun changement)")).toEqual({ lines: [], hunks: [] });
    const big = parseDiff("(diff trop volumineux pour l'affichage : 9000 → 9001 lignes ; le contenu complet est dans la proposition)");
    expect(big.lines).toHaveLength(1);
    expect(big.hunks).toEqual([]);
  });

  it("a context markdown bullet is NOT a deletion (two-space prefix disambiguates)", () => {
    const model = parseDiff("  - une puce de liste\n- vraie suppression");
    expect(model.lines[0].type).toBe("ctx");
    expect(model.lines[0].text).toBe("- une puce de liste");
    expect(model.lines[1].type).toBe("del");
  });

  it("diffStats counts hunks and ± lines", () => {
    expect(diffStats(parseDiff(DIFF))).toEqual({ hunks: 2, additions: 2, deletions: 1 });
    expect(diffStats(parseDiff(""))).toEqual({ hunks: 0, additions: 0, deletions: 0 });
  });
});

describe("applyDiffSelection — partial application is a rebuild, always exact", () => {
  const DIFF = [
    "  un",
    "- deux",
    "+ deux bis",
    "  trois",
    "+ trois et demi",
    "  quatre",
  ].join("\n");
  const model = parseDiff(DIFF);

  it("all selected = the proposed document; none = the original", () => {
    expect(applyDiffSelection(model, [true, true])).toBe("un\ndeux bis\ntrois\ntrois et demi\nquatre\n");
    expect(applyDiffSelection(model, [false, false])).toBe("un\ndeux\ntrois\nquatre\n");
  });

  it("partial selection keeps exactly the chosen blocks", () => {
    expect(applyDiffSelection(model, [true, false])).toBe("un\ndeux bis\ntrois\nquatre\n");
    expect(applyDiffSelection(model, [false, true])).toBe("un\ndeux\ntrois\ntrois et demi\nquatre\n");
  });

  it("edge hunks: change on the very first and very last line", () => {
    const edges = parseDiff("- premier\n+ premier bis\n  milieu\n- dernier\n+ dernier bis");
    expect(applyDiffSelection(edges, [true, false])).toBe("premier bis\nmilieu\ndernier\n");
    expect(applyDiffSelection(edges, [false, true])).toBe("premier\nmilieu\ndernier bis\n");
  });
});

describe("intralineRanges — common prefix/suffix emphasis", () => {
  it("finds the differing span of a paired edit", () => {
    expect(intralineRanges("le taux est 7.7 %", "le taux est 8.1 %")).toEqual({ a: [12, 15], b: [12, 15] });
  });

  it("pure insertion: empty span on the old side", () => {
    expect(intralineRanges("un deux", "un beau deux")).toEqual({ a: [3, 3], b: [3, 8] });
  });

  it("identical lines and over-long lines yield null (announced cap)", () => {
    expect(intralineRanges("même", "même")).toBeNull();
    expect(intralineRanges("x".repeat(301), "y".repeat(301))).toBeNull();
  });
});

describe("filterRuns / chipOptions — one selection, Drive facet semantics", () => {
  const NOW = "2026-06-11T12:00:00.000Z";
  const runs = [
    { name: "r1", process: "devis", outcome: "goal_met", failureMode: null, model: "m1", at: "2026-06-10T00:00:00Z" },
    { name: "r2", process: "devis", outcome: "not_met", failureMode: "wrong_routing", model: "m1", at: "2026-06-09T00:00:00Z" },
    { name: "r3", process: "config", outcome: "not_met", failureMode: "process_not_followed", model: "m2", at: "2026-04-01T00:00:00Z" },
  ];
  const none = { process: null, verdict: null, failure: null, model: null, days: null, q: "" };

  it("chips AND-combine; the period bounds; the search intersects by run name", () => {
    expect(filterRuns(runs, none, NOW, null).map((r) => r.name)).toEqual(["r1", "r2", "r3"]);
    expect(filterRuns(runs, { ...none, process: "devis", verdict: "not_met" }, NOW, null).map((r) => r.name)).toEqual(["r2"]);
    expect(filterRuns(runs, { ...none, days: 30 }, NOW, null).map((r) => r.name)).toEqual(["r1", "r2"]);
    expect(filterRuns(runs, none, NOW, new Set(["r3"])).map((r) => r.name)).toEqual(["r3"]);
  });

  it("a chip counts itself on the selection filtered by the OTHERS — changing one's mind stays possible", () => {
    const selection = { ...none, verdict: "not_met" };
    // The verdict chip ignores its own filter: both outcomes stay offered.
    expect(chipOptions(runs, selection, NOW, null, "verdict")).toEqual([
      { value: "not_met", count: 2 },
      { value: "goal_met", count: 1 },
    ]);
    // The process chip is filtered BY the verdict.
    expect(chipOptions(runs, selection, NOW, null, "process")).toEqual([
      { value: "config", count: 1 },
      { value: "devis", count: 1 },
    ]);
  });
});

describe("buildPulse — the heartbeat, honest by construction", () => {
  const NOW = "2026-06-11T12:00:00.000Z";
  const run = (name: string, daysAgo: number, outcome: string) => ({
    name,
    process: "devis",
    outcome,
    failureMode: null,
    model: "m",
    at: new Date(Date.parse(NOW) - daysAgo * 86_400_000).toISOString(),
  });

  it("bars are time-ordered, colored by outcome, with day separators", () => {
    const model = buildPulse([run("b", 1, "not_met"), run("a", 2, "goal_met")], { now: NOW, days: 30, maxBars: 60 });
    expect(model.bars.map((b) => b.name)).toEqual(["a", "b"]); // oldest left, recent right
    expect(model.bars[0].outcome).toBe("goal_met");
    expect(model.dayTicks).toHaveLength(2); // two distinct days
    expect(model.headline).toEqual({ rate: 50, total: 2, deltaPts: null });
  });

  it("caps the bars and SAYS what it hid", () => {
    const many = Array.from({ length: 8 }, (_, i) => run(`r${i}`, i / 10, "goal_met"));
    const model = buildPulse(many, { now: NOW, days: 30, maxBars: 5 });
    expect(model.bars).toHaveLength(5);
    expect(model.hiddenCount).toBe(3);
    expect(model.headline.total).toBe(8); // the rate covers the WHOLE window, not just visible bars
  });

  it("the delta only speaks against a sufficient previous window", () => {
    const current = [run("c1", 1, "goal_met"), run("c2", 2, "goal_met")];
    const fewPrevious = [run("p1", 40, "not_met")];
    expect(buildPulse([...current, ...fewPrevious], { now: NOW, days: 30, maxBars: 60 }).headline.deltaPts).toBeNull();

    const enoughPrevious = Array.from({ length: 5 }, (_, i) => run(`p${i}`, 35 + i, "not_met"));
    const model = buildPulse([...current, ...enoughPrevious], { now: NOW, days: 30, maxBars: 60 });
    expect(model.headline.deltaPts).toBe(100); // 100 % now vs 0 % before
  });

  it("days: null means everything — no window, no delta", () => {
    const model = buildPulse([run("old", 400, "goal_met")], { now: NOW, days: null, maxBars: 60 });
    expect(model.bars).toHaveLength(1);
    expect(model.headline.deltaPts).toBeNull();
  });
});

describe("modelLabel — settings aliases win over raw refs", () => {
  it("maps a ref to its alias, falls back to the ref, empty for null", () => {
    // The alias map is keyed by model ref → display name (the settings contract), so this is a
    // direct lookup, not a reverse search.
    const aliases = { "ollama/llama3.1": "rapide" };
    expect(modelLabel("ollama/llama3.1", aliases)).toBe("rapide");
    expect(modelLabel("openai-compatible/gpt-5", aliases)).toBe("openai-compatible/gpt-5");
    expect(modelLabel(null, aliases)).toBe("");
  });
});

// Property-style coverage where the input space deserves it (hand-rolled, zero dependencies):
// a seeded generator makes the runs reproducible — a failure prints its seed case.
function lcg(seed: number) {
  let s = seed;
  return () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
}

describe("properties — hash round-trip and diff selection identities", () => {
  it("parseHash(buildHash(state)) is the identity over 200 random eval selections", () => {
    const rnd = lcg(42);
    const pickFrom = <T,>(xs: readonly T[]) => xs[Math.floor(rnd() * xs.length)];
    for (let i = 0; i < 200; i++) {
      const state: EvalState = {
        view: "eval",
        root: pickFrom([null, "dupont", "martin-digital"]),
        process: pickFrom([null, "nouveau-devis", "configuration"]),
        back: pickFrom([null, "#/b?dir=devis&q=tva"]),
        verdict: pickFrom([null, "goal_met", "not_met"]),
        failure: pickFrom([null, "wrong_routing", "process_not_followed"]),
        model: pickFrom([null, "ollama:llama3.1", "openai-compatible:gpt-5"]),
        days: pickFrom([null, 7, DEFAULT_EVAL_DAYS, 90]),
        q: pickFrom(["", "tva", "barème cité"]),
        open: pickFrom([null, "run-1718000000-3"]),
      };
      expect(parseHash(buildHash(state)), `seed case ${i}`).toEqual(state);
    }
  });

  it("applyDiffSelection: all-selected = proposed, none = original, over 100 random diffs", () => {
    const rnd = lcg(7);
    // A reference diff maker in the broker's house format: keep/del/add line ops.
    for (let i = 0; i < 100; i++) {
      const original: string[] = [];
      const proposed: string[] = [];
      const diffLines: string[] = [];
      const n = 1 + Math.floor(rnd() * 12);
      for (let k = 0; k < n; k++) {
        const op = rnd();
        const text = `ligne-${i}-${k}`;
        if (op < 0.4) {
          original.push(text);
          proposed.push(text);
          diffLines.push(`  ${text}`);
        } else if (op < 0.7) {
          original.push(text);
          diffLines.push(`- ${text}`);
        } else {
          proposed.push(text);
          diffLines.push(`+ ${text}`);
        }
      }
      const model = parseDiff(diffLines.join("\n"));
      const all = model.hunks.map(() => true);
      const none = model.hunks.map(() => false);
      const expected = (xs: string[]) => (xs.length ? `${xs.join("\n")}\n` : "");
      expect(applyDiffSelection(model, all), `seed case ${i} (all)`).toBe(expected(proposed));
      expect(applyDiffSelection(model, none), `seed case ${i} (none)`).toBe(expected(original));
    }
  });
});

// ---------------------------------------------------------------------------
import { comboMatches, keyLabel, SHORTCUTS } from "./lib";

describe("keyLabel (platform spelling)", () => {
  it("keeps mac glyphs on mac, translates ⌘ and ⏎ elsewhere", () => {
    expect(keyLabel("⌘S", "MacIntel")).toBe("⌘S");
    expect(keyLabel("⌘⏎", "MacIntel")).toBe("⌘⏎");
    expect(keyLabel("⌘S", "Win32")).toBe("Ctrl+S");
    expect(keyLabel("⌘⏎", "Linux x86_64")).toBe("Ctrl+Entrée");
    expect(keyLabel("Échap", "Win32")).toBe("Échap");
    expect(keyLabel("/", "Win32")).toBe("/");
  });
});

describe("comboMatches (the handlers' half of the SHORTCUTS table)", () => {
  const ev = (key: string, mods: Partial<{ metaKey: boolean; ctrlKey: boolean; altKey: boolean }> = {}) => ({
    key,
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    ...mods,
  });

  it("⌘-combos accept meta OR ctrl, and require one", () => {
    expect(comboMatches("⌘S", ev("s", { metaKey: true }))).toBe(true);
    expect(comboMatches("⌘S", ev("s", { ctrlKey: true }))).toBe(true);
    expect(comboMatches("⌘S", ev("s"))).toBe(false);
    expect(comboMatches("⌘⏎", ev("Enter", { metaKey: true }))).toBe(true);
  });

  it("a bare key refuses every modifier — ⌘E can never pass for «e»", () => {
    expect(comboMatches(SHORTCUTS.chat.combo, ev("e"))).toBe(true);
    expect(comboMatches(SHORTCUTS.chat.combo, ev("e", { metaKey: true }))).toBe(false);
    expect(comboMatches(SHORTCUTS.chat.combo, ev("e", { ctrlKey: true }))).toBe(false);
    expect(comboMatches("Échap", ev("Escape"))).toBe(true);
  });

  it("an either-key pair matches both sides, nothing else", () => {
    expect(comboMatches("n/p", ev("n"))).toBe(true);
    expect(comboMatches("n/p", ev("p"))).toBe(true);
    expect(comboMatches("n/p", ev("o"))).toBe(false);
    expect(comboMatches("/", ev("/"))).toBe(true);
  });
});

describe("orderFields (the reader's order, not the file's)", () => {
  it("leads with title, description, use_when; keeps the rest stable; schema_version last", () => {
    // Frontmatter order on disk buries use_when; the editor surfaces the card-feeding fields first.
    const raw = {
      schema_version: "base.resource.v1",
      id: "x",
      type: "agent",
      scope: "team",
      description: "d",
      keywords: ["a"],
      use_when: "w",
      title: "T",
    };
    expect(orderFields(raw).map(([k]) => k)).toEqual([
      "title",
      "description",
      "use_when",
      "id",
      "type",
      "scope",
      "keywords",
      "schema_version",
    ]);
  });

  it("marks exactly the contract's required fields", () => {
    expect(REQUIRED_FIELDS.has("description")).toBe(true);
    expect(REQUIRED_FIELDS.has("id")).toBe(true);
    expect(REQUIRED_FIELDS.has("title")).toBe(false); // title is derivable, hence optional
  });
});
