# Bleu.js Backend

[![Node.js 20+](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org/)
[![Part of Bleu.js](https://img.shields.io/badge/Part%20of-Bleu.js-blue.svg)](https://github.com/HelloblueAI/Bleu.js)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**Part of the [Bleu.js](https://github.com/HelloblueAI/Bleu.js) project.** This repo contains the backend that powers the Bleu.js cloud API; the main repo holds the Python SDK, CLI, docs, and product app. For how both repos fit together and stay in sync, see the main repo: [Repositories and sync](https://github.com/HelloblueAI/Bleu.js/blob/main/docs/REPOSITORIES.md). **Repo name:** This repository is **Bleujs.-backend** (canonical: [github.com/HelloblueAI/Bleujs.-backend](https://github.com/HelloblueAI/Bleujs.-backend)).

### Entrypoint and structure

- **`index.mjs`** exports a fetch handler (Cloudflare Worker style) that implements `/health`, `/api/v1/models`, `/api/v1/chat`, `/api/v1/generate`, and `/api/v1/embed` so that `bleu chat`, `bleu generate`, and `bleu embed` (and the Python SDK) get HTTP 200 and valid JSON. Deploy this handler to your Worker host (e.g. Cloudflare Workers).
- **`server.mjs`** runs a local HTTP server (default port 4003) that invokes the handler so `npm run dev` / `npm start` serve the API locally and avoid timeouts or 500s when testing with the CLI or SDK.

## What's in this repo

- **API server** — Express app (inference, prediction, rules engine, AI services)
- **ML inference** — XGBoost model serving and prediction API
- **Services** — Decision tree, rules engine, Redis, optional MongoDB

**API contract:** For request/response shapes (e.g. `/api/v1/chat`, `/api/v1/generate`, `/api/v1/embed`), keep in sync with the [Bleu.js API client guide](https://github.com/HelloblueAI/Bleu.js/blob/main/docs/API_CLIENT_GUIDE.md#api-contract-and-response-shapes) and the [openapi.yaml](https://github.com/HelloblueAI/Bleu.js/blob/main/docs/api/openapi.yaml) spec. When you change the API, follow the main repo [Changing the API runbook](https://github.com/HelloblueAI/Bleu.js/blob/main/docs/CHANGING_THE_API.md) so both repos stay in sync.

## Prerequisites

- **Node.js** >= 20 (see [.nvmrc](.nvmrc); use `nvm use` or `fnm use` if you use a version manager).
- **npm** (or yarn/pnpm)

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` in the repo root and fill in values (see [Environment variables](#environment-variables)). For local dev you can use:

```bash
npm run dev
```

(Adjust the `dev` script in `package.json` if your `.env` path differs.)

## Scripts

| Script      | Description                |
|------------|----------------------------|
| `npm run dev`     | Run local server with dotenv (`node server.mjs`) |
| `npm start`       | Run local server (`node server.mjs`); set `PORT` to override 4003 |
| `npm run lint`    | ESLint                    |
| `npm run format`  | Prettier                   |
| `npm run typecheck` | TypeScript check        |
| `npm run test:smoke` | Smoke test (entrypoint responds) |
| `npm run test:contract` | Checks main repo OpenAPI spec has expected paths (network) |
| `npm test`          | Typecheck + smoke + contract  |

## Environment variables

Configure via `.env`. Typical variables (no secrets in the repo):

- `PORT` — Server port
- `NODE_ENV` — `development` or `production`
- Database/Redis URLs, API keys, and other secrets as required by the app

Do not commit `.env`. Use a secrets manager or env vars in production.

## Security / production

- **CORS:** The stub in `index.mjs` uses `*` for development. In production, set `Access-Control-Allow-Origin` to your front-end origin(s) only.
- **Secrets:** Never commit `.env`. Use a secrets manager or platform env vars in production.
- **Policy:** See [SECURITY.md](SECURITY.md) for reporting vulnerabilities and the production checklist.

## CI

GitHub Actions run on push/PR to `main`: lint and typecheck (see [.github/workflows/ci.yml](.github/workflows/ci.yml)).

## Releases

- **Release notes:** [CHANGELOG.md](CHANGELOG.md). For SDK and product releases, see the main repo [CHANGELOG](https://github.com/HelloblueAI/Bleu.js/blob/main/CHANGELOG.md).
- Version is in `package.json` (`version`). When you change API behavior, update the [API contract](https://github.com/HelloblueAI/Bleu.js/blob/main/docs/API_CLIENT_GUIDE.md#api-contract-and-response-shapes) in the main repo and add an entry here if relevant.

## Deploy

Point your deployment (e.g. bleujs.org API) at this repo’s `main` branch. Use environment-based config and a process manager (e.g. PM2) or your platform’s Node runtime.

## Contributing

Contributions are welcome. We follow the same community standards as the main project:

- **Code of Conduct:** [Bleu.js CODE_OF_CONDUCT](https://github.com/HelloblueAI/Bleu.js/blob/main/CODE_OF_CONDUCT.md) (see also [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) in this repo).
- **How to contribute:** [Bleu.js CONTRIBUTING](https://github.com/HelloblueAI/Bleu.js/blob/main/CONTRIBUTING.md).

Open issues and PRs **in this repo** for backend-specific changes. For SDK, CLI, or docs, use the [main repo](https://github.com/HelloblueAI/Bleu.js).

## Main repo

- **Bleu.js (SDK, CLI, docs):** [github.com/HelloblueAI/Bleu.js](https://github.com/HelloblueAI/Bleu.js)
- **Backend (this repo):** [github.com/HelloblueAI/Bleujs.-backend](https://github.com/HelloblueAI/Bleujs.-backend)

## License

Same as the main Bleu.js project (see [LICENSE](LICENSE) in this repo).
