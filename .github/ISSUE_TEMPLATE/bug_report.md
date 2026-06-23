---
name: Bug Report
about: Report a problem with the backend API stub or predict service
title: '[BUG] '
labels: bug
assignees: ''
---

## Bug description

What went wrong? Include the endpoint (`/api/v1/chat`, `/predict`, etc.) if relevant.

## Steps to reproduce

1. `npm run dev` or `uvicorn predict_api:app ...`
2. Run `curl ...` or `npm test`
3. See error

## Expected behavior

What you expected.

## Actual behavior

What happened instead (paste logs or response body).

## Environment

- **OS:** [e.g. Ubuntu 22.04, macOS]
- **Node.js:** [e.g. 20.x — `node -v`]
- **Python:** [e.g. 3.11+ — for `predict_api.py`]
- **Backend version / commit:** [e.g. `main` @ abc1234]

## SDK vs backend

- [ ] This is a **backend** issue (this repo)
- [ ] This might be the **Python SDK** — open on [Bleu.js](https://github.com/HelloblueAI/Bleu.js/issues/new) instead

## Checklist

- [ ] I searched existing issues
- [ ] I can reproduce consistently
- [ ] I included relevant logs or curl commands
