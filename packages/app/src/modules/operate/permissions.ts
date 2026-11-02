import { createPermission } from '@backstage/plugin-permission-common';

/**
 * Restarting a running application. A catalog-entity permission, so the policy
 * can allow it for the service's owners. Mirrors the backend definition
 * (packages/backend/src/operate/permissions.ts); the backend enforces it,
 * this copy only hides the button.
 */
export const operateRestartPermission = createPermission({
  name: 'operate.application.restart',
  attributes: { action: 'update' },
  resourceType: 'catalog-entity',
});
