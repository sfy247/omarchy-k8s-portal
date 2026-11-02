import { AuthorizeResult } from '@backstage/plugin-permission-common';
import { PolicyQueryUser } from '@backstage/plugin-permission-node';
import {
  catalogEntityDeletePermission,
  catalogEntityReadPermission,
  catalogLocationDeletePermission,
} from '@backstage/plugin-catalog-common/alpha';
import {
  taskReadPermission,
  templateStepReadPermission,
  taskCreatePermission,
} from '@backstage/plugin-scaffolder-common/alpha';
import { LabPermissionPolicy } from './policy';
import { operateRestartPermission } from '../operate/permissions';

const policy = new LabPermissionPolicy('group:default/platform-team');
const user = (ref: string, groups: string[]) =>
  ({
    identity: {
      type: 'user',
      userEntityRef: ref,
      ownershipEntityRefs: [ref, ...groups],
    },
    info: { userEntityRef: ref, ownershipEntityRefs: [ref, ...groups] },
    token: 't',
    credentials: {} as any,
  } as unknown as PolicyQueryUser);

const admin = user('user:default/admin', ['group:default/platform-team']);
const dev = user('user:default/dev', ['group:default/app-team']);

describe('LabPermissionPolicy', () => {
  it('allows the platform team everything', async () => {
    for (const permission of [
      operateRestartPermission,
      catalogLocationDeletePermission,
    ]) {
      expect((await policy.handle({ permission }, admin)).result).toBe(
        AuthorizeResult.ALLOW,
      );
    }
  });

  it('lets only owners restart or delete a service', async () => {
    for (const permission of [
      operateRestartPermission,
      catalogEntityDeletePermission,
    ]) {
      const d: any = await policy.handle({ permission }, dev);
      expect(d.result).toBe(AuthorizeResult.CONDITIONAL);
      expect(d.conditions).toMatchObject({
        rule: 'IS_ENTITY_OWNER',
        params: { claims: ['user:default/dev', 'group:default/app-team'] },
      });
    }
  });

  it('hides platform-only template steps from everyone else', async () => {
    const d: any = await policy.handle(
      { permission: templateStepReadPermission },
      dev,
    );
    expect(d.result).toBe(AuthorizeResult.CONDITIONAL);
    expect(d.conditions).toMatchObject({
      not: { rule: 'HAS_TAG', params: { tag: 'platform-only' } },
    });
  });

  it('shows users only their own tasks', async () => {
    const d: any = await policy.handle({ permission: taskReadPermission }, dev);
    expect(d.conditions).toMatchObject({
      rule: 'IS_TASK_OWNER',
      params: { createdBy: ['user:default/dev'] },
    });
  });

  it('lets everyone read and create, but not remove locations', async () => {
    expect(
      (await policy.handle({ permission: catalogEntityReadPermission }, dev))
        .result,
    ).toBe(AuthorizeResult.ALLOW);
    expect(
      (await policy.handle({ permission: taskCreatePermission }, dev)).result,
    ).toBe(AuthorizeResult.ALLOW);
    expect(
      (
        await policy.handle(
          { permission: catalogLocationDeletePermission },
          dev,
        )
      ).result,
    ).toBe(AuthorizeResult.DENY);
  });
});
