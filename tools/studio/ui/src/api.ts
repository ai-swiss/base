// Typed client for the Studio API (tools/studio/server.mjs). The UI depends on these view types, not
// on the broker's internals.

export interface Card {
  id: string;
  type: string;
  title: string;
  description: string | null;
  path: string;
  scope: string;
  status: string;
  sensitivity: string;
  useWhen: string | null;
  keywords: string[];
  hasErrors: boolean;
  nonDefault: string[];
  mtimeMs?: number;
  score?: number;
  reasons?: string[];
  /** Stamped by workspace fan-out search (root=*) or client-side when listing per root. */
  rootId?: string | null;
}

export interface TreeFile {
  name: string;
  path: string;
  resource: { type: string; id: string; hasErrors: boolean } | null;
}

export interface TreeNode {
  name: string;
  path: string;
  dirs: TreeNode[];
  files: TreeFile[];
}

export interface ContextRoot {
  id: string;
  label: string;
  type: string;
  default: boolean;
  /** Filesystem path of the root (for the workspace editor; absolute as the server resolved it). */
  path?: string;
}

export type PerimeterDetection =
  | { type: "workspace"; workspaceFile: string }
  | { type: "root"; agents: string[] }
  | { type: "collection"; roots: { dir: string; label: string; agents: string[] }[] }
  | { type: "loose"; markdownCount: number; hasSkillNames: boolean }
  | { type: "empty" };

export interface InitPlanEntry {
  path: string;
  content: string;
  reason: string;
}

export type StudioContext =
  | { mode: "root"; label: string; path: string }
  | { mode: "workspace"; workspace: { id: string; label: string; path: string }; roots: ContextRoot[] }
  | { mode: "welcome"; label: string; path: string; detection: PerimeterDetection; plan: InitPlanEntry[] };

export interface FileContent {
  path: string;
  name: string;
  size: number;
  content: string;
}

export interface Facets {
  total: number;
  type: Record<string, number>;
  scope: Record<string, number>;
  status: Record<string, number>;
  sensitivity: Record<string, number>;
  agent: Record<string, number>;
  withErrors: number;
}

export interface ResourceDoc {
  id: string;
  type: string;
  path: string;
  data: Record<string, unknown>;
  body: string;
  errors: { line: number; code: string; message: string }[];
}

export interface Verdict {
  outcome: "goal_met" | "partially_met" | "not_met";
  failureMode: string | null;
  severity: string | null;
  confidence: number;
  evidence: { turn: number; quote: string; why: string }[];
  rationale: string;
  fixHint: string | null;
}

export interface Turn {
  index: number;
  user: string;
  assistant: string;
  toolCalls: { name: string; args: unknown; result: string; denied?: boolean }[];
}

export interface RunResult {
  scenarioId: string;
  sutId: string | null;
  stopReason: string;
  turns: Turn[];
  verdict: Verdict;
  limitations?: Limitation[];
  process?: string | null;
  processPath?: string | null;
  origin?: string;
  model?: string | null;
  at?: string;
  contextPack?: { sections: { path: string; note?: string }[]; omitted: string[]; unresolved: { ref: string; suggestions: string[] }[]; withheld: { path: string; reason: string }[] };
}

export interface ExperimentReport {
  total: number;
  passRate: number;
  errors: number;
  outcomes: Record<string, number>;
  bySeverity: Record<string, number>;
  byFailureMode: Record<string, number>;
  fixHints: { scenarioId: string; failureMode: string | null; fixHint: string }[];
  scenarios: { scenarioId: string; outcome: string | null; failureMode: string | null; severity: string | null; stopReason: string | null }[];
}

export interface Limitation {
  tool: string;
  step: string;
  processPath: string;
}

export interface RunSummary {
  name: string;
  scenarioId: string | null;
  process: string | null;
  agentId: string | null;
  outcome: string | null;
  failureMode: string | null;
  severity: string | null;
  stopReason: string | null;
  origin: string;
  model: string | null;
  at: string;
  turns: number;
  limitations?: Limitation[];
}



export interface EvalStatus {
  running: boolean;
  done?: number;
  total?: number;
  agentId?: string;
  processId?: string;
  /** Position in a multi-process batch (the server-side queue): 0-based index, total count. */
  batchIndex?: number;
  batchCount?: number;
  error?: string | null;
}

