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

// Connection details arrive as libpq environment variables from the
// <name>-db Secret (PGHOST, PGUSER, PGPASSWORD, PGDATABASE, ...)
app.MapGet("/db", () => Results.Json(new
{
    configured = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("PGHOST")),
    database = Environment.GetEnvironmentVariable("PGDATABASE"),
}));
{%- endif %}

Observability.Log("info", "starting");
app.Run();
