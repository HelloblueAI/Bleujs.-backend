# Contributing to Bleu.js Backend

This repository is part of the **Bleu.js** project. We use the same contribution process and community standards as the main repo.

## Where to start

1. **Read the main project’s guide:** [Bleu.js CONTRIBUTING](https://github.com/HelloblueAI/Bleu.js/blob/main/CONTRIBUTING.md) — setup, PR process, and coding standards.
2. **Code of Conduct:** [Bleu.js Code of Conduct](https://github.com/HelloblueAI/Bleu.js/blob/main/CODE_OF_CONDUCT.md). By participating here, you agree to it.
3. **Backend-specific:** Open issues and pull requests **in this repo** for API server, inference, or backend services. For SDK, CLI, or docs, use the [main repo](https://github.com/HelloblueAI/Bleu.js).
4. **API contract:** When changing endpoints or response shapes, keep in sync with the [API contract](https://github.com/HelloblueAI/Bleu.js/blob/main/docs/API_CLIENT_GUIDE.md#api-contract-and-response-shapes) and the [OpenAPI spec](https://github.com/HelloblueAI/Bleu.js/blob/main/docs/api/openapi.yaml) in the main repo.

### Sync checklist (when you change routes or request/response shapes)

1. **Update the contract in the main repo:** Open a PR in [Bleu.js](https://github.com/HelloblueAI/Bleu.js) to update [docs/api/openapi.yaml](https://github.com/HelloblueAI/Bleu.js/blob/main/docs/api/openapi.yaml) and the API contract table (or coordinate with someone who can). The main repo CI validates the spec.
2. **In this repo:** Implement or adjust routes to match the spec; run `npm run lint` and `npm test` (typecheck + smoke + contract).
3. **CHANGELOG:** Add an entry to this repo’s [CHANGELOG.md](CHANGELOG.md) describing the API change so deployers and SDK maintainers know what changed.

This keeps both repos aligned and speeds up releases. Full runbook: [Changing the API](https://github.com/HelloblueAI/Bleu.js/blob/main/docs/CHANGING_THE_API.md) (main repo).

## Quick links

- [Bleu.js project](https://github.com/HelloblueAI/Bleu.js)
- [Repositories and sync](https://github.com/HelloblueAI/Bleu.js/blob/main/docs/REPOSITORIES.md) — how this repo and the main repo work together
- [Backend repo (this repo)](https://github.com/HelloblueAI/Bleujs.-backend)

Thank you for contributing.
