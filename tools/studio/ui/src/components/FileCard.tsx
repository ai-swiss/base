// Read-only view of a NON-resource file opened from the tree (a non-resource does not become
// an editable card — it opens read-only; no edit, no chat, no propose).

import { api, type FileContent } from "../api.ts";
import { useCopy } from "../copy.ts";
import { useResource } from "../lib.ts";

export function FileCard({ path, rootId, onClose }: { path: string; rootId: string | null; onClose: () => void }) {
  const copy = useCopy();
  const { data, error, loading } = useResource<FileContent>(() => api.file(path, rootId ?? undefined), [path, rootId]);

  return (
    <article className="card card-open card-file">
      <header className="card-openhead" onClick={onClose}>
        <span className="kind kind-file">{copy.file.kind}</span>
        <strong className="card-title">{path.split("/").pop()}</strong>
        <code className="path">{path}</code>
        <button
          className="ghost small"
          aria-label={copy.common.collapse}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          ×
        </button>
      </header>
      {error && <p className="error">{copy.common.errorPrefix}{error}</p>}
      {loading && <p className="resultmeta">{copy.common.loading}</p>}
      {data && <pre className="file-content">{data.content}</pre>}
      <p className="resultmeta">{copy.file.readOnly}</p>
    </article>
  );
}