export interface ExperimentsOverview {
  latestReport: ExperimentReport | null;
  reports: { name: string; total: number; passRate: number }[];
  runs: RunSummary[];
  /** Run names matching the transcript search, or null when no search is active. */
  matched: string[] | null;
  eval: EvalStatus;
}

export interface StartEvalBody {
  /** Single-agent paths (relaunch / multi-select) name the agent; the tree launcher uses `targets`. */
  agentId?: string;
  /** A single process (relaunch) or a batch the server queues in sequence (single-agent multi-select). */
  processId?: string;
  processIds?: string[];
  /** (agent, process) pairs the server queues in sequence — the tree launcher, may span agents. */
  targets?: { agentId: string; processId: string }[];
  /** Model refs from the settings catalog: "<providerId>/<model>". */
  userModel: string;
  judgeModel?: string;
  jsonMode?: boolean;
  root?: string;
}

export interface ProviderSettings {
  id: string;
  type: "openai-compatible" | "ollama" | "anthropic" | "google";
  baseUrl?: string;
  apiKeyEnv?: string;
  locality?: "local" | "remote";
  /** Read-only decoration from the server: the key env var is set (null = no key needed). */
  keyDetected?: boolean | null;
}

/**
 * The embedding strategy (opt-in): embeddings retrieve `k` candidates, the refiner picks or asks. Both model refs
 * ("<providerId>/<model>") resolve against the SAME provider registry as the eval defaults. Present
 * only when both models are configured; absent → the lexical strategy (the harness reads the index).
 */
export interface RoutingSettings {
  embedding_model: string;
  refiner_model: string;
  k: number;
}

export interface StudioSettings {
  providers: ProviderSettings[];
  aliases: Record<string, string>;
  defaults: { runner?: string; judge?: string };
  discovered: Record<string, { models: string[]; at: string }>;
  /** The embedding strategy's two models + candidate count; absent → the default index-reading strategy. */
  routing?: RoutingSettings;
  /** The settings file these values ARE, and whether a workspace shares it or one root owns it. */
  file?: string;
  scope?: "root" | "workspace";
  /** First-model help: present only when no provider is configured (server-added). */
  suggestion?: { type: "ollama"; reachable: boolean };
}

export interface CatalogModel {
  ref: string;
  providerId: string;
  model: string;
  alias: string | null;
  locality: "local" | "remote";
  online: boolean;
}

export interface ProviderTestResult {
  ok: boolean;
  latencyMs: number;
  models?: string[];
  error?: string;
  /** The URL actually hit — makes a mis-deduced locality visible. */
  url?: string;
  /** base-llm failure code (e.g. "llm.config", "llm.auth") — the UI renders French from it. */
  code?: string;
  /** The env var to export, surfaced for the missing/refused-key cases. */
  env?: string;
}

export interface ChatMemory {
  summary: string;
  keptFrom: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
  proposal: ProposeResult | null;
  memory: ChatMemory | null;
  /** Egress: documents withheld from the model because it is remote — always said, never silent. */
  egress: { withheld: { path: string; reason: string }[]; notice: string } | null;
}

export interface DoctorFinding {
  severity: "error" | "warn";
  type: string;
  path: string;
  message: string;
  fix_hint: string;
}

export interface Friction {
  path: string;
  process: string;
  reported: string;
  via: "user" | "assistant";
  status: "open" | "resolved";
  summary: string;
  detail: string;
}

export interface Abstention {
  query: string;
  verdict: string;
  count: number;
  lastAt: string;
}

export interface Feedback {
  frictions: Friction[];
  abstentions: Abstention[];
}

export interface ProposeResult {
  changeId: string;
  target: string;
  exists: boolean;
  diff: string;
}

export interface ListParams {
  type?: string;
  types?: string[];
  under?: string;
  root?: string;
  scope?: string;
  status?: string;
  agent?: string;
  sort?: "recent" | "title";
}

