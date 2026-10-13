# mcp-stdio-mini (free)

A complete MCP server in **one file with zero dependencies**. It shows the whole protocol (`initialize`, `tools/list`, `tools/call`, errors) without the SDK, so you can see how MCP works.

```bash
npm test
node server.js        # speaks JSON-RPC over stdin/stdout
```

Claude Desktop / Cursor config:
```json
{ "mcpServers": { "mini": { "command": "node", "args": ["/absolute/path/to/server.js"] } } }
```

Add a tool by adding an entry to the `tools` object in `server.js`.

## Want it remote?
The paid **Remote MCP Kit** turns this into a deployable HTTP server: one-click Vercel deploy, API-key auth, rate limiting, schema validation, Docker, and a test suite. **Prompt Regression Kit** adds CI tests for your prompts. See https://forgelinekits.com

MIT © Forgeline Kits
