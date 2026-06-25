import { api } from "./api";

type FakeResponse = { ok: boolean; status?: number; statusText?: string; json: () => Promise<unknown> };

function stubFetch(impl: (url: string, init?: RequestInit) => FakeResponse) {
  const fn = vi.fn(async (url: string, init?: RequestInit) => impl(url, init) as unknown as Response);
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe("api client", () => {
  it("list() builds the query string and returns parsed JSON", async () => {
    const fetchMock = stubFetch(() => ({ ok: true, json: async () => [{ id: "x" }] }));
    const cards = await api.list({ type: "process", sort: "recent" });

    expect(cards).toEqual([{ id: "x" }]);
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("/api/resources");
    expect(url).toContain("type=process");
    expect(url).toContain("sort=recent");
  });

  it("getJson surfaces the server error message on non-2xx", async () => {
    stubFetch(() => ({ ok: false, status: 404, statusText: "Not Found", json: async () => ({ error: "resource not found" }) }));
    await expect(api.resource("nope")).rejects.toThrow("resource not found");
  });

  it("getJson falls back to status text when there is no error body", async () => {
    stubFetch(() => ({ ok: false, status: 500, statusText: "Server Error", json: async () => ({}) }));
    await expect(api.facets()).rejects.toThrow("500 Server Error");
  });

  it("startEval carries the preflight `problems` list onto the thrown error", async () => {
    stubFetch(() => ({ ok: false, status: 400, statusText: "Bad Request", json: async () => ({ error: "preflight", problems: ['judge: model "x" not found'] }) }));
    await expect(api.startEval({ agentId: "a", processId: "p", userModel: "prov/m" })).rejects.toMatchObject({
      problems: ['judge: model "x" not found'],
    });
  });

  it("proposeEdit POSTs the body to /api/propose and returns the result", async () => {
    let captured: { url: string; body: unknown } = { url: "", body: null };
    stubFetch((url, init) => {
      captured = { url, body: JSON.parse(String(init?.body)) };
      return { ok: true, json: async () => ({ changeId: "chg_1", target: ".ai/p.md", exists: true, diff: "+x" }) };
    });

    const result = await api.proposeEdit({ path: ".ai/p.md", data: { a: 1 }, body: "b" });
    expect(captured.url).toBe("/api/propose");
    expect(captured.body).toEqual({ path: ".ai/p.md", data: { a: 1 }, body: "b" });
    expect(result.changeId).toBe("chg_1");
  });

  it("commitEdit POSTs the changeId to /api/commit", async () => {
    let body: unknown = null;
    stubFetch((_url, init) => {
      body = JSON.parse(String(init?.body));
      return { ok: true, json: async () => ({ written: true, target: ".ai/p.md" }) };
    });
    const r = await api.commitEdit("chg_1");
    expect(body).toEqual({ changeId: "chg_1" });
    expect(r.written).toBe(true);
  });
});
