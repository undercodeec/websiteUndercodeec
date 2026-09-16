import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

const port = 3227;
const externalBaseUrl = process.env.DEMO_BASE_URL;
const baseUrl = externalBaseUrl ?? `http://127.0.0.1:${port}`;

function startServer() {
  const nextCli = fileURLToPath(
    new URL("../node_modules/next/dist/bin/next", import.meta.url),
  );

  return spawn(
    process.execPath,
    [nextCli, "dev", "--hostname", "127.0.0.1", "--port", String(port)],
    { cwd: process.cwd(), stdio: "ignore" },
  );
}

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Next.js is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Next development server did not start in time");
}

test("uses the root site's hero, logo, navigation, and service submenus", async () => {
  const page = await readFile("public/landing-primary/index.html", "utf8");
  const localStyles = await readFile("public/landing-primary/css/demo-local.css", "utf8");
  const localScript = await readFile("public/landing-primary/js/demo-local.js", "utf8");

  for (const text of [
    "Diseño de Páginas",
    "Web Profesional",
    "a Medida",
    "Creación, Programación y Desarrollo de Aplicaciones Web",
    "Inicio",
    "Nuestra trayectoria",
    "Servicios",
    "Aplicaciones Móviles",
    "Marketing para tu negocio.",
    "Software para tu negocio",
    "Nuevo",
    "Hot",
    "Blog",
    "Contáctanos",
  ]) {
    assert.match(page, new RegExp(text));
  }

  for (const href of [
    "/",
    "/nuestra-trayectoria",
    "/servicios",
    "/aplicaciones-moviles",
    "/marketing-para-tu-negocio",
    "/software-para-tu-negocio",
    "/blog",
    "/contacto",
  ]) {
    assert.match(page, new RegExp(`href="${href}"`));
  }

  for (const href of [
    "https://understudio.undercodeec.com/",
    "https://understudio.undercodeec.com/demo-moon/",
    "https://understudio.undercodeec.com/stack-demo",
  ]) {
    assert.match(localScript, new RegExp(`href: "${href}"`));
  }

  assert.match(
    localScript,
    /new URL\("https:\/\/calendly\.com\/undercodeec\/30min"\)/,
  );
  assert.match(localScript, /searchParams\.set\("hide_gdpr_banner", "1"\)/);
  assert.match(localScript, /searchParams\.set\("embed_type", "Inline"\)/);
  assert.match(
    localScript,
    /searchParams\.set\("embed_domain", window\.location\.host\)/,
  );

  assert.match(page, /<img[^>]+src="\/assets\/img\/undercode-logo\.png"[^>]+alt="Undercodeec"/);
  assert.match(
    page,
    /Diseño de Páginas<\/h1>[\s\S]*Web Profesional<\/h1>[\s\S]*a Medida<\/h1>/,
  );
  assert.match(
    localStyles,
    /--offbrand-orb-navy: #02003F;/,
  );
  assert.match(
    localStyles,
    /--offbrand-orb-purple: #4D007F;/,
  );
  assert.match(
    localStyles,
    /--offbrand-orb-wine: #700047;/,
  );
  assert.match(
    localStyles,
    /\.offbrand-calendar-panel\s*\{[\s\S]*z-index:\s*2147483000;[\s\S]*pointer-events:\s*auto;/,
  );
  assert.match(
    localStyles,
    /\.offbrand-calendar-surface iframe\s*\{[\s\S]*pointer-events:\s*auto !important;[\s\S]*touch-action:\s*auto;/,
  );
  assert.match(
    localStyles,
    /--offbrand-orb-magenta: #A10F79;/,
  );
  assert.match(
    localStyles,
    /--offbrand-orb-light-magenta: #AE24A2;/,
  );
  assert.match(
    localStyles,
    /--offbrand-orb-fuchsia: #EB1C74;/,
  );
  assert.match(
    localStyles,
    /\[data-orb\] \{[\s\S]*radial-gradient\(circle at 52% 48%/,
  );
  assert.match(
    localStyles,
    /\[orb-outline\] \{[\s\S]*conic-gradient\(from 315deg/,
  );
  assert.match(
    localStyles,
    /\.offbrand-services-menu:hover \.offbrand-services-submenu[\s\S]*\.offbrand-services-menu:focus-within \.offbrand-services-submenu/,
  );
  assert.match(localStyles, /\.hud-nav-w\s*\{\s*overflow:\s*visible\s*!important;/);

  const desktopHeader = page.slice(
    page.indexOf('<div pointer-auto="" class="hud-nav-w">'),
    page.indexOf('<div pointer-auto="" class="hud-scroll-w">'),
  );
  assert.match(desktopHeader, />Inicio</);
  assert.match(desktopHeader, />Servicios</);
  assert.match(desktopHeader, />Agendar Reunión</);
  assert.match(desktopHeader, /href="\/#reserva_agenda"/);
  assert.match(localScript, /const reservationAnchorId = "reserva_agenda";/);
  assert.match(localScript, /calendarSurface\.className = "offbrand-calendar-surface"/);
  assert.match(localScript, /calendarPanel\.setAttribute\("role", "dialog"\)/);
  assert.match(localScript, /document\.body\.append\(calendarPanel\)/);
  assert.match(
    localScript,
    /calendarPanel\.setAttribute\("data-lenis-prevent", ""\)/,
  );
  assert.match(
    localScript,
    /calendarPanel\.setAttribute\("data-lenis-prevent-touch", ""\)/,
  );
  assert.match(
    localScript,
    /calendarPanel\.setAttribute\("data-lenis-prevent-wheel", ""\)/,
  );
  assert.match(localScript, /calendar\.setAttribute\("scrolling", "yes"\)/);
  assert.match(localScript, /introductoryCallLink\?\.closest\("\.offbrand-plan-column"\)/);
  assert.match(localScript, /reservationSection\.id = reservationAnchorId;/);
  assert.match(localScript, /headerScheduleLink\.href = `\/#\$\{reservationAnchorId\}`;/);
  assert.match(localScript, /window\.addEventListener\("hashchange", scrollToReservation\);/);
  assert.doesNotMatch(desktopHeader, /aria-haspopup="true""/);
  assert.match(desktopHeader, /offbrand-services-submenu/);
  assert.match(
    desktopHeader,
    /class="page-link-w w-inline-block offbrand-service-submenu-link"/,
  );
  assert.match(
    localStyles,
    /\.offbrand-services-submenu \.offbrand-service-submenu-link \{\s+display: block;\s+padding: 0\.55rem 0\.9rem;/,
  );
  assert.doesNotMatch(
    localStyles,
    /\.offbrand-services-submenu \.page-link-inner \{[^}]*padding:/,
  );
  assert.match(desktopHeader, /href="\/aplicaciones-moviles"/);
  assert.match(desktopHeader, /href="\/marketing-para-tu-negocio"/);
  assert.match(desktopHeader, /href="\/software-para-tu-negocio"/);
  assert.doesNotMatch(desktopHeader, />Nuestra trayectoria</);
  assert.doesNotMatch(desktopHeader, />Blog</);
  assert.doesNotMatch(desktopHeader, />Contáctanos</);

  const hudMenu = page.slice(
    page.indexOf('<div class="hud-menu-o">'),
    page.indexOf('<div class="hud-menu-socials">'),
  );
  for (const pageName of ["Nuestra trayectoria", "Blog", "Contáctanos"]) {
    assert.match(hudMenu, new RegExp(`>${pageName}<`));
  }
  assert.doesNotMatch(hudMenu, />Inicio</);
  assert.doesNotMatch(hudMenu, />Servicios</);
  assert.doesNotMatch(hudMenu, />Aplicaciones Móviles</);
  assert.doesNotMatch(page, /A different<\/h1>/i);
  assert.doesNotMatch(page, />Creative<\/h1>/i);
  assert.doesNotMatch(page, />approach<\/h1>/i);
  assert.match(page, /Confían en nosotros/);
  assert.match(page, /Trabajos destacados/);
  assert.match(page, /¿Hacemos/);
  assert.match(page, /juntos\?/);
  assert.match(
    localStyles,
    /#w-node-b2deac9f-48fc-2cd0-3331-af319f49ee16-9f49edfa\s*\{\s*display: none !important;/,
  );
  assert.match(
    localStyles,
    /\.ob-fill-fill\s*\{\s*background: linear-gradient\(to right, #600b56 0%, #270f31 30%, #270f31 30%, #efa238 73%, #efa238 100%\) !important;/,
  );
});

test("replaces the awards block with the root site's two-column plans content", async () => {
  const page = await readFile("public/landing-primary/index.html", "utf8");
  const localStyles = await readFile("public/landing-primary/css/demo-local.css", "utf8");
  const plansStart = page.indexOf('data-demo-plans-section');
  const plansEnd = page.indexOf('<section data-hide="tab"', plansStart);

  assert.ok(plansStart >= 0, "the plans section is present in the demo");
  assert.ok(plansEnd > plansStart, "the plans section ends before the next section");

  const plansSection = page.slice(plansStart, plansEnd);
  assert.match(plansSection, />Planes</);
  assert.match(plansSection, /Únase a Undercodeec/);
  assert.match(plansSection, /Reserva una llamada introductoria de 15 minutos/);
  assert.match(plansSection, /¿Qué tipo de proyecto planificas\?/);
  assert.equal((plansSection.match(/offbrand-plan-column/g) ?? []).length, 2);
  assert.doesNotMatch(plansSection, /Reconocimientos|Premios|Awwwards|Css Diseño Awards/);
  assert.match(localStyles, /\.offbrand-plans-section/);
  assert.match(localStyles, /\.offbrand-plans-grid/);
});

test("serves the landing-primary export at the root route", async (t) => {
  const server = externalBaseUrl ? null : startServer();
  if (server) t.after(() => server.kill());
  await waitForServer();

  const response = await fetch(`${baseUrl}/`);
  const page = await response.text();

  assert.equal(response.status, 200);
  assert.match(
    page,
    /<title>Undercodeec \| Diseño Web, Apps, Software y SEO<\/title>/,
  );
  assert.match(page, /Diseño de Páginas/i);
  assert.match(page, /Web Profesional/i);
  assert.match(page, /Creación, Programación y Desarrollo de Aplicaciones Web/i);
  assert.match(page, /Confían en nosotros/i);
  assert.match(page, /Trabajos destacados/i);
  assert.match(page, /¿Hacemos/i);
  assert.match(page, /juntos\?/i);
  assert.match(page, /Microsoft/i);
  assert.match(page, /Trevor Noah/i);
  assert.match(page, /Lando Norris/i);
  assert.match(page, /Vizcom/i);

  assert.match(page, /<base href="\/landing-primary\/">/);
  assert.match(page, /\/landing-primary\/css\/offbrand-2023\.shared\.0746f2a75\.min\.css/);
  assert.match(page, /\/landing-primary\/media\/OFF_siteclips_13\.mp4/);
  assert.match(page, /\/landing-primary\/js\/ob\.2026\.index\.23\.js/);

  for (const forbidden of [
    "data-promo-banner",
    "Abrir asistente",
    "codeCursorGradient",
    "solid-grad-telon-single",
    "intellimize",
    "google_tags_first_party",
    "googletagmanager",
    "cloudflarestream.com",
    "assets.itsoffbrand.io",
    "w-webflow-badge",
  ]) {
    assert.doesNotMatch(page, new RegExp(forbidden, "i"));
  }

  assert.doesNotMatch(page, /<(?:script|link|source)\b[^>]+(?:src|href)="https?:\/\//i);
  assert.doesNotMatch(page, /<a\b[^>]+href="https?:\/\//i);
  assert.doesNotMatch(page, /<form\b/i);

  const assets = [
    ["/landing-primary/css/offbrand-2023.shared.0746f2a75.min.css", /^text\/css/],
    ["/landing-primary/fonts/64ff29f82f284681edeb53a9_AtAero-Retina-dot-edit.woff2", /^font\/woff2/],
    ["/landing-primary/images/64ce56bd39c2f116181f1aa5_ob-2023-logomark-svg.svg", /^image\/svg\+xml/],
    ["/landing-primary/images/ob_texture-old.webp", /^image\/webp/],
    ["/landing-primary/images/ob_texture-old-2.jpg", /^image\/jpeg/],
    ["/landing-primary/js/ob.2026.index.23.js", /^(?:text|application)\/javascript/],
    ["/landing-primary/js/hls.light.min.js", /^(?:text|application)\/javascript/],
    ["/landing-primary/js/demo-local.js", /^(?:text|application)\/javascript/],
    ["/landing-primary/js/plan-selector.mjs", /^(?:text|application)\/javascript/],
    ["/landing-primary/js/offbrand-wizard.mjs", /^(?:text|application)\/javascript/],
    ["/landing-primary/js/offbrand-wizard-flow.mjs", /^(?:text|application)\/javascript/],
    ["/landing-primary/js/offbrand-wizard-payment.mjs", /^(?:text|application)\/javascript/],
  ];

  for (const [pathname, contentTypePattern] of assets) {
    const assetResponse = await fetch(`${baseUrl}${pathname}`);
    assert.equal(assetResponse.status, 200, pathname);
    assert.match(assetResponse.headers.get("content-type") ?? "", contentTypePattern);
  }

  const safetyScriptResponse = await fetch(`${baseUrl}/landing-primary/js/demo-local.js`);
  const safetyScript = await safetyScriptResponse.text();
  assert.match(safetyScript, /removeAttribute\("data-start"\)/);
  assert.match(safetyScript, /classList\.remove\("anti-flicker", "lenis-stopped"\)/);
  assert.match(safetyScript, /animationRuntimeReady/);
  assert.doesNotMatch(safetyScript, /setTimeout\(releasePage,\s*1400\)/);

  assert.match(page, /\/landing-primary\/js\/plan-selector\.mjs/);

  const animationScriptResponse = await fetch(
    `${baseUrl}/landing-primary/js/ob.2026.index.23.js`,
  );
  const animationScript = await animationScriptResponse.text();
  assert.match(animationScript, /\/landing-primary\/images\/ob_texture-old\.webp/);
  assert.match(animationScript, /\/landing-primary\/images\/ob_texture-old-2\.jpg/);
  assert.match(animationScript, /\/landing-primary\/js\/hls\.light\.min\.js/);
  assert.doesNotMatch(animationScript, /https:\/\/assets\.itsoffbrand\.io/i);
  assert.doesNotMatch(animationScript, /https:\/\/cdn\.jsdelivr\.net/i);
});
