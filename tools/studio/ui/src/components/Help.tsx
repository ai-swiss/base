// A quiet inline help affordance: a small «?» carrying one line of guidance, shown on hover (title)
// and exposed to assistive tech (aria-label) — the same lightweight pattern as the editor's other
// hints. The text always comes from the copy catalog (copy.ts), never inline here, so an explanation
// and its single source cannot drift. Place it as a SIBLING of a field's <label>, never inside it,
// so the field's accessible name stays the label alone.

export function Help({ text }: { text: string }) {
  return (
    <span className="help" title={text} aria-label={text} role="note">
      ?
    </span>
  );
}
