"""Bleu.js XGBoost prediction API (production ML path).

Deploy this FastAPI app for POST /predict. Chat, generate, and embed are served
by bleujs.org (Next.js), not this service.
"""

import logging
import os
from hmac import compare_digest
from typing import List

import joblib
import numpy as np
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Logging setup
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

# Initialize FastAPI app
def _is_production_env() -> bool:
    for name in ("NODE_ENV", "ENV"):
        value = os.environ.get(name, "").lower()
        if value in ("production", "prod"):
            return True
    return False


_PRODUCTION = _is_production_env()
MAX_PREDICT_BODY_BYTES = int(os.environ.get("MAX_PREDICT_BODY_BYTES", 1024 * 1024))
app = FastAPI(
    title="Bleu.js AI Prediction API",
    version="1.0",
    docs_url=None if _PRODUCTION else "/docs",
    redoc_url=None if _PRODUCTION else "/redoc",
    openapi_url=None if _PRODUCTION else "/openapi.json",
)


def _configured_api_keys() -> List[str]:
    raw = (
        os.environ.get("PREDICT_API_KEYS")
        or os.environ.get("PREDICT_API_KEY")
        or os.environ.get("BLEU_API_KEYS")
        or os.environ.get("BLEU_API_KEY")
        or ""
    )
    return [key.strip() for key in raw.split(",") if key.strip()]


def _bearer_token(authorization: str | None) -> str:
    if not authorization:
        return ""
    scheme, _, token = authorization.partition(" ")
    return token.strip() if scheme.lower() == "bearer" else ""


async def require_api_key(
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
) -> None:
    configured_keys = _configured_api_keys()
    if not configured_keys:
        if _PRODUCTION:
            raise HTTPException(
                status_code=503, detail="API authentication is not configured"
            )
        return

    supplied_key = x_api_key or _bearer_token(authorization)
    if not supplied_key or not any(compare_digest(supplied_key, key) for key in configured_keys):
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.middleware("http")
async def enforce_predict_body_limit(request: Request, call_next):
    if request.url.path != "/predict" or request.method not in ("POST", "PUT", "PATCH"):
        return await call_next(request)

    content_length = request.headers.get("content-length")
    if content_length is not None:
        try:
            if int(content_length) > MAX_PREDICT_BODY_BYTES:
                return JSONResponse(
                    status_code=413,
                    content={"detail": "Request body too large"},
                )
        except ValueError:
            return JSONResponse(
                status_code=400,
                content={"detail": "Invalid Content-Length header"},
            )

    body = bytearray()
    async for chunk in request.stream():
        body.extend(chunk)
        if len(body) > MAX_PREDICT_BODY_BYTES:
            return JSONResponse(
                status_code=413,
                content={"detail": "Request body too large"},
            )

    async def receive():
        return {"type": "http.request", "body": bytes(body), "more_body": False}

    limited_request = Request(request.scope, receive)
    return await call_next(limited_request)

# Load the model safely; align with xgboost_predict.py paths (XGBoost 3.x)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.realpath(os.environ.get("MODEL_DIR", os.path.join(BASE_DIR, "models")))


def _resolve_path(path: str) -> str:
    """Resolve relative paths from the repo/app root for predictable deployment."""
    return os.path.realpath(path if os.path.isabs(path) else os.path.join(BASE_DIR, path))


def _validate_trusted_path(path: str, allowed_roots: List[str]) -> str:
    resolved = _resolve_path(path)
    trusted_roots = [_resolve_path(root) for root in allowed_roots]
    if not any(os.path.commonpath([resolved, root]) == root for root in trusted_roots):
        raise ValueError(
            f"Refusing to load artifact outside trusted directories: {resolved}"
        )
    return resolved


def _select_artifact_path(
    env_name: str, default_path: str, fallback_paths: List[str] | None = None
) -> str:
    env_value = os.environ.get(env_name)
    if env_value:
        return _validate_trusted_path(env_value, [MODEL_DIR])

    paths = [default_path, *(fallback_paths or [])]
    return next((path for path in paths if os.path.exists(path)), paths[0])


_MODEL_PATHS = [
    _select_artifact_path(
        "MODEL_PATH", os.path.join(MODEL_DIR, "xgboost_model_latest.pkl")
    ),
    os.path.join(MODEL_DIR, "xgboost_model.pkl"),
]
MODEL_PATH = next((p for p in _MODEL_PATHS if os.path.exists(p)), _MODEL_PATHS[0])
SCALER_PATH = _select_artifact_path(
    "SCALER_PATH", os.path.join(MODEL_DIR, "scaler_latest.pkl")
)

if not os.path.exists(MODEL_PATH):
    logging.error(
        "Model file not found. Place one at models/xgboost_model_latest.pkl or run: "
        "python scripts/download_model_from_hf.py"
    )
    raise FileNotFoundError(
        f"Model file not found. Tried: {', '.join(_MODEL_PATHS)}"
    )

try:
    model = joblib.load(MODEL_PATH)
    expected_features = model.get_booster().num_features()
    logging.info(
        f"Model loaded from {MODEL_PATH} (expected features: {expected_features})"
    )
except Exception as e:
    logging.error(f"Failed to load model: {str(e)}")
    raise RuntimeError(f"Failed to load model: {str(e)}")

try:
    scaler = joblib.load(SCALER_PATH) if os.path.exists(SCALER_PATH) else None
    if scaler is not None:
        logging.info(f"Scaler loaded from {SCALER_PATH}")
    else:
        logging.warning(f"Scaler file not found at {SCALER_PATH}; using raw features")
except Exception as e:
    logging.error(f"Failed to load scaler: {str(e)}")
    raise RuntimeError(f"Failed to load scaler: {str(e)}")


# Define input schema for FastAPI
class PredictionInput(BaseModel):
    features: List[float] = Field(..., min_length=1, max_length=expected_features)


@app.post("/predict", dependencies=[Depends(require_api_key)])
async def predict(input_data: PredictionInput):
    """Make predictions using the XGBoost model."""
    try:
        features_array = np.array(input_data.features, dtype=np.float32)
        if features_array.ndim != 1:
            raise HTTPException(
                status_code=422, detail="features must be a one-dimensional list"
            )
        if not np.isfinite(features_array).all():
            raise HTTPException(
                status_code=422, detail="features must not contain NaN or Infinity"
            )

        # Validate feature shape
        if features_array.shape[0] != expected_features:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"expected {expected_features} feature(s), "
                    f"got {features_array.shape[0]}"
                ),
            )

        features_array = features_array.reshape(1, -1)
        if scaler is not None:
            features_array = scaler.transform(features_array)

        # Make prediction
        prediction = model.predict(features_array)
        prediction_prob = model.predict_proba(features_array)

        logging.info(
            "Prediction completed with confidence %.4f",
            float(max(prediction_prob[0])),
        )

        return {
            "prediction": int(prediction[0]),
            "confidence": float(max(prediction_prob[0])),
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Prediction error")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "Bleu.js AI Prediction API is running!"}
