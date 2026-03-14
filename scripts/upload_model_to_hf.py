#!/usr/bin/env python3
"""
Upload the trained XGBoost model and optional scaler to Hugging Face Hub.
Run after training (models/xgboost_model_latest.pkl exists).

Usage:
    export HF_TOKEN=your_token
    python scripts/upload_model_to_hf.py
"""

import os
import sys

REPO_ID = os.environ.get("HF_REPO_ID", "helloblueai/bleu-xgboost-classifier")


def _load_env() -> None:
    """Load .env or .env.local from repo root or parent (Bleu.js) if present."""
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for name in (".env.local", ".env"):
        for root in (base, os.path.join(os.path.dirname(base), "Bleu.js")):
            path = os.path.join(root, name)
            if os.path.isfile(path):
                with open(path) as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k, v = k.strip(), v.strip().strip("'\"").strip()
                            if k and os.environ.get(k) is None:
                                os.environ[k] = v
                return


def main() -> int:
    _load_env()
    try:
        from huggingface_hub import HfApi
    except ImportError:
        print("Install: pip install huggingface-hub", file=sys.stderr)
        return 1

    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(base, "models", "xgboost_model_latest.pkl")
    scaler_path = os.path.join(base, "models", "scaler_latest.pkl")

    if not os.path.exists(model_path):
        print(f"❌ Model not found: {model_path}", file=sys.stderr)
        print("   Run: python scripts/generate_training_data.py && python train_xgboost.py", file=sys.stderr)
        return 1

    token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_HUB_TOKEN")
    if not token:
        print("❌ Set HF_TOKEN or HUGGINGFACE_HUB_TOKEN to upload.", file=sys.stderr)
        return 1

    api = HfApi(token=token)
    print(f"📤 Uploading to https://huggingface.co/{REPO_ID}")

    api.upload_file(
        path_or_fileobj=model_path,
        path_in_repo="xgboost_model_latest.pkl",
        repo_id=REPO_ID,
        token=token,
        commit_message="Upload xgboost_model_latest.pkl",
    )
    print("✅ xgboost_model_latest.pkl")

    if os.path.exists(scaler_path):
        api.upload_file(
            path_or_fileobj=scaler_path,
            path_in_repo="scaler_latest.pkl",
            repo_id=REPO_ID,
            token=token,
            commit_message="Upload scaler_latest.pkl",
        )
        print("✅ scaler_latest.pkl")
    else:
        print("⚠️ No scaler_latest.pkl (skipped)")

    print("🎉 Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
