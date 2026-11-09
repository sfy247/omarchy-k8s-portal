-- First migration for ${{ values.name }}: an example table. Replace or extend it.
--
-- Rules (handbook: Database migrations):
--   * one change per file, named V<version>__<description>.sql (V2__add_status.sql, ...)
--   * never edit a file once it's been applied anywhere: add a new one
--   * each file runs in one transaction, in order, once per environment
--   * expand, then contract: add first; remove in a later release
create table items (
    id         bigint generated always as identity primary key,
    name       text        not null,
    created_at timestamptz not null default now()
);