export interface SearchParams {
  limit?: number;
  under?: string;
  types?: string[];
  root?: string;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// Like getJson, but POSTs a body and carries a server-supplied `problems` list onto the thrown error
// (the preflight messages), so the UI can show them as actionable items.
async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    const err = new Error(b.error || `${res.status} ${res.statusText}`) as Error & { problems?: string[]; code?: string; env?: string };
    if (Array.isArray(b.problems)) err.problems = b.problems;
    if (typeof b.code === "string") err.code = b.code; // e.g. base-llm "llm.config": the UI maps it to actionable text
    if (typeof b.env === "string") err.env = b.env;
    throw err;
  }
  return res.json() as Promise<T>;
}

function qs(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const api = {
  context: () => getJson<StudioContext>(`/api/context`),
  init: () => postJson<{ created: string[]; context: StudioContext }>(`/api/init`, {}),
  tree: (root?: string) => getJson<TreeNode>(`/api/tree${qs({ root })}`),
  file: (path: string, root?: string) => getJson<FileContent>(`/api/file${qs({ path, root })}`),
  list: (params: ListParams = {}) =>
    getJson<Card[]>(
      `/api/resources${qs({
        type: params.type,
        types: params.types?.length ? params.types.join(",") : undefined,
        under: params.under,
        root: params.root,
        scope: params.scope,
        status: params.status,
        agent: params.agent,
        sort: params.sort,
      })}`,
    ),
  search: (q: string, params: SearchParams = {}) =>
    getJson<Card[]>(
      `/api/search${qs({
        q,
        limit: String(params.limit ?? 30),
        under: params.under,
        types: params.types?.length ? params.types.join(",") : undefined,
        root: params.root,
      })}`,
    ),
  facets: (root?: string) => getJson<Facets>(`/api/facets${qs({ root })}`),
  resource: (id: string, root?: string) => getJson<ResourceDoc>(`/api/resource${qs({ id, root })}`),
  experiments: (root?: string, q?: string) =>
    getJson<ExperimentsOverview>(`/api/experiments${qs({ root, q })}`),
  run: (name: string, root?: string) => getJson<RunResult>(`/api/experiments/run${qs({ name, root })}`),
  settings: () => getJson<StudioSettings>(`/api/settings`),
  saveSettings: (settings: StudioSettings) =>
    fetch(`/api/settings`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(settings) }).then(
      async (res) => {
        if (!res.ok) {
          const b = await res.json().catch(() => ({}));
          throw new Error(b.error || `${res.status} ${res.statusText}`);
        }
        return res.json() as Promise<StudioSettings>;
      },
    ),
  saveWorkspace: (body: { label?: string; roots: { id: string; label: string; path?: string; default?: boolean }[] }) =>
    fetch(`/api/workspace`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).then(
      async (res) => {
        if (!res.ok) {
          const b = await res.json().catch(() => ({}));
          throw new Error(b.error || `${res.status} ${res.statusText}`);
        }
        return res.json() as Promise<StudioContext>;
      },
    ),
  models: (refresh = false) => getJson<CatalogModel[]>(`/api/models${qs({ refresh: refresh ? "1" : undefined })}`),
  testProvider: (providerId: string) => postJson<ProviderTestResult>(`/api/settings/test`, { providerId }),
  doctor: (root?: string) => getJson<DoctorFinding[]>(`/api/doctor${qs({ root })}`),
  feedback: (root?: string, status: "open" | "resolved" | "all" = "open") =>
    getJson<Feedback>(`/api/feedback${qs({ root, status })}`),
  resolveFriction: (path: string, root?: string) =>
    postJson<ProposeResult>(`/api/feedback/resolve`, { path, root }),
  chat: (body: {
    root?: string;
    path: string;
    model: string;
    memory: ChatMemory | null;
    messages: ChatMessage[];
    draft?: { data: Record<string, unknown>; body: string } | null;
  }) => postJson<ChatResponse>(`/api/chat`, body),
  startEval: (body: StartEvalBody) => postJson<{ started: boolean }>(`/api/experiments/run`, body),
  proposeEdit: (body: { path: string; data: Record<string, unknown>; body: string; root?: string }) =>
    postJson<ProposeResult>(`/api/propose`, body),
  proposeContent: (body: { path: string; content: string; root?: string }) =>
    postJson<ProposeResult>(`/api/propose`, body),
  commitEdit: (changeId: string, root?: string) =>
    postJson<{ written: boolean; target: string }>(`/api/commit`, { changeId, root }),
};
