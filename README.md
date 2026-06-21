# Bleu.js Backend

[![Node.js 20+](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org/)
[![Part of Bleu.js](https://img.shields.io/badge/Part%20of-Bleu.js-blue.svg)](https://github.com/HelloblueAI/Bleu.js)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**Part of the [Bleu.js](https://github.com/HelloblueAI/Bleu.js) project.** This repo holds the **edge API stub** (Node) and the **XGBoost prediction service** (Python). The main Bleu.js repo holds the Python SDK, CLI, docs, and product app. For how both repos fit together and stay in sync, see [Repositories and sync](https://github.com/HelloblueAI/Bleu.js/blob/main/docs/REPOSITORIES.md). **Repo name:** **Bleujs.-backend** — [github.com/HelloblueAI/Bleujs.-backend](https://github.com/HelloblueAI/Bleujs.-backend).

## Who serves what in production

| Traffic | Production owner | Role of this repo |
| --- | --- | --- |
| `POST /api/v1/chat`, `/generate`, `/embed` | **[bleujs.org](https://bleujs.org)** (Next.js on Vercel, via `api.bleujs.org`) | Stub responses for **local dev, CI, and contract tests** — not production AI |
| `POST /predict` | **Python FastAPI** (`predict_api.py`) | **Canonical ML inference** — deploy via Docker, Railway, or Elastic Beanstalk |
| OpenAPI shape + edge compatibility | **Node handler** (`index.mjs`) | **Edge stub + contract compliance** (Cloudflare Worker–style `fetch` handler) |

**In one line:**

- **Chat / generate / embed → bleujs.org**
- **`/predict` → Python FastAPI**
- **This repo's Node handler → edge stub + contract compliance**

For the full client vs server split, see the main repo: [Who serves the API](https://github.com/HelloblueAI/Bleu.js/blob/main/docs/WHO_SERVES_THE_API.md).

### Entrypoint and structure

- **`index.mjs`** — Cloudflare Worker–style `fetch` handler for `/health`, `/api/v1/models`, `/api/v1/chat`, `/api/v1/generate`, and `/api/v1/embed`. Returns **stub** responses that match the [OpenAPI contract](https://github.com/HelloblueAI/Bleu.js/blob/main/docs/api/openapi.yaml) so `bleu chat`, `bleu generate`, and `bleu embed` (and the Python SDK) can be tested locally or on an edge host. **Production chat/generate/embed are served by bleujs.org, not this handler.**
- **`server.mjs`** — local HTTP adapter (default port 4003) around `index.mjs` for `npm run dev` / `npm start`.
- **`predict_api.py`** — FastAPI service for `POST /predict` (XGBoost). This is the **production ML path**; deploy separately from the Node handler (see [Deploy](#deploy)).

## What's in this repo

- **Node API stub** — `index.mjs` + `server.mjs` for contract-compliant edge/local testing (not production AI)
- **Python ML inference** — `predict_api.py` and XGBoost artifacts (XGBoost 3.x, aligned with [Bleu.js](https://github.com/HelloblueAI/Bleu.js))
- **Experimental code** — legacy `src/` services (rules engine, MongoDB helpers) are **not wired** into the live handler; do not treat them as production paths

### ML / XGBoost and Hugging Face

- **XGBoost** is pinned to `>=3.0.2` in `requirements.txt` to match the main Bleu.js repo.
- Prediction services look for the model at `models/xgboost_model_latest.pkl` (or set `MODEL_PATH` / `MODEL_DIR`).
- **Download model from Hub:** run `./scripts/setup_ml.sh --download` (or `pip install -r requirements-hf.txt` then `python scripts/download_model_from_hf.py`). Set `HF_REPO_ID` to the model repo (default: `helloblueai/bleu-xgboost-classifier`); use `pejmantheory/bleu-xgboost-classifier` or your own. Set `HF_TOKEN` if the repo is gated.
- **Pre-trained models:** [helloblueai/bleu-xgboost-classifier](https://huggingface.co/helloblueai/bleu-xgboost-classifier) (org) or [pejmantheory/bleu-xgboost-classifier](https://huggingface.co/pejmantheory/bleu-xgboost-classifier). See [README_HF.md](README_HF.md) for usage.

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

| Script                  | Description                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| `npm run dev`           | Run local server with dotenv (`node server.mjs`)                  |
| `npm start`             | Run local server (`node server.mjs`); set `PORT` to override 4003 |
| `npm run lint`          | ESLint                                                            |
| `npm run format`        | Prettier                                                          |
| `npm run typecheck`     | TypeScript check                                                  |
| `npm run test:smoke`    | Smoke test (entrypoint responds)                                  |
| `npm run test:contract` | Checks main repo OpenAPI spec has expected paths (network)        |
| `npm test`              | Typecheck + smoke + API + contract + unit tests                   |

## Environment variables

Configure via `.env`. Typical variables (no secrets in the repo):

- `PORT` — Server port
- `HOST` — Local server bind host (defaults to `127.0.0.1`)
- `NODE_ENV` — `development` or `production`
- `BLEU_API_KEY` / `BLEU_API_KEYS` — Optional key or comma-separated keys required for `/api/*` routes
- `CORS_ORIGINS` — Comma-separated browser origins allowed in production (development defaults to `*`)
- `MAX_REQUEST_BODY_BYTES`, `MAX_JSON_BODY_BYTES` — Request body limits for the local server and handler
- `MAX_EMBED_INPUTS`, `MAX_EMBED_TEXT_CHARS` — Embedding endpoint allocation limits
- Database/Redis URLs, API keys, and other secrets as required by the app
- **ML (optional):** `PREDICT_API_KEY` / `PREDICT_API_KEYS`, `MAX_PREDICT_BODY_BYTES` — auth and request-size controls for the Python prediction API; `MODEL_DIR`, `MODEL_PATH`, `SCALER_PATH` — where to find trusted XGBoost/scaler artifacts; `HF_TOKEN`, `HF_REPO_ID` — for scripts that download from the Hub (see [.env.example](.env.example)).

Do not commit `.env`. Use a secrets manager or env vars in production.

## Security / production

- **CORS:** The stub in `index.mjs` uses `*` for development. In production, set `CORS_ORIGINS` to your front-end origin(s) only.
- **Auth:** Set `BLEU_API_KEYS` before exposing `/api/*` routes outside a trusted network. Production API routes fail closed when no key is configured.
- **ML auth:** Set `PREDICT_API_KEYS` (or reuse `BLEU_API_KEYS`) before exposing `/predict`; production prediction requests fail closed when no key is configured.
- **Model artifacts:** Treat `.pkl`/joblib model and scaler files as trusted binaries. Keep `MODEL_DIR` read-only and avoid loading artifacts from user-writable paths.
- **Secrets:** Never commit `.env`. Use a secrets manager or platform env vars in production.
- **Policy:** See [SECURITY.md](SECURITY.md) for reporting vulnerabilities and the production checklist.

## CI

GitHub Actions run on push/PR to `main`: lint, typecheck, smoke/API/contract/unit tests, and ML script validation (see [.github/workflows/ci.yml](.github/workflows/ci.yml)).

## Releases

- **Release notes:** [CHANGELOG.md](CHANGELOG.md). For SDK and product releases, see the main repo [CHANGELOG](https://github.com/HelloblueAI/Bleu.js/blob/main/CHANGELOG.md).
- Version is in `package.json` (`version`). When you change API behavior, update the [API contract](https://github.com/HelloblueAI/Bleu.js/blob/main/docs/API_CLIENT_GUIDE.md#api-contract-and-response-shapes) in the main repo and add an entry here if relevant.

## Deploy

Deploy **each surface independently** — they are separate processes with different production owners.

### Chat / generate / embed (production)

**Do not deploy this repo's Node handler for production AI.** Live traffic is served by **[bleujs.org](https://bleujs.org)** (Next.js on Vercel). Changes to chat, generate, or embed belong in the bleujs.org codebase.

Use this repo's Node handler only for:

- Local development (`npm run dev`)
- CI and contract tests (`npm test`)
- Optional edge hosting of **stub** responses (e.g. Cloudflare Workers)

### `/predict` (production ML)

Deploy the **Python FastAPI** service (`predict_api.py`):

```bash
# Docker (see Dockerfile — Python-only image)
docker build -t bleujs-predict .
docker run -p 8000:8000 -e PREDICT_API_KEYS=your-key bleujs-predict
```

Before starting, ensure the model is present (e.g. run `python scripts/download_model_from_hf.py` in your pipeline with `HF_REPO_ID` and `HF_TOKEN` set), or mount `models/xgboost_model_latest.pkl` into the container. If you use a scaler, provide `models/scaler_latest.pkl` or set `SCALER_PATH` inside `MODEL_DIR`.

For local smoke tests: `docker compose up ai-service` binds the Python API to `127.0.0.1:${AI_PORT:-8000}`. The optional MongoDB service is behind the `mongo` profile and is not published to the host by default.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for Railway, Elastic Beanstalk, and Docker details.

## Contributing

Contributions are welcome. We follow the same community standards as the main project:

- **Code of Conduct:** [Bleu.js CODE_OF_CONDUCT](https://github.com/HelloblueAI/Bleu.js/blob/main/CODE_OF_CONDUCT.md) (see also [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) in this repo).
- **How to contribute:** [Bleu.js CONTRIBUTING](https://github.com/HelloblueAI/Bleu.js/blob/main/CONTRIBUTING.md).

Open issues and PRs **in this repo** for backend-specific changes. For SDK, CLI, or docs, use the [main repo](https://github.com/HelloblueAI/Bleu.js).

## Repository Health

For a comprehensive overview of this repository's health, CI/CD status, security posture, and recommendations, see:

- **[Repository Health Report](REPOSITORY_HEALTH_REPORT.md)** - Overall score: **91.5/100 (A)**

## Main repo

- **Bleu.js (SDK, CLI, docs):** [github.com/HelloblueAI/Bleu.js](https://github.com/HelloblueAI/Bleu.js)
- **Backend (this repo):** [github.com/HelloblueAI/Bleujs.-backend](https://github.com/HelloblueAI/Bleujs.-backend)

## License

Same as the main Bleu.js project (see [LICENSE](LICENSE) in this repo).
