# Add a database

Each environment has a shared PostgreSQL server. Your service gets **its own
database and its own login**; it cannot see any other service's data.

## 1. Let your service reach Postgres

Either tick **PostgreSQL database** when creating the service, or add this to
`apps/<group>/<name>/values.yaml` in the platform repo:

```yaml
database:
  enabled: true
```

This opens the network path to Postgres and loads the connection details into
your container.

## 2. Ask for the database

Ask the platform team to create it. They run:

```bash
make database APP=<group>/<name>
```

It creates the database and login in every enabled environment and restarts
your service so it picks them up.

## 3. Connect

Your container gets the standard PostgreSQL environment variables, so most
drivers connect with no configuration:

| Variable | Example |
|---|---|
| `PGHOST` | `postgres-rw.postgres.svc` |
| `PGPORT` | `5432` |
| `PGDATABASE`, `PGUSER` | `services_orders_api` |
| `PGPASSWORD` | *(generated)* |
| `PGSSLMODE` | `require` |
| `DATABASE_URL` | `postgresql://…?sslmode=require` |

Connections must use TLS; plain-text connections are refused.

For .NET with Npgsql, build the connection string from these variables, or
read `DATABASE_URL`.
