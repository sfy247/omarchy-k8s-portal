import { configApiRef, useApi } from '@backstage/core-plugin-api';

/**
 * The brand comes from app.title ("<NAME> Developer Portal", set by the
 * deployment), so nothing lab-specific is built into the image.
 */
export function useBrand() {
  const title =
    useApi(configApiRef).getOptionalString('app.title') ?? 'Developer Portal';
  const name = title.replace(/\s*developer portal\s*$/i, '').trim();
  const number = name.match(/\d+$/)?.[0] ?? '';
  return {
    name, // e.g. KINDELL247 ('' when the title is just "Developer Portal")
    word: number ? name.slice(0, -number.length) : name, // KINDELL
    number, // 247
    initial: (name || 'D').charAt(0).toUpperCase(), // K
  };
}
