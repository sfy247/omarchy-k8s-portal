#!/bin/sh
# Platform database migrator: applies a service's SQL migrations, once each,
# in order. Connects with libpq's PG* settings (in the cluster: the service's
# own login and client certificate).
#
#   Files      $MIGRATIONS_DIR/V<version>__<description>.sql, e.g.
#              V1__create_orders.sql, V1.1__add_status.sql (Flyway-style names)
#   History    table schema_migrations: version, description, checksum, when, who
#   Safety     each file runs in one transaction with its history row; an
#              advisory lock serialises concurrent runs; an already-applied
#              file whose checksum changed, or that went missing, stops the run
#   Logs       one JSON line per event (level, msg) on stdout
#
# Exit codes: 0 applied (or nothing to do), 1 a migration failed, 2 refused
set -eu
DIR="${MIGRATIONS_DIR:-/migrations}"
TABLE="${MIGRATIONS_TABLE:-schema_migrations}"
WAIT="${MIGRATIONS_WAIT_SECONDS:-180}"
LOCK="hashtext('platform-migrations')"

json() { # json <level> <msg> [key value]...
  level=$1 msg=$2; shift 2
  out="{\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"level\":\"$level\",\"msg\":\"$msg\",\"service\":\"migrate\""
  while [ $# -ge 2 ]; do
    v=$(printf '%s' "$2" | sed 's/\\/\\\\/g; s/"/\\"/g' | tr '\n' ' ')
    out="$out,\"$1\":\"$v\""; shift 2
  done
  echo "$out}"
}
# Only warnings and errors from the server (NOTICEs aren't JSON lines)
export PGOPTIONS="${PGOPTIONS:-} -c client_min_messages=warning"
q() { psql -X -q -t -A -v ON_ERROR_STOP=1 "$@"; }

[ -d "$DIR" ] || { json info "no migrations directory" dir "$DIR"; exit 0; }

# Names: V<version>__<description>.sql only (no repeatable R__ files)
bad=$(ls -1 "$DIR" | grep -vE '^V[0-9]+(\.[0-9]+)*__[A-Za-z0-9_]+\.sql$' || true)
if [ -n "$bad" ]; then
  json error "unsupported file names; use V<version>__<description>.sql" files "$bad"
  exit 2
fi
FILES=$(ls -1 "$DIR" | sort -V)
dupes=$(echo "$FILES" | sed 's/__.*//' | sort | uniq -d)
[ -z "$dupes" ] || { json error "two files share a version" versions "$dupes"; exit 2; }

# The database can appear a little after the job starts (first deploy)
i=0
until q -c 'select 1' >/dev/null 2>&1; do
  i=$((i + 5))
  if [ "$i" -ge "$WAIT" ]; then
    json error "database not reachable" host "${PGHOST:-}" database "${PGDATABASE:-}" detail "$(q -c 'select 1' 2>&1 | tail -1)"
    exit 1
  fi
  sleep 5
done

q -c "select pg_advisory_lock($LOCK)" \
  -c "create table if not exists $TABLE (
        version text primary key,
        description text not null,
        checksum text not null,
        applied_at timestamptz not null default now(),
        applied_by text not null default current_user,
        execution_ms integer not null)" >/dev/null

applied=$(q -F ' ' -c "select version, checksum from $TABLE order by applied_at")

# Refuse if history and files disagree: an edited or deleted applied migration
echo "$applied" | while read -r v sum; do
  [ -n "$v" ] || continue
  f=$(echo "$FILES" | grep -E "^V${v}__" || true)
  if [ -z "$f" ]; then
    json error "an applied migration's file is missing" version "$v"; exit 2
  fi
  now=$(sha256sum "$DIR/$f" | cut -d' ' -f1)
  if [ "$now" != "$sum" ]; then
    json error "an applied migration was edited; add a new one instead" file "$f" version "$v"; exit 2
  fi
done || exit $?

count=0
for f in $FILES; do
  v=$(echo "$f" | sed -E 's/^V([0-9.]+)__.*/\1/')
  echo "$applied" | grep -qE "^$v " && continue
  desc=$(echo "$f" | sed -E 's/^V[0-9.]+__(.*)\.sql$/\1/' | tr '_' ' ')
  sum=$(sha256sum "$DIR/$f" | cut -d' ' -f1)
  # The file and its history row commit together, or not at all
  if ! err=$(q -1 \
      -c "select pg_advisory_xact_lock($LOCK), set_config('migrate.start', clock_timestamp()::text, true)" \
      -f "$DIR/$f" \
      -c "insert into $TABLE (version, description, checksum, execution_ms)
          values ('$v', '$desc', '$sum',
                  (extract(epoch from clock_timestamp() - current_setting('migrate.start')::timestamptz) * 1000)::int)" \
      2>&1 >/dev/null); then
    json error "migration failed; nothing from it was applied" file "$f" detail "$err"; exit 1
  fi
  ms=$(q -c "select execution_ms from $TABLE where version = '$v'")
  json info "applied" version "$v" file "$f" ms "$ms"
  count=$((count + 1))
done
json info "migrations up to date" applied "$count" total "$(echo "$FILES" | grep -c . || true)"
