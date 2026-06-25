// Spec coverage: FR-CONFIG-005 NFR-PARSE-001
import test from "node:test";
import assert from "node:assert/strict";
import { compareByCodePoint as coreCompareByCodePoint } from "../tools/core/ordering.mjs";
import {
  formatMarkers,
  formatTraceSummary,
  formatValidationResult,
  formatSearchResults,
  formatRouteResult,
  formatRouteTestResult,
  formatMaintenanceReport,
} from "../tools/core/formatters.mjs";
import { scanMarkers } from "../tools/core/markers.mjs";
import { compareByCodePoint as indexCompareByCodePoint } from "../packages/base-index-local/src/ordering.mjs";

test("compareByCodePoint is locale-independent and shared by core/index-local", () => {
  const pairs = [
    ["a", "b", -1],
    ["b", "a", 1],
    ["z", "é", -1],
    ["é", "z", 1],
    ["same", "same", 0],
  ];

  for (const [left, right, expected] of pairs) {
    assert.equal(coreCompareByCodePoint(left, right), expected);
    assert.equal(indexCompareByCodePoint(left, right), expected);
  }
});

test("scanMarkers handles CRLF, empty payloads and multiple markers per line", () => {
  const markers = scanMarkers(
    "Intro\r\n[A VALIDER: prix] et [ATTENTION]\r\n[A COMPLETER: client]\nFin",
    "devis/test.md",
  );

  assert.deepEqual(markers, [
    { path: "devis/test.md", line: 2, type: "A VALIDER", text: "prix", raw: "[A VALIDER: prix]" },
    { path: "devis/test.md", line: 2, type: "ATTENTION", text: "", raw: "[ATTENTION]" },
    { path: "devis/test.md", line: 3, type: "A COMPLETER", text: "client", raw: "[A COMPLETER: client]" },
  ]);
});

test("formatMarkers preserves the CLI marker output contract", () => {
  assert.equal(formatMarkers([]), "Aucun marqueur ouvert.");

  const output = formatMarkers([
    { path: "devis/test.md", line: 3, type: "A VALIDER", text: "prix" },
    { path: "clients/dupont.md", line: 1, type: "ATTENTION", text: "" },
  ]);

  assert.equal(
    output,
    [
      "Marqueurs ouverts: 2",
      "- A VALIDER: 1",
      "- ATTENTION: 1",
      "",
      "- [A VALIDER] devis/test.md:3 - prix",
      "- [ATTENTION] clients/dupont.md:1",
    ].join("\n"),
  );
});

test("formatTraceSummary sorts operations deterministically", () => {
  const output = formatTraceSummary({
    events: 2,
    denied: 1,
    errors: 0,
    by_operation: { route: 1, access: 1 },
  });

  assert.match(output, /Operations:\n- access: 1\n- route: 1/);
});

test("formatValidationResult reports verdict, count, errors and warnings", () => {
  const ok = formatValidationResult({ ok: true, resources: [{}, {}], errors: [], warnings: [] });
  assert.match(ok, /^BASE valide\.\nRessources analysees: 2$/);

  const bad = formatValidationResult({
    ok: false,
    resources: [{}],
    errors: [{ path: "a.md", message: "boom" }],
    warnings: [{ path: "b.md", message: "attention" }],
  });
  assert.match(bad, /^BASE invalide\./);
  assert.match(bad, /Erreurs:\n- a\.md: boom/);
  assert.match(bad, /Avertissements:\n- b\.md: attention/);
});

test("formatSearchResults handles empty and populated results", () => {
  assert.equal(formatSearchResults([], "devis"), 'Aucune ressource trouvee pour "devis".');

  const out = formatSearchResults(
    [{ id: "x", type: "process", title: "X", score: 12, reasons: ["id:x"], path: "x.md" }],
    "devis",
  );
  assert.match(out, /Ressources trouvees pour "devis":/);
  assert.match(out, /- x \(process\) - X \[score 12; id:x\] -> x\.md/);
});

test("formatRouteResult renders the head, the chosen agent/process and candidates", () => {
  const out = formatRouteResult({
    request: "faire un devis",
    status: "routed",
    reason_code: null,
    agent: { id: "sales" },
    process: { id: "nouveau-devis" },
    candidates: [{ resource: { id: "nouveau-devis", path: "p.md" }, route_scope: "process", score: 70, reasons: ["route:devis"] }],
  });
  assert.match(out, /^Routage "faire un devis": routed/);
  assert.match(out, /Agent: sales -> Process: nouveau-devis/);
  assert.match(out, /Candidats:\n- nouveau-devis \(process\) \[score 70; route:devis\] -> p\.md/);
});

test("formatRouteTestResult reports pass count and lists failures", () => {
  assert.match(
    formatRouteTestResult({ ok: true, passed: 3, total: 3, failures: [] }),
    /^Tests de routage: 3\/3 OK\.\nToutes les routes attendues sont stables\.$/,
  );

  const withFail = formatRouteTestResult({
    ok: false,
    passed: 1,
    total: 2,
    failures: [{ index: 1, request: "x", mismatches: ["status: attendu routed, obtenu out_of_scope"] }],
  });
  assert.match(withFail, /Tests de routage: 1\/2 OK\./);
  assert.match(withFail, /- \[1\] "x"\n    status: attendu routed, obtenu out_of_scope/);
});

test("formatMaintenanceReport renders summary and recommendations", () => {
  const out = formatMaintenanceReport({
    summary: { resources: 5, errors: 0, warnings: 1, placeholders: 2, actionable_placeholders: 1, missing_descriptions: 0, trace_events: 9 },
    recommendations: ["Relire les marqueurs ouverts."],
    validation: { errors: [] },
  });
  assert.match(out, /^Entretien BASE/);
  assert.match(out, /- Ressources: 5/);
  assert.match(out, /- Fichiers avec marqueurs ouverts: 2/);
  assert.match(out, /Recommandations:\n- Relire les marqueurs ouverts\./);
});
