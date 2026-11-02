// platform:authorize — the first real step of every template that changes a
// service: the user must belong to the group that owns it (or to the
// platform team). Runs on the server, so editing the form can't skip it.
// Tasks started by automation (no user) are allowed.
import { Config } from '@backstage/config';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import { NotAllowedError } from '@backstage/errors';

export function createAuthorizeAction(config: Config) {
  const adminGroup =
    config.getOptionalString('permission.adminGroup') ??
    'group:default/platform-team';
  return createTemplateAction({
    id: 'platform:authorize',
    description:
      'Fail unless the user is in the owning group (or the platform team)',
    supportsDryRun: true,
    schema: {
      input: {
        owner: z =>
          z.string().describe('Owning group, e.g. group:default/app-team'),
      },
    },
    async handler(ctx) {
      const owner = stringifyEntityRef(
        parseEntityRef(ctx.input.owner, {
          defaultKind: 'group',
          defaultNamespace: 'default',
        }),
      );
      const user = ctx.user;
      if (!user?.ref) {
        ctx.logger.info(`No user (automation): allowed to act for ${owner}`);
        return;
      }
      const claims = new Set([
        user.ref,
        ...(user.entity?.relations ?? [])
          .filter(r => r.type === 'memberOf')
          .map(r => r.targetRef),
      ]);
      if (claims.has(adminGroup) || claims.has(owner)) {
        ctx.logger.info(`${user.ref} may act for ${owner}`);
        return;
      }
      throw new NotAllowedError(
        `${user.ref} isn't in ${owner}. Ask a member of that team, or the platform team.`,
      );
    },
  });
}
