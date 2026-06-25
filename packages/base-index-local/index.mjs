// Official BASE local index — an optional, derived, deletable projection that scales routing and
// discovery to large corpora without a database, and without becoming a dependency of the BASE core.
//
// The index is a PROJECTION, never a source of truth: reconstruct it from the files, delete it freely.
// It depends on nothing at runtime; routing reuses BASE's real Ranker and Router by injection
// (`routeWithIndex`), so an indexed route returns the same status/agent/process as the in-memory
// broker — only faster on large corpora.
//
//   buildIndex(resources, { deriveSignals, embed?, now? })  — derive the index from BASE resources
//   searchIndex(index, query, { limit? })                   — fast standalone lexical finder
//   routeWithIndex(index, request, { rank, decide, routeTerms, routeAvoidReasons, thresholds? })
//   saveIndex / loadIndex                                    — persist a deletable artifact
//   runBenchmark / formatBenchmark, syntheticResources       — reproducible scale measurement

export { buildIndex, INDEX_SCHEMA, FIELD_WEIGHTS } from "./src/build.mjs";
export { searchIndex, candidateDocIndices } from "./src/search.mjs";
export { routeWithIndex } from "./src/route.mjs";
export { saveIndex, loadIndex, serializeIndex } from "./src/persist.mjs";
export { vectorFor } from "./src/embeddings.mjs";
export { runBenchmark, formatBenchmark } from "./src/bench.mjs";
export { syntheticResources, minimalDeriveSignals } from "./src/synthetic.mjs";
export { tokenize, normalize } from "./src/tokenize.mjs";
