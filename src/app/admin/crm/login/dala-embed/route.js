import { readFile } from "node:fs/promises";
import { join } from "node:path";

const embedHead = `<base href="/demos/dala/"><style>
  html, body { height: 100% !important; min-height: 0 !important; overflow: hidden !important; background-color: transparent !important; }
  html { scrollbar-width: none !important; }
  html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; }
  body > :not(:has(> canvas#canvas)) { opacity: 0 !important; pointer-events: none !important; }
  #canvas { filter: url(#crm-dala-black-key) !important; }
  .asscrollbar { display: none !important; }
</style>`;

const blackKey = `<svg aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none">
  <filter id="crm-dala-black-key" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  .333 .333 .334 0 0" />
    <feComponentTransfer><feFuncA type="linear" slope="8" intercept="0" /></feComponentTransfer>
  </filter>
</svg>`;

export async function GET() {
  const original = await readFile(join(process.cwd(), "public", "demos", "dala", "index.html"), "utf8");
  const html = original.replace("<head>", `<head>${embedHead}`).replace("<body>", `<body>${blackKey}`);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
