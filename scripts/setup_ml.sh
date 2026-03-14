#!/usr/bin/env bash
# One-time ML setup: create venv, install deps, optionally download model from Hugging Face.
# Usage: ./scripts/setup_ml.sh [--download]
# Set HF_REPO_ID and HF_TOKEN (if repo is gated) before running with --download.

set -e
cd "$(dirname "$0")/.."

if [[ ! -d .venv ]]; then
  python3 -m venv .venv
  echo "✅ Created .venv"
fi
.venv/bin/pip install -q -r requirements-hf.txt
echo "✅ Installed requirements (XGBoost 3.x + huggingface-hub)"

if [[ "${1:-}" == "--download" ]]; then
  .venv/bin/python scripts/download_model_from_hf.py
  echo "✅ Model ready in models/"
else
  echo "Tip: run with --download to fetch the model from Hugging Face (set HF_REPO_ID and HF_TOKEN if needed)."
fi
