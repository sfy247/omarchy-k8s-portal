// Operate: 1 select an application and environment, 2 view its deployments,
// health and logs, 3 investigate (deep links) or request an action.
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useAsync from 'react-use/esm/useAsync';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';
import {
  Content,
  ContentHeader,
  EmptyState,
  Header,
  InfoCard,
  Link,
  Page,
  Progress,
  ResponseErrorPanel,
  StatusError,
  StatusOK,
  StatusPending,
  StatusWarning,
  Table,
  TableColumn,
} from '@backstage/core-components';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Step,
  StepLabel,
  Stepper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import RefreshIcon from '@material-ui/icons/Refresh';
import { AppDetail, AppSummary, LogLine, useOperateApi } from './api';
import { usePermission } from '@backstage/plugin-permission-react';
import { operateRestartPermission } from './permissions';

const ago = (iso?: string) => {
  if (!iso) return '–';
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 90) return `${s}s ago`;
  if (s < 5400) return `${Math.round(s / 60)}m ago`;
  if (s < 129600) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
};

function Status({ value }: { value?: string }) {
  switch (value) {
    case 'Healthy':
    case 'Synced':
    case 'Succeeded':
      return <StatusOK>{value}</StatusOK>;
    case 'Degraded':
    case 'Failed':
    case 'Error':
    case 'Missing':
      return <StatusError>{value}</StatusError>;
    case 'Progressing':
    case 'Running':
      return <StatusPending>{value}</StatusPending>;
    case undefined:
      return <>–</>;
    default:
      return <StatusWarning>{value}</StatusWarning>;
  }
}

// ---------------------------------------------------------------- 1 select
function ApplicationsTable({
  items,
  onSelect,
}: {
  items: AppSummary[];
  onSelect: (ref: string, env: string) => void;
}) {
  const envs = [
    ...new Set(items.flatMap(i => i.environments.map(e => e.environment))),
  ].sort();
  const columns: TableColumn<AppSummary>[] = [
    {
      title: 'Application',
      field: 'title',
      render: a => (
        <>
          <b>{a.title}</b>
          <Typography variant="caption" display="block">
            {a.description}
          </Typography>
        </>
      ),
    },
    { title: 'Group', field: 'group' },
    { title: 'Owner', field: 'owner' },
    ...envs.map(env => ({
      title: env,
      render: (a: AppSummary) => {
        const e = a.environments.find(x => x.environment === env);
        if (!e)
          return (
            <Typography variant="caption" color="textSecondary">
              not deployed
            </Typography>
          );
        return (
          <Button
            size="small"
            variant="outlined"
            onClick={() => onSelect(a.entityRef, env)}
          >
            <Box display="flex" flexDirection="column" alignItems="flex-start">
              <Status value={e.health} />
              <Typography variant="caption">
                {e.sync} · {ago(e.deployedAt)}
              </Typography>
            </Box>
          </Button>
        );
      },
    })),
  ];
  return (
    <Table<AppSummary>
      title="Application operations"
      subtitle="Every service in the catalog, per environment. Choose one to operate."
      options={{ paging: false, search: true, padding: 'dense' }}
      columns={columns}
      data={items}
    />
  );
}

// ---------------------------------------------------------------- 2 view
function Deployments({ d }: { d: AppDetail }) {
  const dep = d.deployment;
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <InfoCard title="Current deployment">
          <List dense>
            <ListItem>
              <ListItemText
                primary="Sync with Git"
                secondary={<Status value={dep.sync} />}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Platform revision"
                secondary={
                  dep.revisionUrl ? (
                    <Link to={dep.revisionUrl}>
                      {dep.revision?.slice(0, 7)}
                    </Link>
                  ) : (
                    dep.revision
                  )
                }
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Image" secondary={dep.image ?? '–'} />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Replicas ready"
                secondary={`${dep.readyReplicas} / ${dep.replicas ?? '–'}`}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Last sync"
                secondary={
                  <>
                    <Status value={dep.lastOperation?.phase} />{' '}
                    {ago(dep.lastOperation?.finishedAt)} ·{' '}
                    {dep.lastOperation?.message}
                  </>
                }
              />
            </ListItem>
          </List>
          {dep.conditions.map(c => (
            <Alert key={c.type} severity="warning">
              {c.type}: {c.message}
            </Alert>
          ))}
        </InfoCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <Table
          title="Deployment history"
          options={{
            paging: false,
            search: false,
            padding: 'dense',
            toolbar: true,
          }}
          columns={[
            {
              title: 'Deployed',
              render: (h: any) => (
                <span title={h.deployedAt}>{ago(h.deployedAt)}</span>
              ),
            },
            {
              title: 'Revision',
              render: (h: any) =>
                h.revisionUrl ? (
                  <Link to={h.revisionUrl}>{h.revision.slice(0, 7)}</Link>
                ) : (
                  h.revision.slice(0, 7)
                ),
            },
            { title: 'By', field: 'by' },
          ]}
          data={dep.history}
        />
      </Grid>
    </Grid>
  );
}

