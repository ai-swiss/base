// Streaming support for the OpenAI-compatible wire API: a tolerant SSE line parser over the response
// body, and an assembler that accumulates streamed deltas (text + incrementally-streamed tool calls)
// into the same normalized Completion that `complete()` returns. Streaming is what makes perceived
// latency low (first token fast) while still yielding a final, fully-assembled result.
//
// Stream events (yielded by a model's `stream()`):
//   { type: "text-delta", text }            // live text chunk
//   { type: "tool-call", id, name, arguments }  // one per call, emitted once fully assembled
//   { type: "done", completion }            // the final normalized Completion (text + toolCalls + usage)

import { LlmResponseError } from "./errors.mjs";

// Drain a stream (the async iterable returned by `model.stream(...)`) into its final result. Useful
// to get both the accumulated text and the assembled Completion when you also streamed live deltas.
export async function collectStream(events) {
  let text = "";
  const toolCalls = [];
  let completion = null;
  for await (const e of events) {
    if (e.type === "text-delta") text += e.text;
    else if (e.type === "tool-call") toolCalls.push(e);
    else if (e.type === "done") completion = e.completion;
  }
  return { text, toolCalls, completion };
}

// Parse a byte stream (ReadableStream or async-iterable of Uint8Array/string) of `data: <json>` SSE
// lines into JSON objects. Yields the literal string "[DONE]" for the terminator. Buffers partial
// lines across chunks.
export async function* parseEventStream(body) {
  if (!body) throw new LlmResponseError("streaming response had no body");
  const decoder = new TextDecoder();
  let buffer = "";

  for await (const chunk of body) {
    buffer += typeof chunk === "string" ? chunk : decoder.decode(chunk, { stream: true });
    let nl;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      const evt = parseLine(line);
      if (evt !== undefined) yield evt;
    }
  }
  const tail = parseLine(buffer.trim());
  if (tail !== undefined) yield tail;
}

function parseLine(line) {
  if (!line || !line.startsWith("data:")) return undefined; // ignore comments, blank lines, event: fields
  const data = line.slice(5).trim();
  if (data === "[DONE]") return "[DONE]";
  try {
    return JSON.parse(data);
  } catch (error) {
    throw new LlmResponseError(`streaming chunk was not valid JSON: ${data.slice(0, 120)}`, { cause: error });
  }
}

// Accumulate OpenAI streaming chunks → a normalized Completion. Tool calls arrive as deltas keyed by
// `index` (id + name on the first delta, `arguments` as concatenated string fragments).
export function createChunkAssembler() {
  let text = "";
  // Tool-call deltas are keyed by their `index` per the OpenAI wire spec. Some OpenAI-compatible
  // gateways omit `index` on parallel calls; we then key a NEW call by its `id` (the first delta of
  // each call carries one) and treat an id-less, index-less fragment as a continuation of the most
  // recent call — so two parallel calls no longer collide into a single slot 0.
  const calls = new Map(); // key → { id, name, argsText, order }
  let nextOrder = 0;
  let lastKey = null;
  let finishReason = "unknown";
  let usage = { input: 0, output: 0 };

  return {
    addChunk(evt) {
      const choice = evt?.choices?.[0];
      if (evt?.usage) usage = { input: Number(evt.usage.prompt_tokens ?? 0), output: Number(evt.usage.completion_tokens ?? 0) };
      if (!choice) return [];
      const delta = choice.delta ?? {};
      const events = [];

      if (typeof delta.content === "string" && delta.content.length > 0) {
        text += delta.content;
        events.push({ type: "text-delta", text: delta.content });
      }
      for (const tc of delta.tool_calls ?? []) {
        const key =
          typeof tc.index === "number" ? `i${tc.index}`
          : tc.id ? `id:${tc.id}`
          : lastKey ?? "i0";
        let acc = calls.get(key);
        if (!acc) {
          acc = { id: "", name: "", argsText: "", order: typeof tc.index === "number" ? tc.index : nextOrder++ };
          calls.set(key, acc);
        }
        if (tc.id) acc.id = tc.id;
        if (tc.function?.name) acc.name = tc.function.name;
        if (typeof tc.function?.arguments === "string") acc.argsText += tc.function.arguments;
        lastKey = key;
      }
      if (choice.finish_reason) finishReason = mapFinish(choice.finish_reason);
      return events;
    },

    // Emit one consolidated tool-call event per accumulated call (args parsed), in arrival order
    // (which equals index order when the gateway supplies indices).
    toolCallEvents() {
      return [...calls.values()]
        .sort((a, b) => a.order - b.order)
        .map((acc) => ({ type: "tool-call", id: acc.id, name: acc.name, arguments: parseArgs(acc.argsText) }));
    },

    finalize() {
      const content = [];
      if (text.length > 0) content.push({ type: "text", text });
      for (const evt of this.toolCallEvents()) content.push({ type: "toolCall", id: evt.id, name: evt.name, arguments: evt.arguments });
      return { message: { role: "assistant", content }, usage, finishReason };
    },
  };
}

function parseArgs(argsText) {
  if (!argsText) return {};
  try {
    return JSON.parse(argsText);
  } catch (error) {
    throw new LlmResponseError(`streamed tool-call arguments were not valid JSON: ${argsText.slice(0, 120)}`, { cause: error });
  }
}

function mapFinish(reason) {
  if (reason === "stop") return "stop";
  if (reason === "tool_calls" || reason === "function_call") return "tool_calls";
  if (reason === "length") return "length";
  if (reason === "content_filter") return "content_filter";
  return "unknown";
}
