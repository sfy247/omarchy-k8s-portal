using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Structured JSON logs to stdout, so the cluster's log tooling can parse them
builder.Logging.ClearProviders();
builder.Logging.AddJsonConsole();

builder.Services.AddHealthChecks();

var app = builder.Build();

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

app.Run();
