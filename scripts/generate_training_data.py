#!/usr/bin/env python3
"""Generate synthetic training data for XGBoost (when data/training.pkl is missing)."""

import os
import pickle

import numpy as np

np.random.seed(42)
n_samples = 500
n_features = 10
X = np.random.randn(n_samples, n_features).astype(np.float32)
# Simple rule: label 1 if sum of first 3 features > 0
y = (X[:, :3].sum(axis=1) > 0).astype(int)

os.makedirs("data", exist_ok=True)
path = os.path.join("data", "training.pkl")
with open(path, "wb") as f:
    pickle.dump({"features": X, "labels": y}, f)
print(f"✅ Generated {path} ({n_samples} samples, {n_features} features)")
