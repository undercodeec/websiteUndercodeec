const { PurgeCSS } = require('purgecss');
const fs = require('fs');
const path = require('path');

(async () => {
  const result = await new PurgeCSS().purge({
    content: [
      'src/**/*.{js,jsx,ts,tsx}',
      'public/**/*.html',
    ],
    css: ['public/assets/css/style.css'],
    safelist: {
      standard: [
        'show', 'fade', 'in', 'open', 'active', 'disabled', 'collapsed',
        'isdone',
        'top-navbar', 'nav-preview', 'feat-dark', 'index-main', 'animate-fadeUp',
        'style-1', 'style-2', 'style-3', 'style-4',
        'color-blue1', 'color-blue2', 'color-blue4', 'color-blue5', 'color-blue6', 'color-blue7',
        'section-head', 'brd-gray',
      ],
    },
  });

  const outDir = path.join(process.env.TEMP || '/tmp', 'purgecss-out2');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  for (const r of result) {
    const name = path.basename(r.file);
    fs.writeFileSync(path.join(outDir, name), r.css);
    console.log(`${name}: ${r.css.length} bytes`);
  }
  console.log(`Output dir: ${outDir}`);
})();
