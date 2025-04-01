#!/usr/bin/env node

const http = require('http');
const axios = require('axios');

const API_KEY = process.env.PERPLEXITY_API_KEY;
const PORT = process.env.MCP_SERVER_PORT || 3000;
const MODE = process.env.MCP_MODE || 'ask';

if (!API_KEY) {
  console.error('Error: PERPLEXITY_API_KEY environment variable is required');
  process.exit(1);
}

// Configure Perplexity API
const perplexityAPI = axios.create({
  baseURL: 'https://api.perplexity.ai',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

async function askPerplexity(query) {
  try {
    const response = await perplexityAPI.post('/chat/completions', {
      model: 'pplx-70b-online',
      messages: [{ role: 'user', content: query }],
      max_tokens: 4000
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Perplexity API error:', error.response?.data || error.message);
    throw new Error('Failed to get response from Perplexity API');
  }
}

async function searchPerplexity(query) {
  try {
    const response = await perplexityAPI.post('/search', {
      query: query,
      focus: 'internet',
      simplify_response: false
    });
    
    return response.data;
  } catch (error) {
    console.error('Perplexity API error:', error.response?.data || error.message);
    throw new Error('Failed to get search results from Perplexity API');
  }
}

// Create MCP Server
const server = http.createServer(async (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const jsonRPC = JSON.parse(body);
        const { method, params, id } = jsonRPC;

        // Handle JSON-RPC methods
        if (method === 'ask' && MODE === 'ask') {
          const result = await askPerplexity(params[0]);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ jsonrpc: '2.0', result, id }));
        } else if (method === 'search' && MODE === 'search') {
          const result = await searchPerplexity(params[0]);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ jsonrpc: '2.0', result, id }));
        } else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            error: { code: -32601, message: `Method ${method} not supported in ${MODE} mode` },
            id
          }));
        }
      } catch (error) {
        res.statusCode = 200; // JSON-RPC still uses 200 for errors
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          error: { code: -32000, message: error.message },
          id: body.id || null
        }));
      }
    });
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`MCP Perplexity server (${MODE} mode) running on port ${PORT}`);
});