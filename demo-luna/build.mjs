import { cpSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const DIST = join(ROOT, 'dist');

// Limpiar dist anterior
if (existsSync(DIST)) rmSync(DIST, { recursive: true, force: true });

const copy = (src, dest) => {
  cpSync(join(ROOT, src), join(DIST, dest ?? src), { recursive: true });
  console.log(`  ✓ ${src}`);
};

console.log('\n🚀 Generando build de producción...\n');

copy('index.html');
copy('support.js');
copy('fonts');
copy('images');
copy('model-3D');

console.log('\n✅ Build listo en ./dist/\n');
