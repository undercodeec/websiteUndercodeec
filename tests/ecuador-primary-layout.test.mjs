import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const styles = await readFile(
  new URL("../src/components/LandingEcuador/EcuadorPrimaryContent.module.css", import.meta.url),
  "utf8",
);
const content = await readFile(
  new URL("../src/components/LandingEcuador/EcuadorPrimaryContent.jsx", import.meta.url),
  "utf8",
);

test("las métricas de Ecuador mantienen contraste normal", () => {
  assert.match(
    styles,
    /\.metrics strong\s*\{[\s\S]*?color:\s*var\(--ink\);[\s\S]*?mix-blend-mode:\s*normal;/,
  );
  assert.match(
    styles,
    /\.metrics span\s*\{[\s\S]*?color:\s*var\(--ink\);[\s\S]*?mix-blend-mode:\s*normal;/,
  );
  assert.match(
    styles,
    /\.metrics\s*\{[\s\S]*?--line:\s*var\(--ink\);/,
  );
  assert.match(
    styles,
    /\.metrics li\s*\{[\s\S]*?color:\s*var\(--ink\);[\s\S]*?mix-blend-mode:\s*normal;/,
  );
});

test("las métricas de Ecuador no esperan una animación para mostrarse", () => {
  const metricsMarkup = content.match(/<ul className=\{styles\.metrics\}>[\s\S]*?<\/ul>/)?.[0] ?? "";

  assert.match(metricsMarkup, /<li key=\{label\}>/);
  assert.doesNotMatch(metricsMarkup, /data-ecuador-reveal/);
});

test("el contenido de Ecuador conserva el fondo para el contraste del modo dÃ­a", () => {
  assert.match(
    styles,
    /\.content\s*\{[\s\S]*?position:\s*relative;/,
  );
  assert.doesNotMatch(styles, /\.content\s*\{[\s\S]*?z-index\s*:/);
});
