# Changelog

All notable changes to the Bleu.js backend are documented here. The backend is part of the [Bleu.js](https://github.com/HelloblueAI/Bleu.js) project; for SDK and product releases, see the main repo [CHANGELOG](https://github.com/HelloblueAI/Bleu.js/blob/main/CHANGELOG.md).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.2.0] - 2026-03

### Added

- **Local server:** `server.mjs` runs an HTTP server (default port 4003) that invokes the Worker fetch handler so `npm run dev` / `npm start` serve the API locally. Fixes chat/generate/embed timeouts or "no response" when testing with the CLI or SDK against a local backend.
- **API tests:** `tests/api.mjs` and `npm run test:api` verify POST /api/v1/chat, /api/v1/generate, and /api/v1/embed return HTTP 200 and response shapes expected by the CLI/SDK (`choices[0].message.content`, `text`, `data` with embeddings). `npm test` now includes test:api.

### Changed

- **Scripts:** `npm run dev` and `npm start` now run `node server.mjs` instead of `node index.mjs` so the API is actually served when running locally.
- **README:** Entrypoint section updated to describe index.mjs (Worker handler) and server.mjs (local HTTP server); scripts table updated for dev/start.

### Fixed

- **Chat:** Handler returns promptly with valid JSON (`choices[0].message.content`); no timeout when using the local server.
- **Generate:** Defensive body parsing and response shape so POST /api/v1/generate returns 200 with `text` (avoids 500 from malformed or non-object body).
- **Embed:** Defensive parsing for `input` / `inputs` / `texts` and safe array handling so POST /api/v1/embed returns 200 with `data` array of embeddings (avoids 500).
- **parseJson:** Returns a plain object `{}` on invalid or non-object body instead of `null`, so route handlers never dereference null and throw.

---

## [1.1.3] - 2026-03

### Added

- **CI & quality:** ESLint config (`.eslintrc.cjs`), TypeScript config (`tsconfig.json`) so `npm run lint` and `npm run typecheck` pass in CI.
- **Docs & community:** `CODE_OF_CONDUCT.md` and `CONTRIBUTING.md` aligned with main Bleu.js project; README badges (Node, Part of Bleu.js, License) and link to [Repositories and sync](https://github.com/HelloblueAI/Bleu.js/blob/main/docs/REPOSITORIES.md).
- **Scripts:** `npm test` runs typecheck and smoke test; `npm run test:smoke` runs entrypoint smoke test only.
- **Smoke test:** `tests/smoke.mjs` verifies the entrypoint responds with 200; run in CI.
- **README:** Entrypoint/structure section (what `index.mjs` is, where API logic lives); repo name note (Bleujs.-backend); link to OpenAPI spec in main repo.
- **API contract:** Backend README now links to the machine-readable [openapi.yaml](https://github.com/HelloblueAI/Bleu.js/blob/main/docs/api/openapi.yaml) in the main repo as single source of truth.

### Changed

- **CI:** Typecheck job is now blocking (no `continue-on-error`).
- **README:** Clear “Part of Bleu.js” section and API contract link for award-ready OSS alignment.

### Fixed

- Lint and typecheck now pass in GitHub Actions.
- Unused parameters in `index.mjs` (lint compliance).

---

When you change API behavior or request/response shapes, update the [API contract](https://github.com/HelloblueAI/Bleu.js/blob/main/docs/API_CLIENT_GUIDE.md#api-contract-and-response-shapes) in the main repo and note it here if relevant for deployers.
