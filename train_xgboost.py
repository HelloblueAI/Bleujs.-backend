"""Script to train XGBoost model."""

import os
import pickle
from typing import Any, Dict, Tuple

import numpy as np
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier


def load_data(data_path: str) -> Tuple[np.ndarray, np.ndarray]:
    """Load training data.

    Args:
        data_path: Path to training data file

    Returns:
        Tuple of (features, labels)
    """
    with open(data_path, "rb") as f:
        data = pickle.load(f)
    return data["features"], data["labels"]


def train_xgboost(
    features: np.ndarray, labels: np.ndarray, params: Dict[str, Any]
) -> XGBClassifier:
    """Train XGBoost model.

    Args:
        features: Training features
        labels: Training labels
        params: Model parameters

    Returns:
        Trained XGBoost model
    """
    # Split data
    X_train, X_val, y_train, y_val = train_test_split(
        features, labels, test_size=0.2, random_state=42
    )

    # Train model (XGBoost 3.x: early_stopping_rounds in constructor)
    model = XGBClassifier(**params, early_stopping_rounds=10)
    model.fit(
        X_train,
        y_train,
        eval_set=[(X_val, y_val)],
        verbose=False,
    )

    return model


def main() -> None:
    """Main function."""
    # Load data
    data_path = "data/training.pkl"
    features, labels = load_data(data_path)

    # Train model
    params = {
        "max_depth": 6,
        "learning_rate": 0.1,
        "n_estimators": 100,
        "objective": "binary:logistic",
        "random_state": 42,
    }
    model = train_xgboost(features, labels, params)

    # Save model (pkl for HF/backend compatibility; optional .json for native xgb)
    os.makedirs("models", exist_ok=True)
    pkl_path = os.path.join("models", "xgboost_model_latest.pkl")
    with open(pkl_path, "wb") as f:
        pickle.dump(model, f)
    with open(os.path.join("models", "xgboost.pkl"), "wb") as f:
        pickle.dump(model, f)

    print("✅ XGBoost model trained and saved successfully!")
    print(f"   → {pkl_path} (use this for Hugging Face upload)")


if __name__ == "__main__":
    main()
