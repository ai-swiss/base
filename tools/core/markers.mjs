// The closed set of business markers, in one place. The scanner regex is built from it, and a gate
// (tools/spec/check-markers.mjs) asserts the human registry (docs/reference/marqueurs.md), the
// requirement (FR-MARKERS-001), and every agent's `marqueurs` skill use this same set, so the
// vocabulary cannot silently drift. Adding a marker is a framework change, never an improvisation.
export const BUSINESS_MARKERS = ["A COMPLETER", "A VALIDER", "ATTENTION", "DECISION"];

const MARKER_PATTERN = new RegExp(`\\[(${BUSINESS_MARKERS.join("|")})(?::\\s*([^\\]]*))?\\]`, "g");

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
