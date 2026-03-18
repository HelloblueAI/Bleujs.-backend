# Use Bookworm slim for newer, security-patched system packages (libexpat, sqlite, etc.)
# Pin digest for reproducible builds and Trivy scanning
FROM python:3.11-slim-bookworm@sha256:420310dd2ff7895895f0f1f9d15cae5a95dabceb8f1d6b9a23ef33c2c1c542c3

# Set working directory
WORKDIR /app

# Create non-root user, install deps, apply security upgrades, then clean
RUN useradd -m bleujs && \
    apt-get update && \
    apt-get upgrade -y --no-install-recommends && \
    apt-get install -y --no-install-recommends \
    build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /var/cache/apt/*

# Set environment variables for better compatibility
ENV PYTHONUNBUFFERED=1 \
    PYTHONIOENCODING=UTF-8 \
    LANG=C.UTF-8 \
    PATH="/home/bleujs/.local/bin:$PATH"

# Create .dockerignore if it doesn't exist
# .dockerignore should contain:
# .git
# .env*
# *.pyc
# __pycache__
# .pytest_cache
# .coverage
# .venv
# venv
# logs/
# *.log
# .DS_Store
# .idea/
# .vscode/
# secrets/
# credentials/
# *.key
# *.pem
# node_modules/

# Copy only necessary files (predict_api does not use src/ or config/)
COPY requirements.txt ./
COPY xgboost_predict.py ./
COPY predict_api.py ./
COPY models/ ./models/

# Install dependencies and set permissions in a single layer
RUN pip install --no-cache-dir --upgrade pip==23.3.1 && \
    pip install --no-cache-dir -r requirements.txt && \
    chown -R bleujs:bleujs /app

# Switch to non-root user
USER bleujs

# Run the FastAPI server so Railway gets a process listening on PORT.
# JSON form with sh -c so $PORT is expanded at runtime (Railway sets PORT).
CMD ["sh", "-c", "uvicorn predict_api:app --host 0.0.0.0 --port ${PORT:-8000}"]
