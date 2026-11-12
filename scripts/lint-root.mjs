import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

function cli(packageName) {
  const manifest = fileURLToPath(import.meta.resolve(`${packageName}/package.json`));
  const { bin } = JSON.parse(readFileSync(manifest, 'utf8'));
  return resolve(dirname(manifest), bin[packageName]);
}

const { values } = parseArgs({ options: { fix: { type: 'boolean' } } });
// Nx also hashes non-source inputs such as the lockfile and lint configuration.
const inputs = JSON.parse(
  execFileSync(
    process.execPath,
    [cli('nx'), 'show', 'target', 'inputs', '@baseline/source:lint', '--json'],
    {
      encoding: 'utf8',
    },
  ),
);
const files = inputs.files.filter((file) => /\.(?:[cm]?[jt]s|[jt]sx|vue)$/.test(file));
if (files.length === 0) throw new Error('No root lint source files found.');

for (const tool of ['oxlint', 'eslint']) {
  const args = [cli(tool), ...(values.fix ? ['--fix'] : []), '--', ...files];
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
