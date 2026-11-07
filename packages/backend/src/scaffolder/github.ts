// GitHub scaffolder actions for continuous delivery by Git.
//
//   platform:ci-credentials  give a new service repo what its CI needs to
//                            deploy: repo variables GITOPS_REPOSITORY and
//                            GITOPS_APP_ID, secret GITOPS_APP_PRIVATE_KEY
//                            (the GitOps GitHub App), from platform.gitops.*
//   platform:head-commit     the latest commit (and name) of a repo's default
//                            branch (its CI tags images sha-<commit>)
import { Config } from '@backstage/config';
import {
  DefaultGithubCredentialsProvider,
  ScmIntegrations,
} from '@backstage/integration';
import {
  createTemplateAction,
  parseRepoUrl,
} from '@backstage/plugin-scaffolder-node';
import { InputError } from '@backstage/errors';
import sodium from 'libsodium-wrappers';

function githubClient(config: Config) {
  const integrations = ScmIntegrations.fromConfig(config);
  const credentials =
    DefaultGithubCredentialsProvider.fromIntegrations(integrations);
  return {
    integrations,
    async call(
      owner: string,
      repo: string,
      path: string,
      init: RequestInit = {},
    ) {
      const { token } = await credentials.getCredentials({
        url: `https://github.com/${owner}/${repo}`,
      });
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}${path}`,
        {
          ...init,
          headers: {
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      if (!res.ok)
        throw new Error(
          `GitHub ${init.method ?? 'GET'} ${path}: ${res.status} ${(
            await res.text()
          ).slice(0, 200)}`,
        );
      return res.status === 204 || res.status === 201 ? undefined : res.json();
    },
  };
}

export function createCiCredentialsAction(config: Config) {
  const gh = githubClient(config);
  const gitops = config.getOptionalConfig('platform.gitops');
  return createTemplateAction({
    id: 'platform:ci-credentials',
    description: "Give a repo's CI the GitOps deploy credentials",
    supportsDryRun: true,
    schema: {
      input: {
        repoUrl: z =>
          z.string().describe('The service repo (RepoUrlPicker value)'),
      },
    },
    async handler(ctx) {
      if (!gitops) {
        ctx.logger.warn(
          'platform.gitops is not configured: CI will build images but not deploy them',
        );
        return;
      }
      const { owner, repo } = parseRepoUrl(ctx.input.repoUrl, gh.integrations);
      if (!owner) throw new InputError('repoUrl needs an owner');
      if (ctx.isDryRun) {
        ctx.logger.info(
          `Would set GITOPS_* variables and secret on ${owner}/${repo}`,
        );
        return;
      }
      const variables = {
        GITOPS_REPOSITORY: gitops.getString('repository'),
        GITOPS_APP_ID: gitops.getString('appId'),
      };
      for (const [name, value] of Object.entries(variables)) {
        // Create, or update if it already exists
        await gh
          .call(owner, repo, '/actions/variables', {
            method: 'POST',
            body: JSON.stringify({ name, value }),
          })
          .catch(() =>
            gh.call(owner, repo, `/actions/variables/${name}`, {
              method: 'PATCH',
              body: JSON.stringify({ name, value }),
            }),
          );
      }
      // Secrets are encrypted to the repo's public key (libsodium sealed box)
      await sodium.ready;
      const key = await gh.call(owner, repo, '/actions/secrets/public-key');
      const sealed = sodium.crypto_box_seal(
        sodium.from_string(gitops.getString('privateKey')),
        sodium.from_base64(key.key, sodium.base64_variants.ORIGINAL),
      );
      await gh.call(owner, repo, '/actions/secrets/GITOPS_APP_PRIVATE_KEY', {
        method: 'PUT',
        body: JSON.stringify({
          encrypted_value: sodium.to_base64(
            sealed,
            sodium.base64_variants.ORIGINAL,
          ),
          key_id: key.key_id,
        }),
      });
      ctx.logger.info(
        `${owner}/${repo}: CI can deploy to ${variables.GITOPS_REPOSITORY}`,
      );
    },
  });
}

export function createHeadCommitAction(config: Config) {
  const gh = githubClient(config);
  return createTemplateAction({
    id: 'platform:head-commit',
    description: "The latest commit on a GitHub repo's default branch",
    supportsDryRun: true,
    schema: {
      input: { slug: z => z.string().describe('owner/repo') },
      output: { sha: z => z.string(), branch: z => z.string() },
    },
    async handler(ctx) {
      const [owner, repo] = ctx.input.slug.split('/');
      if (!owner || !repo)
        throw new InputError(`Not owner/repo: ${ctx.input.slug}`);
      const info = await gh.call(owner, repo, '');
      const commit = await gh.call(
        owner,
        repo,
        `/commits/${info.default_branch}`,
      );
      ctx.output('sha', commit.sha);
      ctx.output('branch', info.default_branch);
    },
  });
}
