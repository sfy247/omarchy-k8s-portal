// Who may do what in the portal.
//
//   platform team (permission.adminGroup)  everything
//   a service's owners (its owning group)  restart/change it, delete it from the catalog
//   everyone signed in                     read everything, create services, request
//                                          help, see/cancel their own scaffolder tasks
//   templates/steps tagged platform-only   platform team only
//
// Service-to-service calls (e.g. the automation token) aren't users; the
// framework only consults this policy for user requests.
import {
  createBackendModule,
  coreServices,
} from '@backstage/backend-plugin-api';
import {
  AuthorizeResult,
  isPermission,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
  PolicyQueryUser,
} from '@backstage/plugin-permission-node';
import { policyExtensionPoint } from '@backstage/plugin-permission-node/alpha';
import {
  catalogEntityDeletePermission,
  catalogEntityRefreshPermission,
  catalogLocationDeletePermission,
} from '@backstage/plugin-catalog-common/alpha';
import {
  catalogConditions,
  createCatalogConditionalDecision,
} from '@backstage/plugin-catalog-backend/alpha';
import {
  taskCancelPermission,
  taskReadPermission,
  templateParameterReadPermission,
  templateStepReadPermission,
  templateManagementPermission,
} from '@backstage/plugin-scaffolder-common/alpha';
import {
  createScaffolderTaskConditionalDecision,
  createScaffolderTemplateConditionalDecision,
  scaffolderTaskConditions,
  scaffolderTemplateConditions,
} from '@backstage/plugin-scaffolder-backend/alpha';
import { operateRestartPermission } from '../operate/permissions';

export const PLATFORM_ONLY_TAG = 'platform-only';

export class LabPermissionPolicy implements PermissionPolicy {
  constructor(private readonly adminGroup: string) {}

  async handle(
    request: PolicyQuery,
    user?: PolicyQueryUser,
  ): Promise<PolicyDecision> {
    const claims = user?.info.ownershipEntityRefs ?? [];
    if (claims.includes(this.adminGroup))
      return { result: AuthorizeResult.ALLOW };
    const { permission } = request;

    // Changing a running service, or removing it: its owners only
    if (
      isPermission(permission, operateRestartPermission) ||
      isPermission(permission, catalogEntityDeletePermission)
    ) {
      return createCatalogConditionalDecision(
        permission,
        catalogConditions.isEntityOwner({ claims }),
      );
    }
    if (isPermission(permission, catalogEntityRefreshPermission))
      return { result: AuthorizeResult.ALLOW };
    if (isPermission(permission, catalogLocationDeletePermission))
      return { result: AuthorizeResult.DENY };

    // Scaffolder: platform-only templates are hidden from everyone else
    if (
      isPermission(permission, templateParameterReadPermission) ||
      isPermission(permission, templateStepReadPermission)
    ) {
      return createScaffolderTemplateConditionalDecision(permission, {
        not: scaffolderTemplateConditions.hasTag({ tag: PLATFORM_ONLY_TAG }),
      });
    }
    if (isPermission(permission, templateManagementPermission))
      return { result: AuthorizeResult.DENY };
    // Your own task runs only
    if (
      isPermission(permission, taskReadPermission) ||
      isPermission(permission, taskCancelPermission)
    ) {
      return createScaffolderTaskConditionalDecision(
        permission,
        scaffolderTaskConditions.isTaskOwner({
          createdBy: user ? [user.info.userEntityRef] : [],
        }),
      );
    }
    return { result: AuthorizeResult.ALLOW };
  }
}

export default createBackendModule({
  pluginId: 'permission',
  moduleId: 'lab-policy',
  register(reg) {
    reg.registerInit({
      deps: { policy: policyExtensionPoint, config: coreServices.rootConfig },
      async init({ policy, config }) {
        policy.setPolicy(
          new LabPermissionPolicy(
            config.getOptionalString('permission.adminGroup') ??
              'group:default/platform-team',
          ),
        );
      },
    });
  },
});
