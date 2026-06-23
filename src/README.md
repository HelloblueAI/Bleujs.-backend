# Legacy / experimental services

This tree holds **legacy and experimental** Node services (rules engine, mock AI, MongoDB helpers). They are **not** wired into the production entrypoints.

| Production path | File | Role |
|-----------------|------|------|
| Edge API stub | [`index.mjs`](../index.mjs) | Contract-compliant `/api/v1/*` for local dev and CI |
| ML inference | [`predict_api.py`](../predict_api.py) | `POST /predict` (XGBoost) |

**Do not deploy** anything under `src/` as a standalone service. For architecture, see the main repo [Who serves the API](https://github.com/HelloblueAI/Bleu.js/blob/main/docs/WHO_SERVES_THE_API.md).
