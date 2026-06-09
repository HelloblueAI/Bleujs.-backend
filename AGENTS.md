# AGENTS.md

Guidance for AI agents working in this repository.

## Cursor Cloud specific instructions

### Product overview

Bleu.js Backend is a Node.js API server (`server.mjs` → `index.mjs`) that implements the Bleu.js cloud API contract (`/health`, `/api/v1/models`, `/api/v1/chat`, `/api/v1/generate`, `/api/v1/embed`). A separate optional Python FastAPI service (`predict_api.py`) serves XGBoost ML inference and is **not** wired into the Node handler.

### Required services (local dev)

| Service | Command | URL |
|---------|---------|-----|
| Node API (primary) | `npm run dev` | `http://127.0.0.1:4003` |

### Optional services

| Service | Command | URL | Notes |
|---------|---------|-----|-------|
| Python ML API | `docker compose up ai-service` or `uvicorn predict_api:app --host 0.0.0.0 --port 8000` | `http://127.0.0.1:8000` | Requires `models/xgboost_model_latest.pkl` (see `./scripts/setup_ml.sh --download`) |
| MongoDB | `MONGO_INITDB_ROOT_PASSWORD=<secret> docker compose --profile mongo up mongo` | internal `27017` | Experimental only; not used by live handler |

### Setup notes

- **Node.js >= 20** required (see `.nvmrc`). Use `npm install` (not yarn/pnpm; lockfile is `package-lock.json`).
- Copy `.env.example` to `.env` before `npm run dev` — the `dev` script uses `dotenv -e .env`.
- `npm start` works without dotenv-cli if env vars are set externally.
- `npm test` does **not** require the server to be running (tests import the handler in-process). `npm run test:contract` needs network access to fetch the OpenAPI spec from the main Bleu.js repo.

### Common commands

See [README.md](README.md) for full details:

- **Lint:** `npm run lint`
- **Typecheck:** `npm run typecheck`
- **Test:** `npm test` (typecheck + smoke + API + contract + unit)
- **Dev server:** `npm run dev`
- **Format:** `npm run format`

### Gotchas

- The live API handler in `index.mjs` returns stub/mock responses — no database, Redis, or ML calls at runtime.
- `BLEU_API_KEYS` / `BLEU_API_KEY` optionally gate `/api/*` routes; leave unset for open local dev.
- Experimental code under `src/src/services/` (Express, MongoDB, Redis) is **not** connected to the live entrypoint.
