// Operate → Deployments: where a change is, from commit to running pods
// (GitHub Actions and Argo CD, linked by commit SHA), plus CI runs and the
// Argo CD deploy history. Read-only; details link out to GitHub / Argo CD.
import {
  Link,
  StatusAborted,
  StatusError,
  StatusOK,
  StatusPending,
  StatusRunning,
  Table,
} from '@backstage/core-components';
import { Box, Chip, Paper, Typography, makeStyles } from '@material-ui/core';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { Pipeline as PipelineData, PipelineStage, StageState } from './api';

const useStyles = makeStyles(theme => ({
  // Three stages per row on wide screens, wrapping on narrow ones
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    rowGap: 12,
  },
  cell: {
    display: 'flex',
    gap: 6,
    flex: '1 0 30%',
    minWidth: 200,
  },
  stage: {
    flex: '1 1 0',
    minWidth: 150,
    padding: theme.spacing(1.5),
    borderTop: `3px solid ${theme.palette.divider}`,
  },
  ok: { borderTopColor: theme.palette.success.main },
  running: { borderTopColor: theme.palette.info.main },
  failed: { borderTopColor: theme.palette.error.main },
  waiting: { borderTopColor: theme.palette.warning.main },
  skipped: { opacity: 0.6 },
  arrow: { alignSelf: 'center', color: theme.palette.text.secondary },
  summary: { fontWeight: 600, wordBreak: 'break-word' },
}));

export const ago = (iso?: string) => {
  if (!iso) return '';
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 90) return `${s}s ago`;
  if (s < 5400) return `${Math.round(s / 60)}m ago`;
  if (s < 129600) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
};

const duration = (from: string, to: string) => {
  const s = Math.max(
    0,
    Math.round((new Date(to).getTime() - new Date(from).getTime()) / 1000),
  );
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
};

function StateIcon({
  state,
  children,
}: {
  state: StageState;
  children?: React.ReactNode;
}) {
  if (state === 'ok') return <StatusOK>{children}</StatusOK>;
  if (state === 'failed') return <StatusError>{children}</StatusError>;
  if (state === 'running') return <StatusRunning>{children}</StatusRunning>;
  if (state === 'waiting') return <StatusPending>{children}</StatusPending>;
  return <StatusAborted>{children}</StatusAborted>;
}

function Stage({ s }: { s: PipelineStage }) {
  const classes = useStyles();
  const body = (
    <>
      <Typography variant="overline">
        <StateIcon state={s.state}>{s.title}</StateIcon>
      </Typography>
      <Typography variant="body2" className={classes.summary}>
        {s.summary}
      </Typography>
      {s.detail && (
        <Typography
          variant="caption"
          color="textSecondary"
          display="block"
          noWrap
          title={s.detail}
        >
          {s.detail}
        </Typography>
      )}
      {s.at && (
        <Typography variant="caption" color="textSecondary">
          {ago(s.at)}
        </Typography>
      )}
    </>
  );
  return (
    <Paper
      variant="outlined"
      className={`${classes.stage} ${classes[s.state]}`}
    >
      {s.url ? <Link to={s.url}>{body}</Link> : body}
    </Paper>
  );
}

export function DeliveryPipeline({ p }: { p: PipelineData }) {
  const classes = useStyles();
  return (
    <Box className={classes.row}>
      {p.stages.map((s, i) => (
        <Box key={s.key} className={classes.cell}>
          {i > 0 && (
            <ArrowForwardIcon className={classes.arrow} fontSize="small" />
          )}
          <Stage s={s} />
        </Box>
      ))}
    </Box>
  );
}

function RunStatus({ r }: { r: PipelineData['runs'][number] }) {
  if (r.status !== 'completed')
    return <StatusRunning>{r.status.replace('_', ' ')}</StatusRunning>;
  if (r.conclusion === 'success') return <StatusOK>success</StatusOK>;
  if (r.conclusion === 'cancelled' || r.conclusion === 'skipped')
    return <StatusAborted>{r.conclusion}</StatusAborted>;
  return <StatusError>{r.conclusion}</StatusError>;
}

export function CiRuns({ p }: { p: PipelineData }) {
  return (
    <Table
      title={
        <Box display="flex" alignItems="baseline" style={{ gap: 12 }}>
          GitHub Actions runs
          {p.repo && (
            <Typography variant="body2">
              <Link to={`${p.repo}/actions`}>All runs on GitHub</Link>
            </Typography>
          )}
        </Box>
      }
      options={{ paging: false, search: false, padding: 'dense' }}
      columns={[
        {
          title: 'Run',
          render: (r: any) => (
            <Link to={r.url}>
              {r.name} #{r.number}
            </Link>
          ),
        },
        {
          title: 'Commit',
          render: (r: any) => (
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
        { title: 'Status', render: (r: any) => <RunStatus r={r} /> },
        { title: 'Started', render: (r: any) => ago(r.startedAt) },
        {
          title: 'Duration',
          render: (r: any) => duration(r.startedAt, r.updatedAt),
        },
        {
          title: '',
          render: (r: any) =>
            r.deployed ? (
              <Chip size="small" color="primary" label="running" />
            ) : null,
        },
      ]}
      data={p.runs}
      emptyContent={
        <Box p={2}>
          {p.repo
            ? 'No workflow runs yet.'
            : "This service's image isn't built by its own GitHub Actions workflow."}
        </Box>
      }
    />
  );
}

export function DeployHistory({
  p,
  argocdUrl,
}: {
  p: PipelineData;
  argocdUrl?: string;
}) {
  return (
    <Table
      title={
        <Box display="flex" alignItems="baseline" style={{ gap: 12 }}>
          Argo CD deploys
          {argocdUrl && (
            <Typography variant="body2">
              <Link to={argocdUrl}>Open in Argo CD</Link>
            </Typography>
          )}
        </Box>
      }
      options={{ paging: false, search: false, padding: 'dense' }}
      columns={[
        {
          title: 'Deployed',
          render: (h: any) => (
            <span title={h.deployedAt}>{ago(h.deployedAt)}</span>
          ),
        },
        {
          title: 'What changed (platform commit)',
          render: (h: any) => (
            <>
              {h.url ? (
                <Link to={h.url}>{h.message ?? h.revision.slice(0, 7)}</Link>
              ) : (
                h.revision.slice(0, 7)
              )}
              <Typography
                variant="caption"
                color="textSecondary"
                display="block"
              >
                {h.revision.slice(0, 7)}
                {h.author ? ` · ${h.author}` : ''}
              </Typography>
            </>
          ),
        },
        { title: 'Synced by', field: 'by' },
      ]}
      data={p.history}
    />
  );
}
