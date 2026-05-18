/**
 * Unit tests for index.mjs (API handler)
 * Tests all endpoints and error handling
 * Run: npm run test:unit
 */

import { describe, test, expect, beforeAll } from '@jest/globals';

// Import the handler
let handler;
beforeAll(async () => {
  const base = await import('../index.mjs');
  handler = base.default?.fetch ?? base.fetch;
});

describe('API Handler - Health Endpoints', () => {
  test('GET / returns 200 with backend ready message', async () => {
    const req = new Request('http://localhost/', { method: 'GET' });
    const res = await handler(req, {}, {});
    
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('Backend Ready');
  });

  test('GET /health returns healthy status', async () => {
    const req = new Request('http://localhost/health', { method: 'GET' });
    const res = await handler(req, {}, {});
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('healthy');
    expect(json.version).toBe('1.0');
  });

  test('OPTIONS request returns 204 with CORS headers', async () => {
    const req = new Request('http://localhost/api/v1/chat', { method: 'OPTIONS' });
    const res = await handler(req, {}, {});
    
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });
});

describe('API Handler - Models Endpoint', () => {
  test('GET /api/v1/models returns list of models', async () => {
    const req = new Request('http://localhost/api/v1/models', { method: 'GET' });
    const res = await handler(req, {}, {});
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.data[0]).toHaveProperty('id');
    expect(json.data[0]).toHaveProperty('object');
  });

  test('Models list includes expected model IDs', async () => {
    const req = new Request('http://localhost/api/v1/models', { method: 'GET' });
    const res = await handler(req, {}, {});
    const json = await res.json();
    
    const modelIds = json.data.map(m => m.id);
    expect(modelIds).toContain('bleu-1');
    expect(modelIds).toContain('bleu-chat-1');
    expect(modelIds).toContain('bleu-embed');
  });
});

describe('API Handler - Chat Endpoint', () => {
  test('POST /api/v1/chat with valid messages returns chat completion', async () => {
    const body = {
      messages: [{ role: 'user', content: 'Hello' }]
    };
    const req = new Request('http://localhost/api/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const res = await handler(req, {}, {});
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.choices).toBeDefined();
    expect(json.choices[0].message).toBeDefined();
    expect(json.choices[0].message.role).toBe('assistant');
    expect(typeof json.choices[0].message.content).toBe('string');
  });

  test('POST /api/v1/chat with empty messages returns default response', async () => {
    const body = { messages: [] };
    const req = new Request('http://localhost/api/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const res = await handler(req, {}, {});
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.choices[0].message.content).toContain('How can I help?');
  });

  test('POST /api/v1/chat with invalid JSON returns 200 with default', async () => {
    const req = new Request('http://localhost/api/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json'
    });
    const res = await handler(req, {}, {});
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.choices).toBeDefined();
  });

  test('POST /api/v1/chat echoes user message in response', async () => {
    const userMessage = 'Test message for echo';
    const body = {
      messages: [{ role: 'user', content: userMessage }]
    };
    const req = new Request('http://localhost/api/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const res = await handler(req, {}, {});
    const json = await res.json();
    
    expect(json.choices[0].message.content).toContain(userMessage);
  });
});

describe('API Handler - Generate Endpoint', () => {
  test('POST /api/v1/generate with prompt returns generated text', async () => {
    const body = { prompt: 'Test prompt' };
    const req = new Request('http://localhost/api/v1/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const res = await handler(req, {}, {});
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.text).toBeDefined();
    expect(typeof json.text).toBe('string');
    expect(json.id).toBeDefined();
    expect(json.id).toMatch(/^gen-\d+$/);
    expect(json.model).toBeDefined();
    expect(json.usage).toBeDefined();
    expect(json.finish_reason).toBe('stop');
  });

  test('POST /api/v1/generate with custom model returns model in response', async () => {
    const body = { prompt: 'Test', model: 'bleu-2' };
    const req = new Request('http://localhost/api/v1/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const res = await handler(req, {}, {});
    const json = await res.json();
    
    expect(json.model).toBe('bleu-2');
  });

  test('POST /api/v1/generate without prompt returns default text', async () => {
    const body = {};
    const req = new Request('http://localhost/api/v1/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const res = await handler(req, {}, {});
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.text).toContain('Generated response');
  });

  test('POST /api/v1/generate echoes prompt in response', async () => {
    const prompt = 'Specific test prompt';
    const body = { prompt };
    const req = new Request('http://localhost/api/v1/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const res = await handler(req, {}, {});
    const json = await res.json();
    
    expect(json.text).toContain(prompt);
  });
});

describe('API Handler - Embed Endpoint', () => {
  test('POST /api/v1/embed with input array returns embeddings', async () => {
    const body = { input: ['text1', 'text2'] };
    const req = new Request('http://localhost/api/v1/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const res = await handler(req, {}, {});
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBe(2);
    expect(json.data[0].embedding).toBeDefined();
    expect(Array.isArray(json.data[0].embedding)).toBe(true);
    expect(json.data[0].embedding.length).toBe(384);
    expect(json.data[0].index).toBe(0);
  });

  test('POST /api/v1/embed supports inputs field', async () => {
    const body = { inputs: ['test'] };
    const req = new Request('http://localhost/api/v1/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const res = await handler(req, {}, {});
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBe(1);
  });

  test('POST /api/v1/embed supports texts field', async () => {
    const body = { texts: ['test'] };
    const req = new Request('http://localhost/api/v1/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const res = await handler(req, {}, {});
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBe(1);
  });

  test('POST /api/v1/embed with custom model returns model in response', async () => {
    const body = { input: ['test'], model: 'custom-embed' };
    const req = new Request('http://localhost/api/v1/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const res = await handler(req, {}, {});
    const json = await res.json();
    
    expect(json.model).toBe('custom-embed');
  });

  test('POST /api/v1/embed returns usage information', async () => {
    const body = { input: ['test'] };
    const req = new Request('http://localhost/api/v1/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const res = await handler(req, {}, {});
    const json = await res.json();
    
    expect(json.usage).toBeDefined();
    expect(json.usage.prompt_tokens).toBeDefined();
    expect(json.usage.total_tokens).toBeDefined();
  });
});

describe('API Handler - Error Handling', () => {
  test('Unknown route returns 404', async () => {
    const req = new Request('http://localhost/unknown', { method: 'GET' });
    const res = await handler(req, {}, {});
    
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('Not Found');
    expect(json.code).toBe('NOT_FOUND');
  });

  test('All responses include CORS headers', async () => {
    const req = new Request('http://localhost/health', { method: 'GET' });
    const res = await handler(req, {}, {});
    
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  test('All responses include Content-Type header', async () => {
    const req = new Request('http://localhost/health', { method: 'GET' });
    const res = await handler(req, {}, {});
    
    expect(res.headers.get('Content-Type')).toBeDefined();
  });
});

describe('API Handler - CORS', () => {
  test('CORS headers present on GET requests', async () => {
    const req = new Request('http://localhost/health', { method: 'GET' });
    const res = await handler(req, {}, {});
    
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('GET');
  });

  test('CORS headers present on POST requests', async () => {
    const req = new Request('http://localhost/api/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] })
    });
    const res = await handler(req, {}, {});
    
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  test('CORS preflight OPTIONS request handled', async () => {
    const req = new Request('http://localhost/api/v1/generate', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'POST'
      }
    });
    const res = await handler(req, {}, {});
    
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    expect(res.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type');
  });
});
