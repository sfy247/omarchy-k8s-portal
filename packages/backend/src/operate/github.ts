// Read-only GitHub client for Operate's delivery pipeline: workflow runs and
// commits, with the portal's own GitHub integration credentials (users don't
// grant anything). Responses are cached briefly; commits by SHA for longer.
import { Config } from '@backstage/config';
import {
  DefaultGithubCredentialsProvider,
  ScmIntegrations,
} from '@backstage/integration';

export type WorkflowRun = {
  id: number;
  name: string;
  number: number;
  status: string; // queued | in_progress | completed
  conclusion: string | null; // success | failure | cancelled | ...
  event: string;
  branch: string;
  sha: string;
  message: string;
  author?: string;
  startedAt: string;
  updatedAt: string;
  url: string;
};

export type Commit = {
  sha: string;
  message: string;
  author?: string;
  date?: string;
  url: string;
};

export class GitHub {
  private readonly cache = new Map<string, { until: number; value: unknown }>();
  private readonly credentials: DefaultGithubCredentialsProvider;

  constructor(config: Config) {
    this.credentials = DefaultGithubCredentialsProvider.fromIntegrations(
      ScmIntegrations.fromConfig(config),
    );
  }

  private async get<T>(slug: string, path: string, ttlMs: number): Promise<T> {
    const key = `${slug}${path}`;
    const hit = this.cache.get(key);
    if (hit && hit.until > Date.now()) return hit.value as T;
    const { token } = await this.credentials.getCredentials({
      url: `https://github.com/${slug}`,
    });
    const res = await fetch(`https://api.github.com/repos/${slug}${path}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok)
      throw new Error(`GitHub ${slug}${path.split('?')[0]}: ${res.status}`);
    const value = (await res.json()) as T;
    this.cache.set(key, { until: Date.now() + ttlMs, value });
    return value;
  }

  async runs(slug: string, limit = 10): Promise<WorkflowRun[]> {
    const res = await this.get<any>(
      slug,
      `/actions/runs?per_page=${limit}`,
      15_000,
    );
    return res.workflow_runs.map((r: any) => ({
      id: r.id,
      name: r.name,
      number: r.run_number,
      status: r.status,
      conclusion: r.conclusion,
      event: r.event,
      branch: r.head_branch,
      sha: r.head_sha,
      message: (r.head_commit?.message ?? r.display_title ?? '').split('\n')[0],
      author: r.head_commit?.author?.name ?? r.actor?.login,
      startedAt: r.run_started_at,
      updatedAt: r.updated_at,
      url: r.html_url,
    }));
  }

  /** Jobs and steps of one run (to name the step that failed). */
  async jobs(slug: string, runId: number) {
    const res = await this.get<any>(
      slug,
      `/actions/runs/${runId}/jobs`,
      15_000,
    );
    return res.jobs.map((j: any) => ({
      name: j.name,
      status: j.status,
      conclusion: j.conclusion,
      startedAt: j.started_at,
      completedAt: j.completed_at,
      url: j.html_url,
      steps: (j.steps ?? []).map((s: any) => ({
        name: s.name,
        status: s.status,
        conclusion: s.conclusion,
      })),
    }));
  }

  async commit(slug: string, sha: string): Promise<Commit> {
    // A commit never changes: cache it for a day
    const c = await this.get<any>(slug, `/commits/${sha}`, 24 * 3600_000);
    return {
      sha: c.sha,
      message: c.commit.message.split('\n')[0],
      author: c.commit.author?.name ?? c.author?.login,
      date: c.commit.author?.date,
      url: c.html_url,
    };
  }
}
