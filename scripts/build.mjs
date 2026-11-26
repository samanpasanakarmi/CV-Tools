// Build only the explicitly allowed public assets, preserving their directories.
import { mkdir, rm, copyFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLIC_FILES } from './public-files.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = join(root, 'dist');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const file of PUBLIC_FILES) {
  const destination = join(out, file);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(join(root, file), destination);
}
await writeFile(join(out, '.nojekyll'), '');
console.log('Static CV Studio web app built successfully in dist/');
