# Add a database

Each environment has a shared PostgreSQL server. Your service gets **its own
database and its own login**; it can't see any other service's data. There are
**no passwords**: your service logs in with a **client certificate** the
platform issues and renews for it.

## 1. Ask for it

Either tick **PostgreSQL database** when creating the service, or open
**Operate → your service → Request action → Add a database**. Both open a
pull request that sets this in `apps/<group>/<name>/values.yaml`:

```yaml
database:
  enabled: true
```

## 2. Merge

When the pull request is merged, within a few minutes and with nobody to ask:

| What | Where |
|---|---|
| Your database and login, both named `<group>_<name>` (e.g. `services_orders_api`) | the environment's Postgres |
| A client certificate for that login, renewed automatically | Secret `<name>-db-cert` in your namespace, mounted at `/etc/postgres-client` |
| Network access to Postgres | your pods' network policy |
| Connection settings | environment variables in your container (below) |

Your pods restart once with the certificate mounted.

## 3. Connect

Your container gets the standard PostgreSQL (libpq) variables:

| Variable | Value |
|---|---|
| `PGHOST` | `postgres-rw.postgres.svc` |
| `PGPORT` | `5432` |
| `PGDATABASE`, `PGUSER` | `<group>_<name>` |
| `PGSSLMODE` | `verify-full` (TLS, and the server's certificate is checked) |
| `PGSSLCERT`, `PGSSLKEY` | `/etc/postgres-client/tls.crt`, `tls.key`: your login |
| `PGSSLROOTCERT` | `/etc/postgres-client/ca.crt`: to verify the server |

| Language | How |
|---|---|
| Python (psycopg), Go (pgx), anything on libpq | Nothing to do: they read these variables |
| .NET (Npgsql) | `Host=$PGHOST;Database=$PGDATABASE;Username=$PGUSER;SSL Mode=VerifyFull;SSL Certificate=$PGSSLCERT;SSL Key=$PGSSLKEY;Root Certificate=$PGSSLROOTCERT` |
| Node (`pg`) | Host, user and database come from the variables; pass `ssl: { ca, cert, key }` read from those three files |
| Java (pgjdbc) | `jdbc:postgresql://$PGHOST/$PGDATABASE?user=$PGUSER&sslmode=verify-full&sslcert=…&sslkey=…&sslrootcert=…` |

Connections without TLS, without a certificate, or with another service's
certificate are refused.

## 4. Structure it with migrations

The database starts **empty**. Your service owns its schema: keep migrations
in your repo (EF Core, Flyway, Alembic, Prisma, …) and apply them on deploy,
never by hand. Your login owns the database, so it can run them.

Keep `/healthz` independent of the database (see the
[Service Contract](service-contract.md)), so a database hiccup never makes
Kubernetes restart healthy pods.

## Turning it off, or deleting data

Setting `database.enabled: false` removes access but **keeps the data**.
Deleting a database for good is a deliberate platform-team step:
`make database-drop APP=<group>/<name>`, which only works once access is off.
