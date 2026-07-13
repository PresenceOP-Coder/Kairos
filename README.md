# Kairos

**An application-aware chaos engineering proxy with scriptable failure scenarios, for Go.**

> Toxiproxy proved that fault injection at the network layer works. Kairos takes it further: it understands HTTP, lets you script multi-stage failure timelines, and ships with observability built in — not bolted on.

---

## The Problem

Toxiproxy has been the default chaos-testing proxy since Shopify open-sourced it in 2016, and it's still the most widely adopted tool of its kind. But it hasn't meaningfully evolved:

- It only mutates raw bytes — it has no concept of an HTTP request or response, so you can't simulate a `503`, a truncated JSON body, or a malformed header without hand-rolling byte-level hacks.
- It has no built-in metrics. You can't see what chaos was injected, when, or what effect it had, without wiring up your own instrumentation around it.
- Every failure scenario is a single static toxic. Real outages aren't static — latency creeps up, then bandwidth collapses, then the connection drops entirely. There's no way to express *that* as one experiment.
- It requires separate provisioning and lifecycle management from your actual deployment, which adds friction every team has to solve themselves.

Meanwhile, demand for this category of tooling is real and growing — chaos engineering tool adoption on GitHub has grown sharply since 2019, with network fault injection as the single most common use case. The demand curve is going up. The tooling hasn't kept pace.

## What Kairos Does

Kairos is a TCP/HTTP proxy, written in Go, that sits between your service and its dependencies (databases, downstream APIs, caches) and lets you inject failure on demand — either interactively via API, or as a scripted, timed scenario.

**Core capabilities:**

- **Network-layer toxics** — latency, jitter, bandwidth throttling, connection slicing, full partition (the Toxiproxy basics, done well)
- **Application-layer toxics** — inject bad HTTP status codes, corrupt/truncate JSON bodies, strip headers, delay only the response body after headers are sent (things you simply cannot do at the byte layer)
- **Scenario DSL** — describe a failure timeline in YAML: latency at t=0s, bandwidth collapse at t=30s, full partition at t=60s, recovery at t=90s. Chaos experiments become version-controlled files, not manual API calls.
- **Built-in observability** — every toxic application is a Prometheus metric out of the box. See exactly what chaos fired, when, and correlate it against your service's own dashboards.
- **Go-native integration library** — a `pkg/client` package designed to drop into `go test`, so resilience tests run in CI without any external orchestration.

## Who This Is For

- Backend teams who want to prove a dependency outage won't cascade, before it happens in production at 3am
- SRE/platform teams building resilience test suites into CI
- Anyone currently gluing together Toxiproxy + custom scripts + a dashboard nobody trusts, who would rather have one tool that does all three

## Example: A Cascading Failure Scenario

```yaml
name: payments-db-degradation
events:
  - at: 0s
    proxy: payments-db
    action: add_toxic
    toxic: { type: latency, latency_ms: 200, jitter_ms: 50 }

  - at: 30s
    proxy: payments-db
    action: add_toxic
    toxic: { type: bandwidth, rate_kbps: 100 }

  - at: 60s
    proxy: payments-db
    action: disable_proxy   # full partition

  - at: 90s
    proxy: payments-db
    action: enable_proxy    # recovery
```

```bash
kairos run scenario payments-db-degradation.yaml
```

While it runs, your Grafana dashboard shows exactly which toxic was active at which second — no manual note-taking required.

## Architecture at a Glance

```
Client ──▶ Kairos Proxy (data plane) ──▶ Upstream (real service)
              │        ▲
              ▼        │
      Control Plane API + Scenario Engine
              │
              ▼
        Prometheus metrics
```

- **Data plane** — accepts connections, forwards bytes, applies toxics in-line
- **Control plane** — REST/gRPC API to create proxies, attach toxics, launch scenarios
- **Scenario engine** — a timeline scheduler that fires toxic add/remove events at the right offsets
- **HTTP-aware layer** — optional per-proxy protocol setting; when enabled, buffers and parses traffic into `http.Request`/`http.Response` before toxics apply, otherwise stays raw-TCP passthrough (so non-HTTP protocols — Redis, MySQL wire protocol, gRPC — are never penalized by parsing overhead they don't need)

## Tech Stack

- **Language:** Go
- **Storage:** none required for core proxy (stateless); optional BoltDB for persisting scenario run history
- **Metrics:** Prometheus client library
- **API:** REST (net/http) with optional gRPC control plane
- **Config/DSL:** YAML

## Roadmap

| Phase | Scope |
|---|---|
| **v0.1** | Core TCP passthrough proxy, latency + bandwidth toxics, minimal REST API |
| **v0.2** | HTTP-aware toxics (status injection, body corruption, header stripping) |
| **v0.3** | Scenario DSL + timeline engine |
| **v0.4** | Prometheus metrics, Grafana dashboard template |
| **v0.5** | Go client library with `go test` integration helpers, docs, examples |
| **v1.0** | Stability pass, benchmark suite, launch (Awesome-Go, HN, r/golang) |

## Why This Project

Fault injection tooling hasn't kept pace with how teams actually operate resilience testing — most already know *that* they need to test failure modes, but the tools force them to write throwaway scripts to express anything beyond "add one static delay." Kairos's bet is narrow and specific: application-layer awareness and scriptable timelines are the two gaps practitioners hit first, and closing them doesn't require competing on breadth — just depth where Toxiproxy stopped.

## License

MIT (recommended — matches the ecosystem convention and maximizes adoption/contribution).

---

*Status: pre-alpha, actively in development.*
