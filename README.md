# Bleu.js Backend

[![Node.js 20+](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org/)
[![Part of Bleu.js](https://img.shields.io/badge/Part%20of-Bleu.js-blue.svg)](https://github.com/HelloblueAI/Bleu.js)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**Part of the [Bleu.js](https://github.com/HelloblueAI/Bleu.js) project.** This repo contains the backend that powers the Bleu.js cloud API; the main repo holds the Python SDK, CLI, docs, and product app. For how both repos fit together and stay in sync, see the main repo: [Repositories and sync](https://github.com/HelloblueAI/Bleu.js/blob/main/docs/REPOSITORIES.md).

## What's in this repo

- **API server** — Express app (inference, prediction, rules engine, AI services)
- **ML inference** — XGBoost model serving and prediction API
- **Services** — Decision tree, rules engine, Redis, optional MongoDB

**API contract:** For request/response shapes (e.g. `/api/v1/chat`, `/api/v1/generate`, `/api/v1/embed`), keep in sync with the [Bleu.js API client guide](https://github.com/HelloblueAI/Bleu.js/blob/main/docs/API_CLIENT_GUIDE.md#api-contract-and-response-shapes).

## Prerequisites

- **Node.js** >= 20
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
| `npm run dev`     | Run with dotenv and node (local) |
| `npm start`       | Run production (`node index.mjs`) |
| `npm run lint`    | ESLint                    |
| `npm run format`  | Prettier                   |
| `npm run typecheck` | TypeScript check        |
| `npm test`          | Same as typecheck       |

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
