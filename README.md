# Bleu.js Backend

Node/Express API and services for [Bleu.js](https://github.com/HelloblueAI/Bleu.js). This repo contains the backend that powers the Bleu.js cloud API; the main [Bleu.js](https://github.com/HelloblueAI/Bleu.js) repo holds the Python SDK, CLI, and docs.

## What's in this repo

- **API server** — Express app (inference, prediction, rules engine, AI services)
- **ML inference** — XGBoost model serving and prediction API
- **Services** — Decision tree, rules engine, Redis, optional MongoDB

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

## Environment variables

Configure via `.env`. Typical variables (no secrets in the repo):

- `PORT` — Server port
- `NODE_ENV` — `development` or `production`
- Database/Redis URLs, API keys, and other secrets as required by the app

Do not commit `.env`. Use a secrets manager or env vars in production.

## Security / production

- **CORS:** The stub in `index.mjs` uses `*` for development. In production, set `Access-Control-Allow-Origin` to your front-end origin(s) only.
- **Secrets:** Never commit `.env`. Use a secrets manager or platform env vars in production.

## Deploy

Point your deployment (e.g. bleujs.org API) at this repo’s `main` branch. Use environment-based config and a process manager (e.g. PM2) or your platform’s Node runtime.

## Main repo

- **Bleu.js (SDK, CLI, docs):** [github.com/HelloblueAI/Bleu.js](https://github.com/HelloblueAI/Bleu.js)
- **Backend (this repo):** [github.com/HelloblueAI/Bleujs.-backend](https://github.com/HelloblueAI/Bleujs.-backend)

## License

Same as the main Bleu.js project (see [LICENSE](LICENSE) in this repo).
