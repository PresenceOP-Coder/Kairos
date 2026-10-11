# Kairos

**A scriptable TCP chaos engineering proxy with timed failure scenarios, REST control API, and React web dashboard.**

Kairos sits between your application and its dependencies (databases, external APIs, caches, microservices) to simulate realistic network failures on demand—either dynamically via its REST API or automatically via scripted timeline scenarios.

---

## Verified Features

- **Full-Duplex TCP Proxy**: High-performance bidirectional streaming relay with graceful TCP half-close (`CloseWrite`) support.
- **6 Configurable Chaos Toxics**:
  - **Latency**: Fixed delay injected into the stream.
  - **Jitter**: Randomized latency jitter between configured minimum and maximum bounds.
  - **Bandwidth Throttling**: Chunked rate limiting simulating slow connections (KB/s).
  - **Connection Reset**: Abrupt TCP connection drops after a configurable timeout.
  - **Packet Loss**: Probabilistic write drops (percentage 0–100%).
  - **Blackhole**: Network partition simulation where writes hang indefinitely.
- **Scriptable Timeline Scenarios**: Define multi-stage failure progressions in JSON (e.g. latency at t=0s, collapse at t=10s, recovery).
- **Conditional Triggers**: Apply chaos selectively to specific traffic (e.g. inject faults only on `every_nth_connection`).
- **Live REST Control Plane**: Inspect active connections, monitor traffic statistics, and adjust chaos settings at runtime.
- **React Telemetry Dashboard**: Modern web UI built with React 19, Vite, and TailwindCSS for real-time monitoring and chaos control.
- **Container Ready**: Production Dockerfiles and Docker Compose configuration for immediate deployment.

---

## Architecture Overview

```
[TCP Client / App] ──▶ Kairos Proxy (:9000) ──▶ Target Service (:9001)
                              │
         ┌────────────────────┴────────────────────┐
         ▼                                         ▼
   REST Control API (:8080)                Scenario Engine
         ▲
         │
   React Dashboard (:5173)
```

- **Data Plane (`internal/proxy`)**: Accepts client connections on port `9000`, establishes an upstream connection to the target server, and wraps both streams with active chaos middleware.
- **Control Plane (`internal/api`)**: Exposes REST endpoints on port `8080` for health checks, connection telemetry, atomic metric snapshots, and live latency adjustments.
- **Scenario Engine (`internal/scenario`)**: Loads scenario timelines from JSON and asynchronously applies staged faults through thread-safe configuration setters.
- **Web Dashboard (`web/`)**: React 19 single-page application communicating with the control plane to display metrics, active TCP sessions, and interactive controls.

---

## Prerequisites

- **Go**: 1.24 or higher
- **Node.js**: 20 or higher with `npm` (for the dashboard)
- **Docker & Docker Compose**: (Optional, for running containerized services)

---

## Local Quick Start

### 1. Start the Echo Target Server
In a new terminal, run the mock echo target server (listens on `127.0.0.1:9001`):
```bash
go run ./examples/target-server
```

### 2. Start Kairos with a Scenario
In a second terminal, launch Kairos with a scenario file:
```bash
go run ./cmd/kairos run scenarios/latency-after-5s.json
```
Kairos starts listening on `:9000` (proxy) and `:8080` (control API).

### 3. Send Traffic Through the Proxy
In a third terminal, connect using the example TCP client:
```bash
go run ./examples/tcp-client
```
Type messages into the client. For the first 5 seconds, responses echo back instantly (~1ms). After 5 seconds, the scheduled scenario triggers, and responses exhibit the 500ms delay.

