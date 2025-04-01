# MCP Perplexity Server

A Model Context Protocol (MCP) server implementation for the Perplexity API.

## Features

- Supports both Ask and Search modes
- Simple configuration via environment variables
- Direct integration with MCP clients

## Installation

You can use this server directly from GitHub in your MCP configuration:

```json
{
  "perplexity-ask": {
    "command": "npx",
    "args": [
      "-y",
      "github:lostmind008/mcp-perplexity-server"
    ],
    "env": {
      "PERPLEXITY_API_KEY": "your-api-key",
      "MCP_SERVER_PORT": "3000",
      "MCP_MODE": "ask"
    }
  },
  "perplexity-search": {
    "command": "npx",
    "args": [
      "-y",
      "github:lostmind008/mcp-perplexity-server"
    ],
    "env": {
      "PERPLEXITY_API_KEY": "your-api-key",
      "MCP_SERVER_PORT": "3001",
      "MCP_MODE": "search"
    }
  }
}
```

## Environment Variables

- `PERPLEXITY_API_KEY`: Your Perplexity API key (required)
- `MCP_SERVER_PORT`: Port for the MCP server (default: 3000)
- `MCP_MODE`: Server mode - 'ask' or 'search' (default: 'ask')

## Usage

Once configured, you can use this server with any MCP client by specifying the appropriate server name:

```
perplexity-ask "What is the capital of France?"
perplexity-search "Best programming languages 2025"
```

## License

MIT