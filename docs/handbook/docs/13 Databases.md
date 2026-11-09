---
tags: [kindell247, databases, postgres]
updated: 2026-11-08
---

# Databases

Back to [Home](index.md). How services get a PostgreSQL database, how they log
in without passwords, and how to run it. Developers' how-to:
[Add a database](guides/add-a-database.md).

## Purpose

Give every service **its own database, in every environment, with no
passwords and nobody in the loop**:

- **Self-service.** A developer asks in the portal; merging the pull request is
  the only human step. No ticket, no `make` command, no hand-off.
- **No passwords.** Services prove who they are with a **client certificate**
  the platform issues and renews. There's no secret to generate, store, leak or
  rotate by hand.
- **Isolated.** Each service has its own login that owns only its own database.
- **Declared in Git.** The database exists because the service's values say
  `database.enabled: true`, like everything else on the platform.
- **Safe by default.** Switching access off never deletes data.

## At a glance

| | |
|---|---|
| Server | One CloudNativePG cluster per environment: `postgres` in namespace `postgres` |
| A service's database and login | `<group>_<name>`, e.g. `services_orders_api` |
| How it logs in | TLS 1.3 + a client certificate whose name is the login |
| Where the certificate is | Secret `<name>-db-cert` in the service's namespace, mounted at `/etc/postgres-client` |
| How the app finds it | `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGSSLMODE=verify-full`, `PGSSLCERT`, `PGSSLKEY`, `PGSSLROOTCERT` |
| Who issues certificates | cert-manager, ClusterIssuer `postgres` (a private CA used only for this) |
| Schema | The service's own **migrations**, applied before each deploy |

## From request to connected

