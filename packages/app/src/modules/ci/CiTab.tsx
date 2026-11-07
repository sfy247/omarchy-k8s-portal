// CI/CD tab on a service's page: its GitHub Actions runs, live. While a run is
// queued or running the tab refreshes every 5 seconds, so you can watch a run
// you just triggered move through its jobs and steps; otherwise every 30s.
import { useEffect, useState } from 'react';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  EmptyState,
  InfoCard,
  Link,
  Progress,
  ResponseErrorPanel,
  StatusAborted,
  StatusError,
  StatusOK,
  StatusPending,
  StatusRunning,
  Table,
} from '@backstage/core-components';
import { Box, Chip, Grid, Typography, makeStyles } from '@material-ui/core';
import { useOperateApi } from '../operate/api';
import { ago } from '../operate/Pipeline';

type Step = {
  name: string;
  status: string;
  conclusion: string | null;
  startedAt?: string;
  completedAt?: string;
};
type Job = {
  name: string;
  status: string;
  conclusion: string | null;
  startedAt?: string;
  completedAt?: string;
  url: string;
  steps: Step[];
};
type Run = {
  id: number;
  name: string;
  number: number;
  status: string;
  conclusion: string | null;
  event: string;
  branch: string;
  sha: string;
  message: string;
  author?: string;
  startedAt: string;
  updatedAt: string;
  url: string;
};
type Ci = { repo: string; runs: Run[]; focus?: { run: Run; jobs: Job[] } };

