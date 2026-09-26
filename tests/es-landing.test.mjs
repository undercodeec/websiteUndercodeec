import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("..", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("la página de España reutiliza la composición de marketing", async () => {
  const page = await read("src/app/es/page.tsx");

  assert.match(page, /import MainLayout from "@\/layouts\/Main";/);
  assert.match(page, /import \{ PrimaryHeader \} from "@\/components\/Primary";/);
  assert.match(page, /import MarketingHero from "@\/components\/Marketing\/MarketingHero";/);
  assert.match(page, /import MarketingIntro from "@\/components\/Marketing\/MarketingIntro";/);
  assert.match(page, /import EspanaPrimaryContent from "@\/components\/Marketing\/EspanaPrimaryContent";/);
  assert.match(page, /import ServiciosPrimaryFooter from "@\/components\/Servicios\/ServiciosPrimaryFooter";/);
  assert.match(page, /import styles from "\.\.\/marketing-para-tu-negocio\/MarketingPage\.module\.css";/);
  assert.match(page, /<PrimaryHeader\s*\/>/);
  assert.match(page, /<MarketingHero[\s\S]*regionMeta="ES — 2026"/);
  assert.match(page, /<MarketingIntro[\s\S]*title="Una agencia digital España para proyectos que necesitan avanzar"/);
  assert.match(page, /<EspanaPrimaryContent\s*\/>/);
  assert.match(page, /<ServiciosPrimaryFooter\s*\/>/);
  assert.doesNotMatch(page, /PreviewLayout|EspanaLanding\.module\.css|dala/i);
  assert.doesNotMatch(page, /MarketingPrimaryContent/);
});

test("el hero admite una región reutilizable", async () => {
  const [hero, intro] = await Promise.all([
    read("src/components/Marketing/MarketingHero.jsx"),
    read("src/components/Marketing/MarketingIntro.jsx"),
  ]);

  assert.match(hero, /regionMeta = "EC — 2026"/);
  assert.match(hero, /\{regionMeta\}/);
  assert.match(intro, /export default function MarketingIntro\(\{/);
  assert.match(intro, /title = INTRO_TITLE/);
});

test("España conserva metadatos indexables y no conserva el diseño descartado", async () => {
  const [layout, sitemap] = await Promise.all([
    read("src/app/es/layout.tsx"),
    read("src/app/sitemap.ts"),
  ]);

  assert.match(layout, /index:\s*true/);
  assert.match(layout, /follow:\s*true/);
  assert.match(sitemap, /"\/es"/);
  await assert.rejects(access(new URL("src/app/es/EspanaLanding.module.css", root)));
});

test("el contenido original de España se presenta con las clases de marketing", async () => {
  const content = await read("src/components/Marketing/EspanaPrimaryContent.jsx");

  for (const phrase of [
    "Desarrollo web Madrid, Barcelona y Valencia",
    "Tienda online España y ecommerce España",
    "Desarrollo de apps móviles España",
    "Software empresarial España",
    "Agencia SEO España y Google Ads España",
    "Transformación digital pymes España, con un plan claro",
    "Decisiones antes de empezar",
    "Hablemos de tu proyecto en España",
  ]) {
    assert.match(content, new RegExp(phrase));
  }

  assert.match(content, /MarketingPrimaryContent\.module\.css/);
  assert.match(content, /data-marketing-content-section/);
});
