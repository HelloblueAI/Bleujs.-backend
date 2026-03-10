/**
 * Contract-awareness check: ensure the main repo OpenAPI spec contains the
 * paths this backend is expected to implement. Run: npm run test:contract
 * Fetches the spec from GitHub; skips if network fails (e.g. offline).
 */
const SPEC_URL =
  "https://raw.githubusercontent.com/HelloblueAI/Bleu.js/main/docs/api/openapi.yaml";

const REQUIRED_PATHS = ["/api/v1/chat", "/api/v1/generate", "/api/v1/embed", "/api/v1/models"];
const RECOMMENDED_PATHS = ["/health"];

function specContainsPath(specText, path) {
  if (specText.includes(path)) return true;
  const pathKey = path.startsWith("/") ? path : "/" + path;
  return specText.includes(pathKey + ":") || specText.includes(" " + pathKey);
}

async function main() {
  let text;
  try {
    const url = SPEC_URL + "?t=" + Date.now();
    const res = await fetch(url, {
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    text = await res.text();
  } catch (e) {
    console.warn("contract: could not fetch spec (offline or network error), skipping:", e.message);
    process.exit(0);
  }

  const missingRequired = REQUIRED_PATHS.filter((p) => !specContainsPath(text, p));
  if (missingRequired.length) {
    console.error("contract: spec is missing required paths:", missingRequired.join(", "));
    console.error("Update the spec in the main repo: docs/api/openapi.yaml");
    process.exit(1);
  }
  const missingRecommended = RECOMMENDED_PATHS.filter((p) => !specContainsPath(text, p));
  if (missingRecommended.length) {
    console.warn("contract: spec should also define (recommended):", missingRecommended.join(", "));
  }
  console.log("contract: spec contains required paths");
  process.exit(0);
}

main();