const useStyles = makeStyles(theme => ({
  live: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    marginRight: 6,
    background: theme.palette.success.main,
    animation: '$pulse 1.2s ease-in-out infinite',
  },
  '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.2 } },
  job: {
    borderLeft: `3px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
  },
  selected: { background: theme.palette.action.selected },
}));

const elapsed = (from?: string, to?: string) => {
  if (!from) return '';
  const s = Math.max(
    0,
    Math.round(
      ((to ? new Date(to) : new Date()).getTime() - new Date(from).getTime()) /
        1000,
    ),
  );
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
};

/** queued / in_progress / completed + conclusion → one status badge */
function State({
  status,
  conclusion,
  label,
}: {
  status: string;
  conclusion: string | null;
  label?: string;
}) {
  const text =
    label ??
    (status === 'completed' ? conclusion ?? 'done' : status.replace('_', ' '));
  if (status === 'queued' || status === 'waiting' || status === 'pending')
    return <StatusPending>{text}</StatusPending>;
  if (status !== 'completed') return <StatusRunning>{text}</StatusRunning>;
  if (conclusion === 'success') return <StatusOK>{text}</StatusOK>;
  if (
    conclusion === 'skipped' ||
    conclusion === 'cancelled' ||
    conclusion === 'neutral'
  )
    return <StatusAborted>{text}</StatusAborted>;
  return <StatusError>{text}</StatusError>;
}

function Jobs({ run, jobs }: { run: Run; jobs: Job[] }) {
  const classes = useStyles();
  // Re-render every second so running durations tick
  const [, tick] = useState(0);
  useEffect(() => {
    if (run.status === 'completed') return undefined;
    const id = setInterval(() => tick(n => n + 1), 1000);
    return () => clearInterval(id);
  }, [run.status]);
  return (
    <InfoCard
      title={
        <Box display="flex" alignItems="center" style={{ gap: 12 }}>
          <Link to={run.url}>
            {run.name} #{run.number}
          </Link>
          <State status={run.status} conclusion={run.conclusion} />
        </Box>
      }
      subheader={`${run.message} · ${run.sha.slice(0, 7)} by ${
        run.author ?? 'unknown'
      } · ${run.event} on ${run.branch} · started ${ago(
        run.startedAt,
      )} · ${elapsed(
        run.startedAt,
        run.status === 'completed' ? run.updatedAt : undefined,
      )}`}
    >
      {jobs.length === 0 && (
        <Typography variant="body2">
          Waiting for a runner to pick up the jobs…
        </Typography>
      )}
      <Grid container spacing={2}>
        {jobs.map(j => (
          <Grid item xs={12} md={6} key={j.name}>
            <Box className={classes.job}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Link to={j.url}>
                  <b>{j.name}</b>
                </Link>
                <Typography variant="caption" color="textSecondary">
                  {elapsed(j.startedAt, j.completedAt)}
                </Typography>
              </Box>
              {j.steps.map(s => (
                <Box
                  key={s.name}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="body2"
                    component="span"
                    noWrap
                    title={s.name}
                    style={{ maxWidth: '75%' }}
                  >
                    <State
                      status={s.status}
                      conclusion={s.conclusion}
                      label={s.name}
                    />
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {s.status === 'completed' || s.status === 'in_progress'
                      ? elapsed(s.startedAt, s.completedAt)
                      : ''}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        ))}
      </Grid>
    </InfoCard>
  );
}

export function CiTab() {
  const classes = useStyles();
  const { entity } = useEntity();
  const ref = stringifyEntityRef(entity);
  const call = useOperateApi();
  const [selected, setSelected] = useState<number>();
  const ci = useAsyncRetry(
    () => call<Ci>(`/ci?${new URLSearchParams({ entity: ref })}`),
    [ref],
  );
  const live = Boolean(ci.value?.runs.some(r => r.status !== 'completed'));
  const chosen = ci.value?.runs.find(r => r.id === selected);
  const chosenJobs = useAsyncRetry(
    async () =>
      chosen
        ? (
            await call<{ jobs: Job[] }>(
              `/ci/runs/${chosen.id}/jobs?${new URLSearchParams({
                entity: ref,
              })}`,
            )
          ).jobs
        : undefined,
    [chosen?.id, chosen?.status, chosen?.updatedAt],
  );

  // Poll: fast while anything runs, slow otherwise
  const { retry } = ci;
  useEffect(() => {
    const id = setInterval(retry, live ? 5_000 : 30_000);
    return () => clearInterval(id);
  }, [retry, live]);

  if (ci.error) return <ResponseErrorPanel error={ci.error} />;
  if (!ci.value) return <Progress />;
  const { repo, runs, focus } = ci.value;
  if (runs.length === 0) {
    return (
      <EmptyState
        missing="data"
        title="No GitHub Actions runs yet"
        description={`Push to ${repo} and the run appears here within seconds.`}
      />
    );
  }
  const shown =
    chosen && chosenJobs.value
      ? { run: chosen, jobs: chosenJobs.value }
      : focus;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box display="flex" alignItems="center" style={{ gap: 12 }}>
          <Typography variant="body2">
            {live ? <span className={classes.live} /> : null}
            {live
              ? 'A run is in progress: updating every 5 seconds'
              : 'Updating every 30 seconds'}
          </Typography>
          <Link to={`${repo}/actions`}>All runs on GitHub</Link>
          {chosen && (
            <Chip
              size="small"
              label="Back to the latest run"
              onClick={() => setSelected(undefined)}
            />
          )}
        </Box>
      </Grid>
      {shown && (
        <Grid item xs={12}>
          <Jobs run={shown.run} jobs={shown.jobs} />
        </Grid>
      )}
      <Grid item xs={12}>
        <Table<Run>
          title="Workflow runs"
          options={{
            paging: false,
            search: false,
            padding: 'dense',
            rowStyle: (r: Run) =>
              r.id === shown?.run.id ? { fontWeight: 600 } : {},
          }}
          onRowClick={(_, r) => r && setSelected(r.id)}
          columns={[
            { title: 'Run', render: r => `${r.name} #${r.number}` },
            {
              title: 'Commit',
              render: r => (
                <>
                  {r.message}
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    display="block"
                  >
                    {r.sha.slice(0, 7)} · {r.author} · {r.event} on {r.branch}
                  </Typography>
                </>
              ),
            },
            {
              title: 'Status',
              render: r => (
                <State status={r.status} conclusion={r.conclusion} />
              ),
            },
            { title: 'Started', render: r => ago(r.startedAt) },
            {
              title: 'Duration',
              render: r =>
                elapsed(
                  r.startedAt,
                  r.status === 'completed' ? r.updatedAt : undefined,
                ),
            },
            { title: '', render: r => <Link to={r.url}>GitHub</Link> },
          ]}
          data={runs}
        />
      </Grid>
    </Grid>
  );
}
