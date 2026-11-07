// Operate → Health for a database: the numbers that matter to the apps using
// it, and one row per app database so a team can find its own.
import { StatusError, StatusOK, Table } from '@backstage/core-components';
import { Box, Grid, Typography } from '@material-ui/core';
import { DatabaseHealth as Data } from './api';

const bytes = (n: number | null) => {
  if (n === null) return '–';
  const u = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
};
const pct = (r: number | null) =>
  r === null ? '–' : `${(r * 100).toFixed(r > 0.995 && r < 1 ? 2 : 1)}%`;
const yesNo = (b: boolean | null) => {
  if (b === null) return '–';
  return b ? 'Yes' : 'No';
};
const num = (n: number | null, d = 1) => (n === null ? '–' : n.toFixed(d));

function Stat({
  label,
  value,
  hint,
  bad,
}: {
  label: string;
  value: string;
  hint?: string;
  bad?: boolean;
}) {
  return (
    <Box
      p={2}
      border={1}
      borderColor={bad ? 'error.main' : 'divider'}
      borderRadius={4}
      textAlign="center"
      height="100%"
    >
      <Typography variant="h5" color={bad ? 'error' : 'textPrimary'}>
        {value}
      </Typography>
      <Typography variant="caption" display="block">
        {label}
      </Typography>
      {hint && (
        <Typography variant="caption" color="textSecondary">
          {hint}
        </Typography>
      )}
    </Box>
  );
}

export function DatabaseHealth({ db }: { db: Data }) {
  const connRatio =
    db.connections.used !== null && db.connections.max
      ? db.connections.used / db.connections.max
      : null;
  const storageRatio =
    db.storage.usedBytes !== null && db.storage.capacityBytes
      ? db.storage.usedBytes / db.storage.capacityBytes
      : null;
  const stats: [string, string, string | undefined, boolean][] = [
    ['Up', yesNo(db.up), 'every instance answers', db.up === false],
    [
      'Connections',
      `${num(db.connections.used, 0)} / ${num(db.connections.max, 0)}`,
      pct(connRatio),
      (connRatio ?? 0) > 0.8,
    ],
    [
      'Transactions / s',
      num(db.transactionsPerSecond, 2),
      'commits + rollbacks, 5m',
      false,
    ],
    [
      'Cache hit',
      pct(db.cacheHitRatio),
      'reads served from memory',
      db.cacheHitRatio !== null && db.cacheHitRatio < 0.9,
    ],
    [
      'Storage',
      bytes(db.storage.usedBytes),
      `${pct(storageRatio)} of ${bytes(db.storage.capacityBytes)}`,
      (storageRatio ?? 0) > 0.8,
    ],
    [
      'Deadlocks (1h)',
      num(db.deadlocksLastHour, 0),
      undefined,
      (db.deadlocksLastHour ?? 0) > 0,
    ],
    [
      'Longest transaction',
      db.longestTransactionSeconds === null
        ? '–'
        : `${num(db.longestTransactionSeconds, 0)} s`,
      'open right now',
      (db.longestTransactionSeconds ?? 0) > 300,
    ],
    [
      'Replication lag',
      db.replicationLagSeconds === null
        ? '–'
        : `${num(db.replicationLagSeconds, 0)} s`,
      'replicas behind the primary',
      (db.replicationLagSeconds ?? 0) > 30,
    ],
  ];
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">
          {db.up === false ? (
            <StatusError>Down</StatusError>
          ) : (
            <StatusOK>Serving</StatusOK>
          )}
        </Typography>
      </Grid>
      {stats.map(([label, value, hint, bad]) => (
        <Grid item xs={6} md={3} key={label}>
          <Stat label={label} value={value} hint={hint} bad={bad} />
        </Grid>
      ))}
      <Grid item xs={12}>
        <Table
          title="Databases"
          subtitle="One per app: find yours by name"
          options={{ paging: false, search: false, padding: 'dense' }}
          columns={[
            { title: 'Database', field: 'name' },
            {
              title: 'Size',
              render: (r: Data['databases'][number]) => bytes(r.sizeBytes),
            },
            { title: 'Connections', field: 'connections' },
            {
              title: 'Transactions / s',
              render: (r: Data['databases'][number]) =>
                num(r.transactionsPerSecond, 2),
            },
            {
              title: 'Deadlocks (1h)',
              render: (r: Data['databases'][number]) =>
                (r.deadlocksLastHour ?? 0) > 0 ? (
                  <StatusError>{num(r.deadlocksLastHour, 0)}</StatusError>
                ) : (
                  num(r.deadlocksLastHour, 0)
                ),
            },
          ]}
          data={db.databases}
        />
      </Grid>
    </Grid>
  );
}
