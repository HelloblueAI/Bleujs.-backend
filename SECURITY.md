# Security

## No secrets in the repo

- Do **not** commit `.env`, API keys, or credentials. Use `.env.example` as a template; copy to `.env` locally and fill in values.
- In production, use environment variables or a secrets manager. Never hardcode secrets.

## Reporting a vulnerability

If you find a security issue:

- **Preferred:** Open a [private security advisory](https://github.com/HelloblueAI/Bleujs.-backend/security/advisories/new) on GitHub.
- Or contact the maintainers (see main [Bleu.js](https://github.com/HelloblueAI/Bleu.js) repo).

We will acknowledge and work on the report and coordinate disclosure.

## Production checklist

- Set `NODE_ENV=production`.
- Set `BLEU_API_KEYS` (comma-separated) for any exposed `/api/*` Node routes.
  Production `/api/*` routes fail closed when no key is configured.
- Configure `CORS_ORIGINS` to allow only your front-end origin(s) (do not use `*`
  in production).
- Set `PREDICT_API_KEYS` (or reuse `BLEU_API_KEYS`) before exposing the Python
  `/predict` ML service. It fails closed in production when no key is configured.
- Use HTTPS and secure cookies where applicable.
- Keep dependencies updated; run `npm audit` and fix high/critical issues.
- Do not log secrets or full request bodies in production.
- Treat ML model and scaler files as trusted binaries. Pickle/joblib artifacts can
  execute code when loaded, so keep `MODEL_DIR` read-only and load
  `MODEL_PATH`/`SCALER_PATH` only from that directory.
- Keep local Docker Compose services bound to localhost unless they are behind an
  authenticated gateway. The optional MongoDB profile should not publish port
  `27017` to shared networks.

## Supported versions

Security fixes are applied to the default branch and the latest released backend
version. Older branches are not supported unless maintainers explicitly mark
them as active.

## Main repo

- **Bleu.js (SDK, CLI, docs):** [github.com/HelloblueAI/Bleu.js](https://github.com/HelloblueAI/Bleu.js)
- **This backend:** [github.com/HelloblueAI/Bleujs.-backend](https://github.com/HelloblueAI/Bleujs.-backend)
