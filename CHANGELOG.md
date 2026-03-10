# Changelog

All notable changes to the Bleu.js backend are documented here. The backend is part of the [Bleu.js](https://github.com/HelloblueAI/Bleu.js) project; for SDK and product releases, see the main repo [CHANGELOG](https://github.com/HelloblueAI/Bleu.js/blob/main/CHANGELOG.md).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