function Stat({
  label,
  value,
  bad,
}: {
  label: string;
  value: string;
  bad?: boolean;
}) {
  return (
    <Box
      p={2}
      border={1}
      borderColor={bad ? 'error.main' : 'divider'}
      borderRadius={4}
      textAlign="center"
    >
      <Typography variant="h4" color={bad ? 'error' : 'textPrimary'}>
        {value}
      </Typography>
      <Typography variant="caption">{label}</Typography>
    </Box>
  );
}

function Health({ d }: { d: AppDetail }) {
  const h = d.health;
  const s = h.signals;
  const errPct = s.errorRatio === null ? null : s.errorRatio * 100;
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Box display="flex" alignItems="center" style={{ gap: 16 }}>
          <Typography variant="h6">
            <Status value={h.status} />
          </Typography>
          <Typography variant="body2" color="textSecondary">
            since {ago(h.since)} {h.message}
          </Typography>
        </Box>
      </Grid>
      {h.alerts.length > 0 && (
        <Grid item xs={12}>
          {h.alerts.map(a => (
            <Alert
              key={a.name + a.since}
              severity={a.severity === 'critical' ? 'error' : 'warning'}
              action={
                a.dashboard && (
                  <Button size="small" href={a.dashboard} target="_blank">
                    Dashboard
                  </Button>
                )
              }
            >
              <b>{a.name}</b> · {a.summary} · firing {ago(a.since)}
            </Alert>
          ))}
        </Grid>
      )}
      <Grid item xs={4}>
        <Stat
          label="Requests / s (5m)"
          value={
            s.requestsPerSecond === null ? '–' : s.requestsPerSecond.toFixed(2)
          }
        />
      </Grid>
      <Grid item xs={4}>
        <Stat
          label="5xx errors"
          value={errPct === null ? '–' : `${errPct.toFixed(1)}%`}
          bad={(errPct ?? 0) > 5}
        />
      </Grid>
      <Grid item xs={4}>
        <Stat
          label="p95 latency"
          value={
            s.p95Seconds === null
              ? '–'
              : `${(s.p95Seconds * 1000).toFixed(0)} ms`
          }
          bad={(s.p95Seconds ?? 0) > 1}
        />
      </Grid>
      <Grid item xs={12}>
        <Table
          title="Pods"
          options={{ paging: false, search: false, padding: 'dense' }}
          columns={[
            { title: 'Pod', field: 'pod' },
            {
              title: 'Ready',
              render: (p: any) =>
                p.ready ? (
                  <StatusOK>Ready</StatusOK>
                ) : (
                  <StatusError>{p.waiting ?? 'Not ready'}</StatusError>
                ),
            },
            { title: 'Restarts', field: 'restarts' },
            {
              title: 'Last termination',
              render: (p: any) => p.lastTermination ?? '–',
            },
          ]}
          data={h.pods}
          emptyContent={<Box p={2}>No pods reported</Box>}
        />
      </Grid>
      <Grid item xs={12}>
        <Table
          title="Kubernetes events (6h)"
          options={{
            paging: false,
            search: false,
            padding: 'dense',
            maxBodyHeight: 360,
          }}
          columns={[
            { title: 'When', render: (e: any) => ago(e.ts) },
            {
              title: 'Reason',
              render: (e: any) =>
                e.type === 'Warning' ? (
                  <StatusWarning>{e.reason}</StatusWarning>
                ) : (
                  e.reason
                ),
            },
            {
              title: 'Message',
              render: (e: any) => (
                <Typography variant="caption">
                  {e.object}: {e.message}
                </Typography>
              ),
            },
          ]}
          data={h.events}
          emptyContent={<Box p={2}>No recent events</Box>}
        />
      </Grid>
    </Grid>
  );
}

