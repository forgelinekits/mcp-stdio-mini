import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { handle } from "../server.js";
test("slugify", () => assert.equal(handle({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "mini_slugify", arguments: { text: "Olá, MCP World!" } } }).result.content[0].text, "ola-mcp-world"));
test("missing arg", () => assert.equal(handle({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "mini_slugify", arguments: {} } }).error.code, -32602));
test("stdio round trip", async () => {
  const p = spawn("node", [new URL("../server.js", import.meta.url).pathname]);
  const lines = []; p.stdout.on("data", (d) => lines.push(...d.toString().trim().split("\n")));
  p.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }) + "\n");
  p.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
  p.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" }) + "\n");
  await new Promise((r) => setTimeout(r, 300)); p.kill();
  assert.equal(lines.length, 2);
  assert.equal(JSON.parse(lines[1]).result.tools.length, 2);
});
