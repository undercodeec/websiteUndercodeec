import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('the root landing omits its mobile spacer and frames the particle layer', async () => {
  const [layout, particles] = await Promise.all([
    readFile('public/landing-primary/css/demo-local.css', 'utf8'),
    readFile('public/landing-primary/css/hero-particles.css', 'utf8'),
  ]);
  assert.match(layout, /@media\s*\(max-width:\s*767px\)[\s\S]*?\[data-page="home"\]\s+\.spacer-10\s*\{\s*display:\s*none;/);
  assert.match(particles, /\[data-page="home"\]\s+\.hero-particles\s+\.webgpu-container\s*\{\s*top:\s*12svh;\s*height:\s*100svh;\s*transform:\s*none;/);
});

test('mobile particle geometry distinguishes the root landing from other pages', async () => {
  const script = await readFile('public/landing-primary/js/home-hero-particles.js', 'utf8');
  assert.match(script, /camera\.position\.x\s*=\s*mobile\s*&&\s*!rootLanding\s*\?\s*-0\.3\s*:\s*0/);
  assert.match(script, /rootLanding\s*\?\s*1\.3\s*:\s*primaryHero\s*\?\s*2\s*:\s*1\.25/);
  assert.match(script, /rootLanding\s*\?\s*0\.55\s*:\s*0\.38/);
  assert.match(script, /rootLanding\s*\?\s*Math\.min\(width\s*\*\s*0\.48,\s*height\s*\*\s*0\.22\)/);
});

test('the root landing references the updated mobile assets', async () => {
  const [html, component] = await Promise.all([
    readFile('public/landing-primary/index.html', 'utf8'),
    readFile('src/components/HeroParticles/HeroParticles.jsx', 'utf8'),
  ]);
  assert.match(html, /demo-local\.css\?v=20261029-mobile-spacers/);
  assert.match(html, /hero-particles\.css\?v=20261029-home-mobile-framing/);
  assert.match(html, /home-hero-particles\.js\?v=20261029-home-mobile-framing/);
  assert.match(html, /consent-attribution\.js\?v=20261030-mobile-width/);
  assert.match(component, /home-hero-particles\.js\?v=20261029-home-mobile-framing/);
});

test('the mobile privacy panel fits inside its declared viewport width', async () => {
  const script = await readFile('public/landing-primary/js/consent-attribution.js', 'utf8');
  assert.match(script, /\.uc-consent\s*\{[^}]*box-sizing:\s*border-box;/);
  assert.match(script, /@media\s*\(max-width:\s*600px\)\s*\{\s*\.uc-consent\s*\{[^}]*width:\s*calc\(100vw\s*-\s*2rem\);/);
});
