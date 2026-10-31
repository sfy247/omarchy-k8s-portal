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

Then dashboards, logs and alerts work without any extra setup.

## Keep deployment out of the template

A language template creates the application only. To offer "deploy now", add
the optional steps from `dotnet-service/template.yaml` (`fetch-base`,
`fetch-environment`, `gitops-pr`): they render the shared
`templates/_shared/deploy` block, the same one the **Deploy a service** action
uses. Never copy deployment files into a template. See the
`dotnet-service` template's `Observability.cs` for a reference implementation.
