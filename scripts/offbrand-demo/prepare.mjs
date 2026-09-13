import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

const projectRoot = process.cwd();
const sourceName = "saveweb2zip-com-www-itsoffbrand-com";
const sourceDir = resolve(
  process.env.OFFBRAND_SOURCE_DIR ?? join(projectRoot, "desing", sourceName),
);
const outputDir = resolve(projectRoot, "public", "landing-primary");
const helperDir = resolve(projectRoot, "scripts", "offbrand-demo");

if (basename(sourceDir) !== sourceName) {
  throw new Error(`Unexpected OFFBRAND_SOURCE_DIR: ${sourceDir}`);
}
if (outputDir !== resolve(projectRoot, "public", "landing-primary")) {
  throw new Error(`Unsafe output directory: ${outputDir}`);
}

await access(join(sourceDir, "index.html"));
await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const directory of ["css", "fonts", "images", "media"]) {
  await cp(join(sourceDir, directory), join(outputDir, directory), {
    recursive: true,
  });
}

await mkdir(join(outputDir, "js"), { recursive: true });
for (const filename of [
  "jquery-3.5.1.min.dc5e7f18c8.js",
  "offbrand-2023.b9e4a10f.df426058a60187e3.js",
]) {
  await cp(join(sourceDir, "js", filename), join(outputDir, "js", filename));
}

const animationFilename = "ob.2026.index.23.js";
let animationScript = await readFile(join(sourceDir, "js", animationFilename), "utf8");
animationScript = animationScript
  .replaceAll(
    "https://assets.itsoffbrand.io/ob/textures/ob_texture-old.webp",
    "/landing-primary/images/ob_texture-old.webp",
  )
  .replaceAll(
    "https://assets.itsoffbrand.io/ob/textures/ob_texture-old-2.jpg",
    "/landing-primary/images/ob_texture-old-2.jpg",
  )
  .replaceAll(
    "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.light.min.js",
    "/landing-primary/js/hls.light.min.js",
  );
await writeFile(join(outputDir, "js", animationFilename), animationScript, "utf8");
await cp(
  join(helperDir, "assets", "hls.light.min.js"),
  join(outputDir, "js", "hls.light.min.js"),
);

for (const filename of ["ob_texture-old.webp", "ob_texture-old-2.jpg"]) {
  await cp(join(helperDir, "assets", filename), join(outputDir, "images", filename));
}

await cp(join(helperDir, "demo-local.css"), join(outputDir, "css", "demo-local.css"));
await cp(join(helperDir, "demo-local.js"), join(outputDir, "js", "demo-local.js"));

let html = await readFile(join(sourceDir, "index.html"), "utf8");

const blockedScript = /intellimize|117825735|86cn3bq|google_tags_first_party|\bgtag\s*\(|cloudflarestream|\bhls\b|assets\.itsoffbrand\.io|offbrand-orb/i;
html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (script) =>
  blockedScript.test(script) ? "" : script,
);
html = html.replace(/<!--[\s\S]*?-->/g, "");
html = html.replace(
  /<link\b[^>]*(?:rel="(?:preconnect|canonical)"|href="https?:\/\/)[^>]*>/gi,
  "",
);
html = html.replace(/<link\b[^>]*117825735[^>]*>/gi, "");
html = html.replace(/<style\b[^>]*>[\s\S]*?(?:anti-flicker|data-wf-hidden-variation)[\s\S]*?<\/style>/gi, "");
html = html.replace(/<meta\b[^>]+google-site-verification[^>]*>/gi, "");
html = html.replace(/\sdata-wf-intellimize-customer-id="[^"]*"/gi, "");
html = html.replace(/\sdata-wf-status="[^"]*"/gi, "");
html = html.replace(/\sdata-hls-src="[^"]*"/gi, "");
html = html.replace(/<form\b[^>]*>/gi, '<div class="demo-disabled-form" hidden>');
html = html.replace(/<\/form>/gi, "</div>");
html = html.replace(/<a\b[^>]*>/gi, (anchor) =>
  anchor
    .replace(/\shref=("|')(?!#)[\s\S]*?\1/i, ' href="#"')
    .replace(/\starget=("|')[\s\S]*?\1/i, ""),
);
html = html.replace(/<div\b[^>]*class="[^"]*w-webflow-badge[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
html = html.replace(/w-webflow-badge/gi, "demo-removed-badge");

for (const directory of ["css", "fonts", "images", "js", "media"]) {
  html = html.replace(
    new RegExp(`(["'(=])(?:\\./)?${directory}/`, "g"),
    `$1/landing-primary/${directory}/`,
  );
}

const poster = "/landing-primary/images/68b6edabe6aadf7c4b4218a7_overview.jpg";
let localVideoAdded = false;
html = html.replace(/<video\b([^>]*)>[\s\S]*?<\/video>/gi, (_video, attributes) => {
  const safeAttributes = attributes.replace(/\sposter=("|')[\s\S]*?\1/i, "");
  const source = localVideoAdded
    ? ""
    : '<source src="/landing-primary/media/OFF_siteclips_13.mp4" type="video/mp4">';
  localVideoAdded = true;
  return `<video${safeAttributes} poster="${poster}">${source}</video>`;
});

html = html.replace(
  /<head>/i,
  '<head><base href="/landing-primary/">',
);
html = html.replace(
  /<\/head>/i,
  '<link rel="stylesheet" href="/landing-primary/css/demo-local.css"></head>',
);
html = html.replace(
  /<\/body>/i,
  '<script src="/landing-primary/js/demo-local.js"></script></body>',
);

await writeFile(join(outputDir, "index.html"), html, "utf8");
console.log(`Prepared OFF+BRAND demo from ${sourceDir}`);
