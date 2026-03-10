const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const store = getStore('studyos-storage');

  // GET — return all stored data
  if (event.httpMethod === 'GET') {
    try {
      const raw = await store.get('data');
      const data = raw ? JSON.parse(raw) : {};
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    } catch (e) {
      return { statusCode: 200, headers, body: '{}' };
    }
  }

  // POST — merge and save all data
  if (event.httpMethod === 'POST') {
    try {
      const incoming = JSON.parse(event.body || '{}');
      const raw = await store.get('data').catch(() => null);
      const current = raw ? JSON.parse(raw) : {};
      const merged = { ...current, ...incoming };
      await store.set('data', JSON.stringify(merged));
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } catch (e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
};
