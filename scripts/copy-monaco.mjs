import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'node_modules', 'monaco-editor', 'min', 'vs');
const destRoot = join(root, 'public', 'monaco');
const dest = join(destRoot, 'vs');

if (!existsSync(source)) {
  console.error('[copy-monaco] monaco-editor not found at', source, '— run yarn install first.');
  process.exit(1);
}

rmSync(destRoot, { recursive: true, force: true });
mkdirSync(destRoot, { recursive: true });
cpSync(source, dest, { recursive: true });
console.log('[copy-monaco] Copied monaco-editor assets to public/monaco/vs');
