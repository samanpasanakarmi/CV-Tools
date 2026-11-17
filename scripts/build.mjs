// Build a clean static website artifact for GitHub Pages and other static hosts.
// Only public web assets belong in dist/; private team docs and tests do not.
import { mkdir, rm, copyFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const out = join(root, 'dist');
await rm(out, { recursive: true, force: true });
await mkdir(join(out, 'src'), { recursive: true });
await mkdir(join(out, 'assets'), { recursive: true });

for (const file of ['index.html', 'styles.css']) {
  await copyFile(join(root, file), join(out, file));
}
for (const file of ['app.js', 'model.js', 'preview.js', 'api.js', 'workspace.js', 'config.js', 'auth-flow.js', 'ai.js']) {
  await copyFile(join(root, 'src', file), join(out, 'src', file));
}
await copyFile(join(root, 'assets', 'favicon.svg'), join(out, 'assets', 'favicon.svg'));
await writeFile(join(out, '.nojekyll'), '');
console.log('Static CV Studio web app built successfully in dist/');
