# Database

`migrations/` holds this service's schema, as numbered SQL files:

```
V1__init.sql
V2__add_status.sql
V3__index_items_name.sql
```

On every push, CI applies them to an empty Postgres (twice: the second run
must change nothing). On every deploy, a migrate job applies the new ones to
the environment's database **before** the new version starts; if it fails,
the old version keeps running.

- Add a file for each change; never edit one that's been applied.
- Each file is one transaction. Statements that can't run in a transaction
  (e.g. `CREATE INDEX CONCURRENTLY`) aren't supported.
- Expand, then contract: add columns first, remove them in a later release.

More: the platform handbook's *Database migrations* guide.
