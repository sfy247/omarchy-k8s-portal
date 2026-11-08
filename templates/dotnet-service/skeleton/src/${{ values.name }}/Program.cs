var builder = WebApplication.CreateBuilder(args);

// Framework logs as JSON on stdout (warnings and above); request logs come
// from Observability.cs, so every line from this container is parseable
builder.Logging.ClearProviders();
builder.Logging.AddJsonConsole();
builder.Logging.SetMinimumLevel(LogLevel.Warning);

builder.Services.AddHealthChecks();

var app = builder.Build();

// Platform observability: request metrics at /metrics + JSON request logs
app.UseRequestTelemetry();
app.MapMetrics();

app.MapGet("/", () => Results.Json(new
{
    service = "${{ values.name }}",
    message = "Hello from ${{ values.name }}",
}));

// Liveness and readiness for Kubernetes probes
app.MapHealthChecks("/healthz");
app.MapHealthChecks("/readyz");

{%- if values.database %}

// The platform gives the pod PGHOST, PGPORT, PGDATABASE, PGUSER and
// PGSSLMODE=verify-full; login is by client certificate (PGSSLCERT,
// PGSSLKEY, PGSSLROOTCERT point at it). No password. With Npgsql:
//   Host=$PGHOST;Database=$PGDATABASE;Username=$PGUSER;SSL Mode=VerifyFull;
//   SSL Certificate=$PGSSLCERT;SSL Key=$PGSSLKEY;Root Certificate=$PGSSLROOTCERT
app.MapGet("/db", () => Results.Json(new
{
    configured = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("PGHOST")),
    database = Environment.GetEnvironmentVariable("PGDATABASE"),
}));
{%- endif %}

Observability.Log("info", "starting");
app.Run();