### 4. Start the Web Dashboard
```bash
cd web
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view system health, active TCP connections, and interactively toggle chaos.

---

## Docker Compose Quick Start

To run Kairos and the target server together in Docker containers:

```bash
docker compose up -d
```

Verify services are running:
```bash
docker compose ps
curl http://localhost:8081/health
```

Stop the containers when finished:
```bash
docker compose down
```

---

## Scenario Format

Scenarios are defined in JSON and support both initial baseline conditions and timed steps.

### Example 1: Timed Step Latency (`scenarios/latency-after-5s.json`)
```json
{
  "steps": [
    {
      "after": "5s",
      "latency": {
        "enabled": true,
        "delay_ms": 500
      }
    }
  ]
}
```

### Example 2: Mobile 3G Simulation (`scenarios/mobile-3g.json`)
```json
{
  "latency": {
    "enabled": true,
    "delay_ms": 500
  },
  "jitter": {
    "enabled": true,
    "min_ms": 100,
    "max_ms": 400
  },
  "bandwidth": {
    "enabled": true,
    "rate_kbps": 100
  },
  "reset": {
    "enabled": false,
    "after_seconds": 10
  }
}
```

### Example 3: Conditional Every Nth Connection (`scenarios/every-5th-connection.json`)
```json
{
  "trigger": {
    "every_nth_connection": 5
  },
  "latency": {
    "enabled": true,
    "delay_ms": 500
  }
}
```

---

## CLI Usage

```bash
# Run Kairos with a scenario
kairos run <path/to/scenario.json>
```

### Environment Variables
- `KAIROS_TARGET`: Target host and port for the proxy upstream (default: `localhost:9001`).

---

## REST API Reference

The control API runs on port `8080` (or `8081` in Docker Compose).

### `GET /health`
Returns the operational health of the proxy.
```json
{
  "status": "ok"
}
```

### `GET /stats`
Returns an atomic snapshot of proxy traffic and connection metrics.
```json
{
  "total_connections": 42,
  "active_connections": 1,
  "failed_connections": 0,
  "bytes_sent": 8420,
  "bytes_received": 8420
}
```

### `GET /connections`
Returns an array of currently active TCP sessions.
```json
[
  {
    "id": 1,
    "client": "127.0.0.1:54321",
    "target": "127.0.0.1:9001",
    "uptime": "14.2s"
  }
]
```

### `GET /chaos`
Retrieves current runtime chaos configuration.
```json
{
  "latency_enabled": true,
  "latency_delay_ms": 200
}
```

### `POST /chaos/latency`
Updates latency fault injection settings at runtime.
```json
// Request Body:
{
  "enabled": true,
  "delay_ms": 200
}

// Response:
{
  "status": "updated"
}
```

---

## Running Tests

### Go Backend Tests
```bash
# Run tests with code coverage
go test ./... -cover

# Run tests with race detection (Linux / 64-bit CGO)
go test ./... -race -cover
```

### Frontend Tests
```bash
cd web

# Linting (oxlint)
npm run lint

# Unit tests (vitest)
npm run test

# Production build
npm run build
```

### Playwright E2E Tests
To run full-stack end-to-end tests including live TCP proxy validation:
```bash
# Terminal 1: Start the automated test server (echo + proxy + API)
go run ./cmd/test-server

# Terminal 2: Run Playwright
cd web
npx playwright test
```

---

## Known Limitations & Security Considerations

1. **Authentication**: The control API (`:8080`) has no built-in authentication and is designed for local development, CI test suites, and private container networks. Do not expose `:8080` to public networks without a secure reverse proxy.
2. **Fixed Port Defaults**: The data plane binds to `:9000` and control API binds to `:8080`. Target destination is configurable via `KAIROS_TARGET`.
3. **Scenario Format**: Scenarios must be valid JSON matching the schema documented above.

---

## Roadmap

- **v1.1**: HTTP protocol awareness with status code mutation and header injection (`internal/httpaware`).
- **v1.2**: Native Prometheus `/metrics` exporter endpoint.
- **v1.3**: YAML scenario format support.
- **v1.4**: First-class Go integration library (`pkg/client`) for in-process `go test` resilience suites.

---

## License

MIT License. Copyright (c) 2026 Shreyas Prajapati. See [LICENSE](LICENSE) for details.
