# Database migrations

Your database starts empty. Its structure (tables, columns, indexes) comes
from **migrations**: numbered SQL files in your service's repo, applied
automatically, once each, in every environment.

<figure style="margin:1.2em 0;display:block;width:100%;max-width:980px"><svg viewBox="0 0 980 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Push, CI tests migrations on an empty Postgres and publishes app and migrations images; Argo CD runs the migrate job before rolling out the app" style="display:block;width:100%;height:auto;max-width:980px;font-family:var(--font-interface, system-ui, sans-serif);color:var(--text-normal, var(--md-default-fg-color, #222))"><defs><marker id="mg-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity="0.8"/></marker><marker id="mg-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))"/></marker></defs><g><rect x="20" y="50" width="150" height="70" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="95.0" y="75.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">service repo</text><text x="95.0" y="90.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">src/ + db/migrations</text><text x="95.0" y="105.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">V1__init.sql …</text></g><rect x="200" y="16" width="330" height="140" rx="9" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="6 4"/><text x="212" y="33" font-size="10.5" font-weight="600" letter-spacing="0.06em" fill="currentColor" fill-opacity="0.65">CI (SHARED PIPELINE)</text><g><rect x="220" y="46" width="140" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="290.0" y="68.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">test migrations</text><text x="290.0" y="83.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">empty Postgres, ×2</text></g><g><rect x="375" y="46" width="140" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="445.0" y="68.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">publish images</text><text x="445.0" y="83.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">app + migrations</text></g><g><rect x="375" y="108" width="140" height="40" rx="7" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill-opacity:0.10;stroke-width:2"/><text x="445.0" y="125.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">deploy commit</text><text x="445.0" y="140.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">tag sha-&lt;commit&gt;</text></g><polyline points="170,85 190,85 190,71 218,71" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#mg-arr)"/><text x="190" y="60" text-anchor="middle" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">push</text><polyline points="360,71 373,71" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#mg-arr)"/><polyline points="445,96 445,106" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#mg-arr)"/><rect x="560" y="16" width="400" height="250" rx="9" fill="none" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))" stroke-dasharray="6 4"/><text x="572" y="33" font-size="10.5" font-weight="600" letter-spacing="0.06em" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))">ARGO CD SYNC, IN WAVES</text><g><rect x="580" y="46" width="360" height="46" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="760.0" y="66.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">wave 0: database · login · certificate</text><text x="760.0" y="81.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">already there after the first deploy</text></g><g><rect x="580" y="112" width="360" height="56" rx="7" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill-opacity:0.10;stroke-width:2"/><text x="760.0" y="137.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">wave 1: migrate job</text><text x="760.0" y="152.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">applies new files, records each with its checksum</text></g><g><rect x="580" y="188" width="360" height="46" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="760.0" y="208.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">wave 2: new app version rolls out</text><text x="760.0" y="223.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">only if wave 1 succeeded</text></g><polyline points="515,128 548,128 548,69 578,69" fill="none" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));stroke-width:2" marker-end="url(#mg-acc)"/><polyline points="760,92 760,110" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#mg-arr)"/><polyline points="760,168 760,186" fill="none" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));stroke-width:2" marker-end="url(#mg-acc)"/><text x="770" y="181" text-anchor="start" font-size="11" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">succeeded</text><text x="20" y="200" text-anchor="start" font-size="11" font-weight="600" fill-opacity="0.75" style="fill:currentColor">If the migrate job fails:</text><text x="20" y="220" text-anchor="start" font-size="11" fill-opacity="0.75" style="fill:currentColor">the sync stops, the running version stays,</text><text x="20" y="238" text-anchor="start" font-size="11" fill-opacity="0.75" style="fill:currentColor">and Operate shows Migrate: Failed with the error.</text></svg><figcaption style="font-size:0.85em;color:var(--text-muted, var(--md-default-fg-color--light, #666));margin-top:0.4em">Code and schema ship together. CI proves the migrations apply to an empty database; on deploy, Argo CD applies the new ones before the new version starts, and stops if they fail, so the running version stays.</figcaption></figure>

## Where they live

In your repo, next to your code:

```text
db/migrations/
  V1__init.sql
  V2__add_status_to_orders.sql
  V3__index_orders_customer.sql
```

A change to the schema and the code that uses it go in **the same pull
request**, and ship in the same release.

Services created with a database already have `db/migrations/V1__init.sql` and
migrations switched on. For an existing service: add the folder, then
**Operate → Add a database** with *Run its migrations* ticked (or set
`migrations.enabled: true` in its platform values).

## The rules

| Rule | Why |
|---|---|
| Name files `V<version>__<description>.sql` (`V2__add_status.sql`, `V2.1__…`) | They run in version order; the names match Flyway's, so switching tools later is easy |
| **Never edit a file once it's been applied anywhere**: add a new one | Each applied file's checksum is recorded; an edited one stops the deploy |
| One change per file; each file runs in **one transaction** | A failing file leaves nothing half-applied |
| No `CREATE INDEX CONCURRENTLY` or other statements that can't run in a transaction | They'd fail inside the transaction |
| **Expand, then contract** | Old and new versions run side by side during a rollout (below) |

## What happens

| When | What |
|---|---|
| Every push and pull request | CI builds a **migrations image** and applies your migrations to an **empty Postgres, twice**: everything must apply, and the second run must change nothing. A broken migration fails the build. |
| Push to `main` | The migrations image is published next to the app image, with the same tag (`…/migrations:sha-<commit>`) |
| Every deploy | Argo CD runs a **migrate job** with your service's own login, *before* the new version: it applies only the files not yet recorded, in order, each with its history row |
| If the job fails | The deploy stops and **the running version stays**. Operate's pipeline shows *Migrate: Failed* with the error, and the job's logs are in Logs. Fix it with a **new** migration (or fix the unapplied file) and push again. |

The history is a table in your database:

```sql
select version, description, checksum, applied_at, applied_by, execution_ms
from schema_migrations order by applied_at;
```

## Changing a schema safely: expand, then contract

During a rollout the old and new versions both run against the same database,
and a rollback means the old version runs against the newer schema. So make
every change in two releases:

| Change | Release 1 (expand) | Release 2 (contract) |
|---|---|---|
| Rename a column | Add the new column; write both; backfill | Read the new one; drop the old one |
| Make a column required | Add it nullable with a default; write it everywhere | `SET NOT NULL` |
| Remove a column | Stop using it in code | Drop it |
| Add a table or index | Just add it | |

## Using your own tool

Prefer EF Core, Flyway, Alembic or Prisma? Keep `migrations.enabled: true` and
set `migrations.image` in your platform values to an image that runs your tool
with the same `PG*` settings. The job, its ordering and its failure handling
stay the same.

## Troubleshooting

| The migrate job says | Means | Do |
|---|---|---|
| `an applied migration was edited` | A file already applied somewhere changed | Restore it; put the change in a new file |
| `an applied migration's file is missing` | A file already applied was deleted or renamed | Restore it |
| `unsupported file names` | A file doesn't match `V<version>__<description>.sql` | Rename it |
| `two files share a version` | e.g. `V3__a.sql` and `V3__b.sql` | Renumber the newer one |
| `migration failed; nothing from it was applied` | The SQL errored; the detail says where | Fix that file (it was never applied) and push |
| `database not reachable` | First deploy: the database is still being created | It retries for 3 minutes; if it persists, see [Databases → Troubleshooting](../13%20Databases.md#troubleshooting) |
