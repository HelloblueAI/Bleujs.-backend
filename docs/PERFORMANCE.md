# Performance Benchmarking Guide

This guide explains how to measure and analyze the performance of the Bleujs.-backend API.

## Quick Start

```bash
# Start the server
npm start

# Run benchmarks (in another terminal)
node tests/benchmark.mjs
```

## Benchmark Tool

The `tests/benchmark.mjs` script measures:

- **Latency:** min, mean, p50, p95, p99, max
- **Throughput:** requests per second
- **Error Rate:** percentage of failed requests

### Usage

```bash
# Default: 1000 requests per endpoint to http://localhost:4003
node tests/benchmark.mjs

# Custom URL
node tests/benchmark.mjs --url https://api.bleujs.org

# Custom request count
node tests/benchmark.mjs --requests 5000

# Both
node tests/benchmark.mjs --url http://localhost:4003 --requests 10000
```

### Example Output

```
🚀 Bleujs.-backend Performance Benchmark
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Base URL: http://localhost:4003
Total Requests: 1000 per endpoint

⏱️  Running benchmarks...

📊 GET /health
─────────────────────────────────────────
  Min:        2.15ms
  Mean:       5.42ms
  p50:        4.87ms
  p95:        8.23ms
  p99:        12.45ms
  Max:        18.32ms
  Throughput: 184.50 req/s
  Error Rate: 0.00%
  Errors:     0/1000

...

✅ Benchmark Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall Statistics:
  Total Requests:  5000
  Total Duration:  27.12s
  Mean Latency:    5.42ms
  p95 Latency:     8.94ms
  p99 Latency:     14.23ms
  Avg Throughput:  184.35 req/s
  Error Rate:      0.00%
```

## Performance Targets

Based on the [Repository Health Report](../REPOSITORY_HEALTH_REPORT.md), these are the target performance characteristics:

### Latency Targets (Mock Endpoints)

| Endpoint | p50 Target | p95 Target | p99 Target |
|----------|------------|------------|------------|
| `GET /health` | <10ms | <20ms | <50ms |
| `GET /api/v1/models` | <10ms | <20ms | <50ms |
| `POST /api/v1/chat` | <100ms | <150ms | <300ms |
| `POST /api/v1/generate` | <100ms | <150ms | <300ms |
| `POST /api/v1/embed` | <200ms | <300ms | <500ms |

### Latency Targets (With XGBoost Inference)

| Endpoint | p50 Target | p95 Target | p99 Target |
|----------|------------|------------|------------|
| `POST /api/v1/chat` | <500ms | <800ms | <1500ms |
| `POST /api/v1/generate` | <500ms | <800ms | <1500ms |
| `POST /api/v1/embed` | <500ms | <800ms | <1500ms |

### Throughput Targets

- **Express.js (single instance):** 1,000-5,000 req/s
- **Cloudflare Workers (edge):** 10,000+ req/s

## Load Testing with k6

For more advanced load testing, use [k6](https://k6.io/):

### Install k6

```bash
# macOS
brew install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
```

### k6 Load Test Script

Create `tests/load.k6.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },  // Ramp up to 100 users
    { duration: '1m', target: 100 },   // Stay at 100 users
    { duration: '30s', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    http_req_failed: ['rate<0.05'],    // Error rate under 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4003';

export default function() {
  // Health check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
  });
  
  // Chat endpoint
  const chatRes = http.post(`${BASE_URL}/api/v1/chat`, JSON.stringify({
    messages: [{ role: 'user', content: 'Hello' }]
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(chatRes, {
    'chat status is 200': (r) => r.status === 200,
    'chat has choices': (r) => JSON.parse(r.body).choices,
  });
  
  sleep(1);
}
```

### Run k6 Load Test

```bash
# Local server
k6 run tests/load.k6.js

# Production server
k6 run -e BASE_URL=https://api.bleujs.org tests/load.k6.js

# Higher load
k6 run -e BASE_URL=http://localhost:4003 --vus 500 --duration 2m tests/load.k6.js
```

## Apache Bench (ab)

Quick load test with Apache Bench:

```bash
# Install ab (usually pre-installed on macOS/Linux)
sudo apt-get install apache2-utils  # Ubuntu/Debian

# Test health endpoint (1000 requests, 10 concurrent)
ab -n 1000 -c 10 http://localhost:4003/health

# Test chat endpoint
ab -n 1000 -c 10 -p chat.json -T application/json http://localhost:4003/api/v1/chat

# Where chat.json contains:
# {"messages":[{"role":"user","content":"Hello"}]}
```

## Profiling

### Node.js Built-in Profiler

```bash
# Start server with profiler
node --prof server.mjs

# Generate report after stopping server
node --prof-process isolate-*.log > profile.txt
cat profile.txt
```

### Chrome DevTools

```bash
# Start server with inspector
node --inspect server.mjs

# Open Chrome DevTools:
# 1. Open chrome://inspect in Chrome
# 2. Click "inspect" under your Node.js process
# 3. Go to "Profiler" tab
# 4. Start profiling
```

### clinic.js

```bash
# Install
npm install -g clinic

# Doctor (overall performance)
clinic doctor -- node server.mjs

# Flame (CPU profiling)
clinic flame -- node server.mjs

# Bubble (I/O profiling)
clinic bubbleprof -- node server.mjs
```

## Monitoring in Production

### Prometheus Metrics

The backend includes `prom-client` for Prometheus metrics:

```javascript
import promClient from 'prom-client';

// Collect default metrics
promClient.collectDefaultMetrics();

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code']
});
```

### Grafana Dashboard

Import the Grafana dashboard template from the main Bleu.js repository:
- [docs/monitoring/grafana-dashboard.json](https://github.com/HelloblueAI/Bleu.js/blob/main/docs/monitoring/grafana-dashboard.json)

## Performance Optimization Tips

### 1. Response Caching

```javascript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Cache embeddings
async function getCachedEmbedding(text) {
  const cached = await redis.get(`embed:${text}`);
  if (cached) return JSON.parse(cached);
  
  const embedding = await generateEmbedding(text);
  await redis.setex(`embed:${text}`, 3600, JSON.stringify(embedding));
  return embedding;
}
```

### 2. Connection Pooling

```javascript
import mongoose from 'mongoose';

// MongoDB connection pooling
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 5,
  socketTimeoutMS: 45000,
});
```

### 3. Request Batching

```python
# xgboost_predict.py
def predict_batch(texts: List[str]) -> List[np.ndarray]:
    """Batch predictions for better performance"""
    features = extract_features_batch(texts)
    return model.predict(features)
```

### 4. Compression

Already enabled via `compression` middleware in Express.

### 5. CDN for Static Assets

Use Cloudflare or similar CDN for serving static assets and caching API responses at the edge.

## Continuous Benchmarking

### GitHub Actions Workflow

Add to `.github/workflows/benchmark.yml`:

```yaml
name: Performance Benchmark

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v5
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm start &
      - run: sleep 5  # Wait for server to start
      - run: node tests/benchmark.mjs --requests 100
      - name: Upload benchmark results
        uses: actions/upload-artifact@v4
        with:
          name: benchmark-results
          path: benchmark-results.json
```

## References

- [Repository Health Report - Performance Section](../REPOSITORY_HEALTH_REPORT.md#performance--scalability)
- [Architecture Documentation](ARCHITECTURE.md)
- [k6 Documentation](https://k6.io/docs/)
- [Prometheus Client for Node.js](https://github.com/siimon/prom-client)
