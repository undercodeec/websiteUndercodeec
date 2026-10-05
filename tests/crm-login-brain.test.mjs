import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("CRM login brain stays large, left aligned, and interactive without demo flash", async () => {
  const css = await readFile("src/app/admin/crm/crm.css", "utf8");
  const component = await readFile("src/app/admin/crm/login/CrmLoginBrain.jsx", "utf8");

  assert.match(
    css,
    /\.crm-login-brain\s*\{[^}]*width:\s*min\(100%,\s*760px\);[^}]*align-self:\s*flex-start;[^}]*translateX\(-10vw\);[^}]*pointer-events:\s*auto;/,
  );
  assert.doesNotMatch(css, /\.crm-login-brain\s*\{[^}]*overflow:\s*hidden;/);
  assert.match(
    css,
    /\.crm-login-brain iframe\s*\{[^}]*visibility:\s*hidden;[^}]*pointer-events:\s*auto;/,
  );
  assert.match(css, /\.crm-login-brain\.is-ready iframe\s*\{\s*visibility:\s*visible;/);
  assert.match(css, /transform:\s*scale\(1\.1\)/);
  assert.doesNotMatch(css, /\.crm-login-brain iframe\s*\{[^}]*mask-image:/);
  assert.match(css, /@keyframes crm-login-brain-colors\s*\{[\s\S]*invert\(1\) hue-rotate\(0deg\)[\s\S]*invert\(1\) hue-rotate\(55deg\)/);
  assert.doesNotMatch(css, /url\(#crm-login-brain-white-key\)/);
  assert.match(component, /document\.documentElement\.style\.setProperty\("overflow", "hidden", "important"\)/);
  assert.match(component, /document\.body\.style\.setProperty\("overflow", "hidden", "important"\)/);
  assert.match(component, /document\.body\.style\.setProperty\("height", "100%", "important"\)/);
  assert.match(component, /body > :not\(\.crm-login-brain-canvas\)/);
  assert.match(component, /html, body \{[^}]*background-color: transparent !important;/);
  assert.match(css, /@media \(max-width:1200px\)\s*\{[\s\S]*?\.crm-login-brain \{ transform: translateX\(-7vw\); \}[\s\S]*?\.crm-login-brain iframe \{ transform: scale\(1\.05\); \}/);
  assert.match(css, /\.crm-login-brain iframe\s*\{[^}]*width:\s*calc\(100% \+ var\(--crm-brain-half-width\) \+ var\(--crm-brain-half-width\)\);[^}]*margin-left:\s*calc\(0px - var\(--crm-brain-half-width\)\);/);
  assert.match(component, /\.asscrollbar, \[asscrollbar\], \[class\*="scrollbar"\] \{ display: none !important; \}/);
  assert.match(component, /element\.style\.setProperty\("visibility", "hidden", "important"\)/);
  assert.match(component, /scrolling="no"/);
  assert.match(component, /src="\/admin\/crm\/login\/dala-embed\/"/);
  assert.match(component, /style=\{\{ visibility: ready \? "visible" : "hidden" \}\}/);
});
