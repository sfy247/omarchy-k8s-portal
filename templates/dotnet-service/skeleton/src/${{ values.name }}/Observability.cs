// Platform observability contract: every service from this template exposes
//   GET /metrics   http_requests_total{method,route,status}
//                  http_request_duration_seconds{method,route} (histogram)
//   stdout         one JSON object per request: ts, level, msg, service,
//                  method, path, route, status, duration_ms
// The platform scrapes /metrics (PodMonitor) and collects stdout (Loki), so
// the service appears on Grafana's Service Health dashboard and gets the
// error-rate, latency and down alerts automatically.
using System.Diagnostics;
using System.Globalization;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Routing;

public static class Observability
{
    static readonly double[] Buckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];
    static readonly object Gate = new();
    static readonly SortedDictionary<string, long> Requests = new(StringComparer.Ordinal);
    static readonly SortedDictionary<string, double[]> Durations = new(StringComparer.Ordinal);
    static readonly string Service =
        Environment.GetEnvironmentVariable("SERVICE_NAME") ?? AppDomain.CurrentDomain.FriendlyName;

    /// <summary>Writes one structured log line to stdout.</summary>
    public static void Log(string level, string message, IDictionary<string, object?>? fields = null)
    {
        var record = new Dictionary<string, object?>
        {
            ["ts"] = DateTime.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'", CultureInfo.InvariantCulture),
            ["level"] = level,
            ["msg"] = message,
            ["service"] = Service,
        };
        if (fields is not null)
            foreach (var (key, value) in fields) record[key] = value;
        Console.Out.WriteLine(JsonSerializer.Serialize(record));
    }

    /// <summary>Records metrics and a log line for every request (except probes and /metrics).</summary>
    public static IApplicationBuilder UseRequestTelemetry(this IApplicationBuilder app) =>
        app.Use(async (ctx, next) =>
        {
            var path = ctx.Request.Path.Value ?? "/";
            if (path == "/metrics") { await next(); return; }

            var stopwatch = Stopwatch.StartNew();
            try
            {
                await next();
            }
            catch (Exception ex)
            {
                ctx.Response.StatusCode = StatusCodes.Status500InternalServerError;
                Log("error", "unhandled exception", new Dictionary<string, object?>
                {
                    ["path"] = path, ["error"] = ex.GetType().Name, ["detail"] = ex.Message,
                });
            }
            var seconds = stopwatch.Elapsed.TotalSeconds;

            // The route template (e.g. /orders/{id}), never the raw path, keeps
            // the number of metric series bounded
            var route = (ctx.GetEndpoint() as RouteEndpoint)?.RoutePattern.RawText ?? "unmatched";
            if (!route.StartsWith('/')) route = "/" + route;
            var status = ctx.Response.StatusCode;
            Record(ctx.Request.Method, route, status, seconds);

            if (route is "/healthz" or "/readyz") return;
            var level = status >= 500 ? "error" : seconds > 1 ? "warn" : "info";
            Log(level, "request", new Dictionary<string, object?>
            {
                ["method"] = ctx.Request.Method, ["path"] = path, ["route"] = route,
                ["status"] = status, ["duration_ms"] = Math.Round(seconds * 1000, 1),
            });
        });

    /// <summary>Serves the metrics in Prometheus text format at /metrics.</summary>
    public static IEndpointRouteBuilder MapMetrics(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/metrics", () => Results.Text(Exposition(), "text/plain; version=0.0.4"));
        return endpoints;
    }

    static void Record(string method, string route, int status, double seconds)
    {
        lock (Gate)
        {
            var key = string.Join('|', method, route, status.ToString(CultureInfo.InvariantCulture));
            Requests[key] = Requests.GetValueOrDefault(key) + 1;
            var hKey = string.Join('|', method, route);
            if (!Durations.TryGetValue(hKey, out var h))
                Durations[hKey] = h = new double[Buckets.Length + 2];
            for (var i = 0; i < Buckets.Length; i++)
                if (seconds <= Buckets[i]) h[i]++;
            h[Buckets.Length] += seconds;
            h[Buckets.Length + 1]++;
        }
    }

    static string Exposition()
    {
        var sb = new StringBuilder();
        var inv = CultureInfo.InvariantCulture;
        lock (Gate)
        {
            sb.Append("# HELP http_requests_total Requests handled, by route and status.\n");
            sb.Append("# TYPE http_requests_total counter\n");
            foreach (var (key, count) in Requests)
            {
                var p = key.Split('|');
                sb.Append("http_requests_total{method=\"").Append(p[0]).Append("\",route=\"").Append(Escape(p[1]))
                  .Append("\",status=\"").Append(p[2]).Append("\"} ").Append(count.ToString(inv)).Append('\n');
            }
            sb.Append("# HELP http_request_duration_seconds Request latency.\n");
            sb.Append("# TYPE http_request_duration_seconds histogram\n");
            foreach (var (key, h) in Durations)
            {
                var p = key.Split('|');
                var labels = "method=\"" + p[0] + "\",route=\"" + Escape(p[1]) + "\"";
                for (var i = 0; i < Buckets.Length; i++)
                    sb.Append("http_request_duration_seconds_bucket{").Append(labels).Append(",le=\"")
                      .Append(Buckets[i].ToString(inv)).Append("\"} ").Append(h[i].ToString(inv)).Append('\n');
                var total = h[Buckets.Length + 1].ToString(inv);
                sb.Append("http_request_duration_seconds_bucket{").Append(labels).Append(",le=\"+Inf\"} ").Append(total).Append('\n');
                sb.Append("http_request_duration_seconds_sum{").Append(labels).Append("} ")
                  .Append(h[Buckets.Length].ToString(inv)).Append('\n');
                sb.Append("http_request_duration_seconds_count{").Append(labels).Append("} ").Append(total).Append('\n');
            }
        }
        return sb.ToString();
    }

    static string Escape(string value) => value.Replace("\\", "\\\\").Replace("\"", "\\\"");
}
