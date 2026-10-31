# ${{ values.name }}

Created from a developer portal template.

## Platform contract for services

Every service template must produce a service that:

- serves `GET /healthz` (liveness) and `GET /metrics` with
  `http_requests_total{method,route,status}` and
  `http_request_duration_seconds{method,route}` (route = route template, never
  the raw path)
- writes one JSON object per line to stdout with at least `ts`, `level`, `msg`
- sets `metrics.enabled: true` in its platform values

Then dashboards, logs and alerts work without any extra setup. See the
`dotnet-service` template's `Observability.cs` for a reference implementation.
