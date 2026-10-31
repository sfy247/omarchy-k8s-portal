# ${{ values.name }}

${{ values.description }}

## Endpoints

| Path | Purpose |
|---|---|
| `/` | Hello response |
| `/healthz` | Liveness probe |
| `/readyz` | Readiness probe |
| `/metrics` | Request metrics for Prometheus (`Observability.cs`) |
{%- if values.database %}
| `/db` | Shows whether database settings are loaded |
{%- endif %}

## How it ships

1. Push to `main`. CI builds, tests, scans the image, and pushes
   `ghcr.io/<owner>/<repo>:sha-<commit>`.
2. Argo CD Image Updater sees the new tag and commits it to this service's
   `values-dev.yaml` in the platform repo.
3. Argo CD deploys it to the dev cluster.

## Observability

This service is observed from its first deploy, with no setup:

- **Metrics**: `http_requests_total` and `http_request_duration_seconds`,
  labelled by route template (e.g. `/orders/{id}`). The platform scrapes
  `/metrics` and the service appears on Grafana's **Applications → Service
  Health** dashboard (pick app `${{ values.name }}`).
- **Logs**: one JSON line per request (`level`, `method`, `route`, `status`,
  `duration_ms`). Search them in **Logs → Logs Explorer**. Write your own with
  `Observability.Log("info", "order created", new() { ["order_id"] = id })`.
- **Alerts**: more than 5% errors, p95 latency above 1s, or the service down
  fire automatically, each linking to the dashboard that explains it.

Keep request handling inside routes (`app.MapGet(...)`), so metrics stay
labelled by route.

## Run locally

```bash
dotnet run --project src/${{ values.name }}
curl localhost:5000/healthz
```
