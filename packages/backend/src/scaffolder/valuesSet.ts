// platform:values:set — the "request action" templates change a service's
// platform values without rewriting the file: it reads the current file from
// Git (or starts empty if the environment has none yet), sets only the given
// keys, keeps comments and everything else, and writes it to the workspace
// for publish:github:pull-request.
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import {
  createTemplateAction,
  scaffolderActionsExtensionPoint,
} from '@backstage/plugin-scaffolder-node';
import { resolveSafeChildPath } from '@backstage/backend-plugin-api';
import { NotFoundError } from '@backstage/errors';
import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

export default createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'platform-values',
  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        reader: coreServices.urlReader,
      },
      async init({ scaffolder, reader }) {
        scaffolder.addActions(
          createTemplateAction({
            id: 'platform:values:set',
            description:
              'Set keys in a YAML values file from Git, keeping the rest',
            // Only writes to the task workspace, so it's safe in dry runs
            supportsDryRun: true,
            schema: {
              input: {
                url: z => z.string().describe('Blob URL of the file in Git'),
                targetPath: z => z.string().describe('Workspace path to write'),
                set: z =>
                  z
                    .record(z.string(), z.any())
                    .describe('Dotted key paths and their values'),
              },
            },
            async handler(ctx) {
              let text = '';
              try {
                text = (
                  await (await reader.readUrl(ctx.input.url)).buffer()
                ).toString('utf8');
              } catch (e) {
                if (
                  !(
                    e instanceof NotFoundError ||
                    (e as Error).name === 'NotFoundError'
                  )
                )
                  throw e;
                ctx.logger.info(
                  `${ctx.input.url} doesn't exist yet; creating it`,
                );
                text = '# Created by the developer portal\n';
              }
              const doc = YAML.parseDocument(text);
              if (doc.contents === null)
                doc.contents = doc.createNode({}) as any;
              for (const [key, value] of Object.entries(ctx.input.set)) {
                ctx.logger.info(`${key}: ${JSON.stringify(value)}`);
                doc.setIn(key.split('.'), value);
              }
              const out = resolveSafeChildPath(
                ctx.workspacePath,
                ctx.input.targetPath,
              );
              await fs.mkdir(path.dirname(out), { recursive: true });
              await fs.writeFile(out, doc.toString());
            },
          }),
        );
      },
    });
  },
});
