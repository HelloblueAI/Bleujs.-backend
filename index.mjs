/**
 * Bleu.js Backend – API entrypoint (Cloudflare Worker / fetch handler).
 * Implements /health, /api/v1/models, /api/v1/chat, /api/v1/generate, /api/v1/embed
 * to match the OpenAPI contract (Bleu.js docs/api/openapi.yaml).
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const DEFAULT_MODELS = [
  { id: "bleu-1", object: "model" },
  { id: "bleu-2", object: "model" },
  { id: "bleu-embed", object: "model" },
  { id: "bleu-chat-1", object: "model" },
  { id: "bleu-chat-2", object: "model" },
  { id: "bleu-generate-1", object: "model" },
  { id: "bleu-generate-2", object: "model" },
  { id: "bleu-quantum-1", object: "model" },
  { id: "bleu-quantum-2", object: "model" },
  { id: "bleu-default", object: "model" },
];

function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS, ...headers },
  });
}

function textResponse(text, status = 200) {
  return new Response(text, {
    status,
    headers: { "Content-Type": "text/plain", ...CORS_HEADERS },
  });
}

async function parseJson(request) {
  try {
    const body = await request.json();
    return body != null && typeof body === "object" && !Array.isArray(body) ? body : {};
  } catch {
    return {};
  }
}

export default {
  async fetch(request, _env, _ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    try {
      // Root: keep existing body for smoke test
      if (method === "GET" && (path === "/" || path === "")) {
        return textResponse("Bleu.js Quantum-Enhanced AI Platform - Backend Ready");
      }

      if (method === "GET" && path === "/health") {
        return jsonResponse({ status: "healthy", version: "1.0" });
      }

      if (method === "GET" && path === "/api/v1/models") {
        return jsonResponse({ data: DEFAULT_MODELS });
      }

      if (method === "POST" && path === "/api/v1/chat") {
        const body = await parseJson(request);
        const rawMessages = body?.messages;
        const messages = Array.isArray(rawMessages) ? rawMessages : [];
        const lastUser = messages.filter((m) => m != null && m?.role === "user").pop();
        const userText =
          lastUser != null && typeof lastUser.content === "string" ? lastUser.content : "Hello!";
        const content =
          typeof userText === "string" && userText.length > 0
            ? `You said: "${userText.slice(0, 200)}". Hello! How can I help?`
            : "Hello! How can I help?";
        return jsonResponse({
          choices: [{ message: { role: "assistant", content } }],
        });
      }

      if (method === "POST" && path === "/api/v1/generate") {
        const body = await parseJson(request);
        const prompt = typeof body?.prompt === "string" ? body.prompt : "";
        const text =
          prompt.length > 0
            ? `Generated response to: "${prompt.slice(0, 100)}".`
            : "Generated response.";
        return jsonResponse({
          text,
          id: "gen-" + String(Date.now()),
          model: typeof body?.model === "string" ? body.model : "bleu-1",
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          finish_reason: "stop",
        });
      }

      if (method === "POST" && path === "/api/v1/embed") {
        const body = await parseJson(request);
        const input = body?.input ?? body?.inputs ?? body?.texts;
        const raw = Array.isArray(input) ? input : [""];
        const texts = raw.map((t) => (typeof t === "string" ? t : String(t ?? "")));
        const dim = 384;
        const data = texts.map((_, i) => ({
          embedding: Array.from({ length: dim }, (_, j) => (i * 0.001 + j * 0.001) % 0.1),
          index: i,
        }));
        return jsonResponse({
          data,
          model: typeof body?.model === "string" ? body.model : "bleu-embed",
          usage: { prompt_tokens: 0, total_tokens: 0 },
        });
      }

      return jsonResponse(
        { success: false, error: "Not Found", code: "NOT_FOUND" },
        404
      );
    } catch (err) {
      return jsonResponse(
        {
          success: false,
          error: err?.message ?? "Internal Server Error",
          code: "INTERNAL_ERROR",
        },
        500
      );
    }
  },
};