function Level({ value }: { value: string }) {
  if (value === 'error') return <StatusError>error</StatusError>;
  if (value === 'warn') return <StatusWarning>warn</StatusWarning>;
  return <>{value}</>;
}

function summarize(line: string) {
  try {
    const j = JSON.parse(line);
    const { ts, time, level, msg, message, service, ...rest } = j;
    const extra = Object.entries(rest)
      .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join('  ');
    return (
      <>
        <b>{msg ?? message}</b>{' '}
        <Typography variant="caption" component="span" color="textSecondary">
          {extra}
        </Typography>
      </>
    );
  } catch {
    return <span style={{ fontFamily: 'monospace' }}>{line}</span>;
  }
}

function Logs({ d }: { d: AppDetail }) {
  const call = useOperateApi();
  const [level, setLevel] = useState('all');
  const [since, setSince] = useState('21600');
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const logs = useAsyncRetry(
    () =>
      call<{ query: string; items: LogLine[] }>(
        `/applications/${d.target.argoApp}/logs?${new URLSearchParams({
          level,
          since,
          q: query,
        })}`,
      ),
    [d.target.argoApp, level, since, query],
  );
  return (
    <>
      <Box
        display="flex"
        style={{ gap: 12 }}
        mb={2}
        alignItems="center"
        flexWrap="wrap"
      >
        <TextField
          select
          size="small"
          variant="outlined"
          label="Level"
          value={level}
          onChange={e => setLevel(e.target.value)}
        >
          {['all', 'error', 'warn', 'info', 'debug'].map(l => (
            <MenuItem key={l} value={l}>
              {l === 'warn' ? 'warn + error' : l}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          variant="outlined"
          label="Since"
          value={since}
          onChange={e => setSince(e.target.value)}
        >
          {[
            ['900', '15 minutes'],
            ['3600', '1 hour'],
            ['21600', '6 hours'],
            ['86400', '24 hours'],
            ['604800', '7 days'],
          ].map(([v, l]) => (
            <MenuItem key={v} value={v}>
              {l}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          variant="outlined"
          label="Contains"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setQuery(text)}
        />
        <Button
          startIcon={<RefreshIcon />}
          onClick={() => {
            setQuery(text);
            logs.retry();
          }}
        >
          Search
        </Button>
        {d.links.logs && (
          <Button
            endIcon={<OpenInNewIcon />}
            href={d.links.logs}
            target="_blank"
          >
            Logs Explorer
          </Button>
        )}
      </Box>
      {logs.error && <ResponseErrorPanel error={logs.error} />}
      {logs.loading ? (
        <Progress />
      ) : (
        <Table<LogLine>
          options={{
            paging: true,
            pageSize: 25,
            search: false,
            padding: 'dense',
            toolbar: false,
          }}
          columns={[
            {
              title: 'Time',
              width: '170px',
              render: l => (
                <Typography variant="caption">
                  {new Date(l.ts).toLocaleString()}
                </Typography>
              ),
            },
            {
              title: 'Level',
              width: '90px',
              render: l => <Level value={l.level} />,
            },
            { title: 'Message', render: l => summarize(l.line) },
          ]}
          data={logs.value?.items ?? []}
          emptyContent={
            <Box p={2}>
              No log lines match. Try a longer time range or level "all".
            </Box>
          }
        />
      )}
      {logs.value && (
        <Typography variant="caption" color="textSecondary">
          LogQL: <code>{logs.value.query}</code>
        </Typography>
      )}
    </>
  );
}

// ---------------------------------------------------------------- 3 investigate / act
function Investigate({ d }: { d: AppDetail }) {
  const items: [string, string | undefined, string][] = [
    [
      'Service Health dashboard',
      d.links.serviceHealth,
      'Golden signals, error logs and events side by side',
    ],
    [
      'Pod troubleshooting',
      d.links.pods,
      'Restarts, OOM kills, CPU and memory vs limits',
    ],
    ['Logs Explorer', d.links.logs, 'Search every log line'],
    ['Argo CD', d.links.argocd, 'Desired vs live state, diffs, sync history'],
    ['Catalog page', d.links.catalog, 'Ownership, docs, Kubernetes tab'],
    ['Open the application', d.links.app, d.target.hostname ?? ''],
  ];
  return (
    <InfoCard title="Investigate">
      <List dense>
        {items
          .filter(([, url]) => url)
          .map(([title, url, hint]) => (
            <ListItem
              key={title}
              button
              component="a"
              href={url!}
              target={url!.startsWith('/') ? undefined : '_blank'}
            >
              <ListItemIcon>
                <OpenInNewIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={title} secondary={hint} />
            </ListItem>
          ))}
      </List>
    </InfoCard>
  );
}

function RequestAction({
  d,
  onRestarted,
}: {
  d: AppDetail;
  onRestarted: () => void;
}) {
  const call = useOperateApi();
  const [confirm, setConfirm] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string }>();
  // Owners (and the platform team) may change a service; the backend and the
  // templates enforce this, here it only shapes the buttons
  const { allowed: isOwner, loading: checking } = usePermission({
    permission: operateRestartPermission,
    resourceRef: d.entityRef,
  });
  const canChange = Boolean(d.entityRef) && isOwner;
  const form = (template: string, extra: object = {}) =>
    `/create/templates/default/${template}?${new URLSearchParams({
      formData: JSON.stringify({
        service: d.entityRef,
        environment: d.target.environment,
        ...extra,
      }),
    })}`;
  const restart = async () => {
    setConfirm(false);
    try {
      await call(`/applications/${d.target.argoApp}/restart`, {
        method: 'POST',
      });
      setResult({
        ok: true,
        text: 'Rolling restart started. New pods appear under Health within a minute.',
      });
      setTimeout(onRestarted, 5000);
    } catch (e) {
      setResult({ ok: false, text: String(e) });
    }
  };
  // [title, link, hint, owners only]
  const actions: [string, string, string, boolean][] = [
    ['Scale', form('scale-service'), 'Change the number of replicas', true],
    [
      'Change resources',
      form('change-resources'),
      'CPU and memory requests and limits',
      true,
    ],
    [
      'Add a database',
      form('add-database'),
      'Postgres access for this service',
      true,
    ],
    [
      'Deploy to another environment',
      form('deploy-service', { firstDeploy: false }),
      'Promote it',
      true,
    ],
    [
      'Request help',
      form('request-help'),
      'Open an issue for the platform team, with this context attached',
      false,
    ],
  ];
  return (
    <InfoCard title="Request action">
      <Typography variant="body2" color="textSecondary" paragraph>
        Changes go through a pull request to the platform repo, reviewed and
        applied by Argo CD. A restart is immediate and recorded in Argo CD.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setConfirm(true)}
        disabled={!canChange}
      >
        Restart now
      </Button>
      {!checking && !canChange && d.entityRef && (
        <Box mt={1}>
          <Alert severity="info">
            Only the team that owns this service (or the platform team) can
            restart or change it. You can still request help.
          </Alert>
        </Box>
      )}
      {result && (
        <Box mt={1}>
          <Alert severity={result.ok ? 'success' : 'error'}>
            {result.text}
          </Alert>
        </Box>
      )}
      <List dense>
        {actions.map(([title, url, hint, ownersOnly]) => (
          <ListItem
            key={title}
            button
            component="a"
            href={url}
            disabled={!d.entityRef || (ownersOnly && !canChange)}
          >
            <ListItemText primary={title} secondary={hint} />
          </ListItem>
        ))}
      </List>
      <Dialog open={confirm} onClose={() => setConfirm(false)}>
        <DialogTitle>
          Restart {d.title} in {d.target.environment}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Pods are replaced one at a time, so the service stays up if it runs
            more than one replica. With one replica expect a few seconds of
            errors.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(false)}>Cancel</Button>
          <Button color="primary" variant="contained" onClick={restart}>
            Restart
          </Button>
        </DialogActions>
      </Dialog>
    </InfoCard>
  );
}

// ---------------------------------------------------------------- page
const STEPS = [
  'Select application and environment',
  'View deployments, health and logs',
  'Investigate or request action',
];

export function OperatePage() {
  const call = useOperateApi();
  const [params, setParams] = useSearchParams();
  const selectedRef = params.get('app') ?? '';
  const selectedEnv = params.get('env') ?? '';
  const view = params.get('view') ?? 'health';
  const apps = useAsync(
    () => call<{ items: AppSummary[] }>('/applications'),
    [],
  );
  const items = apps.value?.items ?? [];
  const app = items.find(a => a.entityRef === selectedRef);
  const env =
    app?.environments.find(e => e.environment === selectedEnv) ??
    app?.environments[0];
  const detail = useAsyncRetry(
    async () =>
      env ? call<AppDetail>(`/applications/${env.argoApp}`) : undefined,
    [env?.argoApp],
  );
  // Keep health fresh while someone is looking at it
  useEffect(() => {
    if (!env) return undefined;
    const id = setInterval(() => detail.retry(), 30_000);
    return () => clearInterval(id);
  }, [env, detail]);

  const select = (ref: string, e?: string, v = view) => {
    const next = new URLSearchParams();
    if (ref) next.set('app', ref);
    if (e) next.set('env', e);
    if (ref) next.set('view', v);
    setParams(next);
  };

  return (
    <Page themeId="tool">
      <Header
        title="Operate"
        subtitle="Run what you've built: check deployments, health and logs, then investigate or act"
      />
      <Content>
        <Stepper
          activeStep={!env ? 0 : 1}
          alternativeLabel
          style={{ background: 'transparent', padding: '0 0 16px' }}
        >
          {STEPS.map(s => (
            <Step key={s}>
              <StepLabel>{s}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {apps.loading && <Progress />}
        {apps.error && <ResponseErrorPanel error={apps.error} />}
        {apps.value && items.length === 0 && (
          <EmptyState
            missing="data"
            title="No running applications yet"
            description="Applications appear here once they're in the catalog and deployed to an environment. Start with Create."
          />
        )}
        {apps.value && items.length > 0 && (
          <>
            <ContentHeader title="1. Select application and environment">
              <Box display="flex" style={{ gap: 12 }}>
                <TextField
                  select
                  size="small"
                  variant="outlined"
                  label="Application"
                  style={{ minWidth: 260 }}
                  value={app?.entityRef ?? ''}
                  onChange={e => select(e.target.value, undefined)}
                >
                  {items.map(a => (
                    <MenuItem key={a.entityRef} value={a.entityRef}>
                      {a.title}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  variant="outlined"
                  label="Environment"
                  style={{ minWidth: 140 }}
                  value={env?.environment ?? ''}
                  disabled={!app}
                  onChange={e => select(selectedRef, e.target.value)}
                >
                  {(app?.environments ?? []).map(e => (
                    <MenuItem key={e.environment} value={e.environment}>
                      {e.environment}
                    </MenuItem>
                  ))}
                </TextField>
                {app && (
                  <Button onClick={() => select('')}>All applications</Button>
                )}
              </Box>
            </ContentHeader>
            {!app && (
              <ApplicationsTable
                items={items}
                onSelect={(r, e) => select(r, e)}
              />
            )}
          </>
        )}
        {app && env && (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <ContentHeader title={`2. ${app.title} in ${env.environment}`}>
                <Button startIcon={<RefreshIcon />} onClick={detail.retry}>
                  Refresh
                </Button>
              </ContentHeader>
              <Tabs
                value={view}
                onChange={(_, v) => select(selectedRef, env.environment, v)}
                indicatorColor="primary"
              >
                <Tab value="deployments" label="Deployments" />
                <Tab
                  value="health"
                  label={
                    <Box display="flex" style={{ gap: 6 }}>
                      Health{' '}
                      {detail.value?.health.alerts.length ? (
                        <Chip
                          size="small"
                          color="secondary"
                          label={detail.value.health.alerts.length}
                        />
                      ) : null}
                    </Box>
                  }
                />
                <Tab value="logs" label="Logs" />
              </Tabs>
              <Box mt={2}>
                {detail.error && <ResponseErrorPanel error={detail.error} />}
                {!detail.value && detail.loading && <Progress />}
                {detail.value && view === 'deployments' && (
                  <Deployments d={detail.value} />
                )}
                {detail.value && view === 'health' && (
                  <Health d={detail.value} />
                )}
                {detail.value && view === 'logs' && <Logs d={detail.value} />}
              </Box>
            </Grid>
            <Grid item xs={12} lg={4}>
              <ContentHeader title="3. Investigate or request action" />
              {detail.value && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Investigate d={detail.value} />
                  </Grid>
                  <Grid item xs={12}>
                    <RequestAction
                      d={detail.value}
                      onRestarted={detail.retry}
                    />
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        )}
      </Content>
    </Page>
  );
}
