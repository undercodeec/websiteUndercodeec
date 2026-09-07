import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const port = 3217;
const baseUrl = `http://127.0.0.1:${port}`;

function startServer() {
  const nextCli = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
  return spawn(process.execPath, [nextCli, "dev", "--port", String(port)], {
    cwd: process.cwd(),
    stdio: "ignore",
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // The development server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Next development server did not start in time");
}

test("serves the standalone demos portfolio at /demos/", async (t) => {
  const server = startServer();
  t.after(() => server.kill());

  await waitForServer();

  const response = await fetch(`${baseUrl}/demos/`);
  const page = await response.text();

  assert.equal(response.status, 200);
  assert.match(page, /NUESTROS(?:<[^>]+>)*DEMOS/);
  assert.match(page, /PORTAFOLIO SELECCIONADO/);
  assert.match(page, /Nuestra Señora del Rosario/);
  assert.doesNotMatch(page, /data-promo-banner/);
  assert.doesNotMatch(page, /Abrir asistente/);
  assert.doesNotMatch(page, /codeCursorGradient/);
  assert.doesNotMatch(page, /solid-grad-telon-single/);
});
