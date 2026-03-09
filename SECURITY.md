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
- Configure CORS to allow only your front-end origin(s) (do not use `*` in production).
- Use HTTPS and secure cookies where applicable.
- Keep dependencies updated; run `npm audit` and fix high/critical issues.
- Do not log secrets or full request bodies in production.

## Main repo

- **Bleu.js (SDK, CLI, docs):** [github.com/HelloblueAI/Bleu.js](https://github.com/HelloblueAI/Bleu.js)
- **This backend:** [github.com/HelloblueAI/Bleujs.-backend](https://github.com/HelloblueAI/Bleujs.-backend)
