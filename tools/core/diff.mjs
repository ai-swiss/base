// Human-readable line diff for `propose` (display only). The LCS table is O(m·n) memory, so for very
// large files we fall back to a plain summary rather than allocate a multi-million-cell matrix.
const DIFF_MAX_LINES = 4000;

export function renderDiff(oldText, newText) {
  if (oldText === newText) return "(aucun changement)";
  const a = oldText ? oldText.split("\n") : [];
  const b = newText.split("\n");
  const m = a.length;
  const n = b.length;
  if (m > DIFF_MAX_LINES || n > DIFF_MAX_LINES) {
    return `(diff trop volumineux pour l'affichage : ${m} → ${n} lignes ; le contenu complet est dans la proposition)`;
  }
  const lcs = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const lines = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      lines.push(`  ${a[i]}`);
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      lines.push(`- ${a[i++]}`);
    } else {
      lines.push(`+ ${b[j++]}`);
    }
  }
  while (i < m) lines.push(`- ${a[i++]}`);
  while (j < n) lines.push(`+ ${b[j++]}`);
  return lines.join("\n");
}
