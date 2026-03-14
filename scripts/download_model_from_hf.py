#!/usr/bin/env python3
"""
Download the Bleu.js XGBoost model and scaler from Hugging Face Hub.
Run once before starting the prediction API if you don't have local artifacts.

Usage:
    export HF_TOKEN=your_token   # or HUGGINGFACE_HUB_TOKEN
    python scripts/download_model_from_hf.py

Output:
    models/xgboost_model_latest.pkl
    models/scaler_latest.pkl (if present in repo)
"""

import os
import sys

REPO_ID = os.environ.get("HF_REPO_ID", "helloblueai/bleu-xgboost-classifier")
MODEL_FILENAME = os.environ.get("HF_MODEL_FILENAME", "xgboost_model_latest.pkl")
SCALER_FILENAME = "scaler_latest.pkl"


def main() -> int:
    try:
        from huggingface_hub import hf_hub_download
    except ImportError:
        print("Install Hugging Face Hub: pip install huggingface-hub", file=sys.stderr)
        return 1

    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_dir = os.path.join(base, "models")
    os.makedirs(out_dir, exist_ok=True)

    token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_HUB_TOKEN")
    if not token:
        print("Set HF_TOKEN or HUGGINGFACE_HUB_TOKEN to download from a gated repo.", file=sys.stderr)

    try:
        path = hf_hub_download(
            repo_id=REPO_ID,
            filename=MODEL_FILENAME,
            local_dir=out_dir,
            token=token,
        )
        print(f"✅ Model saved to {path}")
    except Exception as e:
        print(f"❌ Failed to download model: {e}", file=sys.stderr)
        return 1

    try:
        path = hf_hub_download(
            repo_id=REPO_ID,
            filename=SCALER_FILENAME,
            local_dir=out_dir,
            token=token,
        )
        print(f"✅ Scaler saved to {path}")
    except Exception:
        print("⚠️ No scaler in repo (optional)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
