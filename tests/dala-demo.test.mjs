import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve('public/demos/dala');

test('Dala loads its local document and all referenced presentation assets', () => {
  assert.ok(existsSync(resolve(root, 'index.html')), 'demo document is missing');
  const html = readFileSync(resolve(root, 'index.html'), 'utf8');
  const css = readFileSync(resolve(root, 'css/style.css'), 'utf8');
  const theme = readFileSync(resolve(root, 'js/theme.js'), 'utf8');
  const references = [
    ...[...html.matchAll(/(?:src|href)="((?:images|fonts|css|js)\/[^"#]+)(?:#[^"]*)?"/g)].map(match => resolve(root, match[1])),
    ...[...css.matchAll(/url\((\.\.\/[^)]+)\)/g)].map(match => resolve(root, 'css', match[1])),
    ...[...theme.matchAll(/"(\/demos\/dala\/(?:images|models)\/[^"?]+)"/g)].map(match => resolve('public', match[1].slice(1))),
  ];
  assert.ok(references.length > 25, 'animation and page assets must be included');
  for (const resource of references) {
    assert.ok(existsSync(resource), `missing resource: ${resource}`);
  }
  assert.doesNotMatch(theme, /url:"\/(?:images|models)\//, 'animation must not request assets from the host root');
});

test('Dala presents its visible interface in Spanish', () => {
  const html = readFileSync(resolve(root, 'index.html'), 'utf8');
  const visibleText = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  assert.match(html, /<html lang="es">/);
  assert.match(visibleText, /Desbloquea la sabiduría colectiva\./);
  assert.match(visibleText, /Solicitar acceso/);
  assert.match(visibleText, /Nuestro equipo/);
  assert.doesNotMatch(visibleText, /Request Access|Our team|Your workplace|Make decisions|Our investors/);
  assert.doesNotMatch(html, /wisdom|sitting|pyramidal/i);
});
