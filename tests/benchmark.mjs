#!/usr/bin/env node
/**
 * Performance benchmark for Bleujs.-backend API
 * Measures latency (p50, p95, p99) and throughput for all endpoints
 * 
 * Usage:
 *   node tests/benchmark.mjs [--url http://localhost:4003] [--requests 1000]
 */

import http from 'http';
import { performance } from 'perf_hooks';

// Parse CLI args
const args = process.argv.slice(2);
const urlIndex = args.indexOf('--url');
const reqIndex = args.indexOf('--requests');

const BASE_URL = urlIndex >= 0 ? args[urlIndex + 1] : 'http://localhost:4003';
const TOTAL_REQUESTS = reqIndex >= 0 ? parseInt(args[reqIndex + 1]) : 1000;

console.log(`\n🚀 Bleujs.-backend Performance Benchmark`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
console.log(`Base URL: ${BASE_URL}`);
console.log(`Total Requests: ${TOTAL_REQUESTS} per endpoint\n`);

// Helper: Make HTTP request and measure latency
async function benchmark(method, path, body = null) {
  const url = new URL(path, BASE_URL);
  const latencies = [];
  const errors = [];
  
  const startTime = performance.now();
  
  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    const reqStart = performance.now();
    
    try {
      const response = await fetch(url.toString(), {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined
      });
      
      if (!response.ok) {
        errors.push({ status: response.status, i });
      }
      
      // Consume response to ensure full latency measurement
      await response.text();
      
      const reqEnd = performance.now();
      latencies.push(reqEnd - reqStart);
    } catch (err) {
      errors.push({ error: err.message, i });
    }
  }
  
  const endTime = performance.now();
  const totalDuration = (endTime - startTime) / 1000; // seconds
  
  return { latencies, errors, totalDuration };
}

// Calculate percentiles
function percentile(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[index];
}

// Calculate statistics
function stats(latencies, totalDuration, errors) {
  if (latencies.length === 0) {
    return { min: 0, max: 0, mean: 0, p50: 0, p95: 0, p99: 0, throughput: 0, errorRate: 1 };
  }
  
  const min = Math.min(...latencies);
  const max = Math.max(...latencies);
  const mean = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const p50 = percentile(latencies, 50);
  const p95 = percentile(latencies, 95);
  const p99 = percentile(latencies, 99);
  const throughput = TOTAL_REQUESTS / totalDuration;
  const errorRate = errors.length / TOTAL_REQUESTS;
  
  return { min, max, mean, p50, p95, p99, throughput, errorRate };
}

// Format number with units
function formatMs(ms) {
  return `${ms.toFixed(2)}ms`;
}

function formatReqPerSec(rps) {
  return `${rps.toFixed(2)} req/s`;
}

// Print results
function printResults(name, result) {
  const s = stats(result.latencies, result.totalDuration, result.errors);
  
  console.log(`\n📊 ${name}`);
  console.log(`─────────────────────────────────────────`);
  console.log(`  Min:        ${formatMs(s.min)}`);
  console.log(`  Mean:       ${formatMs(s.mean)}`);
  console.log(`  p50:        ${formatMs(s.p50)}`);
  console.log(`  p95:        ${formatMs(s.p95)}`);
  console.log(`  p99:        ${formatMs(s.p99)}`);
  console.log(`  Max:        ${formatMs(s.max)}`);
  console.log(`  Throughput: ${formatReqPerSec(s.throughput)}`);
  console.log(`  Error Rate: ${(s.errorRate * 100).toFixed(2)}%`);
  console.log(`  Errors:     ${result.errors.length}/${TOTAL_REQUESTS}`);
}

// Run benchmarks
async function main() {
  try {
    // 1. Health check
    console.log(`\n⏱️  Running benchmarks...`);
    const healthResult = await benchmark('GET', '/health');
    printResults('GET /health', healthResult);
    
    // 2. Models endpoint
    const modelsResult = await benchmark('GET', '/api/v1/models');
    printResults('GET /api/v1/models', modelsResult);
    
    // 3. Chat endpoint
    const chatBody = { messages: [{ role: 'user', content: 'Hello' }] };
    const chatResult = await benchmark('POST', '/api/v1/chat', chatBody);
    printResults('POST /api/v1/chat', chatResult);
    
    // 4. Generate endpoint
    const genBody = { prompt: 'Test prompt' };
    const genResult = await benchmark('POST', '/api/v1/generate', genBody);
    printResults('POST /api/v1/generate', genResult);
    
    // 5. Embed endpoint
    const embedBody = { input: ['test text 1', 'test text 2'] };
    const embedResult = await benchmark('POST', '/api/v1/embed', embedBody);
    printResults('POST /api/v1/embed', embedResult);
    
    // Summary
    console.log(`\n\n✅ Benchmark Complete`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    const allLatencies = [
      ...healthResult.latencies,
      ...modelsResult.latencies,
      ...chatResult.latencies,
      ...genResult.latencies,
      ...embedResult.latencies
    ];
    const allDuration = healthResult.totalDuration + modelsResult.totalDuration + 
                       chatResult.totalDuration + genResult.totalDuration + 
                       embedResult.totalDuration;
    const allErrors = [
      ...healthResult.errors,
      ...modelsResult.errors,
      ...chatResult.errors,
      ...genResult.errors,
      ...embedResult.errors
    ];
    
    const overallStats = stats(allLatencies, allDuration, allErrors);
    
    console.log(`\nOverall Statistics:`);
    console.log(`  Total Requests:  ${TOTAL_REQUESTS * 5}`);
    console.log(`  Total Duration:  ${allDuration.toFixed(2)}s`);
    console.log(`  Mean Latency:    ${formatMs(overallStats.mean)}`);
    console.log(`  p95 Latency:     ${formatMs(overallStats.p95)}`);
    console.log(`  p99 Latency:     ${formatMs(overallStats.p99)}`);
    console.log(`  Avg Throughput:  ${formatReqPerSec(overallStats.throughput)}`);
    console.log(`  Error Rate:      ${(overallStats.errorRate * 100).toFixed(2)}%`);
    console.log(`\n`);
    
    // Exit with error if error rate > 5%
    if (overallStats.errorRate > 0.05) {
      console.error(`❌ Error rate too high: ${(overallStats.errorRate * 100).toFixed(2)}%`);
      process.exit(1);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Benchmark failed:`, err);
    process.exit(1);
  }
}

main();
