// Check every browser module, including newly added feature files.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PUBLIC_FILES } from './public-files.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const scripts = ['server.mjs', 'scripts/build.mjs', 'scripts/check.mjs', 'scripts/public-files.mjs'];
for (const file of [...scripts, ...PUBLIC_FILES.filter(file => file.endsWith('.js'))]) {
  const result = spawnSync(process.execPath, ['--check', file], { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
