// The closed set of business markers, in one place. The scanner regex is built from it, and a gate
// (tools/spec/check-markers.mjs) asserts the human registry (docs/reference/marqueurs.md), the
// requirement (FR-MARKERS-001), and every agent's `marqueurs` skill use this same set, so the
// vocabulary cannot silently drift. Adding a marker is a framework change, never an improvisation.
export const BUSINESS_MARKERS = ["A COMPLETER", "A VALIDER", "ATTENTION", "DECISION"];

const MARKER_PATTERN = new RegExp(`\\[(${BUSINESS_MARKERS.join("|")})(?::\\s*([^\\]]*))?\\]`, "g");

// Marker path policy, one place for both lenses (entretien and doctor). Documentation-marker paths
// ILLUSTRATE markers (templates, docs, READMEs, tests): open there is normal, never dormant. Marker
// REFERENCE paths TEACH the vocabulary (agent skills, docs, specs, framework code): they are skipped
// by the placeholder scan entirely.
export function isDocumentationMarkerPath(relativePath) {
  return relativePath.startsWith("docs/")
    || relativePath.includes("/_template/")
    || relativePath.includes("/templates/")
    || relativePath.endsWith("README.md")
    || relativePath.endsWith(".test.mjs")
    || relativePath.endsWith(".test.ts");
}

export function isMarkerReferencePath(relativePath) {
  const normalized = relativePath.split("\\").join("/");
  return normalized.startsWith(".ai/agents/")
    || normalized.includes("/.ai/agents/")
    || normalized.startsWith("docs/")
    || normalized.startsWith("specs/")
    || normalized.startsWith("tests/")
    || normalized.startsWith("tools/")
    || normalized.startsWith("mcp/")
    || normalized.endsWith("README.md")
    || normalized.endsWith(".test.mjs")
    || normalized.endsWith(".test.ts");
}

export function scanMarkers(content, resourcePath) {
  const markers = [];
  const lines = content.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    MARKER_PATTERN.lastIndex = 0;
    let match;
    while ((match = MARKER_PATTERN.exec(line))) {
      markers.push({ path: resourcePath, line: index + 1, type: match[1], text: (match[2] || "").trim(), raw: match[0] });
    }
  }
  return markers;
}
