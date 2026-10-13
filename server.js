#!/usr/bin/env node
// Minimal MCP server over stdio. Zero dependencies, one file. MIT licensed.
import { createInterface } from "node:readline";

const tools = {
  mini_time: {
    description: "Current date and time in ISO 8601 (UTC).",
    inputSchema: { type: "object", properties: {} },
    run: () => new Date().toISOString(),
  },
  mini_slugify: {
    description: "Turn a title into a URL slug.",
    inputSchema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] },
    run: ({ text }) => String(text).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  },
};

export function handle(msg) {
  if (!("id" in msg)) return null;
  const { id, method, params = {} } = msg;
  const ok = (result) => ({ jsonrpc: "2.0", id, result });
  const err = (code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });
  if (method === "initialize") return ok({ protocolVersion: params.protocolVersion || "2026-07-28", capabilities: { tools: {} }, serverInfo: { name: "mcp-stdio-mini", version: "1.0.0" } });
  if (method === "ping") return ok({});
  if (method === "tools/list") return ok({ tools: Object.entries(tools).map(([name, t]) => ({ name, description: t.description, inputSchema: t.inputSchema })) });
  if (method === "tools/call") {
    const t = tools[params.name];
    if (!t) return err(-32602, `Unknown tool: ${params.name}`);
    for (const k of t.inputSchema.required || []) if (!(k in (params.arguments || {}))) return err(-32602, `Missing argument: ${k}`);
    try { return ok({ content: [{ type: "text", text: String(t.run(params.arguments || {})) }] }); }
    catch (e) { return ok({ isError: true, content: [{ type: "text", text: e.message }] }); }
  }
  return err(-32601, `Method not found: ${method}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createInterface({ input: process.stdin }).on("line", (line) => {
    if (!line.trim()) return;
    let msg; try { msg = JSON.parse(line); } catch { return process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }) + "\n"); }
    const out = handle(msg); if (out) process.stdout.write(JSON.stringify(out) + "\n");
  });
}
