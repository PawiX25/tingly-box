# Tingly Box

A CLI tool and server for managing multiple AI model providers with a unified OpenAI-compatible endpoint.

## Features

- **CLI Management**: Add, list, and delete AI provider configurations
- **Interactive Interface**: User-friendly interactive CLI for easy management
- **Web Dashboard**: Simple web interface for configuration and monitoring
- **Unified Endpoint**: Single OpenAI-compatible API endpoint for all providers
- **Dynamic Configuration**: Hot-reload configuration changes without server restart
- **JWT Authentication**: Secure token-based API access
- **Encrypted Storage**: Secure storage of sensitive API tokens
- **Memory Logging**: Persistent operation history and statistics

## Quick Start

### 1. Build the application

```bash
go build ./cmd/tingly
```

### 2. Add an AI provider

```bash
./tingly add openai https://api.openai.com/v1 sk-your-openai-token
./tingly add anthropic https://api.anthropic.com sk-your-anthropic-token
```

### 3. List configured providers

```bash
./tingly list
```

### 4. Generate example and test token

```bash
./tingly example
```

The `example` command generates a JWT token and shows a ready-to-use curl command for testing.

### 5. Start the server

```bash
./tingly start --port 8080
```

### 6. Use the unified API endpoint

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello, world!"}]
  }'
```

## CLI Commands

### Provider Management

- `tingly add <name> <api-base> <token>` - Add a new AI provider
- `tingly list` - List all configured providers
- `tingly delete <name>` - Delete a provider configuration
- `tingly token` - Generate a JWT authentication token
- `tingly example` - Generate example token and curl command for testing
- `tingly interactive` - Enter interactive management mode
- `tingly restart [--port <port>]` - Restart the server

### Server Management

- `tingly start [--port <port>]` - Start the server (default port: 8080)
- `tingly stop` - Stop the running server
- `tingly restart [--port <port>]` - Restart the server
- `tingly status` - Check server status and configuration

### Interactive Management

- `tingly interactive` - Enter interactive mode with menu-driven interface

## Web Interface

Tingly Box also provides a simple web dashboard for configuration management:

```bash
# Start the web interface (on port 9090)
./tingly start --port 9090

# Access the dashboard at
http://localhost:9090
```

### Web Interface Features:

- **Dashboard**: Overview of server status and system information
- **Provider Management**: Add, remove, and view AI providers
- **Server Control**: Start, stop, and restart the server
- **Token Generation**: Generate JWT tokens for API access
- **Activity History**: View recent operations and statistics

## Configuration and Memory

Configuration is stored securely in `~/.tingly-box/config.enc` with encryption based on your hostname.

Tingly Box maintains operation history and system state in the `memory/` directory:

- `memory/history.json` - Complete operation history with timestamps
- `memory/status.json` - Current server status and statistics

### Memory Features:

- **Operation Logging**: All provider and server actions are logged
- **Persistent History**: Operation history persists across restarts
- **Statistics**: Action counts and server metrics
- **Crash Recovery**: System state is preserved for recovery

## API Endpoints

- `GET /health` - Health check
- `POST /token` - Generate JWT token
- `POST /v1/chat/completions` - OpenAI-compatible chat completions (requires authentication)

## Supported Providers

The system is provider-agnostic and works with any OpenAI-compatible API. Provider selection can be:
- Automatic based on model name patterns
- Explicit by adding `provider` parameter to requests

## Development

### Project Structure

```
├── cmd/tingly/          # CLI entry point
├── internal/
│   ├── auth/           # JWT authentication
│   ├── cli/            # CLI command implementations
│   ├── config/         # Configuration management and hot-reload
│   └── server/         # HTTP server and API handlers
├── pkg/utils/          # Server management utilities
└── go.mod              # Go module definition
```

### Build Requirements

- Go 1.25.3+
- See go.mod for full dependency list

### Running Tests

```bash
go test ./...
```

## License

MIT License