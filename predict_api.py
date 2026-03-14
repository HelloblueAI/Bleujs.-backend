import logging
import os
from typing import List

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Logging setup
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

# Initialize FastAPI app
app = FastAPI(title="Bleu.js AI Prediction API", version="1.0")

# Load the model safely; align with xgboost_predict.py paths (XGBoost 3.x)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.environ.get("MODEL_DIR", os.path.join(BASE_DIR, "models"))
_MODEL_PATHS = [
    os.environ.get("MODEL_PATH", os.path.join(MODEL_DIR, "xgboost_model_latest.pkl")),
    os.path.join(BASE_DIR, "xgboost_model.pkl"),
    os.path.join(MODEL_DIR, "xgboost_model.pkl"),
]
MODEL_PATH = next((p for p in _MODEL_PATHS if os.path.exists(p)), _MODEL_PATHS[0])

if not os.path.exists(MODEL_PATH):
    logging.error(
        "❌ Model file not found. Place one at models/xgboost_model_latest.pkl or run: "
        "python scripts/download_model_from_hf.py"
    )
    raise FileNotFoundError(
        f"❌ Model file not found. Tried: {', '.join(_MODEL_PATHS)}"
    )

try:
    model = joblib.load(MODEL_PATH)
    expected_features = model.get_booster().num_features()
    logging.info(
        f"✅ Model loaded from {MODEL_PATH} (expected features: {expected_features})"
    )
except Exception as e:
    logging.error(f"❌ Failed to load model: {str(e)}")
    raise RuntimeError(f"❌ Failed to load model: {str(e)}")


# Define input schema for FastAPI
class PredictionInput(BaseModel):
    features: List[float]


@app.post("/predict")
async def predict(input_data: PredictionInput):
    """Make predictions using the XGBoost model."""
    try:
        features_array = np.array(input_data.features, dtype=np.float32)

        # Validate feature shape
        if features_array.shape[0] < expected_features:
            return {
                "error": f"❌ Too few features: expected {expected_features}, "
                f"got {features_array.shape[0]}"
            }

        elif features_array.shape[0] > expected_features:
            return {
                "error": f"❌ Too many features: expected {expected_features}, "
                f"got {features_array.shape[0]}"
            }

        features_array = features_array.reshape(1, -1)

        # Make prediction
        prediction = model.predict(features_array)
        prediction_prob = model.predict_proba(features_array)

        logging.info(
            f"🔮 Prediction: {prediction.tolist()}, "
            f"Confidence: {prediction_prob.tolist()}"
        )

        return {
            "prediction": int(prediction[0]),
            "confidence": float(max(prediction_prob[0])),
        }
    except Exception as e:
        logging.error(f"❌ Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "🚀 Bleu.js AI Prediction API is running!"}
