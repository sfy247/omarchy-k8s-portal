# Bring your own container

For any language without a golden path (Rust, Go, Elixir, PHP, …), or for code
you already have. You bring a Dockerfile; the platform brings the pipeline,
deployment, observability and Operate.

## What your image must do

Keep the [Service Contract](service-contract.md). In short: run as a non-root
user with a read-only filesystem, listen on 8080, answer `/healthz`, serve
`/metrics` with the two HTTP metrics, and log JSON lines with `level` and
`msg`. CI checks every image; a failing one is never deployed.

## Start a new repository

**Create → Bring your own container → Start a new repository.**

You get a repository with a tiny example app (`app/server.py`) and a
`Dockerfile` that already pass the contract, so the first CI run is green.
Then:

1. Replace `app/` and the `Dockerfile` with your own code and build.
2. Keep the contract (the example shows each rule in a few lines).
3. Push. CI checks, publishes and deploys it to dev.

Tick **Provision and deploy to dev now** to get a running service from the
first build, like a golden path.

## Use your existing repository

**Create → Bring your own container → Use my existing repository.**

The portal opens a **pull request in your repo** that adds three files and
changes nothing else:

| File | What it does |
|---|---|
| `.github/workflows/platform-ci.yaml` | Builds your Dockerfile (from the build context you chose), checks the contract, scans, publishes, deploys to dev |
| `catalog-info.yaml` | Your service in the portal: Discover, CI/CD, Operate, ownership |
| `SERVICE-CONTRACT.md` | The rules, so the team knows what the check expects |

The pull request runs the build and the contract check, so you see whether
your image passes **before** merging. Your existing workflows keep running.

After merging and the first green run on `main`, deploy it once with
**Create → Deploy a service**. From then on every push deploys itself.

## When the contract check fails

Open **Discover → your service → CI/CD**, click the run, then the `image` job.
The **Service Contract** step lists each rule with ✅ / ⚠️ / ❌ and why. The
usual fixes:

| Failure | Fix |
|---|---|
| The container exited | It writes outside `/tmp`, or needs root: set a non-root `USER`, write temp files to `/tmp` |
| No 200 on `/healthz` | Listen on `0.0.0.0:8080` and add the endpoint |
| `/metrics` is missing a metric | Use your language's Prometheus client; name them exactly `http_requests_total` and `http_request_duration_seconds` |
| No JSON log line with a level and a message | Log JSON to stdout, one object per line, with `level` and `msg` |

You can run the same check locally before pushing; see
[Service Contract → Check it yourself](service-contract.md#check-it-yourself).
