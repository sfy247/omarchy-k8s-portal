# The Service Contract

The platform runs **any language**. What it needs is a container that behaves
in a few specific ways, so it can be deployed, probed, observed and secured the
same way as every other service. That's the Service Contract.

Every image is **checked against it in CI**, before it's scanned and published:
the check starts the image exactly the way the platform runs it and tests each
rule. A failing image is never deployed, and the run's summary on **CI/CD**
lists which rule failed.

## The rules

| # | Rule | Why the platform needs it | Checked |
|---|---|---|---|
| 1 | Runs as a **non-root user** (the platform uses UID 10001) with a **read-only filesystem**; only `/tmp` is writable; no Linux capabilities | Pod security (`restricted`) | ✅ fails |
| 2 | Listens on port **8080** | Service, HTTPS route, network policy | ✅ fails |
| 3 | `GET /healthz` returns **200** while the process is alive | Kubernetes liveness and readiness probes | ✅ fails |
| 4 | `GET /readyz` returns 200 when it can serve traffic | Readiness (recommended) | ⚠️ warns |
| 5 | `GET /metrics` serves Prometheus text with **`http_requests_total{method,route,status}`** and **`http_request_duration_seconds{method,route}`** (histogram) | Service Health, Operate, alerts | ✅ fails |
| 6 | Logs **one JSON object per line** on stdout, with a **level** (`level`) and a **message** (`msg`) | Log search, level filters, error panels | ✅ fails if no line qualifies; ⚠️ warns on plain lines |
| 7 | Labels metrics by **route template** (`/orders/{id}`), never the raw path | Keeps metrics affordable | review |
| 8 | Has `catalog-info.yaml` with an **owner** and **system** | Discover, Operate, permissions | template |

Rules 7 and 8 come with every template; code review keeps them.

## If your service uses a database

- Read the connection from the standard `PG*` variables the platform sets; log in
  with the client certificate it mounts ([Add a database](add-a-database.md)).
  Never ship credentials in the image.
- `/healthz` must **not** depend on the database: liveness answers "is the
  process alive", and a database outage must not make Kubernetes restart
  healthy pods. `/readyz` may check it.
- Your schema comes from **migrations** in your repo, applied on deploy.

## Request logs: the shape

```json
{"ts": "2026-11-07T10:15:02.120Z", "level": "info", "msg": "request",
 "service": "orders-api", "method": "GET", "path": "/orders/42",
 "route": "/orders/{id}", "status": 200, "duration_ms": 3.1}
```

`level` is one of `debug`, `info`, `warn`, `error`. Any other fields are
searchable in Logs Explorer.

## In your language

You don't need anything exotic; most languages have a library for each rule.

| Language | Metrics (`/metrics`) | JSON logs |
|---|---|---|
| .NET | `prometheus-net`, or the template's `Observability.cs` | `AddJsonConsole` + a request log line |
| Python | `prometheus-client` | `python-json-logger`, or `json.dumps` |
| Node / TypeScript | `prom-client` | `pino` |
| Java | Micrometer (Prometheus registry) | Logback with a JSON encoder |
| Go | `prometheus/client_golang` | `log/slog` with `JSONHandler` |

The metric names must be exactly `http_requests_total` and
`http_request_duration_seconds`, with a `route` label.

## Check it yourself

Before pushing, run the same check locally (Docker and Python needed):

```bash
docker build -t my-service .
curl -sO https://raw.githubusercontent.com/sfy247/omarchy-k8s-portal/main/.github/actions/service-contract/check.sh
bash check.sh my-service
```

## Which template?

- **A golden path** (e.g. **.NET web service**): code that already keeps the
  contract, tests and a tuned Dockerfile. Start here when your language has one.
- **Bring your own container**: any language. Start a new repository from a
  small example that keeps the contract, or bring an existing repository
  (you get a pull request; nothing of yours is overwritten).

Both use the same pipeline after the build: contract check, scan, publish,
deploy by Git.
