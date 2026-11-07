#!/usr/bin/env bash
# Service Contract check: start the image the way the platform runs it and
# verify what the platform relies on. Usage: check.sh <image>
#
#   runs as UID 10001, read-only root filesystem, no capabilities, /tmp writable
#   listens on 8080; GET /healthz is 200 (Kubernetes probes)
#   GET /metrics has http_requests_total and http_request_duration_seconds
#   logs JSON lines to stdout with a level and a message
# Warnings (not failures): no /readyz, some non-JSON log lines.
set -uo pipefail
IMAGE="${1:?usage: check.sh <image>}"
PORT="${CONTRACT_PORT:-18080}"
NAME="contract-$$"
FAILS=0
REPORT=""

pass() { REPORT+="| ✅ | $1 | $2 |"$'\n'; echo "PASS  $1: $2"; }
warn() { REPORT+="| ⚠️ | $1 | $2 |"$'\n'; echo "WARN  $1: $2"; }
fail() { REPORT+="| ❌ | $1 | $2 |"$'\n'; echo "FAIL  $1: $2"; FAILS=$((FAILS + 1)); }
finish() {
  docker rm -f "$NAME" >/dev/null 2>&1
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
    {
      echo "### Service Contract: $([ "$FAILS" -eq 0 ] && echo passed || echo "$FAILS failed")"
      echo
      echo "| | Rule | Result |"
      echo "|---|---|---|"
      printf '%s' "$REPORT"
      echo
      echo "The contract: the platform handbook's *Service Contract* page."
    } >> "$GITHUB_STEP_SUMMARY"
  fi
  [ "$FAILS" -eq 0 ] && echo "Service Contract: passed" || echo "Service Contract: $FAILS rule(s) failed"
  exit $([ "$FAILS" -eq 0 ] && echo 0 || echo 1)
}
trap finish EXIT

# Exactly the platform's pod security settings
if ! docker run -d --name "$NAME" -p "127.0.0.1:$PORT:8080" \
    --user 10001:10001 --read-only --tmpfs /tmp:rw,size=64m \
    --cap-drop ALL --security-opt no-new-privileges "$IMAGE" >/dev/null; then
  fail "Starts" "docker run failed for $IMAGE"
  exit
fi

ok=""
for _ in $(seq 1 60); do
  if [ "$(docker inspect -f '{{.State.Running}}' "$NAME" 2>/dev/null)" != "true" ]; then
    fail "Runs as UID 10001 with a read-only root filesystem" \
      "the container exited: $(docker logs --tail 3 "$NAME" 2>&1 | tr '\n|' ' /' | cut -c1-200)"
    exit
  fi
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/healthz" || true)
  [ "$code" = "200" ] && { ok=yes; break; }
  sleep 1
done
pass "Runs as UID 10001 with a read-only root filesystem" "started without root, capabilities or a writable root"
if [ -n "$ok" ]; then
  pass "Port 8080, GET /healthz" "200"
else
  fail "Port 8080, GET /healthz" "no 200 within 60s (last: ${code:-no answer})"
fi

code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/readyz" || true)
if [ "$code" = "200" ]; then pass "GET /readyz" "200"; else warn "GET /readyz" "$code (recommended for readiness)"; fi

# Some traffic, so request metrics and request logs exist
for path in / / /healthz /does-not-exist; do curl -s -o /dev/null "http://127.0.0.1:$PORT$path" || true; done
sleep 2

metrics=$(curl -s "http://127.0.0.1:$PORT/metrics" || true)
missing=""
for m in http_requests_total http_request_duration_seconds; do
  grep -q "^$m" <<<"$metrics" || missing+="$m "
done
if [ -z "$metrics" ]; then
  fail "GET /metrics" "no answer"
elif [ -n "$missing" ]; then
  fail "GET /metrics" "missing: $missing"
else
  pass "GET /metrics" "http_requests_total and http_request_duration_seconds"
fi

# Logs: one JSON object per line with a level and a message (stdout only)
read -r total json good < <(docker logs "$NAME" 2>/dev/null | python3 -c '
import json, sys
total = json_lines = good = 0
for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    total += 1
    try:
        o = json.loads(line)
    except ValueError:
        continue
    if not isinstance(o, dict):
        continue
    json_lines += 1
    level = any(k in o for k in ("level", "lvl", "severity", "LogLevel", "Level"))
    msg = any(k in o for k in ("msg", "message", "Message"))
    good += level and msg
print(total, json_lines, good)')
if [ "${good:-0}" -eq 0 ]; then
  fail "JSON logs on stdout" "no JSON line with a level and a message (of ${total:-0} lines)"
elif [ "$json" -lt "$total" ]; then
  warn "JSON logs on stdout" "$((total - json)) of $total lines aren't JSON (they can't be filtered by level)"
else
  pass "JSON logs on stdout" "$total lines, all JSON"
fi