<figure style="margin:1.2em 0;display:block;width:100%;max-width:980px"><svg viewBox="0 0 980 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Add a database opens a PR; on merge Argo CD applies the chart, cert-manager issues the certificate, CloudNativePG creates the role and database, the pod restarts and connects" style="display:block;width:100%;height:auto;max-width:980px;font-family:var(--font-interface, system-ui, sans-serif);color:var(--text-normal, var(--md-default-fg-color, #222))"><defs><marker id="dlc-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity="0.8"/></marker><marker id="dlc-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))"/></marker></defs><g><rect x="20" y="40" width="140" height="56" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="90.0" y="65.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Add a database</text><text x="90.0" y="80.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">Operate or Create</text></g><g><rect x="200" y="40" width="140" height="56" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="270.0" y="65.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">pull request</text><text x="270.0" y="80.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">database.enabled</text></g><g><rect x="380" y="40" width="140" height="56" rx="7" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill-opacity:0.10;stroke-width:2"/><text x="450.0" y="65.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Argo CD</text><text x="450.0" y="80.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">web-service chart</text></g><g><rect x="570" y="10" width="180" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="660.0" y="32.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">cert-manager</text><text x="660.0" y="47.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">issues the certificate</text></g><g><rect x="570" y="80" width="180" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="660.0" y="102.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">CloudNativePG</text><text x="660.0" y="117.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">creates role + database</text></g><g><rect x="800" y="40" width="160" height="56" rx="7" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill-opacity:0.10;stroke-width:2"/><text x="880.0" y="65.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">your pod</text><text x="880.0" y="80.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">restarts · connects</text></g><polyline points="160,68 198,68" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#dlc-arr)"/><polyline points="340,68 378,68" fill="none" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));stroke-width:2" marker-end="url(#dlc-acc)"/><text x="359" y="60" text-anchor="middle" font-size="11" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">merge</text><polyline points="520,60 545,60 545,35 568,35" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#dlc-arr)"/><text x="520" y="24" text-anchor="start" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">Certificate</text><polyline points="520,76 545,76 545,105 568,105" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#dlc-arr)"/><text x="570" y="146" text-anchor="start" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">DatabaseRole · Database</text><polyline points="750,35 775,35 775,60 798,60" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#dlc-arr)"/><polyline points="750,105 775,105 775,76 798,76" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#dlc-arr)"/><text x="20" y="170" text-anchor="start" font-size="10.5" font-weight="600" fill-opacity="0.75" style="fill:currentColor">WHAT EACH PIECE IS</text><g><rect x="20" y="184" width="220" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="130.0" y="206.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Certificate</text><text x="130.0" y="221.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">your namespace · CN = role</text></g><g><rect x="260" y="184" width="220" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="370.0" y="206.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">DatabaseRole</text><text x="370.0" y="221.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">login, certificate only</text></g><g><rect x="500" y="184" width="220" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="610.0" y="206.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Database</text><text x="610.0" y="221.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">owned by that role</text></g><g><rect x="740" y="184" width="220" height="50" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="850.0" y="206.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">PG* settings</text><text x="850.0" y="221.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">env vars + mounted files</text></g></svg><figcaption style="font-size:0.85em;color:var(--text-muted, var(--md-default-fg-color--light, #666));margin-top:0.4em">From request to connected, with nobody in the loop. Merging the pull request is the only human step; Argo CD, cert-manager and CloudNativePG do the rest in a few minutes.</figcaption></figure>

1. **Ask.** *Operate → Request action → Add a database*, or tick
   *PostgreSQL database* in Create. Either way it's a pull request setting
   `database.enabled: true` in `apps/<group>/<name>/values.yaml`.
2. **Merge.** Argo CD renders the service's chart (`charts/web-service`), which
   now includes three more resources (`templates/database.yaml`):

   | Resource | Namespace | What it does |
   |---|---|---|
   | `Certificate <name>-db` | the service's | cert-manager issues a client certificate, CN = the login name |
   | `DatabaseRole` | `postgres` | CloudNativePG creates the login: can log in, no password, nothing else |
   | `Database` | `postgres` | CloudNativePG creates the database, owned by that login |

3. **Connect.** The pod gets the `PG*` settings and the certificate mounted,
   restarts once, and connects. Total: a few minutes after merge.

## How a login works

<figure style="margin:1.2em 0;display:block;width:100%;max-width:900px"><svg viewBox="0 0 900 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The Postgres CA in cert-manager signs the Postgres server certificate and each service's client certificate; both sides verify each other" style="display:block;width:100%;height:auto;max-width:900px;font-family:var(--font-interface, system-ui, sans-serif);color:var(--text-normal, var(--md-default-fg-color, #222))"><defs><marker id="dt-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity="0.8"/></marker><marker id="dt-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))"/></marker></defs><g><rect x="330" y="20" width="240" height="60" rx="7" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill-opacity:0.10;stroke-width:2"/><text x="450.0" y="47.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Postgres CA</text><text x="450.0" y="62.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">ClusterIssuer postgres · cert-manager</text></g><rect x="20" y="120" width="360" height="164" rx="9" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="6 4"/><text x="32" y="137" font-size="10.5" font-weight="600" letter-spacing="0.06em" fill="currentColor" fill-opacity="0.65">YOUR SERVICE'S NAMESPACE</text><g><rect x="40" y="152" width="150" height="56" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="115.0" y="177.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">client certificate</text><text x="115.0" y="192.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">CN = services_orders</text></g><g><rect x="210" y="152" width="150" height="56" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="285.0" y="177.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">your pod</text><text x="285.0" y="192.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">/etc/postgres-client</text></g><g><rect x="40" y="222" width="320" height="44" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="200.0" y="241.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Secret &lt;name&gt;-db-cert</text><text x="200.0" y="256.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">tls.crt · tls.key · ca.crt</text></g><rect x="520" y="120" width="360" height="164" rx="9" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-dasharray="6 4"/><text x="532" y="137" font-size="10.5" font-weight="600" letter-spacing="0.06em" fill="currentColor" fill-opacity="0.65">POSTGRES NAMESPACE</text><g><rect x="540" y="152" width="150" height="56" rx="7" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill-opacity:0.10;stroke-width:2"/><text x="615.0" y="177.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">Postgres</text><text x="615.0" y="192.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">hostssl … cert</text></g><g><rect x="710" y="152" width="150" height="56" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="785.0" y="177.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">server certificate</text><text x="785.0" y="192.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">postgres-rw…svc</text></g><g><rect x="540" y="222" width="320" height="44" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="700.0" y="241.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">role + database services_orders</text><text x="700.0" y="256.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">DatabaseRole · Database (retain)</text></g><polyline points="380,80 380,100 115,100 115,150" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#dt-arr)"/><text x="250" y="94" text-anchor="middle" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">signs</text><polyline points="570,80 570,100 785,100 785,150" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#dt-arr)"/><text x="680" y="94" text-anchor="middle" font-size="11" fill-opacity="0.75" style="fill:currentColor;paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">signs</text><polyline points="190,180 208,180" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" marker-end="url(#dt-arr)"/><polyline points="360,170 538,170" fill="none" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));stroke-width:2" marker-end="url(#dt-acc)"/><text x="449" y="162" text-anchor="middle" font-size="11" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">TLS 1.3 · client cert</text><polyline points="708,180 692,180" fill="none" stroke="currentColor" stroke-opacity="0.4" stroke-width="1.5" marker-end="url(#dt-arr)"/><polyline points="538,192 362,192" fill="none" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));stroke-width:2" marker-end="url(#dt-acc)"/><text x="449" y="212" text-anchor="middle" font-size="11" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));paint-order:stroke;stroke:var(--background-primary, var(--md-default-bg-color, #ffffff));stroke-width:4px;stroke-linejoin:round">server cert · verify-full</text></svg><figcaption style="font-size:0.85em;color:var(--text-muted, var(--md-default-fg-color--light, #666));margin-top:0.4em">One private CA, used only by Postgres. It signs the server's certificate and one client certificate per service. Each side verifies the other against the same CA, and Postgres also checks that the certificate's name is the login's name.</figcaption></figure>

Both sides check each other:

- **The app checks the server** (`sslmode=verify-full`): the server's
  certificate must be signed by the Postgres CA *and* match
  `postgres-rw.postgres.svc`. A fake server can't impersonate it.
- **Postgres checks the app** (`pg_hba`: `hostssl all all all cert`): the
  client certificate must be signed by the Postgres CA, and its name (CN) must
  equal the login name. A certificate is only good for its own login.

<figure style="margin:1.2em 0;display:block;width:100%;max-width:940px"><svg viewBox="0 0 940 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Connection checks: TLS, server certificate verified by the app, client certificate verified by Postgres, certificate name equals login, then the role's own database" style="display:block;width:100%;height:auto;max-width:940px;font-family:var(--font-interface, system-ui, sans-serif);color:var(--text-normal, var(--md-default-fg-color, #222))"><defs><marker id="dlg-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity="0.8"/></marker><marker id="dlg-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))"/></marker></defs><g><rect x="20" y="60" width="160" height="60" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="100.0" y="87.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">TLS required</text><text x="100.0" y="102.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">plaintext rejected</text></g><circle cx="32" cy="52" r="9" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))"/><text x="32" y="56" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">1</text><g><rect x="205" y="60" width="160" height="60" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="285.0" y="87.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">app checks server</text><text x="285.0" y="102.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">CA + hostname</text></g><circle cx="217" cy="52" r="9" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))"/><text x="217" y="56" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">2</text><polyline points="180,90 203,90" fill="none" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));stroke-width:2" marker-end="url(#dlg-acc)"/><g><rect x="390" y="60" width="160" height="60" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="470.0" y="87.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">checks client</text><text x="470.0" y="102.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">Postgres CA signed</text></g><circle cx="402" cy="52" r="9" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))"/><text x="402" y="56" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">3</text><polyline points="365,90 388,90" fill="none" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));stroke-width:2" marker-end="url(#dlg-acc)"/><g><rect x="575" y="60" width="160" height="60" rx="7" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));fill-opacity:0.10;stroke-width:2"/><text x="655.0" y="87.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">name = login?</text><text x="655.0" y="102.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">CN services_orders</text></g><circle cx="587" cy="52" r="9" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))"/><text x="587" y="56" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">4</text><polyline points="550,90 573,90" fill="none" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));stroke-width:2" marker-end="url(#dlg-acc)"/><g><rect x="760" y="60" width="160" height="60" rx="7" stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"/><text x="840.0" y="87.5" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">its own database</text><text x="840.0" y="102.5" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">owner of one database</text></g><circle cx="772" cy="52" r="9" style="fill:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))"/><text x="772" y="56" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">5</text><polyline points="735,90 758,90" fill="none" style="stroke:var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)));stroke-width:2" marker-end="url(#dlg-acc)"/><text x="20" y="160" text-anchor="start" font-size="11" fill-opacity="0.75" style="fill:currentColor">Fails: no TLS · fake server · no or foreign certificate · someone else's certificate · another service's database</text></svg><figcaption style="font-size:0.85em;color:var(--text-muted, var(--md-default-fg-color--light, #666));margin-top:0.4em">What happens on every connection. Any failed check ends it: no certificate, a certificate from another CA, a name that isn't the login, or no TLS.</figcaption></figure>

| Attempt | Postgres says |
|---|---|
| No TLS | `pg_hba.conf rejects connection … no encryption` |
| TLS, no certificate | `connection requires a valid client certificate` |
| Another service's certificate, or claiming another login | `certificate authentication failed for user …` |
| Its own certificate and login | connected; `pg_stat_ssl` shows TLS 1.3 and `/CN=<login>` |

## Why a private CA, not the lab CA?

The lab CA is trusted by your machine and **name-constrained** to the lab
domain, so it can only sign names like `*.kindell247`. Postgres logins are
plain names (`services_orders_api`), and Postgres should trust *only*
certificates meant for it. So the gateway add-on creates a separate CA in each
cluster (`cluster-addons/gateway/templates/postgres-ca.yaml`): a self-signed
root used by nothing else, behind the ClusterIssuer `postgres`.

| Certificate | Issued by | Renewed | Used for |
|---|---|---|---|
| `postgres-server` | `postgres` issuer | automatically (cert-manager) | the server's identity; apps verify it |
| `postgres-replication` | `postgres` issuer | automatically | replicas' login (`streaming_replica`); its `ca.crt` tells Postgres which CA to trust for clients |
| `<name>-db` (per service) | `postgres` issuer | automatically | the service's login |

## What a service sees

```text
PGHOST=postgres-rw.postgres.svc        PGSSLMODE=verify-full
PGPORT=5432                            PGSSLCERT=/etc/postgres-client/tls.crt
PGDATABASE=services_orders_api         PGSSLKEY=/etc/postgres-client/tls.key
PGUSER=services_orders_api             PGSSLROOTCERT=/etc/postgres-client/ca.crt
```

libpq-based clients (psycopg, pgx, psql) read these with no code. Npgsql, Node
`pg` and pgjdbc need the three file paths passed in; see
[Add a database → Connect](guides/add-a-database.md#3-connect).

## Security properties

| Property | How |
|---|---|
| Nothing to steal from Git or the image | No passwords exist; keys are generated in the cluster and never leave it |
| Credentials expire and renew themselves | cert-manager renews certificates (with a new private key) before they expire |
| One service can't read another's data | Its login owns only its database; its certificate only works as its login |
| No impersonation of the server | `verify-full` against the Postgres CA |
| Network limits too | Only pods labelled as database clients reach port 5432; plaintext is rejected |
| Data survives mistakes | `DatabaseRole` and `Database` use `retain`: removing them never drops data |

## Operations

| Task | How |
|---|---|
| Give a service a database | Operate → **Add a database** (or `database.enabled: true`) |
| Take access away, keep the data | `database.enabled: false` |
| Delete a database for good | after access is off: `make database-drop APP=<group>/<name>` (refuses otherwise) |
| See databases, sizes, connections | Operate → **PostgreSQL (dev)**, or Grafana → **Data → PostgreSQL** |
| Renew a service's certificate now | `kubectl -n <group> delete secret <name>-db-cert` (cert-manager reissues; the pod picks it up on restart) |
| Connect as a person, for debugging | a short-lived pod with the service's certificate mounted and `psql`; there's no shared admin login over the network |

## Troubleshooting

| Symptom | Likely cause | Check |
|---|---|---|
| Pod stuck in `ContainerCreating` | The certificate Secret isn't issued yet | `kubectl -n <group> get certificate <name>-db` |
| `certificate authentication failed` | `PGUSER` isn't the certificate's name | The chart sets both; check custom code isn't overriding the user |
| `certificate verify failed` / `hostname mismatch` | Connecting by another hostname | Use `PGHOST` (`postgres-rw.postgres.svc`) |
| `database … does not exist` | CloudNativePG hasn't created it yet | `kubectl -n postgres get database,databaserole`; look at `APPLIED` and the message |
| Java: can't read the key | pgjdbc and key formats | The key is PKCS#8; pass `sslkey` and check the driver version's supported formats |
| `no pg_hba.conf entry` / timeout | Network policy | The pod must carry the database client label (the chart adds it with `database.enabled`) |

## Migrations

The database starts **empty**; each service owns its structure through
**migrations**: `V<version>__<description>.sql` files in its repo's
`db/migrations/`. CI tests them on an empty Postgres and publishes a
migrations image (platform migrator + the files) with the app's tag; on every
deploy Argo CD runs a **migrate job** (sync wave 1) with the service's own
login, before the new version (wave 2). Each file runs in one transaction and
is recorded in `schema_migrations` with a checksum; an edited or missing
applied file stops the deploy and the running version stays. Developer guide:
[Database migrations](guides/database-migrations.md).

| Piece | Path |
|---|---|
| The migrator (`migrate.sh`, on `psql`) and its image | omarchy-k8s-portal `.github/actions/db-migrations/` |
| CI: test and publish | `container-service.yaml`, step *Database migrations* |
| The migrate Job and its network policy | omarchy-k8s-platform `charts/web-service/templates/migrations.yaml` |
| The example first migration | omarchy-k8s-portal `templates/_shared/database/` |

## Where it lives

| Piece | Path |
|---|---|
| Postgres cluster, its certificates, TLS-only `pg_hba` | omarchy-k8s-platform `charts/postgres/` |
| The Postgres CA and `postgres` ClusterIssuer | omarchy-k8s-platform `cluster-addons/gateway/templates/postgres-ca.yaml` |
| A service's Certificate, DatabaseRole, Database, `PG*` settings | omarchy-k8s-platform `charts/web-service/templates/database.yaml`, `deployment.yaml` |
| Metrics, dashboard, alerts | `charts/postgres/templates/podmonitor.yaml`, Grafana *Data → PostgreSQL*, alert group `databases` |
| Dropping a database | omarchy-k8s-ansible `make database-drop` (role `app_database`) |
