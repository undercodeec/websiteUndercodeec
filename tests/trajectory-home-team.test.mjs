import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('trajectory uses the canonical home team instead of placeholder profiles', () => {
  const home = readFileSync(new URL('../public/landing-primary/index.html', import.meta.url), 'utf8');
  const page = readFileSync(new URL('../src/app/nuestra-trayectoria/page.tsx', import.meta.url), 'utf8');
  const content = readFileSync(new URL('../src/components/Trajectory/TrajectoryPrimaryContent.jsx', import.meta.url), 'utf8');
  const team = home.match(/<section class="s home-team"[\s\S]*?<\/section>/)?.[0];
  assert.ok(team);
  assert.match(page, /readFileSync\(join\(process\.cwd\(\), "public\/landing-primary\/index\.html"\)/);
  assert.match(page, /<TrajectoryPrimaryContent teamHtml=\{team\}/);
  assert.match(content, /<TrajectoryHomeTeam html=\{teamHtml\}/);
  assert.doesNotMatch(content, /Sofia Andrade|Daniel Mena|Valeria Cruz|trajectory-team-title/);
  for (const name of ['Stefany Balcázar', 'Christopher Gallardo', 'Francisco Gallardo', 'Camila León']) {
    assert.ok(team.includes(name));
  }
  assert.equal((team.match(/class="home-team__member"/g) ?? []).length, 4);
});

test('trajectory reuses the team section and its visually hidden accessible help', () => {
  const home = readFileSync(new URL('../public/landing-primary/index.html', import.meta.url), 'utf8');
  const page = readFileSync(new URL('../src/app/nuestra-trayectoria/page.tsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../public/landing-primary/css/home-team.css', import.meta.url), 'utf8');
  const team = home.match(/<section class="s home-team"[\s\S]*?<\/section>/)?.[0];
  assert.ok(team);
  const descriptionId = team.match(/class="home-team__grid"[\s\S]*?aria-describedby="([^"]+)"/)?.[1];
  assert.equal(descriptionId, 'home-team-help');
  const help = [...team.matchAll(/<p\s+id="home-team-help"\s+class="home-team__help">([\s\S]*?)<\/p>/g)];
  assert.equal(help.length, 1, 'the referenced help must exist exactly once inside the reused section');
  assert.equal(help[0][1].replace(/\s+/g, ' ').trim(),
    'Haz clic o toca el equipo para abrir sus perfiles. Para cerrar, aleja el ratón o toca fuera. Con teclado, usa Tab para abrir y Esc o Tab para salir.');
  assert.match(page, /import "\.\.\/\.\.\/\.\.\/public\/landing-primary\/css\/home-team\.css"/);
  assert.match(styles, /\.home-team__help\s*\{[^}]*clip-path:\s*inset\(50%\)/);
});
