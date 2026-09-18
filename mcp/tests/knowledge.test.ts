// Spec coverage: FR-MCP-006
// Knowledge access over MCP: discovering at section grain, opening one passage (by argument or by the
// ref id#anchor), the outline, the edition a `lang` request answers with, and the printed pages behind
// a converted document, which travel as image blocks rather than as base64 inside the JSON.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { createServer } from "../src/index.js";

let tmpDir: string;

async function callTool(server: any, name: string, args: Record<string, unknown>) {
  const handler = server.server._requestHandlers.get("tools/call");
  return handler({ method: "tools/call", params: { name, arguments: args } }, {});
}

async function openJson(server: any, args: Record<string, unknown>) {
  const res = await callTool(server, "open_resource", args);
  return JSON.parse(res.content[0].text);
}

const card = (fields: Record<string, string>, body: string) =>
  ["---", ...Object.entries(fields).map(([k, v]) => `${k}: ${v}`), "---", body, ""].join("\n");

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "base-mcp-knowledge-"));
  await fs.writeFile(path.join(tmpDir, "base.config.json"), '{ "schema_version": "base.config.v1" }\n');
  const guide = path.join(tmpDir, "collections", "acme", "guide");
  await fs.mkdir(guide, { recursive: true });
  await fs.writeFile(
    path.join(guide, "assess.md"),
    card(
      {
        schema_version: "base.resource.v1",
        id: "guide-assess",
        type: "document",
        description: "Assessing ideas.",
        cite_as: '"Acme Guide (2026), p. 4"',
        lang: "en",
        source: "\n  pages: [4]\n  page_images: originals/page-{page:03}.png",
      },
      "# Assess\nIntro.\n\n## Risk assessment\nExamination of exceptional risks such as bias and oversight.\n\n## Feasibility\nFour areas are considered when assessing feasibility.\n",
    ),
  );
  await fs.writeFile(
    path.join(guide, "assess.de.md"),
    card(
      { schema_version: "base.resource.v1", id: "guide-assess-de", type: "document", description: "Ideen bewerten.", translation_of: "guide-assess" },
      "# Bewerten\n\n## Risikobewertung\nPruefung aussergewoehnlicher Risiken.\n",
    ),
  );
  await fs.mkdir(path.join(tmpDir, "originals"), { recursive: true });
  await fs.writeFile(
    path.join(tmpDir, "originals", "page-004.png"),
    Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64"),
  );
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe("knowledge access at section grain", () => {
  it("discover_resources at section grain returns passages with their ref, heading path and citation, never a body", async () => {
    const server = (await createServer(tmpDir)) as any;
    const res = await callTool(server, "discover_resources", { query: "feasibility areas", grain: "section" });
    const payload = JSON.parse(res.content[0].text);
    expect(payload.results[0].ref).toBe("guide-assess#feasibility");
    expect(payload.results[0].heading_path).toBe("Assess › Feasibility");
    expect(payload.results[0].citation).toBe("Acme Guide (2026), p. 4");
    expect(payload.results[0].body).toBeUndefined();
    // The other passage of the same document is not in this answer: a shortlist says where to look.
    expect(res.content[0].text).not.toContain("Examination of exceptional");
  });

  it("discover_resources keeps resource grain by default and honours scope", async () => {
    const server = (await createServer(tmpDir)) as any;
    const whole = JSON.parse((await callTool(server, "discover_resources", { query: "feasibility" })).content[0].text);
    expect(whole.results[0].id).toBe("guide-assess");
    expect(whole.results[0].ref).toBeUndefined();
    const elsewhere = JSON.parse((await callTool(server, "discover_resources", { query: "feasibility", grain: "section", scope: "originals" })).content[0].text);
    expect(elsewhere.results).toEqual([]);
  });

  it("open_resource returns one section by argument or by id#anchor, with its ref and the citation", async () => {
    const server = (await createServer(tmpDir)) as any;
    const one = await openJson(server, { id_or_path: "guide-assess", section: "risk-assessment" });
    expect(one.section.ref).toBe("guide-assess#risk-assessment");
    expect(one.content).toContain("Examination of exceptional risks");
    expect(one.content).not.toContain("Four areas");
    expect(one.citation).toBe("Acme Guide (2026), p. 4");
    const viaRef = await openJson(server, { id_or_path: "guide-assess#feasibility" });
    expect(viaRef.section.anchor).toBe("feasibility");
    expect(viaRef.section.heading_path).toBe("Assess › Feasibility");
  });

  it("open_resource with projection outline returns the headings and their anchors instead of the body", async () => {
    const server = (await createServer(tmpDir)) as any;
    const outline = await openJson(server, { id_or_path: "guide-assess", projection: "outline" });
    expect(outline.outline.map((o: { anchor: string }) => o.anchor)).toEqual(["assess", "risk-assessment", "feasibility"]);
    expect(outline.content).not.toContain("Four areas");
  });

  it("open_resource names the anchors a document has when the one asked for is unknown", async () => {
    const server = (await createServer(tmpDir)) as any;
    const missing = await callTool(server, "open_resource", { id_or_path: "guide-assess", section: "nope" });
    expect(missing.isError).toBe(true);
    expect(missing.content[0].text).toContain("Known sections");
    expect(missing.content[0].text).toContain("feasibility");
  });

  it("open_resource refuses a call that names two different sections instead of picking one", async () => {
    const server = (await createServer(tmpDir)) as any;
    const clash = await callTool(server, "open_resource", { id_or_path: "guide-assess#feasibility", section: "risk-assessment" });
    expect(clash.isError).toBe(true);
    expect(clash.content[0].text).toContain("Two different sections");
    // The same anchor twice is one request, not a contradiction.
    const same = await openJson(server, { id_or_path: "guide-assess#feasibility", section: "feasibility" });
    expect(same.section.anchor).toBe("feasibility");
  });

  it("open_resource with lang opens that edition, or returns the canonical one flagged as a fallback", async () => {
    const server = (await createServer(tmpDir)) as any;
    const de = await openJson(server, { id_or_path: "guide-assess", lang: "de" });
    expect(de.resource.id).toBe("guide-assess-de");
    expect(de.edition).toMatchObject({ requested: "de", language: "de", fallback: false });
    expect(de.content).toContain("Risikobewertung");
    const fr = await openJson(server, { id_or_path: "guide-assess", lang: "fr" });
    expect(fr.resource.id).toBe("guide-assess");
    expect(fr.edition.fallback).toBe(true);
    expect([...fr.edition.available].sort()).toEqual(["de", "en"]);
  });

  it("projection source returns the record and the printed page as an image block, its bytes out of the text", async () => {
    const server = (await createServer(tmpDir)) as any;
    const res = await callTool(server, "open_resource", { id_or_path: "guide-assess", projection: "source" });
    expect(res.content).toHaveLength(2);
    const text = JSON.parse(res.content[0].text);
    expect(text.source.page_images).toBe("originals/page-{page:03}.png");
    expect(text.images[0]).toMatchObject({ page: 4, path: "originals/page-004.png", mime: "image/png" });
    expect(text.images[0].data).toBeUndefined();
    expect(text.citation).toBe("Acme Guide (2026), p. 4");
    expect(res.content[1].type).toBe("image");
    expect(res.content[1].mimeType).toBe("image/png");
    expect(res.content[1].data.startsWith("iVBOR")).toBe(true);
  });

  it("the tool descriptions tell a model what the section grain is for", async () => {
    const server = (await createServer(tmpDir)) as any;
    const handler = server.server._requestHandlers.get("tools/list");
    const tools: Array<{ name: string; description: string }> = (await handler({ method: "tools/list", params: {} }, {})).tools;
    expect(tools.find((t) => t.name === "discover_resources")?.description).toContain("id#anchor");
    expect(tools.find((t) => t.name === "open_resource")?.description).toContain("outline");
  });
});
