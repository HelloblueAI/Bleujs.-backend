/**
 * Local HTTP server that invokes the worker fetch handler.
 * Use for local testing: npm run dev / npm start so POST /api/v1/chat,
 * /api/v1/generate, /api/v1/embed are served without timeout.
 */
import { createServer } from "http";
import handler from "./index.mjs";

const PORT = Number(process.env.PORT) || 4003;
const fetchHandler = handler?.default?.fetch ?? handler?.fetch;

if (typeof fetchHandler !== "function") {
  console.error("server: no fetch handler on index.mjs default.fetch");
  process.exit(1);
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v) headers.set(k.toLowerCase(), Array.isArray(v) ? v.join(", ") : v);
  }
  const body = await readBody(req);
  const request = new Request(url, {
    method: req.method,
    headers,
    body: body.length ? body : undefined,
  });

  try {
    const response = await fetchHandler(request, {}, {});
    res.writeHead(response.status, Object.fromEntries(response.headers));
    const buf = await response.arrayBuffer();
    res.end(Buffer.from(buf));
  } catch (err) {
    console.error("server:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: String(err?.message || err), code: "INTERNAL_ERROR" }));
  }
});

server.listen(PORT, () => {
  console.log(`Bleu.js backend listening on http://localhost:${PORT}`);
  console.log("  GET  /health");
  console.log("  GET  /api/v1/models");
  console.log("  POST /api/v1/chat");
  console.log("  POST /api/v1/generate");
  console.log("  POST /api/v1/embed");
});
